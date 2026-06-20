import fs from 'fs';
import path from 'path';
import { YouTubeSummaryResponse } from '../src/types';

const STORE_FILE = path.join(process.cwd(), 'summaries.json');

// Interface to wrap stored summaries
export interface StoredSummary {
  shareId: string;
  metadata: {
    title: string;
    author: string;
    thumbnailUrl: string;
    videoUrl: string;
    videoId: string;
    duration?: string;
  };
  summary: string;
  takeaways: string[];
  chapters: any[];
  blogPost: string;
  twitterThread: string[];
  socialSnippet: string;
  quiz: any[];
  mindmap: any[];
  savedAt: string;
  // B) Challenge data: support score-bearing challenges
  quizScoreBests?: { [name: string]: number }; // tracks guest challenges later
}

// Read helper
export function readSummaries(): Record<string, StoredSummary> {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify({}), 'utf-8');
      return {};
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (error) {
    console.error('Failed to read summaries.json:', error);
    return {};
  }
}

// Write helper
export function writeSummaries(data: Record<string, StoredSummary>) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to summaries.json:', error);
  }
}

// Save summary of video with a unique shareId
export function saveSummary(summary: YouTubeSummaryResponse): string {
  const store = readSummaries();
  // We can use videoId as the template, combined with a unique suffix or just videoId itself
  // But let's generate a unique share ID (like 8-char random alphanumeric) so separate shares exist
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const shareId = `${summary.metadata.videoId || 'vid'}_${randomSuffix}`;

  const stored: StoredSummary = {
    shareId,
    ...summary,
    savedAt: new Date().toISOString(),
  };

  store[shareId] = stored;
  writeSummaries(store);
  return shareId;
}

// Retrieve by shareId
export function getSummary(shareId: string): StoredSummary | null {
  const store = readSummaries();
  return store[shareId] || null;
}

// List all (for sitemap / debug)
export function listSummaries(): StoredSummary[] {
  const store = readSummaries();
  return Object.values(store);
}
