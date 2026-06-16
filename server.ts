/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.use(express.json({ limit: '10mb' }));

// Helper to extract YouTube ID
function extractVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Fetch generic webpage / non-YouTube video metadata (Vimeo, direct mp4, Loom, TikTok, etc.)
async function fetchGenericVideoMetadata(url: string): Promise<{ title: string; author: string; thumbnailUrl: string }> {
  let title = 'Universal Video';
  let author = 'Video Creator';
  let thumbnailUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'; // high-quality abstract graphic

  try {
    const parsedUrl = new URL(url);
    author = parsedUrl.hostname.replace('www.', '');

    // Vimeo Specific support
    if (parsedUrl.hostname.includes('vimeo.com')) {
      try {
        const vimeoOembed = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
        const res = await fetch(vimeoOembed);
        if (res.ok) {
          const data = await res.json();
          return {
            title: data.title || 'Vimeo Video',
            author: data.author_name || 'Vimeo Creator',
            thumbnailUrl: data.thumbnail_url || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&q=80',
          };
        }
      } catch (e) {
        console.warn('Vimeo oEmbed retrieval failed, falling back...');
      }
    }

    // Direct video stream file formats (.mp4, .webm, .ogg, etc.)
    const pathnameLower = parsedUrl.pathname.toLowerCase();
    if (
      pathnameLower.endsWith('.mp4') ||
      pathnameLower.endsWith('.webm') ||
      pathnameLower.endsWith('.ogg') ||
      pathnameLower.endsWith('.mov') ||
      pathnameLower.endsWith('.m4v') ||
      pathnameLower.endsWith('.avi')
    ) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1] || '';
      const cleanFilename = decodeURIComponent(lastPart).split('?')[0];
      return {
        title: cleanFilename || 'Direct Stream Video',
        author: parsedUrl.hostname,
        thumbnailUrl: 'https://images.unsplash.com/photo-1485646979142-d4abb57a876f?w=1200&q=80', // modern digital screen background
      };
    }

    // Standard remote page metadata scraping using fetch
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (response.ok) {
      const html = await response.text();
      
      // Attempt Title match
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();
      }

      // Attempt OpenGraph og:title Match
      const ogTitleMatch =
        html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
      if (ogTitleMatch && ogTitleMatch[1]) {
        title = ogTitleMatch[1].trim();
      }

      // Attempt OpenGraph og:image (Thumbnail) Match
      const ogImageMatch =
        html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
      if (ogImageMatch && ogImageMatch[1]) {
        thumbnailUrl = ogImageMatch[1].trim();
      }

      // Attempt OpenGraph og:site_name (Author) Match
      const ogSiteNameMatch =
        html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i);
      if (ogSiteNameMatch && ogSiteNameMatch[1]) {
        author = ogSiteNameMatch[1].trim();
      }
    }
  } catch (err) {
    console.warn('Metadata parsing for general page failed:', err);
  }

  // Remove common suffixes like " - YouTube" if parsed accidentally
  title = title.replace(/\s*-\s*YouTube/i, '').replace(/\s*-\s*Vimeo/i, '');
  return { title, author, thumbnailUrl };
}

// Fetch public YouTube subtitles / transcripts
async function fetchTranscript(videoId: string): Promise<string> {
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(watchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load YouTube watch page: ${response.statusText}`);
    }

    const html = await response.text();

    // Look for transcripts inside player response JSON content
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.*?});/);
    let captionsJson: any = null;

    if (playerResponseMatch) {
      try {
        const parsed = JSON.parse(playerResponseMatch[1]);
        captionsJson = parsed.captions;
      } catch (e) {
        console.warn('Failed parsing player response JSON', e);
      }
    }

    if (!captionsJson) {
      // Regular fallback query in page
      const captionsMatch = html.match(/"captions":\s*({.*?})/);
      if (captionsMatch) {
        try {
          captionsJson = JSON.parse(captionsMatch[1]);
        } catch (e) {
          console.warn('Failed parsing raw captions JSON block', e);
        }
      }
    }

    const captionTracks =
      captionsJson?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captionTracks || captionTracks.length === 0) {
      return '';
    }

    // Prefer English, then English-auto, then any first track
    const track =
      captionTracks.find(
        (t: any) =>
          t.languageCode === 'en' || t.languageCode?.startsWith('en-')
      ) || captionTracks[0];

    const trackUrl = track.baseUrl;
    if (!trackUrl) return '';

    const xmlResponse = await fetch(trackUrl);
    if (!xmlResponse.ok) return '';
    const xmlText = await xmlResponse.text();

    // Simple regex to extract <text start="1.5" dur="2.4">text</text>
    const matches = [...xmlText.matchAll(/<text start="([\d\.]+)" dur="[\d\.]+"[^>]*>([\s\S]*?)<\/text>/g)];
    const lines = matches.map((m) => {
      const startSecs = parseFloat(m[1]);
      const minutes = Math.floor(startSecs / 60);
      const seconds = Math.floor(startSecs % 60);
      const timestamp = `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}]`;

      let text = m[2]
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      return `${timestamp} ${text}`;
    });

    return lines.join('\n');
  } catch (err) {
    console.warn('Transcript extraction failed:', err);
    return '';
  }
}

// Fetch YouTube video details via public oEmbed API
async function fetchYouTubeOEmbed(videoId: string): Promise<{ title: string; author: string; thumbnailUrl: string }> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title || 'YouTube Video',
        author: data.author_name || 'Creator',
        thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };
    }
  } catch (err) {
    console.warn('OEmbed fetch failed:', err);
  }
  return {
    title: 'YouTube Video',
    author: 'Video Creator',
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
  };
}

// REST API endpoint: Video summarizer (YouTube and generic videos/pages)
app.post('/api/summarize', async (req, res) => {
  const { videoUrl, customTranscript } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Video URL is required.' });
  }

  const isYouTube = !!extractVideoId(videoUrl);
  let videoId = '';
  let metadata: { title: string; author: string; thumbnailUrl: string };
  let fullMetadata: any;

  try {
    if (isYouTube) {
      const ytId = extractVideoId(videoUrl)!;
      videoId = ytId;
      const ytMetadata = await fetchYouTubeOEmbed(ytId);
      metadata = ytMetadata;
      fullMetadata = {
        videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        ...ytMetadata,
      };
    } else {
      // Base64 URL safe hash of non-YouTube URL to use as videoId
      videoId = 'vid_' + Buffer.from(videoUrl).toString('base64url').slice(0, 11).replace(/[^a-zA-Z0-9]/g, '');
      const genMetadata = await fetchGenericVideoMetadata(videoUrl);
      metadata = genMetadata;
      fullMetadata = {
        videoId,
        videoUrl,
        ...genMetadata,
      };
    }

    // 2. Fetch transcript or use manual custom pasted transcript
    let transcript = customTranscript || '';

    if (!transcript && isYouTube) {
      transcript = await fetchTranscript(videoId);
    }

    // 3. Draft prompt for Gemini based on availability of transcript
    let prompt = '';
    const buildPromptWithTranscript = (videoTitle: string, inputChannel: string, contentSource: string) => `
You are an expert AI video summaries creator and business consultant representing an elite monetization tool.
Your goal is to digest the following video and extract highly valuable summaries, actionable chapters, interactive quizzes, standard mindmap nodes, and creator monetization copy.

Video Title: "${videoTitle}"
Creator / Host: "${inputChannel}"

Transcript content:
"""
${contentSource.slice(0, 50000)}
"""

Please analyze this transcript and fill out the detailed JSON structure:
1. summary: A beautifully crafted, scannable, engaging summary of the video (2-3 structured paragraphs). Explain the problem, the core thesis, and the final solution.
2. takeaways: A list of 5-7 actionable, eye-opening takeaways or direct value bombs.
3. chapters: A list of chronological video chapters summarizing sections. Group similar timestamps to form 4-8 logical chapters spread throughout the video. Allocate accurate "secondsCount" so the user can fast-forward to that exact second.
4. blogPost: Write a comprehensive, premium-grade, SEO-friendly markdown blog post repurposing this video structure. Use headers (#, ##), bullets, bolding, and professional spacing.
5. twitterThread: Create an engaging 4-6 tweet series dissecting the main value loop of the video. Write them as individual elements of an array.
6. socialSnippet: A highly engaging promotional description for LinkedIn or Instagram featuring powerful quote triggers and tags.
7. quiz: Create 3-5 multiple-choice questions testing key video content. Include 4 options, the 0-based index of the correct option, and a helpful, educational explanation.
8. mindmap: Create a structured concept map of ideas representing topics covered. Use "concept" (label of node), "category" (the parent group it belongs to), and "description" (a mini note).
`;

    const buildPromptWithoutTranscript = (videoTitle: string, inputChannel: string) => `
You are an expert AI video summaries creator representing a premium monetization tool.
The user wants to summarize the video titled "${videoTitle}" by creator "${inputChannel}".
Since direct transcript retrieval is not pre-extracted, use your Google Search tool or historical knowledge index to research and analyze this video, its core message, lessons, and content. If the URL points to a website, discover its content to draft an accurate analysis.
Provide an extremely detailed, accurate summary, actionable chronological chapters, blog post copy, tweets, an educational quiz, and structured mindmap nodes.

Video Title: "${videoTitle}"
Creator / Host: "${inputChannel}"
Video URL: "${videoUrl}"

Generate a complete, high-quality summary and promotional asset package matching the requested JSON structure.
`;

    if (transcript) {
      prompt = buildPromptWithTranscript(metadata.title, metadata.author, transcript);
    } else {
      prompt = buildPromptWithoutTranscript(metadata.title, metadata.author);
    }

    // 4. Feed to Gemini-3.5-flash using strict JSON schema
    const config: any = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          takeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                secondsCount: { type: Type.INTEGER },
                title: { type: Type.STRING },
                takeaway: { type: Type.STRING },
              },
              required: ['timestamp', 'secondsCount', 'title', 'takeaway'],
            },
          },
          blogPost: { type: Type.STRING },
          twitterThread: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          socialSnippet: { type: Type.STRING },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                answerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ['question', 'options', 'answerIndex', 'explanation'],
            },
          },
          mindmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                concept: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['concept', 'category', 'description'],
            },
          },
        },
        required: [
          'summary',
          'takeaways',
          'chapters',
          'blogPost',
          'twitterThread',
          'socialSnippet',
          'quiz',
          'mindmap',
        ],
      },
    };

    // Enable search grounding as a smart fallback if transcript was missed
    if (!transcript) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config,
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Gemini response returned empty content.');
    }

    const result = JSON.parse(outputText.trim());

    return res.json({
      metadata: fullMetadata,
      ...result,
    });
  } catch (err: any) {
    console.error('Error generating summary:', err);
    return res.status(500).json({
      error: 'Failed to generate summary. Details: ' + (err.message || String(err)),
    });
  }
});

// REST API endpoint: Text-to-Speech service using gemini-3.1-flash-tts-preview
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text content is required for TTS synthesis.' });
  }

  try {
    // Generate text-to-speech base64 audio
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Read of the following newsletter summary: ${text.slice(0, 1000)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Warm narration voice
          },
        },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = audioPart?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('Audio generation returned empty payload.');
    }

    return res.json({ audioBase64: base64Audio });
  } catch (err: any) {
    console.error('TTS execution failed:', err);
    return res.status(500).json({ error: 'High-quality TTS synthesis failed. Fallback to browser speecher.' });
  }
});

// Stripe Integration Endpoints
app.get('/api/stripe-status', (req, res) => {
  res.json({
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  });
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { planCode, billingCycle, returnUrl } = req.body;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return res.status(400).json({ error: 'Stripe is currently running in Sandbox Simulator Mode.' });
  }

  try {
    const isYearly = billingCycle === 'yearly';
    let planName = 'Pro Creator Pass';
    let unitAmount = isYearly ? 1400 : 1900; // $14.00/mo or $19.00/mo
    
    if (planCode === 'enterprise') {
      planName = 'Enterprise Agency Hub';
      unitAmount = isYearly ? 3900 : 4900;
    }

    // Convert prices to cents for Stripe
    unitAmount = unitAmount * 100;

    const payload = new URLSearchParams();
    payload.append('payment_method_types[0]', 'card');
    payload.append('line_items[0][price_data][currency]', 'usd');
    payload.append('line_items[0][price_data][product_data][name]', planName);
    payload.append('line_items[0][price_data][unit_amount]', String(unitAmount));
    payload.append('line_items[0][price_data][recurring][interval]', 'month');
    payload.append('line_items[0][quantity]', '1');
    payload.append('mode', 'subscription');
    payload.append('success_url', `${returnUrl || 'http://localhost:3000'}?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`);
    payload.append('cancel_url', `${returnUrl || 'http://localhost:3000'}?checkout_cancel=true`);

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Stripe API error: ${response.statusText}`);
    }

    const session = await response.json();
    return res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe session creation failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to create Stripe Checkout session.' });
  }
});

// REST API endpoint: AI Marketing Outreach & Script Generator
app.post('/api/marketing-generate', async (req, res) => {
  const { type, promptInput, details } = req.body;
  if (!promptInput) {
    return res.status(400).json({ error: 'Parameters and inputs are required.' });
  }

  try {
    let finalPrompt = '';
    if (type === 'outreach') {
      finalPrompt = `You are a world-class digital marketing and cold sales outreach expert. 
I am running a productivity SaaS called "SnapSum - Universal Video Summarizer", which summarizes any video (and audio uploads) into concise takeaways, interactive quizzes, study chapters, and audio-narrated podcasts.

Please write a highly persuasive, human-like, non-spammy cold email campaign and a 1-sentence social DM outreach script targeting potential users in this niche: "${promptInput}".
Make the subject lines irresistible. Follow standard AIDA copy structures and focus on how saving 5 hours a week summarizing video training will skyrocket their productivity. Do not use generic AI buzzwords. Keep it concise.`;
    } else {
      finalPrompt = `You are a viral YouTube Shorts, TikTok, and Instagram Reels scriptwriter. 
I want you to write a high-impact, 45-second viral short-form script based on this video content: "${promptInput}".
The script must have:
- A powerful viral hook in the first 3 seconds (addressing an exact pain point).
- Three rapid benefit points.
- A strong call-to-action to use "SnapSum" at their website custom domain.

Format the output clearly with [VISUAL] directions and spoken lines, keeping it high-paced, catchy, and trendy. Header/Subject of the video was: "${details || ''}".`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: finalPrompt }] }],
    });

    const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not generate marketing materials.';
    return res.json({ result: resultText });
  } catch (err: any) {
    console.error('Marketing generation failed:', err);
    return res.status(500).json({ error: err.message || 'Gemini generation failed.' });
  }
});

// Initialize full-stack routing and server
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YouTube Summarizer server active on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
