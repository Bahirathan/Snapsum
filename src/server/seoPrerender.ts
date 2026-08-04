import { FREE_PLAN_PRICE, PRO_PLAN_MONTHLY_PRICE, ENTERPRISE_PLAN_MONTHLY_PRICE, PRICING_CONFIG } from '../config/pricing.config';

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

const DOMAIN = 'https://zipytiny.app';
const DEFAULT_OG_IMAGE = `${DOMAIN}/og-image.png`;

export const ALL_ROUTES = [
  '/',
  '/blog',
  '/blog/best-ai-tools-video-lecture-meeting-notes',
  '/blog/why-i-built-zipytiny',
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
  '/features/meeting-notes',
  '/features/action-items',
  '/features/presentation-export',
  '/features/executive-summaries',
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
      'https://linkedin.com/company/zipytiny',
      'https://www.producthunt.com/products/zipytiny'
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

  // 1. BLOG POST: why-i-built-zipytiny
  if (cleanPath === '/blog/why-i-built-zipytiny') {
    return {
      title: 'Turn Any Video, PDF, or Lecture Into Study Notes in Seconds — Why I Built Zipytiny',
      description: 'The story behind Zipytiny: why manual study note creation wastes millions of hours, how active recall removes friction, and why I built an AI study workspace as a solo founder.',
      keywords: 'why i built zipytiny, zipytiny story, ai study workspace, active recall tool, lecture to study notes, solo founder',
      canonical: `${DOMAIN}/blog/why-i-built-zipytiny`,
      ogType: 'article',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': 'Turn Any Video, PDF, or Lecture Into Study Notes in Seconds — Why I Built Zipytiny',
          'description': 'The story behind Zipytiny: why manual study note creation wastes millions of hours, how active recall removes friction, and why I built an AI study workspace as a solo founder.',
          'author': orgSchema,
          'publisher': orgSchema,
          'datePublished': '2026-07-27',
          'dateModified': '2026-07-27',
          'mainEntityOfPage': `${DOMAIN}/blog/why-i-built-zipytiny`
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${DOMAIN}/blog` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Why I Built Zipytiny', 'item': `${DOMAIN}/blog/why-i-built-zipytiny` }
          ]
        }
      ],
      prerenderHtml: `
        <article style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/blog" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Blog</a></nav>
          <header style="margin-bottom: 30px;">
            <span style="display: inline-block; padding: 4px 12px; background: #e0e7ff; color: #4338ca; border-radius: 9999px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">Founder's Story</span>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: #111; margin-top: 12px; margin-bottom: 8px;">Turn Any Video, PDF, or Lecture Into Study Notes in Seconds — Why I Built Zipytiny</h1>
            <p style="color: #666; font-size: 0.9rem;">Published July 27, 2026 • 7 min read</p>
          </header>
          
          <div style="font-size: 1.05rem; color: #111; space-y: 16px;">
            <p><strong>I want to tell you about a problem that quietly wastes millions of hours every semester, and what I've been building to fix it.</strong></p>
            <p>If you've ever sat through a 90-minute lecture recording, a dense 40-page PDF, or a stack of slide decks the night before an exam, you already know the real cost of learning isn't understanding the material. It's finding the time to process it. Watching is not studying. Reading is not retaining. And most students — along with professionals prepping for certifications, career-switchers learning new skills, and lifelong learners just trying to keep up — don't have a system that turns raw content into something they can actually study from.</p>
            <p>That gap is why I built Zipytiny: an AI-powered study workspace that turns video, PDF, slide decks, articles, and notes into structured summaries, flashcards, mind maps, and quizzes in under a minute.</p>
            <p>This isn't a pitch. It's the story of a real problem, the product I built to solve it, and a few lessons on AI-assisted learning that I think are worth sharing regardless of whether you ever try the tool.</p>

            <h2 style="font-size: 1.5rem; color: #111; margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">The Problem With How We Study Today</h2>
            <p>Think about the last time you had to learn something dense and unfamiliar — a technical course, a compliance training video, a 60-slide onboarding deck, a research paper for work. What did you actually do?</p>
            <p>Most of us do one of two things. We either consume the content passively — watching, reading, highlighting — and hope some of it sticks. Or we manually convert it into something usable: typing out notes, building flashcards by hand, drafting our own summary. The first approach feels efficient but produces weak retention. The second approach produces strong retention but eats hours you don't have.</p>
            <p>Active recall and spaced repetition are, by a wide margin, the most well-supported techniques in learning science for long-term retention. The problem was never the <em>technique</em>. It was always the <em>tooling</em>. Manually converting a 90-minute lecture into a spaced-repetition flashcard deck can easily take longer than the lecture itself. Most people simply give up and default to re-reading or re-watching, which research consistently shows is one of the least effective ways to learn.</p>
            <p>This is the gap AI is genuinely well-suited to close — not by replacing the learning process, but by removing the friction of preparing material for it.</p>

            <h2 style="font-size: 1.5rem; color: #111; margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">What Zipytiny Actually Does</h2>
            <p>Zipytiny takes almost any format of content — a YouTube video, a lecture recording, a Zoom or Teams meeting transcript, a PDF, a Word document, a PowerPoint deck, an Excel sheet, a scanned image, an MP3 or MP4 file, or even a pasted article link — and converts it into a structured study workspace in seconds.</p>
            <p>Once content is uploaded, Zipytiny generates:</p>
            <ul>
              <li><strong>AI Summaries</strong> — concise, structured breakdowns of the key ideas, organized by topic rather than by timestamp, so you get the <em>meaning</em> of the content, not a transcript.</li>
              <li><strong>Active Recall Flashcards</strong> — spaced-repetition-ready decks with double-sided testing, exportable to formats like Anki for anyone who already has an existing study workflow.</li>
              <li><strong>Visual Mind Maps</strong> — interactive concept hierarchies that show how ideas connect to each other, which is especially useful for visual learners tackling technical or interdependent material.</li>
              <li><strong>Practice Quizzes</strong> — multiple-choice and exam-style questions generated directly from the source content, with real-time feedback, so you can test retention immediately instead of guessing whether you actually understood something.</li>
              <li><strong>Timestamped Notes</strong> — for video and audio content, notes that link directly back to the exact moment in the source material, so you can jump straight to the part you need to re-watch instead of scrubbing through an hour of footage.</li>
              <li><strong>AI Chat Q&amp;A</strong> — the ability to ask follow-up questions directly against the source material, powered by the full transcript and context, so you're not limited to what the initial summary chose to highlight.</li>
            </ul>
            <p>Everything can be exported — to PDF, Word, Markdown, or directly into Notion — so Zipytiny fits into whatever workflow you already use rather than forcing you into a new one.</p>

            <h2 style="font-size: 1.5rem; color: #111; margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Why I Built This as a Solo Founder</h2>
            <p>I've spent over a decade working in enterprise software — specifically ERP systems for industries like construction and manufacturing, where the entire discipline revolves around taking messy, unstructured operational data and turning it into something people can act on. Batching data, weighbridge readings, production logs — the throughline in that work has always been: raw input in, structured, usable output out.</p>
            <p>Studying has the exact same shape of problem. Raw input — a lecture, a PDF, a meeting recording — and the value is entirely in how well you can convert it into something actionable. That parallel is what pulled me toward building Zipytiny.</p>
            <p>I'm building this as a bootstrapped, zero-marketing-budget solo founder, which means every part of Zipytiny — from the AI processing pipeline to the security architecture protecting user data, to the SEO and technical infrastructure behind the product — has to be built and maintained without a team behind it. That's a genuinely different discipline than building inside a company with dedicated growth, security, and infrastructure teams. It also means I have to be honest about what the product is good at right now, rather than overclaiming.</p>

            <h2 style="font-size: 1.5rem; color: #111; margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Where Zipytiny Is Genuinely Useful Today</h2>
            <ul>
              <li><strong>Students</strong> converting lecture recordings and course PDFs into flashcards and quizzes ahead of exams, especially in dense, high-volume subjects like medicine, law, and engineering, where the sheer volume of material makes manual note-taking impractical.</li>
              <li><strong>Working professionals</strong> processing long training videos, compliance modules, or industry reports into a five-minute summary they can actually retain, instead of a two-hour video they'll never rewatch.</li>
              <li><strong>Career-switchers and self-learners</strong> working through online courses, technical documentation, or YouTube-based tutorials, who need a faster way to convert scattered content into a structured study plan.</li>
              <li><strong>Teams</strong> who record meetings on Zoom, Google Meet, or Microsoft Teams and want a structured summary and searchable knowledge base afterward, instead of a raw transcript nobody rereads.</li>
            </ul>

            <h2 style="font-size: 1.5rem; color: #111; margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Where It Still Has Room to Grow</h2>
            <p>I'd rather be direct about this than pretend the product is finished. Zipytiny is early. I'm actively working through the first cohort of paying customers post-launch, refining pricing clarity, tightening the onboarding experience, and expanding language support. If you try it and something feels rough, that's useful — not embarrassing — feedback, and I read every message that comes in.</p>

            <h2 style="font-size: 1.5rem; color: #111; margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">A Quick Comparison: Where Zipytiny Fits Among Study Tools</h2>
            <p>The AI study-tool space has grown quickly over the past couple of years, and it's worth being honest about where different tools fit rather than pretending Zipytiny is the only option worth considering.</p>
            <p>Tools built primarily around manual flashcard creation and spaced repetition — the category Anki has led for years — are still excellent if you're comfortable building your own decks by hand and want maximum control over card format. What they don't solve is the upstream problem: converting a two-hour lecture or a 40-page PDF into flashcard-ready material in the first place. That conversion step is where most study time actually gets lost, and it's the specific gap Zipytiny is built around.</p>
            <p>Community-driven platforms with massive pre-made content libraries solve a different problem — they're excellent if someone else has already studied your exact material and shared their notes. But they're far less useful for original, unique, or recently updated content: a professor's own lecture recording, an internal company training video, a niche technical paper. There's no pre-made deck for content that doesn't exist anywhere else, which is most of what working professionals and graduate students actually need to process.</p>
            <p>Zipytiny's focus is specifically on that gap: original, unique source material — your lecture, your meeting recording, your PDF — converted into study-ready formats without requiring you to already know what you're looking for, or hoping someone else already made the deck you need.</p>

            <h2 style="font-size: 1.5rem; color: #111; margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">A Real Example of the Problem, and What Changes</h2>
            <p>Picture a nursing student with a 45-minute lecture recording on pharmacology, due to be tested on it in three days. The traditional path looks like this: watch the full lecture once, taking rough notes by hand. Rewatch sections that were unclear, pausing and rewinding repeatedly. Manually convert scattered notes into flashcards, one at a time, which for a dense pharmacology lecture can easily mean 60 to 100 individual cards. Only after all of that manual conversion work is done can actual studying — the active recall and repetition that drives retention — even begin. Realistically, that entire preparation phase eats two to three hours before a single minute of effective studying has happened.</p>
            <p>With Zipytiny, the same lecture recording is uploaded once. Within roughly a minute, the system returns a structured summary organized by topic, a full flashcard deck with double-sided testing already generated from the source material, timestamped notes linking directly back to specific moments in the recording for quick reference, and a practice quiz to immediately test retention. The manual conversion labor — the two to three hours of transcription and flashcard-building — is eliminated. What's left is exactly the part of studying that should take up a student's time and attention: actually reviewing, recalling, and testing the material.</p>
            <div style="padding: 16px; background: #e0e7ff; color: #3730a3; border-left: 4px solid #4f46e5; border-radius: 4px; font-weight: 600; margin: 20px 0;">
              That's the entire value proposition in one sentence: Zipytiny doesn't change how you study. It changes how long it takes to get to the part where real studying starts.
            </div>

            <h2 style="font-size: 1.5rem; color: #111; margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Frequently Asked Questions</h2>
            <div style="display: grid; gap: 16px; margin: 16px 0;">
              <div style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <p style="font-weight: bold; margin: 0 0 6px 0; color: #0f172a;">What file and content formats does Zipytiny support?</p>
                <p style="margin: 0; font-size: 0.95rem; color: #475569;">Zipytiny supports YouTube videos, direct website links, pasted articles and raw text, PDF documents, Word documents, PowerPoint presentations, Excel spreadsheets, images with text (via OCR), and audio or video files including MP3, WAV, MP4, and WebM.</p>
              </div>
              <div style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <p style="font-weight: bold; margin: 0 0 6px 0; color: #0f172a;">Can I ask follow-up questions about the material I uploaded?</p>
                <p style="margin: 0; font-size: 0.95rem; color: #475569;">Yes. The AI Chat Q&amp;A feature lets you ask specific questions against the full transcript and context of whatever you uploaded, so you're not limited to only what the automatically generated summary chose to highlight.</p>
              </div>
              <div style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <p style="font-weight: bold; margin: 0 0 6px 0; color: #0f172a;">Can I export what Zipytiny generates?</p>
                <p style="margin: 0; font-size: 0.95rem; color: #475569;">Yes. Summaries, flashcard decks, and quiz structures can be exported as formatted PDF reports, Word documents, raw Markdown files, or pushed directly into Notion.</p>
              </div>
              <div style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <p style="font-weight: bold; margin: 0 0 6px 0; color: #0f172a;">Is there a free way to try Zipytiny?</p>
                <p style="margin: 0; font-size: 0.95rem; color: #475569;">Yes. Free users get a daily allocation of AI-generated study material to test the platform, with the option to upgrade to Pro for unlimited processing, exports, and premium templates.</p>
              </div>
              <div style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <p style="font-weight: bold; margin: 0 0 6px 0; color: #0f172a;">Does Zipytiny replace studying, or just speed up preparation?</p>
                <p style="margin: 0; font-size: 0.95rem; color: #475569;">It speeds up preparation. Zipytiny converts raw content into study-ready formats — flashcards, quizzes, summaries — but the actual learning still happens through active recall and review on your end. The tool removes the manual formatting labor, not the thinking.</p>
              </div>
            </div>

            <h2 style="font-size: 1.5rem; color: #111; margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">The Bigger Idea: AI Shouldn't Replace Learning, It Should Remove the Friction Before It</h2>
            <p>There's a legitimate and important conversation happening right now about AI potentially undermining learning — about students using AI to skip the thinking part entirely. I take that concern seriously, and it shaped a specific design decision in Zipytiny: the product is built to accelerate the <em>preparation</em> stage of learning, not the <em>thinking</em> stage.</p>
            <p>Zipytiny doesn't write your essay or answer your exam questions for you. It takes content you still have to engage with — quiz yourself on, review, actively recall — and removes the hours of manual formatting that used to stand between "I consumed this content" and "I can actually study from this material using proven techniques." The active recall and retention work still has to happen in your own head. Zipytiny just gets you to that starting line faster.</p>
            <p>That distinction matters, and I think it's the difference between AI tools that quietly erode learning and AI tools that genuinely support it.</p>

            <h2 style="font-size: 1.5rem; color: #111; margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">What's Next</h2>
            <ol>
              <li><strong>Expanding format support</strong> — deeper handling of scanned documents, more language coverage for non-English content, and better handling of longer-form technical material like full textbook chapters.</li>
              <li><strong>Refining the AI Chat Q&amp;A</strong> experience so it feels less like a chatbot bolted onto a summary and more like a genuine study partner that understands the full context of what you uploaded.</li>
              <li><strong>Building out team and classroom workflows</strong> — shared workspaces for study groups, students, and small teams who want to build a collective knowledge base from shared source material.</li>
              <li><strong>Continued security hardening and infrastructure work</strong>, since as a solo-built product, staying disciplined about data protection and system reliability has to scale alongside feature growth, not lag behind it.</li>
            </ol>

            <h2 style="font-size: 1.5rem; color: #111; margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">If You Want to Try It</h2>
            <p>Zipytiny is free to start — no card required — with a Pro tier for unlimited processing, exports, and premium templates for anyone who needs it as a daily tool. You can try it directly at <a href="https://zipytiny.app" style="color: #4f46e5; font-weight: bold;">zipytiny.app</a>.</p>
            <p>If you're a student drowning in lecture recordings, a professional trying to actually retain the compliance training you just sat through, or just someone who's tired of re-reading the same PDF three times hoping something sticks — I built this for you, and I'd genuinely value your feedback.</p>
            <p>And if you're building something yourself as a solo founder or bootstrapper, I'm always happy to compare notes on the zero-budget grind. It's a specific kind of hard, and it helps to talk to people doing the same thing.</p>

            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-style: italic; font-size: 0.9rem; color: #666;">
              Zipytiny is an AI-powered study workspace that converts video, PDF, slides, articles, and notes into summaries, flashcards, mind maps, and quizzes. Learn more at <a href="https://zipytiny.app" style="color: #4f46e5;">zipytiny.app</a>.
            </div>
          </div>
        </article>
      `
    };
  }

  // 2. BLOG POST: turn-video-lecture-to-study-notes
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

  // 0. BLOG POST: best-ai-tools-video-lecture-meeting-notes
  if (cleanPath === '/blog/best-ai-tools-video-lecture-meeting-notes') {
    return {
      title: '15 Best AI Tools for Turning Videos, Lectures & Meetings Into Notes (2026) | Zipytiny Blog',
      description: 'A hands-on comparison of the best AI note-taking and summarization tools in 2026 — for students, researchers, and professionals who need videos, lectures, and meetings turned into usable notes fast.',
      keywords: 'best ai note taker, ai lecture notes, ai meeting notes tool, video to notes ai, ai study tools 2026, notebooklm alternative',
      canonical: `${DOMAIN}/blog/best-ai-tools-video-lecture-meeting-notes`,
      ogType: 'article',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': '15 Best AI Tools for Turning Videos, Lectures & Meetings Into Notes (2026)',
          'description': 'A hands-on comparison of the best AI note-taking and summarization tools in 2026 — for students, researchers, and professionals who need videos, lectures, and meetings turned into usable notes fast.',
          'author': orgSchema,
          'publisher': orgSchema,
          'datePublished': '2026-08-04',
          'dateModified': '2026-08-04',
          'mainEntityOfPage': `${DOMAIN}/blog/best-ai-tools-video-lecture-meeting-notes`
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${DOMAIN}/blog` },
            { '@type': 'ListItem', 'position': 3, 'name': '15 Best AI Tools for Turning Videos, Lectures & Meetings Into Notes (2026)', 'item': `${DOMAIN}/blog/best-ai-tools-video-lecture-meeting-notes` }
          ]
        }
      ],
      prerenderHtml: `
        <article style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;">
            <a href="/" style="color: #4f46e5; text-decoration: none;">Home</a> &gt; 
            <a href="/blog" style="color: #4f46e5; text-decoration: none;">Blog</a> &gt; 
            <span style="color: #666;">15 Best AI Tools for Turning Videos, Lectures & Meetings Into Notes (2026)</span>
          </nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">15 Best AI Tools for Turning Videos, Lectures & Meetings Into Notes (2026)</h1>
          <p style="color: #666; font-size: 0.9rem;">Published August 4, 2026 • 8 min read • Category: Tool Comparison</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 1.1rem; font-weight: 500; color: #444;">
            A hands-on comparison of the best AI note-taking and summarization tools in 2026 — for students, researchers, and professionals who need videos, lectures, and meetings turned into usable notes fast.
          </p>
          <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-radius: 12px; text-align: center;">
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Try Zipytiny AI Note Generator Free →</a>
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
              <h2 style="margin-top: 0; font-size: 1.3rem;"><a href="/blog/best-ai-tools-video-lecture-meeting-notes" style="color: #4f46e5; text-decoration: none;">15 Best AI Tools for Turning Videos, Lectures & Meetings Into Notes (2026)</a></h2>
              <p style="color: #555; font-size: 0.95rem;">A hands-on comparison of the best AI note-taking and summarization tools in 2026 — for students, researchers, and professionals who need videos, lectures, and meetings turned into usable notes fast.</p>
              <a href="/blog/best-ai-tools-video-lecture-meeting-notes" style="color: #4f46e5; font-weight: bold; font-size: 0.9rem;">Read Full Guide →</a>
            </article>
            <article style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;">
              <h2 style="margin-top: 0; font-size: 1.3rem;"><a href="/blog/why-i-built-zipytiny" style="color: #4f46e5; text-decoration: none;">Turn Any Video, PDF, or Lecture Into Study Notes in Seconds — Why I Built Zipytiny</a></h2>
              <p style="color: #555; font-size: 0.95rem;">The story behind Zipytiny: why manual study note creation wastes millions of hours, how active recall removes friction, and why I built an AI study workspace as a solo founder.</p>
              <a href="/blog/why-i-built-zipytiny" style="color: #4f46e5; font-weight: bold; font-size: 0.9rem;">Read Full Post →</a>
            </article>

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

  // 11b. FEATURES: /features/meeting-notes
  if (cleanPath === '/features/meeting-notes') {
    return {
      title: 'AI Meeting Notes Generator for Zoom, Teams & Google Meet | Zipytiny',
      description: 'Never take notes in a meeting again. Turn uploaded Zoom, Teams, and Google Meet call recordings and transcripts into structured meeting notes instantly.',
      keywords: 'ai meeting notes generator, zoom meeting notes, teams transcript summarizer, google meet notes, workplace notes, zipytiny',
      canonical: `${DOMAIN}/features/meeting-notes`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Features', 'item': `${DOMAIN}/features` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Meeting Notes Generator', 'item': `${DOMAIN}/features/meeting-notes` }
          ]
        }
      ],
      prerenderHtml: `
        <main style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Home</a></nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">AI Meeting Notes Generator</h1>
          <p style="font-size: 1.1rem; color: #555;">Never take manual notes in a meeting again. Transform Zoom, Teams, and Google Meet recordings into structured agenda recaps and decision logs.</p>
          <div style="margin-top: 40px; text-align: center;">
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Generate Meeting Notes Now →</a>
          </div>
        </main>
      `
    };
  }

  // 11c. FEATURES: /features/action-items
  if (cleanPath === '/features/action-items') {
    return {
      title: 'Action Item Extraction from Meeting Recordings & Docs | Zipytiny',
      description: 'Automatically extract clear action items, assigned owners, and key deliverables directly from meeting recordings, calls, and documents.',
      keywords: 'action item extraction, ai task extractor, meeting next steps, automated action items, project task detection, zipytiny',
      canonical: `${DOMAIN}/features/action-items`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Features', 'item': `${DOMAIN}/features` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Action Item Extraction', 'item': `${DOMAIN}/features/action-items` }
          ]
        }
      ],
      prerenderHtml: `
        <main style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Home</a></nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">Action Item Extraction</h1>
          <p style="font-size: 1.1rem; color: #555;">Auto-detect next steps, deliverables, and assigned task owners from meeting recordings and call transcripts.</p>
          <div style="margin-top: 40px; text-align: center;">
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Extract Action Items Now →</a>
          </div>
        </main>
      `
    };
  }

  // 11d. FEATURES: /features/presentation-export
  if (cleanPath === '/features/presentation-export') {
    return {
      title: 'Instant Presentation Export — Turn Meetings & Docs to Slides | Zipytiny',
      description: 'Convert meeting notes, transcripts, or dense documents into professionally formatted PowerPoint presentation slide decks in seconds.',
      keywords: 'meeting to presentation ai, document to slides generator, powerpoint slide export, ai presentation generator, zipytiny',
      canonical: `${DOMAIN}/features/presentation-export`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Features', 'item': `${DOMAIN}/features` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Instant Presentation Export', 'item': `${DOMAIN}/features/presentation-export` }
          ]
        }
      ],
      prerenderHtml: `
        <main style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Home</a></nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">Instant Presentation Export</h1>
          <p style="font-size: 1.1rem; color: #555;">Turn meetings, call recordings, or documents into ready-to-share PowerPoint slide decks with formatted bullet points.</p>
          <div style="margin-top: 40px; text-align: center;">
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Export Presentation Deck →</a>
          </div>
        </main>
      `
    };
  }

  // 11e. FEATURES: /features/executive-summaries
  if (cleanPath === '/features/executive-summaries') {
    return {
      title: 'Executive Summaries & One-Paragraph Recaps | Zipytiny',
      description: 'Generate high-density one-paragraph recaps and bulleted decision briefs for team leaders, managers, and stakeholders who missed the call.',
      keywords: 'executive summary generator, one paragraph meeting recap, stakeholder brief ai, meeting decision matrix, zipytiny',
      canonical: `${DOMAIN}/features/executive-summaries`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Features', 'item': `${DOMAIN}/features` },
            { '@type': 'ListItem', 'position': 3, 'name': 'Executive Summaries', 'item': `${DOMAIN}/features/executive-summaries` }
          ]
        }
      ],
      prerenderHtml: `
        <main style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #333; line-height: 1.7;">
          <nav style="font-size: 0.9rem; margin-bottom: 20px;"><a href="/" style="color: #4f46e5; text-decoration: none;">← Back to Zipytiny Home</a></nav>
          <h1 style="font-size: 2.2rem; margin-top: 10px; color: #111;">Executive Summaries</h1>
          <p style="font-size: 1.1rem; color: #555;">Generate high-density one-paragraph recaps and decision briefs for stakeholders who couldn't attend.</p>
          <div style="margin-top: 40px; text-align: center;">
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Generate Executive Summary →</a>
          </div>
        </main>
      `
    };
  }

  // 12. PRICING: /pricing
  if (cleanPath === '/pricing') {
    return {
      title: 'Zipytiny Pricing & Workspace Plans - Free to Start',
      description: `Compare Zipytiny Free, Pro ($${PRO_PLAN_MONTHLY_PRICE}/mo), and Enterprise ($${ENTERPRISE_PLAN_MONTHLY_PRICE}/mo) plans. Start summarizing YouTube videos, PDFs, and slide decks today.`,
      keywords: 'zipytiny pricing, free youtube summarizer, pro study suite, Enterprise AI notes',
      canonical: `${DOMAIN}/pricing`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Zipytiny',
          'url': `${DOMAIN}/pricing`,
          'operatingSystem': 'All',
          'applicationCategory': 'EducationalApplication, ProductivityApplication, MultimediaApplication',
          'genre': 'AI Study Workspace & Multi-Format Knowledge Engine',
          'description': 'Zipytiny pricing plans: Free Workspace ($0), Pro Plan ($9.99/mo), and Enterprise Plan ($39/mo).',
          'offers': [
            { '@type': 'Offer', 'name': 'Free Workspace Plan', 'price': FREE_PLAN_PRICE, 'priceCurrency': 'USD', 'description': 'Free study workspace with core AI note generation and summary capabilities.' },
            { '@type': 'Offer', 'name': 'Pro Plan', 'price': PRO_PLAN_MONTHLY_PRICE, 'priceCurrency': 'USD', 'description': 'Unlimited video, PDF & document uploads, mind maps, quizzes, and PowerPoint exports.' },
            { '@type': 'Offer', 'name': 'Enterprise Plan', 'price': ENTERPRISE_PLAN_MONTHLY_PRICE, 'priceCurrency': 'USD', 'description': 'Team workspaces, high-speed processing, dedicated support and API access.' }
          ]
        },
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

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-top: 30px;">
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
              <p style="font-size: 1.8rem; font-weight: bold;">$9.99 <span style="font-size: 1rem; color: #666;">/ month</span></p>
              <p>For postgrads, medical/law students, & creators.</p>
              <ul>
                <li>Unlimited Video & PDF Uploads</li>
                <li>Mind Maps & Quiz Generator</li>
                <li>PowerPoint & Anki Deck Exports</li>
                <li>High-speed Gemini Flash Engine</li>
              </ul>
              <a href="/" style="display: block; text-align:center; padding: 10px; background: #4f46e5; color: white; border-radius: 6px; text-decoration:none; margin-top: 20px;">Upgrade to Pro</a>
            </div>

            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; background: #fff;">
              <h2 style="margin-top:0; color: #7c3aed;">Enterprise Plan</h2>
              <p style="font-size: 1.8rem; font-weight: bold;">$39 <span style="font-size: 1rem; color: #666;">/ month</span></p>
              <p>For team workspaces, institutions & agencies.</p>
              <ul>
                <li>Team Workspaces & Shared Folders</li>
                <li>High-Speed Priority Processing Queue</li>
                <li>Dedicated Onboarding & Support</li>
                <li>API Access & Custom Webhooks</li>
              </ul>
              <a href="/" style="display: block; text-align:center; padding: 10px; background: #7c3aed; color: white; border-radius: 6px; text-decoration:none; margin-top: 20px;">Upgrade to Enterprise</a>
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
              'name': 'What types of content formats can Zipytiny summarize?',
              'acceptedAnswer': { '@type': 'Answer', 'text': 'Zipytiny supports YouTube videos, custom website links, pasted articles, raw text, and file uploads including PDFs, Word documents, PowerPoint presentations, Excel sheets, images with text OCR, MP3 and WAV audio recordings, and MP4 or WebM video files.' }
            },
            {
              '@type': 'Question',
              'name': 'How does the AI Chat Q&A work?',
              'acceptedAnswer': { '@type': 'Answer', 'text': 'The AI Chat Q&A allows users to ask specific follow-up questions on generated summaries using the complete transcription and metadata powered by Google Gemini AI reasoning in real-time.' }
            },
            {
              '@type': 'Question',
              'name': 'Can I export summaries to other workspaces?',
              'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, Zipytiny allows users to export generated summaries, timeline chapters, and quiz structures to formatted PDF reports, Microsoft Word documents, raw Markdown files, or directly to Notion.' }
            },
            {
              '@type': 'Question',
              'name': 'Is there a limit on free guest usage?',
              'acceptedAnswer': { '@type': 'Answer', 'text': 'Free guest users receive a daily allocation of summaries to test Zipytiny, and can upgrade to the Pro Plan for unlimited processing speeds, PDF and Word exports, and premium AI templates.' }
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
            <dt style="font-size: 1.2rem; font-weight: bold; color: #111; margin-top: 20px;">What types of content formats can Zipytiny summarize?</dt>
            <dd style="color: #555; margin-left: 0; margin-top: 5px;">Zipytiny supports YouTube videos, custom website links, pasted articles, raw text, and file uploads including PDFs, Word documents, PowerPoint presentations, Excel sheets, images with text OCR, MP3 and WAV audio recordings, and MP4 or WebM video files.</dd>
            
            <dt style="font-size: 1.2rem; font-weight: bold; color: #111; margin-top: 20px;">How does the AI Chat Q&amp;A work?</dt>
            <dd style="color: #555; margin-left: 0; margin-top: 5px;">The AI Chat Q&amp;A allows users to ask specific follow-up questions on generated summaries using the complete transcription and metadata powered by Google Gemini AI reasoning in real-time.</dd>

            <dt style="font-size: 1.2rem; font-weight: bold; color: #111; margin-top: 20px;">Can I export summaries to other workspaces?</dt>
            <dd style="color: #555; margin-left: 0; margin-top: 5px;">Yes, Zipytiny allows users to export generated summaries, timeline chapters, and quiz structures to formatted PDF reports, Microsoft Word documents, raw Markdown files, or directly to Notion.</dd>

            <dt style="font-size: 1.2rem; font-weight: bold; color: #111; margin-top: 20px;">Is there a limit on free guest usage?</dt>
            <dd style="color: #555; margin-left: 0; margin-top: 5px;">Free guest users receive a daily allocation of summaries to test Zipytiny, and can upgrade to the Pro Plan for unlimited processing speeds, PDF and Word exports, and premium AI templates.</dd>
          </dl>
        </main>
      `
    };
  }

  // DEFAULT / LANDING PAGE: '/'
  // TODO: add aggregateRating (ratingValue, reviewCount) once we have a verified, real rating source — do not use placeholder or estimated numbers, this violates Google's structured data policies.
  return {
    title: 'Zipytiny – AI Notes & Summaries from Video, Meetings, PDFs & Slides',
    description: 'Turn any video, PDF, slide deck, article, Zoom or Teams recording into AI summaries, study notes, or meeting notes and presentations in seconds. Free to start, Pro from $9.99/mo.',
    keywords: 'pdf summarizer, youtube summarizer, slides summary, document to flashcards, ai study guide, video to quiz, mindmap generator, active recall workspace, zipytiny, zoom meeting summarizer, ai meeting notes, meeting to presentation ai, teams call summary, ai presentation generator',
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
        'applicationCategory': 'EducationalApplication, ProductivityApplication, MultimediaApplication',
        'genre': 'AI Study Workspace & Multi-Format Knowledge Engine',
        'description': 'Zipytiny is an AI-powered learning and productivity platform that turns videos, PDFs, slide decks, articles, notes, and Zoom, Teams or Meet meeting recordings into clear summaries, key concepts, meeting notes, action items, flashcards, mind maps, and presentation decks in seconds.',
        'offers': [
          { '@type': 'Offer', 'name': 'Free Workspace Plan', 'price': FREE_PLAN_PRICE, 'priceCurrency': 'USD', 'description': 'Free study workspace with core AI note generation and summary capabilities.' },
          { '@type': 'Offer', 'name': 'Pro Plan', 'price': PRO_PLAN_MONTHLY_PRICE, 'priceCurrency': 'USD', 'description': 'Unlimited video, PDF & document uploads, mind maps, quizzes, and PowerPoint exports.' },
          { '@type': 'Offer', 'name': 'Enterprise Plan', 'price': ENTERPRISE_PLAN_MONTHLY_PRICE, 'priceCurrency': 'USD', 'description': 'Team workspaces, high-speed processing, dedicated support and API access.' }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What types of content formats can Zipytiny summarize?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Zipytiny supports YouTube videos, custom website links, pasted articles, raw text, and file uploads including PDFs, Word documents, PowerPoint presentations, Excel sheets, images with text OCR, MP3 and WAV audio recordings, and MP4 or WebM video files.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Can I use Zipytiny for work meetings, not just studying?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, absolutely! Zipytiny supports Zoom, Microsoft Teams, and Google Meet recordings and transcripts. In addition to study tools, Zipytiny automatically generates structured meeting notes, auto-extracts action items with owners, creates executive summaries for stakeholders, and can export key meeting takeaways directly into presentation slide decks.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does the AI Chat Q&A work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The AI Chat Q&A allows users to ask specific follow-up questions on generated summaries using the complete transcription and metadata powered by Google Gemini AI reasoning in real-time.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Can I export summaries to other workspaces?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, Zipytiny allows users to export generated summaries, timeline chapters, and quiz structures to formatted PDF reports, Microsoft Word documents, raw Markdown files, or directly to Notion.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Is there a limit on free guest usage?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Free guest users receive a daily allocation of summaries to test Zipytiny, and can upgrade to the Pro Plan for unlimited processing speeds, PDF and Word exports, and premium AI templates.'
            }
          }
        ]
      },
      orgSchema
    ],
    prerenderHtml: `
      <div style="max-width: 1100px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif; color: #111; line-height: 1.6;">
        <header style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 2.8rem; font-weight: 800; letter-spacing: -0.02em; color: #0f172a; margin-bottom: 12px;">
            Turn Any Video, PDF, Slide Deck, Article or Meeting Recording Into AI Summaries & Study Notes
          </h1>
          <p style="font-size: 1.25rem; color: #475569; max-width: 780px; margin: 0 auto 12px;">
            Turn any video, PDF, slide deck, article, or note into AI summaries and study notes in seconds. Upload files, paste YouTube links or Zoom, Teams & Meet recordings to instantly generate mind maps, flashcards, quizzes, and formatted study guides.
          </p>
          <p style="font-size: 1.05rem; color: #0071e3; font-weight: 600; max-width: 780px; margin: 0 auto 24px;">
            Also built for work: turn Zoom, Teams, and Google Meet recordings into meeting notes, action items, and ready-to-share slide decks.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="/" style="padding: 12px 28px; background: #4f46e5; color: white; border-radius: 9999px; font-weight: 700; text-decoration: none;">Start free — no card required</a>
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

        <section style="margin: 50px 0;">
          <h2 style="font-size: 1.8rem; text-align: center; margin-bottom: 30px;">Core Professional Modules</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.25rem;"><a href="/features/meeting-notes" style="color: #4f46e5; text-decoration: none;">Meeting Notes Generator</a></h3>
              <p style="color: #64748b; font-size: 0.95rem;">Automatically turn call recordings and transcripts into structured meeting notes with key discussion topics.</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.25rem;"><a href="/features/action-items" style="color: #4f46e5; text-decoration: none;">Action Item Extraction</a></h3>
              <p style="color: #64748b; font-size: 0.95rem;">Auto-detected next steps, deliverables, and assigned task owners from meeting audio or transcripts.</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.25rem;"><a href="/features/presentation-export" style="color: #4f46e5; text-decoration: none;">Instant Presentation Export</a></h3>
              <p style="color: #64748b; font-size: 0.95rem;">Turn a meeting or document into a shareable PowerPoint slide deck with auto-formatted bullet points.</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.25rem;"><a href="/features/executive-summaries" style="color: #4f46e5; text-decoration: none;">Executive Summaries</a></h3>
              <p style="color: #64748b; font-size: 0.95rem;">One-paragraph recap and decision matrix tailored for managers and stakeholders.</p>
            </div>
          </div>
        </section>

        <section style="margin: 50px 0;" id="pricing">
          <h2 style="font-size: 1.8rem; text-align: center; margin-bottom: 30px; color: #0f172a;">Affordable Pricing Plans</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; text-align: center;">
              <h3 style="margin-top: 0; font-size: 1.25rem; color: #0f172a;">Free Workspace Plan</h3>
              <p style="font-size: 1.75rem; font-weight: bold; margin: 10px 0; color: #4f46e5;">$0</p>
              <p style="color: #64748b; font-size: 0.95rem; line-height: 1.5; margin: 0;">Free study workspace with core AI note generation and summary capabilities.</p>
            </div>
            <div style="padding: 20px; border: 2px solid #4f46e5; border-radius: 12px; background: #ffffff; text-align: center; position: relative;">
              <span style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #4f46e5; color: white; padding: 2px 10px; font-size: 0.75rem; border-radius: 9999px; font-weight: bold; text-transform: uppercase;">Most Popular</span>
              <h3 style="margin-top: 8px; font-size: 1.25rem; color: #0f172a;">Pro Plan</h3>
              <p style="font-size: 1.75rem; font-weight: bold; margin: 10px 0; color: #4f46e5;">$9.99 <span style="font-size: 0.9rem; font-weight: normal; color: #64748b;">/ mo</span></p>
              <p style="color: #64748b; font-size: 0.95rem; line-height: 1.5; margin: 0;">Unlimited video, PDF &amp; document uploads, mind maps, quizzes, and PowerPoint exports.</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; text-align: center;">
              <h3 style="margin-top: 0; font-size: 1.25rem; color: #0f172a;">Enterprise Plan</h3>
              <p style="font-size: 1.75rem; font-weight: bold; margin: 10px 0; color: #4f46e5;">$39 <span style="font-size: 0.9rem; font-weight: normal; color: #64748b;">/ mo</span></p>
              <p style="color: #64748b; font-size: 0.95rem; line-height: 1.5; margin: 0;">Team workspaces, high-speed processing, dedicated support and API access.</p>
            </div>
          </div>
        </section>

        <section style="margin: 50px 0;" id="faq">
          <h2 style="font-size: 1.8rem; text-align: center; margin-bottom: 30px; color: #0f172a;">Frequently Asked Questions</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700;">What types of content formats can Zipytiny summarize?</h3>
              <p style="color: #64748b; font-size: 0.95rem; line-height: 1.5; margin-bottom: 0;">Zipytiny supports YouTube videos, custom website links, pasted articles, raw text, and file uploads including PDFs, Word documents, PowerPoint presentations, Excel sheets, images with text OCR, MP3 and WAV audio recordings, and MP4 or WebM video files.</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700;">How does the AI Chat Q&amp;A work?</h3>
              <p style="color: #64748b; font-size: 0.95rem; line-height: 1.5; margin-bottom: 0;">The AI Chat Q&amp;A allows users to ask specific follow-up questions on generated summaries using the complete transcription and metadata powered by Google Gemini AI reasoning in real-time.</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700;">Can I export summaries to other workspaces?</h3>
              <p style="color: #64748b; font-size: 0.95rem; line-height: 1.5; margin-bottom: 0;">Yes, Zipytiny allows users to export generated summaries, timeline chapters, and quiz structures to formatted PDF reports, Microsoft Word documents, raw Markdown files, or directly to Notion.</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <h3 style="margin-top: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700;">Is there a limit on free guest usage?</h3>
              <p style="color: #64748b; font-size: 0.95rem; line-height: 1.5; margin-bottom: 0;">Free guest users receive a daily allocation of summaries to test Zipytiny, and can upgrade to the Pro Plan for unlimited processing speeds, PDF and Word exports, and premium AI templates.</p>
            </div>
          </div>
        </section>

        <section style="margin: 50px 0; padding: 30px; background: #0f172a; color: white; border-radius: 16px;">
          <h2 style="margin-top: 0; font-size: 1.8rem; color: white;">Latest Learning & AI Strategy Guides</h2>
          <ul style="list-style: none; padding: 0; display: grid; gap: 16px; margin-top: 20px;">
            <li><a href="/blog/best-ai-tools-video-lecture-meeting-notes" style="color: #818cf8; font-weight: 600; text-decoration: none; font-size: 1.1rem;">• 15 Best AI Tools for Turning Videos, Lectures & Meetings Into Notes (2026) →</a></li>
            <li><a href="/blog/why-i-built-zipytiny" style="color: #818cf8; font-weight: 600; text-decoration: none; font-size: 1.1rem;">• Turn Any Video, PDF, or Lecture Into Study Notes in Seconds — Why I Built Zipytiny →</a></li>
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
