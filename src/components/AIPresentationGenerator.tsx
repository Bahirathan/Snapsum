import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, ChevronLeft, ChevronRight, Download, Sparkles, RefreshCw, 
  Layers, Brain, Trash2, Plus, Copy, Palette, Layout, Check, Settings, 
  Send, Edit3, Split, Merge, Image, ArrowUp, ArrowDown, HelpCircle, 
  Volume2, Info, FileText, CheckCircle2, ChevronDown, Monitor, Presentation,
  PlusCircle, FileSpreadsheet, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import pptxgen from 'pptxgenjs';

// Define slide types and schemas matching backend
export interface SlideDiagram {
  type: 'flowchart' | 'process' | 'timeline' | 'comparison' | 'hierarchy' | 'venn' | 'mindmap';
  title?: string;
  elements: string[];
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
  icon?: string;
  imagePrompt?: string;
  diagram?: SlideDiagram;
  chart?: SlideChart;
  speakerNotes: string;
  speakingTimeSecs: number;
  confidenceScore: number;
  layout?: 'split' | 'full' | 'grid' | 'accent' | 'hero';
}

export interface AIPresentation {
  videoId: string;
  style: string;
  theme: string;
  slides: PresentationSlide[];
  status: 'generating' | 'completed' | 'failed';
  currentStage?: string;
  progressPercent?: number;
  error?: string;
  updatedAt: string;
}

interface AIPresentationGeneratorProps {
  videoId: string;
  getHeaders?: () => Record<string, string>;
  videoTitle?: string;
}

// Themes mapping
const PRESET_THEMES = [
  { id: 'Corporate Blue', name: 'Corporate Blue', bg: 'bg-slate-50', primary: 'text-blue-900', secondary: 'text-slate-700', accent: 'bg-blue-600', cardBg: 'bg-white', border: 'border-blue-100', textLight: 'text-blue-600/80' },
  { id: 'Dark Tech', name: 'Dark Tech', bg: 'bg-zinc-950', primary: 'text-cyan-400', secondary: 'text-zinc-300', accent: 'bg-cyan-500', cardBg: 'bg-zinc-900', border: 'border-zinc-800', textLight: 'text-cyan-500/80', isDark: true },
  { id: 'Modern Gradient', name: 'Modern Gradient', bg: 'bg-[#faf5ff]', primary: 'text-indigo-950', secondary: 'text-purple-950/80', accent: 'bg-gradient-to-r from-violet-600 to-indigo-600', cardBg: 'bg-white', border: 'border-purple-100', textLight: 'text-indigo-600' },
  { id: 'Minimal', name: 'Minimal', bg: 'bg-neutral-50', primary: 'text-neutral-950', secondary: 'text-neutral-800', accent: 'bg-neutral-950', cardBg: 'bg-white', border: 'border-neutral-200', textLight: 'text-neutral-600' },
  { id: 'Apple Keynote', name: 'Apple Keynote', bg: 'bg-[#1c1c1e]', primary: 'text-white', secondary: 'text-neutral-400', accent: 'bg-white', cardBg: 'bg-[#2c2c2e]', border: 'border-neutral-800', textLight: 'text-neutral-500', isDark: true },
  { id: 'Education', name: 'Warm Education', bg: 'bg-amber-50/40', primary: 'text-emerald-950', secondary: 'text-stone-800/80', accent: 'bg-emerald-600', cardBg: 'bg-white', border: 'border-emerald-100', textLight: 'text-emerald-700' },
  { id: 'Startup Pitch', name: 'Startup Pitch', bg: 'bg-[#fff5f5]', primary: 'text-rose-950', secondary: 'text-rose-900/80', accent: 'bg-rose-600', cardBg: 'bg-white', border: 'border-rose-100', textLight: 'text-rose-600' }
];

const PRESENTATION_STYLES = [
  'Business', 'Academic', 'Corporate', 'Executive', 'Investor Pitch', 
  'Training', 'Classroom', 'Marketing', 'Sales', 'Technology', 'Startup'
];

export default function AIPresentationGenerator({ videoId, getHeaders, videoTitle }: AIPresentationGeneratorProps) {
  const [presentation, setPresentation] = useState<AIPresentation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [editMode, setEditMode] = useState<boolean>(false);
  
  // Custom Generation Choices
  const [selectedStyle, setSelectedStyle] = useState<string>('Business');
  const [selectedTheme, setSelectedTheme] = useState<string>('Corporate Blue');
  
  // Custom Instruction command box
  const [aiCommand, setAiCommand] = useState<string>('');
  const [aiEditing, setAiEditing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Presentation speech simulation player
  const [isPlayingNotes, setIsPlayingNotes] = useState<boolean>(false);
  const [notesSpeechTimer, setNotesSpeechTimer] = useState<number>(0);
  const speechIntervalRef = useRef<any>(null);

  // Poll state for background asynchronous generation
  const [pollIntervalActive, setPollIntervalActive] = useState<boolean>(false);
  const [estRemainingSecs, setEstRemainingSecs] = useState<number>(45);

  // Load existing presentation on mount
  useEffect(() => {
    fetchExistingPresentation();
  }, [videoId]);

  // Handle countdown estimated timer
  useEffect(() => {
    let timer: any = null;
    if (loading && estRemainingSecs > 0) {
      timer = setInterval(() => {
        setEstRemainingSecs(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading, estRemainingSecs]);

  // Background polling for async generation
  useEffect(() => {
    let pollTimer: any = null;
    if (pollIntervalActive) {
      pollTimer = setInterval(async () => {
        try {
          const res = await fetch(`/api/presentation/${videoId}`);
          const data = await res.json();
          if (data.success && data.presentation) {
            setPresentation(data.presentation);
            if (data.presentation.status === 'completed') {
              setLoading(false);
              setPollIntervalActive(false);
              setActiveSlideIdx(0);
            } else if (data.presentation.status === 'failed') {
              setLoading(false);
              setPollIntervalActive(false);
            }
          }
        } catch (err) {
          console.error('Polling presentation failed:', err);
        }
      }, 3000);
    }
    return () => clearInterval(pollTimer);
  }, [pollIntervalActive, videoId]);

  const fetchExistingPresentation = async () => {
    try {
      const res = await fetch(`/api/presentation/${videoId}`);
      const data = await res.json();
      if (data.success && data.presentation) {
        setPresentation(data.presentation);
        setSelectedStyle(data.presentation.style || 'Business');
        setSelectedTheme(data.presentation.theme || 'Corporate Blue');
        if (data.presentation.status === 'generating') {
          setLoading(true);
          setPollIntervalActive(true);
          setEstRemainingSecs(35);
        }
      } else {
        setPresentation(null);
      }
    } catch (err) {
      console.error('Error fetching presentation:', err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setEstRemainingSecs(45);
    setAiError(null);

    const headers = getHeaders ? getHeaders() : {};
    try {
      const res = await fetch('/api/presentation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          videoId,
          style: selectedStyle,
          theme: selectedTheme
        })
      });
      const data = await res.json();
      if (data.success) {
        // Asynchronous started! Let's activate polling
        setPollIntervalActive(true);
        // Set temp local state
        setPresentation({
          videoId,
          style: selectedStyle,
          theme: selectedTheme,
          slides: [],
          status: 'generating',
          currentStage: 'Initiating presentation pipeline...',
          progressPercent: 10,
          updatedAt: new Date().toISOString()
        });
      } else {
        setLoading(false);
        setAiError(data.error || 'Failed to start presentation generation.');
      }
    } catch (err: any) {
      setLoading(false);
      setAiError(err.message || 'An error occurred.');
    }
  };

  const handleSaveEdits = async (updatedPresentation: AIPresentation) => {
    setPresentation(updatedPresentation);
    try {
      await fetch('/api/presentation/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          presentation: updatedPresentation
        })
      });
    } catch (err) {
      console.error('Failed to save manual slide edits:', err);
    }
  };

  const handleAICommand = async () => {
    if (!aiCommand.trim() || !presentation) return;
    setAiEditing(true);
    setAiError(null);
    const headers = getHeaders ? getHeaders() : {};

    try {
      const res = await fetch('/api/presentation/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          videoId,
          command: aiCommand,
          targetSlideId: undefined // process whole deck or apply as prompt directs
        })
      });
      const data = await res.json();
      if (data.success && data.presentation) {
        setPresentation(data.presentation);
        setAiCommand('');
        setActiveSlideIdx(0);
      } else {
        setAiError(data.error || 'Failed to execute AI editing command.');
      }
    } catch (err: any) {
      setAiError(err.message || 'AI presentation editor returned an error.');
    } finally {
      setAiEditing(false);
    }
  };

  // Slide Manipulation Actions
  const handleUpdateSlideField = (field: keyof PresentationSlide, value: any) => {
    if (!presentation) return;
    const updatedSlides = [...presentation.slides];
    updatedSlides[activeSlideIdx] = {
      ...updatedSlides[activeSlideIdx],
      [field]: value
    };
    handleSaveEdits({
      ...presentation,
      slides: updatedSlides
    });
  };

  const handleUpdateBulletText = (bulletIdx: number, text: string) => {
    if (!presentation) return;
    const updatedSlides = [...presentation.slides];
    const bullets = [...(updatedSlides[activeSlideIdx].bullets || [])];
    bullets[bulletIdx] = text;
    updatedSlides[activeSlideIdx] = {
      ...updatedSlides[activeSlideIdx],
      bullets
    };
    handleSaveEdits({
      ...presentation,
      slides: updatedSlides
    });
  };

  const handleAddBullet = () => {
    if (!presentation) return;
    const updatedSlides = [...presentation.slides];
    const bullets = [...(updatedSlides[activeSlideIdx].bullets || []), "New bullet point"];
    updatedSlides[activeSlideIdx] = {
      ...updatedSlides[activeSlideIdx],
      bullets
    };
    handleSaveEdits({
      ...presentation,
      slides: updatedSlides
    });
  };

  const handleDeleteBullet = (bulletIdx: number) => {
    if (!presentation) return;
    const updatedSlides = [...presentation.slides];
    const bullets = (updatedSlides[activeSlideIdx].bullets || []).filter((_, idx) => idx !== bulletIdx);
    updatedSlides[activeSlideIdx] = {
      ...updatedSlides[activeSlideIdx],
      bullets
    };
    handleSaveEdits({
      ...presentation,
      slides: updatedSlides
    });
  };

  const handleMoveSlide = (direction: 'up' | 'down') => {
    if (!presentation) return;
    const idx = activeSlideIdx;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === presentation.slides.length - 1) return;

    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updatedSlides = [...presentation.slides];
    const temp = updatedSlides[idx];
    updatedSlides[idx] = updatedSlides[newIdx];
    updatedSlides[newIdx] = temp;

    setPresentation({ ...presentation, slides: updatedSlides });
    setActiveSlideIdx(newIdx);
    handleSaveEdits({ ...presentation, slides: updatedSlides });
  };

  const handleDuplicateSlide = () => {
    if (!presentation) return;
    const currentSlide = presentation.slides[activeSlideIdx];
    const duplicated: PresentationSlide = {
      ...currentSlide,
      id: `slide_dup_${Date.now()}`,
      title: `${currentSlide.title} (Copy)`
    };
    const updatedSlides = [...presentation.slides];
    updatedSlides.splice(activeSlideIdx + 1, 0, duplicated);

    setPresentation({ ...presentation, slides: updatedSlides });
    setActiveSlideIdx(activeSlideIdx + 1);
    handleSaveEdits({ ...presentation, slides: updatedSlides });
  };

  const handleDeleteSlide = () => {
    if (!presentation || presentation.slides.length <= 1) return;
    const updatedSlides = presentation.slides.filter((_, idx) => idx !== activeSlideIdx);
    setPresentation({ ...presentation, slides: updatedSlides });
    setActiveSlideIdx(Math.max(0, activeSlideIdx - 1));
    handleSaveEdits({ ...presentation, slides: updatedSlides });
  };

  const handleAddNewSlide = () => {
    if (!presentation) return;
    const newSlide: PresentationSlide = {
      id: `slide_new_${Date.now()}`,
      type: 'bullet',
      title: 'New Slide Title',
      subtitle: 'Add a helpful subtitle or core topic',
      bullets: ['Key takeaway or insight 1', 'Key takeaway or insight 2'],
      icon: 'Layers',
      imagePrompt: 'A simple vector icon showing stacked layers',
      speakerNotes: 'Explain the details of this new topic.',
      speakingTimeSecs: 60,
      confidenceScore: 100,
      layout: 'split'
    };
    const updatedSlides = [...presentation.slides];
    updatedSlides.splice(activeSlideIdx + 1, 0, newSlide);

    setPresentation({ ...presentation, slides: updatedSlides });
    setActiveSlideIdx(activeSlideIdx + 1);
    handleSaveEdits({ ...presentation, slides: updatedSlides });
  };

  const handleSplitSlide = () => {
    if (!presentation) return;
    const currentSlide = presentation.slides[activeSlideIdx];
    const bullets = currentSlide.bullets || [];
    if (bullets.length < 2) return;

    const mid = Math.ceil(bullets.length / 2);
    const bullets1 = bullets.slice(0, mid);
    const bullets2 = bullets.slice(mid);

    const slide1: PresentationSlide = {
      ...currentSlide,
      bullets: bullets1,
      title: `${currentSlide.title} (Part 1)`
    };
    const slide2: PresentationSlide = {
      ...currentSlide,
      id: `slide_split_${Date.now()}`,
      bullets: bullets2,
      title: `${currentSlide.title} (Part 2)`
    };

    const updatedSlides = [...presentation.slides];
    updatedSlides.splice(activeSlideIdx, 1, slide1, slide2);

    setPresentation({ ...presentation, slides: updatedSlides });
    handleSaveEdits({ ...presentation, slides: updatedSlides });
  };

  const handleMergeSlide = () => {
    if (!presentation || activeSlideIdx === presentation.slides.length - 1) return;
    const slide1 = presentation.slides[activeSlideIdx];
    const slide2 = presentation.slides[activeSlideIdx + 1];

    const mergedSlide: PresentationSlide = {
      ...slide1,
      title: `${slide1.title} & ${slide2.title}`,
      bullets: [...(slide1.bullets || []), ...(slide2.bullets || [])],
      speakerNotes: `${slide1.speakerNotes}\n\n${slide2.speakerNotes}`
    };

    const updatedSlides = [...presentation.slides];
    updatedSlides.splice(activeSlideIdx, 2, mergedSlide);

    setPresentation({ ...presentation, slides: updatedSlides });
    handleSaveEdits({ ...presentation, slides: updatedSlides });
  };

  // Change Theme / Style Live
  const handleChangeTheme = async (themeId: string) => {
    setSelectedTheme(themeId);
    if (presentation) {
      const updated = {
        ...presentation,
        theme: themeId
      };
      setPresentation(updated);
      handleSaveEdits(updated);
    }
  };

  // Simulated Speaking Notes Voice Playback
  const handleTogglePlayNotes = () => {
    if (isPlayingNotes) {
      clearInterval(speechIntervalRef.current);
      setIsPlayingNotes(false);
    } else {
      setIsPlayingNotes(true);
      const activeSlide = presentation?.slides[activeSlideIdx];
      const maxTime = activeSlide?.speakingTimeSecs || 60;
      setNotesSpeechTimer(0);
      speechIntervalRef.current = setInterval(() => {
        setNotesSpeechTimer(prev => {
          if (prev >= maxTime) {
            clearInterval(speechIntervalRef.current);
            setIsPlayingNotes(false);
            return maxTime;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => clearInterval(speechIntervalRef.current);
  }, []);

  // Theme matching configs
  const activeThemeObj = PRESET_THEMES.find(t => t.id === (presentation?.theme || selectedTheme)) || PRESET_THEMES[0];

  // PowerPoint PPTX Exporter via pptxgenjs
  const handleExportPPTX = () => {
    if (!presentation || presentation.slides.length === 0) return;

    const pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';

    // Set Presentation Title metadata
    pres.title = videoTitle || 'Zipytiny AI Presentation';
    pres.subject = 'Video summary slide deck';

    const slidesData = presentation.slides;

    slidesData.forEach((slide) => {
      const pptxSlide = pres.addSlide();

      // Set background color
      const isDark = activeThemeObj.isDark;
      const bgHex = isDark ? (activeThemeObj.id === 'Apple Keynote' ? '1C1C1E' : '09090B') : 'F8FAFC';
      pptxSlide.background = { fill: bgHex };

      // Slide Title
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 0.5,
        w: 12.3,
        h: 0.8,
        fontSize: 28,
        bold: true,
        fontFace: 'Arial',
        color: isDark ? '22D3EE' : '1E3A8A'
      });

      // Subtitle if exists
      if (slide.subtitle) {
        pptxSlide.addText(slide.subtitle, {
          x: 0.5,
          y: 1.2,
          w: 12.3,
          h: 0.4,
          fontSize: 16,
          italic: true,
          fontFace: 'Arial',
          color: isDark ? 'D4D4D8' : '475569'
        });
      }

      // Add slides depending on types
      if (slide.type === 'title') {
        // Large title layout
        pptxSlide.addText(slide.title, {
          x: 1.0,
          y: 2.2,
          w: 11.3,
          h: 1.5,
          fontSize: 40,
          bold: true,
          fontFace: 'Arial',
          color: isDark ? '22D3EE' : '1E3A8A',
          align: 'center'
        });
        if (slide.subtitle) {
          pptxSlide.addText(slide.subtitle, {
            x: 1.0,
            y: 3.8,
            w: 11.3,
            h: 0.8,
            fontSize: 20,
            fontFace: 'Arial',
            color: isDark ? 'A1A1AA' : '64748B',
            align: 'center'
          });
        }
      } else if (slide.type === 'comparison' || slide.layout === 'split') {
        // Left Column (bullets)
        const bulletPoints = (slide.bullets || []).map(b => ({ text: b, options: { bullet: true, fontSize: 14 } }));
        pptxSlide.addText(bulletPoints, {
          x: 0.5,
          y: 1.8,
          w: 5.8,
          h: 4.5,
          fontFace: 'Arial',
          color: isDark ? 'ECECF1' : '334155'
        });

        // Right Column (illustration suggestion or comparison diagram)
        pptxSlide.addText(slide.imagePrompt || 'Visual Illustration', {
          x: 6.8,
          y: 1.8,
          w: 5.5,
          h: 4.5,
          fill: { color: isDark ? '2D2D30' : 'E2E8F0' },
          fontSize: 12,
          color: isDark ? 'A1A1AA' : '475569',
          align: 'center',
          valign: 'middle'
        });
      } else {
        // Standard full width bullet points
        const bulletPoints = (slide.bullets || []).map(b => ({ text: b, options: { bullet: true, fontSize: 15 } }));
        pptxSlide.addText(bulletPoints, {
          x: 0.5,
          y: 1.8,
          w: 12.3,
          h: 4.5,
          fontFace: 'Arial',
          color: isDark ? 'ECECF1' : '334155'
        });
      }

      // Add Speaker Notes to slide
      pptxSlide.addNotes(slide.speakerNotes);
    });

    // Save and trigger download
    pres.writeFile({ fileName: `Zipytiny_Presentation_${videoId}.pptx` });
  };

  return (
    <div className="space-y-6">
      
      {/* =========================================
          STATE A: NO PRESENTATION GENERATED YET
          ========================================= */}
      {!presentation && !loading && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-black/[0.04] dark:border-zinc-800 text-center space-y-8 max-w-4xl mx-auto shadow-sm">
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <Presentation className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-neutral-950 dark:text-zinc-50 font-display">
              Convert Video to Premium Presentation
            </h3>
            <p className="text-sm text-neutral-500 dark:text-zinc-400 leading-relaxed">
              Let Zipytiny structure and style a high-fidelity slide deck automatically from the video transcript. Perfect for students, trainers, and enterprise professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left border-t border-neutral-100 dark:border-zinc-800 pt-8">
            
            {/* Style Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5" /> Presentation Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESENTATION_STYLES.slice(0, 8).map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`py-2.5 px-3.5 text-xs rounded-xl border text-center transition cursor-pointer font-medium ${
                      selectedStyle === style
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
                        : 'border-slate-200 text-slate-600 dark:border-zinc-800 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Core Design Theme
              </label>
              <div className="space-y-2">
                {PRESET_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                      selectedTheme === theme.id
                        ? 'border-indigo-600 bg-indigo-50/10 text-indigo-900 dark:text-indigo-400 font-semibold'
                        : 'border-slate-200 text-slate-600 dark:border-zinc-800 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${theme.accent}`} />
                      <span>{theme.name}</span>
                    </div>
                    {selectedTheme === theme.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="border-t border-neutral-100 dark:border-zinc-800 pt-6">
            <button
              onClick={handleGenerate}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/10 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              Build AI Presentation Slides
            </button>
          </div>
        </div>
      )}

      {/* =========================================
          STATE B: BACKGROUND PIPELINE LOADING SCREEN
          ========================================= */}
      {loading && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 border border-black/[0.04] dark:border-zinc-800 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-950 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
              <Presentation className="w-7 h-7 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-zinc-50">
              Generating High-Fidelity Slides
            </h3>
            <p className="text-sm text-neutral-500 dark:text-zinc-400">
              {presentation?.currentStage || 'Drafting presentation structure and speaker scripts...'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 max-w-sm mx-auto">
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${presentation?.progressPercent || 30}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{presentation?.progressPercent || 30}% Completed</span>
              <span>Est: ~{estRemainingSecs}s left</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl max-w-sm mx-auto">
            <p className="text-xs text-slate-500 leading-relaxed font-mono">
              ⚡ You can close this screen or explore other tabs; slide generation runs asynchronously in the background.
            </p>
          </div>
        </div>
      )}

      {/* =========================================
          STATE C: PRESENTATION ACTIVE WORKSPACE
          ========================================= */}
      {presentation && presentation.status === 'completed' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* SLIDE DECK NAVIGATION (3/12 width) */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Quick Presets Config */}
            <div className="bg-[#f2f2f7] dark:bg-zinc-950 p-4 rounded-3xl space-y-4 border border-black/[0.02] dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Design presets</span>
                <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                  {presentation.style}
                </span>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Live Theme Select</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleChangeTheme(theme.id)}
                      title={theme.name}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition active:scale-90 cursor-pointer ${
                        presentation.theme === theme.id 
                          ? 'border-indigo-600 ring-2 ring-indigo-600/20' 
                          : 'border-transparent'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full ${theme.accent} border border-black/10`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide List Sidebar */}
            <div className="bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-zinc-800 rounded-3xl p-4 space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin shadow-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Slides ({presentation.slides.length})
                </span>
                <button
                  onClick={handleAddNewSlide}
                  title="Add new slide"
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {presentation.slides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    onClick={() => setActiveSlideIdx(idx)}
                    className={`group w-full p-3 rounded-2xl text-left border transition cursor-pointer relative ${
                      activeSlideIdx === idx
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-zinc-800 dark:border-zinc-700'
                        : 'bg-slate-50/50 hover:bg-slate-50 border-transparent dark:bg-zinc-850 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-200/50 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-bold truncate">{slide.title}</span>
                        <span className="block text-[10px] text-slate-400 capitalize font-mono">{slide.type} Slide</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ACTIVE PREVIEW CANVAS (6/12 width) */}
          <div className="xl:col-span-6 space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase font-mono">LAYOUT MODE:</span>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    editMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  {editMode ? 'Stop Editing' : 'Inline Edit'}
                </button>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-1">
                <button
                  disabled={activeSlideIdx === 0}
                  onClick={() => setActiveSlideIdx(prev => Math.max(0, prev - 1))}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-xl transition cursor-pointer dark:bg-zinc-800 dark:hover:bg-zinc-750"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-500 px-2">
                  {activeSlideIdx + 1} / {presentation.slides.length}
                </span>
                <button
                  disabled={activeSlideIdx === presentation.slides.length - 1}
                  onClick={() => setActiveSlideIdx(prev => Math.min(presentation.slides.length - 1, prev + 1))}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-xl transition cursor-pointer dark:bg-zinc-800 dark:hover:bg-zinc-750"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className={`w-full aspect-[16/9] ${activeThemeObj.bg} ${activeThemeObj.border} border rounded-3xl p-8 relative flex flex-col justify-between overflow-hidden shadow-md`}>
              
              {/* Theme corner decorator */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 dark:bg-indigo-400/5 rounded-bl-full pointer-events-none" />

              {/* Slide Content */}
              <div className="space-y-4">
                
                {/* Header Title Block */}
                <div className="space-y-1">
                  {editMode ? (
                    <input
                      type="text"
                      value={presentation.slides[activeSlideIdx].title}
                      onChange={(e) => handleUpdateSlideField('title', e.target.value)}
                      className="w-full text-2xl font-bold bg-white dark:bg-zinc-800 border border-indigo-200 rounded px-2 py-1 focus:outline-none"
                    />
                  ) : (
                    <h2 className={`text-2xl font-extrabold tracking-tight ${activeThemeObj.primary}`}>
                      {presentation.slides[activeSlideIdx].title}
                    </h2>
                  )}

                  {presentation.slides[activeSlideIdx].subtitle && (
                    editMode ? (
                      <input
                        type="text"
                        value={presentation.slides[activeSlideIdx].subtitle}
                        onChange={(e) => handleUpdateSlideField('subtitle', e.target.value)}
                        className="w-full text-xs bg-white dark:bg-zinc-800 border border-indigo-200 rounded px-2 py-0.5"
                      />
                    ) : (
                      <p className={`text-xs italic ${activeThemeObj.secondary}`}>
                        {presentation.slides[activeSlideIdx].subtitle}
                      </p>
                    )
                  )}
                </div>

                {/* Main slide layout switches */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 items-center">
                  
                  {/* Left content block */}
                  <div className={(presentation.slides[activeSlideIdx].type === 'comparison' || presentation.slides[activeSlideIdx].layout === 'split') ? 'md:col-span-7 space-y-3' : 'md:col-span-12 space-y-3'}>
                    <ul className="space-y-2.5">
                      {(presentation.slides[activeSlideIdx].bullets || []).map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700 dark:text-zinc-200">
                          <span className="text-indigo-500 mt-1.5 shrink-0">•</span>
                          {editMode ? (
                            <div className="flex-1 flex items-center gap-1.5">
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => handleUpdateBulletText(bIdx, e.target.value)}
                                className="flex-1 bg-white dark:bg-zinc-800 border border-indigo-100 rounded px-2 py-0.5 text-sm"
                              />
                              <button
                                onClick={() => handleDeleteBullet(bIdx)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span>{bullet}</span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {editMode && (
                      <button
                        onClick={handleAddBullet}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Bullet Point
                      </button>
                    )}
                  </div>

                  {/* Right layout illustration side-car (split layout or comparison) */}
                  {(presentation.slides[activeSlideIdx].type === 'comparison' || presentation.slides[activeSlideIdx].layout === 'split') && (
                    <div className="md:col-span-5">
                      <div className="bg-slate-100/50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700 text-center space-y-2 min-h-[140px] flex flex-col justify-center">
                        <div className="text-indigo-500 flex justify-center">
                          <Image className="w-6 h-6 opacity-60" />
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          {presentation.slides[activeSlideIdx].imagePrompt || 'Visual elements suggest dynamic workflows here.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Diagrams Renderer if type diagram */}
                  {presentation.slides[activeSlideIdx].type === 'diagram' && presentation.slides[activeSlideIdx].diagram && (
                    <div className="col-span-12 pt-2">
                      <div className="bg-white/50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center justify-around gap-2 max-w-lg mx-auto">
                        {(presentation.slides[activeSlideIdx].diagram?.elements || []).map((step, sIdx) => (
                          <React.Fragment key={sIdx}>
                            <div className="bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm">
                              {step}
                            </div>
                            {sIdx < (presentation.slides[activeSlideIdx].diagram?.elements.length || 0) - 1 && (
                              <span className="text-indigo-400 font-bold">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Slide Footer */}
              <div className="flex justify-between items-center border-t border-slate-150/40 dark:border-zinc-800/40 pt-4 text-[10px] font-mono text-slate-400">
                <span>{presentation.style} Presentation Theme</span>
                <span>Page {activeSlideIdx + 1}</span>
              </div>

            </div>

            {/* Slide Manipulation & Reorder Actions bar */}
            <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 border border-black/[0.02] dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleMoveSlide('up')}
                  disabled={activeSlideIdx === 0}
                  className="flex items-center gap-1 py-1.5 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold disabled:opacity-40 transition cursor-pointer text-slate-600 dark:text-zinc-300"
                >
                  <ArrowUp className="w-3.5 h-3.5" /> Move Up
                </button>
                <button
                  onClick={() => handleMoveSlide('down')}
                  disabled={activeSlideIdx === presentation.slides.length - 1}
                  className="flex items-center gap-1 py-1.5 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold disabled:opacity-40 transition cursor-pointer text-slate-600 dark:text-zinc-300"
                >
                  <ArrowDown className="w-3.5 h-3.5" /> Move Down
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDuplicateSlide}
                  className="flex items-center gap-1 py-1.5 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold transition cursor-pointer text-slate-600 dark:text-zinc-300"
                >
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
                <button
                  onClick={handleSplitSlide}
                  title="Split into two slides"
                  className="flex items-center gap-1 py-1.5 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold transition cursor-pointer text-slate-600 dark:text-zinc-300"
                >
                  <Split className="w-3.5 h-3.5" /> Split
                </button>
                <button
                  onClick={handleMergeSlide}
                  disabled={activeSlideIdx === presentation.slides.length - 1}
                  title="Merge with next slide"
                  className="flex items-center gap-1 py-1.5 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold disabled:opacity-40 transition cursor-pointer text-slate-600 dark:text-zinc-300"
                >
                  <Merge className="w-3.5 h-3.5" /> Merge Next
                </button>
                <button
                  onClick={handleDeleteSlide}
                  disabled={presentation.slides.length <= 1}
                  className="flex items-center gap-1 py-1.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-semibold text-red-600 disabled:opacity-40 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>

            {/* SPEAKER NOTES COLLAPSIBLE PANEL */}
            <div className="bg-[#f5f5f7] dark:bg-zinc-900 p-6 rounded-3xl border border-black/[0.02] dark:border-zinc-800/65 space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Trainer Notes</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-indigo-500" />
                    Interactive Presenter Notes & Teleprompter
                  </h4>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">
                    Est: {presentation.slides[activeSlideIdx].speakingTimeSecs || 60}s speech
                  </span>
                  <button
                    onClick={handleTogglePlayNotes}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-sm ${
                      isPlayingNotes ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    {isPlayingNotes ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
                  </button>
                </div>
              </div>

              {isPlayingNotes && (
                <div className="bg-white dark:bg-zinc-950 p-3 rounded-2xl border border-indigo-100 flex items-center gap-4 animate-pulse">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-500">
                      <span>Notes playback active (voice rehearsal mock)</span>
                      <span>{notesSpeechTimer}s / {presentation.slides[activeSlideIdx].speakingTimeSecs || 60}s elapsed</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1">
                      <div 
                        className="bg-indigo-600 h-1 rounded-full" 
                        style={{ width: `${(notesSpeechTimer / (presentation.slides[activeSlideIdx].speakingTimeSecs || 60)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {editMode ? (
                <textarea
                  value={presentation.slides[activeSlideIdx].speakerNotes}
                  onChange={(e) => handleUpdateSlideField('speakerNotes', e.target.value)}
                  className="w-full h-24 text-xs font-mono bg-white dark:bg-zinc-800 border border-indigo-200 rounded-2xl p-3 focus:outline-none"
                />
              ) : (
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-sans italic border-l-2 border-indigo-500 pl-3">
                  {presentation.slides[activeSlideIdx].speakerNotes}
                </p>
              )}
            </div>

          </div>

          {/* AI COMMAND BOX & EXPORTS (3/12 width) */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Exports */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-black/[0.04] dark:border-zinc-800 space-y-4 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Exporter Center
              </span>

              <div className="space-y-2">
                <button
                  onClick={handleExportPPTX}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10 text-xs"
                >
                  <Download className="w-4 h-4" />
                  PowerPoint (.pptx)
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:text-zinc-200 font-bold py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <FileText className="w-4 h-4" />
                  PDF / Hard Copy
                </button>
              </div>
            </div>

            {/* AI Assistant Editor Command Box */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-black/[0.04] dark:border-zinc-800 space-y-4 shadow-sm">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  AI Designer Refinement
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Direct the AI Designer to tweak or restructure slides instantly.
                </p>

                {/* Quick actions list */}
                <div className="flex flex-wrap gap-1.5">
                  {['Make it shorter', 'Professional tone', 'Simplify language', 'Add visuals'].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => setAiCommand(cmd)}
                      className="text-[10px] bg-slate-50 hover:bg-indigo-50 border border-slate-200 dark:bg-zinc-800 dark:border-zinc-800 dark:hover:bg-zinc-750 text-slate-600 dark:text-zinc-300 px-2 py-1 rounded-lg transition cursor-pointer"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <textarea
                    value={aiCommand}
                    onChange={(e) => setAiCommand(e.target.value)}
                    placeholder="e.g. Expand concepts into 12 slides..."
                    className="w-full h-20 bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 rounded-2xl p-2.5 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none"
                  />
                  <button
                    disabled={aiEditing || !aiCommand.trim()}
                    onClick={handleAICommand}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition cursor-pointer"
                  >
                    {aiEditing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Refining Deck...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Apply AI Change
                      </>
                    )}
                  </button>
                </div>

                {aiError && (
                  <p className="text-[10px] text-red-500 leading-snug font-mono">
                    ⚠️ Error: {aiError}
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
