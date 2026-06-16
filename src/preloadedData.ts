/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { YouTubeSummaryResponse } from './types';

export const PRELOADED_VIDEOS: YouTubeSummaryResponse[] = [
  {
    metadata: {
      videoId: 'CBYhVcOnK8Y',
      videoUrl: 'https://www.youtube.com/watch?v=CBYhVcOnK8Y',
      title: 'How to Start a Startup - Dustin Moskovitz (YC Startup School)',
      author: 'Y Combinator',
      thumbnailUrl: 'https://img.youtube.com/vi/CBYhVcOnK8Y/maxresdefault.jpg',
      duration: '24 mins',
    },
    summary: 'In this classic Y Combinator lecture, Dustin Moskovitz (co-founder of Facebook and Asana) delivers a realistic talk on "Why to Start a Startup". Defying popular media glamorization, Dustin explores the true stresses, duties, and motivations of founders. He outlines that the most successful founders do not seek status, control, or wealth, but rather are compelled by a problem that they simply must solve because the world needs it.',
    takeaways: [
      'The media glamorizes the "startup lifestyle"—real startup existence consists of constant high stress, massive risk, and relentless work.',
      'True passion for an idea is the only sustainable driver. Starting a company just to make money or be your own boss is highly counter-productive.',
      'As a founder, you are NOT your own boss; you report to everyone—team, customers, investors, and partners.',
      'Successful startups require extreme focus on solving a core user problem rather than chasing flashy PR or hiring milestones.',
      'Execution is everything. Ideas are valuable, but a masterfully executed average idea beats a mediocrely executed great idea every single time.',
    ],
    chapters: [
      {
        timestamp: '00:00',
        secondsCount: 0,
        title: 'Introduction & Startup Myths',
        takeaway: 'Dustin breaks down the romanticized startup narrative perpetuated by movies and social media.',
      },
      {
        timestamp: '04:15',
        secondsCount: 255,
        title: 'Evaluating Your True Motivation',
        takeaway: 'Examines why status, wealth, and flexibility are usually illusions for early-stage founders.',
      },
      {
        timestamp: '10:30',
        secondsCount: 630,
        title: 'The Burden of Extreme Responsibility',
        takeaway: 'Highlights how founders carry the psychological stress of everyone on their team failing or succeeding.',
      },
      {
        timestamp: '16:45',
        secondsCount: 1005,
        title: 'The Compelling Reason to Build',
        takeaway: 'You should only start a startup if you feel a problem is so urgent that you cannot live without creating its solution.',
      },
      {
        timestamp: '22:00',
        secondsCount: 1320,
        title: 'Final Takeaway and Q&A',
        takeaway: 'A realistic summary on measuring success through user value over capital raised.',
      },
    ],
    blogPost: `# Demystifying the Startup Dream: Why Dustin Moskovitz Says You Probably Shouldn't Start a Startup

In the age of tech giants and overnight unicorns, the media has painted a highly seductive picture of the entrepreneur. We envision late-night brainstorms, massive funding announcements, instant fame, and the absolute freedom of "being your own boss."

But in his famous lecture at Y Combinator's Startup School, **Dustin Moskovitz** (co-founder of Facebook and Asana) pulls back the curtain. His message is clear, grounded, and essential for any aspiring builder: **most of what you believe about starting a startup is a myth.**

---

## 1. The Glitz vs. The Reality
Dustin points out that the cinematic depiction of startup life lacks the compounding stress and sleepless weeks that dominate a founder's schedule. While the film *The Social Network* showed high-stakes boardrooms and party-filled lifestyles, the day-to-day reality in Palo Alto was simple, repetitive desk labor.

> **"It is incredibly hard work. You are on the hook, always."**

Startups require high emotional resilience. When things go wrong—and they always do—the weight of failure falls squarely on the founders' shoulders.

---

## 2. The Illusion of Control
One of the most persistent misconceptions is that starting a company grants you master-level control over your schedule. Dustin explains that as a founder, your level of responsibility balloons:

*   **You report to your employees:** If they aren't equipped, you fail.
*   **You report to your customers:** If they are unhappy, you have no product.
*   **You report to your investors:** They expect astronomical compound growth.

Instead of reporting to a single manager, you now report to the entire ecosystem of your business.

---

## 3. The Only Valid Reason to Start
If not for wealth, status, or flexibility, why start? Dustin offers the only bulletproof motivation: **compulsion**.

You should start a startup if and only if you find a problem so deeply urgent, so completely ignored by the world, that you feel an absolute duty to fix it yourself. Passion sustains you when funding dries up or launch metrics fall flat. Use that pressure to determine whether you are ready to ship.
`,
    twitterThread: [
      '1/ Ready to start a startup? Dustin Moskovitz (co-founder of Facebook & Asana) begs you to think twice. True startup life is not what you see on social media. Crucial lessons: 👇',
      '2/ The Glamor Myth: Movies show boardrooms, parties, and instant billionaire status. Real life is 14-hour days, tedious product testing, and psychological weight. True tech builders enjoy the process, not just the PR.',
      '3/ "Being your own boss" is a myth. As a founder, you actually report to everyone. Your engineers need tools, your clients demand support, and your investors expect 10x returns. You are at the bottom of the pyramid, serving others.',
      '4/ Motivation Check: If you are building solely for status, control, or cash, you will burn out within 12 months. The only real anchor is absolute obsession with the user problem.',
      '5/ Conclusion: Only launch when the problem is so urgent that its solution becomes a necessity. Fixate on value, scale steadily, and leave the glamour behind. 🎯',
    ],
    socialSnippet: '🚀 "Startups aren\'t about being your own boss—they are about serving everyone else." Dustin Moskovitz (Facebook, Asana) delivered this masterclass at Y Combinator on why most founders fail. Read our full timeline and AI summary of Startup Myths below! #Startups #YCombinator #Productivity #Monetize',
    quiz: [
      {
        question: 'Which company did Dustin Moskovitz co-found alongside Facebook?',
        options: ['Asana', 'Slack', 'Trello', 'Notion'],
        answerIndex: 0,
        explanation: 'Dustin Moskovitz co-founded Asana in 2008 to solve co-worker coordination and task tracking issues.',
      },
      {
        question: 'Why does Dustin argue founders actually have less flexibility than regular employees?',
        options: [
          'Because they are bound by strict government mandates.',
          'They report to their entire ecosystem: employees, clients, investors, and partners.',
          'Investors specify their exact office check-in times.',
          'They are legally not permitted to take holidays.',
        ],
        answerIndex: 1,
        explanation: "As a founder, you have ultimate accountability. You must resolve problems for every stakeholder, erasing the myth of total 'freedom'.",
      },
      {
        question: 'What is the only valid motivation Dustin suggests for launching a startup?',
        options: [
          'Chasing quick status and public PR clout.',
          'Acquiring capital to invest in speculative markets.',
          'Compelling passion to solve an urgent user problem.',
          'To work fewer hours than a 9-to-5 job.',
        ],
        answerIndex: 2,
        explanation: "Only deep obsession with a problem provides the long-term stamina required to survive a startup's severe lows.",
      },
    ],
    mindmap: [
      {
        concept: 'Startup Myths',
        category: 'Core Thesis',
        description: 'Analyzing why the glamorized view of entrepreneurship mismatches reality.',
      },
      {
        concept: 'Illusion of Freedom',
        category: 'Startup Myths',
        description: 'Founders do not have more free time; they are bound to everyone else.',
      },
      {
        concept: 'The True Bosses',
        category: 'Illusion of Freedom',
        description: 'Employees, customers, and venture investors hold ultimate leverage.',
      },
      {
        concept: 'Valid Motivation',
        category: 'Core Thesis',
        description: 'Determining the source of long-term grit.',
      },
      {
        concept: 'Core Compulsion',
        category: 'Valid Motivation',
        description: 'Solving a problem because its existence feels intolerable to you.',
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
      '1/ Why do some brands command fierce loyalty while others compete on price? Simon Sinek’s legendary Golden Circle explanation is a masterclass in influence. A breakdown: 👇',
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
];
