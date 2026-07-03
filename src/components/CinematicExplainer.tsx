import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Sparkles, 
  Cpu, 
  CheckCircle, 
  ArrowRight,
  Video,
  MousePointer,
  Maximize2,
  Trophy,
  Flame,
  Activity,
  Clock,
  BookOpen,
  Layers,
  Lightbulb,
  X,
  Check
} from 'lucide-react';

// Narrative / voiceover sync database
interface CinematicScene {
  id: number;
  label: string;
  start: number; // in seconds
  end: number;
  title: string;
  onScreenText: string;
  voiceover: string;
  emotion: 'overwhelmed' | 'intrigued' | 'analyzing' | 'practicing' | 'retained' | 'mastered';
}

const CINEMATIC_SCENES: CinematicScene[] = [
  {
    id: 1,
    label: "1. The Overload",
    start: 0,
    end: 12,
    title: "The Core Agony: Cognitive Collapse",
    onScreenText: "“Drowning in un-navigable hours…”\n“No search. No index. Zero recall.”\n“Passive consumption is memory decay.”",
    voiceover: "Think about the last three-hour video or lecture you watched. You sat there passively. You paused, you scrolled backwards, you scribbled notes, but the timeline was a blur. Within 24 hours, eighty percent of that knowledge was lost. This is traditional learning chaos.",
    emotion: 'overwhelmed'
  },
  {
    id: 2,
    label: "2. The Awakening",
    start: 12,
    end: 25,
    title: "The Ingestion: Seamless Digital Conversion",
    onScreenText: "“What if videos became interactive courseware?”\n“SnapSum Dynamic Ingestion Pipeline”",
    voiceover: "What if content adapted to your mind? You paste any URL inside SnapSum. Instantly, our multi-modal compiler indexes the sound, frames, and speech, preparing a custom active workspace designed entirely for your brain.",
    emotion: 'intrigued'
  },
  {
    id: 3,
    label: "3. Semantic Deep Scan",
    start: 25,
    end: 40,
    title: "The Synthesis: Three-Tier Compiling Engine",
    onScreenText: "“Deconstructing raw media…”\n“Chronological Chapters • Conceptual Nodes • Diagnostic Quizzes”",
    voiceover: "The compile layer gets to work. First, it segments key moments into click-to-seek chapters. Next, it maps core technical ideas into hyper-clear metaphors. Finally, it designs customized diagnostic retrieval quizzes to force active recollection.",
    emotion: 'analyzing'
  },
  {
    id: 4,
    label: "4. Interactive Site Tour",
    start: 40,
    end: 65,
    title: "The Practice: Exploring Active Modules",
    onScreenText: "“Own the core. Play to remember.”",
    voiceover: "This is your active dashboard. Click on Chapters to jump target timelines instantly. Hover over any Concept card to unlock human-style mental metaphors. Or take the quiz to cement information permanently. Learning becomes play.",
    emotion: 'practicing'
  },
  {
    id: 5,
    label: "5. The Mind Shift",
    start: 65,
    end: 80,
    title: "The Split Contrast: Passive vs Active",
    onScreenText: "“Passive Watching: 15% Retention”\n“Active SnapSumming: 94% Retention”",
    voiceover: "Compare the difference. On the left: scrolling, confusion, and distraction. On the right: crisp mental structures, 94 percent active retention rates, and accelerated speed. You learn faster with less fatigue.",
    emotion: 'retained'
  },
  {
    id: 6,
    label: "6. Intellectual Mastery",
    start: 80,
    end: 95,
    title: "The Outro: Elevate Your Growth",
    onScreenText: "“Learn everything. Retain forever.”\n“Paste your first link now.”",
    voiceover: "Build your personal repository of intelligence. Study what you want, when you want, with complete retention. SnapSum will turn any multimedia channel into your private tutor. Paste a link to start.",
    emotion: 'mastered'
  }
];

interface CinematicExplainerProps {
  onStartLearning: () => void;
}

export const CinematicExplainer: React.FC<CinematicExplainerProps> = ({ onStartLearning }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0); 
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'simulation' | 'script' | 'structure' | 'voiceover'>('simulation');
  const [audioSupported, setAudioSupported] = useState<boolean>(true);
  
  const [isVerticalMode, setIsVerticalMode] = useState<boolean>(false);
  const [isExportingVertical, setIsExportingVertical] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  
  // Audio voiceover state and references - Default to the pre-packaged voiceover.mp3
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>('/voiceover.mp3');
  const [customAudioName, setCustomAudioName] = useState<string | null>('voiceover.mp3');
  const [isUsingCustomAudio, setIsUsingCustomAudio] = useState<boolean>(true);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioLoad = (url: string, fileName: string, autoPlay: boolean = true) => {
    setCustomAudioUrl(url);
    setCustomAudioName(fileName);
    setIsUsingCustomAudio(true);
    setCurrentTime(0);
    setIsPlaying(autoPlay);

    // Let React render cycle bind the new src before attempting synchronous play if autoPlay is requested
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.muted = isMuted;
        audioRef.current.playbackRate = playSpeed;
        if (autoPlay) {
          audioRef.current.play().catch((err) => {
            console.warn("Direct play failed on voiceover load:", err);
          });
        }
      }
    }, 50);
  };

  // Sync audio controls and handle autoplay blocks gracefully
  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = isMuted;
    audioRef.current.playbackRate = playSpeed;
    
    if (isPlaying && isUsingCustomAudio) {
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay blocked by browser policy. Awaiting user interaction.", err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isMuted, playSpeed, isUsingCustomAudio]);

  // Sync audio position on manual jumps (clicks on chapters/scrubs/rewind)
  useEffect(() => {
    if (!audioRef.current || !isUsingCustomAudio) return;
    
    const diff = Math.abs(audioRef.current.currentTime - currentTime);
    if (diff > 0.5) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime, isUsingCustomAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (customAudioUrl && customAudioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(customAudioUrl);
      }
    };
  }, [customAudioUrl]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        handleAudioLoad(url, file.name);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      handleAudioLoad(url, file.name);
    }
  };
  
  // High fidelity Interactive Tour State inside Scene 4 & 5
  const [activeFeatureTab, setActiveFeatureTab] = useState<'chapters' | 'concepts' | 'quizzes' | 'dashboard'>('concepts');
  const [timelineSecs, setTimelineSecs] = useState<number>(134);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [conceptMetaphorIndex, setConceptMetaphorIndex] = useState<number>(0);

  // Custom interactive slider position for Scene 5 split-screen comparison
  const [splitSliderPos, setSplitSliderPos] = useState<number>(50); 

  // Reference for interval loops
  const intervalRef = useRef<any>(null);
  const currentSentenceRef = useRef<string>("");

  // Sound effects natively synthesized via Web Audio API 🎛️
  const playSynthBeep = (freq: number = 440, type: OscillatorType = 'sine', duration: number = 0.1, gainVal: number = 0.08) => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // safe fallback
    }
  };

  // Sound sweeps for scenes transitions
  const playSynthSweep = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  // Play micro chimes for correct answers in simulator
  const playPositiveChime = () => {
    playSynthBeep(523.25, 'sine', 0.15, 0.06); // C5
    setTimeout(() => {
      playSynthBeep(659.25, 'sine', 0.25, 0.06); // E5
    }, 100);
  };

  const playNegativeChime = () => {
    playSynthBeep(293.66, 'triangle', 0.2, 0.08); // D4
  };

  // Find corresponding scene based on time
  const currentScene = CINEMATIC_SCENES.find(
    s => currentTime >= s.start && currentTime < s.end
  ) || CINEMATIC_SCENES[CINEMATIC_SCENES.length - 1];

  const handleExportVerticalVideo = async () => {
    try {
      setIsExportingVertical(true);
      setExportMessage("Compiling high-definition 1080x1920 vertical frames...");
      playSynthBeep(440, 'sine', 0.1);

      // Force a small delay for state update to settle and render offscreen container
      await new Promise((resolve) => setTimeout(resolve, 300));

      const element = document.getElementById("vertical-video-export-target");
      if (!element) {
        throw new Error("Export target element not found.");
      }

      setExportMessage("Baking audio track markers & watermark brand overlays...");
      
      const dataUrl = await toPng(element, {
        width: 1080,
        height: 1920,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
        cacheBust: true,
      });

      setExportMessage("Rendering final 1080x1920 PNG package...");
      await new Promise((resolve) => setTimeout(resolve, 400));

      const link = document.createElement('a');
      link.download = `snapsum-explainer-916-scene${currentScene.id}.png`;
      link.href = dataUrl;
      link.click();

      playPositiveChime();
      setExportMessage("✓ Success! Vertical format exported successfully.");
      setTimeout(() => setExportMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setExportMessage("❌ Export failed. Please try again.");
      playNegativeChime();
      setTimeout(() => setExportMessage(null), 3000);
    } finally {
      setIsExportingVertical(false);
    }
  };

  // React to time changes to trigger speech & chimes
  useEffect(() => {
    if (!isPlaying) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Trigger subtle chime on scene transitions
    const matchSceneStart = CINEMATIC_SCENES.find(s => Math.floor(currentTime) === s.start);
    if (matchSceneStart && currentTime - matchSceneStart.start < 0.2) {
      playSynthSweep();
    }

    // Auto switch tabs based on scene to showcase nice features
    if (currentTime >= 40 && currentTime < 65) {
      // In timeline tour, rotate active tabs periodically to explain the system fully
      const relativeTime = currentTime - 40;
      if (relativeTime < 6) {
        setActiveFeatureTab('chapters');
      } else if (relativeTime >= 6 && relativeTime < 13) {
        setActiveFeatureTab('concepts');
      } else if (relativeTime >= 13 && relativeTime < 20) {
        setActiveFeatureTab('quizzes');
      } else {
        setActiveFeatureTab('dashboard');
      }
    }

    // TTS Voiceover Sync with window.speechSynthesis
    if (typeof window !== 'undefined' && window.speechSynthesis && !isMuted && !isUsingCustomAudio) {
      const sentence = currentScene.voiceover;
      if (currentSentenceRef.current !== sentence) {
        window.speechSynthesis.cancel();
        currentSentenceRef.current = sentence;
        
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.rate = 1.05; // Slightly faster for clean pacing
        utterance.pitch = 1.0;
        
        // Find high-quality sounding voice if available
        const voices = window.speechSynthesis.getVoices();
        const idealVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium')));
        if (idealVoice) {
          utterance.voice = idealVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      }
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      currentSentenceRef.current = "";
    }
  }, [currentScene, isMuted, isPlaying, isUsingCustomAudio]);

  // Audio browser permission checks
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.speechSynthesis) {
      setAudioSupported(false);
    }
  }, []);

  // Frame timer simulation loop
  useEffect(() => {
    if (isPlaying) {
      const fps = 10;
      const tick = 1000 / (fps * playSpeed);
      
      intervalRef.current = setInterval(() => {
        if (isUsingCustomAudio && audioRef.current) {
          const audioTime = audioRef.current.currentTime;
          if (audioTime >= 95) {
            setIsPlaying(false);
            audioRef.current.pause();
            setCurrentTime(95);
          } else {
            setCurrentTime(Math.round(audioTime * 10) / 10);
          }
        } else {
          setCurrentTime(prev => {
            if (prev >= 95) {
              setIsPlaying(false);
              return 95;
            }
            return Math.round((prev + 0.1) * 10) / 10;
          });
        }
      }, tick);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playSpeed, isUsingCustomAudio]);

  // Cleanup synthesis on components teardown
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handles control functions
  const handlePlayPause = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    if (audioRef.current && isUsingCustomAudio) {
      if (nextPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Direct play failed in handlePlayPause:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleRewind = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    currentSentenceRef.current = "";
    setCurrentTime(0);
    setIsPlaying(true);
    if (audioRef.current && isUsingCustomAudio) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn("Direct play failed in handleRewind:", err);
      });
    }
    playSynthBeep(220, 'sine', 0.2);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (!isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const jumpToScene = (startSec: number) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    currentSentenceRef.current = "";
    setCurrentTime(startSec);
    setIsPlaying(true);
    if (audioRef.current && isUsingCustomAudio) {
      audioRef.current.currentTime = startSec;
      audioRef.current.play().catch((err) => {
        console.warn("Direct play failed in jumpToScene:", err);
      });
    }
    playSynthBeep(330, 'sine', 0.15);
  };

  // Mock concepts data for simulation
  const mockConcepts = [
    { title: "Closure Scaffolding", metaphor: "A closure is like a secure backpack. Even when the outer traveler (function) goes home, the backpack holds all the objects collected along the road.", difficulty: "Medium", confidence: "98%" },
    { title: "Prototypal Inheritance", metaphor: "Think of prototypes like family recipes handed down. If the child doesn't know how to cook a soup, they automatically ask the mother's recipe book.", difficulty: "Hard", confidence: "94%" },
    { title: "Asynchronous Event Loop", metaphor: "The Event Loop is like a strict traffic warden. It checks if the main street is completely empty before letting passengers from the side street cross.", difficulty: "Expert", confidence: "96%" }
  ];

  return (
    <div className="w-full bg-white border border-black/[0.05] shadow-[0_25px_60px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden font-sans text-neutral-900 flex flex-col lg:flex-row transition-all duration-300 max-w-7xl mx-auto scroll-mt-20 my-2" id="cinematic-explainer-panel">
      {/* Declarative audio playback element */}
      <audio
        ref={audioRef}
        src={customAudioUrl || undefined}
        muted={isMuted}
        preload="auto"
        className="hidden"
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(95);
        }}
        onError={(e) => {
          console.warn("Custom audio loading failed or was not found. Falling back to TTS speech synthesis:", e);
          setIsUsingCustomAudio(false);
        }}
      />
      
      {/* ========================================================================= */}
      {/* LEFT COLUMN: THE PREMIUM CINEMATIC SIMULATION DISPLAY */}
      {/* ========================================================================= */}
      <div className="flex-1 bg-neutral-950 p-4 sm:p-6 md:p-8 flex flex-col relative min-h-[500px] md:min-h-[620px] overflow-hidden select-none transition-all duration-300">
        
        {/* Subtle grid background for space context */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-neutral-950 to-transparent pointer-events-none"></div>
        
        {/* Cinematic Header Overlay */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/[0.05] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#bf5af2] animate-ping"></span>
            <span className="text-[10px] font-bold font-mono tracking-widest text-[#bf5af2] uppercase">
              SnapSum Cinematic Cinema
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.03]">
              {Math.floor(currentTime)}s / 95s
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-teal-400 uppercase bg-teal-500/10 px-2.5 py-0.5 rounded-md">
              Scene: {currentScene.label.split(".")[1]}
            </span>
          </div>
        </div>

        {/* Format Selectors and Social Video Exporters Bar */}
        <div className="relative z-10 py-2.5 border-b border-white/[0.05] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-medium text-neutral-400">Aspect Ratio:</span>
            <div className="bg-neutral-900 border border-white/5 rounded-xl p-1 flex gap-1">
              <button
                onClick={() => {
                  setIsVerticalMode(false);
                  playSynthBeep(350, 'sine', 0.08);
                }}
                className={`px-3 py-1.5 text-[9.5px] font-mono font-bold uppercase rounded-lg transition-all ${
                  !isVerticalMode
                    ? 'bg-[#bf5af2] text-white shadow shadow-[#bf5af2]/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                } cursor-pointer`}
              >
                🖥️ 16:9 Landscape
              </button>
              <button
                onClick={() => {
                  setIsVerticalMode(true);
                  playSynthBeep(420, 'sine', 0.08);
                }}
                className={`px-3 py-1.5 text-[9.5px] font-mono font-bold uppercase rounded-lg transition-all ${
                  isVerticalMode
                    ? 'bg-[#bf5af2] text-white shadow shadow-[#bf5af2]/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                } cursor-pointer`}
              >
                📱 9:16 Vertical
              </button>
            </div>
          </div>

          <button
            onClick={handleExportVerticalVideo}
            disabled={isExportingVertical}
            className="self-start sm:self-center px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold text-[10px] font-mono tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/25 shrink-0"
          >
            {isExportingVertical ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Generating {exportMessage ? '...' : '9:16 Frame'}</span>
              </>
            ) : (
              <>
                <span>📥 Download for TikTok/Reels</span>
              </>
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE STAGE CANVAS CONTAINERS */}
        {/* ========================================================================= */}
        <div 
          id="vertical-video-stage"
          className={`relative text-center select-none z-10 transition-all duration-500 ${
            isVerticalMode 
              ? 'aspect-[9/16] w-full max-w-[350px] bg-neutral-950 rounded-[2.5rem] border-[8px] border-neutral-800 shadow-2xl py-12 px-4.5 my-4 mx-auto overflow-hidden flex flex-col items-center justify-center' 
              : 'flex-1 py-6 w-full flex flex-col items-center justify-center'
          }`}
        >
          {/* Persistent Watermark Overlay */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-1.5 px-2.5 pointer-events-none shadow-sm animate-fadeIn">
            <img src="/logo.svg" className="w-3.5 h-3.5 rounded object-cover" referrerPolicy="no-referrer" alt="SnapSum Logo" />
            <span className="text-[8.5px] font-mono font-bold text-white tracking-tight">snapsum.app</span>
            <span className="text-[8.5px] font-mono font-light text-neutral-300 border-l border-white/20 pl-1.5">Summarized by SnapSum</span>
          </div>
          
          {/* Big Play Overlay for initial engagement and to satisfy autoplay policies */}
          {!isPlaying && currentTime === 0 && (
            <div 
              onClick={() => {
                setIsPlaying(true);
                if (audioRef.current && isUsingCustomAudio) {
                  audioRef.current.play().catch((err) => {
                    console.warn("Direct play failed on Big Play Overlay click:", err);
                  });
                }
                playSynthBeep(440, 'sine', 0.15);
              }}
              className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center cursor-pointer group transition-all duration-300 rounded-3xl"
            >
              <div className="relative">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 bg-emerald-500/25 rounded-full filter blur-xl animate-pulse group-hover:scale-125 transition duration-500"></div>
                
                {/* Big Play Button */}
                <div className="relative h-20 w-20 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.35)] group-hover:scale-110 transition duration-300">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </div>
              
              <div className="mt-6 text-center space-y-2 max-w-sm px-6">
                <h3 className="text-base font-bold tracking-tight text-white group-hover:text-emerald-400 transition font-sans">
                  {isUsingCustomAudio ? '🎙️ Premium Voiceover Ready' : '🎬 Click to Start Presentation'}
                </h3>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-light font-sans">
                  {isUsingCustomAudio 
                    ? 'A studio-grade ElevenLabs voiceover has been loaded and is ready to play. Tap to begin!' 
                    : 'Tap to start the interactive cinematic tour of SnapSum.'}
                </p>
              </div>
            </div>
          )}
          
          {/* ===================== SCENE 1: THE OVERLOAD (0s - 12s) ===================== */}
          {currentTime >= 0 && currentTime < 12 && (
            <div className="w-full max-w-2xl space-y-6 animate-fadeIn">
              
              {/* Overloaded UI & Distressed Learner Mockup */}
              <div className="bg-white/[0.02] border border-red-500/15 rounded-3xl p-5 text-left relative overflow-hidden backdrop-blur-md shadow-2xl">
                
                {/* Red warning border pulsating */}
                <div className="absolute inset-0 border-2 border-red-500/20 rounded-3xl animate-pulse pointer-events-none"></div>
                
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-neutral-600"></div>
                    <div className="w-3 h-3 rounded-full bg-neutral-600"></div>
                    <span className="text-[9px] font-mono text-neutral-400 ml-2">traditional-video-player.mp4</span>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-red-500 animate-pulse uppercase">⚠ System Failure</span>
                </div>

                <div className={`grid gap-5 pt-4 ${isVerticalMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'}`}>
                  {/* Left Side: Distressed Learner UI Visual Representation */}
                  <div className={`flex flex-col items-center justify-center bg-red-950/10 border border-red-500/10 rounded-2xl p-4 text-center relative space-y-3 ${isVerticalMode ? 'w-full' : 'col-span-1 md:col-span-5'}`}>
                    
                    {/* Distressed Human Icon and Cognitive stress gauge */}
                    <div className="relative h-16 w-16 flex items-center justify-center bg-red-900/20 rounded-full border border-red-500/30">
                      <div className="absolute inset-0 rounded-full border-4 border-dashed border-red-500/40 animate-spin" style={{ animationDuration: '10s' }}></div>
                      <span className="text-3xl">🤯</span>
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 text-[8px] font-bold leading-none animate-bounce">
                        98%
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-red-400 font-bold block uppercase tracking-wide">FATIGUE RATIO</span>
                      <div className="w-24 bg-white/10 rounded-full h-2 overflow-hidden mx-auto">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: '98%' }}></div>
                      </div>
                      <span className="text-[8px] font-mono text-neutral-400 block block">Scrolling • Re-winding</span>
                    </div>
                  </div>

                  {/* Right Side: Chaotic timelines & Scatter */}
                  <div className={`space-y-3 ${isVerticalMode ? 'w-full' : 'col-span-1 md:col-span-7'}`}>
                    <div className="bg-neutral-900/85 rounded-xl h-24 overflow-hidden flex flex-col justify-between p-3 border border-white/5 relative">
                      <div className="flex justify-between items-center relative z-10">
                        <span className="text-[8px] font-mono bg-red-600 text-white font-bold rounded-md px-2 py-0.5 animate-pulse">LOST IN THE TIMELINE</span>
                        <span className="text-[9px] font-mono text-neutral-400">Hour 2:14:52</span>
                      </div>
                      
                      {/* Chaotic Scrubbing Indicator Arrow Waves */}
                      <div className="flex justify-center items-center gap-1.5 py-1">
                        <span className="w-1.5 h-3 bg-red-500 rounded-sm"></span>
                        <span className="w-1.5 h-6 bg-red-400 rounded-sm"></span>
                        <span className="w-1.5 h-8 bg-red-600 rounded-sm"></span>
                        <span className="w-1.5 h-4 bg-red-500 rounded-sm"></span>
                        <span className="w-1.5 h-7 bg-red-500 rounded-sm"></span>
                      </div>

                      <div className="w-full bg-white/10 rounded-full h-1.5 relative overflow-hidden">
                        <div className="absolute top-0 bottom-0 bg-red-600 rounded-full animate-scrubPath" style={{ width: '40%' }}></div>
                      </div>
                    </div>

                    <div className="p-2.5 border border-dashed border-red-500/20 rounded-xl bg-red-500/[0.02] text-[9.5px] font-mono text-neutral-400 space-y-1">
                      <div className="flex justify-between text-[8px] uppercase tracking-wider text-red-400 font-bold">
                        <span>❌ Traditional Passive Loss</span>
                        <span>-85% Recall</span>
                      </div>
                      <p className="line-clamp-1 italic">“What was that parameter at minute 12 again?”</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stress Level Caption */}
              <div className="space-y-2 text-left max-w-lg mx-auto">
                <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5 text-red-500" />
                  <span>Phase 1: The Curse of Traditional Multimedia</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight leading-tight">
                  You spend hours watching... <span className="text-red-400 underline decoration-red-500/40 underline-offset-4">but retain almost nothing</span>.
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm font-light font-sans leading-relaxed">
                  Passive video viewing delivers instant dopamine but leaves you cognitively stranded. No search index, no structural reference, and endless scrubbing exhaustion.
                </p>
              </div>

            </div>
          )}

          {/* ===================== SCENE 2: ENTER SNAPSUM AI (12s - 25s) ===================== */}
          {currentTime >= 12 && currentTime < 25 && (
            <div className="w-full max-w-2xl space-y-6 animate-slideUp">
              
              {/* Slick Ingestion Pipeline Graphics */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-left space-y-5 relative overflow-hidden backdrop-blur-md shadow-2xl">
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl"></div>

                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 block">
                        Ingestion Layer
                      </span>
                      <span className="text-[9px] text-neutral-400 font-mono">Multimodal Link Receiver</span>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-800/20 animate-pulse">
                    READY
                  </span>
                </div>

                <div className="space-y-2.5">
                  <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">Paste Any Youtube or Lecture URL</p>
                  
                  {/* typing simulator */}
                  <div className="bg-neutral-900 border border-white/15 px-4 py-3 rounded-2xl flex items-center gap-3 justify-between relative shadow-inner">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                      <span className="text-indigo-300 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        {currentTime < 16 ? "https://" : currentTime < 20 ? "https://youtube.com/watch?v=Advanced_System_Des" : "https://youtube.com/watch?v=Advanced_System_Design_Scale"}
                        {currentTime < 20 && <span className="w-2 h-4 bg-indigo-500 animate-pulse inline-block ml-0.5"></span>}
                      </span>
                    </div>
                    
                    {currentTime >= 20 ? (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded font-bold uppercase shrink-0 animate-pulse">
                        ✓ SECURE INGESTION COMPLETE
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                        Scanning track
                      </span>
                    )}
                  </div>
                </div>

                {/* Simulated mouse cursor pathing */}
                <div className="absolute bottom-6 right-28 pointer-events-none transition-all duration-1000 transform animate-tourPointer z-20">
                  <MousePointer className="w-5 h-5 text-indigo-400 drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]" />
                </div>

                {/* Simulated action trigger */}
                <div className="flex justify-end pt-1">
                  <div className={`px-5 py-2.5 rounded-full text-xs font-bold transition duration-300 flex items-center gap-2 cursor-pointer ${
                    currentTime >= 20 
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-102 ring-2 ring-indigo-400/50' 
                      : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                  }`}>
                    <Cpu className={`w-3.5 h-3.5 ${currentTime >= 20 ? 'animate-spin' : ''} text-amber-300`} />
                    <span>👉 Build Interactive Learning Space</span>
                  </div>
                </div>
              </div>

              {/* Revelation Typography */}
              <div className="space-y-2 text-left max-w-lg mx-auto">
                <span className="text-teal-400 text-[10px] uppercase font-mono tracking-widest font-bold">Phase 2: The Ingestion Awakening</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight leading-tight">
                  What if content automatically adapted to your mind?
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed">
                  Stop simply witnessing hours of streaming noise. Meet SnapSum, the hyper-compiler that decomposes complex video timelines into bite-sized, interactive active retrieval structures.
                </p>
              </div>

            </div>
          )}

          {/* ===================== SCENE 3: AI PROCESSING COMPILE ENGINE (25s - 40s) ===================== */}
          {currentTime >= 25 && currentTime < 40 && (
            <div className="w-full max-w-xl space-y-6 animate-pulse">
              
              {/* Outer Scanning Ring Matrix Hologram */}
              <div className="relative flex items-center justify-center h-48">
                
                {/* Glowing Circle Matrix Elements */}
                <div className="absolute w-44 h-44 border-2 border-dashed border-indigo-500/30 rounded-full animate-spin" style={{ animationDuration: '12s' }}></div>
                <div className="absolute w-36 h-36 border border-teal-500/20 rounded-full animate-reverseSpin" style={{ animationDuration: '8s' }}></div>
                <div className="absolute w-28 h-28 border border-white/10 rounded-full"></div>
                
                {/* Floating Node points representing data mapping structure */}
                <div className="absolute top-4 left-10 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
                <div className="absolute bottom-6 right-8 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_10px_#2dd4bf]"></div>
                <div className="absolute top-1/2 left-2 w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>

                {/* Animated status indicators */}
                <div className="relative z-10 space-y-1 text-center">
                  <div className="flex justify-center"><Cpu className="w-9 h-9 text-indigo-400 animate-spin" /></div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-300 block uppercase pt-2">
                    COMPILE STATE CALIBRATING
                  </span>
                  <span className="text-xs font-bold text-white block">
                    {currentTime < 30 ? "Transcribed Audio Frequency Tracks..." : currentTime < 35 ? "Mapping Key Technical Mental Metaphors..." : "Generating Diagnostic Evaluation Quizzes..."}
                  </span>
                </div>
              </div>

              {/* Status processing checkboard lists */}
              <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl text-left space-y-3 max-w-md mx-auto shadow-xl">
                {[
                  { step: "Transcribe speech track audio into precise transcripts", done: true },
                  { step: "Outline structured, navigable timeline chapters", done: currentTime >= 30 },
                  { step: "Synthesize core concepts into relatable real-world analogies", done: currentTime >= 35 },
                  { step: "Formulate active retention evaluation quizzes", done: currentTime >= 38 }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-[10px] font-mono">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${s.done ? 'bg-indigo-500 text-neutral-950 font-bold' : 'bg-neutral-900 text-neutral-500 border border-neutral-800'}`}>
                      {s.done ? "✓" : i + 1}
                    </div>
                    <span className={s.done ? 'text-neutral-200 font-semibold text-[10.5px]' : 'text-neutral-500'}>{s.step}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ===================== SCENE 4: INTERACTIVE DASHBOARD TOUR (40s - 65s) ===================== */}
          {currentTime >= 40 && currentTime < 65 && (
            <div className="w-full max-w-3xl space-y-5 animate-fadeIn">
              
              {/* MAIN SITE VISUAL INTERACTIVE PREVIEW */}
              <div className="bg-white p-5 rounded-3xl border border-black/10 text-left text-neutral-950 relative shadow-2xl flex flex-col gap-4">
                
                {/* Simulated Web Header Tab controls */}
                <div className="flex flex-wrap items-center justify-between border-b border-neutral-100 pb-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <span className="text-xs font-mono font-bold text-neutral-700 ml-2">SnapSum Core Workspace</span>
                  </div>
                  
                  {/* Interactive selector inside tour */}
                  <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200/50">
                    {[
                      { key: 'chapters', label: '1. Nav chapters' },
                      { key: 'concepts', label: '2. Concept maps' },
                      { key: 'quizzes', label: '3. Interactive quiz' },
                      { key: 'dashboard', label: '4. Brain calendar' }
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        onClick={() => {
                          setActiveFeatureTab(btn.key as any);
                          playSynthBeep(400 + (btn.key === 'quizzes' ? 100 : 0), 'sine', 0.1);
                        }}
                        className={`text-[9.5px] font-bold font-sans px-2.5 py-1 rounded-lg transition duration-200 ${
                          activeFeatureTab === btn.key 
                            ? 'bg-neutral-950 text-white shadow-md' 
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SUB VIEWS BASED ON TAB FOR SITE VISUALS */}
                
                {/* FEATURE 1: DYNAMIC TIMELINE CHAPTERS */}
                {activeFeatureTab === 'chapters' && (
                  <div className="space-y-4 animate-fadeIn py-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-neutral-400 font-mono">Core Feature 1</h4>
                        <span className="text-sm font-extrabold text-neutral-900 tracking-tight block">Timeline Chapter-Seek Pointer</span>
                      </div>
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                        Timelines Decoupled
                      </span>
                    </div>

                    <div className="bg-[#f5f5f7] border border-black/[0.04] p-4 rounded-2xl relative space-y-3">
                      <div className="h-28 bg-neutral-900 rounded-xl relative overflow-hidden flex flex-col justify-end p-3">
                        <div className="absolute inset-0 bg-indigo-950/20 animate-pulse"></div>
                        <div className="relative z-10 flex justify-between text-white text-[9px] font-mono">
                          <span className="bg-indigo-500 rounded px-1.5 py-0.5 font-bold uppercase animate-pulse">Chapter 4: Event loops</span>
                          <span>Time Marker: {Math.floor(timelineSecs / 60)}:{(timelineSecs % 60).toString().padStart(2, '0')}</span>
                        </div>

                        {/* Timeline slider interactable simulation */}
                        <div className="w-full mt-2 relative py-2">
                          <input 
                            type="range" 
                            min="0" 
                            max="300" 
                            value={timelineSecs} 
                            onChange={(e) => {
                              setTimelineSecs(Number(e.target.value));
                              playSynthBeep(300 + Number(e.target.value), 'sine', 0.05, 0.04);
                            }}
                            className="w-full accent-indigo-600 h-1 rounded-lg cursor-pointer bg-neutral-700 hover:accent-teal-500" 
                          />
                        </div>
                      </div>

                      <div className={`grid gap-2.5 ${isVerticalMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                        {[
                          { min: 0, title: "0:00 Intro & Variables", active: timelineSecs < 100 },
                          { min: 100, title: "1:40 Advanced Closure Stack", active: timelineSecs >= 100 && timelineSecs < 220 },
                          { min: 220, title: "3:40 Async Event Loops", active: timelineSecs >= 220 }
                        ].map((ch) => (
                          <div 
                            key={ch.min}
                            onClick={() => {
                              setTimelineSecs(ch.min);
                              playSynthBeep(250 + ch.min, 'sine', 0.1);
                            }}
                            className={`p-2.5 rounded-xl border text-[10px] font-mono font-medium cursor-pointer transition ${
                              ch.active 
                                ? 'bg-indigo-600 text-white border-transparent' 
                                : 'bg-white border-neutral-150 hover:bg-neutral-50 text-neutral-600'
                            }`}
                          >
                            {ch.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* FEATURE 2: MENTAL CODE METAPHORS */}
                {activeFeatureTab === 'concepts' && (
                  <div className="space-y-4 animate-fadeIn py-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-neutral-400 font-mono">Core Feature 2</h4>
                        <span className="text-sm font-extrabold text-neutral-900 tracking-tight block">Cognitive Metaphor Synthesizer</span>
                      </div>
                      <span className="bg-teal-50 text-teal-700 border border-teal-150 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                        Complexity Translated
                      </span>
                    </div>

                    <div className="p-1 bg-[#f5f5f7] border border-black/[0.04] rounded-2xl">
                      <div className={`grid gap-3 p-2 ${isVerticalMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'}`}>
                        {/* Selector items list */}
                        <div className={`${isVerticalMode ? 'w-full' : 'md:col-span-4'} space-y-1.5`}>
                          {mockConcepts.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setConceptMetaphorIndex(index);
                                playSynthBeep(350 + index * 50, 'sine', 0.08);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl text-[10.5px] font-bold font-sans transition flex items-center justify-between ${
                                conceptMetaphorIndex === index
                                  ? 'bg-neutral-950 text-white'
                                  : 'bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-200/40'
                              }`}
                            >
                              <span>{item.title}</span>
                              <span className="text-[8px] opacity-80 px-1 py-0.5 rounded bg-white/10">{item.confidence}</span>
                            </button>
                          ))}
                        </div>

                        {/* Interactive mental model graphic presentation */}
                        <div className={`${isVerticalMode ? 'w-full' : 'md:col-span-8'} bg-white border border-neutral-200/60 p-4 rounded-xl flex flex-col justify-between relative shadow-sm`}>
                          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold">
                            <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                            <span>Metaphor Model</span>
                            <span className="text-[9px] font-mono bg-neutral-100 text-neutral-500 ml-auto px-1.5 py-0.5 rounded">
                              Difficulty: {mockConcepts[conceptMetaphorIndex].difficulty}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-neutral-600 font-sans leading-relaxed italic mt-2">
                            "{mockConcepts[conceptMetaphorIndex].metaphor}"
                          </p>
                          <div className="mt-3 text-[9px] font-mono text-neutral-400 border-t border-neutral-100 pt-2 flex justify-between items-center bg-transparent">
                            <span>Retina scan accuracy: High</span>
                            <span className="text-teal-600 font-bold">✓ Structured For Long-Term Memory</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FEATURE 3: ACTIVE EVALUATION RETENTION PLAYABLE QUIZ */}
                {activeFeatureTab === 'quizzes' && (
                  <div className="space-y-4 animate-fadeIn py-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-neutral-400 font-mono">Core Feature 3</h4>
                        <span className="text-sm font-extrabold text-neutral-900 tracking-tight block">Active Recall Evaluator</span>
                      </div>
                      <span className="bg-amber-50 text-amber-700 border border-amber-150 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold animate-pulse">
                        Interactive Test Engine
                      </span>
                    </div>

                    <div className="bg-[#f5f5f7] border border-black/[0.04] p-4 rounded-2xl text-left space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold font-mono uppercase text-indigo-500">Evaluating: Cognitive Retrieval Loop</span>
                        <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded text-neutral-600">Streak Score: {quizScore} XP</span>
                      </div>

                      <div className="bg-white border border-neutral-200/40 p-4 rounded-xl space-y-3">
                        <p className="text-xs sm:text-xs font-extrabold text-neutral-800">
                          Question: What biological mechanism in the human brain does active retrieval trigger?
                        </p>
                        
                        <div className="space-y-2">
                          {[
                            { id: 1, text: "Forces passive visual recognition patterns (Low Retention)", correct: false },
                            { id: 2, text: "Triggers myelination of neuropathways, strengthening synaptic connections (94% Retention)", correct: true },
                            { id: 3, text: "Simply copies literal content to short-term visual memory (15% Retention)", correct: false }
                          ].map((opt) => {
                            let selectClass = "bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-700";
                            if (selectedQuizAnswer === opt.id) {
                              selectClass = opt.correct 
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                                : 'bg-rose-50 border-rose-500 text-rose-800';
                            }
                            return (
                              <button
                                key={opt.id}
                                disabled={quizSubmitted}
                                onClick={() => {
                                  setSelectedQuizAnswer(opt.id);
                                  setQuizSubmitted(true);
                                  if (opt.correct) {
                                    setQuizScore(prev => prev + 100);
                                    playPositiveChime();
                                  } else {
                                    playNegativeChime();
                                  }
                                }}
                                className={`w-full text-left p-3.5 rounded-xl border text-[11px] font-medium transition duration-150 flex items-center justify-between ${selectClass}`}
                              >
                                <span>{opt.id}. {opt.text}</span>
                                {selectedQuizAnswer === opt.id && (
                                  opt.correct ? <span className="text-emerald-600 font-bold">✓ Excellent! [+100 XP]</span> : <span className="text-rose-600 font-bold">❌ Weak retrieval</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="pt-2 text-right">
                            <button 
                              onClick={() => {
                                setSelectedQuizAnswer(null);
                                setQuizSubmitted(false);
                                playSynthBeep(330, 'sine', 0.1);
                              }}
                              className="text-[9.5px] font-bold text-indigo-600 hover:underline border-none bg-none cursor-pointer"
                            >
                              Reset active simulation quiz questions
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* FEATURE 4: CALENDAR STUDY & BRAIN SCORE HEATMAP */}
                {activeFeatureTab === 'dashboard' && (
                  <div className="space-y-4 animate-fadeIn py-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-neutral-400 font-mono">Core Feature 4</h4>
                        <span className="text-sm font-extrabold text-neutral-900 tracking-tight block">Atomic Study Streak & Knowledge Tracker</span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                        Continuous Accretion
                      </span>
                    </div>

                    <div className={`grid gap-3 ${isVerticalMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                      {/* Left Block: Streak info & flame */}
                      <div className="bg-[#f5f5f7] border border-black/[0.04] p-4 rounded-2xl flex items-center gap-3">
                        <div className="relative h-12 w-12 flex items-center justify-center bg-amber-500/10 border border-amber-500/20 rounded-full">
                          <Flame className="w-6 h-6 text-amber-500 fill-amber-500/20 animate-pulse" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">Study Streak</span>
                          <span className="text-lg font-black text-neutral-800">12 Days Active</span>
                          <p className="text-[9px] text-neutral-500">Top 3% of accelerated learners this month.</p>
                        </div>
                      </div>

                      {/* Right Block: Brain score */}
                      <div className="bg-[#f5f5f7] border border-black/[0.04] p-4 rounded-2xl flex items-center gap-3">
                        <div className="relative h-12 w-12 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                          <Trophy className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">Retained Concept Nodes</span>
                          <span className="text-lg font-black text-neutral-800">148 Masters</span>
                          <p className="text-[9px] text-neutral-500">Accelerated recall coefficient: 94.6%.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Cognitive Outro label */}
              <div className="space-y-1.5 text-left max-w-lg mx-auto">
                <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>Phase 4: Complete Feature Synchronicity</span>
                </div>
                <p className="text-neutral-400 text-xs sm:text-sm font-light">
                  No distractions. Every concept mapped. Every video timeline chaptered. Every question solved, tracking your performance securely with real persistent data storage.
                </p>
              </div>

            </div>
          )}

          {/* ===================== SCENE 5: SPLIT CALIBRATION COMPARATIVE (65s - 80s) ===================== */}
          {currentTime >= 65 && currentTime < 80 && (
            <div className="w-full max-w-2xl space-y-6 animate-fadeIn">
              
              {/* Dynamic split range slider widget container */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl text-left space-y-4 relative overflow-hidden backdrop-blur-md shadow-2xl">
                
                <div className="flex items-center justify-between pb-1 border-b border-white/[0.05]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300">
                    Dual Friction-Scaffolding Split Screen
                  </span>
                  <span className="text-[9px] text-neutral-400 font-mono">Drag control bar below</span>
                </div>

                <div className="relative h-48 rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 shadow-xl">
                  {/* Left Side Panel: Passive Video Watching Chaos */}
                  <div className="absolute inset-y-0 left-0 bg-red-950/20 flex flex-col justify-between p-4" style={{ width: `${splitSliderPos}%` }}>
                    <div>
                      <span className="text-[9px] font-mono uppercase bg-red-500 text-white rounded px-1.5 py-0.5 font-bold tracking-wider">
                        Passive Watching
                      </span>
                      <h4 className="text-xs font-bold text-red-300 mt-2">Drowning in noise</h4>
                    </div>
                    
                    <div className="space-y-1.5 bg-red-950/40 p-2 rounded-lg border border-red-500/10 text-[9px] font-mono text-red-100 overflow-hidden">
                      <p>• Scrubbing back for context</p>
                      <p>• -85% Cognitive memory loss</p>
                      <p>• Instant fatigue at minute 15</p>
                    </div>
                  </div>

                  {/* Right Side Panel: Active SnapSum Studio Workspace */}
                  <div className="absolute inset-y-0 right-0 bg-indigo-950/30 flex flex-col justify-between p-4 text-right items-end" style={{ width: `${100 - splitSliderPos}%` }}>
                    <div>
                      <span className="text-[9px] font-mono uppercase bg-indigo-600 text-white rounded px-1.5 py-0.5 font-bold tracking-wider">
                        SnapSum Space
                      </span>
                      <h4 className="text-xs font-bold text-indigo-300 mt-2">Precision mastery</h4>
                    </div>

                    <div className="space-y-1.5 bg-indigo-950/40 p-2 rounded-lg border border-indigo-500/10 text-[9px] font-mono text-indigo-100 text-left overflow-hidden">
                      <p>✓ Fast click Chapter Jumping</p>
                      <p>✓ Mental Model analogous metaphors</p>
                      <p>✓ Interactive recollection quizzes</p>
                    </div>
                  </div>

                  {/* Vertically sliding line divider block representing interactive touch */}
                  <div className="absolute inset-y-0 w-1 bg-gradient-to-b from-indigo-500 via-teal-400 to-indigo-500 cursor-ew-resize flex items-center justify-center shadow-2xl" style={{ left: `${splitSliderPos}%` }}>
                    <div className="h-6 w-6 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center text-indigo-600 font-bold shadow text-[8px]">
                      ↔
                    </div>
                  </div>
                </div>

                {/* Range Slider for user interaction */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-neutral-300">
                    <span>Friction (Chaos)</span>
                    <span>Knowledge (Structure)</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="90" 
                    value={splitSliderPos} 
                    onChange={(e) => {
                      setSplitSliderPos(Number(e.target.value));
                      playSynthBeep(200 + Number(e.target.value) * 3, 'triangle', 0.05, 0.03);
                    }}
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-auto cursor-pointer accent-indigo-500 hover:accent-teal-400" 
                  />
                </div>

              </div>

              <div className="space-y-1 text-left max-w-lg mx-auto">
                <span className="text-[#bf5af2] text-[10px] uppercase font-mono tracking-widest font-bold">Phase 5: The Empirical Calibrator</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight leading-tight">
                  Drag the cursor to compare passive chaos vs active intelligence.
                </h3>
              </div>

            </div>
          )}

          {/* ===================== SCENE 6: COMPLETE MASTERY EMPOWERED LEARNER (80s - 95s / CTA) ===================== */}
          {currentTime >= 80 && currentTime <= 95 && (
            <div className="w-full max-w-xl space-y-6 animate-fadeIn">
              
              {/* Fully Empowered Learner Model - Crown of Knowledge */}
              <div className="bg-white/[0.02] border border-emerald-500/15 rounded-3xl p-6 text-left relative overflow-hidden backdrop-blur-md shadow-2xl">
                
                <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-3xl animate-pulse pointer-events-none"></div>
                           <div className={`grid gap-5 items-center ${isVerticalMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'}`}>
                  {/* Left: The Serene Empowered Human Graphic */}
                  <div className={`flex flex-col items-center justify-center text-center space-y-3 p-4 bg-emerald-950/10 border border-emerald-500/10 rounded-2xl relative ${isVerticalMode ? 'w-full' : 'col-span-1 md:col-span-5'}`}>
                    
                    {/* Glowing Brain Aura */}
                    <div className="relative h-20 w-20 flex items-center justify-center bg-emerald-950 rounded-full border-2 border-emerald-400 shadow-lg shadow-emerald-500/20 animate-pulse">
                      <div className="absolute inset-0 rounded-full border-4 border-solid border-emerald-500/10 animate-spin" style={{ animationDuration: '6s' }}></div>
                      <span className="text-4xl animate-bounce" style={{ animationDuration: '4s' }}>🧘‍♂️</span>
                      <div className="absolute -bottom-1 bg-emerald-500 text-neutral-950 rounded-full px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider leading-none shadow">
                        Flow-State
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-emerald-400 font-extrabold block uppercase tracking-wider">Focus Stability</span>
                      <span className="text-sm font-black text-white">99.4% Stability</span>
                      <span className="text-[8px] font-mono text-neutral-400 block block">Stress Level: 2.1%</span>
                    </div>
                  </div>

                  {/* Right: Mastered Concepts check cards list */}
                  <div className={`space-y-2 ${isVerticalMode ? 'w-full' : 'col-span-1 md:col-span-7'}`}>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 tracking-wider uppercase block">✓ Active Cognitive Milestones</span>
                    
                    {[
                      { node: "Dynamic Scope Closures", score: "+98% confidence" },
                      { node: "Interactive Memory Mapping", score: "+100 XP Level-up" },
                      { node: "Asynchronous Fiber Stacks", score: "+94% retention score" }
                    ].map((mile, i) => (
                      <div key={i} className="bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.06] flex items-center justify-between text-[10px] font-mono transition duration-300 hover:bg-emerald-950/20">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-neutral-200 font-semibold">{mile.node}</span>
                        </div>
                        <span className="text-emerald-400 font-bold bg-emerald-950 border border-emerald-800/40 px-1.5 py-0.5 rounded text-[8px] uppercase">
                          {mile.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* End of Tour Action and title */}
              <div className="space-y-4 text-center max-w-md mx-auto">
                <div className="inline-flex items-center gap-1.5 bg-emerald-900/30 border border-emerald-700/30 text-emerald-400 px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest leading-none">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Interactive Spec Tour Complete</span>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight leading-tight">
                    Own your attention.
                  </h3>
                  <p className="text-neutral-400 text-xs sm:text-xs font-light leading-relaxed">
                    Stop drowning in hours of video, hoping you remember something. Turn files, podcasts, and clips into your permanent repository of active intelligence.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      playSynthBeep(440, 'sine', 0.1);
                      onStartLearning();
                    }}
                    className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-xs py-3.5 px-6 rounded-full transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
                  >
                    <span>🚀 Launch SnapSum Active Workspace Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE CONTROLS TRAY */}
        {/* ========================================================================= */}
        <div className="relative z-10 pt-4 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          
          {/* Left Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className={`h-10 w-10 rounded-full flex items-center justify-center transition border ${
                isPlaying 
                  ? 'bg-neutral-850 border-white/10 hover:bg-neutral-800 text-white' 
                  : 'bg-emerald-500 border-transparent hover:bg-emerald-400 text-neutral-950 font-bold'
              } cursor-pointer`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleRewind}
              className="h-9 w-9 rounded-full bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-white/5 flex items-center justify-center transition cursor-pointer"
              title="Rewind spec tour"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleMuteToggle}
              className={`h-9 w-9 rounded-full border flex items-center justify-center transition cursor-pointer ${
                isMuted 
                  ? 'bg-[#ff453a]/10 border-[#ff453a]/25 text-[#ff453a]' 
                  : 'bg-neutral-850 border-white/5 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Timeline Jump Anchors Grid - lets user select specific scenes freely */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {CINEMATIC_SCENES.map((scene) => {
              const isActive = currentTime >= scene.start && currentTime < scene.end;
              return (
                <button
                  key={scene.id}
                  onClick={() => jumpToScene(scene.start)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-mono leading-none tracking-tight font-bold border transition shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white border-transparent shadow shadow-indigo-600/10 scale-102 font-extrabold'
                      : 'bg-neutral-900 border-white/5 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  } cursor-pointer`}
                >
                  {scene.id}. {scene.label.split(".")[1]}
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: THE COMPREHENSIVE ON-SCREEN TELEMETRY DISPATCH PANEL */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[350px] bg-[#fcfcfd] border-t lg:border-t-0 lg:border-l border-black/[0.05] p-5 sm:p-7 flex flex-col justify-between overflow-hidden">
        
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-700 font-mono block">
            🎬 Script & Interactive Spec Telemetry
          </span>

          {/* Quick tab controls */}
          <div className="flex bg-black/[0.04] p-0.5 rounded-lg border border-black/[0.02] flex-wrap gap-y-0.5">
            {(['simulation', 'script', 'structure', 'voiceover'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  playSynthBeep(260 + (tab === 'script' ? 10 : 20), 'sine', 0.1);
                }}
                className={`flex-1 py-1 text-[10px] font-medium rounded-md capitalize transition duration-150 min-w-[65px] ${
                  activeTab === tab
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {tab === 'voiceover' ? '🎙️ Voiceover' : tab}
              </button>
            ))}
          </div>

          {/* Content sections corresponding to tab */}
          {activeTab === 'simulation' && (
            <div className="space-y-3.5 animate-fadeIn">
              <p className="text-[11px] text-neutral-500 leading-normal font-light">
                This panel monitors the speech, visual tracking metrics, and dynamic interactive state of the active workspace.
              </p>

              {/* Dynamic Telemetry stats */}
              <div className="bg-white border border-black/5 p-4 rounded-xl space-y-3 shadow-xs">
                <div>
                  <span className="text-[8px] font-mono text-neutral-400 block uppercase font-bold">Active Module Target</span>
                  <p className="text-[11px] font-semibold text-neutral-800 mt-0.5">{currentScene.title}</p>
                </div>

                <div>
                  <span className="text-[8px] font-mono text-neutral-400 block uppercase font-bold">🧾 Required On-Screen Texts</span>
                  <div className="bg-neutral-50/60 p-2 rounded border border-black/[0.03] text-[9.5px] font-mono text-neutral-600 mt-1 whitespace-pre-line leading-relaxed">
                    {currentScene.onScreenText}
                  </div>
                </div>

                <div>
                  <span className="text-[8px] font-mono text-neutral-400 block uppercase font-bold">🎙️ Sync'd Narrator Voiceover copy</span>
                  <p className="text-[10.5px] italic text-neutral-600 mt-1 leading-normal font-sans">
                    "{currentScene.voiceover}"
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#0071e3]/5 border border-[#0071e3]/10 rounded-xl text-left space-y-1">
                <span className="text-[8px] font-mono font-bold text-[#0071e3] uppercase block">💡 Active Retrieval tip</span>
                <p className="text-[9.5px] text-[#0071e3] leading-relaxed">
                  Toggle on your **Speaker sound up**! Real synthesized chimes trigger dynamically as you match metaphors or pick quiz answers.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 animate-fadeIn text-[10px] text-neutral-500 leading-normal scrollbar-thin">
              <p className="text-[11px] font-medium text-neutral-800">Complete Narrator Voiceover Script</p>
              
              <div className="space-y-3 pt-1">
                {CINEMATIC_SCENES.map((scene) => {
                  const isCurrent = currentTime >= scene.start && currentTime < scene.end;
                  return (
                    <div 
                      key={scene.id} 
                      className={`p-2.5 rounded-xl border text-left transition ${
                        isCurrent 
                          ? 'border-indigo-100 bg-indigo-50/45 text-neutral-800 shadow-sm' 
                          : 'border-transparent text-neutral-500'
                      }`}
                    >
                      <span className="font-mono font-bold text-[8px] text-indigo-700 block uppercase bg-indigo-100/50 rounded-md px-1.5 py-0.5 inline-block">
                        {scene.label} ({scene.start}s - {scene.end}s)
                      </span>
                      <p className="mt-1.5 leading-relaxed italic">"{scene.voiceover}"</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-[11px] text-neutral-500 leading-normal font-light">
                Continuous active design schema for premium SaaS interactive demos.
              </p>

              <div className="space-y-3 pt-1 text-[10px] font-mono text-neutral-600">
                <div className="flex items-start gap-2.5 border-b border-black/[0.04] pb-2">
                  <span className="font-bold text-indigo-600 shrink-0">0-12s</span>
                  <div>
                    <strong className="text-neutral-800 block">1. Cognitive Overload</strong>
                    <span className="text-[9px]">Drowning passively under endless timelines, scrolling exhaustion, context loss.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-b border-black/[0.04] pb-2">
                  <span className="font-bold text-indigo-600 shrink-0">12-25s</span>
                  <div>
                    <strong className="text-neutral-800 block">2. Ingestion Wave</strong>
                    <span className="text-[9px]">Paste link module initiates compile framework. Zero setup, immediate parse target.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-b border-black/[0.04] pb-2">
                  <span className="font-bold text-indigo-600 shrink-0">25-40s</span>
                  <div>
                    <strong className="text-neutral-800 block">3. Multi-Tier Compiler</strong>
                    <span className="text-[9px]">Segmenting speech streams into custom Nav chapters, Analogous Metaphers, and Retrieval gameplay.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-b border-black/[0.04] pb-2">
                  <span className="font-bold text-indigo-600 shrink-0">40-65s</span>
                  <div>
                    <strong className="text-neutral-800 block">4. Live Workspace Tour</strong>
                    <span className="text-[9px]">Play interactive quiz questions, navigate timeline triggers, and check retention score streaks.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-b border-black/[0.04] pb-2">
                  <span className="font-bold text-indigo-600 shrink-0">65-80s</span>
                  <div>
                    <strong className="text-neutral-800 block">5. Empirical Split</strong>
                    <span className="text-[9px]">Slide range controls to contrast passive scrolling decay vs. structured active retrieval.</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-indigo-600 shrink-0">80-95s</span>
                  <div>
                    <strong className="text-neutral-800 block">6. Intellectual Mastery</strong>
                    <span className="text-[9px]">Outro summary, flow-state indicators, and conversion launch button to workspace.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voiceover' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-neutral-800">🎙️ Premium Voiceover Integration</p>
                <p className="text-[10px] text-neutral-500 leading-relaxed font-light">
                  Enhance your demo with studio-grade ElevenLabs human-quality narration instead of the browser's robotic TTS voice!
                </p>
              </div>

              {/* Upload Drop Zone / Audio Card */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-4 text-center transition duration-250 flex flex-col items-center justify-center relative ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-50/50' 
                    : isUsingCustomAudio 
                      ? 'border-emerald-500/40 bg-emerald-50/20' 
                      : 'border-black/10 hover:border-black/20 bg-white'
                }`}
              >
                <input
                  type="file"
                  id="voiceover-file-input"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isUsingCustomAudio ? (
                  <div className="space-y-3 w-full">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 font-bold text-xs">✓</div>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">Audio Voiceover Active</span>
                    </div>

                    <div className="p-2 bg-neutral-50 border border-black/5 rounded-xl text-left space-y-1">
                      <span className="text-[8px] font-mono text-neutral-400 block uppercase font-bold">Loaded File</span>
                      <p className="text-[10px] text-neutral-800 truncate font-mono font-medium">{customAudioName || 'voiceover.mp3'}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          playSynthBeep(330, 'sine', 0.1);
                          setIsUsingCustomAudio(!isUsingCustomAudio);
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-[9px] font-semibold border transition ${
                          isUsingCustomAudio
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700'
                        }`}
                      >
                        {isUsingCustomAudio ? '⏸ Disable' : '▶ Enable'}
                      </button>
                      
                      <label
                        htmlFor="voiceover-file-input"
                        className="py-1.5 px-3 rounded-lg text-[9px] font-semibold border border-black/15 bg-white text-neutral-700 hover:bg-neutral-50 transition cursor-pointer select-none"
                      >
                        Replace
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-1">
                    <div className="text-2xl">🎙️</div>
                    <div>
                      <p className="text-[10.5px] font-medium text-neutral-800">Drag & drop ElevenLabs audio</p>
                      <p className="text-[9px] text-neutral-400 mt-0.5">or click to browse local files</p>
                    </div>
                    <label
                      htmlFor="voiceover-file-input"
                      className="inline-block py-1.5 px-4 rounded-xl text-[9.5px] font-bold bg-neutral-950 text-white hover:bg-neutral-900 transition cursor-pointer shadow-sm select-none"
                    >
                      Browse Files
                    </label>
                  </div>
                )}
              </div>

              {/* Developer / Deployment Auto-load Tip */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-xl text-left space-y-1">
                <span className="text-[8px] font-mono font-bold text-indigo-700 uppercase block">💡 PRO TIP FOR PERSISTENCE</span>
                <p className="text-[9.5px] text-neutral-600 leading-relaxed font-sans">
                  To save and load your audio automatically for everyone: name your ElevenLabs download file <code className="bg-black/5 px-1 py-0.5 rounded text-[8.5px] font-mono">voiceover.mp3</code> or <code className="bg-black/5 px-1 py-0.5 rounded text-[8.5px] font-mono">voiceover.wav</code> and save it in the project's <code className="bg-black/5 px-1 py-0.5 rounded text-[8.5px] font-mono">public/</code> directory.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Action Button at the footer of sidebar */}
        <div className="pt-4 border-t border-black/[0.05] mt-4">
          <button
            onClick={() => {
              playSynthBeep(440, 'sine', 0.1);
              onStartLearning();
            }}
            className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-black/10"
          >
            <span>👉 Enter SnapSum Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

      </div>

      {/* OFF-SCREEN 1080x1920 EXPORTER CONTAINER */}
      <div 
        id="vertical-video-export-target" 
        className="absolute bg-neutral-950 flex flex-col justify-between py-16 px-12 text-center"
        style={{
          left: '-9999px',
          top: '-9999px',
          width: '1080px',
          height: '1920px',
          fontFamily: 'Inter, sans-serif',
          zIndex: -100
        }}
      >
        {/* Grid background for modern styling */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-neutral-950 to-transparent pointer-events-none"></div>

        {/* Header section in vertical export */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" className="w-14 h-14 rounded-2xl object-cover" referrerPolicy="no-referrer" alt="SnapSum Logo" />
            <div className="text-left">
              <span className="text-[20px] font-black tracking-widest text-[#bf5af2] uppercase block">SNAPSUM EXPLORER</span>
              <span className="text-[14px] text-neutral-400 font-mono">Dynamic Multi-Modal Courseware</span>
            </div>
          </div>
          <div className="bg-teal-500/15 border border-teal-500/20 rounded-xl px-4 py-1.5 text-right">
            <span className="text-[14px] font-mono font-bold text-teal-400 uppercase tracking-widest block">ACTIVE PREVIEW</span>
            <span className="text-[12px] font-mono text-neutral-400">Scene {currentScene.id} / 6</span>
          </div>
        </div>

        {/* Center Active Scene content section */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-12 px-6">
          <div className="w-full scale-[1.6] transform origin-center text-center">
            {currentTime >= 0 && currentTime < 12 && (
              <div className="space-y-6 text-white text-center">
                <div className="mx-auto h-24 w-24 bg-red-900/20 rounded-full border-2 border-red-500 flex items-center justify-center text-5xl">🤯</div>
                <div className="space-y-2">
                  <span className="text-red-400 text-xs font-mono uppercase tracking-widest">Cognitive Overload</span>
                  <h3 className="text-2xl font-black font-display text-white">Traditional video players drown you in noise</h3>
                  <p className="text-neutral-400 text-xs leading-relaxed max-w-sm mx-auto mt-2">80% of knowledge is lost within 24 hours of passive watching.</p>
                </div>
              </div>
            )}
            {currentTime >= 12 && currentTime < 25 && (
              <div className="space-y-6 text-white text-center">
                <div className="mx-auto h-24 w-24 bg-indigo-900/20 rounded-full border-2 border-indigo-500 flex items-center justify-center text-5xl">⚡</div>
                <div className="space-y-2">
                  <span className="text-indigo-400 text-xs font-mono uppercase tracking-widest">Active Ingestion</span>
                  <h3 className="text-2xl font-black font-display text-white">SnapSum transforms raw video to courseware</h3>
                  <p className="text-neutral-400 text-xs leading-relaxed max-w-sm mx-auto mt-2">Paste any URL to construct custom mental retrieval maps.</p>
                </div>
              </div>
            )}
            {currentTime >= 25 && currentTime < 40 && (
              <div className="space-y-6 text-white text-center">
                <div className="mx-auto h-24 w-24 bg-yellow-500/10 rounded-full border-2 border-yellow-400 flex items-center justify-center text-5xl">🤖</div>
                <div className="space-y-2">
                  <span className="text-yellow-400 text-xs font-mono uppercase tracking-widest">Compile Engine</span>
                  <h3 className="text-2xl font-black font-display text-white">Multimodal Semantic Scanning</h3>
                  <p className="text-neutral-400 text-xs leading-relaxed max-w-sm mx-auto mt-2">Chronological chapters, metaphor nodes, and diagnostic quizzes.</p>
                </div>
              </div>
            )}
            {currentTime >= 40 && currentTime < 65 && (
              <div className="space-y-6 text-white text-center">
                <div className="mx-auto h-24 w-24 bg-teal-500/10 rounded-full border-2 border-teal-400 flex items-center justify-center text-5xl">🎮</div>
                <div className="space-y-2">
                  <span className="text-teal-400 text-xs font-mono uppercase tracking-widest">Active Metaphor Node</span>
                  <h3 className="text-2xl font-black font-display text-white">{mockConcepts[conceptMetaphorIndex]?.title || "Mental Model Mapping"}</h3>
                  <p className="text-neutral-400 text-xs leading-relaxed max-w-sm mx-auto mt-2">
                    "{mockConcepts[conceptMetaphorIndex]?.metaphor || "Abstract concepts translated into concrete organic analogies."}"
                  </p>
                </div>
              </div>
            )}
            {currentTime >= 65 && currentTime < 80 && (
              <div className="space-y-6 text-white text-center">
                <div className="mx-auto h-24 w-24 bg-purple-500/10 rounded-full border-2 border-purple-400 flex items-center justify-center text-5xl">⚖️</div>
                <div className="space-y-2">
                  <span className="text-purple-400 text-xs font-mono uppercase tracking-widest">Active Workspace Features</span>
                  <h3 className="text-2xl font-black font-display text-white">
                    {activeFeatureTab === 'chapters' && "Interactive Chronological Chapters"}
                    {activeFeatureTab === 'concepts' && "Semantic Metaphor Association"}
                    {activeFeatureTab === 'quizzes' && "Spaced-Repetition Interactive Quizzes"}
                    {activeFeatureTab === 'dashboard' && "Atomic Study Streak & Knowledge Tracker"}
                  </h3>
                  <p className="text-neutral-400 text-xs leading-relaxed max-w-sm mx-auto mt-2">
                    {activeFeatureTab === 'chapters' && "Scrape and anchor timestamps instantly to let you navigate high-density courses dynamically."}
                    {activeFeatureTab === 'concepts' && "Translate mathematical abstractions and code paradigms into memorable physical analogies."}
                    {activeFeatureTab === 'quizzes' && "Validate retention ratios automatically through tailored diagnostics generated by Gemini."}
                    {activeFeatureTab === 'dashboard' && "Maintain compound learning rates and watch your retention stability metrics improve daily."}
                  </p>
                </div>
              </div>
            )}
            {currentTime >= 80 && currentTime <= 95 && (
              <div className="space-y-6 text-white text-center">
                <div className="mx-auto h-24 w-24 bg-emerald-500/10 rounded-full border-2 border-emerald-400 flex items-center justify-center text-5xl">🏆</div>
                <div className="space-y-2">
                  <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest">Intellectual Mastery</span>
                  <h3 className="text-2xl font-black font-display text-white">Learn everything. Retain forever.</h3>
                  <p className="text-neutral-400 text-xs leading-relaxed max-w-sm mx-auto mt-2">Turn raw media feeds into your private interactive tutor.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Large Professional Watermark branding in exported image */}
        <div className="relative z-10 flex items-center justify-between bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 py-6">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" alt="SnapSum Logo" />
            <div className="text-left">
              <span className="text-[22px] font-black text-white font-sans tracking-wide">Summarized by SnapSum</span>
              <span className="text-[16px] font-mono text-neutral-400 block">snapsum.app</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[14px] font-mono text-[#bf5af2] font-semibold tracking-wider uppercase block">🚀 Viral-Growth Spec</span>
            <span className="text-[12px] font-mono text-neutral-400">@SnapSumApp</span>
          </div>
        </div>
      </div>

      {/* EXPORT PROGRESS STATE MODAL */}
      {exportMessage && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fadeIn">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full filter blur-xl animate-pulse"></div>
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin flex items-center justify-center">
              <Video className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1 max-w-sm">
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 tracking-widest block">SNAPSUM SOCIAL EXPORTER</span>
            <p className="text-xs font-mono text-neutral-300">{exportMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
};
