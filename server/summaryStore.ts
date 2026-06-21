import { db } from './firestore';
import { YouTubeSummaryResponse } from '../src/types';

// Stored Summary Interface
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
  quizScoreBests?: { [name: string]: number };
}

// In-memory fallback
const fallbackSummaries: Record<string, StoredSummary> = {};

// Save summary of video with a unique shareId
export async function saveSummary(summary: YouTubeSummaryResponse): Promise<string> {
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const shareId = `${summary.metadata.videoId || 'vid'}_${randomSuffix}`;

  const stored: StoredSummary = {
    shareId,
    ...summary,
    savedAt: new Date().toISOString(),
  };

  if (!db) {
    fallbackSummaries[shareId] = stored;
    return shareId;
  }

  try {
    await db.collection('summaries').doc(shareId).set(stored);
    console.log(`Saved summary successfully to Firestore with shareId: ${shareId}`);
  } catch (err) {
    console.error('Firestore saveSummary failed, saving to fallback:', err);
    fallbackSummaries[shareId] = stored;
  }

  return shareId;
}

// Retrieve by shareId
export async function getSummary(shareId: string): Promise<StoredSummary | null> {
  if (!db) {
    return fallbackSummaries[shareId] || null;
  }

  try {
    const doc = await db.collection('summaries').doc(shareId).get();
    if (doc.exists) {
      return doc.data() as StoredSummary;
    }
  } catch (err) {
    console.error('Firestore getSummary failed, returning fallback if any:', err);
  }

  return fallbackSummaries[shareId] || null;
}

// List all (for sitemap / sitemap generation)
export async function listSummaries(): Promise<StoredSummary[]> {
  if (!db) {
    return Object.values(fallbackSummaries);
  }

  try {
    const snapshot = await db.collection('summaries').get();
    return snapshot.docs.map(doc => doc.data() as StoredSummary);
  } catch (err) {
    console.error('Firestore listSummaries failed, returning fallback summaries:', err);
    return Object.values(fallbackSummaries);
  }
}
