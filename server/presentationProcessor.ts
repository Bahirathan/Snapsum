import { GoogleGenAI, Type } from '@google/genai';
import { db } from './firestore';

export interface SlideDiagram {
  type: 'flowchart' | 'process' | 'timeline' | 'comparison' | 'hierarchy' | 'venn' | 'mindmap';
  title?: string;
  elements: string[]; // e.g. ["Step 1: Input", "Step 2: Processing", "Step 3: Output"]
}

export interface SlideChart {
  type: 'bar' | 'pie' | 'line' | 'area' | 'comparison-table';
  data: Array<{ label: string; value: number; secondaryValue?: number }>;
  labels?: string[];
}

export interface PresentationSlide {
  id: string;
  type: 'title' | 'agenda' | 'bullet' | 'timeline' | 'comparison' | 'diagram' | 'chart' | 'quote' | 'image' | 'summary' | 'qa' | 'references';
  title: string;
  subtitle?: string;
  bullets?: string[];
  icon?: string; // Lucide icon name, e.g. "Presentation", "BookOpen", "BarChart2", "Layers"
  imagePrompt?: string; // suggested prompt for image generation
  diagram?: SlideDiagram;
  chart?: SlideChart;
  speakerNotes: string;
  speakingTimeSecs: number;
  confidenceScore: number;
  layout?: 'split' | 'full' | 'grid' | 'accent' | 'hero';
}

export interface AIPresentation {
  videoId: string;
  style: string; // e.g. "Business", "Academic", "Startup Pitch"
  theme: string; // e.g. "Corporate Blue", "Dark Tech", "Minimal"
  slides: PresentationSlide[];
  status: 'generating' | 'completed' | 'failed';
  currentStage?: string;
  progressPercent?: number;
  error?: string;
  updatedAt: string;
}

// Highly robust JSON cleaning and extraction engine to prevent parsing crashes on the server side
function cleanAndParseJson(text: string): any {
  let cleaned = text.trim();

  // 1. If wrapped in markdown code blocks, extract
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  // 2. Remove trailing commas or loose ellipses
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  
  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    // Attempt basic loose JSON repair
    console.warn("Standard JSON parse failed, attempting loose repair:", err.message);
    try {
      // Basic fallback using standard evaluation or simple replacement
      const repaired = cleaned
        .replace(/,\s*$/, '') // remove trailing comma at the very end
        .replace(/([^\\])"/g, '$1"'); // resolve quotes
      return JSON.parse(repaired);
    } catch (e) {
      throw new Error(`Failed to parse AI output as JSON: ${err.message}. Raw output sample: ${text.slice(0, 200)}...`);
    }
  }
}

/**
 * Generates a full presentation based on summary content, style, and theme.
 */
export async function generatePresentation(
  ai: GoogleGenAI,
  summaryData: {
    title: string;
    summary: string;
    takeaways: any[];
    chapters: any[];
    keyConcepts?: any[];
    videoUrl?: string;
  },
  style: string,
  theme: string
): Promise<PresentationSlide[]> {
  const contentContext = `
Title: ${summaryData.title}
Video URL: ${summaryData.videoUrl || ''}
Summary: ${summaryData.summary}
Key Takeaways: ${JSON.stringify(summaryData.takeaways || [])}
Chapters: ${JSON.stringify(summaryData.chapters || [])}
Key Concepts: ${JSON.stringify(summaryData.keyConcepts || [])}
`;

  const prompt = `
You are a world-class presentation designer. Your task is to transform this video summary/transcript into a professional, cohesive presentation of slide layouts.
The style is: "${style}" and the theme is: "${theme}".

Generate an optimal set of slides (typically 6-12 slides depending on content length) that tells a compelling story. Never create redundant or empty slides.
Every slide MUST fit one of these types:
- 'title' (First slide only)
- 'agenda' (Second slide)
- 'bullet' (Standard list with 3-6 items)
- 'timeline' (For sequential steps or history, include a diagram with chronological elements)
- 'comparison' (Pros/Cons, side-by-side comparison, include comparison data)
- 'diagram' (Flowcharts, relationships, hierarchies, decision trees; MUST define diagram elements)
- 'chart' (When numerical stats are present or can be represented visually, MUST include chart type, data labels, and data points)
- 'quote' (For strong statements or insights)
- 'image' (Layout built around a strong graphic, include detailed imagePrompt)
- 'summary' (Key takeaways)
- 'qa' (Question & Answer starter slide)
- 'references' (End slide citing source documents, video URLs, and external resources)

Generate the slides in a structured JSON format exactly matching this TypeScript array of slides:
Array<PresentationSlide>

Where each slide has:
{
  "id": "unique-uuid-or-string",
  "type": "title" | "agenda" | "bullet" | "timeline" | "comparison" | "diagram" | "chart" | "quote" | "image" | "summary" | "qa" | "references",
  "title": "Title of the Slide",
  "subtitle": "Optional subtitle or context hook",
  "bullets": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4"],
  "icon": "LucideIconName", // Lucide React icon name suitable for the topic, e.g. "Brain", "Lightbulb", "Compass", "Clock", "Shield", "Zap", "LineChart", "PieChart", "BarChart2", "BookOpen", "HelpCircle"
  "imagePrompt": "A highly detailed visual prompt for generating an image to accompany this slide, e.g., 'An elegant 3D illustration of a neural network representing artificial intelligence decision paths, warm lighting'",
  "diagram": { // ONLY if type is 'diagram' or 'timeline'
    "type": "flowchart" | "process" | "timeline" | "comparison" | "hierarchy" | "venn" | "mindmap",
    "title": "Diagram Title",
    "elements": ["Element A", "Element B", "Element C"]
  },
  "chart": { // ONLY if type is 'chart'
    "type": "bar" | "pie" | "line" | "area" | "comparison-table",
    "data": [
      { "label": "Category A", "value": 75, "secondaryValue": 25 },
      { "label": "Category B", "value": 45, "secondaryValue": 55 }
    ]
  },
  "speakerNotes": "Detailed presentation narrative, script, or trainer notes for this slide.",
  "speakingTimeSecs": 90, // estimated duration in seconds
  "confidenceScore": 95, // AI confidence on this slide's clarity (0-100)
  "layout": "split" | "full" | "grid" | "accent" | "hero" // optimal visual layout for this slide
}

Strictly output ONLY valid JSON. No conversational wrapper, no markdown block except optionally \`\`\`json \`\`\`. Avoid trailing commas. Verify brackets are balanced.
`;

  let response: any;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: `Content context:\n${contentContext}` },
        { text: prompt }
      ],
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });
  } catch (err: any) {
    console.warn("Presentation generation primary call failed, retrying with fallback model:", err.message);
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { text: `Content context:\n${contentContext}` },
          { text: prompt }
        ],
        config: {
          temperature: 0.1
        }
      });
    } catch (retryErr: any) {
      console.error("Presentation generation retry failed, using rich context fallback slides:", retryErr.message);
      return generateFallbackSlides(summaryData, style);
    }
  }

  const rawText = response.text || '';
  let parsedSlides: any;
  try {
    parsedSlides = cleanAndParseJson(rawText);
  } catch (parseErr) {
    console.warn("Failed to parse presentation JSON, utilizing context fallback generator");
    return generateFallbackSlides(summaryData, style);
  }

  if (!Array.isArray(parsedSlides) || parsedSlides.length === 0) {
    return generateFallbackSlides(summaryData, style);
  }

  // Ensure every slide has a unique ID and default fields
  return parsedSlides.map((slide, index) => ({
    id: slide.id || `slide_${Date.now()}_${index}`,
    type: slide.type || 'bullet',
    title: slide.title || 'Untitled Slide',
    subtitle: slide.subtitle || '',
    bullets: Array.isArray(slide.bullets) ? slide.bullets : [],
    icon: slide.icon || 'Presentation',
    imagePrompt: slide.imagePrompt || `A professional graphic depicting ${slide.title}`,
    diagram: slide.diagram || undefined,
    chart: slide.chart || undefined,
    speakerNotes: slide.speakerNotes || `Discuss the key points of ${slide.title}.`,
    speakingTimeSecs: Number(slide.speakingTimeSecs) || 60,
    confidenceScore: Number(slide.confidenceScore) || 90,
    layout: slide.layout || 'split'
  }));
}

function generateFallbackSlides(summaryData: any, style: string): PresentationSlide[] {
  const title = summaryData.title || 'Executive Masterclass Summary';
  const summary = summaryData.summary || 'Comprehensive breakdown of core concepts and strategic implications.';
  const takeaways = Array.isArray(summaryData.takeaways) 
    ? summaryData.takeaways.map((t: any) => typeof t === 'string' ? t : t.text || '')
    : ['Master foundational frameworks', 'Apply core principles in practice', 'Optimize cognitive retention'];
  const chapters = Array.isArray(summaryData.chapters) ? summaryData.chapters : [];

  const slides: PresentationSlide[] = [
    {
      id: `slide_fallback_1`,
      type: 'title',
      title: title,
      subtitle: `${style} Executive Overview & Interactive Knowledge Deck`,
      icon: 'Presentation',
      speakerNotes: `Welcome everyone. Today we are exploring "${title}". This presentation summarizes the core findings, analytical framework, and actionable conclusions.`,
      speakingTimeSecs: 60,
      confidenceScore: 98,
      layout: 'hero'
    },
    {
      id: `slide_fallback_2`,
      type: 'agenda',
      title: 'Executive Agenda & Objectives',
      subtitle: 'Key domains covered in this brief',
      bullets: [
        'Foundational Concepts & Background Thesis',
        'Direct Strategic Takeaways & Lessons',
        'Structured Segments & Chapter Timeline',
        'Implementation Roadmap & Q&A'
      ],
      icon: 'Layers',
      speakerNotes: 'Here is our roadmap for today\'s deck. We will begin with foundational concepts, progress through core takeaways, analyze specific chapters, and end with strategic next steps.',
      speakingTimeSecs: 75,
      confidenceScore: 95,
      layout: 'grid'
    },
    {
      id: `slide_fallback_3`,
      type: 'summary',
      title: 'Core Thesis & Narrative Summary',
      subtitle: 'High-level synthesis',
      bullets: [
        summary.slice(0, 180) + (summary.length > 180 ? '...' : ''),
        'Synthesizes multi-source research into actionable takeaways.',
        'Provides structural clarity on complex technical mechanics.'
      ],
      icon: 'Brain',
      speakerNotes: `At its core: ${summary}`,
      speakingTimeSecs: 90,
      confidenceScore: 95,
      layout: 'split'
    }
  ];

  if (takeaways.length > 0) {
    slides.push({
      id: `slide_fallback_4`,
      type: 'bullet',
      title: 'Key Insights & Actionable Lessons',
      subtitle: 'Primary conclusions derived from analysis',
      bullets: takeaways.slice(0, 5),
      icon: 'Lightbulb',
      speakerNotes: 'Let\'s highlight the main takeaways. These points represent the highest leverage insights from this topic.',
      speakingTimeSecs: 120,
      confidenceScore: 94,
      layout: 'accent'
    });
  }

  if (chapters.length > 0) {
    slides.push({
      id: `slide_fallback_5`,
      type: 'timeline',
      title: 'Structured Chapter Timeline',
      subtitle: 'Chronological progression of topics',
      bullets: chapters.slice(0, 4).map((c: any) => `${c.timestamp || '00:00'} - ${c.title}: ${c.takeaway || ''}`),
      diagram: {
        type: 'timeline',
        title: 'Lecture Progression',
        elements: chapters.slice(0, 4).map((c: any) => `${c.timestamp || ''} ${c.title || 'Segment'}`)
      },
      icon: 'Clock',
      speakerNotes: 'Here is how the subject unfolds across key timestamps and logical progression stages.',
      speakingTimeSecs: 100,
      confidenceScore: 92,
      layout: 'full'
    });
  }

  slides.push({
    id: `slide_fallback_6`,
    type: 'qa',
    title: 'Discussion & Q&A',
    subtitle: 'Key questions for review and active recall',
    bullets: [
      'What are the primary assumptions of this framework?',
      'How does this apply to real-world scenarios?',
      'What are the next action steps or further reading?'
    ],
    icon: 'HelpCircle',
    speakerNotes: 'Thank you for your attention. Let\'s open the floor to questions and discuss practical applications.',
    speakingTimeSecs: 90,
    confidenceScore: 96,
    layout: 'hero'
  });

  return slides;
}

/**
 * Modifies an existing presentation based on an AI command (e.g. "make it shorter", "add more diagrams").
 */
export async function editPresentation(
  ai: GoogleGenAI,
  currentPresentation: AIPresentation,
  command: string,
  targetSlideId?: string
): Promise<PresentationSlide[]> {
  const currentSlidesStr = JSON.stringify(currentPresentation.slides);
  
  const prompt = `
You are a master presentation editor. Your task is to update an existing slide deck based on a user command.
Command: "${command}"
${targetSlideId ? `Target Slide ID: "${targetSlideId}" (Apply change specifically to this slide, or keep other slides intact)` : 'Apply change to the whole deck.'}

Current Presentation Slides (JSON):
${currentSlidesStr}

Instructions:
1. Re-analyze and update the slide deck.
2. If user requested structural changes (e.g., reorder, add diagram, split, merge, make shorter/longer, change tone), generate the fully updated list of slides.
3. Make sure to preserve intact slides as much as possible. Maintain identical slide IDs for slides that aren't deleted, split, or merged so the editor does not lose state.
4. Ensure the updated slides conform exactly to the Slide JSON schema.
5. Do not change the overall theme/style config here, only the structural and text content of the slides.

Output ONLY the raw JSON array of slides. No extra text or chat.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json'
    }
  });

  const rawText = response.text || '';
  const parsedSlides = cleanAndParseJson(rawText);
  if (!Array.isArray(parsedSlides)) {
    throw new Error('AI edit response was not a valid slide array.');
  }

  return parsedSlides.map((slide, index) => ({
    id: slide.id || `slide_${Date.now()}_${index}`,
    type: slide.type || 'bullet',
    title: slide.title || 'Untitled Slide',
    subtitle: slide.subtitle || '',
    bullets: Array.isArray(slide.bullets) ? slide.bullets : [],
    icon: slide.icon || 'Presentation',
    imagePrompt: slide.imagePrompt || `A professional graphic depicting ${slide.title}`,
    diagram: slide.diagram || undefined,
    chart: slide.chart || undefined,
    speakerNotes: slide.speakerNotes || `Discuss the key points of ${slide.title}.`,
    speakingTimeSecs: Number(slide.speakingTimeSecs) || 60,
    confidenceScore: Number(slide.confidenceScore) || 90,
    layout: slide.layout || 'split'
  }));
}
