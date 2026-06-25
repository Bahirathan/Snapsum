/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';
import { saveSummary, getSummary, listSummaries } from './server/summaryStore';
import { getOrCreateReferralCode, recordReferral, getReferralCount, isLockedUnlocked } from './server/referralStore';
import { saveSubscription, getSubscription } from './server/subscriptionStore';
import { db } from './server/firestore';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to get active Gemini client.
// SECURITY: Support client-supplied 'x-custom-gemini-api-key' securely so that users
// can pay for their own API usage. If and only if a valid custom key is specified, we
// instantiate a new Gemini client with that key, letting them securely bypass server rate limits at zero cost to us.
function getGeminiClient(req: express.Request): GoogleGenAI {
  const customKey = req.headers['x-custom-gemini-api-key'] as string;
  if (customKey && customKey.trim().length > 10) {
    return new GoogleGenAI({
      apiKey: customKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-custom',
        },
      },
    });
  }
  return ai;
}

// =========================================================================
// MVP STATE & RATE CONTROL ENGINE: PREVENT EMBEDDED API QUOTA SPAMMING
// =========================================================================
interface RateLimitUsage {
  count: number;
  lastReset: number;
}
const ipUsageStorage = new Map<string, RateLimitUsage>();

// Middleware/inline utility to check and increment daily IP request credits
async function checkAndIncrementUsage(req: express.Request): Promise<{ allowed: boolean; count: number; limit: number; remaining: number }> {
  // If the user has supplied a valid custom Gemini key, they run on their own quota
  // so we bypass local server rate limits completely (zero server cost).
  const customGeminiKey = req.headers['x-custom-gemini-api-key'] as string;
  if (customGeminiKey && customGeminiKey.trim().length > 10) {
    return { allowed: true, count: 0, limit: 99999, remaining: 99999 };
  }

  // VIP bypass code: this is a legitimate feature (give trusted creators/partners a code
  // for unlimited access), but it must be configured server-side via VIP_BYPASS_CODE and
  // must NOT have a hardcoded default — otherwise the bypass is effectively public.
  const systemVipCode = (process.env.VIP_BYPASS_CODE || '').trim();
  const clientVipCode = req.headers['x-vip-bypass-code'] as string;
  if (systemVipCode && clientVipCode && clientVipCode.trim() === systemVipCode) {
    return { allowed: true, count: 0, limit: 99999, remaining: 99999 };
  }

  // Get requester IP address
  const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
  const ip = rawIp.split(',')[0].trim();

  // Referral Bypass: if they have referred >= 2 distinct visitors, they bypass rate limiting
  if (await isLockedUnlocked(ip, 2)) {
    return { allowed: true, count: 0, limit: 99999, remaining: 99999 };
  }

  // SECURITY: removed the 'x-custom-free-reqs-limit' header override — a client could
  // previously tell the server what its own rate limit should be (e.g. 99999).
  const limitSetting = parseInt(process.env.FREE_REQS_LIMIT || '3', 10);
  const now = Date.now();

  let usage = ipUsageStorage.get(ip);
  if (!usage) {
    usage = { count: 0, lastReset: now };
  } else if (now - usage.lastReset > 24 * 60 * 60 * 1000) {
    // Standard 24 hours rate limit cooling cycle
    usage.count = 0;
    usage.lastReset = now;
  }

  if (usage.count >= limitSetting) {
    return { 
      allowed: false, 
      count: usage.count, 
      limit: limitSetting, 
      remaining: 0 
    };
  }

  // Track request
  usage.count += 1;
  ipUsageStorage.set(ip, usage);

  return { 
    allowed: true, 
    count: usage.count, 
    limit: limitSetting, 
    remaining: Math.max(0, limitSetting - usage.count) 
  };
}


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

// OpenGraph Injector Helper
function injectOGTags(html: string, summary: any, suffix: string = ''): string {
  const metadata = summary.metadata || {};
  const cleanTitle = (metadata.title || 'AI Video Summary').replace(/"/g, '&quot;');
  const title = (cleanTitle + suffix).replace(/"/g, '&quot;');
  const rawDesc = summary.summary || 'Click to view structured summaries, key insights, chapters, and interactive learning quizzes.';
  const description = rawDesc.replace(/"/g, '&quot;').slice(0, 150);
  const imageUrl = metadata.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80';
  const url = `https://www.snapsum.app/s/${summary.shareId}`;

  const metaHtml = `
    <title>${title} - SnapSum</title>
    <meta name="description" content="${description}" />
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title} - SnapSum" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${url}" />
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title} - SnapSum" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
  `;

  let normalized = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
  normalized = normalized.replace('</head>', `${metaHtml}</head>`);
  return normalized;
}

// Robots & Sitemap
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nSitemap: https://www.snapsum.app/sitemap.xml');
});

app.get('/sitemap.xml', async (req, res) => {
  const summaries = await listSummaries();
  const urls = summaries.map(s => `
  <url>
    <loc>https://www.snapsum.app/s/${s.shareId}</loc>
    <lastmod>${new Date(s.savedAt || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.snapsum.app/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${urls}
</urlset>`;

  res.type('application/xml');
  res.send(sitemap);
});

// JSON hydration API
app.get('/api/shared-summary/:id', async (req, res) => {
  const summary = await getSummary(req.params.id);
  if (!summary) {
    return res.status(404).json({ error: 'Shared summary not found' });
  }
  return res.json(summary);
});

// Referral API
app.post('/api/referral/register', async (req, res) => {
  const { referralCode } = req.body;
  const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
  const ip = rawIp.split(',')[0].trim();

  let registered = false;
  if (referralCode) {
    registered = await recordReferral(ip, referralCode);
  }

  const code = await getOrCreateReferralCode(ip);
  const count = await getReferralCount(ip);
  const unlocked = count >= 2;

  return res.json({
    success: true,
    ip,
    referralCode: code,
    referralCount: count,
    unlocked,
    registered,
  });
});

// Server-rendered summary routes
app.get('/s/:id', async (req, res) => {
  const summary = await getSummary(req.params.id);
  if (!summary) {
    return res.status(404).send('Summary not found');
  }

  try {
    const htmlPath = process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), 'dist', 'index.html')
      : path.join(process.cwd(), 'index.html');

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).send('index.html not found');
    }

    let html = fs.readFileSync(htmlPath, 'utf-8');
    html = injectOGTags(html, summary);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    return res.status(500).send('Internal Server Error');
  }
});

app.get('/s/:id/quiz', async (req, res) => {
  const summary = await getSummary(req.params.id);
  if (!summary) {
    return res.status(404).send('Summary not found');
  }

  try {
    const htmlPath = process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), 'dist', 'index.html')
      : path.join(process.cwd(), 'index.html');

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).send('index.html not found');
    }

    let html = fs.readFileSync(htmlPath, 'utf-8');
    html = injectOGTags(html, summary, ' - Interactive Quiz');
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    return res.status(500).send('Internal Server Error');
  }
});

app.get('/s/:id/quiz/:score', async (req, res) => {
  const summary = await getSummary(req.params.id);
  if (!summary) {
    return res.status(404).send('Summary not found');
  }

  try {
    const htmlPath = process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), 'dist', 'index.html')
      : path.join(process.cwd(), 'index.html');

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).send('index.html not found');
    }

    let html = fs.readFileSync(htmlPath, 'utf-8');
    const totalCount = summary.quiz?.length || 5;
    const suffix = ` (Quiz Challenge: I scored ${req.params.score}/${totalCount}! Beat me)`;
    html = injectOGTags(html, summary, suffix);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    return res.status(500).send('Internal Server Error');
  }
});

// REST API endpoint: Video summarizer (YouTube and generic videos/pages)
app.post('/api/summarize', async (req, res) => {
  const { videoUrl, customTranscript, outputLanguage, learnMode } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Video URL is required.' });
  }

  // Enforce MVP Rate Limits to prevent default server API account exhaustion
  const usageStatus = await checkAndIncrementUsage(req);
  if (!usageStatus.allowed) {
    return res.status(429).json({
      error: `Daily credit limit reached (${usageStatus.limit}/${usageStatus.limit} free queries used). Please insert your custom Gemini API key or Upgrade to PRO to process unlimited video summaries instantly!`,
      rateLimited: true,
      limit: usageStatus.limit,
      count: usageStatus.count,
    });
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

    // 3. Draft prompt for Gemini based on availability of transcript and output language selection
    let prompt = '';
    const langInstruction = outputLanguage === 'ar'
      ? '\nCRITICAL ARABIC INSTRUCTION:\nYou MUST generate all output text fields (including summary, takeaways, chapter titles, chapter takeaways, blogPost markdown structured text, twitterThread tweets, LinkedIn/Instagram socialSnippet, quiz questions/options/explanations, and all mindmap concepts, category names, and descriptions) natively and fully in ARABIC (العربية) language. Do NOT use English for any descriptive text inside the JSON payload. However, please ensure that the JSON structural keys (like "summary", "takeaways", "chapters", "blogPost", "twitterThread", etc.) remain strictly in English as defined below.'
      : '';

    const learnModeInstruction = learnMode
      ? `
CRITICAL AI LEARNING PLATFORM - LEARN MODE ACTIVE INSTRUCTION:
This request is evaluated under "Learn Mode – AI Structured Learning System". Integrate these properties in the JSON response:
- "keyConcepts": An array of 3-6 core educational concepts from the video. Provide a "concept" label name, a precise academic/factual "definition", and a "simplifiedExplanation" (analogies, everyday examples, and clear language) that makes the concept easy to digest.
- "flashcards": An array of 4-8 question/answer pairs (each card has a "question" and "answer") focusing on core mental models, definitions, or procedural steps for active recall.
- "rememberSummary": A short, powerful summarized section ("What you should remember" / "Final Retention Checklist") for long-term retention.
Customize the "quiz" to test conceptual understanding, critical thinking and deep comprehension rather than simple rote memory or trivia. Provide extremely educational and verbose explanations for answer choices.`
      : `
Since this is Summary Mode (Learn Mode inactive), you should:
- Set "keyConcepts" to an empty array.
- Set "flashcards" to an empty array.
- Set "rememberSummary" to an empty string.`;

    const buildPromptWithTranscript = (videoTitle: string, inputChannel: string, contentSource: string) => `
You are an expert AI video summaries creator and business consultant representing an elite monetization tool.
Your goal is to digest the following video and extract highly valuable summaries, actionable chapters, interactive quizzes, standard mindmap nodes, creator monetization copy, and a viral Reel / Short video script.
${langInstruction}
${learnModeInstruction}

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
9. reelScript: Create a structured 30-60 second viral script specifically designed to summarize the main subject in a bite-sized video (TikTok, Shorts, IG Reels). The scenes must be precise chronological story steps. Make visualHook descriptions extremely punchy and voiceover sentences highly memorable.
`;

    const buildPromptWithoutTranscript = (videoTitle: string, inputChannel: string) => `
You are an expert AI video summaries creator representing a premium monetization tool.
The user wants to summarize the video titled "${videoTitle}" by creator "${inputChannel}".
${langInstruction}
${learnModeInstruction}

Since direct transcript retrieval is not pre-extracted, use your Google Search tool or historical knowledge index to research and analyze this video, its core message, lessons, and content. If the URL points to a website, discover its content to draft an accurate analysis.
Provide an extremely detailed, accurate summary, actionable chronological chapters, blog post copy, tweets, an educational quiz, structured mindmap nodes, and a viral short Reel script summarizing the main subject.

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
          reelScript: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              hookType: { type: Type.STRING },
              estimatedDuration: { type: Type.INTEGER },
              themeSuggestion: { type: Type.STRING },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sceneNumber: { type: Type.INTEGER },
                    durationSeconds: { type: Type.INTEGER },
                    visualHook: { type: Type.STRING },
                    voiceover: { type: Type.STRING },
                    textOverlay: { type: Type.STRING },
                  },
                  required: ['sceneNumber', 'durationSeconds', 'visualHook', 'voiceover', 'textOverlay'],
                },
              },
              readyMadeCaption: { type: Type.STRING },
              callToAction: { type: Type.STRING },
            },
            required: ['title', 'hookType', 'estimatedDuration', 'themeSuggestion', 'scenes', 'readyMadeCaption', 'callToAction'],
          },
          keyConcepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                concept: { type: Type.STRING },
                definition: { type: Type.STRING },
                simplifiedExplanation: { type: Type.STRING },
              },
              required: ['concept', 'definition', 'simplifiedExplanation'],
            },
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
              },
              required: ['question', 'answer'],
            },
          },
          rememberSummary: { type: Type.STRING },
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
          'reelScript',
          'keyConcepts',
          'flashcards',
          'rememberSummary',
        ],
      },
    };

    // Enable search grounding as a smart fallback if transcript was missed, or if overridden by admin configuration
    const requestedSearchGrounding = req.headers['x-custom-search-grounding'] as string;
    if (requestedSearchGrounding === 'true') {
      config.tools = [{ googleSearch: {} }];
    } else if (requestedSearchGrounding === 'false') {
      delete config.tools;
    } else if (!transcript) {
      config.tools = [{ googleSearch: {} }];
    }

    // SECURITY/COST: previously a client could pick its own temperature AND model via
    // headers ('x-custom-gemini-temperature' / 'x-custom-gemini-model'), with no
    // validation — meaning anyone could direct your billed API key at an arbitrary,
    // potentially far more expensive model. Both are now fixed server-side (temperature
    // left at the Gemini API default, model pinned to a known value).
    const requestedModel = 'gemini-3.5-flash';
    const activeAi = getGeminiClient(req);
    const response = await activeAi.models.generateContent({
      model: requestedModel,
      contents: prompt,
      config,
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Gemini response returned empty content.');
    }

    const result = JSON.parse(outputText.trim());

    // Build saved summary package
    const richSummary = {
      metadata: fullMetadata,
      ...result,
      learnModeEnabled: !!learnMode,
    };
    const shareId = await saveSummary(richSummary);
    richSummary.shareId = shareId;

    return res.json(richSummary);
  } catch (err: any) {
    console.error('Error generating summary:', err);
    return res.status(500).json({
      error: 'Failed to generate summary. Details: ' + (err.message || String(err)),
    });
  }
});

// Learning tracking & analytics storage (in-memory fallback + firestore)
const fallbackAnalytics: any[] = [];

app.post('/api/learn/track', async (req, res) => {
  const { videoId, experimentGroup, eventName, metadata } = req.body;
  
  const eventPayload = {
    videoId,
    experimentGroup: experimentGroup || 'B',
    eventName,
    metadata: metadata || {},
    timestamp: new Date().toISOString(),
    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
  };

  if (db) {
    try {
      await db.collection('learn_analytics').add(eventPayload);
      console.log(`Saved learn analytic event ${eventName} to Firestore.`);
    } catch (err) {
      console.error('Firestore learn_analytics failed, using fallback:', err);
      fallbackAnalytics.push(eventPayload);
    }
  } else {
    fallbackAnalytics.push(eventPayload);
  }

  return res.json({ success: true, event: eventPayload });
});

app.get('/api/learn/analytics', async (req, res) => {
  let events = [];
  if (db) {
    try {
      const snapshot = await db.collection('learn_analytics').get();
      events = snapshot.docs.map(doc => doc.data());
    } catch (err) {
      console.error('Firestore get analytics failed, using fallback:', err);
      events = fallbackAnalytics;
    }
  } else {
    events = fallbackAnalytics;
  }

  const groupA = events.filter((e: any) => e.experimentGroup === 'A');
  const groupB = events.filter((e: any) => e.experimentGroup === 'B');

  const calcStats = (groupEvents: any[]) => {
    const activations = groupEvents.filter((e: any) => e.eventName === 'learn_mode_activated' || e.eventName === 'summary_mode_activated');
    const totalSessions = new Set(activations.map((e: any) => e.videoId)).size || 1;
    const completedQuizzes = groupEvents.filter((e: any) => e.eventName === 'quiz_completed').length;
    const engagementUpdates = groupEvents.filter((e: any) => e.eventName === 'engagement_update');
    const totalEngagementSeconds = engagementUpdates.reduce((sum: number, e: any) => sum + (e.metadata?.seconds || 10), 0);
    
    return {
      sessionsCount: totalSessions,
      totalQuizCompleted: completedQuizzes,
      totalEngagementMinutes: parseFloat((totalEngagementSeconds / 60).toFixed(1)),
      averageEngagementSecondsPerSession: parseFloat((totalEngagementSeconds / totalSessions).toFixed(0)) || 0,
    };
  };

  return res.json({
    totalEvents: events.length,
    groupAStats: calcStats(groupA),
    groupBStats: calcStats(groupB),
  });
});

// REST API endpoint: Text-to-Speech service using gemini-3.1-flash-tts-preview
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text content is required for TTS synthesis.' });
  }

  try {
    // Generate text-to-speech base64 audio
    const activeAi = getGeminiClient(req);
    const response = await activeAi.models.generateContent({
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
app.get('/api/usage-status', (req, res) => {
  const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
  const ip = rawIp.split(',')[0].trim();
  const limitSetting = parseInt(process.env.FREE_REQS_LIMIT || '3', 10);

  let usage = ipUsageStorage.get(ip);
  const now = Date.now();

  if (!usage) {
    usage = { count: 0, lastReset: now };
  } else if (now - usage.lastReset > 24 * 60 * 60 * 1000) {
    usage.count = 0;
    usage.lastReset = now;
    ipUsageStorage.set(ip, usage);
  }

  // Check if current VIP passcode is active
  const clientVipCode = req.headers['x-vip-bypass-code'] as string;
  const systemVipCode = (process.env.VIP_BYPASS_CODE || '').trim();
  const vipBypassActive = !!(systemVipCode && clientVipCode && clientVipCode.trim() === systemVipCode);

  res.json({
    ip,
    count: usage.count,
    limit: limitSetting,
    remaining: Math.max(0, limitSetting - usage.count),
    vipBypassActive,
  });
});

// =========================================================================
// HIGH-END ADMINISTRATIVE SECURITY ENGINE (MFA, LOCKOUTS & AUDIT LOGS)
// =========================================================================
interface AdminLockout {
  attempts: number;
  lockedUntil: number;
}
const adminLockouts = new Map<string, AdminLockout>();
const activeAdminSessions = new Set<string>();

interface AdminAuditLog {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  user: string;
  event: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  details: string;
}

const adminAuditLogs: AdminAuditLog[] = [
  {
    id: 'log_init_001',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    ip: '127.0.0.1',
    userAgent: 'Internal System Bootstrapper v2.1',
    user: 'SYSTEM',
    event: 'Audit Ledger Initialized',
    status: 'SUCCESS',
    details: 'GCC Secure Vault initialized with active data sovereignty constraints.'
  }
];

// Helper to extract client IP helper
function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = (forwarded as string).split(',');
    return ips[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

app.post('/api/admin/auth', (req, res) => {
  const { username, password, mfaCode } = req.body;
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Unknown Agent';
  const now = Date.now();

  // 1. Check IP lockout status
  const lockout = adminLockouts.get(ip);
  if (lockout && lockout.attempts >= 5 && lockout.lockedUntil > now) {
    const waitSeconds = Math.ceil((lockout.lockedUntil - now) / 1000);
    
    // Log blocked event
    adminAuditLogs.unshift({
      id: `log_blk_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      user: username || 'UNKNOWN',
      event: 'Brute-Force Lockout Block',
      status: 'BLOCKED',
      details: `Forbidden access attempt from rate-limited IP. Locked for ${waitSeconds}s.`
    });

    return res.status(429).json({
      error: `Too many failed login attempts. Security lockout active. Please wait ${waitSeconds} seconds.`,
      lockoutSeconds: waitSeconds
    });
  }

  const systemUser = (process.env.ADMIN_USER_ID || '').trim();
  const systemPass = (process.env.ADMIN_PASSWORD || '').trim();

  // SECURITY: fail closed if admin credentials aren't configured server-side.
  // Previously this fell back to a hardcoded 'admin' / 'SnapSumAdmin2026!' pair,
  // which meant the admin panel was openly accessible to anyone if the env vars
  // were ever missing in production.
  if (!systemUser || !systemPass) {
    return res.status(503).json({ error: 'Admin login is not configured on this server.' });
  }

  // 2. Validate Credentials
  const usernameMatch = username === systemUser;
  const passwordMatch = password === systemPass;

  if (!usernameMatch || !passwordMatch) {
    // Increment or initialize lockout
    const attempts = lockout ? lockout.attempts + 1 : 1;
    const lockedUntil = attempts >= 5 ? now + 180000 : 0; // 3 minutes lockout on 5th failure
    adminLockouts.set(ip, { attempts, lockedUntil });

    adminAuditLogs.unshift({
      id: `log_fal_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      user: username || 'UNKNOWN',
      event: 'Sign-in Failure',
      status: 'FAILURE',
      details: `Invalid credentials entered. Attempt #${attempts} of 5 before lockout.`
    });

    return res.status(401).json({
      error: 'Invalid administrative credentials.',
      attemptsRemaining: Math.max(0, 5 - attempts),
      lockoutActive: attempts >= 5
    });
  }

  // Multi-Factor Authentication Verification (High-end challenge)
  // SECURITY: the MFA code must come from server config — it was previously hardcoded
  // as "771993" directly in source (and even duplicated into the frontend bundle as an
  // "autofill" convenience), which defeats the purpose of MFA entirely.
  const systemMfaCode = (process.env.ADMIN_MFA_CODE || '').trim();
  if (!systemMfaCode) {
    return res.status(503).json({ error: 'Admin MFA is not configured on this server.' });
  }
  if (mfaCode && mfaCode.trim().replace(/\s+/g, '') !== systemMfaCode) {
    const attempts = lockout ? lockout.attempts + 1 : 1;
    const lockedUntil = attempts >= 5 ? now + 180000 : 0;
    adminLockouts.set(ip, { attempts, lockedUntil });

    adminAuditLogs.unshift({
      id: `log_fal_mfa_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      user: username,
      event: 'MFA Verification Failure',
      status: 'FAILURE',
      details: `Valid User/Pass, but invalid 2FA Multi-Factor Token value.`
    });

    return res.status(403).json({
      error: 'Security challenge failed: Invalid Multi-Factor Authentication token.',
      mfaRequired: true,
      attemptsRemaining: Math.max(0, 5 - attempts)
    });
  }

  // If correct password but first time log in without mfaCode parameter, ask for the MFA challenge step
  if (!mfaCode) {
    return res.json({
      mfaRequired: true,
      message: 'MFA validation challenge generated successfully.'
    });
  }

  // 4. Auth Success -> Reset lockout state
  adminLockouts.delete(ip);
  const secureToken = `sess_adm_${crypto.randomBytes(32).toString('hex')}`;
  activeAdminSessions.add(secureToken);

  adminAuditLogs.unshift({
    id: `log_suc_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ip,
    userAgent,
    user: username,
    event: 'Administrative Session Initialized',
    status: 'SUCCESS',
    details: 'MFA verified. Admin control terminal session authorized successfully.'
  });

  return res.json({
    success: true,
    token: secureToken,
    expiresIn: 3600 // 1 hour session token lifespan
  });
});

app.post('/api/admin/verify-token', (req, res) => {
  const { token } = req.body;
  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ valid: false, error: 'Administrative session expired or invalid.' });
  }
  return res.json({ valid: true });
});

app.post('/api/admin/logout', (req, res) => {
  const { token } = req.body;
  if (token) {
    activeAdminSessions.delete(token);
    adminAuditLogs.unshift({
      id: `log_out_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'Unknown Agent',
      user: 'admin',
      event: 'Session Terminated Gracefully',
      status: 'SUCCESS',
      details: 'Administrator signed out.'
    });
  }
  return res.json({ success: true });
});

app.post('/api/admin/audit-logs', (req, res) => {
  const { token } = req.body;
  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ error: 'Access denied: Valid administrative session required.' });
  }
  return res.json({ logs: adminAuditLogs });
});

app.post('/api/admin/ip-tracker', (req, res) => {
  const { token } = req.body;
  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ error: 'Access denied: Valid administrative session required.' });
  }

  const list: any[] = [];
  ipUsageStorage.forEach((value, key) => {
    list.push({
      ip: key,
      count: value.count,
      lastResetAt: new Date(value.lastReset).toISOString(),
    });
  });

  return res.json({ ips: list });
});

app.post('/api/admin/ip-reset', (req, res) => {
  const { token, targetIp, clearAll } = req.body;
  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ error: 'Access denied: Valid administrative session required.' });
  }

  if (clearAll) {
    ipUsageStorage.clear();
    adminAuditLogs.unshift({
      id: `log_rst_all_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'Unknown Agent',
      user: 'admin',
      event: 'Rate Limit Database Purge',
      status: 'SUCCESS',
      details: 'Cleared all guest rate limiting history'
    });
    return res.json({ success: true, message: 'All guest rate-limit history cleared successfully' });
  }

  if (targetIp) {
    ipUsageStorage.delete(targetIp);
    adminAuditLogs.unshift({
      id: `log_rst_ip_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'Unknown Agent',
      user: 'admin',
      event: 'Rate Limit Target Nullified',
      status: 'SUCCESS',
      details: `Cleared rate-limit history for IP ${targetIp}`
    });
    return res.json({ success: true, message: `Guest IP ${targetIp} rate-limit history cleared successfully` });
  }

  return res.json({ success: false, error: 'No trigger action specified' });
});

app.get('/api/stripe-status', (req, res) => {
  // SECURITY: previously trusted client-supplied 'x-custom-stripe-secret-key' /
  // 'x-custom-stripe-publishable-key' headers. Stripe keys must only ever come from
  // server-side env vars — a client should never be able to inject its own.
  res.json({
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  });
});

app.post('/api/save-subscription', async (req, res) => {
  const { email, plan, status } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const success = await saveSubscription(email, plan || 'pro', status || 'active');
  return res.json({ success });
});

app.get('/api/subscription-status', async (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }
  const subscription = await getSubscription(email);
  return res.json({ subscription });
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { planCode, billingCycle, returnUrl } = req.body;
  // SECURITY: Stripe secret key must only come from server env — never from a client header.
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return res.status(400).json({ error: 'Stripe Secret Key is missing. Connect your live Stripe key via AI Studio settings or direct in-app Developer override.' });
  }

  try {
    const isYearly = billingCycle === 'yearly';
    let planName = 'Pro Creator Pass';
    let unitAmount = isYearly ? 14 : 19; // $14.00/mo or $19.00/mo
    let isSubscription = true;

    if (planCode === 'test' || planCode === 'test_1usd') {
      planName = 'Stripe Live Verification (One-Time)';
      unitAmount = 1; // $1.00 USD
      isSubscription = false;
    } else if (planCode === 'enterprise') {
      planName = 'Enterprise Agency Hub';
      unitAmount = isYearly ? 39 : 49; // $39.00/mo or $49.00/mo
    }

    // Convert prices to cents for Stripe
    unitAmount = unitAmount * 100;

    const payload = new URLSearchParams();
    payload.append('payment_method_types[0]', 'card');
    payload.append('line_items[0][price_data][currency]', 'usd');
    payload.append('line_items[0][price_data][product_data][name]', planName);
    payload.append('line_items[0][price_data][unit_amount]', String(unitAmount));
    if (isSubscription) {
      payload.append('line_items[0][price_data][recurring][interval]', 'month');
      payload.append('mode', 'subscription');
    } else {
      payload.append('mode', 'payment');
    }
    payload.append('line_items[0][quantity]', '1');
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
