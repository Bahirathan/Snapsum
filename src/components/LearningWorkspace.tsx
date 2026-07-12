/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Video, 
  Network, 
  Award, 
  Sparkles, 
  MessageSquare, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  HelpCircle, 
  ArrowRight, 
  FileText, 
  Lock, 
  Check, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Lightbulb, 
  Trophy, 
  Brain, 
  Clock, 
  Shield, 
  Calendar, 
  ListTodo, 
  FileSpreadsheet, 
  FileQuestion, 
  ChevronRight, 
  RefreshCw, 
  Star, 
  Edit3, 
  Trash2, 
  Share2, 
  Clipboard, 
  Youtube,
  GraduationCap,
  Save,
  CheckCircle,
  TrendingUp,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { YouTubeSummaryResponse, Flashcard, KeyConcept, MindmapNode, QuizQuestion } from '../types';
import AIChatWithSummary from './AIChatWithSummary';
import SummaryPremiumExporter from './SummaryPremiumExporter';
import WorkspaceComments from './WorkspaceComments';

interface LearningWorkspaceProps {
  activeSummary: YouTubeSummaryResponse;
  onBackToCenter: () => void;
  ytStartSeconds: number | null;
  onJumpToTimestamp: (seconds: number) => void;
  onResetJump: () => void;
  isPremium: boolean;
  visitorUser: any;
  setShowAuthModal: (show: boolean) => void;
  setAuthModalPurpose: (purpose: string) => void;
  setShowStripeModal: (show: boolean) => void;
  setSelectedPlanCode: (code: string) => void;
  setStripePaymentSuccess: (success: boolean) => void;
  downloadSummaryAsPDF: () => void;
  handleGenerateTTS: (text: string) => void;
  ttsLoading: boolean;
  audioUrl: string | null;
  isPlaying: boolean;
  togglePlay: () => void;
  audioProgress: number;
  audioDuration: number;
  formatTime: (sec: number) => string;
  isRtl: boolean;
  t: (key: string) => string;
  getHeaders: () => Record<string, string>;
  trackGAEvent?: (event: string, params?: any) => void;
}

export default function LearningWorkspace({
  activeSummary,
  onBackToCenter,
  ytStartSeconds,
  onJumpToTimestamp,
  onResetJump,
  isPremium,
  visitorUser,
  setShowAuthModal,
  setAuthModalPurpose,
  setShowStripeModal,
  setSelectedPlanCode,
  setStripePaymentSuccess,
  downloadSummaryAsPDF,
  handleGenerateTTS,
  ttsLoading,
  audioUrl,
  isPlaying,
  togglePlay,
  audioProgress,
  audioDuration,
  formatTime,
  isRtl,
  t,
  getHeaders,
  trackGAEvent
}: LearningWorkspaceProps) {
  // Main Navigation Sections: Understand, Learn, Apply
  const [activeSection, setActiveSection] = useState<'understand' | 'learn' | 'apply'>('understand');
  
  // Sub-tabs navigation
  const [activeUnderstandTab, setActiveUnderstandTab] = useState<'summary' | 'modules'>('summary');
  const [activeLearnTab, setActiveLearnTab] = useState<'mindmap' | 'flashcards' | 'study-plan'>('mindmap');
  const [activeApplyTab, setActiveApplyTab] = useState<'quiz' | 'tutor' | 'notes' | 'export' | 'comments'>('quiz');

  // Interactive Flashcards States
  const [revealedFlashcards, setRevealedFlashcards] = useState<Record<number, boolean>>({});
  
  // Smart Notes State
  const [notesText, setNotesText] = useState<string>(() => {
    return localStorage.getItem(`zipytiny_notes_${activeSummary.metadata.videoId}`) || '';
  });
  const [showNotesSavedToast, setShowNotesSavedToast] = useState<boolean>(false);

  // Spaced Repetition / Memory States (SM-2 Lite)
  const [masteryLevels, setMasteryLevels] = useState<Record<string, number>>({});
  const [streakDays, setStreakDays] = useState<number>(() => {
    return parseInt(localStorage.getItem('zipytiny_user_streak') || '3', 10);
  });
  const [xpPoints, setXpPoints] = useState<number>(() => {
    return parseInt(localStorage.getItem('zipytiny_user_xp') || '320', 10);
  });

  // Quiz States
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showGraduation, setShowGraduation] = useState<boolean>(false);

  // Mindmap Export State
  const [isExportingMindmap, setIsExportingMindmap] = useState<boolean>(false);

  // Auto-save Notes
  useEffect(() => {
    localStorage.setItem(`zipytiny_notes_${activeSummary.metadata.videoId}`, notesText);
  }, [notesText, activeSummary.metadata.videoId]);

  // Load Mastery Levels from localStorage
  useEffect(() => {
    const savedMastery = localStorage.getItem(`zipytiny_mastery_${activeSummary.metadata.videoId}`);
    if (savedMastery) {
      setMasteryLevels(JSON.parse(savedMastery));
    } else {
      // Bootstrap initial mastery levels for keyConcepts
      const initialMastery: Record<string, number> = {};
      activeSummary.keyConcepts?.forEach((kc, idx) => {
        initialMastery[kc.concept] = 30; // Starts at 30% (unlearned/fresh)
      });
      setMasteryLevels(initialMastery);
      localStorage.setItem(`zipytiny_mastery_${activeSummary.metadata.videoId}`, JSON.stringify(initialMastery));
    }
  }, [activeSummary]);

  // Function to award XP points
  const awardXp = (amount: number) => {
    const nextXp = xpPoints + amount;
    setXpPoints(nextXp);
    localStorage.setItem('zipytiny_user_xp', nextXp.toString());
  };

  // SM-2 Spaced Repetition trigger
  const handleRateRecall = (concept: string, rating: 'easy' | 'good' | 'hard' | 'forgot') => {
    let delta = 0;
    let xpGain = 0;
    if (rating === 'easy') { delta = 25; xpGain = 50; }
    else if (rating === 'good') { delta = 15; xpGain = 30; }
    else if (rating === 'hard') { delta = 5; xpGain = 15; }
    else if (rating === 'forgot') { delta = -15; xpGain = 10; }

    setMasteryLevels(prev => {
      const updated = { ...prev };
      updated[concept] = Math.max(10, Math.min(100, (updated[concept] || 30) + delta));
      localStorage.setItem(`zipytiny_mastery_${activeSummary.metadata.videoId}`, JSON.stringify(updated));
      return updated;
    });

    awardXp(xpGain);
    
    // Streak multiplier update
    if (Math.random() > 0.7) {
      const nextStreak = streakDays + 1;
      setStreakDays(nextStreak);
      localStorage.setItem('zipytiny_user_streak', nextStreak.toString());
    }

    setShowNotesSavedToast(true);
    setTimeout(() => setShowNotesSavedToast(false), 3000);
  };

  // Notes Quick Insertion Actions
  const handleInsertTakeaways = () => {
    const takeawaysText = activeSummary.takeaways
      .map((t, idx) => {
        const text = typeof t === 'string' ? t : t?.text || '';
        return `- ${text}`;
      })
      .join('\n');
    setNotesText(prev => prev + (prev ? '\n\n' : '') + `### Core Value Takeaways\n` + takeawaysText);
  };

  const handleInsertConcepts = () => {
    const conceptsText = (activeSummary.keyConcepts || [])
      .map((c, idx) => `- **${c.concept}**: ${c.definition}\n  *Analogy*: ${c.simplifiedExplanation}`)
      .join('\n\n');
    setNotesText(prev => prev + (prev ? '\n\n' : '') + `### Key Conceptual Modules\n` + conceptsText);
  };

  // Export Mindmap to PNG
  const handleExportMindmapImage = async () => {
    if (!visitorUser) {
      setAuthModalPurpose('Export high-resolution mind maps as images');
      setShowAuthModal(true);
      return;
    }
    try {
      setIsExportingMindmap(true);
      const container = document.getElementById('workspace-mindmap-container');
      if (!container) {
        throw new Error('Mindmap container not found');
      }

      const dataUrl = await toPng(container, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: {
          padding: '24px',
          borderRadius: '16px',
        }
      });

      const link = document.createElement('a');
      link.download = `zipytiny-mindmap-${activeSummary.metadata.videoId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting mindmap image:', error);
    } finally {
      setIsExportingMindmap(false);
    }
  };

  // Quiz submission
  const handleQuizSubmit = () => {
    let score = 0;
    activeSummary.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    awardXp(score * 30 + (score === activeSummary.quiz.length ? 100 : 0)); // Perfect score bonus

    // Set overall progress graduation
    if (score >= activeSummary.quiz.length / 2) {
      setShowGraduation(true);
    }
  };

  // Calculations for metadata header
  const totalDuration = parseFloat(activeSummary.metadata.duration || '12');
  const estStudyTime = Math.round((totalDuration * 1.5) + 8);
  const difficultyLevel = activeSummary.quiz.length > 4 ? 'Advanced' : 'Intermediate';

  // Progress calculations
  const calculateWorkspaceProgress = () => {
    let checkedItems = 0;
    let totalItems = 4; // Summary, Mindmap/Flashcards, Quiz, Notes

    // 1. Audio generates or starts
    if (audioProgress > 0 || audioUrl) checkedItems += 1;
    // 2. Flashcards flipped or mindmap navigated
    if (Object.keys(revealedFlashcards).length > 0) checkedItems += 1;
    // 3. Quiz submitted
    if (quizSubmitted) checkedItems += 1;
    // 4. Notes written
    if (notesText.length > 50) checkedItems += 1;

    return Math.round((checkedItems / totalItems) * 100);
  };

  const progressPercent = calculateWorkspaceProgress();
  const isSharedPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/s/');

  return (
    <div className="space-y-6">

      {isSharedPath && (
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-850 text-white rounded-3xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-white/10 animate-fadeIn">
          <div className="flex items-center gap-3 text-left">
            <span className="text-2xl bg-indigo-600/30 w-10 h-10 rounded-xl flex items-center justify-center border border-indigo-500/30 shrink-0">
              📚
            </span>
            <div>
              <p className="font-bold text-sm tracking-tight text-white">Public Study Workspace</p>
              <p className="text-xs text-indigo-200/90 leading-relaxed mt-0.5">You are viewing a shared study hub containing interactive summaries, mind maps, and comprehension quizzes.</p>
            </div>
          </div>
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs px-4 py-2.5 rounded-xl transition duration-150 shadow-xs whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            Create Your Own Free Workspace
          </button>
        </div>
      )}
      
      {/* 🚀 PREMIUM LMS DASHBOARD HEADER */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          
          {/* Left: Video Thumbnail with play hover overlay */}
          <div className="lg:col-span-3 flex justify-center lg:justify-start">
            <div className="relative aspect-video w-full max-w-[240px] rounded-2xl overflow-hidden border border-white/20 shadow-lg group">
              <img 
                src={activeSummary.metadata.thumbnailUrl || `https://img.youtube.com/vi/${activeSummary.metadata.videoId}/maxresdefault.jpg`} 
                alt={activeSummary.metadata.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                <Play className="w-8 h-8 text-white fill-white animate-pulse" />
              </div>
              <span className="absolute bottom-2 right-2 bg-black/75 rounded text-[10px] font-mono font-bold text-white px-1.5 py-0.5">
                {activeSummary.metadata.duration ? `${activeSummary.metadata.duration}m` : 'Video'}
              </span>
            </div>
          </div>

          {/* Center: Title & Analytics Metrics */}
          <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-indigo-500/30 uppercase tracking-wider">
                🎓 AI STUDY WORKSPACE
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-amber-500/30 uppercase tracking-wider">
                ⚡ LEVEL {Math.floor(xpPoints / 400) + 1}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                🔥 {streakDays} DAY STREAK
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight leading-snug">
              {activeSummary.metadata.title}
            </h1>

            <p className="text-slate-300 text-xs font-light">
              Parsed from lecture by <strong className="text-white font-medium">{activeSummary.metadata.author}</strong> • ID: <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[11px] text-indigo-200">{activeSummary.metadata.videoId}</span>
            </p>

            {/* Premium Progress Bar */}
            <div className="space-y-2 pt-1 max-w-md mx-auto lg:mx-0">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Overall Course Progress</span>
                <span className="text-emerald-400 font-mono font-bold">{progressPercent}% Completed</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right: Quick LMS Statistics Panel */}
          <div className="lg:col-span-3 bg-white/5 backdrop-blur-md rounded-2xl p-4.5 border border-white/10 space-y-3">
            <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-widest block text-left border-b border-white/10 pb-1.5">
              LECTURE STATS
            </span>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Duration:</span>
                <span className="font-semibold text-slate-100">{activeSummary.metadata.duration ? `${activeSummary.metadata.duration} min` : '15 min'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> Est. Study Time:</span>
                <span className="font-semibold text-slate-100">{estStudyTime} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Difficulty:</span>
                <span className="font-semibold text-slate-100">{difficultyLevel}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🧭 PREMIUM TRI-DIRECTORY NAVIGATION TABS */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-[#f2f2f7] dark:bg-zinc-950 p-2 rounded-3xl gap-2 border border-black/[0.04] dark:border-zinc-800">
        
        {/* Directory 1: UNDERSTAND */}
        <button
          onClick={() => {
            setActiveSection('understand');
            trackGAEvent?.('section_changed', { section: 'understand' });
          }}
          className={`flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-semibold transition cursor-pointer ${
            activeSection === 'understand'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-md font-bold border border-black/[0.02]'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
          }`}
        >
          <div className={`p-2 rounded-xl transition ${activeSection === 'understand' ? 'bg-indigo-600/10 text-indigo-600' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-mono font-bold tracking-wider uppercase text-slate-450 dark:text-zinc-500">SECTION 01</span>
            <span className="text-sm">Understand</span>
          </div>
        </button>

        {/* Directory 2: LEARN */}
        <button
          onClick={() => {
            setActiveSection('learn');
            trackGAEvent?.('section_changed', { section: 'learn' });
          }}
          className={`flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-semibold transition cursor-pointer ${
            activeSection === 'learn'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-md font-bold border border-black/[0.02]'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
          }`}
        >
          <div className={`p-2 rounded-xl transition ${activeSection === 'learn' ? 'bg-indigo-600/10 text-indigo-600' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'}`}>
            <Network className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-mono font-bold tracking-wider uppercase text-slate-450 dark:text-zinc-500">SECTION 02</span>
            <span className="text-sm">Learn & Retain</span>
          </div>
        </button>

        {/* Directory 3: APPLY */}
        <button
          onClick={() => {
            setActiveSection('apply');
            trackGAEvent?.('section_changed', { section: 'apply' });
          }}
          className={`flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-semibold transition cursor-pointer ${
            activeSection === 'apply'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-md font-bold border border-black/[0.02]'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
          }`}
        >
          <div className={`p-2 rounded-xl transition ${activeSection === 'apply' ? 'bg-indigo-600/10 text-indigo-600' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'}`}>
            <Award className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-mono font-bold tracking-wider uppercase text-slate-450 dark:text-zinc-500">SECTION 03</span>
            <span className="text-sm">Apply & Tutor</span>
          </div>
        </button>

      </div>

      {/* 💻 MAIN GRID WORKSPACE MODULES */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Dynamic Content Panel based on directories) */}
        <div className="xl:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* =========================================
                DIRECTORY 1: UNDERSTAND MODULE
                ========================================= */}
            {activeSection === 'understand' && (
              <motion.div
                key="understand-section"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Secondary navigation for Understand */}
                <div className="flex bg-neutral-100 dark:bg-zinc-900 p-1 rounded-xl gap-1 border border-neutral-200/50 dark:border-zinc-800/60 max-w-sm">
                  <button
                    onClick={() => setActiveUnderstandTab('summary')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      activeUnderstandTab === 'summary'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    📝 Executive Summary
                  </button>
                  <button
                    onClick={() => setActiveUnderstandTab('modules')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      activeUnderstandTab === 'modules'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    🧠 Key Concepts Breakdown
                  </button>
                </div>

                {/* Sub-tab: Executive Summary */}
                {activeUnderstandTab === 'summary' && (
                  <div className="space-y-6">
                    
                    {/* TTS Audio Player Block */}
                    <div className="bg-[#f5f5f7] dark:bg-zinc-900 border border-black/[0.02] dark:border-zinc-800/60 rounded-3xl p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block">
                            Speecher Audio Engine
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                            <Volume2 className="w-4 h-4 text-slate-900 dark:text-white" />
                            Listen to Video Briefing (AI Voice)
                          </h4>
                        </div>
                        
                        {!audioUrl && (
                          <button
                            onClick={() => handleGenerateTTS(activeSummary.summary + " key takeaways are: " + activeSummary.takeaways.map((t: any) => typeof t === 'string' ? t : t?.text || '').join(". "))}
                            disabled={ttsLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/10"
                          >
                            {ttsLoading ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Synthesizing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                                Generate AI Audio
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {audioUrl && (
                        <div className="bg-white dark:bg-zinc-950 border border-black/[0.04] dark:border-zinc-800 p-3.5 rounded-2xl flex items-center gap-4 shadow-sm">
                          <button
                            onClick={togglePlay}
                            className="h-9 w-9 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 rounded-full flex items-center justify-center text-white transition active:scale-95 shrink-0 cursor-pointer"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                          </button>

                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                              <span className="truncate block max-w-xs">{activeSummary.metadata.title}</span>
                              <span>{formatTime(audioProgress)} / {formatTime(audioDuration)}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1 relative overflow-hidden">
                              <div 
                                className="bg-slate-900 dark:bg-white h-1 rounded-full" 
                                style={{ width: `${(audioProgress / (audioDuration || 1)) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                        🎙️ Utilizing Gemini TTS, this narrates the main video thesis directly into rich audiotape briefs.
                      </p>
                    </div>

                    {/* Executive Summary Narrative Text */}
                    <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-850 p-6 rounded-3xl shadow-sm text-left space-y-3">
                      <h3 className="text-base font-bold font-display text-slate-900 dark:text-white border-l-4 border-indigo-600 pl-3">
                        Executive Core Thesis & Narrative
                      </h3>
                      <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-sans">
                        {activeSummary.summary}
                      </p>
                    </div>

                    {/* Value Takeaways & direct lessons */}
                    <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-850 p-6 rounded-3xl shadow-sm text-left space-y-4">
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-850 dark:text-zinc-200">
                        💡 Direct Takeaways & Lessons
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {activeSummary.takeaways.map((item: any, idx: number) => {
                          const text = typeof item === 'string' ? item : item?.text || '';
                          const isLowConfidence = typeof item !== 'string' && item?.lowConfidence;
                          return (
                            <div key={idx} className="flex gap-3.5 items-start p-3 rounded-xl border border-black/[0.02] dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
                              <span className="w-5 h-5 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">{text}</p>
                                {isLowConfidence && (
                                  <span className="inline-flex items-center gap-1 text-[9px] text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 px-1.5 py-0.5 rounded-md font-mono font-semibold">
                                    <AlertCircle className="w-3 h-3" /> Potential inaccuracy detected
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive Segments chapters */}
                    <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-850 p-6 rounded-3xl shadow-sm text-left space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                          <Video className="w-4 h-4 text-indigo-600" />
                          Interactive Segments Timeline
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Click any segment time-stamp to jump directly to that part of the video player.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {activeSummary.chapters.map((chap, idx) => (
                          <button
                            key={idx}
                            onClick={() => onJumpToTimestamp(chap.secondsCount)}
                            className="w-full text-left p-3.5 rounded-xl border border-neutral-200/80 dark:border-zinc-800 hover:border-indigo-500 hover:bg-neutral-50/50 dark:hover:bg-zinc-950/40 transition duration-150 flex gap-3 group cursor-pointer"
                          >
                            <div className="font-mono text-[10px] font-bold text-[#0071e3] bg-[#0071e3]/5 dark:bg-[#0071e3]/10 group-hover:bg-[#0071e3]/10 px-2.5 py-1 rounded-md h-fit w-fit whitespace-nowrap">
                              ⏱ {chap.timestamp}
                            </div>
                            <div className="space-y-0.5 overflow-hidden">
                              <h5 className="text-xs font-bold text-neutral-800 dark:text-zinc-100 font-display group-hover:text-indigo-600 transition leading-tight">
                                {chap.title}
                              </h5>
                              <p className="text-[#86868b] dark:text-zinc-400 text-xs leading-relaxed truncate">
                                {chap.takeaway}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* Sub-tab: Key Concepts Breakdown */}
                {activeUnderstandTab === 'modules' && (
                  <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-850 p-6 rounded-3xl shadow-sm space-y-4 text-left">
                    <div>
                      <h3 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <Brain className="w-4.5 h-4.5 text-indigo-600" />
                        Structured Learning Modules & Core Concepts
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-normal">
                        Complex academic paradigms distilled with plain-English metaphors to establish high conceptual retention.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      {activeSummary.keyConcepts?.map((item: KeyConcept, idx: number) => {
                        const mastery = masteryLevels[item.concept] || 30;
                        return (
                          <div 
                            key={idx} 
                            className="border border-neutral-150 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 p-4.5 rounded-2xl space-y-3 hover:shadow-sm transition"
                          >
                            <div className="flex items-center justify-between border-b dark:border-zinc-850 pb-2 flex-wrap gap-2">
                              <span className="text-xs font-bold font-display text-slate-900 dark:text-white bg-white dark:bg-zinc-900 border dark:border-zinc-800 px-2.5 py-1 rounded-lg">
                                📘 {item.concept}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                                  MODULE #{idx + 1}
                                </span>
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                  mastery >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {mastery}% Mastered
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3 font-sans text-xs text-slate-700 dark:text-zinc-300">
                              <p className="leading-relaxed">
                                <strong className="font-semibold text-slate-850 dark:text-zinc-200 block mb-0.5">Academic Definition:</strong>
                                {item.definition}
                              </p>

                              <div className="bg-amber-50 dark:bg-amber-950/15 rounded-xl p-3.5 border border-amber-100 dark:border-amber-900/40 leading-relaxed text-amber-950 dark:text-amber-300">
                                <strong className="block text-amber-950 dark:text-amber-200 font-bold mb-1">💡 Metaphorical Analogy:</strong>
                                {item.simplifiedExplanation}
                              </div>
                            </div>

                            {/* Spaced repetition rate widget */}
                            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1.5 border-t dark:border-zinc-850 border-dashed">
                              <span className="text-[10px] text-slate-450 dark:text-zinc-500 font-medium">Verify your recall of this module:</span>
                              <div className="flex gap-1.5 flex-wrap">
                                <button
                                  onClick={() => handleRateRecall(item.concept, 'forgot')}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-[10px] font-bold border border-rose-200/50 transition cursor-pointer"
                                >
                                  Forgot
                                </button>
                                <button
                                  onClick={() => handleRateRecall(item.concept, 'hard')}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-200/50 transition cursor-pointer"
                                >
                                  Hard
                                </button>
                                <button
                                  onClick={() => handleRateRecall(item.concept, 'good')}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200/50 transition cursor-pointer"
                                >
                                  Good
                                </button>
                                <button
                                  onClick={() => handleRateRecall(item.concept, 'easy')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200/50 transition cursor-pointer"
                                >
                                  Easy
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* =========================================
                DIRECTORY 2: LEARN MODULE
                ========================================= */}
            {activeSection === 'learn' && (
              <motion.div
                key="learn-section"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Secondary navigation for Learn */}
                <div className="flex bg-neutral-100 dark:bg-zinc-900 p-1 rounded-xl gap-1 border border-neutral-200/50 dark:border-zinc-800/60 max-w-md">
                  <button
                    onClick={() => setActiveLearnTab('mindmap')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      activeLearnTab === 'mindmap'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    🗺️ Interactive Mind Map
                  </button>
                  <button
                    onClick={() => setActiveLearnTab('flashcards')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      activeLearnTab === 'flashcards'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    ⚡ Recall Flashcards
                  </button>
                  <button
                    onClick={() => setActiveLearnTab('study-plan')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      activeLearnTab === 'study-plan'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    📅 Study Plan
                  </button>
                </div>

                {/* Sub-tab: Mind Map */}
                {activeLearnTab === 'mindmap' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-150 dark:border-zinc-800 pb-4">
                      <div className="text-left">
                        <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                          Interactive Topic Mind Map
                        </h3>
                        <p className="text-slate-500 text-xs mt-1">
                          Synthesized core topics branch maps. Export this map anytime to support physical flashcard systems.
                        </p>
                      </div>
                      <button
                        onClick={handleExportMindmapImage}
                        disabled={isExportingMindmap}
                        className="self-start sm:self-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
                      >
                        {isExportingMindmap ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Exporting Map...</span>
                          </>
                        ) : (
                          <>
                            <CameraIcon className="w-3.5 h-3.5" />
                            <span>Export Map Image</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div id="workspace-mindmap-container" className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-neutral-150 dark:border-zinc-800 space-y-6 text-left">
                      <div className="border-b border-neutral-100 dark:border-zinc-800 pb-4">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded">
                          🧠 ZIPYTINY ACTIVE LEARNING MAP
                        </span>
                        <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mt-2">
                          {activeSummary.metadata.title}
                        </h3>
                        <p className="text-neutral-500 text-xs mt-0.5">
                          Extracted dynamically from raw video source
                        </p>
                      </div>

                      {/* Mindmap Nodes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from(new Set(activeSummary.mindmap.map((item) => item.category))).map((category) => (
                          <div key={category} className="bg-neutral-50 dark:bg-zinc-900/60 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-4.5 space-y-3">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-800 dark:text-zinc-200 bg-neutral-200/80 dark:bg-zinc-800 px-2.5 py-1 rounded inline-block">
                              📂 {category}
                            </span>
                            
                            <div className="space-y-2.5">
                              {activeSummary.mindmap
                                .filter((item) => item.category === category)
                                .map((node, index) => (
                                  <div
                                    key={index}
                                    className="bg-white dark:bg-zinc-950 border border-neutral-200/80 dark:border-zinc-800 p-3 rounded-xl transition shadow-xs space-y-1 hover:border-indigo-500"
                                  >
                                    <h4 className="text-xs font-bold text-neutral-800 dark:text-zinc-200">
                                      💡 {node.concept}
                                    </h4>
                                    <p className="text-[11px] text-neutral-500 dark:text-zinc-400 leading-normal font-sans">
                                      {node.description}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab: Recall Flashcards */}
                {activeLearnTab === 'flashcards' && (
                  <div className="space-y-5 text-left">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-800 dark:text-white font-display">
                        ⚡ Active Recall Flashcard Decks
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Test your memory! Recall the answer in your head, then click the card to flip and verify your understanding.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {activeSummary.flashcards?.map((card: Flashcard, idx: number) => {
                        const isRevealed = revealedFlashcards[idx] || false;
                        return (
                          <div 
                            key={idx}
                            onClick={() => {
                              setRevealedFlashcards(prev => ({ ...prev, [idx]: !prev[idx] }));
                              trackGAEvent?.('flashcard_flipped_workspace', { index: idx });
                            }}
                            className="h-44 w-full cursor-pointer perspective"
                          >
                            <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style ${isRevealed ? 'rotate-y-180' : ''}`}>
                              
                              {/* Card Front */}
                              <div className="absolute w-full h-full backface-hidden bg-white dark:bg-zinc-900 hover:bg-neutral-50 dark:hover:bg-zinc-850 border-2 border-dashed border-neutral-300 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between text-left shadow-xs">
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                                    QUESTION #{idx + 1}
                                  </span>
                                  <h5 className="text-[12px] font-bold text-neutral-800 dark:text-zinc-100 line-clamp-4 leading-relaxed font-sans">
                                    {card.question}
                                  </h5>
                                </div>
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold font-mono tracking-wide mt-2 block">
                                  Tap to Flip & Reveal
                                </span>
                              </div>

                              {/* Card Back */}
                              <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-[#1d1d1f] to-indigo-950 text-white text-left rotate-y-180 shadow-md rounded-2xl p-5 flex flex-col justify-between">
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                                    ANSWER METRICS
                                  </span>
                                  <p className="text-xs leading-relaxed text-indigo-100 font-sans max-h-24 overflow-y-auto">
                                    {card.answer}
                                  </p>
                                </div>
                                <span className="text-[10px] text-gray-400 font-semibold font-mono block">
                                  ↩ Click to flip back
                                </span>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-tab: Study Plan */}
                {activeLearnTab === 'study-plan' && (
                  <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-850 p-6 rounded-3xl shadow-sm text-left space-y-5">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                        <Calendar className="w-4.5 h-4.5 text-indigo-600" />
                        Custom AI Lecture Study Plan
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        A calibrated cognitive timeline configured specifically to master this video's insights.
                      </p>
                    </div>

                    <div className="space-y-4">
                      
                      {/* Interactive Calendar Milestones */}
                      {[
                        { 
                          day: "Day 1: Initial Comprehension", 
                          time: "15 mins",
                          desc: "Read through the Executive Summary and bulleted Value Takeaways. Listen to the Speecher TTS audio briefing while commuting.", 
                          status: "Completed",
                          icon: <BookOpen className="w-4 h-4 text-emerald-500" />
                        },
                        { 
                          day: "Day 3: Active Metacognition", 
                          time: "10 mins",
                          desc: "Map concepts via the Interactive Mind Map. Check recall definitions on the key module analogies.", 
                          status: "Due Today",
                          icon: <Brain className="w-4 h-4 text-indigo-500" />
                        },
                        { 
                          day: "Day 7: Spaced Recall Check", 
                          time: "12 mins",
                          desc: "Cram flashcard drills and attempt the Comprehension check quiz. Maintain your learning streak multiplier.", 
                          status: "Pending",
                          icon: <Award className="w-4 h-4 text-slate-400" />
                        },
                        { 
                          day: "Day 15: Mastery Consolidation", 
                          time: "8 mins",
                          desc: "Review your personal saved notes and export your core curriculum blueprints into your digital workspace.", 
                          status: "Pending",
                          icon: <Calendar className="w-4 h-4 text-slate-400" />
                        },
                      ].map((item, index) => (
                        <div key={index} className="flex gap-4 p-4.5 rounded-2xl border dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20">
                          <div className="shrink-0 mt-0.5">
                            {item.icon}
                          </div>
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex justify-between items-center flex-wrap gap-1">
                              <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{item.day}</h5>
                              <span className="text-[10px] bg-slate-200 dark:bg-zinc-850 px-2 py-0.5 rounded-md font-mono text-slate-600 dark:text-zinc-400 font-bold">{item.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-normal">{item.desc}</p>
                            <span className={`text-[10px] font-mono font-bold uppercase inline-block ${
                              item.status === 'Completed' ? 'text-emerald-600' : item.status === 'Due Today' ? 'text-indigo-600' : 'text-slate-400'
                            }`}>
                              ● {item.status}
                            </span>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* =========================================
                DIRECTORY 3: APPLY MODULE
                ========================================= */}
            {activeSection === 'apply' && (
              <motion.div
                key="apply-section"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Secondary navigation for Apply */}
                <div className="flex bg-neutral-100 dark:bg-zinc-900 p-1 rounded-xl gap-1 border border-neutral-200/50 dark:border-zinc-800/60 overflow-x-auto max-w-lg scrollbar-none">
                  <button
                    onClick={() => setActiveApplyTab('quiz')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                      activeApplyTab === 'quiz'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    🧠 Practice Quiz
                  </button>
                  <button
                    onClick={() => setActiveApplyTab('tutor')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                      activeApplyTab === 'tutor'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    💬 AI Study Tutor
                  </button>
                  <button
                    onClick={() => setActiveApplyTab('notes')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                      activeApplyTab === 'notes'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    ✍️ Smart Notes
                  </button>
                  <button
                    onClick={() => setActiveApplyTab('export')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                      activeApplyTab === 'export'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    💾 Export Reports
                  </button>
                  <button
                    onClick={() => setActiveApplyTab('comments')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                      activeApplyTab === 'comments'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    💬 Discussion
                  </button>
                </div>

                {/* Sub-tab: Quiz */}
                {activeApplyTab === 'quiz' && (
                  <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-850 p-6 rounded-3xl shadow-sm space-y-5 text-left animate-fadeIn">
                    <div>
                      <h4 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                        Interactive Lecture Quiz & Retention Check
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Prove your comprehension! Complete the quiz check below to officially graduate this lecture and secure bonus experience points.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {activeSummary.quiz.map((q: QuizQuestion, idx: number) => {
                        const selectedOpt = selectedAnswers[idx];
                        const submitted = quizSubmitted;
                        const isCorrect = selectedOpt === q.answerIndex;

                        return (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-2xl border transition duration-150 ${
                              submitted
                                ? isCorrect
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-900'
                                  : 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-250 dark:border-rose-900'
                                : 'bg-slate-50/50 dark:bg-zinc-950/20 border-neutral-200 dark:border-zinc-800'
                            }`}
                          >
                            <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-100 leading-normal flex gap-2">
                              <span className="font-mono text-indigo-600 dark:text-indigo-400">Q{idx + 1}.</span>
                              <span>{q.question}</span>
                            </h5>

                            <div className="grid grid-cols-1 gap-2 mt-3 text-left">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = selectedOpt === optIdx;
                                const isCorrectOpt = optIdx === q.answerIndex;

                                let optionStyle = "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-neutral-50";
                                if (isSelected) optionStyle = "border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-300 font-semibold";

                                if (submitted) {
                                  if (isCorrectOpt) {
                                    optionStyle = "border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold";
                                  } else if (isSelected) {
                                    optionStyle = "border-rose-400 bg-rose-100 dark:bg-rose-950/40 text-rose-950 dark:text-rose-300";
                                  } else {
                                    optionStyle = "border-neutral-100 dark:border-zinc-850 bg-white/50 text-slate-400 dark:text-zinc-550 pointer-events-none";
                                  }
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    disabled={submitted}
                                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                                    className={`w-full text-left px-3.5 py-3 rounded-xl border text-xs transition cursor-pointer flex justify-between items-center ${optionStyle}`}
                                  >
                                    <span>{opt}</span>
                                    {isSelected && !submitted && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                                    {submitted && isCorrectOpt && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                                  </button>
                                );
                              })}
                            </div>

                            {submitted && (
                              <div className="mt-3 p-3 bg-neutral-100 dark:bg-zinc-800 rounded-xl text-xs text-slate-600 dark:text-zinc-300 flex gap-2.5">
                                <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="font-semibold block text-slate-800 dark:text-white">Explanation:</strong>
                                  <p className="mt-0.5 leading-relaxed">{q.explanation}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-3 border-t dark:border-zinc-800 flex items-center justify-between flex-wrap gap-4">
                      {!quizSubmitted ? (
                        <button
                          type="button"
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(selectedAnswers).length < activeSummary.quiz.length}
                          className="w-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white py-3 rounded-xl text-xs font-semibold cursor-pointer text-center transition disabled:opacity-45"
                        >
                          Lock Study Answers & Score Quiz (+XP)
                        </button>
                      ) : (
                        <div className="flex justify-between items-center w-full">
                          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-2 rounded-xl font-mono">
                            📊 Graduation Score: {quizScore} / {activeSummary.quiz.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAnswers({});
                              setQuizSubmitted(false);
                            }}
                            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300 font-bold cursor-pointer"
                          >
                            Reset Comprehension Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-tab: AI Tutor */}
                {activeApplyTab === 'tutor' && (
                  <div className="space-y-4">
                    <AIChatWithSummary 
                      title={activeSummary.metadata.title}
                      summary={activeSummary.summary}
                      getHeaders={getHeaders}
                    />
                  </div>
                )}

                {/* Sub-tab: Smart Notes */}
                {activeApplyTab === 'notes' && (
                  <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-850 p-6 rounded-3xl shadow-sm text-left space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h4 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                          <Edit3 className="w-4.5 h-4.5 text-indigo-600" />
                          Premium Lecture Notes Notebook
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Draft, study, and auto-save custom markdown learning logs directly connected to this video block.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleInsertTakeaways}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold px-2.5 py-1.5 rounded-lg border dark:border-zinc-700 cursor-pointer"
                        >
                          + Add Takeaways
                        </button>
                        <button
                          onClick={handleInsertConcepts}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold px-2.5 py-1.5 rounded-lg border dark:border-zinc-700 cursor-pointer"
                        >
                          + Add Concepts
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="Start typing your personalized lecture analysis notes here... Supports raw markdown structures."
                        rows={10}
                        className="w-full text-xs p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-950/20 focus:bg-white outline-none focus:border-indigo-500 transition font-mono leading-relaxed"
                      />
                      <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-mono">
                        Auto-saved in browser cache
                      </div>
                    </div>

                    <div className="flex justify-between items-center flex-wrap gap-2 pt-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(notesText);
                            setShowNotesSavedToast(true);
                            setTimeout(() => setShowNotesSavedToast(false), 2000);
                          }}
                          className="text-xs bg-indigo-650 hover:bg-indigo-700 text-indigo-600 font-semibold px-4 py-2 rounded-xl border border-indigo-100 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                          <span>Copy Notes</span>
                        </button>
                        
                        <button
                          onClick={() => setNotesText('')}
                          className="text-xs hover:bg-rose-50 text-rose-600 font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear Notes</span>
                        </button>
                      </div>

                      {showNotesSavedToast && (
                        <span className="text-[11px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-500" /> Notes Updated & Copied!
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-tab: Export Report */}
                {activeApplyTab === 'export' && (
                  <div className="space-y-6">
                    <SummaryPremiumExporter 
                      title={activeSummary.metadata.title}
                      summary={activeSummary.summary}
                      takeaways={activeSummary.takeaways}
                      shareId={activeSummary.shareId}
                    />
                  </div>
                )}

                {/* Sub-tab: Discussion & Reactions */}
                {activeApplyTab === 'comments' && (
                  <div className="space-y-6 animate-fadeIn">
                    <WorkspaceComments 
                      shareId={activeSummary.shareId || ''}
                      visitorUser={visitorUser}
                      setShowAuthModal={setShowAuthModal}
                    />
                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Column: Embedded Video & Learning Statistics (Persistent for quick access) */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Persistent Video Player block */}
          <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-850 p-6 rounded-3xl shadow-sm text-left space-y-3.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Youtube className="w-4 h-4 text-rose-600 fill-rose-600/10" />
              Synchronized Lecture Media Player
            </span>
            
            <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-md border border-black/[0.08] relative">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeSummary.metadata.videoId}?start=${ytStartSeconds !== null ? ytStartSeconds : 0}&autoplay=${ytStartSeconds !== null ? '1' : '0'}`}
                title={activeSummary.metadata.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>

            {ytStartSeconds !== null && (
              <div className="flex items-center justify-between text-[11px] text-[#1d1d1f] bg-white px-3.5 py-2 rounded-xl border border-black/[0.04] shadow-xs">
                <span>🎬 Teleported to: <strong className="font-semibold">{formatTime(ytStartSeconds)}</strong></span>
                <button 
                  onClick={onResetJump}
                  className="font-mono font-bold text-slate-500 hover:text-indigo-600 uppercase text-[9px] cursor-pointer transition"
                >
                  Reset Play
                </button>
              </div>
            )}
          </div>

          {/* Gamified study operating core */}
          <div className="bg-gradient-to-br from-slate-900 to-[#1d1d1f] text-white rounded-3xl p-6 border border-white/10 shadow-lg space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4.5 h-4.5 text-amber-400" />
                <h4 className="font-bold font-display text-sm text-white">Comprehension Master</h4>
              </div>
              <div className="flex items-center gap-1 bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono">
                CLAIMABLE TODAY
              </div>
            </div>

            {/* XP progress bars */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-end text-xs">
                <span className="text-slate-400 font-mono">XP GAINED: {xpPoints} XP</span>
                <span className="text-amber-400 font-bold font-mono">Next target: {400 - (xpPoints % 400)} XP</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-300"
                  style={{ width: `${((xpPoints % 400) / 400) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                <span className="text-neutral-400 text-[10px] uppercase font-mono block">Streak active</span>
                <strong className="text-sm text-white font-mono mt-0.5 block">{streakDays} Days 🔥</strong>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                <span className="text-neutral-400 text-[10px] uppercase font-mono block">Accuracy rate</span>
                <strong className="text-sm text-white font-mono mt-0.5 block">
                  {quizSubmitted ? `${Math.round((quizScore / activeSummary.quiz.length) * 100)}%` : 'No test yet'}
                </strong>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => {
                const checkedToday = localStorage.getItem('zipytiny_checked_today');
                if (checkedToday === new Date().toDateString()) {
                  alert('Streak reward already claimed! Check back tomorrow morning to keep driving your active daily streak.');
                  return;
                }
                localStorage.setItem('zipytiny_checked_today', new Date().toDateString());
                awardXp(55);
                setStreakDays(prev => prev + 1);
                alert('🔥 Learning Streak claimed! +55 XP added to your experience catalog.');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer text-center"
            >
              Claim Streak Check-In Reward (+55 XP)
            </button>
          </div>

          {/* Quick study instructions guidelines card */}
          <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-850 p-6 rounded-3xl shadow-sm text-left space-y-3.5">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-500 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              Workspace Study Guidelines
            </h4>
            <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-2 leading-relaxed pl-1.5 list-disc">
              <li>Review the <strong className="text-indigo-600">Understand</strong> core thesis modules first.</li>
              <li>Practice recall on the <strong className="text-indigo-600">Learn</strong> flashcard templates repeatedly.</li>
              <li>Test and verify under <strong className="text-indigo-600">Apply</strong> to confirm concept mastery status.</li>
              <li>Export study reports to lock in offline long-term memory logs.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Back button to search dashboard */}
      <div className="flex justify-start pt-4 border-t dark:border-zinc-800">
        <button
          onClick={onBackToCenter}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
        >
          <span>←</span>
          <span>Back to Search Dashboard</span>
        </button>
      </div>

    </div>
  );
}

// Simple fallback camera icon if not standard
function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
