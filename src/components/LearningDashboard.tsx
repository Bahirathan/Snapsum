/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  BookOpen, 
  Network, 
  Video, 
  Check, 
  CheckCircle, 
  HelpCircle, 
  ArrowRight, 
  Zap, 
  History, 
  RotateCcw,
  Sparkles,
  Play,
  Bookmark,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Lightbulb,
  Award,
  ChevronRight,
  RefreshCw,
  Star,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  YouTubeSummaryResponse, 
  LearningMemoryGraph, 
  MemoryConcept, 
  VideoLearningSession,
  QuizQuestion,
  DailyChallengeQuestion
} from '../types';

// =========================================================================
// DEFAULT DATA FOR BOOTSTRAPPING USER KNOWLEDGE GRAPH (AESTHETIC FILLER)
// =========================================================================

const RECTIFY_SAMPLE_SESSIONS: Record<string, VideoLearningSession> = {
  'UF8uR6Z6KLc': {
    videoId: 'UF8uR6Z6KLc',
    title: 'Steve Jobs: 2005 Stanford Commencement Address',
    thumbnailUrl: 'https://img.youtube.com/vi/UF8uR6Z6KLc/maxresdefault.jpg',
    processedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(),
    duration: '15 mins',
    progressPercent: 65,
    completed: false
  },
  'qp0HIF3SfI4': {
    videoId: 'qp0HIF3SfI4',
    title: 'Simon Sinek: How Great Leaders Inspire Action (The Golden Circle)',
    thumbnailUrl: 'https://img.youtube.com/vi/qp0HIF3SfI4/maxresdefault.jpg',
    processedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toLocaleDateString(),
    duration: '18 mins',
    progressPercent: 100,
    completed: true,
    score: 2,
    totalQuestions: 2
  }
};

const RECTIFY_SAMPLE_CONCEPTS: Record<string, MemoryConcept> = {
  'Connecting-Dots': {
    id: 'Connecting-Dots',
    concept: 'Connecting the Dots',
    sourceVideoId: 'UF8uR6Z6KLc',
    sourceTitle: 'Steve Jobs: Stanford Address',
    definition: 'Trusting that the diverse, seemingly random activities and challenges you pursue will eventually harmonize in your future.',
    analogy: 'Like taking a calligraphy class that seemed completely useless at college, but ten years later provided the exact typography blueprint for the Macintosh.',
    masteryLevel: 45,
    status: 'Weak'
  },
  'Golden-Circle': {
    id: 'Golden-Circle',
    concept: 'The Inside-Out Golden Circle',
    sourceVideoId: 'qp0HIF3SfI4',
    sourceTitle: 'Simon Sinek: Golden Circle',
    definition: 'A three-layer behavioral communication matrix asserting that inspirational messaging must begin with Why (Purpose), and proceed outward.',
    analogy: 'Rather than selling someone a car based on horsepower specs (What), selling them on the promise of unbound individual freedom and speed (Why).',
    masteryLevel: 85,
    status: 'Strong'
  },
  'Limbic-Lattice': {
    id: 'Limbic-Lattice',
    concept: 'Biology of Decision Making',
    sourceVideoId: 'qp0HIF3SfI4',
    sourceTitle: 'Simon Sinek: Golden Circle',
    definition: 'Neurobiological overlap explaining how Why and How appeal directly to the emotional and behavioral centers of the human brain (limbic core).',
    analogy: 'Like buying a specific brand of jacket because of how it makes you feel when wearing it, then looking up logic specs to justify your purchase.',
    masteryLevel: 40,
    status: 'Weak'
  },
  'Creative-Rebirth': {
    id: 'Creative-Rebirth',
    concept: 'Creative Resilience (Love & Loss)',
    sourceVideoId: 'UF8uR6Z6KLc',
    sourceTitle: 'Steve Jobs: Stanford Address',
    definition: 'Understanding that severe setbacks, like being fired or failing publicly, can strip away comfort and spark an incredibly creative rebirth.',
    analogy: 'Like a pruning shears cutting a branch back. It looks like destruction, but the next season brings twice as many blossoms and fruit.',
    masteryLevel: 90,
    status: 'Strong'
  }
};

const DEFAULT_DAILY_CHALLENGES: DailyChallengeQuestion[] = [
  {
    question: "According to Steve Jobs' Stanford address, why is it impossible to connect the dots of your life looking forward?",
    options: [
      "Because human intuition is naturally flawed and unpredictable.",
      "Because you can only recognize the value and synergy of life events in hindsight.",
      "Because modern technology moves too quickly to make accurate plans.",
      "Because career advice from academic institutions is usually outdated."
    ],
    answerIndex: 1,
    explanation: "Steve Jobs states that you cannot connect the dots looking forward; you can only connect them looking backward. You have to trust that the dots will somehow connect in your future.",
    conceptName: "Trust and Intuition"
  },
  {
    question: "Which layer of Simon Sinek's Golden Circle corresponds directly to the human neocortex?",
    options: [
      "The 'Why' (Core Purpose)",
      "The 'What' (Rational Features / Language)",
      "The 'How' (Secret Process)",
      "None of the above"
    ],
    answerIndex: 1,
    explanation: "The neocortex parses language, numbers, and logical details, aligning directly with the outer 'What' layer, whereas emotional choices are generated in the inner limbic core.",
    conceptName: "Neurological Anatomy"
  }
];

// =========================================================================
// SERVICE LAYER FOR MEMORY GRAPH CRUD & SYNC
// =========================================================================

export function loadMemoryGraph(): LearningMemoryGraph {
  try {
    const raw = localStorage.getItem('snapsum_memory_graph_v2');
    if (raw) {
      const graph = JSON.parse(raw);
      if (graph && graph.concepts && Object.keys(graph.concepts).length > 0) {
        return graph;
      }
    }
  } catch (e) {
    console.error('Error parsing memory graph from localStorage:', e);
  }

  // Bootstrap initial state
  const initial: LearningMemoryGraph = {
    concepts: RECTIFY_SAMPLE_CONCEPTS,
    sessions: RECTIFY_SAMPLE_SESSIONS,
    quizHistory: [
      { videoId: 'qp0HIF3SfI4', title: 'Simon Sinek: Golden Circles', score: 3, total: 3, date: '21 Jun', difficulty: 'Medium' },
      { videoId: 'UF8uR6Z6KLc', title: 'Steve Jobs: Connecting Dots', score: 2, total: 3, date: '22 Jun', difficulty: 'Medium' }
    ],
    weakTopics: ['Biology of Decision Making', 'Connecting the Dots'],
    strongTopics: ['The Inside-Out Golden Circle', 'Creative Resilience (Love & Loss)'],
    xp: 540,
    level: 2,
    streak: 6,
    lastActiveDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
  };
  saveMemoryGraph(initial);
  return initial;
}

export function saveMemoryGraph(graph: LearningMemoryGraph) {
  try {
    localStorage.setItem('snapsum_memory_graph_v2', JSON.stringify(graph));
    // Also save simple states for backward compatibility with App.tsx
    localStorage.setItem('snapsum_user_xp', String(graph.xp));
    localStorage.setItem('snapsum_user_level', String(graph.level));
    localStorage.setItem('snapsum_user_streak', String(graph.streak));
    localStorage.setItem('snapsum_weak_topics', JSON.stringify(graph.weakTopics));
    localStorage.setItem('snapsum_strong_topics', JSON.stringify(graph.strongTopics));
  } catch (e) {
    console.error('Error saving memory graph:', e);
  }
}

// =========================================================================
// 1. LEARNING PROGRESS DASHBOARD (REPLACES HOME PAGE IN LEARN MODE)
// =========================================================================

interface LearningProgressDashboardProps {
  onLoadVideo: (videoId: string, isSummary: boolean) => void;
  onActivateDemo: (response: YouTubeSummaryResponse) => void;
}

export function LearningProgressDashboard({ onLoadVideo, onActivateDemo }: LearningProgressDashboardProps) {
  const [graph, setGraph] = useState<LearningMemoryGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<MemoryConcept | null>(null);
  const [dailyCompleted, setDailyCompleted] = useState<boolean>(false);
  const [dailyChoice, setDailyChoice] = useState<number | null>(null);
  const [dailySubmitted, setDailySubmitted] = useState<boolean>(false);
  const [currentDaily, setCurrentDaily] = useState<DailyChallengeQuestion | null>(null);
  const [activeRevisionConcept, setActiveRevisionConcept] = useState<MemoryConcept | null>(null);
  const [revisionTypedAnswer, setRevisionTypedAnswer] = useState<string>('');
  const [revisionFeedback, setRevisionFeedback] = useState<string | null>(null);

  // Sync graph state
  useEffect(() => {
    const loaded = loadMemoryGraph();
    
    // Check streaks & last active date
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (loaded.lastActiveDate && loaded.lastActiveDate !== today) {
      if (loaded.lastActiveDate !== yesterday) {
        // Streak broken
        loaded.streak = 1;
      }
      loaded.lastActiveDate = today;
      saveMemoryGraph(loaded);
    }
    
    setGraph(loaded);

    // Load custom Daily Challenge question by picking from array based on day
    const dayIndex = new Date().getDate() % DEFAULT_DAILY_CHALLENGES.length;
    setCurrentDaily(DEFAULT_DAILY_CHALLENGES[dayIndex]);

    // Check if daily challenge completed today
    const doneToday = localStorage.getItem('snapsum_daily_done_' + today) === 'true';
    setDailyCompleted(doneToday);
  }, []);

  if (!graph || !currentDaily) return null;

  const conceptsArray = Object.values(graph.concepts) as MemoryConcept[];
  const sessionsArray = Object.values(graph.sessions) as VideoLearningSession[];

  const topicsMastered = conceptsArray.filter(c => c.masteryLevel >= 70).length;
  const totalConceptsCount = Object.keys(graph.concepts).length;
  const overallComprehensionProgress = totalConceptsCount > 0 
    ? Math.round((conceptsArray.reduce((acc, c) => acc + c.masteryLevel, 0) / (totalConceptsCount * 100)) * 100) 
    : 0;

  // Handle XP award helper
  const awardXpPoints = (amount: number, updatedGraph: LearningMemoryGraph) => {
    const nextXp = updatedGraph.xp + amount;
    updatedGraph.xp = nextXp;
    
    // Math level up: 500 XP per level
    const nextLevel = Math.floor(nextXp / 500) + 1;
    if (nextLevel > updatedGraph.level) {
      updatedGraph.level = nextLevel;
      // Trigger simple pop
    }
    saveMemoryGraph(updatedGraph);
    setGraph({ ...updatedGraph });
  };

  const handleClaimDailyChallenge = () => {
    if (dailyChoice === null || dailySubmitted) return;
    setDailySubmitted(true);
    
    const isCorrect = dailyChoice === currentDaily.answerIndex;
    const todayStr = new Date().toDateString();

    if (isCorrect) {
      const g = { ...graph };
      g.streak += 1;
      localStorage.setItem('snapsum_daily_done_' + todayStr, 'true');
      setDailyCompleted(true);
      awardXpPoints(150, g);
    } else {
      // Just flag completion with normal study update
    }
  };

  // Find last unfinished session for "Continue Learning"
  const unfinishedSessions = sessionsArray.filter(s => s && !s.completed);
  const lastUnfinishedSession = unfinishedSessions.length > 0 
    ? unfinishedSessions[0] 
    : sessionsArray[0]; // fallback to first session

  // Revision check submit handler
  const handleRevisionTestSubmit = () => {
    if (!activeRevisionConcept) return;
    if (revisionTypedAnswer.trim().length < 5) {
      setRevisionFeedback("Please expand your answer slightly (minimum 5 characters) to demonstrate retention focus!");
      return;
    }
    
    const g = { ...graph };
    const updatedConcept = { ...activeRevisionConcept };
    const prevMastery = updatedConcept.masteryLevel;
    updatedConcept.masteryLevel = Math.min(updatedConcept.masteryLevel + 25, 100);
    updatedConcept.status = updatedConcept.masteryLevel >= 70 ? 'Strong' : 'Weak';
    
    g.concepts[updatedConcept.id] = updatedConcept;
    
    const revisedConceptsArray = Object.values(g.concepts) as MemoryConcept[];
    // Recalculate weak & strong list
    g.weakTopics = revisedConceptsArray.filter(c => c.masteryLevel < 70).map(c => c.concept);
    g.strongTopics = revisedConceptsArray.filter(c => c.masteryLevel >= 70).map(c => c.concept);

    setRevisionFeedback(`✨ Correct Synthesis! Topic knowledge restored: ${prevMastery}% ➔ ${updatedConcept.masteryLevel}% Mastery. Awarded +80 XP points.`);
    awardXpPoints(80, g);
  };

  return (
    <div className="space-y-8 text-neutral-900 border-neutral-200">
      
      {/* HEADER SUMMARY METRICS MATRICES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
        
        {/* Streak Score Card */}
        <div className="bg-gradient-to-br from-[#1d1d1f] to-[#2d2d2f] text-white p-5 rounded-3xl md:col-span-1 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-36 border border-white/5">
          <div className="absolute top-[-20%] right-[-10%] w-28 h-28 bg-[#bf5af2]/5 blur-2xl rounded-full"></div>
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#86868b] uppercase">Learning Streak</span>
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
          </div>
          <div className="mt-3 text-left z-10">
            <span className="text-3xl font-display font-bold font-mono text-white">{graph.streak}</span>
            <span className="text-xs text-neutral-400 font-light block mt-1">days active learning platform</span>
          </div>
          <div className="border-t border-white/10 pt-2 text-[10px] text-neutral-400 text-left flex items-center gap-1 font-mono">
            <span>Next session claimable today</span>
          </div>
        </div>

        {/* Global XP & Level Gauges */}
        <div className="bg-white border border-black/[0.04] p-5 rounded-3xl md:col-span-1 shadow-sm flex flex-col justify-between min-h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#86868b] uppercase">User Experience XP</span>
            <Award className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="my-2 text-left">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-neutral-950">{graph.xp}</span>
              <span className="text-xs text-neutral-400 uppercase font-mono font-bold">lvl {graph.level}</span>
            </div>
            
            {/* ProgressBar */}
            <div className="w-full bg-neutral-100 h-2 rounded-full mt-2 overflow-hidden border border-black/[0.02]">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-700"
                style={{ width: `${((graph.xp % 500) / 500) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[9px] text-[#86868b] font-light text-left leading-normal font-sans">
            {500 - (graph.xp % 500)} XP to lock in Comprehension Master
          </div>
        </div>

        {/* Comprehension Mastery Ratio */}
        <div className="bg-white border border-black/[0.04] p-5 rounded-3xl md:col-span-1 shadow-sm flex flex-col justify-between min-h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#86868b] uppercase">Global Mastery</span>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="mt-2 text-left">
            <span className="text-3xl font-display font-bold font-mono text-neutral-950">{overallComprehensionProgress}%</span>
            <span className="text-xs text-[#86868b] font-light block mt-1">weighted concept retention rate</span>
          </div>
          <span className="text-[10px] text-emerald-600 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-md font-mono self-start">
            {topicsMastered} of {totalConceptsCount} nodes strong
          </span>
        </div>

        {/* Content Coverage Meter */}
        <div className="bg-white border border-black/[0.04] p-5 rounded-3xl md:col-span-1 shadow-sm flex flex-col justify-between min-h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#86868b] uppercase">Processed Catalog</span>
            <Video className="w-5 h-5 text-[#86868b]" />
          </div>
          <div className="mt-1 text-left">
            <span className="text-3xl font-bold font-mono text-neutral-950">{Object.keys(graph.sessions).length}</span>
            <span className="text-xs text-neutral-400 font-light block mt-1">total lectures processed</span>
          </div>
          <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded border-dashed self-start font-mono">
            {sessionsArray.filter((s: any) => s && s.completed).length} lectures graduated
          </span>
        </div>

      </div>

      {/* CORE SPLIT: CHANNELS & MEMORY NETWORKS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
        
        {/* Left Column: Habits, Retention, suggestions (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">

          {/* RETENTION TASK A: CONTINUE LEARNING (RESUME CORES) */}
          {lastUnfinishedSession && (
            <div className="bg-white border border-black/[0.04] p-6 rounded-3xl shadow-sm text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-[9px] font-mono font-bold bg-[#bf5af2]/10 text-[#bf5af2] rounded-bl-xl uppercase tracking-wider">
                Unfinished Course Module
              </div>
              <span className="text-[10px] font-mono font-bold text-[#86868b] uppercase tracking-wider block mb-2">
                📂 Resume Learning Matrix
              </span>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-neutral-50 p-4 rounded-2xl border border-black/[0.03]">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border shadow-xs">
                    <img src={lastUnfinishedSession.thumbnailUrl} alt="Video" className="object-cover w-full h-full" />
                    <div className="absolute bottom-1 right-1 bg-black/75 rounded text-[8px] font-mono text-white px-1 leading-none">
                      {lastUnfinishedSession.duration || '18 min'}
                    </div>
                  </div>
                  <div className="overflow-hidden text-left">
                    <h5 className="text-xs font-bold text-neutral-900 truncate leading-tight">
                      {lastUnfinishedSession.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-indigo-600 font-semibold">{lastUnfinishedSession.progressPercent}% Processed</span>
                      <span className="text-neutral-300 text-[10px]">•</span>
                      <span className="text-[10px] text-neutral-400">Captured {lastUnfinishedSession.processedAt}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => onLoadVideo(lastUnfinishedSession.videoId, false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4.5 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1 font-display hover:translate-x-0.5"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Resume Course</span>
                </button>
              </div>
            </div>
          )}

          {/* RETENTION TASK C: HABIT BUILDER DAILY LEARNING CHALLENGE */}
          <div className="bg-white border border-black/[0.04] p-6 rounded-3xl shadow-sm text-left space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#bf5af2] bg-[#bf5af2]/10 px-2.5 py-1 rounded-full">
                  ⚡ habit driver
                </span>
                <h3 className="text-lg font-bold font-display text-neutral-950 mt-1.5">
                  Daily Learning Challenge
                </h3>
                <p className="text-[#86868b] text-xs font-light">
                  Complete today's fast cognitive drill to preserve your active {graph.streak}-day streak!
                </p>
              </div>
              <div className="text-right">
                <span className="text-indigo-600 text-xs font-bold font-mono">+150 XP Reward</span>
              </div>
            </div>

            {dailyCompleted ? (
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-emerald-950">Active Recall Locked for Today!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed font-sans max-w-md mx-auto">
                  Excellent work keeping your brain active. Your +150 XP bonus has been aggregated. Re-visit tomorrow morning for a new specialized challenge!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-neutral-50/70 p-4.5 rounded-2xl border border-neutral-150">
                  <span className="text-[9px] font-mono text-indigo-600 font-bold uppercase tracking-widest block mb-1">Concept: {currentDaily.conceptName}</span>
                  <h4 className="text-sm font-bold text-neutral-850 leading-relaxed font-display">
                    {currentDaily.question}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {currentDaily.options.map((option, idx) => {
                    const active = dailyChoice === idx;
                    let btnStyle = "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800";
                    if (active) btnStyle = "border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold";
                    
                    if (dailySubmitted) {
                      if (idx === currentDaily.answerIndex) {
                        btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold";
                      } else if (active) {
                        btnStyle = "border-rose-450 bg-rose-50 text-rose-950";
                      } else {
                        btnStyle = "border-neutral-100 bg-white text-neutral-350 pointer-events-none";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={dailySubmitted}
                        onClick={() => setDailyChoice(idx)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition cursor-pointer flex justify-between items-center ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {active && !dailySubmitted && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        {dailySubmitted && idx === currentDaily.answerIndex && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>

                {!dailySubmitted ? (
                  <button
                    type="button"
                    disabled={dailyChoice === null}
                    onClick={handleClaimDailyChallenge}
                    className="w-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white py-3 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Lock Recall Answer (+150 XP)</span>
                  </button>
                ) : (
                  <div className="p-4 bg-[#0071e3]/5 border border-[#0071e3]/10 rounded-2xl text-xs text-indigo-950 leading-normal font-sans space-y-2">
                    <div className="flex gap-1.5 items-center">
                      <Lightbulb className="w-4 h-4 text-indigo-605 shrink-0" />
                      <strong className="font-bold">Challenge Explanation Details:</strong>
                    </div>
                    <p>{currentDaily.explanation}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setDailyCompleted(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg mt-1 block w-fit shadow-xs cursor-pointer"
                    >
                      Continue to Core Panel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RETENTION TASK B: WEAK TOPICS REVIEW BOARD */}
          {conceptsArray.some((c: any) => c.masteryLevel < 70) && (
            <div className="bg-white border border-black/[0.04] p-6 rounded-3xl shadow-sm text-left space-y-4">
              <span className="text-[10px] font-mono font-bold text-[#e03e2d] uppercase tracking-wider block">
                ⚠ Strategic Deliberate Practice (Active Repair Center)
              </span>
              <div>
                <h3 className="text-base font-bold font-display text-neutral-900 leading-tight">
                  Weak Concepts Revision Suggested
                </h3>
                <p className="text-xs text-neutral-500 mt-1 font-light leading-relaxed">
                  These topics have falling mastery rates. Review their micro-analogies to restore memory strength!
                </p>
              </div>

              {!activeRevisionConcept ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {conceptsArray.filter((c: any) => c.masteryLevel < 70).map((concept: any) => (
                    <button
                      key={concept.id}
                      type="button"
                      onClick={() => {
                        setActiveRevisionConcept(concept);
                        setRevisionFeedback(null);
                        setRevisionTypedAnswer('');
                      }}
                      className="text-left p-4 rounded-2xl border border-red-100 bg-red-50/10 hover:bg-red-50/20 transition cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[#86868b] text-[9px] font-mono font-bold tracking-wider block uppercase">{concept.sourceTitle}</span>
                        <h4 className="text-xs font-bold text-neutral-850 leading-tight">{concept.concept}</h4>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[9px] font-bold font-mono text-red-600 bg-red-100/50 border border-red-200/50 px-2 py-0.5 rounded-full">{concept.masteryLevel}% Mastery</span>
                        <span className="text-[10px] text-neutral-600 font-bold hover:underline flex items-center gap-0.5">Quick Drill <ChevronRight className="w-3 h-3" /></span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4.5 bg-neutral-50 border border-slate-200 rounded-2xl space-y-4 animate-slideUp">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase block">Concept Drill</span>
                      <h4 className="text-sm font-bold text-indigo-700">{activeRevisionConcept.concept}</h4>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setActiveRevisionConcept(null)}
                      className="text-xs font-bold text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      Cancel review
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs text-neutral-700 text-left">
                    <p className="leading-relaxed">
                      <strong className="font-semibold text-neutral-900 block mb-0.5">Abstract Definition:</strong>
                      {activeRevisionConcept.definition}
                    </p>

                    <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200/80 leading-relaxed text-amber-950 font-sans">
                      <strong className="text-amber-950 font-bold block mb-1">💡 Metaphorical Analogy:</strong>
                      {activeRevisionConcept.analogy}
                    </div>

                    <div className="space-y-2 pt-1 border-t">
                      <label className="block font-bold text-neutral-850 text-xs">
                        ✍️ Retain Active Practice: Explain in your own words how you relate to this idea:
                      </label>
                      <textarea
                        disabled={!!revisionFeedback}
                        placeholder="Type a fast sentence linking this metaphor back to your work or life..."
                        rows={2}
                        value={revisionTypedAnswer}
                        onChange={(e) => setRevisionTypedAnswer(e.target.value)}
                        className="w-full text-xs p-3.5 rounded-xl border border-neutral-300 focus:bg-white focus:border-indigo-500 outline-none transition inline-block bg-white text-neutral-950"
                      />
                    </div>
                  </div>

                  {revisionFeedback ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl font-sans animate-fadeIn">
                      {revisionFeedback}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRevisionTestSubmit}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition shadow-xs"
                    >
                      Submit Review & update mastery (+80 XP)
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* RETENTION TASK D: RECOMMENDED NEXT LESSONS */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border border-indigo-100 p-6 rounded-3xl shadow-sm text-left space-y-4">
            <div>
              <span className="text-[10px] bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
                🎯 Curated sequence path
              </span>
              <h3 className="text-base font-bold font-display text-neutral-900 mt-2">
                Recommended For Next Video Lessons
              </h3>
              <p className="text-neutral-500 text-xs font-light">
                Suggested lectures based on your current conceptual mastery density.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  videoId: 'qp0HIF3SfI4',
                  title: 'Simon Sinek: Golden Circles',
                  author: 'TED Talks',
                  thumbnailUrl: 'https://img.youtube.com/vi/qp0HIF3SfI4/maxresdefault.jpg',
                  pill: 'Direct Neuroscience correlation'
                },
                {
                  videoId: 'UF8uR6Z6KLc',
                  title: 'Steve Jobs: Stanford Address',
                  author: 'Stanford',
                  thumbnailUrl: 'https://img.youtube.com/vi/UF8uR6Z6KLc/maxresdefault.jpg',
                  pill: 'Intuition & Resilience keynotes'
                }
              ].map((recommend, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onLoadVideo(recommend.videoId, false)}
                  className="bg-white border rounded-2xl p-3 shadow-xs hover:border-indigo-600 hover:shadow-md transition text-left flex gap-3 group items-center cursor-pointer"
                >
                  <div className="relative w-16 h-10 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border">
                    <img src={recommend.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div className="overflow-hidden space-y-0.5">
                    <span className="text-[8px] bg-indigo-50 text-indigo-700 font-mono font-bold px-1.5 py-0.2 rounded block w-fit truncate max-w-full">
                      {recommend.pill}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-850 truncate leading-tight group-hover:text-[#0071e3]">
                      {recommend.title}
                    </h4>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Brain Cognitive Memory Graph (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white border border-black/[0.04] p-6 rounded-3xl shadow-sm text-left space-y-4">
            <div>
              <h3 className="text-base font-bold font-display text-neutral-950 flex items-center gap-1.5 leading-tight">
                <Network className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                Personal Cognitive Lattice
              </h3>
              <p className="text-neutral-500 text-xs font-light">
                Persistent memory network connecting your analyzed lectures, concepts, and performance. Click nodes to study.
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-150 rounded-2xl p-4.5 min-h-[340px] flex flex-col justify-between relative overflow-hidden">
              
              {/* Core Node Representation */}
              <div className="space-y-6">
                
                {/* Central Anchor */}
                <div className="flex justify-center">
                  <div className="bg-indigo-600 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center justify-center gap-1 font-mono tracking-wider shadow-inner animate-pulse">
                    <Network className="w-3.5 h-3.5" />
                    <span>COGNITIVE PLATFORM</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  
                  {/* Mastered Node Branch */}
                  <div className="border border-neutral-200/80 bg-white/50 p-3 rounded-xl text-left space-y-2">
                    <span className="text-[8px] text-emerald-600 font-bold tracking-widest block uppercase">✓ Mastered Nodes</span>
                    <div className="flex flex-col gap-1.5 pt-1">
                      {conceptsArray.filter((c: any) => c.masteryLevel >= 70).map((concept: any) => (
                        <button
                          key={concept.id}
                          type="button"
                          onClick={() => setSelectedNode(concept)}
                          className="w-full text-left bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-800 text-[9px] font-semibold px-2 py-1.5 rounded-lg truncate transition cursor-pointer"
                        >
                          ✓ {concept.concept}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weak Node Branch */}
                  <div className="border border-neutral-200/80 bg-white/50 p-3 rounded-xl text-left space-y-2">
                    <span className="text-[8px] text-red-600 font-bold tracking-widest block uppercase">⚠ Needs Review</span>
                    <div className="flex flex-col gap-1.5 pt-1">
                      {conceptsArray.filter((c: any) => c.masteryLevel < 70).map((concept: any) => (
                        <button
                          key={concept.id}
                          type="button"
                          onClick={() => setSelectedNode(concept)}
                          className="w-full text-left bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/20 text-rose-800 text-[9px] font-semibold px-2 py-1.5 rounded-lg truncate transition cursor-pointer font-bold"
                        >
                          ⚠ {concept.concept}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Selected Node Drawer Inside Graph */}
              {selectedNode ? (
                <div className="bg-white border border-neutral-250 rounded-xl p-3.5 shadow-sm space-y-2 animate-fadeIn text-xs text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-neutral-900 truncate max-w-[70%]">{selectedNode.concept}</h4>
                    <span className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded-full ${
                      selectedNode.masteryLevel >= 70 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {selectedNode.masteryLevel}% MASTERY
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-400 block uppercase">Source lecture: {selectedNode.sourceTitle}</span>
                  <p className="text-[11px] leading-relaxed text-neutral-500">{selectedNode.definition}</p>
                  
                  <div className="bg-amber-50 border border-amber-200/60 p-2 text-[10px] rounded-lg text-amber-950 font-sans">
                    <strong className="block text-amber-950 font-bold mb-0.5">💡 Analogy:</strong>
                    {selectedNode.analogy}
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t">
                    {selectedNode.masteryLevel < 70 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNode(null);
                          setActiveRevisionConcept(selectedNode);
                          setRevisionFeedback(null);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] px-2.5 py-1 rounded cursor-pointer"
                      >
                        Drill Now
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedNode(null)}
                      className="text-neutral-450 hover:text-neutral-700 font-bold text-[9px] px-2"
                    >
                      Close Node
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center pt-8 text-[10px] text-neutral-400 font-sans italic border-t">
                  ⚙ Click any topic node above to parse stored meta-cognition
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// =========================================================================
// 2. ACTIVE LEARNING DASHBOARD (REPLACES WORKSPACE WHEN VIDEO ACTIVE)
// =========================================================================

interface ActiveLearningDashboardProps {
  activeSummary: YouTubeSummaryResponse;
  onBackToCenter: () => void;
  ytStartSeconds: number | null;
  onJumpToTimestamp: (seconds: number) => void;
  onResetJump: () => void;
  experimentGroup: string;
}

export function ActiveLearningDashboard({ 
  activeSummary, 
  onBackToCenter, 
  ytStartSeconds, 
  onJumpToTimestamp, 
  onResetJump,
  experimentGroup 
}: ActiveLearningDashboardProps) {
  const [activePanel, setActivePanel] = useState<'timeline' | 'concepts' | 'quiz' | 'progress'>('timeline');
  const [revealedFlashcards, setRevealedFlashcards] = useState<Record<number, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [currentQuizScore, setCurrentQuizScore] = useState<number>(0);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  
  // Concept simulation deep study modal state
  const [simulatedConcept, setSimulatedConcept] = useState<any | null>(null);
  const [simulationResponse, setSimulationResponse] = useState<string>('');
  const [simulating, setSimulating] = useState<boolean>(false);
  
  // Step 4 Graduation Screen state
  const [showGraduation, setShowGraduation] = useState<boolean>(false);
  const [gradedConcepts, setGradedConcepts] = useState<any[]>([]);

  // Award XP helper
  const triggerXpSurgically = (amount: number) => {
    const memory = loadMemoryGraph();
    memory.xp += amount;
    const nextLevel = Math.floor(memory.xp / 500) + 1;
    if (nextLevel > memory.level) {
      memory.level = nextLevel;
    }
    saveMemoryGraph(memory);
  };

  useEffect(() => {
    // Reset states on active video change
    setRevealedFlashcards({});
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setShowGraduation(false);

    // Save initial session to personal memory graph
    const memory = loadMemoryGraph();
    const existing = memory.sessions[activeSummary.metadata.videoId];
    if (!existing) {
      memory.sessions[activeSummary.metadata.videoId] = {
        videoId: activeSummary.metadata.videoId,
        title: activeSummary.metadata.title,
        thumbnailUrl: activeSummary.metadata.thumbnailUrl || `https://img.youtube.com/vi/${activeSummary.metadata.videoId}/maxresdefault.jpg`,
        processedAt: new Date().toLocaleDateString(),
        duration: activeSummary.metadata.duration || '20 min',
        progressPercent: 30,
        completed: false
      };
      
      // Inject missing concepts derived from synthesis to visual Core lattice
      activeSummary.keyConcepts?.forEach((kc, i) => {
        const id = `${activeSummary.metadata.videoId}-concept-${i}`;
        if (!memory.concepts[id] && !Object.values(memory.concepts).some(c => c.concept === kc.concept)) {
          memory.concepts[id] = {
            id,
            concept: kc.concept,
            sourceVideoId: activeSummary.metadata.videoId,
            sourceTitle: activeSummary.metadata.title,
            definition: kc.definition,
            analogy: kc.simplifiedExplanation,
            masteryLevel: 30, // Starts as New/Unlearned
            status: 'Weak'
          };
        }
      });
      
      saveMemoryGraph(memory);
    }
  }, [activeSummary]);

  // Handle concept simulation query trigger
  const handleSimulateConcept = async (concept: any) => {
    setSimulatedConcept(concept);
    setSimulationResponse('');
    setSimulating(true);
    
    try {
      const response = await fetch('/api/marketing-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: concept.concept,
          channel: 'academic',
          additionalInstructions: `Act as a personal learning mentor. Provide a highly engaging real-life case study, deep explanation, and a mock diagnostic recall question for this concept: "${concept.concept}". Keep it professional, scannable, and extremely clear. Use markdown.`
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSimulationResponse(data.content);
        triggerXpSurgically(40); // Reward active discovery!
      } else {
        throw new Error();
      }
    } catch (e) {
      setSimulationResponse(`Could not complete deep simulation due to network credentials or quota limits. \n\n**Concept Analogy Recap:** ${concept.simplifiedExplanation || concept.definition}`);
    } finally {
      setSimulating(false);
    }
  };

  // Submit and lock learning answers
  const handleSubmitActiveQuiz = () => {
    const questions = activeSummary.quiz;
    if (questions.length === 0) return;

    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) score++;
    });

    setCurrentQuizScore(score);
    setQuizSubmitted(true);
    
    const count = questions.length;
    const finalPct = Math.round((score / count) * 100);

    // Dynamic difficulty recalculation trigger
    let finalDiff: 'Easy' | 'Medium' | 'Hard' = 'Medium';
    if (finalPct >= 90) finalDiff = 'Hard';
    else if (finalPct < 60) finalDiff = 'Easy';
    setAdaptiveDifficulty(finalDiff);

    // Save learning milestones to Memory Graph
    const memory = loadMemoryGraph();
    
    // Process concepts grading results
    const results: any[] = [];
    activeSummary.keyConcepts?.forEach((kc, i) => {
      const id = `${activeSummary.metadata.videoId}-concept-${i}`;
      const conceptInGraph = memory.concepts[id] || Object.values(memory.concepts).find(c => c.concept === kc.concept);
      
      if (conceptInGraph) {
        const prev = conceptInGraph.masteryLevel;
        // Adjust mastery level based on quiz score percent
        let nextMastery = prev;
        if (finalPct >= 75) {
          nextMastery = Math.min(prev + 30, 100);
        } else {
          nextMastery = Math.max(prev - 15, 0);
        }
        
        conceptInGraph.masteryLevel = nextMastery;
        conceptInGraph.status = nextMastery >= 70 ? 'Strong' : 'Weak';
        
        results.push({
          concept: kc.concept,
          prev,
          next: nextMastery,
          status: conceptInGraph.status
        });
      }
    });
    setGradedConcepts(results);

    // Update Session completion object
    const sessionObj = memory.sessions[activeSummary.metadata.videoId];
    if (sessionObj) {
      sessionObj.completed = true;
      sessionObj.progressPercent = 100;
      sessionObj.score = score;
      sessionObj.totalQuestions = count;
    }

    // Add event log to history array
    memory.quizHistory = [
      {
        videoId: activeSummary.metadata.videoId,
        title: activeSummary.metadata.title,
        score,
        total: count,
        date: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        difficulty: finalDiff
      },
      ...memory.quizHistory.filter(x => x.videoId !== activeSummary.metadata.videoId)
    ];

    // Award major XP points: 100 XP per correct question + 150 perfect score bonus
    const xpWon = (score * 100) + (score === count ? 150 : 0);
    memory.streak += 1;
    memory.xp += xpWon;
    
    // Level boundary calculation
    const levelCalculated = Math.floor(memory.xp / 500) + 1;
    if (levelCalculated > memory.level) {
      memory.level = levelCalculated;
    }

    // Filter dynamic lists
    memory.weakTopics = Object.values(memory.concepts).filter(c => c.masteryLevel < 70).map(c => c.concept);
    memory.strongTopics = Object.values(memory.concepts).filter(c => c.masteryLevel >= 70).map(c => c.concept);

    saveMemoryGraph(memory);

    // Switch view to graduation overlay
    setTimeout(() => {
      setShowGraduation(true);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* SECTION MASTER CONTROL TABS (4 PANELS BAR) */}
      <div className="flex bg-neutral-100 p-1 rounded-2xl gap-1 items-center justify-between border">
        {[
          { id: 'timeline', label: '📺 A. Video Timeline', count: activeSummary.chapters.length },
          { id: 'concepts', label: '📘 B. Concepts Panel', count: activeSummary.keyConcepts?.length || 0 },
          { id: 'quiz', label: '🧠 C. Quiz Panel', count: activeSummary.quiz.length },
          { id: 'progress', label: '📊 D. Live Progress', count: 100 }
        ].map((panel) => {
          const active = activePanel === panel.id;
          return (
            <button
              key={panel.id}
              type="button"
              onClick={() => {
                setActivePanel(panel.id as any);
                if (showGraduation && panel.id !== 'quiz') {
                  setShowGraduation(false); // ease back
                }
              }}
              className={`flex-1 py-3 text-xs font-semibold rounded-xl text-center transition cursor-pointer ${
                active 
                  ? 'bg-neutral-900 text-white shadow-sm font-bold' 
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <span>{panel.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER GRADUATION BLOCK GATES */}
      {showGraduation ? (
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-white/5 space-y-6 animate-slideUp text-left">
          <div className="text-center space-y-2 relative overflow-hidden py-4">
            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full"></div>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto animate-bounce">
              <Award className="w-9 h-9" />
            </div>
            <h3 className="font-display text-2xl font-extrabold text-white">Lecture Learning Complete!</h3>
            <p className="text-neutral-400 text-xs max-w-md mx-auto">
              Syllabus fully analyzed and verified through active recall logic testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-neutral-800 py-5 text-sm">
            
            <div className="bg-neutral-800/40 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-neutral-450 uppercase font-mono block mb-1">Knowledge Verified</span>
              <strong className="text-xl font-mono text-white">{currentQuizScore} / {activeSummary.quiz.length} Correct</strong>
            </div>

            <div className="bg-neutral-800/40 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-neutral-450 uppercase font-mono block mb-1">XP Points Gained</span>
              <strong className="text-xl font-mono text-amber-400">+{(currentQuizScore * 100) + (currentQuizScore === activeSummary.quiz.length ? 150 : 0)} XP</strong>
            </div>

            <div className="bg-neutral-800/40 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-neutral-450 uppercase font-mono block mb-1">Next Difficulty Target</span>
              <strong className="text-xl font-mono text-indigo-400">{adaptiveDifficulty} mode</strong>
            </div>

          </div>

          {/* CONCEPT RETENTION DELTA UPDATE PANEL */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 font-mono uppercase tracking-wider">Concept Mastery updates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {gradedConcepts.map((item, idx) => (
                <div key={idx} className="bg-neutral-800/20 border border-neutral-850 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="overflow-hidden min-w-0 pr-1 text-left">
                    <span className="text-xs font-bold text-white block truncate">{item.concept}</span>
                    <span className="text-[10px] text-neutral-400">Mastery upgraded:</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-neutral-400 line-through mr-1.5">{item.prev}%</span>
                    <span className="text-sm font-mono text-emerald-400 font-extrabold">➔ {item.next}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onBackToCenter}
              className="flex-1 bg-white hover:bg-neutral-100 text-neutral-950 font-bold py-3.5 rounded-xl text-center transition cursor-pointer text-xs"
            >
              Back to Learning Control Center
            </button>
            <button
              type="button"
              onClick={() => setShowGraduation(false)}
              className="px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-xl text-center transition cursor-pointer text-xs"
            >
              Review Quiz Submissions
            </button>
          </div>

        </div>
      ) : (
        <div className="p-1">
          
          {/* PANEL A: TIMELINE & CHANNELS */}
          {activePanel === 'timeline' && (
            <div className="space-y-4 animate-fadeIn text-left">
              <div className="bg-slate-50 border p-4 rounded-2xl">
                <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-widest block mb-0.5">Timeline controller</span>
                <h4 className="text-sm font-bold text-neutral-900 leading-tight">Interactive Visual Syllabus</h4>
                <p className="text-xs text-neutral-500 mt-1 leading-normal">
                  Toggle synchronized video chapters. Teleport the media player directly by clicking segment bookmarks!
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {activeSummary.chapters.map((chap, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onJumpToTimestamp(chap.secondsCount)}
                    className="w-full text-left p-3.5 rounded-2xl border border-neutral-200 bg-white hover:border-indigo-600 hover:bg-neutral-50/50 transition duration-150 flex gap-3.5 group cursor-pointer"
                  >
                    <div className="font-mono text-[10px] font-bold text-[#0071e3] bg-[#0071e3]/5 group-hover:bg-[#0071e3]/10 px-2.5 py-1 rounded-md h-fit w-fit whitespace-nowrap">
                      ⏱ {chap.timestamp}
                    </div>
                    <div className="space-y-0.5 overflow-hidden text-left">
                      <h4 className="text-xs font-bold text-neutral-850 group-hover:text-black leading-tight">
                        {chap.title}
                      </h4>
                      <p className="text-[#86868b] text-[11px] leading-normal line-clamp-2">
                        {chap.takeaway}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PANEL B: KEY CONCEPTS & ANALOGIES PLATFORM */}
          {activePanel === 'concepts' && (
            <div className="space-y-5 animate-fadeIn text-left">
              <div className="bg-slate-50 border p-4 rounded-2xl">
                <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-widest block mb-0.5">Demystifying Platform</span>
                <h4 className="text-sm font-bold text-neutral-900 leading-tight">Plain-English Metaphors</h4>
                <p className="text-xs text-neutral-500 mt-1 leading-normal">
                  Complex ideas mapped and coupled with dynamic active discovery simulation models!
                </p>
              </div>

              <div className="space-y-4">
                {activeSummary.keyConcepts?.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white border hover:shadow-xs p-5 rounded-2xl space-y-3.5 transition">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-xs font-bold text-neutral-900 font-display">
                        📜 {item.concept}
                      </span>
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                        node #{idx + 1}
                      </span>
                    </div>

                    <div className="space-y-3 font-sans text-xs text-neutral-750">
                      <p className="leading-relaxed">
                        <strong className="font-semibold text-neutral-850 block mb-0.5">Academic Definition:</strong>
                        {item.definition}
                      </p>

                      <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-100 leading-relaxed text-amber-950">
                        <strong className="block text-amber-950 font-bold mb-1">💡 Interactive Analogy:</strong>
                        {item.simplifiedExplanation}
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <button
                        type="button"
                        onClick={() => handleSimulateConcept(item)}
                        className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-indigo-100 transition cursor-pointer"
                      >
                        ⚡ Simulate Concept with AI Case Study (+40 XP)
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* simulated deep case studies drawer */}
              {simulatedConcept && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                  <div className="bg-white max-w-xl w-full rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto border text-left">
                    <div className="flex justify-between items-center border-b pb-2">
                      <div>
                        <span className="text-[8px] bg-indigo-150 text-indigo-700 font-mono font-bold px-1.5 py-0.5 rounded block w-fit truncate">AI COGNITIVE DRILL</span>
                        <h4 className="text-base font-bold text-[#1d1d1f] font-display mt-0.5">{simulatedConcept.concept}</h4>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setSimulatedConcept(null)}
                        className="text-neutral-400 hover:text-neutral-700 font-bold text-sm cursor-pointer p-1"
                      >
                        ✕
                      </button>
                    </div>

                    {simulating ? (
                      <div className="py-12 text-center space-y-3">
                        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                        <p className="text-xs text-neutral-400 font-mono">Synthesizing personalized case study from memory...</p>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-1 font-sans text-xs text-neutral-750 max-h-96 overflow-y-auto leading-relaxed">
                        <div className="p-3.5 bg-neutral-50 rounded-xl border">
                          <p>{simulationResponse}</p>
                        </div>
                        <p className="text-[10px] text-emerald-600 font-bold">✓ Metacognition Complete. Awarded +40 XP points and node refreshed.</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setSimulatedConcept(null)}
                      className="w-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer text-center"
                    >
                      Return to Syllabus
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* PANEL C: ACTIVE INTELLIGENCE QUIZ */}
          {activePanel === 'quiz' && (
            <div className="space-y-5 animate-fadeIn text-left">
              <div className="bg-slate-50 border p-4 rounded-2xl">
                <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-widest block mb-0.5">Adaptative Quiz Engine</span>
                <h4 className="text-sm font-bold text-neutral-900 leading-tight">Adaptive Knowledge Check</h4>
                <p className="text-xs text-neutral-500 mt-1 leading-normal font-sans">
                  Difficulty matches your current user level ({adaptiveDifficulty} Mode). Correct answers boost Mastery metrics.
                </p>
              </div>

              <div className="space-y-4">
                {activeSummary.quiz.map((q, idx) => {
                  const submitted = quizSubmitted;
                  const selectedOpt = selectedAnswers[idx];
                  const isCorrect = selectedOpt === q.answerIndex;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition duration-200 ${
                        submitted 
                          ? isCorrect 
                            ? 'bg-emerald-50/50 border-emerald-250' 
                            : 'bg-rose-50/50 border-rose-200/50' 
                          : 'bg-white border-neutral-200 shadow-xs'
                      }`}
                    >
                      <h5 className="text-xs font-bold text-neutral-850 flex gap-2 font-display">
                        <span className="text-neutral-450 font-mono">Q{idx + 1}.</span>
                        <span>{q.question}</span>
                      </h5>

                      <div className="grid grid-cols-1 gap-2 mt-3 pl-1 text-left">
                        {q.options.map((option, optIdx) => {
                          const active = selectedOpt === optIdx;
                          let btnStyle = "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-750";
                          if (active) btnStyle = "border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold";

                          if (submitted) {
                            if (optIdx === q.answerIndex) {
                              btnStyle = "border-emerald-500 bg-emerald-100 text-emerald-900 font-semibold";
                            } else if (active) {
                              btnStyle = "border-red-300 bg-red-100 text-red-900";
                            } else {
                              btnStyle = "border-neutral-100 bg-white text-neutral-350 pointer-events-none";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={submitted}
                              onClick={() => {
                                setSelectedAnswers(prev => ({
                                  ...prev,
                                  [idx]: optIdx
                                }));
                              }}
                              className={`w-full text-left px-3.5 py-3.5 text-xs rounded-xl border font-medium transition cursor-pointer flex justify-between items-center ${btnStyle}`}
                            >
                              <span>{option}</span>
                              {active && !submitted && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                              {submitted && optIdx === q.answerIndex && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>

                      {submitted && (
                        <div className="mt-3.5 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 font-sans leading-relaxed flex gap-2">
                          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-semibold text-neutral-800 block">Explanation:</span>
                            <p>{q.explanation}</p>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

              {/* submits actions button */}
              <div className="pt-3 border-t">
                {!quizSubmitted ? (
                  <button
                    type="button"
                    disabled={Object.keys(selectedAnswers).length < activeSummary.quiz.length}
                    onClick={handleSubmitActiveQuiz}
                    className="w-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white font-semibold py-3.5 rounded-xl cursor-pointer transition text-xs disabled:opacity-45 disabled:pointer-events-none"
                  >
                    Lock recall answers & graduate lecture
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border px-3 py-2 rounded-lg font-mono">
                      🏆 Graduated score: {currentQuizScore} / {activeSummary.quiz.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="text-xs text-neutral-500 hover:text-neutral-800 font-bold cursor-pointer"
                    >
                      Reset recall check
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* PANEL D: COMPREHENSIVE LIVE PROGRESS */}
          {activePanel === 'progress' && (
            <div className="space-y-5 animate-fadeIn text-left">
              <div className="bg-slate-50 border p-4 rounded-2xl">
                <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-widest block mb-0.5">Live Progression telemetry</span>
                <h4 className="text-sm font-bold text-neutral-900 leading-tight">Gamified Telemetry Engine</h4>
                <p className="text-xs text-neutral-500 mt-1 leading-normal font-sans">
                  Review streak multipliers, level-up milestones, and local sandbox database rules status.
                </p>
              </div>

              {/* Detailed Metrics Panel */}
              <div className="bg-[#1d1d1f] text-white rounded-3xl p-5 space-y-4 font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase font-mono tracking-widest">Level Progression</span>
                  <span className="text-[10px] text-amber-400 font-bold">active telemetry</span>
                </div>
                
                <div className="space-y-1">
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <span className="text-[10px] text-neutral-450 font-mono block">Level boundary status: stable</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                    <span className="text-neutral-400 block text-[9px] uppercase font-mono">Completed courses</span>
                    <strong className="text-sm font-mono block mt-0.5">2 Lectures</strong>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                    <span className="text-neutral-400 block text-[9px] uppercase font-mono">Streak claims</span>
                    <strong className="text-sm font-mono block mt-0.5">claimed today</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onBackToCenter}
                className="w-full bg-neutral-900 hover:bg-neutral-850 text-white font-bold py-3.5 rounded-xl transition text-xs cursor-pointer text-center"
              >
                Return to main control center
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
