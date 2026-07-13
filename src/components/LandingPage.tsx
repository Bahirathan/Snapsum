import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Zap, ArrowRight, CheckCircle, FileText, Globe, MessageSquare, 
  Video, Play, Bookmark, Headphones, Users, ChevronDown, Download, Award,
  Upload, Brain, Share2, Star, TrendingUp, Clock, Shield, Cpu,
  BarChart2, Layers, BookOpen, Mic, PenTool, Hash, ChevronRight,
  Youtube, Presentation, HelpCircle, Lock, Calculator, Settings, Gift
} from 'lucide-react';
import { CinematicExplainer } from './CinematicExplainer';

interface LandingPageProps {
  onLaunchApp: (targetTab?: string, targetSubTab?: string) => void;
  onNavigateToFeature?: (featureSlug: string) => void;
  onUpgrade: () => void;
  isPremium: boolean;
  visitorUser: any;
  onGoogleSignIn: () => void;
  onStartFreeSummary?: (input: string, type?: 'video' | 'website' | 'file' | 'text', filesList?: any[]) => void;
}

// Interactive Preloaded Topics for the Live Sandbox Demo
const TOPIC_PREVIEWS = {
  startup: {
    title: "AI Startup Playbook",
    sourceName: "Startup School: Building the Future",
    sourceDuration: "135 Min",
    summaryTitle: "Executive Briefing: Agentic Workflows",
    summaryText: "In this comprehensive breakdown, we examine the fundamental structures of building high-performance AI startups in 2026. The shift from traditional SaaS architectures to agentic workflows is driving a 10x reduction in development overhead while maximizing customer experience.\n\nKey areas explored include serverless backend optimization, deploying state-of-the-art open-source LLMs like Llama 3, and integrating secure vector databases for persistent multi-modal reasoning capability.",
    notes: [
      { label: "1. Core Paradigm Shift", text: "Traditional coding relies on explicit rules. Machine learning instead infers those rules from input-output training patterns." },
      { label: "2. Weight Optimization", text: "Backpropagation calculates error gradients backwards through neural layers, tuning node weights via gradient descent." }
    ],
    mindmapNodes: [
      "🧠 AI Startup Architecture",
      "  ├── 🤖 Agentic Workflows (10x overhead reduction)",
      "  │   ├── Autonomic Routing",
      "  │   └── Dynamic Tool Calling",
      "  ├── 💾 Vector Databases",
      "  │   └── Multi-Modal Contextual Retrieval",
      "  └── ☁️ Infrastructure Layer"
    ],
    flashcardText: "What is the core benefit of compiling vector embeddings in-memory?",
    flashcardAnswer: "It enables up to 100x cheaper semantic lookup speeds compared to traditional external database queries.",
    quizQuestion: "Which index technology is recommended for 100x cheaper LLM reasoning in 2026?",
    quizOptions: [
      "In-Memory Key-Value Vector Database Indexes",
      "Legacy SQL Relational B-Trees",
      "Standard JSON Flat Files",
      "Public general REST APIs"
    ],
    quizAnswerIndex: 0,
    quizExplanation: "In-memory key-value vector database indexes enable lightning-fast semantic retrieval at a fraction of the hardware cost compared to legacy architectures."
  },
  deeplearning: {
    title: "Deep Learning Mechanics",
    sourceName: "MIT 6.S191: Intro to Deep Learning",
    sourceDuration: "90 Min",
    summaryTitle: "Executive Briefing: Backpropagation & Loss",
    summaryText: "An exploration of neural networks, focusing on feedforward propagation, activation functions like ReLU or Sigmoid, and loss calculation. The session covers how multi-layered perceptrons learn by backpropagating errors and updating weight vectors via stochastic gradient descent.\n\nWe analyze mathematical foundations, optimization algorithms (Adam, RMSProp), and standard overfitting mitigation strategies (dropout, batch normalization).",
    notes: [
      { label: "1. Non-linear Activation", text: "Non-linear activation functions are critical; without them, multi-layer networks collapse into simple linear models." },
      { label: "2. Gradient Updates", text: "The Adam optimizer combines the benefits of AdaGrad and RMSProp, adjusting individual learning rates per parameter." }
    ],
    mindmapNodes: [
      "🧠 Deep Learning Foundations",
      "  ├── 🕸️ Neural Networks",
      "  │   ├── Feedforward Architecture",
      "  │   └── Activation Functions (ReLU, Sigmoid)",
      "  ├── 📉 Optimization Algorithms",
      "  │   └── SGD, RMSProp, Adam"
    ],
    flashcardText: "What optimizer combines benefits of AdaGrad and RMSProp?",
    flashcardAnswer: "The Adam optimizer, which dynamically adjusts individual learning rates per parameter using momentum estimates.",
    quizQuestion: "What is the primary purpose of an activation function in deep neural networks?",
    quizOptions: [
      "To introduce non-linearity into the mathematical model",
      "To store the input training features permanently",
      "To calculate the final testing accuracy percentage",
      "To compile the source code for GPU processing"
    ],
    quizAnswerIndex: 0,
    quizExplanation: "Activation functions introduce non-linearity, allowing neural networks to model complex, non-linear relationships in data."
  },
  productivity: {
    title: "Advanced Time Management",
    sourceName: "Stanford: Peak Cognitive Performance",
    sourceDuration: "110 Min",
    summaryTitle: "Executive Briefing: Focus & Energy Allocation",
    summaryText: "A masterclass on deep work, cognitive energy allocation, and anti-procrastination frameworks. Focuses on the Eisenhower Matrix for prioritization, the Pomodoro Technique for cognitive pacing, and eliminating digital friction.\n\nLearn how high-performing individuals schedule 'deep work' blocks, manage attention residue, and engineer high-focus environments to maximize creative output.",
    notes: [
      { label: "1. Cognitive Attention Residue", text: "Context switching carries a heavy cognitive penalty called attention residue, lasting up to 20 minutes." },
      { label: "2. Priority Matrix", text: "The Eisenhower Matrix splits tasks into four quadrants based on Urgency and Importance." }
    ],
    mindmapNodes: [
      "🧠 Focus & Productivity",
      "  ├── ⏰ Attention Engineering",
      "  │   ├── Deep Work Scheduling",
      "  │   └── Pomodoro Technique",
      "  ├── 🎯 Prioritization Frameworks",
      "  │   └── Eisenhower Matrix"
    ],
    flashcardText: "What cognitive phenomenon describes the temporary loss of focus caused by switching tasks?",
    flashcardAnswer: "Attention Residue, which is the carry-over of cognitive focus from a previous task, impairing performance on the next task.",
    quizQuestion: "Which quadrant of the Eisenhower Matrix should be handled first?",
    quizOptions: [
      "Quadrant I: Urgent & Important",
      "Quadrant II: Not Urgent but Important",
      "Quadrant III: Urgent but Not Important",
      "Quadrant IV: Not Urgent & Not Important"
    ],
    quizAnswerIndex: 0,
    quizExplanation: "Quadrant I covers critical, time-sensitive priorities that require immediate attention to prevent operational failure."
  }
};

export default function LandingPage({ 
  onLaunchApp, 
  onNavigateToFeature, 
  onUpgrade, 
  isPremium, 
  visitorUser, 
  onGoogleSignIn, 
  onStartFreeSummary 
}: LandingPageProps) {
  
  // App states
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ytUrl, setYtUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [landingSourceType, setLandingSourceType] = useState<'video' | 'website' | 'file' | 'text'>('video');
  const [landingWebsiteUrl, setLandingWebsiteUrl] = useState('');
  const [landingPastedText, setLandingPastedText] = useState('');
  const [landingFiles, setLandingFiles] = useState<{name: string; size: number; type: string; textContent?: string}[]>([]);
  const [landingIsDragActive, setLandingIsDragActive] = useState(false);
  const [showAdvancedLanding, setShowAdvancedLanding] = useState(false);

  // Use Case Switcher State
  const [activeUseC, setActiveUseC] = useState<'students' | 'professionals' | 'teachers' | 'researchers'>('students');

  // Interactive Live Active Preview Demo Simulation
  const [selectedTopic, setSelectedTopic] = useState<'startup' | 'deeplearning' | 'productivity'>('startup');
  const [demoStep, setDemoStep] = useState<'before' | 'analyzing' | 'generating' | 'after'>('after');
  const [demoProgress, setDemoProgress] = useState(100);
  const [demoActiveTab, setDemoActiveTab] = useState<'summary' | 'notes' | 'mindmap' | 'flashcard' | 'quiz'>('summary');
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [isPlayingFlow, setIsPlayingFlow] = useState(true);
  const [weeklyHours, setWeeklyHours] = useState(12);

  // Auto-progression logic for the mockup simulation
  useEffect(() => {
    if (!isPlayingFlow) return;

    let timer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;
    let cycleInterval: NodeJS.Timeout;

    if (demoStep === 'before') {
      timer = setTimeout(() => {
        setDemoStep('analyzing');
        setDemoProgress(0);
      }, 3500);
    } else if (demoStep === 'analyzing') {
      let currentProgress = 0;
      progressTimer = setInterval(() => {
        currentProgress += 5;
        if (currentProgress >= 50) {
          clearInterval(progressTimer);
          setDemoProgress(50);
          setDemoStep('generating');
        } else {
          setDemoProgress(currentProgress);
        }
      }, 100);
    } else if (demoStep === 'generating') {
      let currentProgress = 50;
      progressTimer = setInterval(() => {
        currentProgress += 5;
        if (currentProgress >= 100) {
          clearInterval(progressTimer);
          setDemoProgress(100);
          setDemoStep('after');
        } else {
          setDemoProgress(currentProgress);
        }
      }, 100);
    } else if (demoStep === 'after') {
      // Auto cycle tabs to demonstrate all generated workspaces dynamically!
      let subStep = 0;
      cycleInterval = setInterval(() => {
        subStep += 1;
        if (subStep === 1) {
          setDemoActiveTab('notes');
        } else if (subStep === 2) {
          setDemoActiveTab('mindmap');
        } else if (subStep === 3) {
          setDemoActiveTab('flashcard');
          setFlashcardFlipped(false);
        } else if (subStep === 4) {
          setFlashcardFlipped(true);
        } else if (subStep === 5) {
          setDemoActiveTab('quiz');
        } else if (subStep === 6) {
          setDemoActiveTab('summary');
          setFlashcardFlipped(false);
          subStep = 0;
        }
      }, 3500);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
      clearInterval(cycleInterval);
    };
  }, [demoStep, isPlayingFlow, selectedTopic]);

  // Handle Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setLandingIsDragActive(true);
  };

  const handleDragLeave = () => {
    setLandingIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setLandingIsDragActive(false);
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach((f: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setLandingFiles(prev => [...prev, {
            name: f.name,
            size: f.size,
            type: f.type,
            textContent: typeof event.target?.result === 'string' ? event.target.result : undefined
          }]);
        };
        reader.readAsText(f);
      });
    }
  };

  // Get current active preview topic dataset
  const activePreview = TOPIC_PREVIEWS[selectedTopic];

  const faqItems = [
    {
      q: "What types of content formats can Zipytiny summarize?",
      a: "Zipytiny is a universal processor! It supports YouTube videos, custom website links, pasted articles, raw text, and file uploads (including PDFs, Word documents, PowerPoint presentations, Excel sheets, images with text OCR, MP3/WAV audio recordings, and direct MP4/WebM video files)."
    },
    {
      q: "How does the AI Chat Q&A work?",
      a: "After generating a summary, you can open the 'AI Chat Q&A' tab to ask specific follow-up questions. It uses the entire text transcription/metadata and Gemini's deep logical reasoning to answer your custom queries in real-time."
    },
    {
      q: "Can I export summaries to other workspaces?",
      a: "Absolutely! You can instantly export your generated summaries, timeline chapters, and quiz structures to formatted PDF reports, Microsoft Word documents, raw Markdown files, or directly copy them to your Notion workspace with a single click."
    },
    {
      q: "Is there a limit on free guest usage?",
      a: "Yes, free guest users receive a set allocation of daily summaries to test-drive Zipytiny. To bypass all daily restrictions, unlock premium AI templates, export PDF/Word reports, and access unlimited processing speeds, you can upgrade to the Zipytiny Pro Plan."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full flex flex-col items-center justify-start text-[#1d1d1f] dark:text-zinc-100 antialiased bg-slate-50/20 dark:bg-zinc-950">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden pt-12 sm:pt-20 pb-20 sm:pb-32 border-b border-black/[0.02] dark:border-zinc-900 bg-linear-to-b from-indigo-50/40 via-transparent to-transparent dark:from-indigo-950/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.012)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Title, Copy, URL input box, and CTA */}
            <div className="col-span-1 lg:col-span-7 space-y-6 text-left">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-[#0071e3]/10 dark:bg-[#0071e3]/25 px-3 py-1 rounded-full text-[11px] font-mono font-semibold text-[#0071e3] dark:text-sky-400 w-fit">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>Value-First AI Learning Workspace</span>
                </div>
                <p className="text-xs sm:text-sm font-extrabold tracking-wide text-indigo-600 dark:text-indigo-400 uppercase font-mono">
                  Stop Watching Twice. Learn Once, Remember More.
                </p>
              </div>
              
              <h1 id="landing-hero-headline" className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight leading-[1.08] text-[#1d1d1f] dark:text-zinc-50">
                Turn Any Video or Document into <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#0071e3] via-blue-600 to-indigo-600 bg-clip-text text-transparent">an AI Learning Workspace</span>
              </h1>
              
              <p className="text-[#86868b] dark:text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed font-light">
                Generate summaries, flashcards, quizzes, mind maps, AI chat, study notes, and social content in under 60 seconds.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-zinc-400 pt-1 font-medium">
                <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/15">
                  <span>⭐⭐⭐⭐⭐</span>
                  <span className="font-bold">Loved by Students & Professionals</span>
                </span>
                <span className="flex items-center gap-1.5 bg-blue-500/10 text-[#0071e3] dark:text-sky-400 px-2.5 py-1 rounded-full border border-blue-500/15 font-mono text-[10px]">
                  ⚡ Powered by Gemini
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-500/15">
                  ✓ No Credit Card Required
                </span>
                <span className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-600 px-2.5 py-1 rounded-full border border-indigo-500/15 font-bold">
                  ✨ Create Your First Workspace Free
                </span>
              </div>

              {/* 🎯 CONVERSION-OPTIMIZED MULTI-SOURCE INPUT BOX */}
              <div className="w-full max-w-3xl pt-2">
                {/* Source Selection Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                  <div className="flex flex-wrap gap-1 bg-neutral-100/90 dark:bg-zinc-900/80 p-1 rounded-2xl w-fit border border-neutral-250 dark:border-zinc-800/80 shadow-xs">
                    {[
                      { id: 'video', label: 'YouTube Video', icon: Video, color: 'text-red-500 bg-red-500/10' },
                      { id: 'file', label: 'Document Upload', icon: Upload, color: 'text-amber-500 bg-amber-500/10' },
                    ].map((tab) => {
                      const TabIcon = tab.icon;
                      const isSelected = landingSourceType === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setLandingSourceType(tab.id as any);
                            setUrlError('');
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95 duration-150 ${
                            isSelected
                              ? 'bg-white dark:bg-zinc-800 text-neutral-900 dark:text-zinc-100 shadow-xs border border-neutral-200 dark:border-zinc-700'
                              : 'text-neutral-500 dark:text-zinc-450 hover:text-neutral-800 dark:hover:text-zinc-200 hover:bg-neutral-200/50 dark:hover:bg-zinc-800/40'
                          }`}
                        >
                          <TabIcon className={`w-3.5 h-3.5 ${isSelected ? tab.color.split(' ')[0] : 'text-neutral-400'}`} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAdvancedLanding(!showAdvancedLanding)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#0071e3] dark:text-sky-400 hover:underline cursor-pointer select-none"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{showAdvancedLanding ? 'Hide Advanced Options' : 'Show Advanced Options'}</span>
                  </button>
                </div>

                {/* Collapsible Advanced Sources & Settings */}
                {showAdvancedLanding && (
                  <div className="mb-4 p-4 bg-neutral-100/50 dark:bg-zinc-900/40 border border-neutral-200/60 dark:border-zinc-850 rounded-2xl space-y-4 animate-fadeIn text-left">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold font-mono text-[#86868b] uppercase tracking-wider">
                        Other Input Formats:
                      </label>
                      <div className="flex flex-wrap gap-1 bg-neutral-200/40 dark:bg-zinc-950/40 p-1 rounded-2xl w-fit">
                        {[
                          { id: 'website', label: 'Website Link', icon: Globe, color: 'text-blue-500 bg-blue-500/10' },
                          { id: 'text', label: 'Pasted Notes', icon: FileText, color: 'text-emerald-500 bg-emerald-500/10' },
                        ].map((tab) => {
                          const TabIcon = tab.icon;
                          const isSelected = landingSourceType === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                setLandingSourceType(tab.id as any);
                                setUrlError('');
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95 duration-150 ${
                                isSelected
                                  ? 'bg-white dark:bg-zinc-800 text-neutral-900 dark:text-zinc-100 shadow-xs border border-neutral-200 dark:border-zinc-700'
                                  : 'text-neutral-500 dark:text-zinc-450 hover:text-neutral-800 dark:hover:text-zinc-200'
                              }`}
                            >
                              <TabIcon className={`w-3.5 h-3.5 ${isSelected ? tab.color.split(' ')[0] : 'text-neutral-400'}`} />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold font-mono text-[#86868b] uppercase tracking-wider">
                          Output Language Style:
                        </label>
                        <select className="w-full bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs py-2 px-3 rounded-xl focus:ring-1 focus:ring-[#0071e3] outline-none">
                          <option>English Synthesis (Default)</option>
                          <option>Arabic Translation (العربية)</option>
                          <option>Spanish Translation (Español)</option>
                          <option>French Translation (Français)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold font-mono text-[#86868b] uppercase tracking-wider">
                          Summary Tone Preset:
                        </label>
                        <select className="w-full bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs py-2 px-3 rounded-xl focus:ring-1 focus:ring-[#0071e3] outline-none">
                          <option>Standard Lecture / Textbook (Default)</option>
                          <option>Academic Deep-Dive Study Guide</option>
                          <option>Viral Repurposing Bulletins</option>
                          <option>Social Reels / Shorts Audio Script</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (landingSourceType === 'video') {
                      if (!ytUrl.trim()) {
                        setUrlError('Please enter a valid YouTube URL');
                        return;
                      }
                      setUrlError('');
                      if (onStartFreeSummary) {
                        onStartFreeSummary(ytUrl.trim(), 'video');
                      }
                    } else if (landingSourceType === 'website') {
                      if (!landingWebsiteUrl.trim()) {
                        setUrlError('Please enter a valid website URL');
                        return;
                      }
                      setUrlError('');
                      if (onStartFreeSummary) {
                        onStartFreeSummary(landingWebsiteUrl.trim(), 'website');
                      }
                    } else if (landingSourceType === 'text') {
                      if (!landingPastedText.trim()) {
                        setUrlError('Please paste your notes or transcript to analyze');
                        return;
                      }
                      setUrlError('');
                      if (onStartFreeSummary) {
                        onStartFreeSummary(landingPastedText.trim(), 'text');
                      }
                    } else if (landingSourceType === 'file') {
                      if (landingFiles.length === 0) {
                        setUrlError('Please select or drop at least one document first');
                        return;
                      }
                      setUrlError('');
                      if (onStartFreeSummary) {
                        onStartFreeSummary('https://www.zipytiny.app/uploaded-files', 'file', landingFiles);
                      }
                    }
                  }}
                  className="relative flex flex-col sm:flex-row items-stretch gap-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-2 rounded-2xl shadow-lg focus-within:border-[#0071e3] focus-within:ring-2 focus-within:ring-[#0071e3]/15 transition-all"
                >
                  {landingSourceType === 'video' && (
                    <div className="flex-1 flex items-center gap-3 pl-3">
                      <Video className="w-5 h-5 text-red-500 shrink-0" />
                      <input
                        id="landing-main-input"
                        type="text"
                        placeholder="Paste a YouTube video URL to instantly create your AI workspace..."
                        value={ytUrl}
                        onChange={(e) => {
                          setYtUrl(e.target.value);
                          if (urlError) setUrlError('');
                        }}
                        className="w-full bg-transparent border-0 outline-none focus:ring-0 focus:outline-none text-sm text-neutral-800 dark:text-zinc-100 placeholder-neutral-400 dark:placeholder-zinc-500"
                      />
                    </div>
                  )}

                  {landingSourceType === 'website' && (
                    <div className="flex-1 flex items-center gap-3 pl-3">
                      <Globe className="w-5 h-5 text-[#0071e3] shrink-0" />
                      <input
                        id="landing-main-input"
                        type="text"
                        placeholder="Paste an article, news or documentation URL to analyze..."
                        value={landingWebsiteUrl}
                        onChange={(e) => {
                          setLandingWebsiteUrl(e.target.value);
                          if (urlError) setUrlError('');
                        }}
                        className="w-full bg-transparent border-0 outline-none focus:ring-0 focus:outline-none text-sm text-[#1d1d1f] dark:text-zinc-100 placeholder-neutral-400 dark:placeholder-zinc-500"
                      />
                    </div>
                  )}

                  {landingSourceType === 'text' && (
                    <div className="flex-1 flex items-center gap-3 pl-3">
                      <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                      <input
                        id="landing-main-input"
                        type="text"
                        placeholder="Paste text notes, lecture transcripts or textbooks..."
                        value={landingPastedText}
                        onChange={(e) => {
                          setLandingPastedText(e.target.value);
                          if (urlError) setUrlError('');
                        }}
                        className="w-full bg-transparent border-0 outline-none focus:ring-0 focus:outline-none text-sm text-[#1d1d1f] dark:text-zinc-100 placeholder-neutral-400 dark:placeholder-zinc-500"
                      />
                    </div>
                  )}

                  {landingSourceType === 'file' && (
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex-1 flex flex-col pl-3 justify-center min-h-[46px] py-1 rounded-xl transition ${
                        landingIsDragActive ? 'bg-amber-500/10 border-2 border-dashed border-amber-500/45' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Upload className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                        <label className="text-xs font-semibold text-neutral-700 dark:text-zinc-300 cursor-pointer flex flex-wrap items-center gap-1.5 hover:text-[#0071e3] transition">
                          <span>Drop documents here or</span>
                          <input
                            type="file"
                            accept=".pdf,.docx,.pptx,.txt"
                            multiple
                            onChange={(e) => {
                              if (e.target.files) {
                                const files = Array.from(e.target.files);
                                files.forEach((f: File) => {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setLandingFiles(prev => [...prev, {
                                      name: f.name,
                                      size: f.size,
                                      type: f.type,
                                      textContent: typeof event.target?.result === 'string' ? event.target.result : undefined
                                    }]);
                                  };
                                  reader.readAsText(f);
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <span className="text-[#0071e3] dark:text-sky-400 font-bold underline">click to select files</span>
                        </label>
                      </div>
                      {landingFiles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {landingFiles.map((file, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-zinc-800 text-[10px] text-neutral-600 dark:text-zinc-300 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-zinc-700">
                              <span className="truncate max-w-[120px] font-mono">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => setLandingFiles(prev => prev.filter((_, i) => i !== idx))}
                                className="text-neutral-400 hover:text-rose-500 font-bold ml-1 font-sans text-[9px]"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-zinc-100 text-white px-7 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shrink-0 group cursor-pointer active:scale-95 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
                  >
                    <span>✨ Generate AI Workspace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-blue-500" />
                  </button>
                </form>

                {urlError && (
                  <p className="text-xs text-rose-500 mt-2 ml-3 font-semibold animate-fadeIn">{urlError}</p>
                )}

                {/* Visual Cue pointing to the Demo Section */}
                <div className="mt-4 pt-4 border-t border-dashed border-neutral-200 dark:border-zinc-850 flex items-center justify-between text-xs">
                  <p className="font-semibold text-neutral-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    <span>Want to test drive instantly? Try our 1-click Sandbox Demos below!</span>
                  </p>
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('sandbox-demos-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-[#0071e3] hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    Scroll to Demos ↓
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3.5 px-1">
                  <p className="text-[11px] text-[#86868b] dark:text-zinc-450 font-light flex items-center gap-2 select-none">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>No credit card required.</span>
                    <span className="font-semibold text-neutral-800 dark:text-zinc-300">Free daily credits.</span>
                  </p>
                  
                  <span className="text-[10px] text-[#86868b] dark:text-zinc-550 font-mono hidden sm:inline">
                    PDF, YouTube, DOCX, PPTX, MP3
                  </span>
                </div>
              </div>

              {/* Action Buttons & Time Savings Indicators */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const inputEl = document.getElementById('landing-main-input') as HTMLInputElement;
                    if (inputEl) {
                      inputEl.focus();
                      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 text-white px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-98 cursor-pointer shadow-sm hover:shadow-md"
                >
                  Start Learning Free
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('interactive-tour-theater')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-neutral-100/70 dark:bg-zinc-900/60 hover:bg-neutral-200/70 dark:hover:bg-zinc-850/60 text-neutral-800 dark:text-zinc-200 px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-neutral-250 dark:border-zinc-800"
                >
                  <Play className="w-3.5 h-3.5 text-[#0071e3] fill-[#0071e3]" />
                  <span>Watch Video Tour</span>
                </button>
              </div>

              {/* Micro Metrics Rows (Premium Styling) */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-black/[0.04] dark:border-zinc-900 max-w-2xl">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#0071e3]/8 dark:bg-[#0071e3]/15 flex items-center justify-center text-[#0071e3]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-zinc-100">10x Speedup</div>
                    <p className="text-[10px] text-neutral-400 font-light leading-none">Complete 2hr lectures in 15 mins</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/8 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-500">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-zinc-100">98% Retention</div>
                    <p className="text-[10px] text-neutral-400 font-light leading-none">Using interactive quizzes & Q&A</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/8 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-zinc-100">Zero Friction</div>
                    <p className="text-[10px] text-neutral-400 font-light leading-none">Instant parsing. No initial sign-ups</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Live Premium Interactive Wow-Moment Mockup */}
            <div className="col-span-1 lg:col-span-5 relative mt-6 lg:mt-0 font-sans lg:scale-105 lg:origin-right">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-3xl opacity-10 blur-2xl dark:opacity-20 animate-pulse"></div>
              
              <div className="bg-white dark:bg-zinc-900 border border-black/[0.05] dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
                {/* Mockup Header */}
                <div className="px-5 py-3 bg-neutral-50 dark:bg-zinc-950/85 border-b border-black/[0.04] dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-400"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#86868b] dark:text-zinc-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>live-learning-workspace.json</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsPlayingFlow(!isPlayingFlow)}
                    className="text-[10px] bg-neutral-100 dark:bg-zinc-850 hover:bg-neutral-200 dark:hover:bg-zinc-800 px-2 py-0.5 rounded text-neutral-600 dark:text-zinc-300 transition-all active:scale-95 cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <span>{isPlayingFlow ? 'Pause Flow' : 'Play Flow'}</span>
                  </button>
                </div>

                {/* Main Content inside the preview block */}
                <div className="p-5 min-h-[350px] flex flex-col justify-between">
                  
                  {/* PHASE 1: BEFORE */}
                  {demoStep === 'before' && (
                    <div className="space-y-4 animate-fadeIn text-left">
                      <div className="bg-neutral-50 dark:bg-zinc-950/60 rounded-xl p-4 border border-neutral-150 dark:border-zinc-850 relative overflow-hidden">
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500"></div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-extrabold font-mono text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded">
                              Exhausting Original Material
                            </span>
                            <h4 className="text-xs font-bold text-neutral-800 dark:text-zinc-200 mt-2 flex items-center gap-1.5">
                              <Video className="w-4 h-4 text-rose-500 shrink-0" />
                              <span>{activePreview.sourceName}</span>
                            </h4>
                            <p className="text-[10.5px] text-[#86868b] dark:text-zinc-400 font-light mt-1 leading-normal">
                              Scrubbing, fast-forwarding, missing key definitions, losing focus, or struggling to synthesize action items.
                            </p>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-md shrink-0">
                            {activePreview.sourceDuration}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-center my-1">
                        <div className="h-6 w-6 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-[#86868b]">
                          <ChevronDown className="w-4 h-4 animate-bounce" />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setDemoStep('analyzing');
                          setDemoProgress(0);
                        }}
                        className="w-full bg-[#0071e3] hover:bg-[#005bb5] text-white py-3 rounded-xl font-bold text-xs tracking-wide uppercase transition-all duration-150 shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                        <span>Transcribe & Map with AI</span>
                      </button>

                      <div className="text-center">
                        <p className="text-[9.5px] text-[#86868b] dark:text-zinc-500">
                          Click above to accelerate or let auto-flow proceed.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PHASE 2: ANALYZING & GENERATING */}
                  {(demoStep === 'analyzing' || demoStep === 'generating') && (
                    <div className="space-y-4 animate-fadeIn text-left my-auto">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-[#0071e3] dark:text-sky-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 animate-spin" />
                            {demoStep === 'analyzing' ? 'Transcribing & Structuring...' : 'Generating Study Workspace...'}
                          </span>
                          <span className="font-mono font-bold text-neutral-800 dark:text-zinc-100">{demoProgress}%</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#0071e3] via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-150"
                            style={{ width: `${demoProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-neutral-50 dark:bg-zinc-950/50 rounded-xl p-3 border border-neutral-150 dark:border-zinc-850 space-y-2">
                        <h4 className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#86868b]">
                          Active Pipelines
                        </h4>
                        <div className="space-y-1.5 text-[11px] font-medium text-neutral-600 dark:text-zinc-400">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${demoProgress >= 25 ? 'bg-emerald-500' : 'bg-[#0071e3] animate-ping'}`}></span>
                              <span>Semantic Audio Extraction</span>
                            </span>
                            <span>{demoProgress >= 25 ? '✓ Done' : 'Reading...'}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${demoProgress >= 50 ? 'bg-emerald-500' : demoProgress >= 25 ? 'bg-indigo-500 animate-ping' : 'bg-neutral-300 dark:bg-zinc-800'}`}></span>
                              <span>Syllabus Formulation</span>
                            </span>
                            <span>{demoProgress >= 50 ? '✓ Done' : demoProgress >= 25 ? 'Synthesizing...' : 'Pending'}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${demoProgress >= 75 ? 'bg-emerald-500' : demoProgress >= 50 ? 'bg-purple-500 animate-ping' : 'bg-neutral-300 dark:bg-zinc-800'}`}></span>
                              <span>Visual Nodes Compilation</span>
                            </span>
                            <span>{demoProgress >= 75 ? '✓ Done' : demoProgress >= 50 ? 'Mapping...' : 'Pending'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PHASE 3: AFTER (INTERACTIVE WORKSPACE) */}
                  {demoStep === 'after' && (
                    <div className="space-y-3.5 animate-fadeIn text-left">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                          ✓ ACTIVE WORKSPACE: {activePreview.title}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>10x Study Speed</span>
                        </span>
                      </div>

                      {/* Workspace Tabs */}
                      <div className="flex bg-neutral-100 dark:bg-zinc-950 p-0.5 gap-0.5 rounded-lg border border-black/[0.02] dark:border-zinc-800/60 overflow-x-auto scrollbar-none">
                        {[
                          { id: 'summary', label: 'Brief' },
                          { id: 'notes', label: 'Syllabus' },
                          { id: 'mindmap', label: 'Map' },
                          { id: 'flashcard', label: 'Cards' },
                          { id: 'quiz', label: 'Quiz' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setDemoActiveTab(tab.id as any);
                              setIsPlayingFlow(false); // pause autoplay for manual inspection
                            }}
                            className={`flex-1 py-1 px-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                              demoActiveTab === tab.id
                                ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-zinc-100 shadow-xs border border-black/[0.02] dark:border-zinc-800'
                                : 'text-[#86868b] hover:text-neutral-950 dark:hover:text-zinc-200'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab Contents */}
                      <div className="bg-neutral-50 dark:bg-zinc-950/40 border border-neutral-150 dark:border-zinc-850 rounded-xl p-3.5 min-h-[175px] max-h-[175px] overflow-y-auto scrollbar-thin flex flex-col justify-between">
                        
                        {demoActiveTab === 'summary' && (
                          <div className="space-y-1.5 animate-fadeIn">
                            <h4 className="text-[11px] font-bold text-neutral-900 dark:text-zinc-150 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#0071e3]" />
                              <span>{activePreview.summaryTitle}</span>
                            </h4>
                            <p className="text-[10px] leading-relaxed text-neutral-600 dark:text-zinc-400 font-light">
                              {activePreview.summaryText}
                            </p>
                          </div>
                        )}

                        {demoActiveTab === 'notes' && (
                          <div className="space-y-1.5 animate-fadeIn">
                            <h4 className="text-[11px] font-bold text-neutral-900 dark:text-zinc-150 flex items-center gap-1 mb-1">
                              <BookOpen className="w-3 h-3 text-indigo-500" />
                              <span>Structured Concepts Index</span>
                            </h4>
                            <div className="space-y-1.5 text-[10px]">
                              {activePreview.notes.map((note, idx) => (
                                <div key={idx}>
                                  <span className="font-bold text-neutral-850 dark:text-zinc-300">{note.label}:</span>
                                  <p className="text-neutral-500 font-light ml-2 leading-tight">{note.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {demoActiveTab === 'mindmap' && (
                          <div className="space-y-1 animate-fadeIn font-mono text-[9px]">
                            <h4 className="text-[11px] font-bold text-neutral-900 dark:text-zinc-150 flex items-center gap-1 font-sans mb-1">
                              <Brain className="w-3 h-3 text-emerald-500" />
                              <span>Concept Relations Map</span>
                            </h4>
                            <div className="bg-neutral-100 dark:bg-zinc-950 p-2 rounded-lg border border-black/[0.03] leading-relaxed text-neutral-700 dark:text-zinc-400">
                              {activePreview.mindmapNodes.map((line, idx) => (
                                <div key={idx} className="whitespace-pre">{line}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        {demoActiveTab === 'flashcard' && (
                          <div className="animate-fadeIn flex flex-col items-center justify-center h-full">
                            <div 
                              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                              className="w-full max-w-[240px] bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-2.5 shadow-xs cursor-pointer transition relative min-h-[105px] flex flex-col justify-between"
                            >
                              <div className="flex justify-between items-center text-[7px] font-mono font-bold text-neutral-400">
                                <span>FLASHCARD</span>
                                <span>{flashcardFlipped ? 'ANSWER' : 'QUESTION'}</span>
                              </div>
                              
                              <div className="my-auto text-center py-1">
                                {flashcardFlipped ? (
                                  <p className="text-[9.5px] font-medium text-emerald-600 dark:text-emerald-400 leading-tight">
                                    "{activePreview.flashcardAnswer}"
                                  </p>
                                ) : (
                                  <p className="text-[10px] font-extrabold text-neutral-850 dark:text-zinc-100">
                                    {activePreview.flashcardText}
                                  </p>
                                )}
                              </div>

                              <div className="text-[7.5px] text-neutral-400 text-center font-mono">
                                🔄 Tap card to flip
                              </div>
                            </div>
                          </div>
                        )}

                        {demoActiveTab === 'quiz' && (
                          <div className="space-y-1.5 animate-fadeIn text-[10px]">
                            <h4 className="text-[11px] font-bold text-neutral-900 dark:text-zinc-150 flex items-center gap-1 mb-0.5">
                              <HelpCircle className="w-3 h-3 text-amber-500" />
                              <span>Knowledge Check</span>
                            </h4>
                            <p className="font-bold text-neutral-800 dark:text-zinc-200 leading-tight">
                              {activePreview.quizQuestion}
                            </p>
                            <div className="space-y-1">
                              {activePreview.quizOptions.map((opt, idx) => {
                                const isCorrect = idx === activePreview.quizAnswerIndex;
                                return (
                                  <div 
                                    key={idx} 
                                    className={`p-1 rounded border text-[9.5px] ${
                                      isCorrect 
                                        ? 'border-emerald-500 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-semibold' 
                                        : 'border-neutral-200 text-neutral-500'
                                    }`}
                                  >
                                    {opt}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Interactive footer summary stats */}
                        <div className="border-t border-black/[0.04] dark:border-zinc-800/60 pt-1.5 flex items-center justify-between text-[8px] font-bold text-neutral-400 uppercase font-mono">
                          <span>Verified taking 60s parsing time</span>
                          <span className="text-emerald-500 bg-emerald-500/10 px-1.5 rounded">
                            {activePreview.sourceDuration} Source → 15m Study
                          </span>
                        </div>
                      </div>

                      {/* Interactive sandbox buttons */}
                      <div className="flex items-center justify-between text-[10.5px] font-medium text-neutral-500 pt-1">
                        <span className="flex items-center gap-1 font-mono text-[9px] uppercase font-bold text-emerald-600">
                          <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>Interactive Play active</span>
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setDemoStep('before');
                            setDemoProgress(0);
                            setDemoActiveTab('summary');
                            setFlashcardFlipped(false);
                          }}
                          className="text-[#0071e3] dark:text-sky-400 hover:underline cursor-pointer font-bold font-mono text-[9px] uppercase"
                        >
                          Reset Simulation
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Mockup footer */}
                <div className="p-3 bg-neutral-50 dark:bg-zinc-950/85 border-t border-black/[0.03] dark:border-zinc-800 flex items-center justify-between text-[10.5px] font-mono text-[#86868b]">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 
                    <span>Study Package Synthesized Successfully</span>
                  </span>
                  <span className="font-extrabold text-emerald-600">98% Save Rate</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 1B. BEFORE CTA / TRANSFORMATION PREVIEW */}
      <section className="w-full bg-linear-to-b from-[#f5f5f7] to-white dark:from-zinc-950/40 dark:to-zinc-900 border-b border-black/[0.04] dark:border-zinc-800 py-12 sm:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-3 max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
              Instant AI Transformation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50 leading-tight">
              From Content Consumption to Dynamic Learning
            </h2>
            <p className="text-[#86868b] dark:text-zinc-400 font-light text-xs sm:text-sm">
              See how Zipytiny turns passive media and complex documents into high-retention active study spaces instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 text-xs font-semibold">
            {[
              { label: 'YouTube Video', icon: Video, desc: 'Passive stream', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
              { label: 'AI Deep Analysis', icon: Cpu, desc: '60s extraction', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20 animate-pulse' },
              { label: 'Smart Summary', icon: Sparkles, desc: 'Key takeaways', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Study Syllabus', icon: BookOpen, desc: 'Structured outline', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
              { label: 'Visual Mind Map', icon: Brain, desc: 'Interactive concept map', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
              { label: 'AI Chatbot Q&A', icon: MessageSquare, desc: 'Socratic discussion', color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
              { label: 'Recall Quizzes', icon: CheckCircle, desc: 'Self-assessment tests', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' }
            ].map((step, idx, arr) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center p-4 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-3xl shadow-xs hover:shadow-md hover:scale-105 transition duration-200 w-32 sm:w-36 text-center">
                  <div className={`p-2.5 rounded-2xl ${step.color} border mb-2`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-neutral-800 dark:text-zinc-150 leading-tight block mb-0.5">{step.label}</span>
                  <span className="text-[9px] text-[#86868b] font-light leading-none">{step.desc}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className="hidden md:flex items-center text-neutral-300 dark:text-zinc-700 font-extrabold text-lg select-none">
                    →
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 1C. SANDBOX / QUICK START DEMOS SECTION */}
      <section id="sandbox-demos-section" className="w-full bg-white dark:bg-zinc-900 border-b border-black/[0.04] dark:border-zinc-800 py-16 sm:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 text-center max-w-3xl mx-auto mb-12">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#0071e3] bg-[#0071e3]/10 px-3 py-1 rounded-full">
              ⚡ Sandbox Mode
            </span>
            <h2 className="text-3xl font-extrabold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50 leading-tight">
              Try Interactive Demo Workspaces in One-Click
            </h2>
            <p className="text-[#86868b] dark:text-zinc-400 font-light text-sm max-w-2xl mx-auto">
              Skip typing URLs or uploading documents. Click any card below to instantly launch a fully populated, production-grade learning workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: 'How Great Leaders Inspire Action',
                creator: 'Simon Sinek • TED Talk',
                url: 'https://www.youtube.com/watch?v=qp0HIF3SfI4',
                duration: '18 mins',
                processing: '~10s',
                image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=400&auto=format&fit=crop',
                metric: '🔥 Most Popular Demo',
                color: 'border-amber-200 dark:border-amber-900/40 bg-amber-500/5'
              },
              {
                title: 'Introduction to Deep Learning & Neural Nets',
                creator: 'MIT Scholars • Lecture',
                url: 'https://www.youtube.com/watch?v=intro-ai',
                duration: '25 mins',
                processing: '~35s',
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop',
                metric: '🎓 Highly Academic Deep-Dive',
                color: 'border-blue-200 dark:border-blue-900/40 bg-blue-500/5'
              },
              {
                title: 'Stanford 2005 Commencement Address',
                creator: 'Steve Jobs • Commemoration',
                url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
                duration: '15 mins',
                processing: '~15s',
                image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=400&auto=format&fit=crop',
                metric: '⭐ Absolute Masterclass',
                color: 'border-purple-200 dark:border-purple-900/40 bg-purple-500/5'
              },
              {
                title: 'Negotiation Strategy & Business Deals',
                creator: 'Harvard Business • Case Study',
                url: 'https://www.youtube.com/watch?v=qp0HIF3SfI4',
                duration: '20 mins',
                processing: '~20s',
                image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop',
                metric: '💼 Professional Strategy Guide',
                color: 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-500/5'
              },
              {
                title: 'How to Build a Billion-Dollar Startup',
                creator: "Lenny's Podcast • Founder Stories",
                url: 'https://www.youtube.com/watch?v=intro-ai',
                duration: '45 mins',
                processing: '~45s',
                image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=400&auto=format&fit=crop',
                metric: '🚀 Growth & Marketing Insights',
                color: 'border-rose-200 dark:border-rose-900/40 bg-rose-500/5'
              },
              {
                title: 'iPhone 2007 Original Product Launch Keynote',
                creator: 'Apple Historical Archives',
                url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
                duration: '50 mins',
                processing: '~12s',
                image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=400&auto=format&fit=crop',
                metric: '📱 Product & Presentation Design',
                color: 'border-pink-200 dark:border-pink-900/40 bg-pink-500/5'
              }
            ].map((demo, idx) => (
              <div 
                key={idx}
                className={`group bg-white dark:bg-zinc-900 border rounded-3xl overflow-hidden hover:shadow-xl hover:scale-102 transition-all duration-200 flex flex-col justify-between ${demo.color}`}
              >
                <div>
                  <div className="relative h-44 sm:h-48 overflow-hidden bg-neutral-100">
                    <img 
                      src={demo.image} 
                      alt={demo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[9px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-full">
                      {demo.duration}
                    </div>
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Clock className="w-3 h-3" />
                      <span>{demo.processing}</span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-2 text-left">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-wider uppercase bg-indigo-500/10 px-2 py-0.5 rounded">
                      {demo.metric}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-zinc-50 leading-snug line-clamp-2 pt-1 min-h-[50px]">
                      {demo.title}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-zinc-400 font-medium">
                      {demo.creator}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      setLandingSourceType('video');
                      setYtUrl(demo.url);
                      setUrlError('');
                      if (onStartFreeSummary) {
                        onStartFreeSummary(demo.url, 'video');
                      }
                    }}
                    className="w-full py-3 px-4 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg active:scale-97 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Try Demo Workspace</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. PREMIUM SOCIAL PROOF SECTION */}
      <section className="w-full bg-white dark:bg-zinc-900 border-b border-black/[0.04] dark:border-zinc-800 py-12 sm:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            
            <div className="space-y-2 max-w-md text-center lg:text-left shrink-0">
              <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-500">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className="w-4.5 h-4.5 fill-current text-amber-400" />
                ))}
                <span className="text-xs font-extrabold text-neutral-800 dark:text-zinc-200 ml-1.5">4.9 / 5.0 Rating</span>
              </div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-zinc-100">
                Trusted by 14,000+ Students, Content Creators, and Professional Analysts
              </h3>
              <p className="text-xs text-[#86868b] dark:text-zinc-400 font-light">
                Powering quick learning across academia, engineering, medical prep, and content research.
              </p>
            </div>

            {/* Logo Grid */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-6 items-center opacity-40 dark:opacity-30">
              <div className="flex justify-center font-bold tracking-tight font-display text-lg select-none text-neutral-800 dark:text-zinc-200">
                STANFORD ACADEMY
              </div>
              <div className="flex justify-center font-bold tracking-tight font-display text-lg select-none text-neutral-800 dark:text-zinc-200">
                YOUTUBE CREATORS
              </div>
              <div className="flex justify-center font-bold tracking-tight font-display text-lg select-none text-neutral-800 dark:text-zinc-200">
                MIT SCHOLARS
              </div>
              <div className="flex justify-center font-bold tracking-tight font-display text-lg select-none text-neutral-800 dark:text-zinc-200">
                NOTION GURU
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. THREE-STEP HOW IT WORKS */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="space-y-3.5 text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#0071e3] dark:text-sky-400">Streamlined Workflow</span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50 leading-tight">
            Go From Exhausting Content to Structured Knowledge in 3 Steps
          </h2>
          <p className="text-[#86868b] dark:text-zinc-400 font-light text-base leading-relaxed">
            Spend zero effort scrubbing or transcribing. Provide your link or file and let our engine compile your active study dashboard instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-0.5 bg-neutral-200 dark:bg-zinc-800/80 -z-10"></div>
          
          {[
            {
              step: '01',
              icon: <Upload className="w-5.5 h-5.5 text-[#0071e3]" />,
              title: 'Paste or Upload Any Source',
              description: 'Drop files (PDF, DOCX, PPTX, MP3), paste website articles, or type notes. Support for all mainstream platforms.',
              bg: 'bg-[#0071e3]/10 dark:bg-[#0071e3]/20',
              highlight: 'YouTube, PDFs, Audio'
            },
            {
              step: '02',
              icon: <Brain className="w-5.5 h-5.5 text-indigo-500" />,
              title: 'AI Synthesis Distillation',
              description: 'Gemini analyzes structure, transcribes semantic audio, and identifies core terminology in seconds.',
              bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
              highlight: 'Seconds processing time'
            },
            {
              step: '03',
              icon: <Share2 className="w-5.5 h-5.5 text-emerald-500" />,
              title: 'Master Content Natively',
              description: 'Explore visual maps, review syllabi, test yourself with auto-generated flashcards, and chat with files.',
              bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
              highlight: '100% active recall systems'
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-7 text-left flex flex-col justify-between space-y-6 hover:shadow-lg hover:-translate-y-1 transition duration-300"
            >
              <div className="flex items-start justify-between">
                <div className={`h-11 w-11 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
                <span className="font-mono text-4xl font-extrabold text-neutral-150 dark:text-zinc-800 leading-none select-none">{item.step}</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-zinc-150 uppercase tracking-wider font-mono">{item.title}</h3>
                <p className="text-xs text-[#86868b] dark:text-zinc-400 leading-relaxed font-light">{item.description}</p>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-mono font-semibold text-neutral-600 dark:text-zinc-400 bg-neutral-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                  {item.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🌟 DYNAMIC ROI CALCULATOR SECTION */}
      <section className="py-20 w-full bg-linear-to-b from-white to-slate-50/50 dark:from-zinc-950 dark:to-zinc-900 border-b border-black/[0.02] dark:border-zinc-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/30 px-3 py-1 rounded-full text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400">
              <Calculator className="w-3.5 h-3.5" />
              <span>Zipytiny Cognitive Savings Estimator</span>
            </div>
            <h2 className="text-2xl sm:text-3.5xl font-extrabold font-display tracking-tight text-neutral-900 dark:text-zinc-50">
              Calculate Your Learning ROI & Hours Saved
            </h2>
            <p className="text-neutral-500 dark:text-zinc-400 font-light text-sm">
              Standard watching is passive and slow. Slide to estimate how many hours of video lectures, webinars, and audio materials you consume weekly, and see your dynamic cognitive speedup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch bg-white dark:bg-zinc-900/80 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl"></div>
            
            {/* Left: Input Slider */}
            <div className="col-span-1 md:col-span-6 flex flex-col justify-between space-y-6 pr-0 md:pr-4 border-b md:border-b-0 md:border-r border-neutral-150 dark:border-zinc-800/80 pb-6 md:pb-0">
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">My Study Load</span>
                  <span className="text-2xl font-extrabold font-mono text-[#0071e3] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/30 px-3.5 py-1 rounded-xl">
                    {weeklyHours} Hrs <span className="text-xs font-medium text-neutral-500">/ wk</span>
                  </span>
                </div>
                
                <p className="text-xs text-neutral-500 dark:text-zinc-400 font-light leading-relaxed">
                  Adjust the slider to your average weekly volume of YouTube lectures, webinars, podcasts, or online tutorials.
                </p>

                <div className="pt-4 space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-neutral-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#0071e3] focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>1 Hour (Casual)</span>
                    <span>20 Hours (Intense)</span>
                    <span>40 Hours (Maximum)</span>
                  </div>
                </div>
              </div>

              {/* Conversion CTA Trigger */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const inputEl = document.getElementById('landing-main-input') as HTMLInputElement;
                    if (inputEl) {
                      inputEl.focus();
                      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Maximize My Learning Efficiency</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right: Dynamic Calculation Visualizer */}
            <div className="col-span-1 md:col-span-6 grid grid-cols-2 gap-4 pl-0 md:pl-4 text-left">
              
              {/* Box 1: Weekly Hours Saved */}
              <div className="bg-slate-50/50 dark:bg-zinc-950/40 p-4.5 rounded-2xl border border-neutral-150 dark:border-zinc-850/60 flex flex-col justify-between">
                <div>
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono mt-3">Time Saved Weekly</h4>
                </div>
                <div className="mt-4">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-500">
                    ~{Math.max(1, Math.round(weeklyHours * 0.85))}
                  </span>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 block mt-1">Hours Returned To You</span>
                </div>
              </div>

              {/* Box 2: Retention Improvement */}
              <div className="bg-slate-50/50 dark:bg-zinc-950/40 p-4.5 rounded-2xl border border-neutral-150 dark:border-zinc-850/60 flex flex-col justify-between">
                <div>
                  <div className="h-8 w-8 rounded-lg bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono mt-3">Active Comprehension</h4>
                </div>
                <div className="mt-4">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0071e3] dark:text-sky-400">
                    10x
                  </span>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 block mt-1">Faster Information Digest</span>
                </div>
              </div>

              {/* Box 3: Yearly Hours Saved */}
              <div className="bg-slate-50/50 dark:bg-zinc-950/40 p-4.5 rounded-2xl border border-neutral-150 dark:border-zinc-850/60 flex flex-col justify-between">
                <div>
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono mt-3">Yearly Time Saved</h4>
                </div>
                <div className="mt-4">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-500">
                    ~{Math.max(10, Math.round(weeklyHours * 0.85 * 52))}
                  </span>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 block mt-1">Hours Recovered / Year</span>
                </div>
              </div>

              {/* Box 4: Productivity Index */}
              <div className="bg-slate-50/50 dark:bg-zinc-950/40 p-4.5 rounded-2xl border border-neutral-150 dark:border-zinc-850/60 flex flex-col justify-between">
                <div>
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono mt-3">Focus Coefficient</h4>
                </div>
                <div className="mt-4">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-500">
                    +{Math.round(weeklyHours * 9.5)}
                  </span>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 block mt-1">Est. Learning XP Points</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE PRODUCT DEMO SECTION */}
      <section className="w-full bg-[#f5f5f7] dark:bg-zinc-900/40 py-20 border-y border-black/[0.02] dark:border-zinc-900 scroll-mt-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-blue-500/[0.015] via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-150 dark:border-blue-900 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-blue-700 dark:text-blue-400 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Interactive Live Sandbox</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900 dark:text-zinc-50 leading-tight">
              Test-Drive Zipytiny: Experience the Live AI Workspace
            </h2>
            <p className="text-neutral-500 dark:text-zinc-400 font-light text-base max-w-2xl mx-auto">
              Choose an educational topic below. Watch our simulated AI instantly convert the hour-long session into different learning materials. Try flipping cards, running mock quizzes, or reading summaries!
            </p>
          </div>

          {/* Topic Switcher Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
            {[
              { id: 'startup', label: 'AI Startup Playbook', color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20 border-indigo-200' },
              { id: 'deeplearning', label: 'Deep Learning', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-200' },
              { id: 'productivity', label: 'Time Management', color: 'text-amber-600 bg-amber-50 dark:text-emerald-450 dark:bg-amber-950/20 border-amber-200' }
            ].map((topic) => {
              const isSelected = selectedTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    setSelectedTopic(topic.id as any);
                    setDemoStep('after');
                    setDemoActiveTab('summary');
                    setFlashcardFlipped(false);
                    setIsPlayingFlow(false); // Pause so user controls it
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition duration-150 cursor-pointer active:scale-95 ${
                    isSelected 
                      ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-950 dark:border-white shadow-sm' 
                      : 'bg-white text-neutral-600 border-neutral-200 dark:bg-zinc-800 dark:text-zinc-350 dark:border-zinc-700 hover:bg-neutral-50'
                  }`}
                >
                  {topic.label}
                </button>
              );
            })}
          </div>

          {/* Interactive Cinematic Explainer or active live container */}
          <div className="max-w-4xl mx-auto transition duration-500 hover:shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800">
            {/* Cinematic Explainer component preserves existing premium active demo recorder */}
            <CinematicExplainer onStartLearning={() => onLaunchApp('app')} />
          </div>

        </div>
      </section>

      {/* 5. FEATURE GROUPS (UNDERSTAND, LEARN, APPLY) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="space-y-4 text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#0071e3]">Feature Ecosystem</span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50 leading-tight">
            Designed to Shift You From Passive Consumption to Active Recall
          </h2>
          <p className="text-[#86868b] dark:text-zinc-400 font-light text-base leading-relaxed">
            Standard video summaries are flat. We organize your content across three strategic pillars to ensure you actually absorb the core concepts.
          </p>
        </div>

        {/* Feature Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* Pillar 1: UNDERSTAND */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-8 space-y-6 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-[#0071e3]/10 text-[#0071e3] rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#0071e3] uppercase tracking-widest">Pillar 01</span>
                <h3 className="text-base font-extrabold text-neutral-800 dark:text-zinc-150 uppercase tracking-wider font-mono">Understand Content</h3>
                <p className="text-xs text-neutral-500 font-light leading-normal">
                  Sift through long-form recordings with high-fidelity summaries and precise segment timestamps.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-neutral-600 dark:text-zinc-450 font-medium">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Executive summaries & abstracts</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Automatic timeline chapter points</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Immediate actionable checklist items</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onLaunchApp('overview')}
              className="text-[#0071e3] hover:underline font-bold text-xs flex items-center gap-1.5 self-start"
            >
              <span>Explore summaries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 2: LEARN */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-8 space-y-6 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest">Pillar 02</span>
                <h3 className="text-base font-extrabold text-neutral-800 dark:text-zinc-150 uppercase tracking-wider font-mono">Learn Structure</h3>
                <p className="text-xs text-neutral-500 font-light leading-normal">
                  Visualize underlying connections and digest information visually or via high-fidelity audio options.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-neutral-600 dark:text-zinc-450 font-medium">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Interactive auto-generated Mind Maps</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> AI High-Fidelity Audio Podcast synthesis</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Core concepts & syllabus index notes</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onLaunchApp('mindmap')}
              className="text-indigo-500 hover:underline font-bold text-xs flex items-center gap-1.5 self-start"
            >
              <span>Explore maps & audio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 3: APPLY */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-8 space-y-6 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Pillar 03</span>
                <h3 className="text-base font-extrabold text-neutral-800 dark:text-zinc-150 uppercase tracking-wider font-mono">Apply & Retain</h3>
                <p className="text-xs text-neutral-500 font-light leading-normal">
                  Challenge your comprehension with rigorous testing systems and context-aware chat.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-neutral-600 dark:text-zinc-450 font-medium">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Testing quizzes with robust answers</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Custom active recall flashcard decks</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Complete context-aware AI Chat Window</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onLaunchApp('quiz')}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-xs flex items-center gap-1.5 self-start"
            >
              <span>Explore quizzes & chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Dynamic Feature Tags row (Clean layout) */}
        <div className="mt-14 pt-8 border-t border-black/[0.03] dark:border-zinc-900 flex flex-wrap justify-center gap-2">
          {['Mind Maps', 'Flashcards', 'Podcast Gen', 'Syllabus Notes', 'Quiz Gen', 'Timeline Chapters', 'Executive Summary', 'Action Items', 'Export PDF', 'Export Word', 'Notion Copy', 'Context Chat'].map((tag) => (
            <span key={tag} className="px-3 py-1.5 bg-neutral-100/60 dark:bg-zinc-900 border border-neutral-200/50 dark:border-zinc-800 text-[11px] font-bold text-neutral-500 uppercase tracking-wider font-mono rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* 6. USE CASES SECTION */}
      <section className="bg-white dark:bg-zinc-900 w-full py-20 sm:py-24 border-y border-black/[0.02] dark:border-zinc-900 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="space-y-4 text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#0071e3]">Who uses Zipytiny?</span>
            <h2 className="text-3xl font-bold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50 leading-tight">
              Saves Hours for Researchers, Learners & Educators Everywhere
            </h2>
            <p className="text-[#86868b] dark:text-zinc-400 font-light text-base leading-relaxed">
              Every persona requires custom synthesis. Choose your role below to see how our engine transforms your workflow.
            </p>
          </div>

          {/* Persona switcher tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-10 bg-neutral-50 dark:bg-zinc-950 p-1 rounded-2xl border border-neutral-200 dark:border-zinc-800 shadow-xs">
            {[
              { id: 'students', label: '🎓 Students' },
              { id: 'professionals', label: '💼 Professionals' },
              { id: 'teachers', label: '✏️ Teachers' },
              { id: 'researchers', label: '🔬 Researchers' }
            ].map((persona) => {
              const isSelected = activeUseC === persona.id;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => setActiveUseC(persona.id as any)}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition duration-150 cursor-pointer flex-1 ${
                    isSelected 
                      ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-zinc-100 shadow-sm border border-neutral-200 dark:border-zinc-700' 
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {persona.label}
                </button>
              );
            })}
          </div>

          {/* Persona Card Detail */}
          <div className="bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850 rounded-2xl p-8 max-w-4xl mx-auto text-left grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-7 space-y-4">
              {activeUseC === 'students' && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest">USE CASE FOR ACADEMIA</span>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-zinc-100">Ace Lectures, Midterms & Complex Syllabus Details</h3>
                    <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed font-light">
                      Stop writing notes from scratch during a 2-hour lecture. Feed Zipytiny the video, record the audio in-person, or upload study PDFs. The system auto-compiles structured checklists, custom test quizzes, and high-fidelity revision flashcards matching key syllabus terms.
                    </p>
                  </div>
                  <ul className="space-y-2 text-xs text-neutral-600 dark:text-zinc-300 font-medium">
                    <li className="flex items-center gap-2">✓ Compile entire textbook modules into bite-sized summaries</li>
                    <li className="flex items-center gap-2">✓ Test vocabulary using customizable multiple-choice blocks</li>
                    <li className="flex items-center gap-2">✓ Share PDF guides with classmates or study partners instantly</li>
                  </ul>
                </>
              )}

              {activeUseC === 'professionals' && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest">USE CASE FOR INDUSTRY</span>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-zinc-100">Sift Through Meetings, Industry Webinars & Long Reports</h3>
                    <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed font-light">
                      Stay on top of updates without wasting hours in unneeded webinars. Paste call summaries or webinar videos to receive action checklists, key deadlines, and high-fidelity voice briefings you can listen to on the go.
                    </p>
                  </div>
                  <ul className="space-y-2 text-xs text-neutral-600 dark:text-zinc-300 font-medium">
                    <li className="flex items-center gap-2">✓ Synthesize 60-minute product webinars in 5 minutes</li>
                    <li className="flex items-center gap-2">✓ Generate instant meeting briefings and direct client takeaways</li>
                    <li className="flex items-center gap-2">✓ Listen to audio summaries of documents during transit</li>
                  </ul>
                </>
              )}

              {activeUseC === 'teachers' && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest">USE CASE FOR EDUCATION</span>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-zinc-100">Instantly Create Handouts, Lesson Plans & Quizzes</h3>
                    <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed font-light">
                      Save prep time. Upload a educational research paper, news link, or video. Auto-generate comprehensive lesson plans, student testing handouts, active recall flashcards, and conceptual maps in seconds.
                    </p>
                  </div>
                  <ul className="space-y-2 text-xs text-neutral-600 dark:text-zinc-300 font-medium">
                    <li className="flex items-center gap-2">✓ Auto-generate testing quizzes with detailed answer keys</li>
                    <li className="flex items-center gap-2">✓ Draft clean, high-contrast lesson checklists</li>
                    <li className="flex items-center gap-2">✓ Export structured outlines to Microsoft Word or PDF</li>
                  </ul>
                </>
              )}

              {activeUseC === 'researchers' && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-widest">USE CASE FOR RESEARCHERS</span>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-zinc-100">Sift Complex PDFs & Verify Numbers in Chat</h3>
                    <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed font-light">
                      Stop manually hunting for parameters in 50-page reports. Upload paper PDFs, extract core insights, and open the context-aware Chat window to verify financial figures, research citations, or experimental values directly.
                    </p>
                  </div>
                  <ul className="space-y-2 text-xs text-neutral-600 dark:text-zinc-300 font-medium">
                    <li className="flex items-center gap-2">✓ Sift and compare arguments across multiple papers</li>
                    <li className="flex items-center gap-2">✓ Use chat to ask for specific formulas or table indexes</li>
                    <li className="flex items-center gap-2">✓ Export clean summaries to Markdown formats natively</li>
                  </ul>
                </>
              )}
            </div>

            <div className="md:col-span-5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
              <span className="text-[9px] font-extrabold font-mono text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                Persona Metric
              </span>
              <div className="space-y-2">
                <div className="text-3xl font-extrabold font-display text-neutral-900 dark:text-zinc-50">
                  {activeUseC === 'students' && '4-5 Hours'}
                  {activeUseC === 'professionals' && '6 Hours'}
                  {activeUseC === 'teachers' && '8 Hours'}
                  {activeUseC === 'researchers' && '12 Hours'}
                </div>
                <div className="text-xs font-bold text-neutral-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                  Saved Per Week
                </div>
                <p className="text-[11px] text-[#86868b] dark:text-zinc-450 font-light leading-normal">
                  Estimated average hours recovered using automated multi-source transcription and dynamic concept mapping instead of manual summarization.
                </p>
              </div>
              <button
                type="button"
                onClick={onLaunchApp}
                className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white py-2.5 rounded-lg text-xs font-bold transition cursor-pointer text-center"
              >
                Try It Natively
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 7. PRICING SECTION (Comparison Table & Plans) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center relative z-10">
        <div className="space-y-4 max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#0071e3]">Pricing Plans</span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50 leading-tight">
            Simple, Value-Locked Transparent Pricing
          </h2>
          <p className="text-[#86868b] dark:text-zinc-400 font-light text-base leading-relaxed">
            Choose standard trial, or go Pro to unlock unlimited processing and premium features. Cancel anytime.
          </p>
        </div>

        {/* Plans Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left mb-16">
          
          {/* Free Trial Card */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-8 rounded-2xl flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-neutral-450">Standard Entry</span>
              <h3 className="text-xl font-extrabold text-neutral-800 dark:text-zinc-100 font-display">Free Trial</h3>
              
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-4xl font-extrabold font-display text-neutral-900 dark:text-zinc-50">$0</span>
                <span className="text-xs text-[#86868b] font-medium font-mono">/ FOREVER</span>
              </div>
              
              <p className="text-xs text-[#86868b] dark:text-zinc-400 font-light leading-relaxed">
                Test-drive core features with basic daily video summaries and active recall quizzes.
              </p>
              
              <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-zinc-350 pt-4 border-t border-black/[0.04] dark:border-zinc-800">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> 3 daily credits</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> YouTube & Web summaries</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Basic conceptual quizzes</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Local memory storage</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onLaunchApp('app')}
              className="mt-8 w-full py-3 bg-neutral-100 dark:bg-zinc-800 text-neutral-800 dark:text-zinc-200 hover:bg-neutral-200 hover:text-black rounded-xl text-xs font-extrabold transition cursor-pointer text-center"
            >
              Start Free Trial
            </button>
          </div>

          {/* Pro Plan Card */}
          <div className="bg-white dark:bg-zinc-900 border-2 border-[#0071e3] p-8 rounded-2xl relative flex flex-col justify-between shadow-lg">
            <div className="absolute top-4 right-4 bg-[#0071e3]/10 text-[#0071e3] text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#0071e3]/15">
              Best Seller
            </div>
            
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#0071e3]">Unlimited Learning</span>
              <h3 className="text-xl font-extrabold text-neutral-800 dark:text-zinc-100 font-display">Pro Plan</h3>
              
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-4xl font-extrabold font-display text-neutral-900 dark:text-zinc-50">$9</span>
                <span className="text-xs text-[#86868b] font-medium font-mono">/ MONTH</span>
              </div>
              
              <p className="text-xs text-[#86868b] dark:text-zinc-400 font-light leading-relaxed">
                Unlock absolute processing capabilities, deep multi-format documents, and unlimited speeds.
              </p>
              
              <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-zinc-350 pt-4 border-t border-black/[0.04] dark:border-zinc-800">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> <strong>Unlimited</strong> file & video summaries</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> PDF, Word, PowerPoint, Excel inputs</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> MP3 Audio & Video file summaries</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Interactive AI Q&A Chat window</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Premium exports (PDF / Word / Notion)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> 10x faster generation speeds</li>
              </ul>

              {/* High-contrast Viral Referral sub-card */}
              <div className="mt-4 p-4 bg-indigo-50/70 dark:bg-indigo-950/20 border border-dashed border-indigo-250 dark:border-indigo-900/40 rounded-xl space-y-2 text-left">
                <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <Gift className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>🎁 Unlock Pro Free for Life</span>
                </p>
                <p className="text-[11.5px] text-neutral-600 dark:text-zinc-300 font-light leading-relaxed">
                  Don't want to pay? <strong className="font-semibold text-indigo-700 dark:text-indigo-400">Invite just 2 friends</strong> to bypass all daily restrictions and unlock Pro features instantly.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onUpgrade}
              className="mt-8 w-full py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-extrabold transition cursor-pointer text-center shadow-md"
            >
              Get Pro Now
            </button>
          </div>

        </div>

        {/* Comparison Table */}
        <div className="max-w-2xl mx-auto overflow-hidden rounded-2xl border border-black/[0.06] dark:border-zinc-800 text-left text-xs bg-white dark:bg-zinc-900">
          <div className="grid grid-cols-3 bg-neutral-100/90 dark:bg-zinc-800/80 px-6 py-3 font-bold text-[10px] uppercase tracking-widest text-neutral-500 dark:text-zinc-400 font-mono">
            <span>Feature Details</span>
            <span className="text-center">Free Trial</span>
            <span className="text-center text-[#0071e3]">Pro Suite</span>
          </div>
          {[
            ['Daily Summaries', '3 / day', 'Unlimited'],
            ['YouTube & Web URLs', '✓ Included', '✓ Included'],
            ['PDF / Word / PowerPoint', '—', '✓ Included'],
            ['Audio & Video files', '—', '✓ Included'],
            ['AI Chat Q&A', '—', '✓ Included'],
            ['Mind Maps & Flashcards', 'Basic', 'Full Suite'],
            ['Export (PDF / Word / Notion)', '—', '✓ Included'],
            ['Priority Processing', '—', '✓ Included'],
            ['Translation', '—', '✓ Included'],
          ].map(([feat, free, pro], i) => (
            <div key={i} className={`grid grid-cols-3 px-6 py-3 border-t border-black/[0.03] dark:border-zinc-800 ${i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-neutral-50/50 dark:bg-zinc-900/40'}`}>
              <span className="font-medium text-neutral-700 dark:text-zinc-300">{feat}</span>
              <span className={`text-center ${free === '—' ? 'text-neutral-300 dark:text-zinc-600' : 'text-neutral-500 font-semibold'}`}>{free}</span>
              <span className="text-center text-[#0071e3] font-bold">{pro}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="py-20 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="space-y-4 text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#0071e3]">FAQ</span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-neutral-900 dark:text-zinc-50 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-500 dark:text-zinc-400 font-light text-base leading-relaxed">
            Everything you need to know about Zipytiny credits, file security, and offline support.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-zinc-200 hover:bg-neutral-50/50 transition cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs text-[#86868b] dark:text-zinc-400 font-light leading-relaxed border-t border-black/[0.01] text-left">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. FINAL CTA SECTION */}
      <section className="w-full bg-neutral-900 dark:bg-zinc-950 text-white py-24 text-center relative overflow-hidden border-t border-neutral-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight leading-tight">
            Ready to Triple Your Learning & Sifting Speed?
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto font-light text-sm sm:text-base leading-relaxed">
            Join thousands of Postgrad students, professional creators, and investment analysts who use Zipytiny to distill knowledge and remember more.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                const inputEl = document.getElementById('landing-main-input') as HTMLInputElement;
                if (inputEl) {
                  inputEl.focus();
                  inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  onLaunchApp();
                }
              }}
              className="bg-white text-zinc-950 hover:bg-zinc-100 px-8 py-4 rounded-full font-bold text-sm transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-white/5 active:scale-98"
            >
              <span>Get Started Free Now</span>
              <ArrowRight className="w-4 h-4 text-zinc-950" />
            </button>
          </div>
        </div>
      </section>

      {/* 10. PREMIUM SAAS FOOTER */}
      <footer className="w-full bg-neutral-950 text-zinc-400 pt-16 pb-8 border-t border-zinc-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 space-y-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-white flex items-center justify-center rounded-xl overflow-hidden">
                  <img src="/logo.svg" alt="Zipytiny Logo" className="w-full h-full object-cover animate-pulse" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                </div>
                <span className="font-extrabold text-white font-display text-lg tracking-tight">Zipytiny</span>
              </div>
              <p className="text-xs leading-relaxed font-light max-w-xs text-zinc-400">
                Universal AI-powered Video Summarizer and Knowledge Engine. Convert multi-source content into interactive recall systems in seconds.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>SOC2 Compliant · HIPAA Ready · SSL Secured</span>
              </div>
            </div>

            {/* Product Column */}
            <div className="space-y-4 text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Product</h4>
              <ul className="space-y-2.5 text-xs text-zinc-450 font-medium">
                <li><a href="#landing-hero-headline" className="hover:text-white transition-colors duration-150">Features</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onUpgrade(); }} className="hover:text-white transition-colors duration-150">Pricing Plan</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-150">Changelog</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-150">Enterprise API</a></li>
              </ul>
            </div>

            {/* Use Cases Column */}
            <div className="space-y-4 text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Use Cases</h4>
              <ul className="space-y-2.5 text-xs text-zinc-450 font-medium">
                <li><button type="button" onClick={() => setActiveUseC('students')} className="hover:text-white transition-colors duration-150 text-left">Students</button></li>
                <li><button type="button" onClick={() => setActiveUseC('professionals')} className="hover:text-white transition-colors duration-150 text-left">Professionals</button></li>
                <li><button type="button" onClick={() => setActiveUseC('teachers')} className="hover:text-white transition-colors duration-150 text-left">Teachers</button></li>
                <li><button type="button" onClick={() => setActiveUseC('researchers')} className="hover:text-white transition-colors duration-150 text-left">Researchers</button></li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className="space-y-4 text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Support</h4>
              <ul className="space-y-2.5 text-xs text-zinc-450 font-medium">
                <li><a href="mailto:support@zipytiny.app" className="hover:text-white transition-colors duration-150">support@zipytiny.app</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-150">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-150">Terms of Service</a></li>
                <li><a href="mailto:hello@zipytiny.app" className="hover:text-white transition-colors duration-150">hello@zipytiny.app</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>© 2026 Zipytiny Inc. All rights reserved. Created for Google AI Studio Challenge.</span>
            <span>Version 2.4.2 · Production Server Node live</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
