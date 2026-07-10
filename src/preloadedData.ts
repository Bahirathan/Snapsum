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
      videoId: 'intro-ai',
      videoUrl: 'https://www.youtube.com/watch?v=intro-ai',
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
];
