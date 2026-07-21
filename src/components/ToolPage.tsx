import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, BookOpen, Clock, ArrowRight, Sparkles, HelpCircle, 
  Layers, FileText, CheckCircle, Video, MessageSquare, Brain, 
  Play, RefreshCw, AlertCircle, Send, Plus, ArrowUpRight, Check, X, Bookmark
} from 'lucide-react';
import { YOUTUBE_DEMOS, PDF_DEMOS, TUTOR_DEMOS, DemoDataset, ChatMessage } from '../data/demosData';

interface ToolPageProps {
  currentToolSlug: string;
  onLaunchApp: (url?: string, type?: 'video' | 'website' | 'file' | 'text') => void;
  onNavigateHome: () => void;
}

export default function ToolPage({ currentToolSlug, onLaunchApp, onNavigateHome }: ToolPageProps) {
  // 1. Resolve Tool Specific Identity & Values
  const isYoutubeTool = currentToolSlug === 'youtube-lecture-summarizer';
  const isPdfTool = currentToolSlug === 'pdf-study-guide-generator';
  const isTutorTool = currentToolSlug === 'interactive-ai-tutor';

  // 2. State management for interactive widgets
  const [selectedDemoKey, setSelectedDemoKey] = useState<string>(() => {
    if (isYoutubeTool) return 'cs50-algorithms';
    if (isPdfTool) return 'biology-cell';
    return '';
  });

  const activeDataset: DemoDataset | null = isYoutubeTool 
    ? YOUTUBE_DEMOS[selectedDemoKey] || YOUTUBE_DEMOS['cs50-algorithms']
    : isPdfTool 
      ? PDF_DEMOS[selectedDemoKey] || PDF_DEMOS['biology-cell']
      : null;

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'flashcards' | 'concepts'>('summary');

  // Interactive Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Flashcards state (flipped cards tracker)
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // Form Inputs
  const [pastedUrl, setPastedUrl] = useState('');
  const [tutorInput, setTutorInput] = useState('');
  const [isLiveGenerating, setIsLiveGenerating] = useState(false);
  const [liveGenerateError, setLiveGenerateError] = useState('');

  // Interactive Chat State for Feynman AI Tutor
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => TUTOR_DEMOS['quantum-computing']);
  const [isTutorTyping, setIsTutorTyping] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Reset states when changing demo dataset
  useEffect(() => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setFlippedCards({});
    setLiveGenerateError('');
  }, [selectedDemoKey]);

  // Load chat preset
  const handleLoadTutorPreset = (presetKey: string) => {
    setChatMessages(TUTOR_DEMOS[presetKey] || []);
  };

  // Submit tutor question
  const handleSendTutorMessage = (textToSend?: string) => {
    const rawText = textToSend || tutorInput;
    if (!rawText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setTutorInput('');
    setIsTutorTyping(true);

    // Simulate Socratic AI Tutoring Response
    setTimeout(() => {
      let responseText = `I hear you! Let's explore "${rawText}" using the Feynman Technique.\n\nFirst, what is the core mechanism that makes this concept function? Let's write down what we know, simplify the jargon, and then construct a clear analogy to test if we truly understand its foundation. Would you like to go through it step-by-step?`;
      
      // Smart Socratic matching rules
      const lower = rawText.toLowerCase();
      if (lower.includes('quantum')) {
        responseText = `Quantum computing is super exciting! Let's strip away the heavy physics formulas.\n\nAt its core, a quantum computer doesn't use standard binary switches (bits) that are strictly 0 or 1. Instead, it uses qubits. Think of a qubit like a spinning coin: while it is spinning, is it heads or tails? It is actually a mixture of both! This is called **Superposition**.\n\nThis lets us calculate massive pathways simultaneously. If you had to search a maze, a normal computer walks one path at a time. A quantum computer sends a flood of water through all paths at once to find the end immediately!`;
      } else if (lower.includes('photosynthesis')) {
        responseText = `Photosynthesis is basically the ultimate cooking class for plants!\n\n**Ingredients:** Sunlight (captured by green chlorophyll solar panels), Water (drawn from roots), and Carbon Dioxide (breathed in from air stomata).\n\n**The Recipe:** Sunlight splits water molecules, releasing Oxygen (for us to breathe!) and storing Hydrogen. Then, it cooks the hydrogen with carbon dioxide to create **Glucose** (sugar energy) for the plant to eat and grow.\n\nWhat part of this chemical kitchen feels most mysterious to you?`;
      } else if (lower.includes('bayes')) {
        responseText = `Bayes' Theorem is your brain's tool for updating beliefs when you get new clues!\n\nInstead of guessing blindly, you take your **Prior Belief** (e.g., "how likely is this to happen based on history?") and multiply it by the **Likelihood** of your new evidence.\n\n**Simple Analogy:** You wake up and see your lawn is wet. Did it rain? If you live in the Sahara desert (extremely low prior for rain), and you hear your neighbor's lawn sprinkler running, Bayes' formula correctly calculates that it is 99% likely a sprinkler, not rain!`;
      }

      const tutorMsg: ChatMessage = {
        id: 'tutor_' + Date.now(),
        sender: 'tutor',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, tutorMsg]);
      setIsTutorTyping(false);
    }, 1500);
  };

  // Live generation handler for custom inputs (redirects or trial)
  const handleLiveGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isYoutubeTool && !pastedUrl) return;

    if (isYoutubeTool) {
      const match = pastedUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
      if (!match) {
        setLiveGenerateError('Please enter a valid YouTube video URL (e.g. https://www.youtube.com/watch?v=...)');
        return;
      }
      setIsLiveGenerating(true);
      setTimeout(() => {
        setIsLiveGenerating(false);
        onLaunchApp(pastedUrl, 'video');
      }, 1000);
    } else if (isPdfTool) {
      // Simulate file upload transition
      setIsLiveGenerating(true);
      setTimeout(() => {
        setIsLiveGenerating(false);
        onLaunchApp(undefined, 'file');
      }, 1200);
    }
  };

  // FAQ Content Map
  const faqs = [
    {
      q: "How does the Zipytiny AI YouTube Lecture Summarizer work?",
      a: "Zipytiny uses high-speed model parsing to transcribe any educational video or lecture, divide the content into chronological chapters, identify core academic terminology, and instantly synthesize flippable study flashcards, mind maps, and practice quizzes."
    },
    {
      q: "Can I upload textbook PDFs or slide handouts to generate study guides?",
      a: "Absolutely! Our PDF Study Guide Generator supports uploading textbooks, slides, hand-outs, and study sheets. The AI processes visual layouts, bullet hierarchies, and terminology to compile structured syllabus notes and spaced repetition card decks."
    },
    {
      q: "What is Generative Engine Optimization (GEO) in study materials?",
      a: "GEO structures content logically so modern AI search engines and search assistants (such as ChatGPT, Gemini, and Perplexity) can crawl, extract, and represent factual information clearly, citing sources with high authority and accurate entity definitions."
    },
    {
      q: "Can I save, export, or sync my study workspaces?",
      a: "Yes! Every workspace supports one-click copying of pristine Markdown perfectly structured for Notion, Obsidian, Evernote, and Word, as well as digital downloads of flashcards and practice test outlines."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-neutral-800 dark:text-zinc-100 antialiased pb-24">
      {/* 🚀 BREADCRUMB HEADER */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <button 
          id="back-to-home-btn"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-zinc-400 hover:text-[#0071e3] dark:hover:text-indigo-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Learning Hub</span>
        </button>
      </header>

      {/* 🚀 HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-[#0071e3]/10 dark:bg-indigo-500/10 border border-[#0071e3]/20 dark:border-indigo-500/20 px-3 py-1 rounded-full text-xs font-mono font-bold text-[#0071e3] dark:text-indigo-400 uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active AI Study Tool Sandbox</span>
            </div>

            <h1 id="seo-tool-title" className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-neutral-900 dark:text-white leading-tight">
              {isYoutubeTool && "AI YouTube Lecture Summarizer & Study Workspace"}
              {isPdfTool && "AI PDF Study Guide Generator & Workspace"}
              {isTutorTool && "Interactive AI Tutor & Feynman Assistant"}
            </h1>

            <p className="text-neutral-500 dark:text-zinc-400 font-light text-base sm:text-lg max-w-2xl leading-relaxed">
              {isYoutubeTool && "Turn long lecture videos and tutorials into structured, interactive study materials. Instantly generate chronological outlines, spaced repetition flashcards, and active recall practice quizzes."}
              {isPdfTool && "Automatically parse lecture slides, research papers, and textbook chapters. Convert dense handouts into readable syllabus outlines, simplified bento concepts, and diagnostic testing sheets."}
              {isTutorTool && "Master complex topics through active Socratic dialogue. Ask the Feynman AI Tutor anything, explore intuitive analogies, and target mental gaps using proven cognitive sciences."}
            </p>

            {/* Live CTA Forms / Dynamic Inputs */}
            <div className="pt-4 max-w-xl">
              {isYoutubeTool && (
                <form onSubmit={handleLiveGenerate} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="url" 
                        placeholder="Paste YouTube or Vimeo video link..."
                        value={pastedUrl}
                        onChange={(e) => setPastedUrl(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 rounded-2xl text-sm placeholder-neutral-400 dark:placeholder-zinc-500 text-neutral-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-indigo-500 shadow-sm"
                      />
                      <Video className="absolute right-4 top-4 w-4.5 h-4.5 text-neutral-400" />
                    </div>
                    <button 
                      type="submit"
                      disabled={isLiveGenerating}
                      className="px-6 py-3.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold rounded-2xl text-sm transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      {isLiveGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Parsing...</span>
                        </>
                      ) : (
                        <>
                          <span>Generate Workspace</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                  {liveGenerateError && (
                    <div className="flex items-center gap-2 text-xs text-rose-500 dark:text-rose-400 font-light">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{liveGenerateError}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-neutral-400 dark:text-zinc-500">
                    <span>Try popular pre-compiled lectures below:</span>
                    <button 
                      type="button"
                      onClick={() => setSelectedDemoKey('cs50-algorithms')}
                      className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${selectedDemoKey === 'cs50-algorithms' ? 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3] dark:text-indigo-400' : 'bg-white dark:bg-zinc-900 border-black/5 dark:border-zinc-800 hover:border-black/10'}`}
                    >
                      Harvard CS50 Algorithms
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSelectedDemoKey('leadership-sinek')}
                      className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${selectedDemoKey === 'leadership-sinek' ? 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3] dark:text-indigo-400' : 'bg-white dark:bg-zinc-900 border-black/5 dark:border-zinc-800 hover:border-black/10'}`}
                    >
                      Simon Sinek: Golden Circle
                    </button>
                  </div>
                </form>
              )}

              {isPdfTool && (
                <div className="space-y-4">
                  <div 
                    onClick={handleLiveGenerate}
                    className="border-2 border-dashed border-black/10 dark:border-zinc-800 hover:border-[#0071e3] dark:hover:border-indigo-500 p-8 rounded-3xl bg-white dark:bg-zinc-900/40 text-center transition cursor-pointer group shadow-xs"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 dark:bg-indigo-500/10 flex items-center justify-center text-[#0071e3] dark:text-indigo-400 group-hover:scale-110 transition">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-neutral-700 dark:text-zinc-200">Drag & Drop slides or syllabus PDF here</p>
                        <p className="text-xs text-neutral-400 dark:text-zinc-500 font-light">Supports .pdf, .docx, .pptx, or screenshots (Max 25MB)</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 dark:text-zinc-500">
                    <span>Try pre-compiled study handouts:</span>
                    <button 
                      onClick={() => setSelectedDemoKey('biology-cell')}
                      className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${selectedDemoKey === 'biology-cell' ? 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3] dark:text-indigo-400' : 'bg-white dark:bg-zinc-900 border-black/5 dark:border-zinc-800 hover:border-black/10'}`}
                    >
                      Biology Mitosis Slides
                    </button>
                    <button 
                      onClick={() => setSelectedDemoKey('calculus-limits')}
                      className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${selectedDemoKey === 'calculus-limits' ? 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3] dark:text-indigo-400' : 'bg-white dark:bg-zinc-900 border-black/5 dark:border-zinc-800 hover:border-black/10'}`}
                    >
                      Calculus limits Workbook
                    </button>
                  </div>
                </div>
              )}

              {isTutorTool && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
                    <span>Ask about popular topics:</span>
                    <button 
                      onClick={() => { handleLoadTutorPreset('quantum-computing'); }}
                      className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 hover:border-[#0071e3] hover:text-[#0071e3] dark:hover:text-indigo-400 dark:hover:border-indigo-500 rounded-lg transition cursor-pointer"
                    >
                      Quantum Computing
                    </button>
                    <button 
                      onClick={() => { handleLoadTutorPreset('photosynthesis'); }}
                      className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 hover:border-[#0071e3] hover:text-[#0071e3] dark:hover:text-indigo-400 dark:hover:border-indigo-500 rounded-lg transition cursor-pointer"
                    >
                      Photosynthesis
                    </button>
                    <button 
                      onClick={() => { handleLoadTutorPreset('bayes-theorem'); }}
                      className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 hover:border-[#0071e3] hover:text-[#0071e3] dark:hover:text-indigo-400 dark:hover:border-indigo-500 rounded-lg transition cursor-pointer"
                    >
                      Bayes' Theorem
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visual Graphic/Hero Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-3xl overflow-hidden bg-gradient-to-tr from-indigo-500 via-purple-600 to-amber-400 p-1.5 shadow-xl rotate-1 hover:rotate-0 transition duration-500">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-[22px] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0071e3] to-indigo-500 flex items-center justify-center text-white text-xs font-bold font-display">Z</div>
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Zipytiny Pro</span>
                  </div>
                  <Bookmark className="w-4 h-4 text-[#0071e3]" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-2/3 bg-neutral-100 dark:bg-zinc-800 rounded-md" />
                  <div className="h-3 w-5/6 bg-neutral-50 dark:bg-zinc-800/50 rounded-md" />
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/50 border border-black/[0.03] dark:border-zinc-800/80 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-green-600 font-bold uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Active Recall Workspace Synced</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 text-center border border-black/[0.02]">
                      <div className="text-xs font-bold text-[#0071e3]">100%</div>
                      <div className="text-[9px] text-neutral-400">Notes</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 text-center border border-black/[0.02]">
                      <div className="text-xs font-bold text-rose-500">20+</div>
                      <div className="text-[9px] text-neutral-400">Cards</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 text-center border border-black/[0.02]">
                      <div className="text-xs font-bold text-amber-500">4.9★</div>
                      <div className="text-[9px] text-neutral-400">Syllabus</div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onLaunchApp()}
                  className="w-full py-2.5 text-xs font-bold bg-[#1d1d1f] dark:bg-white text-white dark:text-zinc-950 hover:bg-[#0071e3] hover:text-white dark:hover:bg-indigo-600 rounded-xl transition cursor-pointer"
                >
                  Unlock Unlimited Workspace Access
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 🚀 INTERACTIVE SANDBOX STAGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-black/[0.05] dark:border-zinc-800/80 shadow-sm overflow-hidden">
          
          {/* Top Panel: Identity details & Tabs */}
          <div className="p-6 sm:p-8 border-b border-black/5 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#0071e3] dark:text-indigo-400">
                {isYoutubeTool && "YouTube Video Workspace Simulator"}
                {isPdfTool && "Document Study Guide Simulator"}
                {isTutorTool && "Feynman AI Dialogue Simulator"}
              </span>
              <h2 className="text-xl font-bold text-neutral-800 dark:text-zinc-100 leading-snug">
                {isTutorTool ? "Feynman Socratic Study Room" : activeDataset?.title}
              </h2>
              <p className="text-xs text-neutral-400 font-light">
                {isTutorTool ? "Active Socratic session mapping concepts to everyday analogies" : `By ${activeDataset?.author}`}
              </p>
            </div>

            {/* Tab Swappers (for non-tutor tools) */}
            {!isTutorTool && (
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-black/[0.04] dark:border-zinc-800 overflow-x-auto scrollbar-none">
                <button 
                  onClick={() => setActiveTab('summary')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'summary' ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Syllabus Notes</span>
                </button>
                <button 
                  onClick={() => setActiveTab('quiz')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'quiz' ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Practice Quiz</span>
                </button>
                <button 
                  onClick={() => setActiveTab('flashcards')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'flashcards' ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Flashcards</span>
                </button>
                <button 
                  onClick={() => setActiveTab('concepts')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'concepts' ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Analogy Map</span>
                </button>
              </div>
            )}
          </div>

          {/* Sandbox Body Content */}
          <div className="p-6 sm:p-8 min-h-[400px]">
            {isTutorTool ? (
              /* 🚀 AI TUTOR CHAT ROOM */
              <div className="space-y-6 max-w-3xl mx-auto flex flex-col justify-between h-[500px]">
                {/* Message display log */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex gap-3 max-w-xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${msg.sender === 'user' ? 'bg-neutral-800 dark:bg-zinc-800 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}`}>
                        {msg.sender === 'user' ? 'U' : 'F'}
                      </div>
                      <div className="space-y-1">
                        <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-zinc-950 text-neutral-800 dark:text-zinc-200 border border-black/[0.02] dark:border-zinc-800/60 rounded-tl-none whitespace-pre-wrap'}`}>
                          {msg.text}
                        </div>
                        <div className={`text-[10px] text-neutral-400 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTutorTyping && (
                    <div className="flex gap-3 max-w-xl">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">F</div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-black/[0.02] dark:border-zinc-800/60 rounded-tl-none flex items-center gap-1.5 py-3">
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-200"></span>
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-300"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input panel */}
                <div className="pt-4 border-t border-black/5 dark:border-zinc-800 flex gap-2">
                  <input 
                    type="text"
                    placeholder="Ask Feynman AI Tutor anything (e.g. explain gravity)..."
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendTutorMessage(); }}
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-black/10 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#0071e3] text-neutral-800 dark:text-zinc-100"
                  />
                  <button 
                    onClick={() => handleSendTutorMessage()}
                    className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* 🚀 GENERAL INTERACTIVE WORKSPACE (SUMMARY, QUIZ, FLASHCARDS, CONCEPTS) */
              <div className="max-w-4xl mx-auto space-y-6">
                {activeTab === 'summary' && activeDataset && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/40 border border-black/[0.02] dark:border-zinc-800/40 space-y-3">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>AI Executive Outline</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-zinc-400 leading-relaxed font-light">
                        {activeDataset.summary}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs">Core Chapters & Timestamps</h3>
                      <div className="space-y-2">
                        {activeDataset.chapters.map((chap, idx) => (
                          <div 
                            key={idx}
                            className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-800/40 hover:border-[#0071e3]/30 dark:hover:border-indigo-500/30 transition flex items-start gap-4"
                          >
                            <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-zinc-950 text-[10px] font-mono font-bold text-[#0071e3] dark:text-indigo-400">
                              {chap.timestamp}
                            </span>
                            <div className="space-y-1">
                              <h4 className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-zinc-200">{chap.title}</h4>
                              <p className="text-xs text-neutral-400 dark:text-zinc-400 font-light leading-snug">{chap.summary}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'quiz' && activeDataset && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="space-y-4">
                      {activeDataset.quiz.map((q, qIdx) => {
                        const isCorrectSelected = selectedAnswers[qIdx] === q.answerIndex;
                        return (
                          <div 
                            key={qIdx}
                            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-800/80 space-y-4"
                          >
                            <h4 className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-zinc-100">
                              {qIdx + 1}. {q.question}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = selectedAnswers[qIdx] === optIdx;
                                return (
                                  <button
                                    key={optIdx}
                                    disabled={quizSubmitted}
                                    onClick={() => {
                                      setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                                    }}
                                    className={`p-3 rounded-xl text-left text-xs transition cursor-pointer border ${
                                      isSelected 
                                        ? 'bg-[#0071e3]/10 border-[#0071e3] text-[#0071e3] dark:bg-indigo-600/10 dark:border-indigo-500 dark:text-indigo-400 font-semibold'
                                        : 'bg-slate-50 dark:bg-zinc-950 border-black/[0.02] dark:border-zinc-800/40 hover:border-black/10'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Show correction after submission */}
                            {quizSubmitted && (
                              <div className={`p-4 rounded-xl text-xs leading-relaxed ${isCorrectSelected ? 'bg-green-500/10 border border-green-500/20 text-green-600' : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'}`}>
                                <div className="font-bold flex items-center gap-1.5 mb-1">
                                  {isCorrectSelected ? (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Correct Answer!</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-4 h-4" />
                                      <span>Incorrect. True Answer is: "{q.options[q.answerIndex]}"</span>
                                    </>
                                  )}
                                </div>
                                <p className="font-light text-neutral-500 dark:text-zinc-400">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-zinc-800">
                      <div className="text-xs text-neutral-400">
                        {quizSubmitted 
                          ? `Completed! Score: ${Object.keys(selectedAnswers).filter(k => selectedAnswers[Number(k)] === activeDataset.quiz[Number(k)].answerIndex).length}/${activeDataset.quiz.length}`
                          : "Select answers to submit."
                        }
                      </div>
                      <div className="flex gap-2">
                        {quizSubmitted ? (
                          <button 
                            onClick={() => {
                              setSelectedAnswers({});
                              setQuizSubmitted(false);
                            }}
                            className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-zinc-800 rounded-xl transition hover:bg-slate-200 cursor-pointer flex items-center gap-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retake Test</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => setQuizSubmitted(true)}
                            className="px-5 py-2 text-xs font-bold bg-[#0071e3] dark:bg-indigo-600 text-white rounded-xl transition hover:opacity-90 cursor-pointer"
                          >
                            Submit Answers
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'flashcards' && activeDataset && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center pb-2">
                      <p className="text-xs text-neutral-400 font-light">💡 Click cards below to flip and reveal definitions instantly.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {activeDataset.flashcards.map((card, idx) => {
                        const isFlipped = flippedCards[idx] || false;
                        return (
                          <div 
                            key={idx}
                            onClick={() => setFlippedCards(prev => ({ ...prev, [idx]: !isFlipped }))}
                            className="h-44 [perspective:1000px] cursor-pointer"
                          >
                            <div className={`relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                              
                              {/* FRONT: Term */}
                              <div className="absolute w-full h-full backface-hidden rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-800/80 p-5 flex flex-col justify-between text-left">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-rose-500">Active Term</span>
                                <h4 className="text-sm font-bold text-neutral-800 dark:text-white leading-tight pr-4">{card.term}</h4>
                                <span className="text-[10px] text-neutral-400">Click to reveal definition</span>
                              </div>

                              {/* BACK: Definition */}
                              <div className="absolute w-full h-full backface-hidden [transform:rotateY(180deg)] rounded-2xl bg-indigo-600/5 dark:bg-indigo-950/40 border border-indigo-500/30 p-5 flex flex-col justify-between text-left">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-500 dark:text-indigo-400">AI Definition</span>
                                <p className="text-xs text-neutral-600 dark:text-zinc-300 font-light leading-relaxed">{card.definition}</p>
                                <span className="text-[10px] text-indigo-500">Click to hide</span>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'concepts' && activeDataset && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    {activeDataset.concepts.map((conc, idx) => (
                      <div 
                        key={idx}
                        className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-800/80 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <Brain className="w-4 h-4" />
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-zinc-100">{conc.concept}</h4>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Scientific Definition</span>
                            <p className="text-xs text-neutral-500 dark:text-zinc-400 font-light leading-relaxed">{conc.definition}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-amber-500/[0.02] border border-amber-500/10">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Everyday Analogy</span>
                            <p className="text-xs text-neutral-600 dark:text-zinc-300 font-light italic leading-relaxed">"{conc.analogy}"</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Panel: Interactive Footer Call To Action */}
          <div className="p-6 sm:p-8 border-t border-black/5 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4 text-[#0071e3]" />
                <span>Like this interactive sandbox?</span>
              </h3>
              <p className="text-xs text-neutral-400 font-light">
                Sign in to customize learning speeds, save study files, translate to 15+ languages and download srt transcripts.
              </p>
            </div>
            <button 
              onClick={() => onLaunchApp()}
              className="px-6 py-3 bg-[#1d1d1f] dark:bg-white text-white dark:text-zinc-950 hover:bg-[#0071e3] hover:text-white font-bold rounded-2xl text-xs transition shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Unlock Full Study Workspace</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 🚀 VALUE bento / PRODUCT ADVANTAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-neutral-900 dark:text-white">
            Proven Cognitive Learning Workstation
          </h2>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            Rather than passive reading, ZipyTiny applies rigorous cognitive studies to maximize retention rates through active recall testing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[24px] bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-zinc-200">Active Recall Generation</h3>
            <p className="text-xs text-neutral-400 dark:text-zinc-400 leading-relaxed font-light">
              We translate passive watching and reading into active testing. Generate challenging multi-choice flashcards and diagnostic tests instantly.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-zinc-200">Semantic Concepts & Analogies</h3>
            <p className="text-xs text-neutral-400 dark:text-zinc-400 leading-relaxed font-light">
              Isolate difficult terminology from text or video streams. Our AI tutor constructs custom analogies to make abstract formulas feel intuitive.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-zinc-200">Structured Syllabus Outlines</h3>
            <p className="text-xs text-neutral-400 dark:text-zinc-400 leading-relaxed font-light">
              Skip unorganized transcripts. Get clean, hierarchical, annotated outlines complete with chronological indices and direct quotes.
            </p>
          </div>
        </div>
      </section>

      {/* 🚀 ACCORDION FAQ SECTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-black/5 dark:border-zinc-800">
        <h2 className="text-2xl font-bold tracking-tight text-center text-neutral-900 dark:text-white mb-8">
          Frequently Asked Questions (FAQ)
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl border border-black/[0.03] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
              >
                <button
                  id={`faq-btn-${idx}`}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-semibold text-xs sm:text-sm text-neutral-800 dark:text-zinc-200 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <Plus className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-45 text-[#0071e3]' : 'text-neutral-400'}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-5 pt-0 border-t border-black/[0.01] dark:border-zinc-800/20 text-xs sm:text-sm text-neutral-500 dark:text-zinc-400 font-light leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
