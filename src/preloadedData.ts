/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { YouTubeSummaryResponse } from './types';

export const PRELOADED_VIDEOS: YouTubeSummaryResponse[] = [
  {
    metadata: {
      videoId: 'UF8uR6Z6KLc',
      videoUrl: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
      title: 'Steve Jobs: 2005 Stanford Commencement Address',
      author: 'Stanford',
      thumbnailUrl: 'https://img.youtube.com/vi/UF8uR6Z6KLc/maxresdefault.jpg',
      duration: '15 mins',
    },
    summary: 'In this legendary commencement address at Stanford University in 2005, Steve Jobs (co-founder of Apple) shares three personal stories about "connecting the dots," "love and loss," and "death." He urges graduates to follow their curiosity and intuition, trust that their experiences will somehow connect in the future, love their work, and live every day as if it were their last to focus on what truly matters.',
    takeaways: [
      'Connecting the dots: You cannot connect the dots looking forward; you can only connect them looking backward. You must trust that they will connect in your future.',
      'Love and loss: Getting fired from Apple was the best thing that could have happened to Steve. It freed him to enter one of the most creative periods of his life.',
      'Death as an agent: Remembering that you are going to die is the best way to avoid the trap of thinking you have something to lose. Your time is limited, so don’t waste it living someone else’s life.',
      'Curiosity and Intuition: Follow your heart even when it leads you off the well-worn path, and that will make all the difference.',
      'Stay Hungry, Stay Foolish: Embrace lifelong learning, remain ambitious, and never settle for mediocrity.',
    ],
    chapters: [
      {
        timestamp: '00:00',
        secondsCount: 0,
        title: 'First Story: Connecting the Dots',
        takeaway: 'Dropping out of Reed College allowed Steve to drop in on calligraphy classes, which directly inspired the rich typography of the Macintosh computer.',
      },
      {
        timestamp: '05:08',
        secondsCount: 308,
        title: 'Second Story: Love and Loss',
        takeaway: 'Steve describes founding Apple, getting fired at age 30, and discovering the creative freedom that led to Next, Pixar, and returning to Apple.',
      },
      {
        timestamp: '09:12',
        secondsCount: 552,
        title: 'Third Story: Death and Mortality',
        takeaway: 'Confronting cancer taught Steve that remembering mortality is the ultimate tool for making major life decisions.',
      },
      {
        timestamp: '13:30',
        secondsCount: 810,
        title: 'Stay Hungry, Stay Foolish',
        takeaway: 'Concludes with his famous charge to the graduating class to keep seeking and never settle.',
      },
    ],
    blogPost: `# Stay Hungry, Stay Foolish: Lessons from Steve Jobs’ Famous 2005 Stanford Address

In June 2005, Apple co-founder Steve Jobs stood before the graduating class at Stanford University and delivered one of the most memorable speeches in modern history. He did not talk about corporate statistics, software features, or product strategies. Instead, he told three simple stories.

---

## 1. Connecting the Dots
Jobs dropped out of Reed College after six months, but stayed as a drop-in for another 18 months. This allowed him to take a calligraphy course out of pure interest. 

Ten years later, when designing the first Macintosh computer, that calligraphy training became the foundation for the beautiful, proportional typography we take for granted on computers today.

> **"You can't connect the dots looking forward; you can only connect them looking backward."**

You must trust that the dots will somehow connect in your future. This trust gives you the confidence to follow your heart.

---

## 2. Love and Loss
At age 30, Jobs was publicly fired from Apple, the very company he founded. It was devastating, but it proved to be a blessing in disguise. 

It freed him to enter one of the most creative phases of his life, founding NeXT and Pixar (which created the world's first computer-animated feature film, *Toy Story*). Apple eventually bought NeXT, bringing Jobs back to revolutionize the company.

> **"The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle."**

---

## 3. Death is the Ultimate Life Agent
Confronting his initial cancer diagnosis led Jobs to appreciate the power of mortality as a decision-making tool.

> **"Remembering that you are going to die is the best way I know to avoid the trap of thinking you have something to lose. You are already naked. There is no reason not to follow your heart."**

Your time is limited, so don't waste it living someone else's life. Be brave enough to follow your own path.
`,
    twitterThread: [
      '1/ In 2005, Steve Jobs delivered one of the most iconic commencement addresses in history. His three simple stories contain timeless wisdom for anyone building a career or a business. A breakdown of his key lessons: 👇',
      '2/ Lesson 1: Connecting the Dots. You cannot connect them looking forward; you can only connect them looking backward. Dropouts, calligraphy classes, and unexpected paths shaped the Macintosh. Trust your intuition.',
      '3/ Lesson 2: Love & Loss. Being fired from Apple at 30 was devastating but ultimately liberating. It sparked the creation of Pixar and NeXT. Remember: "The only way to do great work is to love what you do. Don\'t settle."',
      '4/ Lesson 3: Confronting Mortality. Death is life\'s change agent. Remembering your time is limited prevents you from living someone else\'s life or thinking you have something to lose. Follow your heart.',
      '5/ Conclusion: "Stay Hungry, Stay Foolish." Never lose your curiosity, beginner\'s mind, or drive to push boundaries. Keep seeking. 🎯',
    ],
    socialSnippet: '🎓 "Stay Hungry, Stay Foolish." Steve Jobs’ legendary 2005 Stanford Commencement Address is a powerful reminder to trust our intuition, love our work, and embrace mortality to focus on what truly matters. Read the full timeline and chapters below! #SteveJobs #Inspiration #Productivity #CareerGrowth',
    quiz: [
      {
        question: 'What class did Steve Jobs "drop in" on at Reed College that later inspired Mac typography?',
        options: ['Calligraphy', 'Computer Science', 'Art History', 'Physics'],
        answerIndex: 0,
        explanation: 'Jobs dropped in on calligraphy classes after dropping out of Reed College, which later inspired the Macintosh\'s beautiful typography.',
      },
      {
        question: 'Which company did Steve Jobs co-found/lead after being fired from Apple that Apple eventually acquired?',
        options: ['Pixar', 'NeXT', 'Asana', 'Intel'],
        answerIndex: 1,
        explanation: 'Steve Jobs founded NeXT (and bought Pixar). Apple acquired NeXT in 1996 to bring Jobs back.',
      },
      {
        question: 'According to Steve Jobs, what is the single best tool to avoid the trap of thinking you have something to lose?',
        options: [
          'Securing venture capital',
          'Remembering that you are going to die',
          'Earning a Stanford degree',
          'Expanding your personal network',
        ],
        answerIndex: 1,
        explanation: 'Jobs asserts that remembering your own mortality is the ultimate way to stay focused on what truly matters.',
      },
    ],
    mindmap: [
      {
        concept: 'Steve Jobs Stanford Address',
        category: 'Core Thesis',
        description: 'Three personal stories highlighting connecting dots, love/loss, and mortality.',
      },
      {
        concept: 'Connecting the Dots',
        category: 'Steve Jobs Stanford Address',
        description: 'Trusting that diverse, seemingly unrelated interests will align in the future.',
      },
      {
        concept: 'Calligraphy Inspiration',
        category: 'Connecting the Dots',
        description: 'How a creative interest directly resulted in the Mac\'s proportional typography.',
      },
      {
        concept: 'Love and Loss',
        category: 'Core Thesis',
        description: 'How setbacks and failures can open creative opportunities.',
      },
      {
        concept: 'Getting Fired',
        category: 'Love and Loss',
        description: 'Being ousted from Apple was a creative rebirth that birthed NeXT and Pixar.',
      },
      {
        concept: 'Mortality as a Tool',
        category: 'Core Thesis',
        description: 'Using death to clear away external expectations and focus on what truly matters.',
      },
    ],
  },
  {
    metadata: {
      videoId: 'qp0HIF3SfI4',
      videoUrl: 'https://www.youtube.com/watch?v=qp0HIF3SfI4',
      title: 'Simon Sinek: How Great Leaders Inspire Action (The Golden Circle)',
      author: 'TED',
      thumbnailUrl: 'https://img.youtube.com/vi/qp0HIF3SfI4/maxresdefault.jpg',
      duration: '18 mins',
    },
    summary: 'Simon Sinek presents a simple but powerful model for inspirational leadership—starting with a "Golden Circle" of Why, How, and What. He explains that while normal organizations know WHAT they do and HOW they do it, truly inspiring leaders communicate from the inside out, beginning with WHY they exist. By appealing directly to the emotional centers of the human brain, this approach drives loyalty and action.',
    takeaways: [
      'The Golden Circle consists of three layers: Why (Purpose), How (Process), and What (Result). Inspiring leaders go inside-out.',
      'People do not buy WHAT you do; they buy WHY you do it. Loyalty is driven by shared belief, not feature lists.',
      'This framework is rooted in biology: the limbic brain, which controls feelings and decision-making, corresponds to the "Why" and "How".',
      'The law of diffusion of innovations shows that you cannot hook the mass market until you secure innovators and early adopters who share your belief.',
      'True leadership is about attracting believers, not just customers who need a transaction.',
    ],
    chapters: [
      {
        timestamp: '00:00',
        secondsCount: 0,
        title: 'The Golden Circle Concept',
        takeaway: 'Introduces the three concentric circles and the counter-intuitive logic of leading with Why.',
      },
      {
        timestamp: '03:45',
        secondsCount: 225,
        title: 'The Biology of Decision Making',
        takeaway: 'How modern neurology matches the circle: neocortex analyzes language, while the limbic brain commands feelings.',
      },
      {
        timestamp: '07:30',
        secondsCount: 450,
        title: 'The Apple Success Formula',
        takeaway: 'Dissects how Apple markets with belief first, enabling them to sell expensive MP3 players and computers with equal authority.',
      },
      {
        timestamp: '11:15',
        secondsCount: 675,
        title: 'The Law of Diffusion of Innovations',
        takeaway: 'Examines why mass adoption requires crossing the chasm starting with early advocates.',
      },
      {
        timestamp: '15:00',
        secondsCount: 900,
        title: 'The Wright Brothers vs. Samuel Langley',
        takeaway: 'Contrasts pursuit of wealth with pursuit of purpose, explaining how passion beat heavy corporate funding.',
      },
    ],
    blogPost: `# The Inside-Out Leadership Guide: Simon Sinek’s Golden Circle Explained
 
 Why are some companies more innovative, influential, and profitable than others? Why do they command such staggering loyalty from customers and employees alike?
 
 In one of the most popular TED Talks of all time, **Simon Sinek** unpacks the secret. It is not about larger budgets, better technology, or superior talent. It is about a simple, geometric formula he calls **The Golden Circle**.
 
 ---
 
 ## 1. What is The Golden Circle?
 Sinek notes that every single organization on Earth operates with three nested questions:
 1.  **What:** Every company knows *what* products or services they sell.
 2.  **How:** Some companies know *how* they do it—their secret processes or unique selling propositions (USPs).
 3.  **Why:** Very few companies can articulate *why* they do what they do. Note: "Why" is not about profit (that is a result). "Why" is your purpose, your cause, or your belief.
 
 Most businesses communicate from the **outside in** (What ➔ How ➔ Why). But inspiring organizations—such as Apple, Patagonia, or the Wright Brothers—communicate from the **inside out** (Why ➔ How ➔ What).
 
 ---
 
 ## 2. The Golden Circle is Rooted in Biology
 This isn't just a marketing theory; it corresponds precisely to how the human brain processes information:
 
 *   **The Neocortex (Outer level):** Corresponds to the *What*. It is responsible for analytical, rational thought and language.
 *   **The Limbic Brain (Inner levels):** Corresponds to the *How* and *Why*. This controls all human emotions, trust, behavioral decision-making, and has **no capacity for language**.
 
 When you describe features (What), you appeal to language centers. But when you address purpose (Why), you talk directly to the emotional part of the brain that triggers gut decisions.
 
 ---
 
 ## 3. People Buy "Why," Not "What"
 Sinek’s core thesis is simple: **People don’t buy what you do; they buy why you do it.**
 
 If you speak about what you believe, you will attract those who believe the same. This shared belief is what creates sustainable consumer trust and employee inspiration. Focus your brand's messaging loop here to cross the market chasm successfully.
 `,
    twitterThread: [
      '1/ Why do some brands command fierce loyalty while others compete on price? Simon Sinek’s legendary Golden Circle explanation is a masterclass in influence. A breakdown of his key lessons: 👇',
      '2/ The Golden Circle has 3 layers:\n• WHAT: The products/services you sell\n• HOW: Your unique process or USP\n• WHY: Your core purpose or belief.\n\nMost brands talk from What to Why. Inspiring brands do the reverse.',
      '3/ "People don\'t buy what you do; they buy why you do it." \n\nWhen communications start with the WHY, they target the limbic brain—the section that controls feelings, trust, and visceral decisions. Neocortex handles logic only.',
      '4/ Compare Apple vs. Dell:\n\nDell: "We make nice computers. They have high RAM. Want to buy?" (What ➔ How)\n\nApple: "We challenge the status quo inside design. We do this with elegant UX. Oh, and we make nice computers." (Why ➔ How ➔ What)',
      '5/ The Takeaway: Speak about what you believe to recruit believers. Hire people who share your cause (Why), not just those who need a salary (What). Start with Why. 🎯',
    ],
    socialSnippet: '💡 "People don\'t buy WHAT you do; they buy WHY you do it." Simon Sinek’s classic Golden Circle model reminds us to pitch our core purpose before our product specifications. Read the summarized chapters below! #Leadership #Marketing #BusinessSuccess #StartWithWhy',
    quiz: [
      {
        question: 'Which part of the human brain controls logic, analytical thought, and language?',
        options: ['The Limbic System', 'The Neocortex', 'The Cerebellum', 'The Amygdala'],
        answerIndex: 1,
        explanation: 'The neocortex is responsible for analytical thinking and language processing, while feelings are ruled by the limbic side.',
      },
      {
        question: 'What is the standard, ineffective direction of marketing communication?',
        options: [
          'Inside Out (Why ➔ How ➔ What)',
          'Outside In (What ➔ How ➔ Why)',
          'Top Down (Executive ➔ Employee)',
          'Bottom Up (user ➔ product)',
        ],
        answerIndex: 1,
        explanation: 'Most businesses start with what they do because it is easiest to explain, failing to communicate a deeper purpose.',
      },
    ],
    mindmap: [
      {
        concept: 'The Golden Circle',
        category: 'Core Thesis',
        description: 'Nested model of Why, How, and What of organizations.',
      },
      {
        concept: 'Limbic Brain Connection',
        category: 'The Golden Circle',
        description: 'How speaking to the inner circle drives true emotional decision-making.',
      },
      {
        concept: 'Diffusion of Innovation',
        category: 'Core Thesis',
        description: 'Reaching critical mass of adopters by starting with loyal believers.',
      },
    ],
  },
  {
    metadata: {
      videoId: 'TjZBTDzGeGg',
      videoUrl: 'https://www.youtube.com/watch?v=TjZBTDzGeGg',
      title: 'Introduction to Artificial Intelligence (MIT 6.S091)',
      author: 'MIT OpenCourseWare',
      thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
      duration: '45 mins',
    },
    summary: 'This session provides a comprehensive foundation to Artificial Intelligence, detailing the evolution of Machine Learning, Neural Networks, and modern Generative Large Language Models. We cover the transition from symbolic AI and expert systems to data-driven deep neural networks, culminating in the transformer architecture that powers today’s agentic systems.',
    takeaways: [
      'Symbolic AI vs. Neural Nets: Early AI relied on manual rules (expert systems), whereas modern AI learns patterns directly from data.',
      'Supervised Learning Basics: Neural Networks adjust their internal weights using gradient descent and backpropagation based on labeled examples.',
      'The Transformer Revolution: Self-attention mechanisms allow models to process sequence-based information in parallel, scaling context windows massively.',
      'Generative AI & Agentic loops: Modern AI is shifting from static chat completions to dynamic, goal-oriented agentic workflows.',
    ],
    chapters: [
      {
        timestamp: '00:00',
        secondsCount: 0,
        title: 'Evolution of Artificial Intelligence',
        takeaway: 'Contrasting early heuristic-based symbolic engines with modern gradient-based neural networks.',
      },
      {
        timestamp: '12:30',
        secondsCount: 750,
        title: 'Neural Networks & Deep Learning',
        takeaway: 'How multilayer perceptrons process inputs, calculate errors, and optimize weights via backpropagation.',
      },
      {
        timestamp: '25:15',
        secondsCount: 1515,
        title: 'Transformers and Attention Mechanisms',
        takeaway: 'A deep dive into how self-attention weights context tokens relative to each other dynamically.',
      },
      {
        timestamp: '38:40',
        secondsCount: 2320,
        title: 'The Shift to Agentic Workspaces',
        takeaway: 'Moving past simple text generation towards autonomous planning, reasoning, and tool use.',
      },
    ],
    blogPost: `# Masterclass: Introduction to Artificial Intelligence\n\nArtificial Intelligence has transitioned from a niche academic pursuit in the 1950s to the foundational technology defining the 21st century. In this masterclass outline, we unpack how modern AI models learn, scale, and function.\n\n## From Rules to Neural Representations\nHistorically, AI attempted to solve problems through **symbolic logic**—manually writing if/then statements for every possible scenario. This approach breaks down in complex environments like image recognition or translation.\n\nModern deep learning flips this model on its head: we provide thousands of inputs and outputs, and let high-dimensional matrices adjust themselves to find the mathematical function linking them.\n\n## The Transformer Architecture\nThe breakthrough powering modern agents is the **Transformer**, introduced in 2017. Transformers use a mechanism called **Self-Attention** to process entire sentences at once, unlocking parallel training and allowing models to build context maps across hundreds of thousands of words.`,
    twitterThread: [
      '1/ How does modern AI actually work? Moving past the buzzwords, here is a breakdown of Artificial Intelligence from its symbolic origins to modern neural architectures: 👇',
      '2/ Early AI (1950-1990) relied on Symbolic Logic & Expert Systems. It was static, manual, and couldn\'t handle real-world uncertainty. Modern AI is connectionist: it models pathways similar to biological neurons.',
      '3/ At the heart of Deep Learning is the neural network. By stacking layers of parameters, networks can model highly complex non-linear functions, learning purely from feedback loops like backpropagation.',
      '4/ The 2017 Transformer paper changed everything. Self-attention lets models see relations between all words simultaneously, leading to massive contextual awareness and the creation of Generative LLMs.',
      '5/ The next frontier: Agentic systems. AI is moving from standard question-answering into proactive, multi-step problem solvers capable of self-correction. 🚀',
    ],
    socialSnippet: '🤖 Deepen your understanding of AI! From symbolic heuristics to generative transformer networks and agentic workflows, explore our custom MIT-aligned Artificial Intelligence study kit! #ArtificialIntelligence #MachineLearning #TechEducation #MIT',
    quiz: [
      {
        question: 'What mathematical technique is used to adjust neural network weights during training?',
        options: [
          'Backpropagation & Gradient Descent',
          'Heuristic Guess-and-Check',
          'Linear Regression Projection',
          'Symbolic Logic Inference'
        ],
        answerIndex: 0,
        explanation: 'Backpropagation calculates the derivative of the loss function with respect to weights, which gradient descent uses to optimize the model.',
      },
      {
        question: 'What structural innovation enabled parallel training and modern Large Language Models?',
        options: [
          'The Self-Attention Transformer Mechanism',
          'Recurrent Neural Network loops',
          'Manual if/then Expert Systems',
          'Static Relational Database Indexes'
        ],
        answerIndex: 0,
        explanation: 'Self-attention allows the network to process entire sequences simultaneously, bypassing sequential recurrent bottlenecks.',
      },
    ],
    mindmap: [
      {
        concept: 'Artificial Intelligence',
        category: 'Core Field',
        description: 'Systems capable of performing human-like cognitive tasks.',
      },
      {
        concept: 'Machine Learning',
        category: 'Artificial Intelligence',
        description: 'Algorithms that train on data rather than relying on explicit programming.',
      },
      {
        concept: 'Deep Neural Networks',
        category: 'Machine Learning',
        description: 'Stacking layer nodes to approximate high-dimensional relationships.',
      },
      {
        concept: 'Transformer Architecture',
        category: 'Deep Neural Networks',
        description: 'Self-attention layers processing tokens in parallel blocks.',
      },
    ],
  },
  {
    metadata: {
      videoId: 'guZgP-SgW98',
      videoUrl: 'https://www.youtube.com/watch?v=guZgP-SgW98',
      title: 'Negotiation Strategy & Business Deals',
      author: 'Harvard Business School',
      thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop',
      duration: '20 mins',
    },
    summary: 'This masterclass breaks down fundamental negotiation principles used in high-stakes business deals, focusing on the Harvard Method of Principled Negotiation. It covers how to separate people from the problem, focus on interests rather than positions, invent options for mutual gain, and insist on using objective criteria. Understanding your BATNA (Best Alternative to a Negotiated Agreement) and your counterpart\'s motivation are shown to be the ultimate sources of leverage.',
    takeaways: [
      'Focus on interests, not positions: Positions are what people say they want; interests are the underlying needs, fears, and desires driving those demands.',
      'Always calculate your BATNA: Your Best Alternative to a Negotiated Agreement determines your walk-away power and real leverage in any situation.',
      'Separate the people from the problem: Human emotions and egos often derail critical commercial deals. Be soft on the people but tough on the issues.',
      'Create win-win options: Expand the pie before trying to divide it. Brainstorm multiple creative options that serve both sides\' interests.',
      'Anchor effectively: The first offer sets the conversational anchor. Only anchor first if you have strong market information; otherwise, listen first.'
    ],
    chapters: [
      {
        timestamp: '00:00',
        secondsCount: 0,
        title: 'Principled Negotiation Introduction',
        takeaway: 'Transitioning from positional bargaining (adversarial or soft) to principled bargaining (win-win cooperative problem solving).'
      },
      {
        timestamp: '04:15',
        secondsCount: 255,
        title: 'The Power of Interests vs Positions',
        takeaway: 'Uncovering the true underlying interests allows negotiators to find creative compromises that positions would block.'
      },
      {
        timestamp: '08:30',
        secondsCount: 510,
        title: 'BATNA: The Ultimate Source of Leverage',
        takeaway: 'Negotiation strength doesn\'t come from size or wealth, but from the viability of your walk-away alternative.'
      },
      {
        timestamp: '13:00',
        secondsCount: 780,
        title: 'Value Creation: Expanding the Pie',
        takeaway: 'Brainstorming non-monetary trade-offs (like delivery speed or warranty terms) to create joint gains for both parties.'
      },
      {
        timestamp: '17:45',
        secondsCount: 1065,
        title: 'Objective Criteria and Anchoring',
        takeaway: 'Basing agreements on fair standards (like market rates or legal precedents) rather than a battle of wills.'
      }
    ],
    blogPost: `# The Harvard Guide to Principled Negotiation: Securing Win-Win Business Deals\n\nNegotiating is a daily human activity, yet most people do it poorly. They fall into positional bargaining, either aggressively demanding concessions (hard positional) or yielding too easily to maintain harmony (soft positional).\n\n## Moving to Principled Negotiation\nDeveloped by the Harvard Negotiation Project, **Principled Negotiation** is designed to decide issues on their merits rather than through a battle of wills. It rests on four basic pillars:\n\n1. **People:** Separate the people from the problem.\n2. **Interests:** Focus on interests, not positions.\n3. **Options:** Generate a variety of possibilities before deciding what to do.\n4. **Criteria:** Insist that the result be based on some objective standard.\n\n## The Concept of BATNA\nYour **BATNA** (Best Alternative to a Negotiated Agreement) is your ultimate shield and sword. It is the course of action you will take if no agreement is reached. The stronger your BATNA, the greater your negotiating power. If your alternative is weak, you have very little room to walk away.`,
    twitterThread: [
      '1/ Struggling to close high-stakes business deals or get what you deserve? The Harvard Method of Principled Negotiation completely changes the game. Here is a masterclass breakdown on negotiating like a pro: 👇',
      '2/ Crucial lesson 1: Focus on interests, not positions. Positions are stubborn, superficial demands ("I want a 15% raise"). Interests are the underlying drivers ("I need to cover my increased mortgage rate"). Solve interests, not positions.',
      '3/ Crucial lesson 2: Separate the people from the problem. Ego and emotional reactivity ruin more deals than economics. Be deeply respectful to the people, but absolutely firm on the facts and metrics.',
      '4/ Crucial lesson 3: Know your BATNA (Best Alternative to a Negotiated Agreement). Your power is 100% defined by your walk-away alternative. If you have no backup plan, you aren\'t negotiating—you are pleading.',
      '5/ Crucial lesson 4: Expand the pie before slicing it. Bring non-monetary items (timing, terms, resources) to the table to trade off low-cost items for you that have high value to them. Negotiate holistically. 🎯'
    ],
    socialSnippet: '🤝 Master the art of negotiation! Discover the Harvard method of principled negotiation: separate people from problems, focus on interests, and maximize your BATNA to secure exceptional win-win deals. #Negotiation #BusinessSkills #HarvardBusiness #LeadershipTips',
    quiz: [
      {
        question: 'What does the acronym BATNA stand for in negotiation strategy?',
        options: [
          'Best Alternative to a Negotiated Agreement',
          'Business Association Tactics and National Alliances',
          'Buyer Agreement Terms and Negotiation Allotment',
          'Best Allocation of Tactics and Nominal Assets'
        ],
        answerIndex: 0,
        explanation: 'BATNA stands for Best Alternative to a Negotiated Agreement, representing your walk-away power.'
      },
      {
        question: 'What is the main difference between a Position and an Interest?',
        options: [
          'Positions are shallow demands; Interests are the underlying needs and desires.',
          'Positions are financial terms; Interests are social factors.',
          'Interests are legally binding; Positions are informal suggestions.',
          'There is no difference; they are synonymous terms.'
        ],
        answerIndex: 0,
        explanation: 'A position is a superficial demand (what you say you want), while an interest is the underlying motivation (why you want it).'
      }
    ],
    mindmap: [
      {
        concept: 'Principled Negotiation',
        category: 'Core Thesis',
        description: 'Harvard framework focusing on merits, fair criteria, and win-win solutions.'
      },
      {
        concept: 'BATNA',
        category: 'Principled Negotiation',
        description: 'Best Alternative to a Negotiated Agreement, representing your ultimate leverage.'
      },
      {
        concept: 'Interests vs Positions',
        category: 'Principled Negotiation',
        description: 'Separating what parties demand from what they actually need.'
      },
      {
        concept: 'Objective Criteria',
        category: 'Principled Negotiation',
        description: 'Using fair standards like market rates, laws, or professional certifications.'
      }
    ]
  },
  {
    metadata: {
      videoId: 'CBYhVcOn7To',
      videoUrl: 'https://www.youtube.com/watch?v=CBYhVcOn7To',
      title: 'How to Build a Billion-Dollar Startup',
      author: "Lenny's Podcast",
      thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=400&auto=format&fit=crop',
      duration: '45 mins',
    },
    summary: 'In this masterclass, elite product experts and startup founders share the playbook for scaling a startup from zero to a billion-dollar valuation. The discussion breaks down the exact mechanics of finding Product-Market Fit (PMF), building sustainable growth loops over transactional funnels, optimizing customer retention, and scaling from a single core product into a multi-product platform engine.',
    takeaways: [
      'Product-Market Fit is not a binary switch: It is a spectrum. Measure it using the Sean Ellis test (how disappointed would users be if your product disappeared tomorrow) and cohort retention curves.',
      'Prefer Growth Loops over Funnels: Traditional marketing funnels have a terminal state. Growth loops are self-sustaining engines where an active cohort\'s engagement organically feeds the acquisition of the next.',
      'Retention is the ultimate metric: If you have a leaky bucket, pouring in more marketing acquisition spend is useless. Prioritize retention cohort stabilization first before scaling paid acquisition.',
      'Find your North Star Metric: Identify the single metric that best captures the core value your product delivers to its customers, and align all engineering, product, and sales teams around it.',
      'Multi-product inflection: Don\'t launch product #2 too early. Master your core product line first, and only scale into adjacent markets when your primary engine is self-sustaining.'
    ],
    chapters: [
      {
        timestamp: '00:00',
        secondsCount: 0,
        title: 'The Truth About Product-Market Fit',
        takeaway: 'How to run quantitative validation on product demand, and the qualitative signals that confirm genuine product-market fit.'
      },
      {
        timestamp: '10:15',
        secondsCount: 615,
        title: 'Designing Virality and Growth Loops',
        takeaway: 'How companies like Slack and Zoom use product-led growth loops to turn active users into automatic distributors.'
      },
      {
        timestamp: '21:30',
        secondsCount: 1290,
        title: 'Plugging the Leaky Bucket: Cohort Retention',
        takeaway: 'Analyzing user retention cohorts and finding the "Aha! moment" (e.g., adding 10 friends in 7 days) to lock in lifelong engagement.'
      },
      {
        timestamp: '32:45',
        secondsCount: 1965,
        title: 'Choosing Your North Star Metric',
        takeaway: 'Aligning corporate strategy around a value-delivery metric (e.g., active listening hours for Spotify) rather than vanity metrics.'
      },
      {
        timestamp: '40:00',
        secondsCount: 2400,
        title: 'Scaling Into a Multi-Product Platform',
        takeaway: 'The strategic timing and playbook for introducing secondary product lines to double the company\'s total addressable market.'
      }
    ],
    blogPost: `# Building a Unicorn: Playbook for a Billion-Dollar Startup\n\nScale is the ultimate goal of modern venture-backed startups, yet over 90% of them fail before reaching self-sustainability. To build a "unicorn," founders must master product mechanics, cohort retention, and non-linear growth dynamics.\n\n## 1. Defining Product-Market Fit (PMF)\nMany founders mistake early PR spikes or marketing signups for Product-Market Fit. In reality, PMF is confirmed by a flat, stable cohort retention curve. If your user retention eventually asymptotes and stabilizes parallel to the x-axis, you have a viable product. If it continues its downward trajectory toward zero, you have a leaky bucket.\n\n## 2. Growth Loops vs. Funnels\nTraditional marketing relies on acquisition funnels (AIDA model). You pay for ads, drive traffic, get signups, and collect revenue. The problem? Funnels are linear and require constant capital. \n\nBillion-dollar companies are built on **Growth Loops**:\n- **User signs up** ➔ **Invites teammates** ➔ **Teammates sign up** ➔ **Invite more teammates**.\nThese loops feed themselves, turning user activity directly into free, compounding acquisition.`,
    twitterThread: [
      '1/ Want to build a compounding tech giant? Signups are vanity; retention and loops are sanity. Here are the core insights on how to build a billion-dollar startup: 👇',
      '2/ Product-Market Fit isn\'t an opinion; it is a math problem. Look at your retention cohorts. If the line flattens out over time (e.g., 30% of users stick around forever), you have PMF. If it slides to zero, stop marketing and fix the product.',
      '3/ Funnels are expensive; Loops are self-sustaining. Slack grew because one user inside a company naturally invited colleagues to collaborate. Build a product that gets objectively better the more colleagues are on it.',
      '4/ Find your "Aha! Moment." Facebook found that users who added 10 friends in 14 days were retained forever. Slack found it was 2,000 sent messages. Find this metric for your product and align onboarding to hit it.',
      '5/ The North Star Metric: Choose one metric that tracks value delivered to customers, NOT money made. For Airbnb, it is nights booked. For Spotify, it is music stream time. Optimize value, and revenue will follow. 🚀'
    ],
    socialSnippet: '🚀 Signups are vanity, retention is sanity! Unpack the playbook for building a billion-dollar tech startup: design viral product-led growth loops, flatline your retention curves, and locate your core North Star Metric. #Startups #ProductManagement #VentureCapital #GrowthStrategy',
    quiz: [
      {
        question: 'Which signal is the most accurate quantitative proof of Product-Market Fit?',
        options: [
          'A flat, stabilized cohort retention curve parallel to the x-axis',
          'A massive spike in PR coverage and website pageviews',
          'Winning a prestigious local startup pitch competition',
          'Securing a high-valuation seed round from venture capital'
        ],
        answerIndex: 0,
        explanation: 'A flat retention curve indicates a stable group of active users who find ongoing, recurring value in the product.'
      },
      {
        question: 'What makes a Growth Loop superior to a standard marketing Funnel?',
        options: [
          'Growth loops are self-sustaining engines where user activity fuels new acquisition.',
          'Growth loops are cheaper to build initially but require more manual effort.',
          'Funnels are outdated and never work under any circumstances.',
          'Growth loops focus exclusively on pricing plans and discount deals.'
        ],
        answerIndex: 0,
        explanation: 'Unlike linear funnels that require continuous paid inputs, growth loops turn active user engagement into new customer acquisitions.'
      }
    ],
    mindmap: [
      {
        concept: 'Unicorn Scaling Playbook',
        category: 'Core Thesis',
        description: 'Compounding start-up growth through product-led mechanics and stable retention.'
      },
      {
        concept: 'Product-Market Fit',
        category: 'Unicorn Scaling Playbook',
        description: 'Unlocking a stabilized, non-zero asymptotic cohort retention curve.'
      },
      {
        concept: 'Growth Loops',
        category: 'Unicorn Scaling Playbook',
        description: 'Self-feeding viral mechanisms turning user engagement into free distribution.'
      },
      {
        concept: 'North Star Metric',
        category: 'Unicorn Scaling Playbook',
        description: 'A single, central corporate metric tracking true value delivered to customers.'
      }
    ]
  },
  {
    metadata: {
      videoId: 'vN4U5y_937A',
      videoUrl: 'https://www.youtube.com/watch?v=vN4U5y_937A',
      title: 'iPhone 2007 Original Product Launch Keynote',
      author: 'Apple Historical Archives',
      thumbnailUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=400&auto=format&fit=crop',
      duration: '50 mins',
    },
    summary: 'This masterclass analyzes the historic 2007 Apple keynote address where Steve Jobs unveiled the original iPhone. The analysis focuses on presentation delivery, product positioning, and the design thinking behind combining three distinct devices—a widescreen iPod with touch controls, a revolutionary mobile phone, and a breakthrough internet communications device—into a single handheld unit that changed personal computing forever.',
    takeaways: [
      'The Power of the Rule of Three: Steve Jobs structured the entire introduction around three devices, repeating them over and over until the audience realized they were all housed in a single phone.',
      'Positioning against competitors: Jobs positioned the iPhone against contemporary smartphones (like Moto Q or BlackBerry) by showing they were neither smart nor easy to use.',
      'The multi-touch breakthrough: Replacing physical keyboards and styluses with multi-touch glass and gestures allowed the software user interface to evolve dynamically based on the application.',
      'The visual presentation masterclass: Keynotes are theatrical productions. Use large, high-contrast visual slides with minimal text, high suspense, and perfect comedic timing.',
      'Desktop-class web browsing: Demolishing "baby internet" WAP browsers by running full, desktop-class Safari on a mobile phone, marking the transition to true mobile computing.'
    ],
    chapters: [
      {
        timestamp: '00:00',
        secondsCount: 0,
        title: 'The Great Presentation Build-up',
        takeaway: 'How Steve Jobs sets the stage, building intense anticipation by teasing three revolutionary products before merging them.'
      },
      {
        timestamp: '12:00',
        secondsCount: 720,
        title: 'Redefining the Smartphone Interface',
        takeaway: 'Critiquing physical keyboards and the stylus, introducing multi-touch technology as a magical, highly intuitive replacement.'
      },
      {
        timestamp: '22:30',
        secondsCount: 1350,
        title: 'The Hardware and Software Integration',
        takeaway: 'Demonstrating OS X running on a phone, enabling real desktop-grade software, multitasking, and scrolling physics.'
      },
      {
        timestamp: '35:15',
        secondsCount: 2115,
        title: 'Desktop Internet in Your Pocket',
        takeaway: 'Unveiling fully responsive Google Maps, Safari browser, and email integration on a mobile screen, killing WAP.'
      },
      {
        timestamp: '45:00',
        secondsCount: 2700,
        title: 'Pricing, Partners, and the Future of Mobile',
        takeaway: 'The commercial rollout details, partnering with AT&T, pricing structure, and the predicted market share disruption.'
      }
    ],
    blogPost: `# Presentation Masterclass: Analyzing Steve Jobs’ 2007 iPhone Keynote\n\nOn January 9, 2007, Steve Jobs stepped onto the stage at San Francisco\'s Moscone Center and delivered what is widely considered the greatest product launch presentation in history. \n\n## 1. The Magical Hook: The Rule of Three\nJobs began with a simple but masterful framing. He told the audience that Apple was introducing three revolutionary products:\n1. A widescreen iPod with touch controls.\n2. A revolutionary mobile phone.\n3. A breakthrough internet communications device.\n\nHe repeated these three items—*iPod, phone, internet communicator*—several times until the crowd caught on: "These are not three separate devices. This is one device, and we are calling it **iPhone**."\n\n## 2. Redefining the Hardware Layer\nSmartphones of 2007 had plastic keyboards occupying 40% of their face. Jobs pointed out the fundamental flaw: whether you are using email, music, or maps, the buttons remain static. By replacing the keyboard with a multi-touch glass display, Apple created a canvas where the software could change dynamically depending on the app.\n\n## 3. Desktop Internet in Your Pocket\nPrior to the iPhone, mobile internet was a frustrating, text-only experience (WAP). Jobs showcased the mobile Safari browser rendering the full, uncompromised web. He also introduced fluid pinch-to-zoom gestures and inertia scrolling, making physical interaction feel tactile and magical.`,
    twitterThread: [
      '1/ On Jan 9, 2007, Steve Jobs delivered the most influential product presentation ever made. The storytelling, suspense, and positioning were flawless. Here is a breakdown of his keynote secrets: 👇',
      '2/ The Setup: He teased 3 separate devices: a widescreen touch iPod, a mobile phone, and an internet communicator. Repeating them over and over created massive suspense before dropping the punchline: "They are one device."',
      '3/ The Contrast: Jobs showed competitors (Nokia, BlackBerry, Moto) and mapped them on a 2x2 grid: "Smart" vs. "Easy to use." He argued competitors were hard to use and not very smart, positioning iPhone as the only highly smart AND easy phone.',
      '4/ The Keyboard Flaw: Why buttons on a phone? If you add a new software feature, you can\'t add a physical key. Glass with multi-touch solved this. The UI became 100% software, updating instantly for every application.',
      '5/ Tactile Magic: Inertia scrolling and pinch-to-zoom made interaction feel biological. The device responded to physical touch intuitively. This keynote redefined communication, presentation design, and technology. 📱'
    ],
    socialSnippet: '📱 Step back in time to the most famous product launch in history! Unpack Steve Jobs’ 2007 iPhone keynote: discover the rules of three, competitive grid positioning, and the multi-touch interface that changed computing forever. #SteveJobs #PresentationDesign #ProductStrategy #AppleHistory',
    quiz: [
      {
        question: 'What three separate categories of devices did Steve Jobs claim Apple was launching in 2007?',
        options: [
          'An iPod, a mobile phone, and an internet communicator',
          'A camera, a calculator, and a desktop PC',
          'A music player, a digital watch, and a GPS system',
          'A gaming console, a video recorder, and a smartphone'
        ],
        answerIndex: 0,
        explanation: 'Jobs repeated "a widescreen iPod with touch controls, a revolutionary mobile phone, and a breakthrough internet communications device" to set up the reveal.'
      },
      {
        question: 'Why did Steve Jobs argue that physical keyboards were a massive design flaw for smartphones?',
        options: [
          'They took up valuable screen space and could not change or adapt to different applications.',
          'They broke too easily and were expensive to manufacture.',
          'They were too small for the average user\'s fingers.',
          'They only supported English layout characters.'
        ],
        answerIndex: 0,
        explanation: 'Physical keyboards are permanent, whereas a software-based touch UI adapts dynamically to the requirements of each active application.'
      }
    ],
    mindmap: [
      {
        concept: '2007 iPhone Launch Keynote',
        category: 'Core Thesis',
        description: 'Analyzing the marketing, positioning, and engineering breakthroughs of the original iPhone.'
      },
      {
        concept: 'The Rule of Three',
        category: '2007 iPhone Launch Keynote',
        description: 'Using three distinct descriptors to hook attention and create narrative suspense.'
      },
      {
        concept: 'Dynamic Software UI',
        category: '2007 iPhone Launch Keynote',
        description: 'Replacing permanent physical buttons with software elements on a touch display.'
      },
      {
        concept: 'Desktop Mobile Web',
        category: '2007 iPhone Launch Keynote',
        description: 'Transitioning from text-only WAP protocols to full, uncompromised Safari web browsing.'
      }
    ]
  },
  {
    metadata: {
      videoId: 'aircAruvnKk',
      videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
      title: 'MIT 6.S191: Introduction to Deep Learning',
      author: 'MIT OpenCourseWare',
      thumbnailUrl: 'https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg',
      duration: '115 mins',
    },
    summary: 'An authoritative introduction to deep learning fundamentals from MIT. Covers neural network building blocks, perceptrons, activation functions, loss functions, backpropagation via gradient descent, and advanced optimization algorithms like Adam. Essential for understanding modern AI architectures.',
    takeaways: [
      'Perceptrons & Activation Functions: Non-linear activation functions (ReLU, Sigmoid) are essential for neural networks to approximate complex non-linear functions.',
      'Gradient Descent & Backpropagation: Backpropagation uses the chain rule of calculus to compute loss gradients relative to weights, enabling automated learning.',
      'Loss Function Selection: Binary cross-entropy, mean squared error, and categorical cross-entropy guide parameter tuning based on problem domain.',
      'Optimization & Regularization: Adam and Momentum optimizers prevent stagnation in local minima, while Dropout prevents overfitting.',
      'Deep Network Scaling: Layer depth enables hierarchical abstraction, from simple edge detection to complex semantic understanding.'
    ],
    chapters: [
      { timestamp: '00:00', secondsCount: 0, title: 'Course Overview & Deep Learning Era', takeaway: 'Why deep learning transformed computer vision, NLP, and decision intelligence.' },
      { timestamp: '18:30', secondsCount: 1110, title: 'The Perceptron & Neural Building Blocks', takeaway: 'Mathematical breakdown of weights, biases, linear combinations, and non-linear activations.' },
      { timestamp: '42:15', secondsCount: 2535, title: 'Loss Functions & Optimization', takeaway: 'Measuring network error and navigating high-dimensional loss landscapes.' },
      { timestamp: '75:00', secondsCount: 4500, title: 'Backpropagation Algorithm', takeaway: 'Applying the chain rule backward from output to input to update network parameters.' },
      { timestamp: '100:20', secondsCount: 6020, title: 'Regularization & Generalization', takeaway: 'Using Dropout, batch normalization, and early stopping to prevent memorization.' }
    ],
    blogPost: `# MIT 6.S191: Master Deep Learning Fundamentals\n\nDeep learning powers today's AI revolution. In this famous lecture from MIT OpenCourseWare, leading researchers break down the core mathematics and intuitions behind artificial neural networks.\n\n## 1. What is a Perceptron?\nThe fundamental unit of a neural network is the perceptron. It takes input vector x, applies weight matrix W and bias b, and passes the result through a non-linear activation function.\n\n## 2. Why Activation Functions Matter\nWithout non-linear activations like ReLU or Sigmoid, a multi-layer neural network collapses mathematically into a single linear regression model. Non-linearities unlock deep expressiveness.\n\n## 3. Backpropagation Unlocked\nLearning happens through backpropagation. By calculating partial derivatives of the loss function using the calculus chain rule, the network adjusts weights in the direction that minimizes prediction error.`,
    twitterThread: [
      '1/ Want to master Deep Learning? Here is a breakdown of MIT\'s famous 6.S191 intro lecture: 🧵',
      '2/ Perceptrons combine inputs with weights and bias. Non-linear activations (ReLU) enable learning non-linear patterns.',
      '3/ Loss functions quantify prediction error. Gradient descent steps down the loss hill to find optimal weights.',
      '4/ Backpropagation uses the chain rule to propagate error backward layer by layer.',
      '5/ Regularization (Dropout) keeps models generalizable so they perform well on unseen data. 🧠'
    ],
    socialSnippet: '🧠 Master Deep Learning with MIT 6.S191! Explore neural network math, loss landscapes, and backpropagation in this comprehensive interactive study deck. #DeepLearning #MIT #AI #MachineLearning',
    quiz: [
      {
        question: 'What happens to a multi-layer neural network if no non-linear activation functions are used?',
        options: [
          'It collapses mathematically into a single linear function.',
          'It becomes exponentially faster to train.',
          'It automatically regularizes itself against overfitting.',
          'It can only process image data.'
        ],
        answerIndex: 0,
        explanation: 'Linear combinations of linear functions are still linear. Without non-linear activations, a 100-layer network has no more representational power than a single-layer linear model.'
      },
      {
        question: 'Which mathematical rule forms the cornerstone of the backpropagation algorithm?',
        options: ['The Chain Rule of Calculus', 'Bayes Theorem', 'L\'Hôpital\'s Rule', 'Pythagorean Theorem'],
        answerIndex: 0,
        explanation: 'Backpropagation computes the derivative of the final loss relative to intermediate weights by multiplying local gradients using the chain rule.'
      }
    ],
    mindmap: [
      { concept: 'MIT Deep Learning', category: 'Architecture', description: 'Core principles of neural networks and deep learning architectures.' },
      { concept: 'Perceptron', category: 'MIT Deep Learning', description: 'Linear dot product plus bias fed into an activation function.' },
      { concept: 'Backpropagation', category: 'MIT Deep Learning', description: 'Reverse-mode automatic differentiation using calculus chain rule.' },
      { concept: 'Regularization', category: 'MIT Deep Learning', description: 'Techniques like Dropout and Batch Norm to improve generalization.' }
    ],
    keyConcepts: [
      { concept: 'Neural Network', definition: 'A computational model inspired by biological brains, structured in input, hidden, and output layers.', simplifiedExplanation: 'Think of it as a series of connected dials that tune themselves to recognize complex patterns.' },
      { concept: 'Backpropagation', definition: 'An algorithm for supervised learning of artificial neural networks using gradient descent.', simplifiedExplanation: 'Like reviewing exam mistakes backward to figure out exactly which study habits to tweak.' },
      { concept: 'Activation Function', definition: 'A mathematical gate in a neural network node that determines if it should fire.', simplifiedExplanation: 'A light switch that only turns on when enough signal pushes past its threshold.' }
    ],
    flashcards: [
      { question: 'What is the role of weights in a neural network layer?', answer: 'Weights determine the relative importance or strength of each input feature in influencing the node\'s output.' },
      { question: 'Why is Adam optimizer preferred over standard SGD?', answer: 'Adam uses adaptive learning rates for each parameter by combining ideas from Momentum and RMSprop.' }
    ],
    rememberSummary: 'Deep learning thrives on non-linear activations, loss minimization via gradient descent, and chain-rule backpropagation to tune network weights efficiently.',
    reelScript: {
      title: 'MIT Deep Learning in 60 Seconds',
      hookType: 'Educational Mind-Blower',
      estimatedDuration: 45,
      themeSuggestion: 'Futuristic AI Neon',
      scenes: [
        { sceneNumber: 1, durationSeconds: 10, visualHook: 'MIT Lecture hall with glowing neural networks', voiceover: 'Ever wondered how AI actually learns? MIT breaks it down in 3 simple steps.', textOverlay: 'How AI Thinks 🧠' },
        { sceneNumber: 2, durationSeconds: 20, visualHook: 'Interactive math diagram of backpropagation', voiceover: 'First: inputs multiply by weights. Second: non-linear activations unlock complex reasoning. Third: backprop fixes mistakes.', textOverlay: 'Weights + Activations + Backprop' },
        { sceneNumber: 3, durationSeconds: 15, visualHook: 'Animated accuracy meter shooting up to 99%', voiceover: 'That is how neural networks conquer vision, speech, and reasoning!', textOverlay: 'Master AI Today 🚀' }
      ],
      readyMadeCaption: 'Learn MIT Deep Learning concepts in 60s! #AI #Tech #MIT #Learning',
      callToAction: 'Study the full interactive deck on Zipytiny!'
    }
  },
  {
    metadata: {
      videoId: '67_aMPDk28U',
      videoUrl: 'https://www.youtube.com/watch?v=67_aMPDk28U',
      title: 'Y Combinator: How to Build an AI Startup in 2026',
      author: 'Y Combinator',
      thumbnailUrl: 'https://img.youtube.com/vi/67_aMPDk28U/hqdefault.jpg',
      duration: '90 mins',
    },
    summary: 'A strategic, actionable guide from Y Combinator partners on building defensible AI startups. Covers agentic workflows, serverless vector databases, model selection trade-offs, and building enduring moats beyond simple wrapper applications.',
    takeaways: [
      'Moat Building: Proprietary data flywheels and deep workflow integration create long-term enterprise moats.',
      'Agentic Systems: Shifting from single prompt-response loops to autonomous, multi-step agent feedback loops.',
      'Cost & Efficiency: Optimizing token usage via caching, smaller fine-tuned models, and hybrid execution.',
      'Distribution Advantage: Speed of iteration and founder-led sales beat incumbents before they react.'
    ],
    chapters: [
      { timestamp: '00:00', secondsCount: 0, title: 'The 2026 AI Founder Opportunity', takeaway: 'Why lower latency and reasoning models create new product categories.' },
      { timestamp: '22:10', secondsCount: 1330, title: 'Architecting Agentic Workflows', takeaway: 'Building reliable state machines around non-deterministic LLM calls.' },
      { timestamp: '50:40', secondsCount: 3040, title: 'Data Flywheels & Enterprise Defensibility', takeaway: 'Turning active customer usage into proprietary fine-tuning datasets.' },
      { timestamp: '75:00', secondsCount: 4500, title: 'Pricing & Unit Economics', takeaway: 'Value-based pricing models vs raw API cost pass-throughs.' }
    ],
    blogPost: `# Y Combinator Guide: Building Next-Gen AI Startups\n\nAI is reshaping startup playbook basics. In this seminal talk, Y Combinator partners lay out what differentiates breakout startups from temporary wrapper tools.\n\n## 1. Beyond the Wrapper\nIf your startup is just an API call behind a basic UI, a model upgrade from Google or OpenAI can replace you overnight. You need workflow lock-in and unique data loops.\n\n## 2. Agentic Autonomy\nThe biggest market opportunities lie in autonomous workflows that replace multi-hour human tasks rather than just drafting single text completions.`,
    twitterThread: [
      '1/ Y Combinator\'s top advice for AI founders in 2026: 🧵',
      '2/ Don\'t build thin wrappers. Build deep workflow integrations that become essential.',
      '3/ Agentic multi-step loops outperform simple single-shot prompts.',
      '4/ Price on value created, not on raw token costs. 💡'
    ],
    socialSnippet: '🚀 Building an AI startup? Explore Y Combinator\'s 2026 playbook on defensibility, agentic systems, and distribution strategy. #Startups #YCombinator #AI #Entrepreneurship',
    quiz: [
      {
        question: 'What is considered the strongest moat for an AI startup according to Y Combinator?',
        options: ['Proprietary data flywheels and workflow integration', 'A secret prompt template', 'Buying expensive GPU hardware', 'Having a fancy domain name'],
        answerIndex: 0,
        explanation: 'Workflows embedded deeply into user daily routines combined with proprietary data feedback loops create enduring competitive moats.'
      }
    ],
    mindmap: [
      { concept: 'YC AI Playbook', category: 'Strategy', description: 'Building high-growth defensible AI companies.' },
      { concept: 'Agentic Workflows', category: 'YC AI Playbook', description: 'Autonomous multi-step execution loops.' },
      { concept: 'Data Flywheel', category: 'YC AI Playbook', description: 'Usage data feeding proprietary model fine-tuning.' }
    ],
    keyConcepts: [
      { concept: 'Agentic Workflow', definition: 'An AI system that autonomously executes multi-step tasks, uses tools, and evaluates its own progress.', simplifiedExplanation: 'An AI assistant that does not just write an email, but researches the recipient, drafts, edits, and schedules it.' }
    ],
    flashcards: [
      { question: 'Why is value-based pricing crucial for AI startups?', answer: 'Value-based pricing aligns your revenue with customer ROI rather than fluctuating API token expenses.' }
    ],
    rememberSummary: 'Win in AI by embedding deep into customer workflows, leveraging agentic execution, and building data flywheels.',
    reelScript: {
      title: 'How to Build an AI Startup',
      hookType: 'Startup Secret',
      estimatedDuration: 40,
      themeSuggestion: 'Minimalist Tech',
      scenes: [
        { sceneNumber: 1, durationSeconds: 10, visualHook: 'Y Combinator logo and silicon valley cityscape', voiceover: 'Stop building thin AI wrappers! Here is Y Combinator\'s formula for real defensibility.', textOverlay: 'YC AI Playbook 🚀' }
      ],
      readyMadeCaption: 'YC guide for AI founders! #Startups #Tech #YCombinator',
      callToAction: 'View full study guide on Zipytiny!'
    }
  },
  {
    metadata: {
      videoId: 'gXVUJjp462U',
      videoUrl: 'https://www.youtube.com/watch?v=gXVUJjp462U',
      title: 'Stanford Neuroscience: Deep Work & Focus Mastery',
      author: 'Stanford Seminars',
      thumbnailUrl: 'https://img.youtube.com/vi/gXVUJjp462U/hqdefault.jpg',
      duration: '120 mins',
    },
    summary: 'A neuroscience-backed exploration of human focus, cognitive stamina, dopamine regulation, and attention management. Learn how to structure 90-minute ultradian focus cycles, eliminate context switching, and boost daily mental throughput.',
    takeaways: [
      'Ultradian Rhythms: Human focus naturally operates in 90-minute cognitive cycles.',
      'Attention Residue: Frequent context switching severely impairs problem-solving depth.',
      'Dopamine Baseline: Managing stimulation spikes preserves long-term intrinsic motivation.'
    ],
    chapters: [
      { timestamp: '00:00', secondsCount: 0, title: 'Neuroscience of Human Attention', takeaway: 'How the prefrontal cortex directs executive attention.' },
      { timestamp: '30:15', secondsCount: 1815, title: 'Ultradian Focus Cycles', takeaway: 'Structuring 90-minute deep work blocks for maximum retention.' }
    ],
    blogPost: `# Neuroscience of Focus: Master Deep Work\n\nUnderstand how your brain manages attention and energy to achieve flow states on demand.`,
    twitterThread: ['1/ Science-backed focus habits from Stanford neuroscience: 🧵', '2/ Work in 90-minute ultradian blocks for peak cognitive throughput.'],
    socialSnippet: '🧠 Boost your cognitive focus with neuroscience principles from Stanford! #Productivity #Neuroscience #DeepWork',
    quiz: [{ question: 'What is the optimal length of a natural ultradian focus cycle?', options: ['90 minutes', '20 minutes', '4 hours', '10 minutes'], answerIndex: 0, explanation: 'Neuroscience research shows human alertness peaks and declines in approximately 90-minute ultradian rhythms.' }],
    mindmap: [{ concept: 'Focus Mastery', category: 'Neuroscience', description: 'Brain mechanisms governing attention.' }],
    keyConcepts: [{ concept: 'Attention Residue', definition: 'The cognitive lag when switching tasks before full focus is restored.', simplifiedExplanation: 'Mental dust left behind when you quickly check your phone while studying.' }],
    flashcards: [{ question: 'How do ultradian rhythms affect study sessions?', answer: 'They dictate 90-minute peak focus windows followed by required rest to restore neurotransmitters.' }],
    rememberSummary: 'Leverage 90-minute focus blocks, minimize interruptions, and regulate dopamine for sustainable focus.',
    reelScript: {
      title: 'Stanford Focus Protocol',
      hookType: 'Life Hack',
      estimatedDuration: 30,
      themeSuggestion: 'Clean Slate',
      scenes: [{ sceneNumber: 1, durationSeconds: 10, visualHook: 'Brain scan visual with glowing focus nodes', voiceover: 'Stanford neuroscience reveals the 90-minute focus secret.', textOverlay: 'Deep Work Protocol 🧠' }],
      readyMadeCaption: 'Master deep focus with Stanford science! #Focus #Productivity',
      callToAction: 'Get the study deck on Zipytiny!'
    }
  },
  {
    metadata: {
      videoId: '0I25N26aUOk',
      videoUrl: 'https://www.youtube.com/watch?v=0I25N26aUOk',
      title: 'MCAT Biochemistry: Metabolic Pathways & Enzyme Kinetics',
      author: 'Harvard Medical Prep',
      thumbnailUrl: 'https://img.youtube.com/vi/0I25N26aUOk/hqdefault.jpg',
      duration: '140 mins',
    },
    summary: 'A thorough review of essential MCAT biochemistry topics: Glycolysis, Krebs Cycle, Oxidative Phosphorylation, Gluconeogenesis, and Michaelis-Menten enzyme kinetics.',
    takeaways: [
      'Glycolysis Rate Limiting Step: PFK-1 regulates glycolytic flux based on ATP/AMP energy ratios.',
      'Michaelis-Menten Equation: Km represents the substrate concentration at half-maximal velocity (Vmax/2).'
    ],
    chapters: [
      { timestamp: '00:00', secondsCount: 0, title: 'Glycolysis & Regulation', takeaway: 'Key enzymatic controls in glucose breakdown.' }
    ],
    blogPost: `# MCAT Biochemistry Masterclass\n\nConquer metabolic pathways with clear visual breakdowns and high-yield mnemonics.`,
    twitterThread: ['1/ Ace your MCAT Biochem exam with these core insights: 🧵'],
    socialSnippet: '🩺 Master MCAT Biochemistry pathways and enzyme kinetics with interactive practice quizzes! #MCAT #Biochemistry #PreMed',
    quiz: [{ question: 'What is the rate-limiting enzyme of glycolysis?', options: ['Phosphofructokinase-1 (PFK-1)', 'Hexokinase', 'Pyruvate Kinase', 'Aldolase'], answerIndex: 0, explanation: 'PFK-1 is the primary rate-limiting and regulatory enzyme of glycolysis.' }],
    mindmap: [{ concept: 'Metabolism', category: 'Biochemistry', description: 'Cellular energy production pathways.' }],
    keyConcepts: [{ concept: 'Km (Michaelis Constant)', definition: 'Substrate concentration at which reaction rate is half of Vmax.', simplifiedExplanation: 'Measures enzyme affinity: lower Km means higher affinity.' }],
    flashcards: [{ question: 'Where does the Krebs Cycle take place?', answer: 'In the mitochondrial matrix.' }],
    rememberSummary: 'Master PFK-1 regulation, Michaelis-Menten kinetics, and ATP yield calculations for MCAT prep.',
    reelScript: {
      title: 'MCAT Biochem Made Easy',
      hookType: 'Exam Prep',
      estimatedDuration: 30,
      themeSuggestion: 'Medical Blue',
      scenes: [{ sceneNumber: 1, durationSeconds: 10, visualHook: 'Mitochondria 3D animation', voiceover: 'Mastering MCAT Biochem pathways in under a minute!', textOverlay: 'MCAT Biochem 🩺' }],
      readyMadeCaption: 'High-yield MCAT Biochem deck! #PreMed #MCAT',
      callToAction: 'Practice on Zipytiny now!'
    }
  },
  {
    metadata: {
      videoId: 'yA53v7s0R-A',
      videoUrl: 'https://www.youtube.com/watch?v=yA53v7s0R-A',
      title: 'Constitutional Law: Supreme Court Precedents & Due Process',
      author: 'Yale Law School',
      thumbnailUrl: 'https://img.youtube.com/vi/yA53v7s0R-A/hqdefault.jpg',
      duration: '105 mins',
    },
    summary: 'An in-depth legal review of 14th Amendment Equal Protection, Procedural and Substantive Due Process, and judicial standards of review.',
    takeaways: [
      'Scrutiny Tiers: Strict Scrutiny requires a compelling state interest and narrow tailoring.'
    ],
    chapters: [{ timestamp: '00:00', secondsCount: 0, title: '14th Amendment Framework', takeaway: 'Understanding Due Process and Equal Protection.' }],
    blogPost: `# Constitutional Law Review\n\nDetailed breakdown of landmark Supreme Court precedents.`,
    twitterThread: ['1/ Constitutional Law key precedents summarized: 🧵'],
    socialSnippet: '⚖️ Essential Constitutional Law review for law students and legal enthusiasts. #LawSchool #ConLaw',
    quiz: [{ question: 'Which level of judicial scrutiny applies to suspect classifications like race?', options: ['Strict Scrutiny', 'Intermediate Scrutiny', 'Rational Basis', 'Arbitrary Scrutiny'], answerIndex: 0, explanation: 'Racial classifications trigger Strict Scrutiny, requiring a compelling government interest.' }],
    mindmap: [{ concept: 'Con Law', category: 'Legal Framework', description: 'Constitutional rights and judicial review.' }],
    keyConcepts: [{ concept: 'Strict Scrutiny', definition: 'The highest standard of judicial review applied by U.S. courts.', simplifiedExplanation: 'The law must serve a compelling state interest and be narrowly tailored.' }],
    flashcards: [{ question: 'What triggers Rational Basis review?', answer: 'General economic or social welfare legislation without suspect classifications.' }],
    rememberSummary: 'Know the three tiers of judicial scrutiny and landmark 14th Amendment precedents.',
    reelScript: {
      title: 'Con Law Tiers of Scrutiny',
      hookType: 'Legal Explainer',
      estimatedDuration: 30,
      themeSuggestion: 'Legal Scales',
      scenes: [{ sceneNumber: 1, durationSeconds: 10, visualHook: 'Supreme Court building graphic', voiceover: 'Understanding judicial scrutiny tiers in Constitutional Law!', textOverlay: 'Con Law Prep ⚖️' }],
      readyMadeCaption: 'Con Law exam study deck! #LawSchool #ConLaw',
      callToAction: 'Study legal cases on Zipytiny!'
    }
  },
  {
    metadata: {
      videoId: 'F_Riqjdh2oM',
      videoUrl: 'https://www.youtube.com/watch?v=F_Riqjdh2oM',
      title: 'Quantum Computing Foundations: Qubits & Entanglement',
      author: 'IBM Quantum',
      thumbnailUrl: 'https://img.youtube.com/vi/F_Riqjdh2oM/hqdefault.jpg',
      duration: '80 mins',
    },
    summary: 'A clear introduction to quantum computing principles: Bloch sphere, superposition, quantum logic gates, entanglement, and algorithm speedups.',
    takeaways: [
      'Superposition vs Classical Bits: Qubits exist in linear combinations of 0 and 1 until measured.'
    ],
    chapters: [{ timestamp: '00:00', secondsCount: 0, title: 'Qubits & Bloch Sphere', takeaway: 'Representing quantum states in complex Hilbert space.' }],
    blogPost: `# Quantum Computing Foundations\n\nDemystifying quantum mechanics for computer scientists.`,
    twitterThread: ['1/ Quantum Computing basics made simple: 🧵'],
    socialSnippet: '⚛️ Explore qubits, superposition, and entanglement in this interactive Quantum Computing deck. #Quantum #Tech',
    quiz: [{ question: 'What property allows a qubit to represent 0 and 1 simultaneously?', options: ['Superposition', 'Entanglement', 'Interference', 'Decoherence'], answerIndex: 0, explanation: 'Superposition enables qubits to exist in a linear combination of states simultaneously.' }],
    mindmap: [{ concept: 'Quantum Computing', category: 'Physics & CS', description: 'Quantum mechanics for information processing.' }],
    keyConcepts: [{ concept: 'Qubit', definition: 'The fundamental unit of quantum information.', simplifiedExplanation: 'Unlike a classical light switch (0 or 1), a qubit is like a spinning coin.' }],
    flashcards: [{ question: 'What is quantum entanglement?', answer: 'A phenomenon where quantum states of two or more qubits are inextricably linked regardless of distance.' }],
    rememberSummary: 'Master superposition, quantum gates (Hadamard, CNOT), and entanglement foundations.',
    reelScript: {
      title: 'Quantum Computing 101',
      hookType: 'Tech Marvel',
      estimatedDuration: 30,
      themeSuggestion: 'Quantum Glow',
      scenes: [{ sceneNumber: 1, durationSeconds: 10, visualHook: 'Glowing Bloch sphere animation', voiceover: 'Quantum computing is changing technology forever!', textOverlay: 'Quantum 101 ⚛️' }],
      readyMadeCaption: 'Quantum computing foundations! #Quantum #Tech #Innovation',
      callToAction: 'Learn on Zipytiny today!'
    }
  }
];

