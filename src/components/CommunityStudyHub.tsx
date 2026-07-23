import React, { useState } from 'react';
import { 
  Search, BookOpen, Brain, Sparkles, Star, Users, ArrowRight, 
  Tag, Clock, CheckCircle2, Share2, Download, ExternalLink, Filter,
  Play, Video
} from 'lucide-react';

export interface StudyResource {
  id: string;
  title: string;
  category: 'Computer Science' | 'Medicine' | 'Law & Business' | 'Productivity' | 'Engineering';
  sourceTitle: string;
  duration: string;
  rating: number;
  studyCount: number;
  summary: string;
  keyConcepts: string[];
  hasFlashcards: boolean;
  hasMindMap: boolean;
  hasQuiz: boolean;
  youtubeId?: string;
  thumbnailUrl?: string;
}

export const COMMUNITY_STUDY_RESOURCES: StudyResource[] = [
  {
    id: 'mit-deep-learning',
    title: 'MIT 6.S191: Introduction to Deep Learning',
    category: 'Computer Science',
    sourceTitle: 'MIT OpenCourseWare Lecture Series',
    duration: '115 Min Video',
    rating: 4.9,
    studyCount: 12450,
    summary: 'Comprehensive breakdown of neural network architectures, loss calculation, backpropagation, and momentum Adam optimizer mechanics.',
    keyConcepts: ['Neural Networks', 'Backpropagation', 'Activation Functions', 'Adam Optimizer'],
    hasFlashcards: true,
    hasMindMap: true,
    hasQuiz: true,
    youtubeId: 'aircAruvnKk',
    thumbnailUrl: 'https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg',
  },
  {
    id: 'yc-ai-playbook',
    title: 'Y Combinator: How to Build an AI Startup in 2026',
    category: 'Law & Business',
    sourceTitle: 'Y Combinator Startup School',
    duration: '90 Min Video',
    rating: 4.95,
    studyCount: 18900,
    summary: 'Tactical guide on agentic workflows, serverless vector databases, model selection, and zero-overhead distribution channels.',
    keyConcepts: ['Agentic Workflows', 'Vector Embeddings', 'LLM Fine-tuning', 'Unit Economics'],
    hasFlashcards: true,
    hasMindMap: true,
    hasQuiz: true,
    youtubeId: '67_aMPDk28U',
    thumbnailUrl: 'https://img.youtube.com/vi/67_aMPDk28U/hqdefault.jpg',
  },
  {
    id: 'stanford-focus-mastery',
    title: 'Stanford Neuroscience: Deep Work & Focus Mastery',
    category: 'Productivity',
    sourceTitle: 'Huberman Lab & Stanford Seminars',
    duration: '120 Min Video',
    rating: 4.88,
    studyCount: 24100,
    summary: 'Scientific techniques for cognitive focus allocation, eliminating attention residue, and managing circadian dopamine cycles.',
    keyConcepts: ['Cognitive Attention Residue', 'Dopamine Pacing', 'Eisenhower Matrix', 'Deep Work Blocks'],
    hasFlashcards: true,
    hasMindMap: true,
    hasQuiz: true,
    youtubeId: 'gXVUJjp462U',
    thumbnailUrl: 'https://img.youtube.com/vi/gXVUJjp462U/hqdefault.jpg',
  },
  {
    id: 'mcat-biochem-pathways',
    title: 'MCAT Biochemistry: Metabolic Pathways & Enzyme Kinetics',
    category: 'Medicine',
    sourceTitle: 'Harvard Medical Prep Lectures',
    duration: '140 Min Video',
    rating: 4.92,
    studyCount: 8300,
    summary: 'Full review of Glycolysis, Krebs Cycle, Electron Transport Chain, and Michaelis-Menten enzyme kinetics equations.',
    keyConcepts: ['Glycolysis Steps', 'Krebs Cycle', 'ATP Synthase', 'Michaelis-Menten Kinetics'],
    hasFlashcards: true,
    hasMindMap: true,
    hasQuiz: true,
    youtubeId: '0I25N26aUOk',
    thumbnailUrl: 'https://img.youtube.com/vi/0I25N26aUOk/hqdefault.jpg',
  },
  {
    id: 'law-constitutional-rights',
    title: 'Constitutional Law: Supreme Court Precedents & Due Process',
    category: 'Law & Business',
    sourceTitle: 'Yale Law School Public Lectures',
    duration: '105 Min Video',
    rating: 4.85,
    studyCount: 6200,
    summary: 'Detailed examination of 14th Amendment Equal Protection, landmark Supreme Court cases, and strict scrutiny standards.',
    keyConcepts: ['Equal Protection Clause', 'Strict Scrutiny Test', 'Procedural Due Process', 'Landmark Precedents'],
    hasFlashcards: true,
    hasMindMap: true,
    hasQuiz: true,
    youtubeId: 'yA53v7s0R-A',
    thumbnailUrl: 'https://img.youtube.com/vi/yA53v7s0R-A/hqdefault.jpg',
  },
  {
    id: 'quantum-computing-101',
    title: 'Quantum Computing Foundations: Qubits & Entanglement',
    category: 'Engineering',
    sourceTitle: 'IBM Quantum Learning Series',
    duration: '80 Min Video',
    rating: 4.91,
    studyCount: 9400,
    summary: 'Mathematical foundations of superposition, quantum gate operations, qubit entanglement, and Shor algorithm overview.',
    keyConcepts: ['Superposition State', 'Quantum Gates', 'Entanglement Pairs', 'Shor Algorithm'],
    hasFlashcards: true,
    hasMindMap: true,
    hasQuiz: true,
    youtubeId: 'F_Riqjdh2oM',
    thumbnailUrl: 'https://img.youtube.com/vi/F_Riqjdh2oM/hqdefault.jpg',
  }
];

interface CommunityStudyHubProps {
  onSelectResource: (resource: StudyResource) => void;
  onOpenReferralModal?: () => void;
}

export default function CommunityStudyHub({ onSelectResource, onOpenReferralModal }: CommunityStudyHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Computer Science', 'Medicine', 'Law & Business', 'Productivity', 'Engineering'];

  const filteredResources = COMMUNITY_STUDY_RESOURCES.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.keyConcepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="discover" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Public Community Resource Hub</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-zinc-50 font-display tracking-tight">
          Discover & Study Trending Public Lecture Guides
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-zinc-400 leading-relaxed">
          Explore AI-summarized course decks created by students and researchers. Study flashcards, view concept mind maps, or launch into your interactive workspace.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-50 dark:bg-zinc-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-zinc-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-white dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-700/80 border border-neutral-200 dark:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search study topics, concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-xl text-xs text-neutral-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="group bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left"
          >
            {/* YouTube Video Thumbnail Banner */}
            <div className="relative w-full aspect-video bg-neutral-900 overflow-hidden cursor-pointer" onClick={() => onSelectResource(res)}>
              <img
                src={res.thumbnailUrl || (res.youtubeId ? `https://img.youtube.com/vi/${res.youtubeId}/hqdefault.jpg` : '')}
                alt={res.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-white/90 dark:bg-zinc-900/90 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono font-medium text-white">
                <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs flex items-center gap-1">
                  <Video className="w-3 h-3 text-red-500 fill-red-500" />
                  {res.sourceTitle}
                </span>
                <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs font-bold">
                  {res.duration}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono uppercase px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-150 dark:border-indigo-900">
                    {res.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{res.rating}</span>
                    <span className="text-neutral-400 font-normal">({(res.studyCount / 1000).toFixed(1)}k studies)</span>
                  </div>
                </div>

                <h3 
                  onClick={() => onSelectResource(res)}
                  className="text-base font-bold text-neutral-900 dark:text-zinc-100 font-display group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition cursor-pointer"
                >
                  {res.title}
                </h3>

                <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {res.summary}
                </p>

                {/* Key Concepts Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {res.keyConcepts.map((concept, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-400 px-2 py-0.5 rounded-md font-medium"
                    >
                      #{concept}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] font-mono font-medium text-neutral-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    {res.duration}
                  </span>
                </div>

                <button
                  onClick={() => onSelectResource(res)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/20 active:scale-95"
                >
                  <span>Study Deck</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Referral Callout Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-zinc-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl text-left">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-extrabold uppercase">
              Referral Program Active
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display">
            Want to share your own video summaries with classmates?
          </h3>
          <p className="text-xs sm:text-sm text-indigo-200">
            Earn 5 free Pro video conversions for every classmate who joins Zipytiny through your referral link.
          </p>
        </div>

        <button
          onClick={onOpenReferralModal}
          className="px-6 py-3.5 bg-white hover:bg-neutral-100 text-indigo-900 rounded-2xl text-xs font-extrabold transition cursor-pointer shrink-0 shadow-lg active:scale-95 flex items-center gap-2"
        >
          <span>Get Your Invite Link</span>
          <ArrowRight className="w-4 h-4 text-indigo-600" />
        </button>
      </div>
    </div>
  );
}
