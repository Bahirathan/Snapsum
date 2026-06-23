import React, { useState, useEffect, useRef } from 'react';
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
  Maximize2
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
}

const CINEMATIC_SCENES: CinematicScene[] = [
  {
    id: 1,
    label: "1. The Overload",
    start: 0,
    end: 12,
    title: "The Problem: Passive Drowning",
    onScreenText: "“You watch hours of content…”\n“But forget most of it.”\n“Everything is unstructured.”",
    voiceover: "You watch hours of videos… lectures, tutorials, podcasts. But most of it… you forget. You take notes. You pause. You rewind. But everything stays unstructured."
  },
  {
    id: 2,
    label: "2. The Revelation",
    start: 12,
    end: 25,
    title: "The Vision: Active Syncing",
    onScreenText: "“What if videos could teach you?”\n“SnapSum AI Learning System”",
    voiceover: "What if every video could teach you… instead of just play? Meet SnapSum. The AI learning system that transforms any video or audio into structured knowledge."
  },
  {
    id: 3,
    label: "3. Semantic Deep Scan",
    start: 25,
    end: 40,
    title: "The Engine: 3-Layer Compiling",
    onScreenText: "“Video → Structured Learning”\n“Chapters • Concepts • Quizzes”",
    voiceover: "Instant chapters with timeline navigation. Key concepts, simplified and clear. And interactive quizzes to test what you actually learned."
  },
  {
    id: 4,
    label: "4. The Dashboard Tour",
    start: 40,
    end: 65,
    title: "The Experience: High Clarity Walkthrough",
    onScreenText: "“Learn. Don’t just watch.”",
    voiceover: "So you don't just watch content… you master it. From passive watching… to active learning."
  },
  {
    id: 5,
    label: "5. Split Calibration",
    start: 65,
    end: 80,
    title: "The Shift: Chaos vs Structure",
    onScreenText: "“Master any content.”",
    voiceover: "Build a daily learning habit. Track your progress. Grow your knowledge."
  },
  {
    id: 6,
    label: "6. Master Any Skill",
    start: 80,
    end: 95,
    title: "The CTA: Instant Activation",
    onScreenText: "“Start Learning with SnapSum”\n“Turn any video into structured learning”",
    voiceover: "SnapSum. Turn any video into structured learning. Start learning today."
  }
];

interface CinematicExplainerProps {
  onStartLearning: () => void;
}

export const CinematicExplainer: React.FC<CinematicExplainerProps> = ({ onStartLearning }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0); // in seconds, from 0 to 95
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'simulation' | 'script' | 'structure'>('simulation');
  const [audioSupported, setAudioSupported] = useState<boolean>(true);
  
  // Custom interactive slider position for Scene 5 split-screen comparison
  const [splitSliderPos, setSplitSliderPos] = useState<number>(50); // percentage 0-100

  // Reference for requestAnimationFrame interval loop
  const intervalRef = useRef<any>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentSentenceRef = useRef<string>("");

  // Synthesize sound effects natively via Web Audio API 🎛️
  const playSynthBeep = (freq: number = 440, type: OscillatorType = 'sine', duration: number = 0.1) => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // quiet fallback
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
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  };

  // Find corresponding scene based on time
  const currentScene = CINEMATIC_SCENES.find(
    s => currentTime >= s.start && currentTime < s.end
  ) || CINEMATIC_SCENES[CINEMATIC_SCENES.length - 1];

  // React to time changes to trigger speech & chimes
  useEffect(() => {
    if (!isPlaying) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Trigger subtle chime on scene transitions
    const matchSceneStart = CINEMATIC_SCENES.find(s => Math.floor(currentTime) === s.start);
    if (matchSceneStart && currentTime - matchSceneStart.start < 0.2) {
      playSynthSweep();
    }

    // TTS Voiceover Sync with window.speechSynthesis
    if (window.speechSynthesis && !isMuted) {
      const sentence = currentScene.voiceover;
      if (currentSentenceRef.current !== sentence) {
        window.speechSynthesis.cancel();
        currentSentenceRef.current = sentence;
        
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        
        // Find deep premium sounding voice if available
        const voices = window.speechSynthesis.getVoices();
        const idealVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium')));
        if (idealVoice) {
          utterance.voice = idealVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      }
    } else {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      currentSentenceRef.current = "";
    }
  }, [currentScene, isMuted, isPlaying]);

  // Audio browser permission checks
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.speechSynthesis) {
      setAudioSupported(false);
    }
  }, []);

  // Frame timer simulation loop
  useEffect(() => {
    if (isPlaying) {
      const fps = 10; // update scale rate
      const tick = 1000 / (fps * playSpeed);
      
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 95) {
            setIsPlaying(false);
            return 95;
          }
          return Math.round((prev + 0.1) * 10) / 10;
        });
      }, tick);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playSpeed]);

  // Cleanup synthesis on components teardown
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handles control functions
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRewind = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    currentSentenceRef.current = "";
    setCurrentTime(0);
    setIsPlaying(true);
    playSynthBeep(220, 'sine', 0.2);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (!isMuted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const jumpToScene = (startSec: number) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    currentSentenceRef.current = "";
    setCurrentTime(startSec);
    setIsPlaying(true);
    playSynthBeep(330, 'sine', 0.15);
  };

  return (
    <div className="w-full bg-white border border-black/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden font-sans text-neutral-900 flex flex-col md:flex-row transition-all duration-300 max-w-7xl mx-auto scroll-mt-20 my-1">
      
      {/* LEFT COLUMN: THE PREMIUM CINEMATIC SIMULATION DISPLAY */}
      <div className="flex-1 bg-neutral-950 p-4 sm:p-8 flex flex-col relative min-h-[420px] md:min-h-[520px] overflow-hidden select-none transition-all duration-300">
        
        {/* Subtle grid background for space context */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-neutral-950 to-transparent pointer-events-none"></div>
        
        {/* Cinematic Header Overlay */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/[0.05] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#bf5af2] animate-ping"></span>
            <span className="text-[10px] font-bold font-mono tracking-widest text-[#bf5af2] uppercase">
              SnapSum Spec Theater
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-neutral-500 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.03]">
              {currentTime.toFixed(1)}s / 95.0s
            </span>
            <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-400 capitalize">
              {currentScene.label.slice(3)}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE STAGE CANVAS CONTAINERS */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col items-center justify-center relative py-6 text-center select-none">
          
          {/* SCENE 1: THE OVERLOAD (0s - 12s) */}
          {currentTime >= 0 && currentTime < 12 && (
            <div className="w-full max-w-2xl space-y-6 animate-fadeIn">
              
              {/* Overloaded UI Mockup */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-left relative overflow-hidden backdrop-blur-sm shadow-xl">
                
                {/* Red warning border pulsating */}
                <div className="absolute inset-0 border-2 border-red-500/20 rounded-2xl animate-pulse pointer-events-none"></div>
                
                <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.06]">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-600"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-600"></div>
                  <span className="text-[8px] font-mono text-neutral-500 ml-2">Traditional 3-Hour Tutorial Lecture.mp4</span>
                </div>

                <div className="grid grid-cols-12 gap-3 pt-3">
                  {/* Cluttered Timeline Scrubbing */}
                  <div className="col-span-8 space-y-2">
                    <div className="relative bg-neutral-900 rounded-lg h-24 overflow-hidden flex flex-col justify-between p-2">
                      <div className="absolute inset-0 bg-neutral-850 opacity-40"></div>
                      <div className="flex justify-between items-center relative z-10">
                        <span className="text-[8px] font-mono bg-red-600 text-white rounded px-1 animate-pulse">REWININDING CONSTANTLY</span>
                        <span className="text-[8px] font-mono text-neutral-400">Hour 2:14:52</span>
                      </div>
                      
                      {/* Chaotic Scrubbing Indicator Arrow Waves */}
                      <div className="flex justify-center items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-3 bg-red-500 rounded-sm"></span>
                        <span className="w-1.5 h-5 bg-red-400 rounded-sm"></span>
                        <span className="w-1.5 h-4 bg-red-600 rounded-sm"></span>
                        <span className="w-1.5 h-6 bg-red-500 rounded-sm"></span>
                        <span className="w-1.5 h-3 bg-red-300 rounded-sm"></span>
                      </div>

                      <div className="w-full bg-white/10 rounded-full h-1 relative z-10 overflow-hidden">
                        <div className="absolute top-0 left-0 bottom-0 bg-red-600 rounded-full animate-scrubPath" style={{ width: '64%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Endless Scattered Notes Pile */}
                  <div className="col-span-4 space-y-2 text-[8px] font-mono text-red-300">
                    <div className="p-2 border border-dashed border-red-500/30 rounded-lg bg-red-500/5 space-y-1">
                      <span className="text-[7px] text-red-500 font-bold block uppercase tracking-wider">⚠ Chaotic Notes</span>
                      <p className="line-clamp-2 text-neutral-400">"Minute 12: Wait where did he say that parameter goes??"</p>
                      <p className="line-clamp-2 text-neutral-400">"Minute 45: Completely lost track of variables."</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cognitive Overload Indicators */}
              <div className="space-y-2 text-left max-w-md mx-auto">
                <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>UNSTRUCTURED NOISE CALIBRATION INDICES</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display leading-none tracking-tight">
                  You watch hours of content... But forget most of it.
                </h3>
                <p className="text-neutral-400 text-xs font-light font-mono">
                  Take notes, pause, rewind — and still lose the semantic layout.
                </p>
              </div>

            </div>
          )}

          {/* SCENE 2: ENTER SNAPSUM AI (12s - 25s) */}
          {currentTime >= 12 && currentTime < 25 && (
            <div className="w-full max-w-2xl space-y-6 animate-slideUp">
              
              {/* Sleek Sparkle Transition Burst & Input Box */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-left space-y-4 relative overflow-hidden backdrop-blur-md shadow-2xl">
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-[#0071e3]/10 rounded-full blur-3xl"></div>

                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-[#0071e3] text-white rounded-md flex items-center justify-center shadow">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0071e3]">
                    SnapSum Cognitive Stream Ingestion
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <p className="text-[9px] font-mono text-neutral-400 uppercase">Input Multimedia Web-Path</p>
                  
                  {/* Dynamic typed URL URL simulation */}
                  <div className="bg-neutral-900 border border-white/15 px-3 py-2.5 rounded-xl flex items-center gap-2.5 justify-between relative">
                    <span className="text-neutral-300 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      {currentTime < 16 ? "https://" : currentTime < 20 ? "https://youtube.com/watch?v=A" : "https://youtube.com/watch?v=Active_Learning_Model_2026"}
                      {currentTime < 20 && <span className="w-1.5 h-3.5 bg-indigo-500 animate-pulse inline-block ml-0.5"></span>}
                    </span>
                    
                    {/* Simulated Processing Checkmark */}
                    {currentTime >= 20 ? (
                      <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-1.5 py-0.5 rounded font-bold uppercase shrink-0 animate-pulse">
                        ✓ SECURE MULTIMEDIA CAPTURED
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono text-amber-400 bg-amber-950 border border-amber-800/60 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                        Ingesting URL
                      </span>
                    )}
                  </div>
                </div>

                {/* Hand cursor pathing mockup simulation */}
                <div className="absolute bottom-5 right-24 pointer-events-none transition-all duration-1000 transform animate-tourPointer shrink-0 z-20">
                  <MousePointer className="w-5 h-5 text-indigo-400 drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]" />
                </div>

                {/* Massive trigger Button Simulation */}
                <div className="flex justify-end pt-1">
                  <div className={`px-5 py-2 rounded-full text-xs font-bold transition duration-300 flex items-center gap-1.5 shadow ${
                    currentTime >= 20 
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-teal-500/20 scale-102 ring-2 ring-indigo-500' 
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}>
                    <Cpu className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                    <span>👉 Construct Learning Space</span>
                  </div>
                </div>
              </div>

              {/* Revelation Typography */}
              <div className="space-y-2 text-left max-w-md mx-auto">
                <span className="text-[#bf5af2] text-[10px] uppercase font-mono tracking-widest font-bold">INTRODUCING THE COGNITIVE ERA</span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display leading-tight tracking-tight">
                  What if videos could teach you?
                </h3>
                <p className="text-neutral-400 text-xs font-light">
                  A high-end SaaS compiler that converts raw streaming video content into hyper-structured, navigable courseware.
                </p>
              </div>

            </div>
          )}

          {/* SCENE 3: AI PROCESSING COMPILE ENGINE (25s - 40s) */}
          {currentTime >= 25 && currentTime < 40 && (
            <div className="w-full max-w-xl space-y-6 animate-pulse">
              
              {/* Outer Scanning Ring Hologram */}
              <div className="relative flex items-center justify-center h-44">
                
                {/* Glowing Circle Elements */}
                <div className="absolute w-40 h-40 border border-[#0071e3]/30 rounded-full animate-spin duration-3000"></div>
                <div className="absolute w-36 h-36 border border-[#bf5af2]/20 rounded-full animate-reverseSpin duration-2000"></div>
                <div className="absolute w-28 h-28 border border-white/10 rounded-full"></div>
                
                {/* Floating Node points representing data mapping structure */}
                <div className="absolute top-4 left-10 w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
                <div className="absolute bottom-6 right-8 w-2 h-2 rounded-full bg-teal-400 shadow-lg shadow-teal-400/50"></div>
                <div className="absolute top-1/2 left-2 w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>

                {/* Animated status indicators */}
                <div className="relative z-10 space-y-1 text-center">
                  <div className="flex justify-center"><Cpu className="w-8 h-8 text-indigo-400 animate-spin" /></div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-300 block uppercase pt-2">
                    COMPILE LAYER CALIBRATING
                  </span>
                  <span className="text-xs font-bold text-white block">
                    {currentTime < 30 ? "Transcribing Audio Tracks..." : currentTime < 35 ? "Mapping Key Metaphors..." : "Drafting Active Retention Quiz..."}
                  </span>
                </div>
              </div>

              {/* Status processing checkboard lists */}
              <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl text-left space-y-2.5 max-w-md mx-auto">
                {[
                  { step: "Transcribing raw high-speed speech track audio frequencies", done: true },
                  { step: "Synthesizing visual chronological chapters outline", done: currentTime >= 30 },
                  { step: "Extracting core concepts and plain-English metaphors", done: currentTime >= 35 },
                  { step: "Issuing diagnostic evaluation recall quizzes", done: currentTime >= 38 }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-[10px] font-mono">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${s.done ? 'bg-emerald-500 text-neutral-950 font-bold' : 'bg-neutral-900 text-neutral-500 border border-neutral-800'}`}>
                      {s.done ? "✓" : i + 1}
                    </div>
                    <span className={s.done ? 'text-neutral-300' : 'text-neutral-600'}>{s.step}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* SCENE 4: INTERACTIVE DASHBOARD TOUR (40s - 65s) */}
          {currentTime >= 40 && currentTime < 65 && (
            <div className="w-full max-w-3xl space-y-5 animate-fadeIn">
              
              {/* Dashboard visual mockup */}
              <div className="bg-white p-5 rounded-2xl border border-black/10 text-left text-neutral-900 relative shadow-2xl flex flex-col sm:flex-row gap-5">
                
                {/* Simulated Mouse Pointer cursor */}
                <div className="absolute z-35 pointer-events-none transition-all duration-300 shadow-xl shrink-0"
                  style={{
                    top: currentTime < 48 ? '110px' : currentTime < 55 ? '50px' : '150px',
                    left: currentTime < 48 ? '80px' : currentTime < 55 ? '220px' : '260px',
                  }}
                >
                  <div className="text-[#0071e3]">
                    <MousePointer className="w-5 h-5 fill-current animate-pulse shrink-0" />
                    <span className="bg-neutral-900/90 text-white font-mono text-[7px] px-1 py-0.5 rounded leading-none absolute left-3.5 top-3.5 z-25 uppercase tracking-wider block font-bold truncate max-w-24">
                      {currentTime < 48 ? "Hover Chapters" : currentTime < 55 ? "Analyze Concepts" : "Solve Quiz"}
                    </span>
                  </div>
                </div>

                {/* Left side: Timeline Outline Chapters mock */}
                <div className="w-full sm:w-1/2 space-y-3 shrink-0">
                  <span className="text-[8px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">Lecture Timeline Chronology</span>
                  
                  <div className="space-y-2">
                    {[
                      { stamp: "00:00", title: "Overview of Cognitive Deficits", active: currentTime < 48 },
                      { stamp: "04:15", title: "The Solution Architecture of Deliberate Practice", active: currentTime >= 48 && currentTime < 54 },
                      { stamp: "12:50", title: "Diagnostic Metaphors and Analogies", active: currentTime >= 54 }
                    ].map((chap, i) => (
                      <div 
                        key={i} 
                        className={`p-2.5 rounded-xl border transition-all duration-300 text-left ${
                          chap.active 
                            ? 'bg-indigo-50/70 border-indigo-200 shadow-sm scale-102 font-bold text-indigo-950' 
                            : 'bg-neutral-50/50 border-neutral-150 text-neutral-500'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] font-semibold">
                          <span className={`font-mono ${chap.active ? 'text-indigo-600' : 'text-neutral-450'}`}>{chap.stamp}</span>
                          {chap.active && <span className="text-[7px] font-mono text-indigo-500 px-1 py-0.2 bg-white rounded uppercase shadow-xs">ACTIVE PLAYHEAD</span>}
                        </div>
                        <p className="text-[10px] mt-1 leading-normal truncate">{chap.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Key concept cards & Adaptive active Quiz mock */}
                <div className="w-full sm:w-1/2 space-y-4">
                  
                  {/* High Quality Concept Panel */}
                  <div className="p-3 bg-neutral-50 rounded-xl border border-black/[0.04] text-left">
                    <span className="text-[7px] uppercase font-mono font-bold text-emerald-600 tracking-wider">🔬 Extracted Core Metaphor</span>
                    <h5 className="text-[11px] font-bold text-neutral-900 mt-0.5">The Feedback Circuit Concept</h5>
                    <p className="text-[10px] text-neutral-500 leading-normal mt-1 font-light">
                      "Understanding occurs not by passive audio absorption, but when internal semantic models fail and actively correct themselves."
                    </p>
                  </div>

                  {/* Adaptive Quiz Block Simulation */}
                  <div className="p-4.5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-100 rounded-2xl text-left space-y-3">
                    <div className="flex items-center justify-between text-[8px] font-bold font-mono">
                      <span className="text-indigo-700">🎯 ACTIVE CALIBRATION CHECK</span>
                      <span className="text-purple-600 uppercase">Score: +100 XP Eligible</span>
                    </div>

                    <p className="text-[10px] font-medium text-neutral-800 leading-normal">
                      Which mechanism actively triggers long-term storage?
                    </p>

                    <div className="space-y-1.5 pt-1.5 text-[9px]">
                      <div className="p-1.5 bg-white border border-neutral-200 text-neutral-500 rounded-lg">
                        A. Rewinding and listening at 1.5x speed
                      </div>
                      <div className={`p-1.5 border rounded-lg transition-all duration-300 font-semibold ${
                        currentTime >= 55 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold scale-102' 
                          : 'bg-white border-neutral-200 text-neutral-500'
                      }`}>
                        B. Semantic error correction & active recall tests
                        {currentTime >= 55 && (
                          <span className="float-right text-emerald-600 font-extrabold uppercase text-[7px] bg-emerald-100/80 px-1 rounded">
                            CORRECT! ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Subtitles Overlay */}
              <div className="text-left max-w-md mx-auto space-y-1.5">
                <span className="text-emerald-400 text-[10px] font-mono tracking-widest block uppercase font-bold">100% INTERACTIVE RECALL ENGINES</span>
                <p className="text-white text-xs leading-normal">
                  "Click timeline chapters to seek. Solve interactive diagnostic questions. Synthesize knowledge effortlessly."
                </p>
              </div>

            </div>
          )}

          {/* SCENE 5: CHAOS VS STRUCTURE CALIBRATION SPLIT RUN (65s - 80s) */}
          {currentTime >= 65 && currentTime < 80 && (
            <div className="w-full max-w-3xl space-y-6 animate-fadeIn">
              
              {/* Dynamic Adjustable Vertical Splitting Screen */}
              <div className="relative bg-neutral-900 rounded-3xl h-64 overflow-hidden border border-white/[0.06] shadow-2xl text-left">
                
                {/* LEFT CHAOS PANEL */}
                <div className="absolute inset-0 bg-neutral-950 pr-4" style={{ width: `${splitSliderPos}%` }}>
                  <div className="absolute inset-0 bg-[radial-gradient(#b91c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
                  
                  <div className="p-5 space-y-4">
                    <span className="text-[9px] font-mono font-bold text-red-500 bg-red-950/40 px-2 py-0.5 rounded uppercase tracking-wider block w-fit">
                      🛑 Passive YouTube Watching (CHAOTIC & UNSTRUCTURED)
                    </span>
                    
                    <div className="space-y-2 text-neutral-450 text-[10px] font-light max-w-xs">
                      <p className="line-through text-neutral-600">No navigation chapters.</p>
                      <p className="line-through text-neutral-600">Forgetting concepts within 15 minutes.</p>
                      <p className="line-through text-neutral-600">Tedious scrolling timeline backwards and forward.</p>
                      <p className="line-through text-neutral-600">Zero active diagnostic quizzes to solidify memory.</p>
                    </div>

                    {/* Red noise diagram */}
                    <div className="h-10 bg-red-600/10 border border-red-800/30 rounded-lg flex items-center justify-between px-3 animate-pulse">
                      <span className="text-[8px] font-mono text-red-400">COGNITIVE NOISE LEVEL HIGH</span>
                      <span className="text-[12px] font-mono font-bold text-red-500">92% LOSS</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT TRIPLE-LAYER STRUCTURED PANEL */}
                <div className="absolute inset-y-0 right-0 bg-neutral-900 pl-4 border-l border-white/10" style={{ left: `${splitSliderPos}%` }}>
                  <div className="absolute inset-0 bg-[radial-gradient(#0071e3_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
                  
                  <div className="p-5 space-y-4">
                    <span className="text-[9px] font-mono font-bold text-[#0071e3] bg-[#0071e3]/10 px-2 py-0.5 rounded uppercase tracking-wider block w-fit">
                      ⚡ SnapSum Active Learning Structure (COMPACT & PRISTINE)
                    </span>

                    <div className="space-y-2 text-neutral-300 text-[10px] sm:text-[11px] font-light">
                      <p className="flex items-center gap-1.5 font-sans"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Instant semantic outline chapters with timeline seeks.</p>
                      <p className="flex items-center gap-1.5 font-sans"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Key concepts mapped down to simplified executive summaries.</p>
                      <p className="flex items-center gap-1.5 font-sans"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Interactive diagnostication quiz games generating active retention.</p>
                    </div>

                    {/* Emerald Success Meter */}
                    <div className="h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between px-3">
                      <span className="text-[8px] font-mono text-emerald-400">ACADEMIC RETENTION OPTIMIZATION</span>
                      <span className="text-[12px] font-mono font-bold text-emerald-400 font-black">9.5x RETENTION</span>
                    </div>
                  </div>
                </div>

                {/* Split handle drag-line */}
                <div 
                  className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-25 flex items-center justify-center group"
                  style={{ left: `${splitSliderPos}%` }}
                >
                  <div className="h-12 w-6 bg-white border border-neutral-300 rounded-full flex flex-col justify-center items-center shadow-lg transform -translate-x-1/2 select-none">
                    <Maximize2 className="w-3 h-3 text-neutral-700 font-bold rotate-45 select-none" />
                  </div>
                </div>

                {/* Drag interactive slider selector */}
                <input 
                  type="range" 
                  min="15" 
                  max="85" 
                  value={splitSliderPos} 
                  onChange={(e) => setSplitSliderPos(parseInt(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
                />
              </div>

              {/* Slider user instructions instruction */}
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1 font-semibold">
                <span>◀ Slide Left for unstructured watch chaos</span>
                <span className="text-indigo-400 animate-pulse">DRAG THE SLIDER CRADLE TO TEST REAL DEEP CONTRAST</span>
                <span>Slide Right for structured knowledge ▶</span>
              </div>

            </div>
          )}

          {/* SCENE 6: CTA OUTRO LANDING PAGE SIGNUP (80s - 95s) */}
          {currentTime >= 80 && (
            <div className="w-full max-w-xl space-y-6 text-center animate-fadeIn py-4">
              
              {/* Spinning Logo Icon Emblem */}
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-gradient-to-tr from-[#0071e3] via-[#bf5af2] to-violet-600 rounded-3xl flex items-center justify-center text-white shadow-2xl relative group hover:scale-105 duration-300">
                  <div className="absolute inset-0 rounded-3xl bg-white/20 animate-pulse"></div>
                  <Video className="w-8 h-8 text-white relative z-10" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
                  SnapSum
                </h2>
                <p className="text-indigo-300 text-sm sm:text-base font-mono tracking-wide">
                  Turn any video into structured learning.
                </p>
                <p className="text-neutral-400 font-light text-xs max-w-sm mx-auto leading-normal font-sans pt-1">
                  Master lectures, tutorials, and podcasts in minutes instead of hours. Build retention, track progress.
                </p>
              </div>

              {/* Giant Clickable Trigger Button */}
              <div className="flex justify-center pt-2.5">
                <button
                  onClick={() => {
                    playSynthBeep(520, 'triangle', 0.25);
                    onStartLearning();
                  }}
                  className="bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-sm px-8 py-4.5 rounded-full shadow-lg shadow-white/5 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>👉 Start Free Learning Now</span>
                  <ArrowRight className="w-4 h-4 text-neutral-900 duration-200 group-hover:translate-x-1" />
                </button>
              </div>

              {/* Status footer list */}
              <div className="flex items-center justify-center gap-5 text-[10px] font-mono text-neutral-500 pt-3">
                <span className="flex items-center gap-1">✓ No credit card required</span>
                <span className="flex items-center gap-1">✓ Unlimited local caching</span>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* CINEMATIC TIMELINE CONTROLLER FOOTER STRIP */}
        {/* ========================================================================= */}
        <div className="relative z-10 pt-4 border-t border-white/[0.05] flex flex-col gap-3 shrink-0">
          
          {/* Subtle Scrubber Bar container */}
          <div className="relative w-full h-1.5 bg-white/10 rounded-full group cursor-pointer">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#0071e3] to-[#bf5af2] rounded-full relative"
              style={{ width: `${(currentTime / 95) * 100}%` }}
            >
              {/* Moving scrubber handle glow marker */}
              <span className="absolute -right-1.5 -top-1 w-3.5 h-3.5 bg-white rounded-full border-2 border-indigo-600 shadow opacity-0 group-hover:opacity-100 transition-opacity duration-150"></span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="95" 
              step="0.5"
              value={currentTime}
              onChange={(e) => jumpToScene(parseFloat(e.target.value))}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
            />
          </div>

          {/* Time markers showing chapters layout */}
          <div className="grid grid-cols-6 gap-0.5 text-[8px] font-mono text-neutral-500 font-bold select-none text-left">
            {CINEMATIC_SCENES.map((scene) => {
              const isCurrent = currentTime >= scene.start && currentTime < scene.end;
              return (
                <button
                  key={scene.id}
                  onClick={() => jumpToScene(scene.start)}
                  className={`truncate pb-1 border-b-2 hover:text-white text-left pl-1 transition-all ${
                    isCurrent 
                      ? 'border-[#0071e3] text-white font-black' 
                      : 'border-white/5 text-neutral-500'
                  }`}
                >
                  {scene.label}
                </button>
              );
            })}
          </div>

          {/* Media Interactive Buttons Pane */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="bg-white text-neutral-950 hover:bg-neutral-200 h-9 w-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current text-neutral-950" /> : <Play className="w-4 h-4 fill-current ml-0.5 text-neutral-950" />}
              </button>
              
              <button
                onClick={handleRewind}
                className="text-neutral-400 hover:text-white h-9 w-9 rounded-full flex items-center justify-center transition cursor-pointer bg-white/5 border border-white/5"
                title="Restart Ad Simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleMuteToggle}
                className={`h-9 px-3 rounded-full flex items-center gap-1.5 transition text-xs font-mono font-bold cursor-pointer border ${
                  isMuted 
                    ? 'border-red-500/30 bg-red-500/10 text-red-400' 
                    : 'border-white/5 bg-white/5 text-neutral-300 hover:text-white'
                }`}
                title={audioSupported ? "Toggle Narrator Audio" : "Text to Speech not supported"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden xs:inline">{isMuted ? "Voice: Off" : "Voice: On"}</span>
              </button>
            </div>

            {/* Subtitles caption bar */}
            <div className="flex-1 max-w-md bg-white/[0.04] border border-white/[0.05] rounded-xl px-3 py-1.5 text-[10px] text-neutral-400 font-light flex items-start gap-2 text-left">
              <span className="text-[8px] font-mono bg-indigo-500/20 text-indigo-300 font-bold px-1 rounded uppercase tracking-wider mt-0.5 whitespace-nowrap shrink-0">Narrator:</span>
              <p className="italic leading-normal line-clamp-2">"{currentScene.voiceover}"</p>
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: CORRESPONDING ON-SCREEN TEXT PANEL */}
      <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-black/[0.05] p-5 sm:p-6 bg-neutral-50/50 flex flex-col justify-between shrink-0 text-left">
        
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-700 font-mono block">
            🎬 Script & On-Screen Copy
          </span>

          {/* Quick tab controls */}
          <div className="flex bg-black/[0.04] p-0.5 rounded-lg border border-black/[0.02]">
            {(['simulation', 'script', 'structure'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1 text-[10px] font-medium rounded-md capitalize transition duration-150 ${
                  activeTab === tab
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content sections corresponding to tab */}
          {activeTab === 'simulation' && (
            <div className="space-y-3.5 animate-fadeIn">
              <p className="text-[11px] text-neutral-500 leading-normal font-light">
                This interactive panel tracks the visual and speech telemetries executing in the cinematic stage.
              </p>

              {/* Dynamic Telemetry stats */}
              <div className="bg-white border border-black/5 p-4 rounded-xl space-y-3 shadow-xs">
                <div>
                  <span className="text-[8px] font-mono text-neutral-400 block uppercase font-bold">ACTIVE SCENE FOCUS</span>
                  <p className="text-[11px] font-semibold text-neutral-800 mt-0.5">{currentScene.title}</p>
                </div>

                <div>
                  <span className="text-[8px] font-mono text-neutral-400 block uppercase font-bold">🧾 REQUIRED ON-SCREEN TEXT</span>
                  <div className="bg-neutral-50/60 p-2 rounded border border-black/[0.03] text-[9px] font-mono text-neutral-600 mt-1 whitespace-pre-line leading-relaxed">
                    {currentScene.onScreenText}
                  </div>
                </div>

                <div>
                  <span className="text-[8px] font-mono text-neutral-400 block uppercase font-bold">🎙️ SYNCED VOICEOVER COPY</span>
                  <p className="text-[10px] italic text-neutral-600 mt-1 leading-normal font-sans">
                    "{currentScene.voiceover}"
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#0071e3]/5 border border-[#0071e3]/10 rounded-xl text-left space-y-1">
                <span className="text-[8px] font-mono font-bold text-[#0071e3] uppercase block">💡 High Retention Tip</span>
                <p className="text-[9.5px] text-[#0071e3] leading-relaxed">
                  Turn your **Speaker Volume Up**! Natively generated Web chimes play in real-time as the cursor interacts.
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
                      className={`p-2 rounded-lg border text-left transition ${
                        isCurrent 
                          ? 'border-indigo-100 bg-indigo-50/45 text-neutral-800' 
                          : 'border-transparent text-neutral-500'
                      }`}
                    >
                      <span className="font-mono font-bold text-[8px] text-indigo-700 block uppercase">
                        {scene.label} ({scene.start}s - {scene.end}s)
                      </span>
                      <p className="mt-1 leading-relaxed italic">"{scene.voiceover}"</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-[11px] text-neutral-500 leading-normal font-light">
                Structured pacing guidelines aligned with modern SaaS explainer practices.
              </p>

              <div className="space-y-3 pt-1 text-[10px] font-mono text-neutral-600">
                <div className="flex items-start gap-2 border-b border-black/[0.04] pb-2">
                  <span className="font-bold text-indigo-600 shrink-0">0-10s</span>
                  <div>
                    <strong className="text-neutral-800 block">The Core Agony</strong>
                    <span className="text-[9px]">Drowning in long tutorials, endless scrolling, instant recall failures.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 border-b border-black/[0.04] pb-2">
                  <span className="font-bold text-indigo-600 shrink-0">10-20s</span>
                  <div>
                    <strong className="text-neutral-800 block">Enter SnapSum AI</strong>
                    <span className="text-[9px]">Transitioning to an elite workspace, URL mapping, start processing triggers.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 border-b border-black/[0.04] pb-2">
                  <span className="font-bold text-indigo-600 shrink-0">20-50s</span>
                  <div>
                    <strong className="text-neutral-800 block">The Value Engine</strong>
                    <span className="text-[9px]">Extracting outline, mapping conceptual links, and active evaluation quiz gameplay.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 border-b border-black/[0.04] pb-2">
                  <span className="font-bold text-indigo-600 shrink-0">50-70s</span>
                  <div>
                    <strong className="text-neutral-800 block">The Clear Split Contrast</strong>
                    <span className="text-[9px]">Direct comparative testing: Traditional video passive decay vs Active Recall logic.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 shrink-0">70-95s</span>
                  <div>
                    <strong className="text-neutral-800 block">Outro CTA</strong>
                    <span className="text-[9px]">Sleek logo presentation and call-to-action to enter workspace.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Button at the footer of sidebar */}
        <div className="pt-4 border-t border-black/[0.05]">
          <button
            onClick={() => {
              playSynthBeep(440, 'sine', 0.1);
              onStartLearning();
            }}
            className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs py-3 px-4 rounded-full transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[#0071e3]/10"
          >
            <span>👈 Skip to Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
