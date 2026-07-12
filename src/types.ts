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

export interface KeyConcept {
  concept: string;
  definition: string;
  simplifiedExplanation: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface MindmapNode {
  concept: string;
  category: string;
  description: string;
}

export interface ReelScene {
  sceneNumber: number;
  durationSeconds: number;
  visualHook: string;
  voiceover: string;
  textOverlay: string;
}

export interface ReelScript {
  title: string;
  hookType: string;
  estimatedDuration: number;
  themeSuggestion: string;
  scenes: ReelScene[];
  readyMadeCaption: string;
  callToAction: string;
}

export interface TakeawayItem {
  text: string;
  lowConfidence?: boolean; // true when the model flags the claim as potentially inaccurate
}

export interface YouTubeSummaryResponse {
  metadata: YouTubeVideoMetadata;
  summary: string;
  takeaways: (string | TakeawayItem)[];
  chapters: VideoChapter[];
  blogPost: string;
  twitterThread: string[];
  socialSnippet: string;
  quiz: QuizQuestion[];
  mindmap: MindmapNode[];
  reelScript?: ReelScript;
  keyConcepts?: KeyConcept[];
  flashcards?: Flashcard[];
  rememberSummary?: string;
  learnModeEnabled?: boolean;
  shareId?: string;
}

export interface SavedSummary {
  id: string; // Video ID
  savedAt: string;
  response: YouTubeSummaryResponse;
  collection?: string; // Custom collection/folder tag
  tags?: string[];
  bookmarks?: Array<{ id: string; title: string; timestamp: string; secondsCount: number; note?: string }>;
  personalNotes?: string;
  recentlyViewedAt?: string;
  crossLinks?: string[]; // Connected workspace/video IDs
}

// =========================================================================
// LEARNING PLATFORM & RETENTION ENGINE STRUCTURAL INTERFACES
// =========================================================================

export interface MemoryConcept {
  id: string;
  concept: string;
  sourceVideoId: string;
  sourceTitle: string;
  definition: string;
  analogy: string;
  masteryLevel: number; // 0 to 100%
  status: 'Weak' | 'Strong' | 'New';
  lastTestedAt?: string;
  interval?: number; // Days until next review
  easeFactor?: number; // SM-2 ease factor
  repetitions?: number; // Number of consecutive successful reviews
  dueDate?: string; // ISO date string of next review
  tags?: string[];
  bookmarks?: boolean;
  personalNotes?: string;
  crossLinks?: string[]; // Connected concept IDs or source video IDs
  relationshipNotes?: Record<string, string>; // Description of relationship to other nodes
}

export interface VideoLearningSession {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  processedAt: string;
  duration?: string;
  progressPercent: number; // For resuming later
  completed: boolean;
  score?: number;
  totalQuestions?: number;
}

export interface DailyChallengeQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  conceptName: string;
}

export interface LearningMemoryGraph {
  concepts: Record<string, MemoryConcept>;
  sessions: Record<string, VideoLearningSession>;
  quizHistory: Array<{
    videoId: string;
    title: string;
    score: number;
    total: number;
    date: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }>;
  weakTopics: string[];
  strongTopics: string[];
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: string;
}

export interface SynthesizedStackTheme {
  title: string;
  description: string;
}

export interface SynthesizedStackContradiction {
  claimA: string;
  claimB: string;
  nuance: string;
}

export interface SynthesizedStack {
  id: string;
  name: string;
  createdAt: string;
  videoTitles: string[];
  summary: string;
  themes: SynthesizedStackTheme[];
  contradictions: SynthesizedStackContradiction[];
  keyConcepts: Array<{
    concept: string;
    definition: string;
    simplifiedExplanation: string;
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }>;
}


