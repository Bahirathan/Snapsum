import React, { useState } from 'react';
import { 
  Sparkles, Zap, ArrowRight, CheckCircle, FileText, Globe, MessageSquare, 
  Video, Play, Bookmark, Headphones, Users, ChevronDown, Download, Award
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  onUpgrade: () => void;
  isPremium: boolean;
  visitorUser: any;
  onGoogleSignIn: () => void;
}

export default function LandingPage({ onLaunchApp, onUpgrade, isPremium, visitorUser, onGoogleSignIn }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'key_insights' | 'chapters' | 'quiz'>('summary');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            
            {/* Left Column: Title, Copy, CTAs */}
            <div className="col-span-1 lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 bg-[#0071e3]/10 dark:bg-[#0071e3]/20 px-3 py-1 rounded-full text-[11px] font-mono font-medium text-[#0071e3] dark:text-sky-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Universal AI Knowledge Engine</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight leading-[1.08] text-[#1d1d1f] dark:text-zinc-50">
                Turn Any Content <br />
                Into a <span className="bg-gradient-to-r from-[#0071e3] to-indigo-600 bg-clip-text text-transparent">60-Second</span> Summary
              </h1>
              
              <p className="text-[#86868b] dark:text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed font-light">
                Summarize YouTube videos, custom website links, pasted articles, PDFs, Word docs, Excel sheets, and audio recordings instantly. Extract mind maps, interactive study quizzes, viral video scripts, and custom social assets in one click.
              </p>

              {/* Supported Formats Badge Grid */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b] dark:text-zinc-400">Supported Formats</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['YouTube', 'PDF', 'Word/Doc', 'Excel', 'PowerPoint', 'Audio/MP3', 'Video/MP4', 'Web Articles', 'Image OCR'].map((fmt) => (
                    <span key={fmt} className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-800 rounded-lg shadow-xs font-semibold text-neutral-700 dark:text-zinc-300">
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={onLaunchApp}
                  className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-8 py-4 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-md shadow-[#0071e3]/20 hover:translate-y-[-1px] active:scale-98"
                >
                  <span>Launch Free Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                {!isPremium && (
                  <button
                    onClick={onUpgrade}
                    className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-neutral-800 dark:text-zinc-200 hover:bg-neutral-50 dark:hover:bg-zinc-800 px-8 py-4 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                  >
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Get Premium Access</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs text-[#86868b] dark:text-zinc-400 font-light">
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> No credit card required</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 100% Secure cloud data</span>
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

      {/* 2. BENTO FEATURE GRID */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-4 text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50">
            Engineered For Absolute Speed & Clarity
          </h2>
          <p className="text-[#86868b] dark:text-zinc-400 font-light text-base md:text-lg">
            Zipytiny is designed to compress hours of multi-format content into organized, study-ready study kits and digital social assets within 60 seconds flat.
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

        </div>
      </section>

      {/* 3. SOCIAL PROOF & TESTIMONIALS */}
      <section className="bg-white dark:bg-zinc-900 w-full py-20 border-y border-black/[0.02] dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50">Loved by 10,000+ Creators & Learners</h2>
            <p className="text-[#86868b] dark:text-zinc-400 font-light text-base">Here is what professionals are saying about Zipytiny.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                quote: "Zipytiny saves me 4-5 hours every single week. I upload study slides and lecture audio, and I get an immediate, pristine markdown summary with ready-made study cards.",
                author: "Sarah Jenkins",
                role: "Postgrad Bio-Med Student",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop"
              },
              {
                quote: "The YouTube Repurposing suite is unreal. I drop in my podcast URL, and I instantly get an SEO-ready blog post, a 5-tweet thread, and a script for TikTok. Pure magic.",
                author: "David Vance",
                role: "Tech Content Creator",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop"
              },
              {
                quote: "The AI Chat is incredibly helpful. I can upload complex financial research papers, extract the business takeaways, and chat with the document to verify critical numbers.",
                author: "Marcus Chen",
                role: "Investment Analyst",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop"
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-neutral-50 dark:bg-zinc-950 p-6 rounded-2xl border border-black/[0.03] dark:border-zinc-850 space-y-4">
                <p className="text-xs italic text-neutral-600 dark:text-zinc-300 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.author} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
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
          <h2 className="text-3xl font-bold font-display tracking-tight text-[#1d1d1f] dark:text-zinc-50">Simple, Transparent Pricing</h2>
          <p className="text-[#86868b] dark:text-zinc-400 font-light text-base">Select the plan that fits your knowledge compounding rate.</p>
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
      <footer className="w-full py-12 bg-neutral-50 dark:bg-zinc-950 border-t border-black/[0.04] dark:border-zinc-900 text-xs text-[#86868b] dark:text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-[#1d1d1f] flex items-center justify-center rounded-lg">
              <img src="/logo.svg" alt="Zipytiny Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <span className="font-bold text-neutral-800 dark:text-zinc-200">Zipytiny</span>
          </div>
          <p className="font-light">© {new Date().getFullYear()} Zipytiny.app. All rights reserved. Built for elite content monetization & learning.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:underline">Terms of Service</a>
            <span>•</span>
            <a href="mailto:support@zipytiny.app" className="hover:underline">Contact Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
