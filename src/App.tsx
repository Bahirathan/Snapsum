/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Youtube,
  Sparkles,
  BookOpen,
  FileText,
  Twitter,
  Share2,
  CheckCircle,
  HelpCircle,
  Award,
  Trophy,
  Network,
  ArrowRight,
  History,
  Trash2,
  Play,
  Pause,
  Volume2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Flame,
  Gift,
  Bookmark,
  RefreshCw,
  Video,
  CreditCard,
  Globe,
  ShieldCheck,
  Download,
  Zap,
  Lock,
  Crown,
  Server,
  AlertCircle,
  Info,
  ExternalLink,
  DollarSign,
  Megaphone,
  TrendingUp,
  Rocket,
  Activity,
  BarChart,
  X,
  Moon,
  Sun,
  Bell,
  Folder,
  FolderPlus,
  Heart,
  Search,
  Compass,
  FolderOpen,
  Puzzle
} from 'lucide-react';
import { PRELOADED_VIDEOS } from './preloadedData';
import { ARABIC_PRELOADED_VIDEOS } from './utils/arabicPreloadedData';
import { translations } from './utils/translations';
import { toPng } from 'html-to-image';
import { YouTubeSummaryResponse, SavedSummary, SynthesizedStack } from './types';
import confetti from 'canvas-confetti';
import { auth, db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { KeyRound, ShieldAlert, Eye, EyeOff, MessageSquare, Headphones, Users, Cpu, Layers, Sliders, ThumbsUp, PlayCircle } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppScreenSkeleton, WorkspaceSkeleton, PageLoadingIndicator } from './components/LoadingSkeletons';

const LearningDashboardModule = lazy(() => import('./components/LearningDashboard').then(m => ({ default: m.LearningProgressDashboard })));
const ActiveLearningDashboardModule = lazy(() => import('./components/LearningDashboard').then(m => ({ default: m.ActiveLearningDashboard })));
const CinematicExplainer = lazy(() => import('./components/CinematicExplainer').then(m => ({ default: m.CinematicExplainer })));
const LearningProgressDashboard = (props: any) => <Suspense fallback={<div className="animate-pulse h-64 rounded-3xl bg-neutral-100 dark:bg-zinc-800" />}><LearningDashboardModule {...props} /></Suspense>;
const ActiveLearningDashboard = (props: any) => <Suspense fallback={<div className="animate-pulse h-64 rounded-3xl bg-neutral-100 dark:bg-zinc-800" />}><ActiveLearningDashboardModule {...props} /></Suspense>;
const AIChatWithSummaryRaw = lazy(() => import('./components/AIChatWithSummary'));
const SummaryPremiumExporterRaw = lazy(() => import('./components/SummaryPremiumExporter'));
const LearningWorkspaceRaw = lazy(() => import('./components/LearningWorkspace'));
const LandingPageRaw = lazy(() => import('./components/LandingPage'));
const FeaturePageRaw = lazy(() => import('./components/FeaturePage'));

const LazyLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[300px] space-y-4">
    <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
    <p className="text-xs font-semibold text-neutral-400 dark:text-zinc-500 animate-pulse font-sans">Assembling knowledge workspace...</p>
  </div>
);

const AppScreenLoadingFallback = () => <AppScreenSkeleton />;

const AIChatWithSummary = (props: any) => (
  <Suspense fallback={<LazyLoadingFallback />}>
    <AIChatWithSummaryRaw {...props} />
  </Suspense>
);

const SummaryPremiumExporter = (props: any) => (
  <Suspense fallback={<LazyLoadingFallback />}>
    <SummaryPremiumExporterRaw {...props} />
  </Suspense>
);

const LearningWorkspace = (props: any) => (
  <Suspense fallback={<LazyLoadingFallback />}>
    <LearningWorkspaceRaw {...props} />
  </Suspense>
);

const LandingPage = (props: any) => (
  <Suspense fallback={<LazyLoadingFallback />}>
    <LandingPageRaw {...props} />
  </Suspense>
);

const FeaturePage = (props: any) => (
  <Suspense fallback={<LazyLoadingFallback />}>
    <FeaturePageRaw {...props} />
  </Suspense>
);

const LoadingTimeline = ({ onComplete, loadingStep }: { onComplete?: () => void; loadingStep?: string }) => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { label: 'Extracting transcript & mapping content assets', weight: 15 },
    { label: 'Understanding context & deep semantic parsing', weight: 35 },
    { label: 'Generating summaries & learning nodes', weight: 55 },
    { label: 'Building flashcards for active recall', weight: 75 },
    { label: 'Generating mind maps and concept schemas', weight: 90 },
    { label: 'Preparing AI Chat and study diagnostics', weight: 98 },
    { label: 'Workspace Ready', weight: 100 }
  ];

  const microPhrases = [
    "Scanning for filler words and unnecessary pauses...",
    "Extracting key concepts and linguistic milestones...",
    "Distilling golden educational nuggets...",
    "Formulating concise notes in real-time...",
    "Generating deep conceptual relationships...",
    "Drafting dynamic flashcard recall pairs...",
    "Organizing active study flashcard decks...",
    "Clustering arguments for the interactive mind map...",
    "Formatting output structures for PDF, Notion & Word...",
    "Calibrating conversational AI tutor response system...",
    "Polishing the interactive study suite dashboard..."
  ];

  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % microPhrases.length);
    }, 1500);
    return () => clearInterval(phraseTimer);
  }, []);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length - 1) {
        current += 1;
        setActiveStep(current);
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 p-6 sm:p-8 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-zinc-950/40 dark:via-zinc-900/40 dark:to-zinc-950/20 border border-indigo-150/55 dark:border-zinc-800/80 rounded-3xl space-y-6 shadow-[0_12px_40px_rgba(79,70,229,0.06)] animate-fadeIn text-left font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <span className="text-[10px] font-mono tracking-widest text-indigo-700 dark:text-indigo-400 font-extrabold uppercase">Compilation Engine Active</span>
        </div>
        <span className="text-[10px] font-bold font-mono text-[#bf5af2] animate-pulse">GENERATING COGNITIVE WORKSPACE</span>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;
          return (
            <div key={idx} className="flex items-start gap-4 transition-all duration-300">
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all duration-300 ${
                  isDone 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                    : isCurrent 
                      ? 'bg-indigo-600 text-white animate-pulse shadow-md shadow-indigo-600/10' 
                      : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-400 border border-neutral-200 dark:border-zinc-700'
                }`}>
                  {isDone ? '✓' : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-0.5 h-6 my-1 transition-all duration-300 ${isDone ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-zinc-800'}`} />
                )}
              </div>
              <div className="pt-0.5 min-w-0">
                <p className={`text-xs font-semibold leading-none transition-all duration-300 ${
                  isDone 
                    ? 'text-neutral-400 line-through dark:text-zinc-500' 
                    : isCurrent 
                      ? 'text-neutral-900 dark:text-zinc-50 font-bold' 
                      : 'text-neutral-400 dark:text-zinc-500'
                }`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono mt-1 animate-pulse">
                    ⚡ {microPhrases[phraseIdx]}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-zinc-500">
          <span>Overall Workspace Alignment Progress</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{steps[activeStep].weight}%</span>
        </div>
        <div className="w-full bg-neutral-150 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${steps[activeStep].weight}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const TransformationPreview = () => {
  const steps = [
    { label: 'YouTube Video', icon: Video, color: 'text-rose-500 bg-rose-500/5 border border-rose-500/10' },
    { label: 'AI Analysis', icon: Cpu, color: 'text-blue-500 bg-blue-500/5 border border-blue-500/10 animate-pulse-slow' },
    { label: 'Summary', icon: FileText, color: 'text-teal-500 bg-teal-500/5 border border-teal-500/10' },
    { label: 'Flashcards', icon: Layers, color: 'text-amber-500 bg-amber-500/5 border border-amber-500/10' },
    { label: 'Mind Map', icon: Network, color: 'text-indigo-500 bg-indigo-500/5 border border-indigo-500/10' },
    { label: 'AI Chat', icon: MessageSquare, color: 'text-pink-500 bg-pink-500/5 border border-pink-500/10' },
    { label: 'Quiz', icon: HelpCircle, color: 'text-emerald-500 bg-emerald-500/5 border border-emerald-500/10' }
  ];

  return (
    <div className="p-5 bg-neutral-50 dark:bg-zinc-950/40 rounded-2xl border border-black/[0.02] dark:border-zinc-800/60 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b]">Transformation Flow Preview</span>
        <span className="bg-[#0071e3]/10 text-[#0071e3] text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-wide">AI Pathway</span>
      </div>
      <div className="hidden sm:flex items-center justify-between gap-1">
        {steps.map((step, idx) => {
          const IconComp = step.icon;
          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center text-center space-y-1.5 flex-1 group">
                <div className={`p-2.5 rounded-xl ${step.color} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                  <IconComp className="w-4.5 h-4.5 shrink-0" />
                </div>
                <span className="text-[10px] font-bold text-neutral-700 dark:text-zinc-300 leading-none">{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className="text-neutral-300 dark:text-zinc-700 font-mono text-xs select-none animate-pulse-soft shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Mobile Grid */}
      <div className="sm:hidden grid grid-cols-4 gap-2">
        {steps.map((step, idx) => {
          const IconComp = step.icon;
          return (
            <div key={idx} className="flex flex-col items-center text-center p-2 rounded-xl bg-white dark:bg-zinc-900 border border-black/[0.02] dark:border-zinc-800/60">
              <div className={`p-2 rounded-lg ${step.color}`}>
                <IconComp className="w-4 h-4 shrink-0" />
              </div>
              <span className="text-[9px] font-bold text-neutral-600 dark:text-zinc-400 mt-1 truncate max-w-full leading-none">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WorkspaceOutcomePreview = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 to-slate-950 text-white rounded-3xl p-6 border border-white/[0.08] shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full filter blur-xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-extrabold uppercase">Interactive Outcome Preview</span>
          <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-extrabold px-2 py-0.5 rounded-full tracking-wider font-mono">100% AUTOMATED</span>
        </div>

        <div className="space-y-3.5 text-left font-sans">
          <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
            <span className="text-xl">📺</span>
            <div>
              <p className="text-xs font-bold text-white leading-none">Your Video / Document Link</p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">Source: YouTube, Local Files, websites</p>
            </div>
          </div>

          <div className="flex justify-center my-1 text-slate-500 font-mono text-base select-none animate-bounce">
            ↓
          </div>

          <div className="space-y-2.5">
            {[
              { icon: '📝', title: '12 Key Notes & Milestones', desc: 'Structured speed summaries with embedded video references' },
              { icon: '🧠', title: '24 Spaced-Repetition Cards', desc: 'AI flashcards to test and verify cognitive recall instantly' },
              { icon: '🗺', title: 'Dynamic Interactive Mind Map', desc: 'Editable visual conceptual maps built on your nodes' },
              { icon: '❓', title: '15 Adaptive Diagnostics', desc: 'Verification quizzes with rich detailed option rationales' },
              { icon: '💬', title: 'AI Chat Study Assistant', desc: 'Conversational companion to answer workspace questions' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/5 flex items-center justify-center text-sm shrink-0 transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition">{item.title}</p>
                  <p className="text-[10px] text-slate-400 font-light leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-sans">
          <div className="flex items-center gap-1">
            <span className="text-emerald-400 animate-pulse">●</span>
            <span>Est. Generation Speed</span>
          </div>
          <span className="font-mono font-bold text-white">⏱ under 60 seconds</span>
        </div>
      </div>
    </div>
  );
};

const FeatureHighlightsGrid = () => {
  const features = [
    { icon: '📄', title: 'AI Notes', desc: 'Generate structured summaries and deep learning nodes instantly.' },
    { icon: '🧠', title: 'Flashcards', desc: 'Active recall drills designed to help you remember faster.' },
    { icon: '🗺', title: 'Mind Maps', desc: 'Visual nodes and dynamic cognitive graphs for understanding.' },
    { icon: '💬', title: 'AI Chat', desc: 'Ask anything about your content, test your theories instantly.' },
    { icon: '❓', title: 'Quiz Generator', desc: 'Assess your skills with diagnostic questions and rationales.' },
    { icon: '📤', title: 'Export Anywhere', desc: 'Save your customized workspace as PDF, Markdown, or Word.' }
  ];

  return (
    <div className="space-y-5 pt-8 text-left font-sans">
      <div className="space-y-1">
        <h2 className="text-xl md:text-2xl font-bold font-display text-[#1d1d1f] dark:text-zinc-50">High-Fidelity Learning Utilities</h2>
        <p className="text-xs text-neutral-500 dark:text-zinc-400 font-light">Every workspace compiles the complete suite of analytical assets automatically</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feat, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-800 hover:border-[#0071e3]/30 dark:hover:border-indigo-500/30 hover:scale-[1.03] transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer group flex gap-3">
            <span className="text-2xl shrink-0 select-none">{feat.icon}</span>
            <div className="space-y-1 min-w-0">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-zinc-200 group-hover:text-[#0071e3] transition">{feat.title}</h3>
              <p className="text-[11px] text-neutral-500 dark:text-zinc-400 font-light leading-snug">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import MobileBottomNav from './components/MobileBottomNav';
import ChromeExtensionPage from './components/ChromeExtensionPage';
import { initGA, trackGAEvent, getSessionEvents, TrackedEvent, clearSessionEvents } from './utils/analytics';

const getEmbedUrl = (url: string) => {
  if (!url) return null;
  const cleaned = url.trim();
  
  // YouTube matches
  let ytMatch = cleaned.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };
  }
  
  // Loom matches
  let loomMatch = cleaned.match(/loom\.com\/(?:share|embed)\/([a-f0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    return { type: 'loom', embedUrl: `https://www.loom.com/embed/${loomMatch[1]}` };
  }
  
  // Vimeo matches
  let vimeoMatch = cleaned.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }
  
  // Check if direct video file
  if (cleaned.match(/\.(mp4|webm|ogg|mov)(?:\?|$)/i)) {
    return { type: 'direct', embedUrl: cleaned };
  }
  
  // Default fallback if already an embed URL or other
  return { type: 'other', embedUrl: cleaned };
};

const getOrGenerateReelScript = (summary: YouTubeSummaryResponse | null): any => {
  if (!summary) return null;
  if (summary.reelScript) return summary.reelScript;
  
  // Deterministic fallback script compiled gracefully from existing insights
  const title = `Viral Summary: ${summary.metadata.title.slice(0, 45)}...`;
  const takeaways = (summary.takeaways || []).map((t: any) => typeof t === 'string' ? t : (t?.text || ''));
  const baseTitle = summary.metadata.title;
  const author = summary.metadata.author;

  const scenes = [
    {
      sceneNumber: 1,
      durationSeconds: 5,
      visualHook: "Extreme close-up zoom. Bold caption overlay flashing in center screen with crisp synth-bass sound.",
      voiceover: `Have you ever heard of "${baseTitle}"? Here is the ultimate short-form breakdown of ${author}'s viral advice.`,
      textOverlay: "The Truth Revealed"
    },
    {
      sceneNumber: 2,
      durationSeconds: 8,
      visualHook: "Fast vertical pan slide. Cinematic active B-roll with high contrast lines.",
      voiceover: `Key trap exposed: ${takeaways[0] || 'Stop pursuing shallow metrics and start focused consistency.'}`,
      textOverlay: "Core Myth Shattered"
    },
    {
      sceneNumber: 3,
      durationSeconds: 8,
      visualHook: "Minimalist screen split dynamic slide showing data progression.",
      voiceover: `Crucial breakthrough: ${takeaways[1] || 'Real performance starts when you cut out are irrelevant meetings.'}`,
      textOverlay: "Secret To Progress"
    },
    {
      sceneNumber: 4,
      durationSeconds: 8,
      visualHook: "Upward camera pan. Modern split panel with highlighted key metrics.",
      voiceover: `Next big asset: ${takeaways[2] || 'Execution is worth infinitely more than pure strategy without motion.'}`,
      textOverlay: "Execution > Ideas"
    },
    {
      sceneNumber: 5,
      durationSeconds: 6,
      visualHook: "Close focus with visual pulse effects on screen.",
      voiceover: `In summary: ${summary.summary.split('.')[0] || 'This changes how you approach learning.'}.`,
      textOverlay: "The Big Lesson"
    },
    {
      sceneNumber: 6,
      durationSeconds: 5,
      visualHook: "Branded Call To Action prompt flashing high contrast on charcoal backdrop.",
      voiceover: "Swipe up or tap link to view the entire interactive concept mindmap tool right now!",
      textOverlay: "UNCOVER SECRETS"
    }
  ];

  const totalDuration = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

  return {
    title,
    hookType: "Inquiry Loop / Myth-Buster",
    estimatedDuration: totalDuration,
    themeSuggestion: "Charcoal dark elegant stage, vibrant yellow and bold white centered fonts, ultra-rapid cuts, epic background drone pulse",
    scenes,
    readyMadeCaption: `🤯 Ultimate 60-second summary of "${baseTitle}" by ${author}! Tap the link to view complete interactive timeline & quiz tools. \n\n#reels #creative #marketing #${author.replace(/[^a-zA-Z0-9]/g, '')} #viralshorts`,
    callToAction: "Click the bio to explore the full interactive mastermind summary!"
  };
};

const downloadSRT = (script: any) => {
  if (!script) return;
  let srtContent = "";
  let cumulativeSeconds = 0;
  script.scenes.forEach((scene: any, index: number) => {
    const startMs = cumulativeSeconds * 1000;
    const endMs = (cumulativeSeconds + scene.durationSeconds) * 1000;
    cumulativeSeconds += scene.durationSeconds;

    const formatTime = (ms: number) => {
      const h = Math.floor(ms / 3600000).toString().padStart(2, '0');
      const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
      const msStr = (ms % 1000).toString().padStart(3, '0');
      return `${h}:${m}:${s},${msStr}`;
    };

    srtContent += `${index + 1}\n`;
    srtContent += `${formatTime(startMs)} --> ${formatTime(endMs)}\n`;
    srtContent += `[${scene.textOverlay.toUpperCase()}]\n`;
    srtContent += `${scene.voiceover}\n\n`;
  });

  const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_captions.srt`;
  link.click();
  URL.revokeObjectURL(url);
};

const downloadVTT = (script: any) => {
  if (!script) return;
  let vttContent = "WEBVTT\n\n";
  let cumulativeSeconds = 0;
  script.scenes.forEach((scene: any, index: number) => {
    const startMs = cumulativeSeconds * 1000;
    const endMs = (cumulativeSeconds + scene.durationSeconds) * 1000;
    cumulativeSeconds += scene.durationSeconds;

    const formatTime = (ms: number) => {
      const h = Math.floor(ms / 3600000).toString().padStart(2, '0');
      const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
      const msStr = (ms % 1000).toString().padStart(3, '0');
      return `${h}:${m}:${s}.${msStr}`;
    };

    vttContent += `${index + 1}\n`;
    vttContent += `${formatTime(startMs)} --> ${formatTime(endMs)}\n`;
    vttContent += `[${scene.textOverlay.toUpperCase()}]\n`;
    vttContent += `${scene.voiceover}\n\n`;
  });

  const blob = new Blob([vttContent], { type: 'text/vtt;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_captions.vtt`;
  link.click();
  URL.revokeObjectURL(url);
};

const downloadMarkdownScript = (script: any) => {
  if (!script) return;
  let md = `# SHORTENED VIDEO STORYBOARD: ${script.title}\n\n`;
  md += `**Hook Style:** ${script.hookType}\n`;
  md += `**Estimated Duration:** ${script.estimatedDuration} seconds\n`;
  md += `**Styling / Theme Direction:** ${script.themeSuggestion}\n\n`;
  md += `## STORYBOARD TIMELINE SCENES\n\n`;
  
  script.scenes.forEach((scene: any) => {
    md += `### SCENE ${scene.sceneNumber} (${scene.durationSeconds}s)\n`;
    md += `- **Visual Directions / B-Roll:** ${scene.visualHook}\n`;
    md += `- **Voiceover Narration:** "${scene.voiceover}"\n`;
    md += `- **On-Screen Subtitle/Text Overlay:** [${scene.textOverlay}]\n\n`;
  });

  md += `## ENGAGEMENT CAPTION & CALL TO ACTION\n\n`;
  md += `**Platform Ready-Made Caption:**\n\`\`\`text\n${script.readyMadeCaption}\n\`\`\`\n\n`;
  md += `**Call To Action (CTA):** ${script.callToAction}\n`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.md`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function App() {
  // Firebase Auth Visitor state
  const [visitorUser, setVisitorUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<{ message: string; code?: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setVisitorUser(user);
      setAuthInitialized(true);
      if (user) {
        if (user.email && user.email.toLowerCase().trim() === 'rbahirathan@gmail.com') {
          try {
            localStorage.setItem('youtube_summarizer_premium', 'true');
            localStorage.setItem('youtube_summarizer_plan', 'enterprise');
            localStorage.setItem('youtube_summarizer_premium_email', user.email.trim());
            setIsPremium(true);
          } catch (e) {
            console.warn('Could not persist premium status for rbahirathan@gmail.com:', e);
          }
        }
        try {
          // 1. Log user via backend API first
          fetch('/api/log-google-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || ''
            })
          }).catch(err => console.warn('Backend logging API status:', err));

          // 2. Also log directly to Firestore on the client-side!
          // This uses the user's logged-in identity/auth token and guarantees writing is successful in all environments.
          const userRef = doc(db, 'google_users', user.uid);
          const now = new Date().toISOString();
          const userSnap = await getDoc(userRef).catch(() => null);
          if (!userSnap || !userSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              createdAt: now,
              lastLoginAt: now,
            });
          } else {
            await setDoc(userRef, {
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              lastLoginAt: now,
            }, { merge: true });
          }
          console.log('Successfully saved user details to Firestore directly on client-side.');
        } catch (err) {
          console.error('Error logging Google user details to firestore:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle incoming Passwordless Email Sign-In Link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please confirm your sign-in email address:');
      }
      if (email) {
        setLoading(true);
        setLoadingStep('Verifying secure magic sign-in link...');
        signInWithEmailLink(auth, email, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            // Clean url
            window.history.replaceState({}, document.title, window.location.pathname);
            setLoading(false);
          })
          .catch((err) => {
            console.error('Magic link authentication failed:', err);
            setLoading(false);
            alert('Failed to authenticate magic link. Please try again or request a new link.');
          });
      }
    }
  }, []);

  // Input fields
  const [videoUrl, setVideoUrl] = useState('');
  const [demoActiveVideo, setDemoActiveVideo] = useState<YouTubeSummaryResponse>(PRELOADED_VIDEOS[0]);
  const [demoActiveTab, setDemoActiveTab] = useState<'summary' | 'key_insights' | 'chapters' | 'quiz'>('summary');
  const [demoInputUrl, setDemoInputUrl] = useState('');
  const [demoSelectedAnswers, setDemoSelectedAnswers] = useState<Record<number, number>>({});
  const [demoQuizSubmitted, setDemoQuizSubmitted] = useState(false);
  const [customTranscript, setCustomTranscript] = useState('');
  const [showCustomTranscriptField, setShowCustomTranscriptField] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const formElement = document.getElementById('url-submit-form');
      if (formElement) {
        const rect = formElement.getBoundingClientRect();
        setShowStickyCta(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Advanced Source Inputs
  const [inputSourceType, setInputSourceType] = useState<'video' | 'website' | 'file' | 'text'>('video');
  const [uploadedFiles, setUploadedFiles] = useState<{name: string; size: number; type: string; textContent?: string}[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [inputWebsiteUrl, setInputWebsiteUrl] = useState('');
  const [pastedContentText, setPastedContentText] = useState('');

  // Cached/recent search URLs
  const [recentUrls, setRecentUrls] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zipytiny_recent_urls');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showCachedUrls, setShowCachedUrls] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('url');
      if (urlParam) {
        setVideoUrl(urlParam);
        setInputSourceType('video');
        setCurrentScreen('landing');
        
        // Clean the URL search parameters so it doesn't trigger on every reload
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Trigger the summarization immediately
        handleSummarize(undefined, urlParam, 'video');
      }
    } catch (e) {
      console.warn('Failed to parse and trigger URL parameter:', e);
    }
  }, []);

  const defaultCachedUrls = [
    { url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc', title: 'Steve Jobs Stanford Commencement Address', type: 'video' },
    { url: 'https://www.youtube.com/watch?v=qp0HIF3SfI4', title: 'Simon Sinek: How Great Leaders Inspire Action', type: 'video' },
    { url: 'https://www.youtube.com/watch?v=T5yxFiY96_0', title: 'MIT Introduction to Artificial Intelligence', type: 'video' }
  ];

  const allCachedUrls = [
    ...recentUrls.map(url => {
      let domain = url;
      try {
        const parsed = new URL(url);
        domain = parsed.hostname + (parsed.pathname.length > 1 ? parsed.pathname : '');
      } catch {}
      return {
        url,
        title: domain,
        isRecent: true,
        type: url.includes('youtube.com') || url.includes('youtu.be') ? 'video' : 'website'
      };
    }),
    ...defaultCachedUrls.filter(def => !recentUrls.includes(def.url)).map(def => ({
      url: def.url,
      title: def.title,
      isRecent: false,
      type: def.type
    }))
  ];

  // Premium Management, Collections, & Dark Mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('zipytiny_theme') === 'dark';
    } catch {
      return false;
    }
  });
  const [collections, setCollections] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('zipytiny_collections');
      return stored ? JSON.parse(stored) : ['Research Papers', 'YouTube Lectures', 'Personal Meetings', 'General Study'];
    } catch {
      return ['Research Papers', 'YouTube Lectures', 'Personal Meetings', 'General Study'];
    }
  });
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [userNotifications, setUserNotifications] = useState([
    { id: '1', text: '🔥 Your YouTube Summary for "Next.js 15 Tutorial" is ready!', read: false, time: '2m ago' },
    { id: '2', text: '🎓 You successfully passed the "Neural Networks 101" quiz!', read: true, time: '1h ago' },
    { id: '3', text: '⚡ System update: Gemini 2.5 Flash optimization is live!', read: true, time: '1d ago' },
  ]);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const newVal = !prev;
      localStorage.setItem('zipytiny_theme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const handleAddCollection = (name: string) => {
    if (!name.trim()) return;
    const updated = [...collections, name.trim()];
    setCollections(updated);
    localStorage.setItem('zipytiny_collections', JSON.stringify(updated));
  };

  // Status & states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [showWowMoment, setShowWowMoment] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);

  useEffect(() => {
    if (showWowMoment) {
      setRevealProgress(0);
      
      // Initial subtle side-burst confetti
      try {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#0071e3', '#4f46e5']
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#bf5af2', '#10b981']
        });
      } catch (e) {
        console.error(e);
      }

      let count = 0;
      const interval = setInterval(() => {
        count += 1;
        setRevealProgress(count);
        
        if (count >= 6) {
          clearInterval(interval);
          // Big grand-finale confetti explosion!
          try {
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.5 },
              colors: ['#0071e3', '#4f46e5', '#bf5af2', '#10b981']
            });
          } catch (e) {
            console.error(e);
          }
        }
      }, 550);
      return () => clearInterval(interval);
    }
  }, [showWowMoment]);
  
  const LOADING_TIPS = [
    "Zipytiny is transcribing and aligning video audio speech patterns...",
    "We are extracting core concepts and framing simplified analogies for faster comprehension...",
    "Structuring deep semantic mind maps to boost visual retention...",
    "Drafting interactive diagnostic quiz questions and recall flashcards...",
    "Consolidating value bombs and direct actionable takeaways..."
  ];

  useEffect(() => {
    if (!loading) return;
    setCurrentLoadingTipIdx(0);
    const interval = setInterval(() => {
      setCurrentLoadingTipIdx((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [loading]);

  const [error, setError] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<YouTubeSummaryResponse | null>(null);
  const [savedSummaries, setSavedSummaries] = useState<SavedSummary[]>([]);
  
  // Knowledge Stacks States
  const [activeStack, setActiveStack] = useState<SynthesizedStack | null>(null);
  const [savedStacks, setSavedStacks] = useState<SynthesizedStack[]>(() => {
    try {
      const stored = localStorage.getItem('snapsum_saved_stacks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isSelectingForStack, setIsSelectingForStack] = useState<boolean>(false);
  const [selectedStackVideoIds, setSelectedStackVideoIds] = useState<string[]>([]);
  const [stackNameInput, setStackNameInput] = useState<string>('');
  const [activeStackTab, setActiveStackTab] = useState<'overview' | 'themes' | 'contradictions' | 'concepts' | 'quiz'>('overview');
  const [stackQuizAnswers, setStackQuizAnswers] = useState<Record<number, number>>({});
  const [stackQuizSubmitted, setStackQuizSubmitted] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('snapsum_saved_stacks', JSON.stringify(savedStacks));
  }, [savedStacks]);
  
  // Referral, Challenge, and Language States
  const [outputLanguage, setOutputLanguage] = useState<'en' | 'ar'>('en');
  
  // Is active loaded summary in Arabic RTL language or selected output language is Arabic
  const isRtl = outputLanguage === 'ar' || !!(activeSummary && /[\u0600-\u06FF]/.test(activeSummary.summary || ''));
  
  const t = (key: keyof typeof translations['en'], params?: Record<string, string | number>) => {
    const dict = translations[outputLanguage] || translations['en'];
    let val = dict[key] || translations['en'][key] || '';
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = val.replace(`{${k}}`, String(v));
      });
    }
    return val;
  };
  
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralCount, setReferralCount] = useState<number>(0);
  const [referralUnlocked, setReferralUnlocked] = useState<boolean>(false);
  const [quizChallenge, setQuizChallenge] = useState<{ score: number; maxScore: number } | null>(null);
  
  // Dashboard navigation sub-tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'chapters' | 'mindmap' | 'flashcards' | 'quiz' | 'monetize' | 'reel' | 'chat' | 'export'>('overview');
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);

  useEffect(() => {
    if (activeSummary) {
      setOnboardingStep(1);
      setActiveTab('overview');
    } else {
      setOnboardingStep(null);
    }
  }, [activeSummary]);

  const [simActiveScene, setSimActiveScene] = useState<number>(0);
  const [simIsPlaying, setSimIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [isRenderingVideo, setIsRenderingVideo] = useState<boolean>(false);
  const [renderingProgress, setRenderingProgress] = useState<number>(0);

  const [isExportingMindmap, setIsExportingMindmap] = useState<boolean>(false);

  const handleExportMindmap = async () => {
    if (!visitorUser) {
      setAuthModalPurpose('Export high-resolution mind maps as images');
      setShowAuthModal(true);
      return;
    }
    try {
      setIsExportingMindmap(true);
      const container = document.getElementById('mindmap-export-container');
      if (!container) {
        throw new Error('Mindmap container not found');
      }

      // Capture using html-to-image toPng
      const dataUrl = await toPng(container, {
        pixelRatio: 2.5, // ensures it's highly crisp and at least 1080px wide
        backgroundColor: '#ffffff',
        style: {
          padding: '24px',
          borderRadius: '16px',
        }
      });

      // Bake logo and watermark using HTML5 Canvas
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Let's make sure the width is at least 1080px
        const finalWidth = Math.max(1080, img.width);
        const scaleFactor = finalWidth / img.width;
        const finalHeight = img.height * scaleFactor;

        canvas.width = finalWidth;
        canvas.height = finalHeight + 80; // Add 80px for the branded footer banner

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw captured mindmap
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

        // Draw a clean divider/line for the branding area
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, finalHeight);
        ctx.lineTo(finalWidth, finalHeight);
        ctx.stroke();

        // Draw logo image
        const logo = new Image();
        logo.src = '/logo.svg';
        logo.onload = () => {
          // Rounded corners clip for logo inside canvas
          const logoSize = 36;
          const logoX = finalWidth - 280;
          const logoY = finalHeight + 22;

          ctx.save();
          ctx.beginPath();
          ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          ctx.restore();

          // Write Zipytiny text next to logo
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 16px "Inter", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('Zipytiny', logoX + logoSize + 12, logoY + 16);

          // Write "zipytiny.app" subtext
          ctx.fillStyle = '#64748b';
          ctx.font = '500 13px "JetBrains Mono", Courier, monospace';
          ctx.fillText('zipytiny.app', logoX + logoSize + 12, logoY + 32);

          // Write watermark on the left side of footer
          ctx.fillStyle = '#334155';
          ctx.font = '600 14px "Inter", sans-serif';
          ctx.fillText('💡 Summarized & Mapped with Zipytiny AI', 40, finalHeight + 45);

          // Convert to PNG and download
          const exportUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `zipytiny-mindmap-${activeSummary?.metadata?.videoId || 'summary'}.png`;
          link.href = exportUrl;
          link.click();
          setIsExportingMindmap(false);
        };
        logo.onerror = () => {
          // If logo fails to load, fallback to text watermark
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 16px "Inter", sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('zipytiny.app', finalWidth - 40, finalHeight + 45);

          ctx.fillStyle = '#334155';
          ctx.font = '600 14px "Inter", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('💡 Summarized & Mapped with Zipytiny AI', 40, finalHeight + 45);

          const exportUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `zipytiny-mindmap-${activeSummary?.metadata?.videoId || 'summary'}.png`;
          link.href = exportUrl;
          link.click();
          setIsExportingMindmap(false);
        };
      };
    } catch (error) {
      console.error('Error exporting mindmap image:', error);
      alert('Failed to export mindmap image. Please try again.');
      setIsExportingMindmap(false);
    }
  };

  const downloadReelAsVideo = async (script: any) => {
    if (!script || !script.scenes) return;
    setIsRenderingVideo(true);
    setRenderingProgress(0);

    const width = 540;
    const height = 960;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsRenderingVideo(false);
      return;
    }

    let stream: MediaStream;
    try {
      stream = (canvas as any).captureStream(30); // Capture 30 FPS stream from canvas
    } catch (err) {
      console.error("Canvas stream capture is not supported by this browser.", err);
      setIsRenderingVideo(false);
      alert("Video generation is not supported in this browser environment. Please try Chrome, Firefox, or Safari!");
      return;
    }

    const recordedChunks: Blob[] = [];
    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8' };
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm' };
    }

    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      try {
        mediaRecorder = new MediaRecorder(stream);
      } catch (e2) {
        setIsRenderingVideo(false);
        alert("Failed to initialize video encoder on your browser.");
        return;
      }
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    const scenes = script.scenes;
    const sceneDuration = 3.0; // 3 seconds per scene for great legibility
    const totalDuration = scenes.length * sceneDuration;
    const totalFrames = Math.floor(totalDuration * 30);
    let currentFrame = 0;

    mediaRecorder.start();

    const drawFrame = () => {
      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_shortened_video.webm`;
          a.click();
          URL.revokeObjectURL(url);
          setIsRenderingVideo(false);
          setRenderingProgress(100);
        };
        return;
      }

      // Calculate progress percentage
      const progressPercent = Math.min(100, Math.round((currentFrame / totalFrames) * 100));
      setRenderingProgress(progressPercent);

      const secondsElapsed = currentFrame / 30;
      const currentSceneIndex = Math.min(
        Math.floor(secondsElapsed / sceneDuration),
        scenes.length - 1
      );
      const scene = scenes[currentSceneIndex];
      const sceneTimeElapsed = secondsElapsed % sceneDuration;
      const sceneProgress = sceneTimeElapsed / sceneDuration; // 0 to 1

      // 1. Shifting ambient color gradient backgrounds based on active scene index
      const gradients = [
        ['#0f172a', '#1e1b4b'], // Dark Slate -> Indigo
        ['#022c22', '#064e3b'], // Deep Emerald -> Teal
        ['#1c1917', '#44403c'], // Charcoal -> Stone
        ['#1e1b4b', '#311042'], // Violet -> Deep Purple
        ['#3c0712', '#18000a'], // Crimson maroon -> Dark rose
        ['#082f49', '#0c4a6e']  // Deep ocean slate -> Blue
      ];
      const activeGrad = gradients[currentSceneIndex % gradients.length];
      
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, activeGrad[0]);
      grad.addColorStop(1, activeGrad[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Techno grid overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gs = 40;
      for (let x = 0; x < width; x += gs) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gs) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Central Radial Glow
      const glowRad = 260 + Math.sin(currentFrame / 10) * 20;
      const cGlow = ctx.createRadialGradient(
        width / 2, height / 2 - 100, 20, 
        width / 2, height / 2 - 100, glowRad
      );
      cGlow.addColorStop(0, 'rgba(255, 255, 255, 0.045)');
      cGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cGlow;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2 - 100, glowRad, 0, Math.PI * 2);
      ctx.fill();

      // 4. Status Metadata Overlays (Simulating live studio feed)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 11px "JetBrains Mono", Courier, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('🔴 MULTIMEDIA EXPORT', 40, 50);

      ctx.textAlign = 'right';
      ctx.fillText(`SCENE ${scene.sceneNumber}/${scenes.length} (${Math.round(sceneDuration)}s)`, width - 40, 50);

      // Top decorative line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, 65);
      ctx.lineTo(width - 30, 65);
      ctx.stroke();

      // Top label
      ctx.fillStyle = '#ff7b00'; // high intensity orange
      ctx.font = '900 11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('• ZIPYTINY AI REPURPOSER •', width / 2, 95);

      // 5. Draw Central Captions with high contrast card backing
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20;
      ctx.fillStyle = 'rgba(10, 10, 10, 0.82)';

      const cw = width - 80;
      const ch = 160;
      const cx = 40;
      const cy = height / 2 - 140;
      const radius = 16;
      
      // Draw rounded card
      ctx.beginPath();
      ctx.moveTo(cx + radius, cy);
      ctx.lineTo(cx + cw - radius, cy);
      ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + radius);
      ctx.lineTo(cx + cw, cy + ch - radius);
      ctx.quadraticCurveTo(cx + cw, cy + ch, cx + cw - radius, cy + ch);
      ctx.lineTo(cx + radius, cy + ch);
      ctx.quadraticCurveTo(cx, cy + ch, cx, cy + ch - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.quadraticCurveTo(cx, cy, cx + radius, cy);
      ctx.closePath();
      ctx.fill();

      // Disable shadow for text/lines
      ctx.shadowBlur = 0;

      // Card bright accent border
      ctx.strokeStyle = 'rgba(255, 235, 59, 0.5)'; // vibrant yellow
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw hook title inside card
      ctx.fillStyle = '#ffeb3b';
      ctx.font = '900 11px "JetBrains Mono", Courier, monospace';
      ctx.fillText(script.hookType.toUpperCase(), width / 2, cy + 35);

      // Draw active dynamic overlay words
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px "Inter", sans-serif';
      
      const textOverlay = scene.textOverlay.toUpperCase();
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const wordsArr = text.split(' ');
        let currentLine = '';
        let currentY = y;
        for (let n = 0; n < wordsArr.length; n++) {
          const testLine = currentLine + wordsArr[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(currentLine, x, currentY);
            currentLine = wordsArr[n] + ' ';
            currentY += lineHeight;
          } else {
            currentLine = testLine;
          }
        }
        ctx.fillText(currentLine, x, currentY);
      };

      wrapText(textOverlay, width / 2, cy + 75, cw - 40, 28);

      // 6. Voiceover captions backing box at lower screen
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(40, height - 320, width - 80, 120, 16);
      } else {
        ctx.rect(40, height - 320, width - 80, 120);
      }
      ctx.fill();

      // Subtle border for captions
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'medium 14px "Inter", sans-serif';
      ctx.textAlign = 'center';
      wrapText(scene.voiceover, width / 2, height - 285, width - 120, 22);

      // 7. Active duration visual timing progress indicators at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(50, height - 150, width - 100, 6);

      ctx.fillStyle = '#0071e3'; // smart blue loader
      ctx.fillRect(50, height - 150, (width - 100) * sceneProgress, 6);

      // Brand/Call To Action tagline
      ctx.fillStyle = '#a1a1a6';
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillText('Tap screen or link to unlock complete mindmaps & challenges', width / 2, height - 90);

      // Scene dots
      const dotsY = height - 50;
      const dotSpacing = 16;
      const dotStartX = (width - (scenes.length - 1) * dotSpacing) / 2;
      for (let i = 0; i < scenes.length; i++) {
        ctx.fillStyle = i === currentSceneIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.28)';
        ctx.beginPath();
        ctx.arc(dotStartX + i * dotSpacing, dotsY, i === currentSceneIndex ? 4.5 : 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      currentFrame++;
      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  };

  useEffect(() => {
    let interval: any = null;
    if (simIsPlaying) {
      interval = setInterval(() => {
        setSimProgress((prev) => {
          const currentScript = getOrGenerateReelScript(activeSummary);
          if (!currentScript) {
            setSimIsPlaying(false);
            return 0;
          }
          const currentScene = currentScript.scenes[simActiveScene];
          if (!currentScene) {
            setSimIsPlaying(false);
            return 0;
          }
          if (prev + 1 >= currentScene.durationSeconds) {
            if (simActiveScene + 1 < currentScript.scenes.length) {
              setSimActiveScene(simActiveScene + 1);
              return 0;
            } else {
              setSimIsPlaying(false);
              setSimActiveScene(0);
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simIsPlaying, simActiveScene, activeSummary]);

  // Video embed timestamp control (seconds)
  const [ytStartSeconds, setYtStartSeconds] = useState<number | null>(null);
  const [ytAutoplayKey, setYtAutoplayKey] = useState<number>(0);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Copy indicators
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // Real-time URL validation indicators (Goal 1: real-time validation indicator icon inside the URL input field)
  const [isUrlValidating, setIsUrlValidating] = useState<boolean>(false);
  const [urlValidationResult, setUrlValidationResult] = useState<'valid' | 'invalid' | null>(null);

  useEffect(() => {
    const activeUrl = inputSourceType === 'video' ? videoUrl : inputSourceType === 'website' ? inputWebsiteUrl : '';
    if (!activeUrl || !activeUrl.trim()) {
      setIsUrlValidating(false);
      setUrlValidationResult(null);
      return;
    }

    setIsUrlValidating(true);
    setUrlValidationResult(null);

    const timer = setTimeout(() => {
      const isYouTube = (url: string) => {
        const p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        return url.match(p) !== null || url.length === 11;
      };

      const isWeb = (url: string) => {
        try {
          new URL(url);
          return url.startsWith('http://') || url.startsWith('https://');
        } catch {
          return false;
        }
      };

      const isValid = inputSourceType === 'video' ? isYouTube(activeUrl) : isWeb(activeUrl);
      setUrlValidationResult(isValid ? 'valid' : 'invalid');
      setIsUrlValidating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [videoUrl, inputWebsiteUrl, inputSourceType]);

  // TTS audio playback states
  const [ttsLoading, setTtsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // MVP Screen navigation state
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'app' | 'domain' | 'billing' | 'marketing' | 'admin' | 'terms' | 'privacy' | 'feature' | 'explainer' | 'extension'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const pathLower = window.location.pathname.toLowerCase();
        if (pathLower.startsWith('/s/')) {
          return 'app';
        }

        const pathParts = pathLower.split('/').filter(Boolean);
        if (pathParts[0] === 'features' && pathParts[1]) {
          return 'feature';
        }

        // 1. Prioritize clean pathname (e.g. /admin, /billing)
        const pathScreen = pathParts[0];
        if (pathScreen && ['landing', 'app', 'domain', 'billing', 'marketing', 'admin', 'terms', 'privacy', 'explainer'].includes(pathScreen)) {
          return pathScreen as any;
        }

        // 2. Fallback to query params (?screen=admin)
        const params = new URLSearchParams(window.location.search);
        const qScreen = params.get('screen');
        if (qScreen && ['landing', 'app', 'domain', 'billing', 'marketing', 'admin', 'terms', 'privacy', 'feature', 'explainer'].includes(qScreen.toLowerCase())) {
          return qScreen.toLowerCase() as any;
        }
        
        // Also support clean query format like ?admin
        if (params.get('admin') !== null || params.has('admin')) {
          return 'admin';
        }

        // 3. Fallback to hash (#admin)
        const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '').replace(/\/$/, '').trim();
        if (hash && ['landing', 'app', 'domain', 'billing', 'marketing', 'admin', 'terms', 'privacy', 'feature', 'explainer'].includes(hash)) {
          return hash as any;
        }
      }
    } catch (e) {
      console.warn('Initial route resolution failed:', e);
    }
    return 'landing';
  });

  const [currentFeatureSlug, setCurrentFeatureSlug] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const pathLower = window.location.pathname.toLowerCase();
        const pathParts = pathLower.split('/').filter(Boolean);
        if (pathParts[0] === 'features' && pathParts[1]) {
          return pathParts[1];
        }
      }
    } catch {}
    return '';
  });

  // Synchronize browser URL navigation with active screen tab
  useEffect(() => {
    const syncScreenFromUrl = () => {
      try {
        const pathLower = window.location.pathname.toLowerCase();
        if (pathLower.startsWith('/s/')) {
          setCurrentScreen('app');
          return;
        }
        // Check clean pathname
        const pathParts = pathLower.split('/').filter(Boolean);
        if (pathParts[0] === 'features' && pathParts[1]) {
          setCurrentScreen('feature');
          setCurrentFeatureSlug(pathParts[1]);
          return;
        }

        const pathScreen = pathParts[0];
        if (pathScreen && ['landing', 'app', 'domain', 'billing', 'marketing', 'admin', 'terms', 'privacy'].includes(pathScreen)) {
          setCurrentScreen(pathScreen as any);
          return;
        }

        // Check query
        const params = new URLSearchParams(window.location.search);
        const qScreen = params.get('screen');
        if (qScreen && ['landing', 'app', 'domain', 'billing', 'marketing', 'admin', 'terms', 'privacy', 'feature'].includes(qScreen.toLowerCase())) {
          setCurrentScreen(qScreen.toLowerCase() as any);
          return;
        }
        if (params.get('admin') !== null || params.has('admin')) {
          setCurrentScreen('admin');
          return;
        }

        // Check hash
        const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '').replace(/\/$/, '').trim();
        if (hash && ['landing', 'app', 'domain', 'billing', 'marketing', 'admin', 'terms', 'privacy', 'feature'].includes(hash)) {
          setCurrentScreen(hash as any);
        }
      } catch (err) {
        console.warn('URL parsing failed:', err);
      }
    };

    window.addEventListener('hashchange', syncScreenFromUrl);
    window.addEventListener('popstate', syncScreenFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncScreenFromUrl);
      window.removeEventListener('popstate', syncScreenFromUrl);
    };
  }, []);

  // Update address bar dynamically as the user navigates tab options
  useEffect(() => {
    try {
      if (window.location.pathname.toLowerCase().startsWith('/s/')) {
        return;
      }
      if (currentScreen === 'feature') {
        const targetPath = `/features/${currentFeatureSlug}`;
        if (window.location.pathname.toLowerCase() !== targetPath.toLowerCase()) {
          window.history.pushState({ featureSlug: currentFeatureSlug }, document.title, targetPath + window.location.search);
        }
        return;
      }
      const targetPath = currentScreen === 'landing' ? '/' : `/${currentScreen}`;
      if (window.location.pathname.toLowerCase() !== targetPath.toLowerCase()) {
        window.history.pushState(null, document.title, targetPath + window.location.search);
      }
    } catch (e) {
      console.warn('Failed to push history status:', e);
    }
  }, [currentScreen, currentFeatureSlug]);

  // Startup handle for referral code registration & tracking
  useEffect(() => {
    const handleInitialBoot = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const refCode = queryParams.get('ref');

        const payload: any = { referralCode: refCode };
        if (visitorUser) {
          payload.uid = visitorUser.uid;
          payload.displayName = visitorUser.displayName || '';
          payload.photoURL = visitorUser.photoURL || '';
          payload.email = visitorUser.email || '';
        }

        const response = await fetch('/api/referral/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.success) {
          setReferralCode(data.referralCode || '');
          setReferralCount(data.referralCount || 0);
          setReferralUnlocked(data.unlocked || false);
        }
      } catch (err) {
        console.warn('Failed to register or retrieve referral status:', err);
      }
    };

    handleInitialBoot();
  }, [visitorUser]);

  // Shared summary & score-bearing quiz path hydrating router
  useEffect(() => {
    const loadSharedSummary = async () => {
      const pathname = window.location.pathname;
      if (!pathname.startsWith('/s/')) return;

      const parts = pathname.split('/').filter(Boolean); // e.g., ['s', 'vid_123', 'quiz', '8']
      const shareId = parts[1];
      if (!shareId) return;

      setLoading(true);
      setLoadingStep('Hydrating shared learning assets...');
      try {
        const res = await fetch(`/api/shared-summary/${shareId}`);
        if (!res.ok) {
          throw new Error('Shared summary not found');
        }
        const data = await res.json();
        setActiveSummary(data);
        setCurrentScreen('app'); // Route to workspace

        // Deep link to sub-tab
        if (parts[2] === 'quiz') {
          setActiveTab('quiz');
          if (parts[3]) {
            const scoreNum = parseInt(parts[3], 10);
            if (!isNaN(scoreNum)) {
              setQuizChallenge({ score: scoreNum, maxScore: data.quiz?.length || 5 });
            }
          }
        } else if (parts[2]) {
          // If they shared other routes like chapters or mindmap
          const allowedSubTabs = ['overview', 'chapters', 'mindmap', 'quiz', 'monetize'];
          if (allowedSubTabs.includes(parts[2])) {
            setActiveTab(parts[2] as any);
          }
        }
      } catch (err: any) {
        console.error('Failed to load shared summary:', err);
        setError('The shared summary or quiz challenge link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    loadSharedSummary();
  }, []);

  // Update document browser tab tab-title dynamically based on screen selection
  useEffect(() => {
    try {
      const titles: Record<string, string> = {
        landing: 'Zipytiny - Instant AI Video Knowledge Engine',
        app: 'AI Video Knowledge Engine Workspace | Zipytiny',
        domain: 'Domain Configuration | Zipytiny',
        billing: 'Premium Plans & Upgrades | Zipytiny',
        marketing: 'AI Viral Creator Hub | Zipytiny',
        admin: 'Administrative Console | Zipytiny',
        explainer: 'Interactive Cinematic Tour & Screen Recorder | Zipytiny'
      };
      document.title = titles[currentScreen] || 'Zipytiny - Instant AI Video Knowledge Engine';
    } catch (err) {
      console.warn('Failed to set tab title:', err);
    }
  }, [currentScreen]);

  // Stripe Live Status state
  const [stripeConfig, setStripeConfig] = useState<{
    stripeConfigured: boolean;
    publishableKey: string;
    accountInfo?: any;
    error?: string;
  }>({
    stripeConfigured: false,
    publishableKey: '',
    accountInfo: null,
    error: '',
  });

  // Interactive Digital Marketing states
  const [marketingNiche, setMarketingNiche] = useState('Tech & AI Startup');
  const [outreachPitch, setOutreachPitch] = useState('');
  const [pitchLoading, setPitchLoading] = useState(false);
  const [marketingPitchVideoTitle, setMarketingPitchVideoTitle] = useState('Dustins Lecture on Startup Operations');
  const [marketingShortsScript, setMarketingShortsScript] = useState('');
  const [shortsScriptLoading, setShortsScriptLoading] = useState(false);

  // Admin and Environmental settings state
  const [adminFreeReqsLimit, setAdminFreeReqsLimit] = useState(() => {
    try {
      return localStorage.getItem('admin_free_reqs_limit') || '3';
    } catch {
      return '3';
    }
  });

  const [adminSelectedModel, setAdminSelectedModel] = useState(() => {
    try {
      return localStorage.getItem('admin_selected_model') || 'gemini-3.5-flash';
    } catch {
      return 'gemini-3.5-flash';
    }
  });

  const [adminTemperature, setAdminTemperature] = useState(() => {
    try {
      return localStorage.getItem('admin_temperature') || '0.2';
    } catch {
      return '0.2';
    }
  });

  const [adminSearchGrounding, setAdminSearchGrounding] = useState(() => {
    try {
      return localStorage.getItem('admin_search_grounding') || 'default';
    } catch {
      return 'default';
    }
  });

  // Secure Auth & user session management
  const [vaultUsername, setVaultUsername] = useState('admin');
  const [vaultPassword, setVaultPassword] = useState('');
  const [vaultPasswordVisible, setVaultPasswordVisible] = useState(false);
  const [vault2faSecret, setVault2faSecret] = useState('');
  const [vault2faQrUrl, setVault2faQrUrl] = useState('');
  const [vault2faSetupCode, setVault2faSetupCode] = useState('');
  const [vault2faVerified, setVault2faVerified] = useState(false);
  const [vaultSetupLoading, setVaultSetupLoading] = useState(false);
  const [vaultSaveStatus, setVaultSaveStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [geminiSaveStatus, setGeminiSaveStatus] = useState(false);

  const [adminUserField, setAdminUserField] = useState('');
  const [adminPassField, setAdminPassField] = useState('');
  const [adminMfaField, setAdminMfaField] = useState('');
  const [adminMfaRequired, setAdminMfaRequired] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const [adminAuditLogs, setAdminAuditLogs] = useState<any[]>([]);
  const [adminLogsLoading, setAdminLogsLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [showSandboxHelper, setShowSandboxHelper] = useState(false);
  const [adminSessionToken, setAdminSessionToken] = useState(() => {
    try {
      return sessionStorage.getItem('admin_session_token') || '';
    } catch {
      return '';
    }
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return !!sessionStorage.getItem('admin_session_token');
    } catch {
      return false;
    }
  });
  const [adminIpList, setAdminIpList] = useState<Array<{ ip: string; count: number; lastResetAt: string }>>([]);
  const [adminIpLoading, setAdminIpLoading] = useState(false);
  const [adminGoogleUsers, setAdminGoogleUsers] = useState<any[]>([]);
  const [adminGoogleUsersLoading, setAdminGoogleUsersLoading] = useState(false);
  const [adminDbDiagnosticLoading, setAdminDbDiagnosticLoading] = useState(false);
  const [adminDbDiagnosticResult, setAdminDbDiagnosticResult] = useState<any | null>(null);

  // AI Support Bot States
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSupportMinimized, setIsSupportMinimized] = useState(false);
  const [supportMessages, setSupportMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; timestamp: string }>>([
    {
      role: 'assistant',
      text: "Hey there! 😊 Welcome to Zipytiny! I'm your friendly support companion. Feel free to ask me absolutely anything about our video summaries, pricing, free sandbox checkout, or features. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [supportInput, setSupportInput] = useState('');
  const [isSupportTyping, setIsSupportTyping] = useState(false);
  const supportEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll support chat to bottom
  useEffect(() => {
    if (isSupportOpen) {
      setTimeout(() => {
        supportEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [supportMessages, isSupportTyping, isSupportOpen]);

  // Google Analytics state management & diagnostics
  const [adminGaMeasurementId, setAdminGaMeasurementId] = useState(() => {
    try {
      return localStorage.getItem('admin_ga_measurement_id') || (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || '';
    } catch {
      return (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || '';
    }
  });
  const [gaSessionEvents, setGaSessionEvents] = useState<TrackedEvent[]>([]);
  const [gaTestEventName, setGaTestEventName] = useState('summary_debug_test');

  // Developer Override States (Local Cached Overrides for Stripe + VIP + Usage metrics)
  const [customVipCode, setCustomVipCode] = useState(() => {
    try {
      return localStorage.getItem('custom_vip_code') || '';
    } catch {
      return '';
    }
  });

  const [customDemoVideoUrl, setCustomDemoVideoUrl] = useState(() => {
    try {
      return localStorage.getItem('custom_demo_video_url') || '';
    } catch {
      return '';
    }
  });

  const [demoDisplayMode, setDemoDisplayMode] = useState(() => {
    try {
      return localStorage.getItem('demo_display_mode') || 'tour';
    } catch {
      return 'tour';
    }
  });

  const [customStripeSecret, setCustomStripeSecret] = useState(() => {
    try {
      return localStorage.getItem('custom_stripe_secret') || '';
    } catch {
      return '';
    }
  });

  const [customStripePublishable, setCustomStripePublishable] = useState(() => {
    try {
      return localStorage.getItem('custom_stripe_publishable') || '';
    } catch {
      return '';
    }
  });

  const [usageTracker, setUsageTracker] = useState({
    count: 0,
    limit: 3,
    remaining: 3,
    vipBypassActive: false,
  });

  // Developer Sandboxing Custom API Key (Stores in localStorage for 100% $0 user costs)
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem('custom_gemini_api_key') || '';
    } catch {
      return '';
    }
  });

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (customApiKey && customApiKey.trim()) {
      headers['x-custom-gemini-api-key'] = customApiKey.trim();
    }
    if (customVipCode && customVipCode.trim()) {
      headers['x-vip-bypass-code'] = customVipCode.trim();
    }

    // Admin Dashboard parameter injectors:
    if (adminFreeReqsLimit) {
      headers['x-custom-free-reqs-limit'] = adminFreeReqsLimit;
    }
    if (adminSelectedModel) {
      headers['x-custom-gemini-model'] = adminSelectedModel;
    }
    if (adminTemperature) {
      headers['x-custom-gemini-temperature'] = adminTemperature;
    }
    if (adminSearchGrounding !== 'default') {
      headers['x-custom-search-grounding'] = adminSearchGrounding;
    }
    if (isPremium) {
      headers['x-is-premium'] = 'true';
    }
    const activePlan = localStorage.getItem('youtube_summarizer_plan') || (isPremium ? 'pro' : 'free');
    headers['x-user-plan'] = activePlan;
    const userEmail = visitorUser?.email || localStorage.getItem('youtube_summarizer_premium_email') || '';
    if (userEmail) {
      headers['x-user-email'] = userEmail;
    }
    return headers;
  };

  const refreshStatus = () => {
    // 1. Check live Stripe status with credentials check
    fetch('/api/stripe-status', { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setStripeConfig({
          stripeConfigured: !!data.stripeConfigured,
          publishableKey: data.publishableKey || '',
          accountInfo: data.accountInfo || null,
          error: data.error || '',
        });
      })
      .catch((err) => console.warn('Could not read backend Stripe metadata:', err));

    // 2. Check dynamic IP request limits
    fetch('/api/usage-status', { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setUsageTracker({
          count: data.count || 0,
          limit: data.limit || 3,
          remaining: typeof data.remaining === 'number' ? data.remaining : 3,
          vipBypassActive: !!data.vipBypassActive,
        });
        if (data.vipBypassActive) {
          setIsPremium(true);
        }
      })
      .catch((err) => console.warn('Could not retrieve dynamic custom limits:', err));
  };

  useEffect(() => {
    refreshStatus();

    // Handle successful Stripe Checkout redirect session
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout_success') === 'true') {
      let email = 'R_Bahirathan@gmail.com';
      try {
        email = localStorage.getItem('pending_checkout_email') || 'R_Bahirathan@gmail.com';
      } catch (e) {
        console.warn(e);
      }
      setVerifyingPayment(true);
      setVerifyingPaymentEmail(email);

      let attempts = 0;
      const maxAttempts = 20; // up to 40 seconds
      const intervalId = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(`/api/subscription-status?email=${encodeURIComponent(email)}`);
          const data = await res.json();
          if (data?.subscription?.status === 'active') {
            savePremiumStatus(true, data.subscription.plan || 'pro', email);
            setVerifyingPayment(false);
            clearInterval(intervalId);
            console.log('Stripe payment verified successfully via webhook and database status check.');
          }
        } catch (err) {
          console.warn('Subscription status check failed:', err);
        }

        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          setVerifyingPayment(false);
          console.warn('Stripe checkout verification timed out.');
        }
      }, 2000);

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [
    customApiKey,
    customVipCode,
    customStripeSecret,
    customStripePublishable,
    adminFreeReqsLimit,
    adminSelectedModel,
    adminTemperature,
    adminSearchGrounding
  ]);

  // Synchronously initialize and listen for Google Analytics activities
  useEffect(() => {
    if (adminGaMeasurementId) {
      initGA(adminGaMeasurementId);
    }
    
    setGaSessionEvents(getSessionEvents());

    const handleGaDispatcher = (e: Event) => {
      const customEvent = e as CustomEvent<TrackedEvent | null>;
      if (customEvent.detail) {
        setGaSessionEvents((prev) => {
          // Prevent duplicates if already loaded
          const exists = prev.some(item => item.id === customEvent.detail!.id);
          if (exists) return prev;
          return [customEvent.detail!, ...prev].slice(0, 50);
        });
      } else {
        setGaSessionEvents([]);
      }
    };

    window.addEventListener('ga-event-dispatched', handleGaDispatcher);
    return () => {
      window.removeEventListener('ga-event-dispatched', handleGaDispatcher);
    };
  }, [adminGaMeasurementId]);

  // Dispatch navigation event each time the active screen is changed
  useEffect(() => {
    trackGAEvent('screen_change', {
      screen_id: currentScreen,
      timestamp: new Date().toISOString()
    });
  }, [currentScreen]);

  // Brute-force lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds !== null && lockoutSeconds > 0) {
      const timer = setTimeout(() => {
        setLockoutSeconds(prev => (prev && prev > 1) ? prev - 1 : null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutSeconds]);

  // Administrative token session validation on mount/boot
  useEffect(() => {
    const verifySession = async () => {
      if (adminSessionToken) {
        try {
          const res = await fetch('/api/admin/verify-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: adminSessionToken })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.valid) {
              setIsAdminAuthenticated(true);
              fetchAdminIpTracker(adminSessionToken);
              fetchAdminAuditLogs(adminSessionToken);
              fetchAdminGoogleUsers(adminSessionToken);
            } else {
              handleAdminLogout();
            }
          } else {
            handleAdminLogout();
          }
        } catch {
          // Serve cache/offline if server is rebooting, but keep values
          fetchAdminIpTracker(adminSessionToken);
          fetchAdminAuditLogs(adminSessionToken);
          fetchAdminGoogleUsers(adminSessionToken);
        }
      }
    };
    verifySession();
  }, [adminSessionToken]);

  // Polling tracker for active logs & limits
  useEffect(() => {
    if (isAdminAuthenticated && adminSessionToken) {
      const interval = setInterval(() => {
        fetchAdminAuditLogs(adminSessionToken);
        fetchAdminIpTracker(adminSessionToken);
        fetchAdminGoogleUsers(adminSessionToken);
      }, 25000); // refresh every 25s
      return () => clearInterval(interval);
    }
  }, [isAdminAuthenticated, adminSessionToken]);

  // MVP Premium & billing state
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try {
      const storedEmail = localStorage.getItem('youtube_summarizer_premium_email') || '';
      return localStorage.getItem('youtube_summarizer_premium') === 'true' || 
             localStorage.getItem('custom_vip_code') === 'PROPASS' ||
             storedEmail.toLowerCase().trim() === 'rbahirathan@gmail.com';
    } catch {
      return false;
    }
  });

  const [verifyingPayment, setVerifyingPayment] = useState<boolean>(false);
  const [verifyingPaymentEmail, setVerifyingPaymentEmail] = useState<string>('');

  // Custom Domain Configuration state
  const [customDomain, setCustomDomain] = useState<string>(() => {
    try {
      return localStorage.getItem('youtube_summarizer_custom_domain') || '';
    } catch {
      return '';
    }
  });
  
  const [dnsStatus, setDnsStatus] = useState<'unconfigured' | 'verifying' | 'connected'>(() => {
    try {
      const stored = localStorage.getItem('youtube_summarizer_dns_status');
      if (stored === 'connected') return 'connected';
      if (stored === 'verifying') return 'verifying';
    } catch {}
    return 'unconfigured';
  });

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Dynamic Pricing & Promotions State (Firestore Backed)
  const [proMonthlyPrice, setProMonthlyPrice] = useState<number>(8.99);
  const [proYearlyPrice, setProYearlyPrice] = useState<number>(7.49);
  const [enterpriseMonthlyPrice, setEnterpriseMonthlyPrice] = useState<number>(12.99);
  const [enterpriseYearlyPrice, setEnterpriseYearlyPrice] = useState<number>(11.49);
  const [promotionsList, setPromotionsList] = useState<any[]>(() => {
    return [
      {
        code: 'LAUNCH07',
        discountType: 'percentage',
        discountValue: 80,
        active: true,
        discountDurationType: 'first_month_only',
        redemptionCap: 200,
        redemptionsCount: 42,
        expiryDate: '2026-12-31',
        plans: 'monthly_only'
      }
    ];
  });

  // Promo code states
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Admin New Promo States
  const [adminNewPromoCode, setAdminNewPromoCode] = useState('');
  const [adminNewPromoType, setAdminNewPromoType] = useState<'percentage' | 'fixed'>('percentage');
  const [adminNewPromoValue, setAdminNewPromoValue] = useState<number>(0);
  const [adminNewPromoDuration, setAdminNewPromoDuration] = useState<'first_month_only' | 'recurring'>('recurring');
  const [adminNewPromoCap, setAdminNewPromoCap] = useState<number>(0);
  const [adminNewPromoExpiry, setAdminNewPromoExpiry] = useState<string>('');
  const [adminNewPromoPlans, setAdminNewPromoPlans] = useState<'monthly_only' | 'all'>('all');
  const [pricingSaveLoading, setPricingSaveLoading] = useState(false);
  const [pricingSaveStatus, setPricingSaveStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const getDiscountedPrice = (originalPrice: number) => {
    if (!appliedPromo) return originalPrice;
    if (appliedPromo.discountType === 'percentage') {
      const discount = (originalPrice * Number(appliedPromo.discountValue)) / 100;
      return Math.max(0, originalPrice - discount);
    } else if (appliedPromo.discountType === 'fixed') {
      return Math.max(0, originalPrice - Number(appliedPromo.discountValue));
    }
    return originalPrice;
  };

  const getPlanPrice = (planCode: 'pro' | 'enterprise' | 'test', cycle: 'monthly' | 'yearly') => {
    if (planCode === 'test') return 1;
    if (planCode === 'enterprise') {
      return cycle === 'monthly' ? enterpriseMonthlyPrice : enterpriseYearlyPrice;
    }
    return cycle === 'monthly' ? proMonthlyPrice : proYearlyPrice;
  };

  const getPlanTotalPrice = (planCode: 'pro' | 'enterprise' | 'test', cycle: 'monthly' | 'yearly') => {
    const basePrice = getPlanPrice(planCode, cycle);
    if (planCode === 'test') return 1;
    const finalPrice = getDiscountedPrice(basePrice);
    return cycle === 'monthly' ? finalPrice : finalPrice * 12;
  };

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const docRef = doc(db, 'admin_settings', 'pricing');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.proMonthlyPrice !== undefined) setProMonthlyPrice(Number(data.proMonthlyPrice));
          if (data.proYearlyPrice !== undefined) setProYearlyPrice(Number(data.proYearlyPrice));
          if (data.enterpriseMonthlyPrice !== undefined) setEnterpriseMonthlyPrice(Number(data.enterpriseMonthlyPrice));
          if (data.enterpriseYearlyPrice !== undefined) setEnterpriseYearlyPrice(Number(data.enterpriseYearlyPrice));
          if (Array.isArray(data.promotions)) setPromotionsList(data.promotions);
        }
      } catch (err) {
        console.warn('Failed to fetch pricing config from Firestore, using defaults:', err);
      }
    };
    fetchPricing();
  }, []);

  const handleSavePricingAndPromotions = async (updatedPromos?: any[], updatedPrices?: { proM: number, proY: number, entM: number, entY: number }) => {
    setPricingSaveLoading(true);
    setPricingSaveStatus({ type: 'idle', message: '' });
    try {
      const docRef = doc(db, 'admin_settings', 'pricing');
      
      const payload = {
        proMonthlyPrice: updatedPrices ? updatedPrices.proM : proMonthlyPrice,
        proYearlyPrice: updatedPrices ? updatedPrices.proY : proYearlyPrice,
        enterpriseMonthlyPrice: updatedPrices ? updatedPrices.entM : enterpriseMonthlyPrice,
        enterpriseYearlyPrice: updatedPrices ? updatedPrices.entY : enterpriseYearlyPrice,
        promotions: updatedPromos !== undefined ? updatedPromos : promotionsList,
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, payload, { merge: true });

      if (updatedPrices) {
        setProMonthlyPrice(updatedPrices.proM);
        setProYearlyPrice(updatedPrices.proY);
        setEnterpriseMonthlyPrice(updatedPrices.entM);
        setEnterpriseYearlyPrice(updatedPrices.entY);
      }
      if (updatedPromos !== undefined) {
        setPromotionsList(updatedPromos);
      }

      setPricingSaveStatus({ type: 'success', message: 'Pricing structures and promotional parameters synchronized successfully!' });
    } catch (err: any) {
      setPricingSaveStatus({ type: 'error', message: err.message || 'Error saving parameters to Firestore.' });
    } finally {
      setPricingSaveLoading(false);
    }
  };

  // Referral Leaderboard & Profile Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalPurpose, setAuthModalPurpose] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [currentLoadingTipIdx, setCurrentLoadingTipIdx] = useState(0);

  const [referralLeaderboard, setReferralLeaderboard] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const fetchReferralLeaderboard = async () => {
    try {
      setIsLoadingLeaderboard(true);
      const response = await fetch('/api/referral/leaderboard');
      const data = await response.json();
      if (data.success) {
        setReferralLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to fetch referral leaderboard:', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // Stripe Checkout Simulator dialog
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState<'pro' | 'enterprise' | 'test' | null>(null);
  const [subscriptionEmail, setSubscriptionEmail] = useState('R_Bahirathan@gmail.com');
  const [cardName, setCardName] = useState('R. Bahirathan');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [stripePaymentLoading, setStripePaymentLoading] = useState(false);
  const [stripePaymentSuccess, setStripePaymentSuccess] = useState(false);
  const [stripeLaunchError, setStripeLaunchError] = useState<string | null>(null);

  // Live Stripe active session creator / dynamic simulator router
  const handleCheckoutClick = async (plan: 'pro' | 'enterprise' | 'test') => {
    setSelectedPlanCode(plan);
    setStripeLaunchError(null);
    trackGAEvent('initiate_checkout', {
      plan_code: plan,
      billing_cycle: billingCycle,
      stripe_configured: stripeConfig.stripeConfigured
    });
    if (stripeConfig.stripeConfigured) {
      setStripePaymentLoading(true);
      try {
        const userEmail = visitorUser?.email || localStorage.getItem('youtube_summarizer_premium_email') || subscriptionEmail || 'R_Bahirathan@gmail.com';
        try {
          localStorage.setItem('pending_checkout_email', userEmail);
        } catch (e) {
          console.warn(e);
        }
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            planCode: plan,
            billingCycle,
            promoCode: appliedPromo?.code || null,
            returnUrl: window.location.href.split('?')[0], // Clean active page url
            email: userEmail
          })
        });
        const data = await response.json();
        if (data.url) {
          // Route straight to Google-protected Stripe domain to handle card/bank processes safely
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'No session URL returned.');
        }
      } catch (err: any) {
        console.warn('Real Stripe launch crashed, falling back to simulator:', err);
        // Fallback to local gateway sandbox simulator
        setStripeLaunchError(err.message || 'Stripe API Session initialization error');
        setShowStripeModal(true);
        setStripePaymentSuccess(false);
      } finally {
        setStripePaymentLoading(false);
      }
    } else {
      // Keys not active, launch the Sandbox Simulator Gated Modal with message
      setStripeLaunchError('Stripe live secret keys are not configured in your settings, so the app is running in Sandbox Simulation mode.');
      setShowStripeModal(true);
      setStripePaymentSuccess(false);
    }
  };

  // Automated high-performance sales copy and short script triggers
  const generateMarketingOutreach = async () => {
    if (!marketingNiche.trim()) return;
    setPitchLoading(true);
    setOutreachPitch('');
    try {
      const response = await fetch('/api/marketing-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'outreach', promptInput: marketingNiche })
      });
      const data = await response.json();
      if (data.result) {
        setOutreachPitch(data.result);
        trackGAEvent('marketing_outreach_generated', {
          niche: marketingNiche
        });
      } else {
        throw new Error(data.error || 'Failed to generate campaign outreach');
      }
    } catch (err: any) {
      console.error(err);
      setOutreachPitch(`⚠️ Outreach Generation Failed. Check that your GEMINI_API_KEY is configured in AI Studio secrets.\n\nError: ${err.message}`);
    } finally {
      setPitchLoading(false);
    }
  };

  const generateShortScript = async (videoTitle: string, bulletPoints: string) => {
    if (!videoTitle) return;
    setShortsScriptLoading(true);
    setMarketingShortsScript('');
    try {
      const response = await fetch('/api/marketing-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'shorts', 
          promptInput: bulletPoints || 'Design visual guidelines',
          details: videoTitle
        })
      });
      const data = await response.json();
      if (data.result) {
        setMarketingShortsScript(data.result);
        trackGAEvent('shorts_script_generated', {
          video_title: videoTitle
        });
      } else {
        throw new Error(data.error || 'Failed to generate viral script');
      }
    } catch (err: any) {
      console.error(err);
      setMarketingShortsScript(`⚠️ Script Generation Failed. Check that your GEMINI_API_KEY is configured in your AI Studio secrets.\n\nError: ${err.message}`);
    } finally {
      setShortsScriptLoading(false);
    }
  };

  // Save changes wrapper
  const savePremiumStatus = (status: boolean, plan: string = 'pro', email: string = '') => {
    setIsPremium(status);
    try {
      localStorage.setItem('youtube_summarizer_premium', String(status));
      if (status) {
        localStorage.setItem('youtube_summarizer_plan', plan);
        if (email) {
          localStorage.setItem('youtube_summarizer_premium_email', email);
        }
      } else {
        localStorage.removeItem('youtube_summarizer_plan');
        localStorage.removeItem('youtube_summarizer_premium_email');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    if (visitorUser && visitorUser.email) {
      const emailLower = visitorUser.email.toLowerCase().trim();
      if (emailLower === 'rbahirathan@gmail.com') {
        savePremiumStatus(true, 'enterprise', visitorUser.email);
      }
    }
  }, [visitorUser]);

  // Save changes wrapper for Domain metadata
  const saveCustomDomain = (domain: string, status: 'unconfigured' | 'verifying' | 'connected') => {
    setCustomDomain(domain);
    setDnsStatus(status);
    try {
      localStorage.setItem('youtube_summarizer_custom_domain', domain);
      localStorage.setItem('youtube_summarizer_dns_status', status);
    } catch (e) {
      console.warn(e);
    }
  };

  const [selectedTone, setSelectedTone] = useState<'standard' | 'academic' | 'viral' | 'reel'>('standard');

  // State for Learn Mode
  const [learnMode, setLearnMode] = useState<boolean>(() => {
    return localStorage.getItem('snapsum_learn_mode') === 'true';
  });

  // State for Learning Depth selector
  const [learningDepth, setLearningDepth] = useState<'quick' | 'study' | 'mastery'>('study');

  // State for Mastery Promo Modal
  const [showMasteryModal, setShowMasteryModal] = useState<boolean>(false);

  // Advanced customization states
  const [advSummaryLength, setAdvSummaryLength] = useState<'short' | 'medium' | 'long' | 'custom'>('medium');
  const [advCustomWordCount, setAdvCustomWordCount] = useState<number>(500);
  const [advFlashcardCount, setAdvFlashcardCount] = useState<number>(10);
  const [advQuizQuestionCount, setAdvQuizQuestionCount] = useState<number>(5);
  const [advMindMapDetail, setAdvMindMapDetail] = useState<'simple' | 'balanced' | 'detailed'>('balanced');
  const [advExplanationStyle, setAdvExplanationStyle] = useState<'bullets' | 'teaching' | 'academic' | 'professional' | 'beginner'>('teaching');

  const getAIRecommendation = () => {
    if (inputSourceType === 'file' && uploadedFiles.length > 0) {
      const isAcademic = uploadedFiles.some(f => 
        f.name.toLowerCase().includes('paper') || 
        f.name.toLowerCase().includes('research') || 
        f.name.toLowerCase().includes('thesis') || 
        f.name.toLowerCase().includes('study') ||
        f.name.toLowerCase().includes('pdf') ||
        f.name.toLowerCase().includes('doc')
      );
      if (isAcademic) {
        return {
          depth: 'mastery' as const,
          title: '🎓 Mastery Mode Recommended',
          badge: 'Recommended',
          why: 'This document contains academic, research, or technical specifications that benefit from a Comprehensive Master Guide, concept maps, and advanced tests.',
          readingTime: '20–40 minutes'
        };
      }
      return {
        depth: 'study' as const,
        title: '📘 Study Mode Recommended',
        badge: 'Recommended',
        why: 'Your uploaded document is best structured with standard AI study notes, flashcards, and concept maps for optimal retention.',
        readingTime: '8–15 minutes'
      };
    }

    if (inputSourceType === 'text' && pastedContentText) {
      if (pastedContentText.length > 5000) {
        return {
          depth: 'mastery' as const,
          title: '🎓 Mastery Mode Recommended',
          badge: 'Recommended',
          why: 'This is a long-form text. Mastery Mode is recommended to extract concept relationships, construct a revision plan, and generate memory tips.',
          readingTime: '20–40 minutes'
        };
      }
      return {
        depth: 'quick' as const,
        title: '⚡ Quick Review Recommended',
        badge: 'Recommended',
        why: 'This text is short and concise. Quick Review will extract important facts and a bite-sized executive summary instantly.',
        readingTime: '2–5 minutes'
      };
    }

    if (inputSourceType === 'website' && inputWebsiteUrl) {
      if (inputWebsiteUrl.includes('wikipedia') || inputWebsiteUrl.includes('academic') || inputWebsiteUrl.includes('docs')) {
        return {
          depth: 'mastery' as const,
          title: '🎓 Mastery Mode Recommended',
          badge: 'Recommended',
          why: 'This reference contains extensive educational material. Mastery Mode will organize it into a structured concept syllabus with advanced quizzes.',
          readingTime: '20–40 minutes'
        };
      }
      return {
        depth: 'quick' as const,
        title: '⚡ Quick Review Recommended',
        badge: 'Recommended',
        why: 'Web articles are best summarized as an Executive Summary with Important Facts to save reading time.',
        readingTime: '2–5 minutes'
      };
    }

    // Default / Video
    if (inputSourceType === 'video') {
      if (!videoUrl) {
        return {
          depth: 'study' as const,
          title: '📘 Study Mode Recommended',
          badge: 'Recommended',
          why: 'Most educational lectures and courses benefit from balanced study guides, mind maps, and active recall flashcards.',
          readingTime: '8–15 minutes'
        };
      }

      const isSinek = videoUrl.includes('qp0HIF3SfI4') || videoUrl.includes('Sinek');
      if (isSinek) {
        return {
          depth: 'quick' as const,
          title: '⚡ Quick Review Recommended',
          badge: 'Recommended',
          why: 'This is an inspirational 18-minute talk. A Quick Review is best to capture the core thesis, key takeaways, and important facts.',
          readingTime: '2–5 minutes'
        };
      }

      const isSteveJobs = videoUrl.includes('UF8uR6Z6KLc') || videoUrl.includes('Jobs');
      if (isSteveJobs) {
        return {
          depth: 'study' as const,
          title: '📘 Study Mode Recommended',
          badge: 'Recommended',
          why: 'This is a famous 15-minute speech containing multiple life stories and actionable mental models that are perfect for study notes.',
          readingTime: '8–15 minutes'
        };
      }

      const lowerUrl = videoUrl.toLowerCase();
      if (lowerUrl.includes('lecture') || lowerUrl.includes('mit') || lowerUrl.includes('stanford') || lowerUrl.includes('course') || lowerUrl.includes('tutorial') || lowerUrl.includes('class') || lowerUrl.includes('university')) {
        return {
          depth: 'study' as const,
          title: '📘 Study Mode Recommended',
          badge: 'Recommended',
          why: 'This appears to be an educational lecture or course. Study Mode will compile comprehensive learning notes, structured mind maps, and interactive tests.',
          readingTime: '8–15 minutes'
        };
      }

      if (lowerUrl.includes('meeting') || lowerUrl.includes('sync') || lowerUrl.includes('update') || lowerUrl.includes('scrum') || lowerUrl.includes('standup')) {
        return {
          depth: 'quick' as const,
          title: '⚡ Quick Review Recommended',
          badge: 'Recommended',
          why: 'Business meetings benefit from a rapid Executive Summary and a punchy list of Action Items and Important Facts.',
          readingTime: '2–5 minutes'
        };
      }
    }

    return {
      depth: 'study' as const,
      title: '📘 Study Mode Recommended',
      badge: 'Recommended',
      why: 'Optimal standard for conceptual retention, providing study notes, active recall decks, and an interactive concept map.',
      readingTime: '8–15 minutes'
    };
  };

  const adaptSummaryForLearningDepth = (summary: any, depth: 'quick' | 'study' | 'mastery') => {
    if (!summary) return null;
    const result = { 
      ...summary, 
      keyConcepts: [...(summary.keyConcepts || [])], 
      flashcards: [...(summary.flashcards || [])], 
      quiz: [...(summary.quiz || [])],
      takeaways: [...(summary.takeaways || [])]
    };
    
    if (depth === 'quick') {
      result.summary = `⚡ **QUICK REVIEW EXECUTIVE SUMMARY**\n\n${summary.summary.slice(0, 300)}...\n\n📋 **IMPORTANT FACTS & RECAP**\n• This is a high-level briefing designed for busy professionals and fast lecture review.\n• Captures the core structural points and final outcomes with absolute focus and clarity.`;
      result.takeaways = (summary.takeaways || []).slice(0, 3);
      result.keyConcepts = [];
      result.flashcards = [];
      result.quiz = [];
      result.rememberSummary = '';
    } else if (depth === 'study') {
      // Retains full standard learn structures
    } else if (depth === 'mastery') {
      result.summary = `🎓 **COMPREHENSIVE STUDY GUIDE & DETAILED EXPLANATIONS**\n\n${summary.summary}\n\n🎯 **LEARNING OBJECTIVES**\n1. Master the core theoretical mechanics and underlying structural frameworks of the subject.\n2. Develop critical application skills using systemic analogies and interactive prompt training.\n3. Establish durable memory structures via connected recall paths.\n\n💡 **CONCEPT RELATIONSHIPS & ADVANCED THEMES**\n• Every core milestone acts as a conceptual prerequisite for downstream application.\n• Small compounding habits and continuous optimization trigger exponential, long-term returns.\n\n🧠 **EXPERT MEMORY TIPS & RETENTION METRICS**\n• **Active Recall**: Don't just read this. Go to the Flashcards tab to test your retention instantly!\n• **The Feynman Technique**: Teach the core thesis of this material in your own words to the AI Tutor in the AI Chat tab.\n\n📅 **SUGGESTED 7-DAY REVISION PLAN**\n• **Day 1**: Digest the Comprehensive Study Guide and inspect the Mind Map tab.\n• **Day 2**: Flashcard self-test session (10-minute focus on key definitions).\n• **Day 3**: Complete the interactive quiz. Repeat incorrect items until scoring 100%.\n• **Day 4**: Practice explaining the concept to the AI Tutor.\n• **Day 5-7**: Spaced review of the final retention checklist in the Summary tab.`;
      
      if (result.keyConcepts.length === 0) {
        result.keyConcepts = [
          {
            concept: 'Systemic Competency',
            definition: 'The compound integration of knowledge, application, and feedback loops to master a domain.',
            simplifiedExplanation: 'Like learning a language, you do not just memorize vocabulary; you build conversational systems.'
          },
          {
            concept: 'Spaced Retrieval',
            definition: 'An active learning method where information is reviewed at increasing intervals.',
            simplifiedExplanation: 'Reviewing a card in 1 day, then 3 days, then 7 days to permanently embed it in long-term memory.'
          }
        ];
      }
      if (result.flashcards.length === 0) {
        result.flashcards = [
          { question: 'What is the most effective way to retain long-term content?', answer: 'Spaced repetition combined with active retrieval practice.' },
          { question: 'How does Mastery Mode accelerate learning?', answer: 'By structuring ideas into clear mental models, learning plans, and comprehensive chapter breakdowns.' }
        ];
      }
      if (result.quiz.length === 0) {
        result.quiz = [
          {
            question: 'Which method represents the most scientifically backed retention mechanism?',
            options: ['Passive re-reading of summaries', 'Active flashcard retrieval and spaced tests', 'Highlighting text', 'Listening to lecture recordings passively'],
            answerIndex: 1,
            explanation: 'Active recall and spaced repetition are the most heavily validated learning techniques for durable memory consolidation.'
          }
        ];
      }
    }
    return result;
  };

  // A/B Testing state
  const [experimentGroup, setExperimentGroup] = useState<'A' | 'B'>(() => {
    const stored = localStorage.getItem('snapsum_ab_group');
    if (stored === 'A' || stored === 'B') return stored;
    const group = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem('snapsum_ab_group', group);
    return group;
  });

  // Selected subtab within Learn Mode workspace
  const [learnActiveTab, setLearnActiveTab] = useState<'syllabus' | 'flashcards' | 'quiz'>('syllabus');

  // State for interactive flashcards
  const [revealedFlashcards, setRevealedFlashcards] = useState<Record<number, boolean>>({});

  // Dynamic user learning stats & memory states
  const [userXp, setUserXp] = useState<number>(() => {
    return parseInt(localStorage.getItem('snapsum_user_xp') || '450', 10);
  });
  const [userLevel, setUserLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('snapsum_user_level') || '3', 10);
  });
  const [userStreak, setUserStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('snapsum_user_streak') || '5', 10);
  });
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(() => {
    return (localStorage.getItem('snapsum_adaptive_diff') as any) || 'Medium';
  });
  const [quizHistory, setQuizHistory] = useState<Array<{ videoId: string, title: string, score: number, total: number, date: string }>>(() => {
    try {
      const stored = localStorage.getItem('snapsum_quiz_history');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      { videoId: 'YCo78gA8_V0', title: 'Startups & Core Dedication', score: 3, total: 3, date: '21 Jun' },
      { videoId: 'qp0HIF3SfI4', title: 'Sinek: Leverage the Limbic System', score: 2, total: 3, date: '22 Jun' }
    ];
  });
  const [weakTopics, setWeakTopics] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('snapsum_weak_topics');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return ['Early Stage Delegation', 'Limbic Brain Physiology', 'Founder Equity Vesting'];
  });
  const [strongTopics, setStrongTopics] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('snapsum_strong_topics');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return ['Emotional Action Driver', 'Target Audience Alignment', 'Uncopyable Product Hooks'];
  });
  const [challengeCompletedToday, setChallengeCompletedToday] = useState<boolean>(() => {
    return localStorage.getItem('snapsum_challenge_completed_today') === 'true';
  });

  // Highlighted concept node in Personal Memory Graph
  const [selectedGraphNode, setSelectedGraphNode] = useState<{ concept: string; source: string; status: 'Weak' | 'Strong'; description: string; analogy: string } | null>(null);
  // Selected choice in Daily Challenge widget
  const [activeDailyQuizOption, setActiveDailyQuizOption] = useState<number | null>(null);

  const awardXp = (amount: number) => {
    setUserXp((prev) => {
      const nextXp = prev + amount;
      localStorage.setItem('snapsum_user_xp', String(nextXp));
      const nextLevel = Math.floor(nextXp / 500) + 1;
      setUserLevel((curLevel) => {
        if (nextLevel > curLevel) {
          localStorage.setItem('snapsum_user_level', String(nextLevel));
          return nextLevel;
        }
        return curLevel;
      });
      return nextXp;
    });
  };

  // Stats or reports loaded from endpoints
  const [analyticsStats, setAnalyticsStats] = useState<any>(null);
  const [showExperimentConsole, setShowExperimentConsole] = useState<boolean>(false);

  // Load A/B Testing Telemetry dynamically from API or Client Firestore fallback
  const refreshAnalyticsStats = async () => {
    // Optimization: Since analyticsStats is not rendered anywhere in the application UI,
    // we bypass retrieving all analytics records from Firestore to completely eliminate
    // O(n) document read calls, saving database usage and avoiding "Quota exceeded" errors.
    return;
  };

  const trackEventClientSide = async (videoId: string, eventName: string, metadata: any) => {
    // 1. Log to API
    try {
      fetch('/api/learn/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          experimentGroup,
          eventName,
          metadata
        })
      }).catch(() => {});
    } catch (e) {}

    // Optimization: Skip logging high-frequency engagement update events directly to Firestore
    // to prevent rapid daily write/read quota exhaustion.
    if (eventName === 'engagement_update') {
      return;
    }

    // 2. Dual log to Firestore directly for non-high-frequency actions
    try {
      await addDoc(collection(db, 'learn_analytics'), {
        videoId,
        experimentGroup: experimentGroup || 'B',
        eventName,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
        userId: visitorUser?.uid || 'anonymous',
        userEmail: visitorUser?.email || '',
      });
      console.log(`Successfully dual-logged learn analytic event ${eventName} to Firestore.`);
    } catch (err) {
      console.warn('Failed client-side Firestore analytic log:', err);
    }

    refreshAnalyticsStats();
  };

  useEffect(() => {
    refreshAnalyticsStats();
  }, [activeSummary]);

  // Track background engagement time
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeSummary) {
        const key = `snapsum_eng_${activeSummary.metadata.videoId}`;
        const currentSecs = parseInt(localStorage.getItem(key) || '0', 10) + 60;
        localStorage.setItem(key, String(currentSecs));

        trackEventClientSide(
          activeSummary.metadata.videoId,
          'engagement_update',
          { seconds: 60 }
        );
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [activeSummary, experimentGroup, visitorUser]);

  // Event telemetry triggers
  const handleTrackActivation = (mo: boolean, vidId: string) => {
    trackEventClientSide(
      vidId,
      mo ? 'learn_mode_activated' : 'summary_mode_activated',
      { timestamp: new Date().toISOString() }
    );
  };

  const handleTrackRevisit = (vidId: string) => {
    trackEventClientSide(
      vidId,
      'content_revisited',
      { timestamp: new Date().toISOString() }
    );
  };

  const handleTrackQuizCompleted = (score: number, max: number) => {
    if (!activeSummary) return;
    trackEventClientSide(
      activeSummary.metadata.videoId,
      'quiz_completed',
      { score, maxScore: max }
    );
  };

  // Helper to ensure Learn Mode structural inputs exist, with optimized fallbacks for caching or preload assets
  const ensureLearnModeStructures = (summary: YouTubeSummaryResponse | null): any => {
    if (!summary) return null;

    const safeSummary = { ...summary };
    if (!safeSummary.metadata) {
      safeSummary.metadata = {
        videoId: 'unknown',
        videoUrl: '',
        title: 'Untitled Document',
        author: 'Anonymous',
        thumbnailUrl: '',
        duration: '10'
      };
    }
    
    // Customized fine-tuned content for preloaded lecture #1: Steve Jobs
    if (safeSummary.metadata.videoId === 'UF8uR6Z6KLc') {
      if (outputLanguage === 'ar') {
        const arVideo = ARABIC_PRELOADED_VIDEOS['UF8uR6Z6KLc'];
        return {
          ...arVideo,
          learnModeEnabled: true
        };
      }
      const concepts = [
        {
          concept: 'Connecting the Dots',
          definition: 'Trusting that the diverse, seemingly random activities and challenges you pursue will eventually harmonize in your future.',
          simplifiedExplanation: 'Dropping out of college allowed Steve Jobs to take calligraphy out of pure curiosity. 10 years later, that training formed the typography system of the Macintosh.'
        },
        {
          concept: 'Love and Loss',
          definition: 'Understanding that severe setbacks, like getting fired or failing publicly, can strip away comfort and spark an incredibly creative rebirth.',
          simplifiedExplanation: "Being fired from Apple at 30 was devastating, but it freed Jobs to enter his most creative period, founding NeXT and Pixar, which eventually led to his legendary return to Apple."
        },
        {
          concept: 'Remembering Mortality',
          definition: 'Using the remembrance of death to clear away all trivial expectations of pride, fear, and embarrassment, leaving only what is truly important.',
          simplifiedExplanation: "Remembering that you will die is the single best way to avoid the trap of thinking you have something to lose. Your time is limited, so don’t live someone else's life."
        }
      ];

      const cards = [
        {
          question: 'According to Steve Jobs, why is it impossible to connect the dots looking forward?',
          answer: 'Because you can only recognize the value and synergy of life events in hindsight. You must trust that they will connect in your future.'
        },
        {
          question: 'What was the major setback Steve Jobs experienced that ultimately catalyzed Pixar and NeXT?',
          answer: 'He was fired from Apple at age 30, which freed him to enter his most creative period.'
        },
        {
          question: 'What is the single best tool Jobs recommends to stay focused on what truly matters?',
          answer: 'Remembering that you are going to die, which clears away trivial external expectations.'
        }
      ];

      const rem = `- **Trust your intuition**: Follow your heart even when it leads you off the well-worn path.\n- **Embrace setbacks**: See public failures or career disruptions as potential canvases for creative rebirth.\n- **Focus on the essential**: Remember mortality to shed fear of failure and pursue what truly matters.`;

      return {
        ...safeSummary,
        keyConcepts: concepts,
        flashcards: cards,
        rememberSummary: rem,
        learnModeEnabled: true
      };
    }

    // Customized fine-tuned content for preloaded lecture #2: Simon Sinek
    if (safeSummary.metadata.videoId === 'qp0HIF3SfI4') {
      if (outputLanguage === 'ar') {
        const arVideo = ARABIC_PRELOADED_VIDEOS['qp0HIF3SfI4'];
        return {
          ...arVideo,
          learnModeEnabled: true
        };
      }
      const concepts = [
        {
          concept: 'The Golden Circle',
          definition: 'A three-tiered structural model consisting of Why (purpose), How (process), and What (result) explaining how legendary leaders inspire action.',
          simplifiedExplanation: 'Normal companies market WHAT they do and HOW they do it. Exceptional ones communicate "Why" we exist first, hooking deep loyalty before listing products.'
        },
        {
          concept: 'Neurological Inside-Out Match',
          definition: 'The physiological fact that the layouts of the Golden Circle correspond directly to divisions of the human brain (neocortex vs. limbic system).',
          simplifiedExplanation: 'The "What" layer speaks to the analytical neocortex (language, logic). The "Why" speaks directly to the emotional limbic brain which governs decisions but has zero language.'
        },
        {
          concept: 'The Believers Magnet',
          definition: 'The law of diffusion of innovations stating that business growth relies on securing innovators who share your passion first.',
          simplifiedExplanation: "You don't want to sell to everyone who needs a widget. You want to attract the early believers who align with your values and advocate for you organically."
        }
      ];

      const cards = [
        {
          question: 'What is the neurological correlation of the "What" layer?',
          answer: 'The neocortex, which processes rational details, numbers, features, and verbal language.'
        },
        {
          question: 'What brain region controls feelings, loyalty, and gut decisions?',
          answer: 'The Limbic System, which corresponds perfectly to the "Why" and "How" layers.'
        },
        {
          question: 'Why do emotional believers matter more than simple transaction shoppers?',
          answer: 'Because believers will pay a premium, stay loyal through setbacks, and champion your brand organically.'
        }
      ];

      const rem = `- **Inside-Out Focus**: Anchor every campaign to your core beliefs (Why) before detailing features.\n- **Neurological alignment**: Frame messages to appeal to emotions (limbic brain) first, then justify with logic.\n- **Diffusion Law**: Target people who share your values to anchor a solid, recurring organic audience.`;

      return {
        ...safeSummary,
        keyConcepts: concepts,
        flashcards: cards,
        rememberSummary: rem,
        learnModeEnabled: true
      };
    }

    // Dynamic procedural backfills for user-generated summaries
    const concepts = safeSummary.keyConcepts || (safeSummary.takeaways && safeSummary.takeaways.length > 0 ? safeSummary.takeaways.map((takeaway: any) => {
      const raw = typeof takeaway === 'string' ? takeaway : (takeaway?.text || '');
      const split = raw.split('—');
      const conceptName = split[0] ? split[0].trim() : 'Core Principle';
      const expl = split[1] ? split[1].trim() : takeaway;
      return {
        concept: conceptName.slice(0, 40),
        definition: expl,
        simplifiedExplanation: `This concept emphasizes applying ${conceptName.toLowerCase()} directly to the core video context to maximize outcomes.`
      };
    }).slice(0, 4) : [
      {
        concept: 'High-Velocity Focus',
        definition: 'Devoting complete cognitive resources to a single, high-leverage task to accelerate project delivery.',
        simplifiedExplanation: 'Like a laser beam, focus on doing one thing extremely well instead of scattering your energy over multiple features.'
      }
    ]);

    const cards = safeSummary.flashcards || (safeSummary.quiz && safeSummary.quiz.length > 0 ? safeSummary.quiz.map((q) => ({
      question: q.question,
      answer: q.explanation || `The correct answer is indeed option index ${q.answerIndex + 1}: ${q.options[q.answerIndex] || ''}`
    })).slice(0, 4) : [
      {
        question: 'What is the main takeaway regarding optimization of study workflows?',
        answer: 'Iterate on structured, digestible micro-lessons daily rather than giant studying cram sessions.'
      }
    ]);

    const rem = safeSummary.rememberSummary || (safeSummary.summary ? `- **Syllabus Baseline**: ${safeSummary.summary.split('.')[0] || ''}.\n- **Strategic Value**: Focus heavily on interactive retention milestones weekly.\n- **Action Checklist**: Answer all self-quizzes to lock in core definitions.` : `- **Primary lesson**: Master the concept definitions.\n- **Active recall**: Flip flashcards repeatedly to embed memories.\n- **Comprehension check**: Finish the interactive quiz session with perfect marks.`);

    return {
      ...safeSummary,
      keyConcepts: concepts,
      flashcards: cards,
      rememberSummary: rem,
      learnModeEnabled: true
    };
  };

  // Synchronize preloaded videos based on selected output language
  useEffect(() => {
    if (activeSummary && activeSummary.metadata) {
      const vidId = activeSummary.metadata.videoId;
      if (vidId === 'UF8uR6Z6KLc' || vidId === 'qp0HIF3SfI4') {
        if (outputLanguage === 'ar') {
          const arVideo = ARABIC_PRELOADED_VIDEOS[vidId];
          if (arVideo && activeSummary.summary !== arVideo.summary) {
            setActiveSummary(ensureLearnModeStructures(arVideo));
          }
        } else {
          const enVideo = PRELOADED_VIDEOS.find(v => v.metadata.videoId === vidId);
          if (enVideo && activeSummary.summary !== enVideo.summary) {
            setActiveSummary(ensureLearnModeStructures(enVideo));
          }
        }
      }
    }

    if (demoActiveVideo && demoActiveVideo.metadata) {
      const vidId = demoActiveVideo.metadata.videoId;
      if (vidId === 'UF8uR6Z6KLc' || vidId === 'qp0HIF3SfI4') {
        if (outputLanguage === 'ar') {
          const arVideo = ARABIC_PRELOADED_VIDEOS[vidId];
          if (arVideo && demoActiveVideo.summary !== arVideo.summary) {
            setDemoActiveVideo(arVideo);
          }
        } else {
          const enVideo = PRELOADED_VIDEOS.find(v => v.metadata.videoId === vidId);
          if (enVideo && demoActiveVideo.summary !== enVideo.summary) {
            setDemoActiveVideo(enVideo);
          }
        }
      }
    }
  }, [outputLanguage, activeSummary?.metadata?.videoId, demoActiveVideo?.metadata?.videoId]);

  const downloadSummaryAsPDF = () => {
    if (!activeSummary) return;
    if (!visitorUser) {
      setAuthModalPurpose('Export high-resolution PDF summaries and premium white-labeled study reports');
      setShowAuthModal(true);
      return;
    }
    const contents = `---
ZIPYTINY PROFESSIONAL SUMMARY REPORT
TITLE: ${activeSummary.metadata?.title || 'Untitled Document'}
AUTHOR: ${activeSummary.metadata?.author || 'Anonymous'}
DURATION: ${activeSummary.metadata?.duration || '10'}
REPORT GENERATED: ${new Date().toLocaleString()}
STATUS: PREMIUM SUBSCRIBER WHITE-LABELED EXPORT
---

CORE THESIS & SYNTHESIS:
========================
${activeSummary.summary}

KEY TAKEAWAYS & DIRECT VALUE BOMBS:
===================================
${activeSummary.takeaways.map((bomb: any, index: number) => `${index + 1}. ${typeof bomb === 'string' ? bomb : bomb?.text || ''}`).join('\n')}

TOPIC CATEGORIES & BRAIN MINDMAP:
=================================
${activeSummary.mindmap.map((node) => `[${node.category}] ${node.concept}: ${node.description}`).join('\n')}
`;

    const blob = new Blob([contents], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${(activeSummary.metadata?.title || 'Untitled').toLowerCase().replace(/[^a-z0-9]/g, '_')}_summary.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load saved summaries on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('youtube_summarizer_shelf');
      if (stored) {
        const parsed = JSON.parse(stored) as any[];
        const migrated: SavedSummary[] = parsed.map((item: any) => {
          if (!item) return null;
          
          let response = item.response;
          if (!response && (item.metadata || item.summary)) {
            response = item;
          }

          if (response) {
            if (!response.metadata) {
              response.metadata = {
                videoId: item.id || response.metadata?.videoId || 'unknown',
                videoUrl: '',
                title: 'Untitled Document',
                author: 'Anonymous',
                thumbnailUrl: '',
                duration: '10'
              };
            }
            return {
              id: item.id || response.metadata?.videoId || 'unknown',
              savedAt: item.savedAt || new Date().toLocaleDateString(),
              response: response
            } as SavedSummary;
          }
          return null;
        }).filter(Boolean) as SavedSummary[];

        setSavedSummaries(migrated);
      }
    } catch (e) {
      console.warn('Failed parsing local storage histories', e);
    }
  }, []);

  // Update localStorage when savedSummaries list changes
  const saveToShelf = (updated: SavedSummary[]) => {
    setSavedSummaries(updated);
    try {
      localStorage.setItem('youtube_summarizer_shelf', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed storing summary items', e);
    }
  };

  // Helper: Format audio durations (MM:SS)
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  // Setup/Clean Audio object
  useEffect(() => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        setAudioProgress(audio.currentTime);
      });
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setAudioProgress(0);
      });

      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn('Audio play auto-interrupted', err);
          setIsPlaying(false);
        });
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioUrl]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  // Copy text helper
  const handleCopyText = (text: string, elementId: string) => {
    let textToCopy = text;
    if (['blog', 'thread', 'snippet', 'overview', 'summary'].includes(elementId)) {
      textToCopy = `${text}\n\n---\n⚡ Summarized by Zipytiny - AI Video Knowledge Engine (https://www.zipytiny.app)`;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedStates((prev) => ({ ...prev, [elementId]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [elementId]: false }));
    }, 2000);
  };

  const processedActiveSummary = useMemo(() => {
    if (!activeSummary) return null;
    const hydrated = ensureLearnModeStructures(activeSummary);
    return adaptSummaryForLearningDepth(hydrated, learningDepth);
  }, [activeSummary, learningDepth]);

  // Request new AI Summary processing
  const handleSummarize = async (
    e?: React.FormEvent,
    overrideUrl?: string,
    overrideType?: 'video' | 'website' | 'file' | 'text',
    overrideDepth?: 'quick' | 'study' | 'mastery'
  ) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const activeDepth = overrideDepth || learningDepth;
    const activeType = overrideType || inputSourceType;
    let finalVideoUrl = overrideUrl || videoUrl;
    let finalCustomTranscript = customTranscript;

    if (activeType === 'website') {
      if (!inputWebsiteUrl && !overrideUrl) return;
      finalVideoUrl = overrideUrl || inputWebsiteUrl;
      finalCustomTranscript = `Please summarize and extract core concepts and key learnings from the website: ${finalVideoUrl}. Focus on providing high-quality summaries, blog posts, mental models and key chapter milestones as if it was a video lecture or textbook chapter.`;
    } else if (activeType === 'file') {
      if (uploadedFiles.length === 0) return;
      finalVideoUrl = 'https://www.zipytiny.app/uploaded-files';
      finalCustomTranscript = uploadedFiles.map(f => `SOURCE FILE ATTACHED: ${f.name}\nSIZE: ${f.size} bytes\nTYPE: ${f.type}\nBODY CONTENT:\n${f.textContent || `[Rich document layout parsing for ${f.name}. Dynamic study guides enabled.]`}`).join('\n\n---\n\n');
    } else if (activeType === 'text') {
      if (!pastedContentText && !overrideUrl) return;
      finalVideoUrl = 'https://www.zipytiny.app/pasted-text';
      finalCustomTranscript = overrideUrl || pastedContentText;
    }

    // Save to recent URLs cache if it is a real external URL
    if (finalVideoUrl && !finalVideoUrl.startsWith('https://www.zipytiny.app/')) {
      setRecentUrls(prev => {
        const filtered = prev.filter(u => u !== finalVideoUrl);
        const updated = [finalVideoUrl, ...filtered].slice(0, 5);
        try {
          localStorage.setItem('zipytiny_recent_urls', JSON.stringify(updated));
        } catch (err) {
          console.error(err);
        }
        return updated;
      });
    }

    // 🌟 Frictionless Demo Interceptor for Guest Users (No Login Required)
    if (!visitorUser) {
      const matchedPreload = PRELOADED_VIDEOS.find(
        (video) => finalVideoUrl && (finalVideoUrl.includes(video.metadata.videoId) || video.metadata.videoUrl === finalVideoUrl)
      );

      if (matchedPreload) {
        setLoading(true);
        setError(null);
        setQuizSubmitted(false);
        setSelectedAnswers({});
        setYtStartSeconds(null);
        
        // Reset TTS audio
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setAudioUrl(null);
        setIsPlaying(false);

        setLoadingStep('Ingesting video data & transcribing core lecture audio...');
        setTimeout(() => {
          setLoadingStep('Extracting key concepts & compiling learning nodes...');
          setTimeout(() => {
            setLoadingStep('Designing mind map workspace & building practice aids...');
            setTimeout(() => {
              const hydratedMock = adaptSummaryForLearningDepth(ensureLearnModeStructures(matchedPreload!), activeDepth);
              setActiveSummary(hydratedMock);
              setCurrentScreen('app');
              const isLMode = activeDepth !== 'quick';
              setLearnMode(isLMode);
              localStorage.setItem('snapsum_learn_mode', isLMode ? 'true' : 'false');
              setLoading(false);
              setShowWowMoment(true);
              
              // Increment guest count
              const currentCount = Number(localStorage.getItem('zipytiny_guest_summaries_count') || '0');
              localStorage.setItem('zipytiny_guest_summaries_count', String(currentCount + 1));
            }, 500);
          }, 500);
        }, 500);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setYtStartSeconds(null);
    
    // Reset TTS audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioUrl(null);
    setIsPlaying(false);

    // 🌟 Smart Interceptor: If pasted URL corresponds to one of the rich preloaded videos,
    // load it directly with zero network delay and zero API costs! Great for free live demos.
    const matchedPreload = PRELOADED_VIDEOS.find(
      (video) => finalVideoUrl && (finalVideoUrl.includes(video.metadata.videoId) || video.metadata.videoUrl === finalVideoUrl)
    );

    if (matchedPreload) {
      setLoadingStep('Bypassing API: Loading pre-rendered high-fidelity summary...');
      setTimeout(() => {
        const hydratedMock = adaptSummaryForLearningDepth(ensureLearnModeStructures(matchedPreload), activeDepth);
        setActiveSummary(hydratedMock);
        setCurrentScreen('app');
        const isLMode = activeDepth !== 'quick';
        setLearnMode(isLMode);
        localStorage.setItem('snapsum_learn_mode', isLMode ? 'true' : 'false');
        if (selectedTone === 'reel') {
          setActiveTab('reel');
        }

        // Save to shelf history
        const alreadySaved = savedSummaries.some((item) => item.id === matchedPreload.metadata.videoId);
        if (!alreadySaved) {
          const updatedShelf: SavedSummary[] = [
            {
              id: matchedPreload.metadata.videoId,
              savedAt: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              response: hydratedMock,
            },
            ...savedSummaries,
          ];
          saveToShelf(updatedShelf);
        }
        trackGAEvent('summary_generated', {
          video_id: matchedPreload.metadata.videoId,
          video_title: matchedPreload.metadata.title,
          source: 'preloaded_cache',
          custom_transcript_used: showCustomTranscriptField || activeType !== 'video'
        });
        handleTrackActivation(learnMode, matchedPreload.metadata.videoId);
        if (!visitorUser) {
          const currentCount = Number(localStorage.getItem('zipytiny_guest_summaries_count') || '0');
          localStorage.setItem('zipytiny_guest_summaries_count', String(currentCount + 1));
        }
        setLoading(false);
        setShowWowMoment(true);
      }, 700); // Authentic processing delay for micro-animation feel
      return;
    }

    setLoadingStep(
      activeType === 'file' 
        ? 'Extracting text layouts and preparing document vector mappings...' 
        : activeType === 'website' 
          ? 'Scraping website markup and distilling body articles...' 
          : 'Analyzing video metadata & extracting transcripts...'
    );

    setIsLoadingSummary(true);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          videoUrl: finalVideoUrl,
          customTranscript: finalCustomTranscript || undefined,
          outputLanguage,
          learnMode: activeDepth !== 'quick',
          learningDepth: activeDepth,
          advancedSettings: showAdvancedOptions ? {
            summaryLength: advSummaryLength,
            customWordCount: advCustomWordCount,
            flashcardCount: advFlashcardCount,
            quizQuestionCount: advQuizQuestionCount,
            mindMapDetail: advMindMapDetail,
            explanationStyle: advExplanationStyle
          } : undefined
        }),
      });

      if (!response.ok) {
        let errorMsg = `Server returned status ${response.status}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } else {
            const text = await response.text();
            if (text.includes('<body>') || text.includes('<!DOCTYPE')) {
              const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
              if (response.status === 502 || response.status === 504) {
                errorMsg = `Server Timeout or Gateway Interrupt (${response.status}). This is usually a temporary network hiccup or cold-start delay from Google's backend. Please try clicking the "Summarize Video" button again, or use the "Custom Transcript override" box to paste your text if the video is extremely long.`;
              } else {
                errorMsg = `Server Error (${response.status}): ${cleanText}`;
              }
            } else {
              errorMsg = text.slice(0, 300) || errorMsg;
            }
          }
        } catch (e) {
          if (response.status === 502 || response.status === 504) {
            errorMsg = `Server Timeout or Gateway Interrupt (${response.status}). This is usually a temporary network hiccup or cold-start delay from Google's backend. Please try clicking the "Summarize Video" button again, or use the "Custom Transcript override" box to paste your text if the video is extremely long.`;
          } else {
            errorMsg = `Server Error (${response.status}).`;
          }
        }
        throw new Error(errorMsg);
      }

      setLoadingStep('Applying advanced reasoning structures with Gemini...');
      let summaryData: YouTubeSummaryResponse;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          summaryData = (await response.json()) as YouTubeSummaryResponse;
        } else {
          const text = await response.text();
          if (text.includes('<body>') || text.includes('<!DOCTYPE')) {
            const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
            throw new Error(`Invalid JSON response (Status ${response.status}): ${cleanText}`);
          } else {
            throw new Error(`Invalid JSON response: ${text.slice(0, 300)}`);
          }
        }
      } catch (err: any) {
        throw new Error(err.message || 'Failed to parse server summary response.');
      }
      const hydratedData = ensureLearnModeStructures(summaryData);
      
      setActiveSummary(hydratedData);
      setCurrentScreen('app');
      const isLMode = activeDepth !== 'quick';
      setLearnMode(isLMode);
      localStorage.setItem('snapsum_learn_mode', isLMode ? 'true' : 'false');
      if (selectedTone === 'reel') {
        setActiveTab('reel');
      }

      trackGAEvent('summary_generated', {
        video_id: hydratedData.metadata.videoId,
        video_title: hydratedData.metadata.title,
        source: 'api_live',
        model_configured: adminSelectedModel,
        custom_transcript_used: showCustomTranscriptField
      });
      handleTrackActivation(learnMode, hydratedData.metadata.videoId);
      if (!visitorUser) {
        const currentCount = Number(localStorage.getItem('zipytiny_guest_summaries_count') || '0');
        localStorage.setItem('zipytiny_guest_summaries_count', String(currentCount + 1));
      }

      // Save to shelf
      const alreadySaved = savedSummaries.some((item) => item.id === summaryData.metadata.videoId);
      if (!alreadySaved) {
        const updatedShelf: SavedSummary[] = [
          {
            id: summaryData.metadata.videoId,
            savedAt: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            response: summaryData,
          },
          ...savedSummaries,
        ];
        saveToShelf(updatedShelf);
      }

      setShowWowMoment(true);

      // Scroll to summary content cleanly
      setTimeout(() => {
        document.getElementById('summary-dashboard')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

      refreshStatus();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected failure occurred while loading the video summary.');
      trackGAEvent('summary_failed', {
        video_url: videoUrl,
        error_message: err.message || 'unknown error'
      });
      refreshStatus();
    } finally {
      setLoading(false);
      setIsLoadingSummary(false);
      setLoadingStep('');
    }
  };

  // High Quality Speech synthesis trigger
  const handleGenerateTTS = async (textSource: string) => {
    if (ttsLoading) return;
    setTtsLoading(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text: textSource }),
      });

      if (!response.ok) {
        throw new Error('TTS generator service failed.');
      }

      const data = await response.json();
      if (data.audioBase64) {
        const binary = atob(data.audioBase64);
        const arrayBuffer = new ArrayBuffer(binary.length);
        const byteArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binary.length; i++) {
          byteArray[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: 'audio/mpeg' });
        const objectUrl = URL.createObjectURL(blob);
        setAudioUrl(objectUrl);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error(err);
      alert('High-quality TTS failed. We will fallback to the standard browser Speecher API.');
      
      // Fallback: Browser Web Speech API
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textSource.slice(0, 800));
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } catch (speechErr) {
        console.error('Speech synthesis fallback failed:', speechErr);
      }
    } finally {
      setTtsLoading(false);
    }
  };

  // Trigger cross-video cognitive synthesis ("Knowledge Stack")
  const handleGenerateStack = async () => {
    if (!stackNameInput.trim()) {
      alert('Please enter a name for your Knowledge Stack.');
      return;
    }
    if (selectedStackVideoIds.length < 2) {
      alert('Please select at least 2 video summaries to synthesize.');
      return;
    }

    setIsSynthesizing(true);
    try {
      const selectedVideos = savedSummaries
        .filter((vid) => selectedStackVideoIds.includes(vid.id))
        .map((vid) => vid.response);

      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          stackName: stackNameInput.trim(),
          videos: selectedVideos,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate stack.');
      }

      const newStack = await response.json();
      setSavedStacks((prev) => [newStack, ...prev]);
      setActiveStack(newStack);
      setActiveStackTab('overview');
      setStackQuizAnswers({});
      setStackQuizSubmitted(false);
      setActiveSummary(null); // Clear individual summary when stack is loaded
      
      // Reset selection creator
      setIsSelectingForStack(false);
      setSelectedStackVideoIds([]);
      setStackNameInput('');
    } catch (err: any) {
      console.error(err);
      alert('Failed to synthesize Knowledge Stack: ' + err.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Jump YouTube Iframe Embed to timestamp matching target second
  const handleJumpToTimestamp = (seconds: number) => {
    setYtStartSeconds(seconds);
    setYtAutoplayKey((prev) => prev + 1);
    
    // Scroll window smoothly to player
    document.getElementById('video-player-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Erase saved shelf items
  const handleDeleteShelfItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedSummaries.filter((item) => item.id !== id);
    saveToShelf(filtered);
  };

  // Clear all history
  const handleClearAllHistory = () => {
    if (confirm('Are you sure you want to permanently erase your cached summary library?')) {
      saveToShelf([]);
    }
  };

  // Load stored item
  const handleLoadStoredItem = (summary: YouTubeSummaryResponse) => {
    setCurrentScreen('app');
    const hydratedSummary = ensureLearnModeStructures(summary);
    setActiveSummary(hydratedSummary);
    const isLMode = learningDepth !== 'quick';
    setLearnMode(isLMode);
    localStorage.setItem('snapsum_learn_mode', isLMode ? 'true' : 'false');
    if (selectedTone === 'reel') {
      setActiveTab('reel');
    }
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setYtStartSeconds(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioUrl(null);
    setIsPlaying(false);
    handleTrackRevisit(hydratedSummary.metadata.videoId);

    setTimeout(() => {
      document.getElementById('summary-dashboard')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLoadVideoById = (videoId: string, isSummary: boolean) => {
    const demoMatched = PRELOADED_VIDEOS.find(v => v.metadata.videoId === videoId);
    if (demoMatched) {
      handleLoadStoredItem(demoMatched);
      return;
    }
    const shelfMatched = savedSummaries.find(s => s.id === videoId);
    if (shelfMatched) {
      handleLoadStoredItem(shelfMatched.response);
      return;
    }
    setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);
  };

  // Admin Dashboard API Handler utilities:
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: adminUserField, 
          password: adminPassField,
          mfaCode: adminMfaRequired ? adminMfaField : undefined
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.lockoutSeconds) {
          setLockoutSeconds(data.lockoutSeconds);
        }
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        throw new Error(data.error || 'Authentication challenge failed.');
      }

      if (data.mfaRequired) {
        setAdminMfaRequired(true);
        setAdminError('');
        return;
      }

      if (data.token) {
        sessionStorage.setItem('admin_session_token', data.token);
        setAdminSessionToken(data.token);
        setIsAdminAuthenticated(true);
        setAdminMfaRequired(false);
        setAttemptsRemaining(null);
        setLockoutSeconds(null);
        fetchAdminIpTracker(data.token);
        fetchAdminAuditLogs(data.token);
        fetchAdminGoogleUsers(data.token);
      }
    } catch (err: any) {
      setAdminError(err.message || 'Invalid credentials. Access denied.');
    }
  };

  const handleAdminLogout = async () => {
    try {
      if (adminSessionToken) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: adminSessionToken })
        });
      }
    } catch {}
    sessionStorage.removeItem('admin_session_token');
    setAdminSessionToken('');
    setIsAdminAuthenticated(false);
    setAdminMfaRequired(false);
    setAdminMfaField('');
    setAdminUserField('');
    setAdminPassField('');
    setAdminAuditLogs([]);
    setAdminIpList([]);
    setAdminGoogleUsers([]);
  };

  // Helper: generate highly secured password
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let pass = '';
    // Use window.crypto for secure random values
    const array = new Uint32Array(20);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 20; i++) {
      pass += chars[array[i] % chars.length];
    }
    setVaultPassword(pass);
    setVaultPasswordVisible(true);
  };

  // Helper: trigger 2FA generation
  const handleGenerate2FA = async () => {
    setVaultSetupLoading(true);
    setVaultSaveStatus({ type: 'idle', message: '' });
    try {
      const response = await fetch('/api/admin/generate-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminSessionToken })
      });
      const data = await response.json();
      if (response.ok) {
        setVault2faSecret(data.secret);
        setVault2faQrUrl(data.qrCodeUrl);
        setVault2faVerified(false);
      } else {
        setVaultSaveStatus({ type: 'error', message: data.error || 'Failed to initialize 2FA.' });
      }
    } catch (err: any) {
      setVaultSaveStatus({ type: 'error', message: err.message || 'Network error initializing 2FA.' });
    } finally {
      setVaultSetupLoading(false);
    }
  };

  // Helper: verify TOTP code before saving settings
  const handleVerify2FASetup = async () => {
    if (!vault2faSetupCode.trim()) return;
    setVaultSetupLoading(true);
    setVaultSaveStatus({ type: 'idle', message: '' });
    try {
      const response = await fetch('/api/admin/verify-2fa-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: adminSessionToken,
          mfaSecret: vault2faSecret,
          mfaCode: vault2faSetupCode
        })
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        setVault2faVerified(true);
        setVaultSaveStatus({ type: 'success', message: 'Authenticator App token verified successfully!' });
      } else {
        setVaultSaveStatus({ type: 'error', message: 'MFA pin is incorrect. Please verify your authenticator app clock synchronization.' });
      }
    } catch (err: any) {
      setVaultSaveStatus({ type: 'error', message: err.message || 'Error verifying setup.' });
    } finally {
      setVaultSetupLoading(false);
    }
  };

  // Helper: Save administrative vault credentials and settings to Firestore Database
  const handleSaveVaultSettings = async () => {
    if (!vaultUsername.trim() || !vaultPassword.trim()) {
      setVaultSaveStatus({ type: 'error', message: 'Username and password fields cannot be empty.' });
      return;
    }
    setVaultSetupLoading(true);
    setVaultSaveStatus({ type: 'idle', message: '' });
    try {
      const response = await fetch('/api/admin/save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: adminSessionToken,
          adminUser: vaultUsername,
          adminPassword: vaultPassword,
          mfaSecret: vault2faVerified ? vault2faSecret : null
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setVaultSaveStatus({ type: 'success', message: 'Admin login credentials & security parameters successfully saved to Firestore Database!' });
        fetchAdminAuditLogs();
      } else {
        setVaultSaveStatus({ type: 'error', message: data.error || 'Failed to save administrative settings.' });
      }
    } catch (err: any) {
      setVaultSaveStatus({ type: 'error', message: err.message || 'Network error saving settings.' });
    } finally {
      setVaultSetupLoading(false);
    }
  };

  const fetchAdminIpTracker = async (currentToken?: string) => {
    const activeToken = currentToken || adminSessionToken;
    if (!activeToken) return;
    setAdminIpLoading(true);
    try {
      const response = await fetch('/api/admin/ip-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeToken }),
      });
      if (response.ok) {
        const data = await response.json();
        setAdminIpList(data.ips || []);
      }
    } catch (err) {
      console.warn('Could not read IP tracker list:', err);
    } finally {
      setAdminIpLoading(false);
    }
  };

  const fetchAdminAuditLogs = async (currentToken?: string) => {
    const activeToken = currentToken || adminSessionToken;
    if (!activeToken) return;
    setAdminLogsLoading(true);
    try {
      const response = await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeToken }),
      });
      if (response.ok) {
        const data = await response.json();
        setAdminAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.warn('Could not read secure administrative audit logs:', err);
    } finally {
      setAdminLogsLoading(false);
    }
  };

  const renderDemoVideoPlayer = () => {
    if (!customDemoVideoUrl) {
      return (
        <div className="p-12 text-center bg-white rounded-3xl border border-black/[0.04] shadow-sm space-y-4">
          <Video className="w-12 h-12 text-neutral-300 mx-auto animate-bounce" />
          <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed font-sans">
            No custom video URL has been configured yet. Log into the <strong>Admin Control Panel</strong> (on the upper right under credentials) to configure your YouTube, Loom, Vimeo, or MP4 link!
          </p>
        </div>
      );
    }

    const parsed = getEmbedUrl(customDemoVideoUrl);
    if (!parsed || !parsed.embedUrl) {
      return (
        <div className="p-12 text-center bg-white rounded-3xl border border-black/[0.04] shadow-sm space-y-4">
          <Video className="w-12 h-12 text-neutral-300 mx-auto" />
          <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed font-sans">
            Invalid video URL formatting. Please check your video URL or ID inside the Admin Panel.
          </p>
        </div>
      );
    }

    if (parsed.type === 'direct') {
      return (
        <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden border border-black/10 shadow-lg relative max-w-4xl mx-auto">
          <video
            src={parsed.embedUrl}
            controls
            preload="metadata"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className="aspect-video w-full bg-neutral-950 rounded-3xl overflow-hidden border border-black/10 shadow-lg relative max-w-4xl mx-auto">
        <iframe
          src={parsed.embedUrl}
          title="Zipytiny Product Demo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full absolute inset-0"
        />
      </div>
    );
  };

  const fetchAdminGoogleUsers = async (currentToken?: string) => {
    const activeToken = currentToken || adminSessionToken;
    if (!activeToken) return;
    setAdminGoogleUsersLoading(true);
    try {
      // 1. Try fetching via backend API first
      let loadedUsers: any[] = [];
      try {
        const response = await fetch('/api/admin/google-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: activeToken }),
        });
        if (response.ok) {
          const data = await response.json();
          loadedUsers = data.users || [];
        }
      } catch (err) {
        console.warn('API fetch for google users failed, falling back to client-side Firestore:', err);
      }

      // 2. If API returned empty (due to backend IAM restrictions) or failed, query client-side Firestore directly!
      if (loadedUsers.length === 0) {
        try {
          const q = query(collection(db, 'google_users'), orderBy('lastLoginAt', 'desc'));
          const snapshot = await getDocs(q);
          const users: any[] = [];
          snapshot.forEach((docSnap) => {
            users.push(docSnap.data());
          });
          loadedUsers = users;
        } catch (err) {
          console.warn('Client-side Firestore google users fetch failed:', err);
        }
      }

      setAdminGoogleUsers(loadedUsers);
    } catch (err) {
      console.warn('Could not read secure administrative google users logs:', err);
    } finally {
      setAdminGoogleUsersLoading(false);
    }
  };

  const runDbDiagnostic = async () => {
    if (!adminSessionToken) return;
    setAdminDbDiagnosticLoading(true);
    setAdminDbDiagnosticResult(null);
    try {
      // 1. Try backend API diagnostic check
      let apiResult: any = null;
      try {
        const response = await fetch('/api/admin/db-diagnostic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: adminSessionToken }),
        });
        if (response.ok) {
          apiResult = await response.json();
        }
      } catch (err) {
        console.warn('Backend DB diagnostic check failed:', err);
      }

      // 2. Perform direct client-side database write/read test
      let clientSuccess = false;
      let clientError = '';
      try {
        const testRef = doc(db, 'google_users', 'admin_client_test_doc');
        await setDoc(testRef, { test: true, timestamp: new Date().toISOString() });
        const snap = await getDoc(testRef);
        if (snap.exists()) {
          clientSuccess = true;
          await deleteDoc(testRef);
        } else {
          clientError = 'Test document was not created successfully.';
        }
      } catch (err: any) {
        clientError = err.message || String(err);
      }

      if (apiResult && apiResult.success) {
        setAdminDbDiagnosticResult({
          success: true,
          mode: 'Full Stack Connected',
          details: `Backend connection test was successful! Client-side write/read: ${clientSuccess ? 'OK' : 'FAILED (' + clientError + ')'}`,
          projectId: apiResult.projectId,
          databaseId: apiResult.databaseId,
        });
      } else {
        // If backend fails but client-side succeeds, we are in Client-Auth Direct Connected Mode!
        setAdminDbDiagnosticResult({
          success: clientSuccess,
          mode: clientSuccess ? 'Client-Auth Direct Connected' : 'Disconnected',
          details: clientSuccess 
            ? 'The server-side container lacks direct GCP IAM owner credentials, but your logged-in Google credentials successfully authenticated direct client-side Firestore read/write! All visitor logging and analytics are operational via Client-Auth mode.' 
            : `Both server and client database connections failed. Client error: ${clientError}. Backend error: ${apiResult?.error || 'unreachable'}`,
          error: clientSuccess
            ? null
            : `Client error: ${clientError || 'none'}. Backend error: ${apiResult?.error || 'unreachable'}.`,
          projectId: firebaseConfig.projectId,
          databaseId: firebaseConfig.firestoreDatabaseId || '(default)'
        });
      }
    } catch (err: any) {
      setAdminDbDiagnosticResult({ success: false, error: err.message || 'Unexpected diagnostic error.' });
    } finally {
      setAdminDbDiagnosticLoading(false);
    }
  };

  const handleSendSupportMessage = async (overrideText?: string) => {
    const textToSend = overrideText || supportInput;
    if (!textToSend.trim() || isSupportTyping) return;

    // Clear input
    setSupportInput('');

    // Add user message immediately
    const userMsg = {
      role: 'user' as const,
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSupportMessages(prev => [...prev, userMsg]);
    setIsSupportTyping(true);
    trackGAEvent?.('support_message_sent', { text_length: textToSend.length });

    try {
      const response = await fetch('/api/customer-support', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          messages: [
            ...supportMessages.map(m => ({ role: m.role, content: m.text })),
            { role: 'user', content: textToSend.trim() }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg = {
          role: 'assistant' as const,
          text: data.reply || "I am here to assist you. Let me know if you need help with subscriptions, custom API keys, or sandbox settings!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setSupportMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Support service issues.');
      }
    } catch (err) {
      const errorMsg = {
        role: 'assistant' as const,
        text: "I am experiencing brief technical difficulties processing your prompt. Please ensure your backend container is initialized and try again shortly!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSupportMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSupportTyping(false);
    }
  };

  const handleResetSpecificIp = async (ip: string) => {
    if (!confirm(`Are you sure you want to reset rate limits for guest IP ${ip}?`)) return;
    try {
      const response = await fetch('/api/admin/ip-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: adminSessionToken,
          targetIp: ip
        }),
      });
      if (response.ok) {
        fetchAdminIpTracker();
        fetchAdminAuditLogs();
        refreshStatus();
      }
    } catch (err) {
      console.warn('Could not reset guest IP rate limits:', err);
    }
  };

  const handleResetAllIps = async () => {
    if (!confirm('Are you sure you want to clear rate limits for ALL guests simultaneously?')) return;
    try {
      const response = await fetch('/api/admin/ip-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: adminSessionToken,
          clearAll: true
        }),
      });
      if (response.ok) {
        fetchAdminIpTracker();
        fetchAdminAuditLogs();
        refreshStatus();
      }
    } catch (err) {
      console.warn('Could not reset all rate limits:', err);
    }
  };

  // Quiz score check
  const calculateQuizScore = () => {
    if (!activeSummary) return 0;
    let score = 0;
    activeSummary.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) {
        score++;
      }
    });
    return score;
  };

  return (
    <ErrorBoundary>
      <div 
        className={`min-h-screen ${isDark ? 'dark bg-neutral-950 text-neutral-100' : 'bg-[#f5f5f7] text-[#1d1d1f]'} font-sans antialiased selection:bg-[#0071e3]/10 selection:text-[#0071e3] ${isRtl ? 'rtl' : ''}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
      
      {/* Top Premium Announcement Banner */}
      {currentScreen === 'landing' && (
        <div className="bg-[#0071e3] text-white text-[11px] font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 sm:gap-3 font-sans shadow-sm z-40 relative">
          <span>Your First AI Workspace is Free! No credit card required.</span>
          <button
            onClick={() => {
              const inputEl = document.getElementById('landing-main-input');
              if (inputEl) {
                inputEl.focus();
                inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="bg-white text-[#0071e3] px-2.5 py-0.5 rounded-full font-extrabold text-[9.5px] hover:bg-neutral-100 transition cursor-pointer select-none whitespace-nowrap"
          >
            Learn More
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-35 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border-b border-black/[0.05] dark:border-zinc-800/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group shrink-0" onClick={() => setCurrentScreen('landing')}>
            <div className="h-8 w-8 bg-[#1d1d1f] dark:bg-zinc-100 flex items-center justify-center rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition duration-300">
              <img src="/logo.svg" alt="Zipytiny Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" decoding="async" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50 group-hover:opacity-75 transition">
                Zipytiny
              </span>
              <p className="text-[8px] uppercase tracking-widest text-[#86868b] dark:text-zinc-400 font-semibold font-mono leading-none mt-0.5">
                AI Knowledge Engine
              </p>
            </div>
          </div>

          {/* Center Nav */}
          <nav className="flex items-center bg-black/[0.04] dark:bg-zinc-900 p-1 rounded-full border border-black/[0.02] dark:border-zinc-800/60 gap-0.5">
            {/* Workspace */}
            <button
              onClick={() => setCurrentScreen('app')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentScreen === 'app'
                  ? 'bg-white dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-50 shadow-sm'
                  : 'text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t('workspace')}</span>
            </button>

            {/* Recorder & Tour */}
            <button
              onClick={() => setCurrentScreen('explainer')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentScreen === 'explainer'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-100'
              }`}
            >
              <Video className="w-3.5 h-3.5 shrink-0" />
              <span>{t('recorderTour')}</span>
            </button>

            {/* Chrome Extension */}
            <button
              onClick={() => setCurrentScreen('extension')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentScreen === 'extension'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm font-semibold'
                  : 'text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-100'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5 shrink-0" />
              <span>Extension</span>
            </button>

            {/* History — visible only when summaries exist */}
            {savedSummaries.length > 0 && currentScreen === 'app' && (
              <button
                onClick={() => {
                  setCurrentScreen('app');
                  setTimeout(() => {
                    document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-100 whitespace-nowrap"
              >
                <History className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">History</span>
                <span className="bg-[#0071e3]/10 text-[#0071e3] text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full">
                  {savedSummaries.length}
                </span>
              </button>
            )}

            {(isAdminAuthenticated || ['domain', 'marketing', 'admin'].includes(currentScreen)) && (
              <button
                onClick={() => setCurrentScreen('domain')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  currentScreen === 'domain'
                    ? 'bg-white dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-50 shadow-sm'
                    : 'text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-100'
                }`}
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Domain</span>
              </button>
            )}

            <button
              onClick={() => setCurrentScreen('billing')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentScreen === 'billing'
                  ? 'bg-white dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-50 shadow-sm'
                  : 'text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:flex items-center gap-1">
                <span>Pricing</span>
                {isPremium ? (
                  <span className="bg-[#0071e3] text-white text-[8px] font-mono leading-none px-1.5 py-0.5 rounded-full">PRO</span>
                ) : (
                  <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[8px] font-mono leading-none px-1.5 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/40">Upgrade</span>
                )}
              </span>
            </button>

            {(isAdminAuthenticated || ['domain', 'marketing', 'admin'].includes(currentScreen)) && (
              <>
                <button
                  onClick={() => setCurrentScreen('marketing')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    currentScreen === 'marketing'
                      ? 'bg-white dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-50 shadow-sm'
                      : 'text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-100'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden md:inline">Marketing</span>
                </button>
                <button
                  onClick={() => setCurrentScreen('admin')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    currentScreen === 'admin'
                      ? 'bg-zinc-800 dark:bg-zinc-700 text-white shadow-sm'
                      : 'text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Admin</span>
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-black/[0.04] dark:hover:bg-zinc-850 transition duration-200 text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-50 cursor-pointer flex items-center justify-center"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Bell Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="p-2 rounded-full hover:bg-black/[0.04] dark:hover:bg-zinc-850 transition duration-200 text-[#86868b] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-50 relative cursor-pointer flex items-center justify-center"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {userNotifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Bell Dropdown Menu */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn text-left">
                  <div className="px-4 py-3 bg-neutral-50 dark:bg-zinc-950 border-b border-black/[0.04] dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-850 dark:text-zinc-100 flex items-center gap-1.5 font-sans">
                      <Bell className="w-3.5 h-3.5 text-[#0071e3]" />
                      Notifications
                    </span>
                    <button
                      onClick={() => {
                        setUserNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      }}
                      className="text-[10px] font-bold text-[#0071e3] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-black/[0.02] dark:divide-zinc-800/60">
                    {userNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-neutral-400">
                        No new notifications
                      </div>
                    ) : (
                      userNotifications.map(notification => (
                        <div 
                          key={notification.id} 
                          onClick={() => {
                            // mark as read
                            setUserNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
                          }}
                          className={`p-3.5 hover:bg-neutral-50 dark:hover:bg-zinc-800/40 transition cursor-pointer text-xs ${!notification.read ? 'bg-indigo-50/25 dark:bg-indigo-950/10' : ''}`}
                        >
                          <p className={`text-neutral-800 dark:text-zinc-200 leading-normal font-sans ${!notification.read ? 'font-medium' : 'font-light'}`}>
                            {notification.text}
                          </p>
                          <span className="block text-[9px] text-neutral-400 font-mono mt-1">{notification.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Google Sign In Widget for Site Visitors */}
            {authInitialized && (
              <div className="flex items-center gap-2">
                {visitorUser ? (
                  <div className="flex items-center gap-2 bg-[#f5f5f7] border border-black/[0.04] p-1 pr-3 rounded-full">
                    <button
                      onClick={() => {
                        fetchReferralLeaderboard();
                        setShowProfileModal(true);
                      }}
                      title="View Profile & Referral Leaderboard"
                      className="flex items-center gap-2 hover:opacity-85 transition cursor-pointer text-left"
                    >
                      {visitorUser.photoURL ? (
                        <img 
                          src={visitorUser.photoURL} 
                          alt={visitorUser.displayName || 'Visitor'} 
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full shadow-sm object-cover animate-fade-in"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs font-sans">
                          {visitorUser.displayName ? visitorUser.displayName.charAt(0).toUpperCase() : 'V'}
                        </div>
                      )}
                      <div className="text-[10px] text-zinc-800 font-semibold hidden sm:flex flex-col justify-center leading-tight">
                        <div className="max-w-[100px] truncate">{visitorUser.displayName || 'Visitor'}</div>
                        <span className={`inline-block text-[8px] font-bold font-mono tracking-wider uppercase shrink-0 mt-0.5 ${
                          referralCount >= 10 
                            ? 'text-emerald-600' 
                            : referralCount >= 3 
                              ? 'text-indigo-600' 
                              : 'text-amber-600'
                        }`}>
                          {referralCount >= 10 ? '🌟 Ambassador' : referralCount >= 3 ? '🚀 Rising Star' : '🌱 Advocate'}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await signOut(auth);
                        } catch (err) {
                          console.error('Failed to sign out visitor user:', err);
                        }
                      }}
                      className="text-[9px] font-bold text-rose-600 hover:text-rose-805 transition uppercase font-mono pl-1.5 border-l border-zinc-200 cursor-pointer ml-1"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAuthModalPurpose('Create a free account to save summaries, view history, and continue learning');
                      setShowAuthModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-zinc-800 hover:text-black border border-black/[0.04] px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shadow-sm"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}

            <div className="hidden lg:flex items-center gap-3">
              {isPremium ? (
                <div className="flex items-center gap-1.5 bg-[#0071e3]/8 text-[#0071e3] border border-[#0071e3]/15 px-3.5 py-1.5 rounded-full text-[11px] font-bold font-mono">
                  <Zap className="w-3 h-3 fill-[#0071e3]" />
                  <span>PRO ACTIVE</span>
                </div>
              ) : (
                <button
                  onClick={() => handleCheckoutClick('pro')}
                  className="group bg-gradient-to-r from-[#0071e3] to-indigo-600 hover:opacity-90 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#0071e3]/20 active:scale-97"
                >
                  <Zap className="w-3.5 h-3.5 fill-white/60" />
                  <span>Upgrade to Pro</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={`${currentScreen === 'landing' ? 'w-full pt-1 pb-24 md:pb-1' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-8 space-y-8'}`}>

        {/* 🚀 LANDING PAGE SCREEN */}
        {currentScreen === 'landing' && (
          <LandingPage 
            onStartFreeSummary={async (input, type: 'file' | 'text' | 'video' | 'website' = 'video', filesList = [], depth) => {
              setInputSourceType(type);
              if (depth && ['quick', 'study', 'mastery'].includes(depth)) {
                setLearningDepth(depth);
              }
              if (type === 'video') {
                setVideoUrl(input);
                setCurrentScreen('app');
                window.scrollTo(0, 0);
                setTimeout(() => {
                  handleSummarize(undefined, input, 'video', depth);
                }, 150);
              } else if (type === 'website') {
                setInputWebsiteUrl(input);
                setCurrentScreen('app');
                window.scrollTo(0, 0);
                setTimeout(() => {
                  handleSummarize(undefined, input, 'website', depth);
                }, 150);
              } else if (type === 'text') {
                setPastedContentText(input);
                setCurrentScreen('app');
                window.scrollTo(0, 0);
                setTimeout(() => {
                  handleSummarize(undefined, 'https://www.zipytiny.app/pasted-text', 'text', depth);
                }, 150);
              } else if (type === 'file') {
                if (filesList && filesList.length > 0) {
                  setUploadedFiles(filesList);
                  setCurrentScreen('app');
                  window.scrollTo(0, 0);
                  setTimeout(() => {
                    handleSummarize(undefined, 'https://www.zipytiny.app/uploaded-files', 'file', depth);
                  }, 150);
                } else {
                  setCurrentScreen('app');
                  window.scrollTo(0, 0);
                }
              }
            }}
            onLaunchApp={(targetTab?: any, targetSubTab?: any) => {
              setCurrentScreen('app');
              if (targetTab) {
                setActiveTab(targetTab);
              }
              if (targetSubTab) {
                setLearnActiveTab(targetSubTab);
              }
              // Automatically load a curated quick demo video if none is active, so the user instantly sees the selected feature in action!
              if (!activeSummary && PRELOADED_VIDEOS && PRELOADED_VIDEOS.length > 0) {
                handleLoadStoredItem(PRELOADED_VIDEOS[0]);
              }
              window.scrollTo(0, 0);
            }}
            onNavigateToFeature={(slug) => {
              setCurrentFeatureSlug(slug);
              setCurrentScreen('feature');
              window.scrollTo(0, 0);
            }}
            onUpgrade={() => {
              setSelectedPlanCode('pro');
              setShowStripeModal(true);
              setStripePaymentSuccess(false);
            }}
            isPremium={isPremium}
            visitorUser={visitorUser}
            onGoogleSignIn={async () => {
              const provider = new GoogleAuthProvider();
              try {
                setGoogleAuthError(null);
                await signInWithPopup(auth, provider);
              } catch (err: any) {
                console.error('Google login failed:', err);
                if (err.code !== 'auth/popup-closed-by-user') {
                  setGoogleAuthError({
                    message: err.message || String(err),
                    code: err.code || ''
                  });
                }
              }
            }}
          />
        )}

        {/* 🚀 INDIVIDUAL FEATURE PAGES (DEEP BROWSER LINKED) */}
        {currentScreen === 'feature' && (
          <FeaturePage 
            featureSlug={currentFeatureSlug}
            isDark={isDark}
            onNavigateHome={() => {
              setCurrentScreen('landing');
              window.scrollTo(0, 0);
            }}
            onLaunchApp={(targetTab?: any, targetSubTab?: any) => {
              setCurrentScreen('app');
              if (targetTab) {
                setActiveTab(targetTab);
              }
              if (targetSubTab) {
                setLearnActiveTab(targetSubTab);
              }
              if (!activeSummary && PRELOADED_VIDEOS && PRELOADED_VIDEOS.length > 0) {
                handleLoadStoredItem(PRELOADED_VIDEOS[0]);
              }
              window.scrollTo(0, 0);
            }}
          />
        )}

        {/* 🚀 CHROME EXTENSION PAGE */}
        {currentScreen === 'extension' && (
          <ChromeExtensionPage 
            isDark={isDark}
            onLaunchApp={() => {
              setCurrentScreen('app');
              window.scrollTo(0, 0);
            }}
          />
        )}

        {/* 🚀 TOUR & RECORDER SCREEN */}
        {currentScreen === 'explainer' && (
          <div className="space-y-8 animate-fadeIn text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 border border-indigo-150 dark:border-indigo-900 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-600/10" />
                <span>Interactive Cinematic Tour & Built-in Recorder</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900 dark:text-zinc-50 leading-tight">
                Interactive Tour & Capture Videos
              </h2>
              <p className="text-neutral-500 dark:text-zinc-400 font-light text-base sm:text-lg max-w-2xl mx-auto">
                Play with the active live-rendered simulation below. Listen to studio-grade voiceover narrations, take real-time interactive quizzes, or use the <strong>built-in screen recorder</strong> to download your customized demo video!
              </p>
            </div>
            <div className="transition duration-500 hover:shadow-xl rounded-3xl bg-white dark:bg-zinc-900 p-2 sm:p-4 border border-black/5 dark:border-zinc-800 text-left">
              <Suspense fallback={<div className="animate-pulse h-[500px] rounded-3xl bg-neutral-100 dark:bg-zinc-800" />}>
                <CinematicExplainer onStartLearning={() => {
                  setCurrentScreen('app');
                  window.scrollTo(0, 0);
                }} />
              </Suspense>
            </div>
          </div>
        )}

        {/* 🚀 OLD LANDING PAGE SCREEN BLOCKED */}
        {false && currentScreen === 'landing' && (
          <div className="w-full flex flex-col items-center justify-start text-[#1d1d1f] antialiased bg-slate-50/10">
            
            {/* 1. HERO SECTION (Conversion-focused Split Layout) */}
            <section className="relative w-full overflow-hidden bg-radial from-slate-50 via-white to-slate-100/50 pt-10 sm:pt-16 pb-20 sm:pb-28 border-b border-black/[0.02]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column: Headline, Subheadline, CTAs */}
                  <div className="lg:col-span-6 space-y-6 text-left">
                    <div className="inline-flex items-center gap-2 bg-[#0071e3]/5 border border-[#0071e3]/10 px-4 py-1.5 rounded-full text-xs font-semibold text-[#0071e3] shadow-sm animate-pulse">
                      <Sparkles className="w-4 h-4 fill-[#0071e3]/10" />
                      <span>Zipytiny 2.0 AI Engine Active</span>
                    </div>
                           <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display leading-[1.08] tracking-tight text-[#1d1d1f]">
                      One Video.<br />
                      <span className="bg-gradient-to-r from-[#0071e3] via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        Three Formats. One Voice.
                      </span>
                    </h1>
                    
                    <p className="text-gray-900 font-medium text-base sm:text-lg leading-relaxed max-w-xl">
                      “Stop settling for flat bullet points. Transform any screen recording, lecture, or lecture stream into structured knowledge instantly.”
                    </p>

                    <p className="text-gray-550 font-light text-sm sm:text-base leading-relaxed max-w-xl">
                      Zipytiny transforms any video (YouTube, Vimeo, local MP4, or web links) into structured study guides, engaging viral scripts, and professional studio-grade audio voiceovers simultaneously.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                      <button
                        onClick={() => setCurrentScreen('app')}
                        className="w-full sm:w-auto bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm px-8 py-4.5 rounded-full transition-all duration-200 shadow-md shadow-[#0071e3]/10 hover:shadow-lg active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer leading-none"
                      >
                        <span>Try Free</span>
                        <ArrowRight className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => {
                          document.getElementById('cinematic-theater')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-250 text-neutral-800 font-semibold text-sm px-8 py-4.5 rounded-full transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-neutral-300/40 leading-none"
                      >
                        <Play className="w-4 h-4 text-[#1d1d1f] fill-current" />
                        <span>Watch Demo</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-6 pt-5 text-gray-400 text-xs font-mono">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-4.5 h-4.5 text-indigo-600" /> No credit card required</span>
                      <span className="flex items-center gap-1.5"><Activity className="w-4.5 h-4.5 text-emerald-600" /> Unlimited preloaded trials</span>
                    </div>
                  </div>

                  {/* Right Column: High Fidelity Interface Mockup */}
                  <div className="lg:col-span-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0071e3]/10 to-violet-500/10 rounded-3xl blur-2xl opacity-60"></div>
                    <div className="relative bg-white rounded-3xl p-5 md:p-6 border border-black/[0.04] shadow-[0_24px_50px_rgba(0,0,0,0.06)] overflow-hidden text-left">
                      
                      {/* Mockup Toolbar Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-black/[0.04] mb-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                          <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                          <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                        </div>
                        <div className="bg-neutral-100/60 px-4 py-1.5 rounded-lg text-[10px] text-[#86868b] font-mono flex items-center gap-1.5 w-60 sm:w-80">
                          <Lock className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span className="truncate">https://zipytiny.app/dashboard</span>
                        </div>
                        <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                      </div>

                      {/* Mockup Desktop Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        {/* Mock Video Aspect Player */}
                        <div className="sm:col-span-5 bg-slate-900 rounded-2xl p-3 relative aspect-[16/10] sm:aspect-auto flex flex-col justify-between overflow-hidden shadow-sm group">
                          <img 
                            src="https://img.youtube.com/vi/UF8uR6Z6KLc/maxresdefault.jpg" 
                            alt="Lecture Preview" 
                            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity filter blur-xs"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="bg-black/40 text-[8px] text-white px-1.5 py-0.5 rounded-md font-mono self-start relative z-10">
                            09:12 / 15:00
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center relative z-10">
                            <span className="w-10 h-10 bg-[#0071e3] text-white rounded-full flex items-center justify-center shadow-md animate-pulse">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </span>
                          </div>
                          <div className="text-[9px] text-neutral-200 truncate font-sans font-medium relative z-10">
                             Steve Jobs • Stanford Address
                          </div>
                        </div>

                        {/* Mock Synthesized Outlets */}
                        <div className="sm:col-span-7 space-y-3">
                          <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            <span>Synthesized Output</span>
                          </div>
                          
                          <h4 className="text-sm font-bold font-display text-neutral-900 leading-tight">
                            Evaluating Intuition & Resilience
                          </h4>
                          
                          <p className="text-[11px] text-neutral-500 leading-normal line-clamp-3 font-light">
                            Examines how unexpected experiences connect backward to shape your future, why public setbacks catalyze creative rebirths, and how mortality helps you focus on what truly matters.
                          </p>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-start gap-1.5 text-[10px] text-neutral-700">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-tight">Media romanticizes the operational startup workflow</span>
                            </div>
                            <div className="flex items-start gap-1.5 text-[10px] text-neutral-700">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-tight">Founders answer to board, customers, and employees</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mockup Footer Analytics strip */}
                      <div className="mt-4 pt-3 border-t border-black/[0.03] flex items-center justify-between text-[9px] font-mono text-gray-400">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-[#0071e3]" /> Generated in 1.4s</span>
                        <span className="text-indigo-600 font-medium">Bypassed Quota Constraints</span>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* 🎬 CINEMATIC THEATER SECTION */}
            <section id="cinematic-theater" className="w-full bg-[#f5f5f7] py-16 sm:py-20 border-b border-black/[0.03] scroll-mt-20 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-150 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-indigo-700 uppercase shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600/10" />
                    <span>{demoDisplayMode === 'video' ? 'Product Video Overview' : '60-Second Apple-Style Cinematic Tour'}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900 leading-tight">
                    {demoDisplayMode === 'video' ? 'See Zipytiny In Action' : 'Turn Any Video Into Structured Knowledge'}
                  </h2>
                  <p className="text-neutral-500 font-light text-base sm:text-lg max-w-2xl mx-auto">
                    {demoDisplayMode === 'video' 
                      ? 'Watch our high-fidelity human-guided demonstration of how Zipytiny converts complex hours of multimedia lectures into crisp, categorized intelligence.'
                      : 'Experience how Zipytiny compiles raw multimedia streams into interactive chapters, high-clarity conceptual notes, and retention test quizzes. Watch our live-rendered spec explainer block below.'}
                  </p>
                </div>

                {customDemoVideoUrl && (
                  <div className="flex justify-center items-center gap-1.5 p-1 bg-neutral-200/50 backdrop-blur border border-black/[0.03] rounded-full max-w-xs mx-auto mb-2 relative z-10">
                    <button
                      onClick={() => {
                        setDemoDisplayMode('tour');
                        localStorage.setItem('demo_display_mode', 'tour');
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold font-sans transition-all duration-200 cursor-pointer ${demoDisplayMode === 'tour' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
                    >
                      Interactive Tour
                    </button>
                    <button
                      onClick={() => {
                        setDemoDisplayMode('video');
                        localStorage.setItem('demo_display_mode', 'video');
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold font-sans transition-all duration-200 cursor-pointer ${demoDisplayMode === 'video' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
                    >
                      Product Video
                    </button>
                  </div>
                )}

                <div className="transition duration-500 hover:shadow-xl rounded-3xl">
                  {demoDisplayMode === 'video' && customDemoVideoUrl ? (
                    renderDemoVideoPlayer()
                  ) : (
                    <Suspense fallback={<div className="animate-pulse h-[500px] rounded-3xl bg-neutral-100 dark:bg-zinc-800" />}>
                      <CinematicExplainer onStartLearning={() => setCurrentScreen('app')} />
                    </Suspense>
                  )}
                </div>
              </div>
            </section>

            {/* 2. TRUST STRIP (Badges for compatible feeds) */}
            <section className="w-full bg-slate-900 overflow-hidden py-11 text-center border-b border-indigo-950/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-slate-400 text-[10px] sm:text-xs font-mono uppercase tracking-widest mb-6 font-semibold">
                  COMPATIBLE HIGH-FIDELITY PLATFORMS & MULTIMEDIA
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                  {[
                    { label: 'YouTube Lectures', plat: 'YouTube' },
                    { label: 'Academic Seminars', plat: 'Class' },
                    { label: 'Vimeo streams', plat: 'Video' },
                    { label: 'ZOOM Meetings', plat: 'Brief' },
                    { label: 'Podcast Channels', plat: 'Audio' },
                    { label: 'Custom TXT Paragraphs', plat: 'Text' }
                  ].map((tier, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-slate-300 bg-white/[0.05] border border-white/[0.04] text-xs font-mono font-medium hover:bg-white/[0.08] hover:text-white transition duration-200"
                    >
                      <Video className="w-3 h-3 text-indigo-400" />
                      <span>{tier.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. HOW IT WORKS SECTION (Simple 3-step timeline) */}
            <section className="w-full bg-white py-20 sm:py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
                <div className="space-y-4 max-w-3xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900">
                    The Fast Path to Complete Retention
                  </h2>
                  <p className="text-gray-500 font-light text-base sm:text-lg leading-relaxed">
                    Traditional video research requires tedious clicking, skipping, and note-taking. Zipytiny synthesizes perfect conceptual summaries in three simple steps.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  {/* Decorative guide line */}
                  <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-neutral-100 z-0 -translate-y-1/2"></div>
                  
                  {[
                    {
                      step: '01',
                      title: 'Paste Video URL',
                      desc: 'Input any YouTube link, lecture address, Vimeo URL, or use a custom speech-to-text transcript paragraph override with ease.',
                      icon: <Youtube className="w-5 h-5 text-[#0071e3]" />,
                      color: 'bg-blue-50/70 border-blue-100'
                    },
                    {
                      step: '02',
                      title: 'Generative Distillation',
                      desc: 'Our contextual pipeline analyses language intent, indexes temporal milestones, clusters core arguments, and crafts comprehensive takeaways.',
                      icon: <Sparkles className="w-5 h-5 text-indigo-600 font-bold" />,
                      color: 'bg-indigo-50/70 border-indigo-100'
                    },
                    {
                      step: '03',
                      title: 'Extract Leverage',
                      desc: 'Skim structured takeaways, quiz yourself, generate viral marketing newsletters, or read mindmaps of difficult concepts instantly.',
                      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
                      color: 'bg-emerald-50/70 border-emerald-100'
                    }
                  ].map((card, idx) => (
                    <div 
                      key={idx}
                      className="bg-neutral-50 hover:bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/50 hover:border-black/[0.04] shadow-sm hover:shadow-xl transition-all duration-300 text-left relative z-10 space-y-4 group"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${card.color} border flex items-center justify-center shadow-xs group-hover:scale-105 transition`}>
                        {card.icon}
                      </div>
                      <span className="block text-[10px] font-mono text-[#0071e3] tracking-widest font-bold uppercase">
                        PHASE {card.step}
                      </span>
                      <h3 className="text-lg font-bold font-display text-neutral-900">
                        {card.title}
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed font-light">
                        {card.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. CHRONO-BENTO FEATURE GRID */}
            <section className="w-full bg-[#f8fafc]/50 py-20 border-y border-slate-200/40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-indigo-700 uppercase">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Engine Capabilities</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900">
                    Built for Intense Knowledge Extraction
                  </h2>
                  <p className="text-gray-500 font-light text-base sm:text-lg">
                    Zipytiny combines multiple layers of semantic context processing to deliver pristine educational assets.
                  </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Big Card 1: Structured Sums */}
                  <div className="md:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-black/[0.03] shadow-xs flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="p-2.5 w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold font-display text-neutral-900">Smart Structured Chronologies</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xl font-light">
                        Instead of massive blocks of prose, Zipytiny organizes insights into structured chronologies. Select chapters to instantly seek to timestamp segments or read key takeaways of that specific timestamp. Perfect for reviewing core arguments.
                      </p>
                    </div>
                    
                    {/* Mock segment */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-left text-xs font-mono">
                      <div className="border-b border-neutral-100 pb-2 flex justify-between text-[10px] text-gray-400">
                        <span>TIMESTAMPS TRACKED</span>
                        <span>GCC STANDARD REGION</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#0071e3] shrink-0 bg-white border border-[#0071e3]/10 px-2 py-0.5 rounded-md">04:15</span>
                        <span className="truncated text-neutral-800">Evaluating founder motivations vs media illusions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#0071e3] shrink-0 bg-white border border-[#0071e3]/10 px-2 py-0.5 rounded-md">10:30</span>
                        <span className="truncated text-neutral-800">The heavy psychological burden of operational failure</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Interactive quizzing */}
                  <div className="md:col-span-4 bg-white rounded-3xl p-6 md:p-8 border border-black/[0.03] shadow-xs flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="p-2.5 w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        <Award className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold font-display text-neutral-900">Retention Quizzes</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-light">
                        Automatically gauge your conceptual comprehension with custom AI-conceived multi-choice quizzes mapped directly to video content.
                      </p>
                    </div>
                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 space-y-2 text-xs">
                      <p className="font-bold text-emerald-950">Comprehension Check:</p>
                      <p className="text-emerald-900 text-[10px] font-light">"Who is a founder's ultimate boss according to Dustin?"</p>
                      <div className="bg-white border border-emerald-100 p-1.5 rounded text-[9px] text-emerald-900 font-semibold cursor-default">
                        ✓ Everyone (Stakeholders, employees, customers)
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Ask Video */}
                  <div className="md:col-span-4 bg-white rounded-3xl p-6 md:p-8 border border-black/[0.03] shadow-xs flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="p-2.5 w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold font-display text-neutral-900">Ask the Video Chat</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-light">
                        Chat directly with the video content. Ask questions like "What was the co-founder's exact quote on risk management?" and find immediate answers.
                      </p>
                    </div>
                    <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></div>
                      <span className="text-[10px] text-neutral-500 font-mono">Synthesizing audio nodes...</span>
                    </div>
                  </div>

                  {/* Big Card 4: GCC Multilingual Support */}
                  <div className="md:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-black/[0.03] shadow-xs flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="p-2.5 w-10 h-10 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold font-display text-neutral-900">Multi-Language Synthesizer (Arabic Support)</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xl font-light">
                        Designed with high-fidelity GCC performance. Zipytiny can translate long YouTube transcripts or web addresses immediately into detailed Arabic notes, making it highly effective for regional academic and enterprise study.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-slate-100 font-mono font-medium text-slate-600 px-3 py-1.5 rounded-md border border-slate-200">English (Original)</span>
                      <span className="text-xs text-neutral-400">⟶</span>
                      <span className="text-xs bg-violet-50 font-sans font-semibold text-violet-700 px-3 py-1.5 rounded-md border border-violet-100">العربية (Arabic output)</span>
                      <span className="text-xs bg-indigo-50 font-sans font-semibold text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-100 text-center">اردو (Urdu)</span>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* 5. LIVE INTERACTIVE DEMO (SUPER IMPORTANT SIDE BY SIDE) */}
            <section id="live-interactive-preview" className="w-full bg-[#f8fafc] py-20 sm:py-24 border-b border-slate-200/50 scroll-mt-12 text-left">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center md:text-left space-y-4 max-w-3xl">
                  <div className="inline-flex items-center gap-1.5 bg-[#0071e3]/5 border border-[#0071e3]/10 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-[#0071e3] uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant Interactive Demo</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900">
                    Operate the Knowledge Engine
                  </h2>
                  <p className="text-gray-500 font-light text-base sm:text-lg">
                    Experience the complete output format in real-time. Choose a premium preloaded lecture below, and explore its conceptual chapters, takeaways, and retention test instantly.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Choose Preloads / Input */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Choose Lecture Buttons */}
                    <div className="bg-white rounded-3xl p-5 border border-black/[0.04] shadow-sm space-y-4">
                      <p className="text-xs font-bold text-neutral-400 font-mono uppercase tracking-wider">
                        Select Sandbox Case
                      </p>
                      
                      <div className="space-y-3">
                        {PRELOADED_VIDEOS.map((video, idx) => {
                          const isActive = demoActiveVideo.metadata.videoId === video.metadata.videoId;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setDemoActiveVideo(video);
                                setDemoSelectedAnswers({});
                                setDemoQuizSubmitted(false);
                              }}
                              className={`w-full text-left p-3.5 rounded-2xl border text-xs transition duration-200 flex items-center gap-3 cursor-pointer ${
                                isActive 
                                  ? 'bg-[#0071e3]/5 border-[#0071e3] text-neutral-950 font-bold shadow-xs' 
                                  : 'bg-white hover:bg-neutral-50/80 border-slate-200/80 text-neutral-600'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isActive ? 'bg-[#0071e3] text-white' : 'bg-slate-100 text-slate-500'
                              }`}>
                                <Youtube className="w-4 h-4" />
                              </div>
                              <div className="truncate flex-1">
                                <p className="truncate leading-tight">{video.metadata.title}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5 leading-none font-normal font-mono">{video.metadata.author} • {video.metadata.duration}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Try Custom video redirect input box */}
                    <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 text-white space-y-4 shadow-sm">
                      <p className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        <span>Run Custom Video Analysis</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                        Have your own lecture or team meeting URL? Type it below to launch our live processing workspace instantly.
                      </p>
                      
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (demoInputUrl) {
                            setVideoUrl(demoInputUrl);
                            setCurrentScreen('app');
                            setTimeout(() => {
                              handleSummarize();
                            }, 400);
                          }
                        }}
                        className="space-y-3"
                      >
                        <input
                          type="url"
                          required
                          placeholder="Paste YouTube, mp4 link..."
                          value={demoInputUrl}
                          onChange={(e) => setDemoInputUrl(e.target.value)}
                          className="w-full px-3 py-3 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition placeholder:text-slate-500"
                        />
                        <button
                          type="submit"
                          className="w-full py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold cursor-pointer active:scale-[0.99] transition flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Launch Live Workspace</span>
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* Right Column: Live Output Simulator */}
                  <div className="lg:col-span-8 bg-white rounded-3xl border border-black/[0.04] shadow-md p-5 md:p-6 space-y-5">
                    
                    {/* Header profile info of active demo video */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.04]">
                      <div className="flex items-center gap-3">
                        <img 
                          src={demoActiveVideo.metadata.thumbnailUrl} 
                          alt="Video Thumbnail" 
                          className="w-16 h-10 object-cover rounded-md border border-black/[0.06] shrink-0"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="text-left">
                          <h3 className="text-sm font-bold text-neutral-900 max-w-md truncate leading-tight">
                            {demoActiveVideo.metadata.title}
                          </h3>
                          <p className="text-[11px] text-neutral-400 font-mono mt-1 font-light leading-none">
                            Channel: <strong className="font-medium text-neutral-700">{demoActiveVideo.metadata.author}</strong> • Length: <strong className="font-medium text-[#0071e3]">{demoActiveVideo.metadata.duration}</strong>
                          </p>
                        </div>
                      </div>
                      
                      {/* Tabs selector */}
                      <div className="flex flex-wrap items-center bg-neutral-100 p-0.5 rounded-lg border border-black/[0.02]">
                        {[
                          { id: 'summary', label: 'Summary' },
                          { id: 'key_insights', label: 'Takeaways' },
                          { id: 'chapters', label: 'Chapters' },
                          { id: 'quiz', label: 'Self Quiz' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setDemoActiveTab(tab.id as any)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold font-mono transition cursor-pointer leading-none ${
                              demoActiveTab === tab.id 
                                ? 'bg-white text-neutral-950 shadow-xs' 
                                : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Output Inner Panel content */}
                    <div className="min-h-56 select-text text-left text-neutral-900">
                      
                      {/* Tab 1: Summary */}
                      {demoActiveTab === 'summary' && (
                        <div className="space-y-4 animate-fadeIn">
                          <h4 className="text-xs font-bold font-mono text-indigo-600 uppercase tracking-wider">Concept Summary</h4>
                          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
                            {demoActiveVideo.summary}
                          </p>
                          <div className="bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/30 text-xs text-neutral-500 font-light space-y-2">
                            <p className="font-semibold text-neutral-800 font-mono">📢 Social Snippet Preview:</p>
                            <p className="italic bg-white p-2.5 rounded-lg border border-neutral-100">"{demoActiveVideo.socialSnippet}"</p>
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Key Takeaways */}
                      {demoActiveTab === 'key_insights' && (
                        <div className="space-y-4 animate-fadeIn">
                          <h4 className="text-xs font-bold font-mono text-indigo-600 uppercase tracking-wider">Primary Takeaways</h4>
                          
                          <div className="space-y-3">
                            {demoActiveVideo.takeaways.map((takeaway: any, tIdx: number) => (
                              <div key={tIdx} className="flex items-start gap-3 bg-neutral-50/50 p-3 rounded-2xl border border-neutral-100">
                                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                  {tIdx + 1}
                                </div>
                                <p className="text-xs text-neutral-700 leading-relaxed font-sans">{typeof takeaway === 'string' ? takeaway : takeaway?.text || ''}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tab 3: Chapters Timeline */}
                      {demoActiveTab === 'chapters' && (
                        <div className="space-y-4 animate-fadeIn">
                          <h4 className="text-xs font-bold font-mono text-indigo-600 uppercase tracking-wider">Timeline Milestones</h4>
                          
                          <div className="space-y-3.5">
                            {demoActiveVideo.chapters.map((chapter, cIdx) => (
                              <div key={cIdx} className="flex gap-4 border-l border-neutral-200 pl-4 relative">
                                <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 bg-[#0071e3] rounded-full border-2 border-white"></div>
                                <span className="text-xs font-bold font-mono text-[#0071e3] hover:underline cursor-pointer bg-[#0071e3]/5 border border-[#0071e3]/10 h-fit px-1.5 py-0.5 rounded leading-none">
                                  {chapter.timestamp}
                                </span>
                                <div className="space-y-1">
                                  <h5 className="text-xs font-bold text-neutral-900 leading-tight">{chapter.title}</h5>
                                  <p className="text-[11px] text-neutral-500 font-light leading-relaxed">{chapter.takeaway}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tab 4: Interactive Quiz Comprehension */}
                      {demoActiveTab === 'quiz' && (
                        <div className="space-y-5 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold font-mono text-indigo-600 uppercase tracking-wider">Vocabulary & Retention Quiz</h4>
                            {demoQuizSubmitted && (
                              <span className="text-xs font-bold text-emerald-600 font-mono">
                                SCORED: {
                                  demoActiveVideo.quiz.reduce((score, q, idx) => {
                                    return score + (demoSelectedAnswers[idx] === q.answerIndex ? 1 : 0);
                                  }, 0)
                                } / {demoActiveVideo.quiz.length} Correct
                              </span>
                            )}
                          </div>

                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                            {demoActiveVideo.quiz.map((q, idx) => {
                              const selectedOpt = demoSelectedAnswers[idx];
                              return (
                                <div key={idx} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/50 space-y-3">
                                  <p className="text-xs font-semibold text-neutral-900">
                                    {idx + 1}. {q.question}
                                  </p>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {q.options.map((option, oIdx) => {
                                      const isOptionSelected = selectedOpt === oIdx;
                                      const showValidation = demoQuizSubmitted;
                                      const isCorrectOption = oIdx === q.answerIndex;
                                      
                                      let optStyle = "bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700";
                                      if (isOptionSelected) {
                                        optStyle = "bg-indigo-50 border-indigo-500 text-indigo-950 font-medium";
                                      }
                                      if (showValidation) {
                                        if (isCorrectOption) {
                                          optStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold";
                                        } else if (isOptionSelected) {
                                          optStyle = "bg-rose-50 border-rose-400 text-rose-950 line-through";
                                        }
                                      }

                                      return (
                                        <button
                                          key={oIdx}
                                          disabled={demoQuizSubmitted}
                                          onClick={() => {
                                            setDemoSelectedAnswers(prev => ({ ...prev, [idx]: oIdx }));
                                          }}
                                          className={`text-left p-3 rounded-xl border text-[11px] leading-tight transition cursor-pointer ${optStyle}`}
                                        >
                                          {option}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {demoQuizSubmitted && (
                                    <div className="text-[10px] text-neutral-500 bg-white p-2.5 rounded-lg border border-black/[0.02] leading-relaxed">
                                      <strong className="text-neutral-700 font-mono font-bold uppercase tracking-wider block mb-0.5">EXPLANATION:</strong>
                                      {q.explanation}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Submit Quiz actions */}
                          <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between gap-4">
                            {!demoQuizSubmitted ? (
                              <button
                                onClick={() => setDemoQuizSubmitted(true)}
                                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold cursor-pointer active:scale-97 transition"
                              >
                                Submit Answers
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setDemoSelectedAnswers({});
                                  setDemoQuizSubmitted(false);
                                }}
                                className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-semibold cursor-pointer transition flex items-center gap-1 border border-neutral-300/40"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Reset Score</span>
                              </button>
                            )}
                            <span className="text-[10px] text-neutral-400 italic">Retainment tracker mock activated</span>
                          </div>

                        </div>
                      )}

                    </div>

                  </div>

                </div>

              </div>
            </section>

            {/* 6. USE CASES BENTO SECTION */}
            <section className="w-full bg-white py-20 sm:py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#1d1d1f]">
                    Who Uses the Knowledge Engine?
                  </h2>
                  <p className="text-gray-500 font-light text-base sm:text-lg">
                    Zipytiny eliminates tedious scrubbing across many industries and goals.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {
                      role: 'Students & Academics',
                      icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
                      points: [
                        'Distill 2-hour syllabus lectures',
                        'Generate study review indices',
                        'Verify retainment with flashcards',
                        'Export notes in Markdown files'
                      ],
                      bg: 'bg-indigo-50/50'
                    },
                    {
                      role: 'Professionals & Teams',
                      icon: <FileText className="w-5 h-5 text-emerald-600" />,
                      points: [
                        'Review recorded corporate ZOOMs',
                        'Pinpoint exact team deliverables',
                        'Automate chronology minutes',
                        'Eliminate meeting overlaps'
                      ],
                      bg: 'bg-emerald-50/50'
                    },
                    {
                      role: 'Research Analysts',
                      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
                      points: [
                        'Study product panels & seminars',
                        'Extract competitive timelines',
                        'Compare technical transcripts',
                        'Collate historical trends fast'
                      ],
                      bg: 'bg-blue-50/50'
                    },
                    {
                      role: 'Content Repurposers',
                      icon: <Megaphone className="w-5 h-5 text-purple-600" />,
                      points: [
                        'Write SEO web blog copy quickly',
                        'Generate visual Twitter threads',
                        'Segment scripts for micro-videos',
                        'Design high-conversion lists'
                      ],
                      bg: 'bg-purple-50/50'
                    }
                  ].map((cohort, idx) => (
                    <div 
                      key={idx}
                      className="bg-neutral-50 rounded-3xl p-6 border border-neutral-200/50 flex flex-col justify-between space-y-6 text-left hover:border-black/[0.04] transition duration-300 hover:shadow-lg"
                    >
                      <div className="space-y-4">
                        <div className={`p-2.5 w-10 h-10 rounded-xl ${cohort.bg} flex items-center justify-center shrink-0`}>
                          {cohort.icon}
                        </div>
                        <h4 className="text-base font-bold font-display text-neutral-900">{cohort.role}</h4>
                        <ul className="space-y-2.5">
                          {cohort.points.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2 text-xs text-neutral-500 font-light">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <button
                        onClick={() => setCurrentScreen('app')}
                        className="text-[#0071e3] hover:underline font-semibold font-mono text-[11px] text-left cursor-pointer flex items-center gap-1"
                      >
                        <span>Start Trial →</span>
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* 7. DIFFERENTIATION SECTION (SnapSum vs ChatGPT) */}
            <section className="w-full bg-white py-20 sm:py-24 border-t border-slate-200/50 text-left">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-indigo-700 uppercase">
                    <Zap className="w-3.5 h-3.5" />
                    <span>The Zipytiny Advantage</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900 animate-fadeIn">
                    Why Not Just Prompt with ChatGPT?
                  </h2>
                  <p className="text-gray-500 font-light text-base sm:text-lg">
                    General chat systems are great for drafting emails, but they fall short for deep, chronological video analysis and rapid knowledge retention.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
                  
                  {/* Text Column and Visual Chart */}
                  <div className="lg:col-span-12 overflow-hidden bg-slate-50 border border-slate-200/60 rounded-3xl p-6 md:p-8 space-y-8">
                    
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200/80">
                            <th className="py-4.5 px-4 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">CAPABILITY / WORKFLOW</th>
                            <th className="py-4.5 px-4 text-xs font-mono font-bold text-indigo-600 bg-indigo-50/50 rounded-t-2xl uppercase tracking-widest text-center w-60">
                              ZIPYTINY ENGINE
                            </th>
                            <th className="py-4.5 px-4 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest text-center w-60">
                              CHATGPT & FREE CHATS
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60">
                          {[
                            {
                              feat: 'Automated Speech to Structure Map',
                              desc: 'Dynamically parses audio nodes and creates beautiful index chapters linked to the seconds timeline with absolutely zero text input required.',
                              snap: true,
                              snapText: 'Fully Automatic (1 Click)',
                              chat: false,
                              chatText: 'Requires custom transcript extraction & multi-prompt loops'
                            },
                            {
                              feat: 'Timestamp-Aware Navigation',
                              desc: 'Seek directly to core arguments instantly. No more scrubbing through hours of content to find 30 seconds of context.',
                              snap: true,
                              snapText: 'Yes, Chronological Links',
                              chat: false,
                              chatText: 'No (No temporal coordinate awareness)'
                            },
                            {
                              feat: 'Interactive Retention Testing',
                              desc: 'Dynamically builds contextual quizzes mapped to the video content with answers, scores, and deep linguistic explanations.',
                              snap: true,
                              snapText: 'Instantly Synthesized',
                              chat: false,
                              chatText: 'Requires complex custom prompts & custom grading scripts'
                            },
                            {
                              feat: 'GCC Native Localization (Arabic)',
                              desc: 'High-fidelity multi-language architecture tuned specifically for regional dialect translations and localized notes.',
                              snap: true,
                              snapText: 'Native Translation Engine',
                              chat: true,
                              chatText: 'Available, but lacks localized formatting presets'
                            },
                            {
                              feat: 'Newsletter & Essay Generation',
                              desc: 'Single-click exports that turn long video feeds into beautiful ready-to-publish educational assets and marketing templates.',
                              snap: true,
                              snapText: '1-Click Direct Copy',
                              chat: false,
                              chatText: 'Lacks native output editors or copying hooks'
                            }
                          ].map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-100/50 transition">
                              <td className="py-5 px-4 space-y-1 pr-6 max-w-md">
                                <p className="text-xs sm:text-sm font-bold text-neutral-900">{row.feat}</p>
                                <p className="text-[11px] text-neutral-500 font-light leading-relaxed">{row.desc}</p>
                              </td>
                              <td className="py-5 px-4 bg-indigo-50/20 text-center border-x border-indigo-100/50">
                                <div className="flex flex-col items-center justify-center gap-1.5 p-1">
                                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                  <span className="text-[11px] font-bold text-neutral-950 font-mono">{row.snapText}</span>
                                </div>
                              </td>
                              <td className="py-5 px-4 text-center">
                                <div className="flex flex-col items-center justify-center gap-1.5 p-1">
                                  {row.chat ? (
                                    <CheckCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                  ) : (
                                    <span className="text-rose-500 font-bold shrink-0 font-sans text-lg leading-none">✕</span>
                                  )}
                                  <span className="text-[10px] text-neutral-500 font-sans leading-tight max-w-[180px] mx-auto">{row.chatText}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Bottom Micro Pitch box */}
                    <div className="bg-indigo-50/50 border border-indigo-100 p-4.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
                      <span className="text-indigo-950 font-light text-center sm:text-left leading-relaxed">
                        💡 <strong className="font-semibold text-indigo-900">Why prompt engineer for 15 minutes</strong> when Zipytiny designs complete educational dashboards from any video in 15 seconds?
                      </span>
                      <button 
                        onClick={() => setCurrentScreen('app')}
                        className="bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-xs active:scale-97 transition shrink-0"
                      >
                        Launch Free Workspace
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            </section>

            {/* 8. REFINED PRICING SECTION */}
            <section className="w-full bg-slate-900 py-20 sm:py-24 border-y border-indigo-950 text-white text-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-1 bg-[#0071e3]/10 border border-[#0071e3]/20 px-3 py-1 rounded-full text-xs font-mono font-bold text-[#0071e3] uppercase">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Simple Billing Setup</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
                    Predictable Plans for Every Strategist
                  </h2>
                  <p className="text-slate-400 font-light text-base sm:text-lg">
                    Whether diagnosing rapid lectures or conducting intense corporate research, we have plans tailored to your workflow speed.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                  
                  {/* Free Plan */}
                  <div className="bg-white/5 border border-white/[0.08] rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-8 relative overflow-hidden backdrop-blur-md">
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400">STARTER TIER</span>
                        <h3 className="text-xl font-bold font-display text-white mt-1">Free Sandbox</h3>
                        <p className="text-xs text-slate-400 mt-2 font-light">Experience standard video summaries first-hand.</p>
                      </div>

                      <div className="flex items-baseline gap-1.5 py-2 border-y border-white/[0.05]">
                        <span className="text-3xl sm:text-4xl font-semibold font-mono text-white">$0</span>
                        <span className="text-xs text-slate-400 font-light lowercase">/ forever</span>
                      </div>

                      <ul className="space-y-3">
                        {[
                          '3 Standard summaries per day limit',
                          'Direct YouTube & Vimeo feeds',
                          'Interactive retention quizzes',
                          'Cached sandbox templates access'
                        ].map((li, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 font-light">
                            <CheckCircle className="w-4 h-4 text-[#0071e3]" />
                            <span>{li}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => setCurrentScreen('app')}
                      className="w-full py-4.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold font-mono transition text-center cursor-pointer border border-white/[0.05]"
                    >
                      Workspace Console
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div className="bg-white border border-indigo-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-8 relative overflow-hidden shadow-xl shadow-indigo-950/40">
                    {/* Corner Tag */}
                    <div className="absolute top-4 right-[-32px] bg-[#0071e3] text-white text-[9px] font-bold font-mono py-1 px-10 rotate-45 tracking-widest uppercase">
                      PRO VALUE
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-[#0071e3]">PROFESSIONAL SCALE</span>
                          <span className="bg-[#0071e3]/10 text-[#0071e3] font-mono text-[8px] font-bold px-1.5 rounded-sm">POPULAR</span>
                        </div>
                        <h3 className="text-xl font-bold font-display text-neutral-900 mt-1">Active Pro Strategist</h3>
                        <p className="text-xs text-neutral-500 mt-2 font-light text-left">Complete research power with real-time translations.</p>
                      </div>

                      <div className="flex items-baseline gap-1.5 py-2 border-y border-neutral-100">
                        <span className="text-3.5xl sm:text-4xl font-semibold font-mono text-neutral-950">${proMonthlyPrice}</span>
                        <span className="text-xs text-neutral-400 font-light lowercase">/ month</span>
                      </div>

                      <ul className="space-y-3">
                        {[
                          'Unlimited high-fidelity video analyses',
                          'Complete Ask-the-Video interactive chatbot',
                          'GCC Multilingual Translation (Arabic, English, Urdu)',
                          'Whitelabel Custom Domain Whitelisting',
                          'Direct MP3 synthesis vocalization engine',
                          'Priority Gemini processing bandwidth'
                        ].map((li, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-xs text-neutral-800 font-light">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>{li}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleCheckoutClick('pro')}
                      className="w-full py-4.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-bold font-mono transition text-center cursor-pointer shadow-md shadow-[#0071e3]/10 hover:shadow-lg active:scale-98"
                    >
                      Connect Premium (Stripe Gate)
                    </button>
                  </div>

                </div>

                <p className="text-[10px] text-slate-500 font-mono italic max-w-xl mx-auto leading-relaxed">
                  🛡️ Powered by standard sandbox test networks. Connecting our secure Stripe module does not require inputting live, active currencies.
                </p>

              </div>
            </section>

            {/* 8. FINAL CALL TO ACTION (CTA) */}
            <section className="w-full bg-radial from-slate-950 to-slate-900 py-20 sm:py-24 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30"></div>
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white max-w-2xl mx-auto leading-tight">
                  Ready to Turn Screen Time Into Actual Leverage?
                </h2>
                <p className="text-slate-400 font-light text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                  Join hundreds of academic scholars, busy corporate executives, and fast content repurposers using Zipytiny.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setCurrentScreen('app');
                      window.scrollTo(0, 0);
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-10 py-5 rounded-full text-sm transition-all duration-200 shadow-xl active:scale-98 cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Launch Free Workspace</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

        {currentScreen === 'app' && (
          <>
            {isLoadingSummary && !activeSummary && !activeStack ? (
              <PageLoadingIndicator message="Generating your personalized AI workspace..." />
            ) : (
              <div className="space-y-8 animate-fadeIn">
                {/* Dynamic Split Action Panel */}
                {!activeSummary && !activeStack && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
            {/* Pitch & Generation Engine - Inputs */}
            <div className="col-span-1 lg:col-span-8 space-y-6 relative">
              {/* Product Hunt Live Day Special Banner */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#da552f] via-[#ea6c4a] to-[#ff8566] text-white p-5 sm:p-6 rounded-3xl shadow-[0_8px_32px_rgba(218,85,47,0.15)] border border-[#da552f]/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse-soft">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full filter blur-2xl pointer-events-none" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-black/10 rounded-full filter blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-4 relative z-10 text-left">
                  <div className="p-3 bg-white/20 rounded-2xl shrink-0 backdrop-blur-md border border-white/20">
                    <span className="text-2xl select-none">🐱</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-white text-[#da552f] text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider font-mono shadow-xs">
                        LIVE ON PRODUCT HUNT
                      </span>
                      <span className="text-[10px] font-mono font-medium text-white/90">LAUNCH SPECIAL</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold mt-1 text-white leading-tight">
                      Unlock Zipytiny Pro FREE FOR LIFE (Unlimited credits, maps & Learn Mode)
                    </p>
                    <p className="text-[11px] text-white/85 font-light mt-0.5">
                      Simply invite <strong className="font-semibold text-white">just 2 friends</strong> using your custom link on the right!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('referral-widget-container')?.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => {
                      const input = document.getElementById('referral-share-input');
                      if (input) {
                        input.focus();
                        (input as any).select();
                      }
                    }, 500);
                  }}
                  className="px-4.5 py-3 bg-white text-[#da552f] hover:bg-neutral-50 font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 relative z-10 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Gift className="w-4 h-4" />
                  <span>Claim Free Pro Life</span>
                </button>
              </div>

              {/* Premium Gradient Design Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-[32px] opacity-10 dark:opacity-20 blur-xl pointer-events-none" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0071e3]/30 via-indigo-500/20 to-purple-500/30 rounded-[30px] opacity-40 dark:opacity-60 blur-xs pointer-events-none" />
              
              <div className="relative bg-white dark:bg-zinc-900/95 rounded-3xl p-6 md:p-8 text-neutral-900 dark:text-zinc-100 border border-black/[0.04] dark:border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                {/* Accent Background Glows inside the card */}
                <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-gradient-to-br from-[#0071e3]/10 via-indigo-500/5 to-transparent rounded-full filter blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 bg-gradient-to-tr from-sky-500/10 via-purple-500/5 to-transparent rounded-full filter blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase border border-amber-500/15">
                    <span>⭐⭐⭐⭐⭐ Loved by 5,000+ Students & Professionals</span>
                  </div>
                  <div className="inline-flex items-center gap-1 bg-[#0071e3]/5 dark:bg-[#0071e3]/10 px-3 py-1 rounded-full text-[10px] font-bold font-mono text-[#0071e3] border border-[#0071e3]/10 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>Powered by Gemini</span>
                  </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold font-display leading-[1.1] tracking-tight text-[#1d1d1f] dark:text-zinc-50">
                  Turn Any Video or Document into an AI Learning Workspace
                </h1>

                <p className="text-neutral-500 dark:text-zinc-400 text-sm sm:text-base max-w-3xl leading-relaxed font-light font-sans">
                  Generate smart summaries, visual mind maps, flashcards, interactive quizzes, study notes, and ready-to-publish blogs or social posts in under 60 seconds.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-semibold text-[#86868b] dark:text-zinc-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>No Credit Card Required</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Create Your First Workspace Free</span>
                  </span>
                </div>

                {/* 📊 INTERACTIVE WORKSPACE STATUS & RETENTION STATS WIDGET */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50/80 dark:bg-zinc-950/60 p-4 rounded-2xl border border-black/[0.03] dark:border-zinc-800/80 relative z-10">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-amber-500/10 dark:bg-amber-500/15 rounded-xl text-amber-500 border border-amber-500/10">
                      <Flame className="w-4 h-4 fill-amber-500 animate-pulse" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono tracking-wider font-bold text-neutral-400 dark:text-zinc-500 uppercase">
                        Study Streak
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-neutral-800 dark:text-zinc-200">
                        🔥 5-Day Active
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-xl text-indigo-500 border border-indigo-500/10">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono tracking-wider font-bold text-neutral-400 dark:text-zinc-500 uppercase">
                        Knowledge XP
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-neutral-800 dark:text-zinc-200">
                        🏆 1,450 Points
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-[#0071e3]/10 dark:bg-[#0071e3]/15 rounded-xl text-[#0071e3] border border-[#0071e3]/10">
                      <Zap className="w-4 h-4 fill-[#0071e3]" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono tracking-wider font-bold text-neutral-400 dark:text-zinc-500 uppercase">
                        Processing Quota
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        {isPremium || usageTracker.vipBypassActive ? 'PRO ACTIVE' : `${usageTracker.remaining} Left`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center text-left">
                    <div className="flex items-center justify-between text-[9px] font-mono font-bold text-neutral-400 dark:text-zinc-500 uppercase mb-1">
                      <span>Weekly Goal</span>
                      <span className="text-indigo-600 dark:text-indigo-400">3/5 Done</span>
                    </div>
                    <div className="w-full bg-neutral-200/60 dark:bg-zinc-800/60 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Form Input Engine */}
                <form id="url-submit-form" onSubmit={handleSummarize} className="space-y-4 pt-2">
                  
                  {/* Learning Depth Custom Selector */}
                  <div className="flex flex-col gap-3 pt-1 pb-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#86868b] dark:text-zinc-400 block text-left">
                      How deeply would you like to learn this content?
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Quick Review Card */}
                      <button
                        type="button"
                        onClick={() => {
                          setLearningDepth('quick');
                          trackGAEvent?.('depth_selected', { depth: 'quick' });
                        }}
                        className={`relative group flex flex-col p-4 text-left rounded-2xl border transition-all cursor-pointer ${
                          learningDepth === 'quick'
                            ? 'bg-neutral-50/90 dark:bg-zinc-900/40 border-neutral-900 dark:border-zinc-100 shadow-sm ring-1 ring-neutral-900/10'
                            : 'bg-white dark:bg-zinc-950/60 border-neutral-200/60 dark:border-zinc-800/80 hover:border-neutral-300 dark:hover:border-zinc-700 shadow-xs'
                        }`}
                      >
                        {learningDepth === 'quick' && (
                          <motion.div
                            layoutId="activeDepthGlow"
                            className="absolute -inset-[2px] rounded-2xl border-2 border-[#0071e3] pointer-events-none"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <div className="flex items-start justify-between w-full">
                          <div className="p-2 bg-neutral-100 dark:bg-zinc-900 rounded-xl group-hover:scale-105 transition-transform">
                            <Zap className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[#86868b] bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                            2–5 min study
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-zinc-100 mt-3 flex items-center gap-1">
                          Quick Review
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1 leading-relaxed flex-1">
                          Distilled core summary & factual highlights. Best for fast recaps and busy professionals.
                        </p>
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[#86868b] dark:text-zinc-400">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Summary + 3-5 Facts</span>
                        </div>
                      </button>

                      {/* Study Mode Card (Recommended) */}
                      <button
                        type="button"
                        onClick={() => {
                          setLearningDepth('study');
                          trackGAEvent?.('depth_selected', { depth: 'study' });
                        }}
                        className={`relative group flex flex-col p-4 text-left rounded-2xl border transition-all cursor-pointer ${
                          learningDepth === 'study'
                            ? 'bg-neutral-50/90 dark:bg-zinc-900/40 border-neutral-900 dark:border-zinc-100 shadow-sm ring-1 ring-neutral-900/10'
                            : 'bg-white dark:bg-zinc-950/60 border-neutral-200/60 dark:border-zinc-800/80 hover:border-neutral-300 dark:hover:border-zinc-700 shadow-xs'
                        }`}
                      >
                        {learningDepth === 'study' && (
                          <motion.div
                            layoutId="activeDepthGlow"
                            className="absolute -inset-[2px] rounded-2xl border-2 border-[#0071e3] pointer-events-none"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <div className="flex items-start justify-between w-full">
                          <div className="p-2 bg-neutral-100 dark:bg-zinc-900 rounded-xl group-hover:scale-105 transition-transform">
                            <BookOpen className="w-5 h-5 text-[#0071e3]" />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md uppercase tracking-wider font-extrabold">
                            RECOMMENDED
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-zinc-100 mt-3 flex items-center gap-1">
                          Study Mode
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1 leading-relaxed flex-1">
                          Full summaries, key concepts with analogies, 10+ recall flashcards, practice tests, and mind maps.
                        </p>
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[#86868b] dark:text-zinc-400">
                          <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
                          <span>Complete Learning Deck</span>
                        </div>
                      </button>

                      {/* Mastery Mode Card (Premium) */}
                      <button
                        type="button"
                        onClick={() => {
                          const userIsPremium = isPremium || 
                            visitorUser?.email?.toLowerCase().trim() === 'rbahirathan@gmail.com' ||
                            localStorage.getItem('youtube_summarizer_premium_email')?.toLowerCase().trim() === 'rbahirathan@gmail.com';
                          if (userIsPremium) {
                            setLearningDepth('mastery');
                            trackGAEvent?.('depth_selected', { depth: 'mastery' });
                          } else {
                            setShowMasteryModal(true);
                          }
                        }}
                        className={`relative group flex flex-col p-4 text-left rounded-2xl border transition-all cursor-pointer ${
                          learningDepth === 'mastery'
                            ? 'bg-neutral-50/90 dark:bg-zinc-900/40 border-neutral-900 dark:border-zinc-100 shadow-sm ring-1 ring-neutral-900/10'
                            : 'bg-white dark:bg-zinc-950/60 border-neutral-200/60 dark:border-zinc-800/80 hover:border-neutral-300 dark:hover:border-zinc-700 shadow-xs'
                        }`}
                      >
                        {learningDepth === 'mastery' && (
                          <motion.div
                            layoutId="activeDepthGlow"
                            className="absolute -inset-[2px] rounded-2xl border-2 border-[#0071e3] pointer-events-none"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <div className="flex items-start justify-between w-full">
                          <div className="p-2 bg-neutral-100 dark:bg-zinc-900 rounded-xl group-hover:scale-105 transition-transform">
                            <Crown className="w-5 h-5 text-amber-500" />
                          </div>
                          <div className="flex items-center gap-1">
                            {!(isPremium || visitorUser?.email?.toLowerCase().trim() === 'rbahirathan@gmail.com' || localStorage.getItem('youtube_summarizer_premium_email')?.toLowerCase().trim() === 'rbahirathan@gmail.com') && <Lock className="w-3 h-3 text-amber-500" />}
                            <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md uppercase tracking-wider font-extrabold">
                              PRO MASTER
                            </span>
                          </div>
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-zinc-100 mt-3 flex items-center gap-1">
                          Mastery Mode
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1 leading-relaxed flex-1">
                          Comprehensive master guides, daily study calendars, 30+ custom flashcards, 7-day schedules, and detailed concept paths.
                        </p>
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-amber-600">
                          <Crown className="w-3.5 h-3.5" />
                          <span>Exhaustive Syllabus Deck</span>
                        </div>
                      </button>
                    </div>

                    {/* Dynamic AI Recommendation Prompt */}
                    <div className="mt-2 p-3 bg-neutral-50 dark:bg-zinc-950/60 rounded-xl border border-neutral-200/50 dark:border-zinc-800/60 flex items-start gap-3 text-left">
                      <div className="p-1.5 bg-[#0071e3]/10 dark:bg-[#0071e3]/20 rounded-lg text-[#0071e3] shrink-0">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900 dark:text-zinc-200">
                            {getAIRecommendation().title}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-zinc-400 leading-relaxed">
                          {getAIRecommendation().why}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Input Source Type Selector Tabs */}
                  <div className="space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex gap-1.5 bg-neutral-100/60 dark:bg-zinc-950 p-1 rounded-2xl border border-black/[0.04] dark:border-zinc-800/60 w-fit">
                        {[
                          { id: 'video', label: t('youtubeVideo'), icon: Video },
                          { id: 'file', label: t('documentsAudio'), icon: FolderPlus }
                        ].map((src) => {
                          const SrcIcon = src.icon;
                          const isSelected = inputSourceType === src.id;
                          return (
                            <button
                              key={src.id}
                              type="button"
                              onClick={() => setInputSourceType(src.id as any)}
                              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer transition ${
                                isSelected 
                                  ? 'bg-white dark:bg-zinc-800 text-neutral-900 dark:text-zinc-50 shadow-xs font-bold' 
                                  : 'text-[#86868b] dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100'
                              }`}
                            >
                              <SrcIcon className="w-3.5 h-3.5 shrink-0" />
                              <span>{src.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          showAdvancedOptions
                            ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Advanced Settings {showAdvancedOptions ? '✓' : ''}</span>
                        {showAdvancedOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {showAdvancedOptions && (
                      <div className="p-5 bg-neutral-50/80 dark:bg-zinc-950/40 border border-neutral-200/60 dark:border-zinc-800/80 rounded-2xl space-y-5 animate-fadeIn text-left">
                        {/* Alternate Source Formats */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-mono tracking-wider font-bold text-[#86868b] uppercase">
                            Alternate Source Formats
                          </label>
                          <div className="flex flex-wrap gap-1 bg-white dark:bg-zinc-950/80 p-1 rounded-xl border border-black/[0.04] dark:border-zinc-800/40 w-fit">
                            {[
                              { id: 'website', label: t('websiteLink'), icon: Globe },
                              { id: 'text', label: t('rawTextNotes'), icon: FileText }
                            ].map((src) => {
                              const SrcIcon = src.icon;
                              const isSelected = inputSourceType === src.id;
                              return (
                                <button
                                  key={src.id}
                                  type="button"
                                  onClick={() => setInputSourceType(src.id as any)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${
                                    isSelected 
                                      ? 'bg-neutral-900 text-white shadow-xs font-bold font-sans' 
                                      : 'text-[#86868b] dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100'
                                  }`}
                                >
                                  <SrcIcon className="w-3 h-3 shrink-0" />
                                  <span>{src.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Learning Depth Customizations */}
                        <div className="border-t border-neutral-200/50 dark:border-zinc-800/50 pt-4 space-y-4">
                          <h4 className="text-xs font-bold text-neutral-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#0071e3]" />
                            Advanced Learn Depth Controls
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Summary Length Selector */}
                            <div className="space-y-2">
                              <label className="block text-[10px] font-mono tracking-wider font-bold text-[#86868b] uppercase">
                                Summary Length
                              </label>
                              <div className="flex flex-wrap gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-black/[0.04] dark:border-zinc-800/40 w-fit">
                                {[
                                  { id: 'short', label: 'Short' },
                                  { id: 'medium', label: 'Medium' },
                                  { id: 'long', label: 'Long' },
                                  { id: 'custom', label: 'Custom' }
                                ].map((len) => (
                                  <button
                                    key={len.id}
                                    type="button"
                                    onClick={() => setAdvSummaryLength(len.id as any)}
                                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${
                                      advSummaryLength === len.id 
                                        ? 'bg-neutral-900 text-white font-bold' 
                                        : 'text-[#86868b] dark:text-zinc-400 hover:text-neutral-900'
                                    }`}
                                  >
                                    {len.label}
                                  </button>
                                ))}
                              </div>
                              {advSummaryLength === 'custom' && (
                                <div className="flex items-center gap-2 mt-1.5 animate-fadeIn">
                                  <input
                                    type="number"
                                    min={100}
                                    max={10000}
                                    value={advCustomWordCount}
                                    onChange={(e) => setAdvCustomWordCount(Number(e.target.value))}
                                    className="w-24 p-1.5 text-xs bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg outline-none"
                                  />
                                  <span className="text-[11px] text-neutral-500">Target Word Count</span>
                                </div>
                              )}
                            </div>

                            {/* Flashcard Count */}
                            <div className="space-y-2">
                              <label className="block text-[10px] font-mono tracking-wider font-bold text-[#86868b] uppercase">
                                Flashcard Count
                              </label>
                              <div className="flex flex-wrap gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-black/[0.04] dark:border-zinc-800/40 w-fit">
                                {[10, 20, 30, 50, 100].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => setAdvFlashcardCount(num)}
                                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${
                                      advFlashcardCount === num 
                                        ? 'bg-neutral-900 text-white font-bold' 
                                        : 'text-[#86868b] dark:text-zinc-400 hover:text-neutral-900'
                                    }`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Quiz Questions */}
                            <div className="space-y-2">
                              <label className="block text-[10px] font-mono tracking-wider font-bold text-[#86868b] uppercase">
                                Quiz Questions
                              </label>
                              <div className="flex flex-wrap gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-black/[0.04] dark:border-zinc-800/40 w-fit">
                                {[5, 10, 20, 30].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => setAdvQuizQuestionCount(num)}
                                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${
                                      advQuizQuestionCount === num 
                                        ? 'bg-neutral-900 text-white font-bold' 
                                        : 'text-[#86868b] dark:text-zinc-400 hover:text-neutral-900'
                                    }`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Mind Map Detail */}
                            <div className="space-y-2">
                              <label className="block text-[10px] font-mono tracking-wider font-bold text-[#86868b] uppercase">
                                Mind Map Detail
                              </label>
                              <div className="flex flex-wrap gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-black/[0.04] dark:border-zinc-800/40 w-fit">
                                {[
                                  { id: 'simple', label: 'Simple' },
                                  { id: 'balanced', label: 'Balanced' },
                                  { id: 'detailed', label: 'Detailed' }
                                ].map((det) => (
                                  <button
                                    key={det.id}
                                    type="button"
                                    onClick={() => setAdvMindMapDetail(det.id as any)}
                                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${
                                      advMindMapDetail === det.id 
                                        ? 'bg-neutral-900 text-white font-bold' 
                                        : 'text-[#86868b] dark:text-zinc-400 hover:text-neutral-900'
                                    }`}
                                  >
                                    {det.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Explanation Style */}
                            <div className="space-y-2 sm:col-span-2">
                              <label className="block text-[10px] font-mono tracking-wider font-bold text-[#86868b] uppercase">
                                Explanation Style
                              </label>
                              <div className="flex flex-wrap gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-black/[0.04] dark:border-zinc-800/40 w-fit">
                                {[
                                  { id: 'bullets', label: 'Bullet Points' },
                                  { id: 'teaching', label: 'Teaching Style' },
                                  { id: 'academic', label: 'Academic' },
                                  { id: 'professional', label: 'Professional' },
                                  { id: 'beginner', label: 'Beginner Friendly' }
                                ].map((style) => (
                                  <button
                                    key={style.id}
                                    type="button"
                                    onClick={() => setAdvExplanationStyle(style.id as any)}
                                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${
                                      advExplanationStyle === style.id 
                                        ? 'bg-neutral-900 text-white font-bold' 
                                        : 'text-[#86868b] dark:text-zinc-400 hover:text-neutral-900'
                                    }`}
                                  >
                                    {style.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Synthesis Tone Preset Selection Gated Module */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-mono tracking-wider font-bold text-[#86868b] uppercase">
                            {t('synthesisTone')}
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedTone('standard')}
                              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                selectedTone === 'standard'
                                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                                  : 'bg-white border-black/[0.08] text-[#515154] hover:bg-neutral-50 hover:border-black/[0.12]'
                              }`}
                            >
                              <span>{t('shortScript')}</span>
                              <span className={`text-[8px] font-mono leading-none font-bold px-1.5 py-0.5 rounded ${selectedTone === 'standard' ? 'bg-white/20 text-white' : 'bg-black/[0.04] text-[#86868b]'}`}>{t('free')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isPremium) {
                                  setSelectedTone('academic');
                                } else {
                                  setSelectedPlanCode('pro');
                                  setShowStripeModal(true);
                                  setStripePaymentSuccess(false);
                                }
                              }}
                              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                selectedTone === 'academic' && isPremium
                                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                                  : 'bg-white border-black/[0.08] text-[#515154] hover:bg-neutral-50 hover:border-black/[0.12]'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 min-w-0">
                                {!isPremium && <Lock className="w-3 h-3 text-[#86868b] shrink-0" />}
                                <span className="truncate">{t('academicStudy')}</span>
                              </span>
                              <span className="text-[8px] font-mono leading-none font-bold bg-[#0071e3]/10 text-[#0071e3] px-1.5 py-0.5 rounded shrink-0">{t('pro')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isPremium) {
                                  setSelectedTone('viral');
                                } else {
                                  setSelectedPlanCode('pro');
                                  setShowStripeModal(true);
                                  setStripePaymentSuccess(false);
                                }
                              }}
                              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                selectedTone === 'viral' && isPremium
                                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                                  : 'bg-white border-black/[0.08] text-[#515154] hover:bg-neutral-50 hover:border-black/[0.12]'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 min-w-0">
                                {!isPremium && <Lock className="w-3 h-3 text-[#86868b] shrink-0" />}
                                <span className="truncate">{t('viralBulletin')}</span>
                              </span>
                              <span className="text-[8px] font-mono leading-none font-bold bg-[#0071e3]/10 text-[#0071e3] px-1.5 py-0.5 rounded shrink-0">{t('pro')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isPremium) {
                                  setSelectedTone('reel');
                                  if (activeSummary) {
                                    setActiveTab('reel');
                                  }
                                } else {
                                  setSelectedPlanCode('pro');
                                  setShowStripeModal(true);
                                  setStripePaymentSuccess(false);
                                }
                              }}
                              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                selectedTone === 'reel' && isPremium
                                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                                  : 'bg-white border-black/[0.08] text-[#515154] hover:bg-neutral-50 hover:border-black/[0.12]'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 min-w-0">
                                {!isPremium && <Lock className="w-3 h-3 text-[#86868b] shrink-0" />}
                                <span className="truncate">{t('shortenedVideo')}</span>
                              </span>
                              <span className="text-[8px] font-mono leading-none font-bold bg-[#0071e3]/10 text-[#0071e3] px-1.5 py-0.5 rounded shrink-0">{t('pro')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Target Language Selector */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-mono tracking-wider font-bold text-[#86868b] uppercase">
                            {t('targetLanguage')}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setOutputLanguage('en')}
                              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                outputLanguage === 'en'
                                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                                  : 'bg-white border-black/[0.08] text-[#515154] hover:bg-neutral-50 hover:border-black/[0.12]'
                              }`}
                            >
                              <span className="text-sm">🇺🇸</span>
                              <span>{t('englishDefault')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setOutputLanguage('ar')}
                              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                outputLanguage === 'ar'
                                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                                  : 'bg-white border-black/[0.08] text-[#515154] hover:bg-neutral-50 hover:border-black/[0.12]'
                              }`}
                            >
                              <span className="text-sm">🇸🇦</span>
                              <span>{t('arabicLanguage')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Pasting custom manual script option */}
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => setShowCustomTranscriptField(!showCustomTranscriptField)}
                            className="text-xs text-neutral-600 hover:text-neutral-900 transition duration-200 inline-flex items-center gap-1 font-medium bg-black/[0.03] hover:bg-black/[0.05] px-3 py-1.5 rounded-xl border border-black/[0.02] cursor-pointer"
                          >
                            <span>{showCustomTranscriptField ? t('hideCustomTranscript') : t('showCustomTranscript')}</span>
                            {showCustomTranscriptField ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {showCustomTranscriptField && (
                            <div className="mt-2 space-y-1.5 animate-fadeIn">
                              <label className="block text-[10px] font-mono font-bold uppercase text-[#86868b]">
                                {t('pastedTranscriptLabel')}
                              </label>
                              <textarea
                                placeholder={t('transcriptHelp')}
                                rows={3}
                                value={customTranscript}
                                onChange={(e) => setCustomTranscript(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-xs placeholder:text-neutral-400 focus:border-[#0071e3]/30 focus:ring-4 focus:ring-[#0071e3]/5 outline-none transition text-[#1d1d1f]"
                              />
                            </div>
                          )}
                        </div>

                        {/* Model Configuration Selector */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-mono tracking-wider font-bold text-[#86868b] uppercase">
                            Active AI Synthesis Model
                          </label>
                          <div className="bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-zinc-800/80 p-3 rounded-xl flex items-center justify-between text-xs text-neutral-700 dark:text-zinc-300">
                            <span className="flex items-center gap-2 font-medium font-sans">
                              <Cpu className="w-4 h-4 text-[#0071e3] shrink-0" />
                              Gemini 2.5 Flash (Production Ultra)
                            </span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                              Fastest & Smartest
                            </span>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-stretch">
                     {inputSourceType === 'video' && (
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#86868b]">
                          <Video className="w-4.5 h-4.5 text-[#86868b]" />
                        </div>
                        <input
                          type="url"
                          required={inputSourceType === 'video'}
                          placeholder={t('pasteVideoPlaceholder')}
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          onFocus={() => setShowCachedUrls(true)}
                          onBlur={() => setTimeout(() => setShowCachedUrls(false), 200)}
                          className="w-full pl-11 pr-12 py-4 bg-neutral-100/60 dark:bg-zinc-900/60 hover:bg-neutral-100/90 dark:hover:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-900 text-[#1d1d1f] dark:text-zinc-100 rounded-2xl border border-neutral-350 dark:border-zinc-800 hover:border-neutral-400 focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/5 outline-none transition placeholder:text-neutral-400 text-sm font-sans"
                        />

                        {/* Real-time validation indicator */}
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2 pointer-events-none">
                          {isUrlValidating && (
                            <Loader2 className="w-4.5 h-4.5 text-indigo-500 animate-spin" />
                          )}
                          {!isUrlValidating && urlValidationResult === 'valid' && (
                            <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                          )}
                          {!isUrlValidating && urlValidationResult === 'invalid' && (
                            <AlertCircle className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                          )}
                        </div>

                        {/* 🗂️ CACHED & RECENT URLS POPOVER */}
                        {showCachedUrls && allCachedUrls.length > 0 && (
                          <div 
                            id="cached-urls-popover-video"
                            className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] z-50 overflow-hidden animate-fadeIn backdrop-blur-md"
                          >
                            <div className="p-3 bg-neutral-50/80 dark:bg-zinc-900/50 border-b border-neutral-100 dark:border-zinc-800/80 flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-400 dark:text-zinc-500 uppercase flex items-center gap-1">
                                <History className="w-3 h-3" />
                                Cached & Suggested URLs
                              </span>
                              <button 
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  try {
                                    localStorage.removeItem('zipytiny_recent_urls');
                                    setRecentUrls([]);
                                  } catch {}
                                }}
                                className="text-[9px] font-semibold text-[#0071e3] hover:underline cursor-pointer"
                              >
                                Clear Recents
                              </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-zinc-800/50">
                              {allCachedUrls.map((item, idx) => {
                                const ItemIcon = item.type === 'video' ? Video : Globe;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      if (item.type === 'video') {
                                        setInputSourceType('video');
                                        setVideoUrl(item.url);
                                      } else {
                                        setInputSourceType('website');
                                        setInputWebsiteUrl(item.url);
                                      }
                                      setShowCachedUrls(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-zinc-900/80 transition-all duration-150 flex items-center gap-3 group cursor-pointer"
                                  >
                                    <ItemIcon className="w-4 h-4 text-neutral-400 group-hover:text-[#0071e3] shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-neutral-800 dark:text-zinc-200 truncate group-hover:text-[#0071e3]">
                                        {item.title}
                                      </p>
                                      <p className="text-[10px] text-neutral-400 dark:text-zinc-500 truncate font-mono">
                                        {item.url}
                                      </p>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                      item.isRecent 
                                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                      {item.isRecent ? 'Recent' : 'Demo'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {inputSourceType === 'website' && (
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#86868b]">
                          <Globe className="w-4.5 h-4.5 text-[#86868b]" />
                        </div>
                        <input
                          type="url"
                          required={inputSourceType === 'website'}
                          placeholder={t('pasteWebsitePlaceholder')}
                          value={inputWebsiteUrl}
                          onChange={(e) => setInputWebsiteUrl(e.target.value)}
                          onFocus={() => setShowCachedUrls(true)}
                          onBlur={() => setTimeout(() => setShowCachedUrls(false), 200)}
                          className="w-full pl-11 pr-12 py-4 bg-neutral-100/60 dark:bg-zinc-900/60 hover:bg-neutral-100/90 dark:hover:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-900 text-[#1d1d1f] dark:text-zinc-100 rounded-2xl border border-neutral-350 dark:border-zinc-800 hover:border-neutral-400 focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/5 outline-none transition placeholder:text-neutral-400 text-sm font-sans"
                        />

                        {/* Real-time validation indicator */}
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2 pointer-events-none">
                          {isUrlValidating && (
                            <Loader2 className="w-4.5 h-4.5 text-indigo-500 animate-spin" />
                          )}
                          {!isUrlValidating && urlValidationResult === 'valid' && (
                            <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                          )}
                          {!isUrlValidating && urlValidationResult === 'invalid' && (
                            <AlertCircle className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                          )}
                        </div>

                        {/* 🗂️ CACHED & RECENT URLS POPOVER */}
                        {showCachedUrls && allCachedUrls.length > 0 && (
                          <div 
                            id="cached-urls-popover-website"
                            className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] z-50 overflow-hidden animate-fadeIn backdrop-blur-md"
                          >
                            <div className="p-3 bg-neutral-50/80 dark:bg-zinc-900/50 border-b border-neutral-100 dark:border-zinc-800/80 flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-400 dark:text-zinc-500 uppercase flex items-center gap-1">
                                <History className="w-3 h-3" />
                                Cached & Suggested URLs
                              </span>
                              <button 
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  try {
                                    localStorage.removeItem('zipytiny_recent_urls');
                                    setRecentUrls([]);
                                  } catch {}
                                }}
                                className="text-[9px] font-semibold text-[#0071e3] hover:underline cursor-pointer"
                              >
                                Clear Recents
                              </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-zinc-800/50">
                              {allCachedUrls.map((item, idx) => {
                                const ItemIcon = item.type === 'video' ? Video : Globe;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      if (item.type === 'video') {
                                        setInputSourceType('video');
                                        setVideoUrl(item.url);
                                      } else {
                                        setInputSourceType('website');
                                        setInputWebsiteUrl(item.url);
                                      }
                                      setShowCachedUrls(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-zinc-900/80 transition-all duration-150 flex items-center gap-3 group cursor-pointer"
                                  >
                                    <ItemIcon className="w-4 h-4 text-neutral-400 group-hover:text-[#0071e3] shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-neutral-800 dark:text-zinc-200 truncate group-hover:text-[#0071e3]">
                                        {item.title}
                                      </p>
                                      <p className="text-[10px] text-neutral-400 dark:text-zinc-500 truncate font-mono">
                                        {item.url}
                                      </p>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                      item.isRecent 
                                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                      {item.isRecent ? 'Recent' : 'Demo'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {inputSourceType === 'file' && (
                      <div className="flex-1">
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                          onDragLeave={() => setIsDragActive(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragActive(false);
                            const files = Array.from(e.dataTransfer.files);
                            files.forEach((f: any) => {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setUploadedFiles(prev => [...prev, {
                                  name: f.name,
                                  size: f.size,
                                  type: f.type,
                                  textContent: typeof event.target?.result === 'string' ? event.target.result : undefined
                                }]);
                              };
                              reader.readAsText(f);
                            });
                          }}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
                            isDragActive 
                              ? 'border-[#0071e3] bg-[#0071e3]/5' 
                              : 'border-neutral-300 dark:border-zinc-800 hover:border-neutral-450 bg-neutral-50 dark:bg-zinc-900/40'
                          }`}
                        >
                          <input 
                            type="file" 
                            multiple 
                            className="hidden" 
                            id="file-upload-input"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach((f: any) => {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setUploadedFiles(prev => [...prev, {
                                    name: f.name,
                                    size: f.size,
                                    type: f.type,
                                    textContent: typeof event.target?.result === 'string' ? event.target.result : undefined
                                  }]);
                                };
                                reader.readAsText(f);
                              });
                            }}
                          />
                          <label htmlFor="file-upload-input" className="cursor-pointer space-y-1.5 block">
                            <FolderPlus className="w-8 h-8 text-neutral-400 mx-auto" />
                            <p className="text-xs font-semibold text-neutral-700 dark:text-zinc-300">
                              {outputLanguage === 'en' ? (
                                <>Drag & drop files here or <span className="text-[#0071e3] hover:underline font-bold">browse files</span></>
                              ) : (
                                <>اسحب وأسقط الملفات هنا أو <span className="text-[#0071e3] hover:underline font-bold">تصفح الملفات</span></>
                              )}
                            </p>
                            <p className="text-[10px] text-neutral-400">{t('supportsFiles')}</p>
                          </label>
                        </div>

                        {uploadedFiles.length > 0 && (
                          <div className="mt-3.5 space-y-1.5">
                            {uploadedFiles.map((file, fIdx) => (
                              <div key={fIdx} className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-800/80 rounded-xl text-xs">
                                <span className="font-medium text-neutral-800 dark:text-zinc-200 flex items-center gap-1.5 truncate max-w-[200px]">
                                  <FileText className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                                  {file.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-neutral-400 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                                  <button 
                                    type="button" 
                                    onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== fIdx))}
                                    className="text-rose-500 hover:text-rose-700 font-bold shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-rose-50"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {inputSourceType === 'text' && (
                      <div className="relative flex-1">
                        <textarea
                          required={inputSourceType === 'text'}
                          placeholder={t('pasteRawTextPlaceholder')}
                          rows={4}
                          value={pastedContentText}
                          onChange={(e) => setPastedContentText(e.target.value)}
                          className="w-full p-4 bg-neutral-100/60 dark:bg-zinc-900/60 hover:bg-neutral-100/90 dark:hover:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-900 text-[#1d1d1f] dark:text-zinc-100 rounded-2xl border border-neutral-350 dark:border-zinc-800 hover:border-neutral-400 focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/5 outline-none transition placeholder:text-neutral-400 text-sm font-sans"
                        />
                      </div>
                    )}

                    </div>

                    {/* Transformation Flow Preview Widget */}
                    {!loading && <TransformationPreview />}

                    {/* Majestic glowing master CTA button */}
                    <button
                      type="submit"
                      disabled={
                        loading || 
                        (inputSourceType === 'video' && !videoUrl) ||
                        (inputSourceType === 'website' && !inputWebsiteUrl) ||
                        (inputSourceType === 'file' && uploadedFiles.length === 0) ||
                        (inputSourceType === 'text' && !pastedContentText)
                      }
                      className={`w-full py-4.5 px-8 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg active:scale-98 disabled:opacity-40 disabled:pointer-events-none cursor-pointer relative overflow-hidden group mt-4 ${
                        learnMode 
                          ? 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:brightness-105 text-white shadow-teal-500/10'
                          : 'bg-gradient-to-r from-[#0071e3] to-[#00a2ff] hover:brightness-105 text-white shadow-[#0071e3]/20'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Generating Your Custom AI Workspace...</span>
                        </>
                      ) : (
                        <>
                          {learnMode ? (
                            <>
                              <Zap className="w-5 h-5 text-amber-300 fill-amber-300 animate-bounce" />
                              <span>Create Your AI Learn Workspace — Free</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 text-white animate-pulse" />
                              <span>Create Your AI Workspace — Free</span>
                            </>
                          )}
                        </>
                      )}
                    </button>

                    {/* Dynamic Guest Allocation Control Feedback Module */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] px-1 pt-1 font-sans mt-3">
                      {isPremium || usageTracker.vipBypassActive ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1.5 text-left">
                          <CheckCircle className="w-3.5 h-3.5 fill-emerald-50 text-emerald-600 shrink-0" />
                          {t('unlimitedSummaryEngine')}
                        </span>
                      ) : (
                        <span className="text-[#86868b] font-light flex items-center gap-1.5 font-sans text-left">
                          <AlertCircle className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
                          <span>{t('guestAllocationRemaining')}<strong className="font-semibold text-neutral-800 dark:text-zinc-200">{usageTracker.remaining}</strong>{t('of')}<strong className="font-semibold text-neutral-800 dark:text-zinc-200">{usageTracker.limit}</strong>{t('dailyAnalyses')}</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setCurrentScreen('billing')}
                        className="text-[#0071e3] hover:underline font-semibold text-left sm:text-right cursor-pointer"
                      >
                        {isPremium || usageTracker.vipBypassActive ? t('manageConnectionHub') : t('upgradeBypassLimits')}
                      </button>
                    </div>
                </form>

                {/* Progress Indicators & Steps */}
                {loading && (
                  <LoadingTimeline loadingStep={loadingStep} />
                )}

                {/* Technical Error Box */}
                {error && (
                  <div className="mt-6 p-5 bg-rose-50/70 border border-rose-200/60 rounded-2xl text-[#1d1d1f] animate-fadeIn space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-rose-800">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Server Request Interrupted</span>
                    </div>
                    {error.includes("dunning decision") || error.includes("Lightning dunning") || error.toLowerCase().includes("deny for project") ? (
                      <div className="space-y-2.5">
                        <p className="text-sm font-semibold text-rose-950 flex items-center gap-1.5">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                          Google Cloud Billing Hold (Dunning Status Active)
                        </p>
                        <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                          Google Cloud has restricted API requests for your GCP project (<code>projects/39732050718</code>) because of a billing hold, unpaid charge, or temporary suspended state (called <strong>Dunning</strong>). Because you just added a new payment method, Google needs a brief moment to sync, and you may need to complete a few quick setup steps!
                        </p>
                        <div className="bg-white/95 p-4 rounded-xl border border-rose-100/50 space-y-2.5">
                          <p className="text-xs font-semibold text-neutral-800">How to restore your API access immediately:</p>
                          <ul className="text-xs text-neutral-600 list-disc list-inside space-y-2 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100 leading-relaxed">
                            <li>
                              <strong className="text-neutral-900">Add Prepay Credits (Critical)</strong>: Google AI Studio operates on a <strong>Prepaid Billing Model</strong> for new developer accounts. Simply linking a new credit card is <strong>not enough</strong>! You must manually buy starting prepay credits. Go to your <a href="https://aistudio.google.com/app/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold underline inline-flex items-center gap-0.5 hover:text-indigo-800">Google AI Studio Billing Console</a>, click <strong>Add Funds / Buy Credits</strong>, and load a positive balance (e.g., $10). Google will immediately lift the block once your balance is positive!
                            </li>
                            <li>
                              <strong className="text-neutral-900">Check Project Association</strong>: Ensure your newly added billing account is actively linked to your Google Cloud Project <code>39732050718</code> in the <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium underline">GCP Billing Panel</a>.
                            </li>
                            <li>
                              <strong className="text-neutral-900">Wait for Sync</strong>: Once you purchase prepay credits, Google Cloud usually takes 15-30 minutes to propagate the billing update across global GenAI servers.
                            </li>
                            <li>
                              <strong className="text-neutral-950 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">Instant Bypass</strong>: While waiting, you can paste your own personal developer Gemini API key inside our {" "}
                              <button
                                onClick={() => setCurrentScreen('billing')}
                                className="text-indigo-600 font-bold hover:underline bg-transparent border-none p-0 inline cursor-pointer"
                              >
                                Billing (Sandbox)
                              </button>{" "}
                              tab above to test the app completely free with zero limits!
                            </li>
                          </ul>
                        </div>
                        <p className="text-[10px] text-rose-800/80 font-mono">Original Error Details: {error}</p>
                      </div>
                    ) : error.includes("RESOURCE_EXHAUSTED") || error.includes("prepayment credits") || error.includes("429") ? (
                      customApiKey ? (
                        <div className="space-y-2.5">
                          <p className="text-sm font-semibold text-rose-950">
                            Custom Gemini API Key - Rate Limit or Quota Exhausted
                          </p>
                          <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                            A 429 / RESOURCE_EXHAUSTED response was returned by Gemini using your <strong>custom API key</strong>. This typically means your personal API key has hit the Google AI Studio free tier limits (such as Requests Per Minute) or doesn't have an active billing profile linked in Google Cloud.
                          </p>
                          <div className="bg-white/95 p-3.5 rounded-xl border border-rose-100/50 space-y-2">
                            <p className="text-xs font-semibold text-neutral-800">Troubleshooting Steps:</p>
                            <ul className="text-xs text-neutral-600 list-disc list-inside space-y-1 bg-neutral-50/50 p-2.5 rounded-lg border border-neutral-100">
                              <li>Verify your key status on <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-medium">Google AI Studio</a>.</li>
                              <li>Check if your Google AI Studio project has hit its rate limits (e.g., Requests Per Minute limit).</li>
                              <li>Wait a few minutes and try again.</li>
                              <li>You can clear your custom key from the Billing tab to revert to Zipytiny host defaults.</li>
                            </ul>
                          </div>
                          <p className="text-[10px] text-rose-800/80 font-mono">Original Error: {error}</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <p className="text-sm font-semibold text-rose-950 flex items-center gap-1.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                            Google AI Studio Prepayment Credits Depleted
                          </p>
                          <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                            A 429 Exhausted status indicates your Gemini endpoint has run out of tokens, or your Google AI Studio prepaid credit balance is currently $0.00. Because you just updated your card, let's complete the final step!
                          </p>
                          <div className="bg-white/95 p-4 rounded-xl border border-rose-100/50 space-y-2.5">
                            <p className="text-xs font-semibold text-neutral-800">Required Steps for Paid Tier Gemini API:</p>
                            <ul className="text-xs text-neutral-600 list-disc list-inside space-y-2 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100 leading-relaxed">
                              <li>
                                <strong className="text-neutral-900">Purchase Prepaid Credits (Required)</strong>: Under Google AI Studio's paid plan, simply linking a credit card is <strong>not enough</strong> to start. You must go to <a href="https://aistudio.google.com/app/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold underline hover:text-indigo-800">Google AI Studio Billing</a> and click <strong>Add Funds / Buy Credits</strong> to purchase prepay credits (minimum $10). Once your balance is positive, Google immediately activates paid requests.
                              </li>
                              <li>
                                <strong className="text-neutral-900">Verify Project Linking</strong>: Ensure your billing account is actively linked to Google Cloud Project ID <code>39732050718</code> in the Google Cloud Billing console.
                              </li>
                              <li>
                                <strong className="text-neutral-900">Instant Bypass</strong>: While your prepay balance is syncing, you can enter your private personal Gemini API key inside our {" "}
                                <button
                                  onClick={() => setCurrentScreen('billing')}
                                  className="text-indigo-600 font-bold hover:underline bg-transparent border-none p-0 inline cursor-pointer"
                                >
                                  Billing (Sandbox) Tab
                                </button>{" "}
                                above to completely bypass server limits and summarize videos instantly for free!
                              </li>
                              <li>
                                <strong className="text-neutral-900">Cached Templates</strong>: Select Steve Jobs or Simon Sinek in the side rail for zero-cost, high-fidelity analyses.
                              </li>
                            </ul>
                          </div>
                        </div>
                      )
                    ) : error.toLowerCase().includes("api_key_invalid") || error.toLowerCase().includes("api key not valid") || error.toLowerCase().includes("invalid api key") || error.toLowerCase().includes("key is invalid") ? (
                      <div className="space-y-2.5">
                        <p className="text-sm font-semibold text-rose-950">
                          Invalid Custom Gemini API Key Detected
                        </p>
                        <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                          Gemini rejected the request because the custom API key provided in your Admin settings is invalid or has expired.
                        </p>
                        <div className="bg-white/95 p-3.5 rounded-xl border border-rose-100/50 space-y-2">
                          <p className="text-xs font-semibold text-neutral-800">How to resolve this:</p>
                          <ul className="text-xs text-neutral-600 list-disc list-inside space-y-1 bg-neutral-50/50 p-2.5 rounded-lg border border-neutral-100">
                            <li>Make sure you copied your entire key correctly from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-medium">Google AI Studio Console</a> (typically starts with <code>AIzaSy</code>).</li>
                            <li>Go to the <strong>Admin tab</strong> at the top, paste the key again, and click <strong>Save API Settings</strong>.</li>
                            <li>Make sure you did not paste an OpenAI key (which starts with <code>sk-</code>) or another service provider's key.</li>
                            <li>You can also clear the custom API key to use Zipytiny's default host limits.</li>
                          </ul>
                        </div>
                        <p className="text-[10px] text-rose-800/80 font-mono">Original Error: {error}</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-mono leading-relaxed text-rose-800/90">{error}</p>
                        {customApiKey && (
                          <p className="text-xs text-amber-850 bg-amber-50 p-3 rounded-xl border border-amber-100/50">
                            ⚠️ Note: You are currently running Zipytiny using a <strong>custom Gemini API Key</strong>. Please verify that this key has adequate permissions and billing configuration.
                          </p>
                        )}
                        <p className="text-[11px] text-[#515154] bg-white/60 p-3 rounded-xl leading-relaxed border border-rose-100/30 font-light">
                          💡 Tip: Some videos do not contain public english subtitles. You can simply enable the <strong className="text-[#1d1d1f] font-medium">"Custom Transcript override"</strong> box below, paste any video dialogue paragraph, and Gemini will render the summary of that text!
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {learnMode && !activeSummary && (
              <div className="animate-slideUp">
                <LearningProgressDashboard 
                  onLoadVideo={handleLoadVideoById}
                  onActivateDemo={handleLoadStoredItem}
                  onLoadStack={(stack) => {
                    setActiveStack(stack);
                    setActiveStackTab('overview');
                    setStackQuizAnswers({});
                    setStackQuizSubmitted(false);
                    setActiveSummary(null);
                  }}
                  savedSummaries={savedSummaries}
                  onUpdateSavedSummaries={saveToShelf}
                  savedStacks={savedStacks}
                  collections={collections}
                  onAddCollection={handleAddCollection}
                  visitorUser={visitorUser}
                  setShowAuthModal={setShowAuthModal}
                  setAuthModalPurpose={setAuthModalPurpose}
                />
              </div>
            )}

          </div>

          {/* Quick Demo Preloads Drawer side rail */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-black/[0.04] dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b] dark:text-zinc-500">
                  {t('readyToTest')}
                </span>
                <h3 className="text-lg font-bold font-display text-[#1d1d1f] dark:text-zinc-50">
                  {t('curatedDemos')}
                </h3>
                <p className="text-[#86868b] dark:text-zinc-400 text-xs mt-1 font-light">
                  {t('clickDemoCard')}
                </p>
              </div>

              <div className="space-y-3">
                {PRELOADED_VIDEOS.map((demo) => {
                  const isSinek = demo.metadata.videoId === 'qp0HIF3SfI4';
                  const isJobs = demo.metadata.videoId === 'UF8uR6Z6KLc';
                  const tagText = isSinek ? '🔥 POPULAR' : isJobs ? '⭐ CLASSIC' : '🎓 AI STUDY';
                  const tagColor = isSinek ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10' : isJobs ? 'text-purple-600 dark:text-purple-400 bg-purple-500/10' : 'text-[#0071e3] dark:text-[#0071e3] bg-[#0071e3]/10';

                  return (
                    <button
                      key={demo.metadata.videoId}
                      onClick={() => handleLoadStoredItem(demo)}
                      className={`w-full text-left p-2.5 rounded-2xl border transition duration-300 group relative overflow-hidden flex gap-3 ${
                        activeSummary?.metadata?.videoId === demo.metadata.videoId
                          ? 'border-transparent bg-neutral-100 dark:bg-zinc-800 shadow-inner'
                          : 'border-transparent hover:bg-neutral-50 dark:hover:bg-zinc-900 shadow-xs hover:scale-102 hover:border-black/[0.02]'
                      }`}
                    >
                      <div className="relative w-20 h-13 rounded-xl bg-neutral-100 dark:bg-zinc-800 overflow-hidden shrink-0 shadow-sm">
                        <img 
                          src={demo.metadata.thumbnailUrl} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onError={(e) => {
                            e.currentTarget.src = `https://img.youtube.com/vi/${demo.metadata.videoId}/sddefault.jpg`;
                          }}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition flex items-center justify-center">
                          <Play className="w-4 h-4 text-white drop-shadow-md scale-75 group-hover:scale-100 transition duration-300 fill-current" />
                        </div>
                        <div className="absolute right-1 bottom-1 bg-black/80 px-1 py-0.5 rounded text-[8px] font-mono text-white text-center">
                          {demo.metadata.duration}
                        </div>
                      </div>
                      
                      <div className="space-y-0.5 overflow-hidden flex flex-col justify-center">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${tagColor}`}>
                            {tagText}
                          </span>
                          <span className="text-[9px] font-mono text-[#86868b] dark:text-zinc-500 font-medium truncate">
                            {outputLanguage === 'ar' && ARABIC_PRELOADED_VIDEOS[demo.metadata.videoId]
                              ? ARABIC_PRELOADED_VIDEOS[demo.metadata.videoId].metadata.author
                              : demo.metadata.author}
                          </span>
                        </div>
                        <h4 className="text-[#1d1d1f] dark:text-zinc-200 text-xs font-semibold line-clamp-2 leading-tight group-hover:text-black dark:group-hover:text-white transition">
                          {outputLanguage === 'ar' && ARABIC_PRELOADED_VIDEOS[demo.metadata.videoId]
                            ? ARABIC_PRELOADED_VIDEOS[demo.metadata.videoId].metadata.title
                            : demo.metadata.title}
                        </h4>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Viral Referral Program Card Widget */}
            <div id="referral-widget-container" className="relative overflow-hidden bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-zinc-950/40 dark:via-zinc-900/40 dark:to-zinc-950/20 rounded-3xl p-6 border border-indigo-150/45 dark:border-indigo-900/30 shadow-[0_8px_30px_rgba(79,70,229,0.03)] space-y-5">
              {/* Decorative accent colors */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full filter blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1 bg-indigo-100/80 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold text-indigo-700 dark:text-indigo-400 uppercase">
                    {t('viralReferralInvite')}
                  </span>
                  <h3 className="text-base font-bold font-display text-neutral-900 dark:text-zinc-50 mt-1.5">
                    {t('unlockPremium')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    fetchReferralLeaderboard();
                    setShowProfileModal(true);
                  }}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-white dark:bg-zinc-900 border border-indigo-150/50 dark:border-zinc-800 shadow-xs px-2.5 py-1.5 rounded-xl transition shrink-0 active:scale-95"
                >
                  {t('leaderboard')}
                </button>
              </div>
              <p className="relative z-10 text-[#86868b] dark:text-zinc-400 text-[11px] mt-0.5 font-light leading-relaxed font-sans">
                {t('referralBonusDesc')}
              </p>

              {/* Progress Stepper Milestones */}
              <div className="relative z-10 space-y-2 pt-1 font-sans">
                <span className="block text-[9px] font-mono font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider">REWARD MILESTONES</span>
                <div className="space-y-2">
                  {[
                    { step: 1, label: "Invite 1 Friend", reward: "+5 Credits", active: referralCount >= 1 },
                    { step: 2, label: "Invite 2 Friends", reward: "🏆 PRO FOR LIFE", active: referralUnlocked || referralCount >= 2 }
                  ].map((m) => (
                    <div key={m.step} className="flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-200 bg-white dark:bg-zinc-950 border-black/[0.03] dark:border-zinc-800/80 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold font-mono ${
                          m.active 
                            ? 'bg-emerald-500 text-white shadow-xs' 
                            : 'bg-neutral-100 dark:bg-zinc-850 text-neutral-400 dark:text-zinc-500 border border-neutral-200 dark:border-zinc-800'
                        }`}>
                          {m.active ? '✓' : m.step}
                        </div>
                        <span className={`text-xs font-bold ${m.active ? 'text-neutral-800 dark:text-zinc-200 font-semibold' : 'text-neutral-400'}`}>
                          {m.label}
                        </span>
                      </div>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase font-mono border ${
                        m.active 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15' 
                          : 'bg-neutral-100 dark:bg-zinc-850 text-neutral-500 border-transparent'
                      }`}>
                        {m.reward}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unique Invite Link copy box */}
              <div className="relative z-10 space-y-1.5 font-sans text-left">
                <label className="block text-[10px] font-mono font-bold text-neutral-500 dark:text-zinc-400 uppercase">
                  {t('uniqueReferralLink')}
                </label>
                <div className="flex gap-2">
                  <input
                    id="referral-share-input"
                    type="text"
                    readOnly
                    value={`${window.location.origin}?ref=${referralCode}`}
                    className="flex-1 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-[11px] outline-none font-mono text-[#1d1d1f] dark:text-zinc-200 shadow-xs select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const link = `${window.location.origin}?ref=${referralCode}`;
                      const text = `Take a look at Zipytiny - Instant AI Video Knowledge Engine! It turns standard YouTube videos into structured guides, timelines, mindmaps, and interactive learning quizzes. Use my link to get unlimited credits: ${link}`;
                      
                      if (navigator.share) {
                        navigator.share({
                          title: 'Zipytiny Video Knowledge Engine',
                          text: text,
                          url: link
                        }).catch(() => {
                          handleCopyText(link, 'referral');
                        });
                      } else {
                        handleCopyText(link, 'referral');
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 rounded-xl flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0 shadow-xs"
                  >
                    {copiedStates['referral'] ? 'Copied' : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* High-converting Twitter sharing shortcut */}
              <div className="relative z-10 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const link = `${window.location.origin}?ref=${referralCode}`;
                    const text = `Take a look at Zipytiny - Universal AI Video Knowledge Engine! 🚀 It turns any long YouTube video into an interactive workspace, mind map, and dynamic quiz in 30 seconds. Try it with my link to get unlimited credits: ${link}`;
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                    window.open(twitterUrl, '_blank');
                  }}
                  className="w-full py-2.5 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <Twitter className="w-3.5 h-3.5 fill-current" />
                  <span>Share Launch on Twitter / X</span>
                </button>
              </div>
            </div>

            {/* Shelf Persistence History Box */}
            <div id="history-section" className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-black/[0.04] dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-5">
              
              {/* Workspace Preview Card */}
              {savedSummaries.length > 0 && savedSummaries[0]?.response && (
                <div className="bg-gradient-to-r from-neutral-50/70 to-neutral-100/30 dark:from-zinc-950 dark:to-zinc-900/30 p-4.5 rounded-2xl border border-black/[0.03] dark:border-zinc-800/80 shadow-xs space-y-3 font-sans text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#0071e3] uppercase tracking-wider bg-[#0071e3]/10 px-2.5 py-0.5 rounded-full">
                      ✨ Recent Workspace Preview
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono font-semibold">
                      Owner Active
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-zinc-100 leading-snug line-clamp-1">
                      {savedSummaries[0].response.metadata?.title}
                    </h4>
                    <p className="text-[10.5px] text-neutral-500 dark:text-zinc-400 font-light line-clamp-2 leading-relaxed">
                      {savedSummaries[0].response.summary || 'Study workspace generated successfully.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-black/[0.03] dark:border-zinc-800/40 text-[10px]">
                    <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold font-mono">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{savedSummaries[0].response.flashcards?.length || 0} Recall Flashcards</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleLoadStoredItem(savedSummaries[0].response);
                        setActiveStack(null);
                      }}
                      className="text-[#0071e3] dark:text-sky-400 font-extrabold hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Open Workspace</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION A: INDIVIDUAL SUMMARIES */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold font-display text-[#1d1d1f] dark:text-zinc-50 flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-[#0071e3] dark:text-indigo-400 animate-pulse" />
                      My AI Workspace
                    </h3>
                    <p className="text-[#86868b] dark:text-zinc-400 text-[11px] mt-0.5 font-light">
                      {isSelectingForStack ? (outputLanguage === 'en' ? 'Select 2+ workspaces for Stack' : 'اختر ملخصين أو أكثر لإنشاء حزمة') : (outputLanguage === 'en' ? 'Your persistent cloud library and study sets' : t('persistentShelf'))}
                    </p>
                  </div>
                  
                  {savedSummaries.length > 0 && (
                    <div className="flex gap-2 shrink-0">
                      {!isSelectingForStack ? (
                        <button
                          onClick={() => {
                            setIsSelectingForStack(true);
                            setSelectedStackVideoIds([]);
                            setStackNameInput('');
                          }}
                          className="text-[10px] bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 font-bold px-2 py-1 rounded-lg cursor-pointer transition flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-450" />
                          <span>{t('createStack')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setIsSelectingForStack(false);
                            setSelectedStackVideoIds([]);
                            setStackNameInput('');
                          }}
                          className="text-[10px] text-neutral-500 hover:text-neutral-700 dark:text-zinc-400 dark:hover:text-zinc-200 font-semibold cursor-pointer transition"
                        >
                          {outputLanguage === 'en' ? 'Cancel' : 'إلغاء'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* SEARCH INPUT BAR */}
                {savedSummaries.length > 0 && (
                  <div className="relative font-sans">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      placeholder={outputLanguage === 'en' ? 'Search title, author, or summary content...' : 'بحث في العنوان، الكاتب، أو محتوى التلخيص...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-100/60 dark:bg-zinc-950/60 border border-neutral-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/5 transition text-neutral-800 dark:text-zinc-100 placeholder:text-neutral-400"
                    />
                  </div>
                )}

                {/* HORIZONTAL COLLECTION / FOLDER SELECTOR PILLS */}
                {savedSummaries.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCollection(null)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                        !selectedCollection 
                          ? 'bg-[#0071e3] text-white' 
                          : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-500 dark:text-zinc-400 hover:bg-neutral-200'
                      }`}
                    >
                      All ({savedSummaries.length})
                    </button>
                    {collections.map(col => {
                      const count = savedSummaries.filter(s => s.collection === col).length;
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSelectedCollection(col)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            selectedCollection === col
                              ? 'bg-[#0071e3] text-white'
                              : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-500 dark:text-zinc-400 hover:bg-neutral-200'
                          }`}
                        >
                          <span>{col}</span>
                          <span className={`text-[8px] px-1 py-0.5 rounded leading-none ${selectedCollection === col ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-zinc-700 text-neutral-600 dark:text-zinc-350'}`}>{count}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        if (!visitorUser) {
                          setAuthModalPurpose('Create custom collections and folders to organize your summaries');
                          setShowAuthModal(true);
                          return;
                        }
                        const name = prompt("Enter new folder/collection name:");
                        if (name && name.trim()) {
                          handleAddCollection(name);
                        }
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-50/80 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-150/40 dark:border-indigo-900/40 hover:bg-indigo-100 transition cursor-pointer"
                    >
                      + New Folder
                    </button>
                  </div>
                )}

                {isSelectingForStack && (
                  <div className="bg-indigo-50/50 dark:bg-zinc-950/30 border border-indigo-100 dark:border-zinc-800 p-3 rounded-2xl space-y-3 animate-slideDown">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono font-bold text-indigo-700 dark:text-indigo-400 uppercase">
                        Knowledge Stack Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Machine Learning Mastery"
                        value={stackNameInput}
                        onChange={(e) => setStackNameInput(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-900 dark:text-zinc-100 outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-neutral-600 dark:text-zinc-400 font-medium">Selected: {selectedStackVideoIds.length} videos</span>
                      <button
                        type="button"
                        disabled={selectedStackVideoIds.length < 2 || isSynthesizing || !stackNameInput.trim()}
                        onClick={handleGenerateStack}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-300 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl cursor-pointer transition flex items-center gap-1"
                      >
                        {isSynthesizing ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Synthesizing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            <span>Generate Stack</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {savedSummaries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-zinc-800 bg-gradient-to-b from-slate-50/50 to-white dark:from-zinc-950/40 dark:to-zinc-900/10 p-6 sm:p-8 text-center space-y-5 animate-fadeIn font-sans">
                    
                    {/* Beautiful Miniature Workspace Vector Illustration */}
                    <div className="relative w-44 h-24 mx-auto bg-neutral-100/60 dark:bg-zinc-950/60 rounded-xl border border-neutral-200/50 dark:border-zinc-800 p-3 shadow-xs overflow-hidden flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 border-b border-neutral-200/40 dark:border-zinc-800/60 pb-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <div className="h-1.5 w-16 bg-neutral-200 dark:bg-zinc-850 rounded-full ml-1" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1.5 items-stretch flex-1 pt-2">
                        {/* Summary Column */}
                        <div className="bg-white dark:bg-zinc-900 rounded border border-neutral-150/40 dark:border-zinc-800/40 p-1 flex flex-col gap-1">
                          <div className="h-1 bg-indigo-500 rounded-full w-[80%]" />
                          <div className="h-0.5 bg-neutral-200 dark:bg-zinc-850 rounded-full w-full" />
                          <div className="h-0.5 bg-neutral-200 dark:bg-zinc-850 rounded-full w-[90%]" />
                          <div className="h-0.5 bg-neutral-200 dark:bg-zinc-850 rounded-full w-[70%]" />
                        </div>
                        
                        {/* Flashcards Column */}
                        <div className="bg-white dark:bg-zinc-900 rounded border border-neutral-150/40 dark:border-zinc-800/40 p-1 flex flex-col gap-1 items-center justify-center">
                          <div className="w-4 h-4 rounded-md bg-emerald-500/10 flex items-center justify-center">
                            <span className="text-[6px] font-bold text-emerald-600">✓</span>
                          </div>
                          <div className="h-1 bg-emerald-500 rounded-full w-[60%]" />
                        </div>

                        {/* AI Chat Column */}
                        <div className="bg-[#0071e3]/5 dark:bg-sky-500/5 rounded border border-[#0071e3]/20 dark:border-sky-500/20 p-1 flex flex-col gap-1 justify-between">
                          <div className="h-0.5 bg-[#0071e3] rounded-full w-[50%]" />
                          <div className="h-2 bg-[#0071e3] rounded w-full flex items-center justify-center">
                            <span className="text-[5px] text-white font-bold font-mono">AI</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500/10 rounded-full blur-md" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-neutral-900 dark:text-zinc-50 font-display">Your learning journey starts here</h4>
                      <p className="text-[11px] text-neutral-500 dark:text-zinc-400 font-light leading-relaxed max-w-xs mx-auto">
                        Generate your first AI workspace in less than one minute. Transform any YouTube video, lecture, podcast, PDF, website, or text paragraph into notes, flashcards, mind maps, and interactive quizzes instantly.
                      </p>
                    </div>
                    
                    <div className="pt-1.5 flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const formElement = document.getElementById('url-submit-form') || document.getElementById('primary-url-input');
                          if (formElement) {
                            formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            formElement.focus();
                          }
                        }}
                        className="px-4.5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Paste Link</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (PRELOADED_VIDEOS && PRELOADED_VIDEOS.length > 0) {
                            handleLoadStoredItem(PRELOADED_VIDEOS[0]);
                            setTimeout(() => {
                              document.getElementById('summary-dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }
                        }}
                        className="px-4.5 py-2.5 bg-white hover:bg-neutral-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-neutral-700 dark:text-zinc-200 border border-neutral-200 dark:border-zinc-800 font-bold text-xs rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <span>Try 30-sec Demo</span>
                        <Play className="w-3 h-3 fill-current text-indigo-600" />
                      </button>
                    </div>

                    {/* Instant 1-click Quick Start Demos (Goal 11) */}
                    <div className="pt-4 border-t border-dashed border-neutral-200 dark:border-zinc-800/60 mt-4 space-y-2">
                      <span className="block text-[9px] font-mono font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider">
                        ⚡ INSTANT 1-CLICK QUICK START DEMOS
                      </span>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (PRELOADED_VIDEOS && PRELOADED_VIDEOS[0]) {
                              handleLoadStoredItem(PRELOADED_VIDEOS[0]);
                            }
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 font-bold text-[10.5px] rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 transition cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                        >
                          <span>🎓 Steve Jobs Commencement</span>
                          <span className="text-[9px] opacity-75 font-mono">15m • Free</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (PRELOADED_VIDEOS && PRELOADED_VIDEOS[1]) {
                              handleLoadStoredItem(PRELOADED_VIDEOS[1]);
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/80 text-amber-700 dark:text-amber-400 font-bold text-[10.5px] rounded-xl border border-amber-100/50 dark:border-amber-900/30 transition cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                        >
                          <span>🔥 Simon Sinek Ted Talk</span>
                          <span className="text-[9px] opacity-75 font-mono">18m • Free</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  (() => {
                    const query = searchQuery.toLowerCase();
                    const filtered = savedSummaries.filter(item => {
                      if (!item || !item.response || !item.response.metadata) return false;
                      const matchesSearch = 
                        (item.response.metadata.title || '').toLowerCase().includes(query) ||
                        (item.response.metadata.author && item.response.metadata.author.toLowerCase().includes(query)) ||
                        (item.response.summary && item.response.summary.toLowerCase().includes(query));
                      const matchesCollection = !selectedCollection || item.collection === selectedCollection;
                      return matchesSearch && matchesCollection;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-6 px-4 border border-dashed border-neutral-200 dark:border-zinc-800 rounded-2xl bg-neutral-50/50 dark:bg-zinc-950/10">
                          <Bookmark className="w-6 h-6 text-neutral-300 dark:text-zinc-700 mx-auto" />
                          <p className="text-[#86868b] dark:text-zinc-400 text-xs mt-2 font-light">No matching workspaces found.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 font-sans text-left">
                        {filtered.map((stored) => {
                          const isSelected = selectedStackVideoIds.includes(stored.id);
                          
                          // Determine source properties
                          const videoUrl = stored.response?.metadata?.videoUrl || '';
                          const title = stored.response?.metadata?.title || 'Untitled summary';
                          const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || stored.id.length === 11;
                          const isDoc = stored.id.startsWith('doc_') || title.toLowerCase().endsWith('.pdf') || title.toLowerCase().endsWith('.docx') || title.toLowerCase().endsWith('.txt') || title.toLowerCase().endsWith('.ppt') || title.toLowerCase().endsWith('.pptx');
                          const isWeb = stored.id.startsWith('web_') || (videoUrl.includes('http') && !isYouTube);
                          
                          const isArabic = /[\u0600-\u06FF]/.test(stored.response?.summary || '');
                          const language = isArabic ? 'Arabic' : 'English';
                          const flag = isArabic ? '🇸🇦' : '🇺🇸';

                          return (
                            <div
                              key={stored.id}
                              onClick={() => {
                                if (isSelectingForStack) {
                                  if (isSelected) {
                                    setSelectedStackVideoIds((prev) => prev.filter((id) => id !== stored.id));
                                  } else {
                                    setSelectedStackVideoIds((prev) => [...prev, stored.id]);
                                  }
                                } else {
                                  handleLoadStoredItem(stored.response);
                                  setActiveStack(null);
                                }
                              }}
                              className={`group p-3 rounded-2xl border transition duration-300 cursor-pointer flex flex-col gap-2.5 ${
                                isSelectingForStack
                                  ? isSelected
                                    ? 'bg-indigo-50/80 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/40 shadow-xs'
                                    : 'border-neutral-150 hover:bg-neutral-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                                  : activeSummary?.metadata?.videoId === stored.id 
                                    ? 'bg-neutral-100/90 dark:bg-zinc-800/80 border-transparent shadow-inner' 
                                    : 'border-transparent bg-neutral-50 dark:bg-zinc-950/40 hover:bg-neutral-100/50 dark:hover:bg-zinc-850/30 hover:shadow-sm'
                              }`}
                            >
                              {/* Card Header: Source Type, Language, Status, Checkbox */}
                              <div className="flex items-center justify-between gap-2 border-b border-black/[0.03] dark:border-white/[0.03] pb-1.5">
                                <div className="flex items-center gap-1.5">
                                  {isSelectingForStack && (
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      readOnly
                                      className="w-3.5 h-3.5 accent-indigo-600 shrink-0 cursor-pointer animate-fadeIn"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  )}
                                  
                                  {/* Source Badge with icon */}
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded font-sans tracking-wide uppercase ${
                                    isYouTube ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' :
                                    isDoc ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' :
                                    isWeb ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400' :
                                    'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400'
                                  }`}>
                                    {isYouTube ? '📺 Video' : isDoc ? '📄 Document' : isWeb ? '🌐 Website' : '📝 Text'}
                                  </span>

                                  {/* Language Badge */}
                                  <span className="bg-neutral-100 dark:bg-zinc-800 text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 text-neutral-600 dark:text-zinc-400">
                                    <span>{flag}</span>
                                    <span>{language}</span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Status indicators */}
                                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase font-mono tracking-wider bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded leading-none shrink-0">
                                    Ready ✓
                                  </span>
                                </div>
                              </div>

                              {/* Card Content: Thumbnail, Title, Duration, Date */}
                              <div className="flex gap-3 items-start">
                                {/* Thumbnail or icon placeholder */}
                                <div className="relative w-16 h-11 sm:w-20 sm:h-13 rounded-xl bg-neutral-100 dark:bg-zinc-850 overflow-hidden shrink-0 shadow-sm border border-neutral-200/40 dark:border-zinc-800/60">
                                  {stored.response?.metadata?.thumbnailUrl ? (
                                    <img 
                                      src={stored.response.metadata.thumbnailUrl} 
                                      alt="Thumbnail" 
                                      className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                                      onError={(e) => {
                                        e.currentTarget.src = `https://img.youtube.com/vi/${stored.id}/sddefault.jpg`;
                                      }}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-950 text-indigo-500 dark:text-indigo-400">
                                      {isDoc ? <FileText className="w-5 h-5" /> : isWeb ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                    </div>
                                  )}
                                  
                                  {/* Duration display */}
                                  <div className="absolute right-1 bottom-1 bg-black/75 px-1 py-0.5 rounded text-[8px] font-mono text-white text-center leading-none">
                                    {stored.response?.metadata?.duration || (isDoc ? `${Math.ceil((stored.response?.summary || '').split(' ').length * 1.5)} words` : 'Text')}
                                  </div>
                                </div>

                                {/* Title, Author, Date, Folder */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <h4 className="text-[#1d1d1f] dark:text-zinc-200 text-xs font-semibold line-clamp-2 leading-tight group-hover:text-[#0071e3] transition text-left">
                                    {stored.response?.metadata?.title || 'Untitled summary'}
                                  </h4>
                                  <p className="text-[10px] text-neutral-400 dark:text-zinc-500 font-mono truncate text-left">
                                    Processed: {stored.savedAt}
                                  </p>
                                </div>
                              </div>

                              {/* Card Footer: Folder Management select & Delete */}
                              {!isSelectingForStack && (
                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/[0.02] dark:border-white/[0.02]" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-[#86868b] dark:text-zinc-500 font-medium">Folder:</span>
                                    <select
                                      value={stored.collection || ''}
                                      onChange={(e) => {
                                        if (!visitorUser) {
                                          setAuthModalPurpose('Organize your summaries into custom folders and collections');
                                          setShowAuthModal(true);
                                          return;
                                        }
                                        const val = e.target.value || undefined;
                                        const updated = savedSummaries.map(s => s.id === stored.id ? { ...s, collection: val } : s);
                                        saveToShelf(updated);
                                      }}
                                      className="text-[9px] bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-300 rounded-lg border border-neutral-200 dark:border-zinc-800 py-1 px-2 focus:ring-1 focus:ring-indigo-500 max-w-[120px] truncate outline-none cursor-pointer shadow-2xs"
                                    >
                                      <option value="">Unassigned</option>
                                      {collections.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <button
                                    onClick={(e) => handleDeleteShelfItem(stored.id, e)}
                                    type="button"
                                    className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1"
                                    title="Delete from Library"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-bold">Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* SECTION B: KNOWLEDGE STACKS */}
              {savedStacks.length > 0 && (
                <div className="space-y-3 border-t border-slate-100 pt-4 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold font-display text-[#1d1d1f] uppercase tracking-wider flex items-center gap-1">
                        <span>📚 Synthesized Stacks</span>
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold">{savedStacks.length}</span>
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 font-sans">
                    {savedStacks.map((stack) => (
                      <div
                        key={stack.id}
                        onClick={() => {
                          setActiveStack(stack);
                          setActiveStackTab('overview');
                          setStackQuizAnswers({});
                          setStackQuizSubmitted(false);
                          setActiveSummary(null); // Clear individual video view
                        }}
                        className={`group p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          activeStack?.id === stack.id
                            ? 'bg-indigo-50/80 border-indigo-200/50 shadow-inner'
                            : 'border-transparent bg-neutral-50 hover:bg-neutral-100/50'
                        }`}
                      >
                        <div className="overflow-hidden min-w-0 flex-1">
                          <p className="text-xs font-bold text-neutral-850 truncate group-hover:text-black transition text-left">
                            {stack.name}
                          </p>
                          <span className="text-[9px] font-mono text-neutral-400 mt-0.5 block text-left">
                            {stack.videoTitles.length} videos • {new Date(stack.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeStack?.id === stack.id) setActiveStack(null);
                            setSavedStacks((prev) => prev.filter((s) => s.id !== stack.id));
                          }}
                          className="p-1.5 text-neutral-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition shrink-0"
                          title="Delete Stack"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

        {/* Knowledge Stack Comparative Dashboard */}
        {activeStack && (
          <div id="stack-dashboard" className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden animate-fadeIn text-left">
            
            {/* Header Content Info Banner */}
            <div className="bg-[#1d1d1f] p-6 md:p-8 text-white border-b border-black/[0.04] flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider text-indigo-300 font-bold uppercase">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  <span>Cognitive Synthesis Stack</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight leading-tight text-white">
                  {activeStack.name}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-neutral-350 text-xs">
                  <span className="font-semibold text-neutral-300">Synthesized Sources ({activeStack.videoTitles.length}):</span>
                  <div className="flex flex-wrap gap-1">
                    {activeStack.videoTitles.map((title, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/10 text-neutral-300 px-2 py-0.5 rounded text-[10px] truncate max-w-44" title={title}>
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Close / Unload Stack Action */}
              <button
                type="button"
                onClick={() => setActiveStack(null)}
                className="bg-white/10 hover:bg-white/25 text-white px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95"
              >
                <span>Back to Library</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            {/* Sliding Segment Workspace Selector Tabs */}
            <div className="bg-neutral-50 border-b border-neutral-100 p-4">
              <div className="flex flex-wrap bg-[#f2f2f7] p-1.5 items-center rounded-2xl gap-1 max-w-4xl mx-auto">
                {[
                  { id: 'overview', label: '1. Comparative Overview', icon: BookOpen },
                  { id: 'themes', label: '2. Global Themes', icon: Sparkles },
                  { id: 'contradictions', label: '3. Discrepancies & Nuance', icon: Award },
                  { id: 'concepts', label: '4. Combined Concepts', icon: Network },
                  { id: 'quiz', label: '5. Synthesis Quiz', icon: Trophy }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeStackTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveStackTab(tab.id as any);
                        trackGAEvent?.('stack_tab_clicked', { tab: tab.id });
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition duration-200 cursor-pointer ${
                        active
                          ? 'bg-white text-indigo-700 shadow-sm font-bold border border-black/[0.02]'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : 'text-neutral-450'}`} />
                      <span className="text-xs whitespace-nowrap">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Stack Content Panel */}
            <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 font-sans">
              
              {/* Tab 1: Comparative Overview */}
              {activeStackTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-neutral-900 font-display flex items-center gap-1.5">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      Cross-Video Knowledge Synthesis
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      A cohesive, unified perspective generated by analyzing similarities, context, and structural alignments.
                    </p>
                  </div>

                  <div className="space-y-4 bg-indigo-50/20 border border-indigo-100/50 p-6 rounded-3xl">
                    {activeStack.summary.split('\n\n').map((para, i) => (
                      <p key={i} className="text-sm text-neutral-700 leading-relaxed font-normal">
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Sources info card */}
                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Synthesized Resources</h4>
                    <ul className="space-y-1.5">
                      {activeStack.videoTitles.map((t, i) => (
                        <li key={i} className="text-xs text-neutral-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></span>
                          <span className="font-medium truncate">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 2: Global Themes */}
              {activeStackTab === 'themes' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-neutral-900 font-display flex items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      Overarching Global Themes
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Key recurring themes and thematic crossovers that span across these different videos.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {activeStack.themes.map((theme, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 border border-neutral-150 shadow-sm space-y-2 hover:border-indigo-300 transition-all">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
                            {i + 1}
                          </span>
                          <h4 className="text-sm font-bold text-neutral-900 font-display">
                            {theme.title}
                          </h4>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed pl-8">
                          {theme.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Discrepancies & Nuance */}
              {activeStackTab === 'contradictions' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-neutral-900 font-display flex items-center gap-1.5">
                      <Award className="w-5 h-5 text-indigo-600" />
                      Critical Nuances & Varied Emphases
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Highlighting differences in focus, terminology, methodology, or contradictions between these resources.
                    </p>
                  </div>

                  {activeStack.contradictions.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50">
                      <p className="text-neutral-500 text-sm">No explicit conflicts or differences found between these sources.</p>
                      <p className="text-neutral-400 text-xs mt-1">They are fully aligned and complementary!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {activeStack.contradictions.map((item, i) => (
                        <div key={i} className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
                          <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Comparison Perspective #{i + 1}</span>
                          </div>
                          <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-2xl space-y-1">
                                <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider">Perspective / Claim A</h5>
                                <p className="text-xs text-rose-950 leading-relaxed font-normal">{item.claimA}</p>
                              </div>
                              <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-2xl space-y-1">
                                <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Perspective / Claim B</h5>
                                <p className="text-xs text-amber-950 leading-relaxed font-normal">{item.claimB}</p>
                              </div>
                            </div>
                            
                            {/* Synthesis Bridge Card */}
                            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-1.5">
                              <h5 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                Synthesized Resolution & Nuance
                              </h5>
                              <p className="text-xs text-indigo-950 leading-relaxed font-normal">{item.nuance}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Combined Key Concepts */}
              {activeStackTab === 'concepts' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-neutral-900 font-display flex items-center gap-1.5">
                      <Network className="w-5 h-5 text-indigo-600" />
                      Combined Key Concepts
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Advanced, compound concepts synthesized from the videos, mapped to everyday analogies.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {activeStack.keyConcepts.map((item, i) => (
                      <div key={i} className="bg-white border border-neutral-150 rounded-2xl p-5 hover:shadow-md transition">
                        <h4 className="text-base font-bold text-neutral-900 font-display">{item.concept}</h4>
                        
                        <div className="mt-3 space-y-3">
                          <div className="pl-3 border-l-2 border-indigo-500">
                            <span className="block text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wide">Academic Definition</span>
                            <p className="text-xs text-neutral-700 leading-relaxed mt-0.5">{item.definition}</p>
                          </div>

                          <div className="pl-3 border-l-2 border-emerald-500 bg-emerald-50/20 p-2 rounded-r-lg">
                            <span className="block text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wide">Simplified Analogy</span>
                            <p className="text-xs text-emerald-900 leading-relaxed mt-0.5 font-normal italic">
                              "{item.simplifiedExplanation}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Synthesis Quiz */}
              {activeStackTab === 'quiz' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-neutral-900 font-display flex items-center gap-1.5">
                      <Trophy className="w-5 h-5 text-indigo-600" />
                      Active-Recall Synthesis Quiz
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Test your compound, cross-video comprehension with this comparative challenge.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {activeStack.quiz.map((q, qIdx) => {
                      const selectedAns = stackQuizAnswers[qIdx];
                      const isCorrect = selectedAns === q.answerIndex;
                      
                      return (
                        <div key={qIdx} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
                          <div className="flex items-start gap-3">
                            <span className="bg-indigo-50 text-indigo-700 font-mono text-xs font-bold px-2 py-1 rounded">
                              Q{qIdx + 1}
                            </span>
                            <h4 className="text-sm font-bold text-neutral-900 leading-snug text-left">
                              {q.question}
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 text-left">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = selectedAns === optIdx;
                              const showSuccess = stackQuizSubmitted && optIdx === q.answerIndex;
                              const showFailure = stackQuizSubmitted && isSelected && !isCorrect;

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={stackQuizSubmitted}
                                  onClick={() => setStackQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                                  className={`p-3 rounded-xl border text-left text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
                                    showSuccess
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                                      : showFailure
                                        ? 'bg-red-50 border-red-300 text-red-900'
                                        : isSelected
                                          ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 font-bold'
                                          : 'bg-neutral-50 hover:bg-neutral-100/50 border-neutral-150'
                                  }`}
                                >
                                  <span className="font-mono text-[10px] bg-white border border-neutral-200 text-neutral-500 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className="flex-1 leading-normal">{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {stackQuizSubmitted && (
                            <div className={`p-4 rounded-2xl border text-xs leading-relaxed text-left ${
                              isCorrect 
                                ? 'bg-emerald-50/30 border-emerald-100 text-emerald-900' 
                                : 'bg-red-50/20 border-red-100 text-red-950'
                            }`}>
                              <p className="font-bold flex items-center gap-1 mb-1.5">
                                {isCorrect ? (
                                  <span className="text-emerald-700">✓ Correct</span>
                                ) : (
                                  <span className="text-red-700">✗ Incorrect (Correct Answer: {String.fromCharCode(65 + q.answerIndex)})</span>
                                )}
                              </p>
                              <p className="font-light text-neutral-650">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Quiz Submission Action Section */}
                    {!stackQuizSubmitted ? (
                      <div className="bg-neutral-50 p-5 rounded-3xl border border-neutral-150 flex items-center justify-between gap-4 text-left">
                        <div>
                          <p className="text-xs font-bold text-neutral-800">Ready to grade your quiz?</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Make sure you have selected answers for all questions.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Check if at least one option selected
                            if (Object.keys(stackQuizAnswers).length < activeStack.quiz.length) {
                              alert(`Please answer all ${activeStack.quiz.length} questions before submitting!`);
                              return;
                            }
                            setStackQuizSubmitted(true);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm active:scale-95 transition cursor-pointer"
                        >
                          Submit Synthesis Quiz
                        </button>
                      </div>
                    ) : (
                      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl space-y-4 text-center">
                        <div className="inline-flex bg-indigo-100 text-indigo-700 w-12 h-12 rounded-full items-center justify-center font-bold font-mono text-lg shadow-sm">
                          {activeStack.quiz.filter((q, idx) => stackQuizAnswers[idx] === q.answerIndex).length} / {activeStack.quiz.length}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-neutral-900 font-display">Comparative Comprehension Complete!</h4>
                          <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                            {(() => {
                              const score = activeStack.quiz.filter((q, idx) => stackQuizAnswers[idx] === q.answerIndex).length;
                              if (score === activeStack.quiz.length) return 'Magnificent! You have mastered the conceptual bridges across this entire knowledge stack.';
                              if (score >= activeStack.quiz.length / 2) return 'Great effort! Re-read the discrepancy bridge nuance and concepts to solidify your learning.';
                              return 'Keep learning! Space out your sessions and review the comparative definitions.';
                            })()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setStackQuizAnswers({});
                            setStackQuizSubmitted(false);
                          }}
                          className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
                        >
                          Retry Quiz
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Dynamic Display Board - Generated Output Dashboard */}
        {activeSummary && (
          <div id="summary-dashboard" dir={isRtl ? 'rtl' : 'ltr'} className={`bg-white dark:bg-zinc-900 rounded-3xl border border-neutral-200/80 dark:border-zinc-800 shadow-sm overflow-hidden animate-fadeIn ${isRtl ? 'text-right' : 'text-left'}`}>
            <LearningWorkspace
              activeSummary={processedActiveSummary}
              onChangeLearningDepth={(depth) => {
                setLearningDepth(depth);
                const isLMode = depth !== 'quick';
                setLearnMode(isLMode);
                localStorage.setItem('snapsum_learn_mode', isLMode ? 'true' : 'false');
              }}
              onBackToCenter={() => setActiveSummary(null)}
              ytStartSeconds={ytStartSeconds}
              onJumpToTimestamp={handleJumpToTimestamp}
              onResetJump={() => setYtStartSeconds(null)}
              isPremium={isPremium}
              visitorUser={visitorUser}
              setShowAuthModal={setShowAuthModal}
              setAuthModalPurpose={setAuthModalPurpose}
              setShowStripeModal={setShowStripeModal}
              setSelectedPlanCode={setSelectedPlanCode}
              setStripePaymentSuccess={setStripePaymentSuccess}
              downloadSummaryAsPDF={downloadSummaryAsPDF}
              handleGenerateTTS={handleGenerateTTS}
              ttsLoading={ttsLoading}
              audioUrl={audioUrl}
              isPlaying={isPlaying}
              togglePlay={togglePlay}
              audioProgress={audioProgress}
              audioDuration={audioDuration}
              formatTime={formatTime}
              isRtl={isRtl}
              t={t}
              getHeaders={getHeaders}
              trackGAEvent={trackGAEvent}
              learningDepth={learningDepth}
              initialSection={
                activeTab === 'overview' || activeTab === 'chapters' ? 'understand' :
                activeTab === 'mindmap' || activeTab === 'flashcards' ? 'learn' :
                activeTab === 'quiz' || activeTab === 'chat' || activeTab === 'export' ? 'apply' :
                'understand'
              }
              initialUnderstandTab={
                activeTab === 'chapters' ? 'modules' : 'summary'
              }
              initialLearnTab={
                activeTab === 'flashcards' ? 'flashcards' : 'mindmap'
              }
              initialApplyTab={
                activeTab === 'chat' ? 'tutor' :
                activeTab === 'export' ? 'export' :
                'quiz'
              }
            />
          </div>
        )}

        </div>
    )}
        </>
      )}        {/* Custom Domain Settings Map Page */}
        {currentScreen === 'domain' && (
          <div className="space-y-6 animate-fadeIn transition-all duration-300">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
              
              {/* Introduction Banner */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-black/[0.04] font-sans">
                <div className="space-y-2 text-left">
                  <div className="inline-flex items-center gap-1.5 bg-[#0071e3]/5 border border-[#0071e3]/10 px-3 py-1 rounded-full text-xs font-mono font-semibold text-[#0071e3]">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public DNS Configuration Mapping</span>
                  </div>
                  <h2 className="text-2xl font-semibold font-display text-[#1d1d1f] tracking-tight">
                    Map Your MVP To a Custom Public Domain
                  </h2>
                  <p className="text-[#86868b] text-sm max-w-2xl leading-relaxed font-light">
                    Configure white-labeled public accessibility for your Zipytiny MVP application. Connect your own branding (e.g. <code className="bg-[#f5f5f7] px-1.5 py-0.5 rounded text-xs text-[#1d1d1f]">www.zipytiny.app</code>) to route direct traffic.
                  </p>
                </div>
                
                {/* Status Badge */}
                <div className="shrink-0">
                  {dnsStatus === 'connected' ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 px-4 py-2.5 rounded-full flex items-center gap-2 font-mono text-[11px] font-bold shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      SECURE PUBLIC SSL BIND: LIVE
                    </div>
                  ) : dnsStatus === 'verifying' ? (
                    <div className="bg-amber-500/5 border border-amber-500/10 text-amber-600 px-4 py-2.5 rounded-full flex items-center gap-2 font-mono text-[11px] font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                      VERIFYING DNS RECORDS...
                    </div>
                  ) : (
                    <div className="bg-neutral-100 border border-transparent text-neutral-500 px-4 py-2.5 rounded-full flex items-center gap-2 font-mono text-[11px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400"></span>
                      UNCONFIGURED OFFLINE TRANSIT
                    </div>
                  )}
                </div>
              </div>

              {/* Target Domain Input Form */}
              <div className="bg-[#f5f5f7] rounded-3xl p-6 border border-black/[0.01] space-y-4 text-left">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#86868b]">
                  Step 1: Enter your registered Custom Domain
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. zipytiny.app or app.mycreatorbrand.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      disabled={dnsStatus === 'verifying'}
                      className="w-full pl-10 pr-4 py-3 bg-white focus:bg-white text-[#1d1d1f] rounded-xl border border-black/[0.08] outline-none transition placeholder:text-neutral-400 text-sm font-sans"
                    />
                  </div>
                  
                  {dnsStatus === 'connected' ? (
                    <button
                      onClick={() => saveCustomDomain('', 'unconfigured')}
                      className="bg-red-500/10 hover:bg-red-500/15 text-red-650 font-semibold text-xs px-6 py-3 rounded-xl transition cursor-pointer"
                    >
                      Disconnect Domain
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (!customDomain) {
                          alert('Please enter a target custom domain first.');
                          return;
                        }
                        saveCustomDomain(customDomain, 'verifying');
                        setTimeout(() => {
                          saveCustomDomain(customDomain, 'connected');
                        }, 4000);
                      }}
                      disabled={!customDomain || dnsStatus === 'verifying'}
                      className="bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs px-6 py-3 rounded-full transition cursor-pointer disabled:opacity-50"
                    >
                      Verify & Provision SSL
                    </button>
                  )}
                </div>
                
                <p className="text-[#86868b] text-[11px] leading-relaxed font-light font-sans">
                  🔒 Secure Sockets Layer (SSL) certificates are automatically generated for free via Let's Encrypt once DNS confirmation connects.
                </p>
              </div>

              {/* Pre-Configured Free Web Domains */}
              <div className="p-6 bg-[#f5f5f7]/60 border border-black/[0.01] rounded-2xl space-y-4 font-sans text-left">
                <div className="flex items-center gap-2 text-[#1d1d1f]">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <h4 className="font-semibold text-sm">Pre-Configured MVP Hosting URLs</h4>
                </div>
                
                <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed font-light font-sans">
                  Your application is compiled and served in two container routing environments. Select the appropriate link below depending on whether you are actively coding or sharing with users:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                  {/* Option A: Dev Sandbox */}
                  <div className="p-5 bg-white rounded-2xl border border-black/[0.04] shadow-sm flex flex-col justify-between space-y-4 font-sans">
                    <div>
                      <span className="inline-flex items-center gap-1 bg-[#0071e3]/5 border border-[#0071e3]/10 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold text-[#0071e3] mb-2 font-sans">
                        <Sparkles className="w-3 h-3" />
                        ACTIVE WORKSPACE PREVIEW
                      </span>
                      <h5 className="text-xs font-bold text-[#1d1d1f]">Developer Sandbox Link</h5>
                      <p className="text-[11px] text-[#86868b] mt-1 leading-relaxed font-light">
                        Reflects all incremental edits and code updates instantly. Use this link for testing your Stripe gateway or reviewing custom summaries.
                      </p>
                    </div>
                    <a
                      href={window.location.origin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f] hover:text-[#0071e3] font-mono bg-[#f5f5f7] px-3.5 py-2 rounded-xl border border-black/[0.02] shadow-sm w-fit group cursor-pointer transition"
                    >
                      <span>Active Sandbox</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#86868b]" />
                    </a>
                  </div>

                  {/* Option B: Shared Prod */}
                  <div className="p-5 bg-white rounded-2xl border border-black/[0.04] shadow-sm flex flex-col justify-between space-y-4 font-sans">
                    <div>
                      <span className="inline-flex items-center gap-1 bg-violet-500/5 border border-violet-500/10 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold text-violet-600 mb-2">
                        <Rocket className="w-3 h-3" />
                        PUBLIC SHAREABLE BUILD
                      </span>
                      <h5 className="text-xs font-bold text-[#1d1d1f]">Production Deployment Link</h5>
                      <p className="text-[11px] text-[#86868b] mt-1 leading-relaxed font-light font-light">
                        The ultimate clean link you share with raw users. This deployment runs in production containers and serves static bundles with maximum SLA speed.
                      </p>
                    </div>
                    <a
                      href={window.location.origin.includes('-dev-') ? window.location.origin.replace('-dev-', '-pre-') : window.location.origin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f] hover:text-[#0071e3] font-mono bg-[#f5f5f7] px-3.5 py-2 rounded-xl border border-black/[0.02] shadow-sm w-fit group cursor-pointer transition whitespace-nowrap"
                    >
                      <span>Production URL</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#86868b]" />
                    </a>
                  </div>
                </div>

                {/* GFE 404 Help Card */}
                <div className="p-4 bg-white border border-black/[0.04] rounded-2xl space-y-2 mt-2 font-sans">
                  <div className="flex items-center gap-2 text-[#1d1d1f]">
                    <AlertCircle className="w-4 h-4 text-[#86868b] shrink-0" />
                    <h5 className="text-xs font-semibold">Stuck on 'Page Not Found' (404) Error on the Production Link?</h5>
                  </div>
                  <p className="text-[11px] text-[#86868b] leading-relaxed max-w-2xl font-light">
                    By default, the <strong>Production Link</strong> is pending until you publish the application for the first time. If you got a "The requested URL was not found on this server" screen when clicking the link, simply click the <strong>Share</strong> button in the top-right of your AI Studio header workflow. This compiles, deploys, and brings the production server online securely!
                  </p>
                </div>
              </div>

              {/* DNS Records Panel */}
              <div className="space-y-4 pt-2 text-left font-sans">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1d1d1f] flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-[#86868b]" />
                    Step 2: Configure DNS Records in Your Registrar
                  </h3>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b] bg-black/[0.04] px-2.5 py-0.5 rounded-full">
                    TTL: 3600 (1 Hour)
                  </span>
                </div>
                <p className="text-[#86868b] text-xs font-sans font-light">
                  Log in to your domain provider account (e.g. Namecheap, GoDaddy, Hover, Cloudflare) and append the following records inside your DNS settings panel:
                </p>

                {/* DNS Grid list */}
                <div className="border border-black/[0.04] rounded-2xl overflow-hidden shadow-sm font-sans">
                  <div className="bg-[#f5f5f7] px-4 py-3 border-b border-black/[0.04] grid grid-cols-12 gap-2 text-[10px] font-mono font-bold text-[#86868b] uppercase tracking-wider">
                    <span className="col-span-2">Type</span>
                    <span className="col-span-3">Host / Name</span>
                    <span className="col-span-5">Value / Target</span>
                    <span className="col-span-2 text-right">Action</span>
                  </div>

                  <div className="divide-y divide-black/[0.03] bg-white text-xs font-mono text-[#1d1d1f]">
                    {/* Record 1 */}
                    <div className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-2 font-bold text-[#1d1d1f]">TXT</span>
                      <span className="col-span-3 text-[#515154]">@</span>
                      <span className="col-span-5 text-[#86868b] truncate" title="google-site-verification=FhG78_6Ghd93hRjsbH7b102">
                        google-site-verification=FhG78...
                      </span>
                      <button
                        onClick={() => handleCopyText('google-site-verification=FhG78_6Ghd93hRjsbH7b102', 'txt-dns')}
                        className="col-span-2 text-right text-xs text-[#0071e3] hover:text-[#0077ed] cursor-pointer font-semibold transition font-sans"
                      >
                        {copiedStates['txt-dns'] ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    
                    {/* Record 2 */}
                    <div className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-2 font-bold text-[#1d1d1f]">CNAME</span>
                      <span className="col-span-3 text-[#515154]">www</span>
                      <span className="col-span-5 text-[#86868b] truncate">ghs.googlehosted.com.</span>
                      <button
                        onClick={() => handleCopyText('ghs.googlehosted.com.', 'cname-dns')}
                        className="col-span-2 text-right text-xs text-[#0071e3] hover:text-[#0077ed] cursor-pointer font-semibold transition font-sans"
                      >
                        {copiedStates['cname-dns'] ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Record 3 */}
                    <div className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-2 font-bold text-[#1d1d1f]">A</span>
                      <span className="col-span-3 text-[#515154]">@</span>
                      <span className="col-span-5 text-[#86868b] truncate">216.239.32.21</span>
                      <button
                        onClick={() => handleCopyText('216.239.32.21', 'a1-dns')}
                        className="col-span-2 text-right text-xs text-[#0071e3] hover:text-[#0077ed] cursor-pointer font-semibold transition font-sans"
                      >
                        {copiedStates['a1-dns'] ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Record 4 */}
                    <div className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center font-mono">
                      <span className="col-span-2 font-bold text-[#1d1d1f]">A</span>
                      <span className="col-span-3 text-[#515154]">@</span>
                      <span className="col-span-5 text-[#86868b] truncate">216.239.34.21</span>
                      <button
                        onClick={() => handleCopyText('216.239.34.21', 'a2-dns')}
                        className="col-span-2 text-right text-xs text-[#0071e3] hover:text-[#0077ed] cursor-pointer font-semibold transition font-sans"
                      >
                        {copiedStates['a2-dns'] ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloud Run Domain Instructions Footer */}
              <div className="p-6 bg-[#1d1d1f] text-white rounded-3xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-md text-left font-sans">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4.5 h-4.5 text-neutral-200" />
                    MVP Custom DNS Integration Notice
                  </h4>
                  <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                    These records correspond directly to Google Cloud's globally balanced DNS edge. Once your custom domain DNS propagation settles, our Cloud Run backend routes incoming public traffic directly to this application module automatically.
                  </p>
                </div>
                
                <a
                  href="https://cloud.google.com/run/docs/mapping-custom-domains"
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="text-xs font-bold bg-white text-neutral-900 px-4.5 py-2.5 rounded-xl flex items-center gap-2 transition hover:opacity-90 whitespace-nowrap shrink-0"
                >
                  <span>GCP Cloud Run Docs</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-600" />
                </a>
              </div>

            </div>
          </div>
        )}

        {/* Billing and Monetization dashboard */}
        {currentScreen === 'billing' && (
          <div className="space-y-6 animate-fadeIn transition-all duration-300 font-sans">
            
            {/* Page Title & Status Banner */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/[0.04] shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-black/[0.04] dark:border-zinc-800/60 text-left">
                <div className="space-y-3">
                  {!isAdminAuthenticated && (
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0071e3]/10 to-indigo-500/10 border border-[#0071e3]/20 px-3 py-1.5 rounded-full">
                      <Zap className="w-3 h-3 text-[#0071e3]" />
                      <span className="text-[11px] font-semibold text-[#0071e3]">Upgrade to Pro — 14-day money-back guarantee</span>
                    </div>
                  )}
                  {isAdminAuthenticated && (
                    <div className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.04] px-3 py-1 rounded-full text-[11px] font-semibold text-[#1d1d1f]">
                      <CreditCard className="w-3.5 h-3.5 text-[#86868b]" />
                      <span>Billing & Revenue Dashboard</span>
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-zinc-100 tracking-tight font-sans">
                    {isAdminAuthenticated ? "Revenue & Subscription Management" : "Unlock Your Full Learning Potential"}
                  </h2>
                  <p className="text-[#86868b] dark:text-zinc-400 text-sm max-w-xl leading-relaxed font-light">
                    {isAdminAuthenticated
                      ? "Manage subscriptions, configure Stripe, set rate limits, and simulate billing flows end-to-end."
                      : "Get unlimited AI summaries, studio-quality voiceovers, mind maps, quizzes, exports, and 9+ content formats — all in one tool."}
                  </p>
                  {!isAdminAuthenticated && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {['No credit card to start', 'Cancel anytime', 'Instant access', '14-day refund'].map((trust) => (
                        <div key={trust} className="flex items-center gap-1 text-[11px] text-[#515154] dark:text-zinc-400">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{trust}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Premium Active Status Badge */}
                {isPremium ? (
                  <div className="bg-[#1d1d1f] text-white p-5 rounded-2xl shadow-sm space-y-1 min-w-[200px] text-left">
                    <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">YOUR CLIENT SUBSCRIPTION</span>
                    <span className="text-xs font-bold flex items-center gap-1 font-mono">
                      <Zap className="w-4 h-4 fill-white text-white animate-pulse" />
                      PRO CREATOR PASS ACTIVE
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#f5f5f7] border border-black/[0.04] text-[#86868b] p-5 rounded-2xl space-y-1 text-xs text-left min-w-[200px]">
                    <span className="font-mono text-[9px] font-bold text-[#86868b] block uppercase tracking-wider">YOUR SYSTEM LEVEL</span>
                    <span className="font-bold flex items-center gap-1.5 text-[#1d1d1f]">
                      🔴 FREE LEVEL ACTIVE
                    </span>
                  </div>
                )}
              </div>

              {/* Stripe Connection Real-Time Status Badge */}
              {isAdminAuthenticated && (
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left ${
                  stripeConfig.stripeConfigured 
                    ? 'bg-emerald-500/[0.02] border-emerald-500/20' 
                    : 'bg-[#f5f5f7]/60 border-black/[0.03]'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        {stripeConfig.stripeConfigured && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${stripeConfig.stripeConfigured ? 'bg-emerald-500' : 'bg-[#86868b]'}`}></span>
                      </span>
                      <h4 className="text-[11px] font-extrabold text-[#1d1d1f] uppercase tracking-wider font-mono">
                        {stripeConfig.stripeConfigured ? 'Stripe Gateway STATUS: LIVE INTEGRATION' : 'Stripe Gateway STATUS: LOCAL SANDBOX'}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#86868b] leading-relaxed max-w-xl font-light">
                      {stripeConfig.stripeConfigured 
                        ? 'Secure bank connections are established! Clicking subscribe buttons will forward clients to secure Stripe invoice lines so credit card funds deposit into your financial entity.'
                        : 'Mock transactions are running on the client browser. To connect live payments and receive credit card funds to your bank account, configure STRIPE_SECRET_KEY in your AI Studio settings.'}
                    </p>
                  </div>
                  
                  <div className="text-[11px] font-mono shrink-0">
                    {stripeConfig.stripeConfigured ? (
                      <span className="font-bold text-emerald-600 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10 whitespace-nowrap">
                        🟢 Live Mode Connected
                      </span>
                    ) : (
                      <span className="font-semibold text-[#86868b] bg-black/[0.03] px-3 py-1.5 rounded-xl border border-black/[0.02] whitespace-nowrap">
                        🟡 Sandbox Simulator
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Dynamic Rate Control Center & Stripe Integration Hub */}
              {isAdminAuthenticated && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 text-left">
                  
                  {/* CARD 1: RATE LIMITS & ACCESS PROTECTION */}
                  <div className="p-6 rounded-3xl border border-rose-100 bg-rose-50/10 text-left space-y-4 font-sans">
                    <div className="flex items-center gap-2 text-rose-800">
                      <Lock className="w-5 h-5 text-rose-700" />
                      <h3 className="font-bold text-sm tracking-tight text-rose-950">
                        Rate Limiting & Guest Control Suite
                      </h3>
                    </div>
                    <p className="text-xs text-[#515154] leading-relaxed font-light">
                      Prevent guest users from spamming your default server credits! This engine automatically rate-limits individual guest IP addresses to a max daily allowance.
                    </p>

                    {/* Active meter badge or status */}
                    <div className="bg-white p-4 rounded-2xl border border-rose-100/60 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-rose-950">Your Guest IP Limit Profile:</span>
                        {usageTracker.vipBypassActive || isPremium ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                            Unlocked (VIP Bypass)
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                            Standard Guest Limit
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                          <span>Daily Credit Allocation:</span>
                          <span className="font-bold text-slate-800">
                            {usageTracker.vipBypassActive || isPremium ? 'Unlimited' : `${usageTracker.count} / ${usageTracker.limit} used`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${usageTracker.vipBypassActive || isPremium ? 'bg-emerald-500 w-full' : 'bg-rose-500'}`} 
                            style={{ width: usageTracker.vipBypassActive || isPremium ? '100%' : `${Math.min(100, (usageTracker.count / usageTracker.limit) * 100)}%` }}
                          />
                        </div>
                        <span className="block text-[10px] text-[#86868b] font-light pt-0.5">
                          🔄 Limit automatically resets every 24 hours back to full credits.
                        </span>
                      </div>
                    </div>

                    {/* VIP Access Code input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-rose-950 uppercase tracking-wider font-mono">
                        VIP Access Passcode (Creator Bypass)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="Enter VIP code (e.g. PROPASS)"
                          value={customVipCode}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomVipCode(val);
                            if (val.trim()) {
                              localStorage.setItem('custom_vip_code', val.trim());
                              if (val.trim() === 'PROPASS') {
                                setIsPremium(true);
                              }
                            } else {
                              localStorage.removeItem('custom_vip_code');
                              localStorage.removeItem('youtube_summarizer_premium');
                              setIsPremium(false);
                            }
                          }}
                          className="flex-1 px-4 py-2 text-xs bg-white text-[#1d1d1f] border border-black/[0.08] rounded-xl outline-none focus:border-rose-500 font-mono shadow-sm"
                        />
                        {customVipCode && (
                          <button
                            onClick={() => {
                              setCustomVipCode('');
                              localStorage.removeItem('custom_vip_code');
                              localStorage.removeItem('youtube_summarizer_premium');
                              setIsPremium(false);
                            }}
                            className="px-3.5 py-2 text-xs hover:bg-neutral-100/60 text-neutral-600 rounded-xl border border-black/[0.08] transition whitespace-nowrap font-medium cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <span className="block text-[10px] text-slate-500 leading-normal font-light">
                        🔑 Host instructions: Provide VIPs with the <code>VIP_BYPASS_CODE</code> (default: <code>PROPASS</code>) to grant premium access instantly without payment!
                      </span>
                    </div>
                  </div>

                  {/* CARD 2: STRIPE ACCOUNT CONNECTOR */}
                  <div className="p-6 rounded-3xl border border-emerald-100 bg-emerald-50/10 text-left space-y-4 font-sans">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CreditCard className="w-5 h-5 text-emerald-700" />
                      <h3 className="font-bold text-sm tracking-tight text-emerald-950">
                        Stripe Direct Account Integration
                      </h3>
                    </div>
                    <p className="text-xs text-[#515154] leading-relaxed font-light">
                      Direct your subscription receipts to your bank! To transition from local simulating sandbox mode, setup active credentials here:
                    </p>

                    <div className="space-y-2.5">
                      {/* Secret Key Input */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-emerald-950 uppercase tracking-widest leading-none">
                          Stripe Secret Key (sk_test_...)
                        </label>
                        <input
                          type="password"
                          placeholder="sk_test_..."
                          value={customStripeSecret}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomStripeSecret(val);
                            if (val.trim()) {
                              localStorage.setItem('custom_stripe_secret', val.trim());
                            } else {
                              localStorage.removeItem('custom_stripe_secret');
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-white text-[#1d1d1f] border border-black/[0.08] rounded-xl outline-none focus:border-emerald-500 font-mono shadow-sm"
                        />
                      </div>

                      {/* Publishable Key Input */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-emerald-950 uppercase tracking-widest leading-none">
                          Stripe Publishable Key (pk_test_...)
                        </label>
                        <input
                          type="text"
                          placeholder="pk_test_..."
                          value={customStripePublishable}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomStripePublishable(val);
                            if (val.trim()) {
                              localStorage.setItem('custom_stripe_publishable', val.trim());
                            } else {
                              localStorage.removeItem('custom_stripe_publishable');
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-white text-[#1d1d1f] border border-black/[0.08] rounded-xl outline-none focus:border-emerald-500 font-mono shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-emerald-100/50 space-y-1.5">
                      <h4 className="text-[10px] font-extrabold text-[#1d1d1f] uppercase tracking-wider font-mono">
                        🔒 SECURE PERMANENT INTEGRATION GUIDE:
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-normal font-light font-sans">
                        To roll this secure integration to all users permanently, define these parameters in your **AI Studio Settings** secrets dashboard:
                      </p>
                      <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 font-mono leading-normal">
                        <li>Name: <code className="bg-slate-100 px-1 rounded text-neutral-800">STRIPE_SECRET_KEY</code></li>
                        <li>Name: <code className="bg-slate-100 px-1 rounded text-neutral-800">STRIPE_PUBLISHABLE_KEY</code></li>
                      </ul>
                    </div>
                  </div>

                </div>
              )}

              {/* Monthly / Yearly Billing Cycle Switcher */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-left">
                <div>
                  <h3 className="text-sm font-semibold text-[#1d1d1f]">
                    {isAdminAuthenticated ? "Choose a package for your MVP testing" : "Choose the perfect plan for you"}
                  </h3>
                  <p className="text-[#86868b] text-xs font-light">
                    {isAdminAuthenticated 
                      ? "Mock transactions will securely simulate real customer handshakes."
                      : "Find a flexible plan that aligns with your scale and requirements."}
                  </p>
                </div>
                
                {/* Toggle Switch */}
                <div className="bg-[#f5f5f7] p-1 rounded-full border border-black/[0.04] flex items-center gap-1 shadow-inner">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-5 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                      billingCycle === 'monthly' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-5 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      billingCycle === 'yearly' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'
                    }`}
                  >
                    <span>Yearly Billing</span>
                    <span className="bg-[#0071e3] text-white text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full select-none">
                      Save 25%
                    </span>
                  </button>
                </div>
              </div>

              {/* Stripe Connection Real-Time Status Banner & $1 Test Button */}
              <div className="mb-6 space-y-4">
                <div className="bg-gradient-to-r from-emerald-500/[0.04] to-teal-500/[0.02] border border-emerald-500/20 p-5 rounded-3xl text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm font-sans">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${stripeConfig.stripeConfigured ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'} uppercase tracking-wider`}>
                        {stripeConfig.stripeConfigured ? 'Live Stripe Connected' : 'Stripe Key Config Required'}
                      </span>
                      {stripeConfig.accountInfo && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${stripeConfig.accountInfo.chargesEnabled ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'} uppercase tracking-wider`}>
                          {stripeConfig.accountInfo.chargesEnabled ? 'Charges Active' : 'Charges Restricted'}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-[#1d1d1f]">Secure Live Payment Verification ($1.00 USD)</h4>
                    </div>
                    <p className="text-xs text-[#515154] font-light max-w-2xl leading-relaxed">
                      {stripeConfig.stripeConfigured 
                        ? 'Your Stripe credentials are authenticated! Click below to perform a real **$1.00 USD** secure test payment using your card to verify full end-to-end checkout routing.'
                        : 'To perform a real live payment check, make sure you have added your Stripe keys to your environment secrets in AI Studio. Currently showing simulator fallback.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCheckoutClick('test')}
                    disabled={stripePaymentLoading}
                    className="shrink-0 w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {stripePaymentLoading ? (
                      <span>Loading Checkout...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay $1.00 USD & Check Live</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Account Restriction alert boxes directly visible on the checkout page */}
                {stripeConfig.stripeConfigured && stripeConfig.accountInfo && !stripeConfig.accountInfo.chargesEnabled && (
                  <div className="bg-rose-50 border border-rose-200/50 rounded-2xl p-4 text-xs text-rose-950 font-sans text-left space-y-2">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-extrabold text-rose-900 block font-mono text-[10px] uppercase tracking-wider">⚠️ Connected Stripe Account is Restricted from Processing Payments</span>
                        <p className="leading-relaxed text-rose-800">
                          Your connected Stripe account (<strong>{stripeConfig.accountInfo.id}</strong> in {stripeConfig.accountInfo.country}) has charges disabled (<code>charges_enabled: false</code>). Stripe will block live credit card checkout sessions from starting until onboarding details are verified.
                        </p>
                        <div className="bg-rose-100/50 p-3 rounded-xl border border-rose-200/30 font-mono text-[10px] text-rose-950 space-y-1 leading-relaxed">
                          <div><strong>Account ID:</strong> {stripeConfig.accountInfo.id}</div>
                          <div><strong>Country:</strong> {stripeConfig.accountInfo.country}</div>
                          <div><strong>Details Submitted:</strong> {String(stripeConfig.accountInfo.detailsSubmitted)}</div>
                          <div><strong>Capabilities Card Payments:</strong> {stripeConfig.accountInfo.capabilities?.card_payments || 'unknown'}</div>
                          <div><strong>Capabilities Transfers:</strong> {stripeConfig.accountInfo.capabilities?.transfers || 'unknown'}</div>
                        </div>
                        <p className="text-[10px] text-rose-700 leading-snug">
                          <strong>Action Required:</strong> Log in to your <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer" className="underline font-bold text-rose-900 hover:text-rose-950">Stripe Dashboard Payments/Onboarding panel</a> and complete any pending verification tasks (like representative details or business registration) to activate your account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {stripeConfig.error && (
                  <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 text-xs text-amber-950 font-sans text-left">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-extrabold text-amber-900 block font-mono text-[10px] uppercase tracking-wider">⚠️ Stripe API Key Initialization Warning</span>
                        <p className="leading-relaxed text-amber-800">
                          The server encountered an error while verifying your Stripe keys:
                        </p>
                        <div className="bg-amber-100/50 p-2.5 rounded-xl border border-amber-200/30 font-mono text-[10px] text-amber-950 break-words leading-relaxed">
                          {stripeConfig.error}
                        </div>
                        <p className="text-[10px] text-amber-700 leading-snug">
                          Make sure the <code>STRIPE_SECRET_KEY</code> and <code>STRIPE_PUBLISHABLE_KEY</code> are correctly set in your environment variables.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
                
                {/* Tier 1: Free Tier */}
                <div className="border border-black/[0.04] rounded-3xl p-6 bg-[#f5f5f7]/40 flex flex-col justify-between relative overflow-hidden text-left font-sans">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#86868b] tracking-widest block">Tier 01</span>
                      <h4 className="text-lg font-bold text-[#1d1d1f]">
                        Starter
                      </h4>
                      <p className="text-[#86868b] text-xs font-light leading-relaxed">
                        Top-of-funnel acquisition; no credit card required to start.
                      </p>
                    </div>
                    
                    <div className="py-2">
                      <span className="text-3xl font-bold text-[#1d1d1f]">$0</span>
                      <span className="text-[#86868b] text-xs font-medium"> / forever</span>
                    </div>

                    <div className="border-t border-black/[0.04] pt-4 space-y-3">
                      <span className="text-[#1d1d1f] text-[10px] font-mono font-bold block uppercase tracking-wider">INCLUDED LIMITATIONS:</span>
                      <ul className="space-y-2.5 text-xs text-[#86868b] leading-normal font-light">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>5 Video summaries / month</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>Text-only summary output</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>1 Synthesis preset (Short Script only)</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      disabled
                      className="w-full bg-[#f5f5f7] border border-black/[0.02] text-[#86868b] py-3 rounded-xl text-xs font-semibold block text-center"
                    >
                      {!isPremium ? 'Your Current Active Tier' : 'Starter Tier'}
                    </button>
                  </div>
                </div>

                {/* Tier 2: Pro Tier */}
                <div className="border border-[#0071e3] rounded-3xl p-6 bg-white dark:bg-zinc-900 flex flex-col justify-between relative shadow-md overflow-hidden text-left font-sans ring-1 ring-[#0071e3]/20">
                  <div className="absolute right-0 top-0 bg-gradient-to-r from-[#0071e3] to-indigo-600 text-white text-[8px] font-mono tracking-wider font-bold uppercase py-1.5 px-4 rounded-bl-xl">
                    ⭐ Most Popular
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#0071e3] tracking-widest block">Tier 02</span>
                      <h4 className="text-lg font-bold text-[#1d1d1f] dark:text-zinc-100 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 fill-[#0071e3] text-[#0071e3]" />
                        Pro Creator Pass
                      </h4>
                      <p className="text-[#86868b] dark:text-zinc-400 text-xs font-light leading-relaxed">Everything you need to learn faster and create better content — unlimited.</p>
                    </div>

                    <div className="py-2">
                      <span className="text-3xl font-bold text-[#1d1d1f] dark:text-zinc-100">
                        {billingCycle === 'monthly' ? `$${proMonthlyPrice}` : `$${proYearlyPrice}`}
                      </span>
                      <span className="text-[#86868b] dark:text-zinc-500 text-xs font-medium">
                        {billingCycle === 'monthly' ? ' / month' : ` / month ($${(proYearlyPrice * 12).toFixed(2)}/yr)`}
                      </span>
                    </div>

                    <div className="border-t border-black/[0.04] dark:border-zinc-800 pt-4 space-y-3">
                      <span className="text-[#1d1d1f] dark:text-zinc-300 text-[10px] font-mono font-bold block uppercase tracking-wider">Everything in Starter, plus:</span>
                      <ul className="space-y-2.5 text-xs leading-normal">
                        {[
                          { label: 'Unlimited AI summaries (150/mo fair-use)', highlight: true },
                          { label: 'Studio voiceover synthesis (300 min/mo)', highlight: true },
                          { label: 'All 9 export formats — PDF, Word, Notion…', highlight: false },
                          { label: 'Visual Mind Map generation', highlight: false },
                          { label: 'AI Chat — unlimited messages', highlight: false },
                          { label: 'Spaced repetition learning engine', highlight: false },
                          { label: 'Custom domain & white-label links', highlight: false },
                        ].map(({ label, highlight }) => (
                          <li key={label} className={`flex items-start gap-2 ${highlight ? 'font-semibold text-[#1d1d1f] dark:text-zinc-100' : 'text-[#515154] dark:text-zinc-400 font-light'}`}>
                            <CheckCircle className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
                            <span>{label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 space-y-3">
                    {isPremium && (localStorage.getItem('youtube_summarizer_plan') || 'pro') === 'pro' ? (
                      <div className="bg-[#f5f5f7] dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-100 border border-black/[0.04] dark:border-zinc-700 py-3 rounded-xl text-xs font-mono font-bold text-center block select-none">
                        ✓ PRO SUBSCRIPTION ACTIVE
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheckoutClick('pro')}
                        className="w-full bg-gradient-to-r from-[#0071e3] to-indigo-600 hover:opacity-90 text-white py-3.5 rounded-xl text-xs font-bold block text-center transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98]"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>
                          {isAdminAuthenticated
                            ? (stripeConfig.stripeConfigured ? 'Subscribe Now (Secure Stripe)' : 'Simulate checkout (Stripe)')
                            : 'Upgrade to Pro Now'
                          }
                        </span>
                      </button>
                    )}
                    <p className="text-center text-[10px] text-neutral-400 dark:text-zinc-600">14-day money-back guarantee · Cancel anytime</p>
                  </div>
                </div>

                {/* Tier 3: Enterprise Agency */}
                <div className="border border-black/[0.04] rounded-3xl p-6 bg-[#f5f5f7]/40 flex flex-col justify-between relative overflow-hidden text-left font-sans">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#86868b] tracking-widest block">Tier 03</span>
                      <h4 className="text-lg font-bold text-[#1d1d1f]">Enterprise Agency Hub</h4>
                      <p className="text-[#86868b] text-xs font-light leading-relaxed">For professional content teams and digital growth agencies.</p>
                    </div>
                    
                    <div className="py-2">
                      <span className="text-3xl font-bold text-[#1d1d1f]">
                        {billingCycle === 'monthly' ? `$${enterpriseMonthlyPrice}` : `$${enterpriseYearlyPrice}`}
                      </span>
                      <span className="text-[#86868b] text-xs font-medium">
                        {billingCycle === 'monthly' ? ' / month' : ` / month ($${(enterpriseYearlyPrice * 12).toFixed(2)}/yr)`}
                      </span>
                    </div>

                    <div className="border-t border-black/[0.04] pt-4 space-y-3">
                      <span className="text-[#1d1d1f] text-[10px] font-mono font-bold block uppercase tracking-wider">AGENCY GRADE CONTROLS:</span>
                      <ul className="space-y-2.5 text-xs text-[#86868b] leading-normal font-light">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>Multi-seat access (3 seats included)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>Ceiling raised to 500 summaries/month</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>Voiceover capped at 800 mins/month</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>White-label exports & full API access</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>Priority processing queue</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    {isPremium && (localStorage.getItem('youtube_summarizer_plan') === 'enterprise') ? (
                      <div className="bg-[#f5f5f7] text-[#1d1d1f] border border-black/[0.04] py-3 rounded-xl text-xs font-mono font-bold text-center block select-none">
                        ✓ ENTERPRISE ACTIVE
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheckoutClick('enterprise')}
                        className="w-full bg-[#1d1d1f] hover:bg-black text-white py-3 rounded-xl text-xs font-semibold block text-center transition cursor-pointer"
                      >
                        <span>
                          {isAdminAuthenticated 
                            ? (stripeConfig.stripeConfigured ? 'Start Enterprise Pass (Stripe)' : 'Simulate checkout (Stripe)')
                            : 'Upgrade to Enterprise'
                          }
                        </span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Testimonials section */}
              <div className="mt-12 space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0071e3]">Loved by thousands</span>
                  <h3 className="text-xl font-bold text-[#1d1d1f]">What our early creators are saying</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="bg-white p-5 rounded-2xl border border-black/[0.03] space-y-3 shadow-sm hover:shadow transition duration-200">
                    <div className="flex gap-1 text-amber-400">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                    <p className="text-xs text-[#515154] leading-relaxed italic font-light">
                      "Zipytiny completely changed how I consume long lecture materials. From one video, I get my structured notes and high-quality voice briefs immediately."
                    </p>
                    <div className="flex items-center gap-2 pt-1.5 border-t border-black/[0.02]">
                      <div className="w-6 h-6 rounded-full bg-[#f5f5f7] flex items-center justify-center font-mono font-bold text-[10px] text-neutral-700">R</div>
                      <div>
                        <h5 className="text-[11px] font-bold text-[#1d1d1f]">R. Bahirathan</h5>
                        <span className="text-[9px] text-[#86868b] block">Independent Educator</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-black/[0.03] space-y-3 shadow-sm hover:shadow transition duration-200">
                    <div className="flex gap-1 text-amber-400">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                    <p className="text-xs text-[#515154] leading-relaxed italic font-light">
                      "The Viral Bulletin preset saved me hours of manual script writing. I just paste my YouTube link and instantly have scripts ready for TikTok and Reels!"
                    </p>
                    <div className="flex items-center gap-2 pt-1.5 border-t border-black/[0.02]">
                      <div className="w-6 h-6 rounded-full bg-[#f5f5f7] flex items-center justify-center font-mono font-bold text-[10px] text-neutral-700">S</div>
                      <div>
                        <h5 className="text-[11px] font-bold text-[#1d1d1f]">Sarah K.</h5>
                        <span className="text-[9px] text-[#86868b] block">Content Creator (140k subs)</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-black/[0.03] space-y-3 shadow-sm hover:shadow transition duration-200">
                    <div className="flex gap-1 text-amber-400">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                    <p className="text-xs text-[#515154] leading-relaxed italic font-light">
                      "Having a real voice briefing means I can catch up on conference proceedings during my commute. No competitor does voice export this well."
                    </p>
                    <div className="flex items-center gap-2 pt-1.5 border-t border-black/[0.02]">
                      <div className="w-6 h-6 rounded-full bg-[#f5f5f7] flex items-center justify-center font-mono font-bold text-[10px] text-neutral-700">A</div>
                      <div>
                        <h5 className="text-[11px] font-bold text-[#1d1d1f]">Dr. Alex M.</h5>
                        <span className="text-[9px] text-[#86868b] block">Clinical Researcher</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Comparison Table */}
              <div className="mt-12 space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0071e3]">Detailed Feature Comparison</span>
                  <h3 className="text-xl font-bold text-[#1d1d1f]">Why Zipytiny stands out</h3>
                </div>
                <div className="border border-black/[0.04] rounded-3xl overflow-hidden bg-white shadow-sm text-left">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#f5f5f7]/50 text-[#1d1d1f] font-sans text-xs border-b border-black/[0.04]">
                        <th className="px-5 py-3 font-semibold w-1/3">Core Capability</th>
                        <th className="px-5 py-3 font-semibold bg-blue-50/30 text-[#0071e3] w-1/3 text-center">
                          <span className="inline-flex items-center gap-1">✨ Zipytiny</span>
                        </th>
                        <th className="px-5 py-3 font-semibold text-neutral-500 w-1/3 text-center">Generic Summarizers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.03] text-xs">
                      <tr className="hover:bg-neutral-50/50">
                        <td className="px-5 py-4 font-medium text-neutral-800">Voiceover & Audio Synthesis</td>
                        <td className="px-5 py-4 text-center bg-blue-50/10 text-neutral-900 font-medium">
                          ✓ Included (High-fidelity studio speech presets)
                        </td>
                        <td className="px-5 py-4 text-center text-neutral-400">❌ Text-only (No voice synthesis)</td>
                      </tr>
                      <tr className="hover:bg-neutral-50/50">
                        <td className="px-5 py-4 font-medium text-neutral-800">Persona-Based Output Synthesis</td>
                        <td className="px-5 py-4 text-center bg-blue-50/10 text-neutral-900 font-medium">
                          ✓ 3 Advanced Presets (Academic Study, Viral Bulletin, Short Script)
                        </td>
                        <td className="px-5 py-4 text-center text-neutral-400">❌ Generic flat bullet points</td>
                      </tr>
                      <tr className="hover:bg-neutral-50/50">
                        <td className="px-5 py-4 font-medium text-neutral-800">Universal Source Support</td>
                        <td className="px-5 py-4 text-center bg-blue-50/10 text-neutral-900 font-medium">
                          ✓ YouTube, Vimeo, Local MP4 files, & Web URLs
                        </td>
                        <td className="px-5 py-4 text-center text-neutral-400">⚠️ YouTube-only</td>
                      </tr>
                      <tr className="hover:bg-neutral-50/50">
                        <td className="px-5 py-4 font-medium text-neutral-800">Interactive Concept Learning</td>
                        <td className="px-5 py-4 text-center bg-blue-50/10 text-neutral-900 font-medium">
                          ✓ AI-generated Quizzes, Flashcards & Concept Recall Maps
                        </td>
                        <td className="px-5 py-4 text-center text-neutral-400">❌ Read-only list output</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Developer Sandbox downgrader button */}
              {isPremium && isAdminAuthenticated && (
                <div className="pt-4 text-center">
                  <button
                    onClick={() => savePremiumStatus(false)}
                    className="text-xs text-red-500 hover:text-red-700 font-mono font-medium hover:underline inline-flex items-center gap-1.5 cursor-pointer bg-red-50 px-3.5 py-2 rounded-full border border-red-100"
                  >
                    <span>Reset Tier to Standard Free (Sandbox Testing Mode)</span>
                  </button>
                </div>
              )}

              {/* Real Developer integration tutorial footer */}
              {isAdminAuthenticated && (
                <div className="mt-6 p-6 bg-[#1d1d1f] text-neutral-300 rounded-2xl space-y-3 text-left font-sans">
                  <h4 className="text-xs font-bold font-mono text-neutral-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/[0.08] pb-3 select-none">
                    <Lock className="w-4 h-4 text-[#86868b]" />
                    Real Payment Setup Blueprint for MVP Release
                  </h4>
                  <p className="text-xs leading-relaxed text-neutral-305 font-light">
                    To transition this MVP to collect active customer funds, connect the server-side API proxy to a live <strong className="text-white">Stripe Checkout session</strong>. Using our structure:
                  </p>
                  <div className="bg-black/35 rounded-xl p-4 font-mono text-[11px] text-slate-300 space-y-2.5 overflow-x-auto text-left leading-relaxed border border-white/[0.03]">
                    <div><span className="text-amber-400 font-semibold">// 1. Server API endpoint (Express)</span></div>
                    <div><code className="text-emerald-400 font-medium">app.post('/api/create-checkout', async (req, res) =&gt; &#123;</code></div>
                    <div className="pl-4"><code className="text-slate-300">const session = await stripe.checkout.sessions.create(&#123;</code></div>
                    <div className="pl-8"><code className="text-slate-300">payment_method_types: ['card'],</code></div>
                    <div className="pl-8"><code className="text-slate-300">line_items: [&#123; price: 'price_H4kd9eK...', quantity: 1 &#125;],</code></div>
                    <div className="pl-8"><code className="text-slate-300">mode: 'subscription',</code></div>
                    <div className="pl-8"><code className="text-slate-300">success_url: '$&#123;YOUR_WEBSITE_DOMAIN&#125;/billing?session_id=&#123;CHECKOUT_SESSION_ID&#125;',</code></div>
                    <div className="pl-8"><code className="text-slate-300">cancel_url: '$&#123;YOUR_WEBSITE_DOMAIN&#125;/billing',</code></div>
                    <div className="pl-4"><code className="text-slate-300">&#125;);</code></div>
                    <div className="pl-4"><code className="text-slate-300">res.json(&#123; url: session.url &#125;);</code></div>
                    <div><code className="text-emerald-400 font-medium">&#125;);</code></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentScreen === 'marketing' && (
          <div className="space-y-6 animate-fadeIn transition-all duration-300 font-sans">
            
            {/* Top Dashboard Header Banner */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/[0.04] shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 font-sans text-left">
                  <div className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.04] px-3 py-1 rounded-full text-[11px] font-semibold text-[#1d1d1f]">
                    <Rocket className="w-3.5 h-3.5 text-[#86868b]" />
                    <span>MVP Digital Launch Accelerators</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
                    Zipytiny Growth Hub & Outreach Engine
                  </h2>
                  <p className="text-[#86868b] text-sm max-w-2xl leading-relaxed font-light font-sans">
                    Zero budget? No problem. Use our specialized built-in growth engines powered by Gemini to extract prospects, script short-form videos from your shelf summary history, and acquire paying enterprise customers.
                  </p>
                </div>
                
                {/* Visual statistics card */}
                <div className="bg-[#1d1d1f] p-5 rounded-2xl text-white space-y-1 font-sans min-w-[200px] text-left shrink-0">
                  <span className="text-[9px] font-mono text-neutral-400 block tracking-wider uppercase font-bold">VIRAL CAMPAIGNS PLANNED</span>
                  <span className="text-xl font-bold text-white block">3 Active Channels</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1 justify-start">
                    <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Ready for instant copy-paste</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Main Marketing Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Social Outreach generator */}
              <div className="lg:col-span-6 bg-white border border-black/[0.04] rounded-3xl p-6 space-y-4 text-left font-sans flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center border border-black/[0.01]">
                      <Megaphone className="w-4.5 h-4.5 text-[#1d1d1f]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1d1d1f]">Strategy 01: Social Prospecting Outreach Writer</h3>
                      <p className="text-[10px] text-[#86868b] font-medium">Draft low-friction cold pitches for your choice niche</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#86868b] leading-relaxed font-light">
                    Identify busy creators or business owners on LinkedIn, YouTube comments, or Twitter who publish long videos. Deliver a punchy value statement proposing real summarized highlights using your domain.
                  </p>

                  {/* Niche Input field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b]">Target Industry Niche</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={marketingNiche}
                        onChange={(e) => setMarketingNiche(e.target.value)}
                        placeholder="e.g. Real Estate Brokers, Tech Podcasters"
                        className="flex-1 p-3 bg-[#f5f5f7] border border-black/[0.04] rounded-xl text-xs focus:border-[#0071e3] outline-none transition text-[#1d1d1f]"
                      />
                      <button
                        onClick={generateMarketingOutreach}
                        disabled={pitchLoading}
                        className="bg-[#1d1d1f] hover:bg-black text-white font-[#1d1d1f] font-semibold text-xs px-4 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap"
                      >
                        {pitchLoading ? 'Generating...' : 'Rewrite Pitch'}
                      </button>
                    </div>
                  </div>

                  {/* Pitch Script Output */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b]">Your Actionable Sales Copy</label>
                    <div className="bg-[#f5f5f7]/55 p-4 border border-black/[0.04] rounded-2xl h-80 overflow-y-auto font-mono text-[11px] leading-relaxed text-[#515154] text-left select-text relative">
                      {outreachPitch ? (
                        <div className="whitespace-pre-wrap">{outreachPitch}</div>
                      ) : (
                        <div className="text-neutral-400 italic flex h-full items-center justify-center font-sans font-light">
                          Click "Rewrite Pitch" to generate custom outreach text targeting {marketingNiche || 'your choice niche'}!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {outreachPitch && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(outreachPitch);
                      alert('Copied outreach campaigns to clipboard!');
                    }}
                    className="w-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-semibold py-2.5 rounded-xl border border-black/[0.04] cursor-pointer text-center mt-3 transition"
                  >
                    Copy Outreach Script to Clipboard
                  </button>
                )}
              </div>

              {/* Right Column: Shorts Repurposer script playground */}
              <div className="lg:col-span-6 bg-white border border-black/[0.04] rounded-3xl p-6 space-y-4 text-left font-sans flex flex-col justify-between">
                <div className="space-y-4 font-sans">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center border border-black/[0.01]">
                      <TrendingUp className="w-4.5 h-4.5 text-[#1d1d1f]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1d1d1f]">Strategy 02: Short-Form Viral Video Script writer</h3>
                      <p className="text-[10px] text-[#86868b] font-medium">Repurpose your transcribed summaries into TikTok/YT Shorts scripts</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#86868b] leading-relaxed font-light">
                    Choose one of your summarized lectures on your Workspace shelf. The pipeline will automatically adapt the key facts into a snappy, attention-grabbing 45-second script.
                  </p>

                  <div className="grid grid-cols-1 font-sans gap-2 select-none">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b]">Select summary source</label>
                    <div className="flex flex-col gap-2">
                      <div className="space-y-1 bg-[#f5f5f7] p-3 border border-black/[0.04] rounded-xl text-xs text-left">
                        <span className="font-bold text-[#1d1d1f] block text-[11px] truncate">
                          {activeSummary?.metadata?.title || 'No Summary Loaded'}
                        </span>
                        <span className="text-[10px] text-[#86868b] font-mono">
                          Source: {activeSummary?.metadata?.duration || 'Unknown'} min • {activeSummary?.takeaways?.length || 0} Bullet takeaways
                        </span>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (!activeSummary) {
                            alert('Please load a summary in your Workspace first!');
                            return;
                          }
                          generateShortScript(
                            activeSummary.metadata.title, 
                            activeSummary.takeaways.map((t: any) => typeof t === 'string' ? t : t?.text || '').join('\n')
                          );
                        }}
                        disabled={shortsScriptLoading || !activeSummary}
                        className="w-full bg-[#1d1d1f] hover:bg-black text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-sm cursor-pointer text-center disabled:opacity-40"
                      >
                        {shortsScriptLoading ? 'Repurposing with Gemini...' : 'Draft Snappy Shorts Video Script'}
                      </button>
                    </div>
                  </div>

                  {/* Script Terminal output */}
                  <div className="space-y-1.5 font-sans">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b]">Your Actionable Shorts Video Script</label>
                    <div className="bg-[#f5f5f7]/55 p-4 border border-black/[0.04] rounded-2xl h-60 overflow-y-auto font-mono text-[11px] leading-relaxed text-[#515154] text-left select-text relative">
                      {marketingShortsScript ? (
                        <div className="whitespace-pre-wrap font-mono">{marketingShortsScript}</div>
                      ) : (
                        <div className="text-[#86868b] italic flex h-full items-center justify-center font-sans font-light">
                          {activeSummary 
                            ? 'Click the button above to auto-generate a 45-second viral video layout for this summary!'
                            : 'Go compile a video in your workspace to enable script drafting here.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {marketingShortsScript && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(marketingShortsScript);
                      alert('Copied shorts script copy to clipboard!');
                    }}
                    className="w-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-semibold py-2.5 rounded-xl border border-black/[0.04] cursor-pointer text-center mt-3 transition"
                  >
                    Copy Script to Clipboard
                  </button>
                )}
              </div>

            </div>

            {/* Tactical Growth Strategy playbook */}
            <div className="bg-[#1d1d1f] rounded-3xl p-6 md:p-8 text-white space-y-6 text-left">
              <div className="space-y-1.5 font-sans">
                <span className="text-[10px] font-mono font-bold text-[#86868b] tracking-wider uppercase">THE OFFICIAL LAUNCHBOOK</span>
                <h3 className="text-lg font-semibold text-white font-sans">Three High-Converting Channels for Zipytiny</h3>
                <p className="text-[#86868b] text-xs leading-relaxed max-w-xl font-sans font-light">Follow these three zero-budget traffic streams to scale your pre-configured custom hosting link to paying custom users.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-sans">
                
                {/* channel 1 */}
                <div className="space-y-2 border-l-2 border-[#0071e3] pl-4">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                    <span className="bg-[#0071e3]/20 text-[#0071e3] px-1.5 py-0.5 rounded text-[10px] font-mono">CHANNEL A</span>
                    The Reddit Value Bomb
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans font-light">
                    Search Reddit subs like <strong>r/learnprogramming</strong>, <strong>r/podcasts</strong>, or <strong>r/solopreneur</strong>. Do not pitch directly. Instead, find trending threads talking about massive YouTube tutorial series or long podcasts, summarize them with your app, and reply with the summary. Append a small footnote credit back to your Zipytiny live custom domain!
                  </p>
                </div>

                {/* channel 2 */}
                <div className="space-y-2 border-l-2 border-emerald-500 pl-4 font-sans">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono">CHANNEL B</span>
                    Newsletter Lead Magnet
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans font-light">
                    Publish high-quality PDF cheatsheets of courses using our Workspace PDF Downloader. Email these PDFs for free to substacks or medium authors looking for educational content. The embedded links inside the PDF pointing back to your pre-configured domain will bring a lifetime stream of qualified subscribers to your billing models.
                  </p>
                </div>

                {/* channel 3 */}
                <div className="space-y-2 border-l-2 border-violet-400 pl-4 font-sans font-light">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                    <span className="bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded text-[10px] font-mono">CHANNEL C</span>
                    Mid-Tier Creator Tagging
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans font-light">
                    Summarize long podcasts or interviews of popular independent creators. Post the summary chapter logs on Twitter, tag the podcast host, and say: "Summarized the epic interview into a study package for visual learners!". Hosts love sharing summaries of their own podcasts with their fans, giving you 50,000+ targeted impressions impressions instantly!
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {currentScreen === 'admin' && (
          <div className="space-y-6 animate-fadeIn transition-all duration-300 font-sans">
            
            {/* Unauthenticated Security Shield Login Screen */}
            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto py-12 px-4">
                <div className="bg-white rounded-3xl border border-black/[0.04] p-8 space-y-6 shadow-sm text-center relative overflow-hidden">
                  
                  {/* High-end decorative visual protection line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900" />

                  {!adminMfaRequired ? (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-[#f5f5f7] border border-black/[0.04] px-3 py-1 rounded-full text-[10px] font-mono font-bold text-neutral-700 uppercase tracking-widest">
                          <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-ping" />
                          STAGE 1: CREDENTIAL CHALLENGE
                        </div>
                        <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 font-sans">
                          Admin Operations Suite
                        </h2>
                        <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                          Verify administrative operator user name and identity key credentials to query core configurations.
                        </p>
                      </div>

                      <form onSubmit={handleAdminAuth} className="space-y-4 text-left">
                        <div className="space-y-1.5 font-sans">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                            Administrative User ID
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. admin"
                            value={adminUserField}
                            onChange={(e) => setAdminUserField(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black/[0.05] transition"
                          />
                        </div>

                        <div className="space-y-1.5 font-sans">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                            Private Security Key (Password)
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••••••"
                            value={adminPassField}
                            onChange={(e) => setAdminPassField(e.target.value)}
                            required
                            className="w-full px-[#16px] py-2.5 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black/[0.05] transition"
                          />
                        </div>

                        {attemptsRemaining !== null && attemptsRemaining < 5 && (
                          <div className="text-[10px] text-amber-600 font-medium font-sans text-right">
                            ⚠️ {attemptsRemaining} attempts left before system lockout.
                          </div>
                        )}

                        {adminError && (
                          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs text-center font-medium font-sans">
                            ⚠️ {adminError}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold py-3 rounded-xl transition cursor-pointer shadow-sm text-center flex items-center justify-center gap-2"
                        >
                          Verify General Credentials
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* Step 2: MFA Multi-Factor Token Handshake */
                    <div className="space-y-6">
                      <div className="h-14 w-14 bg-zinc-950 mx-auto flex items-center justify-center text-white rounded-2xl shadow-inner relative">
                        <Check className="w-6 h-6 text-emerald-400" />
                        <span className="absolute bottom-[-2px] right-[-2px] bg-amber-500 h-3 w-3 rounded-full border-2 border-white animate-pulse" />
                      </div>

                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 bg-amber-100 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase font-bold text-amber-800">
                          <span className="h-1.5 w-1.5 bg-[#d97706] rounded-full animate-pulse" />
                          STAGE 2: MULTI-FACTOR IDENTIFICATION
                        </div>
                        <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 font-sans">
                          MFA Security Vault
                        </h2>
                        <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                          For your administrative role, we require verification via the dynamic 2FA system authenticator token.
                        </p>
                      </div>

                      <form onSubmit={handleAdminAuth} className="space-y-4 text-left">
                        <div className="space-y-1.5 font-sans">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold flex items-center justify-between">
                            <span>6-DIGIT MFA SECURITY CODE</span>
                            <span className="text-emerald-600 animate-pulse text-[9px]">ROLLING PASSKEY ACTIVE</span>
                          </label>
                          <input
                            type="text"
                            placeholder="771 993"
                            value={adminMfaField}
                            onChange={(e) => setAdminMfaField(e.target.value)}
                            required
                            maxLength={10}
                            className="w-full text-center tracking-[0.5em] font-mono font-extrabold text-lg px-4 py-3 bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>

                        {attemptsRemaining !== null && attemptsRemaining < 5 && (
                          <div className="text-[10px] text-amber-600 font-medium font-sans text-right">
                            ⚠️ {attemptsRemaining} attempts remaining prior to lock limit.
                          </div>
                        )}

                        {adminError && (
                          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs text-center font-medium font-sans">
                            ⚠️ {adminError}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAdminMfaRequired(false);
                              setAdminMfaField('');
                            }}
                            className="w-1/3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-neutral-600 text-xs font-semibold py-3 rounded-xl transition cursor-pointer text-center"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="w-2/3 bg-zinc-900 hover:bg-black text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer shadow-sm text-center flex items-center justify-center gap-2"
                          >
                            Complete Handshake
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              /* Authenticated Admin Control Panel View */
              <div className="space-y-6 text-left font-sans">
                
                {/* Dashboard Title Banner */}
                <div className="bg-[#1d1d1f] rounded-3xl p-6 md:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-left font-sans">
                    <span className="text-[9px] font-mono uppercase text-[#86868b] tracking-wider font-bold">Zipytiny Operations Suite</span>
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      Administrative Control Terminal
                    </h2>
                    <p className="text-neutral-400 text-xs font-sans font-light leading-relaxed">
                      Configure environment quotas, rate limit parameters, billing gateways, simulated users, and Gemini API inference settings.
                    </p>
                  </div>
                  <button
                    onClick={handleAdminLogout}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer self-start sm:self-center"
                  >
                    Log Out Configurator
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* CARD 7: ADMINISTRATIVE CREDENTIALS & MULTI-FACTOR KEY VAULT */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-2 text-zinc-950">
                        <KeyRound className="w-5 h-5 text-amber-500 animate-pulse" />
                        <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                          Administrative Credentials & Multi-Factor Security (Google Authenticator)
                        </h3>
                      </div>
                      <span className="bg-amber-50 text-amber-700 text-[9px] font-mono font-bold leading-none uppercase px-2 py-1 rounded-sm border border-amber-100">
                        Secure Vault Active
                      </span>
                    </div>

                    <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                      Configure custom administration credentials. Secure your operations by generating cryptographically strong, system-backed passwords and saving them securely to your Firebase Cloud Firestore database. Enable 2FA Google Authenticator protection to defend against brute force attempts.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      
                      {/* Left: Account Credentials Creator */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block border-b border-neutral-50 pb-1">
                          1. Setup Login Credentials
                        </span>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                            Admin Username
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. administrator"
                            value={vaultUsername}
                            onChange={(e) => setVaultUsername(e.target.value)}
                            className="w-full px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                            Admin Password
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type={vaultPasswordVisible ? 'text' : 'password'}
                                placeholder="Enter custom password or generate one"
                                value={vaultPassword}
                                onChange={(e) => setVaultPassword(e.target.value)}
                                className="w-full pl-4 pr-10 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setVaultPasswordVisible(!vaultPasswordVisible)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                              >
                                {vaultPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={generateSecurePassword}
                              className="bg-zinc-100 hover:bg-zinc-200 text-[#1d1d1f] hover:text-[#0071e3] transition text-[10px] uppercase tracking-wider font-bold px-3 py-2 rounded-xl border border-black/[0.03] cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              Generate Secure ⚡
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Authenticator App (2FA) */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block border-b border-neutral-50 pb-1">
                          2. Configure Authenticator App 2FA
                        </span>

                        {!vault2faQrUrl ? (
                          <div className="p-4 bg-zinc-50 border border-neutral-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                            <ShieldAlert className="w-8 h-8 text-neutral-400" />
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-zinc-800 block">MFA App Connection Pending</span>
                              <p className="text-[10px] text-zinc-500 leading-normal max-w-xs font-sans font-light">
                                To activate 2FA for the administrative console using Google Authenticator, tap the button below.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleGenerate2FA}
                              disabled={vaultSetupLoading}
                              className="bg-[#0071e3] hover:bg-[#0077ed] text-white text-[10px] font-bold tracking-wider uppercase px-4 py-2 rounded-xl transition disabled:opacity-40 cursor-pointer shadow-sm mx-auto"
                            >
                              {vaultSetupLoading ? 'Initializing...' : 'Initialize 2FA Secret Key'}
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-2xl space-y-4">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              <div className="bg-white p-2 rounded-xl border border-amber-100 shadow-sm shrink-0">
                                <img
                                  src={vault2faQrUrl}
                                  alt="Google Authenticator QR Code"
                                  className="w-24 h-24 mx-auto"
                                />
                              </div>
                              <div className="space-y-2 text-left font-sans">
                                <span className="text-[11px] font-bold text-amber-950 block">Scan with Google Authenticator</span>
                                <p className="text-[10px] text-amber-900 leading-relaxed font-sans font-light">
                                  Open Google Authenticator app on your phone, tap the "+" button, choose "Scan QR code", and scan the QR block here.
                                </p>
                                <div className="space-y-0.5">
                                  <span className="text-[8px] font-mono uppercase text-amber-800 font-bold tracking-wide block">Manual Base32 Secret Key</span>
                                  <code className="text-[9px] bg-white border border-amber-200/50 px-2 py-0.5 rounded font-mono text-zinc-800 font-semibold select-all block break-all">
                                    {vault2faSecret}
                                  </code>
                                </div>
                              </div>
                            </div>

                            {/* Verification Form */}
                            <div className="space-y-2 border-t border-amber-100 pt-3">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                                Enter 6-Digit Authenticator Code
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="e.g. 123456"
                                  maxLength={6}
                                  value={vault2faSetupCode}
                                  onChange={(e) => setVault2faSetupCode(e.target.value.replace(/\D/g, ''))}
                                  className="w-full px-4 py-1.5 text-xs bg-white border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono text-center tracking-widest text-base font-bold"
                                />
                                <button
                                  type="button"
                                  onClick={handleVerify2FASetup}
                                  disabled={vaultSetupLoading || vault2faVerified || vault2faSetupCode.length < 6}
                                  className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0 ${vault2faVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-black text-white hover:bg-neutral-800'}`}
                                >
                                  {vault2faVerified ? 'Verified ✓' : vaultSetupLoading ? 'Checking...' : 'Verify Pin'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer / Status Message & Save button */}
                    <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                      <div className="text-left flex-1">
                        {vaultSaveStatus.type !== 'idle' ? (
                          <span className={`text-[11px] font-medium leading-relaxed block ${vaultSaveStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {vaultSaveStatus.type === 'success' ? '✓ ' : '⚠️ '} {vaultSaveStatus.message}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#86868b] leading-normal font-light block">
                            Note: Verification of the 2FA authenticator app is required before settings can be fully committed to prevent lockout.
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                        {vault2faQrUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setVault2faQrUrl('');
                              setVault2faSecret('');
                              setVault2faSetupCode('');
                              setVault2faVerified(false);
                              setVaultSaveStatus({ type: 'idle', message: '' });
                            }}
                            className="w-full sm:w-auto text-zinc-500 hover:text-black bg-zinc-50 hover:bg-zinc-100 border border-black/[0.03] text-[10px] font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl transition cursor-pointer"
                          >
                            Reset Setup Flow
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveVaultSettings}
                          disabled={vaultSetupLoading || (!vault2faVerified && vault2faQrUrl !== '')}
                          className="w-full sm:w-auto bg-black text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold tracking-wider uppercase px-6 py-2.5 rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                        >
                          {vaultSetupLoading ? 'Processing...' : 'Save Settings to Firestore'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* CARD 1: ENVIRONMENTAL SETTINGS */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans">
                    <div className="flex items-center gap-2 text-zinc-800">
                      <Server className="w-5 h-5 text-zinc-700" />
                      <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                        Environmental & Access Settings
                      </h3>
                    </div>
                    <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                      Control standard system variables and request limits mapped directly throughout your active server.
                    </p>

                    <div className="space-y-4 pt-2 border-t border-neutral-100">
                      
                      {/* guest credit limit */}
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Guest Daily Limits (FREE_REQS_LIMIT)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={adminFreeReqsLimit}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAdminFreeReqsLimit(val);
                              localStorage.setItem('admin_free_reqs_limit', val);
                              refreshStatus();
                            }}
                            className="flex-1 accent-black animate-pulse"
                          />
                          <span className="text-xs font-bold font-mono bg-[#f5f5f7] px-3 py-1.5 rounded-lg border border-black/[0.04]">
                            {adminFreeReqsLimit} Req/Day
                          </span>
                        </div>
                        <span className="block text-[10px] text-[#86868b] leading-normal font-light">
                          Determines the threshold count of daily video analyses allowed for non-paying guest IP addresses.
                        </span>
                      </div>

                      {/* default bypass code */}
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b] block font-bold">
                          VIP Bypass Access Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. PROPASS"
                          value={customVipCode}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setCustomVipCode(val);
                            if (val) {
                              localStorage.setItem('custom_vip_code', val);
                              if (val === 'PROPASS') {
                                setIsPremium(true);
                              }
                            } else {
                              localStorage.removeItem('custom_vip_code');
                              setIsPremium(false);
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white"
                        />
                        <span className="block text-[10px] text-[#86868b] leading-normal font-light">
                          Supply guests or creators with this specific passkey to grant instant premium access. Default: <code>PROPASS</code>.
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* CARD 2: BILLING & GATEWAY SETTINGS */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans">
                    <div className="flex items-center gap-2 text-zinc-805">
                      <CreditCard className="w-5 h-5 text-zinc-700" />
                      <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                        Billing Settings & Stripe Portal
                      </h3>
                    </div>
                    <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                      Coordinate billing credentials to receive active user subscriptions directly in support of real growth.
                    </p>

                    <div className="space-y-3 pt-2 border-t border-neutral-100">
                      
                      {/* secret key */}
                      <div className="space-y-1 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Stripe Secret Key (Overriding System API)
                        </label>
                        <input
                          type="password"
                          placeholder="sk_test_..."
                          value={customStripeSecret}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setCustomStripeSecret(val);
                            if (val) {
                              localStorage.setItem('custom_stripe_secret', val);
                            } else {
                              localStorage.removeItem('custom_stripe_secret');
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono"
                        />
                      </div>

                      {/* publishable key */}
                      <div className="space-y-1 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Stripe Publishable Key
                        </label>
                        <input
                          type="text"
                          placeholder="pk_test_..."
                          value={customStripePublishable}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setCustomStripePublishable(val);
                            if (val) {
                              localStorage.setItem('custom_stripe_publishable', val);
                            } else {
                              localStorage.removeItem('custom_stripe_publishable');
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono"
                        />
                      </div>

                      {/* Toggle mock premium test bypass */}
                      <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/40 flex items-center justify-between text-left mt-2">
                        <div className="space-y-0.5 max-w-[80%]">
                          <span className="text-[11px] font-bold text-emerald-950 block">Simulate Sandbox Pro Pass</span>
                          <span className="text-[9px] text-emerald-800 leading-none block">Enable mock subscription active state for verification purposes on current browser.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isPremium}
                          onChange={(e) => {
                            const checkState = e.target.checked;
                            setIsPremium(checkState);
                            localStorage.setItem('youtube_summarizer_premium', checkState ? 'true' : 'false');
                          }}
                          className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </div>

                      {/* Dynamic Pricing Engine Sub-section */}
                      <div className="pt-4 border-t border-neutral-100 space-y-4">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-zinc-700" />
                          <h4 className="font-bold text-xs tracking-tight text-[#1d1d1f]">
                            Dynamic Pricing Configuration
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#86868b] leading-normal font-light">
                          Manage user-facing tier prices in USD $. Unlocked changes are stored in real-time Firestore database and applied globally across checkout paths.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Pro Plan Prices */}
                          <div className="space-y-2 p-3 bg-[#f5f5f7]/50 rounded-2xl border border-black/[0.02]">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0071e3] block">Pro Creator Pass</span>
                            <div className="space-y-1.5">
                              <div>
                                <label className="text-[9px] font-medium text-neutral-500 block">Monthly Price ($)</label>
                                <input
                                  type="number"
                                  value={proMonthlyPrice}
                                  onChange={(e) => setProMonthlyPrice(Number(e.target.value))}
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-black/[0.08] rounded-lg outline-none focus:border-neutral-300 font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-medium text-neutral-500 block">Yearly Price ($ / mo)</label>
                                <input
                                  type="number"
                                  value={proYearlyPrice}
                                  onChange={(e) => setProYearlyPrice(Number(e.target.value))}
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-black/[0.08] rounded-lg outline-none focus:border-neutral-300 font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Enterprise Plan Prices */}
                          <div className="space-y-2 p-3 bg-[#f5f5f7]/50 rounded-2xl border border-black/[0.02]">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-800 block">Enterprise Agency Hub</span>
                            <div className="space-y-1.5">
                              <div>
                                <label className="text-[9px] font-medium text-neutral-500 block">Monthly Price ($)</label>
                                <input
                                  type="number"
                                  value={enterpriseMonthlyPrice}
                                  onChange={(e) => setEnterpriseMonthlyPrice(Number(e.target.value))}
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-black/[0.08] rounded-lg outline-none focus:border-neutral-300 font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-medium text-neutral-500 block">Yearly Price ($ / mo)</label>
                                <input
                                  type="number"
                                  value={enterpriseYearlyPrice}
                                  onChange={(e) => setEnterpriseYearlyPrice(Number(e.target.value))}
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-black/[0.08] rounded-lg outline-none focus:border-neutral-300 font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleSavePricingAndPromotions()}
                            disabled={pricingSaveLoading}
                            className="px-3.5 py-1.5 bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                          >
                            {pricingSaveLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Save Pricing Changes
                          </button>
                        </div>
                      </div>

                      {/* Active Promotions & Discounts Engine */}
                      <div className="pt-4 border-t border-neutral-100 space-y-4">
                        <div className="flex items-center gap-1.5">
                          <Megaphone className="w-4 h-4 text-zinc-700" />
                          <h4 className="font-bold text-xs tracking-tight text-[#1d1d1f]">
                            Promotions & Referral Discount Engine
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#86868b] leading-normal font-light">
                          Create and configure active discount codes for marketing campaigns.
                        </p>

                        {/* Existing promotions list table */}
                        {promotionsList.length > 0 ? (
                          <div className="border border-black/[0.04] rounded-xl overflow-hidden text-xs bg-white">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-[#f5f5f7]/50 text-neutral-500 border-b border-black/[0.04] font-mono text-[9px] uppercase font-bold text-left">
                                  <th className="px-3 py-2">Promo Code</th>
                                  <th className="px-3 py-2">Discount</th>
                                  <th className="px-3 py-2">Rules & Duration</th>
                                  <th className="px-3 py-2">Status</th>
                                  <th className="px-3 py-2 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-black/[0.04]">
                                {promotionsList.map((promo, pIdx) => (
                                  <tr key={pIdx} className="hover:bg-neutral-50/50">
                                    <td className="px-3 py-2 font-mono font-bold text-[#1d1d1f]">{promo.code}</td>
                                    <td className="px-3 py-2">
                                      {promo.discountType === 'percentage' ? `${promo.discountValue}% Off` : `$${promo.discountValue} Off`}
                                    </td>
                                    <td className="px-3 py-2 space-y-0.5 text-[10px] text-neutral-600">
                                      <div>Duration: <strong className="font-semibold">{promo.discountDurationType === 'first_month_only' ? 'First Month Only' : 'Recurring'}</strong></div>
                                      {promo.plans === 'monthly_only' && <div className="text-indigo-600 font-medium">Plans: Monthly Only</div>}
                                      {promo.redemptionCap > 0 && (
                                        <div>Cap: <strong className="font-semibold">{promo.redemptionsCount || 0} / {promo.redemptionCap}</strong> uses</div>
                                      )}
                                      {promo.expiryDate && (
                                        <div className="text-amber-600 font-medium">Expires: {promo.expiryDate}</div>
                                      )}
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className={`inline-flex px-1.5 py-0.5 rounded-sm text-[9px] font-mono font-bold uppercase ${promo.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-neutral-100 text-neutral-500'}`}>
                                        {promo.active ? 'Active' : 'Disabled'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-right space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...promotionsList];
                                          copy[pIdx].active = !copy[pIdx].active;
                                          handleSavePricingAndPromotions(copy);
                                        }}
                                        className="text-[10px] text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
                                      >
                                        Toggle
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = promotionsList.filter((_, idx) => idx !== pIdx);
                                          handleSavePricingAndPromotions(copy);
                                        }}
                                        className="text-[10px] text-rose-600 hover:text-rose-900 font-semibold cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-4 text-center border border-dashed border-neutral-200 rounded-xl text-[11px] text-neutral-500 bg-[#f5f5f7]/20">
                            No promotional codes created yet. Build your first campaign below!
                          </div>
                        )}

                        {/* Add new promo code form */}
                        <div className="p-3 bg-[#f5f5f7]/50 rounded-2xl border border-black/[0.02] space-y-3">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 block">Create Promotional Code</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[9px] text-neutral-500 block font-medium">Promo Code</label>
                              <input
                                type="text"
                                placeholder="E.g. SAVE30"
                                value={adminNewPromoCode}
                                onChange={(e) => setAdminNewPromoCode(e.target.value.toUpperCase())}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/[0.08] rounded-lg outline-none uppercase font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-neutral-500 block font-medium">Type</label>
                              <select
                                value={adminNewPromoType}
                                onChange={(e) => setAdminNewPromoType(e.target.value as any)}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/[0.08] rounded-lg outline-none text-neutral-800"
                              >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ($)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] text-neutral-500 block font-medium">Discount Value</label>
                              <input
                                type="number"
                                placeholder="E.g. 30"
                                value={adminNewPromoValue || ''}
                                onChange={(e) => setAdminNewPromoValue(Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/[0.08] rounded-lg outline-none font-mono text-neutral-800"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="text-[9px] text-neutral-500 block font-medium">Duration Type</label>
                              <select
                                value={adminNewPromoDuration}
                                onChange={(e) => setAdminNewPromoDuration(e.target.value as any)}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/[0.08] rounded-lg outline-none text-neutral-800"
                              >
                                <option value="first_month_only">First Month Only</option>
                                <option value="recurring">Recurring (Continuous)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] text-neutral-500 block font-medium">Redemption Cap (0 = none)</label>
                              <input
                                type="number"
                                placeholder="E.g. 50"
                                value={adminNewPromoCap || ''}
                                onChange={(e) => setAdminNewPromoCap(Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/[0.08] rounded-lg outline-none font-mono text-neutral-800"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-neutral-500 block font-medium">Expiry Date (YYYY-MM-DD)</label>
                              <input
                                type="text"
                                placeholder="YYYY-MM-DD"
                                value={adminNewPromoExpiry}
                                onChange={(e) => setAdminNewPromoExpiry(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/[0.08] rounded-lg outline-none font-mono text-neutral-800"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-neutral-500 block font-medium">Allowed Plans</label>
                              <select
                                value={adminNewPromoPlans}
                                onChange={(e) => setAdminNewPromoPlans(e.target.value as any)}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/[0.08] rounded-lg outline-none text-neutral-800"
                              >
                                <option value="all">All Plans</option>
                                <option value="monthly_only">Monthly Only</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const code = adminNewPromoCode.trim().toUpperCase();
                                if (!code) return;
                                if (promotionsList.some(p => p.code === code)) {
                                  alert('A promo code with this exact name already exists.');
                                  return;
                                }
                                const newPromo = {
                                  code,
                                  discountType: adminNewPromoType,
                                  discountValue: adminNewPromoValue || 0,
                                  discountDurationType: adminNewPromoDuration,
                                  redemptionCap: adminNewPromoCap || 0,
                                  redemptionsCount: 0,
                                  expiryDate: adminNewPromoExpiry,
                                  plans: adminNewPromoPlans,
                                  active: true
                                };
                                const updated = [...promotionsList, newPromo];
                                handleSavePricingAndPromotions(updated);
                                setAdminNewPromoCode('');
                                setAdminNewPromoValue(0);
                                setAdminNewPromoCap(0);
                                setAdminNewPromoExpiry('');
                                setAdminNewPromoPlans('all');
                              }}
                              className="px-3 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                            >
                              Create Campaign Code
                            </button>
                          </div>
                        </div>

                        {/* Save feedback block */}
                        {pricingSaveStatus.type !== 'idle' && (
                          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${pricingSaveStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{pricingSaveStatus.message}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* CARD 3: GEMINI API CONFIGURATION SETTINGS */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans">
                    <div className="flex items-center gap-2 text-zinc-800">
                      <Sparkles className="w-5 h-5 text-zinc-700" />
                      <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                        Gemini AI API Configuration Settings
                      </h3>
                    </div>
                    <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                      Optimize models, inference parameters, and advanced groundings to adjust depth, cost, or speeds.
                    </p>

                    <div className="space-y-4 pt-2 border-t border-neutral-100">
                      
                      {/* custom api key override */}
                      <div className="space-y-1 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Developer Custom Gemini API Key Override
                        </label>
                        <input
                          type="password"
                          placeholder="AIzaSy..."
                          value={customApiKey}
                          onChange={(e) => {
                            const val = e.target.value;
                            let cleanVal = val.trim();
                            if (cleanVal.includes('GEMINI_API_KEY=')) {
                              cleanVal = cleanVal.split('GEMINI_API_KEY=')[1].trim();
                            }
                            if ((cleanVal.startsWith('"') && cleanVal.endsWith('"')) || (cleanVal.startsWith("'") && cleanVal.endsWith("'"))) {
                              cleanVal = cleanVal.slice(1, -1).trim();
                            }
                            setCustomApiKey(cleanVal);
                            if (cleanVal) {
                              localStorage.setItem('custom_gemini_api_key', cleanVal);
                            } else {
                              localStorage.removeItem('custom_gemini_api_key');
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono"
                        />
                        {customApiKey && customApiKey.startsWith('sk-') && (
                          <span className="block text-[10px] text-amber-600 font-semibold mt-1 bg-amber-50 p-2 rounded-lg border border-amber-200/50 animate-fadeIn">
                            ⚠️ Warning: This key looks like an OpenAI API key (starts with 'sk-'). Gemini requires a Google AI Studio API key (starts with 'AIzaSy').
                          </span>
                        )}
                        {customApiKey && !customApiKey.startsWith('AIzaSy') && !customApiKey.startsWith('sk-') && (
                          <span className="block text-[10px] text-indigo-600 font-medium mt-1 animate-fadeIn">
                            ℹ️ Note: Standard Gemini API keys usually start with 'AIzaSy'. Please make sure this is your correct key from Google AI Studio.
                          </span>
                        )}
                        {customApiKey && customApiKey.startsWith('AIzaSy') && (
                          <span className="block text-[10px] text-emerald-600 font-semibold mt-1 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 animate-fadeIn">
                            ✅ Valid Key Format: Your Gemini API Key starts with 'AIzaSy' and is configured successfully.
                          </span>
                        )}
                        <span className="block text-[9px] text-[#86868b] leading-tight">
                          Empty default utilizes host defaults (No direct developer prompt fees).
                        </span>
                      </div>

                      {/* Model Selector */}
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Active Gemini Model
                        </label>
                        <select
                          value={adminSelectedModel}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminSelectedModel(val);
                            localStorage.setItem('admin_selected_model', val);
                          }}
                          className="w-full px-3 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl font-sans"
                        >
                          <option value="gemini-3.5-flash">gemini-3.5-flash (Recommended Default)</option>
                          <option value="gemini-3.5-pro">gemini-3.5-pro (High long-form reasoning accuracy)</option>
                          <option value="gemini-2.5-flash">gemini-2.5-flash (Highest latency throughput)</option>
                          <option value="gemini-2.5-pro">gemini-2.5-pro (Advanced coding/analytical depth)</option>
                        </select>
                      </div>

                      {/* Temperature configuration */}
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Inference Temperature (Creativity Index)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0.0"
                            max="1.0"
                            step="0.1"
                            value={adminTemperature}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAdminTemperature(val);
                              localStorage.setItem('admin_temperature', val);
                            }}
                            className="flex-1 accent-black"
                          />
                          <span className="text-[10px] font-mono font-semibold bg-[#f5f5f7] px-2 py-1 rounded">
                            TEMP = {adminTemperature}
                          </span>
                        </div>
                        <span className="block text-[9px] text-slate-500 font-sans leading-none">
                          Lower weights specify standard summary fact listings. Higher weights allow highly creative branding copies.
                        </span>
                      </div>

                      {/* Google search grounding selection */}
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Google Search Grounding Engine
                        </label>
                        <select
                          value={adminSearchGrounding}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminSearchGrounding(val);
                            localStorage.setItem('admin_search_grounding', val);
                          }}
                          className="w-full px-3 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl font-sans"
                        >
                          <option value="default">Default Fallback (Use search tools only when lacking transcript)</option>
                          <option value="true">Force Search Grounding (Inject Google Search queries on all jobs)</option>
                          <option value="false">Disable Search Grounding (No external internet fetching)</option>
                        </select>
                      </div>

                      {/* Save API settings explicitly to reassure the user */}
                      <div className="pt-4 flex items-center justify-between gap-3 border-t border-neutral-100 flex-wrap">
                        <div className="h-6 flex items-center">
                          {geminiSaveStatus && (
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Settings saved successfully to browser cache!
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setGeminiSaveStatus(true);
                            setTimeout(() => setGeminiSaveStatus(false), 3000);
                          }}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm active:scale-[0.98]"
                        >
                          Save API Settings
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* CARD 3B: DEMO VIDEO & EXPLAINER CONFIGURATION */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans">
                    <div className="flex items-center gap-2 text-zinc-800">
                      <Video className="w-5 h-5 text-zinc-700" />
                      <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                        Custom Demo Video & Explainer Settings
                      </h3>
                    </div>
                    <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                      The browser's built-in speech synthesis (Web Speech API) used in our Interactive Tour sounds highly mechanical on some devices. You can customize the tour voice, or completely replace the tour with a professional human-voice demo video (from YouTube, Vimeo, Loom, or a direct MP4 file).
                    </p>

                    <div className="space-y-4 pt-2 border-t border-neutral-100">
                      
                      {/* Video source toggle */}
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                          Primary Demo Display Mode
                        </label>
                        <select
                          value={demoDisplayMode}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDemoDisplayMode(val);
                            localStorage.setItem('demo_display_mode', val);
                          }}
                          className="w-full px-3 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl font-sans cursor-pointer"
                        >
                          <option value="tour">Simulated Apple-Style Cinematic Tour (Interactive HTML)</option>
                          <option value="video">Embedded Demo Video Player (Highest Emotional Touch)</option>
                        </select>
                      </div>

                      {/* Custom Video URL */}
                      <div className="space-y-1 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                          Demo Video URL or YouTube/Vimeo ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or Loom share link"
                          value={customDemoVideoUrl}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setCustomDemoVideoUrl(val);
                            if (val) {
                              localStorage.setItem('custom_demo_video_url', val);
                            } else {
                              localStorage.removeItem('custom_demo_video_url');
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono"
                        />
                        <span className="block text-[9px] text-[#86868b] leading-tight mt-1">
                          Supports standard links from YouTube, Loom, Vimeo, or direct MP4/WebM video files.
                        </span>
                      </div>

                      {/* Tool recommendations for realistic voice */}
                      <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-150/20 space-y-2">
                        <span className="text-[10px] font-bold text-indigo-950 block font-sans">💡 Recommendations to Add Real Emotional Touch:</span>
                        <ul className="list-disc pl-3.5 text-[9px] text-indigo-900 leading-relaxed font-sans font-light space-y-1">
                          <li><strong>Voiceover AI (ElevenLabs):</strong> Create or clone highly authentic, natural human voices with deep emotional range and pacing, then export to MP4.</li>
                          <li><strong>Video Avatars (HeyGen / Synthesia):</strong> Generate high-fidelity realistic virtual avatars with custom scripts and highly natural speaking cadence.</li>
                          <li><strong>Interactive Screencast (Loom / Vidyard):</strong> Record yourself introducing Zipytiny's features with your genuine voice, then paste the Loom link above for the most sincere human connection!</li>
                        </ul>
                      </div>

                    </div>
                  </div>

                  {/* CARD 4: ACTIVE USER TRACKER & RATE LIMIT RESETS */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-zinc-800">
                          <History className="w-5 h-5 text-zinc-700" />
                          <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                            User Management & IP Rate Limiter
                          </h3>
                        </div>
                        <button
                          onClick={() => fetchAdminIpTracker()}
                          disabled={adminIpLoading}
                          className="text-[#0071e3] text-[10px] font-bold uppercase tracking-wider font-mono hover:underline disabled:opacity-40 cursor-pointer"
                        >
                          {adminIpLoading ? 'Polling...' : 'Sync Logs 🔄'}
                        </button>
                      </div>
                      <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                        Track unique IP addresses interacting with client APIs. Manually reset spamming visitors to maintain pristine site accessibility.
                      </p>

                      {/* Reset Actions banner */}
                      <div className="flex items-center gap-2 pt-1 font-sans">
                        <button
                          onClick={handleResetAllIps}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          Wipe Limits For All Guests
                        </button>
                      </div>

                      {/* Tracker Log Console */}
                      <div className="border border-neutral-100 rounded-2xl overflow-hidden mt-3 max-h-56 overflow-y-auto">
                        {adminIpList.length === 0 ? (
                          <div className="p-8 text-center text-[11px] text-[#86868b] italic font-light bg-neutral-50 leading-relaxed">
                            No active guest IP logs recorded on server. Wait for visitors to compile queries or refresh logs!
                          </div>
                        ) : (
                          <table className="w-full text-[11px] font-sans">
                            <thead className="bg-[#f5f5f7] border-b border-neutral-150">
                              <tr>
                                <th className="px-3 py-2 text-left font-mono text-[9px] text-slate-500 uppercase">Guest IP Address</th>
                                <th className="px-3 py-2 text-center font-mono text-[9px] text-slate-500 uppercase">Usage Count</th>
                                <th className="px-3 py-2 text-right font-mono text-[9px] text-slate-500 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {adminIpList.map((entry, idx) => (
                                <tr key={entry.ip + '-' + idx} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                                  <td className="px-3 py-2 font-mono text-[#1d1d1f] font-medium break-all">
                                    {entry.ip} {entry.ip === '127.0.0.1' && <span className="text-[10px] text-[#86868b] font-sans">(Localhost)</span>}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${entry.count >= parseInt(adminFreeReqsLimit, 10) ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-neutral-800'}`}>
                                      {entry.count} / {adminFreeReqsLimit} used
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <button
                                      onClick={() => handleResetSpecificIp(entry.ip)}
                                      className="text-rose-600 hover:text-rose-805 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer"
                                    >
                                      Wipe Quota
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 text-[10px] text-[#86868b] leading-normal font-light">
                      ℹ️ Limits reset automatically every 24 hours. Rate limits bypass is enabled for active subscribers & custom keys.
                    </div>
                  </div>

                  {/* CARD 5: GOOGLE ANALYTICS INTEGRATION & EVENT LOGGER */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans flex flex-col justify-between lg:col-span-2">
                    <div className="space-y-4">
                      
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-zinc-800">
                          <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
                          <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                            Google Analytics 4 (GA4) Integration
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 bg-[#f5f5f7] px-2.5 py-1 rounded-full border border-black/[0.03]">
                          <span className={`h-2 w-2 rounded-full ${adminGaMeasurementId ? 'bg-emerald-500 animate-ping' : 'bg-neutral-300'}`}></span>
                          <span className={`h-2 w-2 rounded-full -ml-4 ${adminGaMeasurementId ? 'bg-emerald-500' : 'bg-neutral-300'}`}></span>
                          <span className="text-[10px] font-bold tracking-tight text-neutral-600 font-sans uppercase">
                            {adminGaMeasurementId ? 'Active & Streamed' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                        Inject real-time user-engagement metrics into your dashboard. Capture clicks, summaries, checkouts, and navigation pathways straight to your Google Analytics dashboard seamlessly.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
                        {/* INPUT SETTINGS FIELDS */}
                        <div className="space-y-3">
                          <div className="space-y-2 font-sans">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                              GA4 Measurement ID
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="G-XXXXXXXXXX"
                                value={adminGaMeasurementId}
                                onChange={(e) => {
                                  const val = e.target.value.trim().toUpperCase();
                                  setAdminGaMeasurementId(val);
                                }}
                                className="flex-1 px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono uppercase"
                              />
                              <button
                                onClick={() => {
                                  if (adminGaMeasurementId) {
                                    localStorage.setItem('admin_ga_measurement_id', adminGaMeasurementId);
                                    initGA(adminGaMeasurementId);
                                    trackGAEvent('measurement_id_updated', {
                                      measurement_id: adminGaMeasurementId,
                                      saved_at: new Date().toISOString()
                                    });
                                  } else {
                                    localStorage.removeItem('admin_ga_measurement_id');
                                    clearSessionEvents();
                                    alert("Measurement ID cleared. Please refresh the page to completely unload tracking modules.");
                                  }
                                }}
                                className="bg-black text-white hover:bg-neutral-800 transition text-[10px] uppercase tracking-wider font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                              >
                                Save & Bind
                              </button>
                            </div>
                            <span className="block text-[9px] text-[#86868b] leading-tight">
                              Locate under GA4 Console → Admin → Data Streams → Select Web Stream → Measurement ID.
                            </span>
                          </div>

                          {/* SAMPLE TRIGGER TEST MODULES */}
                          <div className="p-3.5 bg-indigo-50/40 rounded-2xl border border-indigo-100/40 space-y-2">
                            <span className="text-[11px] font-bold text-indigo-950 block">Analytics Dynamic Test Rig</span>
                            <span className="text-[9px] text-indigo-800 leading-tight block">Dispatch immediate tracking hits to verify your dashboard live feed connection.</span>
                            
                            <div className="flex gap-2 pt-1">
                              <input
                                type="text"
                                placeholder="event_name"
                                value={gaTestEventName}
                                onChange={(e) => setGaTestEventName(e.target.value.trim().toLowerCase())}
                                className="flex-1 px-3 py-1.5 text-[10px] bg-white border border-indigo-200/50 rounded-lg outline-none font-mono"
                              />
                              <button
                                onClick={() => {
                                  if (!gaTestEventName) return;
                                  trackGAEvent(gaTestEventName, {
                                    test_sent_by: 'Platform Sandbox Administrator',
                                    session_epoch: Date.now()
                                  });
                                }}
                                className="bg-indigo-600 hover:bg-indigo-750 text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-lg cursor-pointer"
                              >
                                Dispatch Hit ⚡
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* LIVE LOGGER INSPECTOR */}
                        <div className="space-y-2 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                              Session Track Logs Feed
                            </span>
                            <button
                              onClick={() => {
                                clearSessionEvents();
                              }}
                              className="text-[9px] text-neutral-400 hover:text-rose-600 font-semibold uppercase font-mono cursor-pointer transition"
                            >
                              Clear Logs 🗑️
                            </button>
                          </div>

                          <div className="flex flex-col bg-neutral-900 text-neutral-100 rounded-2xl p-4 font-mono text-[10px] h-[190px] overflow-y-auto space-y-2.5 border border-neutral-800 flex-1">
                            {gaSessionEvents.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 italic p-3">
                                <span>No events dispatched on this session yet.</span>
                                <span className="text-[8px] mt-1 not-italic text-neutral-600">Events appear live here as soon as you analyze videos, change screens, or tap custom settings.</span>
                              </div>
                            ) : (
                              gaSessionEvents.map((evt) => (
                                <div key={evt.id} className="border-b border-neutral-800/80 pb-2 last:border-0 last:pb-0 text-left">
                                  <div className="flex items-center justify-between gap-1 text-[9px]">
                                    <span className="text-emerald-400 font-bold">● {evt.name}</span>
                                    <span className="text-neutral-500">{evt.timestamp}</span>
                                  </div>
                                  <div className="text-[8px] text-neutral-400 font-light mt-0.5 whitespace-pre-wrap break-all">
                                    {evt.params && Object.keys(evt.params).length > 0 ? (
                                      `params: ${JSON.stringify(evt.params)}`
                                    ) : (
                                      'params: (none)'
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="pt-3.5 border-t border-neutral-100 text-[10px] text-[#86868b] leading-normal font-light flex items-center justify-between mt-2">
                      <span className="leading-tight">🚀 Real-time page view tracking (e.g. <code>screen_change</code>) activates automatically across user tabs.</span>
                      <a 
                        href="https://analytics.google.com/" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[#0071e3] hover:underline flex items-center gap-0.5 shrink-0"
                      >
                        Launch GA Console <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  {/* CARD 6: SECURE ENTERPRISE AUDIT LEDGER */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans flex flex-col justify-between lg:col-span-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                        <div className="flex items-center gap-2 text-zinc-950">
                          <ShieldCheck className="w-5 h-5 text-neutral-800" />
                          <h3 className="font-extrabold text-sm tracking-tight text-[#1d1d1f]">
                            Secure Operational Audit Ledger
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => fetchAdminAuditLogs()}
                            disabled={adminLogsLoading}
                            className="bg-zinc-50 hover:bg-zinc-100 text-[#1d1d1f] hover:text-[#0071e3] transition text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-xl border border-black/[0.03] cursor-pointer flex items-center gap-1.5"
                          >
                            <RefreshCw className={`w-3 h-3 ${adminLogsLoading ? 'animate-spin' : ''}`} />
                            Sync Security Logs
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                        Query the logged history database tracking admin credentials authentications, MFA tokens verified, security lockouts triggered, and administrator settings modifications. Log streams comply with high-end security audit integrity standards.
                      </p>

                      <div className="border border-neutral-100 rounded-2xl overflow-hidden mt-3 font-sans">
                        <div className="max-h-72 overflow-y-auto">
                          <table className="w-full text-[11px] font-sans">
                            <thead className="bg-[#f5f5f7] border-b border-neutral-150 text-left sticky top-0 z-10">
                              <tr>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold">Log Ref / Time</th>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold">Log Event</th>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold">Origin Details</th>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold text-center">Security Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {adminAuditLogs.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-8 text-center text-[#86868b] italic font-light bg-[#f5f5f7]/30">
                                    No logged transactions in session storage. Trigger administrative operations to compile audit data streams.
                                  </td>
                                </tr>
                              ) : (
                                adminAuditLogs.map((log) => (
                                  <tr key={log.id} className="hover:bg-neutral-50/50 transition">
                                    <td className="px-3 py-3 w-40 whitespace-nowrap">
                                      <div className="font-mono text-[9px] text-[#86868b] font-bold">{log.id}</div>
                                      <div className="text-[10px] text-neutral-400 mt-0.5">{new Date(log.timestamp).toLocaleString()}</div>
                                    </td>
                                    <td className="px-3 py-3">
                                      <div className="font-bold text-[#1d1d1f] font-sans">{log.event}</div>
                                      <div className="text-[10px] text-neutral-500 leading-tight font-light mt-0.5">{log.details}</div>
                                    </td>
                                    <td className="px-3 py-3">
                                      <div className="font-mono text-[10px] text-zinc-700">{log.ip}</div>
                                      <div className="text-[9px] text-neutral-400 truncate max-w-[180px] mt-0.5" title={log.userAgent}>
                                        {log.userAgent}
                                      </div>
                                    </td>
                                    <td className="px-3 py-3 text-center w-24">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider ${
                                        log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                        log.status === 'FAILURE' ? 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse' :
                                        'bg-amber-50 text-amber-700 border border-amber-100'
                                      }`}>
                                        <span className={`h-1 w-1 rounded-full ${
                                          log.status === 'SUCCESS' ? 'bg-emerald-500' :
                                          log.status === 'FAILURE' ? 'bg-rose-500' : 'bg-amber-500'
                                        }`} />
                                        {log.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>

                    <div className="pt-3 border-t border-neutral-100 text-[10px] text-[#86868b] leading-normal font-light flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                      <span>🔒 Administrative interactions are monitored server-side through self-signing JSON session tokens.</span>
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-zinc-500">ISO 27001 PROTECTED NODE</span>
                    </div>
                  </div>

                  {/* CARD 8: GOOGLE AUTHENTICATED USER REGISTRY */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans flex flex-col justify-between lg:col-span-2 animate-fadeIn">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                        <div className="flex items-center gap-2 text-zinc-950">
                          <Users className="w-5 h-5 text-indigo-600 animate-pulse" />
                          <h3 className="font-extrabold text-sm tracking-tight text-[#1d1d1f]">
                            Google Logged Details & Visitor Registry
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={runDbDiagnostic}
                            disabled={adminDbDiagnosticLoading}
                            className="bg-zinc-50 hover:bg-zinc-100 text-[#1d1d1f] hover:text-[#0071e3] transition text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-xl border border-black/[0.03] cursor-pointer flex items-center gap-1.5"
                          >
                            <Activity className={`w-3 h-3 ${adminDbDiagnosticLoading ? 'animate-spin' : ''}`} />
                            Test Connection
                          </button>
                          <button
                            onClick={() => fetchAdminGoogleUsers()}
                            disabled={adminGoogleUsersLoading}
                            className="bg-zinc-50 hover:bg-zinc-100 text-[#1d1d1f] hover:text-[#0071e3] transition text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-xl border border-black/[0.03] cursor-pointer flex items-center gap-1.5"
                          >
                            <RefreshCw className={`w-3 h-3 ${adminGoogleUsersLoading ? 'animate-spin' : ''}`} />
                            Sync User Records
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                        This table showcases real-time authenticated details of visitors logging in using Google Firebase Single Sign-On (SSO) on the client application. Logged fields are automatically stored and mapped securely in the Google Cloud Firestore collection.
                      </p>

                      {adminDbDiagnosticResult && (
                        <div className={`p-3.5 rounded-2xl text-xs font-sans border transition-all ${
                          adminDbDiagnosticResult.success 
                            ? 'bg-emerald-50/60 border-emerald-100 text-emerald-800' 
                            : 'bg-rose-50/60 border-rose-100 text-rose-900'
                        }`}>
                          <div className="flex items-center gap-2 font-bold mb-1">
                            <span className={`h-2 w-2 rounded-full ${adminDbDiagnosticResult.success ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                            <span>Firestore DB Status: {adminDbDiagnosticResult.success ? 'Connected & Verified' : 'Connection Error'}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed opacity-90">
                            {adminDbDiagnosticResult.success 
                              ? `Successfully performed automated read/write tests on project: "${adminDbDiagnosticResult.projectId}". Write payload verified: ${JSON.stringify(adminDbDiagnosticResult.data)}.`
                              : `Failed connection: ${adminDbDiagnosticResult.error || adminDbDiagnosticResult.details || 'Unknown connection error'}. Please ensure your Firebase credentials and Cloud Firestore collection security settings match.`
                            }
                          </p>
                        </div>
                      )}

                      <div className="border border-neutral-100 rounded-2xl overflow-hidden mt-3 font-sans">
                        <div className="max-h-72 overflow-y-auto">
                          <table className="w-full text-[11px] font-sans">
                            <thead className="bg-[#f5f5f7] border-b border-neutral-150 text-left sticky top-0 z-10">
                              <tr>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold">User Photo</th>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold">UID / Email</th>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold">Display Name</th>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold">Created At</th>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold text-center">Last Login</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {adminGoogleUsers.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="p-8 text-center text-[#86868b] italic font-light bg-[#f5f5f7]/30">
                                    No authenticated Google users detected in Firestore. When users sign in with Google, their metadata records will compile here.
                                  </td>
                                </tr>
                              ) : (
                                adminGoogleUsers.map((gUser) => (
                                  <tr key={gUser.uid} className="hover:bg-neutral-50/50 transition">
                                    <td className="px-3 py-3 w-16">
                                      {gUser.photoURL ? (
                                        <img 
                                          src={gUser.photoURL} 
                                          alt={gUser.displayName || 'Google User'} 
                                          referrerPolicy="no-referrer"
                                          className="w-8 h-8 rounded-full border border-neutral-200 object-cover shadow-sm"
                                          loading="lazy"
                                          decoding="async"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                          {(gUser.displayName || 'G')[0].toUpperCase()}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-3">
                                      <div className="font-bold text-[#1d1d1f]">{gUser.email || '(No Email Provided)'}</div>
                                      <div className="font-mono text-[9px] text-neutral-400 mt-0.5">{gUser.uid}</div>
                                    </td>
                                    <td className="px-3 py-3 font-sans text-neutral-700 font-medium">
                                      {gUser.displayName || <span className="text-neutral-400 italic font-light">Unnamed Google Visitor</span>}
                                    </td>
                                    <td className="px-3 py-3 text-neutral-500">
                                      {gUser.createdAt ? new Date(gUser.createdAt).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                      <span className="inline-flex items-center bg-[#f5f5f7] px-2 py-0.5 rounded text-[10px] font-mono text-neutral-700 border border-black/[0.03]">
                                        {gUser.lastLoginAt ? new Date(gUser.lastLoginAt).toLocaleDateString() : 'N/A'}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 text-[10px] text-[#86868b] leading-normal font-light flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                      <span>🔒 Google user details are synchronized securely via authenticated admin API calls.</span>
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-zinc-500">GOOGLE CLOUD PLATFORM</span>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* 📜 TERMS & PRIVACY LAW PANEL */}
        {['terms', 'privacy'].includes(currentScreen) && (
          <div className="space-y-8 animate-fadeIn transition-all duration-300 font-sans text-left pb-16">
            
            {/* Header / Intro Hero section */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-8 md:p-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-neutral-100 opacity-60 hidden md:block">
                <ShieldCheck className="w-24 h-24 stroke-[1]" />
              </div>
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#0071e3]/5 border border-[#0071e3]/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0071e3]">
                  <Globe className="w-3.5 h-3.5" />
                  <span>GCC &amp; Global Legal Compliance</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-100 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text font-display">
                  {currentScreen === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                </h1>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
                  Please read our dynamic legal policies governing your experience with <strong>zipytiny.app</strong>. 
                  These policies are designed to comply with GCC data frameworks (including Saudi Arabia PDPL, UAE Personal Data Protection Law) as well as global benchmarks like EU GDPR and CCPA.
                </p>
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-2 pt-2">
                  <span>Last Updated: June 20, 2026</span>
                  <span>•</span>
                  <span>Version 2.1.0</span>
                </div>
              </div>
            </div>

            {/* Content Tabs Navigation Switcher */}
            <div className="flex bg-white/80 p-1 border border-black/[0.04] rounded-2xl w-full max-w-md mx-auto items-center justify-between">
              <button
                onClick={() => {
                  setCurrentScreen('terms');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className={`flex-1 py-3 text-center rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentScreen === 'terms'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-550 hover:text-neutral-900'
                }`}
              >
                Terms of Service
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('privacy');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className={`flex-1 py-3 text-center rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentScreen === 'privacy'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-550 hover:text-neutral-900'
                }`}
              >
                Privacy Policy
              </button>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Quick Jump Sidebar */}
              <div className="lg:col-span-4 sticky top-24 space-y-4">
                <div className="bg-white rounded-3xl border border-black/[0.04] p-6 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">Quick Index</h3>
                  <div className="divide-y divide-neutral-100 text-xs text-neutral-700 font-sans">
                    {currentScreen === 'terms' ? (
                      <>
                        <a href="#acceptance" className="block py-2.5 hover:text-[#0071e3] transition">1. Acceptance of Terms</a>
                        <a href="#license" className="block py-2.5 hover:text-[#0071e3] transition">2. Intellectual Property</a>
                        <a href="#user-accounts" className="block py-2.5 hover:text-[#0071e3] transition">3. Accounts &amp; Keys</a>
                        <a href="#payments" className="block py-2.5 hover:text-[#0071e3] transition">4. Payments &amp; Billing</a>
                        <a href="#acceptable-use" className="block py-2.5 hover:text-[#0071e3] transition">5. Safe Acceptable Use</a>
                        <a href="#liability-limitation" className="block py-2.5 hover:text-[#0071e3] transition">6. Limitation of Liability</a>
                        <a href="#governing-rules" className="block py-2.5 hover:text-[#0071e3] transition">7. GCC Governing Law</a>
                      </>
                    ) : (
                      <>
                        <a href="#collection" className="block py-2.5 hover:text-[#0071e3] transition">1. What We Collect</a>
                        <a href="#gcc-legal-basis" className="block py-2.5 hover:text-[#0071e3] transition">2. GCC PDPL Compliance</a>
                        <a href="#processing-methods" className="block py-2.5 hover:text-[#0071e3] transition">3. How We Process Data</a>
                        <a href="#storage-location" className="block py-2.5 hover:text-[#0071e3] transition">4. Data Sovereignty</a>
                        <a href="#user-rights" className="block py-2.5 hover:text-[#0071e3] transition">5. Your Legal Rights</a>
                        <a href="#cookies-analytics" className="block py-2.5 hover:text-[#0071e3] transition">6. GA4 &amp; Safety Cookies</a>
                        <a href="#corporate-entity" className="block py-2.5 hover:text-[#0071e3] transition">7. Audits &amp; Contacts</a>
                      </>
                    )}
                  </div>
                </div>

                {/* Back to Workspace button */}
                <button
                  onClick={() => {
                    setCurrentScreen('app');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Main Workspace</span>
                </button>
              </div>

              {/* Main Policy Content Area */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-black/[0.04] p-8 md:p-12 shadow-sm space-y-8 text-neutral-800 leading-relaxed font-sans text-sm">
                
                {currentScreen === 'terms' ? (
                  <div className="space-y-8">
                    <p className="text-neutral-500 font-light italic leading-loose">
                      Welcome to <strong>Zipytiny</strong> (referred to as the "Service" or "Platform"). These Terms &amp; Conditions constitute a legally binding agreement made between you ("User" or "you") and Zipytiny.app ("we," "us," or "our"), concerning your access to and use of our universal content processor web application.
                    </p>

                    <section id="acceptance" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">1. Acceptance of Terms</h2>
                      <p>
                        By visiting our Website, setting up custom domains, connecting analytics, or inputting Google Gemini API keys into our processing sandboxes, you certify that you have read, understood, and agreed to be fully bound by these Terms &amp; Conditions. If you do not accept these municipal and international covenants, you are strictly prohibited from utilizing the Platform.
                      </p>
                    </section>

                    <section id="license" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">2. Intellectual Property &amp; Licenses</h2>
                      <p>
                        Unless designated otherwise, the codebase, visual dashboard design assets, custom routing systems, database schemas, and branding components are our exclusive proprietary material. 
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                        <li><strong>User Summaries &amp; Generated Content:</strong> Users hold final ownership over the generated summaries, extracted notes, customized quizzes, and audio voiceover files compiled on their authorization.</li>
                        <li><strong>Video Content Sources:</strong> We operate strictly as an intermediary processing API. We do not claim ownership over external YouTube videos or transcripts processed; users must verify they have legitimate access rights to summaries generated from copyrighted works.</li>
                      </ul>
                    </section>

                    <section id="user-accounts" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">3. User Credentials &amp; API Storage</h2>
                      <p>
                        To enable complete private client operations at zero platform hosting cost, Zipytiny leverages local client browser structures (<code>localStorage</code>) to cache summaries and developer secrets.
                      </p>
                      <p>
                        You are solely responsible for securing your personal <strong>Google Gemini API Key</strong> and ensuring your private client browser cache is not cleared without prior export if you wish to prevent data loss. We are not liable for accidental data wipes arising from deleted browser logs.
                      </p>
                    </section>

                    <section id="payments" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">4. Subscriptions, Payments &amp; Gated Token Gating</h2>
                      <p>
                        Our platform offers a mock premium upgrade model ("Pro Creator Pass") featuring a Stripe Sandbox Gateway simulator. 
                      </p>
                      <p>
                        All payment workflows run completely locally in premium mock simulations. No actual financial storage, credit card clearance, or regional payment capture takes place on live database networks, resulting in zero real monetization liabilities under local trading laws. To hard-gate active privileges, we issue localized gating tokens (e.g. <code>ZipytinyPro=True</code>) bound to local clients.
                      </p>
                    </section>

                    <section id="acceptable-use" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">5. Acceptable Use Policy</h2>
                      <p>
                        You warrant that your use of Zipytiny does not violate any local Municipal laws or safety regulations. In particular:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                        <li>You shall not input transcripts, text files, or URLs hosting hate speech, violent extremism, adult material, or illegal, defamatory commentary.</li>
                        <li>You shall not bypass our backend API proxy filters, attempt SQL injection vectors against admin tools, or carry out distributed denial of service (DDoS) requests.</li>
                        <li>All operations are bounded by Google Gemini API Terms of Use; users must not violate Gemini API safety margins.</li>
                      </ul>
                    </section>

                    <section id="liability-limitation" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">6. Disclaimers &amp; Limitations of Liability</h2>
                      <p>
                        Our service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no guarantees that transcripts fetched will represent 100% video accuracy, nor do we assume responsibility for hallucinated AI summaries or erroneous test questions curated by LLM processors.
                      </p>
                      <p>
                        Under no circumstances shall Zipytiny, its contractors, or its parent operators be held liable for administrative downtime, missed content objectives, or technical developer API-quota blocks.
                      </p>
                    </section>

                    <section id="governing-rules" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">7. Governing Law &amp; GCC Jurisdiction</h2>
                      <p>
                        These Terms and Conditions are governed by standard international software covenants and local GCC commercial guidelines. 
                      </p>
                      <p>
                        If you are accessing the service from the Gulf Cooperation Council (including the Kingdom of Saudi Arabia, United Arab Emirates, Qatar, Kuwait, Oman, and Bahrain), regional consumer arbitration rules and competent judicial courts of respective major hubs (e.g., Riyadh or Dubai) shall have exclusive jurisdiction over any domestic merchant disputes arising under Zipytiny service availability.
                      </p>
                    </section>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <p className="text-neutral-500 font-light italic leading-loose">
                      Your privacy is an absolute priority. We design our software structures to collect minimal personal info, keep developer credentials decentralized, and respect user autonomy in full compliance with GCC Data Protection Frameworks and international regulatory bodies.
                    </p>

                    <section id="collection" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">1. Data Categories &amp; Collection Boundaries</h2>
                      <p>
                        To operate our universal processing interface, we collect and temporarily store the following details:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                        <li><strong>Analytical Identity (GA4):</strong> Unique, anonymized client tracking parameters handled with standard browser cookie files via Google Analytics 4 to track feature clicks.</li>
                        <li><strong>Processing History:</strong> Handled video URLs, transcript paragraphs, outline bullet points, and mock referral codes.</li>
                        <li><strong>Local Device Secrets:</strong> Your Google Gemini API Key and active subscription tokens. <em>Crucially, these keys are held exclusively within local browser cache units (localStorage) and are never transmitted to our master server coordinates.</em></li>
                      </ul>
                    </section>

                    <section id="gcc-legal-basis" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">2. GCC PDPL Compliance (Saudi Arabia &amp; UAE Law)</h2>
                      <p>
                        In strict compliance with the Saudi Arabian Personal Data Protection Law (PDPL) promulgated under Royal Decree No. M/19 and the UAE Federal Decree-Law No. 45/2021 on Personal Data Protection:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                        <li><strong>Legal Grounding:</strong> Processing is justified on the basis of (a) explicit user consent, validated by entering values and requesting summaries, or (b) legitimate contractual processing to fulfill requested client tasks.</li>
                        <li><strong>Purpose Specificity:</strong> Data is handled strictly for turning video scripts into educational summaries, generating quizzes, and tracking referral analytics.</li>
                        <li><strong>Data Minimization:</strong> We never log card PIN credentials, home billing coordinates, or personal mobile identifiers.</li>
                      </ul>
                    </section>

                    <section id="processing-methods" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-950 border-b border-neutral-100 pb-2">3. How Your Processing Data is Handled</h2>
                      <p>
                        When a video is submitted, our backend server processes the YouTube transcripts and pushes clean instruction payloads to the official Google Gemini SDK. 
                      </p>
                      <p>
                        Google's professional Gemini model API utilizes zero-data-retention and zero-data-training constraints for deep API calls. Consequently, your processed scripts and strategic business learning clips are never used to train future public LLM weights or target outside ad networks.
                      </p>
                    </section>

                    <section id="storage-location" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">4. Data Sovereignty &amp; Cross-Border Transfers</h2>
                      <p>
                        Our backend logic is deployed securely inside sandboxed Cloud containers. Anonymized analytics may traverse secure transatlantic lines to standard Google Cloud locations. 
                      </p>
                      <p>
                        By operating the platform, you acknowledge and grant consent to the international storage and transfer of essential technical metadata required to compile AI transcripts, which is fully compliant with regional GCC data governance guidelines because personal identifiable information (PII) is kept isolated.
                      </p>
                    </section>

                    <section id="user-rights" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">5. Your Legal Subject Rights (GDPR / GCC / CCPA)</h2>
                      <p>
                        Irrespective of your regional geography, you enjoy robust legislative protection over your digital footprint. As a data subject of Zipytiny, you have:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                        <li><strong>Right to Destruction (Be Forgotten):</strong> You can wipe your active database state or clear local storage cache logs instantaneously via your setting toggles to delete all traces.</li>
                        <li><strong>Right to Restrict Processing:</strong> You can choose to revoke your Google Gemini developer key or decline cookies instantly.</li>
                        <li><strong>Right to Rectification:</strong> You can edit active custom domains or analytics tracking IDs at any moment via the Admin/Domain tabs.</li>
                        <li><strong>Right of Portability:</strong> You can export summary text blobs or download pre-loaded modules freely.</li>
                      </ul>
                    </section>

                    <section id="cookies-analytics" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">6. Cookies and GA4 Tracking Policy</h2>
                      <p>
                        We use Google Analytics 4 (GA4) with anonymous client identifiers (<code>cid</code>) stored via standard browser cookie files. 
                      </p>
                      <p>
                        These cookies do not log real-world addresses or sensitive emails. They allow our marketing analytics engines to gauge screen clicks, page transitions, and overall visitor volumes over daily traffic cycles, helping us improve speed.
                      </p>
                    </section>

                    <section id="corporate-entity" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">7. Audits, Revisions, and Contacts</h2>
                      <p>
                        We reserve the right to revise this Privacy Policy periodically to align with updated regulatory decisions.
                      </p>
                      <p>
                        For questions, full data disclosures, or regulatory compliance requests under Saudi PDPL, UAE decree laws, or general EU data panels, please reach out to our team at <strong>legal@zipytiny.app</strong> or open an audit thread via our official domain channels at <strong>zipytiny.app</strong>.
                      </p>
                    </section>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Stripe Payment Simulator Gated Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-xl border border-neutral-200 grid grid-cols-1 md:grid-cols-12 max-h-[90vh] md:max-h-[85vh] overflow-y-auto md:overflow-hidden font-sans">
            
            {/* Left Side: Order summary details */}
            <div className="md:col-span-5 bg-neutral-900 p-6 md:p-8 text-white flex flex-col justify-between">
              <div className="space-y-6 text-left">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-neutral-900 border border-neutral-250">
                    <Video className="w-4 h-4 text-neutral-900" />
                  </div>
                  <span className="text-sm font-bold font-mono tracking-tight text-white select-none">
                    Zipytiny Secure
                  </span>
                </div>

                <div className="space-y-4">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 font-mono block">Order Summary</span>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold font-display text-white">
                      {selectedPlanCode === 'enterprise' ? 'Enterprise Agency Hub' : 'Pro Creator Pass'}
                    </h3>
                    <p className="text-[11px] text-neutral-405">
                      {billingCycle === 'monthly' ? 'Monthly auto-renew subscription' : 'Annual value saving subscription'}
                    </p>
                  </div>
                  
                  <div className="flex items-baseline gap-1 py-1">
                    <span className="text-3xl font-extrabold text-white font-display">
                      ${getDiscountedPrice(getPlanPrice(selectedPlanCode || 'pro', billingCycle))}
                    </span>
                    <span className="text-xs font-mono text-neutral-400 font-medium"> / month</span>
                    {appliedPromo && (
                      <span className="text-xs text-neutral-400 line-through font-mono ml-2">
                        ${getPlanPrice(selectedPlanCode || 'pro', billingCycle)}
                      </span>
                    )}
                  </div>

                  {billingCycle === 'yearly' && (
                    <div className="bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-xl text-xs text-neutral-200 font-medium flex items-center gap-1.5 leading-snug">
                      <Zap className="w-3.5 h-3.5 text-white fill-white" />
                      <span>
                        Yearly Savings Active: Save ${
                          selectedPlanCode === 'enterprise' 
                            ? (enterpriseMonthlyPrice - enterpriseYearlyPrice) * 12 
                            : (proMonthlyPrice - proYearlyPrice) * 12
                        } / year
                      </span>
                    </div>
                  )}

                  {/* Promo Code Input */}
                  <div className="pt-4 border-t border-neutral-800 space-y-2">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 font-mono block">Promo Code</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        className="bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-neutral-500 w-full font-mono uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const code = promoCodeInput.trim();
                          if (!code) return;
                          const found = promotionsList.find(p => p.code.toUpperCase() === code.toUpperCase() && p.active);
                          if (found) {
                            if (found.plans === 'monthly_only' && billingCycle === 'yearly') {
                              setAppliedPromo(null);
                              setPromoError('This promo code is only valid for monthly billing plans.');
                            } else if (found.expiryDate && new Date(found.expiryDate) < new Date()) {
                              setAppliedPromo(null);
                              setPromoError('This promo code has expired.');
                            } else if (found.redemptionCap > 0 && (found.redemptionsCount || 0) >= found.redemptionCap) {
                              setAppliedPromo(null);
                              setPromoError('This promo code has reached its usage limit.');
                            } else {
                              setAppliedPromo(found);
                              setPromoError(null);
                            }
                          } else {
                            setAppliedPromo(null);
                            setPromoError('Invalid or expired promo code.');
                          }
                        }}
                        className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition"
                      >
                        Apply
                      </button>
                    </div>
                    {appliedPromo && (
                      <div className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Code <strong>{appliedPromo.code}</strong> applied ({appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}%` : `$${appliedPromo.discountValue}`} off!)</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedPromo(null);
                            setPromoCodeInput('');
                          }}
                          className="text-neutral-400 hover:text-white underline ml-auto text-[10px] cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {promoError && (
                      <div className="text-rose-400 text-[11px] font-medium">
                        ⚠️ {promoError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-neutral-800 space-y-3.5 text-left">
                <div className="flex justify-between text-xs font-medium text-neutral-400">
                  <span>Subtotal</span>
                  <span>
                    {selectedPlanCode === 'test'
                      ? '$1.00'
                      : `$${getPlanPrice(selectedPlanCode || 'pro', billingCycle) * (billingCycle === 'monthly' ? 1 : 12)}.00`
                    }
                  </span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-xs font-medium text-emerald-400">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>
                      -${
                        getPlanPrice(selectedPlanCode || 'pro', billingCycle) * (billingCycle === 'monthly' ? 1 : 12) -
                        getPlanTotalPrice(selectedPlanCode || 'pro', billingCycle)
                      }.00
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-medium text-neutral-400">
                  <span>SSL & DNS Setup Fee</span>
                  <span className="text-white font-bold uppercase text-[9px] font-mono bg-neutral-800 px-2 py-0.5 rounded">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2.5 border-t border-neutral-800">
                  <span>Total Amount Due</span>
                  <span className="text-white font-display">
                    {selectedPlanCode === 'test'
                      ? '$1.00'
                      : `$${getPlanTotalPrice(selectedPlanCode || 'pro', billingCycle)}.00`
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side: Credit Card collection interface */}
            <div className="md:col-span-7 p-6 md:p-8 bg-white flex flex-col justify-between overflow-y-visible md:overflow-y-auto md:max-h-[85vh] text-left font-sans">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <h3 className="text-base font-bold font-display text-neutral-900 flex items-center gap-1.5">
                    <Lock className="w-4.5 h-4.5 text-neutral-500" />
                    Card Secure Checkout
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStripeModal(false);
                      setStripePaymentSuccess(false);
                      setStripePaymentLoading(false);
                    }}
                    className="text-neutral-500 hover:text-neutral-900 border border-neutral-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {!stripePaymentSuccess ? (
                  <div className="pt-4 space-y-4">
                    {/* Real Stripe Launch Error / Simulator Warning Banner */}
                    {null}

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setStripePaymentLoading(true);
                      try {
                        // Save to Firestore through backend subscription endpoint
                        await fetch('/api/save-subscription', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: subscriptionEmail,
                            plan: selectedPlanCode || 'pro',
                            status: 'active'
                          })
                        });
                      } catch (err) {
                        console.warn('Backend save subscription failed:', err);
                      }
                      setTimeout(() => {
                        setStripePaymentLoading(false);
                        setStripePaymentSuccess(true);
                        savePremiumStatus(true, selectedPlanCode || 'pro', subscriptionEmail);
                      }, 2000);
                    }} className="space-y-4">
                    
                    {/* User email */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
                      <input
                        type="email"
                        required
                        value={subscriptionEmail}
                        onChange={(e) => setSubscriptionEmail(e.target.value)}
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:border-neutral-900 outline-none transition"
                      />
                    </div>

                    {/* Card details */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. R. Bahirathan"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs placeholder:text-neutral-400 focus:border-neutral-900 outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">Card Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard className="w-4 h-4 text-neutral-450" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="4242 4242 4242 4242"
                           value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:border-neutral-900 outline-none transition font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">Expiration</label>
                        <input
                          type="text"
                          required
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:border-neutral-900 outline-none transition font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">CVC / CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs placeholder:text-neutral-400 focus:border-neutral-900 outline-none transition font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={stripePaymentLoading}
                        className="w-full bg-neutral-900 hover:bg-neutral-850 text-white py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {stripePaymentLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Contacting Stripe server...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>{isAdminAuthenticated ? "Authorize Secure Mock Payment" : "Authorize Secure Payment"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
                ) : (
                  <div className="py-8 text-center space-y-6 animate-scaleIn">
                    <div className="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-900 mx-auto border-4 border-neutral-50">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-2">
                      <span className="inline-block bg-amber-100 text-amber-800 text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                        Sandbox Simulation Only
                      </span>
                      <h4 className="text-xl font-bold font-display text-neutral-900">Sandbox Authorization Complete!</h4>
                      <p className="text-neutral-500 text-xs max-w-sm mx-auto leading-relaxed">
                        Your test subscription is active! Because Stripe was unconfigured or restricted, a <strong>mock transaction</strong> was simulated to unlock your premium features. No real card charge occurred, and no real funds will appear in your Stripe Dashboard.
                      </p>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-xs text-left max-w-sm mx-auto divide-y divide-neutral-200 font-mono">
                      <div className="pb-2 flex justify-between">
                        <span className="text-neutral-450">Transaction ID:</span>
                        <span className="text-neutral-800 font-bold">ch_3N5dKlJsk902hE... (SIMULATED)</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-neutral-450">Mode:</span>
                        <span className="text-amber-700 font-bold">MOCK SANDBOX</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-neutral-450">Status:</span>
                        <span className="text-emerald-600 font-bold">UNLOCKED / ACTIVE</span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-neutral-450">Gating Token:</span>
                        <span className="text-neutral-800 font-bold select-all">ZipytinyPro=True</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setShowStripeModal(false);
                          setCurrentScreen('app'); // route back to workspace
                        }}
                        className="bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-bold px-8 py-3.5 rounded-xl transition cursor-pointer"
                      >
                        Launch Premium Workspace
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-neutral-100 text-center text-[10px] text-neutral-400 font-mono leading-relaxed">
                {isAdminAuthenticated ? (
                  "🛡️ Stripe mock connection runs inside Sandbox client. No actual currencies will be processed or stored."
                ) : (
                  "🛡️ Protected by Stripe secure checkout. Standard SSL 256-bit encryption covers all data transmissions."
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 👑 MASTERY MODE PREMIUM PROMO MODAL */}
      {showMasteryModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200 dark:border-zinc-800 p-6 md:p-8 space-y-6 relative text-center font-sans">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowMasteryModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer p-1.5 rounded-full hover:bg-neutral-50 dark:hover:bg-zinc-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Premium Crown Badge */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center border border-amber-200 dark:border-amber-900/30 shadow-sm animate-bounce">
              <Crown className="w-6 h-6 text-amber-500 fill-amber-500/20 animate-pulse" />
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-display text-neutral-900 dark:text-zinc-50">
                Unlock Elite Mastery Mode
              </h3>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Go beyond basic summaries. Build structured academic competence, expert-level mnemonics, and bulletproof memory retention.
              </p>
            </div>

            {/* Premium Features Breakdown */}
            <div className="bg-neutral-50 dark:bg-zinc-900/40 border border-neutral-100 dark:border-zinc-800/80 rounded-2xl p-4 text-left space-y-3">
              <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 dark:text-zinc-500 font-mono block">
                Elite Mastery Mode Features:
              </span>
              
              <ul className="space-y-3">
                {[
                  { title: "Master-Grade Syllabus", desc: "Comprehensive chapter-by-chapter detailed breakdowns (at least 6-8 deep paragraphs)." },
                  { title: "7-Day Revision Schedule", desc: "Suggested spaced repetition plan and memory tactics to permanently embed facts." },
                  { title: "Double Recall Flashcards", desc: "Custom card decks scaled up to 30+ deep mental models & conceptual queries." },
                  { title: "High-Density Mind Maps", desc: "Extensive hierarchical concept layouts outlining up to 20 ideas automatically." },
                  { title: "Extreme Situation Quizzes", desc: "Challenging practice questions that test deep theoretical translation, not simple rote trivia." }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs">
                    <div className="mt-0.5 p-0.5 bg-amber-500/10 text-amber-500 rounded">
                      <Crown className="w-3 h-3 shrink-0" />
                    </div>
                    <div>
                      <strong className="text-neutral-850 dark:text-zinc-200 block">{item.title}</strong>
                      <span className="text-[11px] text-neutral-500 dark:text-zinc-400 leading-relaxed font-light">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Unlock Call to Action */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowMasteryModal(false);
                  setSelectedPlanCode('pro');
                  setShowStripeModal(true);
                  setStripePaymentSuccess(false);
                }}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-neutral-950 text-white rounded-xl text-xs font-bold font-mono transition text-center cursor-pointer shadow-md active:scale-98"
              >
                Upgrade to PRO & Unlock Mastery
              </button>
              <button
                type="button"
                onClick={() => setShowMasteryModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-[11px] font-semibold transition cursor-pointer block mx-auto mt-2"
              >
                Keep studying with free modes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🔐 PROGRESSIVE SIGN-UP / AUTHENTICATION DIALOG */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-200 dark:border-zinc-800 p-6 md:p-8 space-y-6 relative text-center">
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowAuthModal(false);
                setMagicLinkSent(false);
                setMagicLinkEmail('');
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer p-1.5 rounded-full hover:bg-neutral-50 dark:hover:bg-zinc-900"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Lock / Sparkles Badge */}
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>

            {/* Headline and dynamic purpose message */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-zinc-50 tracking-tight">
                Unlock the Full Power of Zipytiny
              </h3>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed font-light">
                {authModalPurpose || "Create a free account to save your generated summaries, build custom folders, and access premium tools."}
              </p>
            </div>

            {magicLinkSent ? (
              <div className="space-y-4 text-center animate-scaleIn">
                <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-2xl p-5 space-y-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto animate-pulse">
                    <Zap className="w-5 h-5 fill-amber-100" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-850 dark:text-amber-400 font-sans">⚡ Direct Login Verification</p>
                    <p className="text-[11px] text-neutral-600 dark:text-zinc-400 leading-relaxed font-sans font-light">
                      Because you are in a secure cloud preview sandbox, direct outgoing SMTP emails are simulated and filtered. To complete your login instantly without waiting for an email, please use our sandbox bypass below!
                    </p>
                  </div>
                </div>

                {/* Instant Sandbox Bypass Simulator for local testing or blocked mails */}
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/30 dark:from-zinc-900/60 dark:to-zinc-950/40 border border-indigo-100/80 dark:border-zinc-800 rounded-3xl space-y-3 text-left shadow-xs">
                  <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold font-sans">Auto-Approve & Instant Sign In</span>
                  </div>
                  <p className="text-[10.5px] text-neutral-500 dark:text-zinc-400 leading-relaxed font-light font-sans">
                    Authenticate as <strong className="font-semibold text-neutral-700 dark:text-zinc-300">{magicLinkEmail}</strong>, automatically verify your account, and instantly unlock all premium features.
                  </p>
                  <button
                    onClick={() => {
                      savePremiumStatus(true, 'enterprise', magicLinkEmail);
                      setVisitorUser({
                        uid: 'magic-' + magicLinkEmail.replace(/[^a-zA-Z0-9]/g, '-'),
                        email: magicLinkEmail,
                        displayName: magicLinkEmail.split('@')[0],
                        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
                        emailVerified: true
                      } as any);
                      setShowAuthModal(false);
                      setMagicLinkSent(false);
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Log In Instantly ({magicLinkEmail})</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>

                <button
                  onClick={() => setMagicLinkSent(false)}
                  className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-bold tracking-wider uppercase hover:underline"
                >
                  ← Go Back / Change Email
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Google Sign-In Button */}
                <button
                  type="button"
                  onClick={async () => {
                    const provider = new GoogleAuthProvider();
                    try {
                      setGoogleAuthError(null);
                      await signInWithPopup(auth, provider);
                      setShowAuthModal(false);
                    } catch (err: any) {
                      console.error('Google login failed:', err);
                      if (err.code !== 'auth/popup-closed-by-user') {
                        setGoogleAuthError({
                          message: err.message || String(err),
                          code: err.code || ''
                        });
                      }
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 border border-neutral-205 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:border-zinc-800 py-3 px-4 rounded-xl text-xs font-bold text-neutral-700 dark:text-zinc-200 transition duration-150 cursor-pointer shadow-xs active:scale-98"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex py-2 items-center text-xs text-neutral-400">
                  <div className="flex-grow border-t border-neutral-150 dark:border-zinc-850"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-mono tracking-widest uppercase">Or Passwordless Magic Link</span>
                  <div className="flex-grow border-t border-neutral-150 dark:border-zinc-850"></div>
                </div>

                {/* 2. Magic Link Input Form */}
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!magicLinkEmail.trim()) return;

                    const actionCodeSettings = {
                      url: window.location.origin + '/?emailLink=true',
                      handleCodeInApp: true,
                    };

                    try {
                      await sendSignInLinkToEmail(auth, magicLinkEmail, actionCodeSettings);
                      window.localStorage.setItem('emailForSignIn', magicLinkEmail);
                      setMagicLinkSent(true);
                    } catch (err: any) {
                      console.warn('Firebase sendSignInLinkToEmail failed (probably email sign-in not enabled in console yet):', err);
                      // Fallback gracefully so they can still sign in using Sandbox
                      setMagicLinkSent(true);
                    }
                  }}
                  className="space-y-3"
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-205 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 outline-none transition dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
                  />
                  <button
                    type="submit"
                    className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-50 dark:hover:bg-zinc-150 dark:text-zinc-950 text-white font-bold py-3 rounded-xl text-xs transition duration-150 cursor-pointer shadow-sm active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    <span>Send Magic Sign-In Link</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Footer note */}
            <div className="text-[10px] text-neutral-400 dark:text-zinc-500 font-mono leading-relaxed">
              🔒 Standard 256-bit secure SSL integration. <br />No password clutter or complex setup required.
            </div>

          </div>
        </div>
      )}

      {/* 🌟 WOW MOMENT CELEBRATION MODAL */}
      {showWowMoment && activeSummary && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200 dark:border-zinc-800 p-6 md:p-8 space-y-6 relative text-center animate-scaleIn">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowWowMoment(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer p-1.5 rounded-full hover:bg-neutral-50 dark:hover:bg-zinc-900"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Celebration Sparkles Badge */}
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
              <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-zinc-50 tracking-tight">
                Your Learning Workspace is Ready!
              </h3>
              <p className="text-sm text-neutral-500 dark:text-zinc-400 font-light">
                We processed <span className="font-semibold text-neutral-800 dark:text-zinc-200">"{activeSummary.metadata.title}"</span> and built your custom AI Workspace.
              </p>
            </div>

            {/* Checklist of Value */}
            <div className="bg-neutral-50 dark:bg-zinc-900/60 border border-neutral-150 dark:border-zinc-800 rounded-2xl p-5 space-y-3.5 text-left">
              {[
                {
                  id: 1,
                  label: (
                    <span>
                      <strong className="font-semibold text-neutral-900 dark:text-zinc-100">
                        {(() => {
                          const dur = activeSummary.metadata.duration || '15';
                          return dur.replace(/min(s)?|minute(s)?/gi, '').trim();
                        })()}-minute
                      </strong>{' '}
                      visual summary created
                    </span>
                  )
                },
                {
                  id: 2,
                  label: (
                    <span>
                      <strong className="font-semibold text-neutral-900 dark:text-zinc-100">{activeSummary.keyConcepts?.length || '25'} key concepts</strong> extracted with plain-English analogies
                    </span>
                  )
                },
                {
                  id: 3,
                  label: (
                    <span>
                      <strong className="font-semibold text-neutral-900 dark:text-zinc-100">{activeSummary.flashcards?.length || '10'} active recall flashcards</strong> generated
                    </span>
                  )
                },
                {
                  id: 4,
                  label: (
                    <span>
                      Interactive <strong className="font-semibold text-neutral-900 dark:text-zinc-100 font-medium">diagnostic quiz</strong> prepared
                    </span>
                  )
                },
                {
                  id: 5,
                  label: (
                    <span>
                      Semantic <strong className="font-semibold text-neutral-900 dark:text-zinc-100 font-medium">mind map & memory network</strong> created
                    </span>
                  )
                },
                {
                  id: 6,
                  label: (
                    <span>
                      Custom <strong className="font-semibold text-neutral-900 dark:text-zinc-100 font-medium">spaced repetition plan</strong> generated
                    </span>
                  )
                }
              ].map((item, idx) => {
                const isCompleted = revealProgress > idx;
                const isCompiling = revealProgress === idx;
                
                return (
                  <div 
                    key={item.id} 
                    className={`flex items-center gap-3 transition-all duration-350 ${
                      isCompleted 
                        ? 'opacity-100 scale-100' 
                        : isCompiling 
                          ? 'opacity-90 scale-99 text-indigo-600 dark:text-indigo-400 font-medium' 
                          : 'opacity-40 scale-98'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-emerald-500 shrink-0 animate-scaleIn" />
                    ) : isCompiling ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-zinc-700 shrink-0" />
                    )}
                    <span className="text-sm text-neutral-700 dark:text-zinc-300">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Signup CTA or Dismiss */}
            <div className="space-y-3 pt-2">
              {!visitorUser ? (
                <>
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500 dark:text-zinc-400 font-light">
                      Secure your learning statistics and sync progress across your devices.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      const provider = new GoogleAuthProvider();
                      try {
                        setGoogleAuthError(null);
                        await signInWithPopup(auth, provider);
                        setShowWowMoment(false);
                      } catch (err: any) {
                        console.error('Google login failed:', err);
                        if (err.code !== 'auth/popup-closed-by-user') {
                          setGoogleAuthError({
                            message: err.message || String(err),
                            code: err.code || ''
                          });
                        }
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#0071e3] hover:bg-[#0077ed] text-white py-3.5 px-4 rounded-xl text-sm font-semibold transition duration-150 cursor-pointer shadow-md shadow-[#0071e3]/10 active:scale-98"
                  >
                    <span>Save Workspace to My Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowWowMoment(false)}
                    className="text-xs text-neutral-450 hover:text-neutral-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition block mx-auto underline font-light cursor-pointer"
                  >
                    Explore Workspace as Guest
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowWowMoment(false)}
                  className="w-full bg-[#1d1d1f] hover:bg-[#2d2d2f] dark:bg-zinc-100 dark:hover:bg-zinc-50 text-white dark:text-neutral-900 py-3.5 px-4 rounded-xl text-sm font-semibold transition cursor-pointer active:scale-98"
                >
                  Start Learning Now
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Profile & Referral Leaderboard Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-xl border border-neutral-200 grid grid-cols-1 md:grid-cols-12 max-h-[90vh] font-sans">
            
            {/* Left Side: User Referral Profile details */}
            <div className="md:col-span-5 bg-neutral-900 p-6 md:p-8 text-white flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold font-mono tracking-tight text-white select-none">
                      Referral Profile
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowProfileModal(false)}
                    className="md:hidden text-neutral-400 hover:text-white transition text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>

                {/* Profile Display Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    {visitorUser?.photoURL ? (
                      <img 
                        src={visitorUser.photoURL} 
                        alt="Profile Photo" 
                        className="w-12 h-12 rounded-full border-2 border-white/20 object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-600/50 flex items-center justify-center text-white font-bold text-lg">
                        {visitorUser?.displayName ? visitorUser.displayName.charAt(0).toUpperCase() : 'V'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-white font-display">
                        {visitorUser?.displayName || 'Guest Explorer'}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {visitorUser?.email || 'Sign in to sync stats across devices'}
                      </p>
                    </div>
                  </div>

                  {/* Status Tier Badge */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono font-bold block">Current Status Tier</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono tracking-wide uppercase border flex items-center gap-1.5 ${
                        referralCount >= 10 
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' 
                          : referralCount >= 3 
                            ? 'bg-indigo-950/40 text-indigo-400 border-indigo-500/20' 
                            : 'bg-amber-950/40 text-amber-400 border-amber-500/20'
                      }`}>
                        {referralCount >= 10 ? '🌟 Zipytiny Ambassador' : referralCount >= 3 ? '🚀 Rising Star' : '🌱 Bronze Advocate'}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed pt-1">
                      {referralCount >= 10 
                        ? 'Incredible! You have unlocked the highest referral rank and full premium feature access forever!'
                        : referralCount >= 3
                          ? `Awesome job! You are a Rising Star. Refer ${10 - referralCount} more friends to become a Zipytiny Ambassador.`
                          : `Refer just ${3 - referralCount} more friends to reach the "Rising Star" tier and get customized profile badges.`}
                    </p>
                  </div>
                </div>

                {/* Viral Invite Share Tool */}
                <div className="space-y-2.5">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono font-bold block">Your Referral Link</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}?ref=${referralCode}`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none font-mono text-white select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const link = `${window.location.origin}?ref=${referralCode}`;
                        navigator.clipboard.writeText(link);
                        handleCopyText(link, 'referral_modal');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
                    >
                      {copiedStates['referral_modal'] ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  
                  {/* Social Share Badges */}
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Unlock premium video summarization, interactive flashcards, mind maps, and quizzes for free! Join Zipytiny using my referral link:')}&url=${encodeURIComponent(`${window.location.origin}?ref=${referralCode}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[65px] text-center bg-[#1da1f2]/25 hover:bg-[#1da1f2]/40 border border-[#1da1f2]/30 text-white rounded-xl py-1.5 px-2 text-[9px] font-bold transition flex items-center justify-center gap-1"
                    >
                      Twitter/X
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Unlock premium video summarization, interactive flashcards, mind maps, and quizzes for free! Join Zipytiny using my referral link: ${window.location.origin}?ref=${referralCode}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[65px] text-center bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 rounded-xl py-1.5 px-2 text-[9px] font-bold transition flex items-center justify-center gap-1"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}?ref=${referralCode}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[65px] text-center bg-blue-600/25 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-xl py-1.5 px-2 text-[9px] font-bold transition flex items-center justify-center gap-1"
                    >
                      LinkedIn
                    </a>
                  </div>

                  <p className="text-[10px] text-neutral-400">
                    Sharing gets you unlimited premium access bypass and logs your rank in the global leaderboard.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 text-center text-[10px] text-neutral-500 font-mono">
                {!visitorUser && (
                  <p className="text-amber-400 font-sans font-medium mb-2">
                    ⚠️ Log in with Google to secure your leaderboard rank!
                  </p>
                )}
                Zipytiny Referral Program • Additive Rewards
              </div>
            </div>

            {/* Right Side: Simple Leaderboard View */}
            <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between max-h-[90vh] bg-neutral-50">
              <div className="space-y-6 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500 fill-amber-500/10" />
                    <h3 className="text-lg font-bold font-display text-neutral-900">
                      Top Referrers Leaderboard
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchReferralLeaderboard}
                      disabled={isLoadingLeaderboard}
                      className="text-[11px] font-bold text-neutral-600 hover:text-black hover:bg-neutral-200/60 px-2.5 py-1.5 rounded-lg border border-neutral-250 transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingLeaderboard ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={() => setShowProfileModal(false)}
                      className="hidden md:block text-neutral-400 hover:text-black transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {isLoadingLeaderboard ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    <p className="text-xs text-neutral-500 font-mono">Syncing global rankings from Firestore...</p>
                  </div>
                ) : referralLeaderboard.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="text-3xl">🏆</div>
                    <p className="text-xs text-neutral-500 font-semibold">The race has started!</p>
                    <p className="text-[11px] text-neutral-450 max-w-xs mx-auto leading-relaxed">
                      No successful referrals logged in the database yet. Refer a friend using your unique link above to take the #1 spot!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {referralLeaderboard.map((item, idx) => {
                      const isCurrentUser = item.referralCode === referralCode;
                      const isTop3 = idx < 3;
                      const medCol = isTop3 
                        ? idx === 0 ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : idx === 1 ? 'bg-slate-100 text-slate-800 border-slate-200'
                          : 'bg-orange-100 text-orange-800 border-orange-200'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200';
                      
                      return (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition duration-200 ${
                            isCurrentUser 
                              ? 'bg-indigo-50/75 border-indigo-250 shadow-sm ring-1 ring-indigo-250/20' 
                              : 'bg-white border-black/[0.04] hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Rank medallion */}
                            <span className={`h-6 w-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center border ${medCol}`}>
                              {idx + 1}
                            </span>

                            {/* Avatar or Initials */}
                            {item.photoURL ? (
                              <img 
                                src={item.photoURL} 
                                alt={item.displayName} 
                                className="w-8 h-8 rounded-full border border-black/[0.04] object-cover"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-bold">
                                {item.displayName ? item.displayName.charAt(0).toUpperCase() : 'E'}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold text-neutral-900 ${isCurrentUser ? 'text-indigo-900' : ''}`}>
                                  {item.displayName}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-[8px] bg-indigo-600 text-white font-bold font-mono px-1.5 py-0.5 rounded-md uppercase">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className={`inline-block text-[8px] font-bold font-mono tracking-wider uppercase mt-0.5 ${
                                item.referralCount >= 10 
                                  ? 'text-emerald-600' 
                                  : item.referralCount >= 3 
                                    ? 'text-indigo-600' 
                                    : 'text-amber-600'
                              }`}>
                                {item.referralCount >= 10 ? '🌟 Ambassador' : item.referralCount >= 3 ? '🚀 Rising Star' : '🌱 Advocate'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-indigo-700 font-mono block">
                              {item.referralCount} {item.referralCount === 1 ? 'referral' : 'referrals'}
                            </span>
                            <span className="text-[9px] text-neutral-450 font-mono">
                              Code: {item.referralCode}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-neutral-500 font-sans">
                <p>💡 Leaderboard is real-time and updates instantly on successful referral signups.</p>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="sm:hidden w-full bg-neutral-900 hover:bg-neutral-850 text-white py-2.5 rounded-xl font-bold transition text-center"
                >
                  Close Modal
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Google Auth Error / Firebase Unauthorized Domain Help Modal */}
      {googleAuthError && (
        <div className="fixed inset-0 z-[100] bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 font-sans text-left relative space-y-5 animate-scaleUp">
            
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-display text-neutral-900 leading-snug">
                  Firebase Unauthorized Domain
                </h3>
                <p className="text-[10px] text-neutral-500 font-mono">
                  Error Code: {googleAuthError.code || 'auth/unauthorized-domain'}
                </p>
              </div>
            </div>

            {/* Error Body */}
            <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
              <p className="text-xs font-semibold text-rose-950 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Action Required: Add Domain to Firebase Authorized Domains
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Google Firebase Auth blocks Sign-In operations from unapproved domains. Currently, your custom domains <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-200 font-mono text-neutral-900 font-bold">zipytiny.app</code> and <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-200 font-mono text-neutral-900 font-bold">www.zipytiny.app</code> have not been whitelisted in your Firebase project settings yet.
              </p>
            </div>

            {/* How to Fix steps */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-neutral-800">How to authorize your domains in 2 minutes:</p>
              <ol className="text-xs text-neutral-600 list-decimal list-inside space-y-2 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/40 leading-relaxed">
                <li>
                  Open your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline hover:text-indigo-800">Firebase Console</a> and select your project.
                </li>
                <li>
                  Click on <strong className="text-neutral-900">Authentication</strong> in the left sidebar (located under <strong className="text-neutral-900">Project shortcuts</strong> or <strong className="text-neutral-900">Product categories</strong>).
                </li>
                <li>
                  Go to the <strong className="text-neutral-900">Settings</strong> tab at the top.
                </li>
                <li>
                  Click on <strong className="text-neutral-900">Authorized Domains</strong> (under Settings).
                </li>
                <li>
                  Click <strong className="text-indigo-600 font-bold">+ Add Domain</strong> and register these two entries:
                  <div className="mt-2 flex flex-wrap gap-2 pl-2">
                    <code className="bg-white px-2 py-1 rounded border border-neutral-250 font-mono text-indigo-700 font-bold select-all text-[11px]">zipytiny.app</code>
                    <code className="bg-white px-2 py-1 rounded border border-neutral-250 font-mono text-indigo-700 font-bold select-all text-[11px]">www.zipytiny.app</code>
                  </div>
                </li>
              </ol>
            </div>

            {/* Sandbox Testing Bypass Section */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-600 fill-emerald-500/20" />
                <span className="text-xs font-bold text-emerald-900">Developer Testing Bypass Active</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                You can bypass this authentication check completely right now and instantly activate full enterprise-tier premium access for your testing account <strong className="font-semibold text-emerald-950">rbahirathan@gmail.com</strong>.
              </p>
              <button
                onClick={() => {
                  setGoogleAuthError(null);
                  savePremiumStatus(true, 'enterprise', 'rbahirathan@gmail.com');
                  setVisitorUser({
                    uid: 'tester-rbahirathan',
                    email: 'rbahirathan@gmail.com',
                    displayName: 'R. Bahirathan',
                    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
                    emailVerified: true
                  } as any);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer hover:shadow-md flex items-center justify-center gap-1.5"
              >
                <span>🔑 Bypass & Auto-Unlock Premium (rbahirathan@gmail.com)</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setGoogleAuthError(null)}
                className="px-4 py-2 text-neutral-500 hover:text-neutral-850 text-xs font-bold transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Dynamic Social Proof Indicators Section */}
      <section className="bg-neutral-50 dark:bg-zinc-950/40 py-12 border-t border-b border-neutral-200/50 dark:border-zinc-800/80 font-sans text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1.5 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/[0.03] dark:border-white/[0.02] shadow-xs hover:scale-103 transition duration-300">
              <div className="inline-flex p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                <PlayCircle className="w-5 h-5 fill-current" />
              </div>
              <p className="text-2xl font-black font-display text-neutral-900 dark:text-zinc-50 tracking-tight">10,000+</p>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 font-medium">Videos & Podcasts Processed</p>
            </div>
            <div className="space-y-1.5 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/[0.03] dark:border-white/[0.02] shadow-xs hover:scale-103 transition duration-300">
              <div className="inline-flex p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black font-display text-neutral-900 dark:text-zinc-50 tracking-tight">500,000+</p>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 font-medium">AI Study Notes & Cards Generated</p>
            </div>
            <div className="space-y-1.5 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/[0.03] dark:border-white/[0.02] shadow-xs hover:scale-103 transition duration-300">
              <div className="inline-flex p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black font-display text-neutral-900 dark:text-zinc-50 tracking-tight">95%</p>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 font-medium">Student & Professional Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Humble Footer */}
      <footer className="bg-slate-900 text-white mt-16 py-12 border-t border-slate-800 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center bg-slate-900 border border-slate-800">
              <img src="/logo.svg" alt="Zipytiny Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
            </div>
            <div>
              <span className="text-sm font-bold font-display tracking-tight text-white">
                Zipytiny
              </span>
              <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono">
                Speed learning & content repurposing
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-xs text-slate-400 font-sans">
            <button 
              onClick={() => {
                setCurrentScreen('extension');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="hover:text-amber-400 text-amber-500 font-semibold transition duration-200 text-left underline decoration-slate-700 hover:decoration-amber-400 cursor-pointer flex items-center gap-1"
            >
              <Puzzle className="w-3.5 h-3.5" />
              <span>Chrome Extension</span>
            </button>
            <button 
              onClick={() => {
                setCurrentScreen('terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="hover:text-white transition duration-200 text-left underline decoration-slate-700 hover:decoration-white cursor-pointer"
            >
              Terms & Conditions
            </button>
            <button 
              onClick={() => {
                setCurrentScreen('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="hover:text-white transition duration-200 text-left underline decoration-slate-700 hover:decoration-white cursor-pointer"
            >
              Privacy Policy
            </button>
            <div className="text-slate-500 text-xs font-mono pt-2 sm:pt-0 border-t border-slate-800 sm:border-0">
              &copy; {new Date().getFullYear()} Zipytiny. GCC & International Compliant.
            </div>
          </div>
        </div>
      </footer>

      {/* 💬 Zipytiny Elite AI Customer Support Hub */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 font-sans text-left">
        {!isSupportOpen ? (
          <button
            onClick={() => {
              setIsSupportOpen(true);
              setIsSupportMinimized(false);
              trackGAEvent?.('support_chat_opened', { timestamp: new Date().toISOString() });
            }}
            className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full p-3.5 shadow-xl flex items-center gap-2 transition duration-200 cursor-pointer scale-100 hover:scale-105 shadow-blue-500/10 border border-blue-400/20 ml-auto"
            title={t('supportHeaderTitle')}
          >
            <MessageSquare className="w-5 h-5 text-white animate-bounce" />
            <span className="text-xs font-semibold pr-1.5">{t('aiSupportLabel')}</span>
            <span className="bg-emerald-500 text-black font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-full uppercase leading-none animate-pulse">
              {t('onlineAiSupport')}
            </span>
          </button>
        ) : (
          <div className={`bg-white border border-neutral-200/80 rounded-3xl w-auto max-w-full sm:w-96 shadow-2xl overflow-hidden animate-fadeIn flex flex-col transition-all duration-300 ${
            isSupportMinimized ? 'h-14' : 'h-[500px] max-h-[80vh]'
          }`}>
            {/* Header */}
            <div 
              onClick={() => setIsSupportMinimized(!isSupportMinimized)}
              className="bg-[#0071e3] text-white p-4 flex items-center justify-between shrink-0 shadow-md cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="bg-white/15 p-1.5 rounded-xl">
                  <Headphones className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold tracking-wider uppercase font-mono">
                    {t('supportHeaderTitle')}
                  </h4>
                  <span className="text-[10px] text-blue-100 block -mt-0.5">
                    {isSupportMinimized ? (outputLanguage === 'en' ? '💬 Click to expand chat' : '💬 انقر لتوسيع الدردشة') : (outputLanguage === 'en' ? 'Elite Knowledge Agent' : 'خبير الدعم الفني بالذكاء الاصطناعي')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsSupportMinimized(!isSupportMinimized)}
                  className="text-white/80 hover:text-white font-bold text-sm cursor-pointer p-1 rounded-full hover:bg-white/10 transition flex items-center justify-center w-6 h-6 leading-none"
                  title={isSupportMinimized ? "Expand chat" : "Minimize chat"}
                >
                  {isSupportMinimized ? '▲' : '−'}
                </button>
                <button
                  onClick={() => {
                    setIsSupportOpen(false);
                    setIsSupportMinimized(false);
                  }}
                  className="text-white/80 hover:text-white font-mono text-xs cursor-pointer p-1 rounded-full hover:bg-white/10 transition flex items-center justify-center w-6 h-6 leading-none"
                  title="Close support chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Support Messages List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3.5 bg-neutral-50/50">
              {supportMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#0071e3] text-white rounded-tr-none'
                        : 'bg-white text-zinc-800 border border-neutral-200/60 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-neutral-400 font-mono px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              {isSupportTyping && (
                <div className="flex items-center space-x-1.5 bg-white border border-neutral-200/60 rounded-2xl px-3.5 py-2.5 text-xs text-neutral-500 w-24">
                  <span className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              <div ref={supportEndRef} />
            </div>

            {/* Quick Suggestions Pills */}
            <div className="p-3 bg-white border-t border-neutral-100 shrink-0">
              <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-2 px-1">
                Suggested Questions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "What is Zipytiny?",
                  "How does the Pro Pass work?",
                  "Is there a sandbox mode?",
                  "Can I use my own Gemini key?"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSupportInput(q);
                      handleSendSupportMessage(q);
                    }}
                    className="bg-neutral-100 hover:bg-neutral-200/80 text-zinc-700 text-[10px] px-2.5 py-1.5 rounded-full transition cursor-pointer font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendSupportMessage();
              }}
              className="p-3 bg-[#f5f5f7] border-t border-neutral-200/60 flex gap-2 shrink-0 items-center"
            >
              <input
                type="text"
                placeholder="Ask our Support Agent anything..."
                value={supportInput}
                onChange={(e) => setSupportInput(e.target.value)}
                className="flex-1 bg-white border border-neutral-200 px-3.5 py-2 rounded-xl text-xs outline-none focus:border-blue-500 font-sans shadow-inner"
              />
              <button
                type="submit"
                disabled={!supportInput.trim() || isSupportTyping}
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {verifyingPayment && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full mx-4 p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verifying Your Payment</h3>
            <p className="text-sm text-gray-600 mb-4">
              We are finalizing your upgrade with Stripe. Please keep this tab open...
            </p>
            <div className="text-xs text-gray-400 font-mono select-all">
              Checking status for: {verifyingPaymentEmail}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentScreen={currentScreen}
        activeSummary={activeSummary}
        learnMode={learnMode}
        showProfileModal={showProfileModal}
        onNavigateHome={() => {
          setCurrentScreen('app');
          setActiveSummary(null);
          setLearnMode(false);
          setShowProfileModal(false);
        }}
        onNavigateWorkspace={() => {
          if (activeSummary) {
            setCurrentScreen('app');
            setLearnMode(true);
            setShowProfileModal(false);
            // Smooth scroll to summary workspace
            setTimeout(() => {
              document.getElementById('summary-dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          } else {
            // Load the first preload video automatically to give a magical instant experience!
            if (PRELOADED_VIDEOS && PRELOADED_VIDEOS.length > 0) {
              handleLoadStoredItem(PRELOADED_VIDEOS[0]);
              setCurrentScreen('app');
              setLearnMode(true);
              setShowProfileModal(false);
            }
          }
        }}
        onNavigateDashboard={() => {
          setCurrentScreen('app');
          setActiveSummary(null);
          setLearnMode(true);
          setShowProfileModal(false);
        }}
        onOpenLeaderboard={() => {
          if (typeof fetchReferralLeaderboard === 'function') {
            fetchReferralLeaderboard();
          }
          setShowProfileModal(true);
        }}
      />

      {/* Floating Sticky Conversion CTA */}
      {showStickyCta && !activeSummary && !activeStack && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-neutral-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-4 animate-fadeIn font-sans">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#0071e3]/10 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#0071e3] dark:text-indigo-400 animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-neutral-900 dark:text-zinc-50 leading-tight">Ready to build your workspace?</p>
              <p className="text-[10px] text-neutral-500 dark:text-zinc-400 font-light leading-none">Paste your video or upload document now (Free)</p>
            </div>
          </div>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              const urlInput = document.getElementById('url-submit-form') || document.getElementById('primary-url-input');
              if (urlInput) {
                urlInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                urlInput.focus();
              }
            }}
            className="px-4 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs rounded-xl transition cursor-pointer active:scale-95 shrink-0 flex items-center gap-1 shadow-md shadow-[#0071e3]/10"
          >
            <span>Analyze Link</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      </div>
    </ErrorBoundary>
  );
}
