/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { saveSummary, getSummary, listSummaries } from './server/summaryStore';
import { getOrCreateReferralCode, recordReferral, getReferralCount, isLockedUnlocked, linkUserToReferral, getReferralLeaderboard } from './server/referralStore';
import { saveSubscription, getSubscription } from './server/subscriptionStore';
import { db } from './server/firestore';
// @ts-ignore
import { generateSecret, generateURI, verifySync } from 'otplib';
import Stripe from 'stripe';

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

// Extremely robust JSON cleaning, extraction, and repair engine to prevent parsing crashes
function looseJsonRepair(jsonStr: string): string {
  let s = jsonStr.trim();
  
  // Balance brackets/braces and quotes
  let inString = false;
  let escape = false;
  const stack: string[] = [];
  let cleanStr = "";
  
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    
    if (escape) {
      cleanStr += char;
      escape = false;
      continue;
    }
    
    if (char === '\\') {
      cleanStr += char;
      escape = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      cleanStr += char;
      continue;
    }
    
    if (inString) {
      cleanStr += char;
      continue;
    }
    
    if (char === '{' || char === '[') {
      stack.push(char === '{' ? '}' : ']');
      cleanStr += char;
    } else if (char === '}' || char === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === char) {
        stack.pop();
      }
      cleanStr += char;
    } else {
      cleanStr += char;
    }
  }
  
  // If we ended up inside a string, close the string
  if (inString) {
    cleanStr += '"';
  }
  
  let repaired = cleanStr.trim();
  
  // Clean up trailing invalid elements (commas, unclosed object properties, etc) before balancing braces
  while (repaired.endsWith(',')) {
    repaired = repaired.slice(0, -1).trim();
  }
  
  // Clean up dangling keys, trailing colon, dangling comma at the end
  repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*[^,]*$/, '');
  repaired = repaired.replace(/,\s*"[^"]*"\s*$/, '');
  repaired = repaired.replace(/,\s*$/, '');
  
  // Pop everything remaining in the stack to close open structures
  while (stack.length > 0) {
    const closing = stack.pop();
    repaired = repaired.trim();
    if (repaired.endsWith(',')) {
      repaired = repaired.slice(0, -1).trim();
    }
    repaired += closing;
  }
  
  return repaired;
}

function cleanAndParseJson(text: string): any {
  let cleaned = text.trim();

  // 1. If wrapped in markdown code blocks, extract
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  // 2. Extract the actual JSON portion if there is surrounding conversational text
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  
  let startIdx = -1;
  let endIdx = -1;
  
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf(']');
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.slice(startIdx, endIdx + 1);
  }

  // 3. Try to parse
  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    console.warn("Standard JSON.parse failed, attempting loose repair. Error:", err.message);
    try {
      const repaired = looseJsonRepair(cleaned);
      return JSON.parse(repaired);
    } catch (repairErr: any) {
      console.error("JSON repair failed:", repairErr.message);
      throw new Error(`Failed to parse AI output as JSON: ${err.message}. Raw output sample: ${text.slice(0, 150)}...`);
    }
  }
}

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

interface MonthlyUsage {
  count: number;
  voiceoverMinutes: number;
  lastReset: number;
  isFirstCycle?: boolean;
}
const monthlyUsageStorage = new Map<string, MonthlyUsage>();

// Middleware/inline utility to check and increment daily IP request credits
async function checkAndIncrementUsage(req: express.Request): Promise<{ allowed: boolean; count: number; limit: number; remaining: number; throttleMs?: number; message?: string }> {
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

  // Get active plan and user identifier (email or IP)
  const isPremium = req.headers['x-is-premium'] === 'true';
  const userPlan = (req.headers['x-user-plan'] as string) || (isPremium ? 'pro' : 'free');
  const email = req.headers['x-user-email'] as string;
  const trackingKey = (email && email.trim()) ? `email:${email.trim().toLowerCase()}` : `ip:${ip}`;

  const now = Date.now();
  let mUsage = monthlyUsageStorage.get(trackingKey);
  if (!mUsage) {
    mUsage = { count: 0, voiceoverMinutes: 0, lastReset: now, isFirstCycle: true };
  } else if (now - mUsage.lastReset > 30 * 24 * 60 * 60 * 1000) {
    // 30 days cooling cycle
    mUsage.count = 0;
    mUsage.voiceoverMinutes = 0;
    mUsage.lastReset = now;
    mUsage.isFirstCycle = false;
  }

  // Determine limits based on active plan
  let limit = 5; // default Starter monthly limit
  const isPro = userPlan === 'pro';
  const isEnterprise = userPlan === 'enterprise';

  if (isPro) {
    limit = 150; // soft cap
  } else if (isEnterprise) {
    limit = 500; // hard cap
  } else if (mUsage.isFirstCycle) {
    limit = 8; // one-time first-session bonus
  }

  // Handle Free / Starter tier limit
  if (!isPro && !isEnterprise) {
    if (mUsage.count >= limit) {
      return {
        allowed: false,
        count: mUsage.count,
        limit,
        remaining: 0,
        message: mUsage.isFirstCycle
          ? 'Your one-time first-session bonus limit of 8 summaries has been reached. Please upgrade to Pro or Enterprise for unlimited processing!'
          : 'Your Starter plan is limited to 5 summaries per month. Please upgrade to Pro or Enterprise for unlimited processing!'
      };
    }
  }

  // Handle Enterprise tier limit
  if (isEnterprise) {
    if (mUsage.count >= limit) {
      return {
        allowed: false,
        count: mUsage.count,
        limit,
        remaining: 0,
        message: 'You have reached your Enterprise fair-use ceiling of 500 summaries per month.'
      };
    }
  }

  // Handle Pro tier (soft cap: throttle above 150 by returning throttleMs)
  let throttleMs = 0;
  if (isPro && mUsage.count >= limit) {
    throttleMs = 5000; // Delay next request by 5 seconds (smooth throttling)
  }

  // Track and increment usage
  mUsage.count += 1;
  monthlyUsageStorage.set(trackingKey, mUsage);

  // Still support the legacy ipUsageStorage for backward compatibility
  let legacyUsage = ipUsageStorage.get(ip);
  if (!legacyUsage) {
    legacyUsage = { count: 0, lastReset: now };
  }
  legacyUsage.count += 1;
  ipUsageStorage.set(ip, legacyUsage);

  return {
    allowed: true,
    count: mUsage.count,
    limit,
    remaining: Math.max(0, limit - mUsage.count),
    throttleMs
  };
}


// Proxy Firebase Auth helper requests directly to Firebase's official server domain.
// This allows Google Auth popups to recognize and display 'www.zipytiny.app' (or 'zipytiny.app')
// under the custom brand domain rather than the default firebaseapp.com domain.
app.use(
  '/__/auth',
  createProxyMiddleware({
    target: 'https://gen-lang-client-0003754495.firebaseapp.com',
    changeOrigin: true,
  })
);

app.use(express.json({ 
  limit: '10mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// Route-level rate limiters (configurable via env vars)
const summarizeLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_SUMMARIZE_WINDOW_MS || '900000', 10), // 15 min default
  max: parseInt(process.env.RATE_LIMIT_SUMMARIZE_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many summarize requests from this IP. Please wait 15 minutes or add your own Gemini API key.', rateLimited: true },
});

const ttsLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_TTS_WINDOW_MS || '900000', 10), // 15 min default
  max: parseInt(process.env.RATE_LIMIT_TTS_MAX || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many TTS requests from this IP. Please wait 15 minutes or upgrade to PRO.', rateLimited: true },
});

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
function injectOGTags(html: string, summary: any, suffix: string = '', forkQuiz: boolean = false): string {
  const metadata = summary.metadata || {};
  const cleanTitle = (metadata.title || 'AI Video Summary').replace(/"/g, '&quot;');
  const title = (cleanTitle + suffix).replace(/"/g, '&quot;');
  const rawDesc = summary.summary || 'Click to view structured summaries, key insights, chapters, and interactive learning quizzes.';
  const description = rawDesc.replace(/"/g, '&quot;').slice(0, 150);

  // Dynamic OG image: pass thumbnail + top 3 takeaways to our /api/og-image endpoint
  const thumbnailBase = metadata.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80';
  const rawTakeaways: any[] = Array.isArray(summary.takeaways) ? summary.takeaways.slice(0, 3) : [];
  const takeawayTexts = rawTakeaways.map((t: any) => (typeof t === 'string' ? t : (t?.text || ''))).filter(Boolean);
  const ogParams = new URLSearchParams({
    thumb: thumbnailBase,
    title: metadata.title || 'Zipytiny',
    t1: takeawayTexts[0] || '',
    t2: takeawayTexts[1] || '',
    t3: takeawayTexts[2] || '',
  });
  const imageUrl = `/api/og-image?${ogParams.toString()}`;
  const url = `https://www.zipytiny.app/s/${summary.shareId}`;

  const forkMeta = forkQuiz
    ? `\n    <meta name="zipytiny:fork-quiz" content="true" />`
    : '';

  const metaHtml = `
    <title>${title} - Zipytiny</title>
    <meta name="description" content="${description}" />
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title} - Zipytiny" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${url}" />
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title} - Zipytiny" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />${forkMeta}
  `;

  let normalized = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
  normalized = normalized.replace('</head>', `${metaHtml}</head>`);
  return normalized;
}

// Dynamic OG image endpoint — returns an SVG social card with thumbnail + top 3 takeaways
// Social crawlers (Slack, Twitter, LinkedIn) will render this as the link preview image
app.get('/api/og-image', (req, res) => {
  const { thumb = '', title = 'Zipytiny', t1 = '', t2 = '', t3 = '' } = req.query as Record<string, string>;

  const truncate = (s: string, max: number) => s.length > max ? s.slice(0, max - 1) + '…' : s;
  const safeTitle = truncate(title, 60).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
  const lines = [t1, t2, t3].filter(Boolean).map((t, i) => `<text x="640" y="${320 + i * 52}" font-family="Arial,sans-serif" font-size="22" fill="#e2e8f0" text-anchor="middle">${truncate(t.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;'), 80)}</text>`).join('\n');
  const hasThumb = thumb && thumb.startsWith('http');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <clipPath id="imgClip"><rect width="1200" height="630" rx="0"/></clipPath>
  </defs>
  <!-- Background -->
  <rect width="1200" height="630" fill="#0f172a"/>
  <!-- Thumbnail if available -->
  ${hasThumb ? `<image href="${thumb}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice" clip-path="url(#imgClip)" opacity="0.25"/>` : ''}
  <!-- Dark overlay -->
  <rect width="1200" height="630" fill="url(#grad)"/>
  <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0f172a" stop-opacity="0.5"/><stop offset="100%" stop-color="#0f172a" stop-opacity="0.92"/></linearGradient></defs>
  <!-- Zipytiny badge -->
  <rect x="48" y="48" width="140" height="36" rx="8" fill="#6366f1"/>
  <text x="118" y="71" font-family="Arial,sans-serif" font-size="18" font-weight="bold" fill="#fff" text-anchor="middle">Zipytiny</text>
  <!-- Title -->
  <text x="600" y="230" font-family="Arial,sans-serif" font-size="38" font-weight="bold" fill="#ffffff" text-anchor="middle">${safeTitle}</text>
  <!-- Divider -->
  <rect x="480" y="268" width="240" height="3" rx="2" fill="#6366f1"/>
  <!-- Takeaways -->
  ${lines}
  <!-- Footer -->
  <text x="600" y="590" font-family="Arial,sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">zipytiny.app — AI Video Summaries</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(svg);
});

// Robots & Sitemap
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nSitemap: https://www.zipytiny.app/sitemap.xml');
});

app.get('/sitemap.xml', async (req, res) => {
  const summaries = await listSummaries();
  const urls = summaries.map(s => `
  <url>
    <loc>https://www.zipytiny.app/s/${s.shareId}</loc>
    <lastmod>${new Date(s.savedAt || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.zipytiny.app/</loc>
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
  const { referralCode, uid, displayName, photoURL, email } = req.body;
  const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
  const ip = rawIp.split(',')[0].trim();

  let registered = false;
  if (referralCode) {
    registered = await recordReferral(ip, referralCode);
  }

  if (uid) {
    await linkUserToReferral(ip, uid, displayName || '', photoURL || '', email || '');
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

app.get('/api/referral/leaderboard', async (req, res) => {
  try {
    const leaderboard = await getReferralLeaderboard();
    return res.json({
      success: true,
      leaderboard
    });
  } catch (err: any) {
    console.error('Error fetching referral leaderboard:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
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
    html = injectOGTags(html, summary, ' - Interactive Quiz', true);
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
app.post('/api/summarize', summarizeLimiter, async (req, res) => {
  const { videoUrl, customTranscript, outputLanguage, learnMode } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Video URL is required.' });
  }

  // Enforce MVP Rate Limits to prevent default server API account exhaustion
  const usageStatus = await checkAndIncrementUsage(req);
  if (!usageStatus.allowed) {
    return res.status(429).json({
      error: usageStatus.message || `Credit limit reached (${usageStatus.count}/${usageStatus.limit} free queries used). Please insert your custom Gemini API key or Upgrade to PRO to process unlimited video summaries instantly!`,
      rateLimited: true,
      limit: usageStatus.limit,
      count: usageStatus.count,
    });
  }

  // Handle throttling (soft cap overflow delay)
  if (usageStatus.throttleMs && usageStatus.throttleMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, usageStatus.throttleMs));
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
2. takeaways: A list of 5-7 actionable, eye-opening takeaways or direct value bombs. For each takeaway, provide a "text" field with the insight and a "lowConfidence" boolean field — set lowConfidence to true only if the claim comes from fast/unclear speech, is a technical/medical/niche claim that could not be fully verified from the transcript, or is ambiguous. Set it to false otherwise.
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
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                lowConfidence: { type: Type.BOOLEAN },
              },
              required: ['text', 'lowConfidence'],
            },
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

    const result = cleanAndParseJson(outputText);

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
app.post('/api/tts', ttsLimiter, async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text content is required for TTS synthesis.' });
  }

  // Get active plan and user identifier (email or IP)
  const isPremium = req.headers['x-is-premium'] === 'true';
  const userPlan = (req.headers['x-user-plan'] as string) || (isPremium ? 'pro' : 'free');
  const email = req.headers['x-user-email'] as string;
  const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
  const ip = rawIp.split(',')[0].trim();
  const trackingKey = (email && email.trim()) ? `email:${email.trim().toLowerCase()}` : `ip:${ip}`;

  const isPro = userPlan === 'pro';
  const isEnterprise = userPlan === 'enterprise';

  if (!isPro && !isEnterprise) {
    return res.status(403).json({
      error: 'Your current Starter plan does not include voiceover generation. Please upgrade to Pro or Enterprise to unlock studio voice synthesis!'
    });
  }

  // Track and increment voiceover minutes
  const now = Date.now();
  let mUsage = monthlyUsageStorage.get(trackingKey);
  if (!mUsage) {
    mUsage = { count: 0, voiceoverMinutes: 0, lastReset: now };
  } else if (now - mUsage.lastReset > 30 * 24 * 60 * 60 * 1000) {
    mUsage.count = 0;
    mUsage.voiceoverMinutes = 0;
    mUsage.lastReset = now;
  }

  const wordCount = text.split(/\s+/).length;
  const estimatedMinutes = Math.max(0.1, Number((wordCount / 150).toFixed(2)));

  const maxMinutes = isEnterprise ? 800 : 300;
  if (mUsage.voiceoverMinutes >= maxMinutes) {
    return res.status(429).json({
      error: `You have reached your monthly voiceover generation limit (${mUsage.voiceoverMinutes.toFixed(1)} / ${maxMinutes} minutes used). Please upgrade your plan to extend your limits.`
    });
  }

  mUsage.voiceoverMinutes += estimatedMinutes;
  monthlyUsageStorage.set(trackingKey, mUsage);

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
    console.error('TTS execution failed, falling back to Google Translate TTS:', err);
    
    try {
      // Split text into chunks of at most 180 characters to satisfy Google Translate API limits
      const chunks: string[] = [];
      const words = text.split(/\s+/);
      let currentChunk = '';
      
      for (const word of words) {
        if ((currentChunk + ' ' + word).length > 180) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = word;
        } else {
          currentChunk = currentChunk ? currentChunk + ' ' + word : word;
        }
      }
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }

      // Limit to max 6 chunks to keep request fast and stay within reasonable audio duration
      const selectedChunks = chunks.slice(0, 6);
      const buffers: Buffer[] = [];
      
      for (const chunk of selectedChunks) {
        if (!chunk) continue;
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(chunk)}`;
        const resTts = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        
        if (resTts.ok) {
          const arrayBuf = await resTts.arrayBuffer();
          buffers.push(Buffer.from(arrayBuf));
        } else {
          console.warn(`Translate TTS chunk fetch failed: ${resTts.statusText}`);
        }
      }

      if (buffers.length > 0) {
        const mergedBuffer = Buffer.concat(buffers);
        const base64Audio = mergedBuffer.toString('base64');
        console.log('Successfully generated speech using Translate TTS fallback.');
        return res.json({ audioBase64: base64Audio });
      }
    } catch (fallbackErr) {
      console.error('Translate TTS fallback failed:', fallbackErr);
    }

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

app.post('/api/admin/auth', async (req, res) => {
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

  // Set default fallbacks
  let finalAdminUser = (process.env.ADMIN_USER_ID || 'admin').trim();
  let finalAdminPass = (process.env.ADMIN_PASSWORD || 'ZipytinyAdmin2026!').trim();
  let mfaSecret = '';

  // Attempt to load settings from Firebase Database
  if (db) {
    try {
      const adminDoc = await db.collection('admin_settings').doc('config').get();
      if (adminDoc.exists) {
        const data = adminDoc.data();
        if (data?.adminUser) {
          finalAdminUser = data.adminUser.trim();
        }
        if (data?.adminPassword) {
          finalAdminPass = data.adminPassword.trim();
        }
        if (data?.mfaSecret) {
          mfaSecret = data.mfaSecret.trim();
        }
      }
    } catch (err) {
      console.error('Failed to load admin settings from Firestore:', err);
    }
  }

  // 2. Validate Credentials
  const usernameMatch = username === finalAdminUser;
  const passwordMatch = password === finalAdminPass;

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

  // 3. Multi-Factor Authentication Verification (High-end challenge)
  if (mfaSecret) {
    if (mfaCode) {
      const cleanMfaCode = mfaCode.trim().replace(/\s+/g, '');
      const mfaResult = verifySync({ token: cleanMfaCode, secret: mfaSecret });
      const isValid = mfaResult.valid;
      if (!isValid) {
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
          details: `Valid User/Pass, but invalid Google Authenticator TOTP token value.`
        });

        return res.status(403).json({
          error: 'Security challenge failed: Invalid Multi-Factor Authentication token.',
          mfaRequired: true,
          attemptsRemaining: Math.max(0, 5 - attempts)
        });
      }
    } else {
      // Prompt for MFA Code
      return res.json({
        mfaRequired: true,
        message: 'MFA validation challenge generated successfully.'
      });
    }
  } else {
    // Fallback static MFA Code if Google Authenticator is not yet configured
    const systemMfaCode = (process.env.ADMIN_MFA_CODE || '771993').trim();
    if (mfaCode) {
      if (mfaCode.trim().replace(/\s+/g, '') !== systemMfaCode) {
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
          details: `Valid User/Pass, but invalid static 2FA Multi-Factor Token value.`
        });

        return res.status(403).json({
          error: 'Security challenge failed: Invalid Multi-Factor Authentication token.',
          mfaRequired: true,
          attemptsRemaining: Math.max(0, 5 - attempts)
        });
      }
    } else {
      // Prompt for MFA Code
      return res.json({
        mfaRequired: true,
        message: 'MFA validation challenge generated successfully.'
      });
    }
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
    token: secureToken,
    user: username
  });
});

// Endpoint: Generate a new 2FA secret and QR code URL
app.post('/api/admin/generate-2fa', (req, res) => {
  const { token } = req.body;
  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ error: 'Access denied: Valid administrative session required.' });
  }

  try {
    const secret = generateSecret();
    const otpauthUrl = generateURI({ label: 'admin', issuer: 'Zipytiny', secret });
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;

    return res.json({ secret, qrCodeUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate 2FA credentials.' });
  }
});

// Endpoint: Verify a 2FA code during the setup flow to prevent lockouts
app.post('/api/admin/verify-2fa-setup', (req, res) => {
  const { token, mfaSecret, mfaCode } = req.body;
  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ error: 'Access denied: Valid administrative session required.' });
  }

  if (!mfaSecret || !mfaCode) {
    return res.status(400).json({ error: 'Missing secret or code.' });
  }

  try {
    const cleanCode = mfaCode.trim().replace(/\s+/g, '');
    const verifyResult = verifySync({ token: cleanCode, secret: mfaSecret });
    const isValid = verifyResult.valid;
    return res.json({ valid: isValid });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Verification failed.' });
  }
});

// Endpoint: Save Admin Credentials & Settings to Firebase
app.post('/api/admin/save-settings', async (req, res) => {
  const { token, adminUser, adminPassword, mfaSecret } = req.body;
  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ error: 'Access denied: Valid administrative session required.' });
  }

  if (!adminUser || !adminPassword) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    if (db) {
      await db.collection('admin_settings').doc('config').set({
        adminUser: adminUser.trim(),
        adminPassword: adminPassword.trim(),
        mfaSecret: mfaSecret ? mfaSecret.trim() : null,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      adminAuditLogs.unshift({
        id: `log_set_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] || 'Unknown Agent',
        user: 'admin',
        event: 'Admin Settings Updated',
        status: 'SUCCESS',
        details: `Credentials and 2FA settings securely updated in Firestore. MFA: ${mfaSecret ? 'ENABLED (Google Authenticator)' : 'DISABLED (Static)'}`
      });

      return res.json({ success: true });
    } else {
      return res.status(503).json({ error: 'Database service unavailable.' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save admin settings.' });
  }
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

app.post('/api/log-google-user', async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'User UID is required.' });
  }

  try {
    if (db) {
      const userRef = db.collection('google_users').doc(uid);
      const docSnap = await userRef.get();
      const now = new Date().toISOString();

      if (!docSnap.exists) {
        await userRef.set({
          uid,
          email: email || '',
          displayName: displayName || '',
          photoURL: photoURL || '',
          createdAt: now,
          lastLoginAt: now,
        });
      } else {
        await userRef.update({
          email: email || '',
          displayName: displayName || '',
          photoURL: photoURL || '',
          lastLoginAt: now,
        });
      }
      return res.json({ success: true });
    } else {
      return res.status(503).json({ error: 'Database service unavailable.' });
    }
  } catch (err: any) {
    console.error('Error logging Google user details:', err);
    return res.status(500).json({ error: err.message || 'Failed to save Google user.' });
  }
});

app.post('/api/admin/google-users', async (req, res) => {
  const { token } = req.body;
  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ error: 'Access denied: Valid administrative session required.' });
  }

  try {
    if (db) {
      const snapshot = await db.collection('google_users').orderBy('lastLoginAt', 'desc').get();
      const users: any[] = [];
      snapshot.forEach(doc => {
        users.push(doc.data());
      });
      return res.json({ users });
    } else {
      return res.status(503).json({ error: 'Database service unavailable.' });
    }
  } catch (err: any) {
    console.error('Error fetching Google logged users:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch Google logged users.' });
  }
});

app.post('/api/admin/db-diagnostic', async (req, res) => {
  const { token } = req.body;
  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ error: 'Access denied.' });
  }

  try {
    if (!db) {
      return res.json({ success: false, error: 'Database variable is null or undefined.' });
    }

    // Try a test write
    const testDocRef = db.collection('google_users').doc('connection_test_doc');
    await testDocRef.set({
      test: true,
      timestamp: new Date().toISOString(),
      message: 'This is a secure connection test from Zipytiny backend.'
    });

    // Try a test read
    const docSnap = await testDocRef.get();
    const data = docSnap.exists ? docSnap.data() : null;

    return res.json({
      success: true,
      databaseInitialized: true,
      data,
      projectId: db ? (db as any)._projectId || 'Unknown' : 'N/A'
    });
  } catch (err: any) {
    return res.json({
      success: false,
      error: err.message || 'Unknown Firestore Error',
      stack: err.stack || ''
    });
  }
});

app.post('/api/customer-support', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  // Define a helpful rules-based fallback answer generator
  const getRuleBasedResponse = (userQuery: string): string => {
    const q = userQuery.toLowerCase();
    
    let answer = `👋 **Hey there! Welcome to Zipytiny Support!**\n\n`;
    
    // Check if the API key itself is missing to add a diagnostic tip
    const customKey = req.headers['x-custom-gemini-api-key'] as string;
    const serverKey = process.env.GEMINI_API_KEY;
    const isApiKeyMissing = (!customKey || !customKey.trim()) && (!serverKey || !serverKey.trim() || serverKey === 'MY_GEMINI_API_KEY');
    
    if (isApiKeyMissing) {
      answer += `😊 *Quick heads up: It looks like our main workspace Gemini API key isn't fully configured yet, so I'm running in offline help mode to guide you right away. If you'd like full conversational AI capabilities, feel free to enter your own personal Gemini API Key in the Developer Settings panel below, or configure it in Settings > Secrets! But don't worry, I can still answer all your questions about Zipytiny here!.*\n\n`;
    }

    if (q.includes('price') || q.includes('pricing') || q.includes('plan') || q.includes('pro') || q.includes('cost') || q.includes('subscription') || q.includes('premium') || q.includes('billing') || q.includes('buy') || q.includes('upgrade') || q.includes('starter')) {
      answer += `We've kept Zipytiny pricing super simple and transparent! We have two core premium tiers and an enterprise option tailored to your learning pace:\n\n` +
                `1. 🌟 **Basic Starter Plan ($0/forever)**:\n` +
                `   - Perfect for general learners! It gives you standard summaries for videos up to 30 minutes long.\n` +
                `   - Access to standard Active Recall quizzing & handy study tools.\n\n` +
                `2. 🔥 **Pro Creator Pass ($28/month or $19/month billed annually)**:\n` +
                `   - This is our most popular plan! You get **completely unlimited video processing** (no daily quota limits).\n` +
                `   - Premium, high-fidelity humanlike AI voiceovers for a beautiful listening experience.\n` +
                `   - Access to fully interactive concept mindmaps and dynamic study flashcards.\n` +
                `   - High-contrast vertical viral reels & script exports to repurpose content in seconds.\n` +
                `   - Priority queueing (blazing-fast generation speeds).\n\n` +
                `3. 🏢 **Enterprise Tier ($68/month or $48/month billed annually)**:\n` +
                `   - Custom LLM fine-tuning, high-volume API access, custom integrations, and dedicated support for organizations.\n\n` +
                `*Tip: Since we are running in a sandbox environment, you can actually test the entire Pro checkout flow and play with premium features completely for free without spending a single cent!*`;
    } else if (q.includes('sandbox') || q.includes('test') || q.includes('stripe') || q.includes('card') || q.includes('payment') || q.includes('checkout') || q.includes('simulate') || q.includes('charge')) {
      answer += `Our sandbox mode is actually one of the coolest parts of the platform! It lets you test out the entire Pro upgrade flow and play with premium features without spending a single penny.\n\n` +
                `- **How it works**: When you click "Upgrade to Pro" or head over to the Pricing section, the app automatically detects if you're in the developer sandbox testing mode.\n` +
                `- **Stripe Test Mode**: You can enter any custom Stripe test credentials (or use our pre-configured sandbox credentials in the checkout window) to trigger a simulated Stripe checkout.\n` +
                `- **Zero Real Cost**: No real credit card is ever charged, and you instantly unlock all premium Pro capabilities to experiment freely. It's 100% safe!`;
    } else if (q.includes('key') || q.includes('api') || q.includes('gemini') || q.includes('override') || q.includes('quota') || q.includes('limit') || q.includes('setting')) {
      answer += `If you want to bypass all daily server quotas and enjoy unlimited free video processing, you can use your own Google Gemini API key!\n\n` +
                `- **What it is**: By pasting your own key, summaries and text-to-speech are processed directly through Google's free tier, costing you absolutely nothing.\n` +
                `- **Where to enter it**: Simply expand the **Developer Settings** panel (or look for the "Sandbox Keys" drawer in the bottom corner of your screen) and paste your key.\n` +
                `- **Your Security**: We treat your privacy seriously. Your custom key is stored safely inside your local browser's private storage (localStorage) and sent directly to the Gemini API securely server-side. It is never shared or persisted on any third-party database.`;
    } else if (q.includes('referral') || q.includes('refer') || q.includes('invite') || q.includes('unlocked') || q.includes('code') || q.includes('friend')) {
      answer += `👥 **Unlock Premium for Free with Referrals!**\n\n` +
                `Yes, we have an awesome referral system! You can unlock the Pro Creator Pass features entirely for free just by sharing the love with your friends.\n\n` +
                `- **How**: Share your unique referral link (you can find it right on your main workspace dashboard).\n` +
                `- **The Goal**: When **2 visitors** click your link and sign in using Google SSO, your account is instantly upgraded to premium status! No credit card, no charge — just free Pro access!`;
    } else if (q.includes('feature') || q.includes('summar') || q.includes('tts') || q.includes('audio') || q.includes('chapter') || q.includes('mindmap') || q.includes('quiz') || q.includes('reel') || q.includes('video') || q.includes('transcript')) {
      answer += `🚀 **Zipytiny is packed with powerful, user-friendly tools to help you learn and create. Here is a quick look at what we offer:**\n\n` +
                `- **Universal Summaries**: Turns any YouTube video or long transcript into beautiful, structured takeaways.\n` +
                `- **Auto Chapters**: Automatically chunks long videos into neat segments with clickable timestamps so you can jump right to what matters.\n` +
                `- **Active Recall Quizzes**: Dynamic multiple-choice quizzes that check your understanding as you learn.\n` +
                `- **Interactive Mindmaps**: Gorgeous, interactive visual mindmaps to help you see how concepts connect.\n` +
                `- **AI Voiceovers (TTS)**: Lets you listen to your summaries on the go with full audio controls.\n` +
                `- **Viral Video Repurposer**: Automatically generate vertical TikTok or Reels storyboards and script exports from your summarized videos.`;
    } else if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('greetings') || q.includes('who are you') || q.includes('help')) {
      answer += `Hey there! It's so nice to meet you! I am your friendly support assistant here at Zipytiny. 😊\n\n` +
                `I am here to help you get the absolute most out of our platform! Whether you're curious about our pricing plans, want to try out our free payment sandbox, or want to know how to plug in your own Gemini API key for unlimited free processing, I've got you covered.\n\n` +
                `What can I help you explore today? Feel free to ask me about any of these:\n` +
                `- **Plans & Pricing** 💳 (We have great Starter and Pro options)\n` +
                `- **Interactive Sandbox Mode** 🧪 (Test checkout flows at $0 cost!)\n` +
                `- **Using Custom Gemini Keys** 🔑 (To bypass server quotas for free)\n` +
                `- **Our Core Features** 🎬 (Summaries, quizzes, mindmaps, and voiceovers!)`;
    } else {
      answer += `I am always here to help you navigate anything you need! Zipytiny is built to be the ultimate knowledge engine, converting long-form videos and lectures into beautifully organized summaries, interactive quizzes, visual mindmaps, and clean audio voiceovers.\n\n` +
                `If you have any questions at all about our pricing plans, how sandbox simulation works, setting up your own free Gemini key, or unlocking premium through referrals, just let me know. 😊\n\n` +
                `What's on your mind? Ask me anything and I'll do my best to help you out!`;
    }
    
    return answer;
  };

  try {
    const customKey = req.headers['x-custom-gemini-api-key'] as string;
    const serverKey = process.env.GEMINI_API_KEY;

    // Check if key is unconfigured, if so return smart fallback directly
    if ((!customKey || !customKey.trim()) && (!serverKey || !serverKey.trim() || serverKey === 'MY_GEMINI_API_KEY')) {
      const lastMessage = messages[messages.length - 1];
      const userText = lastMessage ? (lastMessage.content || lastMessage.text || '') : 'Hello';
      return res.json({ reply: getRuleBasedResponse(userText) });
    }

    const client = getGeminiClient(req);
    let contents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }]
    }));

    // Find the first user message, since the API history must start with a user message
    const firstUserIndex = contents.findIndex(c => c.role === 'user');
    if (firstUserIndex !== -1) {
      contents = contents.slice(firstUserIndex);
    } else {
      contents = [{ role: 'user', parts: [{ text: 'Hello' }] }];
    }

    // Merge consecutive messages of the same role to strictly alternate
    const alternatingContents: any[] = [];
    let lastRole: string | null = null;
    for (const c of contents) {
      if (c.role !== lastRole) {
        alternatingContents.push(c);
        lastRole = c.role;
      } else {
        const lastMsg = alternatingContents[alternatingContents.length - 1];
        if (lastMsg && lastMsg.parts && lastMsg.parts[0]) {
          lastMsg.parts[0].text += "\n" + (c.parts[0]?.text || '');
        }
      }
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: alternatingContents,
      config: {
        systemInstruction: `You are Zipytiny's friendly, warm, and highly conversational AI Customer Support Assistant. You represent Zipytiny, the ultimate AI-powered Universal Video Summarizer and Knowledge Engine.
Your goal is to answer user questions about Zipytiny's features, pricing, troubleshooting, and operations.

CRITICAL TONE DIRECTIVE:
Always write with a warm, conversational, welcoming, and highly human touch. Speak as if you are a real, friendly support specialist chatting with a user in real-time. Do NOT sound robotic, overly formal, stiff, or mechanical. Avoid heavy lists or structured tables unless the user explicitly asks for them. Use friendly emojis naturally and maintain a helpful, encouraging, and encouraging tone.

Key facts about Zipytiny to guide your replies:
1. Zipytiny transforms YouTube videos, lectures, and custom uploads into elegant structured summaries, key takeaways, quizzes, interactive mindmaps, and premium audio voiceovers (TTS).
2. Pricing and Billing:
   - Basic Starter Plan: $0/forever, offering standard summaries (up to 30 mins videos) and basic quizzes.
   - Pro Creator Pass: $28/month (or $19/month billed annually), offering unlimited processing, premium high-fidelity voiceovers, interactive mindmaps, dynamic flashcards, and priority queueing.
   - Enterprise Tier: $68/month (or $48/month billed annually), offering simultaneous bulk processing, automated web scheduler, API webhooks, and priority queueing.
3. Sandbox Environment: Zipytiny features a secure simulated sandbox environment. Connecting a Stripe test key or simulating Pro checkout allows developers/users to test the entire premium subscription flow at zero cost. No actual credit card is charged.
4. Custom Gemini API Key Override: Users can paste their own Google Gemini API key in the Developer Settings tab (in-app or in the Admin panel). This allows users to completely bypass server daily credit quotas and utilize their personal free-tier API quotas.
5. Other Features: Referrals (refer 2 visitors to unlock premium features), 2FA Security in Admin, IP tracker rate limit controls, Cinematic explainers, Active Recall quizzing, and audio transcription.

If a question is unrelated to Zipytiny, answer it politely but always loop back or offer assistance regarding Zipytiny's features in a natural, friendly manner.`,
        temperature: 0.7,
      }
    });

    return res.json({ reply: response.text });
  } catch (err: any) {
    console.error('Customer support error, falling back to smart rule-based response:', err);
    // If Gemini call fails for ANY reason (API key expired, rate limited, etc.), fallback to smart rules!
    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage ? (lastMessage.content || lastMessage.text || '') : 'Hello';
    return res.json({ reply: getRuleBasedResponse(userText) });
  }
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

app.get('/api/stripe-status', async (req, res) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !secretKey.trim()) {
    return res.json({
      stripeConfigured: false,
      publishableKey: '',
      accountInfo: null,
      error: ''
    });
  }

  if (!secretKey.trim().startsWith('sk_')) {
    return res.json({
      stripeConfigured: false,
      publishableKey: '',
      accountInfo: null,
      error: 'Invalid STRIPE_SECRET_KEY format.'
    });
  }

  try {
    const headers = {
      'Authorization': `Bearer ${secretKey.trim()}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    
    const accRes = await fetch('https://api.stripe.com/v1/account', { headers });
    if (!accRes.ok) {
      const errBody = await accRes.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `Stripe API error: ${accRes.statusText}`);
    }
    
    const acc = await accRes.json();
    return res.json({
      stripeConfigured: true,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
      accountInfo: {
        id: acc.id,
        chargesEnabled: acc.charges_enabled,
        payoutsEnabled: acc.payouts_enabled,
        detailsSubmitted: acc.details_submitted,
        capabilities: acc.capabilities || {},
        businessName: acc.settings?.dashboard?.display_name || acc.business_profile?.name || acc.nickname || 'Zipytiny.com',
        country: acc.country,
        requirements: acc.requirements || {},
        payouts_enabled: acc.payouts_enabled,
        charges_enabled: acc.charges_enabled
      }
    });
  } catch (err: any) {
    console.error('Error fetching Stripe status:', err);
    return res.json({
      stripeConfigured: false,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
      accountInfo: null,
      error: err.message || 'Failed to retrieve account details from Stripe.'
    });
  }
});

app.get('/api/subscription-status', async (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }
  const subscription = await getSubscription(email);
  return res.json({ subscription });
});

app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    console.error('Stripe webhook error: Missing stripe-signature header');
    return res.status(400).send('Webhook Error: Missing stripe-signature header');
  }

  if (!webhookSecret) {
    console.error('Stripe webhook error: STRIPE_WEBHOOK_SECRET is not configured on the server');
    return res.status(500).send('Webhook Error: STRIPE_WEBHOOK_SECRET is not configured');
  }

  let event: any;

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-01-27.acacia' as any,
    });
    
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.metadata?.email || session.customer_details?.email;
    const plan = session.metadata?.planCode || 'pro';
    
    if (email) {
      console.log(`Stripe Webhook checkout.session.completed: email=${email}, plan=${plan}`);
      await saveSubscription(email, plan, 'active');
    } else {
      console.error('Stripe Webhook: checkout.session.completed event is missing user email in metadata or customer_details', session);
    }
  }

  return res.json({ received: true });
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { planCode, billingCycle, promoCode, returnUrl, email } = req.body;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey || !stripeSecretKey.trim()) {
    console.error('STRIPE_SECRET_KEY is missing from environment');
    return res.status(500).json({ error: 'Stripe configuration is missing on server side.' });
  }

  if (!stripeSecretKey.trim().startsWith('sk_')) {
    console.error('STRIPE_SECRET_KEY on server does not start with sk_');
    return res.status(500).json({ error: 'Stripe configuration is invalid on server side.' });
  }

  try {
    let proMonthly = 28;
    let proYearly = 19;
    let enterpriseMonthly = 68;
    let enterpriseYearly = 48;
    let promotions: any[] = [];

    if (db) {
      try {
        const pricingDoc = await db.collection('admin_settings').doc('pricing').get();
        if (pricingDoc.exists) {
          const pData = pricingDoc.data();
          if (pData?.proMonthlyPrice !== undefined) proMonthly = Number(pData.proMonthlyPrice);
          if (pData?.proYearlyPrice !== undefined) proYearly = Number(pData.proYearlyPrice);
          if (pData?.enterpriseMonthlyPrice !== undefined) enterpriseMonthly = Number(pData.enterpriseMonthlyPrice);
          if (pData?.enterpriseYearlyPrice !== undefined) enterpriseYearly = Number(pData.enterpriseYearlyPrice);
          if (Array.isArray(pData?.promotions)) promotions = pData.promotions;
        }
      } catch (err) {
        console.error('Failed to load dynamic pricing from Firestore:', err);
      }
    }

    const isYearly = billingCycle === 'yearly';
    let planName = 'Pro Creator Pass';
    let unitAmount = isYearly ? proYearly : proMonthly;
    let isSubscription = true;

    if (planCode === 'test' || planCode === 'test_1usd') {
      planName = 'Stripe Live Verification (One-Time)';
      unitAmount = 1; // $1.00 USD
      isSubscription = false;
    } else if (planCode === 'enterprise') {
      planName = 'Enterprise Agency Hub';
      unitAmount = isYearly ? enterpriseYearly : enterpriseMonthly;
    }

    // Apply promotion code discount if active and applicable
    if (promoCode && planCode !== 'test' && planCode !== 'test_1usd') {
      const codeStr = String(promoCode).trim().toUpperCase();
      const foundPromo = promotions.find(p => p.code?.toUpperCase() === codeStr && p.active);
      if (foundPromo) {
        if (foundPromo.discountType === 'percentage') {
          const discount = (unitAmount * Number(foundPromo.discountValue)) / 100;
          unitAmount = Math.max(0, unitAmount - discount);
          planName += ` (${foundPromo.code} - ${foundPromo.discountValue}% Off)`;
        } else if (foundPromo.discountType === 'fixed') {
          unitAmount = Math.max(0, unitAmount - Number(foundPromo.discountValue));
          planName += ` (${foundPromo.code} - $${foundPromo.discountValue} Off)`;
        }
      }
    }

    // Convert prices to cents for Stripe
    unitAmount = Math.round(unitAmount * 100);

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

    if (planCode) {
      payload.append('metadata[planCode]', String(planCode));
    }
    if (email) {
      payload.append('metadata[email]', String(email));
    }

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

// REST API endpoint: Multi-Video Synthesis ("Knowledge Stacks")
app.post('/api/synthesize', async (req, res) => {
  const { stackName, videos } = req.body;
  if (!stackName) {
    return res.status(400).json({ error: 'Stack name is required.' });
  }
  if (!videos || !Array.isArray(videos) || videos.length < 2) {
    return res.status(400).json({ error: 'At least 2 video summaries are required for synthesis.' });
  }

  try {
    // Enforce MVP Rate Limits on server
    const usageStatus = await checkAndIncrementUsage(req);
    if (!usageStatus.allowed) {
      return res.status(429).json({
        error: usageStatus.message || 'Credit limit reached. Please insert your custom Gemini API key or Upgrade to PRO to process knowledge stacks instantly!',
        rateLimited: true,
      });
    }

    // Format individual video summaries for Gemini prompt
    const videoContents = videos.map((vid: any, index: number) => {
      const conceptsStr = vid.keyConcepts && Array.isArray(vid.keyConcepts)
        ? vid.keyConcepts.map((c: any) => `- ${c.concept}: ${c.definition}`).join('\n')
        : 'None';

      const takeawaysStr = vid.takeaways && Array.isArray(vid.takeaways)
        ? vid.takeaways.map((t: any) => `- ${t}`).join('\n')
        : 'None';

      return `---
Video #${index + 1}: "${vid.metadata?.title || 'Untitled Video'}"
Author/Channel: "${vid.metadata?.author || 'Unknown'}"
URL: "${vid.metadata?.videoUrl || ''}"

Summary Takeaways:
${takeawaysStr}

Key Concepts:
${conceptsStr}
---`;
    }).join('\n\n');

    const finalPrompt = `
You are a world-class cognitive science educational analyst and meta-knowledge synthesizer.
Your goal is to digest multiple video summaries and construct a beautiful, high-value, synthesized "Knowledge Stack" titled "${stackName}".

Below are the titles, summaries, and key concepts of the individual videos:
${videoContents}

Please perform a comprehensive cross-video synthesis and output a detailed JSON structure matching this schema:
1. summary: A beautifully written, high-fidelity synthesis of the stack (2-3 paragraphs). Connect the ideas, explain the overall meta-premise, and outline the cohesive value loop.
2. themes: Overarching global themes that connect these videos together (3-5 themes). For each, provide a "title" and a "description" detailing how the videos contribute to or explore this theme.
3. contradictions: Disagreements, conflicting perspectives, or critical differences in focus/methodology between the sources (1-3 items). If they do not explicitly contradict, describe the critical nuances or different philosophical emphases they take (e.g., Video A focuses on system design while Video B focuses on emotional execution). For each item, provide "claimA" (what video A emphasizes), "claimB" (what video B emphasizes), and "nuance" (the synthesizing resolution or critical distinction).
4. keyConcepts: A list of 3-5 advanced, high-level combined concepts across the stack. For each, provide a "concept" label, a precise academic "definition", and a "simplifiedExplanation" (using simple everyday analogies/metaphors).
5. quiz: A combined active-recall synthesis quiz (3-5 questions) testing comprehension across multiple videos (e.g., conceptual crossover questions, comparative questions). For each question, provide "question", "options" (4 options), "answerIndex" (0-based index of correct option), and a highly detailed "explanation" choice.
`;

    const config: any = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          themes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['title', 'description'],
            },
          },
          contradictions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                claimA: { type: Type.STRING },
                claimB: { type: Type.STRING },
                nuance: { type: Type.STRING },
              },
              required: ['claimA', 'claimB', 'nuance'],
            },
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
        },
        required: ['summary', 'themes', 'contradictions', 'keyConcepts', 'quiz'],
      },
    };

    const activeAi = getGeminiClient(req);
    const response = await activeAi.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: finalPrompt,
      config,
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Gemini response returned empty content.');
    }

    const result = cleanAndParseJson(outputText);
    return res.json({
      id: 'stack_' + Date.now().toString(36),
      name: stackName,
      createdAt: new Date().toISOString(),
      videoTitles: videos.map((v: any) => v.metadata?.title || 'Untitled Video'),
      ...result,
    });
  } catch (err: any) {
    console.error('Stack synthesis failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to synthesize Knowledge Stack.' });
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
I am running a productivity SaaS called "Zipytiny - Universal Video Summarizer", which summarizes any video (and audio uploads) into concise takeaways, interactive quizzes, study chapters, and audio-narrated podcasts.

Please write a highly persuasive, human-like, non-spammy cold email campaign and a 1-sentence social DM outreach script targeting potential users in this niche: "${promptInput}".
Make the subject lines irresistible. Follow standard AIDA copy structures and focus on how saving 5 hours a week summarizing video training will skyrocket their productivity. Do not use generic AI buzzwords. Keep it concise.`;
    } else {
      finalPrompt = `You are a viral YouTube Shorts, TikTok, and Instagram Reels scriptwriter. 
I want you to write a high-impact, 45-second viral short-form script based on this video content: "${promptInput}".
The script must have:
- A powerful viral hook in the first 3 seconds (addressing an exact pain point).
- Three rapid benefit points.
- A strong call-to-action to use "Zipytiny" at their website custom domain.

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
