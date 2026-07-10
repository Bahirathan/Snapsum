import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Zap, ArrowRight, CheckCircle, FileText, Globe, MessageSquare, 
  Video, Play, Bookmark, Headphones, Users, ChevronDown, Download, Award,
  Upload, Brain, Share2, Star, TrendingUp, Clock, Shield, Cpu,
  BarChart2, Layers, BookOpen, Mic, PenTool, Hash, ChevronRight
} from 'lucide-react';
import { CinematicExplainer } from './CinematicExplainer';

interface LandingPageProps {
  onLaunchApp: (targetTab?: string, targetSubTab?: string) => void;
  onNavigateToFeature?: (featureSlug: string) => void;
  onUpgrade: () => void;
  isPremium: boolean;
  visitorUser: any;
  onGoogleSignIn: () => void;
  onStartFreeSummary?: (url: string) => void;
}

// Animated counter hook
function useCountUp(target: number, duration = 1800, startTrigger = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startTrigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, startTrigger]);
  return count;
}

export default function LandingPage({ onLaunchApp, onNavigateToFeature, onUpgrade, isPremium, visitorUser, onGoogleSignIn, onStartFreeSummary }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'key_insights' | 'chapters' | 'quiz'>('summary');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [ytUrl, setYtUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  // Trigger counters when stats section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const summariesCount = useCountUp(850000, 2000, statsVisible);
  const usersCount = useCountUp(14000, 1800, statsVisible);
  const hoursSavedCount = useCountUp(120000, 2200, statsVisible);

  // Mock interactive product preview summary responses
  const previewData = {
    summary: "In this comprehensive breakdown, we examine the fundamental structures of building high-performance AI startups in 2026. The shift from traditional SaaS architectures to agentic workflows is driving a 10x reduction in development overhead while maximizing customer experience.\n\nKey areas explored include serverless backend optimization, deploying state-of-the-art open-source LLMs like Llama 3, and integrating secure vector databases for persistent multi-modal reasoning capability.",
    key_insights: [
      "Agentic LLM integrations reduce customer service response times by up to 88%.",
      "Vector database embeddings are 100x cheaper when compiled with modern in-memory key-value indexes.",
      "Hybrid-cloud scaling is now a hard-requirement for handling multi-million token loads securely.",
      "Enterprise clients prioritize data locality and private VPC LLMs over general public API platforms."
    ],
    chapters: [
      { time: "0:00", title: "Introduction to Agentic Architectures" },
      { time: "2:15", title: "Why Traditional SaaS Models Are Failing" },
      { time: "5:45", title: "Deep Dive: Vector Index Optimization" },
      { time: "9:30", title: "Case Study: Scaling to 10M Tokens/Sec" }
    ],
    quiz: {
      question: "Which index technology is recommended for 100x cheaper LLM reasoning in 2026?",
      options: [
        "In-Memory Key-Value Vector Database Indexes",
        "Legacy SQL Relational B-Trees",
        "Standard JSON Flat Files",
        "Public general REST APIs"
      ],
      answerIndex: 0,
      explanation: "In-memory key-value vector database indexes enable lightning-fast semantic retrieval at a fraction of the hardware cost compared to legacy architectures."
    }
  };

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
    <div className="w-full flex flex-col items-center justify-start text-[#1d1d1f] dark:text-zinc-100 antialiased bg-slate-50/10 dark:bg-zinc-950">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden pt-10 sm:pt-16 pb-20 sm:pb-28 border-b border-black/[0.02] dark:border-zinc-900 bg-linear-to-b from-indigo-50/30 via-transparent to-transparent dark:from-indigo-950/20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Title, Copy, URL input box, and CTA */}
            <div className="col-span-1 lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 bg-[#0071e3]/10 dark:bg-[#0071e3]/20 px-3 py-1 rounded-full text-[11px] font-mono font-medium text-[#0071e3] dark:text-sky-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Value First AI Learning Engine</span>
              </div>
              
              <h1 id="landing-hero-headline" className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight leading-[1.1] text-[#1d1d1f] dark:text-zinc-50">
                Turn Any Video Into a <br />
                <span className="bg-gradient-to-r from-[#0071e3] to-indigo-600 bg-clip-text text-transparent">Complete AI Learning Workspace</span>
              </h1>
              
              <p className="text-[#86868b] dark:text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed font-light">
                Convert lectures, tutorials, and educational videos into notes, mind maps, flashcards, quizzes, and structured learning materials in minutes.
              </p>

              {/* Frictionless Landing Page CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const inputEl = document.querySelector('input[placeholder*="YouTube video URL"]') as HTMLInputElement;
                    if (inputEl) {
                      inputEl.focus();
                      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Start Learning Free
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('interactive-tour-theater')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-neutral-100/80 hover:bg-neutral-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-neutral-800 dark:text-zinc-200 border border-neutral-250 dark:border-zinc-800 px-8 py-3.5 rounded-full font-semibold text-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-4 h-4 text-[#1d1d1f] dark:text-zinc-50 fill-current" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* 🎯 CONVERSION-OPTIMIZED YOUTUBE INPUT BOX */}
              <div className="w-full max-w-2xl pt-4">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!ytUrl.trim()) {
                      setUrlError('Please enter a valid YouTube URL');
                      return;
                    }
                    setUrlError('');
                    if (onStartFreeSummary) {
                      onStartFreeSummary(ytUrl.trim());
                    }
                  }}
                  className="relative flex flex-col sm:flex-row items-stretch gap-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-2 rounded-2xl shadow-lg focus-within:border-[#0071e3] focus-within:ring-2 focus-within:ring-[#0071e3]/15 transition-all"
                >
                  <div className="flex-1 flex items-center gap-3 pl-3">
                    <Video className="w-5 h-5 text-rose-500 shrink-0" />
                    <input
                      type="text"
                      placeholder="Paste any YouTube video URL (e.g. https://youtube.com/watch?v=...)"
                      value={ytUrl}
                      onChange={(e) => {
                        setYtUrl(e.target.value);
                        if (urlError) setUrlError('');
                      }}
                      className="w-full bg-transparent border-0 outline-none focus:ring-0 focus:outline-none text-sm text-neutral-800 dark:text-zinc-100 placeholder-neutral-400 dark:placeholder-zinc-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shrink-0 group cursor-pointer active:scale-98 shadow-sm"
                  >
                    <span>Generate Learning Workspace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                {urlError && (
                  <p className="text-xs text-rose-500 mt-2 ml-3 font-medium animate-fadeIn">{urlError}</p>
                )}

                <p className="text-xs text-[#86868b] dark:text-zinc-400 mt-3 ml-3 font-light flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Instant generation.</span>
                  <span className="font-semibold text-neutral-800 dark:text-zinc-300">No account required.</span>
                </p>
              </div>

              {/* Supported Formats Badge Grid */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b] dark:text-zinc-400">Also supports other formats inside the Workspace</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['Websites', 'PDFs', 'Word/Doc', 'PowerPoint', 'Audio/MP3', 'Video/MP4'].map((fmt) => (
                    <span key={fmt} className="px-2.5 py-1 bg-neutral-100 dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-800 rounded-lg text-[11px] font-medium text-neutral-600 dark:text-zinc-400">
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2 text-xs text-[#86868b] dark:text-zinc-400 font-light">
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Free daily summaries</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> High-fidelity mind maps</span>
              </div>
            </div>

            {/* Right Column: Live Interactive Product Mockup */}
            <div className="col-span-1 lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-3xl opacity-10 blur-xl dark:opacity-20"></div>
              
              <div className="bg-white dark:bg-zinc-900 border border-black/[0.05] dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
                {/* Mockup Header */}
                <div className="px-5 py-4 bg-neutral-50 dark:bg-zinc-950 border-b border-black/[0.04] dark:border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-400"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <span className="text-[10px] font-mono text-[#86868b] dark:text-zinc-400">zipytiny-interactive-preview.json</span>
                  <div className="w-8"></div>
                </div>

                {/* Mockup Tab Switches */}
                <div className="flex bg-neutral-100 dark:bg-zinc-950 p-1 gap-1 m-4 rounded-xl border border-black/[0.02] dark:border-zinc-800/60">
                  {[
                    { id: 'summary', label: 'Summary' },
                    { id: 'key_insights', label: 'Key Insights' },
                    { id: 'chapters', label: 'Timeline' },
                    { id: 'quiz', label: 'Interactive Quiz' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-zinc-100 shadow-xs'
                          : 'text-[#86868b] dark:text-zinc-400 hover:text-neutral-950'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Mockup Main Panel */}
                <div className="p-5 h-[230px] overflow-y-auto text-left scrollbar-none">
                  {activeTab === 'summary' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-[#0071e3] text-[10px] font-bold font-mono uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Executive Briefing</span>
                      </div>
                      <p className="text-xs leading-relaxed text-neutral-800 dark:text-zinc-300 font-light whitespace-pre-line">{previewData.summary}</p>
                    </div>
                  )}

                  {activeTab === 'key_insights' && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold font-mono uppercase tracking-wide">
                        <Award className="w-3.5 h-3.5" />
                        <span>Actionable Insights</span>
                      </div>
                      <ul className="space-y-1.5">
                        {previewData.key_insights.map((insight, idx) => (
                          <li key={idx} className="text-xs text-neutral-700 dark:text-zinc-300 flex items-start gap-2">
                            <span className="text-[#0071e3] font-bold mt-0.5">•</span>
                            <span className="font-light">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === 'chapters' && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono uppercase tracking-wide">
                        <Video className="w-3.5 h-3.5" />
                        <span>Timeline Chapters</span>
                      </div>
                      <div className="space-y-1.5">
                        {previewData.chapters.map((ch, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs p-2 bg-neutral-50 dark:bg-zinc-950 rounded-lg border border-black/[0.02] dark:border-zinc-850">
                            <span className="font-semibold text-neutral-800 dark:text-zinc-200">{ch.title}</span>
                            <span className="font-mono bg-neutral-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[9px] text-neutral-600 dark:text-zinc-400">{ch.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'quiz' && (
                    <div className="space-y-3.5 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[10px] font-bold font-mono uppercase tracking-wide">
                        <Zap className="w-3.5 h-3.5" />
                        <span>AI Study Quiz</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <p className="font-semibold text-neutral-800 dark:text-zinc-200">{previewData.quiz.question}</p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {previewData.quiz.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                              oIdx === 0 
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 text-emerald-800 dark:text-emerald-300 font-semibold' 
                                : 'bg-white dark:bg-zinc-900 border-neutral-100 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50'
                            }`}>
                              {opt}
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-neutral-450 leading-relaxed font-sans">{previewData.quiz.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mockup footer */}
                <div className="p-4 bg-neutral-50 dark:bg-zinc-950/80 border-t border-black/[0.03] dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-[#86868b]">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Compiled Successfully</span>
                  <span className="font-semibold text-neutral-700 dark:text-zinc-300">100% Score</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section ref={statsRef} className="w-full bg-white dark:bg-zinc-900 border-y border-black/[0.04] dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: statsVisible ? summariesCount.toLocaleString() : '0', suffix: '+', label: 'Summaries Generated', icon: <Sparkles className="w-5 h-5 text-[#0071e3]" /> },
              { value: statsVisible ? usersCount.toLocaleString() : '0', suffix: '+', label: 'Active Users', icon: <Users className="w-5 h-5 text-indigo-500" /> },
              { value: statsVisible ? hoursSavedCount.toLocaleString() : '0', suffix: 'h', label: 'Hours Saved', icon: <Clock className="w-5 h-5 text-emerald-500" /> },
              { value: '9', suffix: ' Formats', label: 'Input Sources Supported', icon: <Layers className="w-5 h-5 text-amber-500" /> },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-neutral-50 dark:bg-zinc-800 flex items-center justify-center">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-display text-neutral-900 dark:text-zinc-50 tabular-nums">
                  {stat.value}<span className="text-[#0071e3]">{stat.suffix}</span>
                </div>
                <div className="text-[11px] font-medium text-[#86868b] dark:text-zinc-400 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-3 text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#0071e3]">Simple & Fast</span>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50">
            Go From Content to Knowledge in 3 Steps
          </h2>
          <p className="text-[#86868b] dark:text-zinc-400 font-light text-base">
            No complicated setup. Paste a link or upload a file and get structured intelligence in under 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-zinc-700 to-transparent z-0"></div>
          
          {[
            {
              step: '01',
              icon: <Upload className="w-6 h-6 text-[#0071e3]" />,
              title: 'Paste or Upload',
              description: 'Drop in a YouTube URL, website link, PDF, Word doc, audio file, or paste raw text. Zipytiny accepts all major formats instantly.',
              color: 'bg-[#0071e3]/10 dark:bg-[#0071e3]/20',
              badge: 'YouTube · PDF · Word · Audio · Web',
            },
            {
              step: '02',
              icon: <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
              title: 'AI Processes & Structures',
              description: 'Gemini AI extracts the core ideas, creates a timeline, identifies key insights, generates quiz questions, and builds a mind map — automatically.',
              color: 'bg-indigo-500/10 dark:bg-indigo-500/20',
              badge: 'Gemini AI · Instant · No config',
            },
            {
              step: '03',
              icon: <Share2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
              title: 'Use, Export & Share',
              description: 'Study with flashcards, chat with your content, export to PDF/Word/Notion, or share a public link. Your knowledge, your way.',
              color: 'bg-emerald-500/10 dark:bg-emerald-500/20',
              badge: 'PDF · Word · Notion · Share Link',
            },
          ].map((item, idx) => (
            <div key={idx} className="relative z-10 bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-800 rounded-3xl p-8 text-left flex flex-col gap-5 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between">
                <div className={`h-12 w-12 ${item.color} rounded-2xl flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
                <span className="font-mono text-5xl font-black text-neutral-100 dark:text-zinc-800 leading-none select-none">{item.step}</span>
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-neutral-900 dark:text-zinc-100 mb-2">{item.title}</h3>
                <p className="text-xs text-[#86868b] dark:text-zinc-400 leading-relaxed font-light">{item.description}</p>
              </div>
              <div className="mt-auto">
                <span className="text-[10px] font-mono font-semibold text-neutral-500 dark:text-zinc-500 bg-neutral-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🎬 INTERACTIVE TOUR & RECORDER THEATER */}
      <section id="interactive-tour-theater" className="w-full bg-[#f5f5f7] dark:bg-zinc-900/40 py-16 sm:py-20 border-y border-black/[0.03] dark:border-zinc-800/60 scroll-mt-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 border border-indigo-150 dark:border-indigo-900 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-600/10" />
              <span>Interactive Cinematic Tour & Built-in Recorder</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900 dark:text-zinc-50 leading-tight">
              Test-Drive Zipytiny Interactive Tour & Capture Videos
            </h2>
            <p className="text-neutral-500 dark:text-zinc-400 font-light text-base sm:text-lg max-w-2xl mx-auto">
              Play with the active live-rendered simulation below. You can listen to studio-grade voiceover narrations, take real-time interactive quizzes, or use the <strong>built-in video recorder</strong> to download your customized demo video!
            </p>
          </div>

          <div className="transition duration-500 hover:shadow-xl rounded-3xl">
            <CinematicExplainer onStartLearning={() => onLaunchApp('app')} />
          </div>
        </div>
      </section>


      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-4 text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Full Feature Suite</span>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50">
            Engineered For Absolute Speed & Clarity
          </h2>
          <p className="text-[#86868b] dark:text-zinc-400 font-light text-base md:text-lg">
            Zipytiny compresses hours of multi-format content into organised, study-ready knowledge kits in under 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bento Cell 1: Universal Processor */}
          <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-850 p-8 rounded-3xl shadow-sm text-left flex flex-col justify-between space-y-6 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="h-10 w-10 bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] rounded-xl flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-zinc-100 font-display">Universal Content Processor</h3>
              <p className="text-xs text-[#86868b] dark:text-zinc-400 leading-relaxed font-light">
                Process any source in seconds. Import standard YouTube or Vimeo streams, crawl custom web articles, upload PDF studies, PowerPoint outlines, Word memos, Excel spreadsheets, images for OCR extraction, or record raw WAV/MP3 files. Zipytiny processes them all seamlessly.
              </p>
            </div>
            <div className="flex gap-2 text-[10px] font-mono text-neutral-500">
              <span className="bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded">No Format Lock-in</span>
              <span className="bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded">Batch File Extraction</span>
              <span className="bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded">Offline Fallback</span>
            </div>
          </div>

          {/* Bento Cell 2: AI Voice Reader */}
          <div className="bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-850 p-8 rounded-3xl shadow-sm text-left flex flex-col justify-between space-y-6 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="h-10 w-10 bg-[#bf5af2]/10 dark:bg-[#bf5af2]/20 text-[#bf5af2] rounded-xl flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-zinc-100 font-display">AI Voice Briefing (Podcast Gen)</h3>
              <p className="text-xs text-[#86868b] dark:text-zinc-400 leading-relaxed font-light">
                Busy schedule? Turn any text document, website, or lecture transcript into an interactive voice podcast briefing. Listen to the custom audio file anywhere.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#bf5af2] uppercase tracking-wide flex items-center gap-1">
              🎙️ High-Fidelity Synthesizer Active
            </span>
          </div>

          {/* Bento Cell 3: Interactive Quizzes */}
          <div className="bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-850 p-8 rounded-3xl shadow-sm text-left flex flex-col justify-between space-y-6 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="h-10 w-10 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-zinc-100 font-display">AI Study Quiz & Flashcards</h3>
              <p className="text-xs text-[#86868b] dark:text-zinc-400 leading-relaxed font-light">
                Retain what you digest. Zipytiny auto-generates interactive multiple-choice questionnaires and study flashcards based on your content. Perfect for students and researchers.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              ✓ Fully Populated Explanations
            </span>
          </div>

          {/* Bento Cell 4: Exporter Suite */}
          <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-850 p-8 rounded-3xl shadow-sm text-left flex flex-col justify-between space-y-6 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="h-10 w-10 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-zinc-100 font-display">Export & Synchronize Everywhere</h3>
              <p className="text-xs text-[#86868b] dark:text-zinc-400 leading-relaxed font-light">
                Sync summaries smoothly into your personal knowledge stacks. Directly export summaries to beautiful PDF printouts, Microsoft Word attachments, raw Markdown text, or copy directly into Notion pages.
              </p>
            </div>
            <div className="flex gap-2 text-[10px] font-mono text-neutral-500">
              <span className="bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded">PDF Reports</span>
              <span className="bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded">Word Documents</span>
              <span className="bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded">Notion Integration</span>
            </div>
          </div>

          {/* Bento Cell 5: AI Chat */}
          <div className="bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-850 p-8 rounded-3xl shadow-sm text-left flex flex-col justify-between space-y-6 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="h-10 w-10 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-zinc-100 font-display">AI Chat with Your Content</h3>
              <p className="text-xs text-[#86868b] dark:text-zinc-400 leading-relaxed font-light">
                After generating a summary, open the AI Chat tab and ask follow-up questions about any topic, concept, or detail — powered by Gemini's full document context.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide flex items-center gap-1">
              💬 Full Context Q&A
            </span>
          </div>

          {/* Bento Cell 6: Mind Maps */}
          <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-850 p-8 rounded-3xl shadow-sm text-left flex flex-col justify-between space-y-6 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="h-10 w-10 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-zinc-100 font-display">Visual Mind Maps & Knowledge Graphs</h3>
              <p className="text-xs text-[#86868b] dark:text-zinc-400 leading-relaxed font-light">
                Every summary auto-generates a visual mind map of concepts, categories, and connections. Export as a high-resolution PNG with the Zipytiny watermark for sharing or study sessions.
              </p>
            </div>
            <div className="flex gap-2 text-[10px] font-mono text-neutral-500">
              <span className="bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded">Auto-generated Nodes</span>
              <span className="bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded">PNG Export</span>
              <span className="bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded">Shareable</span>
            </div>
          </div>

        </div>

        {/* AI Feature Tags Row */}
        <div className="mt-12 text-center">
          <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#86868b] dark:text-zinc-500 mb-4">Also Includes</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Mind Maps', 'Flashcards', 'Podcast Gen', 'Study Notes', 'Quiz Gen', 'Timeline View', 'Executive Summary', 'Action Items', 'Meeting Minutes', 'Translation', 'Sentiment Analysis', 'Key Insights', 'Keywords', 'Follow-up Questions', 'Export to PDF', 'Export to Word', 'Export to Markdown', 'Share Link'].map((tag) => {
              const tagToTabMap: Record<string, { tab: string; subTab?: string }> = {
                'Mind Maps': { tab: 'mindmap' },
                'Flashcards': { tab: 'quiz', subTab: 'flashcards' },
                'Quiz Gen': { tab: 'quiz', subTab: 'quiz' },
                'Study Notes': { tab: 'quiz', subTab: 'syllabus' },
                'Timeline View': { tab: 'chapters' },
                'Executive Summary': { tab: 'overview' },
                'Action Items': { tab: 'overview' },
                'Meeting Minutes': { tab: 'overview' },
                'Translation': { tab: 'overview' },
                'Sentiment Analysis': { tab: 'overview' },
                'Key Insights': { tab: 'overview' },
                'Keywords': { tab: 'overview' },
                'Follow-up Questions': { tab: 'chat' },
                'Export to PDF': { tab: 'export' },
                'Export to Word': { tab: 'export' },
                'Export to Markdown': { tab: 'export' },
                'Share Link': { tab: 'export' },
                'Podcast Gen': { tab: 'monetize' }
              };
              
              const handleTagClick = () => {
                const slug = tag.toLowerCase().replace(/\s+/g, '-');
                if (onNavigateToFeature) {
                  onNavigateToFeature(slug);
                } else {
                  const target = tagToTabMap[tag];
                  if (target) {
                    onLaunchApp(target.tab, target.subTab);
                  } else {
                    onLaunchApp();
                  }
                }
              };

              return (
                <button 
                  key={tag} 
                  onClick={handleTagClick}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-black/[0.05] dark:border-zinc-800 rounded-full text-[11px] font-medium text-neutral-600 dark:text-zinc-400 hover:text-[#0071e3] dark:hover:text-sky-400 hover:border-[#0071e3]/30 dark:hover:border-sky-500/30 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/10 transition-all duration-200 cursor-pointer active:scale-95 shadow-xs hover:shadow-sm"
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF & TESTIMONIALS */}
      <section className="bg-white dark:bg-zinc-900 w-full py-20 border-y border-black/[0.02] dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Social Proof</span>
            <h2 className="text-3xl font-bold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50">Loved by 14,000+ Creators & Learners</h2>
            <p className="text-[#86868b] dark:text-zinc-400 font-light text-base">Here is what professionals are saying about Zipytiny.</p>
            {/* Star rating trust badge */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              <span className="text-xs font-semibold text-neutral-700 dark:text-zinc-300 ml-1">4.9 / 5</span>
              <span className="text-xs text-[#86868b] dark:text-zinc-500 font-light">from 800+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                quote: "Zipytiny saves me 4-5 hours every single week. I upload study slides and lecture audio, and I get an immediate, pristine markdown summary with ready-made study cards.",
                author: "Sarah Jenkins",
                role: "Postgrad Bio-Med Student",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop",
                stars: 5
              },
              {
                quote: "The YouTube Repurposing suite is unreal. I drop in my podcast URL, and I instantly get an SEO-ready blog post, a 5-tweet thread, and a script for TikTok. Pure magic.",
                author: "David Vance",
                role: "Tech Content Creator",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop",
                stars: 5
              },
              {
                quote: "The AI Chat is incredibly helpful. I can upload complex financial research papers, extract the business takeaways, and chat with the document to verify critical numbers.",
                author: "Marcus Chen",
                role: "Investment Analyst",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop",
                stars: 5
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-neutral-50 dark:bg-zinc-950 p-6 rounded-2xl border border-black/[0.03] dark:border-zinc-850 space-y-4 hover:shadow-md transition-shadow duration-300">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array((t as any).stars || 5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-neutral-600 dark:text-zinc-300 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.author} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" loading="lazy" />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-850 dark:text-zinc-200">{t.author}</h4>
                    <span className="text-[10px] text-neutral-500 font-medium">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRICING CONVERSIONS SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <div className="space-y-4 max-w-3xl mx-auto mb-12">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#0071e3]">Pricing</span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50">Simple, Transparent Pricing</h2>
          <p className="text-[#86868b] dark:text-zinc-400 font-light text-base">No hidden fees. Cancel any time. Upgrade in one click.</p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-2xl mx-auto mb-10 overflow-hidden rounded-2xl border border-black/[0.06] dark:border-zinc-800 text-left text-xs">
          <div className="grid grid-cols-3 bg-neutral-100 dark:bg-zinc-800 px-6 py-3 font-bold text-[11px] uppercase tracking-widest text-neutral-500 dark:text-zinc-400 font-mono">
            <span>Feature</span>
            <span className="text-center">Free</span>
            <span className="text-center text-[#0071e3]">Pro</span>
          </div>
          {[
            ['Daily Summaries', '3 / day', 'Unlimited'],
            ['YouTube & Web URLs', '✓', '✓'],
            ['PDF / Word / PowerPoint', '—', '✓'],
            ['Audio & Video files', '—', '✓'],
            ['AI Chat Q&A', '—', '✓'],
            ['Mind Maps & Flashcards', 'Basic', 'Full Suite'],
            ['Export (PDF / Word / Notion)', '—', '✓'],
            ['Priority Processing', '—', '✓'],
            ['Translation', '—', '✓'],
          ].map(([feat, free, pro], i) => (
            <div key={i} className={`grid grid-cols-3 px-6 py-3 border-t border-black/[0.03] dark:border-zinc-800 ${i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-neutral-50/50 dark:bg-zinc-900/50'}`}>
              <span className="font-medium text-neutral-700 dark:text-zinc-300">{feat}</span>
              <span className={`text-center ${free === '—' ? 'text-neutral-300 dark:text-zinc-600' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}`}>{free}</span>
              <span className="text-center text-[#0071e3] font-semibold">{pro}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
          
          {/* Free Plan */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-850 p-8 rounded-3xl shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#86868b]">Standard</span>
              <h3 className="text-2xl font-bold text-neutral-800 dark:text-zinc-100 font-display">Free Trial</h3>
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-4xl font-extrabold font-display">$0</span>
                <span className="text-xs text-[#86868b] font-medium">/ forever</span>
              </div>
              <p className="text-xs text-[#86868b] dark:text-zinc-400 font-light leading-relaxed">
                Test-drive Zipytiny with basic video summaries and active study quizzes.
              </p>
              <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-zinc-300 pt-4">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> 3 daily summaries</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> YouTube & Web url summaries</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Basic conceptual quizzes</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Local memory storage</li>
              </ul>
            </div>
            <button
              onClick={onLaunchApp}
              className="mt-8 w-full py-3 bg-neutral-100 dark:bg-zinc-800 text-neutral-800 dark:text-zinc-200 hover:bg-neutral-200 hover:text-black rounded-full text-xs font-bold transition cursor-pointer text-center"
            >
              Start Free Workspace
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white dark:bg-zinc-900 border-2 border-[#0071e3] p-8 rounded-3xl shadow-md relative flex flex-col justify-between overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#0071e3]/10 text-[#0071e3] text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Best Seller
            </div>
            
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0071e3]">Elite</span>
              <h3 className="text-2xl font-bold text-neutral-800 dark:text-zinc-100 font-display">Pro Plan</h3>
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-4xl font-extrabold font-display">$9</span>
                <span className="text-xs text-[#86868b] font-medium">/ month</span>
              </div>
              <p className="text-xs text-[#86868b] dark:text-zinc-400 font-light leading-relaxed">
                Unlock absolute processing capabilities and deep multi-format summaries.
              </p>
              <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-zinc-300 pt-4">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> <strong>Unlimited</strong> file & video summaries</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> PDF, Word, PowerPoint, Excel inputs</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> MP3 Audio & Video file summaries</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Interactive AI Q&A Chat window</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Premium exports (PDF / Word / Notion)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> 10x faster generation speeds</li>
              </ul>
            </div>
            <button
              onClick={onUpgrade}
              className="mt-8 w-full py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-xs font-bold transition cursor-pointer text-center shadow-md shadow-[#0071e3]/10"
            >
              Get Pro Now
            </button>
          </div>

        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-3xl font-bold font-display tracking-tight text-center text-[#1d1d1f] dark:text-zinc-50 mb-12">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-850 rounded-2xl overflow-hidden transition">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-zinc-200 hover:bg-neutral-50/50 transition cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-450 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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

      {/* 6. CONVERSION ACCELERATOR CTA */}
      <section className="w-full bg-neutral-900 dark:bg-zinc-950 text-white py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">Ready to Triple Your Learning Speed?</h2>
          <p className="text-zinc-400 max-w-xl mx-auto font-light text-sm sm:text-base">
            Join thousands of students, creators, and analysts who use Zipytiny to extract knowledge instantly.
          </p>
          <div className="pt-4">
            <button
              onClick={onLaunchApp}
              className="bg-white text-zinc-950 hover:bg-zinc-100 px-8 py-4 rounded-full font-bold text-sm transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-white/5 active:scale-98"
            >
              <span>Get Started Natively for Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="w-full bg-neutral-950 dark:bg-zinc-950 text-zinc-400 pt-16 pb-8 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-white flex items-center justify-center rounded-xl overflow-hidden">
                  <img src="/logo.svg" alt="Zipytiny Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="font-bold text-white font-display text-lg">Zipytiny</span>
              </div>
              <p className="text-xs leading-relaxed font-light max-w-xs">
                Universal AI-powered Video Summarizer and Knowledge Engine. Turn any content into structured intelligence in seconds.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-[11px] text-zinc-500">4.9 / 5 · 800+ reviews</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>SOC 2 compliant · GDPR ready · Encrypted</span>
              </div>
            </div>

            {/* Product Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Product</h4>
              <ul className="space-y-2.5 text-xs">
                {['Features', 'Pricing', 'Changelog', 'Roadmap', 'API Docs'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors duration-150">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Use Cases Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Use Cases</h4>
              <ul className="space-y-2.5 text-xs">
                {['Students', 'Researchers', 'Content Creators', 'Analysts', 'Teams'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors duration-150">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Company</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#" className="hover:text-white transition-colors duration-150">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-150">Terms of Service</a></li>
                <li><a href="mailto:support@zipytiny.app" className="hover:text-white transition-colors duration-150">Contact Support</a></li>
                <li><a href="mailto:hello@zipytiny.app" className="hover:text-white transition-colors duration-150">Partnership</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600">
            <span>© {new Date().getFullYear()} Zipytiny.app. All rights reserved.</span>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>Powered by Gemini AI · Built for elite learning & content intelligence</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
