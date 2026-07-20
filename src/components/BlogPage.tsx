import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Clock, ArrowRight, Sparkles, BookOpenCheck, Flame, Layers, Network, FileText, CheckCircle } from 'lucide-react';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  targetKeyword: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

interface BlogPageProps {
  currentBlogSlug: string;
  onNavigateHome: () => void;
  onNavigateToBlog: (slug: string) => void;
  onLaunchApp: () => void;
}

export default function BlogPage({ currentBlogSlug, onNavigateHome, onNavigateToBlog, onLaunchApp }: BlogPageProps) {
  const blogPosts: BlogPost[] = [
    {
      slug: 'turn-video-lecture-to-study-notes',
      title: 'How to Turn Video Lectures into Study Notes in Under 60 Seconds',
      description: 'Stop spending hours pausing and rewinding. Learn how to turn video lectures into study notes instantly using AI to save hours every week.',
      date: 'July 18, 2026',
      readTime: '4 min read',
      category: 'Study Hacks',
      targetKeyword: 'how to turn video lecture into study notes',
      icon: BookOpen,
      content: (
        <div className="space-y-6 text-neutral-800 dark:text-zinc-200 leading-relaxed text-sm sm:text-base">
          <p className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">
            Are you still pausing, rewinding, and manually typing out every word of your online university lectures?
          </p>
          <p>
            It is a statistical fact: the average student spends up to <strong>three times the actual duration</strong> of a video lecture just trying to transcribe notes. A 1-hour lecture turns into 3 hours of grueling, passive transcription. That is time you could be using for active studying, rest, or working on assignments.
          </p>
          
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            The Passive Learning Trap
          </h2>
          <p>
            Copying text verbatim is one of the least effective revision methods. Cognitive science shows that human brains retain information when they process, synthesize, and test themselves on the content. When you are focused purely on writing down what the professor said, you aren't actually understanding it.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            The 60-Second Solution: How to Turn Video Lectures into Study Notes Instantly
          </h2>
          <p>
            With the rise of state-of-the-art AI engines, you no longer need to transcribe lectures by hand. Modern software like <strong>Zipytiny</strong> lets you convert any YouTube, Vimeo, or MP4 video lecture directly into structured, professional-grade study guides and revision systems.
          </p>
          <p> Here is how the process works in three simple steps:</p>

          <div className="bg-indigo-50/50 dark:bg-zinc-900/60 p-5 rounded-2xl border border-indigo-100/30 dark:border-zinc-800/80 space-y-3">
            <h3 className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Paste the Video Link
            </h3>
            <p className="text-sm">
              Copy the YouTube or Vimeo URL of your college lecture or seminar recording and paste it into the Zipytiny input box. You can also upload local video files directly if your school uses custom lecture capture systems.
            </p>

            <h3 className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Choose Your Depth Level
            </h3>
            <p className="text-sm">
              Select your academic focus. Choose <strong>Study/Learning mode</strong> for structured summaries, key concepts and flashcards, or <strong>Mastery mode</strong> for deep syllabus breakdowns, comprehensive memory tips, and challenging study quizzes.
            </p>

            <h3 className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Generate in Under 60 Seconds
            </h3>
            <p className="text-sm">
              Press generate. Our background AI models download the transcript, analyze semantic milestones, and compile a complete interactive study workspace featuring clear explanations, terminology flashcards, interactive mind maps, and a self-testing quiz.
            </p>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            Why Structured Summaries Outperform Standard Transcripts
          </h2>
          <p>
            A simple word-for-word transcript is often disorganized and hard to read. A real study workspace formats the material into:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Topic-by-topic hierarchies</strong>: Breaking the video down into clear chapter headings.</li>
            <li><strong>Key conceptual breakdowns</strong>: Pinpointing complex vocabulary and offering everyday analogies.</li>
            <li><strong>Active recall tools</strong>: Instantly mapping topics to flashcards and quizzes so you can practice spacing out your study.</li>
          </ul>

          <div className="border-l-4 border-indigo-500 pl-4 py-1 my-4 bg-indigo-500/5 rounded-r-xl italic">
            "I used to spend 4 hours rewriting notes for my physiology lectures. Now, I paste the lecture in Zipytiny and use the extra time to actually review flashcards. My exam prep is so much less stressful." — Sarah M., College Junior
          </div>

          <p>
            Don't let manual notes hold you back. Let AI handle the heavy lifting of transcription and structuring, so you can focus on mastering the material.
          </p>
        </div>
      )
    },
    {
      slug: 'ai-tool-make-flashcards-slides',
      title: 'The Best AI Tool to Make Flashcards from Slides for Active Recall',
      description: 'Struggling to make flashcards from PDF slides? Discover how to automatically build revision decks in seconds using AI for optimized study prep.',
      date: 'July 17, 2026',
      readTime: '3 min read',
      category: 'Revision Tools',
      targetKeyword: 'ai tool to make flashcards from slides',
      icon: Layers,
      content: (
        <div className="space-y-6 text-neutral-800 dark:text-zinc-200 leading-relaxed text-sm sm:text-base">
          <p className="font-semibold text-lg text-rose-600 dark:text-rose-400">
            Active recall is the single most effective studying strategy. But creating flashcards from a 100-slide PDF deck can take hours of copying and pasting.
          </p>
          <p>
            When exam week approaches, students are flooded with PDF presentation decks from professors. Traditional study methods usually involve flipping through slides and reading them over and over. However, cognitive psychology confirms that <strong>passive rereading yields almost zero retention</strong>.
          </p>
          <p>
            To truly commit information to long-term memory, you must force your brain to retrieve it using flashcards. Since compiling these flashcards manually is slow, finding the best <strong>AI tool to make flashcards from slides</strong> is a game-changer.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            The Power of AI Slide Parsing
          </h2>
          <p>
            Zipytiny offers a complete, zero-config slide-to-flashcard pipeline. Rather than simply extracting raw text, Zipytiny uses advanced document processors to read PDF handouts, lecture notes, and PowerPoint presentations.
          </p>
          <p>
            Our models analyze bullet points, diagram definitions, and slide titles, isolating the core facts and formulas. Within seconds, it generates elegant interactive digital flashcards that test you on precise key terms, relationships, and procedural lists.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            How to Create Flashcards from PDF Slides in Under 60 Seconds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="p-4 border border-black/5 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
              <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-1">1. Drag and Drop PDF</h4>
              <p className="text-xs text-neutral-500">Simply upload your slide deck or lecture handout PDF into Zipytiny's input box.</p>
            </div>
            <div className="p-4 border border-black/5 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
              <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-1">2. AI Extracts Milestones</h4>
              <p className="text-xs text-neutral-500">The platform reads slides sequentially, isolating important terminology and complex formulas.</p>
            </div>
            <div className="p-4 border border-black/5 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
              <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-1">3. Spin Up Flashcard Deck</h4>
              <p className="text-xs text-neutral-500">Our interactive workspace renders the cards with flip gestures, status trackers, and confidence scores.</p>
            </div>
            <div className="p-4 border border-black/5 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
              <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-1">4. Study Offline / Export</h4>
              <p className="text-xs text-neutral-500">Download the generated deck as cleanly structured Markdown to back up your notes or study on the go.</p>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            Why Spaced Repetition Matters
          </h2>
          <p>
            Active recall works best when integrated with spaced repetition. By reviewing concepts just as you are about to forget them, you double your neural retention. Zipytiny's companion flashcard widget lets you instantly test your knowledge, check definitions, and mark cards you need to revisit.
          </p>
          <p>
            Instead of spending hours writing flashcards, you can begin studying them instantly. This single optimization saves valuable energy during hectic midterms.
          </p>
        </div>
      )
    },
    {
      slug: 'convert-zoom-recording-quiz',
      title: 'How to Convert a Zoom Recording or Lecture into an Interactive Quiz',
      description: 'Turn passive video replays into active practice tests. Here is how to easily convert online Zoom video recordings into quizzes for exam revision.',
      date: 'July 16, 2026',
      readTime: '4 min read',
      category: 'Tutoring Tips',
      targetKeyword: 'convert zoom recording to quiz',
      icon: CheckCircle,
      content: (
        <div className="space-y-6 text-neutral-800 dark:text-zinc-200 leading-relaxed text-sm sm:text-base">
          <p className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">
            Sitting through hours of recorded Zoom meetings or virtual class archives is boring and ineffective. Here is how to turn those video replays into custom interactive practice tests.
          </p>
          <p>
            Whether you are a remote employee catch-up watching an all-hands meeting, or a university student working through virtual lectures, watching hours of video recordings is an exhausting chore. Our eyes glaze over, and after 20 minutes, our minds wander.
          </p>
          <p>
            To maintain high attention and measure your comprehension, you need an active self-testing loop. The most efficient way to achieve this is to <strong>convert Zoom recordings to quizzes</strong> using AI.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            The Danger of "Illusion of Competence"
          </h2>
          <p>
            When we passively re-watch recorded streams, we mistake "recognition" for "recollection". Because the material looks familiar as it plays, we trick ourselves into thinking we know it. It is only during an actual exam or a meeting question that we discover our knowledge has major holes.
          </p>
          <p>
            A high-quality multiple-choice quiz forces your brain to discriminate between correct definitions and subtle distractor answers, cementing real conceptual understanding.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            The AI-Generated Quiz Pipeline
          </h2>
          <p>
            With Zipytiny, you can generate comprehensive practice tests in under a minute:
          </p>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong>Import the Video:</strong> Provide the link of your recorded lecture or upload your digital MP4 recording.
            </li>
            <li>
              <strong>Intelligent Question Compilation:</strong> Our system analyzes key argumentative claims, speaker highlights, and statistical details, compiling challenging interactive questions.
            </li>
            <li>
              <strong>Take the Test:</strong> Solve multiple-choice questions right in our beautiful, gamified study interface with immediate feedback, detailed correction notes, and score tracking.
            </li>
          </ol>

          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            Features of a High-Quality Revision Quiz
          </h2>
          <p>
            Zipytiny's quiz module doesn't just ask simple yes/no questions. It crafts real study questions that include:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Detailed rationale</strong>: Clear, educational explanations of why the correct option is right and where others went wrong.</li>
            <li><strong>Distractor mitigation</strong>: Plausible alternate choices that test your deeper understanding, avoiding basic guesses.</li>
            <li><strong>Score summaries</strong>: Visual celebration alerts (powered by confetti!) to keep studying fun and motivating.</li>
          </ul>

          <p>
            Turn your passive screen time into active cognitive gains. By testing yourself immediately after watching, you lock in the knowledge and identify gaps before it's too late.
          </p>
        </div>
      )
    },
    {
      slug: 'generate-study-guide-syllabus-pdf',
      title: 'Generate a Study Guide from a Course Syllabus or PDF Document',
      description: 'Stop struggling with disorganized textbooks. Learn how to generate a custom structured study guide from any complex PDF document using AI.',
      date: 'July 15, 2026',
      readTime: '3 min read',
      category: 'Academic Tech',
      targetKeyword: 'generate study guide from course syllabus pdf',
      icon: FileText,
      content: (
        <div className="space-y-6 text-neutral-800 dark:text-zinc-200 leading-relaxed text-sm sm:text-base">
          <p className="font-semibold text-lg text-amber-600 dark:text-amber-400">
            A 50-page course syllabus or textbook PDF can feel like an intimidating wall of text. Here is how to instantly organize and map it into a clean, actionable study plan.
          </p>
          <p>
            At the beginning of any academic course or professional certification program, you are handed a comprehensive PDF handbook, syllabus, or heavy reading bundle. These reference manuals are packed with administrative text, calendar tables, and dry reading assignments. Finding the actual core learning goals is like looking for a needle in a haystack.
          </p>
          <p>
            With the right AI, you can upload any textbook, handout, or curriculum PDF and instantly <strong>generate a study guide from a course syllabus PDF</strong> that outlines key definitions, chapter-by-chapter summaries, and step-by-step revision checklists.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            Deconstructing Dense Documents
          </h2>
          <p>
            Zipytiny's PDF analysis engine parses unstructured texts and maps them into dynamic educational assets. It doesn't just summarize the text; it reads between the lines to compile a study guide that actually guides your revision:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Learning Milestones:</strong> Translates syllabus objectives into clear, student-friendly targets.</li>
            <li><strong>Vocabulary Sheets:</strong> Automatically extracts bold terminology, academic vocabulary, and core concepts.</li>
            <li><strong>7-Day Spaced Study Plan:</strong> Creates a step-by-step daily revision roadmap, outlining exactly what topics to study each day for maximum retention.</li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            Why Students Prefer Zipytiny Study Guides
          </h2>
          <p>
            A static word document summary is easily forgotten in a folder. Zipytiny's study guide operates inside a live, interactive workspace. You can read clear concept definitions, flip digital flashcards, take multiple-choice review quizzes, and explore dynamic interactive mind maps that visually link concepts together.
          </p>
          <p>
            This integrated, multi-sensory approach is optimized for both visual and auditory learners, helping you master complex terms far faster than scrolling through a PDF slide.
          </p>
        </div>
      )
    },
    {
      slug: 'visual-learners-video-mind-map-generator',
      title: 'Why Visual Learners Need a Video to Mind Map Generator for Complex Topics',
      description: 'Struggling to grasp highly technical concepts? Discover how a video to mind map generator can turn dry video lectures into nested visual diagrams.',
      date: 'July 14, 2026',
      readTime: '3 min read',
      category: 'Visual Learning',
      targetKeyword: 'best video to mind map generator online',
      icon: Network,
      content: (
        <div className="space-y-6 text-neutral-800 dark:text-zinc-200 leading-relaxed text-sm sm:text-base">
          <p className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">
            For visual learners, scrolling through endless lines of text notes is a recipe for boredom. Learn how to map dry video lectures into beautiful, interactive concept diagrams.
          </p>
          <p>
            It is well documented that more than 65% of the population are visual learners. They need to see how ideas relate to each other, how hierarchies build, and where connections lie. Simply reading a word-for-word lecture transcript is extremely dry and hard to retain.
          </p>
          <p>
            When studying complex topics—like software systems, biological pathways, historical timelines, or financial structures—a visual diagram is worth a thousand words. That is why finding the <strong>best video to mind map generator online</strong> is a major breakthrough.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            What is a Video to Mind Map Generator?
          </h2>
          <p>
            Zipytiny's visual engine processes your uploaded PDF slides, articles, and YouTube lectures, and isolates the core themes and subtopics. It then lays out a beautifully nested, expandable conceptual graph.
          </p>
          <p>
            Instead of staring at a wall of text, you are presented with an interactive node map. You can click on categories to expand nested sub-nodes, read short cards on specific concepts, and visually trace how the professor's arguments connect to larger core principles.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-zinc-50 pt-4 border-b border-black/5 dark:border-zinc-800 pb-2">
            The Benefits of Concept Mapping
          </h2>
          <p>
            Concept mapping has been proven to improve academic performance because it supports **chunking**—the cognitive process of breaking down complex details into memorable groups.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Reduce Cognitive Load:</strong> Seeing topics structured in groups keeps you from feeling overwhelmed.</li>
            <li><strong>Reveal Hidden Connections:</strong> Easily spot how different parts of a video lecture relate to each other.</li>
            <li><strong>Active Spatial Memory:</strong> Associating concepts with colors and screen positions creates stronger visual memory hooks.</li>
          </ul>

          <p>
            Don't let dry, flat transcripts slow down your studying. Leverage visual mind mapping to make learning intuitive, organized, and fun.
          </p>
        </div>
      )
    }
  ];

  const activePost = blogPosts.find(p => p.slug === currentBlogSlug);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn" id="blog-main-container">
      {activePost ? (
        // --- BLOG DETAIL VIEW ---
        <article className="space-y-6">
          {/* Breadcrumbs / Back button */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => onNavigateToBlog('')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 cursor-pointer group transition"
              id="btn-back-to-blog"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Blog</span>
            </button>
            <div className="text-[11px] font-bold font-mono tracking-wider uppercase text-neutral-400 bg-neutral-100 dark:bg-zinc-900 px-3 py-1 rounded-full border border-black/[0.04] dark:border-zinc-800">
              Target SEO: <span className="text-[#0071e3] dark:text-sky-400">{activePost.targetKeyword}</span>
            </div>
          </div>

          {/* Cover Header */}
          <div className="space-y-4 pt-4 border-t border-black/[0.05] dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100/30 dark:border-indigo-900/60">
                {activePost.category}
              </span>
              <span className="text-xs text-neutral-400 font-medium">{activePost.date}</span>
              <span className="text-neutral-300 dark:text-zinc-800">•</span>
              <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> {activePost.readTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-neutral-900 dark:text-zinc-50 leading-tight tracking-tight">
              {activePost.title}
            </h1>
            <p className="text-neutral-500 dark:text-zinc-400 text-base sm:text-lg font-light leading-relaxed">
              {activePost.description}
            </p>
          </div>

          {/* Article Main Body */}
          <div className="prose prose-indigo dark:prose-invert max-w-none bg-white dark:bg-zinc-950/30 border border-black/[0.04] dark:border-zinc-800/50 p-6 sm:p-8 rounded-3xl shadow-sm">
            {activePost.content}
          </div>

          {/* Call To Action Box */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden my-8">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-2 text-left z-10">
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase">
                <Sparkles className="w-3 h-3 animate-spin text-amber-300" /> Study companion
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight leading-tight">
                Ready to study smarter?
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-md">
                Paste any YouTube lecture, Zoom recording, or course syllabus PDF and turn it into structured study notes, flashcards, and quizzes in under 60 seconds!
              </p>
            </div>
            <button
              onClick={onLaunchApp}
              className="bg-white text-indigo-700 hover:bg-neutral-50 px-6 py-4 rounded-2xl font-extrabold text-sm sm:text-base transition duration-200 shadow-md flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 group font-sans"
              id="blog-cta-generate"
            >
              <span>🚀 Try Zipytiny for Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </article>
      ) : (
        // --- BLOG LIST VIEW ---
        <div className="space-y-8">
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/30 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span>Zipytiny Learning Blog</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900 dark:text-zinc-50 leading-tight">
              Study Strategies, AI Study Hacks & Guides
            </h1>
            <p className="text-neutral-500 dark:text-zinc-400 text-sm sm:text-base font-light max-w-lg mx-auto">
              Explore evidence-based studying strategies, modern active recall routines, and tutorials to accelerate your revision.
            </p>
          </div>

          {/* Featured Post Banner */}
          <div 
            onClick={() => onNavigateToBlog(blogPosts[0].slug)}
            className="group cursor-pointer bg-white dark:bg-zinc-900/40 border border-black/[0.06] dark:border-zinc-850 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row relative"
            id="featured-blog-card"
          >
            <div className="md:w-1/2 bg-gradient-to-br from-indigo-50 to-indigo-100/30 dark:from-zinc-900 dark:to-zinc-950 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-black/[0.04] dark:border-zinc-800/80">
              <div className="space-y-4">
                <span className="inline-block bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full font-mono">
                  Featured Article
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-zinc-50 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {blogPosts[0].title}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-zinc-400 leading-relaxed font-light">
                  {blogPosts[0].description}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 text-xs text-neutral-400 font-medium">
                <span>{blogPosts[0].date}</span>
                <span>•</span>
                <span>{blogPosts[0].readTime}</span>
              </div>
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-center space-y-4 text-left">
              <h4 className="text-xs font-bold font-mono text-neutral-400 dark:text-zinc-500 uppercase tracking-widest">Key takeaways inside:</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-600 dark:text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-sky-400 mt-0.5 font-bold">✓</span>
                  <span>How transcription errors cost you hours of studying</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-sky-400 mt-0.5 font-bold">✓</span>
                  <span>Three steps to structure video lectures effortlessly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-sky-400 mt-0.5 font-bold">✓</span>
                  <span>Combining structured summaries with digital revision decks</span>
                </li>
              </ul>
              <div className="pt-4">
                <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-extrabold group-hover:translate-x-1 transition-transform">
                  Read Full Guide <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* Grid list of remaining posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.slice(1).map((post, index) => {
              const PostIcon = post.icon;
              return (
                <div
                  key={post.slug}
                  onClick={() => onNavigateToBlog(post.slug)}
                  className="group cursor-pointer bg-white dark:bg-zinc-900/20 hover:bg-white dark:hover:bg-zinc-900/40 border border-black/[0.05] dark:border-zinc-850 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-sm hover:-translate-y-0.5"
                  id={`blog-card-${post.slug}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-indigo-50 dark:bg-zinc-900 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-100/30 dark:border-zinc-800">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readTime}
                      </span>
                    </div>

                    <div className="flex items-start gap-3.5 pt-1 text-left">
                      <div className="p-2.5 bg-indigo-50/50 dark:bg-zinc-900/80 rounded-xl border border-indigo-100/10 dark:border-zinc-800/30 text-indigo-600 dark:text-indigo-400 shrink-0">
                        <PostIcon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-zinc-50 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-zinc-400 line-clamp-2 font-light">
                          {post.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-black/[0.03] dark:border-zinc-800/50">
                    <span className="text-[10px] font-semibold text-neutral-400">{post.date}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      Read Guide <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Schema or SEO Notice */}
          <div className="bg-neutral-50/50 dark:bg-zinc-900/10 border border-black/[0.04] dark:border-zinc-850 p-6 rounded-3xl text-center text-xs text-neutral-400 max-w-2xl mx-auto space-y-1">
            <p className="font-semibold text-neutral-500 dark:text-zinc-400 uppercase tracking-widest text-[9px] mb-2">Organic Study Tools Directory</p>
            <p>
              Looking for more? Browse our indexable study workspaces: <button onClick={onLaunchApp} className="text-[#0071e3] hover:underline cursor-pointer font-semibold">PDF Memorizer</button> • <button onClick={onLaunchApp} className="text-[#0071e3] hover:underline cursor-pointer font-semibold">Lecture Summarizer</button> • <button onClick={onLaunchApp} className="text-[#0071e3] hover:underline cursor-pointer font-semibold">Slides Note Maker</button> • <button onClick={onLaunchApp} className="text-[#0071e3] hover:underline cursor-pointer font-semibold">Quiz Compiler</button>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
