import React, { useState, useMemo } from 'react';
import { 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Youtube, 
  FileText, 
  Cpu, 
  CreditCard, 
  Puzzle,
  MessageSquare,
  ArrowRight,
  Bookmark,
  CheckCircle,
  Clock
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'youtube' | 'pdf' | 'tutor' | 'billing' | 'extension' | 'general';
  question: string;
  answer: string;
  keywords: string[];
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'active-recall',
    category: 'general',
    question: 'What is an active recall study generator?',
    answer: 'An active recall study generator is a cognitive learning tool that converts static documents and videos into interactive testing playgrounds. Instead of passively reading notes—which leads to the illusion of competence—Zipytiny forces you to actively retrieve facts from memory using custom quizzes, active-recall flashcards, and Socratic dialogues. Educational research proves active recall strengthens synaptic pathways and increases memory retention by over 150%.',
    keywords: ['active recall', 'learning', 'cognitive science', 'testing effect', 'retention'],
  },
  {
    id: 'youtube-summarizer',
    category: 'youtube',
    question: 'How does the AI YouTube Lecture Summarizer convert video lectures into practice quizzes?',
    answer: 'When you submit a YouTube educational lecture URL, Zipytiny uses an advanced generative process to pull the lecture transcript, segment it into logical chapters based on topic shifts, and write comprehensive milestone-based summaries with clickable citation timestamps. The platform then automatically compiles high-fidelity multi-choice practice exams with deep answer rationales mapped to each section of the video.',
    keywords: ['youtube', 'summarizer', 'video lecture', 'quiz generator', 'timestamp', 'citation'],
  },
  {
    id: 'pdf-generator',
    category: 'pdf',
    question: 'Can I generate digital flashcards and study guides from uploaded PDFs and slides?',
    answer: 'Absolutely! Our PDF Study Guide Generator parses dense textbook chapters, course lecture slides, and digital handouts. It extracts critical definitions and organizes them into standard Cornell Study Notes and elegant, visual Bento Concept Sheets. To build intuition, it generates everyday layman\'s analogies for complex technical terms, and builds active spaced-repetition flashcard decks instantly.',
    keywords: ['pdf', 'textbook', 'slides', 'study guide', 'cornell notes', 'bento concept', 'analogy'],
  },
  {
    id: 'socratic-tutor',
    category: 'tutor',
    question: 'What is the Feynman Technique, and how does the Socratic AI Tutor help identify learning gaps?',
    answer: 'The Feynman Technique is a mental model which dictates that you truly understand a concept only when you can explain it simply. Our Socratic AI Tutor acts as an interactive conversational partner. Rather than lecturing you, it asks targeted, probing questions that require you to formulate explanations in your own words. The AI then dynamically analyzes your responses to locate logical fallacies, conceptual gaps, and misconceptions, guiding you back to complete clarity.',
    keywords: ['feynman', 'socratic', 'ai tutor', 'learning gaps', 'dialogue', 'classroom'],
  },
  {
    id: 'spaced-repetition',
    category: 'general',
    question: 'How does the Zipytiny spaced-repetition study loop work?',
    answer: 'Spaced repetition spaces out reviews over expanding intervals (e.g., 1 day, 3 days, 7 days, 30 days) based on recall difficulty. Zipytiny helps you implement this seamlessly: you generate and study flashcards on Day 1, take a quick practice quiz on Day 3, engage in Socratic debate with our Feynman Tutor on Day 7, and do a final simulated diagnostic exam on Day 30. This process shifts learning from transient short-term storage to permanent long-term memory.',
    keywords: ['spaced repetition', 'study loop', 'memory', 'intervals', 'recalled difficulty'],
  },
  {
    id: 'chrome-extension',
    category: 'extension',
    question: 'How do I download and use the Zipytiny Chrome Browser Extension?',
    answer: 'The Zipytiny Chrome Extension is a lightweight browser add-on that brings active recall tools directly to your browser toolbar. While watching any YouTube lecture or reading an article online, click the Zipytiny icon to instantly summarize the page, generate active-recall cards, or launch a quick quiz challenge without leaving your current tab.',
    keywords: ['chrome extension', 'browser', 'toolbar', 'instant summary', 'add-on'],
  },
  {
    id: 'referral-credits',
    category: 'billing',
    question: 'How do referral credits work and how can I get premium workspaces for free?',
    answer: 'We want to reward students who grow the community! When you sign up, you receive a unique, permanent referral link. For every friend who registers using your link, we award both you and your friend 5 permanent premium credits. These credits can be spent to generate comprehensive deep-lecture summaries, unlock unlimited vector search, and run advanced document indexers.',
    keywords: ['referral', 'credits', 'free premium', 'rewards', 'pricing', 'share'],
  },
  {
    id: 'data-privacy',
    category: 'billing',
    question: 'How does Zipytiny handle data privacy, vector indices, and document security?',
    answer: 'Your privacy is our core engineering priority. Zipytiny is designed to comply with global and regional data frameworks (including Saudi Arabia PDPL, UAE Personal Data Protection Law, EU GDPR, and CCPA). Handouts and documents uploaded for indexing are parsed securely, converted to vector embeddings, and stored in protected, isolated Firebase partitions. Your files are never shared, never sold, and never utilized for general model pre-training.',
    keywords: ['privacy', 'security', 'gdpr', 'pdpl', 'gcc compliance', 'embeddings', 'firebase'],
  },
  {
    id: 'premium-tier',
    category: 'billing',
    question: 'What is included in the Zipytiny Elite tier, and how do I manage my subscription?',
    answer: 'The Zipytiny Elite tier unlocks unlimited workspace creations, full support for documents up to 50MB, real-time vector search across your entire educational library, multi-format study exporters (PDF, Notion, Markdown), and priority access to our most advanced model reasoning pipelines. You can upgrade or cancel your billing securely at any time from your Account Billing screen.',
    keywords: ['premium', 'elite', 'subscription', 'pricing', 'unlimited', 'notion export'],
  },
  {
    id: 'academic-integrity',
    category: 'general',
    question: 'How does Zipytiny promote academic integrity and prevent cheating?',
    answer: 'Zipytiny is built specifically for deep retention and real competence, not shortcuts. We do not write essays or solve homework on behalf of students. Instead, we summarize, explain, and generate custom practice questions. By focusing on active recall, flashcards, and interactive Socratic dialogue, we ensure that students actually comprehend the underlying material and are fully prepared for in-class diagnostic exams.',
    keywords: ['academic integrity', 'cheating', 'learning', 'homework helper', 'cornell study'],
  }
];

export function FaqPage({ onNavigateScreen }: { onNavigateScreen: (screen: any) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'youtube' | 'pdf' | 'tutor' | 'billing' | 'extension' | 'general'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('active-recall');

  // Filter FAQs based on category and search query
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const cleanQuery = searchQuery.toLowerCase().trim();
      
      if (!cleanQuery) return matchesCategory;

      const matchesText = 
        faq.question.toLowerCase().includes(cleanQuery) || 
        faq.answer.toLowerCase().includes(cleanQuery) ||
        faq.keywords.some(kw => kw.toLowerCase().includes(cleanQuery));

      return matchesCategory && matchesText;
    });
  }, [searchQuery, selectedCategory]);

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const categories = [
    { id: 'all', label: 'All FAQs', icon: HelpCircle },
    { id: 'youtube', label: 'YouTube Summarizer', icon: Youtube, color: 'text-red-500 bg-red-500/5' },
    { id: 'pdf', label: 'PDF Study Guides', icon: FileText, color: 'text-blue-500 bg-blue-500/5' },
    { id: 'tutor', label: 'Feynman Tutor', icon: Cpu, color: 'text-indigo-500 bg-indigo-500/5' },
    { id: 'billing', label: 'Billing & Security', icon: CreditCard, color: 'text-emerald-500 bg-emerald-500/5' },
    { id: 'extension', label: 'Chrome Extension', icon: Puzzle, color: 'text-amber-500 bg-amber-500/5' },
    { id: 'general', label: 'Cognitive Science', icon: Sparkles, color: 'text-teal-500 bg-teal-500/5' },
  ] as const;

  return (
    <div className="space-y-8 animate-fadeIn transition-all duration-300 font-sans text-left pb-16 max-w-5xl mx-auto px-4" id="faq-root-container">
      
      {/* Header / Intro Hero section */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-8 md:p-12 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-neutral-100 dark:text-zinc-800 opacity-60 hidden md:block">
          <HelpCircle className="w-28 h-28 stroke-[1]" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#0071e3]/5 border border-[#0071e3]/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0071e3] dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GEO &amp; SEO Search Discovery Enabled</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-zinc-50 font-display">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-neutral-500 dark:text-zinc-400 leading-relaxed max-w-xl">
            Get comprehensive, detailed answers about how Zipytiny uses advanced language models, 
            active recall, spaced repetition, and cognitive study loops to help you master dense textbooks and lectures.
          </p>
          <div className="text-[10px] font-mono text-neutral-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-2 pt-2">
            <span>Verified Learning Hub</span>
            <span>•</span>
            <span>Spaced Repetition V2</span>
          </div>
        </div>
      </div>

      {/* Dynamic Search & Category Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Category Pills Selector */}
        <div className="md:col-span-4 space-y-2 bg-white dark:bg-zinc-900/60 p-4 rounded-2xl border border-black/[0.03] dark:border-white/[0.02] shadow-xs">
          <p className="text-xs font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider px-2 pb-2">
            Categories
          </p>
          <div className="flex flex-row md:flex-col overflow-x-auto gap-1.5 md:overflow-visible pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setExpandedId(null);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap md:whitespace-normal w-full text-left ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-neutral-50 dark:hover:bg-zinc-800/40'
                  }`}
                  id={`faq-cat-btn-${cat.id}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-current' : cat.id !== 'all' ? cat.color.split(' ')[0] : 'text-neutral-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Search and FAQ List */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Real-time search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search active recall, PDF guides, tutor, billing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.05] dark:border-white/[0.05] text-neutral-900 dark:text-zinc-50 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition shadow-xs font-medium placeholder-neutral-400"
              id="faq-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* FAQ Items Grid/Accordion */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedId === faq.id;
                return (
                  <div 
                    key={faq.id}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-xs overflow-hidden transition-all duration-300"
                    id={`faq-item-card-${faq.id}`}
                  >
                    <button
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                      aria-expanded={isExpanded}
                      id={`faq-item-trigger-${faq.id}`}
                    >
                      <div className="flex items-start gap-3.5 pr-4">
                        <HelpCircle className="w-5 h-5 mt-0.5 text-[#0071e3] dark:text-indigo-400 shrink-0" />
                        <span className="text-base font-bold text-neutral-900 dark:text-zinc-50 tracking-tight leading-tight">
                          {faq.question}
                        </span>
                      </div>
                      <div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div 
                        className="px-5 md:px-6 pb-6 pt-1 border-t border-black/[0.02] dark:border-white/[0.02] animate-slideDown"
                        id={`faq-item-content-${faq.id}`}
                      >
                        <p className="text-sm text-neutral-600 dark:text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                          {faq.answer}
                        </p>
                        
                        {/* Keyword Meta Tags for SEO awareness visual indicators */}
                        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-neutral-100 dark:border-zinc-850">
                          <span className="text-[10px] font-mono text-neutral-400 dark:text-zinc-500 flex items-center gap-1 mr-1.5">
                            <Clock className="w-3 h-3" />
                            <span>SEO Keywords:</span>
                          </span>
                          {faq.keywords.map((kw) => (
                            <span 
                              key={kw} 
                              className="text-[10px] font-mono bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-neutral-200/40 dark:border-zinc-700/30"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-white/[0.04] rounded-2xl space-y-3 shadow-xs">
                <HelpCircle className="w-10 h-10 text-neutral-300 mx-auto" />
                <p className="text-sm font-bold text-neutral-600 dark:text-zinc-300">
                  No matching FAQ items found
                </p>
                <p className="text-xs text-neutral-400 dark:text-zinc-400 max-w-md mx-auto">
                  Try typing keywords like &quot;pdf&quot;, &quot;youtube&quot;, &quot;billing&quot;, or click on a different category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-xs rounded-xl transition cursor-pointer mt-2"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Support CTA banner */}
          <div className="bg-gradient-to-r from-[#0071e3]/10 to-indigo-500/10 border border-[#0071e3]/15 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <p className="text-sm font-bold text-neutral-900 dark:text-zinc-50">
                Still have unanswered questions?
              </p>
              <p className="text-xs text-neutral-500 dark:text-zinc-400">
                Contact our Customer Success AI support line or read the operational playbooks.
              </p>
            </div>
            <button
              onClick={() => {
                // Open Customer Support
                const supportBtn = document.getElementById('support-widget-trigger');
                if (supportBtn) {
                  supportBtn.click();
                } else {
                  onNavigateScreen('landing');
                  // Trigger scroll to contact if available
                }
              }}
              className="px-5 py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 shadow-md shadow-[#0071e3]/15"
              id="faq-help-desk-btn"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Support Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
      
    </div>
  );
}
