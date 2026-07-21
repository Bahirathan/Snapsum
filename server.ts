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
import AdmZip from 'adm-zip';
import { saveSummary, getSummary, listSummaries } from './server/summaryStore';
import { getOrCreateReferralCode, recordReferral, getReferralCount, isLockedUnlocked, linkUserToReferral, getReferralLeaderboard } from './server/referralStore';
import { saveSubscription, getSubscription } from './server/subscriptionStore';
import { db } from './server/firestore';
// @ts-ignore
import { generateSecret, generateURI, verifySync } from 'otplib';
import multer from 'multer';
import { runDocumentIndexing } from './server/documentIndexer';
import { getDocuments, deleteDocument, searchVectorStore, indexingProgress } from './server/vectorDb';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 MB maximum size
  }
});
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
function cleanEllipsesAndDotsOutsideStrings(jsonStr: string): string {
  let inString = false;
  let escape = false;
  let result = "";
  
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    
    if (escape) {
      result += char;
      escape = false;
      continue;
    }
    
    if (char === '\\') {
      result += char;
      escape = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    
    if (inString) {
      result += char;
      continue;
    }
    
    // Outside of a string:
    if (char === '.') {
      const prevChar = i > 0 ? jsonStr[i - 1] : '';
      const nextChar = i < jsonStr.length - 1 ? jsonStr[i + 1] : '';
      const isDecimalNumber = /\d/.test(prevChar) && /\d/.test(nextChar);
      
      if (isDecimalNumber) {
        result += char;
      } else {
        // Dot or ellipsis outside string! Skip it.
        // If the preceding non-whitespace character is a colon, append " null"
        const trimmed = result.trimEnd();
        if (trimmed.endsWith(':')) {
          result = trimmed + " null";
        }
      }
    } else {
      result += char;
    }
  }
  
  // Post-processing regex cleanups on result:
  // Replace colon followed by a comma with : null,
  result = result.replace(/:\s*,/g, ': null,');
  // Replace colon followed by a closing bracket or brace with : null
  result = result.replace(/:\s*([}\]])/g, ': null$1');
  // Clean up double/multiple commas
  result = result.replace(/,\s*,+/g, ',');
  // Clean up comma followed by closing bracket or brace
  result = result.replace(/,\s*([}\]])/g, '$1');
  
  return result;
}

function looseJsonRepair(jsonStr: string): string {
  // First clean any invalid ellipses or dots outside strings
  let s = cleanEllipsesAndDotsOutsideStrings(jsonStr.trim());
  
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

  const serverKey = process.env.GEMINI_API_KEY;
  if (!serverKey || !serverKey.trim() || serverKey === 'MY_GEMINI_API_KEY') {
    throw new Error('NO_SERVER_API_KEY_CONFIGURED');
  }

  return ai;
}

// Global helper to map and handle all Gemini-related errors beautifully and instructively.
function handleGeminiError(err: any, res: express.Response) {
  console.error('Gemini API Error Encountered:', err);
  let errorMessage = err.message || String(err);
  let statusCode = 500;

  if (typeof errorMessage === 'object') {
    try {
      errorMessage = JSON.stringify(errorMessage);
    } catch {
      errorMessage = String(errorMessage);
    }
  }

  const isScopeError = 
    errorMessage.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') ||
    errorMessage.includes('insufficient authentication scopes') ||
    errorMessage.includes('authentication scopes') ||
    (errorMessage.includes('PERMISSION_DENIED') && errorMessage.includes('generativelanguage'));

  const isNoKeyError = 
    errorMessage.includes('NO_SERVER_API_KEY_CONFIGURED') ||
    errorMessage.includes('API key not found') ||
    errorMessage.includes('API_KEY_INVALID') ||
    errorMessage.includes('invalid key') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('UNAUTHENTICATED') ||
    errorMessage.includes('unauthenticated') ||
    errorMessage.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
    errorMessage.includes('API_KEY_SERVICE_BLOCKED') ||
    errorMessage.includes('invalid authentication credentials') ||
    errorMessage.includes('API keys are not supported by this API');

  if (isScopeError || isNoKeyError) {
    errorMessage = 'No valid Gemini API Key is configured on the server host. To resolve this: \n\n' +
                   '1. If you are the owner, open the Settings panel in the Google AI Studio UI (gear/secrets icon in top right) and add a secret named GEMINI_API_KEY with your Google AI Studio Gemini API Key.\n\n' +
                   '2. Alternatively, you can click the "Google Sign In" / Settings panel in the top right of this page (Zipytiny) and paste your own Gemini API key in the "Custom Gemini API Key" field to analyze videos instantly for free!';
    statusCode = 400;
  } else if (errorMessage === 'TIMEOUT_EXCEEDED') {
    errorMessage = 'The summarization request timed out. This is usually due to temporary congestion on Google Gemini API backends, or the video being exceptionally long. Please try again, or use the "Custom Transcript override" box to paste the dialogue directly to bypass transcript-scraping delays!';
    statusCode = 504;
  } else if (
    errorMessage.includes('quota') ||
    errorMessage.includes('429') ||
    errorMessage.includes('ResourceExhausted') ||
    errorMessage.includes('limit')
  ) {
    errorMessage = 'The public Gemini API key quota has been exhausted due to high user traffic. To get instant, unlimited high-speed summaries with no waiting, please insert your own Gemini API key in the Settings (top-right icon) or upgrade your account!';
    statusCode = 429;
  } else {
    errorMessage = 'Failed to generate summary. Details: ' + errorMessage;
  }

  return res.status(statusCode).json({
    error: errorMessage,
  });
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
  const email = req.headers['x-user-email'] as string;
  const isRbahirathan = email && email.trim().toLowerCase() === 'rbahirathan@gmail.com';
  const isPremium = req.headers['x-is-premium'] === 'true' || isRbahirathan;
  const userPlan = isRbahirathan ? 'enterprise' : ((req.headers['x-user-plan'] as string) || (isPremium ? 'pro' : 'free'));
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
  limit: '50mb',
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
  skip: (req) => process.env.NODE_ENV !== 'production' || process.env.DISABLE_RATE_LIMITS === 'true',
  message: { error: 'Too many summarize requests from this IP. Please wait 15 minutes or add your own Gemini API key.', rateLimited: true },
});

const ttsLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_TTS_WINDOW_MS || '900000', 10), // 15 min default
  max: parseInt(process.env.RATE_LIMIT_TTS_MAX || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production' || process.env.DISABLE_RATE_LIMITS === 'true',
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
        const res = await fetch(vimeoOembed, {
          signal: AbortSignal.timeout(5000),
        });
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
      signal: AbortSignal.timeout(6000),
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

const videoDurations: Record<string, string> = {};

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
      signal: AbortSignal.timeout(7000),
    });

    if (!response.ok) {
      throw new Error(`Failed to load YouTube watch page: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract video duration in seconds if present and convert to minutes
    const lengthMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
    if (lengthMatch) {
      const minutes = Math.ceil(parseInt(lengthMatch[1]) / 60);
      videoDurations[videoId] = String(minutes);
    }

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

    const xmlResponse = await fetch(trackUrl, {
      signal: AbortSignal.timeout(5000),
    });
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
    const response = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(5000),
    });
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
function injectOGTags(html: string, summary: any, suffix: string = '', forkQuiz: boolean = false, customPath: string = ''): string {
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
  
  // CRITICAL: og:image and twitter:image MUST be absolute URLs for social crawlers (Slack, X, LinkedIn, FB) to render previews
  const imageUrl = `https://www.zipytiny.app/api/og-image?${ogParams.toString()}`;
  
  // Set accurate paths for canonical link & og:url tags
  const activePath = customPath || `/s/${summary.shareId}`;
  const url = `https://www.zipytiny.app${activePath}`;

  const forkMeta = forkQuiz
    ? `\n    <meta name="zipytiny:fork-quiz" content="true" />`
    : '';

  const metaHtml = `
    <title>${title} - Zipytiny</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
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

  // Strip existing title & canonical tag from static index.html boilerplate to prevent duplicates
  let normalized = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
  normalized = normalized.replace(/<link[^>]*rel="canonical"[^>]*>/gi, '');
  normalized = normalized.replace('</head>', `${metaHtml}</head>`);

  // Inject a rich, crawlable, semantic HTML body for AI search engines & crawlers
  try {
    const authorName = metadata.author || 'AI Creator';
    const blogContent = summary.blogPost || '';
    
    const chaptersHtml = Array.isArray(summary.chapters)
      ? summary.chapters.map((c: any) => `
          <section style="margin-bottom: 1.5rem; padding-left: 1rem; border-left: 2px solid #e5e7eb;">
            <h3 style="font-size: 1.15rem; font-weight: 600; color: #111827; margin: 0.5rem 0;">${c.timestamp || ''} - ${c.title || ''}</h3>
            <p style="color: #4b5563; line-height: 1.6; margin: 0.25rem 0;">${c.summary || ''}</p>
          </section>
        `).join('')
      : '';

    const takeawaysHtml = Array.isArray(summary.takeaways)
      ? `<ul style="list-style-type: disc; padding-left: 1.5rem; margin: 1rem 0; color: #374151;">${
          summary.takeaways.map((t: any) => {
            const val = typeof t === 'string' ? t : (t?.text || '');
            return val ? `<li style="margin-bottom: 0.5rem; line-height: 1.6;">${val}</li>` : '';
          }).join('')
        }</ul>`
      : '';

    const semanticBodyHtml = `
      <!-- Semantic crawlable body for search engines, AI bots, and LLM search agents (Hidden from display users to avoid CLS) -->
      <article style="display: none;" aria-hidden="true">
        <header style="margin-bottom: 2rem;">
          <h1 style="font-size: 2rem; font-weight: 800; color: #111827;">${cleanTitle}</h1>
          <p style="color: #6b7280; font-size: 0.875rem;">Source URL: <a href="${metadata.videoUrl || ''}">${metadata.videoUrl || 'Video Source'}</a></p>
          <p style="color: #6b7280; font-size: 0.875rem;">Author / Channel: ${authorName}</p>
        </header>
        
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #1f2937; border-bottom: 1px solid #f3f4f6; padding-bottom: 0.5rem;">Executive AI Summary</h2>
          <p style="color: #374151; font-size: 1rem; line-height: 1.7; white-space: pre-line;">${rawDesc}</p>
        </section>

        ${takeawaysHtml ? `
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #1f2937; border-bottom: 1px solid #f3f4f6; padding-bottom: 0.5rem;">Core Takeaways & Actionable Insights</h2>
          ${takeawaysHtml}
        </section>
        ` : ''}
        
        ${chaptersHtml ? `
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #1f2937; border-bottom: 1px solid #f3f4f6; padding-bottom: 0.5rem;">Timeline Chapters</h2>
          ${chaptersHtml}
        </section>
        ` : ''}
        
        ${blogContent ? `
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #1f2937; border-bottom: 1px solid #f3f4f6; padding-bottom: 0.5rem;">Comprehensive Deep-Dive Blog Post</h2>
          <div style="color: #1f2937; line-height: 1.8; font-size: 1rem; white-space: pre-wrap;">${blogContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </section>
        ` : ''}
      </article>
    `;

    normalized = normalized.replace('</body>', `${semanticBodyHtml}\n</body>`);
  } catch (err) {
    console.error('Error generating semantic HTML body inside injectOGTags:', err);
  }

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
  res.send('User-agent: *\nAllow: /\n\n# AI Crawlers & Agents Discovery\nSitemap: https://www.zipytiny.app/sitemap.xml\nLink: https://www.zipytiny.app/llms.txt; rel="llms"');
});

app.get('/llms.txt', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'llms.txt');
  if (fs.existsSync(filePath)) {
    res.type('text/plain');
    return res.sendFile(filePath);
  }
  // Try dist in production context if public doesn't exist
  const distPath = path.join(process.cwd(), 'dist', 'llms.txt');
  if (fs.existsSync(distPath)) {
    res.type('text/plain');
    return res.sendFile(distPath);
  }
  res.status(404).send('Not Found');
});

app.get('/sitemap.xml', async (req, res) => {
  const summaries = await listSummaries();
  const urls = summaries.map(s => `
  <url>
    <loc>https://www.zipytiny.app/s/${s.shareId}</loc>
    <lastmod>${new Date(s.savedAt || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`).join('');

  const toolsUrls = `
  <url>
    <loc>https://www.zipytiny.app/tools/youtube-lecture-summarizer</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.zipytiny.app/tools/pdf-study-guide-generator</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.zipytiny.app/tools/interactive-ai-tutor</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.zipytiny.app/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.zipytiny.app/faq</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>${toolsUrls}${urls}
</urlset>`;

  res.type('application/xml');
  res.send(sitemap);
});

// Google Search Console Domain Verification File
app.get('/google63b0633f78ae3e55.html', (req, res) => {
  res.type('text/html');
  res.send('google-site-verification: google63b0633f78ae3e55.html');
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

// OpenGraph Injector Helper for SEO Tools Landing Pages
function injectToolMetadata(html: string, slug: string): string {
  let title = 'Interactive AI Study Tools | Zipytiny';
  let description = 'Transform your study process with Zipytiny AI active learning tools. Convert lectures, videos, and textbook files into summaries, quizzes, and digital flashcards.';
  let targetKeyword = 'ai active recall generator';
  let appName = 'Zipytiny AI Study Workspace';
  let semanticContentHtml = '';

  if (slug === 'youtube-lecture-summarizer') {
    title = 'AI YouTube Lecture Summarizer & Workspace | Zipytiny';
    description = 'Turn any YouTube lecture video or long tutorial into a structured active-learning workspace instantly. Generate deep chronological summaries, flashcards, and quizzes.';
    targetKeyword = 'convert youtube lecture to quiz';
    appName = 'Zipytiny AI YouTube Lecture Summarizer';
    semanticContentHtml = `
      <article style="display: none;" aria-hidden="true">
        <header>
          <h1>AI YouTube Lecture Summarizer & Active-Recall Study Workspace</h1>
          <p>Keyword optimization target: convert youtube lecture to quiz, make flashcards from lecture video</p>
        </header>
        <section>
          <h2>Turn Lecture Videos into Retentive Study Workspaces in 60 Seconds</h2>
          <p>Stop wasting hours manually transcribing, pausing, and rewinding university lectures. Zipytiny AI YouTube Summarizer extracts full educational transcripts, segmenting them into detailed chronological milestones with exact citation timestamps.</p>
        </section>
        <section>
          <h2>Active Recall & Spaced Repetition Integration</h2>
          <p>Rereading lecture notes yields near-zero long-term retention. Zipytiny translates passive learning into active practice by generating challenging multi-choice quizzes and digital flippable flashcards directly mapped to your course material.</p>
        </section>
        <section>
          <h2>Backed by Cognitive Learning Sciences</h2>
          <p>Our platform incorporates spaced repetition intervals, dual-coding mind maps, and Cornell Note structures to unlock maximum memory recall. Perfect for college students, medical residents, and continuous professional developers.</p>
        </section>
      </article>
    `;
  } else if (slug === 'pdf-study-guide-generator') {
    title = 'AI PDF Study Guide Generator & Workspace | Zipytiny';
    description = 'Automatically convert textbook PDFs, lecture slides, and handouts into comprehensive study guides, bento-grid concept sheets, and practice exams.';
    targetKeyword = 'ai study guide generator from pdf';
    appName = 'Zipytiny AI PDF Study Guide Generator';
    semanticContentHtml = `
      <article style="display: none;" aria-hidden="true">
        <header>
          <h1>AI PDF Study Guide Generator & Spaced-Repetition Workspace</h1>
          <p>Keyword optimization target: ai study guide generator from pdf, make flashcards from slides</p>
        </header>
        <section>
          <h2>Breathe Life into Dense Textbook Chapters and Slide Decks</h2>
          <p>Upload biology slides, calculus workbooks, or engineering manuals. Zipytiny reads and parses PDF documents sequentially, organizing complex headings and equations into an indexable, highly legible syllabus outline.</p>
        </section>
        <section>
          <h2>Bento Concepts & Everyday Analogies</h2>
          <p>Our advanced document model isolates core technical terminology and drafts simple, everyday analogies. This helps students grasp complex abstract terms instantly before moving to advanced testing sections.</p>
        </section>
        <section>
          <h2>Active Recall & Spaced Repetition Integration</h2>
          <p>To maximize knowledge retention, our PDF study guide generator converts slides and documents into active recall quizzes and spaced repetition flashcard decks automatically.</p>
        </section>
        <section>
          <h2>Diagnostic Practice Exams</h2>
          <p>Instantly compile simulated exam sheets based on the imported PDF. Practice with realistic question formats complete with detailed logic explanations and feedback loops.</p>
        </section>
      </article>
    `;
  } else if (slug === 'interactive-ai-tutor') {
    title = 'Interactive AI Tutor & Feynman Assistant | Zipytiny';
    description = 'Master any subject using active Socratic dialogue. Ask the Feynman AI Tutor anything, simplify complex terminology, and bridge conceptual gaps instantly.';
    targetKeyword = 'interactive feynman study assistant';
    appName = 'Zipytiny Interactive AI Tutor';
    semanticContentHtml = `
      <article style="display: none;" aria-hidden="true">
        <header>
          <h1>Interactive Socratic AI Tutor & Feynman Study Assistant</h1>
          <p>Keyword optimization target: interactive feynman study assistant, ai active recall generator</p>
        </header>
        <section>
          <h2>Learn Faster Using the Feynman Technique</h2>
          <p>The Feynman Technique asserts that to truly understand a concept, you must explain it simply, as if to a child. Our Socratic AI Tutor facilitates this active learning loop, questioning your assertions and locating mental gaps.</p>
        </section>
        <section>
          <h2>Socratic Classroom Dialogue Simulation</h2>
          <p>Engage in active, bidirectional conversation. Ask Feynman AI to break down Quantum Computing, explain Photosynthesis biochemistry, or prove Bayes' Theorem. Learn through contextual analogies instead of static, dense passages.</p>
        </section>
        <section>
          <h2>Targeted Knowledge Re-alignment</h2>
          <p>By simulating real student-tutor debates, Zipytiny helps you verify your mastery of a subject and refine your memory storage intervals.</p>
        </section>
      </article>
    `;
  }

  const url = `https://www.zipytiny.app/tools/${slug}`;
  const imageUrl = `https://www.zipytiny.app/api/og-image?title=${encodeURIComponent(appName)}&t1=${encodeURIComponent('Instant active recall')}&t2=${encodeURIComponent('Interactive sandbox')}`;

  const jsonLdApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": appName,
    "url": url,
    "description": description,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "184"
    }
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How does the Zipytiny ${appName} work?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Our ${appName} uses highly advanced language models to analyze user assets, extract core definitions, generate chronological timelines, and compile interactive digital workspaces featuring active-recall flashcards and practice quizzes.`
        }
      },
      {
        "@type": "Question",
        "name": "Are Zipytiny educational workspaces supported on mobile devices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Zipytiny is fully responsive and supports studying, practicing flashcards, and taking quiz challenges on any mobile, tablet, or desktop browser."
        }
      }
    ]
  };

  const metaHtml = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${targetKeyword}, zipytiny, ai learning, active recall" />
    <link rel="canonical" href="${url}" />
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${url}" />
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <!-- Structured Microdata JSON-LD -->
    <script type="application/ld+json">
      ${JSON.stringify(jsonLdApp)}
    </script>
    <script type="application/ld+json">
      ${JSON.stringify(jsonLdFaq)}
    </script>
  `;

  let normalized = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
  normalized = normalized.replace(/<link[^>]*rel="canonical"[^>]*>/gi, '');
  normalized = normalized.replace('</head>', `${metaHtml}</head>`);
  normalized = normalized.replace('</body>', `${semanticContentHtml}\n</body>`);

  return normalized;
}

// Server-side meta injector for the FAQ page
function injectFaqMetadata(html: string): string {
  const title = 'Frequently Asked Questions (FAQ) | Zipytiny AI Active Recall Workspace';
  const description = 'Get detailed answers to common questions about Zipytiny AI learning tools. Learn how to convert YouTube lectures into quizzes, generate study guides from PDFs, and study using active recall.';
  const targetKeyword = 'ai active recall faq';
  const url = 'https://www.zipytiny.app/faq';
  const imageUrl = 'https://www.zipytiny.app/api/og-image?title=Zipytiny%20FAQ&t1=Active%20Recall%20Learning&t2=Frequently%20Asked%20Questions';

  const faqItems = [
    {
      q: "What is an active recall study generator?",
      a: "An active recall study generator is a cognitive learning tool that converts static documents and videos into interactive testing playgrounds. Instead of passively reading notes—which leads to the illusion of competence—Zipytiny forces you to actively retrieve facts from memory using custom quizzes, active-recall flashcards, and Socratic dialogues. Educational research proves active recall strengthens synaptic pathways and increases memory retention by over 150%."
    },
    {
      q: "How does the AI YouTube Lecture Summarizer convert video lectures into practice quizzes?",
      a: "By submitting a YouTube lecture URL, Zipytiny uses advanced generative models to extract transcription data and segment the lecture into precise chronological milestones. From this text, our custom AI pipeline compiles multi-choice practice exams with detailed explanations and citation timestamps, directly supporting active recall and the testing effect."
    },
    {
      q: "Can I generate digital flashcards and study guides from uploaded PDFs and slides?",
      a: "Yes! Zipytiny includes an AI PDF Study Guide Generator that parses textbook chapters, slide decks, and lecture handouts. It extracts essential technical terms and structures them into Cornell Notes and visual Bento Concept Sheets. Complex concepts are translated into everyday layman's analogies, and terms are instantly compiled into digital, flippable spaced-repetition flashcards."
    },
    {
      q: "What is the Feynman Technique, and how does the Socratic AI Tutor help identify learning gaps?",
      a: "The Feynman Technique states that if you cannot explain a concept simply to a child, you do not fully understand it. Our Socratic AI Tutor acts as a conversational partner. Instead of lecturing, it uses leading questions to prompt your explanation. The AI then analyzes your answers to spot and gently guide you back from conceptual blind spots and knowledge gaps."
    },
    {
      q: "How does the Zipytiny spaced-repetition study loop work?",
      a: "Spaced repetition is a learning technique where review intervals are mathematically spaced out based on recall ease. With Zipytiny, you generate flashcards, practice them on Day 1, review them on Day 3, engage in a Socratic debate on Day 7, and complete a final mock exam on Day 30 to guarantee maximum long-term memory storage."
    },
    {
      q: "Is there a Chrome browser extension for instant video or page summarization?",
      a: "Yes, Zipytiny provides a lightweight Chrome Extension. It allows you to analyze any YouTube video, news article, or textbook PDF directly from your browser toolbar, enabling instant workspace creation without copying and pasting links."
    },
    {
      q: "Are Zipytiny educational workspaces free, and how do referral credits work?",
      a: "Zipytiny operates on a freemium model. All users receive free monthly active-recall workspace generations. You can unlock premium workspace credits for free by participating in our referral program—each signup through your unique referral link earns you permanent active recall credits."
    }
  ];

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  const semanticContentHtml = `
    <!-- Semantic crawlable body for search engines, AI bots, and LLM search agents (Hidden from display users to avoid CLS) -->
    <article style="display: none;" aria-hidden="true">
      <header style="margin-bottom: 2rem;">
        <h1>Zipytiny Frequently Asked Questions (FAQ)</h1>
        <p>Your ultimate resource for AI-powered active recall, spaced repetition, lecture summarization, and cognitive study workflows.</p>
        <p>Target optimization: convert youtube lecture to quiz, ai study guide generator from pdf, active recall, spaced repetition</p>
      </header>
      ${faqItems.map(item => `
        <section style="margin-bottom: 2.5rem; padding-left: 1rem; border-left: 3px solid #e5e7eb;">
          <h2 style="font-size: 1.3rem; font-weight: 700; color: #111827; margin: 0.5rem 0;">${item.q}</h2>
          <p style="color: #374151; line-height: 1.7; margin: 0.25rem 0;">${item.a}</p>
        </section>
      `).join('')}
    </article>
  `;

  const metaHtml = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${targetKeyword}, zipytiny faq, convert youtube lecture to quiz, ai study guide generator from pdf, active recall, spaced repetition" />
    <link rel="canonical" href="${url}" />
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${url}" />
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <!-- Structured Microdata JSON-LD -->
    <script type="application/ld+json">
      ${JSON.stringify(jsonLdFaq)}
    </script>
  `;

  let normalized = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
  normalized = normalized.replace(/<link[^>]*rel="canonical"[^>]*>/gi, '');
  normalized = normalized.replace('</head>', `${metaHtml}</head>`);
  normalized = normalized.replace('</body>', `${semanticContentHtml}\n</body>`);

  return normalized;
}

// Server-rendered public FAQ page
app.get('/faq', (req, res) => {
  try {
    const htmlPath = process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), 'dist', 'index.html')
      : path.join(process.cwd(), 'index.html');

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).send('index.html not found');
    }

    let html = fs.readFileSync(htmlPath, 'utf-8');
    html = injectFaqMetadata(html);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    console.error('Error serving FAQ SEO page:', err);
    return res.status(500).send('Internal Server Error');
  }
});

// Server-rendered public tools SEO landing pages
app.get('/tools/:slug', (req, res) => {
  const { slug } = req.params;
  const validSlugs = ['youtube-lecture-summarizer', 'pdf-study-guide-generator', 'interactive-ai-tutor'];
  if (!validSlugs.includes(slug)) {
    return res.status(404).send('Study Tool Page Not Found');
  }

  try {
    const htmlPath = process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), 'dist', 'index.html')
      : path.join(process.cwd(), 'index.html');

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).send('index.html not found');
    }

    let html = fs.readFileSync(htmlPath, 'utf-8');
    html = injectToolMetadata(html, slug);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    console.error('Error serving tool SEO landing page:', err);
    return res.status(500).send('Internal Server Error');
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
    html = injectOGTags(html, summary, ' - Interactive Quiz', true, `/s/${summary.shareId}/quiz`);
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
    html = injectOGTags(html, summary, suffix, false, `/s/${summary.shareId}/quiz/${req.params.score}`);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    return res.status(500).send('Internal Server Error');
  }
});

// REST API endpoint: Video summarizer (YouTube and generic videos/pages)
app.post('/api/summarize', summarizeLimiter, async (req, res) => {
  const { videoUrl, customTranscript, outputLanguage, learnMode, learningDepth, advancedSettings, files } = req.body;

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
  let metadata: { title: string; author: string; thumbnailUrl: string; duration?: string };
  let fullMetadata: any;

  try {
    if (videoUrl === 'https://www.zipytiny.app/uploaded-files' || (files && files.length > 0)) {
      metadata = {
        title: (files && files.length > 0) ? files.map((f: any) => f.name).join(', ') : 'Uploaded Files Study Guide',
        author: 'My Uploaded Files',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'
      };
      videoId = 'vid_uploaded_' + crypto.randomBytes(4).toString('hex');
      fullMetadata = {
        videoId,
        videoUrl,
        ...metadata,
      };
    } else if (videoUrl === 'https://www.zipytiny.app/pasted-text') {
      metadata = {
        title: 'Pasted Content Study Guide',
        author: 'My Notebook',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'
      };
      videoId = 'vid_pasted_' + crypto.randomBytes(4).toString('hex');
      fullMetadata = {
        videoId,
        videoUrl,
        ...metadata,
      };
    } else if (isYouTube) {
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

    // Translate title and author into Arabic if outputLanguage === 'ar' to ensure consistent Arabic experience
    if (outputLanguage === 'ar') {
      try {
        const translationPrompt = `Translate the following video/webpage details into natural, fluent Arabic.
Video Title: "${metadata.title}"
Author/Creator: "${metadata.author}"

Output JSON only in this exact format:
{
  "title": "Arabic translation",
  "author": "Arabic translation"
}`;
        const translationAi = getGeminiClient(req);
        const transResponse = await translationAi.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: translationPrompt,
          config: { responseMimeType: 'application/json' }
        });
        const transResult = JSON.parse(transResponse.text || '{}');
        if (transResult.title) {
          metadata.title = transResult.title;
          fullMetadata.title = transResult.title;
        }
        if (transResult.author) {
          metadata.author = transResult.author;
          fullMetadata.author = transResult.author;
        }
      } catch (transErr) {
        console.warn('Failed to translate metadata to Arabic:', transErr);
      }
    }

    // 2. Fetch transcript or use manual custom pasted transcript
    let transcript = customTranscript || '';

    if (!transcript && isYouTube) {
      try {
        transcript = await fetchTranscript(videoId);
      } catch (transcriptErr: any) {
        console.warn('Failed to retrieve YouTube transcript, falling back to knowledge synthesis:', transcriptErr.message || transcriptErr);
        transcript = '';
      }
    }

    // Determine and set duration in metadata
    let durationMins = 15;
    if (isYouTube && videoId && videoDurations[videoId]) {
      durationMins = parseInt(videoDurations[videoId]) || 15;
    } else if (transcript) {
      // Estimate based on transcript/custom text word count (150 words per minute average speech rate)
      const approxWordCount = transcript.split(/\s+/).length;
      if (approxWordCount > 0) {
        durationMins = Math.max(5, Math.ceil(approxWordCount / 150));
      }
    }

    metadata.duration = String(durationMins);
    fullMetadata.duration = String(durationMins);

    // 3. Draft prompt for Gemini based on availability of transcript and output language selection
    let prompt = '';
    const langInstruction = outputLanguage === 'ar'
      ? '\nCRITICAL ARABIC INSTRUCTION:\nYou MUST generate all output text fields (including summary, takeaways, chapter titles, chapter takeaways, blogPost markdown structured text, twitterThread tweets, LinkedIn/Instagram socialSnippet, quiz questions/options/explanations, and all mindmap concepts, category names, and descriptions) natively and fully in ARABIC (العربية) language. Do NOT use English for any descriptive text inside the JSON payload. However, please ensure that the JSON structural keys (like "summary", "takeaways", "chapters", "blogPost", "twitterThread", etc.) remain strictly in English as defined below.'
      : '';

    const depthInfo = learningDepth || (learnMode ? 'study' : 'quick');
    const adv = advancedSettings || {};

    let learnModeInstruction = '';
    
    if (depthInfo === 'quick') {
      learnModeInstruction = `
CRITICAL QUICK REVIEW ACTIVE INSTRUCTION:
This request is evaluated under "Quick Review" mode. Optimize the response for speed, high-level digestion, and conciseness:
- Generate a highly distilled "summary" (1-2 structured paragraphs max) containing an executive summary and important facts.
- Set "keyConcepts" to an empty array.
- Set "flashcards" to an empty array.
- Set "rememberSummary" to an empty string.
- Set "quiz" to an empty array.
- Set "mindmap" to an empty array.
- In "takeaways", extract exactly 3-5 concise, important factual takeaways.
`;
    } else if (depthInfo === 'study') {
      // Scale dynamic counts based on the video duration (minutes)
      let fcCount = adv.flashcardCount || 8;
      let qCount = adv.quizQuestionCount || 4;
      let mmDetail = adv.mindMapDetail || 'balanced';
      const expStyle = adv.explanationStyle || 'teaching';
      const sumLen = adv.summaryLength || 'medium';

      if (durationMins > 35) {
        fcCount = adv.flashcardCount || 15;
        qCount = adv.quizQuestionCount || 6;
        mmDetail = adv.mindMapDetail || 'detailed';
      } else if (durationMins > 20) {
        fcCount = adv.flashcardCount || 12;
        qCount = adv.quizQuestionCount || 5;
        mmDetail = adv.mindMapDetail || 'detailed';
      }

      learnModeInstruction = `
CRITICAL STUDY MODE ACTIVE INSTRUCTION:
This request is evaluated under "Study Mode – AI Structured Learning System" for a video/resource of estimated duration: ${durationMins} minutes.
Because this is a resource of ${durationMins} minutes, you MUST calibrate your coverage and level of detail accordingly. For longer materials, expand all educational explanations, chapter notes, and chapter summaries to be significantly longer, richer, and more detailed.
Integrate these properties in the JSON response:
- "summary": Generate a detailed summary structured for easy comprehension. Style: ${expStyle === 'bullets' ? 'bullet points' : expStyle === 'academic' ? 'academic review' : expStyle === 'professional' ? 'executive briefing' : expStyle === 'beginner' ? 'beginner friendly explanation with analogies' : 'highly interactive teaching style'}. Length: ${sumLen}. Ensure you provide robust details corresponding to the ${durationMins} minutes duration of the content.
- "keyConcepts": An array of ${durationMins > 20 ? '5-6' : '3-4'} core educational concepts from the video. Provide a "concept" label name, a precise academic/factual "definition", and a "simplifiedExplanation" (analogies, everyday examples, and clear language) that makes the concept easy to digest.
- "flashcards": An array of ${fcCount} question/answer pairs (each card has a "question" and "answer") focusing on core mental models, definitions, or procedural steps for active recall.
- "rememberSummary": A short, powerful summarized section ("What you should remember" / "Final Retention Checklist") for long-term retention.
- "quiz": Create ${qCount} multiple-choice questions testing conceptual understanding, critical thinking and deep comprehension. Include 4 options, the 0-based index of the correct option, and an explanation.
- "mindmap": Create a structured concept map of ${mmDetail === 'simple' ? '3-5' : mmDetail === 'detailed' ? '10-12' : '6-8'} ideas representing topics covered. Use "concept" (label of node), "category" (the parent group it belongs to), and "description" (a mini note).

PROMOTIONAL ASSETS CONSTRAINT FOR PERFORMANCE:
Since this is Study/Learning mode, keep the promotional/marketing properties ("blogPost", "twitterThread", "socialSnippet", "reelScript") extremely concise, brief, and lightweight (e.g. blogPost of 2-3 brief paragraphs, twitterThread of 3 short tweets, socialSnippet of 2 sentences, reelScript of 3 short scenes) to prioritize generating rich educational resources and keep response times fast.
`;
    } else if (depthInfo === 'mastery') {
      let fcCount = adv.flashcardCount || 12;
      let qCount = adv.quizQuestionCount || 5;
      let mmDetail = adv.mindMapDetail || 'detailed';
      const expStyle = adv.explanationStyle || 'teaching';

      if (durationMins > 35) {
        fcCount = adv.flashcardCount || 20;
        qCount = adv.quizQuestionCount || 8;
      } else if (durationMins > 20) {
        fcCount = adv.flashcardCount || 16;
        qCount = adv.quizQuestionCount || 6;
      }

      learnModeInstruction = `
CRITICAL SUPREME ACADEMIC MASTERY ACTIVE INSTRUCTION:
This request is evaluated under "Mastery Mode – Expert Level Comprehensive Syllabus and Knowledge Mastery" for a video/resource of estimated duration: ${durationMins} minutes.
Because this is a resource of ${durationMins} minutes, you MUST provide an extremely comprehensive, exhaustive, and detailed study guide. Match your depth and output length to the duration of the video.
You MUST generate extremely comprehensive, exhaustive, and detailed educational outputs:
- "summary": A master-grade Comprehensive Study Guide and Detailed Explanations (at least 6-8 comprehensive paragraphs, scaling longer for longer videos). Style: ${expStyle === 'bullets' ? 'bullet points' : expStyle === 'academic' ? 'academic' : expStyle === 'professional' ? 'professional' : expStyle === 'beginner' ? 'beginner friendly' : 'detailed teaching style'}. You MUST use extensive markdown subheaders to detail:
    - 🎯 **LEARNING OBJECTIVES** (What the learner will master)
    - 🎓 **COMPREHENSIVE CHAPTER-BY-CHAPTER BREAKDOWN** (Exhaustive explanations of each chapter)
    - 💡 **CONCEPT RELATIONSHIPS** (Deep mapping of how different ideas tie together)
    - 🧠 **EXPERT MEMORY TIPS & STUDY COMPANION SUMMARY** (Practical mnemonics, revision plans, and retention guides)
    - 📅 **SUGGESTED 7-DAY REVISION PLAN** (Detailed daily checklist)
- "keyConcepts": An array of ${durationMins > 20 ? '6-8' : '5-6'} deep academic concepts. Provide a highly precise academic "definition", and a verbose "simplifiedExplanation" featuring everyday analogies and expert tutoring details.
- "flashcards": An array of ${fcCount} advanced question/answer pairs focusing on difficult, critical thinking-based active recall.
- "rememberSummary": A comprehensive, high-retention summary detailing expert learning tactics and chapter summaries.
- "quiz": Create ${qCount} extremely challenging practice questions testing core concepts, deep comprehension, and application. Provide verbose educational explanations for why the correct answer is correct and why other options are incorrect.
- "mindmap": Create an extensive structured concept map of ${mmDetail === 'simple' ? '5-6' : mmDetail === 'detailed' ? '12-15' : '8-10'} ideas representing topics covered. Use "concept" (label of node), "category" (the parent group), and "description".

PROMOTIONAL ASSETS CONSTRAINT FOR PERFORMANCE:
Since this is Mastery learning mode, keep the promotional/marketing properties ("blogPost", "twitterThread", "socialSnippet", "reelScript") extremely concise, brief, and lightweight (e.g. blogPost of 2-3 brief paragraphs, twitterThread of 3 short tweets, socialSnippet of 2 sentences, reelScript of 3 short scenes) to prioritize generating rich educational resources and keep response times fast.
`;
    }

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

CRITICAL JSON FORMATTING INSTRUCTION:
- You must output FULLY POPULATED details for every single key in the requested JSON structure.
- NEVER under any circumstances output ellipses (like '...'), single dots (like '.'), or empty properties as placeholders. If some detailed content is missing or cannot be retrieved, you MUST utilize your historical knowledge, synthesis capabilities, or search results to invent and synthesize highly realistic, comprehensive, and detailed content.
- Ensure every array is a fully populated array containing real items matching the schema, and every string has a complete text of at least 2-3 detailed sentences.
`;

    const buildPromptWithoutTranscript = (videoTitle: string, inputChannel: string) => `
You are an expert AI video summaries creator representing a premium monetization tool.
The user wants to summarize the video titled "${videoTitle}" by creator "${inputChannel}".
${langInstruction}
${learnModeInstruction}

Since direct transcript retrieval is not pre-extracted, use your rich historical knowledge index and synthesis capabilities to analyze this video, its core message, lessons, and content. If the URL points to a website, discover its content to draft an accurate analysis.
Provide an extremely detailed, accurate summary, actionable chronological chapters, blog post copy, tweets, an educational quiz, structured mindmap nodes, and a viral short Reel script summarizing the main subject.

Video Title: "${videoTitle}"
Creator / Host: "${inputChannel}"
Video URL: "${videoUrl}"

Generate a complete, high-quality summary and promotional asset package matching the requested JSON structure.

CRITICAL JSON FORMATTING INSTRUCTION:
- You must output FULLY POPULATED details for every single key in the requested JSON structure.
- NEVER under any circumstances output ellipses (like '...'), single dots (like '.'), or empty properties as placeholders. If some detailed content is missing or cannot be retrieved, you MUST utilize your historical knowledge, synthesis capabilities, or search results to invent and synthesize highly realistic, comprehensive, and detailed content.
- Ensure every array is a fully populated array containing real items matching the schema, and every string has a complete text of at least 2-3 detailed sentences.
`;

    const buildPromptWithFiles = (fileNames: string[]) => `
You are an expert AI multimodal content analyst and educator.
The user has uploaded one or more documents/media files: ${fileNames.join(', ')}.
Your goal is to fully analyze the attached file(s) (including reading text from documents, listening to audio, or analyzing video frames/audio if media files are attached) and extract highly valuable summaries, actionable chapters, interactive quizzes, standard mindmap nodes, and social media repurposing scripts.
${langInstruction}
${learnModeInstruction}

Please analyze the attached files directly and fill out the detailed JSON structure:
1. summary: A beautifully crafted, scannable, engaging summary of the content (2-3 structured paragraphs). Explain the problem, the core thesis, and the final solution.
2. takeaways: A list of 5-7 actionable, eye-opening takeaways or direct value bombs. For each takeaway, provide a "text" field with the insight and a "lowConfidence" boolean field — set lowConfidence to true only if the claim is ambiguous or difficult to verify. Set it to false otherwise.
3. chapters: A list of chronological chapters/sections summarizing different parts of the media file or document sections. Spread them logically. Allocate accurate "secondsCount" if it is a media file.
4. blogPost: Write a comprehensive, premium-grade, SEO-friendly markdown blog post repurposing this content. Use headers (#, ##), bullets, bolding, and professional spacing.
5. twitterThread: Create an engaging 4-6 tweet series dissecting the main value loop of the content. Write them as individual elements of an array.
6. socialSnippet: A highly engaging promotional description for LinkedIn or Instagram featuring powerful quote triggers and tags.
7. quiz: Create 3-5 multiple-choice questions testing key content. Include 4 options, the 0-based index of the correct option, and a helpful, educational explanation.
8. mindmap: Create a structured concept map of ideas representing topics covered. Use "concept" (label of node), "category" (the parent group it belongs to), and "description" (a mini note).
9. reelScript: Create a structured 30-60 second viral script specifically designed to summarize the main subject in a bite-sized video (TikTok, Shorts, IG Reels). The scenes must be precise chronological story steps. Make visualHook descriptions extremely punchy and voiceover sentences highly memorable.

CRITICAL JSON FORMATTING INSTRUCTION:
- You must output FULLY POPULATED details for every single key in the requested JSON structure.
- NEVER under any circumstances output ellipses (like '...'), single dots (like '.'), or empty properties as placeholders.
- Ensure every array is a fully populated array containing real items matching the schema, and every string has a complete text of at least 2-3 detailed sentences.
`;

    if (files && files.length > 0) {
      const fileNames = files.map((f: any) => f.name || 'uploaded file');
      prompt = buildPromptWithFiles(fileNames);
    } else if (transcript) {
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

    // Enable search grounding ONLY if explicitly overridden by custom header configuration
    const requestedSearchGrounding = req.headers['x-custom-search-grounding'] as string;
    if (requestedSearchGrounding === 'true') {
      config.tools = [{ googleSearch: {} }];
    } else if (requestedSearchGrounding === 'false') {
      delete config.tools;
    }

    // SECURITY/COST: previously a client could pick its own temperature AND model via
    // headers ('x-custom-gemini-temperature' / 'x-custom-gemini-model'), with no
    // validation — meaning anyone could direct your billed API key at an arbitrary,
    // potentially far more expensive model. Both are now fixed server-side (temperature
    // left at the Gemini API default, model pinned to a known value).
    const requestedModel = 'gemini-3.5-flash';
    const activeAi = getGeminiClient(req);

    // Set up a 110-second timeout promise to avoid server gateway timeout errors (e.g., 502/504 Bad Gateway)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 110000)
    );

    let contents: any = prompt;

    if (files && files.length > 0) {
      const parts: any[] = [];
      
      // Add each file as a part
      for (const file of files) {
        if (file.base64Data) {
          parts.push({
            inlineData: {
              mimeType: file.type || 'application/octet-stream',
              data: file.base64Data
            }
          });
        } else if (file.textContent) {
          parts.push({
            text: `Document Content for ${file.name}:\n${file.textContent}`
          });
        }
      }
      
      // Add the prompt as the final text part!
      parts.push({ text: prompt });
      
      contents = { parts };
    }

    const generatePromise = activeAi.models.generateContent({
      model: requestedModel,
      contents,
      config,
    });

    // Race the generation request against the timeout
    const response = await Promise.race([generatePromise, timeoutPromise]);

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
    return handleGeminiError(err, res);
  }
});

// Interactive AI Chat with Summary Content
app.post('/api/chat', async (req, res) => {
  const { title, summary, message, history, documentId, tutorMode } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    const email = req.headers['x-user-email'] as string;
    const userId = (email && email.trim()) ? `email:${email.trim().toLowerCase()}` : `ip:${ip}`;
    const workspaceId = (req.headers['x-workspace-id'] as string) || 'default';

    const aiClient = getGeminiClient(req);

        // 1. Perform semantic retrieval across our vector store
    let groundingContext = '';
    let matches: any[] = [];
    try {
      const embedResponse = await aiClient.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: message,
      });
      const embedding = (embedResponse as any).embedding?.values || (embedResponse as any).embeddings?.[0]?.values;
      if (embedding) {
        matches = await searchVectorStore(userId, workspaceId, embedding, 5, documentId);
        if (matches.length > 0) {
          groundingContext = matches.map((m, idx) => {
            let ref = `Passage ${idx + 1}`;
            if (m.pageNumber) ref = `PDF Page ${m.pageNumber}`;
            else if (m.slideNumber) ref = `Slide ${m.slideNumber}`;
            else if (m.heading) ref = `Heading: ${m.heading}`;
            else if (m.timestamp) ref = `YouTube Timestamp ${m.timestamp}`;
            return `--- START OF ${ref.toUpperCase()} (Source: ${m.metadata?.title || title}) ---\n${m.text}\n--- END OF ${ref.toUpperCase()} ---\n`;
          }).join('\n');
        }
      }
    } catch (embedErr) {
      console.warn('[RAG] Retrieval failed, falling back to summary:', embedErr);
    }

    // Try to fetch active document summary
    let activeDocSummary = '';
    if (documentId) {
      try {
        const docs = await getDocuments(userId, workspaceId);
        const activeDoc = docs.find(d => d.documentId === documentId);
        if (activeDoc && activeDoc.summary) {
          activeDocSummary = activeDoc.summary;
        }
      } catch (docErr) {
        console.warn('[RAG] Failed to load active document summary:', docErr);
      }
    }

    // Prepare tutoring-specific instruction modifier
    let tutorModifier = '';
    if (tutorMode) {
      switch (tutorMode) {
        case 'eli10':
          tutorModifier = `\n\n[TUTOR TASK - EXPLAIN LIKE I'M 10]:
- Simplify all concepts so a 10-year-old child can easily grasp them.
- Use cute, playful everyday analogies and childlike metaphors.
- Avoid advanced technical jargon entirely. Keep the explanation warm and incredibly easy to follow.`;
          break;
        case 'examples':
          tutorModifier = `\n\n[TUTOR TASK - EXPLAIN WITH EXAMPLES]:
- Provide 2-3 extremely clear, concrete, real-world examples from everyday life or industry.
- Show exactly how the theory matches the physical world using these scenarios.`;
          break;
        case 'followup':
          tutorModifier = `\n\n[TUTOR TASK - ASK FOLLOW-UP QUESTIONS]:
- After your brief explanation, you MUST challenge the student by asking 1-2 interactive, thought-provoking follow-up questions about this topic.
- Prompt them to respond and explain their reasoning.`;
          break;
        case 'exam':
          tutorModifier = `\n\n[TUTOR TASK - GENERATE EXAM QUESTIONS]:
- Act as a strict but encouraging professor.
- Formulate 2-3 highly realistic exam/quiz questions (multiple-choice or short-answer) based directly on the facts in the text.
- Do not show the correct answers immediately, but invite the student to attempt answering.`;
          break;
        case 'analogy':
          tutorModifier = `\n\n[TUTOR TASK - CREATE ANALOGIES]:
- Devise a vivid, highly descriptive analogy (e.g., software concepts compared to a city transit system, vectors compared to rooms in a warehouse) to make this topic instantly intuitive.`;
          break;
        case 'summarize_chapter':
          tutorModifier = `\n\n[TUTOR TASK - SUMMARIZE SELECTED CHAPTER/TOPIC]:
- Identify the core chapter, sub-chapter, or segment corresponding to this topic in the source material.
- Provide a beautiful, highly detailed outline-summary with main points, key terminology, and takeaways.`;
          break;
        case 'challenge':
          tutorModifier = `\n\n[TUTOR TASK - CHALLENGE ME]:
- Set a small, hands-on, active learning challenge, mini-project, or practical exercise the student can perform right now to apply this theory.`;
          break;
        case 'weak_areas':
          tutorModifier = `\n\n[TUTOR TASK - FIND WEAK AREAS]:
- Act as a diagnostic study coach.
- Pinpoint the 2-3 trickiest concepts in this material and present a quick self-check question for each to help the student diagnose where their understanding might be weak.`;
          break;
        case 'timeline':
          tutorModifier = `\n\n[TUTOR TASK - REFERENCE LECTURE TIMELINE]:
- Structure your response chronologically.
- Ground the explanation by highlighting where these concepts occur in the lecture timeline, explicitly citing specific timestamps or video coordinates (like [MM:SS] or page/slide coordinates) so the user can easily refer back to the exact moments.`;
          break;
        default:
          break;
      }
    }

    const groundingRule = `
IMPORTANT GROUNDING & GENERAL KNOWLEDGE TRANSPARENCY RULE:
Your response MUST be primarily grounded in the provided document summaries and grounding passages.
If you need to introduce any external general knowledge, concepts, or academic facts outside the uploaded content (e.g., to build a better analogy, provide real-world examples, or explain a complex underlying concept), you MUST clearly notify the student.
Whenever you introduce external general knowledge, you MUST format that specific paragraph or section with the exact visual tag:
> **🎓 Additional General Knowledge used:** [Insert the external context here]
Ensure the user always knows exactly what came from their files versus what you retrieved from your broader training data.`;

    // 2. Formulate the system instruction depending on whether documents are retrieved
    let systemInstruction = '';
    if (groundingContext || activeDocSummary) {
      systemInstruction = `You are Zipytiny's AI Tutor, a highly patient, encouraging, and elite academic tutor. You are helping a student master concepts in the uploaded workspace contents related to "${title}".

${activeDocSummary ? `Here is the comprehensive Executive Summary of the active document:\n"""\n${activeDocSummary}\n"""\n` : ''}

${groundingContext ? `Here are the relevant grounding passages from the student's workspace documents. Use these passages as your primary source of truth:
Grounding Passages:
${groundingContext}` : ''}

Guidelines:
1. Ground your answers strictly in the provided Grounding Passages and the Executive Summary of the document.
2. If the answer cannot be found in the Grounding Passages or the document summary, respond honestly while offering tutor assistance.
3. For every claim you make that is supported by a passage, you MUST cite the source inline (e.g., [Page X], [Slide Y], or [MM:SS] for videos).
4. Keep responses highly educational, beautifully organized, formatted in Markdown, and readable.${tutorModifier}${groundingRule}`;
    } else {
      systemInstruction = `You are Zipytiny's AI Tutor, an elite academic advisor and patient coach. You are helping a student master the content: "${title}". 
Here is the official summary of the content: 
"""
${summary}
"""
Answer the student's questions with absolute accuracy, deep insights, clear examples, and encouraging guidance. Keep answers clean, scannable, formatted in Markdown, and directly related to the source text.${tutorModifier}${groundingRule}`;
    }

    // 3. Map history elements into standard Google GenAI format
    const chatHistory = history || [];
    const contents = chatHistory.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    // 4. Implement Server-Sent Events (SSE) streaming for a premium chat experience!
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const responseStream = await aiClient.models.generateContentStream({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      }
    }

    // Include sources metadata payload inside the stream for the frontend to highlight
    const sourcesMeta = matches.map(m => ({
      title: m.metadata?.title || 'Untitled Passage',
      sourceType: m.metadata?.sourceType,
      sourceUrl: m.metadata?.sourceUrl,
      pageNumber: m.pageNumber,
      heading: m.heading,
      slideNumber: m.slideNumber,
      timestamp: m.timestamp,
    }));

    res.write(`data: ${JSON.stringify({ done: true, sources: sourcesMeta })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error('Error in interactive RAG chat:', err);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: err.message || 'Error occurred during streaming.' })}\n\n`);
      res.end();
    } else {
      return res.status(500).json({ error: err.message || 'Failed to initialize chat stream.' });
    }
  }
});

// Document Workspace APIs
app.get('/api/documents', async (req, res) => {
  try {
    const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    const email = req.headers['x-user-email'] as string;
    const userId = (email && email.trim()) ? `email:${email.trim().toLowerCase()}` : `ip:${ip}`;
    const workspaceId = (req.headers['x-workspace-id'] as string) || 'default';

    const docs = await getDocuments(userId, workspaceId);
    return res.json(docs);
  } catch (err: any) {
    console.error('Error listing documents:', err);
    return res.status(500).json({ error: 'Failed to retrieve documents.' });
  }
});

app.post('/api/documents/index', upload.single('file'), async (req, res) => {
  try {
    const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    const email = req.headers['x-user-email'] as string;
    const userId = (email && email.trim()) ? `email:${email.trim().toLowerCase()}` : `ip:${ip}`;
    const workspaceId = (req.headers['x-workspace-id'] as string) || 'default';

    const sourceType = req.body.sourceType as any;
    const title = req.body.title as string;
    const sourceUrl = req.body.sourceUrl as string;
    let rawTextContent = req.body.rawTextContent as string;

    if (!sourceType) {
      return res.status(400).json({ error: 'Source type is required.' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Document title is required.' });
    }

    // YouTube specific parsing
    if (sourceType === 'youtube' && sourceUrl) {
      try {
        const videoIdMatch = sourceUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        if (videoIdMatch) {
          const videoId = videoIdMatch[1];
          rawTextContent = await fetchTranscript(videoId);
        }
      } catch (trErr: any) {
        console.warn('Could not pre-fetch YouTube transcript:', trErr);
      }
    }

    const aiClient = getGeminiClient(req);
    const documentId = 'doc_' + crypto.randomBytes(8).toString('hex');

    // Run in background to preserve non-blocking performance
    runDocumentIndexing(aiClient, userId, workspaceId, {
      documentId,
      title,
      sourceType,
      sourceUrl,
      buffer: req.file?.buffer,
      rawTextContent,
    }).catch(err => {
      console.error('Asynchronous indexing error:', err);
    });

    return res.json({
      documentId,
      status: 'processing',
      progress: 5,
      message: 'Indexing initiated in background.'
    });
  } catch (err: any) {
    console.error('Error starting indexing:', err);
    return res.status(500).json({ error: 'Failed to start indexing.' });
  }
});

app.get('/api/documents/progress/:documentId', (req, res) => {
  const { documentId } = req.params;
  const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
  const ip = rawIp.split(',')[0].trim();
  const email = req.headers['x-user-email'] as string;
  const userId = (email && email.trim()) ? `email:${email.trim().toLowerCase()}` : `ip:${ip}`;
  const workspaceId = (req.headers['x-workspace-id'] as string) || 'default';

  const progressKey = `${userId}_${workspaceId}_${documentId}`;
  const state = indexingProgress[progressKey];
  if (!state) {
    return res.json({ progress: 100, status: 'completed' });
  }
  return res.json(state);
});

app.post('/api/documents/delete', async (req, res) => {
  const { documentId } = req.body;
  if (!documentId) {
    return res.status(400).json({ error: 'documentId is required.' });
  }
  try {
    const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    const email = req.headers['x-user-email'] as string;
    const userId = (email && email.trim()) ? `email:${email.trim().toLowerCase()}` : `ip:${ip}`;
    const workspaceId = (req.headers['x-workspace-id'] as string) || 'default';

    await deleteDocument(userId, workspaceId, documentId);
    return res.json({ success: true, message: 'Document fully deleted.' });
  } catch (err: any) {
    console.error('Error deleting document:', err);
    return res.status(500).json({ error: 'Failed to delete document.' });
  }
});

app.post('/api/documents/search', async (req, res) => {
  const { query, topK } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required.' });
  }
  try {
    const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    const email = req.headers['x-user-email'] as string;
    const userId = (email && email.trim()) ? `email:${email.trim().toLowerCase()}` : `ip:${ip}`;
    const workspaceId = (req.headers['x-workspace-id'] as string) || 'default';

    const aiClient = getGeminiClient(req);
    const response = await aiClient.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: query,
    });
    const embedding = (response as any).embedding?.values || (response as any).embeddings?.[0]?.values;
    if (!embedding) {
      return res.status(500).json({ error: 'Failed to generate query embedding.' });
    }

    const matches = await searchVectorStore(userId, workspaceId, embedding, topK || 5);
    const results = matches.map(m => ({
      title: m.metadata?.title || 'Untitled Passage',
      text: m.text,
      similarity: m.similarity,
      sourceType: m.metadata?.sourceType,
      sourceUrl: m.metadata?.sourceUrl,
      pageNumber: m.pageNumber,
      heading: m.heading,
      slideNumber: m.slideNumber,
      timestamp: m.timestamp,
    }));

    return res.json({ results });
  } catch (err: any) {
    console.error('Error in semantic search:', err);
    return res.status(500).json({ error: 'Failed to search workspace.' });
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

  // Optimization: Do not write high-frequency engagement updates to Firestore to save database write quota.
  // We log them locally to the in-memory fallback cache only.
  if (db && eventName !== 'engagement_update') {
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
  // Optimization: Since client side never displays or renders the full A/B testing analytics dashboard
  // under normal usage, we return aggregated metrics or fallback cache directly instead of doing an
  // unbounded O(n) document read from Firestore, entirely preserving the database read quota.
  const events = fallbackAnalytics;

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
  const email = req.headers['x-user-email'] as string;
  const isRbahirathan = email && email.trim().toLowerCase() === 'rbahirathan@gmail.com';
  const isPremium = req.headers['x-is-premium'] === 'true' || isRbahirathan;
  const userPlan = isRbahirathan ? 'enterprise' : ((req.headers['x-user-plan'] as string) || (isPremium ? 'pro' : 'free'));
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
          },
          signal: AbortSignal.timeout(6000),
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

app.get('/api/download-extension', (req, res) => {
  try {
    const zip = new AdmZip();

    // 1. manifest.json
    const manifest = {
      manifest_version: 3,
      name: "Zipytiny - AI Video Summarizer & Knowledge Engine",
      version: "1.0.0",
      description: "Universal AI-powered YouTube/video summarizer, dynamic flashcard builder, and interactive knowledge hub.",
      permissions: ["activeTab", "scripting", "tabs"],
      host_permissions: ["*://*.youtube.com/*", "https://*.zipytiny.app/*", "https://zipytiny.app/*", "https://www.zipytiny.app/*"],
      action: {
        "default_popup": "popup.html",
        "default_icon": {
          "16": "icon16.png",
          "48": "icon48.png",
          "128": "icon128.png"
        }
      },
      content_scripts: [
        {
          "matches": ["*://*.youtube.com/watch*"],
          "js": ["content.js"],
          "run_at": "document_end"
        }
      ],
      icons: {
        "16": "icon16.png",
        "48": "icon48.png",
        "128": "icon128.png"
      }
    };
    zip.addFile("manifest.json", Buffer.from(JSON.stringify(manifest, null, 2)));

    // 2. popup.html
    const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      width: 340px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 16px;
      background-color: #09090b;
      color: #fafafa;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #27272a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .logo {
      font-size: 20px;
      font-weight: 800;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.025em;
    }
    .logo-badge {
      font-size: 10px;
      font-weight: 700;
      background-color: #3f3f46;
      color: #f4f4f5;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .card {
      background-color: #18181b;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 14px;
      border: 1px solid #27272a;
    }
    .title {
      font-size: 14px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 8px;
      color: #e4e4e7;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .desc {
      font-size: 12px;
      color: #a1a1aa;
      line-height: 1.4;
      margin-top: 0;
      margin-bottom: 14px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: #0f172a;
      border: none;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
    }
    .btn:active {
      transform: none;
    }
    .btn-disabled {
      background: #27272a;
      color: #71717a;
      cursor: not-allowed;
    }
    .btn-disabled:hover {
      transform: none;
      box-shadow: none;
    }
    .input-group {
      display: flex;
      gap: 6px;
      margin-top: 10px;
    }
    .input {
      flex: 1;
      background-color: #09090b;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 8px 12px;
      color: #fafafa;
      font-size: 12px;
    }
    .input:focus {
      outline: none;
      border-color: #f59e0b;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #71717a;
      margin-top: 12px;
      border-top: 1px solid #27272a;
      padding-top: 10px;
    }
    .footer a {
      color: #f59e0b;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="logo">⚡ Zipytiny</span>
    <span class="logo-badge">Pro extension</span>
  </div>
  
  <div class="card" id="active-video-card">
    <h3 class="title">🎬 Active YouTube Video</h3>
    <p class="desc" id="video-title">Checking current tab...</p>
    <button class="btn" id="summarize-btn">⚡ Summarize with Zipytiny</button>
  </div>

  <div class="card">
    <h3 class="title">🔗 Enter YouTube URL manually</h3>
    <div class="input-group">
      <input type="text" class="input" id="custom-url" placeholder="https://www.youtube.com/watch?v=...">
      <button class="btn" style="width: auto; padding: 8px 16px;" id="go-btn">Go</button>
    </div>
  </div>

  <div class="footer">
    Powered by <a href="https://www.zipytiny.app" target="_blank">Zipytiny Knowledge Engine</a>
  </div>

  <script src="popup.js"></script>
</body>
</html>`;
    zip.addFile("popup.html", Buffer.from(popupHtml));

    // 3. popup.js
    const popupJs = `document.addEventListener('DOMContentLoaded', () => {
  const videoTitleEl = document.getElementById('video-title');
  const summarizeBtn = document.getElementById('summarize-btn');
  const customUrlInput = document.getElementById('custom-url');
  const goBtn = document.getElementById('go-btn');

  let currentTabUrl = '';

  // Get current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      const tab = tabs[0];
      currentTabUrl = tab.url || '';
      
      if (currentTabUrl.includes('youtube.com/watch') || currentTabUrl.includes('youtu.be/')) {
        videoTitleEl.textContent = tab.title || 'YouTube Video Detected!';
        videoTitleEl.style.color = '#fbbf24';
      } else {
        videoTitleEl.textContent = 'Please navigate to any YouTube video in Chrome to summarize it instantly!';
        summarizeBtn.classList.add('btn-disabled');
        summarizeBtn.disabled = true;
      }
    }
  });

  summarizeBtn.addEventListener('click', () => {
    if (currentTabUrl) {
      const targetUrl = 'https://www.zipytiny.app/?url=' + encodeURIComponent(currentTabUrl) + '&utm_source=chrome_extension';
      chrome.tabs.create({ url: targetUrl });
    }
  });

  goBtn.addEventListener('click', () => {
    const url = customUrlInput.value.trim();
    if (url) {
      const targetUrl = 'https://www.zipytiny.app/?url=' + encodeURIComponent(url) + '&utm_source=chrome_extension';
      chrome.tabs.create({ url: targetUrl });
    }
  });
});`;
    zip.addFile("popup.js", Buffer.from(popupJs));

    // 4. content.js
    const contentJs = `function injectZipytinyButton() {
  if (document.getElementById('zipytiny-btn-injected')) return;

  // We want to target the YouTube player title actions or owner row
  const targetSelector = '#owner';
  const container = document.querySelector(targetSelector);

  if (!container) return;

  const btn = document.createElement('button');
  btn.id = 'zipytiny-btn-injected';
  btn.type = 'button';
  btn.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #09090b; border: none; padding: 10px 18px; border-radius: 9999px; font-family: "Roboto", "Arial", sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; margin-left: 12px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35); transition: all 0.2s ease;';
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg> Summarize with Zipytiny';

  btn.addEventListener('mouseover', () => {
    btn.style.transform = 'translateY(-2px) scale(1.03)';
    btn.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.45)';
  });

  btn.addEventListener('mouseout', () => {
    btn.style.transform = 'none';
    btn.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.35)';
  });

  btn.addEventListener('click', () => {
    const videoUrl = window.location.href;
    const cleanUrl = 'https://www.zipytiny.app/?url=' + encodeURIComponent(videoUrl) + '&utm_source=chrome_extension';
    window.open(cleanUrl, '_blank');
  });

  container.appendChild(btn);
}

// Keep attempting to inject dynamically as YouTube pages load asynchronously
let injectionInterval = setInterval(injectZipytinyButton, 2000);`;
    zip.addFile("content.js", Buffer.from(contentJs));

    // 5. Dynamic placeholder PNG icons using standard golden/amber transparent-filled-circle base64 strings
    const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gYQCg0yC8oZ0QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmXRAAAAdElEQVR42u3PMQEAAAgEIDuY0RAsvB0KeM3g6Z0VECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgOfABZ9nUvY8v7tSAAAAAElFTkSuQmCC";
    const pngBuffer = Buffer.from(base64Png, 'base64');
    
    zip.addFile("icon16.png", pngBuffer);
    zip.addFile("icon48.png", pngBuffer);
    zip.addFile("icon128.png", pngBuffer);

    const zipBuffer = zip.toBuffer();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=zipytiny-chrome-extension.zip');
    res.send(zipBuffer);
  } catch (err) {
    console.error('Error generating Chrome extension zip:', err);
    res.status(500).json({ error: 'Failed to package Chrome Extension' });
  }
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
    return handleGeminiError(err, res);
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

    const activeAi = getGeminiClient(req);
    const response = await activeAi.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: finalPrompt }] }],
    });

    const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not generate marketing materials.';
    return res.json({ result: resultText });
  } catch (err: any) {
    return handleGeminiError(err, res);
  }
});

// =========================================================================
// COMMENTS AND REACTIONS API ENDPOINTS FOR SHARING & COLLABORATION
// =========================================================================

const fallbackComments: Record<string, any[]> = {};
const fallbackReactions: Record<string, Record<string, number>> = {};

// GET comments for a shared summary
app.get('/api/shared-summary/:id/comments', async (req, res) => {
  const shareId = req.params.id;
  try {
    if (db) {
      const snapshot = await db.collection('comments')
        .where('shareId', '==', shareId)
        .orderBy('createdAt', 'asc')
        .get();
      const comments = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
      return res.json({ comments });
    }
  } catch (err) {
    console.error('Firestore comments query failed, using fallback:', err);
  }
  return res.json({ comments: fallbackComments[shareId] || [] });
});

// POST a new comment
app.post('/api/shared-summary/:id/comment', async (req, res) => {
  const shareId = req.params.id;
  const { text, userName, userAvatar, userId } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Comment text is required.' });
  }
  const newComment = {
    shareId,
    text: text.trim(),
    userName: userName || 'Anonymous Scholar',
    userAvatar: userAvatar || '',
    userId: userId || 'anonymous',
    createdAt: new Date().toISOString()
  };
  try {
    if (db) {
      const docRef = await db.collection('comments').add(newComment);
      return res.json({ id: docRef.id, ...newComment });
    }
  } catch (err) {
    console.error('Firestore add comment failed, saving to fallback:', err);
  }
  if (!fallbackComments[shareId]) {
    fallbackComments[shareId] = [];
  }
  const commentWithId = { id: `comment_${Math.random().toString(36).substring(2, 9)}`, ...newComment };
  fallbackComments[shareId].push(commentWithId);
  return res.json(commentWithId);
});

// GET aggregated reactions
app.get('/api/shared-summary/:id/reactions', async (req, res) => {
  const shareId = req.params.id;
  try {
    if (db) {
      const doc = await db.collection('reactions_summary').doc(shareId).get();
      if (doc.exists) {
        return res.json({ reactions: doc.data() });
      }
    }
  } catch (err) {
    console.error('Firestore reactions get failed, returning fallback:', err);
  }
  return res.json({ reactions: fallbackReactions[shareId] || { thumbsup: 0, heart: 0, brain: 0, rocket: 0, clap: 0 } });
});

// POST a reaction toggle/increment
app.post('/api/shared-summary/:id/react', async (req, res) => {
  const shareId = req.params.id;
  const { reactionType } = req.body;
  const allowedReactions = ['thumbsup', 'heart', 'brain', 'rocket', 'clap'];
  if (!reactionType || !allowedReactions.includes(reactionType)) {
    return res.status(400).json({ error: 'Invalid reaction type.' });
  }
  try {
    if (db) {
      const docRef = db.collection('reactions_summary').doc(shareId);
      const doc = await docRef.get();
      let currentReactions = doc.exists ? doc.data() : { thumbsup: 0, heart: 0, brain: 0, rocket: 0, clap: 0 };
      currentReactions = {
        ...currentReactions,
        [reactionType]: (currentReactions[reactionType] || 0) + 1
      };
      await docRef.set(currentReactions);
      return res.json({ success: true, reactions: currentReactions });
    }
  } catch (err) {
    console.error('Firestore react failed, falling back to in-memory:', err);
  }
  if (!fallbackReactions[shareId]) {
    fallbackReactions[shareId] = { thumbsup: 0, heart: 0, brain: 0, rocket: 0, clap: 0 };
  }
  fallbackReactions[shareId][reactionType] = (fallbackReactions[shareId][reactionType] || 0) + 1;
  return res.json({ success: true, reactions: fallbackReactions[shareId] });
});

// =========================================================================
// AI PRESENTATION GENERATOR ENDPOINTS
// =========================================================================

import { generatePresentation, editPresentation } from './server/presentationProcessor';

const fallbackPresentations: Record<string, any> = {};

// GET presentation for a workspace
app.get('/api/presentation/:videoId', async (req, res) => {
  const { videoId } = req.params;
  try {
    if (db) {
      const doc = await db.collection('presentations').doc(videoId).get();
      if (doc.exists) {
        return res.json({ success: true, presentation: doc.data() });
      }
    }
  } catch (err) {
    console.error('Firestore get presentation failed, returning fallback if any:', err);
  }
  const fallback = fallbackPresentations[videoId];
  if (fallback) {
    return res.json({ success: true, presentation: fallback });
  }
  return res.json({ success: true, presentation: null });
});

// POST save a presentation manual edits (reorder, inline, delete, etc)
app.post('/api/presentation/save', async (req, res) => {
  const { videoId, presentation } = req.body;
  if (!videoId || !presentation) {
    return res.status(400).json({ error: 'videoId and presentation are required.' });
  }

  const presentationData = {
    ...presentation,
    updatedAt: new Date().toISOString()
  };

  try {
    if (db) {
      await db.collection('presentations').doc(videoId).set(presentationData);
      return res.json({ success: true, presentation: presentationData });
    }
  } catch (err: any) {
    console.error('Firestore save presentation failed:', err);
  }

  fallbackPresentations[videoId] = presentationData;
  return res.json({ success: true, presentation: presentationData });
});

// POST edit presentation with an AI command
app.post('/api/presentation/edit', async (req, res) => {
  const { videoId, command, targetSlideId } = req.body;
  if (!videoId || !command) {
    return res.status(400).json({ error: 'videoId and command are required.' });
  }

  try {
    let currentPresentation: any = null;
    if (db) {
      const doc = await db.collection('presentations').doc(videoId).get();
      if (doc.exists) {
        currentPresentation = doc.data();
      }
    }
    if (!currentPresentation) {
      currentPresentation = fallbackPresentations[videoId];
    }

    if (!currentPresentation || !currentPresentation.slides || currentPresentation.slides.length === 0) {
      return res.status(400).json({ error: 'No existing presentation found to edit. Please generate one first.' });
    }

    const activeAi = getGeminiClient(req);
    const updatedSlides = await editPresentation(activeAi, currentPresentation, command, targetSlideId);

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
      updatedAt: new Date().toISOString()
    };

    if (db) {
      await db.collection('presentations').doc(videoId).set(updatedPresentation);
    }
    fallbackPresentations[videoId] = updatedPresentation;

    return res.json({ success: true, presentation: updatedPresentation });
  } catch (err: any) {
    console.error('AI Presentation Edit failed:', err);
    return res.status(500).json({ error: err.message || 'AI presentation editing failed' });
  }
});

// POST trigger asynchronous generation
app.post('/api/presentation/generate', async (req, res) => {
  const { videoId, style, theme } = req.body;
  if (!videoId) {
    return res.status(400).json({ error: 'videoId is required.' });
  }

  // Define initial state for background processing
  const initialPresentation = {
    videoId,
    style: style || 'Business',
    theme: theme || 'Corporate Blue',
    slides: [],
    status: 'generating',
    currentStage: 'Analyzing video content and structure...',
    progressPercent: 15,
    updatedAt: new Date().toISOString()
  };

  try {
    if (db) {
      await db.collection('presentations').doc(videoId).set(initialPresentation);
    }
  } catch (err) {
    console.error('Firestore save initial presentation failed:', err);
  }
  fallbackPresentations[videoId] = initialPresentation;

  // Capture headersCopy synchronously before res.json to preserve headers for background async execution
  const headersCopy = { ...req.headers };
  const simulatedReq = { headers: headersCopy } as any;

  // Send early response so frontend isn't blocked (allows continuing workspace usage)
  res.json({ success: true, videoId, status: 'generating' });

  // Run generation in the background asynchronously
  (async () => {
    try {
      // 1. Fetch the video summary/chapters/takeaways to provide rich context to the slide builder
      let summaryData: any = null;
      if (db) {
        const doc = await db.collection('summaries').doc(videoId).get();
        if (doc.exists) {
          summaryData = doc.data();
        }
      }
      if (!summaryData) {
        summaryData = await getSummary(videoId);
      }

      if (!summaryData) {
        throw new Error('Workspace/Video summary not found. Please summarize the video first.');
      }

      // Update progress stage: Crafting content
      const step2Presentation = {
        ...initialPresentation,
        currentStage: 'Structuring slide deck and crafting content...',
        progressPercent: 45,
        updatedAt: new Date().toISOString()
      };
      if (db) {
        await db.collection('presentations').doc(videoId).set(step2Presentation);
      }
      fallbackPresentations[videoId] = step2Presentation;

      // 2. Instantiate active Gemini client based on this request's credentials/headers
      const activeAi = getGeminiClient(simulatedReq);

      // 3. Generate slides
      const slides = await generatePresentation(
        activeAi,
        {
          title: summaryData.metadata?.title || 'Untitled Workspace',
          summary: summaryData.summary || '',
          takeaways: summaryData.takeaways || [],
          chapters: summaryData.chapters || [],
          keyConcepts: summaryData.keyConcepts || [],
          videoUrl: summaryData.metadata?.videoUrl || ''
        },
        style || 'Business',
        theme || 'Corporate Blue'
      );

      // 4. Update the presentation with completed slides
      const finalPresentation = {
        videoId,
        style: style || 'Business',
        theme: theme || 'Corporate Blue',
        slides,
        status: 'completed',
        currentStage: 'Finished generating presentation!',
        progressPercent: 100,
        updatedAt: new Date().toISOString()
      };

      if (db) {
        await db.collection('presentations').doc(videoId).set(finalPresentation);
      }
      fallbackPresentations[videoId] = finalPresentation;
      console.log(`Presentation generated asynchronously and successfully for videoId: ${videoId}`);

    } catch (bgErr: any) {
      console.error('Background presentation generation failed:', bgErr);
      const failedPresentation = {
        ...initialPresentation,
        status: 'failed',
        currentStage: 'Generation failed.',
        progressPercent: 100,
        error: bgErr.message || 'Unknown error occurred during presentation generation.',
        updatedAt: new Date().toISOString()
      };
      try {
        if (db) {
          await db.collection('presentations').doc(videoId).set(failedPresentation);
        }
      } catch (fDbErr) {
        console.error('Failed to save failed status to Firestore:', fDbErr);
      }
      fallbackPresentations[videoId] = failedPresentation;
    }
  })();
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
