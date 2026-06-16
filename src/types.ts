/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface YouTubeVideoMetadata {
  videoId: string;
  videoUrl: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  duration?: string;
}

export interface VideoChapter {
  timestamp: string;
  secondsCount: number;
  title: string;
  takeaway: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface MindmapNode {
  concept: string;
  category: string;
  description: string;
}

export interface YouTubeSummaryResponse {
  metadata: YouTubeVideoMetadata;
  summary: string;
  takeaways: string[];
  chapters: VideoChapter[];
  blogPost: string;
  twitterThread: string[];
  socialSnippet: string;
  quiz: QuizQuestion[];
  mindmap: MindmapNode[];
}

export interface SavedSummary {
  id: string; // Video ID
  savedAt: string;
  response: YouTubeSummaryResponse;
}
