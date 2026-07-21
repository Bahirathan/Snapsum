// Precompiled, high-quality, cited study materials for SEO Tools Sandboxes
export interface DemoQuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface DemoFlashcard {
  term: string;
  definition: string;
}

export interface DemoChapter {
  timestamp: string;
  title: string;
  summary: string;
}

export interface DemoConcept {
  concept: string;
  definition: string;
  analogy: string;
}

export interface DemoDataset {
  title: string;
  author: string;
  description: string;
  youtubeId?: string;
  summary: string;
  takeaways: string[];
  chapters: DemoChapter[];
  flashcards: DemoFlashcard[];
  quiz: DemoQuizQuestion[];
  concepts: DemoConcept[];
}

export const YOUTUBE_DEMOS: Record<string, DemoDataset> = {
  'cs50-algorithms': {
    title: 'Harvard CS50: Understanding Algorithms and Data Structures',
    author: 'David J. Malan',
    description: 'Learn how computer scientists solve problems. Introduces Big O notation, sorting algorithms (bubble sort, merge sort), and dynamic memory memory arrays.',
    youtubeId: 'Hd_pt-xlV50',
    summary: 'Algorithms are step-by-step instructions for solving problems, measured by their time and space complexity. Through linear search, binary search, and various sorting methodologies, we see how choices in data representation drastically impact performance as input sizes grow. David Malan presents these core computer science topics using physical analogies, making abstract computational constraints clear.',
    takeaways: [
      'Big O notation represents the worst-case running time of an algorithm, letting developers compare efficiency mathematically.',
      'Binary search operates in O(log n) logarithmic time by halving the search space each step, but requires a sorted input array.',
      'Sorting algorithms like Bubble Sort and Selection Sort are O(n²) quadratic time, while Merge Sort is O(n log n) but utilizes extra memory space.',
      'Memory management and choosing correct data structures (e.g. linked lists vs arrays) define practical speed limits of software.'
    ],
    chapters: [
      { timestamp: '00:00', title: 'Introduction to Algorithms', summary: 'Defining computational inputs, outputs, and the algorithmic process of solving problems with exact procedures.' },
      { timestamp: '12:15', title: 'Linear Search vs. Binary Search', summary: 'Demonstrating search efficiency. Binary search is logarithmic O(log n) compared to linear search which is O(n) linear.' },
      { timestamp: '25:40', title: 'Big O Notation Explained', summary: 'Explaining asymptotic running times (O(1), O(log n), O(n), O(n log n), O(n²)) and how to analyze them.' },
      { timestamp: '42:10', title: 'Quadratic Sorting (Bubble & Selection)', summary: 'How Bubble Sort and Selection Sort work step-by-step, analyzing why they scale poorly at O(n²).' },
      { timestamp: '58:30', title: 'Divide and Conquer: Merge Sort', summary: 'Detailing recursion and the divide-and-conquer strategy, proving why Merge Sort is highly efficient at O(n log n).' }
    ],
    flashcards: [
      { term: 'Algorithm', definition: 'A step-by-step set of operations or instructions to solve a problem or complete a computation.' },
      { term: 'Big O Notation', definition: 'A mathematical notation used to describe the limiting behavior and asymptotic complexity of an algorithm in the worst-case scenario.' },
      { term: 'Binary Search', definition: 'A search algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.' },
      { term: 'Recursion', definition: 'A programming technique where a function calls itself directly or indirectly to solve a smaller instance of the same problem.' },
      { term: 'Merge Sort', definition: 'A divide-and-conquer sorting algorithm that recursively splits an array, sorts the halves, and merges them back together in O(n log n) time.' }
    ],
    quiz: [
      {
        question: 'Which of the following running times represents the highest efficiency for extremely large inputs?',
        options: ['O(n²)', 'O(n)', 'O(log n)', 'O(n log n)'],
        answerIndex: 2,
        explanation: 'O(log n) is logarithmic and represents the highest efficiency here. As input sizes scale to billions of records, a logarithmic curve remains practically flat compared to linear O(n) or quadratic O(n²) curves.'
      },
      {
        question: 'What is a prerequisite requirement for applying a binary search algorithm on an array?',
        options: ['The array must be empty', 'The array must be sorted in order', 'The array must contain only integers', 'The array size must be a power of two'],
        answerIndex: 1,
        explanation: 'Binary search depends on comparing the target value to the midpoint, knowing that values to the left are smaller and values to the right are larger. If the array is unsorted, this logical elimination is invalid.'
      },
      {
        question: 'If an algorithm splits an input of size N in half recursively, performs constant work, and merges the results in O(N) time, what is its overall Big O complexity?',
        options: ['O(1)', 'O(N)', 'O(N²)', 'O(N log N)'],
        answerIndex: 3,
        explanation: 'This describes the standard divide-and-conquer recurrence relation of Merge Sort, which has a mathematical complexity of O(N log N).'
      }
    ],
    concepts: [
      {
        concept: 'Divide and Conquer',
        definition: 'Breaking a complex problem down into independent sub-problems of the same type, solving them, and combining those solutions.',
        analogy: 'Like sorting a massive pile of homework papers by dividing them among five friends, having each sort their small stack, and stacking them back in order.'
      },
      {
        concept: 'Logarithmic Growth O(log n)',
        definition: 'Complexity where execution steps grow by only one constant increment each time the input size doubles.',
        analogy: 'Searching for a name in a physical 1,000-page telephone book. By ripping the book in half each step, you can find any name in just 10 rips.'
      }
    ]
  },
  'leadership-sinek': {
    title: 'Simon Sinek: How Great Leaders Inspire Action (The Golden Circle)',
    author: 'Simon Sinek',
    description: 'Discover the powerful framework of "The Golden Circle" (Why, How, What). Simon Sinek explains why some organizations succeed in inspiring loyalty and action while others fail.',
    youtubeId: 'qp0HIF3SfI4',
    summary: ' Simon Sinek outlines the fundamental principles of leadership through the Golden Circle: Why, How, and What. He explains that inspiring leaders and companies always communicate from the inside out (starting with "Why" they exist), which speaks directly to the limbic brain responsible for feelings, trust, and decision-making.',
    takeaways: [
      'The Golden Circle consists of three nested rings: Why (the core purpose), How (the process), and What (the product or service).',
      'Average organizations communicate from the outside in (What to Why), while inspiring leaders communicate from the inside out (Why to What).',
      'The limbic brain, which controls our emotions and loyalty, does not understand language or features, but responds powerfully to core beliefs and shared values.',
      'People do not buy what you do; they buy why you do it. True innovation relies on capturing early adopters who share your core purpose.'
    ],
    chapters: [
      { timestamp: '00:00', title: 'The Discovery of The Golden Circle', summary: 'Introducing the three layers of Sinek\'s framework and comparing the communication direction of standard vs. inspiring companies.' },
      { timestamp: '05:30', title: 'Biology of Decision Making', summary: 'Mapping the Golden Circle to the human brain: "What" aligns with the neocortex, while "Why" and "How" align with the emotional limbic brain.' },
      { timestamp: '11:15', title: 'Case Study: Apple Computer', summary: 'Deconstructing why Apple continues to lead: they start with a belief in challenging the status quo, rather than selling computers.' },
      { timestamp: '16:45', title: 'Law of Diffusion of Innovations', summary: 'Explaining how to achieve mass-market adoption by focusing on innovators and early adopters who believe in your Why.' }
    ],
    flashcards: [
      { term: 'The Golden Circle', definition: 'A leadership framework consisting of three concentric circles representing Why, How, and What, explaining how to communicate to inspire action.' },
      { term: 'Limbic Brain', definition: 'The evolutionary part of the brain that controls trust, loyalty, emotion, and decision-making, with no capacity for language.' },
      { term: 'Neocortex', definition: 'The analytical, rational part of the brain responsible for language, facts, logic, and features.' },
      { term: 'Early Adopters', definition: 'The second group of consumers to adopt a new product or idea, driven heavily by their personal beliefs and desire for progress.' }
    ],
    quiz: [
      {
        question: 'According to Sinek, where should inspiring organizations begin their communication?',
        options: ['With "What" they sell', 'With "How" they build it', 'With "Why" they exist', 'With "Who" their competitor is'],
        answerIndex: 2,
        explanation: 'Inspiring leaders always communicate from the inside out, starting with "Why"—their belief, purpose, or cause—before explaining "How" and "What".'
      },
      {
        question: 'Which anatomical section of the brain corresponds directly with the "Why" and "How" of Sinek\'s Golden Circle?',
        options: ['The Neocortex', 'The Limbic Brain', 'The Cerebellum', 'The Brain Stem'],
        answerIndex: 1,
        explanation: 'The limbic system represents the "Why" and "How", managing feelings, trust, behavior, and decision-making without language capacity.'
      },
      {
        question: 'Complete Sinek\'s famous thesis: "People don\'t buy what you do; they buy..."',
        options: ['How cheap it is', 'Why you do it', 'What features it has', 'How fast it delivers'],
        answerIndex: 1,
        explanation: 'Simon Sinek emphasizes: "People don\'t buy what you do; they buy why you do it." This drives emotional connection and authentic product loyalty.'
      }
    ],
    concepts: [
      {
        concept: 'Inside-Out Communication',
        definition: 'Articulating your core belief or mission first, before discussing execution steps or physical product configurations.',
        analogy: 'Instead of saying "I made a great car, buy it," you say: "We believe in freedom of movement, so we engineered a fast, reliable vehicle. Want to try it?"'
      }
    ]
  }
};

export const PDF_DEMOS: Record<string, DemoDataset> = {
  'biology-cell': {
    title: 'Biology 101: Chromosomes, Mitosis, and Cell Division Slides',
    author: 'Department of Biological Sciences',
    description: 'An academic study guide summarizing the phases of mitosis, cell cycle regulation points, and chromosomal segregation in eukaryotic cell reproduction.',
    summary: 'Cell division is the biological process by which a parent cell divides into two or more daughter cells. Eukaryotes utilize mitosis to segregate replicated chromosomes into separate nuclei, governed by a series of controlled molecular checkpoints (G1, S, G2, M). This study guide details chromatin packaging, spindle fiber assembly, chromosome alignment, and cytokinesis.',
    takeaways: [
      'The cell cycle consists of Interphase (G1, S, G2 phase) and Mitotic Phase (nuclear division and cytokinesis).',
      'Chromosomes are replicated during the S (Synthesis) phase of Interphase, forming identical sister chromatids held by a centromere.',
      'Mitosis consists of four sequential, highly coordinated stages: Prophase, Metaphase, Anaphase, and Telophase.',
      'Checkpoints and cyclin-dependent kinases (CDKs) serve as cellular regulators, arresting the cycle if DNA damage or spindle alignment issues are detected.'
    ],
    chapters: [
      { timestamp: 'Slide 1-10', title: 'Chromatin Packaging and Replication', summary: 'Visualizing DNA wrapping around histone proteins to form nucleosomes, chromatin fibers, and chromosomes before cell division.' },
      { timestamp: 'Slide 11-20', title: 'Phases of Mitosis Detailed', summary: 'Prophase (condensation), Metaphase (alignment on plate), Anaphase (chromatid separation), and Telophase (nuclear re-formation).' },
      { timestamp: 'Slide 21-30', title: 'Spindle Apparatus Mechanics', summary: 'Microtubule nucleation at centrosomes, kinetochore attachments, and motor protein tension forces pulling chromosomes.' },
      { timestamp: 'Slide 31-40', title: 'Cell Cycle Control & CDKs', summary: 'Analyzing the metabolic checkpoints preventing cancer and chromosomal instability, detailing CDKs and tumor suppressors like p53.' }
    ],
    flashcards: [
      { term: 'Mitosis', definition: 'The process of nuclear division in eukaryotic cells that segregates replicated chromosomes into two identical daughter nuclei.' },
      { term: 'Kinetochore', definition: 'A complex protein structure assembled on the centromere of chromosomes where spindle microtubules attach to pull chromatids apart.' },
      { term: 'Centromere', definition: 'The specialized region of a chromosome that links sister chromatids together and serves as an attachment site for spindle fibers.' },
      { term: 'Cytokinesis', definition: 'The physical division of the cytoplasm of a parental cell into two distinct daughter cells, occurring immediately after mitosis.' },
      { term: 'CDK (Cyclin-Dependent Kinase)', definition: 'A family of multifunctional protein kinases that regulate the progression of the cell cycle by phosphorylating target proteins.' }
    ],
    quiz: [
      {
        question: 'During which phase of the eukaryotic cell cycle is genomic DNA replicated?',
        options: ['G1 Phase', 'S Phase', 'G2 Phase', 'M Phase (Mitosis)'],
        answerIndex: 1,
        explanation: 'DNA replication occurs specifically during the S (Synthesis) phase of Interphase. G1 and G2 are growth/preparation phases, and the M phase is when physical division occurs.'
      },
      {
        question: 'What is the correct chronological sequence of mitotic nuclear division stages?',
        options: [
          'Prophase, Anaphase, Metaphase, Telophase',
          'Prophase, Metaphase, Anaphase, Telophase',
          'Metaphase, Prophase, Anaphase, Telophase',
          'Interphase, Prophase, Metaphase, Telophase'
        ],
        answerIndex: 1,
        explanation: 'Mitosis proceeds strictly through Prophase (condensation), Metaphase (alignment), Anaphase (separation), and Telophase (envelope re-formation).'
      },
      {
        question: 'If a cell cycle checkpoint detects unreplicated DNA or chromosomal damage, which protein regulator holds the cycle from proceeding?',
        options: ['Tubulin', 'Actin', 'Cyclin-CDK Inhibitors / Tumor suppressors like p53', 'Kinesin Motor Proteins'],
        answerIndex: 2,
        explanation: 'Inhibitors and checkpoint monitors (such as p53) arrest Cyclin-CDK complexes, preventing replication of mutated or damaged cellular structures.'
      }
    ],
    concepts: [
      {
        concept: 'Spindle Apparatus Assembly',
        definition: 'A cellular structure composed of microtubules and associated motor proteins that coordinates chromosomal alignment and separation.',
        analogy: 'Like micro-scale biological crane cables extending from opposite walls to hook into shipping containers (chromosomes) and drag them apart.'
      }
    ]
  },
  'calculus-limits': {
    title: 'Calculus I: Comprehensive Limits, Continuity, and Derivatives',
    author: 'Mathematics Faculty',
    description: 'A mathematical lecture syllabus teaching limits, continuity, epsilon-delta definitions, L\'Hopital\'s rule, and foundational derivative theorems.',
    summary: 'Calculus rests on the concept of a limit—how a function behaves as its input approaches a target value. Understanding continuity is essential to transition from simple static quotients to instant rates of change. This workbook covers algebraic simplification, sandwich theorem, limit definition of derivatives, and solving indeterminate forms.',
    takeaways: [
      'A limit L exists if the left-hand limit and right-hand limit of the function are identical as x approaches a.',
      'Continuity requires that the function is defined at c, the limit exists as x approaches c, and these two values are equal.',
      'Indeterminate forms (0/0, infinity/infinity) can be solved algebraically via factoring, rationalizing, or L\'Hopital\'s Rule.',
      'The derivative represents the instantaneous slope of a tangent line, defined as the limit of the difference quotient as h approaches 0.'
    ],
    chapters: [
      { timestamp: 'Chapter 1', title: 'The Concept of a Limit', summary: 'Defining limits intuitively using tables, graphs, and notation. Introducing the formal mathematical epsilon-delta limit definitions.' },
      { timestamp: 'Chapter 2', title: 'Algebraic Techniques & Sandwich Theorem', summary: 'Solving indeterminate limits via factoring, conjugates, and bounding functions between two known limits (Squeeze Theorem).' },
      { timestamp: 'Chapter 3', title: 'Continuity & Intermediate Value Theorem', summary: 'Mathematical definitions of continuity and the Intermediate Value Theorem (IVT) proving roots must exist for continuous interval changes.' },
      { timestamp: 'Chapter 4', title: 'Defining the Derivative', summary: 'Deriving the difference quotient and limit definition of derivatives: lim (h -> 0) [f(x+h) - f(x)] / h.' }
    ],
    flashcards: [
      { term: 'Limit', definition: 'The value that a function or sequence approaches as the input or index approaches some specific value.' },
      { term: 'Continuity', definition: 'A property of a function where there is no abrupt change in value, formally requiring lim (x->c) f(x) = f(c).' },
      { term: 'Indeterminate Form', definition: 'An algebraic expression involving limits (e.g. 0/0, infinity/infinity) whose value cannot be determined without further analytical modification.' },
      { term: 'L\'Hopital\'s Rule', definition: 'An analytical method that uses derivatives to evaluate limits of indeterminate forms by taking the derivative of numerator and denominator.' },
      { term: 'Difference Quotient', definition: 'The formula [f(x+h) - f(x)] / h representing the average rate of change, which becomes the derivative as h approaches zero.' }
    ],
    quiz: [
      {
        question: 'What is the value of the limit of sin(x)/x as x approaches 0?',
        options: ['0', '1', 'Does not exist', 'Infinity'],
        answerIndex: 1,
        explanation: 'The limit as x approaches 0 of sin(x)/x is a fundamental trigonometric limit equal to 1, which can also be solved using L\'Hopital\'s rule.'
      },
      {
        question: 'Which theorem states that if f is continuous on [a,b] and d is between f(a) and f(b), there must exist some c in (a,b) where f(c) = d?',
        options: ['Squeeze Theorem', 'Mean Value Theorem', 'Intermediate Value Theorem (IVT)', 'Rolle\'s Theorem'],
        answerIndex: 2,
        explanation: 'This is the exact definition of the Intermediate Value Theorem, which guarantees that a continuous function cannot skip any intermediate values.'
      },
      {
        question: 'Solve the limit: lim (x -> 3) of (x² - 9) / (x - 3)',
        options: ['0', '3', '6', 'Indeterminate'],
        answerIndex: 2,
        explanation: 'Factoring (x²-9) gives (x-3)(x+3). Canceling (x-3) leaves (x+3). Evaluating as x approaches 3 yields 3+3 = 6.'
      }
    ],
    concepts: [
      {
        concept: 'Instantaneous Rate of Change',
        definition: 'The speed or rate of change of a variable at a single precise instant, calculated by taking the limit of average speed over shrinking intervals.',
        analogy: 'Looking down at your car dashboard speedometer at exactly 12:00:00 PM. It registers your speed at that exact millisecond, not your average over the trip.'
      }
    ]
  }
};

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}

export const TUTOR_DEMOS: Record<string, ChatMessage[]> = {
  'quantum-computing': [
    { id: '1', sender: 'user', text: 'Explain quantum computing to me like I am 5 years old.', timestamp: '12:00' },
    {
      id: '2',
      sender: 'tutor',
      text: 'Imagine a normal computer uses tiny light switches called **bits**. These switches can only be **OFF (0)** or **ON (1)**. \n\nBut a quantum computer uses magical switches called **qubits**! \n\nInstead of just being off or on, a qubit can spin around like a spinning coin. While it is spinning, it is **BOTH off and on at the same time**! This special superpower is called **Superposition**.',
      timestamp: '12:01'
    },
    { id: '3', sender: 'user', text: 'Wow, why is that useful?', timestamp: '12:02' },
    {
      id: '4',
      sender: 'tutor',
      text: 'Great question! Because qubits can spin, a quantum computer can test **millions of options all at once**.\n\nImagine you are in a giant maze with 1,000 dead ends. \n* A normal computer has to try one path, hit a wall, back up, and try the next path one by one.\n* A quantum computer can split into a ghost and **try all 1,000 paths at the exact same time** to find the exit instantly!\n\nThis makes them incredibly fast at solving complex problems, like inventing new medicines or unlocking codes.',
      timestamp: '12:03'
    },
    { id: '5', sender: 'user', text: 'Can it play video games faster too?', timestamp: '12:04' },
    {
      id: '6',
      sender: 'tutor',
      text: 'Haha, actually, no! Quantum computers are only fast at very specific, hard math problems. For normal things like loading websites, typing essays, or playing games, your smartphone is actually much better. \n\nWe will only use quantum computers for heavy science, like modeling chemistry or optimizing flight paths across the globe!',
      timestamp: '12:05'
    }
  ],
  'photosynthesis': [
    { id: '1', sender: 'user', text: 'Explain photosynthesis step-by-step.', timestamp: '12:00' },
    {
      id: '2',
      sender: 'tutor',
      text: 'Photosynthesis is how plants make their own food using sunlight. Let\'s break it down into **three main steps**:\n\n**Step 1: Gathering Ingredients**\n* **Sunlight:** Leaves contain a green solar panel pigment called **Chlorophyll** that catches light energy.\n* **Water (H₂O):** Plant roots absorb water from the soil.\n* **Carbon Dioxide (CO₂):** Leaves inhale CO₂ from the air through tiny nostrils called **Stomata**.\n\n**Step 2: The Energy Split (Light Reactions)**\nUsing the captured sunlight, the plant splits water (H₂O). It keeps the hydrogen as energy and **releases oxygen (O₂)** back into the air for us to breathe!\n\n**Step 3: Cooking Sugar (The Calvin Cycle)**\nFinally, the plant combines the hydrogen energy with the carbon dioxide to bake a sweet sugar syrup called **Glucose**. This is the plant\'s food, helping it grow tall and strong!',
      timestamp: '12:01'
    }
  ],
  'bayes-theorem': [
    { id: '1', sender: 'user', text: 'What is Bayes\' Theorem? Give me an intuitive example.', timestamp: '12:00' },
    {
      id: '2',
      sender: 'tutor',
      text: 'At its heart, **Bayes\' Theorem** is a mathematical formula for **updating your beliefs when you see new evidence**.\n\nInstead of calculating probability in a vacuum, Bayes asks: *How does my prior knowledge change now that I have new clues?*\n\nHere is a simple intuitive example:\n\n**The Scenario: You wake up and see the grass is wet.**\n* **The Question:** Did it rain overnight?\n* **Prior Knowledge:** You live in a dry desert where it only rains 5 days a year (Low prior probability).\n* **New Clues/Evidence:** You notice the neighbor\'s lawn sprinkler is on (New evidence).\n\nBayes\' Theorem is the math that weighs these two options, helping you realize that even though wet grass *usually* means rain, your dry climate prior means it is much more likely to be the sprinkler!',
      timestamp: '12:02'
    }
  ]
};
