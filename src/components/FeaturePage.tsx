import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, Layers, Radio, BookOpen, CheckSquare, Clock, Briefcase, 
  ListTodo, FileText, Globe, Smile, Lightbulb, Hash, MessageSquare, 
  FileDown, Share2, Sparkles, ArrowLeft, Play, Pause, ChevronRight, 
  ChevronLeft, Copy, Check, Shield, Download, RotateCcw, AlertCircle,
  Volume2, VolumeX, Flame, Zap
} from 'lucide-react';
import { PRELOADED_VIDEOS } from '../preloadedData';
import { motion, AnimatePresence } from 'motion/react';

interface FeaturePageProps {
  featureSlug: string;
  isDark?: boolean;
  onNavigateHome: () => void;
  onLaunchApp: (targetTab?: string, targetSubTab?: string) => void;
}

export default function FeaturePage({ featureSlug, onNavigateHome, onLaunchApp }: FeaturePageProps) {
  // Use Steve Jobs Stanford Address as default (index 0) or Simon Sinek (index 1)
  const [videoIndex, setVideoIndex] = useState(0);
  const activeVideo = PRELOADED_VIDEOS[videoIndex];

  // Global copying helper state
  const [copiedText, setCopiedText] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // 1. Feature Specifications mapping
  const featureSpecs: Record<string, {
    title: string;
    tagline: string;
    description: string;
    icon: React.ElementType;
    badge: string;
    accentColor: string;
    previewType: string;
    highlights: string[];
  }> = {
    'mind-maps': {
      title: 'Interactive Mind Maps',
      tagline: 'Visualize structured knowledge',
      description: 'Convert long hours of video into beautifully nested, expandable conceptual maps instantly. Discover hierarchies and semantic paths with a visual dashboard.',
      icon: Network,
      badge: 'Cognitive Science',
      accentColor: 'indigo',
      previewType: 'mindmap',
      highlights: [
        'Interactive category expansions showing nested subtopics.',
        'Visual layout depicting how complex arguments build on each other.',
        'Fast cognitive mapping that accelerates memory retention by up to 4x.'
      ]
    },
    'flashcards': {
      title: 'Active Recall Flashcards',
      tagline: 'Automate your active revision',
      description: 'Convert key lecture concepts and definitions into active revision cards. Prompts are designed based on modern spaced-repetition models to optimize retention.',
      icon: Layers,
      badge: 'Spaced Repetition',
      accentColor: 'rose',
      previewType: 'flashcards',
      highlights: [
        'Auto-generated questions testing core terminology and definitions.',
        'Beautiful interactive card flip gesture to instantly reveal answers.',
        'Continuous self-testing workflow optimized for busy professionals.'
      ]
    },
    'podcast-gen': {
      title: 'Podcast Briefing Generator',
      tagline: 'Turn video lectures into professional audio',
      description: 'Transform technical webinars or videos into high-quality, voiceover-optimized scripts. Listen to crisp summaries with audio-wave playbacks.',
      icon: Radio,
      badge: 'Hands-Free Study',
      accentColor: 'amber',
      previewType: 'podcast',
      highlights: [
        'Engaging dialog formats suited for easy vocal synthesis.',
        'Simulated audio player with playback speed and progression.',
        'Synchronized script highlighting matching the playhead timeline.'
      ]
    },
    'study-notes': {
      title: 'Structured Study Syllabus',
      tagline: 'Lecture courses neatly organized',
      description: 'Turn unstructured YouTube streams or corporate lectures into comprehensive, academic-grade syllabus guides. Rich markup ensures maximum readability.',
      icon: BookOpen,
      badge: 'Deep Study',
      accentColor: 'emerald',
      previewType: 'notes',
      highlights: [
        'Logical, clean academic hierarchy matching lecture milestones.',
        'Highlighted key definitions, concepts, and highlighted quotes.',
        'A comprehensive study companion optimized for exam preparation.'
      ]
    },
    'quiz-gen': {
      title: 'Comprehension Quiz Gen',
      tagline: 'Instant custom self-testing',
      description: 'Test your critical thinking, factual recall, and conceptual understanding with multiple-choice questions complete with instant explanations.',
      icon: CheckSquare,
      badge: 'Knowledge Check',
      accentColor: 'blue',
      previewType: 'quiz',
      highlights: [
        'Custom questions testing active comprehension rather than trivia.',
        'Direct, informative explanations for both correct and wrong answers.',
        'Earn XP rewards, level badges, and keep your memory streak active.'
      ]
    },
    'timeline-view': {
      title: 'Chronological Chapters Timeline',
      tagline: 'Chop long lectures into sections',
      description: 'Skip the scrubbing. Instantly divide videos into distinct, clickable milestones. Deep link straight to the correct second with custom takeaway summaries.',
      icon: Clock,
      badge: 'Time-Saving',
      accentColor: 'sky',
      previewType: 'chapters',
      highlights: [
        'Precise seconds allocations mapping to YouTube playback links.',
        'Summarized key insights describing what happened in each chapter.',
        'Clean horizontal or vertical visual timeline indicator.'
      ]
    },
    'executive-summary': {
      title: 'Executive Summary Briefing',
      tagline: 'High-density business digest',
      description: 'Distill hours of research or panel discussions into a crisp executive briefing. Pinpoints the core problem, master thesis, and concluding takeaways.',
      icon: Briefcase,
      badge: 'Business Intelligence',
      accentColor: 'violet',
      previewType: 'summary',
      highlights: [
        'Three structured compartments: Core Problem, Thesis, and Solutions.',
        'High-density corporate formatting optimized for rapid decisions.',
        'Eliminates filler speech to give you instant intelligence.'
      ]
    },
    'action-items': {
      title: 'Actionable Todo Lists',
      tagline: 'Go from listening to execution',
      description: 'Don’t let knowledge sit. Automatically translate educational advice, video tutorials, and guides into a structured, interactive checkbox list.',
      icon: ListTodo,
      badge: 'Productivity',
      accentColor: 'pink',
      previewType: 'action-items',
      highlights: [
        'Direct extraction of clear, actionable milestones.',
        'Interactive checkbox interface with progress percentage trackers.',
        'Seamlessly bridges the gap between learning theory and real execution.'
      ]
    },
    'meeting-minutes': {
      title: 'Meeting Minutes Architect',
      tagline: 'Corporate meeting summaries',
      description: 'Turn uploaded Zoom recordings, sales calls, or webinars into formatted official minutes. Keep your team coordinated with official agenda items.',
      icon: FileText,
      badge: 'Collaboration',
      accentColor: 'orange',
      previewType: 'minutes',
      highlights: [
        'Structured meeting blocks outlining participants, date, and goals.',
        'Formal registry recording key agreements, updates, and milestones.',
        'Formatted decision grids ready for team distributions.'
      ]
    },
    'translation': {
      title: 'Global Translation Suite',
      tagline: 'Learn in any native language',
      description: 'Break geographical boundaries. Instantly localize any summary, transcript, mind map, or flashcard deck into more than 30 global languages.',
      icon: Globe,
      badge: 'Localization',
      accentColor: 'teal',
      previewType: 'translation',
      highlights: [
        'Accurate translation preserving complex professional terminology.',
        'Seamless toggle supporting immediate side-by-side localizations.',
        'Ideal for international student groups, export hubs, and researchers.'
      ]
    },
    'sentiment-analysis': {
      title: 'Tonal Sentiment Analysis',
      tagline: 'Track emotional progression',
      description: 'Decode speaker emotions. Visualize tone, passion, and critique trends throughout any video with an interactive emotional dashboard.',
      icon: Smile,
      badge: 'Emotion AI',
      accentColor: 'red',
      previewType: 'sentiment',
      highlights: [
        'Comprehensive positive/critical/neutral percentage gauge.',
        'Tonal timeline highlight pointing out major passionate milestones.',
        'Extract key quotes representing critical or positive remarks.'
      ]
    },
    'key-insights': {
      title: 'Key Value Insights',
      tagline: 'Curated value nuggets',
      description: 'Skip the fluff. Access high-impact takeaways styled as distinct cards. Includes automatic low-confidence flags for potential vocal ambiguities.',
      icon: Lightbulb,
      badge: 'Intelligence',
      accentColor: 'amber',
      previewType: 'insights',
      highlights: [
        'Highly scannable cards prioritizing core breakthroughs.',
        'Confidence tracking tagging ambiguous or complex technical jargon.',
        'Interactive copy actions to store insights in your personal log.'
      ]
    },
    'keywords': {
      title: 'Keywords Tag Cloud',
      tagline: 'Semantic theme mapping',
      description: 'Instantly identify and filter the highest priority terms. Tap tags to see context descriptions and frequencies discussed during the lecture.',
      icon: Hash,
      badge: 'SEO & Metadata',
      accentColor: 'cyan',
      previewType: 'keywords',
      highlights: [
        'Beautiful interactive word/tag cloud indicating discussions.',
        'Detailed term metrics outlining frequency and context definitions.',
        'Rapid contextual anchors filtering key areas of learning.'
      ]
    },
    'follow-up-questions': {
      title: 'AI Companion Chatbot',
      tagline: 'Talk directly with any video',
      description: 'Ask deep follow-up questions, request complex explanations, or draft reports based on the transcript. Powered by context-grounded AI.',
      icon: MessageSquare,
      badge: 'Interactive AI',
      accentColor: 'purple',
      previewType: 'chat',
      highlights: [
        'Highly responsive chatbot preloaded with full video context.',
        'Smart instant prompt chips targeting interesting video facts.',
        'Simulates conversation with friendly, authoritative AI experts.'
      ]
    },
    'export-to-pdf': {
      title: 'Styled PDF Exporting',
      tagline: 'Download offline documents',
      description: 'Keep your knowledge accessible without an internet connection. Generate formal, beautifully formatted PDF summaries complete with metadata.',
      icon: FileDown,
      badge: 'Exports',
      accentColor: 'rose',
      previewType: 'export',
      highlights: [
        'Premium high-contrast layouts structured with elegant typography.',
        'Includes metadata tags, authors, summaries, and full quizzes.',
        'Ready to share with colleagues or print out for study binders.'
      ]
    },
    'export-to-word': {
      title: 'Editable Microsoft Word Export',
      tagline: 'Export to editable docx files',
      description: 'Preserve full heading hierarchy and paragraph blocks. Move summaries directly into Microsoft Word for personal copywriting or team editing.',
      icon: FileDown,
      badge: 'Document Prep',
      accentColor: 'blue',
      previewType: 'export',
      highlights: [
        'Standard XML structure compatible with major corporate suites.',
        'Maintains clean bullet lists, highlight callouts, and summaries.',
        'Enables smooth writing of reports, summaries, or essays.'
      ]
    },
    'export-to-markdown': {
      title: 'Obsidian & Notion Markdown Export',
      tagline: 'Sync directly with your PKM',
      description: 'Export clean markdown syntax. Feed summaries and quizzes directly into Obsidian, Notion, Logseq, or Roam Research to scale your personal database.',
      icon: FileDown,
      badge: 'PKM Sync',
      accentColor: 'neutral',
      previewType: 'export',
      highlights: [
        'Strict standard Markdown tags for headings, quotes, and links.',
        'Formats study flashcards in optimal formats for import.',
        'Perfect for maintaining an interconnected digital second brain.'
      ]
    },
    'share-link': {
      title: 'High-Conversion Social Sharing',
      tagline: 'Generate shareable SEO summaries',
      description: 'Create unique share IDs and links. Open Graph tags ensure links show video thumbnail previews and top insights on Twitter, Slack, and LinkedIn.',
      icon: Share2,
      badge: 'Social Learning',
      accentColor: 'indigo',
      previewType: 'export',
      highlights: [
        'Custom social preview tags designed to encourage link click-throughs.',
        'Includes options to pre-set playback times or lock study challenges.',
        'Durable cloud backups stored securely for collaborative revisions.'
      ]
    }
  };

  const spec = featureSpecs[featureSlug] || featureSpecs['mind-maps'];

  // =========================================================================
  // INTERACTIVE PLAYGROUND STATE MANAGERS
  // =========================================================================

  // 1. Mind Map Playground States
  const [expandedMindmapCategory, setExpandedMindmapCategory] = useState<string | null>(null);

  // 2. Flashcard Playground States
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);

  // 3. Podcast Briefing States
  const [podcastPlaying, setPodcastPlaying] = useState(false);
  const [podcastProgress, setPodcastProgress] = useState(0);
  const [podcastSpeed, setPodcastSpeed] = useState(1.0);
  const [podcastMuted, setPodcastMuted] = useState(false);
  const podcastInterval = useRef<any>(null);

  // 4. Quiz States
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // 5. Action Items Checklist
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});

  // 6. Translation States
  const [targetLang, setTargetLang] = useState('es');
  const simulatedTranslations: Record<string, Record<string, string>> = {
    'UF8uR6Z6KLc': {
      'es': 'En este legendario discurso de graduación en la Universidad de Stanford en 2005, Steve Jobs (co-fundador de Apple) comparte tres historias personales sobre "conectar los puntos", "el amor y la pérdida" y "la muerte". Insta a los graduados a seguir su curiosidad e intuición.',
      'fr': 'Dans ce légendaire discours d’ouverture à l’Université de Stanford en 2005, Steve Jobs (co-fondateur d’Apple) partage trois histoires personnelles sur "relier les points", "l’amour et la perte" et "la mort". Il exhorte les diplômés à suivre leur curiosité.',
      'ar': 'في هذا خطاب التخرج الأسطوري بجامعة ستانفورد في عام ٢٠٠٥، يشارك ستيف جوبز (المؤسس المشارك لشركة أبل) ثلاث قصص شخصية حول "ربط النقاط" و"الحب والخسارة" و"الموت". ويحث الخريجين على اتباع فضولهم وحدسهم.',
      'ja': '2005年のスタンフォード大学での伝説的な卒業式スピーチで、スティーブ・ジョブズ（アップルの共同創業者）は、「点と点をつなぐ」、「愛と喪失」、そして「死」についての3つの個人的な話を共有しています。好奇心に従うよう促します。',
      'de': 'In dieser legendären Eröffnungsrede an der Stanford University im Jahr 2005 teilt Steve Jobs (Mitbegründer von Apple) drei persönliche Geschichten über das "Verbinden der Punkte", "Liebe und Verlust" und den "Tod". Er drängt die Absolventen, ihrer Neugier zu folgen.'
    },
    'qp0HIF3SfI4': {
      'es': 'Simon Sinek presenta un modelo simple pero poderoso para el liderazgo inspirador, comenzando con un "Círculo Dorado" de Por qué, Cómo y Qué. Explica que los líderes verdaderamente inspiradores comunican de adentro hacia afuera.',
      'fr': 'Simon Sinek présente un modèle simple mais puissant pour un leadership inspirant, en commençant par un "Cercle d’Or" du Pourquoi, du Comment et du Quoi. Il explique que les leaders inspirants communiquent de l’intérieur vers l’extérieur.',
      'ar': 'يقدم سايمون سينك نموذجًا بسيطًا ولكنه قوي للقيادة الملهمة - بدءًا من "الدائرة الذهبية" المكونة من لماذا وكيف وماذا. ويوضح أن القادة الملهمين حقًا يتواصلون من الداخل إلى الخارج.',
      'ja': 'サイモン・シネックは、インスピレーションを与えるリーダーシップのためのシンプルで強力なモデル、つまり「なぜ」「どのように」「何を」というゴールデンサークルを提示します。素晴らしいリーダーは内側から伝えると説明します。',
      'de': 'Simon Sinek präsentiert ein einfaches, aber kraftvolles Modell für inspirierende Führung – beginnend mit einem "Golden Circle" aus Warum, Wie und Was. Er erklärt, dass inspirierende Führungskräfte von innen nach außen kommunizieren.'
    }
  };

  // 7. Keyword Cloud Clicked State
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const keywordsList = [
    { text: 'Steve Jobs', freq: 12, category: 'Creator', desc: 'Co-founder of Apple Inc. and legendary visionary.' },
    { text: 'Stanford', freq: 8, category: 'Context', desc: 'The elite university where the commencement took place in 2005.' },
    { text: 'Calligraphy', freq: 7, category: 'Insight', desc: 'The study of beautiful writing that inspired Mac fonts.' },
    { text: 'Pixar', freq: 6, category: 'Milestone', desc: 'Animation company created by Jobs that pioneered CGI films.' },
    { text: 'Connecting Dots', freq: 11, category: 'Philosophy', desc: 'The belief that unrelated choices somehow connect backward.' },
    { text: 'Stay Hungry', freq: 9, category: 'Mantra', desc: 'The charge to remain curious, open, and never settle.' },
    { text: 'Golden Circle', freq: 14, category: 'Framework', desc: 'Simon Sinek\'s core concept of Why, How, What.' },
    { text: 'Limbic Brain', freq: 8, category: 'Biology', desc: 'The emotional center that drives trust and gut decisions.' },
    { text: 'Start With Why', freq: 13, category: 'Mantra', desc: 'The leadership philosophy of communicating purpose first.' }
  ];

  // 8. Interactive AI Chat Companion Playground States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot', text: string }>>([
    { sender: 'bot', text: "Hi there! I am the Zipytiny Knowledge Companion. I have processed the complete video transcript. Ask me anything about this lecture!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);

  const smartPrompts = activeVideo.metadata.videoId === 'UF8uR6Z6KLc' 
    ? [
        "What is the calligraphy story?",
        "Explain his view on death.",
        "What does 'Stay Hungry' mean?"
      ]
    : [
        "What is the Golden Circle?",
        "How is 'Why' linked to biology?",
        "Explain Apple's marketing strategy."
      ];

  const handleSmartPromptClick = (promptText: string) => {
    if (isChatTyping) return;
    triggerChatReply(promptText);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatTyping) return;
    triggerChatReply(chatInput.trim());
    setChatInput('');
  };

  const triggerChatReply = (userText: string) => {
    const nextMsg = { sender: 'user' as const, text: userText };
    setChatMessages(prev => [...prev, nextMsg]);
    setIsChatTyping(true);

    // Dynamic contextual answers based on preloaded transcripts
    setTimeout(() => {
      let botResponse = "That is a great question! Based on the video context, ";
      const lower = userText.toLowerCase();

      if (activeVideo.metadata.videoId === 'UF8uR6Z6KLc') {
        if (lower.includes('calligraphy')) {
          botResponse += "Steve Jobs dropped out of Reed College but decided to drop in on calligraphy courses. He learned about serif and sans-serif typefaces, about varying the space between letter combinations. Ten years later, when designing the Macintosh, they designed it all into the Mac - it was the first computer with beautiful typography.";
        } else if (lower.includes('death') || lower.includes('mortality')) {
          botResponse += "Steve Jobs remembered a quote: 'If you live each day as if it was your last, someday you\'ll most certainly be right.' He looked in the mirror every morning and asked if today were the last day of his life, would he want to do what he was about to do. He concluded that death is life's greatest change agent, clearing out the old to make way for the new.";
        } else if (lower.includes('hungry') || lower.includes('foolish') || lower.includes('mantra')) {
          botResponse += "Jobs concluded with the legendary slogan from the final issue of 'The Whole Earth Catalog' published in the mid-1970s. Beneath a photo of an early morning country road were the words: 'Stay Hungry. Stay Foolish.' It urges graduates to keep searching, preserve a beginner\'s mind, and never settle.";
        } else {
          botResponse += "Steve Jobs urged the graduates to trust that their experiences (dots) will connect, to love what they do and keep looking until they find it, and to follow their own heart and intuition, which already somehow know what they truly want to become.";
        }
      } else {
        if (lower.includes('circle') || lower.includes('golden')) {
          botResponse += "Simon Sinek defines the Golden Circle as three concentric rings: Why (Purpose/Belief), How (Process/USP), and What (Products/Services). Most organizations communicate from the outside in (What to Why), but inspiring ones communicate from the inside out.";
        } else if (lower.includes('biology') || lower.includes('limbic') || lower.includes('brain')) {
          botResponse += "Sinek explains that this is grounded in the biology of the brain. The outer neocortex corresponds to the 'What', handling language and rational thought. The inner limbic system corresponds to the 'Why' and 'How'. It controls all emotions, visceral decisions, and has no capacity for language. Communicating 'Why' speaks directly to the gut decision-making center.";
        } else if (lower.includes('apple') || lower.includes('marketing')) {
          botResponse += "Apple succeeds because they sell their purpose first. Instead of saying 'We make great computers, want to buy one?', they say 'Everything we do, we believe in challenging the status quo. We do this by making our products beautifully designed and user friendly. We just happen to make great computers. Want to buy one?' Communicating inside-out drives massive loyalty.";
        } else {
          botResponse += "Simon Sinek's core thesis is 'People don't buy what you do; they buy why you do it.' Communicating your purpose attracts innovators and early adopters who share your belief, crossing the adoption chasm to secure the mass market.";
        }
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      setIsChatTyping(false);
    }, 1500);
  };

  // =========================================================================
  // ACTIONS / LIFECYCLES
  // =========================================================================

  // Synchronize browser tab path name
  useEffect(() => {
    try {
      const targetPath = `/features/${featureSlug}`;
      if (window.location.pathname.toLowerCase() !== targetPath.toLowerCase()) {
        window.history.pushState({ featureSlug }, document.title, targetPath + window.location.search);
      }
    } catch (err) {
      console.warn('Failed to update browser address bar:', err);
    }
  }, [featureSlug]);

  // Audio simulation ticker
  useEffect(() => {
    if (podcastPlaying) {
      podcastInterval.current = setInterval(() => {
        setPodcastProgress(prev => {
          if (prev >= 100) {
            setPodcastPlaying(false);
            clearInterval(podcastInterval.current);
            return 100;
          }
          return prev + (0.5 * podcastSpeed);
        });
      }, 100);
    } else {
      if (podcastInterval.current) clearInterval(podcastInterval.current);
    }
    return () => {
      if (podcastInterval.current) clearInterval(podcastInterval.current);
    };
  }, [podcastPlaying, podcastSpeed]);

  const handlePodcastReset = () => {
    setPodcastProgress(0);
    setPodcastPlaying(false);
  };

  // Preloaded mock checklist initializer
  useEffect(() => {
    setCompletedActions({});
    setQuizAnswers({});
    setQuizSubmitted(false);
  }, [videoIndex]);

  return (
    <div id={`feature-page-${featureSlug}`} className="space-y-12 pb-16">
      
      {/* 🧭 NAVIGATION BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.04] dark:border-zinc-800/60 pb-6">
        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100 transition-colors cursor-pointer group w-fit"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </button>

        {/* Video selector for data preview */}
        <div className="flex items-center gap-2 bg-black/[0.03] dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-800/80 p-1.5 rounded-full">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500 pl-3">Source:</span>
          <button 
            onClick={() => setVideoIndex(0)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${videoIndex === 0 ? 'bg-white dark:bg-zinc-800 text-neutral-900 dark:text-zinc-50 shadow-xs border border-black/[0.02]' : 'text-neutral-500 dark:text-zinc-400 hover:text-neutral-900'}`}
          >
            Steve Jobs (Stanford)
          </button>
          <button 
            onClick={() => setVideoIndex(1)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${videoIndex === 1 ? 'bg-white dark:bg-zinc-800 text-neutral-900 dark:text-zinc-50 shadow-xs border border-black/[0.02]' : 'text-neutral-500 dark:text-zinc-400 hover:text-neutral-900'}`}
          >
            Simon Sinek (TED)
          </button>
        </div>
      </div>

      {/* 🚀 HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-black/[0.04] dark:border-zinc-900 shadow-xs">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold tracking-wider uppercase font-mono border border-indigo-100/30">
              {spec.badge}
            </span>
            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold tracking-wider uppercase font-mono border border-amber-100/30">
              Pro Feature
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-neutral-900 dark:text-zinc-50 flex items-center gap-3">
            {React.createElement(spec.icon, { className: "w-8 h-8 text-indigo-500 shrink-0" })}
            <span>{spec.title}</span>
          </h1>

          <p className="text-sm text-neutral-500 dark:text-zinc-400 font-medium max-w-xl">
            {spec.description}
          </p>

          <div className="pt-2 space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 dark:text-zinc-500">Key Benefits</h3>
            <ul className="space-y-1.5">
              {spec.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-zinc-400">
                  <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => onLaunchApp(
                featureSlug === 'mind-maps' ? 'mindmap' : 
                featureSlug === 'flashcards' ? 'quiz' :
                featureSlug === 'study-notes' ? 'quiz' :
                featureSlug === 'quiz-gen' ? 'quiz' :
                featureSlug === 'timeline-view' ? 'chapters' :
                featureSlug === 'podcast-gen' ? 'monetize' : 'overview',

                featureSlug === 'flashcards' ? 'flashcards' :
                featureSlug === 'study-notes' ? 'syllabus' :
                featureSlug === 'quiz-gen' ? 'quiz' : undefined
              )}
              className="px-6 py-3 bg-neutral-900 dark:bg-zinc-50 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch in Workspace</span>
            </button>

            <button 
              onClick={() => handleCopy(`https://www.zipytiny.app/features/${featureSlug}`)}
              className="px-5 py-3 border border-black/[0.08] dark:border-zinc-800 hover:bg-black/[0.02] dark:hover:bg-zinc-900 text-neutral-600 dark:text-zinc-400 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied URL!' : 'Copy Shareable URL'}</span>
            </button>
          </div>
        </div>

        {/* Source Video Banner card */}
        <div className="lg:col-span-5 bg-black/[0.02] dark:bg-zinc-900/40 p-4 rounded-2xl border border-black/[0.04] dark:border-zinc-800/50 space-y-3">
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-xs border border-black/[0.05] dark:border-zinc-800">
            <img 
              src={activeVideo.metadata.thumbnailUrl} 
              alt={activeVideo.metadata.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="w-12 h-12 rounded-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xs flex items-center justify-center text-neutral-900 dark:text-zinc-50 shadow-md">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">Preview Dataset</span>
            <h4 className="text-xs font-semibold text-neutral-800 dark:text-zinc-200 line-clamp-1">{activeVideo.metadata.title}</h4>
            <p className="text-[10px] text-neutral-500 dark:text-zinc-500">Channel: {activeVideo.metadata.author} • Duration: {activeVideo.metadata.duration}</p>
          </div>
        </div>
      </div>

      {/* 🕹️ LIVE INTERACTIVE PLAYGROUND (THE CEILING PRODUCER) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-zinc-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span>Live Feature Playground</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-zinc-500">Interact with this simulated preview containing real compiled video data.</p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-bold font-mono tracking-wider flex items-center gap-1 border border-emerald-100/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE PLAYGROUND
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-black/[0.04] dark:border-zinc-900/80 rounded-3xl overflow-hidden min-h-[380px] flex flex-col shadow-xs">
          
          {/* Playground header */}
          <div className="bg-neutral-50 dark:bg-zinc-900/30 px-6 py-4 border-b border-black/[0.04] dark:border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span className="text-xs font-mono font-bold text-neutral-700 dark:text-zinc-300 uppercase tracking-wider">{spec.title} Interactive Board</span>
            </div>
            <div className="text-[11px] text-neutral-400 dark:text-zinc-500 font-medium">
              Demo Output generated via <span className="font-semibold text-indigo-500 font-mono">Gemini-3.5-Flash</span>
            </div>
          </div>

          {/* Playground body switcher */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">

            {/* 1. MIND MAP PLAYGROUND */}
            {spec.previewType === 'mindmap' && (
              <div className="space-y-6">
                <div className="text-center max-w-md mx-auto space-y-1">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Click a concept bubble to unpack its cognitive hierarchy.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 py-4">
                  {Array.from(new Set(activeVideo.mindmap.map((item) => item.category))).map((category) => (
                    <button
                      key={category}
                      onClick={() => setExpandedMindmapCategory(expandedMindmapCategory === category ? null : category)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-semibold font-sans border transition-all cursor-pointer duration-200 flex items-center gap-2 ${expandedMindmapCategory === category ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'bg-white dark:bg-zinc-900 border-black/[0.06] dark:border-zinc-800 hover:border-indigo-400 text-neutral-700 dark:text-zinc-300'}`}
                    >
                      <Network className="w-3.5 h-3.5 shrink-0" />
                      <span>{category}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10">{activeVideo.mindmap.filter(n => n.category === category).length} Nodes</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {expandedMindmapCategory ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
                    >
                      {activeVideo.mindmap.filter(node => node.category === expandedMindmapCategory).map((node, i) => (
                        <div key={i} className="bg-indigo-50/10 dark:bg-indigo-950/5 border border-indigo-500/10 dark:border-indigo-500/10 p-4 rounded-2xl hover:border-indigo-500/30 transition-all space-y-1 shadow-2xs">
                          <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{node.concept}</h4>
                          <p className="text-xs text-neutral-600 dark:text-zinc-400 font-medium leading-relaxed">{node.description}</p>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-8 text-xs text-neutral-400 dark:text-zinc-600 font-semibold italic">
                      Select one of the structural categories above to explore detailed concepts.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 2. FLASHCARDS PLAYGROUND */}
            {spec.previewType === 'flashcards' && (
              <div className="space-y-6 max-w-md mx-auto w-full">
                {/* Score tracker */}
                <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
                  <span>Progress: {currentFlashcardIndex + 1} / 4</span>
                  <span>Interactive Flashcard</span>
                </div>

                {/* 3D Flashcard flip simulation */}
                <div 
                  onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                  className="h-52 w-full cursor-pointer perspective-1000 group"
                >
                  <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style-3d ${isFlashcardFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front of card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-rose-50/10 dark:bg-rose-950/5 border border-rose-500/10 dark:border-rose-500/20 rounded-3xl p-6 flex flex-col justify-between items-center shadow-xs">
                      <span className="text-[10px] font-mono font-bold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full">ACTIVE RECALL QUESTION</span>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-zinc-200 px-4 leading-relaxed">
                        {currentFlashcardIndex === 0 && (activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? 'What calligraphy script elements influenced Steve Jobs?' : 'What does Simon Sinek define as the Golden Circle layers?')}
                        {currentFlashcardIndex === 1 && (activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? 'Why was getting fired from Apple ultimately a blessing?' : 'How does Sinek map the Golden Circle to human brain biology?')}
                        {currentFlashcardIndex === 2 && (activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? 'What is Jobs\' key mantra regarding personal mortality?' : 'What core slogan represents Sinek\'s marketing thesis?')}
                        {currentFlashcardIndex === 3 && (activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? 'What final charge did he leave with the Stanford grads?' : 'What historical contrast demonstrates purpose over wealth?')}
                      </p>
                      <span className="text-[10px] font-semibold text-neutral-400 group-hover:text-neutral-600 transition-colors">Click Card to Flip / See Answer</span>
                    </div>

                    {/* Back of card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-emerald-50/10 dark:bg-emerald-950/5 border border-emerald-500/10 dark:border-emerald-500/20 rounded-3xl p-6 flex flex-col justify-between items-center shadow-xs">
                      <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">EXPERT LEARNING ANSWER</span>
                      <p className="text-xs font-semibold text-neutral-700 dark:text-zinc-300 px-4 leading-relaxed">
                        {currentFlashcardIndex === 0 && (activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? 'Serif and sans-serif typefaces, adjusting spacing, and typography that later inspired the Macintosh layout.' : 'Why (Purpose/Belief), How (Processes/USPs), and What (Products/Services sold).')}
                        {currentFlashcardIndex === 1 && (activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? 'It freed him to enter his most creative period, leading to NeXT, Pixar, and returning to Apple with revolutionary designs.' : 'The outer neocortex aligns with the WHAT (logic/language). The inner limbic system represents the WHY and HOW (feelings/decisions).')}
                        {currentFlashcardIndex === 2 && (activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? 'Remembering that you are going to die is the ultimate tool to avoid thinking you have something to lose.' : '"People don\'t buy what you do; they buy why you do it."')}
                        {currentFlashcardIndex === 3 && (activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? '"Stay Hungry, Stay Foolish" - embrace lifelong learning and continuous ambition.' : 'Wright Brothers (believers with purpose) vs. Samuel Langley (well-funded but chasing wealth).')}
                      </p>
                      <span className="text-[10px] font-semibold text-neutral-400">Click Card to Flip back</span>
                    </div>

                  </div>
                </div>

                {/* Card controls */}
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => {
                      setIsFlashcardFlipped(false);
                      setCurrentFlashcardIndex(prev => Math.max(0, prev - 1));
                    }}
                    disabled={currentFlashcardIndex === 0}
                    className="p-2 border border-black/[0.06] dark:border-zinc-800 hover:bg-neutral-50 rounded-xl cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                    className="px-4 py-2 bg-neutral-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold text-neutral-700 dark:text-zinc-300 cursor-pointer"
                  >
                    Reveal Answer
                  </button>

                  <button 
                    onClick={() => {
                      setIsFlashcardFlipped(false);
                      setCurrentFlashcardIndex(prev => Math.min(3, prev + 1));
                    }}
                    disabled={currentFlashcardIndex === 3}
                    className="p-2 border border-black/[0.06] dark:border-zinc-800 hover:bg-neutral-50 rounded-xl cursor-pointer disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. PODCAST PLAYGROUND */}
            {spec.previewType === 'podcast' && (
              <div className="max-w-xl mx-auto w-full space-y-6">
                {/* Audio cassette block */}
                <div className="bg-neutral-50 dark:bg-zinc-900/50 border border-black/[0.04] dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <Volume2 className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-zinc-200">AI Audio Briefing: {activeVideo.metadata.title}</h4>
                      <p className="text-[10px] text-neutral-500 dark:text-zinc-500">Speed: {podcastSpeed}x • Dynamic Synthesis</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setPodcastMuted(!podcastMuted)}
                      className="p-2 text-neutral-500 hover:text-neutral-800 rounded-lg cursor-pointer"
                    >
                      {podcastMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setPodcastSpeed(s => s === 1.0 ? 1.25 : s === 1.25 ? 1.5 : 1.0)}
                      className="px-2.5 py-1 bg-black/[0.04] text-[10px] font-semibold rounded-md text-neutral-600 cursor-pointer"
                    >
                      {podcastSpeed}x
                    </button>
                  </div>
                </div>

                {/* Progress tracking */}
                <div className="space-y-2">
                  <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden relative">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-100" 
                      style={{ width: `${podcastProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                    <span>{Math.floor(podcastProgress * 0.1)}s</span>
                    <span>10.0s Limit</span>
                  </div>
                </div>

                {/* Dynamic script highlighter */}
                <div className="bg-neutral-50 dark:bg-zinc-900/30 p-4 rounded-xl border border-black/[0.03] dark:border-zinc-800 text-[11px] leading-relaxed max-h-24 overflow-y-auto space-y-2">
                  <p className={podcastProgress < 30 ? 'text-amber-500 font-semibold' : 'text-neutral-400'}>
                    "Hello and welcome back to Zipytiny Radio. Today we are diving into an absolute masterpiece: {activeVideo.metadata.title}."
                  </p>
                  <p className={podcastProgress >= 30 && podcastProgress < 70 ? 'text-amber-500 font-semibold' : 'text-neutral-400'}>
                    {activeVideo.metadata.videoId === 'UF8uR6Z6KLc' 
                      ? '"Steve outlines three core paths of his life: dropout calligraphy typefaces, founding Pixar and love, and using mortality to conquer fear."'
                      : '"Simon presents the Golden Circle layers—Why, How, What. Communicating from inside-out speaks to the biology of decision making."'}
                  </p>
                  <p className={podcastProgress >= 70 ? 'text-amber-500 font-semibold' : 'text-neutral-400'}>
                    "Thank you for listening. Access your workspace for full audio exports and transcripts!"
                  </p>
                </div>

                {/* Cassette control triggers */}
                <div className="flex justify-center items-center gap-3">
                  <button 
                    onClick={handlePodcastReset}
                    className="p-2 border border-black/[0.06] rounded-xl hover:bg-neutral-50 text-neutral-500 cursor-pointer"
                    title="Reset Audio"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setPodcastPlaying(!podcastPlaying)}
                    className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    {podcastPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* 4. STUDY NOTES SYLLABUS PREVIEW */}
            {spec.previewType === 'notes' && (
              <div className="max-w-2xl mx-auto w-full prose dark:prose-invert text-xs leading-relaxed space-y-4">
                <div className="border-l-2 border-emerald-500 pl-4 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500">AI Syllabus Module</span>
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-zinc-200">{activeVideo.metadata.title}</h3>
                </div>

                <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 space-y-3 font-medium">
                  <h4 className="text-[11px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">1. Conceptual Lesson Objectives</h4>
                  <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-zinc-400">
                    {activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? (
                      <>
                        <li>Identify how creative curiosity (typography class) maps downstream to core product design (Mac).</li>
                        <li>Examine setbacks (being fired) as catalysts for creative incubation and secondary ventures (Pixar).</li>
                        <li>Deconstruct mortality as a cognitive lens to eliminate noise and align with authentic motivation.</li>
                      </>
                    ) : (
                      <>
                        <li>Deconstruct the Golden Circle structure: Why (purpose), How (process), and What (result).</li>
                        <li>Analyze how neurological anatomy (limbic system vs neocortex) influences consumer loyalty.</li>
                        <li>Outline the law of diffusion of innovations to bridge early adoption with mass markets.</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono uppercase font-bold text-neutral-400">2. Core Academic Definition Register</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? (
                      <>
                        <div className="p-3 bg-neutral-50 dark:bg-zinc-900 border border-black/[0.04] rounded-xl space-y-1">
                          <span className="font-bold text-neutral-800 dark:text-zinc-200">Connecting Dots Backward</span>
                          <p className="text-neutral-500 text-[11px]">The philosophy that intuitive experiences, even if seemingly random, will align and prove vital in the future.</p>
                        </div>
                        <div className="p-3 bg-neutral-50 dark:bg-zinc-900 border border-black/[0.04] rounded-xl space-y-1">
                          <span className="font-bold text-neutral-800 dark:text-zinc-200">Mortality Decoupling</span>
                          <p className="text-neutral-500 text-[11px]">Using structural awareness of death to shed external expectations, fear of failure, and focus on vital actions.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-neutral-50 dark:bg-zinc-900 border border-black/[0.04] rounded-xl space-y-1">
                          <span className="font-bold text-neutral-800 dark:text-zinc-200">Inside-Out Protocol</span>
                          <p className="text-neutral-500 text-[11px]">The framework of starting all organizational communication from the "Why" (Purpose) rather than the "What" (Features).</p>
                        </div>
                        <div className="p-3 bg-neutral-50 dark:bg-zinc-900 border border-black/[0.04] rounded-xl space-y-1">
                          <span className="font-bold text-neutral-800 dark:text-zinc-200">Limbic Target Strategy</span>
                          <p className="text-neutral-500 text-[11px]">Direct marketing targeting the emotional parts of the human brain to drive guttural consumer alignment and trust.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5. QUIZ PLAYGROUND */}
            {spec.previewType === 'quiz' && (
              <div className="max-w-xl mx-auto w-full space-y-6 text-xs">
                {activeVideo.quiz.map((q, idx) => (
                  <div key={idx} className="space-y-3 bg-neutral-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-black/[0.04] dark:border-zinc-800">
                    <p className="font-bold text-neutral-800 dark:text-zinc-100 flex items-start gap-2">
                      <span className="bg-indigo-500/10 text-indigo-500 rounded px-1.5 py-0.5 font-mono text-[10px]">Q{idx + 1}</span>
                      <span>{q.question}</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[idx] === oIdx;
                        const isCorrect = q.answerIndex === oIdx;
                        let optionStyle = "border-black/[0.06] hover:border-indigo-400 text-neutral-700 dark:text-zinc-300";
                        if (quizSubmitted) {
                          if (isCorrect) {
                            optionStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold";
                          } else if (isSelected) {
                            optionStyle = "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400";
                          } else {
                            optionStyle = "opacity-55";
                          }
                        } else if (isSelected) {
                          optionStyle = "border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-medium";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [idx]: oIdx }))}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${optionStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-3 bg-neutral-100 dark:bg-zinc-800/80 rounded-xl mt-2 text-neutral-500 border border-black/[0.02]">
                        <span className="font-bold text-neutral-700 dark:text-zinc-300">Explanation:</span> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-between items-center">
                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length < activeVideo.quiz.length}
                      className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-40"
                    >
                      Submit Quiz answers
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="px-5 py-2.5 border border-black/[0.06] rounded-xl text-xs font-semibold text-neutral-600 cursor-pointer"
                    >
                      Restart Quiz Challenge
                    </button>
                  )}

                  {quizSubmitted && (
                    <span className="font-bold text-indigo-500 text-sm font-mono">
                      Score: {activeVideo.quiz.reduce((acc, q, idx) => acc + (quizAnswers[idx] === q.answerIndex ? 1 : 0), 0)} / {activeVideo.quiz.length}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 6. TIMELINE CHAPTERS PLAYGROUND */}
            {spec.previewType === 'chapters' && (
              <div className="max-w-xl mx-auto w-full relative pl-6 border-l-2 border-sky-500/30 space-y-6">
                {activeVideo.chapters.map((chapter, i) => (
                  <div key={i} className="relative group text-xs">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white dark:bg-zinc-950 border-2 border-sky-500 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                    </span>

                    <div className="space-y-1 bg-neutral-50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-black/[0.03] dark:border-zinc-800">
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-mono text-sky-500 font-bold">{chapter.timestamp}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">Chapter {i + 1}</span>
                      </div>
                      <h4 className="font-bold text-neutral-800 dark:text-zinc-200">{chapter.title}</h4>
                      <p className="text-neutral-500 leading-relaxed font-medium">{chapter.takeaway}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 7. EXECUTIVE SUMMARY */}
            {spec.previewType === 'summary' && (
              <div className="max-w-2xl mx-auto w-full space-y-6 text-xs">
                <div className="text-center pb-2 border-b border-black/[0.04] dark:border-zinc-800">
                  <h3 className="font-mono uppercase font-bold text-indigo-500 tracking-wider">Executive Briefing</h3>
                  <p className="text-[10px] text-neutral-400">Distilled strategic intelligence for high-level decision makers</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-rose-500/[0.02] border border-rose-500/10 p-4 rounded-2xl space-y-1.5">
                    <span className="text-[9px] font-mono uppercase font-bold text-rose-500">The Problem</span>
                    <h4 className="font-bold text-neutral-800 dark:text-zinc-200">
                      {activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? 'Unconscious Conformity' : 'Commoditized Pitches'}
                    </h4>
                    <p className="text-neutral-500 text-[11px] leading-relaxed font-medium">
                      {activeVideo.metadata.videoId === 'UF8uR6Z6KLc' 
                        ? 'Living other people\'s expectations and getting trapped by fear of failure, leading to settling.'
                        : 'Communicating specifications (What) first, failing to build emotional connection or brand advocacy.'}
                    </p>
                  </div>

                  <div className="bg-amber-500/[0.02] border border-amber-500/10 p-4 rounded-2xl space-y-1.5">
                    <span className="text-[9px] font-mono uppercase font-bold text-amber-500">The Core Thesis</span>
                    <h4 className="font-bold text-neutral-800 dark:text-zinc-200">
                      {activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? 'Curiosity & Intuition' : 'Inside-Out Protocol'}
                    </h4>
                    <p className="text-neutral-500 text-[11px] leading-relaxed font-medium">
                      {activeVideo.metadata.videoId === 'UF8uR6Z6KLc' 
                        ? 'Trusting that seemingly random dots will align, sparking creativity during failures.'
                        : 'Starting brand communication loops with the WHY, appealing directly to emotional decision centers.'}
                    </p>
                  </div>

                  <div className="bg-emerald-500/[0.02] border border-emerald-500/10 p-4 rounded-2xl space-y-1.5">
                    <span className="text-[9px] font-mono uppercase font-bold text-emerald-500">The Solution</span>
                    <h4 className="font-bold text-neutral-800 dark:text-zinc-200">
                      {activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? 'Stay Hungry Mantra' : 'Belief Alignment'}
                    </h4>
                    <p className="text-neutral-500 text-[11px] leading-relaxed font-medium">
                      {activeVideo.metadata.videoId === 'UF8uR6Z6KLc' 
                        ? 'Keep seeking, embrace the beginners mind, and let death wipe away superficial hesitations.'
                        : 'Recruiting customers and teammates who share your core mission, locking in sustainable growth.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-zinc-900 border border-black/[0.03] dark:border-zinc-800 rounded-2xl">
                  <h4 className="font-bold text-neutral-700 dark:text-zinc-300 mb-1 font-mono uppercase text-[10px]">Condensed Synopsis</h4>
                  <p className="text-neutral-500 font-medium leading-relaxed">{activeVideo.summary}</p>
                </div>
              </div>
            )}

            {/* 8. ACTION ITEMS CHECKLIST */}
            {spec.previewType === 'action-items' && (
              <div className="max-w-md mx-auto w-full space-y-4 text-xs">
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center font-mono text-[10px] text-neutral-400">
                    <span>ACTION COMPLETION TRACKER</span>
                    <span>
                      {Object.values(completedActions).filter(Boolean).length} of 5 Completed
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-pink-500 h-full transition-all duration-300"
                      style={{ width: `${(Object.values(completedActions).filter(Boolean).length / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {(activeVideo.metadata.videoId === 'UF8uR6Z6KLc' 
                    ? [
                        'Review current commitments and drop non-vital actions (Disconnect dots).',
                        'Identify calligraphy or tangential courses/topics that trigger raw curiosity.',
                        'Schedule a weekly reflective decoupling log regarding career priorities.',
                        'Draft a personal manifesto on "What I love about my current work".',
                        'Write down 3 bold goals to test if you had zero fear of failing.'
                      ]
                    : [
                        'Define your personal or company purpose statement in 10 words (Your Why).',
                        'Perform an audit on current pitch decks to swap What elements with Why.',
                        'Trace current user personas to verify core beliefs shared with the brand.',
                        'Draft a blog/thread outlining the Wright Brothers vs Langley contrast.',
                        'Host a team coordination session aligning goals with Sinek Golden Circle.'
                      ]
                  ).map((action, i) => (
                    <label 
                      key={i}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${completedActions[i] ? 'bg-pink-500/5 border-pink-500/20 text-neutral-400 dark:text-zinc-500 line-through' : 'bg-white dark:bg-zinc-900 border-black/[0.04] dark:border-zinc-800 hover:border-pink-300'}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={!!completedActions[i]}
                        onChange={(e) => setCompletedActions(prev => ({ ...prev, [i]: e.target.checked }))}
                        className="mt-0.5 rounded border-neutral-300 text-pink-500 focus:ring-pink-500 cursor-pointer"
                      />
                      <span className="font-semibold leading-relaxed">{action}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 9. MEETING MINUTES */}
            {spec.previewType === 'minutes' && (
              <div className="max-w-2xl mx-auto w-full text-xs space-y-4 border border-black/[0.04] dark:border-zinc-800 rounded-3xl p-6 bg-neutral-50/20">
                <div className="flex justify-between items-center border-b border-black/[0.04] dark:border-zinc-800 pb-3 font-mono text-[10px] text-neutral-400">
                  <span>OFFICIAL MINUTES OF VIDEO SEMINAR</span>
                  <span>ID: {activeVideo.metadata.videoId}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px] font-medium text-neutral-500 bg-neutral-50 dark:bg-zinc-900 p-4 rounded-2xl">
                  <div>
                    <span className="block font-bold text-neutral-800 dark:text-zinc-200">Video Session:</span>
                    {activeVideo.metadata.title}
                  </div>
                  <div>
                    <span className="block font-bold text-neutral-800 dark:text-zinc-200">Presenter:</span>
                    {activeVideo.metadata.author} (TED/Stanford context)
                  </div>
                  <div>
                    <span className="block font-bold text-neutral-800 dark:text-zinc-200">Scribe:</span>
                    Zipytiny AI Engine
                  </div>
                  <div>
                    <span className="block font-bold text-neutral-800 dark:text-zinc-200">Date Logged:</span>
                    {new Date().toISOString().split('T')[0]}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-neutral-800 dark:text-zinc-200 font-mono text-[10px] uppercase text-orange-500">1. Executive Overview Register</h4>
                    <p className="text-neutral-500 font-medium leading-relaxed bg-white dark:bg-zinc-900 p-3 rounded-xl border border-black/[0.03]">
                      {activeVideo.summary.slice(0, 300)}...
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-neutral-800 dark:text-zinc-200 font-mono text-[10px] uppercase text-orange-500">2. Key Actionable Decisions</h4>
                    <ul className="list-decimal list-inside space-y-1 text-neutral-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-black/[0.03]">
                      {activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? (
                        <>
                          <li>Decided to connect dots backward during career roadblocks.</li>
                          <li>Committed to seeking creative fields with absolute gut alignment.</li>
                          <li>Aligned operations around authentic motivations, utilizing mortality filters.</li>
                        </>
                      ) : (
                        <>
                          <li>Committed to structuring all pitches around inner circle purpose (Why).</li>
                          <li>Decided to prioritize recruiting innovators/early adopters over transactional masses.</li>
                          <li>Agreed to restructure organizational guidelines using limbic biology formulas.</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 10. TRANSLATION SUITE */}
            {spec.previewType === 'translation' && (
              <div className="max-w-xl mx-auto w-full space-y-5 text-xs">
                <div className="flex justify-center gap-2">
                  {[
                    { code: 'es', name: 'Spanish (Español)' },
                    { code: 'fr', name: 'French (Français)' },
                    { code: 'de', name: 'German (Deutsch)' },
                    { code: 'ar', name: 'Arabic (العربية)' },
                    { code: 'ja', name: 'Japanese (日本語)' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setTargetLang(lang.code)}
                      className={`px-3 py-1.5 rounded-lg font-semibold font-sans border cursor-pointer transition-all ${targetLang === lang.code ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white dark:bg-zinc-900 border-black/[0.06] dark:border-zinc-800 text-neutral-600 dark:text-zinc-400'}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>

                <div className={`bg-neutral-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-black/[0.04] dark:border-zinc-800 space-y-4 min-h-36 flex flex-col justify-center ${targetLang === 'ar' ? 'text-right rtl' : 'text-left'}`}>
                  <div className="flex items-center gap-2 border-b border-black/[0.04] dark:border-zinc-800 pb-2">
                    <Globe className="w-4 h-4 text-teal-500" />
                    <span className="font-mono text-[10px] text-neutral-400">LOCALIZED MULTILINGUAL SUMMARY OUTPUT</span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed text-neutral-700 dark:text-zinc-300">
                    {simulatedTranslations[activeVideo.metadata.videoId]?.[targetLang] || 'Translation generating...'}
                  </p>
                </div>
              </div>
            )}

            {/* 11. SENTIMENT ANALYSIS */}
            {spec.previewType === 'sentiment' && (
              <div className="max-w-xl mx-auto w-full space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  
                  {/* Gauge card */}
                  <div className="bg-neutral-50 dark:bg-zinc-900 p-5 rounded-2xl border border-black/[0.04] dark:border-zinc-800 text-center space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Overall Speaker Emotion</span>
                    
                    <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-neutral-100 dark:text-zinc-800" />
                        <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="301.6" strokeDashoffset={301.6 * (1 - (activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? 0.94 : 0.88))} className="text-red-500" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col justify-center items-center">
                        <span className="text-xl font-bold text-neutral-800 dark:text-zinc-100">{activeVideo.metadata.videoId === 'UF8uR6Z6KLc' ? '94%' : '88%'}</span>
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Positive</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-neutral-500 dark:text-zinc-500">
                      Tonal index is highly passionate, authoritative, and educational.
                    </p>
                  </div>

                  {/* Highlights lists */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-500">Inspiring Passion Peak (98%)</span>
                      <p className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl italic font-medium text-neutral-600 dark:text-zinc-400">
                        {activeVideo.metadata.videoId === 'UF8uR6Z6KLc' 
                          ? '"Your time is limited, so don’t waste it living someone else’s life. Stay Hungry, Stay Foolish."'
                          : '"People don’t buy what you do; they buy why you do it."'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-500">Critical / Reflective Tone (45%)</span>
                      <p className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl italic font-medium text-neutral-600 dark:text-zinc-400">
                        {activeVideo.metadata.videoId === 'UF8uR6Z6KLc' 
                          ? '"Being fired from Apple was devastating... it was a very public failure."'
                          : '"Wright brothers had no capital, Samuel Langley had full funding but failed."'}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 12. KEY INSIGHT VALUE CARDS */}
            {spec.previewType === 'insights' && (
              <div className="max-w-xl mx-auto w-full space-y-4 text-xs">
                {activeVideo.takeaways.map((insight: any, i) => {
                  const txt = typeof insight === 'string' ? insight : insight?.text;
                  const isLowConf = typeof insight === 'string' ? false : !!insight?.lowConfidence;

                  return (
                    <div key={i} className="bg-neutral-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-black/[0.04] dark:border-zinc-800 flex items-start gap-3 shadow-2xs">
                      <span className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-mono font-bold text-xs shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 space-y-1.5">
                        <p className="font-semibold leading-relaxed text-neutral-700 dark:text-zinc-300">{txt}</p>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${isLowConf ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {isLowConf ? 'Review Recommended' : '99% High Confidence Claim'}
                          </span>
                          <button 
                            onClick={() => handleCopy(txt)}
                            className="text-[10px] text-neutral-400 hover:text-neutral-700 font-medium cursor-pointer"
                          >
                            Copy Claim
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 13. KEYWORDS PLAYGROUND */}
            {spec.previewType === 'keywords' && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-center gap-2.5 max-w-xl mx-auto py-3">
                  {keywordsList.map((tag) => (
                    <button
                      key={tag.text}
                      onClick={() => setSelectedKeyword(selectedKeyword === tag.text ? null : tag.text)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer border ${selectedKeyword === tag.text ? 'bg-cyan-500 border-cyan-500 text-white shadow-md' : 'bg-white dark:bg-zinc-900 border-black/[0.05] dark:border-zinc-800 text-neutral-700 dark:text-zinc-300 hover:border-cyan-400'}`}
                      style={{ transform: `scale(${1 + (tag.freq * 0.02)})` }}
                    >
                      <Hash className="w-3 h-3 text-cyan-500 shrink-0 inline mr-1" />
                      <span>{tag.text}</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {selectedKeyword ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl max-w-md mx-auto space-y-1 text-xs"
                    >
                      {(() => {
                        const word = keywordsList.find(w => w.text === selectedKeyword);
                        return (
                          <>
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-cyan-600 dark:text-cyan-400">{word?.text}</h4>
                              <span className="font-mono text-[9px] bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 px-2 rounded">Freq: {word?.freq} discussions</span>
                            </div>
                            <span className="block text-[10px] font-mono text-neutral-400">Class: {word?.category}</span>
                            <p className="text-neutral-500 font-medium leading-relaxed pt-1">{word?.desc}</p>
                          </>
                        );
                      })()}
                    </motion.div>
                  ) : (
                    <p className="text-center text-xs text-neutral-400 italic">Tap any bubble keyword to reveal semantic definition metrics.</p>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 14. COMPANION AI CHATPLAYGROUND */}
            {spec.previewType === 'chat' && (
              <div className="max-w-xl mx-auto w-full space-y-4 text-xs">
                {/* Messages scroll box */}
                <div className="bg-neutral-50 dark:bg-zinc-900/40 p-4 border border-black/[0.04] dark:border-zinc-800 rounded-2xl h-56 overflow-y-auto space-y-3 font-medium">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 max-w-[80%] rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white dark:bg-zinc-800 text-neutral-800 dark:text-zinc-200 border border-black/[0.03] dark:border-zinc-700 rounded-bl-none shadow-2xs'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isChatTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-bl-none border border-black/[0.03] text-neutral-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {smartPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      disabled={isChatTyping}
                      onClick={() => handleSmartPromptClick(prompt)}
                      className="px-3 py-1.5 bg-black/[0.03] hover:bg-indigo-500/10 border border-black/[0.04] hover:border-indigo-400 rounded-full text-[11px] font-semibold text-neutral-600 dark:text-zinc-400 cursor-pointer disabled:opacity-40"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input form */}
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask another follow-up question..."
                    disabled={isChatTyping}
                    className="flex-1 bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-text"
                  />
                  <button
                    type="submit"
                    disabled={isChatTyping}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl cursor-pointer disabled:opacity-40"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* 15. EXPORTS PLAYGROUND */}
            {spec.previewType === 'export' && (
              <div className="max-w-md mx-auto w-full space-y-6 text-xs">
                <div className="border border-black/[0.04] dark:border-zinc-800 rounded-2xl p-5 bg-neutral-50/10 text-center space-y-4">
                  <div className="flex justify-center">
                    <span className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <FileDown className="w-6 h-6" />
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-neutral-800 dark:text-zinc-200">Prepare Export Documents</h4>
                    <p className="text-[10px] text-neutral-400">Select formatting style rules before generating files.</p>
                  </div>

                  {/* Settings toggle */}
                  <div className="space-y-2 bg-white dark:bg-zinc-900 p-4 rounded-xl text-left border border-black/[0.03]">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-neutral-600 dark:text-zinc-400">Include Test Quiz Questions</span>
                      <input type="checkbox" defaultChecked className="rounded text-rose-500 focus:ring-rose-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-neutral-600 dark:text-zinc-400">High Resolution Vector Mindmap</span>
                      <input type="checkbox" defaultChecked className="rounded text-rose-500 focus:ring-rose-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-neutral-600 dark:text-zinc-400">Include Social Media Templates</span>
                      <input type="checkbox" className="rounded text-rose-500 focus:ring-rose-500" />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const blob = new Blob([activeVideo.summary + "\n\n" + activeVideo.blogPost], { type: 'text/markdown' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.setAttribute('download', `${activeVideo.metadata.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_summary.md`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File Now</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Playground footer back link */}
          <div className="bg-neutral-50/50 dark:bg-zinc-900/10 px-6 py-4 border-t border-black/[0.03] dark:border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-[10px] text-neutral-400 dark:text-zinc-500 font-semibold italic">💡 Select other videos in the source switcher above to test alternate preloaded results!</span>
            <button 
              onClick={() => onLaunchApp(
                featureSlug === 'mind-maps' ? 'mindmap' : 
                featureSlug === 'flashcards' ? 'quiz' :
                featureSlug === 'study-notes' ? 'quiz' :
                featureSlug === 'quiz-gen' ? 'quiz' :
                featureSlug === 'timeline-view' ? 'chapters' :
                featureSlug === 'podcast-gen' ? 'monetize' : 'overview',

                featureSlug === 'flashcards' ? 'flashcards' :
                featureSlug === 'study-notes' ? 'syllabus' :
                featureSlug === 'quiz-gen' ? 'quiz' : undefined
              )}
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100/30 transition-all cursor-pointer"
            >
              Start analyzing my own videos &rarr;
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
