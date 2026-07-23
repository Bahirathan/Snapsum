export interface RouteSeoData {
  title: string;
  description: string;
  keywords?: string;
  canonical: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  prerenderHtml: string;
}

const DOMAIN = 'https://www.zipytiny.app';
const DEFAULT_OG_IMAGE = `${DOMAIN}/og-image.png`;

export const ALL_ROUTES = [
  '/',
  '/blog',
  '/blog/turn-video-lecture-to-study-notes',
  '/blog/ai-tool-make-flashcards-slides',
  '/blog/convert-zoom-recording-quiz',
  '/blog/generate-study-guide-syllabus-pdf',
  '/blog/visual-learners-video-mind-map-generator',
  '/features/mind-maps',
  '/features/flashcards',
  '/features/study-notes',
  '/features/quiz-gen',
  '/features/podcast-gen',
  '/pricing',
  '/faq'
];

export function getRouteSeoData(urlPath: string): RouteSeoData {
  const cleanPath = urlPath.split('?')[0].replace(/\/$/, '') || '/';

  // Shared Organization Schema
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Zipytiny',
    'url': DOMAIN,
    'logo': `${DOMAIN}/icon.png`,
    'sameAs': [
      'https://twitter.com/zipytiny',
      'https://github.com/zipytiny',
      'https://linkedin.com/company/zipytiny'
    ]
  };

  // 0. SHARED PUBLIC ARTIFACT: /s/:id or /share/:id
  if (cleanPath.startsWith('/s/') || cleanPath.startsWith('/share/')) {
    const shareId = cleanPath.split('/')[2] || 'public-guide';
    const formattedTitle = shareId !== 'public-guide' 
      ? `Shared Study Workspace: ${shareId.replace(/[-_]/g, ' ')} | Zipytiny`
      : 'Shared AI Study Guide & Active Recall Deck | Zipytiny';

    return {
      title: formattedTitle,
      description: 'View this interactive study guide powered by Zipytiny. Features timestamped video summaries, key takeaways, flashcards, and concept mind maps.',
      keywords: 'shared study guide, public lecture notes, ai flashcards, active recall deck, zipytiny share',
      canonical: `${DOMAIN}${cleanPath}`,
      ogType: 'article',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          'name': formattedTitle,
          'description': 'Interactive study guide with video summaries, active recall flashcards, and concept mind maps.',
          'publisher': orgSchema
        }
      ],
      prerenderHtml: `
        <main style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #111; line-height: 1.7;">
          <div style="padding: 16px 20px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; border-radius: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <span style="font-size: 0.8rem; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; opacity: 0.9;">Shared Public Study Deck</span>
              <p style="margin: 4px 0 0; font-size: 1rem; font-weight: 600;">✨ Created with Zipytiny — Turn YouTube videos into flashcards & notes in 10s</p>
            </div>
            <a href="/" style="padding: 10px 20px; background: white; color: #4f46e5; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 0.9rem;">Summarize Your Own Video Free →</a>
          </div>

          <article style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;">
            <h1 style="font-size: 2rem; color: #0f172a; margin-top: 0;">Shared Lecture Notes & Active Recall Workspace</h1>
            <p style="color: #64748b; font-size: 1rem;">This interactive study workspace was shared via Zipytiny. Explore the executive summary, key takeaways, and flashcard recall deck below.</p>
            
            <div style="margin-top: 24px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9;">
              <h2 style="font-size: 1.25rem; margin-top: 0; color: #334155;">Executive Summary & Key Takeaways</h2>
              <p style="color: #475569;">Extracting key concepts, formulas, and structural takeaways for rapid review and exam preparation...</p>
            </div>

            <div style="margin-top: 32px; text-align: center;">
              <a href="/" style="display: inline-block; padding: 14px 32px; background: #4f46e5; color: white; font-weight: 700; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 14px rgba(79,70,229,0.3);">
                Open Full Interactive Workspace →
              </a>
            </div>
          </article>
        </main>
      `
    };
  }

  // 1. BLOG POST: turn-video-lecture-to-study-notes
  if (cleanPath === '/blog/turn-video-lecture-to-study-notes') {
    return {
      title: 'How to Turn a 2-Hour Video Lecture into 5-Minute Study Notes | Zipytiny Blog',
      description: 'Learn how active recall, spaced repetition, and AI video distillation help postgrad students summarize YouTube lectures effortlessly.',
      keywords: 'turn video to study notes, youtube video summarizer, lecture note taker, active recall, zipytiny',
      canonical: `${DOMAIN}/blog/turn-video-lecture-to-study-notes`,
      ogType: 'article',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': 'How to Turn a 2-Hour Video Lecture into 5-Minute Study Notes',
          'description': 'Learn how active recall, spaced repetition, and AI video distillation help postgrad students summarize YouTube lectures effortlessly.',
          'author': orgSchema,
          'publisher': orgSchema,
          'datePublished': '2026-07-20',
          'dateModified': '2026-07-20',
          'mainEntityOfPage': `${DOMAIN}/blog/turn-video-lecture-to-study-notes`
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${DOMAIN}/blog` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Turn Video Lecture to Study Notes', 'item': `${DOMAIN}/blog/turn-video-lecture-to-study-notes` }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          'name': 'How to Turn a 2-Hour Video Lecture into 5-Minute Study Notes',
          'description': 'Step-by-step workflow to convert long YouTube video lectures into active recall notes.',
          'step': [
            {
              '@type': 'HowToStep',
              'name': 'Extract Transcripts and Timestamps',
              'text': 'Automate transcript extraction with timestamp links for key lecture shifts.'
            },
            {
              '@type': 'HowToStep',
              'name': 'Apply Active Recall & Flashcards',
              'text': 'Convert key definitions and core formulas into double-sided Q&A flashcards.'
            },
            {
              '@type': 'HowToStep',
              'name': 'Generate Visual Mind Maps',
              'text': 'Connect complex topics in visual node graphs for maximum long-term memory retention.'
            }
          ]
        }
      ],
      prerenderHtml: `
        <article style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;">
            <a href="/" style="color: #4f46e5; text-decoration: none;">Home</a> &gt; 
            <a href="/blog" style="color: #4f46e5; text-decoration: none;">Blog</a> &gt; 
            <span style="color: #666;">Turn Video Lecture into Study Notes</span>
          </nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">How to Turn a 2-Hour Video Lecture into 5-Minute Study Notes</h1>
          <p style="color: #666; font-size: 0.9rem;">Published July 20, 2026 • 6 min read • Category: Study Hacks & AI</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 1.1rem; font-weight: 500; color: #444;">
            As postgrad students and medical researchers know, watching hours of lecture videos is one of the most time-consuming parts of modern education. However, passive watching leads to poor long-term retention. Here is how to turn long videos into actionable study notes in minutes.
          </p>
          <h2 style="font-size: 1.5rem; margin-top: 30px; color: #111;">Step 1: Extract Core Transcripts and Key Timestamps</h2>
          <p>
            Instead of re-watching the entire video, use automated transcript extraction with high-precision time-stamping. Identifying key conceptual shifts allows you to navigate straight to critical formulas, diagrams, and professor emphasis points.
          </p>
          <h2 style="font-size: 1.5rem; margin-top: 30px; color: #111;">Step 2: Apply Active Recall & Spaced Repetition</h2>
          <p>
            Don't just read passive text summaries. Convert key definitions and concepts into Q&A flashcards immediately. Testing your memory right after reviewing notes increases retention by over 300% compared to passive re-reading.
          </p>
          <h2 style="font-size: 1.5rem; margin-top: 30px; color: #111;">Step 3: Generate Visual Concept Maps</h2>
          <p>
            Connecting hierarchical concepts visually through node-based mind maps helps integrate new information into existing mental schemas. Zipytiny automates this process from any YouTube URL.
          </p>
          <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-radius: 12px; text-align: center;">
            <h3 style="margin-top: 0; color: #111;">Ready to Summarize Your First Video?</h3>
            <p style="color: #555;">Try Zipytiny for free and convert YouTube videos into flashcards, quizzes, and mind maps instantly.</p>
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Create Free AI Workspace →</a>
          </div>
        </article>
      `
    };
  }

  // 2. BLOG POST: ai-tool-make-flashcards-slides
  if (cleanPath === '/blog/ai-tool-make-flashcards-slides') {
    return {
      title: 'Top AI Tools to Turn Video Slides into Interactive Flashcards in 2026 | Zipytiny Blog',
      description: 'Discover how automated flashcard generation from slide decks and lecture videos speeds up memory retention and Anki export.',
      keywords: 'video to flashcards, slides to flashcards, ai flashcard generator, anki export, zipytiny',
      canonical: `${DOMAIN}/blog/ai-tool-make-flashcards-slides`,
      ogType: 'article',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': 'Top AI Tools to Turn Video Slides into Interactive Flashcards in 2026',
          'description': 'Discover how automated flashcard generation from slide decks and lecture videos speeds up memory retention and Anki export.',
          'author': orgSchema,
          'publisher': orgSchema,
          'datePublished': '2026-07-18',
          'dateModified': '2026-07-18',
          'mainEntityOfPage': `${DOMAIN}/blog/ai-tool-make-flashcards-slides`
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${DOMAIN}/blog` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Turn Video Slides into Flashcards', 'item': `${DOMAIN}/blog/ai-tool-make-flashcards-slides` }
          ]
        }
      ],
      prerenderHtml: `
        <article style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;">
            <a href="/" style="color: #4f46e5; text-decoration: none;">Home</a> &gt; 
            <a href="/blog" style="color: #4f46e5; text-decoration: none;">Blog</a> &gt; 
            <span style="color: #666;">AI Tools for Flashcards & Slides</span>
          </nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">Top AI Tools to Turn Video Slides into Interactive Flashcards in 2026</h1>
          <p style="color: #666; font-size: 0.9rem;">Published July 18, 2026 • 5 min read • Category: Active Recall</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 1.1rem; font-weight: 500; color: #444;">
            Flashcards are the gold standard for active recall. In 2026, AI tools can parse PowerPoint slides, PDF lecture notes, and YouTube video presentation recordings to automatically draft double-sided flashcards ready for Anki or digital testing.
          </p>
          <h2 style="font-size: 1.5rem; margin-top: 30px; color: #111;">Why Manual Flashcard Creation is Outdated</h2>
          <p>Spending 3 hours typing up flashcards leaves little energy for actual studying. AI flashcard engines analyze key terms, definitions, and formulas directly from source slides and auto-generate clean question-answer pairs.</p>
          <h2 style="font-size: 1.5rem; margin-top: 30px; color: #111;">Seamless Export to Anki, Quizlet & CSV</h2>
          <p>Look for tools like Zipytiny that support one-click exports into CSV and Anki deck formats, making spaced repetition effortless across mobile and desktop devices.</p>
          <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-radius: 12px; text-align: center;">
            <a href="/features/flashcards" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Explore AI Flashcard Feature →</a>
          </div>
        </article>
      `
    };
  }

  // 3. BLOG POST: convert-zoom-recording-quiz
  if (cleanPath === '/blog/convert-zoom-recording-quiz') {
    return {
      title: 'How to Convert Zoom & Teams Recorded Lectures into Practice Quizzes | Zipytiny Blog',
      description: 'Turn recorded webinars, Zoom meetings, and Teams lectures into interactive multiple-choice practice quizzes automatically.',
      keywords: 'zoom recording to quiz, teams lecture quiz generator, video practice test, zipytiny',
      canonical: `${DOMAIN}/blog/convert-zoom-recording-quiz`,
      ogType: 'article',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': 'How to Convert Zoom & Teams Recorded Lectures into Practice Quizzes',
          'description': 'Turn recorded webinars, Zoom meetings, and Teams lectures into interactive multiple-choice practice quizzes automatically.',
          'author': orgSchema,
          'publisher': orgSchema,
          'datePublished': '2026-07-15',
          'dateModified': '2026-07-15',
          'mainEntityOfPage': `${DOMAIN}/blog/convert-zoom-recording-quiz`
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${DOMAIN}/blog` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Convert Zoom Recording to Quiz', 'item': `${DOMAIN}/blog/convert-zoom-recording-quiz` }
          ]
        }
      ],
      prerenderHtml: `
        <article style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;">
            <a href="/" style="color: #4f46e5; text-decoration: none;">Home</a> &gt; 
            <a href="/blog" style="color: #4f46e5; text-decoration: none;">Blog</a> &gt; 
            <span style="color: #666;">Convert Zoom Recordings to Quizzes</span>
          </nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">How to Convert Zoom & Teams Recorded Lectures into Practice Quizzes</h1>
          <p style="color: #666; font-size: 0.9rem;">Published July 15, 2026 • 5 min read • Category: Exam Prep</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 1.1rem; font-weight: 500; color: #444;">
            Testing yourself with practice questions is scientifically proven to be the most effective study technique for university exams. Learn how to convert any Zoom cloud recording or MP4 lecture file into instant practice quizzes.
          </p>
          <h2 style="font-size: 1.5rem; margin-top: 30px; color: #111;">Interactive Grading & Explanation Feedback</h2>
          <p>Zipytiny generates realistic multiple-choice and short-answer questions accompanied by thorough explanations referencing the exact timestamp in the recorded lecture video.</p>
          <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-radius: 12px; text-align: center;">
            <a href="/features/quiz-gen" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Try AI Quiz Generator →</a>
          </div>
        </article>
      `
    };
  }

  // 4. BLOG POST: generate-study-guide-syllabus-pdf
  if (cleanPath === '/blog/generate-study-guide-syllabus-pdf') {
    return {
      title: 'Automated Study Guide Generation from Course Syllabi & Video Series | Zipytiny Blog',
      description: 'Learn how to combine multi-video lecture playlists and PDF syllabi into structured, exam-ready study guides.',
      keywords: 'study guide generator, syllabus pdf summarizer, video playlist summary, zipytiny',
      canonical: `${DOMAIN}/blog/generate-study-guide-syllabus-pdf`,
      ogType: 'article',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': 'Automated Study Guide Generation from Course Syllabi & Video Series',
          'description': 'Learn how to combine multi-video lecture playlists and PDF syllabi into structured, exam-ready study guides.',
          'author': orgSchema,
          'publisher': orgSchema,
          'datePublished': '2026-07-12',
          'dateModified': '2026-07-12',
          'mainEntityOfPage': `${DOMAIN}/blog/generate-study-guide-syllabus-pdf`
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${DOMAIN}/blog` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Generate Study Guide from Syllabus & Videos', 'item': `${DOMAIN}/blog/generate-study-guide-syllabus-pdf` }
          ]
        }
      ],
      prerenderHtml: `
        <article style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;">
            <a href="/" style="color: #4f46e5; text-decoration: none;">Home</a> &gt; 
            <a href="/blog" style="color: #4f46e5; text-decoration: none;">Blog</a> &gt; 
            <span style="color: #666;">Study Guide Generation</span>
          </nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">Automated Study Guide Generation from Course Syllabi & Video Series</h1>
          <p style="color: #666; font-size: 0.9rem;">Published July 12, 2026 • 6 min read • Category: Workflow</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 1.1rem; font-weight: 500; color: #444;">
            Consolidating an entire semester of course lectures, reading PDFs, and slides into a single master study guide is a daunting task. Here is how AI workspace automation turns disparate sources into unified study guides.
          </p>
          <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-radius: 12px; text-align: center;">
            <a href="/features/study-notes" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Explore Study Notes Generator →</a>
          </div>
        </article>
      `
    };
  }

  // 5. BLOG POST: visual-learners-video-mind-map-generator
  if (cleanPath === '/blog/visual-learners-video-mind-map-generator') {
    return {
      title: 'Why Visual Learners Retention Soars with AI Video Mind Maps | Zipytiny Blog',
      description: 'Explore concept mapping and visual node connections for video lectures to boost recall and comprehension.',
      keywords: 'mind map generator, video mind map, visual study tool, concept mapping ai, zipytiny',
      canonical: `${DOMAIN}/blog/visual-learners-video-mind-map-generator`,
      ogType: 'article',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': 'Why Visual Learners Retention Soars with AI Video Mind Maps',
          'description': 'Explore concept mapping and visual node connections for video lectures to boost recall and comprehension.',
          'author': orgSchema,
          'publisher': orgSchema,
          'datePublished': '2026-07-10',
          'dateModified': '2026-07-10',
          'mainEntityOfPage': `${DOMAIN}/blog/visual-learners-video-mind-map-generator`
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${DOMAIN}/blog` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Visual Learners Video Mind Maps', 'item': `${DOMAIN}/blog/visual-learners-video-mind-map-generator` }
          ]
        }
      ],
      prerenderHtml: `
        <article style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;">
            <a href="/" style="color: #4f46e5; text-decoration: none;">Home</a> &gt; 
            <a href="/blog" style="color: #4f46e5; text-decoration: none;">Blog</a> &gt; 
            <span style="color: #666;">Visual Learners & Mind Maps</span>
          </nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">Why Visual Learners Retention Soars with AI Video Mind Maps</h1>
          <p style="color: #666; font-size: 0.9rem;">Published July 10, 2026 • 4 min read • Category: Visual Learning</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 1.1rem; font-weight: 500; color: #444;">
            For over 65% of students, visual hierarchy is crucial for understanding complex topics like biochemistry, law, software architecture, and finance.
          </p>
          <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-radius: 12px; text-align: center;">
            <a href="/features/mind-maps" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Try AI Mind Map Generator →</a>
          </div>
        </article>
      `
    };
  }

  // 6. BLOG HUB: /blog
  if (cleanPath === '/blog') {
    return {
      title: 'Zipytiny Blog - AI Video Summarization & Active Recall Strategies',
      description: 'Explore expert articles on active recall, spaced repetition, turning video lectures into study notes, and AI-powered flashcard generation.',
      keywords: 'ai study blog, video summarization guides, active recall study hacks, zipytiny blog',
      canonical: `${DOMAIN}/blog`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          'name': 'Zipytiny Learning & AI Summarization Blog',
          'url': `${DOMAIN}/blog`,
          'description': 'Guides, study hacks, active recall techniques, and AI video summarization tutorials for students and professionals.'
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${DOMAIN}/blog` }
          ]
        }
      ],
      prerenderHtml: `
        <main style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Home</a></nav>
          <h1 style="font-size: 2.5rem; margin-top: 10px; color: #111;">Zipytiny AI Study & Learning Blog</h1>
          <p style="font-size: 1.1rem; color: #666; margin-bottom: 30px;">Actionable strategies for active recall, video distillation, spaced repetition, and exam prep.</p>
          
          <div style="display: grid; gap: 24px;">
            <article style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;">
              <h2 style="margin-top: 0; font-size: 1.3rem;"><a href="/blog/turn-video-lecture-to-study-notes" style="color: #4f46e5; text-decoration: none;">How to Turn a 2-Hour Video Lecture into 5-Minute Study Notes</a></h2>
              <p style="color: #555; font-size: 0.95rem;">Learn how active recall, spaced repetition, and AI video distillation help postgrad students summarize YouTube lectures effortlessly.</p>
              <a href="/blog/turn-video-lecture-to-study-notes" style="color: #4f46e5; font-weight: bold; font-size: 0.9rem;">Read Full Guide →</a>
            </article>

            <article style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;">
              <h2 style="margin-top: 0; font-size: 1.3rem;"><a href="/blog/ai-tool-make-flashcards-slides" style="color: #4f46e5; text-decoration: none;">Top AI Tools to Turn Video Slides into Interactive Flashcards in 2026</a></h2>
              <p style="color: #555; font-size: 0.95rem;">Discover how automated flashcard generation from slide decks and lecture videos speeds up memory retention and Anki export.</p>
              <a href="/blog/ai-tool-make-flashcards-slides" style="color: #4f46e5; font-weight: bold; font-size: 0.9rem;">Read Full Guide →</a>
            </article>

            <article style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;">
              <h2 style="margin-top: 0; font-size: 1.3rem;"><a href="/blog/convert-zoom-recording-quiz" style="color: #4f46e5; text-decoration: none;">How to Convert Zoom & Teams Recorded Lectures into Practice Quizzes</a></h2>
              <p style="color: #555; font-size: 0.95rem;">Turn recorded webinars, Zoom meetings, and Teams lectures into interactive multiple-choice practice quizzes automatically.</p>
              <a href="/blog/convert-zoom-recording-quiz" style="color: #4f46e5; font-weight: bold; font-size: 0.9rem;">Read Full Guide →</a>
            </article>

            <article style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;">
              <h2 style="margin-top: 0; font-size: 1.3rem;"><a href="/blog/generate-study-guide-syllabus-pdf" style="color: #4f46e5; text-decoration: none;">Automated Study Guide Generation from Course Syllabi & Video Series</a></h2>
              <p style="color: #555; font-size: 0.95rem;">Learn how to combine multi-video lecture playlists and PDF syllabi into structured, exam-ready study guides.</p>
              <a href="/blog/generate-study-guide-syllabus-pdf" style="color: #4f46e5; font-weight: bold; font-size: 0.9rem;">Read Full Guide →</a>
            </article>

            <article style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;">
              <h2 style="margin-top: 0; font-size: 1.3rem;"><a href="/blog/visual-learners-video-mind-map-generator" style="color: #4f46e5; text-decoration: none;">Why Visual Learners Retention Soars with AI Video Mind Maps</a></h2>
              <p style="color: #555; font-size: 0.95rem;">Explore concept mapping and visual node connections for video lectures to boost recall and comprehension.</p>
              <a href="/blog/visual-learners-video-mind-map-generator" style="color: #4f46e5; font-weight: bold; font-size: 0.9rem;">Read Full Guide →</a>
            </article>
          </div>
        </main>
      `
    };
  }

  // 7. FEATURES: /features/mind-maps
  if (cleanPath === '/features/mind-maps') {
    return {
      title: 'AI Mind Map Generator from YouTube Videos & Notes | Zipytiny',
      description: 'Automatically convert lecture videos into structured, interactive visual mind maps and concept trees in seconds.',
      keywords: 'video mind map generator, youtube concept map, visual study tool, ai mindmap, zipytiny',
      canonical: `${DOMAIN}/features/mind-maps`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Features', 'item': `${DOMAIN}/features` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Mind Maps', 'item': `${DOMAIN}/features/mind-maps` }
          ]
        }
      ],
      prerenderHtml: `
        <main style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Home</a></nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">AI Mind Map Generator from Video & Documents</h1>
          <p style="font-size: 1.1rem; color: #555;">Transform long YouTube videos, PDFs, and slide decks into visual node graphs and hierarchical concept maps instantly.</p>
          <div style="margin-top: 30px;">
            <h2>Key Feature Highlights</h2>
            <ul>
              <li>Automatic node connection based on video timestamps and topics</li>
              <li>Expandable and collapsible concept branches</li>
              <li>Export to PNG, SVG, and interactive markdown</li>
            </ul>
          </div>
          <div style="margin-top: 40px; text-align: center;">
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Generate Mind Map Free →</a>
          </div>
        </main>
      `
    };
  }

  // 8. FEATURES: /features/flashcards
  if (cleanPath === '/features/flashcards') {
    return {
      title: 'AI Flashcard Generator with Spaced Repetition | Zipytiny',
      description: 'Generate active recall flashcard decks from YouTube videos, PDFs, and slide decks instantly.',
      keywords: 'ai flashcard generator, video to flashcards, anki deck generator, spaced repetition, zipytiny',
      canonical: `${DOMAIN}/features/flashcards`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Features', 'item': `${DOMAIN}/features` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Flashcards', 'item': `${DOMAIN}/features/flashcards` }
          ]
        }
      ],
      prerenderHtml: `
        <main style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Home</a></nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">Automated AI Flashcard Deck Generator</h1>
          <p style="font-size: 1.1rem; color: #555;">Turn video lectures and reading material into interactive flashcard decks optimized for active recall testing.</p>
          <div style="margin-top: 40px; text-align: center;">
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Create Flashcards Now →</a>
          </div>
        </main>
      `
    };
  }

  // 9. FEATURES: /features/study-notes
  if (cleanPath === '/features/study-notes') {
    return {
      title: 'AI Video Note Taker & Timestamped Summarizer | Zipytiny',
      description: 'Extract timestamped bullet points, executive summaries, and action items from any video lecture.',
      keywords: 'ai video note taker, timestamped video summary, lecture note summarizer, zipytiny',
      canonical: `${DOMAIN}/features/study-notes`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Features', 'item': `${DOMAIN}/features` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Study Notes', 'item': `${DOMAIN}/features/study-notes` }
          ]
        }
      ],
      prerenderHtml: `
        <main style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Home</a></nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">AI Timestamped Video Note Taker</h1>
          <p style="font-size: 1.1rem; color: #555;">Get detailed bullet points, key takeaways, and timestamp links for every major concept in a video.</p>
          <div style="margin-top: 40px; text-align: center;">
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Generate Study Notes Free →</a>
          </div>
        </main>
      `
    };
  }

  // 10. FEATURES: /features/quiz-gen
  if (cleanPath === '/features/quiz-gen') {
    return {
      title: 'AI Quiz Generator from Video & PDF | Zipytiny',
      description: 'Create multiple-choice quizzes and active recall practice tests from lecture content.',
      keywords: 'ai quiz generator, video to quiz, practice test creator, active recall exam prep, zipytiny',
      canonical: `${DOMAIN}/features/quiz-gen`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Features', 'item': `${DOMAIN}/features` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Quiz Generator', 'item': `${DOMAIN}/features/quiz-gen` }
          ]
        }
      ],
      prerenderHtml: `
        <main style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Home</a></nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">Instant Practice Quiz Generator</h1>
          <p style="font-size: 1.1rem; color: #555;">Test your knowledge with automatically generated multiple-choice and short answer questions from any video or PDF.</p>
          <div style="margin-top: 40px; text-align: center;">
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Generate Quiz Now →</a>
          </div>
        </main>
      `
    };
  }

  // 11. FEATURES: /features/podcast-gen
  if (cleanPath === '/features/podcast-gen') {
    return {
      title: 'Convert Video Lectures into AI Audio Podcasts | Zipytiny',
      description: 'Listen to AI-synthesized audio summaries and podcast dialogues from your study materials on the go.',
      keywords: 'video to podcast, ai audio summary, lecture dialogue generator, study podcast, zipytiny',
      canonical: `${DOMAIN}/features/podcast-gen`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Features', 'item': `${DOMAIN}/features` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Podcast Generator', 'item': `${DOMAIN}/features/podcast-gen` }
          ]
        }
      ],
      prerenderHtml: `
        <main style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Home</a></nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">Convert Videos & Notes into AI Audio Podcasts</h1>
          <p style="font-size: 1.1rem; color: #555;">Listen to engaging two-person conversational audio overviews during commutes or workouts.</p>
          <div style="margin-top: 40px; text-align: center;">
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Listen to AI Podcast Demo →</a>
          </div>
        </main>
      `
    };
  }

  // 12. PRICING: /pricing
  if (cleanPath === '/pricing') {
    return {
      title: 'Zipytiny Pricing & Workspace Plans - Free to Start',
      description: 'Compare Zipytiny Free, Pro ($12/mo), and Enterprise plans. Start summarizing YouTube videos, PDFs, and slide decks today.',
      keywords: 'zipytiny pricing, free youtube summarizer, pro study suite, Enterprise AI notes',
      canonical: `${DOMAIN}/pricing`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Pricing', 'item': `${DOMAIN}/pricing` }
          ]
        }
      ],
      prerenderHtml: `
        <main style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Home</a></nav>
          <h1 style="font-size: 2.5rem; margin-top: 10px; color: #111;">Simple, Transparent Pricing for Students & Teams</h1>
          <p style="font-size: 1.1rem; color: #666;">Choose the workspace plan that fits your study schedule.</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-top: 30px;">
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; background: #fff;">
              <h2 style="margin-top:0;">Free Tier</h2>
              <p style="font-size: 1.8rem; font-weight: bold;">$0 <span style="font-size: 1rem; color: #666;">/ forever</span></p>
              <p>Ideal for casual learners & quick summaries.</p>
              <ul>
                <li>3 Video Summaries / week</li>
                <li>Flashcards & Practice Quizzes</li>
                <li>Standard Speed Processing</li>
              </ul>
              <a href="/" style="display: block; text-align:center; padding: 10px; background: #111; color: white; border-radius: 6px; text-decoration:none; margin-top: 20px;">Start Free</a>
            </div>

            <div style="border: 2px solid #4f46e5; border-radius: 12px; padding: 24px; background: #fafafa;">
              <h2 style="margin-top:0; color: #4f46e5;">Pro Plan</h2>
              <p style="font-size: 1.8rem; font-weight: bold;">$12 <span style="font-size: 1rem; color: #666;">/ month</span></p>
              <p>For postgrads, medical/law students, & creators.</p>
              <ul>
                <li>Unlimited Video & PDF Uploads</li>
                <li>Mind Maps & Quiz Generator</li>
                <li>PowerPoint & Anki Deck Exports</li>
                <li>High-speed Gemini Flash Engine</li>
              </ul>
              <a href="/" style="display: block; text-align:center; padding: 10px; background: #4f46e5; color: white; border-radius: 6px; text-decoration:none; margin-top: 20px;">Upgrade to Pro</a>
            </div>
          </div>
        </main>
      `
    };
  }

  // 13. FAQ: /faq
  if (cleanPath === '/faq') {
    return {
      title: 'Frequently Asked Questions - Zipytiny AI Study Suite',
      description: 'Get answers regarding video length limits, supported languages, privacy, HIPAA/SOC2 compliance, and export options.',
      keywords: 'zipytiny faq, youtube summarizer limits, privacy SOC2, video summary questions',
      canonical: `${DOMAIN}/faq`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'Is Zipytiny free to use?',
              'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes! Zipytiny offers a free workspace plan with standard video summarization and active recall tools.' }
            },
            {
              '@type': 'Question',
              'name': 'What video sources are supported?',
              'acceptedAnswer': { '@type': 'Answer', 'text': 'Zipytiny supports YouTube URLs, Vimeo, local MP4 video uploads, Zoom cloud recordings, and PDF documents.' }
            }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'FAQ', 'item': `${DOMAIN}/faq` }
          ]
        }
      ],
      prerenderHtml: `
        <main style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Home</a></nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">Frequently Asked Questions</h1>
          <dl style="margin-top: 30px;">
            <dt style="font-size: 1.2rem; font-weight: bold; color: #111; margin-top: 20px;">Is Zipytiny free to use?</dt>
            <dd style="color: #555; margin-left: 0; margin-top: 5px;">Yes! Zipytiny offers a free workspace plan with standard video summarization, active recall flashcards, and note generation.</dd>
            
            <dt style="font-size: 1.2rem; font-weight: bold; color: #111; margin-top: 20px;">What file and video formats are supported?</dt>
            <dd style="color: #555; margin-left: 0; margin-top: 5px;">Zipytiny accepts YouTube links, local MP4/WebM videos, PDF documents, PowerPoint slide decks, and plain text notes.</dd>
          </dl>
        </main>
      `
    };
  }

  // DEFAULT / LANDING PAGE: '/'
  return {
    title: 'Zipytiny – AI Study Notes from Video, PDF, Slides & Articles',
    description: 'Turn any YouTube video, PDF, slide deck, article, or note into AI-generated summaries, key concepts, flashcards, mind maps, and quizzes in seconds. Free to start.',
    keywords: 'pdf summarizer, youtube summarizer, slides summary, document to flashcards, ai study guide, video to quiz, mindmap generator, active recall workspace, zipytiny',
    canonical: `${DOMAIN}/`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Zipytiny',
        'url': `${DOMAIN}/`,
        'operatingSystem': 'All',
        'applicationCategory': 'EducationalApplication, ProductivityApplication',
        'description': 'Universal AI-powered video summarizer and interactive recall workspace.',
        'offers': [
          { '@type': 'Offer', 'name': 'Free Workspace Plan', 'price': '0.00', 'priceCurrency': 'USD' },
          { '@type': 'Offer', 'name': 'Pro Plan', 'price': '12.00', 'priceCurrency': 'USD' }
        ]
      },
      orgSchema
    ],
    prerenderHtml: `
      <div style="max-width: 1100px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #111; line-height: 1.6;">
        <header style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 2.8rem; font-weight: 800; letter-spacing: -0.02em; color: #0f172a; margin-bottom: 12px;">
            Zipytiny: Universal AI Video Summarizer & Study Suite
          </h1>
          <p style="font-size: 1.25rem; color: #475569; max-width: 780px; margin: 0 auto 24px;">
            Convert multi-source YouTube videos, recorded lectures, PDFs, and slide decks into interactive active recall systems, mind maps, flashcards, and quizzes in seconds.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="/" style="padding: 12px 28px; background: #4f46e5; color: white; border-radius: 9999px; font-weight: 700; text-decoration: none;">Get Started Free Now →</a>
            <a href="/pricing" style="padding: 12px 24px; background: #f1f5f9; color: #334155; border-radius: 9999px; font-weight: 600; text-decoration: none;">View Workspace Pricing</a>
          </div>
        </header>

        <section style="margin: 50px 0;">
          <h2 style="font-size: 1.8rem; text-align: center; margin-bottom: 30px;">Core AI Study Modules</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.25rem;"><a href="/features/mind-maps" style="color: #4f46e5; text-decoration: none;">Visual Mind Maps</a></h3>
              <p style="color: #64748b; font-size: 0.95rem;">Interactive concept node hierarchy generated directly from video timestamps.</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.25rem;"><a href="/features/flashcards" style="color: #4f46e5; text-decoration: none;">Active Recall Flashcards</a></h3>
              <p style="color: #64748b; font-size: 0.95rem;">Spaced repetition digital decks with double-sided testing and Anki export.</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.25rem;"><a href="/features/study-notes" style="color: #4f46e5; text-decoration: none;">Timestamped Notes</a></h3>
              <p style="color: #64748b; font-size: 0.95rem;">Structured executive bullet points linked to exact video moments.</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.25rem;"><a href="/features/quiz-gen" style="color: #4f46e5; text-decoration: none;">Practice Quizzes</a></h3>
              <p style="color: #64748b; font-size: 0.95rem;">Multiple-choice and exam practice tests with real-time feedback.</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.25rem;"><a href="/features/podcast-gen" style="color: #4f46e5; text-decoration: none;">Audio Podcasts</a></h3>
              <p style="color: #64748b; font-size: 0.95rem;">AI-generated conversational audio overviews for commute learning.</p>
            </div>
          </div>
        </section>

        <section style="margin: 50px 0; padding: 30px; background: #0f172a; color: white; border-radius: 16px;">
          <h2 style="margin-top: 0; font-size: 1.8rem; color: white;">Latest Learning & AI Strategy Guides</h2>
          <ul style="list-style: none; padding: 0; display: grid; gap: 16px; margin-top: 20px;">
            <li><a href="/blog/turn-video-lecture-to-study-notes" style="color: #818cf8; font-weight: 600; text-decoration: none; font-size: 1.1rem;">• How to Turn a 2-Hour Video Lecture into 5-Minute Study Notes →</a></li>
            <li><a href="/blog/ai-tool-make-flashcards-slides" style="color: #818cf8; font-weight: 600; text-decoration: none; font-size: 1.1rem;">• Top AI Tools to Turn Video Slides into Interactive Flashcards in 2026 →</a></li>
            <li><a href="/blog/convert-zoom-recording-quiz" style="color: #818cf8; font-weight: 600; text-decoration: none; font-size: 1.1rem;">• How to Convert Zoom & Teams Recorded Lectures into Practice Quizzes →</a></li>
            <li><a href="/blog/generate-study-guide-syllabus-pdf" style="color: #818cf8; font-weight: 600; text-decoration: none; font-size: 1.1rem;">• Automated Study Guide Generation from Course Syllabi & Video Series →</a></li>
            <li><a href="/blog/visual-learners-video-mind-map-generator" style="color: #818cf8; font-weight: 600; text-decoration: none; font-size: 1.1rem;">• Why Visual Learners Retention Soars with AI Video Mind Maps →</a></li>
          </ul>
        </section>
      </div>
    `
  };
}

export function injectSeoIntoHtmlTemplate(htmlTemplate: string, seoData: RouteSeoData): string {
  let output = htmlTemplate;

  // Replace Title
  output = output.replace(/<title>.*?<\/title>/s, `<title>${seoData.title}</title>`);

  // Replace Description
  if (seoData.description) {
    output = output.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/s,
      `<meta name="description" content="${seoData.description.replace(/"/g, '&quot;')}" />`
    );
  }

  // Replace Keywords
  if (seoData.keywords) {
    output = output.replace(
      /<meta\s+name="keywords"\s+content=".*?"\s*\/?>/s,
      `<meta name="keywords" content="${seoData.keywords.replace(/"/g, '&quot;')}" />`
    );
  }

  // Replace Canonical Link
  if (seoData.canonical) {
    output = output.replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/s,
      `<link rel="canonical" href="${seoData.canonical}" />`
    );
  }

  // Replace OpenGraph title, description, url, image
  output = output.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/s,
    `<meta property="og:title" content="${seoData.title.replace(/"/g, '&quot;')}" />`
  );
  output = output.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/s,
    `<meta property="og:description" content="${seoData.description.replace(/"/g, '&quot;')}" />`
  );
  output = output.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/s,
    `<meta property="og:url" content="${seoData.canonical}" />`
  );
  if (seoData.ogImage) {
    output = output.replace(
      /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/s,
      `<meta property="og:image" content="${seoData.ogImage}" />`
    );
  }

  // Replace Twitter title, description, url, image
  output = output.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/s,
    `<meta name="twitter:title" content="${seoData.title.replace(/"/g, '&quot;')}" />`
  );
  output = output.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/s,
    `<meta name="twitter:description" content="${seoData.description.replace(/"/g, '&quot;')}" />`
  );
  output = output.replace(
    /<meta\s+name="twitter:url"\s+content=".*?"\s*\/?>/s,
    `<meta name="twitter:url" content="${seoData.canonical}" />`
  );
  if (seoData.ogImage) {
    output = output.replace(
      /<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/s,
      `<meta name="twitter:image" content="${seoData.ogImage}" />`
    );
  }

  // Inject or replace JSON-LD if present
  if (seoData.jsonLd) {
    const jsonLdString = JSON.stringify(seoData.jsonLd, null, 2);
    if (output.includes('application/ld+json')) {
      output = output.replace(
        /<script\s+type="application\/ld\+json">.*?<\/script>/s,
        `<script type="application/ld+json">\n${jsonLdString}\n    </script>`
      );
    }
  }

  // Inject prerender HTML into #seo-prerender
  if (output.includes('id="seo-prerender"')) {
    output = output.replace(
      /<div\s+id="seo-prerender"[^>]*>[\s\S]*?<!--\s*END_SEO_PRERENDER\s*-->/s,
      `<div id="seo-prerender">${seoData.prerenderHtml}</div><!-- END_SEO_PRERENDER -->`
    );
  }

  return output;
}
