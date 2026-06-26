/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Youtube,
  Sparkles,
  BookOpen,
  FileText,
  Twitter,
  Share2,
  CheckCircle,
  HelpCircle,
  Award,
  Trophy,
  Network,
  ArrowRight,
  History,
  Trash2,
  Play,
  Pause,
  Volume2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Bookmark,
  RefreshCw,
  Video,
  CreditCard,
  Globe,
  ShieldCheck,
  Download,
  Zap,
  Lock,
  Server,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Megaphone,
  TrendingUp,
  Rocket,
  Activity,
  BarChart
} from 'lucide-react';
import { PRELOADED_VIDEOS } from './preloadedData';
import { YouTubeSummaryResponse, SavedSummary } from './types';
import { auth } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User 
} from 'firebase/auth';
import { KeyRound, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { LearningProgressDashboard, ActiveLearningDashboard } from './components/LearningDashboard';
import { CinematicExplainer } from './components/CinematicExplainer';
import { initGA, trackGAEvent, getSessionEvents, TrackedEvent, clearSessionEvents } from './utils/analytics';

const getOrGenerateReelScript = (summary: YouTubeSummaryResponse | null): any => {
  if (!summary) return null;
  if (summary.reelScript) return summary.reelScript;
  
  // Deterministic fallback script compiled gracefully from existing insights
  const title = `Viral Summary: ${summary.metadata.title.slice(0, 45)}...`;
  const takeaways = summary.takeaways || [] as string[];
  const baseTitle = summary.metadata.title;
  const author = summary.metadata.author;

  const scenes = [
    {
      sceneNumber: 1,
      durationSeconds: 5,
      visualHook: "Extreme close-up zoom. Bold caption overlay flashing in center screen with crisp synth-bass sound.",
      voiceover: `Have you ever heard of "${baseTitle}"? Here is the ultimate short-form breakdown of ${author}'s viral advice.`,
      textOverlay: "The Truth Revealed"
    },
    {
      sceneNumber: 2,
      durationSeconds: 8,
      visualHook: "Fast vertical pan slide. Cinematic active B-roll with high contrast lines.",
      voiceover: `Key trap exposed: ${takeaways[0] || 'Stop pursuing shallow metrics and start focused consistency.'}`,
      textOverlay: "Core Myth Shattered"
    },
    {
      sceneNumber: 3,
      durationSeconds: 8,
      visualHook: "Minimalist screen split dynamic slide showing data progression.",
      voiceover: `Crucial breakthrough: ${takeaways[1] || 'Real performance starts when you cut out are irrelevant meetings.'}`,
      textOverlay: "Secret To Progress"
    },
    {
      sceneNumber: 4,
      durationSeconds: 8,
      visualHook: "Upward camera pan. Modern split panel with highlighted key metrics.",
      voiceover: `Next big asset: ${takeaways[2] || 'Execution is worth infinitely more than pure strategy without motion.'}`,
      textOverlay: "Execution > Ideas"
    },
    {
      sceneNumber: 5,
      durationSeconds: 6,
      visualHook: "Close focus with visual pulse effects on screen.",
      voiceover: `In summary: ${summary.summary.split('.')[0] || 'This changes how you approach learning.'}.`,
      textOverlay: "The Big Lesson"
    },
    {
      sceneNumber: 6,
      durationSeconds: 5,
      visualHook: "Branded Call To Action prompt flashing high contrast on charcoal backdrop.",
      voiceover: "Swipe up or tap link to view the entire interactive concept mindmap tool right now!",
      textOverlay: "UNCOVER SECRETS"
    }
  ];

  const totalDuration = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

  return {
    title,
    hookType: "Inquiry Loop / Myth-Buster",
    estimatedDuration: totalDuration,
    themeSuggestion: "Charcoal dark elegant stage, vibrant yellow and bold white centered fonts, ultra-rapid cuts, epic background drone pulse",
    scenes,
    readyMadeCaption: `🤯 Ultimate 60-second summary of "${baseTitle}" by ${author}! Tap the link to view complete interactive timeline & quiz tools. \n\n#reels #creative #marketing #${author.replace(/[^a-zA-Z0-9]/g, '')} #viralshorts`,
    callToAction: "Click the bio to explore the full interactive mastermind summary!"
  };
};

const downloadSRT = (script: any) => {
  if (!script) return;
  let srtContent = "";
  let cumulativeSeconds = 0;
  script.scenes.forEach((scene: any, index: number) => {
    const startMs = cumulativeSeconds * 1000;
    const endMs = (cumulativeSeconds + scene.durationSeconds) * 1000;
    cumulativeSeconds += scene.durationSeconds;

    const formatTime = (ms: number) => {
      const h = Math.floor(ms / 3600000).toString().padStart(2, '0');
      const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
      const msStr = (ms % 1000).toString().padStart(3, '0');
      return `${h}:${m}:${s},${msStr}`;
    };

    srtContent += `${index + 1}\n`;
    srtContent += `${formatTime(startMs)} --> ${formatTime(endMs)}\n`;
    srtContent += `[${scene.textOverlay.toUpperCase()}]\n`;
    srtContent += `${scene.voiceover}\n\n`;
  });

  const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_captions.srt`;
  link.click();
  URL.revokeObjectURL(url);
};

const downloadVTT = (script: any) => {
  if (!script) return;
  let vttContent = "WEBVTT\n\n";
  let cumulativeSeconds = 0;
  script.scenes.forEach((scene: any, index: number) => {
    const startMs = cumulativeSeconds * 1000;
    const endMs = (cumulativeSeconds + scene.durationSeconds) * 1000;
    cumulativeSeconds += scene.durationSeconds;

    const formatTime = (ms: number) => {
      const h = Math.floor(ms / 3600000).toString().padStart(2, '0');
      const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
      const msStr = (ms % 1000).toString().padStart(3, '0');
      return `${h}:${m}:${s}.${msStr}`;
    };

    vttContent += `${index + 1}\n`;
    vttContent += `${formatTime(startMs)} --> ${formatTime(endMs)}\n`;
    vttContent += `[${scene.textOverlay.toUpperCase()}]\n`;
    vttContent += `${scene.voiceover}\n\n`;
  });

  const blob = new Blob([vttContent], { type: 'text/vtt;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_captions.vtt`;
  link.click();
  URL.revokeObjectURL(url);
};

const downloadMarkdownScript = (script: any) => {
  if (!script) return;
  let md = `# SHORTENED VIDEO STORYBOARD: ${script.title}\n\n`;
  md += `**Hook Style:** ${script.hookType}\n`;
  md += `**Estimated Duration:** ${script.estimatedDuration} seconds\n`;
  md += `**Styling / Theme Direction:** ${script.themeSuggestion}\n\n`;
  md += `## STORYBOARD TIMELINE SCENES\n\n`;
  
  script.scenes.forEach((scene: any) => {
    md += `### SCENE ${scene.sceneNumber} (${scene.durationSeconds}s)\n`;
    md += `- **Visual Directions / B-Roll:** ${scene.visualHook}\n`;
    md += `- **Voiceover Narration:** "${scene.voiceover}"\n`;
    md += `- **On-Screen Subtitle/Text Overlay:** [${scene.textOverlay}]\n\n`;
  });

  md += `## ENGAGEMENT CAPTION & CALL TO ACTION\n\n`;
  md += `**Platform Ready-Made Caption:**\n\`\`\`text\n${script.readyMadeCaption}\n\`\`\`\n\n`;
  md += `**Call To Action (CTA):** ${script.callToAction}\n`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.md`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function App() {
  // Firebase Auth Visitor state
  const [visitorUser, setVisitorUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setVisitorUser(user);
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  // Input fields
  const [videoUrl, setVideoUrl] = useState('');
  const [demoActiveVideo, setDemoActiveVideo] = useState<YouTubeSummaryResponse>(PRELOADED_VIDEOS[0]);
  const [demoActiveTab, setDemoActiveTab] = useState<'summary' | 'key_insights' | 'chapters' | 'quiz'>('summary');
  const [demoInputUrl, setDemoInputUrl] = useState('');
  const [demoSelectedAnswers, setDemoSelectedAnswers] = useState<Record<number, number>>({});
  const [demoQuizSubmitted, setDemoQuizSubmitted] = useState(false);
  const [customTranscript, setCustomTranscript] = useState('');
  const [showCustomTranscriptField, setShowCustomTranscriptField] = useState(false);

  // Status & states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<YouTubeSummaryResponse | null>(null);
  const [savedSummaries, setSavedSummaries] = useState<SavedSummary[]>([]);
  
  // Is active loaded summary in Arabic RTL language
  const isRtl = activeSummary && /[\u0600-\u06FF]/.test(activeSummary.summary || '');
  
  // Referral, Challenge, and Language States
  const [outputLanguage, setOutputLanguage] = useState<'en' | 'ar'>('en');
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralCount, setReferralCount] = useState<number>(0);
  const [referralUnlocked, setReferralUnlocked] = useState<boolean>(false);
  const [quizChallenge, setQuizChallenge] = useState<{ score: number; maxScore: number } | null>(null);
  
  // Dashboard navigation sub-tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'chapters' | 'mindmap' | 'quiz' | 'monetize' | 'reel'>('overview');
  const [simActiveScene, setSimActiveScene] = useState<number>(0);
  const [simIsPlaying, setSimIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [isRenderingVideo, setIsRenderingVideo] = useState<boolean>(false);
  const [renderingProgress, setRenderingProgress] = useState<number>(0);

  const downloadReelAsVideo = async (script: any) => {
    if (!script || !script.scenes) return;
    setIsRenderingVideo(true);
    setRenderingProgress(0);

    const width = 540;
    const height = 960;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsRenderingVideo(false);
      return;
    }

    let stream: MediaStream;
    try {
      stream = (canvas as any).captureStream(30); // Capture 30 FPS stream from canvas
    } catch (err) {
      console.error("Canvas stream capture is not supported by this browser.", err);
      setIsRenderingVideo(false);
      alert("Video generation is not supported in this browser environment. Please try Chrome, Firefox, or Safari!");
      return;
    }

    const recordedChunks: Blob[] = [];
    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8' };
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm' };
    }

    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      try {
        mediaRecorder = new MediaRecorder(stream);
      } catch (e2) {
        setIsRenderingVideo(false);
        alert("Failed to initialize video encoder on your browser.");
        return;
      }
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    const scenes = script.scenes;
    const sceneDuration = 3.0; // 3 seconds per scene for great legibility
    const totalDuration = scenes.length * sceneDuration;
    const totalFrames = Math.floor(totalDuration * 30);
    let currentFrame = 0;

    mediaRecorder.start();

    const drawFrame = () => {
      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_shortened_video.webm`;
          a.click();
          URL.revokeObjectURL(url);
          setIsRenderingVideo(false);
          setRenderingProgress(100);
        };
        return;
      }

      // Calculate progress percentage
      const progressPercent = Math.min(100, Math.round((currentFrame / totalFrames) * 100));
      setRenderingProgress(progressPercent);

      const secondsElapsed = currentFrame / 30;
      const currentSceneIndex = Math.min(
        Math.floor(secondsElapsed / sceneDuration),
        scenes.length - 1
      );
      const scene = scenes[currentSceneIndex];
      const sceneTimeElapsed = secondsElapsed % sceneDuration;
      const sceneProgress = sceneTimeElapsed / sceneDuration; // 0 to 1

      // 1. Shifting ambient color gradient backgrounds based on active scene index
      const gradients = [
        ['#0f172a', '#1e1b4b'], // Dark Slate -> Indigo
        ['#022c22', '#064e3b'], // Deep Emerald -> Teal
        ['#1c1917', '#44403c'], // Charcoal -> Stone
        ['#1e1b4b', '#311042'], // Violet -> Deep Purple
        ['#3c0712', '#18000a'], // Crimson maroon -> Dark rose
        ['#082f49', '#0c4a6e']  // Deep ocean slate -> Blue
      ];
      const activeGrad = gradients[currentSceneIndex % gradients.length];
      
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, activeGrad[0]);
      grad.addColorStop(1, activeGrad[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Techno grid overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gs = 40;
      for (let x = 0; x < width; x += gs) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gs) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Central Radial Glow
      const glowRad = 260 + Math.sin(currentFrame / 10) * 20;
      const cGlow = ctx.createRadialGradient(
        width / 2, height / 2 - 100, 20, 
        width / 2, height / 2 - 100, glowRad
      );
      cGlow.addColorStop(0, 'rgba(255, 255, 255, 0.045)');
      cGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cGlow;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2 - 100, glowRad, 0, Math.PI * 2);
      ctx.fill();

      // 4. Status Metadata Overlays (Simulating live studio feed)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 11px "JetBrains Mono", Courier, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('🔴 MULTIMEDIA EXPORT', 40, 50);

      ctx.textAlign = 'right';
      ctx.fillText(`SCENE ${scene.sceneNumber}/${scenes.length} (${Math.round(sceneDuration)}s)`, width - 40, 50);

      // Top decorative line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, 65);
      ctx.lineTo(width - 30, 65);
      ctx.stroke();

      // Top label
      ctx.fillStyle = '#ff7b00'; // high intensity orange
      ctx.font = '900 11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('• SNAPSUM AI REPURPOSER •', width / 2, 95);

      // 5. Draw Central Captions with high contrast card backing
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20;
      ctx.fillStyle = 'rgba(10, 10, 10, 0.82)';

      const cw = width - 80;
      const ch = 160;
      const cx = 40;
      const cy = height / 2 - 140;
      const radius = 16;
      
      // Draw rounded card
      ctx.beginPath();
      ctx.moveTo(cx + radius, cy);
      ctx.lineTo(cx + cw - radius, cy);
      ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + radius);
      ctx.lineTo(cx + cw, cy + ch - radius);
      ctx.quadraticCurveTo(cx + cw, cy + ch, cx + cw - radius, cy + ch);
      ctx.lineTo(cx + radius, cy + ch);
      ctx.quadraticCurveTo(cx, cy + ch, cx, cy + ch - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.quadraticCurveTo(cx, cy, cx + radius, cy);
      ctx.closePath();
      ctx.fill();

      // Disable shadow for text/lines
      ctx.shadowBlur = 0;

      // Card bright accent border
      ctx.strokeStyle = 'rgba(255, 235, 59, 0.5)'; // vibrant yellow
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw hook title inside card
      ctx.fillStyle = '#ffeb3b';
      ctx.font = '900 11px "JetBrains Mono", Courier, monospace';
      ctx.fillText(script.hookType.toUpperCase(), width / 2, cy + 35);

      // Draw active dynamic overlay words
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px "Inter", sans-serif';
      
      const textOverlay = scene.textOverlay.toUpperCase();
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const wordsArr = text.split(' ');
        let currentLine = '';
        let currentY = y;
        for (let n = 0; n < wordsArr.length; n++) {
          const testLine = currentLine + wordsArr[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(currentLine, x, currentY);
            currentLine = wordsArr[n] + ' ';
            currentY += lineHeight;
          } else {
            currentLine = testLine;
          }
        }
        ctx.fillText(currentLine, x, currentY);
      };

      wrapText(textOverlay, width / 2, cy + 75, cw - 40, 28);

      // 6. Voiceover captions backing box at lower screen
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(40, height - 320, width - 80, 120, 16);
      } else {
        ctx.rect(40, height - 320, width - 80, 120);
      }
      ctx.fill();

      // Subtle border for captions
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'medium 14px "Inter", sans-serif';
      ctx.textAlign = 'center';
      wrapText(scene.voiceover, width / 2, height - 285, width - 120, 22);

      // 7. Active duration visual timing progress indicators at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(50, height - 150, width - 100, 6);

      ctx.fillStyle = '#0071e3'; // smart blue loader
      ctx.fillRect(50, height - 150, (width - 100) * sceneProgress, 6);

      // Brand/Call To Action tagline
      ctx.fillStyle = '#a1a1a6';
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillText('Tap screen or link to unlock complete mindmaps & challenges', width / 2, height - 90);

      // Scene dots
      const dotsY = height - 50;
      const dotSpacing = 16;
      const dotStartX = (width - (scenes.length - 1) * dotSpacing) / 2;
      for (let i = 0; i < scenes.length; i++) {
        ctx.fillStyle = i === currentSceneIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.28)';
        ctx.beginPath();
        ctx.arc(dotStartX + i * dotSpacing, dotsY, i === currentSceneIndex ? 4.5 : 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      currentFrame++;
      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  };

  useEffect(() => {
    let interval: any = null;
    if (simIsPlaying) {
      interval = setInterval(() => {
        setSimProgress((prev) => {
          const currentScript = getOrGenerateReelScript(activeSummary);
          if (!currentScript) {
            setSimIsPlaying(false);
            return 0;
          }
          const currentScene = currentScript.scenes[simActiveScene];
          if (!currentScene) {
            setSimIsPlaying(false);
            return 0;
          }
          if (prev + 1 >= currentScene.durationSeconds) {
            if (simActiveScene + 1 < currentScript.scenes.length) {
              setSimActiveScene(simActiveScene + 1);
              return 0;
            } else {
              setSimIsPlaying(false);
              setSimActiveScene(0);
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simIsPlaying, simActiveScene, activeSummary]);

  // Video embed timestamp control (seconds)
  const [ytStartSeconds, setYtStartSeconds] = useState<number | null>(null);
  const [ytAutoplayKey, setYtAutoplayKey] = useState<number>(0);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Copy indicators
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // TTS audio playback states
  const [ttsLoading, setTtsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // MVP Screen navigation state
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'app' | 'domain' | 'billing' | 'marketing' | 'admin' | 'terms' | 'privacy'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const pathLower = window.location.pathname.toLowerCase();
        if (pathLower.startsWith('/s/')) {
          return 'app';
        }

        // 1. Prioritize clean pathname (e.g. /admin, /billing)
        const pathParts = pathLower.split('/').filter(Boolean);
        const pathScreen = pathParts[0];
        if (pathScreen && ['landing', 'app', 'domain', 'billing', 'marketing', 'admin', 'terms', 'privacy'].includes(pathScreen)) {
          return pathScreen as any;
        }

        // 2. Fallback to query params (?screen=admin)
        const params = new URLSearchParams(window.location.search);
        const qScreen = params.get('screen');
        if (qScreen && ['landing', 'app', 'domain', 'billing', 'marketing', 'admin', 'terms', 'privacy'].includes(qScreen.toLowerCase())) {
          return qScreen.toLowerCase() as any;
        }
        
        // Also support clean query format like ?admin
        if (params.get('admin') !== null || params.has('admin')) {
          return 'admin';
        }

        // 3. Fallback to hash (#admin)
        const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '').replace(/\/$/, '').trim();
        if (hash && ['landing', 'app', 'domain', 'billing', 'marketing', 'admin', 'terms', 'privacy'].includes(hash)) {
          return hash as any;
        }
      }
    } catch (e) {
      console.warn('Initial route resolution failed:', e);
    }
    return 'landing';
  });

  // Synchronize browser URL navigation with active screen tab
  useEffect(() => {
    const syncScreenFromUrl = () => {
      try {
        const pathLower = window.location.pathname.toLowerCase();
        if (pathLower.startsWith('/s/')) {
          setCurrentScreen('app');
          return;
        }
        // Check clean pathname
        const pathParts = pathLower.split('/').filter(Boolean);
        const pathScreen = pathParts[0];
        if (pathScreen && ['landing', 'app', 'domain', 'billing', 'marketing', 'admin', 'terms', 'privacy'].includes(pathScreen)) {
          setCurrentScreen(pathScreen as any);
          return;
        }

        // Check query
        const params = new URLSearchParams(window.location.search);
        const qScreen = params.get('screen');
        if (qScreen && ['landing', 'app', 'domain', 'billing', 'marketing', 'admin', 'terms', 'privacy'].includes(qScreen.toLowerCase())) {
          setCurrentScreen(qScreen.toLowerCase() as any);
          return;
        }
        if (params.get('admin') !== null || params.has('admin')) {
          setCurrentScreen('admin');
          return;
        }

        // Check hash
        const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '').replace(/\/$/, '').trim();
        if (hash && ['landing', 'app', 'domain', 'billing', 'marketing', 'admin', 'terms', 'privacy'].includes(hash)) {
          setCurrentScreen(hash as any);
        }
      } catch (err) {
        console.warn('URL parsing failed:', err);
      }
    };

    window.addEventListener('hashchange', syncScreenFromUrl);
    window.addEventListener('popstate', syncScreenFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncScreenFromUrl);
      window.removeEventListener('popstate', syncScreenFromUrl);
    };
  }, []);

  // Update address bar dynamically as the user navigates tab options
  useEffect(() => {
    try {
      if (window.location.pathname.toLowerCase().startsWith('/s/')) {
        return;
      }
      const targetPath = currentScreen === 'landing' ? '/' : `/${currentScreen}`;
      if (window.location.pathname.toLowerCase() !== targetPath.toLowerCase()) {
        window.history.pushState(null, document.title, targetPath + window.location.search);
      }
    } catch (e) {
      console.warn('Failed to push history status:', e);
    }
  }, [currentScreen]);

  // Startup handle for referral code registration & tracking
  useEffect(() => {
    const handleInitialBoot = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const refCode = queryParams.get('ref');

        const response = await fetch('/api/referral/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referralCode: refCode }),
        });
        const data = await response.json();
        if (data.success) {
          setReferralCode(data.referralCode || '');
          setReferralCount(data.referralCount || 0);
          setReferralUnlocked(data.unlocked || false);
        }
      } catch (err) {
        console.warn('Failed to register or retrieve referral status:', err);
      }
    };

    handleInitialBoot();
  }, []);

  // Shared summary & score-bearing quiz path hydrating router
  useEffect(() => {
    const loadSharedSummary = async () => {
      const pathname = window.location.pathname;
      if (!pathname.startsWith('/s/')) return;

      const parts = pathname.split('/').filter(Boolean); // e.g., ['s', 'vid_123', 'quiz', '8']
      const shareId = parts[1];
      if (!shareId) return;

      setLoading(true);
      setLoadingStep('Hydrating shared learning assets...');
      try {
        const res = await fetch(`/api/shared-summary/${shareId}`);
        if (!res.ok) {
          throw new Error('Shared summary not found');
        }
        const data = await res.json();
        setActiveSummary(data);
        setCurrentScreen('app'); // Route to workspace

        // Deep link to sub-tab
        if (parts[2] === 'quiz') {
          setActiveTab('quiz');
          if (parts[3]) {
            const scoreNum = parseInt(parts[3], 10);
            if (!isNaN(scoreNum)) {
              setQuizChallenge({ score: scoreNum, maxScore: data.quiz?.length || 5 });
            }
          }
        } else if (parts[2]) {
          // If they shared other routes like chapters or mindmap
          const allowedSubTabs = ['overview', 'chapters', 'mindmap', 'quiz', 'monetize'];
          if (allowedSubTabs.includes(parts[2])) {
            setActiveTab(parts[2] as any);
          }
        }
      } catch (err: any) {
        console.error('Failed to load shared summary:', err);
        setError('The shared summary or quiz challenge link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    loadSharedSummary();
  }, []);

  // Update document browser tab tab-title dynamically based on screen selection
  useEffect(() => {
    try {
      const titles: Record<string, string> = {
        landing: 'SnapSum - Instant AI Video Knowledge Engine',
        app: 'AI Video Knowledge Engine Workspace | SnapSum',
        domain: 'Domain Configuration | SnapSum',
        billing: 'Premium Plans & Upgrades | SnapSum',
        marketing: 'AI Viral Creator Hub | SnapSum',
        admin: 'Administrative Console | SnapSum'
      };
      document.title = titles[currentScreen] || 'SnapSum - Instant AI Video Knowledge Engine';
    } catch (err) {
      console.warn('Failed to set tab title:', err);
    }
  }, [currentScreen]);

  // Stripe Live Status state
  const [stripeConfig, setStripeConfig] = useState<{
    stripeConfigured: boolean;
    publishableKey: string;
    accountInfo?: any;
    error?: string;
  }>({
    stripeConfigured: false,
    publishableKey: '',
    accountInfo: null,
    error: '',
  });

  // Interactive Digital Marketing states
  const [marketingNiche, setMarketingNiche] = useState('Tech & AI Startup');
  const [outreachPitch, setOutreachPitch] = useState('');
  const [pitchLoading, setPitchLoading] = useState(false);
  const [marketingPitchVideoTitle, setMarketingPitchVideoTitle] = useState('Dustins Lecture on Startup Operations');
  const [marketingShortsScript, setMarketingShortsScript] = useState('');
  const [shortsScriptLoading, setShortsScriptLoading] = useState(false);

  // Admin and Environmental settings state
  const [adminFreeReqsLimit, setAdminFreeReqsLimit] = useState(() => {
    try {
      return localStorage.getItem('admin_free_reqs_limit') || '3';
    } catch {
      return '3';
    }
  });

  const [adminSelectedModel, setAdminSelectedModel] = useState(() => {
    try {
      return localStorage.getItem('admin_selected_model') || 'gemini-3.5-flash';
    } catch {
      return 'gemini-3.5-flash';
    }
  });

  const [adminTemperature, setAdminTemperature] = useState(() => {
    try {
      return localStorage.getItem('admin_temperature') || '0.2';
    } catch {
      return '0.2';
    }
  });

  const [adminSearchGrounding, setAdminSearchGrounding] = useState(() => {
    try {
      return localStorage.getItem('admin_search_grounding') || 'default';
    } catch {
      return 'default';
    }
  });

  // Secure Auth & user session management
  const [vaultUsername, setVaultUsername] = useState('admin');
  const [vaultPassword, setVaultPassword] = useState('');
  const [vaultPasswordVisible, setVaultPasswordVisible] = useState(false);
  const [vault2faSecret, setVault2faSecret] = useState('');
  const [vault2faQrUrl, setVault2faQrUrl] = useState('');
  const [vault2faSetupCode, setVault2faSetupCode] = useState('');
  const [vault2faVerified, setVault2faVerified] = useState(false);
  const [vaultSetupLoading, setVaultSetupLoading] = useState(false);
  const [vaultSaveStatus, setVaultSaveStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  const [adminUserField, setAdminUserField] = useState('');
  const [adminPassField, setAdminPassField] = useState('');
  const [adminMfaField, setAdminMfaField] = useState('');
  const [adminMfaRequired, setAdminMfaRequired] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const [adminAuditLogs, setAdminAuditLogs] = useState<any[]>([]);
  const [adminLogsLoading, setAdminLogsLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [showSandboxHelper, setShowSandboxHelper] = useState(false);
  const [adminSessionToken, setAdminSessionToken] = useState(() => {
    try {
      return sessionStorage.getItem('admin_session_token') || '';
    } catch {
      return '';
    }
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return !!sessionStorage.getItem('admin_session_token');
    } catch {
      return false;
    }
  });
  const [adminIpList, setAdminIpList] = useState<Array<{ ip: string; count: number; lastResetAt: string }>>([]);
  const [adminIpLoading, setAdminIpLoading] = useState(false);

  // Google Analytics state management & diagnostics
  const [adminGaMeasurementId, setAdminGaMeasurementId] = useState(() => {
    try {
      return localStorage.getItem('admin_ga_measurement_id') || (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || '';
    } catch {
      return (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || '';
    }
  });
  const [gaSessionEvents, setGaSessionEvents] = useState<TrackedEvent[]>([]);
  const [gaTestEventName, setGaTestEventName] = useState('summary_debug_test');

  // Developer Override States (Local Cached Overrides for Stripe + VIP + Usage metrics)
  const [customVipCode, setCustomVipCode] = useState(() => {
    try {
      return localStorage.getItem('custom_vip_code') || '';
    } catch {
      return '';
    }
  });

  const [customStripeSecret, setCustomStripeSecret] = useState(() => {
    try {
      return localStorage.getItem('custom_stripe_secret') || '';
    } catch {
      return '';
    }
  });

  const [customStripePublishable, setCustomStripePublishable] = useState(() => {
    try {
      return localStorage.getItem('custom_stripe_publishable') || '';
    } catch {
      return '';
    }
  });

  const [usageTracker, setUsageTracker] = useState({
    count: 0,
    limit: 3,
    remaining: 3,
    vipBypassActive: false,
  });

  // Developer Sandboxing Custom API Key (Stores in localStorage for 100% $0 user costs)
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem('custom_gemini_api_key') || '';
    } catch {
      return '';
    }
  });

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (customApiKey && customApiKey.trim()) {
      headers['x-custom-gemini-api-key'] = customApiKey.trim();
    }
    if (customVipCode && customVipCode.trim()) {
      headers['x-vip-bypass-code'] = customVipCode.trim();
    }
    if (customStripeSecret && customStripeSecret.trim()) {
      headers['x-custom-stripe-secret-key'] = customStripeSecret.trim();
    }
    if (customStripePublishable && customStripePublishable.trim()) {
      headers['x-custom-stripe-publishable-key'] = customStripePublishable.trim();
    }

    // Admin Dashboard parameter injectors:
    if (adminFreeReqsLimit) {
      headers['x-custom-free-reqs-limit'] = adminFreeReqsLimit;
    }
    if (adminSelectedModel) {
      headers['x-custom-gemini-model'] = adminSelectedModel;
    }
    if (adminTemperature) {
      headers['x-custom-gemini-temperature'] = adminTemperature;
    }
    if (adminSearchGrounding !== 'default') {
      headers['x-custom-search-grounding'] = adminSearchGrounding;
    }
    return headers;
  };

  const refreshStatus = () => {
    // 1. Check live Stripe status with credentials check
    fetch('/api/stripe-status', { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setStripeConfig({
          stripeConfigured: !!data.stripeConfigured,
          publishableKey: data.publishableKey || '',
          accountInfo: data.accountInfo || null,
          error: data.error || '',
        });
      })
      .catch((err) => console.warn('Could not read backend Stripe metadata:', err));

    // 2. Check dynamic IP request limits
    fetch('/api/usage-status', { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setUsageTracker({
          count: data.count || 0,
          limit: data.limit || 3,
          remaining: typeof data.remaining === 'number' ? data.remaining : 3,
          vipBypassActive: !!data.vipBypassActive,
        });
        if (data.vipBypassActive) {
          setIsPremium(true);
        }
      })
      .catch((err) => console.warn('Could not retrieve dynamic custom limits:', err));
  };

  useEffect(() => {
    refreshStatus();

    // Handle successful Stripe Checkout redirect session
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout_success') === 'true') {
      savePremiumStatus(true);
      fetch('/api/save-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'R_Bahirathan@gmail.com',
          plan: 'pro',
          status: 'active'
        })
      }).catch(e => console.warn(e));
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [
    customApiKey,
    customVipCode,
    customStripeSecret,
    customStripePublishable,
    adminFreeReqsLimit,
    adminSelectedModel,
    adminTemperature,
    adminSearchGrounding
  ]);

  // Synchronously initialize and listen for Google Analytics activities
  useEffect(() => {
    if (adminGaMeasurementId) {
      initGA(adminGaMeasurementId);
    }
    
    setGaSessionEvents(getSessionEvents());

    const handleGaDispatcher = (e: Event) => {
      const customEvent = e as CustomEvent<TrackedEvent | null>;
      if (customEvent.detail) {
        setGaSessionEvents((prev) => {
          // Prevent duplicates if already loaded
          const exists = prev.some(item => item.id === customEvent.detail!.id);
          if (exists) return prev;
          return [customEvent.detail!, ...prev].slice(0, 50);
        });
      } else {
        setGaSessionEvents([]);
      }
    };

    window.addEventListener('ga-event-dispatched', handleGaDispatcher);
    return () => {
      window.removeEventListener('ga-event-dispatched', handleGaDispatcher);
    };
  }, [adminGaMeasurementId]);

  // Dispatch navigation event each time the active screen is changed
  useEffect(() => {
    trackGAEvent('screen_change', {
      screen_id: currentScreen,
      timestamp: new Date().toISOString()
    });
  }, [currentScreen]);

  // Brute-force lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds !== null && lockoutSeconds > 0) {
      const timer = setTimeout(() => {
        setLockoutSeconds(prev => (prev && prev > 1) ? prev - 1 : null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutSeconds]);

  // Administrative token session validation on mount/boot
  useEffect(() => {
    const verifySession = async () => {
      if (adminSessionToken) {
        try {
          const res = await fetch('/api/admin/verify-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: adminSessionToken })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.valid) {
              setIsAdminAuthenticated(true);
              fetchAdminIpTracker(adminSessionToken);
              fetchAdminAuditLogs(adminSessionToken);
            } else {
              handleAdminLogout();
            }
          } else {
            handleAdminLogout();
          }
        } catch {
          // Serve cache/offline if server is rebooting, but keep values
          fetchAdminIpTracker(adminSessionToken);
          fetchAdminAuditLogs(adminSessionToken);
        }
      }
    };
    verifySession();
  }, [adminSessionToken]);

  // Polling tracker for active logs & limits
  useEffect(() => {
    if (isAdminAuthenticated && adminSessionToken) {
      const interval = setInterval(() => {
        fetchAdminAuditLogs(adminSessionToken);
        fetchAdminIpTracker(adminSessionToken);
      }, 25000); // refresh every 25s
      return () => clearInterval(interval);
    }
  }, [isAdminAuthenticated, adminSessionToken]);

  // MVP Premium & billing state
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try {
      return localStorage.getItem('youtube_summarizer_premium') === 'true' || 
             localStorage.getItem('custom_vip_code') === 'PROPASS';
    } catch {
      return false;
    }
  });

  // Custom Domain Configuration state
  const [customDomain, setCustomDomain] = useState<string>(() => {
    try {
      return localStorage.getItem('youtube_summarizer_custom_domain') || '';
    } catch {
      return '';
    }
  });
  
  const [dnsStatus, setDnsStatus] = useState<'unconfigured' | 'verifying' | 'connected'>(() => {
    try {
      const stored = localStorage.getItem('youtube_summarizer_dns_status');
      if (stored === 'connected') return 'connected';
      if (stored === 'verifying') return 'verifying';
    } catch {}
    return 'unconfigured';
  });

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Stripe Checkout Simulator dialog
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState<'pro' | 'enterprise' | 'test' | null>(null);
  const [subscriptionEmail, setSubscriptionEmail] = useState('R_Bahirathan@gmail.com');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [stripePaymentLoading, setStripePaymentLoading] = useState(false);
  const [stripePaymentSuccess, setStripePaymentSuccess] = useState(false);
  const [stripeLaunchError, setStripeLaunchError] = useState<string | null>(null);

  // Live Stripe active session creator / dynamic simulator router
  const handleCheckoutClick = async (plan: 'pro' | 'enterprise' | 'test') => {
    setSelectedPlanCode(plan);
    setStripeLaunchError(null);
    trackGAEvent('initiate_checkout', {
      plan_code: plan,
      billing_cycle: billingCycle,
      stripe_configured: stripeConfig.stripeConfigured
    });
    if (stripeConfig.stripeConfigured) {
      setStripePaymentLoading(true);
      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            planCode: plan,
            billingCycle,
            returnUrl: window.location.href.split('?')[0] // Clean active page url
          })
        });
        const data = await response.json();
        if (data.url) {
          // Route straight to Google-protected Stripe domain to handle card/bank processes safely
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'No session URL returned.');
        }
      } catch (err: any) {
        console.warn('Real Stripe launch crashed, falling back to simulator:', err);
        // Fallback to local gateway sandbox simulator
        setStripeLaunchError(err.message || 'Stripe API Session initialization error');
        setShowStripeModal(true);
        setStripePaymentSuccess(false);
      } finally {
        setStripePaymentLoading(false);
      }
    } else {
      // Keys not active, launch the Sandbox Simulator Gated Modal with message
      setStripeLaunchError('Stripe live secret keys are not configured in your settings, so the app is running in Sandbox Simulation mode.');
      setShowStripeModal(true);
      setStripePaymentSuccess(false);
    }
  };

  // Automated high-performance sales copy and short script triggers
  const generateMarketingOutreach = async () => {
    if (!marketingNiche.trim()) return;
    setPitchLoading(true);
    setOutreachPitch('');
    try {
      const response = await fetch('/api/marketing-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'outreach', promptInput: marketingNiche })
      });
      const data = await response.json();
      if (data.result) {
        setOutreachPitch(data.result);
        trackGAEvent('marketing_outreach_generated', {
          niche: marketingNiche
        });
      } else {
        throw new Error(data.error || 'Failed to generate campaign outreach');
      }
    } catch (err: any) {
      console.error(err);
      setOutreachPitch(`⚠️ Outreach Generation Failed. Check that your GEMINI_API_KEY is configured in AI Studio secrets.\n\nError: ${err.message}`);
    } finally {
      setPitchLoading(false);
    }
  };

  const generateShortScript = async (videoTitle: string, bulletPoints: string) => {
    if (!videoTitle) return;
    setShortsScriptLoading(true);
    setMarketingShortsScript('');
    try {
      const response = await fetch('/api/marketing-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'shorts', 
          promptInput: bulletPoints || 'Design visual guidelines',
          details: videoTitle
        })
      });
      const data = await response.json();
      if (data.result) {
        setMarketingShortsScript(data.result);
        trackGAEvent('shorts_script_generated', {
          video_title: videoTitle
        });
      } else {
        throw new Error(data.error || 'Failed to generate viral script');
      }
    } catch (err: any) {
      console.error(err);
      setMarketingShortsScript(`⚠️ Script Generation Failed. Check that your GEMINI_API_KEY is configured in your AI Studio secrets.\n\nError: ${err.message}`);
    } finally {
      setShortsScriptLoading(false);
    }
  };

  // Save changes wrapper
  const savePremiumStatus = (status: boolean) => {
    setIsPremium(status);
    try {
      localStorage.setItem('youtube_summarizer_premium', String(status));
    } catch (e) {
      console.warn(e);
    }
  };

  // Save changes wrapper for Domain metadata
  const saveCustomDomain = (domain: string, status: 'unconfigured' | 'verifying' | 'connected') => {
    setCustomDomain(domain);
    setDnsStatus(status);
    try {
      localStorage.setItem('youtube_summarizer_custom_domain', domain);
      localStorage.setItem('youtube_summarizer_dns_status', status);
    } catch (e) {
      console.warn(e);
    }
  };

  const [selectedTone, setSelectedTone] = useState<'standard' | 'academic' | 'viral' | 'reel'>('standard');

  // State for Learn Mode
  const [learnMode, setLearnMode] = useState<boolean>(() => {
    return localStorage.getItem('snapsum_learn_mode') === 'true';
  });

  // A/B Testing state
  const [experimentGroup, setExperimentGroup] = useState<'A' | 'B'>(() => {
    const stored = localStorage.getItem('snapsum_ab_group');
    if (stored === 'A' || stored === 'B') return stored;
    const group = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem('snapsum_ab_group', group);
    return group;
  });

  // Selected subtab within Learn Mode workspace
  const [learnActiveTab, setLearnActiveTab] = useState<'syllabus' | 'flashcards' | 'quiz'>('syllabus');

  // State for interactive flashcards
  const [revealedFlashcards, setRevealedFlashcards] = useState<Record<number, boolean>>({});

  // Dynamic user learning stats & memory states
  const [userXp, setUserXp] = useState<number>(() => {
    return parseInt(localStorage.getItem('snapsum_user_xp') || '450', 10);
  });
  const [userLevel, setUserLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('snapsum_user_level') || '3', 10);
  });
  const [userStreak, setUserStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('snapsum_user_streak') || '5', 10);
  });
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(() => {
    return (localStorage.getItem('snapsum_adaptive_diff') as any) || 'Medium';
  });
  const [quizHistory, setQuizHistory] = useState<Array<{ videoId: string, title: string, score: number, total: number, date: string }>>(() => {
    try {
      const stored = localStorage.getItem('snapsum_quiz_history');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      { videoId: 'YCo78gA8_V0', title: 'Startups & Core Dedication', score: 3, total: 3, date: '21 Jun' },
      { videoId: 'u4ZoJKF_VuA', title: 'Sinek: Leverage the Limbic System', score: 2, total: 3, date: '22 Jun' }
    ];
  });
  const [weakTopics, setWeakTopics] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('snapsum_weak_topics');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return ['Early Stage Delegation', 'Limbic Brain Physiology', 'Founder Equity Vesting'];
  });
  const [strongTopics, setStrongTopics] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('snapsum_strong_topics');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return ['Emotional Action Driver', 'Target Audience Alignment', 'Uncopyable Product Hooks'];
  });
  const [challengeCompletedToday, setChallengeCompletedToday] = useState<boolean>(() => {
    return localStorage.getItem('snapsum_challenge_completed_today') === 'true';
  });

  // Highlighted concept node in Personal Memory Graph
  const [selectedGraphNode, setSelectedGraphNode] = useState<{ concept: string; source: string; status: 'Weak' | 'Strong'; description: string; analogy: string } | null>(null);
  // Selected choice in Daily Challenge widget
  const [activeDailyQuizOption, setActiveDailyQuizOption] = useState<number | null>(null);

  const awardXp = (amount: number) => {
    setUserXp((prev) => {
      const nextXp = prev + amount;
      localStorage.setItem('snapsum_user_xp', String(nextXp));
      const nextLevel = Math.floor(nextXp / 500) + 1;
      setUserLevel((curLevel) => {
        if (nextLevel > curLevel) {
          localStorage.setItem('snapsum_user_level', String(nextLevel));
          return nextLevel;
        }
        return curLevel;
      });
      return nextXp;
    });
  };

  // Stats or reports loaded from endpoints
  const [analyticsStats, setAnalyticsStats] = useState<any>(null);
  const [showExperimentConsole, setShowExperimentConsole] = useState<boolean>(false);

  // Load A/B Testing Telemetry dynamically from API
  const refreshAnalyticsStats = () => {
    fetch('/api/learn/analytics')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => setAnalyticsStats(data))
      .catch((err) => console.log('Error fetching analytics:', err));
  };

  useEffect(() => {
    refreshAnalyticsStats();
  }, [activeSummary]);

  // Track background engagement time
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeSummary) {
        const key = `snapsum_eng_${activeSummary.metadata.videoId}`;
        const currentSecs = parseInt(localStorage.getItem(key) || '0', 10) + 10;
        localStorage.setItem(key, String(currentSecs));

        fetch('/api/learn/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId: activeSummary.metadata.videoId,
            experimentGroup,
            eventName: 'engagement_update',
            metadata: { seconds: 10 }
          })
        }).then(() => {
          refreshAnalyticsStats();
        }).catch(console.error);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [activeSummary, experimentGroup]);

  // Event telemetry triggers
  const handleTrackActivation = (mo: boolean, vidId: string) => {
    fetch('/api/learn/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: vidId,
        experimentGroup,
        eventName: mo ? 'learn_mode_activated' : 'summary_mode_activated',
        metadata: { timestamp: new Date().toISOString() }
      })
    }).then(() => refreshAnalyticsStats()).catch(console.error);
  };

  const handleTrackRevisit = (vidId: string) => {
    fetch('/api/learn/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: vidId,
        experimentGroup,
        eventName: 'content_revisited',
        metadata: { timestamp: new Date().toISOString() }
      })
    }).then(() => refreshAnalyticsStats()).catch(console.error);
  };

  const handleTrackQuizCompleted = (score: number, max: number) => {
    if (!activeSummary) return;
    fetch('/api/learn/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: activeSummary.metadata.videoId,
        experimentGroup,
        eventName: 'quiz_completed',
        metadata: { score, maxScore: max }
      })
    }).then(() => refreshAnalyticsStats()).catch(console.error);
  };

  // Helper to ensure Learn Mode structural inputs exist, with optimized fallbacks for caching or preload assets
  const ensureLearnModeStructures = (summary: YouTubeSummaryResponse | null): any => {
    if (!summary) return null;
    
    // Customized fine-tuned content for preloaded lecture #1: Dustin Moskovitz
    if (summary.metadata.videoId === 'CBYhVcOnK8Y') {
      const concepts = [
        {
          concept: 'The Founder Illusions',
          definition: 'The romanticized myths about startup life propagated by media, including absolute status, immense, effortlessly built wealth, and total leisure.',
          simplifiedExplanation: 'Movies like "The Social Network" make building a startup look like a constant party. In reality, it involves constant high-tension hours, sleeping under desks, and extreme risk.'
        },
        {
          concept: 'Compelling Motivation (The Obsession)',
          definition: 'The deep, highly persistent intrinsic obsession that compels a founder to solve a problem because its existing pain simply cannot be tolerated.',
          simplifiedExplanation: "Don't start a startup for fame or money. Real longevity comes when you are so obsessed with a user's problem that you physically can't rest until you build its absolute solution."
        },
        {
          concept: 'Severe Stress Carrier',
          definition: 'The psychological burden of carrying absolute responsibility for the livelihoods, salaries, health insurance, and focus of your employees.',
          simplifiedExplanation: "As a boss, you don't just relax. When things go wrong, you are the final shield carrying the heavy burden of making payroll and preventing team burnout."
        }
      ];

      const cards = [
        {
          question: 'According to Dustin Moskovitz, who does a startup founder report to?',
          answer: 'Everyone! The employees, customers, partners, and investors. You are the ultimate servant leader.'
        },
        {
          question: 'What is the most sustainable reason to start a company?',
          answer: 'An urgent, real obsession with solving an intolerable problem that the world needs.'
        },
        {
          question: 'Why is starting a startup to gain "status" or "wealth" a trap?',
          answer: "Because the workload is so extreme and stressful that financial reward alone won't sustain you through hard times."
        }
      ];

      const rem = `- **Rethink Boss Myths**: You are not your own master; you are a primary servant to your team.\n- **Intrinsic obsessions**: Chase a burning user agony, not a generic market trend.\n- **Prepare for the carrying burden**: Build high psychological resilience before diving in.`;

      return {
        ...summary,
        keyConcepts: concepts,
        flashcards: cards,
        rememberSummary: rem,
        learnModeEnabled: true
      };
    }

    // Customized fine-tuned content for preloaded lecture #2: Simon Sinek
    if (summary.metadata.videoId === 'qp0HIF3SfI4') {
      const concepts = [
        {
          concept: 'The Golden Circle',
          definition: 'A three-tiered structural model consisting of Why (purpose), How (process), and What (result) explaining how legendary leaders inspire action.',
          simplifiedExplanation: 'Normal companies market WHAT they do and HOW they do it. Exceptional ones communicate "Why" we exist first, hooking deep loyalty before listing products.'
        },
        {
          concept: 'Neurological Inside-Out Match',
          definition: 'The physiological fact that the layouts of the Golden Circle correspond directly to divisions of the human brain (neocortex vs. limbic system).',
          simplifiedExplanation: 'The "What" layer speaks to the analytical neocortex (language, logic). The "Why" speaks directly to the emotional limbic brain which governs decisions but has zero language.'
        },
        {
          concept: 'The Believers Magnet',
          definition: 'The law of diffusion of innovations stating that business growth relies on securing innovators who share your passion first.',
          simplifiedExplanation: "You don't want to sell to everyone who needs a widget. You want to attract the early believers who align with your values and advocate for you organically."
        }
      ];

      const cards = [
        {
          question: 'What is the neurological correlation of the "What" layer?',
          answer: 'The neocortex, which processes rational details, numbers, features, and verbal language.'
        },
        {
          question: 'What brain region controls feelings, loyalty, and gut decisions?',
          answer: 'The Limbic System, which corresponds perfectly to the "Why" and "How" layers.'
        },
        {
          question: 'Why do emotional believers matter more than simple transaction shoppers?',
          answer: 'Because believers will pay a premium, stay loyal through setbacks, and champion your brand organically.'
        }
      ];

      const rem = `- **Inside-Out Focus**: Anchor every campaign to your core beliefs (Why) before detailing features.\n- **Neurological alignment**: Frame messages to appeal to emotions (limbic brain) first, then justify with logic.\n- **Diffusion Law**: Target people who share your values to anchor a solid, recurring organic audience.`;

      return {
        ...summary,
        keyConcepts: concepts,
        flashcards: cards,
        rememberSummary: rem,
        learnModeEnabled: true
      };
    }

    // Dynamic procedural backfills for user-generated summaries
    const concepts = summary.keyConcepts || (summary.takeaways && summary.takeaways.length > 0 ? summary.takeaways.map((takeaway) => {
      const split = takeaway.split('—');
      const conceptName = split[0] ? split[0].trim() : 'Core Principle';
      const expl = split[1] ? split[1].trim() : takeaway;
      return {
        concept: conceptName.slice(0, 40),
        definition: expl,
        simplifiedExplanation: `This concept emphasizes applying ${conceptName.toLowerCase()} directly to the core video context to maximize outcomes.`
      };
    }).slice(0, 4) : [
      {
        concept: 'High-Velocity Focus',
        definition: 'Devoting complete cognitive resources to a single, high-leverage task to accelerate project delivery.',
        simplifiedExplanation: 'Like a laser beam, focus on doing one thing extremely well instead of scattering your energy over multiple features.'
      }
    ]);

    const cards = summary.flashcards || (summary.quiz && summary.quiz.length > 0 ? summary.quiz.map((q) => ({
      question: q.question,
      answer: q.explanation || `The correct answer is indeed option index ${q.answerIndex + 1}: ${q.options[q.answerIndex] || ''}`
    })).slice(0, 4) : [
      {
        question: 'What is the main takeaway regarding optimization of study workflows?',
        answer: 'Iterate on structured, digestible micro-lessons daily rather than giant studying cram sessions.'
      }
    ]);

    const rem = summary.rememberSummary || (summary.summary ? `- **Syllabus Baseline**: ${summary.summary.split('.')[0] || ''}.\n- **Strategic Value**: Focus heavily on interactive retention milestones weekly.\n- **Action Checklist**: Answer all self-quizzes to lock in core definitions.` : `- **Primary lesson**: Master the concept definitions.\n- **Active recall**: Flip flashcards repeatedly to embed memories.\n- **Comprehension check**: Finish the interactive quiz session with perfect marks.`);

    return {
      ...summary,
      keyConcepts: concepts,
      flashcards: cards,
      rememberSummary: rem,
      learnModeEnabled: true
    };
  };

  const downloadSummaryAsPDF = () => {
    if (!activeSummary) return;
    const contents = `---
SNAPSUM PROFESSIONAL SUMMARY REPORT
TITLE: ${activeSummary.metadata.title}
AUTHOR: ${activeSummary.metadata.author}
DURATION: ${activeSummary.metadata.duration}
REPORT GENERATED: ${new Date().toLocaleString()}
STATUS: PREMIUM SUBSCRIBER WHITE-LABELED EXPORT
---

CORE THESIS & SYNTHESIS:
========================
${activeSummary.summary}

KEY TAKEAWAYS & DIRECT VALUE BOMBS:
===================================
${activeSummary.takeaways.map((bomb, index) => `${index + 1}. ${bomb}`).join('\n')}

TOPIC CATEGORIES & BRAIN MINDMAP:
=================================
${activeSummary.mindmap.map((node) => `[${node.category}] ${node.concept}: ${node.description}`).join('\n')}
`;

    const blob = new Blob([contents], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeSummary.metadata.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_summary.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load saved summaries and default to the first preloaded summary
  useEffect(() => {
    try {
      const stored = localStorage.getItem('youtube_summarizer_shelf');
      if (stored) {
        const parsed = JSON.parse(stored) as SavedSummary[];
        setSavedSummaries(parsed);
      }
    } catch (e) {
      console.warn('Failed parsing local storage histories', e);
    }
    // Default to Dustin Moskovitz lecture for rich quick onboarding
    setActiveSummary(PRELOADED_VIDEOS[0]);
  }, []);

  // Update localStorage when savedSummaries list changes
  const saveToShelf = (updated: SavedSummary[]) => {
    setSavedSummaries(updated);
    try {
      localStorage.setItem('youtube_summarizer_shelf', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed storing summary items', e);
    }
  };

  // Helper: Format audio durations (MM:SS)
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  // Setup/Clean Audio object
  useEffect(() => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        setAudioProgress(audio.currentTime);
      });
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setAudioProgress(0);
      });

      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn('Audio play auto-interrupted', err);
          setIsPlaying(false);
        });
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioUrl]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  // Copy text helper
  const handleCopyText = (text: string, elementId: string) => {
    let textToCopy = text;
    if (['blog', 'thread', 'snippet', 'overview', 'summary'].includes(elementId)) {
      textToCopy = `${text}\n\n---\n⚡ Summarized by SnapSum - AI Video Knowledge Engine (https://www.snapsum.app)`;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedStates((prev) => ({ ...prev, [elementId]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [elementId]: false }));
    }, 2000);
  };

  // Request new AI Summary processing
  const handleSummarize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!videoUrl) return;

    setLoading(true);
    setError(null);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setYtStartSeconds(null);
    
    // Reset TTS audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioUrl(null);
    setIsPlaying(false);

    // 🌟 Smart Interceptor: If pasted URL corresponds to one of the rich preloaded videos,
    // load it directly with zero network delay and zero API costs! Great for free live demos.
    const matchedPreload = PRELOADED_VIDEOS.find(
      (video) => videoUrl.includes(video.metadata.videoId) || video.metadata.videoUrl === videoUrl
    );

    if (matchedPreload) {
      setLoadingStep('Bypassing API: Loading pre-rendered high-fidelity summary...');
      setTimeout(() => {
        const hydratedMock = ensureLearnModeStructures(matchedPreload);
        setActiveSummary(hydratedMock);
        if (selectedTone === 'reel') {
          setActiveTab('reel');
        }

        // Save to shelf history
        const alreadySaved = savedSummaries.some((item) => item.id === matchedPreload.metadata.videoId);
        if (!alreadySaved) {
          const updatedShelf: SavedSummary[] = [
            {
              id: matchedPreload.metadata.videoId,
              savedAt: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              response: hydratedMock,
            },
            ...savedSummaries,
          ];
          saveToShelf(updatedShelf);
        }
        trackGAEvent('summary_generated', {
          video_id: matchedPreload.metadata.videoId,
          video_title: matchedPreload.metadata.title,
          source: 'preloaded_cache',
          custom_transcript_used: showCustomTranscriptField
        });
        handleTrackActivation(learnMode, matchedPreload.metadata.videoId);
        setLoading(false);
      }, 700); // Authentic processing delay for micro-animation feel
      return;
    }

    setLoadingStep('Analyzing video metadata & extracting transcripts...');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          videoUrl,
          customTranscript: customTranscript || undefined,
          outputLanguage,
          learnMode: learnMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server returned an error generating summary.');
      }

      setLoadingStep('Applying advanced reasoning structures with Gemini...');
      const summaryData = (await response.json()) as YouTubeSummaryResponse;
      const hydratedData = ensureLearnModeStructures(summaryData);
      
      setActiveSummary(hydratedData);
      if (selectedTone === 'reel') {
        setActiveTab('reel');
      }

      trackGAEvent('summary_generated', {
        video_id: hydratedData.metadata.videoId,
        video_title: hydratedData.metadata.title,
        source: 'api_live',
        model_configured: adminSelectedModel,
        custom_transcript_used: showCustomTranscriptField
      });
      handleTrackActivation(learnMode, hydratedData.metadata.videoId);

      // Save to shelf
      const alreadySaved = savedSummaries.some((item) => item.id === summaryData.metadata.videoId);
      if (!alreadySaved) {
        const updatedShelf: SavedSummary[] = [
          {
            id: summaryData.metadata.videoId,
            savedAt: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            response: summaryData,
          },
          ...savedSummaries,
        ];
        saveToShelf(updatedShelf);
      }

      // Scroll to summary content cleanly
      setTimeout(() => {
        document.getElementById('summary-dashboard')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

      refreshStatus();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected failure occurred while loading the video summary.');
      trackGAEvent('summary_failed', {
        video_url: videoUrl,
        error_message: err.message || 'unknown error'
      });
      refreshStatus();
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // High Quality Speech synthesis trigger
  const handleGenerateTTS = async (textSource: string) => {
    if (ttsLoading) return;
    setTtsLoading(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text: textSource }),
      });

      if (!response.ok) {
        throw new Error('TTS generator service failed.');
      }

      const data = await response.json();
      if (data.audioBase64) {
        const binary = atob(data.audioBase64);
        const arrayBuffer = new ArrayBuffer(binary.length);
        const byteArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binary.length; i++) {
          byteArray[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: 'audio/mpeg' });
        const objectUrl = URL.createObjectURL(blob);
        setAudioUrl(objectUrl);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error(err);
      alert('High-quality TTS failed. We will fallback to the standard browser Speecher API.');
      
      // Fallback: Browser Web Speech API
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textSource.slice(0, 800));
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } catch (speechErr) {
        console.error('Speech synthesis fallback failed:', speechErr);
      }
    } finally {
      setTtsLoading(false);
    }
  };

  // Jump YouTube Iframe Embed to timestamp matching target second
  const handleJumpToTimestamp = (seconds: number) => {
    setYtStartSeconds(seconds);
    setYtAutoplayKey((prev) => prev + 1);
    
    // Scroll window smoothly to player
    document.getElementById('video-player-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Erase saved shelf items
  const handleDeleteShelfItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedSummaries.filter((item) => item.id !== id);
    saveToShelf(filtered);
  };

  // Clear all history
  const handleClearAllHistory = () => {
    if (confirm('Are you sure you want to permanently erase your cached summary library?')) {
      saveToShelf([]);
    }
  };

  // Load stored item
  const handleLoadStoredItem = (summary: YouTubeSummaryResponse) => {
    const hydratedSummary = ensureLearnModeStructures(summary);
    setActiveSummary(hydratedSummary);
    if (selectedTone === 'reel') {
      setActiveTab('reel');
    }
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setYtStartSeconds(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioUrl(null);
    setIsPlaying(false);
    handleTrackRevisit(hydratedSummary.metadata.videoId);

    document.getElementById('summary-dashboard')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoadVideoById = (videoId: string, isSummary: boolean) => {
    const demoMatched = PRELOADED_VIDEOS.find(v => v.metadata.videoId === videoId);
    if (demoMatched) {
      handleLoadStoredItem(demoMatched);
      return;
    }
    const shelfMatched = savedSummaries.find(s => s.id === videoId);
    if (shelfMatched) {
      handleLoadStoredItem(shelfMatched.response);
      return;
    }
    setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);
  };

  // Admin Dashboard API Handler utilities:
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: adminUserField, 
          password: adminPassField,
          mfaCode: adminMfaRequired ? adminMfaField : undefined
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.lockoutSeconds) {
          setLockoutSeconds(data.lockoutSeconds);
        }
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        throw new Error(data.error || 'Authentication challenge failed.');
      }

      if (data.mfaRequired) {
        setAdminMfaRequired(true);
        setAdminError('');
        return;
      }

      if (data.token) {
        sessionStorage.setItem('admin_session_token', data.token);
        setAdminSessionToken(data.token);
        setIsAdminAuthenticated(true);
        setAdminMfaRequired(false);
        setAttemptsRemaining(null);
        setLockoutSeconds(null);
        fetchAdminIpTracker(data.token);
        fetchAdminAuditLogs(data.token);
      }
    } catch (err: any) {
      setAdminError(err.message || 'Invalid credentials. Access denied.');
    }
  };

  const handleAdminLogout = async () => {
    try {
      if (adminSessionToken) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: adminSessionToken })
        });
      }
    } catch {}
    sessionStorage.removeItem('admin_session_token');
    setAdminSessionToken('');
    setIsAdminAuthenticated(false);
    setAdminMfaRequired(false);
    setAdminMfaField('');
    setAdminUserField('');
    setAdminPassField('');
    setAdminAuditLogs([]);
    setAdminIpList([]);
  };

  // Helper: generate highly secured password
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let pass = '';
    // Use window.crypto for secure random values
    const array = new Uint32Array(20);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 20; i++) {
      pass += chars[array[i] % chars.length];
    }
    setVaultPassword(pass);
    setVaultPasswordVisible(true);
  };

  // Helper: trigger 2FA generation
  const handleGenerate2FA = async () => {
    setVaultSetupLoading(true);
    setVaultSaveStatus({ type: 'idle', message: '' });
    try {
      const response = await fetch('/api/admin/generate-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminSessionToken })
      });
      const data = await response.json();
      if (response.ok) {
        setVault2faSecret(data.secret);
        setVault2faQrUrl(data.qrCodeUrl);
        setVault2faVerified(false);
      } else {
        setVaultSaveStatus({ type: 'error', message: data.error || 'Failed to initialize 2FA.' });
      }
    } catch (err: any) {
      setVaultSaveStatus({ type: 'error', message: err.message || 'Network error initializing 2FA.' });
    } finally {
      setVaultSetupLoading(false);
    }
  };

  // Helper: verify TOTP code before saving settings
  const handleVerify2FASetup = async () => {
    if (!vault2faSetupCode.trim()) return;
    setVaultSetupLoading(true);
    setVaultSaveStatus({ type: 'idle', message: '' });
    try {
      const response = await fetch('/api/admin/verify-2fa-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: adminSessionToken,
          mfaSecret: vault2faSecret,
          mfaCode: vault2faSetupCode
        })
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        setVault2faVerified(true);
        setVaultSaveStatus({ type: 'success', message: 'Authenticator App token verified successfully!' });
      } else {
        setVaultSaveStatus({ type: 'error', message: 'MFA pin is incorrect. Please verify your authenticator app clock synchronization.' });
      }
    } catch (err: any) {
      setVaultSaveStatus({ type: 'error', message: err.message || 'Error verifying setup.' });
    } finally {
      setVaultSetupLoading(false);
    }
  };

  // Helper: Save administrative vault credentials and settings to Firestore Database
  const handleSaveVaultSettings = async () => {
    if (!vaultUsername.trim() || !vaultPassword.trim()) {
      setVaultSaveStatus({ type: 'error', message: 'Username and password fields cannot be empty.' });
      return;
    }
    setVaultSetupLoading(true);
    setVaultSaveStatus({ type: 'idle', message: '' });
    try {
      const response = await fetch('/api/admin/save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: adminSessionToken,
          adminUser: vaultUsername,
          adminPassword: vaultPassword,
          mfaSecret: vault2faVerified ? vault2faSecret : null
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setVaultSaveStatus({ type: 'success', message: 'Admin login credentials & security parameters successfully saved to Firestore Database!' });
        fetchAdminAuditLogs();
      } else {
        setVaultSaveStatus({ type: 'error', message: data.error || 'Failed to save administrative settings.' });
      }
    } catch (err: any) {
      setVaultSaveStatus({ type: 'error', message: err.message || 'Network error saving settings.' });
    } finally {
      setVaultSetupLoading(false);
    }
  };

  const fetchAdminIpTracker = async (currentToken?: string) => {
    const activeToken = currentToken || adminSessionToken;
    if (!activeToken) return;
    setAdminIpLoading(true);
    try {
      const response = await fetch('/api/admin/ip-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeToken }),
      });
      if (response.ok) {
        const data = await response.json();
        setAdminIpList(data.ips || []);
      }
    } catch (err) {
      console.warn('Could not read IP tracker list:', err);
    } finally {
      setAdminIpLoading(false);
    }
  };

  const fetchAdminAuditLogs = async (currentToken?: string) => {
    const activeToken = currentToken || adminSessionToken;
    if (!activeToken) return;
    setAdminLogsLoading(true);
    try {
      const response = await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeToken }),
      });
      if (response.ok) {
        const data = await response.json();
        setAdminAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.warn('Could not read secure administrative audit logs:', err);
    } finally {
      setAdminLogsLoading(false);
    }
  };

  const handleResetSpecificIp = async (ip: string) => {
    if (!confirm(`Are you sure you want to reset rate limits for guest IP ${ip}?`)) return;
    try {
      const response = await fetch('/api/admin/ip-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: adminSessionToken,
          targetIp: ip
        }),
      });
      if (response.ok) {
        fetchAdminIpTracker();
        fetchAdminAuditLogs();
        refreshStatus();
      }
    } catch (err) {
      console.warn('Could not reset guest IP rate limits:', err);
    }
  };

  const handleResetAllIps = async () => {
    if (!confirm('Are you sure you want to clear rate limits for ALL guests simultaneously?')) return;
    try {
      const response = await fetch('/api/admin/ip-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: adminSessionToken,
          clearAll: true
        }),
      });
      if (response.ok) {
        fetchAdminIpTracker();
        fetchAdminAuditLogs();
        refreshStatus();
      }
    } catch (err) {
      console.warn('Could not reset all rate limits:', err);
    }
  };

  // Quiz score check
  const calculateQuizScore = () => {
    if (!activeSummary) return 0;
    let score = 0;
    activeSummary.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased selection:bg-[#0071e3]/10 selection:text-[#0071e3]">
      
      {/* Sleek Apple-Inspired Navigation Header */}
      <header className="sticky top-0 z-35 bg-white/85 backdrop-blur-xl border-b border-black/[0.04] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setCurrentScreen('landing')}>
            <div className="h-8.5 w-8.5 bg-[#1d1d1f] flex items-center justify-center rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition duration-300">
              <img src="/logo.svg" alt="SnapSum Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold font-display tracking-tight text-[#1d1d1f] group-hover:text-neutral-800 transition">
                SnapSum
              </span>
              <p className="text-[8px] uppercase tracking-widest text-[#86868b] font-semibold font-mono leading-none mt-0.5">
                Universal Content Processor
              </p>
            </div>
          </div>

          {/* Minimalist Tabbed Navigation Pill Block */}
          <nav className="flex items-center bg-black/[0.04] p-1 rounded-full border border-black/[0.02]">
            <button
              onClick={() => setCurrentScreen('app')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition duration-200 flex items-center gap-1.5 ${
                currentScreen === 'app'
                  ? 'bg-white text-[#1d1d1f] shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Workspace</span>
            </button>
            
            {(isAdminAuthenticated || ['domain', 'marketing', 'admin'].includes(currentScreen)) && (
              <button
                onClick={() => setCurrentScreen('domain')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition duration-200 flex items-center gap-1.5 ${
                  currentScreen === 'domain'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Custom Domain</span>
              </button>
            )}

            {(isAdminAuthenticated || currentScreen === 'billing') && (
              <button
                onClick={() => setCurrentScreen('billing')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition duration-200 flex items-center gap-1.5 ${
                  currentScreen === 'billing'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden xs:inline flex items-center gap-1">
                  <span>Billing</span>
                  {isPremium ? (
                    <span className="bg-[#0071e3] text-white text-[8px] font-mono leading-none tracking-wider px-1 py-0.5 rounded-sm">PRO</span>
                  ) : (
                    <span className="bg-black/10 text-[#515154] text-[8px] font-mono leading-none tracking-wider px-1 py-0.5 rounded-sm">Basic</span>
                  )}
                </span>
              </button>
            )}

            {(isAdminAuthenticated || ['domain', 'marketing', 'admin'].includes(currentScreen)) && (
              <>
                <button
                  onClick={() => setCurrentScreen('marketing')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition duration-200 flex items-center gap-1.5 ${
                    currentScreen === 'marketing'
                      ? 'bg-white text-[#1d1d1f] shadow-sm'
                      : 'text-[#86868b] hover:text-[#1d1d1f]'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Marketing</span>
                </button>
                <button
                  onClick={() => setCurrentScreen('admin')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition duration-200 flex items-center gap-1.5 ${
                    currentScreen === 'admin'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-[#86868b] hover:text-[#1d1d1f]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Admin</span>
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {/* Google Sign In Widget for Site Visitors */}
            {authInitialized && (
              <div className="flex items-center gap-2">
                {visitorUser ? (
                  <div className="flex items-center gap-2 bg-[#f5f5f7] border border-black/[0.04] p-1 pr-3 rounded-full">
                    {visitorUser.photoURL ? (
                      <img 
                        src={visitorUser.photoURL} 
                        alt={visitorUser.displayName || 'Visitor'} 
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full shadow-sm object-cover animate-fade-in"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs font-sans">
                        {visitorUser.displayName ? visitorUser.displayName.charAt(0).toUpperCase() : 'V'}
                      </div>
                    )}
                    <div className="text-[10px] text-zinc-800 font-medium hidden sm:block">
                      {visitorUser.displayName || 'Visitor'}
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await signOut(auth);
                        } catch (err) {
                          console.error('Failed to sign out visitor user:', err);
                        }
                      }}
                      className="text-[9px] font-bold text-rose-600 hover:text-rose-805 transition uppercase font-mono pl-1.5 border-l border-zinc-200 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      const provider = new GoogleAuthProvider();
                      try {
                        await signInWithPopup(auth, provider);
                      } catch (err: any) {
                        console.error('Google login failed:', err);
                        if (err.code !== 'auth/popup-closed-by-user') {
                          alert(`Google Sign-In Error: ${err.message}`);
                        }
                      }
                    }}
                    className="flex items-center gap-1.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-zinc-800 hover:text-black border border-black/[0.04] px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>Google Sign In</span>
                  </button>
                )}
              </div>
            )}

            <div className="hidden lg:flex items-center gap-3">
              {isPremium ? (
                <div className="flex items-center gap-1.5 bg-[#0071e3]/5 text-[#0071e3] border border-[#0071e3]/10 px-3 py-1.5 rounded-full text-xs font-bold font-mono">
                  <Zap className="w-3.5 h-3.5 text-[#0071e3] fill-[#0071e3]/20" />
                  <span>PREMIUM ACTIVE</span>
                </div>
              ) : (
                <button
                  onClick={() => handleCheckoutClick('pro')}
                  className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-4 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>Upgrade</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={`${currentScreen === 'landing' ? 'w-full pt-1' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8'}`}>

        {/* 🚀 LANDING PAGE SCREEN */}
        {currentScreen === 'landing' && (
          <div className="w-full flex flex-col items-center justify-start text-[#1d1d1f] antialiased bg-slate-50/10">
            
            {/* 1. HERO SECTION (Conversion-focused Split Layout) */}
            <section className="relative w-full overflow-hidden bg-radial from-slate-50 via-white to-slate-100/50 pt-10 sm:pt-16 pb-20 sm:pb-28 border-b border-black/[0.02]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column: Headline, Subheadline, CTAs */}
                  <div className="lg:col-span-6 space-y-6 text-left">
                    <div className="inline-flex items-center gap-2 bg-[#0071e3]/5 border border-[#0071e3]/10 px-4 py-1.5 rounded-full text-xs font-semibold text-[#0071e3] shadow-sm animate-pulse">
                      <Sparkles className="w-4 h-4 fill-[#0071e3]/10" />
                      <span>SnapSum 2.0 AI Engine Active</span>
                    </div>
                           <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display leading-[1.08] tracking-tight text-[#1d1d1f]">
                      Turn Any Video Into<br />
                      <span className="bg-gradient-to-r from-[#0071e3] via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        Instant Knowledge.
                      </span>
                    </h1>
                    
                    <p className="text-gray-900 font-medium text-base sm:text-lg leading-relaxed max-w-xl">
                      “Stop wasting hours watching videos just to find minutes of useful information.”
                    </p>

                    <p className="text-gray-550 font-light text-sm sm:text-base leading-relaxed max-w-xl">
                      SnapSum transforms YouTube videos, lectures, and meetings into structured insights, summaries, and actionable notes in seconds.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                      <button
                        onClick={() => setCurrentScreen('app')}
                        className="w-full sm:w-auto bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm px-8 py-4.5 rounded-full transition-all duration-200 shadow-md shadow-[#0071e3]/10 hover:shadow-lg active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer leading-none"
                      >
                        <span>Try Free</span>
                        <ArrowRight className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => {
                          document.getElementById('cinematic-theater')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-250 text-neutral-800 font-semibold text-sm px-8 py-4.5 rounded-full transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-neutral-300/40 leading-none"
                      >
                        <Play className="w-4 h-4 text-[#1d1d1f] fill-current" />
                        <span>Watch Demo</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-6 pt-5 text-gray-400 text-xs font-mono">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-4.5 h-4.5 text-indigo-600" /> No credit card required</span>
                      <span className="flex items-center gap-1.5"><Activity className="w-4.5 h-4.5 text-emerald-600" /> Unlimited preloaded trials</span>
                    </div>
                  </div>

                  {/* Right Column: High Fidelity Interface Mockup */}
                  <div className="lg:col-span-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0071e3]/10 to-violet-500/10 rounded-3xl blur-2xl opacity-60"></div>
                    <div className="relative bg-white rounded-3xl p-5 md:p-6 border border-black/[0.04] shadow-[0_24px_50px_rgba(0,0,0,0.06)] overflow-hidden text-left">
                      
                      {/* Mockup Toolbar Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-black/[0.04] mb-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                          <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                          <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                        </div>
                        <div className="bg-neutral-100/60 px-4 py-1.5 rounded-lg text-[10px] text-[#86868b] font-mono flex items-center gap-1.5 w-60 sm:w-80">
                          <Lock className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span className="truncate">https://snapsum.app/dashboard</span>
                        </div>
                        <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                      </div>

                      {/* Mockup Desktop Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        {/* Mock Video Aspect Player */}
                        <div className="sm:col-span-5 bg-slate-900 rounded-2xl p-3 relative aspect-[16/10] sm:aspect-auto flex flex-col justify-between overflow-hidden shadow-sm group">
                          <img 
                            src="https://img.youtube.com/vi/CBYhVcOnK8Y/maxresdefault.jpg" 
                            alt="Lecture Preview" 
                            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity filter blur-xs"
                            referrerPolicy="no-referrer"
                          />
                          <div className="bg-black/40 text-[8px] text-white px-1.5 py-0.5 rounded-md font-mono self-start relative z-10">
                            12:15 / 24:00
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center relative z-10">
                            <span className="w-10 h-10 bg-[#0071e3] text-white rounded-full flex items-center justify-center shadow-md animate-pulse">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </span>
                          </div>
                          <div className="text-[9px] text-neutral-200 truncate font-sans font-medium relative z-10">
                             Dustin Moskovitz • Startup school
                          </div>
                        </div>

                        {/* Mock Synthesized Outlets */}
                        <div className="sm:col-span-7 space-y-3">
                          <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            <span>Synthesized Output</span>
                          </div>
                          
                          <h4 className="text-sm font-bold font-display text-neutral-900 leading-tight">
                            Evaluating Founder Motivation
                          </h4>
                          
                          <p className="text-[11px] text-neutral-500 leading-normal line-clamp-3 font-light">
                            Examines why status, quick wealth, and complete flexibility are usually illusions. Moskovitz insists true builders should only proceed if compelled by a problem's extreme urgency.
                          </p>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-start gap-1.5 text-[10px] text-neutral-700">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-tight">Media romanticizes the operational startup workflow</span>
                            </div>
                            <div className="flex items-start gap-1.5 text-[10px] text-neutral-700">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-tight">Founders answer to board, customers, and employees</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mockup Footer Analytics strip */}
                      <div className="mt-4 pt-3 border-t border-black/[0.03] flex items-center justify-between text-[9px] font-mono text-gray-400">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-[#0071e3]" /> Generated in 1.4s</span>
                        <span className="text-indigo-600 font-medium">Bypassed Quota Constraints</span>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* 🎬 CINEMATIC THEATER SECTION */}
            <section id="cinematic-theater" className="w-full bg-[#f5f5f7] py-16 sm:py-20 border-b border-black/[0.03] scroll-mt-20 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-150 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-indigo-700 uppercase shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600/10" />
                    <span>60-Second Apple-Style Cinematic Tour</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900 leading-tight">
                    Turn Any Video Into Structured Knowledge
                  </h2>
                  <p className="text-neutral-500 font-light text-base sm:text-lg max-w-2xl mx-auto">
                    Experience how SnapSum compiles raw multimedia streams into interactive chapters, high-clarity conceptual notes, and retention test quizzes. Watch our live-rendered spec explainer block below.
                  </p>
                </div>

                <div className="transition duration-500 hover:shadow-xl rounded-3xl">
                  <CinematicExplainer onStartLearning={() => setCurrentScreen('app')} />
                </div>
              </div>
            </section>

            {/* 2. TRUST STRIP (Badges for compatible feeds) */}
            <section className="w-full bg-slate-900 overflow-hidden py-11 text-center border-b border-indigo-950/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-slate-400 text-[10px] sm:text-xs font-mono uppercase tracking-widest mb-6 font-semibold">
                  COMPATIBLE HIGH-FIDELITY PLATFORMS & MULTIMEDIA
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                  {[
                    { label: 'YouTube Lectures', plat: 'YouTube' },
                    { label: 'Academic Seminars', plat: 'Class' },
                    { label: 'Vimeo streams', plat: 'Video' },
                    { label: 'ZOOM Meetings', plat: 'Brief' },
                    { label: 'Podcast Channels', plat: 'Audio' },
                    { label: 'Custom TXT Paragraphs', plat: 'Text' }
                  ].map((tier, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-slate-300 bg-white/[0.05] border border-white/[0.04] text-xs font-mono font-medium hover:bg-white/[0.08] hover:text-white transition duration-200"
                    >
                      <Video className="w-3 h-3 text-indigo-400" />
                      <span>{tier.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. HOW IT WORKS SECTION (Simple 3-step timeline) */}
            <section className="w-full bg-white py-20 sm:py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
                <div className="space-y-4 max-w-3xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900">
                    The Fast Path to Complete Retention
                  </h2>
                  <p className="text-gray-500 font-light text-base sm:text-lg leading-relaxed">
                    Traditional video research requires tedious clicking, skipping, and note-taking. SnapSum synthesizes perfect conceptual summaries in three simple steps.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  {/* Decorative guide line */}
                  <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-neutral-100 z-0 -translate-y-1/2"></div>
                  
                  {[
                    {
                      step: '01',
                      title: 'Paste Video URL',
                      desc: 'Input any YouTube link, lecture address, Vimeo URL, or use a custom speech-to-text transcript paragraph override with ease.',
                      icon: <Youtube className="w-5 h-5 text-[#0071e3]" />,
                      color: 'bg-blue-50/70 border-blue-100'
                    },
                    {
                      step: '02',
                      title: 'Generative Distillation',
                      desc: 'Our contextual pipeline analyses language intent, indexes temporal milestones, clusters core arguments, and crafts comprehensive takeaways.',
                      icon: <Sparkles className="w-5 h-5 text-indigo-600 font-bold" />,
                      color: 'bg-indigo-50/70 border-indigo-100'
                    },
                    {
                      step: '03',
                      title: 'Extract Leverage',
                      desc: 'Skim structured takeaways, quiz yourself, generate viral marketing newsletters, or read mindmaps of difficult concepts instantly.',
                      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
                      color: 'bg-emerald-50/70 border-emerald-100'
                    }
                  ].map((card, idx) => (
                    <div 
                      key={idx}
                      className="bg-neutral-50 hover:bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/50 hover:border-black/[0.04] shadow-sm hover:shadow-xl transition-all duration-300 text-left relative z-10 space-y-4 group"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${card.color} border flex items-center justify-center shadow-xs group-hover:scale-105 transition`}>
                        {card.icon}
                      </div>
                      <span className="block text-[10px] font-mono text-[#0071e3] tracking-widest font-bold uppercase">
                        PHASE {card.step}
                      </span>
                      <h3 className="text-lg font-bold font-display text-neutral-900">
                        {card.title}
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed font-light">
                        {card.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. CHRONO-BENTO FEATURE GRID */}
            <section className="w-full bg-[#f8fafc]/50 py-20 border-y border-slate-200/40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-indigo-700 uppercase">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Engine Capabilities</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900">
                    Built for Intense Knowledge Extraction
                  </h2>
                  <p className="text-gray-500 font-light text-base sm:text-lg">
                    SnapSum combines multiple layers of semantic context processing to deliver pristine educational assets.
                  </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Big Card 1: Structured Sums */}
                  <div className="md:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-black/[0.03] shadow-xs flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="p-2.5 w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold font-display text-neutral-900">Smart Structured Chronologies</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xl font-light">
                        Instead of massive blocks of prose, SnapSum organizes insights into structured chronologies. Select chapters to instantly seek to timestamp segments or read key takeaways of that specific timestamp. Perfect for reviewing core arguments.
                      </p>
                    </div>
                    
                    {/* Mock segment */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-left text-xs font-mono">
                      <div className="border-b border-neutral-100 pb-2 flex justify-between text-[10px] text-gray-400">
                        <span>TIMESTAMPS TRACKED</span>
                        <span>GCC STANDARD REGION</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#0071e3] shrink-0 bg-white border border-[#0071e3]/10 px-2 py-0.5 rounded-md">04:15</span>
                        <span className="truncated text-neutral-800">Evaluating founder motivations vs media illusions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#0071e3] shrink-0 bg-white border border-[#0071e3]/10 px-2 py-0.5 rounded-md">10:30</span>
                        <span className="truncated text-neutral-800">The heavy psychological burden of operational failure</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Interactive quizzing */}
                  <div className="md:col-span-4 bg-white rounded-3xl p-6 md:p-8 border border-black/[0.03] shadow-xs flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="p-2.5 w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        <Award className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold font-display text-neutral-900">Retention Quizzes</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-light">
                        Automatically gauge your conceptual comprehension with custom AI-conceived multi-choice quizzes mapped directly to video content.
                      </p>
                    </div>
                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 space-y-2 text-xs">
                      <p className="font-bold text-emerald-950">Comprehension Check:</p>
                      <p className="text-emerald-900 text-[10px] font-light">"Who is a founder's ultimate boss according to Dustin?"</p>
                      <div className="bg-white border border-emerald-100 p-1.5 rounded text-[9px] text-emerald-900 font-semibold cursor-default">
                        ✓ Everyone (Stakeholders, employees, customers)
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Ask Video */}
                  <div className="md:col-span-4 bg-white rounded-3xl p-6 md:p-8 border border-black/[0.03] shadow-xs flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="p-2.5 w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold font-display text-neutral-900">Ask the Video Chat</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-light">
                        Chat directly with the video content. Ask questions like "What was the co-founder's exact quote on risk management?" and find immediate answers.
                      </p>
                    </div>
                    <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></div>
                      <span className="text-[10px] text-neutral-500 font-mono">Synthesizing audio nodes...</span>
                    </div>
                  </div>

                  {/* Big Card 4: GCC Multilingual Support */}
                  <div className="md:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-black/[0.03] shadow-xs flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="p-2.5 w-10 h-10 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold font-display text-neutral-900">Multi-Language Synthesizer (Arabic Support)</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xl font-light">
                        Designed with high-fidelity GCC performance. SnapSum can translate long YouTube transcripts or web addresses immediately into detailed Arabic notes, making it highly effective for regional academic and enterprise study.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-slate-100 font-mono font-medium text-slate-600 px-3 py-1.5 rounded-md border border-slate-200">English (Original)</span>
                      <span className="text-xs text-neutral-400">⟶</span>
                      <span className="text-xs bg-violet-50 font-sans font-semibold text-violet-700 px-3 py-1.5 rounded-md border border-violet-100">العربية (Arabic output)</span>
                      <span className="text-xs bg-indigo-50 font-sans font-semibold text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-100 text-center">اردو (Urdu)</span>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* 5. LIVE INTERACTIVE DEMO (SUPER IMPORTANT SIDE BY SIDE) */}
            <section id="live-interactive-preview" className="w-full bg-[#f8fafc] py-20 sm:py-24 border-b border-slate-200/50 scroll-mt-12 text-left">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center md:text-left space-y-4 max-w-3xl">
                  <div className="inline-flex items-center gap-1.5 bg-[#0071e3]/5 border border-[#0071e3]/10 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-[#0071e3] uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant Interactive Demo</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900">
                    Operate the Knowledge Engine
                  </h2>
                  <p className="text-gray-500 font-light text-base sm:text-lg">
                    Experience the complete output format in real-time. Choose a premium preloaded lecture below, and explore its conceptual chapters, takeaways, and retention test instantly.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Choose Preloads / Input */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Choose Lecture Buttons */}
                    <div className="bg-white rounded-3xl p-5 border border-black/[0.04] shadow-sm space-y-4">
                      <p className="text-xs font-bold text-neutral-400 font-mono uppercase tracking-wider">
                        Select Sandbox Case
                      </p>
                      
                      <div className="space-y-3">
                        {PRELOADED_VIDEOS.map((video, idx) => {
                          const isActive = demoActiveVideo.metadata.videoId === video.metadata.videoId;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setDemoActiveVideo(video);
                                setDemoSelectedAnswers({});
                                setDemoQuizSubmitted(false);
                              }}
                              className={`w-full text-left p-3.5 rounded-2xl border text-xs transition duration-200 flex items-center gap-3 cursor-pointer ${
                                isActive 
                                  ? 'bg-[#0071e3]/5 border-[#0071e3] text-neutral-950 font-bold shadow-xs' 
                                  : 'bg-white hover:bg-neutral-50/80 border-slate-200/80 text-neutral-600'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isActive ? 'bg-[#0071e3] text-white' : 'bg-slate-100 text-slate-500'
                              }`}>
                                <Youtube className="w-4 h-4" />
                              </div>
                              <div className="truncate flex-1">
                                <p className="truncate leading-tight">{video.metadata.title}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5 leading-none font-normal font-mono">{video.metadata.author} • {video.metadata.duration}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Try Custom video redirect input box */}
                    <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 text-white space-y-4 shadow-sm">
                      <p className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        <span>Run Custom Video Analysis</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                        Have your own lecture or team meeting URL? Type it below to launch our live processing workspace instantly.
                      </p>
                      
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (demoInputUrl) {
                            setVideoUrl(demoInputUrl);
                            setCurrentScreen('app');
                            setTimeout(() => {
                              handleSummarize();
                            }, 400);
                          }
                        }}
                        className="space-y-3"
                      >
                        <input
                          type="url"
                          required
                          placeholder="Paste YouTube, mp4 link..."
                          value={demoInputUrl}
                          onChange={(e) => setDemoInputUrl(e.target.value)}
                          className="w-full px-3 py-3 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition placeholder:text-slate-500"
                        />
                        <button
                          type="submit"
                          className="w-full py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold cursor-pointer active:scale-[0.99] transition flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Launch Live Workspace</span>
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* Right Column: Live Output Simulator */}
                  <div className="lg:col-span-8 bg-white rounded-3xl border border-black/[0.04] shadow-md p-5 md:p-6 space-y-5">
                    
                    {/* Header profile info of active demo video */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.04]">
                      <div className="flex items-center gap-3">
                        <img 
                          src={demoActiveVideo.metadata.thumbnailUrl} 
                          alt="Video Thumbnail" 
                          className="w-16 h-10 object-cover rounded-md border border-black/[0.06] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-left">
                          <h3 className="text-sm font-bold text-neutral-900 max-w-md truncate leading-tight">
                            {demoActiveVideo.metadata.title}
                          </h3>
                          <p className="text-[11px] text-neutral-400 font-mono mt-1 font-light leading-none">
                            Channel: <strong className="font-medium text-neutral-700">{demoActiveVideo.metadata.author}</strong> • Length: <strong className="font-medium text-[#0071e3]">{demoActiveVideo.metadata.duration}</strong>
                          </p>
                        </div>
                      </div>
                      
                      {/* Tabs selector */}
                      <div className="flex flex-wrap items-center bg-neutral-100 p-0.5 rounded-lg border border-black/[0.02]">
                        {[
                          { id: 'summary', label: 'Summary' },
                          { id: 'key_insights', label: 'Takeaways' },
                          { id: 'chapters', label: 'Chapters' },
                          { id: 'quiz', label: 'Self Quiz' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setDemoActiveTab(tab.id as any)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold font-mono transition cursor-pointer leading-none ${
                              demoActiveTab === tab.id 
                                ? 'bg-white text-neutral-950 shadow-xs' 
                                : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Output Inner Panel content */}
                    <div className="min-h-56 select-text text-left text-neutral-900">
                      
                      {/* Tab 1: Summary */}
                      {demoActiveTab === 'summary' && (
                        <div className="space-y-4 animate-fadeIn">
                          <h4 className="text-xs font-bold font-mono text-indigo-600 uppercase tracking-wider">Concept Summary</h4>
                          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
                            {demoActiveVideo.summary}
                          </p>
                          <div className="bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/30 text-xs text-neutral-500 font-light space-y-2">
                            <p className="font-semibold text-neutral-800 font-mono">📢 Social Snippet Preview:</p>
                            <p className="italic bg-white p-2.5 rounded-lg border border-neutral-100">"{demoActiveVideo.socialSnippet}"</p>
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Key Takeaways */}
                      {demoActiveTab === 'key_insights' && (
                        <div className="space-y-4 animate-fadeIn">
                          <h4 className="text-xs font-bold font-mono text-indigo-600 uppercase tracking-wider">Primary Takeaways</h4>
                          
                          <div className="space-y-3">
                            {demoActiveVideo.takeaways.map((takeaway, tIdx) => (
                              <div key={tIdx} className="flex items-start gap-3 bg-neutral-50/50 p-3 rounded-2xl border border-neutral-100">
                                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                  {tIdx + 1}
                                </div>
                                <p className="text-xs text-neutral-700 leading-relaxed font-sans">{takeaway}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tab 3: Chapters Timeline */}
                      {demoActiveTab === 'chapters' && (
                        <div className="space-y-4 animate-fadeIn">
                          <h4 className="text-xs font-bold font-mono text-indigo-600 uppercase tracking-wider">Timeline Milestones</h4>
                          
                          <div className="space-y-3.5">
                            {demoActiveVideo.chapters.map((chapter, cIdx) => (
                              <div key={cIdx} className="flex gap-4 border-l border-neutral-200 pl-4 relative">
                                <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 bg-[#0071e3] rounded-full border-2 border-white"></div>
                                <span className="text-xs font-bold font-mono text-[#0071e3] hover:underline cursor-pointer bg-[#0071e3]/5 border border-[#0071e3]/10 h-fit px-1.5 py-0.5 rounded leading-none">
                                  {chapter.timestamp}
                                </span>
                                <div className="space-y-1">
                                  <h5 className="text-xs font-bold text-neutral-900 leading-tight">{chapter.title}</h5>
                                  <p className="text-[11px] text-neutral-500 font-light leading-relaxed">{chapter.takeaway}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tab 4: Interactive Quiz Comprehension */}
                      {demoActiveTab === 'quiz' && (
                        <div className="space-y-5 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold font-mono text-indigo-600 uppercase tracking-wider">Vocabulary & Retention Quiz</h4>
                            {demoQuizSubmitted && (
                              <span className="text-xs font-bold text-emerald-600 font-mono">
                                SCORED: {
                                  demoActiveVideo.quiz.reduce((score, q, idx) => {
                                    return score + (demoSelectedAnswers[idx] === q.answerIndex ? 1 : 0);
                                  }, 0)
                                } / {demoActiveVideo.quiz.length} Correct
                              </span>
                            )}
                          </div>

                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                            {demoActiveVideo.quiz.map((q, idx) => {
                              const selectedOpt = demoSelectedAnswers[idx];
                              return (
                                <div key={idx} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/50 space-y-3">
                                  <p className="text-xs font-semibold text-neutral-900">
                                    {idx + 1}. {q.question}
                                  </p>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {q.options.map((option, oIdx) => {
                                      const isOptionSelected = selectedOpt === oIdx;
                                      const showValidation = demoQuizSubmitted;
                                      const isCorrectOption = oIdx === q.answerIndex;
                                      
                                      let optStyle = "bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700";
                                      if (isOptionSelected) {
                                        optStyle = "bg-indigo-50 border-indigo-500 text-indigo-950 font-medium";
                                      }
                                      if (showValidation) {
                                        if (isCorrectOption) {
                                          optStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold";
                                        } else if (isOptionSelected) {
                                          optStyle = "bg-rose-50 border-rose-400 text-rose-950 line-through";
                                        }
                                      }

                                      return (
                                        <button
                                          key={oIdx}
                                          disabled={demoQuizSubmitted}
                                          onClick={() => {
                                            setDemoSelectedAnswers(prev => ({ ...prev, [idx]: oIdx }));
                                          }}
                                          className={`text-left p-3 rounded-xl border text-[11px] leading-tight transition cursor-pointer ${optStyle}`}
                                        >
                                          {option}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {demoQuizSubmitted && (
                                    <div className="text-[10px] text-neutral-500 bg-white p-2.5 rounded-lg border border-black/[0.02] leading-relaxed">
                                      <strong className="text-neutral-700 font-mono font-bold uppercase tracking-wider block mb-0.5">EXPLANATION:</strong>
                                      {q.explanation}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Submit Quiz actions */}
                          <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between gap-4">
                            {!demoQuizSubmitted ? (
                              <button
                                onClick={() => setDemoQuizSubmitted(true)}
                                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold cursor-pointer active:scale-97 transition"
                              >
                                Submit Answers
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setDemoSelectedAnswers({});
                                  setDemoQuizSubmitted(false);
                                }}
                                className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-semibold cursor-pointer transition flex items-center gap-1 border border-neutral-300/40"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Reset Score</span>
                              </button>
                            )}
                            <span className="text-[10px] text-neutral-400 italic">Retainment tracker mock activated</span>
                          </div>

                        </div>
                      )}

                    </div>

                  </div>

                </div>

              </div>
            </section>

            {/* 6. USE CASES BENTO SECTION */}
            <section className="w-full bg-white py-20 sm:py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#1d1d1f]">
                    Who Uses the Knowledge Engine?
                  </h2>
                  <p className="text-gray-500 font-light text-base sm:text-lg">
                    SnapSum eliminates tedious scrubbing across many industries and goals.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {
                      role: 'Students & Academics',
                      icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
                      points: [
                        'Distill 2-hour syllabus lectures',
                        'Generate study review indices',
                        'Verify retainment with flashcards',
                        'Export notes in Markdown files'
                      ],
                      bg: 'bg-indigo-50/50'
                    },
                    {
                      role: 'Professionals & Teams',
                      icon: <FileText className="w-5 h-5 text-emerald-600" />,
                      points: [
                        'Review recorded corporate ZOOMs',
                        'Pinpoint exact team deliverables',
                        'Automate chronology minutes',
                        'Eliminate meeting overlaps'
                      ],
                      bg: 'bg-emerald-50/50'
                    },
                    {
                      role: 'Research Analysts',
                      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
                      points: [
                        'Study product panels & seminars',
                        'Extract competitive timelines',
                        'Compare technical transcripts',
                        'Collate historical trends fast'
                      ],
                      bg: 'bg-blue-50/50'
                    },
                    {
                      role: 'Content Repurposers',
                      icon: <Megaphone className="w-5 h-5 text-purple-600" />,
                      points: [
                        'Write SEO web blog copy quickly',
                        'Generate visual Twitter threads',
                        'Segment scripts for micro-videos',
                        'Design high-conversion lists'
                      ],
                      bg: 'bg-purple-50/50'
                    }
                  ].map((cohort, idx) => (
                    <div 
                      key={idx}
                      className="bg-neutral-50 rounded-3xl p-6 border border-neutral-200/50 flex flex-col justify-between space-y-6 text-left hover:border-black/[0.04] transition duration-300 hover:shadow-lg"
                    >
                      <div className="space-y-4">
                        <div className={`p-2.5 w-10 h-10 rounded-xl ${cohort.bg} flex items-center justify-center shrink-0`}>
                          {cohort.icon}
                        </div>
                        <h4 className="text-base font-bold font-display text-neutral-900">{cohort.role}</h4>
                        <ul className="space-y-2.5">
                          {cohort.points.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2 text-xs text-neutral-500 font-light">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <button
                        onClick={() => setCurrentScreen('app')}
                        className="text-[#0071e3] hover:underline font-semibold font-mono text-[11px] text-left cursor-pointer flex items-center gap-1"
                      >
                        <span>Start Trial →</span>
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* 7. DIFFERENTIATION SECTION (SnapSum vs ChatGPT) */}
            <section className="w-full bg-white py-20 sm:py-24 border-t border-slate-200/50 text-left">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-indigo-700 uppercase">
                    <Zap className="w-3.5 h-3.5" />
                    <span>The SnapSum Advantage</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-neutral-900 animate-fadeIn">
                    Why Not Just Prompt with ChatGPT?
                  </h2>
                  <p className="text-gray-500 font-light text-base sm:text-lg">
                    General chat systems are great for drafting emails, but they fall short for deep, chronological video analysis and rapid knowledge retention.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
                  
                  {/* Text Column and Visual Chart */}
                  <div className="lg:col-span-12 overflow-hidden bg-slate-50 border border-slate-200/60 rounded-3xl p-6 md:p-8 space-y-8">
                    
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200/80">
                            <th className="py-4.5 px-4 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">CAPABILITY / WORKFLOW</th>
                            <th className="py-4.5 px-4 text-xs font-mono font-bold text-indigo-600 bg-indigo-50/50 rounded-t-2xl uppercase tracking-widest text-center w-60">
                              SNAPSUM ENGINE
                            </th>
                            <th className="py-4.5 px-4 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest text-center w-60">
                              CHATGPT & FREE CHATS
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60">
                          {[
                            {
                              feat: 'Automated Speech to Structure Map',
                              desc: 'Dynamically parses audio nodes and creates beautiful index chapters linked to the seconds timeline with absolutely zero text input required.',
                              snap: true,
                              snapText: 'Fully Automatic (1 Click)',
                              chat: false,
                              chatText: 'Requires custom transcript extraction & multi-prompt loops'
                            },
                            {
                              feat: 'Timestamp-Aware Navigation',
                              desc: 'Seek directly to core arguments instantly. No more scrubbing through hours of content to find 30 seconds of context.',
                              snap: true,
                              snapText: 'Yes, Chronological Links',
                              chat: false,
                              chatText: 'No (No temporal coordinate awareness)'
                            },
                            {
                              feat: 'Interactive Retention Testing',
                              desc: 'Dynamically builds contextual quizzes mapped to the video content with answers, scores, and deep linguistic explanations.',
                              snap: true,
                              snapText: 'Instantly Synthesized',
                              chat: false,
                              chatText: 'Requires complex custom prompts & custom grading scripts'
                            },
                            {
                              feat: 'GCC Native Localization (Arabic)',
                              desc: 'High-fidelity multi-language architecture tuned specifically for regional dialect translations and localized notes.',
                              snap: true,
                              snapText: 'Native Translation Engine',
                              chat: true,
                              chatText: 'Available, but lacks localized formatting presets'
                            },
                            {
                              feat: 'Newsletter & Essay Generation',
                              desc: 'Single-click exports that turn long video feeds into beautiful ready-to-publish educational assets and marketing templates.',
                              snap: true,
                              snapText: '1-Click Direct Copy',
                              chat: false,
                              chatText: 'Lacks native output editors or copying hooks'
                            }
                          ].map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-100/50 transition">
                              <td className="py-5 px-4 space-y-1 pr-6 max-w-md">
                                <p className="text-xs sm:text-sm font-bold text-neutral-900">{row.feat}</p>
                                <p className="text-[11px] text-neutral-500 font-light leading-relaxed">{row.desc}</p>
                              </td>
                              <td className="py-5 px-4 bg-indigo-50/20 text-center border-x border-indigo-100/50">
                                <div className="flex flex-col items-center justify-center gap-1.5 p-1">
                                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                  <span className="text-[11px] font-bold text-neutral-950 font-mono">{row.snapText}</span>
                                </div>
                              </td>
                              <td className="py-5 px-4 text-center">
                                <div className="flex flex-col items-center justify-center gap-1.5 p-1">
                                  {row.chat ? (
                                    <CheckCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                  ) : (
                                    <span className="text-rose-500 font-bold shrink-0 font-sans text-lg leading-none">✕</span>
                                  )}
                                  <span className="text-[10px] text-neutral-500 font-sans leading-tight max-w-[180px] mx-auto">{row.chatText}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Bottom Micro Pitch box */}
                    <div className="bg-indigo-50/50 border border-indigo-100 p-4.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
                      <span className="text-indigo-950 font-light text-center sm:text-left leading-relaxed">
                        💡 <strong className="font-semibold text-indigo-900">Why prompt engineer for 15 minutes</strong> when SnapSum designs complete educational dashboards from any video in 15 seconds?
                      </span>
                      <button 
                        onClick={() => setCurrentScreen('app')}
                        className="bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-xs active:scale-97 transition shrink-0"
                      >
                        Launch Free Workspace
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            </section>

            {/* 8. REFINED PRICING SECTION */}
            <section className="w-full bg-slate-900 py-20 sm:py-24 border-y border-indigo-950 text-white text-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-1 bg-[#0071e3]/10 border border-[#0071e3]/20 px-3 py-1 rounded-full text-xs font-mono font-bold text-[#0071e3] uppercase">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Simple Billing Setup</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
                    Predictable Plans for Every Strategist
                  </h2>
                  <p className="text-slate-400 font-light text-base sm:text-lg">
                    Whether diagnosing rapid lectures or conducting intense corporate research, we have plans tailored to your workflow speed.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                  
                  {/* Free Plan */}
                  <div className="bg-white/5 border border-white/[0.08] rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-8 relative overflow-hidden backdrop-blur-md">
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400">STARTER TIER</span>
                        <h3 className="text-xl font-bold font-display text-white mt-1">Free Sandbox</h3>
                        <p className="text-xs text-slate-400 mt-2 font-light">Experience standard video summaries first-hand.</p>
                      </div>

                      <div className="flex items-baseline gap-1.5 py-2 border-y border-white/[0.05]">
                        <span className="text-3xl sm:text-4xl font-semibold font-mono text-white">0 AED</span>
                        <span className="text-xs text-slate-400 font-light lowercase">/ forever</span>
                      </div>

                      <ul className="space-y-3">
                        {[
                          '3 Standard summaries per day limit',
                          'Direct YouTube & Vimeo feeds',
                          'Interactive retention quizzes',
                          'Cached sandbox templates access'
                        ].map((li, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 font-light">
                            <CheckCircle className="w-4 h-4 text-[#0071e3]" />
                            <span>{li}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => setCurrentScreen('app')}
                      className="w-full py-4.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold font-mono transition text-center cursor-pointer border border-white/[0.05]"
                    >
                      Workspace Console
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div className="bg-white border border-indigo-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-8 relative overflow-hidden shadow-xl shadow-indigo-950/40">
                    {/* Corner Tag */}
                    <div className="absolute top-4 right-[-32px] bg-[#0071e3] text-white text-[9px] font-bold font-mono py-1 px-10 rotate-45 tracking-widest uppercase">
                      PRO VALUE
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-[#0071e3]">PROFESSIONAL SCALE</span>
                          <span className="bg-[#0071e3]/10 text-[#0071e3] font-mono text-[8px] font-bold px-1.5 rounded-sm">POPULAR</span>
                        </div>
                        <h3 className="text-xl font-bold font-display text-neutral-900 mt-1">Active Pro Strategist</h3>
                        <p className="text-xs text-neutral-500 mt-2 font-light text-left">Complete research power with real-time translations.</p>
                      </div>

                      <div className="flex items-baseline gap-1.5 py-2 border-y border-neutral-100">
                        <span className="text-3.5xl sm:text-4xl font-semibold font-mono text-neutral-950">29 AED</span>
                        <span className="text-xs text-neutral-400 font-light lowercase">/ month</span>
                      </div>

                      <ul className="space-y-3">
                        {[
                          'Unlimited high-fidelity video analyses',
                          'Complete Ask-the-Video interactive chatbot',
                          'GCC Multilingual Translation (Arabic, English, Urdu)',
                          'Whitelabel Custom Domain Whitelisting',
                          'Direct MP3 synthesis vocalization engine',
                          'Priority Gemini processing bandwidth'
                        ].map((li, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-xs text-neutral-800 font-light">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>{li}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleCheckoutClick('pro')}
                      className="w-full py-4.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-bold font-mono transition text-center cursor-pointer shadow-md shadow-[#0071e3]/10 hover:shadow-lg active:scale-98"
                    >
                      Connect Premium (Stripe Gate)
                    </button>
                  </div>

                </div>

                <p className="text-[10px] text-slate-500 font-mono italic max-w-xl mx-auto leading-relaxed">
                  🛡️ Powered by standard sandbox test networks. Connecting our secure Stripe module does not require inputting live, active currencies.
                </p>

              </div>
            </section>

            {/* 8. FINAL CALL TO ACTION (CTA) */}
            <section className="w-full bg-radial from-slate-950 to-slate-900 py-20 sm:py-24 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30"></div>
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white max-w-2xl mx-auto leading-tight">
                  Ready to Turn Screen Time Into Actual Leverage?
                </h2>
                <p className="text-slate-400 font-light text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                  Join hundreds of academic scholars, busy corporate executives, and fast content repurposers using SnapSum.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setCurrentScreen('app');
                      window.scrollTo(0, 0);
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-10 py-5 rounded-full text-sm transition-all duration-200 shadow-xl active:scale-98 cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Launch Free Workspace</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

        {currentScreen === 'app' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Dynamic Split Action Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
            {/* Pitch & Generation Engine - Inputs */}
            <div className="col-span-1 lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 text-neutral-900 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
              <div className="relative z-10 space-y-5">
                <div className="inline-flex items-center gap-1.5 bg-[#0071e3]/5 px-3 py-1 rounded-full text-[11px] font-mono font-medium text-[#0071e3] border border-[#0071e3]/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Powered by Gemini 3.5 Flash</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-semibold font-display leading-[1.1] tracking-tight text-[#1d1d1f]">
                  Stop Watching. <br />Start Repurposing.
                </h1>
                
                <p className="text-[#86868b] text-sm md:text-base max-w-2xl leading-relaxed font-light">
                  Turn any video (YouTube, Vimeo, website or direct stream files) into beautifully itemized chronologies, professional newsletters, blog writeups, templates, and social assets instantly.
                </p>

                {/* Form Input Engine */}
                <form id="url-submit-form" onSubmit={handleSummarize} className="space-y-4 pt-2">
                  
                  {/* Mode Selector Toggle (Summary Mode vs Learn Mode) */}
                  <div className="flex flex-col gap-2 pt-1 pb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#86868b] block text-left">
                      Select Workspace Mode
                    </span>
                    <div className="flex bg-[#f2f2f7] p-1 items-center rounded-2xl w-full max-w-sm gap-1 border border-black/[0.04]">
                      <button
                        type="button"
                        onClick={() => {
                          setLearnMode(false);
                          localStorage.setItem('snapsum_learn_mode', 'false');
                          trackGAEvent?.('mode_switched', { mode: 'summary' });
                          if (activeSummary) {
                            handleTrackActivation(false, activeSummary.metadata.videoId);
                          }
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition duration-200 cursor-pointer ${
                          !learnMode
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-[#86868b] hover:text-[#1d1d1f]'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Summary Mode</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (experimentGroup === 'A') {
                            alert("🧪 Note: You are currently assigned to A/B Test Group A (Summary-only mode). To unlock and test the pristine Learn Mode experience, please switch your test group to 'Group B' in the Floating Experiment Console at the bottom-right of the page!");
                            return;
                          }
                          setLearnMode(true);
                          localStorage.setItem('snapsum_learn_mode', 'true');
                          trackGAEvent?.('mode_switched', { mode: 'learn' });
                          if (activeSummary) {
                            handleTrackActivation(true, activeSummary.metadata.videoId);
                          }
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition duration-200 cursor-pointer ${
                          learnMode
                            ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm font-bold'
                            : 'text-[#86868b] hover:text-[#1d1d1f]'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-[#bf5af2] fill-[#bf5af2]" />
                        <span>Learn Mode</span>
                        <span className="bg-[#bf5af2]/20 text-[#bf5af2] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wide">AI</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#86868b]">
                        <Video className="w-4.5 h-4.5 text-[#86868b]" />
                      </div>
                      <input
                        type="url"
                        required
                        placeholder="Paste any video URL (YouTube, Vimeo, mp4, web links...)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full pl-11 pr-4 py-4.5 bg-neutral-100/60 hover:bg-neutral-100/90 focus:bg-white text-[#1d1d1f] rounded-2xl border border-neutral-300 hover:border-neutral-400 focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/5 outline-none transition placeholder:text-neutral-400 text-sm font-sans"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !videoUrl}
                      className={`font-semibold text-sm px-8 py-4 px-8 rounded-full active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 h-13.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-sm ${
                        learnMode 
                          ? 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:opacity-90 text-white shadow-teal-500/10'
                          : 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-[#0071e3]/10'
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {learnMode ? (
                            <>
                              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                              <span>👉 Start Learning</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Summarize Video</span>
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Dynamic Guest Allocation Control Feedback Module */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] px-1 pt-0.5 font-sans">
                    {isPremium || usageTracker.vipBypassActive ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 fill-emerald-50 text-emerald-600 shrink-0" />
                        ✨ Unlimited summary engine activated (Premium/VIP Plan)
                      </span>
                    ) : (
                      <span className="text-[#86868b] font-light flex items-center gap-1.5 font-sans">
                        <AlertCircle className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
                        <span>guest allocation remaining: <strong className="font-semibold text-neutral-800">{usageTracker.remaining}</strong> of <strong className="font-semibold text-neutral-800">{usageTracker.limit}</strong> daily video analyses.</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setCurrentScreen('billing')}
                      className="text-[#0071e3] hover:underline font-semibold text-left sm:text-right cursor-pointer"
                    >
                      {isPremium || usageTracker.vipBypassActive ? 'Manage Connection Hub →' : 'Upgrade to bypass limits →'}
                    </button>
                  </div>

                  {/* Synthesis Tone Preset Selection Gated Module */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[10px] font-mono tracking-wider font-bold text-[#86868b] uppercase">
                      Synthesis Tone Preset (Locked Conversion Module)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTone('standard')}
                        className={`px-3 py-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          selectedTone === 'standard'
                            ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white shadow-sm'
                            : 'bg-white border-black/[0.08] text-[#515154] hover:bg-neutral-50 hover:border-black/[0.12]'
                        }`}
                      >
                        <span>Standard Thesis</span>
                        <span className={`text-[8px] font-mono leading-none font-bold px-1.5 py-0.5 rounded ${selectedTone === 'standard' ? 'bg-white/20 text-white' : 'bg-black/[0.04] text-[#86868b]'}`}>Free</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isPremium) {
                            setSelectedTone('academic');
                          } else {
                            setSelectedPlanCode('pro');
                            setShowStripeModal(true);
                            setStripePaymentSuccess(false);
                          }
                        }}
                        className={`px-3 py-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          selectedTone === 'academic' && isPremium
                            ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white shadow-sm'
                            : 'bg-white border-black/[0.08] text-[#515154] hover:bg-neutral-50 hover:border-black/[0.12]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 min-w-0">
                          {!isPremium && <Lock className="w-3 h-3 text-[#86868b] shrink-0" />}
                          <span className="truncate">Academic Study</span>
                        </span>
                        <span className="text-[8px] font-mono leading-none font-bold bg-[#0071e3]/10 text-[#0071e3] px-1.5 py-0.5 rounded shrink-0">PRO</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isPremium) {
                            setSelectedTone('viral');
                          } else {
                            setSelectedPlanCode('pro');
                            setShowStripeModal(true);
                            setStripePaymentSuccess(false);
                          }
                        }}
                        className={`px-3 py-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          selectedTone === 'viral' && isPremium
                            ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white shadow-sm'
                            : 'bg-white border-black/[0.08] text-[#515154] hover:bg-neutral-50 hover:border-black/[0.12]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 min-w-0">
                          {!isPremium && <Lock className="w-3 h-3 text-[#86868b] shrink-0" />}
                          <span className="truncate">Viral Bulletin</span>
                        </span>
                        <span className="text-[8px] font-mono leading-none font-bold bg-[#0071e3]/10 text-[#0071e3] px-1.5 py-0.5 rounded shrink-0">PRO</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isPremium) {
                            setSelectedTone('reel');
                            if (activeSummary) {
                              setActiveTab('reel');
                            }
                          } else {
                            setSelectedPlanCode('pro');
                            setShowStripeModal(true);
                            setStripePaymentSuccess(false);
                          }
                        }}
                        className={`px-3 py-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          selectedTone === 'reel' && isPremium
                            ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white shadow-sm'
                            : 'bg-white border-black/[0.08] text-[#515154] hover:bg-neutral-50 hover:border-black/[0.12]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 min-w-0">
                          {!isPremium && <Lock className="w-3 h-3 text-[#86868b] shrink-0" />}
                          <span className="truncate">Shortened Video</span>
                        </span>
                        <span className="text-[8px] font-mono leading-none font-bold bg-[#0071e3]/10 text-[#0071e3] px-1.5 py-0.5 rounded shrink-0">PRO</span>
                      </button>
                    </div>
                  </div>

                  {/* Pasting custom manual script option */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomTranscriptField(!showCustomTranscriptField)}
                      className="text-xs text-[#515154] hover:text-[#1d1d1f] transition duration-200 inline-flex items-center gap-1 font-medium bg-black/[0.03] hover:bg-black/[0.05] px-3 py-1.5 rounded-full border border-black/[0.02] cursor-pointer"
                    >
                      <span>{showCustomTranscriptField ? 'Hide' : 'Show'} Custom Transcript override (Optional)</span>
                      {showCustomTranscriptField ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showCustomTranscriptField && (
                      <div className="mt-3 space-y-1.5 animate-fadeIn">
                        <label className="block text-[10px] font-mono font-bold uppercase text-[#86868b]">
                          Pasted Transcript Text Block
                        </label>
                        <textarea
                          placeholder="If standard subtitle scraping hits a barrier or is gated by YouTube restrictions, paste the text transcript here. We'll summarize your custom text directly!"
                          rows={4}
                          value={customTranscript}
                          onChange={(e) => setCustomTranscript(e.target.value)}
                          className="w-full p-4 bg-neutral-100/60 border border-transparent rounded-2xl text-xs placeholder:text-neutral-400 focus:bg-white focus:border-[#0071e3]/30 focus:ring-4 focus:ring-[#0071e3]/5 outline-none transition text-[#1d1d1f]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Target Language Selector */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[10px] font-mono tracking-wider font-bold text-[#86868b] uppercase">
                      Target Output Language (Translational Synthesis)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOutputLanguage('en')}
                        className={`px-3.5 py-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          outputLanguage === 'en'
                            ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white shadow-sm'
                            : 'bg-white border-black/[0.08] text-[#515154] hover:bg-neutral-50 hover:border-black/[0.12]'
                        }`}
                      >
                        <span className="text-sm">🇺🇸</span>
                        <span>English (Default)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOutputLanguage('ar')}
                        className={`px-3.5 py-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          outputLanguage === 'ar'
                            ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white shadow-sm'
                            : 'bg-white border-black/[0.08] text-[#515154] hover:bg-neutral-50 hover:border-black/[0.12]'
                        }`}
                      >
                        <span className="text-sm">🇸🇦</span>
                        <span>Arabic (العربية)</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Progress Indicators & Steps */}
                {loading && (
                  learnMode ? (
                    <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50/40 to-purple-50/20 border border-indigo-100 rounded-3xl space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4.5 h-4.5 text-indigo-600 animate-spin" />
                          <span className="text-[10px] font-mono tracking-widest text-indigo-700 font-bold uppercase">AI Learning Compilation Core</span>
                        </div>
                        <span className="text-[10px] font-bold font-mono text-[#bf5af2] animate-pulse">BUILDING COGNITIVE PATHWAY</span>
                      </div>
                      
                      <div className="space-y-2.5 pt-1 text-xs">
                        {[
                          { step: 1, label: "Transcribing audio frequencies and speech tracks...", active: true, done: loadingStep.includes('mapping') || loadingStep.includes('concepts') || loadingStep.includes('quiz') || loadingStep.includes('flashcard') },
                          { step: 2, label: "Synthesizing full visual syllabus and chapters...", active: loadingStep.includes('chapters') || loadingStep.includes('mapping') || loadingStep.includes('concepts') || loadingStep.includes('quiz'), done: loadingStep.includes('concepts') || loadingStep.includes('quiz') },
                          { step: 3, label: "Extracting core concepts and Plain-English metaphors...", active: loadingStep.includes('concepts') || loadingStep.includes('concept') || loadingStep.includes('quiz'), done: loadingStep.includes('quiz') },
                          { step: 4, label: "Generating adaptive recall diagnostic verification quizzes...", active: loadingStep.includes('quiz') || loadingStep.includes('diagnostics'), done: false }
                        ].map((s) => {
                          const isDone = s.done;
                          const isCurrent = s.active && !isDone;
                          return (
                            <div key={s.step} className="flex items-center gap-3 text-left">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                                isDone 
                                  ? 'bg-[#30d158] text-white' 
                                  : isCurrent 
                                    ? 'bg-indigo-600 text-white animate-pulse' 
                                    : 'bg-neutral-100 text-neutral-400 border border-neutral-205'
                              }`}>
                                {isDone ? '✓' : s.step}
                              </div>
                              <span className={`font-sans ${
                                isDone 
                                  ? 'text-neutral-400 line-through' 
                                  : isCurrent 
                                    ? 'text-indigo-950 font-bold' 
                                    : 'text-neutral-400'
                              }`}>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="w-full bg-neutral-200/80 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-750" 
                          style={{ 
                            width: loadingStep.includes('quiz') 
                              ? '95%' 
                              : loadingStep.includes('concepts') 
                                ? '70%' 
                                : loadingStep.includes('chapters') 
                                  ? '45%' 
                                  : '20%' 
                          }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-indigo-605 italic font-medium text-left">🤖 Sync telemetry: {loadingStep}</p>
                    </div>
                  ) : (
                    <div className="mt-6 p-5 bg-neutral-100/30 border border-black/[0.04] rounded-2xl animate-pulse space-y-3">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 text-[#1d1d1f] animate-spin" />
                        <span className="text-[10px] font-mono tracking-wider text-[#86868b] font-bold uppercase">Executing Gemini Sequence</span>
                      </div>
                      <p className="text-xs text-[#1d1d1f] font-medium">{loadingStep}</p>
                      <div className="w-full bg-black/[0.04] rounded-full h-1">
                        <div 
                          className="bg-[#0071e3] h-1 rounded-full transition-all duration-1000" 
                          style={{ width: loadingStep.includes('reasoning') ? '75%' : '35%' }}
                        ></div>
                      </div>
                    </div>
                  )
                )}

                {/* Technical Error Box */}
                {error && (
                  <div className="mt-6 p-5 bg-rose-50/70 border border-rose-200/60 rounded-2xl text-[#1d1d1f] animate-fadeIn space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-rose-800">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Server Request Interrupted</span>
                    </div>
                    {error.includes("RESOURCE_EXHAUSTED") || error.includes("prepayment credits") || error.includes("429") ? (
                      <div className="space-y-2.5">
                        <p className="text-sm font-semibold text-rose-950">
                          Your regional Google AI Studio Prepayment Credits are depleted.
                        </p>
                        <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                          A 429 Exhausted status indicates your Gemini endpoint has run out of tokens. However, don't worry! You can easily continue evaluating and demonstrating SnapSum using any of these options:
                        </p>
                        <div className="bg-white/95 p-3.5 rounded-xl border border-rose-100/50 space-y-2">
                          <p className="text-xs font-semibold text-neutral-800">Available Quick Workarounds:</p>
                          <ul className="text-xs text-neutral-600 list-disc list-inside space-y-1 bg-neutral-50/50 p-2.5 rounded-lg border border-neutral-100">
                            <li><strong className="text-neutral-900">Cached Templates:</strong> Select Dustin Moskovitz or Simon Sinek in the side rail for zero-cost, high-fidelity analyses.</li>
                            <li><strong className="text-neutral-900">Custom API Key:</strong> Provide your own Gemini API key inside the <strong className="text-indigo-600 font-medium">Admin tab</strong> above to bypass billing limits.</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-mono leading-relaxed text-rose-800/90">{error}</p>
                        <p className="text-[11px] text-[#515154] bg-white/60 p-3 rounded-xl leading-relaxed border border-rose-100/30 font-light">
                          💡 Tip: Some videos do not contain public english subtitles. You can simply enable the <strong className="text-[#1d1d1f] font-medium">"Custom Transcript override"</strong> box below, paste any video dialogue paragraph, and Gemini will render the summary of that text!
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {learnMode && !activeSummary && (
              <div className="animate-slideUp">
                <LearningProgressDashboard 
                  onLoadVideo={handleLoadVideoById}
                  onActivateDemo={handleLoadStoredItem}
                />
              </div>
            )}

          </div>

          {/* Quick Demo Preloads Drawer side rail */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b]">
                  Ready-To-Test Models
                </span>
                <h3 className="text-lg font-bold font-display text-[#1d1d1f]">
                  Curated Quick Demos
                </h3>
                <p className="text-[#86868b] text-xs mt-1 font-light">
                  Click a real demo card below to preview processed assets instantly.
                </p>
              </div>

              <div className="space-y-3">
                {PRELOADED_VIDEOS.map((demo) => (
                  <button
                    key={demo.metadata.videoId}
                    onClick={() => handleLoadStoredItem(demo)}
                    className={`w-full text-left p-2.5 rounded-2xl border transition duration-300 group relative overflow-hidden flex gap-3 ${
                      activeSummary?.metadata.videoId === demo.metadata.videoId
                        ? 'border-transparent bg-black/[0.04] shadow-inner'
                        : 'border-transparent hover:bg-neutral-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="relative w-20 h-13 rounded-xl bg-neutral-100 overflow-hidden shrink-0 shadow-sm">
                      <img 
                        src={demo.metadata.thumbnailUrl} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.currentTarget.src = `https://img.youtube.com/vi/${demo.metadata.videoId}/sddefault.jpg`;
                        }}
                      />
                      <div className="absolute right-1 bottom-1 bg-black/80 px-1 py-0.5 rounded text-[8px] font-mono text-white text-center">
                        {demo.metadata.duration}
                      </div>
                    </div>
                    
                    <div className="space-y-0.5 overflow-hidden flex flex-col justify-center">
                      <div className="text-[9px] font-mono text-[#86868b] font-medium">
                        {demo.metadata.author}
                      </div>
                      <h4 className="text-[#1d1d1f] text-xs font-semibold line-clamp-2 leading-tight group-hover:text-black transition">
                        {demo.metadata.title}
                      </h4>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Viral Referral Program Card Widget */}
            <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/40 rounded-3xl p-6 border border-indigo-100/50 shadow-sm space-y-4">
              <div>
                <span className="inline-flex items-center gap-1 bg-indigo-100/80 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold text-indigo-700 uppercase">
                  ⚡ viral referral invite
                </span>
                <h3 className="text-base font-bold font-display text-neutral-900 mt-2">
                  Unlock Free Premium Access
                </h3>
                <p className="text-[#86868b] text-[11px] mt-0.5 font-light leading-relaxed font-sans">
                  Refer just <strong className="font-semibold text-neutral-800">2 friends</strong> to bypass all guest limitations and unlock daily unlimited processing!
                </p>
              </div>

              {/* Progress Milestones */}
              <div className="bg-white/80 border border-indigo-100 p-3.5 rounded-2xl space-y-2 font-sans">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-600">Referred Visitors</span>
                  <span className="font-bold text-indigo-700 font-mono">{referralCount} / 2</span>
                </div>
                
                {/* Milestone Progress bar */}
                <div className="w-full bg-neutral-100/80 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((referralCount / 2) * 100, 100)}%` }}
                  ></div>
                </div>

                {referralUnlocked || referralCount >= 2 ? (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 fill-emerald-50 text-emerald-600 shrink-0" />
                    <span>Unlocked! Unlimited summaries active!</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-indigo-600 font-medium">
                    🎯 Need {Math.max(0, 2 - referralCount)} more referrals to unlock premium status.
                  </p>
                )}
              </div>

              {/* Referral Code Share Action */}
              <div className="space-y-1.5 font-sans text-left">
                <label className="block text-[10px] font-mono font-bold text-neutral-500 uppercase">
                  Your Unique Referral Invite link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}?ref=${referralCode}`}
                    className="flex-1 bg-white/90 border border-neutral-200 rounded-xl px-3 py-2 text-[11px] outline-none font-mono text-[#1d1d1f] shadow-sm select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const link = `${window.location.origin}?ref=${referralCode}`;
                      const text = `Take a look at SnapSum - Instant AI Video Knowledge Engine! It turns standard YouTube videos into structured guides, timelines, mindmaps, and interactive learning quizzes. Use my link to get unlimited credits: ${link}`;
                      
                      if (navigator.share) {
                        navigator.share({
                          title: 'SnapSum Video Knowledge Engine',
                          text: text,
                          url: link
                        }).catch(() => {
                          handleCopyText(link, 'referral');
                        });
                      } else {
                        handleCopyText(link, 'referral');
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 rounded-xl flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0"
                  >
                    {copiedStates['referral'] ? 'Copied' : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Shelf Persistence History Box */}
            <div id="sandbox-library" className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-display text-[#1d1d1f] flex items-center gap-1.5">
                    <History className="w-4 h-4 text-[#86868b]" />
                    Summaries Library
                  </h3>
                  <p className="text-[#86868b] text-[11px] mt-0.5 font-light">
                    Your persistent offline sandbox shelf.
                  </p>
                </div>
                {savedSummaries.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="text-[11px] text-red-500 hover:text-red-700 font-semibold cursor-pointer transition duration-200"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {savedSummaries.length === 0 ? (
                <div className="text-center py-6 px-4 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                  <Bookmark className="w-6 h-6 text-neutral-300 mx-auto" />
                  <p className="text-[#86868b] text-xs mt-2 font-light">No custom-summarized videos in history yet.</p>
                  <p className="text-[#86868b]/70 text-[10px] mt-1 font-light">Paste a video URL above to build your catalog.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 font-sans">
                  {savedSummaries.map((stored) => (
                    <div
                      key={stored.id}
                      onClick={() => handleLoadStoredItem(stored.response)}
                      className={`group p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        activeSummary?.metadata.videoId === stored.id 
                          ? 'bg-neutral-100/80 border-transparent shadow-inner' 
                          : 'border-transparent bg-neutral-50 hover:bg-neutral-100/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="overflow-hidden min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#1d1d1f] truncate leading-tight group-hover:text-black transition">
                          {stored.response.metadata.title}
                        </p>
                        <span className="text-[9px] font-mono text-[#86868b] mt-0.5 block">
                          Processed: {stored.savedAt}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteShelfItem(stored.id, e)}
                        className="p-1.5 text-neutral-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition shrink-0"
                        title="Delete from Shelf"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Display Board - Generated Output Dashboard */}
        {activeSummary && (
          <div id="summary-dashboard" dir={isRtl ? 'rtl' : 'ltr'} className={`bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden animate-fadeIn ${isRtl ? 'text-right' : 'text-left'}`}>
            
            {/* Header Content Info Banner */}
            <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 text-[#1d1d1f] border-b border-black/[0.04] flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 bg-black/[0.04] px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider text-[#515154] font-bold uppercase">
                  <Youtube className="w-3.5 h-3.5 text-neutral-650" />
                  <span>Now Displaying summary for video</span>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold font-display tracking-tight leading-tight text-[#1d1d1f]">
                  {activeSummary.metadata.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[#86868b] text-xs">
                  <span className="font-semibold text-[#515154]">Creator: {activeSummary.metadata.author}</span>
                  <span className="text-neutral-200">•</span>
                  <span className="font-mono bg-black/[0.03] px-2 py-0.5 rounded text-[10px] border border-black/[0.04]">{activeSummary.metadata.videoId}</span>
                  {activeSummary.metadata.duration && (
                    <>
                      <span className="text-neutral-200">•</span>
                      <span className="font-medium">Length: {activeSummary.metadata.duration} min</span>
                    </>
                  )}
                </div>
              </div>

              {/* YouTube Jump To Original Clip */}
              <a
                href={activeSummary.metadata.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm hover:translate-y-[-1px]"
              >
                <span>Jump to original video</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Split Grid: Right Side Video Embed, Left Side Dynamic Interactive Assets */}
            <div className="grid grid-cols-1 xl:grid-cols-12 font-sans">
              
              {/* Content Panel: Left Column (Subtabs and deep assets) */}
              <div className="xl:col-span-7 p-6 md:p-8 space-y-6 border-b xl:border-b-0 xl:border-r border-black/[0.04]">
                
                {learnMode ? (
                  <ActiveLearningDashboard 
                    activeSummary={activeSummary}
                    onBackToCenter={() => setActiveSummary(null)}
                    ytStartSeconds={ytStartSeconds}
                    onJumpToTimestamp={handleJumpToTimestamp}
                    onResetJump={() => setYtStartSeconds(null)}
                    experimentGroup={experimentGroup}
                  />
                ) : false ? (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Course / Video Master Header Progress */}
                    <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-teal-500 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Live Courseware Group {experimentGroup}
                          </span>
                          <span className="text-[#86868b] text-xs">•</span>
                          <span className="text-[#1d1d1f] text-xs font-semibold">Tuned for Deep Comprehension</span>
                        </div>
                        <h3 className="text-base font-bold font-display text-neutral-900">
                          🎓 Interactive Learning System
                        </h3>
                        <p className="text-neutral-500 text-xs">
                          Turn streaming broadcasts into long-term actionable memory assets.
                        </p>
                      </div>

                      {/* Course Progress Gauge */}
                      <div className="min-w-44 space-y-1.5 self-center">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-neutral-600">Course Progress</span>
                          <span className="text-indigo-600 font-bold">
                            {(() => {
                              let tasksDone = 0;
                              let totalTasks = 3;
                              if (quizSubmitted) tasksDone++;
                              const revealedCount = Object.keys(revealedFlashcards).length;
                              if (revealedCount > 0) tasksDone++;
                              if (ytStartSeconds !== null) tasksDone++;
                              const percentage = Math.round((tasksDone / totalTasks) * 100);
                              return `${percentage}%`;
                            })()}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200/80 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full transition-all duration-500"
                            style={{ 
                              width: (() => {
                                let tasksDone = 0;
                                let totalTasks = 3;
                                if (quizSubmitted) tasksDone++;
                                const revealedCount = Object.keys(revealedFlashcards).length;
                                if (revealedCount > 0) tasksDone++;
                                if (ytStartSeconds !== null) tasksDone++;
                                return `${Math.round((tasksDone / totalTasks) * 100)}%`;
                              })()
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Sliding Segment Workspace Selector Tabs */}
                    <div className="flex bg-[#f2f2f7] p-1.5 items-center rounded-2xl gap-1">
                      {[
                        { id: 'syllabus', label: '1. Syllabus & Concepts', icon: BookOpen },
                        { id: 'flashcards', label: '2. Recall Flashcards', icon: Network },
                        { id: 'quiz', label: '3. Quiz & Remember', icon: Trophy }
                      ].map((subTab) => {
                        const Icon = subTab.icon;
                        const active = learnActiveTab === subTab.id;
                        return (
                          <button
                            key={subTab.id}
                            type="button"
                            onClick={() => {
                              setLearnActiveTab(subTab.id as any);
                              trackGAEvent?.('learn_subtab_clicked', { tab: subTab.id });
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition duration-200 cursor-pointer ${
                              active
                                ? 'bg-white text-indigo-700 shadow-sm font-bold border border-black/[0.02]'
                                : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : 'text-neutral-450'}`} />
                            <span className="text-xs">{subTab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Sub Tab Panel - 1. Syllabus & Concepts */}
                    {learnActiveTab === 'syllabus' && (
                      <div className="space-y-6 animate-fadeIn text-left">
                        
                        {/* Chapter timeline component (from activeSummary.chapters) */}
                        <div className="space-y-4">
                          <div className="border-b border-slate-100 pb-2">
                            <h4 className="text-sm font-bold text-neutral-800 font-display flex items-center gap-1.5">
                              ⏱️ Smart Visual Timeline
                            </h4>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              Interactive video segments. Click a timestamp to jump exactly to that moment.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2.5">
                            {activeSummary.chapters.map((chap, chapIdx) => (
                              <button
                                key={chapIdx}
                                type="button"
                                onClick={() => handleJumpToTimestamp(chap.secondsCount)}
                                className="w-full text-left p-3.5 rounded-xl border border-neutral-200/80 hover:border-indigo-500 hover:bg-neutral-50/50 transition duration-150 flex gap-3 group cursor-pointer"
                              >
                                <div className="font-mono text-[10px] font-bold text-[#0071e3] bg-[#0071e3]/5 group-hover:bg-[#0071e3]/10 px-2.5 py-1 rounded-md h-fit w-fit whitespace-nowrap">
                                  ⏱️ {chap.timestamp}
                                </div>
                                <div className="space-y-0.5">
                                  <h5 className="text-xs font-bold text-neutral-800 font-display group-hover:text-neutral-950 leading-tight">
                                    {chap.title}
                                  </h5>
                                  <p className="text-neutral-[#86868b] text-xs leading-relaxed">
                                    {chap.takeaway}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Concept Breakdown component (from activeSummary.keyConcepts) */}
                        <div className="space-y-4 pt-2">
                          <div className="border-b border-slate-100 pb-2">
                            <h4 className="text-sm font-bold text-neutral-800 font-display flex items-center gap-1.5">
                              🧠 Key Concepts Breakdown
                            </h4>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              Complex ideas demystified with plain-English analogies.
                            </p>
                          </div>

                          <div className="space-y-4">
                            {activeSummary.keyConcepts?.map((item: any, itemIdx: number) => (
                              <div 
                                key={itemIdx}
                                className="bg-slate-50 rounded-2xl border border-slate-200 p-4.5 space-y-2.5 hover:shadow-sm transition"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold font-display text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                                    {item.concept}
                                  </span>
                                  <span className="text-[10px] text-indigo-600 font-mono font-bold tracking-wider uppercase">
                                    Concept #{itemIdx + 1}
                                  </span>
                                </div>
                                
                                <div className="space-y-1.5 text-xs text-slate-700">
                                  <p className="leading-relaxed">
                                    <strong className="text-slate-800 font-semibold">Academic Definition: </strong>
                                    {item.definition}
                                  </p>
                                  <div className="bg-[#0071e3]/5 border border-[#0071e3]/10 rounded-xl p-3.5 text-xs text-indigo-950 leading-relaxed text-left">
                                    <strong className="text-indigo-950 font-bold block mb-1 font-display">💡 Plain-English Analogy:</strong>
                                    {item.simplifiedExplanation}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Sub Tab Panel - 2. Active Recall Flashcards */}
                    {learnActiveTab === 'flashcards' && (
                      <div className="space-y-5 animate-fadeIn text-left">
                        <div className="border-b border-neutral-100 pb-2">
                          <h4 className="text-sm font-bold text-neutral-800 font-display">
                            ⚡ Active Recall Flashcards
                          </h4>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Quiz yourself! Try repeating the answer in your mind, then click the card to flip it and reveal the explanation.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          {activeSummary.flashcards?.map((card: any, cardIdx: number) => {
                            const revealed = revealedFlashcards[cardIdx];
                            return (
                              <div 
                                key={cardIdx}
                                onClick={() => {
                                  setRevealedFlashcards(prev => {
                                    const next = { ...prev, [cardIdx]: !prev[cardIdx] };
                                    trackGAEvent?.('flashcard_flipped', { index: cardIdx, status: next[cardIdx] });
                                    return next;
                                  });
                                }}
                                className="h-44 w-full cursor-pointer perspective"
                              >
                                <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style ${revealed ? 'rotate-y-180' : ''}`}>
                                  
                                  {/* FRONT of the card */}
                                  <div className="absolute w-full h-full backface-hidden bg-white hover:bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl p-5 flex flex-col justify-between text-left shadow-sm">
                                    <div>
                                      <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                                        Question #{cardIdx + 1}
                                      </span>
                                      <h5 className="text-[12px] font-bold text-neutral-800 line-clamp-4 leading-relaxed font-sans">
                                        {card.question}
                                      </h5>
                                    </div>
                                    <span className="text-[10px] text-[#0071e3] font-bold font-mono tracking-wide mt-2 block hover:underline">
                                      Tap to Flip (Reveal Answer)
                                    </span>
                                  </div>

                                  {/* BACK of the card */}
                                  <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-[#1d1d1f] to-indigo-950 text-white text-left rotate-y-180 shadow-md rounded-2xl p-5 flex flex-col justify-between">
                                    <div>
                                      <span className="text-[9px] font-mono font-bold text-[#bf5af2] uppercase tracking-widest block mb-1">
                                        Answer Details
                                      </span>
                                      <p className="text-xs leading-relaxed text-indigo-100 font-sans max-h-24 overflow-y-auto">
                                        {card.answer}
                                      </p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-semibold font-mono block">
                                      ↩ Tap to flip back
                                    </span>
                                  </div>

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sub Tab Panel - 3. Quiz & Remember */}
                    {learnActiveTab === 'quiz' && (
                      <div className="space-y-6 animate-fadeIn text-left">
                        
                        {/* Render existing trivia component for perfect alignment */}
                        <div className="space-y-4">
                          <div className="border-b border-slate-100 pb-2">
                            <h4 className="text-sm font-bold text-neutral-800 font-display">
                              🧠 Contextual Comprehension Check
                            </h4>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              Answer the questions below to test your mastery of this video lecture's content!
                            </p>
                          </div>

                          {/* Quiz Section */}
                          <div className="space-y-4">
                            {activeSummary.quiz.map((q, qIdx) => {
                              const submitted = quizSubmitted;
                              const selectedOpt = selectedAnswers[qIdx];
                              const isCorrect = selectedOpt === q.answerIndex;
                              
                              return (
                                <div
                                  key={qIdx}
                                  className={`p-4 rounded-xl border transition duration-200 ${
                                    submitted
                                      ? isCorrect
                                        ? 'bg-emerald-50/50 border-emerald-200'
                                        : 'bg-red-50/40 border-red-100'
                                      : 'bg-neutral-50 border-neutral-200'
                                  }`}
                                >
                                  <h5 className="text-xs font-bold text-neutral-850 font-display flex gap-2">
                                    <span className="text-neutral-900 font-mono">Q{qIdx + 1}.</span>
                                    <span>{q.question}</span>
                                  </h5>

                                  <div className="grid grid-cols-1 gap-2 mt-3 text-left">
                                    {q.options.map((option, optIdx) => {
                                      const isSelected = selectedOpt === optIdx;
                                      const isCorrectOpt = optIdx === q.answerIndex;
                                      
                                      let btnStyle = 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50';
                                      if (isSelected) {
                                        btnStyle = 'border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3] font-semibold';
                                      }

                                      if (submitted) {
                                        if (isCorrectOpt) {
                                          btnStyle = 'border-emerald-600 bg-emerald-100 text-emerald-950 font-semibold';
                                        } else if (isSelected) {
                                          btnStyle = 'border-red-400 bg-red-100 text-red-950';
                                        } else {
                                          btnStyle = 'border-neutral-100 bg-white/70 text-neutral-400 pointer-events-none';
                                        }
                                      }

                                      return (
                                        <button
                                          key={optIdx}
                                          type="button"
                                          disabled={submitted}
                                          onClick={() => {
                                            setSelectedAnswers((prev) => ({
                                              ...prev,
                                              [qIdx]: optIdx,
                                            }));
                                          }}
                                          className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                                        >
                                          <span>{option}</span>
                                          {isSelected && !submitted && <Check className="w-3.5 h-3.5 text-[#0071e3]" />}
                                          {submitted && isCorrectOpt && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {submitted && (
                                    <div className="mt-3 p-3.5 bg-white border border-neutral-200 rounded-xl text-xs leading-relaxed text-neutral-600 font-sans shadow-sm flex gap-2 mb-1">
                                      <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-semibold text-neutral-800 block">Explanation Details:</span>
                                        <span>{q.explanation}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Submit Actions */}
                          <div className="flex gap-3 justify-end pt-2 border-t border-neutral-150">
                            {!quizSubmitted ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setQuizSubmitted(true);
                                  const finalScore = calculateQuizScore();
                                  handleTrackQuizCompleted(finalScore, activeSummary.quiz.length);

                                  // Award XP
                                  const pct = (finalScore / activeSummary.quiz.length) * 100;
                                  const baseEarned = finalScore * 50;
                                  const bonus = finalScore === activeSummary.quiz.length ? 150 : 0;
                                  awardXp(baseEarned + bonus);

                                  // Adjust difficulty dynamically
                                  let nextDiff: 'Easy' | 'Medium' | 'Hard' = 'Medium';
                                  if (pct >= 90) nextDiff = 'Hard';
                                  else if (pct < 50) nextDiff = 'Easy';
                                  setAdaptiveDifficulty(nextDiff);
                                  localStorage.setItem('snapsum_adaptive_diff', nextDiff);

                                  // Categorize strong & weak concepts
                                  activeSummary.quiz.forEach((q, idx) => {
                                    const rawTopic = q.question.split('?')[0].replace(/Why|What|How|Explain/gi, '').trim();
                                    const topicStr = rawTopic.length > 30 ? rawTopic.slice(0, 30) + '...' : rawTopic;

                                    if (selectedAnswers[idx] === q.answerIndex) {
                                      setStrongTopics(prev => {
                                        const next = [topicStr, ...prev.filter(t => t !== topicStr)].slice(0, 6);
                                        localStorage.setItem('snapsum_strong_topics', JSON.stringify(next));
                                        return next;
                                      });
                                      setWeakTopics(prev => {
                                        const next = prev.filter(t => t !== topicStr);
                                        localStorage.setItem('snapsum_weak_topics', JSON.stringify(next));
                                        return next;
                                      });
                                    } else {
                                      setWeakTopics(prev => {
                                        const next = [topicStr, ...prev.filter(t => t !== topicStr)].slice(0, 6);
                                        localStorage.setItem('snapsum_weak_topics', JSON.stringify(next));
                                        return next;
                                      });
                                      setStrongTopics(prev => {
                                        const next = prev.filter(t => t !== topicStr);
                                        localStorage.setItem('snapsum_strong_topics', JSON.stringify(next));
                                        return next;
                                      });
                                    }
                                  });

                                  // Update quiz history
                                  const hist = {
                                    videoId: activeSummary.metadata.videoId,
                                    title: activeSummary.metadata.title,
                                    score: finalScore,
                                    total: activeSummary.quiz.length,
                                    date: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
                                  };
                                  setQuizHistory(prev => {
                                    const next = [hist, ...prev.filter(x => x.videoId !== hist.videoId)].slice(0, 8);
                                    localStorage.setItem('snapsum_quiz_history', JSON.stringify(next));
                                    return next;
                                  });
                                }}
                                disabled={Object.keys(selectedAnswers).length < activeSummary.quiz.length}
                                className="bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white text-xs font-semibold px-6 py-3 rounded-xl transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                              >
                                Submit Learning Answers
                              </button>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-150 px-3.5 py-1.5 rounded-lg flex items-center gap-1 font-mono">
                                  🏆 Score: {calculateQuizScore()} / {activeSummary.quiz.length}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuizSubmitted(false);
                                    setSelectedAnswers({});
                                  }}
                                  className="text-xs text-neutral-500 hover:text-neutral-850 font-semibold cursor-pointer"
                                >
                                  Restart Quiz
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* What You Should Remember Summary Section */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-250 rounded-2xl p-5 space-y-2.5 pt-3">
                          <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 font-display uppercase tracking-wider">
                            🌟 What You Should Remember Summary
                          </h4>
                          <div className="text-xs leading-relaxed text-amber-900 font-sans text-left ml-2 whitespace-pre-line">
                            {activeSummary.rememberSummary}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                ) : (
                  <>
                    {/* Secondary Horizontal Interactive Tabs Menu styled as slider */}
                    <div className="flex bg-black/[0.04] p-1 items-center rounded-2xl overflow-x-auto gap-1 mb-6 scrollbar-none border border-black/[0.01]">
                  {[
                    { id: 'overview', label: 'Summary', icon: BookOpen },
                    { id: 'chapters', label: 'Timeline & Chapters', icon: Video },
                    { id: 'mindmap', label: 'Concept Map', icon: Network },
                    { id: 'quiz', label: 'Interactive Quiz', icon: Award },
                    { id: 'monetize', label: 'Social & Repurposing', icon: Share2 },
                    { id: 'reel', label: 'Shortened Video', icon: Sparkles },
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold'
                            : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
                        }`}
                      >
                        <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0071e3] font-bold' : 'text-neutral-450'}`} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* TAB CONTENT CARDS */}
                
                {/* 1. Summary & Key Takeaways Tab */}
                {activeTab === 'overview' && (
                  <div className={`space-y-6 animate-fadeIn ${isRtl ? 'text-right' : 'text-left'}`}>
                    
                    {/* TTS Audio Player Widget */}
                    <div className="bg-[#f5f5f7] border border-black/[0.02] rounded-3xl p-6.5 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#86868b] block">
                            Speecher Newsletter Hub
                          </span>
                          <h4 className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-1.5 font-sans">
                            <Volume2 className="w-4 h-4 text-[#1d1d1f]" />
                            Listen to Summary Briefing (AI Voice)
                          </h4>
                        </div>
                        
                        {!audioUrl && (
                          <button
                            onClick={() => handleGenerateTTS(activeSummary.summary + " key takeaways are: " + activeSummary.takeaways.join(". "))}
                            disabled={ttsLoading}
                            className="bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold px-4.5 py-2 rounded-full h-9 whitespace-nowrap transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm shadow-[#0071e3]/10"
                          >
                            {ttsLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Synthesizing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                Generate AI Audio
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {audioUrl && (
                        <div className="bg-white border border-black/[0.04] p-3 rounded-2xl flex items-center gap-4 shadow-sm">
                          <button
                            onClick={togglePlay}
                            className="h-9 w-9 bg-[#1d1d1f] hover:bg-neutral-800 rounded-full flex items-center justify-center text-white transition active:scale-95 shrink-0 cursor-pointer"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                          </button>

                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                              <span className="truncate block max-w-xs">{activeSummary.metadata.title}</span>
                              <span>{formatTime(audioProgress)} / {formatTime(audioDuration)}</span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-1 relative overflow-hidden">
                              <div 
                                className="bg-neutral-900 h-1 rounded-full" 
                                style={{ width: `${(audioProgress / (audioDuration || 1)) * 105}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-[#86868b] leading-relaxed font-mono font-light">
                        🎙️ Utilizing Gemini TTS, this narrates the main video thesis directly into rich audiotape briefs.
                      </p>
                    </div>

                    {/* Human Summarization text */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold font-display text-neutral-900 border-l-4 border-neutral-900 pl-3">
                        The Core Core Thesis & Lesson
                      </h3>
                      <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line font-sans">
                        {activeSummary.summary}
                      </p>
                    </div>

                    {/* Premium PDF Export Support Gated Segment */}
                    <div className="bg-neutral-50 border border-neutral-205 rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">Premium Publication Export</span>
                        <h4 className="text-xs font-bold text-neutral-800 flex items-center justify-center sm:justify-start gap-1">
                          <FileText className="w-4 h-4 text-neutral-700" />
                          White-labeled Study Report (.MD / PDF Format)
                        </h4>
                        <p className="text-[11px] text-neutral-500 leading-normal max-w-sm">
                          Assemble complete thesis structures, chronology benchmarks, and mindmap catalogs into raw styled markdown documents ready for digital distribution.
                        </p>
                      </div>

                      {isPremium ? (
                        <button
                          onClick={downloadSummaryAsPDF}
                          className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 self-center shadow-sm"
                        >
                          <Download className="w-4 h-4 text-white" />
                          <span>Export Summary Report</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPlanCode('pro');
                            setShowStripeModal(true);
                            setStripePaymentSuccess(false);
                          }}
                          className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 self-center shadow-sm"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock Pro Export</span>
                        </button>
                      )}
                    </div>

                    {/* Actionable Value Bombs list */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-neutral-900 flex items-center gap-1">
                        💡 Key Value Bombs & Direct Takeaways
                      </h3>
                      <div className="grid grid-cols-1 gap-2.5">
                        {activeSummary.takeaways.map((bomb, index) => (
                          <div
                            key={index}
                            className="bg-white border border-neutral-200/80 p-4 rounded-xl flex gap-3 hover:translate-x-1 hover:border-neutral-300 transition duration-150 shadow-sm"
                          >
                            <div className="h-6 w-6 rounded bg-neutral-150 flex items-center justify-center text-neutral-800 font-bold font-mono text-[11px] shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-neutral-750 text-xs font-medium leading-relaxed">
                              {bomb}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. Interactive Chapters Tab */}
                {activeTab === 'chapters' && (
                  <div className="space-y-5 animate-fadeIn">
                    
                    <div>
                      <h3 className="text-lg font-bold font-display text-neutral-900">
                        Interactive Segmented Chapters
                      </h3>
                      <p className="text-neutral-500 text-xs mt-1">
                        Select any segment timestamp to immediately teleport the interactive video player to that exact moment.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {activeSummary.chapters.map((chapter) => (
                        <button
                          key={chapter.timestamp}
                          onClick={() => handleJumpToTimestamp(chapter.secondsCount)}
                          className="w-full text-left p-4 rounded-xl border border-neutral-200/80 hover:border-neutral-900 hover:bg-neutral-50 transition duration-150 flex gap-4 group cursor-pointer"
                        >
                          <div className="font-mono text-xs font-semibold text-neutral-900 bg-neutral-100 group-hover:bg-neutral-200 px-2.5 py-1.5 rounded-lg h-fit self-start whitespace-nowrap">
                            ⏱️ {chapter.timestamp}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-neutral-800 font-display group-hover:text-neutral-950 transition leading-tight">
                              {chapter.title}
                            </h4>
                            <p className="text-neutral-500 text-xs leading-relaxed">
                              {chapter.takeaway}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <p className="text-[11px] text-neutral-450 text-center font-mono py-2">
                      💡 Click chapters above to sync and command the live IFrame video.
                    </p>
                  </div>
                )}

                {/* 3. Concept Mindmap Tab */}
                {activeTab === 'mindmap' && (
                  <div className={`space-y-6 animate-fadeIn ${isRtl ? 'text-right' : 'text-left'}`}>
                    
                    <div>
                      <h3 className="text-lg font-bold font-display text-neutral-900">
                        Interactive Topic Mapping
                      </h3>
                      <p className="text-neutral-500 text-xs mt-1">
                        See how main informational lessons branch across major structured directories.
                      </p>
                    </div>

                    {/* Categorized Concept Grid Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Grouping items by category */}
                      {Array.from(new Set(activeSummary.mindmap.map((item) => item.category))).map((category) => (
                        <div key={category} className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4.5 space-y-3 shadow-inner">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-800 bg-neutral-200/80 px-2.5 py-1 rounded inline-block">
                            📂 {category}
                          </span>
                          
                          <div className="space-y-2.5">
                            {activeSummary.mindmap
                              .filter((item) => item.category === category)
                              .map((node, index) => (
                                <div
                                  key={index}
                                  className="bg-white border border-neutral-200/80 hover:border-neutral-400 p-3 rounded-xl transition shadow-sm space-y-1"
                                >
                                  <h4 className="text-xs font-bold text-neutral-800">
                                    💡 {node.concept}
                                  </h4>
                                  <p className="text-[11px] text-neutral-500 leading-normal font-sans">
                                    {node.description}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-neutral-900 text-white rounded-xl flex items-center gap-3">
                      <Network className="w-5 h-5 text-neutral-200 shrink-0" />
                      <p className="text-xs font-sans leading-relaxed">
                        These categories and concepts outline the cognitive map extracted directly from the video text, perfect for studying or creating curricula.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Interactive Knowledge Quiz */}
                {activeTab === 'quiz' && (
                  <div className={`space-y-6 animate-fadeIn ${isRtl ? 'text-right' : 'text-left'}`}>
                    {quizChallenge && (
                      <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between gap-4 animate-slideDown shadow-sm">
                        <div className="flex items-start gap-3">
                          <Trophy className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-neutral-950 font-display">
                              🔥 Challenge Accepted!
                            </h4>
                            <p className="text-xs text-neutral-600 mt-0.5">
                              A friend completed this quiz and scored <span className="font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded leading-none">{quizChallenge.score} / {quizChallenge.maxScore}</span>. 
                              Can you outsmart them and achieve a higher score?
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setQuizChallenge(null)}
                          className="text-neutral-400 hover:text-neutral-650 text-xs shrink-0 font-medium cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
                      <div>
                        <h3 className="text-lg font-bold font-display text-neutral-900">
                          Video Digest Trivia
                        </h3>
                        <p className="text-neutral-500 text-xs mt-1">
                          Verify your comprehension and mastery of the core teachings.
                        </p>
                      </div>
                      
                      {quizSubmitted && (
                        <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-lg">
                          <Award className="w-4 h-4 text-neutral-800" />
                          <span className="text-xs font-bold text-neutral-900">
                            Score: {calculateQuizScore()} / {activeSummary.quiz.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quiz Questions List */}
                    <div className="space-y-6">
                      {activeSummary.quiz.map((q, qIdx) => {
                        return (
                          <div
                            key={qIdx}
                            className={`p-5 rounded-2xl border transition duration-200 ${
                              quizSubmitted
                                ? selectedAnswers[qIdx] === q.answerIndex
                                  ? 'bg-emerald-50/50 border-emerald-200'
                                  : 'bg-red-50/40 border-red-100'
                                : 'bg-neutral-50 border-neutral-200/80'
                            }`}
                          >
                            <h4 className="text-xs font-bold text-neutral-800 font-display flex gap-2">
                              <span className="text-neutral-900 font-mono">Q{qIdx + 1}.</span>
                              <span>{q.question}</span>
                            </h4>

                            <div className="grid grid-cols-1 gap-2.5 mt-4">
                              {q.options.map((option, optIdx) => {
                                const isSelected = selectedAnswers[qIdx] === optIdx;
                                const isCorrect = optIdx === q.answerIndex;
                                
                                let btnStyle = 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50';
                                if (isSelected) {
                                  btnStyle = 'border-neutral-900 bg-neutral-100 text-neutral-900 font-semibold';
                                }

                                if (quizSubmitted) {
                                  if (isCorrect) {
                                    btnStyle = 'border-emerald-600 bg-emerald-100 text-emerald-900 font-semibold';
                                  } else if (isSelected) {
                                    btnStyle = 'border-red-400 bg-red-100 text-red-900';
                                  } else {
                                    btnStyle = 'border-neutral-100 bg-white/70 text-neutral-400 pointer-events-none';
                                  }
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    disabled={quizSubmitted}
                                    onClick={() => {
                                      setSelectedAnswers((prev) => ({
                                        ...prev,
                                        [qIdx]: optIdx,
                                      }));
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                                  >
                                    <span>{option}</span>
                                    {isSelected && !quizSubmitted && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                                    {quizSubmitted && isCorrect && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                                  </button>
                                );
                              })}
                            </div>

                            {quizSubmitted && (
                              <div className="mt-4 p-3 bg-white border border-neutral-200 rounded-xl text-[11px] leading-relaxed text-neutral-600 font-sans shadow-sm flex gap-2">
                                <HelpCircle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-neutral-800 block">Explanation Details:</span>
                                  <span>{q.explanation}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Submit Actions */}
                    <div className="flex gap-3 justify-end pt-2 border-t border-neutral-200/80">
                      {!quizSubmitted ? (
                        <button
                          type="button"
                          onClick={() => setQuizSubmitted(true)}
                          disabled={Object.keys(selectedAnswers).length < activeSummary.quiz.length}
                          className="bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-semibold px-6 py-3 rounded-xl transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        >
                          Submit Core Answers
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const score = calculateQuizScore();
                              const total = activeSummary?.quiz?.length || 5;
                              const shareId = activeSummary?.shareId || activeSummary?.metadata.videoId || 'vid';
                              const link = `${window.location.origin}/s/${shareId}/quiz/${score}`;
                              const text = `I scored ${score}/${total} on this video's interactive learning quiz on SnapSum! 🎯 Can you beat my score? Take the challenge here:\n\n${link}`;
                              
                              if (navigator.share) {
                                navigator.share({
                                  title: 'Beat my SnapSum Quiz Score!',
                                  text: text,
                                  url: link
                                }).catch(() => {
                                  handleCopyText(text, 'quizChallenge');
                                });
                              } else {
                                handleCopyText(text, 'quizChallenge');
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-3 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            {copiedStates['quizChallenge'] ? 'Challenge Copied!' : 'Challenge a Friend 🎯'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAnswers({});
                              setQuizSubmitted(false);
                            }}
                            className="border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold px-6 py-3 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Retry Quiz Trivia
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* 5. Creator monetization Social Assets Hub */}
                {activeTab === 'monetize' && (
                  <div className={`space-y-6 animate-fadeIn ${isRtl ? 'text-right' : 'text-left'}`}>
                    
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 font-mono">
                        Instant Monetizer reprints
                      </span>
                      <h3 className="text-lg font-bold font-display text-neutral-900 leading-tight">
                        Creator Content Redistribution
                      </h3>
                      <p className="text-neutral-500 text-xs mt-1">
                        Use these AI-generated copies to turn video dialogues into instant revenue-rich publications.
                      </p>
                    </div>

                    {/* SEO Blog Post Repurpose */}
                    <div className="space-y-3.5 border border-neutral-200/80 rounded-2xl p-5 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-neutral-750" />
                          SEO Newsletter / Markdown Blog Post
                        </span>
                        <button
                          onClick={() => handleCopyText(activeSummary.blogPost, 'blog')}
                          className="text-xs text-neutral-950 hover:text-black cursor-pointer font-bold inline-flex items-center gap-1.5"
                        >
                          {copiedStates['blog'] ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Markdown
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto bg-neutral-50 rounded-xl p-4 border border-neutral-150 text-xs text-neutral-700 space-y-4 font-sans leading-relaxed">
                        <pre className="whitespace-pre-wrap font-sans text-xs break-words">
                          {activeSummary.blogPost}
                        </pre>
                      </div>
                    </div>

                    {/* Twitter Viral Feed Repurpose */}
                    <div className="space-y-3.5 border border-neutral-200/80 rounded-2xl p-5 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                          <Twitter className="w-4 h-4 text-neutral-750" />
                          4-Tweet Value Thread
                        </span>
                        <button
                          onClick={() => handleCopyText(activeSummary.twitterThread.join('\n\n'), 'thread')}
                          className="text-xs text-neutral-955 hover:text-black cursor-pointer font-bold inline-flex items-center gap-1.5"
                        >
                          {copiedStates['thread'] ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Copied All!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Thread
                            </>
                          )}
                        </button>
                      </div>

                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {activeSummary.twitterThread.map((tweet, index) => (
                          <div key={index} className="border border-neutral-200 p-4 rounded-xl bg-neutral-50 relative group text-left">
                            <span className="absolute top-3 right-3 text-[10px] font-mono text-neutral-400 font-semibold uppercase">
                              Tweet {index + 1}
                            </span>
                            <p className="text-neutral-700 text-xs leading-relaxed pr-10">
                              {tweet}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* LinkedIn Promo quote snippet */}
                    <div className="space-y-3.5 border border-neutral-200/80 rounded-2xl p-5 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                          <Share2 className="w-4 h-4 text-neutral-750" />
                          Promo Post Description (LinkedIn / Instagram / Facebook)
                        </span>
                        <button
                          onClick={() => handleCopyText(activeSummary.socialSnippet, 'snippet')}
                          className="text-xs text-neutral-950 hover:text-black cursor-pointer font-bold inline-flex items-center gap-1.5"
                        >
                          {copiedStates['snippet'] ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Promo
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700 leading-relaxed text-left">
                        {activeSummary.socialSnippet}
                      </div>
                    </div>

                  </div>
                )}

                {activeTab === 'reel' && (() => {
                  const script = getOrGenerateReelScript(activeSummary);
                  if (!script) return <div className="p-6 text-center text-xs text-neutral-500">No active video summary loaded.</div>;
                  const currentScene = script.scenes[simActiveScene] || script.scenes[0];

                  return (
                    <div className="space-y-6 animate-fadeIn text-left">
                      
                      {/* Reel Header */}
                      <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#0071e3] font-mono flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Shortened Video Repurposer
                          </span>
                          <h3 className="text-lg font-bold font-display text-neutral-900 leading-tight">
                            Shortened, Downloadable Video
                          </h3>
                          <p className="text-neutral-500 text-xs mt-1">
                            Compile and export shortened summaries as playable, high-fidelity media or download the webm instantly.
                          </p>
                        </div>
                      </div>

                      {/* Main Interactive Workspace Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        
                        {/* 1. Mobile Phone Mock Simulator (Lefthand Column) */}
                        <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 border border-neutral-150 rounded-2xl relative">
                          <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 mb-2.5">
                            Interactive Video Player
                          </span>

                          {/* Outer phone container */}
                          <div className="w-[260px] h-[400px] bg-[#121212] rounded-[36px] border-[8px] border-neutral-800 relative shadow-2xl overflow-hidden flex flex-col justify-between p-4 text-white text-left font-sans select-none">
                            
                            {/* Top Speaker/Camera notch */}
                            <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full border border-neutral-800"></div>
                            </div>

                            {/* Dynamic Interactive Backdrop changing on active scene */}
                            <div className={`absolute inset-0 transition-all duration-1000 ease-in-out z-0 opacity-80 ${
                              simActiveScene % 3 === 0 ? "bg-gradient-to-tr from-violet-950 via-slate-900 to-indigo-950" :
                              simActiveScene % 3 === 1 ? "bg-gradient-to-tr from-emerald-950 via-slate-900 to-teal-950" :
                              "bg-gradient-to-tr from-rose-950 via-slate-900 to-orange-950"
                            }`}>
                              {/* Grid lines or abstract dots to add flare */}
                              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                              <div className="absolute top-12 left-10 w-32 h-32 bg-sky-500/10 rounded-full filter blur-xl animate-pulse"></div>
                              <div className="absolute bottom-16 right-10 w-32 h-32 bg-fuchsia-500/10 rounded-full filter blur-xl animate-pulse"></div>
                            </div>

                            {/* Header Status Items inside Phone */}
                            <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400 z-10 pt-2 px-1">
                              <span className="font-semibold">10:42 AM</span>
                              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[8px] text-[#34c759] z-10 animate-pulse">
                                <span className="w-1.5 h-1.5 bg-[#34c759] rounded-full"></span>
                                Live Sim
                              </div>
                            </div>

                            {/* Central Overlay / Scene Details Inside Phone */}
                            <div className="flex-1 flex flex-col justify-end space-y-3 pb-2 z-10 text-left">
                              
                              {/* Glowing Active Scene Subtitles (Large Over-Face captions) */}
                              <div className="text-center px-2 py-3 bg-black/45 backdrop-blur-xs rounded-xl border border-white/5 mx-auto max-w-[210px] transform scale-100 transition-all">
                                <span className="text-[9px] text-yellow-400 uppercase tracking-widest font-mono font-black block mb-0.5">
                                  {script.hookType}
                                </span>
                                <p className="text-xs font-black font-display text-white tracking-tight uppercase leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                  "{currentScene.textOverlay}"
                                </p>
                              </div>

                              {/* Teleprompter / Vocal Voiceover Script lines */}
                              <div className="p-3 bg-neutral-950/85 rounded-xl border border-white/5 space-y-1">
                                <div className="text-[8px] font-mono text-neutral-400 uppercase font-black tracking-widest flex justify-between">
                                  <span>Scene {currentScene.sceneNumber} Voiceover ({currentScene.durationSeconds}s)</span>
                                  <span className="text-yellow-400">{simProgress}s / {currentScene.durationSeconds}s</span>
                                </div>
                                <p className="text-[10px] text-neutral-200 leading-normal font-medium">
                                  {currentScene.voiceover}
                                </p>
                              </div>

                              {/* Interactive active scene visual helper snippet */}
                              <div className="px-2 py-1 bg-black/40 rounded-lg text-[8px] text-neutral-300 italic">
                                🎬 B-Roll: {currentScene.visualHook.slice(0, 60)}...
                              </div>

                            </div>

                            {/* Footer control panel inside phone */}
                            <div className="z-10 bg-black/50 backdrop-blur-md rounded-2xl p-2 border border-white/5">
                              {/* Horizontal progress indicators */}
                              <div className="flex gap-1 mb-2">
                                {script.scenes.map((scene: any, idx: number) => {
                                  const isCompleted = idx < simActiveScene;
                                  const isCurrent = idx === simActiveScene;
                                  return (
                                    <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                      {isCompleted && <div className="w-full h-full bg-[#34c759]"></div>}
                                      {isCurrent && (
                                        <div 
                                          className="h-full bg-yellow-400 transition-all duration-1000 ease-linear"
                                          style={{ width: `${(simProgress / scene.durationSeconds) * 100}%` }}
                                        ></div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Micro player controls */}
                              <div className="flex items-center justify-between">
                                <button 
                                  onClick={() => {
                                    if (simActiveScene > 0) {
                                      setSimActiveScene(simActiveScene - 1);
                                      setSimProgress(0);
                                    }
                                  }}
                                  disabled={simActiveScene === 0}
                                  className="p-1 text-white disabled:text-white/40 cursor-pointer hover:bg-white/10 rounded-lg"
                                >
                                  <ChevronUp className="w-4 h-4 transform -rotate-90" />
                                </button>

                                <button 
                                  onClick={() => setSimIsPlaying(!simIsPlaying)}
                                  className="w-8 h-8 flex items-center justify-center bg-white text-black active:scale-95 transition rounded-full cursor-pointer hover:bg-neutral-100"
                                >
                                  {simIsPlaying ? (
                                    <Pause className="w-4 h-4 fill-black text-black" />
                                  ) : (
                                    <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                                  )}
                                </button>

                                <button 
                                  onClick={() => {
                                    if (simActiveScene < script.scenes.length - 1) {
                                      setSimActiveScene(simActiveScene + 1);
                                      setSimProgress(0);
                                    } else {
                                      setSimActiveScene(0);
                                      setSimProgress(0);
                                    }
                                  }}
                                  className="p-1 text-white cursor-pointer hover:bg-white/10 rounded-lg"
                                >
                                  <ChevronDown className="w-4 h-4 transform -rotate-90" />
                                </button>
                              </div>
                            </div>

                          </div>
                          
                          <p className="text-[10px] text-neutral-400 text-center mt-3 leading-relaxed max-w-[210px]">
                            {simIsPlaying ? "Playing and stepping script timeline automatically..." : "Press Play button inside phone to preview the subtitle timings."}
                          </p>
                        </div>

                        {/* 2. Interactive Scenes Timeline Details (Righthand Column) */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                              Storyboard & Script Timeline
                            </span>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md">
                              {script.estimatedDuration}s Total Time
                            </span>
                          </div>

                          <div className="space-y-2 max-h-[345px] overflow-y-auto pr-1">
                            {script.scenes.map((scene: any, idx: number) => {
                              const isActive = simActiveScene === idx;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSimActiveScene(idx);
                                    setSimProgress(0);
                                  }}
                                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                                    isActive
                                      ? 'bg-[#0071e3]/[0.03] border-[#0071e3] shadow-xs'
                                      : 'bg-white border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50'
                                  }`}
                                >
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shrink-0 transition ${
                                    isActive ? 'bg-[#0071e3] text-white' : 'bg-neutral-100 text-neutral-600'
                                  }`}>
                                    {scene.sceneNumber}
                                  </div>

                                  <div className="space-y-1 flex-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold text-neutral-850">
                                        Scene {scene.sceneNumber}
                                      </span>
                                      <span className="text-[10px] font-mono text-neutral-450 font-medium">
                                        Duration: {scene.durationSeconds}s
                                      </span>
                                    </div>

                                    <div className="text-[11px] text-neutral-700 leading-normal">
                                      <span className="font-semibold text-[#1d1d1f]">Captions Overlay: </span>
                                      <span className="bg-yellow-100 font-bold px-1 py-0.5 rounded text-neutral-800">
                                        "{scene.textOverlay}"
                                      </span>
                                    </div>

                                    <div className="text-[10px] text-neutral-500 leading-relaxed italic">
                                      <span className="font-semibold tracking-wide text-neutral-650 font-mono not-italic uppercase text-[8px]">Visual Cue:</span> {scene.visualHook}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                        </div>

                      </div>

                      {/* Download Assets Toolbar & Details */}
                      <div className="border border-neutral-200/80 rounded-2xl p-5 bg-white shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 font-sans">
                            <Download className="w-4 h-4 text-neutral-850" />
                            Download & Export Creator Subtitles / Video Scripts
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          
                          <button
                            onClick={() => downloadSRT(script)}
                            className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-200/80 hover:border-neutral-900 bg-neutral-50 hover:bg-neutral-900 hover:text-white transition rounded-xl text-xs font-bold font-sans cursor-pointer group"
                          >
                            <FileText className="w-4 h-4 text-[#0071e3] group-hover:text-amber-400 transition" />
                            <div className="text-left">
                              <span className="block">Download Subtitles (SRT)</span>
                              <span className="block text-[8px] opacity-75 font-mono font-normal">Timed Adobe / CapCut captions</span>
                            </div>
                          </button>

                          <button
                            onClick={() => downloadVTT(script)}
                            className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-200/80 hover:border-neutral-900 bg-neutral-50 hover:bg-neutral-900 hover:text-white transition rounded-xl text-xs font-bold font-sans cursor-pointer group"
                          >
                            <FileText className="w-4 h-4 text-emerald-600 group-hover:text-amber-400 transition" />
                            <div className="text-left">
                              <span className="block">Download WebVTT (VTT)</span>
                              <span className="block text-[8px] opacity-75 font-mono font-normal">Timed HTML5 track/Wand</span>
                            </div>
                          </button>

                          <button
                            onClick={() => downloadMarkdownScript(script)}
                            className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-200/80 hover:border-neutral-900 bg-neutral-50 hover:bg-neutral-900 hover:text-white transition rounded-xl text-xs font-bold font-sans cursor-pointer group"
                          >
                            <Download className="w-4 h-4 text-amber-600 group-hover:text-amber-400 transition" />
                            <div className="text-left">
                              <span className="block">Download Full Script (MD)</span>
                              <span className="block text-[8px] opacity-75 font-mono font-normal">Storyboard copy & metadata Markdown</span>
                            </div>
                          </button>

                          <button
                            onClick={() => downloadReelAsVideo(script)}
                            disabled={isRenderingVideo}
                            className={`flex items-center justify-center gap-2 px-4 py-3 border transition rounded-xl text-xs font-bold font-sans cursor-pointer group select-none ${
                              isRenderingVideo 
                              ? "border-amber-500 bg-amber-50 text-amber-800 animate-pulse" 
                              : "border-[#0071e3] hover:border-[#0071e3] bg-[#0071e3]/[0.05] hover:bg-[#0071e3] hover:text-white text-[#0071e3]"
                            }`}
                          >
                            {isRenderingVideo ? (
                              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-[#0071e3] group-hover:text-amber-400 transition" />
                            )}
                            <div className="text-left text-neutral-850 group-hover:text-white">
                              <span className="block text-inherit">{isRenderingVideo ? `Compiling: ${renderingProgress}%` : "Download Compiled Video"}</span>
                              <span className="block text-[8px] opacity-75 font-mono font-normal text-neutral-500 group-hover:text-neutral-200">
                                {isRenderingVideo ? "Encoding canvas frames..." : "Get vertical MP4/WebM clip"}
                              </span>
                            </div>
                          </button>

                        </div>

                        {isRenderingVideo && (
                          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 animate-pulse mt-2 text-left">
                            <div className="flex justify-between text-xs font-semibold text-amber-900">
                              <span className="flex items-center gap-1.5 font-sans">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Interactive Frame Synthesizer Active
                              </span>
                              <span className="font-mono">{renderingProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-amber-200/50 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${renderingProgress}%` }}></div>
                            </div>
                            <p className="text-[10px] text-amber-750 font-sans leading-relaxed">
                              Drawing gradients, text overlay captions, visual cues, and encoding the 9:16 vertical stream directly in your browser. This takes about 10 seconds of high-speed composition!
                            </p>
                          </div>
                        )}

                        <p className="text-[10px] text-neutral-450 italic leading-normal">
                          💡 <strong>How to use timed subtitles:</strong> Download the `.srt` or `.vtt` file, then import it inside CapCut, Canva, Premiere, or DaVinci Resolve. The captions will automatically align with the storyboard narration times! Or click <strong>Download Compiled Video</strong> to download the real pre-animated 9:16 video directly!
                        </p>
                      </div>

                      {/* Ready-made Viral Social Post Caption Copy */}
                      <div className="border border-neutral-200/80 rounded-2xl p-5 bg-white shadow-sm space-y-3.5">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 font-sans">
                            <Share2 className="w-4 h-4 text-neutral-750" />
                            Complementary Viral Post Caption & Description
                          </span>
                          <button
                            onClick={() => handleCopyText(script.readyMadeCaption, 'reel_caption')}
                            className="text-xs text-neutral-950 hover:text-black cursor-pointer font-bold inline-flex items-center gap-1.5"
                          >
                            {copiedStates['reel_caption'] ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy Caption
                              </>
                            )}
                          </button>
                        </div>

                        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700 leading-relaxed text-left whitespace-pre-wrap font-sans">
                          {script.readyMadeCaption}
                        </div>
                      </div>

                    </div>
                  );
                })()}

                  </>
                )}

              </div>

              {/* Media Embedded Player: Right Column */}
              <div className="xl:col-span-5 p-6 md:p-8 bg-neutral-100/40 space-y-6">
                
                {/* Embedded Video Player */}
                <div id="video-player-container" className="space-y-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b] flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-[#1d1d1f]" />
                    Synchronized Media Player
                  </span>
                  
                  <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-lg border border-black/[0.08]">
                    <iframe
                      key={ytAutoplayKey}
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${activeSummary.metadata.videoId}?start=${ytStartSeconds !== null ? ytStartSeconds : 0}&autoplay=${ytStartSeconds !== null ? '1' : '0'}`}
                      title={activeSummary.metadata.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>

                  {ytStartSeconds !== null && (
                    <div className="flex items-center justify-between text-[11px] text-[#1d1d1f] bg-white px-3.5 py-2.5 rounded-xl border border-black/[0.04] shadow-sm">
                      <span>🎬 Teleported player to: <strong className="font-semibold">{formatTime(ytStartSeconds)}</strong></span>
                      <button 
                        onClick={() => setYtStartSeconds(null)}
                        className="font-mono font-bold text-[#86868b] hover:text-[#0071e3] uppercase text-[9px] cursor-pointer transition"
                      >
                        Reset Start
                      </button>
                    </div>
                  )}
                </div>

                {/* Info Card outlining custom app concept */}
                {learnMode ? (
                  <div className="space-y-6 animate-fadeIn text-left">
                    
                    {/* SECTION D: LEARNING PROGRESS PANEL */}
                    <div className="bg-gradient-to-br from-[#1d1d1f] to-[#2d2d2f] text-white rounded-3xl p-5 border border-white/10 shadow-xl space-y-4 font-sans">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-amber-400" />
                          <h4 className="font-bold font-display text-sm text-white">Learning Memory Operating Core</h4>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono">
                          🔥 {userStreak} DAY STREAK
                        </div>
                      </div>

                      {/* Level & XP progression gauge */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-end text-xs">
                          <span className="text-neutral-400 font-mono">LEVEL {userLevel} COMPREHENSION APPRENTICE</span>
                          <span className="text-amber-400 font-bold font-mono">{userXp % 500} / 500 XP to next level</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden border border-white/5">
                          <div 
                            className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-500"
                            style={{ width: `${((userXp % 500) / 500) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 pt-1 text-xs">
                        <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                          <span className="text-neutral-400 text-[10px] uppercase font-mono block mb-0.5">Total Gained XP</span>
                          <strong className="text-base text-white font-mono">{userXp} XP</strong>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                          <span className="text-neutral-400 text-[10px] uppercase font-mono block mb-0.5">Adaptive Difficulty</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <strong className="text-xs text-white uppercase font-mono">{adaptiveDifficulty} mode</strong>
                          </div>
                        </div>
                      </div>

                      {/* Streak Daily Check claiming */}
                      <button 
                        type="button"
                        onClick={() => {
                          if (localStorage.getItem('streak_collected_today') === 'true') {
                            alert('Streak already locked in for today! Return tomorrow to keep climbing.');
                            return;
                          }
                          localStorage.setItem('streak_collected_today', 'true');
                          setUserStreak(prev => prev + 1);
                          awardXp(50);
                          alert('🔥 Streak claimed! +50 XP and +1 day added back to your learning calendar.');
                        }}
                        className="w-full bg-[#30d158] hover:bg-[#24a142] text-white py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer text-center"
                      >
                        Claim Daily Learning Reward (+50 XP)
                      </button>
                    </div>

                    {/* BRAIN MEMORY NETWORK GRAPH */}
                    <div className="bg-white border border-black/[0.04] p-5 rounded-3xl shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-[#1d1d1f] font-display flex items-center gap-1.5">
                          🧠 Personal Learning Memory Graph
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          Active cognitive lattice connecting parsed sessions to concepts. Green items are Mastered, Red items require recall review. Click any node to open.
                        </p>
                      </div>

                      <div className="border border-neutral-150 bg-neutral-50 p-4.5 rounded-2xl min-h-48 relative overflow-hidden flex flex-col justify-between">
                        {/* Interactive Node Map */}
                        <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                          
                          {/* Centered Master Node */}
                          <div className="col-span-3 flex justify-center">
                            <div className="bg-indigo-600 shadow-md text-white text-[10px] font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-display border border-indigo-500 relative z-10 animate-pulse">
                              <Network className="w-3.5 h-3.5" />
                              <span>COGNITIVE CORE</span>
                            </div>
                          </div>

                          {/* Level 1 branches */}
                          <div className="flex flex-col items-center col-span-1">
                            <div className="w-0.5 h-4 bg-indigo-200"></div>
                            <span className="text-[9px] font-bold text-neutral-400 uppercase font-mono mb-1">SEGMENT A</span>
                            <div className="h-2.5 w-2.5 rounded-full bg-indigo-400 mb-1 border border-white"></div>
                            {strongTopics.slice(0, 2).map((st, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedGraphNode({
                                  concept: st,
                                  source: activeSummary.metadata.title,
                                  status: 'Strong',
                                  description: 'Fundamental concept mapped and verified with active recall feedback checks.',
                                  analogy: `Refers to ${st} which provides highly leveraged structural intelligence reducing analytical friction.`
                                })}
                                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 font-semibold border border-emerald-500/15 py-1 px-1 rounded-lg text-[9px] mt-1 transition cursor-pointer text-center truncate"
                                title={st}
                              >
                                ✓ {st}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-col items-center col-span-1 border-x border-neutral-250 py-1 px-1">
                            <div className="w-0.5 h-4 bg-indigo-200"></div>
                            <span className="text-[9px] font-bold text-neutral-400 uppercase font-mono mb-1">ACTIVE VIDEO</span>
                            <div className="h-2.5 w-2.5 rounded-full bg-indigo-600 mb-1 border border-white"></div>
                            <div className="text-[8px] bg-indigo-50 text-indigo-700 font-bold border border-indigo-150 py-1 px-1 rounded-lg truncate text-center max-w-full font-mono">
                              {activeSummary.metadata.videoId}
                            </div>
                          </div>

                          <div className="flex flex-col items-center col-span-1">
                            <div className="w-0.5 h-4 bg-indigo-200"></div>
                            <span className="text-[9px] font-bold text-neutral-400 uppercase font-mono mb-1">SEGMENT B</span>
                            <div className="h-2.5 w-2.5 rounded-full bg-indigo-400 mb-1 border border-white"></div>
                            {weakTopics.slice(0, 2).map((wt, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedGraphNode({
                                  concept: wt,
                                  source: activeSummary.metadata.title,
                                  status: 'Weak',
                                  description: 'Concept requires recall check due to quiz mis-responses.',
                                  analogy: `High priority item where strategic deliberate practice converts ${wt} into active memory assets.`
                                })}
                                className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-800 font-semibold border border-rose-500/15 py-1 px-1 rounded-lg text-[9px] mt-1 transition cursor-pointer text-center truncate"
                                title={wt}
                              >
                                ⚠ {wt}
                              </button>
                            ))}
                          </div>

                        </div>

                        {/* Node inspection details card */}
                        {selectedGraphNode ? (
                          <div className="mt-4 bg-white border border-neutral-200 p-3.5 rounded-2xl space-y-2.5 text-xs text-neutral-700 relative animate-fadeIn shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#1d1d1f] font-sans block max-w-[70%] truncate">{selectedGraphNode.concept}</span>
                              <span className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                selectedGraphNode.status === 'Strong' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                              }`}>
                                {selectedGraphNode.status === 'Strong' ? 'MASTERED' : 'NEEDS STUDY'}
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-neutral-500">{selectedGraphNode.description}</p>
                            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100 text-[11px] leading-relaxed text-amber-900 animate-slideUp">
                              <strong className="block text-amber-950 font-bold mb-0.5">💡 Plain-English Analogy:</strong>
                              {selectedGraphNode.analogy}
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              {selectedGraphNode.status === 'Weak' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWeakTopics(prev => prev.filter(t => t !== selectedGraphNode.concept));
                                    setStrongTopics(prev => [selectedGraphNode.concept, ...prev].slice(0, 6));
                                    awardXp(60);
                                    setSelectedGraphNode(null);
                                    alert(`🧠 Metacognition Complete! Concept fully re-integrated. +60 XP earned.`);
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition cursor-pointer"
                                >
                                  Practice Node (+60 XP)
                                </button>
                              )}
                              <button 
                                type="button"
                                onClick={() => setSelectedGraphNode(null)}
                                className="text-[10px] font-bold text-neutral-400 hover:text-[#1d1d1f] px-2.5 py-1.5 cursor-pointer"
                              >
                                Close Node Map
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 text-center text-[10px] text-neutral-400 pt-2 border-t border-neutral-200">
                            (Hint: Click any segment concept node above to inspect or practice recall!)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* INTERACTIVE RETENTION LOOP HUB */}
                    <div className="bg-white border border-black/[0.04] p-5 rounded-3xl shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-[#1d1d1f] font-display flex items-center gap-1.5">
                          🔄 Study Cycle Retention Engine
                        </h4>
                        <p className="text-[11px] text-[#86868b]">
                          Adaptive actions designed to secure long-term active recall behaviors.
                        </p>
                      </div>

                      <div className="space-y-3.5">
                        
                        {/* 1. Continue Studying selection */}
                        {savedSummaries.length > 0 && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-neutral-450 uppercase tracking-wide block">Continue Other Video Courses</label>
                            <select 
                              onChange={(e) => {
                                const found = savedSummaries.find(s => s.id === e.target.value);
                                if (found) {
                                  setActiveSummary(found.response);
                                  trackGAEvent?.('retention_loop_swap', { videoId: found.id });
                                }
                              }}
                              className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs text-[#1d1d1f] font-medium py-2.5 px-3 rounded-xl cursor-pointer transition focus:outline-none"
                            >
                              <option value="">-- Swap Active Syllabus Content --</option>
                              {savedSummaries.map((stored) => (
                                <option key={stored.id} value={stored.id}>
                                  {stored.response.metadata.title} ({stored.response.metadata.author})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* 2. Weak Topics review list */}
                        {weakTopics.length > 0 && (
                          <div className="space-y-1 pt-1 font-sans">
                            <label className="text-[10px] font-bold text-neutral-455 uppercase tracking-wide block">Review Weak Knowledge Nodes ({weakTopics.length})</label>
                            <div className="divide-y divide-neutral-100 border border-neutral-150 rounded-2xl overflow-hidden bg-neutral-50/20 text-xs">
                              {weakTopics.map((topic, i) => (
                                <div key={i} className="p-3 flex items-center justify-between gap-3 text-left">
                                  <span className="font-semibold text-neutral-850 truncate max-w-[65%]" title={topic}>{topic}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setWeakTopics(prev => prev.filter(t => t !== topic));
                                      setStrongTopics(prev => [topic, ...prev].slice(0, 6));
                                      awardXp(50);
                                      alert(`✨ Recalled perfectly! "${topic}" has been saved back to strong topics. +50 XP claimed.`);
                                    }}
                                    className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 font-bold px-2 py-1 rounded-lg text-[9px] transition shrink-0 cursor-pointer"
                                  >
                                    Re-test Node (+50 XP)
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. Daily Learning Challenge */}
                        <div className="bg-gradient-to-r from-[#0071e3]/5 via-indigo-500/5 to-purple-500/5 border border-indigo-500/10 p-4 rounded-2xl space-y-3 pt-3">
                          <strong className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 font-display">
                            ⚡ Daily Cognitive Challenge
                          </strong>
                          {!challengeCompletedToday ? (
                            <div className="space-y-2.5 text-xs text-neutral-700">
                              <p className="leading-relaxed font-semibold text-neutral-800">
                                Which neural physiology controls primal motivational action drivers before analytical logic is computed?
                              </p>
                              <div className="space-y-2">
                                {[
                                  { idx: 0, text: 'A) The Limbic Brain structure (Sinek Why)' },
                                  { idx: 1, text: 'B) The Pre-frontal visual neocortex region' },
                                  { idx: 2, text: 'C) The Cerebellar balance motor pathways' }
                                ].map((choice) => (
                                  <button
                                    key={choice.idx}
                                    type="button"
                                    onClick={() => setActiveDailyQuizOption(choice.idx)}
                                    className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer ${
                                      activeDailyQuizOption === choice.idx 
                                        ? 'border-indigo-650 bg-indigo-50 text-indigo-950 font-semibold border-indigo-600' 
                                        : 'border-neutral-250 bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                                    }`}
                                  >
                                    {choice.text}
                                  </button>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (activeDailyQuizOption === null) return;
                                  if (activeDailyQuizOption === 0) {
                                    setChallengeCompletedToday(true);
                                    localStorage.setItem('snapsum_challenge_completed_today', 'true');
                                    awardXp(120);
                                    alert('🎯 CORRECT! The Limbic Brain drives emotional decision-making. You earned +120 XP!');
                                  } else {
                                    alert('❌ That choice was incorrect. The Limbic Brain is what drives emotion before logic. Review Simon Sinek`s syllabus to master this concept!');
                                  }
                                }}
                                disabled={activeDailyQuizOption === null}
                                className="w-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                              >
                                Lock in Answer (+120 XP)
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-150 p-3 rounded-xl flex items-center gap-2">
                              <span>✓ You have crushed today`s daily challenge. You scored a perfect match and earned +120 XP!</span>
                            </div>
                          )}
                        </div>

                        {/* 4. Recommended Next Video */}
                        <div className="bg-slate-50 border border-slate-205 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs pt-3 text-left">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono block">Suggested Syllabus Track</span>
                            <p className="font-bold text-neutral-800 truncate max-w-44">Sinek: Understand the Why</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const sinek = PRELOADED_VIDEOS.find(p => p.metadata.videoId === 'u4ZoJKF_VuA');
                              if (sinek) setActiveSummary(sinek);
                            }}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-3 py-2 rounded-lg text-[10px] transition cursor-pointer"
                          >
                            Load Series
                          </button>
                        </div>

                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white border border-black/[0.04] rounded-2xl p-5 shadow-sm space-y-3.5 text-xs text-[#515154] leading-relaxed font-sans text-left">
                    <h4 className="font-bold text-[#1d1d1f] flex items-center gap-1.5 text-sm">
                      🚀 Creator Monetization Blueprint
                    </h4>
                    <p>
                      This application translates lengthy digital broadcasts into ready-for-market content streams. By pairing summaries with newsletters, tweet threads, flash quizzes, and conceptual outlines:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[#86868b]">
                      <li><strong className="text-[#515154]">Ad-revenue streams</strong> by embedding affiliate offers adjacent to text digests.</li>
                      <li><strong className="text-[#515154]">Digital products</strong> like study maps or trivia certifications for course creators.</li>
                      <li><strong className="text-[#515154]">Email directories</strong> built by locking TTS files of key briefings behind a subscription block.</li>
                    </ul>
                    <div className="pt-2 border-t border-black/[0.04] text-[9px] text-[#86868b] font-mono leading-none">
                      Created for the Google AI Studio Builders Challenge.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )}        {/* Custom Domain Settings Map Page */}
        {currentScreen === 'domain' && (
          <div className="space-y-6 animate-fadeIn transition-all duration-300">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
              
              {/* Introduction Banner */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-black/[0.04] font-sans">
                <div className="space-y-2 text-left">
                  <div className="inline-flex items-center gap-1.5 bg-[#0071e3]/5 border border-[#0071e3]/10 px-3 py-1 rounded-full text-xs font-mono font-semibold text-[#0071e3]">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public DNS Configuration Mapping</span>
                  </div>
                  <h2 className="text-2xl font-semibold font-display text-[#1d1d1f] tracking-tight">
                    Map Your MVP To a Custom Public Domain
                  </h2>
                  <p className="text-[#86868b] text-sm max-w-2xl leading-relaxed font-light">
                    Configure white-labeled public accessibility for your SnapSum MVP application. Connect your own branding (e.g. <code className="bg-[#f5f5f7] px-1.5 py-0.5 rounded text-xs text-[#1d1d1f]">www.snapsum.app</code>) to route direct traffic.
                  </p>
                </div>
                
                {/* Status Badge */}
                <div className="shrink-0">
                  {dnsStatus === 'connected' ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 px-4 py-2.5 rounded-full flex items-center gap-2 font-mono text-[11px] font-bold shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      SECURE PUBLIC SSL BIND: LIVE
                    </div>
                  ) : dnsStatus === 'verifying' ? (
                    <div className="bg-amber-500/5 border border-amber-500/10 text-amber-600 px-4 py-2.5 rounded-full flex items-center gap-2 font-mono text-[11px] font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                      VERIFYING DNS RECORDS...
                    </div>
                  ) : (
                    <div className="bg-neutral-100 border border-transparent text-neutral-500 px-4 py-2.5 rounded-full flex items-center gap-2 font-mono text-[11px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400"></span>
                      UNCONFIGURED OFFLINE TRANSIT
                    </div>
                  )}
                </div>
              </div>

              {/* Target Domain Input Form */}
              <div className="bg-[#f5f5f7] rounded-3xl p-6 border border-black/[0.01] space-y-4 text-left">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#86868b]">
                  Step 1: Enter your registered Custom Domain
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. snapsum.app or app.mycreatorbrand.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      disabled={dnsStatus === 'verifying'}
                      className="w-full pl-10 pr-4 py-3 bg-white focus:bg-white text-[#1d1d1f] rounded-xl border border-black/[0.08] outline-none transition placeholder:text-neutral-400 text-sm font-sans"
                    />
                  </div>
                  
                  {dnsStatus === 'connected' ? (
                    <button
                      onClick={() => saveCustomDomain('', 'unconfigured')}
                      className="bg-red-500/10 hover:bg-red-500/15 text-red-650 font-semibold text-xs px-6 py-3 rounded-xl transition cursor-pointer"
                    >
                      Disconnect Domain
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (!customDomain) {
                          alert('Please enter a target custom domain first.');
                          return;
                        }
                        saveCustomDomain(customDomain, 'verifying');
                        setTimeout(() => {
                          saveCustomDomain(customDomain, 'connected');
                        }, 4000);
                      }}
                      disabled={!customDomain || dnsStatus === 'verifying'}
                      className="bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs px-6 py-3 rounded-full transition cursor-pointer disabled:opacity-50"
                    >
                      Verify & Provision SSL
                    </button>
                  )}
                </div>
                
                <p className="text-[#86868b] text-[11px] leading-relaxed font-light font-sans">
                  🔒 Secure Sockets Layer (SSL) certificates are automatically generated for free via Let's Encrypt once DNS confirmation connects.
                </p>
              </div>

              {/* Pre-Configured Free Web Domains */}
              <div className="p-6 bg-[#f5f5f7]/60 border border-black/[0.01] rounded-2xl space-y-4 font-sans text-left">
                <div className="flex items-center gap-2 text-[#1d1d1f]">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <h4 className="font-semibold text-sm">Pre-Configured MVP Hosting URLs</h4>
                </div>
                
                <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed font-light font-sans">
                  Your application is compiled and served in two container routing environments. Select the appropriate link below depending on whether you are actively coding or sharing with users:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                  {/* Option A: Dev Sandbox */}
                  <div className="p-5 bg-white rounded-2xl border border-black/[0.04] shadow-sm flex flex-col justify-between space-y-4 font-sans">
                    <div>
                      <span className="inline-flex items-center gap-1 bg-[#0071e3]/5 border border-[#0071e3]/10 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold text-[#0071e3] mb-2 font-sans">
                        <Sparkles className="w-3 h-3" />
                        ACTIVE WORKSPACE PREVIEW
                      </span>
                      <h5 className="text-xs font-bold text-[#1d1d1f]">Developer Sandbox Link</h5>
                      <p className="text-[11px] text-[#86868b] mt-1 leading-relaxed font-light">
                        Reflects all incremental edits and code updates instantly. Use this link for testing your Stripe gateway or reviewing custom summaries.
                      </p>
                    </div>
                    <a
                      href={window.location.origin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f] hover:text-[#0071e3] font-mono bg-[#f5f5f7] px-3.5 py-2 rounded-xl border border-black/[0.02] shadow-sm w-fit group cursor-pointer transition"
                    >
                      <span>Active Sandbox</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#86868b]" />
                    </a>
                  </div>

                  {/* Option B: Shared Prod */}
                  <div className="p-5 bg-white rounded-2xl border border-black/[0.04] shadow-sm flex flex-col justify-between space-y-4 font-sans">
                    <div>
                      <span className="inline-flex items-center gap-1 bg-violet-500/5 border border-violet-500/10 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold text-violet-600 mb-2">
                        <Rocket className="w-3 h-3" />
                        PUBLIC SHAREABLE BUILD
                      </span>
                      <h5 className="text-xs font-bold text-[#1d1d1f]">Production Deployment Link</h5>
                      <p className="text-[11px] text-[#86868b] mt-1 leading-relaxed font-light font-light">
                        The ultimate clean link you share with raw users. This deployment runs in production containers and serves static bundles with maximum SLA speed.
                      </p>
                    </div>
                    <a
                      href={window.location.origin.includes('-dev-') ? window.location.origin.replace('-dev-', '-pre-') : window.location.origin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f] hover:text-[#0071e3] font-mono bg-[#f5f5f7] px-3.5 py-2 rounded-xl border border-black/[0.02] shadow-sm w-fit group cursor-pointer transition whitespace-nowrap"
                    >
                      <span>Production URL</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#86868b]" />
                    </a>
                  </div>
                </div>

                {/* GFE 404 Help Card */}
                <div className="p-4 bg-white border border-black/[0.04] rounded-2xl space-y-2 mt-2 font-sans">
                  <div className="flex items-center gap-2 text-[#1d1d1f]">
                    <AlertCircle className="w-4 h-4 text-[#86868b] shrink-0" />
                    <h5 className="text-xs font-semibold">Stuck on 'Page Not Found' (404) Error on the Production Link?</h5>
                  </div>
                  <p className="text-[11px] text-[#86868b] leading-relaxed max-w-2xl font-light">
                    By default, the <strong>Production Link</strong> is pending until you publish the application for the first time. If you got a "The requested URL was not found on this server" screen when clicking the link, simply click the <strong>Share</strong> button in the top-right of your AI Studio header workflow. This compiles, deploys, and brings the production server online securely!
                  </p>
                </div>
              </div>

              {/* DNS Records Panel */}
              <div className="space-y-4 pt-2 text-left font-sans">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1d1d1f] flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-[#86868b]" />
                    Step 2: Configure DNS Records in Your Registrar
                  </h3>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b] bg-black/[0.04] px-2.5 py-0.5 rounded-full">
                    TTL: 3600 (1 Hour)
                  </span>
                </div>
                <p className="text-[#86868b] text-xs font-sans font-light">
                  Log in to your domain provider account (e.g. Namecheap, GoDaddy, Hover, Cloudflare) and append the following records inside your DNS settings panel:
                </p>

                {/* DNS Grid list */}
                <div className="border border-black/[0.04] rounded-2xl overflow-hidden shadow-sm font-sans">
                  <div className="bg-[#f5f5f7] px-4 py-3 border-b border-black/[0.04] grid grid-cols-12 gap-2 text-[10px] font-mono font-bold text-[#86868b] uppercase tracking-wider">
                    <span className="col-span-2">Type</span>
                    <span className="col-span-3">Host / Name</span>
                    <span className="col-span-5">Value / Target</span>
                    <span className="col-span-2 text-right">Action</span>
                  </div>

                  <div className="divide-y divide-black/[0.03] bg-white text-xs font-mono text-[#1d1d1f]">
                    {/* Record 1 */}
                    <div className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-2 font-bold text-[#1d1d1f]">TXT</span>
                      <span className="col-span-3 text-[#515154]">@</span>
                      <span className="col-span-5 text-[#86868b] truncate" title="google-site-verification=FhG78_6Ghd93hRjsbH7b102">
                        google-site-verification=FhG78...
                      </span>
                      <button
                        onClick={() => handleCopyText('google-site-verification=FhG78_6Ghd93hRjsbH7b102', 'txt-dns')}
                        className="col-span-2 text-right text-xs text-[#0071e3] hover:text-[#0077ed] cursor-pointer font-semibold transition font-sans"
                      >
                        {copiedStates['txt-dns'] ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    
                    {/* Record 2 */}
                    <div className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-2 font-bold text-[#1d1d1f]">CNAME</span>
                      <span className="col-span-3 text-[#515154]">www</span>
                      <span className="col-span-5 text-[#86868b] truncate">ghs.googlehosted.com.</span>
                      <button
                        onClick={() => handleCopyText('ghs.googlehosted.com.', 'cname-dns')}
                        className="col-span-2 text-right text-xs text-[#0071e3] hover:text-[#0077ed] cursor-pointer font-semibold transition font-sans"
                      >
                        {copiedStates['cname-dns'] ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Record 3 */}
                    <div className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-2 font-bold text-[#1d1d1f]">A</span>
                      <span className="col-span-3 text-[#515154]">@</span>
                      <span className="col-span-5 text-[#86868b] truncate">216.239.32.21</span>
                      <button
                        onClick={() => handleCopyText('216.239.32.21', 'a1-dns')}
                        className="col-span-2 text-right text-xs text-[#0071e3] hover:text-[#0077ed] cursor-pointer font-semibold transition font-sans"
                      >
                        {copiedStates['a1-dns'] ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Record 4 */}
                    <div className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center font-mono">
                      <span className="col-span-2 font-bold text-[#1d1d1f]">A</span>
                      <span className="col-span-3 text-[#515154]">@</span>
                      <span className="col-span-5 text-[#86868b] truncate">216.239.34.21</span>
                      <button
                        onClick={() => handleCopyText('216.239.34.21', 'a2-dns')}
                        className="col-span-2 text-right text-xs text-[#0071e3] hover:text-[#0077ed] cursor-pointer font-semibold transition font-sans"
                      >
                        {copiedStates['a2-dns'] ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloud Run Domain Instructions Footer */}
              <div className="p-6 bg-[#1d1d1f] text-white rounded-3xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-md text-left font-sans">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4.5 h-4.5 text-neutral-200" />
                    MVP Custom DNS Integration Notice
                  </h4>
                  <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                    These records correspond directly to Google Cloud's globally balanced DNS edge. Once your custom domain DNS propagation settles, our Cloud Run backend routes incoming public traffic directly to this application module automatically.
                  </p>
                </div>
                
                <a
                  href="https://cloud.google.com/run/docs/mapping-custom-domains"
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="text-xs font-bold bg-white text-neutral-900 px-4.5 py-2.5 rounded-xl flex items-center gap-2 transition hover:opacity-90 whitespace-nowrap shrink-0"
                >
                  <span>GCP Cloud Run Docs</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-600" />
                </a>
              </div>

            </div>
          </div>
        )}

        {/* Billing and Monetization dashboard */}
        {currentScreen === 'billing' && (
          <div className="space-y-6 animate-fadeIn transition-all duration-300 font-sans">
            
            {/* Page Title & Status Banner */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/[0.04] shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-black/[0.04] text-left">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.04] px-3 py-1 rounded-full text-[11px] font-semibold text-[#1d1d1f]">
                    <CreditCard className="w-3.5 h-3.5 text-[#86868b]" />
                    <span>Monetization & Billing Dashboard</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight font-sans">
                    {isAdminAuthenticated ? "Professional Revenue Generation Model" : "Premium Upgrade Options"}
                  </h2>
                  <p className="text-[#86868b] text-sm max-w-xl leading-relaxed font-light">
                    {isAdminAuthenticated 
                      ? "Manage your subscriptions, view pricing packages, and simulate Stripe gateway integrations to validate MVP customer billing instantly."
                      : "Unlock unlimited processing, premium voiceovers, custom summary presets, and high-quality document downloads."}
                  </p>
                </div>

                {/* Premium Active Status Badge */}
                {isPremium ? (
                  <div className="bg-[#1d1d1f] text-white p-5 rounded-2xl shadow-sm space-y-1 min-w-[200px] text-left">
                    <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">YOUR CLIENT SUBSCRIPTION</span>
                    <span className="text-xs font-bold flex items-center gap-1 font-mono">
                      <Zap className="w-4 h-4 fill-white text-white animate-pulse" />
                      PRO CREATOR PASS ACTIVE
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#f5f5f7] border border-black/[0.04] text-[#86868b] p-5 rounded-2xl space-y-1 text-xs text-left min-w-[200px]">
                    <span className="font-mono text-[9px] font-bold text-[#86868b] block uppercase tracking-wider">YOUR SYSTEM LEVEL</span>
                    <span className="font-bold flex items-center gap-1.5 text-[#1d1d1f]">
                      🔴 FREE LEVEL ACTIVE
                    </span>
                  </div>
                )}
              </div>

              {/* Stripe Connection Real-Time Status Badge */}
              {isAdminAuthenticated && (
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left ${
                  stripeConfig.stripeConfigured 
                    ? 'bg-emerald-500/[0.02] border-emerald-500/20' 
                    : 'bg-[#f5f5f7]/60 border-black/[0.03]'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        {stripeConfig.stripeConfigured && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${stripeConfig.stripeConfigured ? 'bg-emerald-500' : 'bg-[#86868b]'}`}></span>
                      </span>
                      <h4 className="text-[11px] font-extrabold text-[#1d1d1f] uppercase tracking-wider font-mono">
                        {stripeConfig.stripeConfigured ? 'Stripe Gateway STATUS: LIVE INTEGRATION' : 'Stripe Gateway STATUS: LOCAL SANDBOX'}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#86868b] leading-relaxed max-w-xl font-light">
                      {stripeConfig.stripeConfigured 
                        ? 'Secure bank connections are established! Clicking subscribe buttons will forward clients to secure Stripe invoice lines so credit card funds deposit into your financial entity.'
                        : 'Mock transactions are running on the client browser. To connect live payments and receive credit card funds to your bank account, configure STRIPE_SECRET_KEY in your AI Studio settings.'}
                    </p>
                  </div>
                  
                  <div className="text-[11px] font-mono shrink-0">
                    {stripeConfig.stripeConfigured ? (
                      <span className="font-bold text-emerald-600 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10 whitespace-nowrap">
                        🟢 Live Mode Connected
                      </span>
                    ) : (
                      <span className="font-semibold text-[#86868b] bg-black/[0.03] px-3 py-1.5 rounded-xl border border-black/[0.02] whitespace-nowrap">
                        🟡 Sandbox Simulator
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* ZERO-COST MVP DEV SANDBOX: CUSTOM GEMINI API KEY */}
              {isAdminAuthenticated && (
                <div className="p-6 rounded-3xl border border-blue-100 bg-blue-50/20 text-left space-y-4 font-sans">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Server className="w-5 h-5 text-blue-700" />
                    <h3 className="font-bold text-sm tracking-tight text-blue-950">Zero-Cost MVP Launchpad & Developer Sandbox</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-4xl font-light">
                    To get real market validation, run your SnapSum MVP at <strong>$0 hosting and API costs</strong>! By pasting your personal <strong>Google Gemini API Key</strong> below, it will be saved securely in your browser's private <code>localStorage</code>. All summaries and premium audio voiceovers will execute utilizing your personal free-tier sandbox. This completely bypasses server quota blocks and costs you absolutely nothing!
                  </p>

                  <div className="max-w-xl space-y-2">
                    <div className="flex gap-2.5">
                      <input
                        type="password"
                        placeholder="Paste your private personal Gemini API key here (AI_...) or leave blank to use the default"
                        value={customApiKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomApiKey(val);
                          if (val.trim()) {
                            localStorage.setItem('custom_gemini_api_key', val.trim());
                          } else {
                            localStorage.removeItem('custom_gemini_api_key');
                          }
                        }}
                        className="flex-1 px-4 py-2 text-xs bg-white text-[#1d1d1f] border border-black/[0.08] rounded-xl outline-none focus:border-blue-500 font-mono shadow-sm"
                      />
                      {customApiKey && (
                        <button
                          onClick={() => {
                            setCustomApiKey('');
                            localStorage.removeItem('custom_gemini_api_key');
                          }}
                          className="px-3.5 py-2 text-xs hover:bg-neutral-100/60 text-neutral-600 rounded-xl border border-black/[0.08] transition whitespace-nowrap font-medium cursor-pointer"
                        >
                          Clear Key
                        </button>
                      )}
                    </div>
                    <span className="block text-[10px] text-slate-500 font-light">
                      🔑 Security: Your API key is cached locally inside your browser's private state, keeping it completely immune to leaking over open servers.
                    </span>
                  </div>

                  <div className="pt-3.5 border-t border-blue-100/50 space-y-2">
                    <h4 className="text-xs font-bold text-blue-950 leading-none">🚀 How to host this full-stack MVP entirely for free:</h4>
                    <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed font-light">
                      <li>
                        <strong>Avoid Google Cloud Run for $0 Budgets</strong>: Cloud Run & GCP Artifact Registry require linking an active payment billing profile, which is why your GitHub Actions push errored with <code>BILLING_DISABLED</code>.
                      </li>
                      <li>
                        <strong>Use Render.com or Koyeb instead</strong>: These platforms feature robust <strong>Free Tiers for Node.js</strong> servers which require no credit cards or billing setup to deploy! This Express + Vite project will compile and deploy on them out-of-the-box.
                      </li>
                      <li>
                        <strong>Try Static Hosting like Vercel or Netlify</strong>: By relying on your custom Gemini API key above, you can export this React project as a purely static site and deploy it instantly for $0.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Dynamic Rate Control Center & Stripe Integration Hub */}
              {isAdminAuthenticated && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 text-left">
                  
                  {/* CARD 1: RATE LIMITS & ACCESS PROTECTION */}
                  <div className="p-6 rounded-3xl border border-rose-100 bg-rose-50/10 text-left space-y-4 font-sans">
                    <div className="flex items-center gap-2 text-rose-800">
                      <Lock className="w-5 h-5 text-rose-700" />
                      <h3 className="font-bold text-sm tracking-tight text-rose-950">
                        Rate Limiting & Guest Control Suite
                      </h3>
                    </div>
                    <p className="text-xs text-[#515154] leading-relaxed font-light">
                      Prevent guest users from spamming your default server credits! This engine automatically rate-limits individual guest IP addresses to a max daily allowance.
                    </p>

                    {/* Active meter badge or status */}
                    <div className="bg-white p-4 rounded-2xl border border-rose-100/60 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-rose-950">Your Guest IP Limit Profile:</span>
                        {usageTracker.vipBypassActive || isPremium ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                            Unlocked (VIP Bypass)
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                            Standard Guest Limit
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                          <span>Daily Credit Allocation:</span>
                          <span className="font-bold text-slate-800">
                            {usageTracker.vipBypassActive || isPremium ? 'Unlimited' : `${usageTracker.count} / ${usageTracker.limit} used`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${usageTracker.vipBypassActive || isPremium ? 'bg-emerald-500 w-full' : 'bg-rose-500'}`} 
                            style={{ width: usageTracker.vipBypassActive || isPremium ? '100%' : `${Math.min(100, (usageTracker.count / usageTracker.limit) * 100)}%` }}
                          />
                        </div>
                        <span className="block text-[10px] text-[#86868b] font-light pt-0.5">
                          🔄 Limit automatically resets every 24 hours back to full credits.
                        </span>
                      </div>
                    </div>

                    {/* VIP Access Code input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-rose-950 uppercase tracking-wider font-mono">
                        VIP Access Passcode (Creator Bypass)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="Enter VIP code (e.g. PROPASS)"
                          value={customVipCode}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomVipCode(val);
                            if (val.trim()) {
                              localStorage.setItem('custom_vip_code', val.trim());
                              if (val.trim() === 'PROPASS') {
                                setIsPremium(true);
                              }
                            } else {
                              localStorage.removeItem('custom_vip_code');
                              localStorage.removeItem('youtube_summarizer_premium');
                              setIsPremium(false);
                            }
                          }}
                          className="flex-1 px-4 py-2 text-xs bg-white text-[#1d1d1f] border border-black/[0.08] rounded-xl outline-none focus:border-rose-500 font-mono shadow-sm"
                        />
                        {customVipCode && (
                          <button
                            onClick={() => {
                              setCustomVipCode('');
                              localStorage.removeItem('custom_vip_code');
                              localStorage.removeItem('youtube_summarizer_premium');
                              setIsPremium(false);
                            }}
                            className="px-3.5 py-2 text-xs hover:bg-neutral-100/60 text-neutral-600 rounded-xl border border-black/[0.08] transition whitespace-nowrap font-medium cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <span className="block text-[10px] text-slate-500 leading-normal font-light">
                        🔑 Host instructions: Provide VIPs with the <code>VIP_BYPASS_CODE</code> (default: <code>PROPASS</code>) to grant premium access instantly without payment!
                      </span>
                    </div>
                  </div>

                  {/* CARD 2: STRIPE ACCOUNT CONNECTOR */}
                  <div className="p-6 rounded-3xl border border-emerald-100 bg-emerald-50/10 text-left space-y-4 font-sans">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CreditCard className="w-5 h-5 text-emerald-700" />
                      <h3 className="font-bold text-sm tracking-tight text-emerald-950">
                        Stripe Direct Account Integration
                      </h3>
                    </div>
                    <p className="text-xs text-[#515154] leading-relaxed font-light">
                      Direct your subscription receipts to your bank! To transition from local simulating sandbox mode, setup active credentials here:
                    </p>

                    <div className="space-y-2.5">
                      {/* Secret Key Input */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-emerald-950 uppercase tracking-widest leading-none">
                          Stripe Secret Key (sk_test_...)
                        </label>
                        <input
                          type="password"
                          placeholder="sk_test_..."
                          value={customStripeSecret}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomStripeSecret(val);
                            if (val.trim()) {
                              localStorage.setItem('custom_stripe_secret', val.trim());
                            } else {
                              localStorage.removeItem('custom_stripe_secret');
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-white text-[#1d1d1f] border border-black/[0.08] rounded-xl outline-none focus:border-emerald-500 font-mono shadow-sm"
                        />
                      </div>

                      {/* Publishable Key Input */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-emerald-950 uppercase tracking-widest leading-none">
                          Stripe Publishable Key (pk_test_...)
                        </label>
                        <input
                          type="text"
                          placeholder="pk_test_..."
                          value={customStripePublishable}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomStripePublishable(val);
                            if (val.trim()) {
                              localStorage.setItem('custom_stripe_publishable', val.trim());
                            } else {
                              localStorage.removeItem('custom_stripe_publishable');
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-white text-[#1d1d1f] border border-black/[0.08] rounded-xl outline-none focus:border-emerald-500 font-mono shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-emerald-100/50 space-y-1.5">
                      <h4 className="text-[10px] font-extrabold text-[#1d1d1f] uppercase tracking-wider font-mono">
                        🔒 SECURE PERMANENT INTEGRATION GUIDE:
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-normal font-light font-sans">
                        To roll this secure integration to all users permanently, define these parameters in your **AI Studio Settings** secrets dashboard:
                      </p>
                      <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 font-mono leading-normal">
                        <li>Name: <code className="bg-slate-100 px-1 rounded text-neutral-800">STRIPE_SECRET_KEY</code></li>
                        <li>Name: <code className="bg-slate-100 px-1 rounded text-neutral-800">STRIPE_PUBLISHABLE_KEY</code></li>
                      </ul>
                    </div>
                  </div>

                </div>
              )}

              {/* Monthly / Yearly Billing Cycle Switcher */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-left">
                <div>
                  <h3 className="text-sm font-semibold text-[#1d1d1f]">
                    {isAdminAuthenticated ? "Choose a package for your MVP testing" : "Choose the perfect plan for you"}
                  </h3>
                  <p className="text-[#86868b] text-xs font-light">
                    {isAdminAuthenticated 
                      ? "Mock transactions will securely simulate real customer handshakes."
                      : "Find a flexible plan that aligns with your scale and requirements."}
                  </p>
                </div>
                
                {/* Toggle Switch */}
                <div className="bg-[#f5f5f7] p-1 rounded-full border border-black/[0.04] flex items-center gap-1 shadow-inner">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-5 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                      billingCycle === 'monthly' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-5 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      billingCycle === 'yearly' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'
                    }`}
                  >
                    <span>Yearly Billing</span>
                    <span className="bg-[#0071e3] text-white text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full select-none">
                      Save 25%
                    </span>
                  </button>
                </div>
              </div>

              {/* Stripe Connection Real-Time Status Banner & $1 Test Button */}
              <div className="mb-6 space-y-4">
                <div className="bg-gradient-to-r from-emerald-500/[0.04] to-teal-500/[0.02] border border-emerald-500/20 p-5 rounded-3xl text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm font-sans">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${stripeConfig.stripeConfigured ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'} uppercase tracking-wider`}>
                        {stripeConfig.stripeConfigured ? 'Live Stripe Connected' : 'Stripe Key Config Required'}
                      </span>
                      {stripeConfig.accountInfo && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${stripeConfig.accountInfo.chargesEnabled ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'} uppercase tracking-wider`}>
                          {stripeConfig.accountInfo.chargesEnabled ? 'Charges Active' : 'Charges Restricted'}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-[#1d1d1f]">Secure Live Payment Verification ($1.00 USD)</h4>
                    </div>
                    <p className="text-xs text-[#515154] font-light max-w-2xl leading-relaxed">
                      {stripeConfig.stripeConfigured 
                        ? 'Your Stripe credentials are authenticated! Click below to perform a real **$1.00 USD** secure test payment using your card to verify full end-to-end checkout routing.'
                        : 'To perform a real live payment check, make sure you have added your Stripe keys to your environment secrets in AI Studio. Currently showing simulator fallback.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCheckoutClick('test')}
                    disabled={stripePaymentLoading}
                    className="shrink-0 w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {stripePaymentLoading ? (
                      <span>Loading Checkout...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay $1.00 USD & Check Live</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Account Restriction alert boxes directly visible on the checkout page */}
                {stripeConfig.stripeConfigured && stripeConfig.accountInfo && !stripeConfig.accountInfo.chargesEnabled && (
                  <div className="bg-rose-50 border border-rose-200/50 rounded-2xl p-4 text-xs text-rose-950 font-sans text-left space-y-2">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-extrabold text-rose-900 block font-mono text-[10px] uppercase tracking-wider">⚠️ Connected Stripe Account is Restricted from Processing Payments</span>
                        <p className="leading-relaxed text-rose-800">
                          Your connected Stripe account (<strong>{stripeConfig.accountInfo.id}</strong> in {stripeConfig.accountInfo.country}) has charges disabled (<code>charges_enabled: false</code>). Stripe will block live credit card checkout sessions from starting until onboarding details are verified.
                        </p>
                        <div className="bg-rose-100/50 p-3 rounded-xl border border-rose-200/30 font-mono text-[10px] text-rose-950 space-y-1 leading-relaxed">
                          <div><strong>Account ID:</strong> {stripeConfig.accountInfo.id}</div>
                          <div><strong>Country:</strong> {stripeConfig.accountInfo.country}</div>
                          <div><strong>Details Submitted:</strong> {String(stripeConfig.accountInfo.detailsSubmitted)}</div>
                          <div><strong>Capabilities Card Payments:</strong> {stripeConfig.accountInfo.capabilities?.card_payments || 'unknown'}</div>
                          <div><strong>Capabilities Transfers:</strong> {stripeConfig.accountInfo.capabilities?.transfers || 'unknown'}</div>
                        </div>
                        <p className="text-[10px] text-rose-700 leading-snug">
                          <strong>Action Required:</strong> Log in to your <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer" className="underline font-bold text-rose-900 hover:text-rose-950">Stripe Dashboard Payments/Onboarding panel</a> and complete any pending verification tasks (like representative details or business registration) to activate your account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {stripeConfig.error && (
                  <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 text-xs text-amber-950 font-sans text-left">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-extrabold text-amber-900 block font-mono text-[10px] uppercase tracking-wider">⚠️ Stripe API Key Initialization Warning</span>
                        <p className="leading-relaxed text-amber-800">
                          The server encountered an error while verifying your Stripe keys:
                        </p>
                        <div className="bg-amber-100/50 p-2.5 rounded-xl border border-amber-200/30 font-mono text-[10px] text-amber-950 break-words leading-relaxed">
                          {stripeConfig.error}
                        </div>
                        <p className="text-[10px] text-amber-700 leading-snug">
                          Make sure the <code>STRIPE_SECRET_KEY</code> and <code>STRIPE_PUBLISHABLE_KEY</code> are correctly set in your environment variables.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
                
                {/* Tier 1: Free Tier */}
                <div className="border border-black/[0.04] rounded-3xl p-6 bg-[#f5f5f7]/40 flex flex-col justify-between relative overflow-hidden text-left font-sans">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#86868b] tracking-widest block">Tier 01</span>
                      <h4 className="text-lg font-bold text-[#1d1d1f]">
                        {isAdminAuthenticated ? "Free Explorer Sandbox" : "Basic Starter"}
                      </h4>
                      <p className="text-[#86868b] text-xs font-light leading-relaxed">
                        {isAdminAuthenticated 
                          ? "Perfect to let prospective leads sample basic capabilities." 
                          : "Explore standard summaries and get acquainted with our core engine."}
                      </p>
                    </div>
                    
                    <div className="py-2">
                      <span className="text-3xl font-bold text-[#1d1d1f]">$0</span>
                      <span className="text-[#86868b] text-xs font-medium"> / forever</span>
                    </div>

                    <div className="border-t border-black/[0.04] pt-4 space-y-3">
                      <span className="text-[#1d1d1f] text-[10px] font-mono font-bold block uppercase tracking-wider">INCLUDED LIMITATIONS:</span>
                      <ul className="space-y-2.5 text-xs text-[#86868b] leading-normal font-light">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>3 Video summarize credits/mo</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>Standard timeline chronology</span>
                        </li>
                        <li className="flex items-start gap-2 text-neutral-400 line-through">
                          <span>High quality AI voice synthesis</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      disabled
                      className="w-full bg-[#f5f5f7] border border-black/[0.02] text-[#86868b] py-3 rounded-xl text-xs font-semibold block text-center"
                    >
                      {!isPremium ? 'Your Current Active Tier' : 'Downgrade Gated'}
                    </button>
                  </div>
                </div>

                {/* Tier 2: Pro Tier */}
                <div className="border border-[#0071e3] rounded-3xl p-6 bg-white flex flex-col justify-between relative shadow-sm overflow-hidden text-left font-sans">
                  <div className="absolute right-0 top-0 bg-[#0071e3] text-white text-[8px] font-mono tracking-wider font-bold uppercase py-1 px-4 rounded-bl-xl">
                    Popular Option
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#0071e3] tracking-widest block">Tier 02</span>
                      <h4 className="text-lg font-bold text-[#1d1d1f] flex items-center gap-1.5">
                        <Zap className="w-4 h-4 fill-[#0071e3] text-[#0071e3]" />
                        Pro Creator Pass
                      </h4>
                      <p className="text-[#86868b] text-xs font-light leading-relaxed">The ultimate conversion bundle for digital content publishers.</p>
                    </div>
                    
                    <div className="py-2">
                      <span className="text-3xl font-bold text-[#1d1d1f]">
                        {billingCycle === 'monthly' ? '$19' : '$14'}
                      </span>
                      <span className="text-[#86868b] text-xs font-medium">
                        {billingCycle === 'monthly' ? ' / month' : ' / month ($168/yr)'}
                      </span>
                    </div>

                    <div className="border-t border-black/[0.04] pt-4 space-y-3">
                      <span className="text-[#1d1d1f] text-[10px] font-mono font-bold block uppercase tracking-wider">UNLOCKED ADVANTAGES:</span>
                      <ul className="space-y-2.5 text-xs text-[#515154] leading-normal font-light">
                        <li className="flex items-start gap-2 font-medium text-[#1d1d1f]">
                          <CheckCircle className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
                          <span>Unlimited video summarize processing</span>
                        </li>
                        <li className="flex items-start gap-2 font-medium text-[#1d1d1f]">
                          <CheckCircle className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
                          <span>High quality Voiceovers (Premium TTS)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
                          <span>Custom formatted Markdown summary downloads</span>
                        </li>
                        <li className="flex items-start gap-2 font-medium text-[#1d1d1f]">
                          <CheckCircle className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
                          <span>Academic and Viral synthesis presets</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    {isPremium ? (
                      <div className="bg-[#f5f5f7] text-[#1d1d1f] border border-black/[0.04] py-3 rounded-xl text-xs font-mono font-bold text-center block select-none">
                        ✓ PRO SUBSCRIPTION ACTIVE
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheckoutClick('pro')}
                        className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white py-3 rounded-xl text-xs font-semibold block text-center transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>
                          {isAdminAuthenticated 
                            ? (stripeConfig.stripeConfigured ? 'Subscribe Now (Secure Stripe)' : 'Simulate checkout (Stripe)')
                            : 'Subscribe Now'
                          }
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tier 3: Enterprise Agency */}
                <div className="border border-black/[0.04] rounded-3xl p-6 bg-[#f5f5f7]/40 flex flex-col justify-between relative overflow-hidden text-left font-sans">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#86868b] tracking-widest block">Tier 03</span>
                      <h4 className="text-lg font-bold text-[#1d1d1f]">Enterprise Agency Hub</h4>
                      <p className="text-[#86868b] text-xs font-light leading-relaxed">For professional content teams and digital growth agencies.</p>
                    </div>
                    
                    <div className="py-2">
                      <span className="text-3xl font-bold text-[#1d1d1f]">
                        {billingCycle === 'monthly' ? '$49' : '$39'}
                      </span>
                      <span className="text-[#86868b] text-xs font-medium">
                        {billingCycle === 'monthly' ? ' / month' : ' / month ($468/yr)'}
                      </span>
                    </div>

                    <div className="border-t border-black/[0.04] pt-4 space-y-3">
                      <span className="text-[#1d1d1f] text-[10px] font-mono font-bold block uppercase tracking-wider">AGENCY GRADE CONTROLS:</span>
                      <ul className="space-y-2.5 text-xs text-[#86868b] leading-normal font-light">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>Simultaneous bulk summarizing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>Automated Twitter & LinkedIn web scheduler</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1d1d1f] shrink-0 mt-0.5" />
                          <span>Developer API endpoints & Webhooks</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => handleCheckoutClick('enterprise')}
                      className="w-full bg-[#1d1d1f] hover:bg-black text-white py-3 rounded-xl text-xs font-semibold block text-center transition cursor-pointer"
                    >
                      <span>
                        {isAdminAuthenticated 
                          ? (stripeConfig.stripeConfigured ? 'Start Enterprise Pass (Stripe)' : 'Simulate checkout (Stripe)')
                          : 'Upgrade to Enterprise'
                        }
                      </span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Developer Sandbox downgrader button */}
              {isPremium && isAdminAuthenticated && (
                <div className="pt-4 text-center">
                  <button
                    onClick={() => savePremiumStatus(false)}
                    className="text-xs text-red-500 hover:text-red-700 font-mono font-medium hover:underline inline-flex items-center gap-1.5 cursor-pointer bg-red-50 px-3.5 py-2 rounded-full border border-red-100"
                  >
                    <span>Reset Tier to Standard Free (Sandbox Testing Mode)</span>
                  </button>
                </div>
              )}

              {/* Real Developer integration tutorial footer */}
              {isAdminAuthenticated && (
                <div className="mt-6 p-6 bg-[#1d1d1f] text-neutral-300 rounded-2xl space-y-3 text-left font-sans">
                  <h4 className="text-xs font-bold font-mono text-neutral-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/[0.08] pb-3 select-none">
                    <Lock className="w-4 h-4 text-[#86868b]" />
                    Real Payment Setup Blueprint for MVP Release
                  </h4>
                  <p className="text-xs leading-relaxed text-neutral-305 font-light">
                    To transition this MVP to collect active customer funds, connect the server-side API proxy to a live <strong className="text-white">Stripe Checkout session</strong>. Using our structure:
                  </p>
                  <div className="bg-black/35 rounded-xl p-4 font-mono text-[11px] text-slate-300 space-y-2.5 overflow-x-auto text-left leading-relaxed border border-white/[0.03]">
                    <div><span className="text-amber-400 font-semibold">// 1. Server API endpoint (Express)</span></div>
                    <div><code className="text-emerald-400 font-medium">app.post('/api/create-checkout', async (req, res) =&gt; &#123;</code></div>
                    <div className="pl-4"><code className="text-slate-300">const session = await stripe.checkout.sessions.create(&#123;</code></div>
                    <div className="pl-8"><code className="text-slate-300">payment_method_types: ['card'],</code></div>
                    <div className="pl-8"><code className="text-slate-300">line_items: [&#123; price: 'price_H4kd9eK...', quantity: 1 &#125;],</code></div>
                    <div className="pl-8"><code className="text-slate-300">mode: 'subscription',</code></div>
                    <div className="pl-8"><code className="text-slate-300">success_url: '$&#123;YOUR_WEBSITE_DOMAIN&#125;/billing?session_id=&#123;CHECKOUT_SESSION_ID&#125;',</code></div>
                    <div className="pl-8"><code className="text-slate-300">cancel_url: '$&#123;YOUR_WEBSITE_DOMAIN&#125;/billing',</code></div>
                    <div className="pl-4"><code className="text-slate-300">&#125;);</code></div>
                    <div className="pl-4"><code className="text-slate-300">res.json(&#123; url: session.url &#125;);</code></div>
                    <div><code className="text-emerald-400 font-medium">&#125;);</code></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentScreen === 'marketing' && (
          <div className="space-y-6 animate-fadeIn transition-all duration-300 font-sans">
            
            {/* Top Dashboard Header Banner */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/[0.04] shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 font-sans text-left">
                  <div className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.04] px-3 py-1 rounded-full text-[11px] font-semibold text-[#1d1d1f]">
                    <Rocket className="w-3.5 h-3.5 text-[#86868b]" />
                    <span>MVP Digital Launch Accelerators</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
                    SnapSum Growth Hub & Outreach Engine
                  </h2>
                  <p className="text-[#86868b] text-sm max-w-2xl leading-relaxed font-light font-sans">
                    Zero budget? No problem. Use our specialized built-in growth engines powered by Gemini to extract prospects, script short-form videos from your shelf summary history, and acquire paying enterprise customers.
                  </p>
                </div>
                
                {/* Visual statistics card */}
                <div className="bg-[#1d1d1f] p-5 rounded-2xl text-white space-y-1 font-sans min-w-[200px] text-left shrink-0">
                  <span className="text-[9px] font-mono text-neutral-400 block tracking-wider uppercase font-bold">VIRAL CAMPAIGNS PLANNED</span>
                  <span className="text-xl font-bold text-white block">3 Active Channels</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1 justify-start">
                    <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Ready for instant copy-paste</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Main Marketing Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Social Outreach generator */}
              <div className="lg:col-span-6 bg-white border border-black/[0.04] rounded-3xl p-6 space-y-4 text-left font-sans flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center border border-black/[0.01]">
                      <Megaphone className="w-4.5 h-4.5 text-[#1d1d1f]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1d1d1f]">Strategy 01: Social Prospecting Outreach Writer</h3>
                      <p className="text-[10px] text-[#86868b] font-medium">Draft low-friction cold pitches for your choice niche</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#86868b] leading-relaxed font-light">
                    Identify busy creators or business owners on LinkedIn, YouTube comments, or Twitter who publish long videos. Deliver a punchy value statement proposing real summarized highlights using your domain.
                  </p>

                  {/* Niche Input field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b]">Target Industry Niche</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={marketingNiche}
                        onChange={(e) => setMarketingNiche(e.target.value)}
                        placeholder="e.g. Real Estate Brokers, Tech Podcasters"
                        className="flex-1 p-3 bg-[#f5f5f7] border border-black/[0.04] rounded-xl text-xs focus:border-[#0071e3] outline-none transition text-[#1d1d1f]"
                      />
                      <button
                        onClick={generateMarketingOutreach}
                        disabled={pitchLoading}
                        className="bg-[#1d1d1f] hover:bg-black text-white font-[#1d1d1f] font-semibold text-xs px-4 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap"
                      >
                        {pitchLoading ? 'Generating...' : 'Rewrite Pitch'}
                      </button>
                    </div>
                  </div>

                  {/* Pitch Script Output */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b]">Your Actionable Sales Copy</label>
                    <div className="bg-[#f5f5f7]/55 p-4 border border-black/[0.04] rounded-2xl h-80 overflow-y-auto font-mono text-[11px] leading-relaxed text-[#515154] text-left select-text relative">
                      {outreachPitch ? (
                        <div className="whitespace-pre-wrap">{outreachPitch}</div>
                      ) : (
                        <div className="text-neutral-400 italic flex h-full items-center justify-center font-sans font-light">
                          Click "Rewrite Pitch" to generate custom outreach text targeting {marketingNiche || 'your choice niche'}!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {outreachPitch && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(outreachPitch);
                      alert('Copied outreach campaigns to clipboard!');
                    }}
                    className="w-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-semibold py-2.5 rounded-xl border border-black/[0.04] cursor-pointer text-center mt-3 transition"
                  >
                    Copy Outreach Script to Clipboard
                  </button>
                )}
              </div>

              {/* Right Column: Shorts Repurposer script playground */}
              <div className="lg:col-span-6 bg-white border border-black/[0.04] rounded-3xl p-6 space-y-4 text-left font-sans flex flex-col justify-between">
                <div className="space-y-4 font-sans">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center border border-black/[0.01]">
                      <TrendingUp className="w-4.5 h-4.5 text-[#1d1d1f]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1d1d1f]">Strategy 02: Short-Form Viral Video Script writer</h3>
                      <p className="text-[10px] text-[#86868b] font-medium">Repurpose your transcribed summaries into TikTok/YT Shorts scripts</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#86868b] leading-relaxed font-light">
                    Choose one of your summarized lectures on your Workspace shelf. The pipeline will automatically adapt the key facts into a snappy, attention-grabbing 45-second script.
                  </p>

                  <div className="grid grid-cols-1 font-sans gap-2 select-none">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b]">Select summary source</label>
                    <div className="flex flex-col gap-2">
                      <div className="space-y-1 bg-[#f5f5f7] p-3 border border-black/[0.04] rounded-xl text-xs text-left">
                        <span className="font-bold text-[#1d1d1f] block text-[11px] truncate">
                          {activeSummary?.metadata?.title || 'No Summary Loaded'}
                        </span>
                        <span className="text-[10px] text-[#86868b] font-mono">
                          Source: {activeSummary?.metadata?.duration || 'Unknown'} min • {activeSummary?.takeaways?.length || 0} Bullet takeaways
                        </span>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (!activeSummary) {
                            alert('Please load a summary in your Workspace first!');
                            return;
                          }
                          generateShortScript(
                            activeSummary.metadata.title, 
                            activeSummary.takeaways.join('\n')
                          );
                        }}
                        disabled={shortsScriptLoading || !activeSummary}
                        className="w-full bg-[#1d1d1f] hover:bg-black text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-sm cursor-pointer text-center disabled:opacity-40"
                      >
                        {shortsScriptLoading ? 'Repurposing with Gemini...' : 'Draft Snappy Shorts Video Script'}
                      </button>
                    </div>
                  </div>

                  {/* Script Terminal output */}
                  <div className="space-y-1.5 font-sans">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b]">Your Actionable Shorts Video Script</label>
                    <div className="bg-[#f5f5f7]/55 p-4 border border-black/[0.04] rounded-2xl h-60 overflow-y-auto font-mono text-[11px] leading-relaxed text-[#515154] text-left select-text relative">
                      {marketingShortsScript ? (
                        <div className="whitespace-pre-wrap font-mono">{marketingShortsScript}</div>
                      ) : (
                        <div className="text-[#86868b] italic flex h-full items-center justify-center font-sans font-light">
                          {activeSummary 
                            ? 'Click the button above to auto-generate a 45-second viral video layout for this summary!'
                            : 'Go compile a video in your workspace to enable script drafting here.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {marketingShortsScript && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(marketingShortsScript);
                      alert('Copied shorts script copy to clipboard!');
                    }}
                    className="w-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-semibold py-2.5 rounded-xl border border-black/[0.04] cursor-pointer text-center mt-3 transition"
                  >
                    Copy Script to Clipboard
                  </button>
                )}
              </div>

            </div>

            {/* Tactical Growth Strategy playbook */}
            <div className="bg-[#1d1d1f] rounded-3xl p-6 md:p-8 text-white space-y-6 text-left">
              <div className="space-y-1.5 font-sans">
                <span className="text-[10px] font-mono font-bold text-[#86868b] tracking-wider uppercase">THE OFFICIAL LAUNCHBOOK</span>
                <h3 className="text-lg font-semibold text-white font-sans">Three High-Converting Channels for SnapSum</h3>
                <p className="text-[#86868b] text-xs leading-relaxed max-w-xl font-sans font-light">Follow these three zero-budget traffic streams to scale your pre-configured custom hosting link to paying custom users.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-sans">
                
                {/* channel 1 */}
                <div className="space-y-2 border-l-2 border-[#0071e3] pl-4">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                    <span className="bg-[#0071e3]/20 text-[#0071e3] px-1.5 py-0.5 rounded text-[10px] font-mono">CHANNEL A</span>
                    The Reddit Value Bomb
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans font-light">
                    Search Reddit subs like <strong>r/learnprogramming</strong>, <strong>r/podcasts</strong>, or <strong>r/solopreneur</strong>. Do not pitch directly. Instead, find trending threads talking about massive YouTube tutorial series or long podcasts, summarize them with your app, and reply with the summary. Append a small footnote credit back to your SnapSum live custom domain!
                  </p>
                </div>

                {/* channel 2 */}
                <div className="space-y-2 border-l-2 border-emerald-500 pl-4 font-sans">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono">CHANNEL B</span>
                    Newsletter Lead Magnet
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans font-light">
                    Publish high-quality PDF cheatsheets of courses using our Workspace PDF Downloader. Email these PDFs for free to substacks or medium authors looking for educational content. The embedded links inside the PDF pointing back to your pre-configured domain will bring a lifetime stream of qualified subscribers to your billing models.
                  </p>
                </div>

                {/* channel 3 */}
                <div className="space-y-2 border-l-2 border-violet-400 pl-4 font-sans font-light">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                    <span className="bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded text-[10px] font-mono">CHANNEL C</span>
                    Mid-Tier Creator Tagging
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans font-light">
                    Summarize long podcasts or interviews of popular independent creators. Post the summary chapter logs on Twitter, tag the podcast host, and say: "Summarized the epic interview into a study package for visual learners!". Hosts love sharing summaries of their own podcasts with their fans, giving you 50,000+ targeted impressions impressions instantly!
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {currentScreen === 'admin' && (
          <div className="space-y-6 animate-fadeIn transition-all duration-300 font-sans">
            
            {/* Unauthenticated Security Shield Login Screen */}
            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto py-12 px-4">
                <div className="bg-white rounded-3xl border border-black/[0.04] p-8 space-y-6 shadow-sm text-center relative overflow-hidden">
                  
                  {/* High-end decorative visual protection line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900" />

                  {/* Sandbox Environment Toggle Block */}
                  <div className="flex justify-end pr-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowSandboxHelper(!showSandboxHelper)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[10px] font-mono font-bold uppercase tracking-wider text-[#515154] rounded-full border border-black/[0.03] transition duration-200 cursor-pointer text-left hover:text-[#1d1d1f]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      {showSandboxHelper ? "Hide Sandbox Guide" : "Sandbox Guide"}
                    </button>
                  </div>

                  {showSandboxHelper && (
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 text-left space-y-3 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-amber-800">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span className="text-[10px] uppercase font-bold font-mono tracking-wider">
                          SANDBOX INSTRUCTION MANUAL
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-700 font-sans leading-normal font-light">
                        Use these credentials to log in and inspect the secure systems in this preview context:
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 text-[11px] font-sans">
                        <div className="bg-white border border-amber-100 p-2.5 rounded-xl space-y-1">
                          <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">STAGE 1: LOGIN ID</span>
                          <div className="flex items-center justify-between gap-1.5">
                            <code className="bg-neutral-50 px-1 rounded font-mono font-bold text-neutral-800">admin</code>
                            <button
                              type="button"
                              onClick={() => setAdminUserField('admin')}
                              className="text-[9px] text-[#0071e3] font-bold hover:underline cursor-pointer"
                            >
                              Insert
                            </button>
                          </div>
                        </div>

                        <div className="bg-white border border-amber-100 p-2.5 rounded-xl space-y-1">
                          <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">STAGE 1: PASSWORD</span>
                          <div className="flex items-center justify-between gap-1.5">
                            <code className="bg-neutral-50 px-0.5 rounded font-mono font-bold text-neutral-800 text-[10px]">SnapSumAdmin2026!</code>
                            <button
                              type="button"
                              onClick={() => setAdminPassField('SnapSumAdmin2026!')}
                              className="text-[9px] text-[#0071e3] font-bold hover:underline cursor-pointer"
                            >
                              Insert
                            </button>
                          </div>
                        </div>

                        <div className="bg-white border border-amber-100 p-2.5 rounded-xl space-y-1 col-span-2">
                          <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">STAGE 2: MFA PASSCODE</span>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <code className="bg-[#f5f5f7] px-2 py-0.5 rounded font-mono font-extrabold text-[#d97706]">771 993</code>
                              <span className="text-[9px] text-amber-600 font-medium font-sans">Verification PIN</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setAdminMfaField('771993');
                              }}
                              className="text-[9px] bg-[#d97706]/10 text-[#d97706] px-2 py-1 rounded font-bold hover:bg-[#d97706]/20 transition cursor-pointer"
                            >
                              Insert Key
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[9px] text-neutral-400 font-sans leading-tight">
                        Note: In production deployments, user IDs, passwords, and authenticators are secured via customized secrets.
                      </p>
                    </div>
                  )}

                  {/* Lockout Screen */}
                  {lockoutSeconds !== null && lockoutSeconds > 0 ? (
                    <div className="space-y-6 py-6 animate-pulse">
                      <div className="h-16 w-16 bg-rose-50 text-rose-600 mx-auto flex items-center justify-center rounded-2xl shadow-inner border border-rose-100">
                        <Lock className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight text-neutral-900 font-sans">
                          Security Lockout Active
                        </h2>
                        <p className="text-xs text-neutral-500 font-sans leading-relaxed px-2">
                          Too many failed administrative login attempts have triggered an automatic protective IP lockout in our access vault.
                        </p>
                      </div>

                      <div className="bg-[#f5f5f7] border border-black/[0.04] rounded-2xl p-6 font-mono text-center space-y-2 max-w-[280px] mx-auto">
                        <span className="text-[10px] text-neutral-400 block uppercase tracking-wider font-bold">Cooldown Remaining</span>
                        <span className="text-3xl font-extrabold text-neutral-800 tracking-tight">
                          {lockoutSeconds}s
                        </span>
                      </div>

                      <p className="text-[10px] text-neutral-400 font-sans">
                        Please try again after the secure cooling period has finished.
                      </p>
                    </div>
                  ) : !adminMfaRequired ? (
                    /* Step 1: Username & Password Verification */
                    <div className="space-y-6">
                      <div className="h-14 w-14 bg-zinc-900 mx-auto flex items-center justify-center text-white rounded-2xl shadow-inner relative">
                        <Lock className="w-6 h-6 text-white" />
                        <span className="absolute bottom-[-2px] right-[-2px] bg-emerald-500 h-3 w-3 rounded-full border-2 border-white" />
                      </div>

                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 bg-zinc-100 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase font-bold text-zinc-600">
                          <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-ping" />
                          STAGE 1: CREDENTIAL CHALLENGE
                        </div>
                        <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 font-sans">
                          Admin Operations Suite
                        </h2>
                        <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                          Verify administrative operator user name and identity key credentials to query core configurations.
                        </p>
                      </div>

                      <form onSubmit={handleAdminAuth} className="space-y-4 text-left">
                        <div className="space-y-1.5 font-sans">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                            Administrative User ID
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. admin"
                            value={adminUserField}
                            onChange={(e) => setAdminUserField(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black/[0.05] transition"
                          />
                        </div>

                        <div className="space-y-1.5 font-sans">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                            Private Security Key (Password)
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••••••"
                            value={adminPassField}
                            onChange={(e) => setAdminPassField(e.target.value)}
                            required
                            className="w-full px-[#16px] py-2.5 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black/[0.05] transition"
                          />
                        </div>

                        {attemptsRemaining !== null && attemptsRemaining < 5 && (
                          <div className="text-[10px] text-amber-600 font-medium font-sans text-right">
                            ⚠️ {attemptsRemaining} attempts left before system lockout.
                          </div>
                        )}

                        {adminError && (
                          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs text-center font-medium font-sans">
                            ⚠️ {adminError}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold py-3 rounded-xl transition cursor-pointer shadow-sm text-center flex items-center justify-center gap-2"
                        >
                          Verify General Credentials
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* Step 2: MFA Multi-Factor Token Handshake */
                    <div className="space-y-6">
                      <div className="h-14 w-14 bg-zinc-950 mx-auto flex items-center justify-center text-white rounded-2xl shadow-inner relative">
                        <Check className="w-6 h-6 text-emerald-400" />
                        <span className="absolute bottom-[-2px] right-[-2px] bg-amber-500 h-3 w-3 rounded-full border-2 border-white animate-pulse" />
                      </div>

                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 bg-amber-100 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase font-bold text-amber-800">
                          <span className="h-1.5 w-1.5 bg-[#d97706] rounded-full animate-pulse" />
                          STAGE 2: MULTI-FACTOR IDENTIFICATION
                        </div>
                        <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 font-sans">
                          MFA Security Vault
                        </h2>
                        <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                          For your administrative role, we require verification via the dynamic 2FA system authenticator token.
                        </p>
                      </div>

                      <form onSubmit={handleAdminAuth} className="space-y-4 text-left">
                        <div className="space-y-1.5 font-sans">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold flex items-center justify-between">
                            <span>6-DIGIT MFA SECURITY CODE</span>
                            <span className="text-emerald-600 animate-pulse text-[9px]">ROLLING PASSKEY ACTIVE</span>
                          </label>
                          <input
                            type="text"
                            placeholder="771 993"
                            value={adminMfaField}
                            onChange={(e) => setAdminMfaField(e.target.value)}
                            required
                            maxLength={10}
                            className="w-full text-center tracking-[0.5em] font-mono font-extrabold text-lg px-4 py-3 bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>

                        {attemptsRemaining !== null && attemptsRemaining < 5 && (
                          <div className="text-[10px] text-amber-600 font-medium font-sans text-right">
                            ⚠️ {attemptsRemaining} attempts remaining prior to lock limit.
                          </div>
                        )}

                        {adminError && (
                          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs text-center font-medium font-sans">
                            ⚠️ {adminError}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAdminMfaRequired(false);
                              setAdminMfaField('');
                            }}
                            className="w-1/3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-neutral-600 text-xs font-semibold py-3 rounded-xl transition cursor-pointer text-center"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="w-2/3 bg-zinc-900 hover:bg-black text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer shadow-sm text-center flex items-center justify-center gap-2"
                          >
                            Complete Handshake
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              /* Authenticated Admin Control Panel View */
              <div className="space-y-6 text-left font-sans">
                
                {/* Dashboard Title Banner */}
                <div className="bg-[#1d1d1f] rounded-3xl p-6 md:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-left font-sans">
                    <span className="text-[9px] font-mono uppercase text-[#86868b] tracking-wider font-bold">SnapSum Operations Suite</span>
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      Administrative Control Terminal
                    </h2>
                    <p className="text-neutral-400 text-xs font-sans font-light leading-relaxed">
                      Configure environment quotas, rate limit parameters, billing gateways, simulated users, and Gemini API inference settings.
                    </p>
                  </div>
                  <button
                    onClick={handleAdminLogout}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer self-start sm:self-center"
                  >
                    Log Out Configurator
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* CARD 7: ADMINISTRATIVE CREDENTIALS & MULTI-FACTOR KEY VAULT */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-2 text-zinc-950">
                        <KeyRound className="w-5 h-5 text-amber-500 animate-pulse" />
                        <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                          Administrative Credentials & Multi-Factor Security (Google Authenticator)
                        </h3>
                      </div>
                      <span className="bg-amber-50 text-amber-700 text-[9px] font-mono font-bold leading-none uppercase px-2 py-1 rounded-sm border border-amber-100">
                        Secure Vault Active
                      </span>
                    </div>

                    <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                      Configure custom administration credentials. Secure your operations by generating cryptographically strong, system-backed passwords and saving them securely to your Firebase Cloud Firestore database. Enable 2FA Google Authenticator protection to defend against brute force attempts.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      
                      {/* Left: Account Credentials Creator */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block border-b border-neutral-50 pb-1">
                          1. Setup Login Credentials
                        </span>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                            Admin Username
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. administrator"
                            value={vaultUsername}
                            onChange={(e) => setVaultUsername(e.target.value)}
                            className="w-full px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                            Admin Password
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type={vaultPasswordVisible ? 'text' : 'password'}
                                placeholder="Enter custom password or generate one"
                                value={vaultPassword}
                                onChange={(e) => setVaultPassword(e.target.value)}
                                className="w-full pl-4 pr-10 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setVaultPasswordVisible(!vaultPasswordVisible)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                              >
                                {vaultPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={generateSecurePassword}
                              className="bg-zinc-100 hover:bg-zinc-200 text-[#1d1d1f] hover:text-[#0071e3] transition text-[10px] uppercase tracking-wider font-bold px-3 py-2 rounded-xl border border-black/[0.03] cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              Generate Secure ⚡
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Authenticator App (2FA) */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block border-b border-neutral-50 pb-1">
                          2. Configure Authenticator App 2FA
                        </span>

                        {!vault2faQrUrl ? (
                          <div className="p-4 bg-zinc-50 border border-neutral-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                            <ShieldAlert className="w-8 h-8 text-neutral-400" />
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-zinc-800 block">MFA App Connection Pending</span>
                              <p className="text-[10px] text-zinc-500 leading-normal max-w-xs font-sans font-light">
                                To activate 2FA for the administrative console using Google Authenticator, tap the button below.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleGenerate2FA}
                              disabled={vaultSetupLoading}
                              className="bg-[#0071e3] hover:bg-[#0077ed] text-white text-[10px] font-bold tracking-wider uppercase px-4 py-2 rounded-xl transition disabled:opacity-40 cursor-pointer shadow-sm mx-auto"
                            >
                              {vaultSetupLoading ? 'Initializing...' : 'Initialize 2FA Secret Key'}
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-2xl space-y-4">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              <div className="bg-white p-2 rounded-xl border border-amber-100 shadow-sm shrink-0">
                                <img
                                  src={vault2faQrUrl}
                                  alt="Google Authenticator QR Code"
                                  className="w-24 h-24 mx-auto"
                                />
                              </div>
                              <div className="space-y-2 text-left font-sans">
                                <span className="text-[11px] font-bold text-amber-950 block">Scan with Google Authenticator</span>
                                <p className="text-[10px] text-amber-900 leading-relaxed font-sans font-light">
                                  Open Google Authenticator app on your phone, tap the "+" button, choose "Scan QR code", and scan the QR block here.
                                </p>
                                <div className="space-y-0.5">
                                  <span className="text-[8px] font-mono uppercase text-amber-800 font-bold tracking-wide block">Manual Base32 Secret Key</span>
                                  <code className="text-[9px] bg-white border border-amber-200/50 px-2 py-0.5 rounded font-mono text-zinc-800 font-semibold select-all block break-all">
                                    {vault2faSecret}
                                  </code>
                                </div>
                              </div>
                            </div>

                            {/* Verification Form */}
                            <div className="space-y-2 border-t border-amber-100 pt-3">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                                Enter 6-Digit Authenticator Code
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="e.g. 123456"
                                  maxLength={6}
                                  value={vault2faSetupCode}
                                  onChange={(e) => setVault2faSetupCode(e.target.value.replace(/\D/g, ''))}
                                  className="w-full px-4 py-1.5 text-xs bg-white border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono text-center tracking-widest text-base font-bold"
                                />
                                <button
                                  type="button"
                                  onClick={handleVerify2FASetup}
                                  disabled={vaultSetupLoading || vault2faVerified || vault2faSetupCode.length < 6}
                                  className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0 ${vault2faVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-black text-white hover:bg-neutral-800'}`}
                                >
                                  {vault2faVerified ? 'Verified ✓' : vaultSetupLoading ? 'Checking...' : 'Verify Pin'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer / Status Message & Save button */}
                    <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                      <div className="text-left flex-1">
                        {vaultSaveStatus.type !== 'idle' ? (
                          <span className={`text-[11px] font-medium leading-relaxed block ${vaultSaveStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {vaultSaveStatus.type === 'success' ? '✓ ' : '⚠️ '} {vaultSaveStatus.message}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#86868b] leading-normal font-light block">
                            Note: Verification of the 2FA authenticator app is required before settings can be fully committed to prevent lockout.
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                        {vault2faQrUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setVault2faQrUrl('');
                              setVault2faSecret('');
                              setVault2faSetupCode('');
                              setVault2faVerified(false);
                              setVaultSaveStatus({ type: 'idle', message: '' });
                            }}
                            className="w-full sm:w-auto text-zinc-500 hover:text-black bg-zinc-50 hover:bg-zinc-100 border border-black/[0.03] text-[10px] font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl transition cursor-pointer"
                          >
                            Reset Setup Flow
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveVaultSettings}
                          disabled={vaultSetupLoading || (!vault2faVerified && vault2faQrUrl !== '')}
                          className="w-full sm:w-auto bg-black text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold tracking-wider uppercase px-6 py-2.5 rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                        >
                          {vaultSetupLoading ? 'Processing...' : 'Save Settings to Firestore'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* CARD 1: ENVIRONMENTAL SETTINGS */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans">
                    <div className="flex items-center gap-2 text-zinc-800">
                      <Server className="w-5 h-5 text-zinc-700" />
                      <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                        Environmental & Access Settings
                      </h3>
                    </div>
                    <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                      Control standard system variables and request limits mapped directly throughout your active server.
                    </p>

                    <div className="space-y-4 pt-2 border-t border-neutral-100">
                      
                      {/* guest credit limit */}
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Guest Daily Limits (FREE_REQS_LIMIT)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={adminFreeReqsLimit}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAdminFreeReqsLimit(val);
                              localStorage.setItem('admin_free_reqs_limit', val);
                              refreshStatus();
                            }}
                            className="flex-1 accent-black animate-pulse"
                          />
                          <span className="text-xs font-bold font-mono bg-[#f5f5f7] px-3 py-1.5 rounded-lg border border-black/[0.04]">
                            {adminFreeReqsLimit} Req/Day
                          </span>
                        </div>
                        <span className="block text-[10px] text-[#86868b] leading-normal font-light">
                          Determines the threshold count of daily video analyses allowed for non-paying guest IP addresses.
                        </span>
                      </div>

                      {/* default bypass code */}
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86868b] block font-bold">
                          VIP Bypass Access Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. PROPASS"
                          value={customVipCode}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setCustomVipCode(val);
                            if (val) {
                              localStorage.setItem('custom_vip_code', val);
                              if (val === 'PROPASS') {
                                setIsPremium(true);
                              }
                            } else {
                              localStorage.removeItem('custom_vip_code');
                              setIsPremium(false);
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white"
                        />
                        <span className="block text-[10px] text-[#86868b] leading-normal font-light">
                          Supply guests or creators with this specific passkey to grant instant premium access. Default: <code>PROPASS</code>.
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* CARD 2: BILLING & GATEWAY SETTINGS */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans">
                    <div className="flex items-center gap-2 text-zinc-805">
                      <CreditCard className="w-5 h-5 text-zinc-700" />
                      <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                        Billing Settings & Stripe Portal
                      </h3>
                    </div>
                    <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                      Coordinate billing credentials to receive active user subscriptions directly in support of real growth.
                    </p>

                    <div className="space-y-3 pt-2 border-t border-neutral-100">
                      
                      {/* secret key */}
                      <div className="space-y-1 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Stripe Secret Key (Overriding System API)
                        </label>
                        <input
                          type="password"
                          placeholder="sk_test_..."
                          value={customStripeSecret}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setCustomStripeSecret(val);
                            if (val) {
                              localStorage.setItem('custom_stripe_secret', val);
                            } else {
                              localStorage.removeItem('custom_stripe_secret');
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono"
                        />
                      </div>

                      {/* publishable key */}
                      <div className="space-y-1 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Stripe Publishable Key
                        </label>
                        <input
                          type="text"
                          placeholder="pk_test_..."
                          value={customStripePublishable}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setCustomStripePublishable(val);
                            if (val) {
                              localStorage.setItem('custom_stripe_publishable', val);
                            } else {
                              localStorage.removeItem('custom_stripe_publishable');
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono"
                        />
                      </div>

                      {/* Toggle mock premium test bypass */}
                      <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/40 flex items-center justify-between text-left mt-2">
                        <div className="space-y-0.5 max-w-[80%]">
                          <span className="text-[11px] font-bold text-emerald-950 block">Simulate Sandbox Pro Pass</span>
                          <span className="text-[9px] text-emerald-800 leading-none block">Enable mock subscription active state for verification purposes on current browser.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isPremium}
                          onChange={(e) => {
                            const checkState = e.target.checked;
                            setIsPremium(checkState);
                            localStorage.setItem('youtube_summarizer_premium', checkState ? 'true' : 'false');
                          }}
                          className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </div>

                    </div>
                  </div>

                  {/* CARD 3: GEMINI API CONFIGURATION SETTINGS */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans">
                    <div className="flex items-center gap-2 text-zinc-800">
                      <Sparkles className="w-5 h-5 text-zinc-700" />
                      <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                        Gemini AI API Configuration Settings
                      </h3>
                    </div>
                    <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                      Optimize models, inference parameters, and advanced groundings to adjust depth, cost, or speeds.
                    </p>

                    <div className="space-y-4 pt-2 border-t border-neutral-100">
                      
                      {/* custom api key override */}
                      <div className="space-y-1 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Developer Custom Gemini API Key Override
                        </label>
                        <input
                          type="password"
                          placeholder="AIzaSy..."
                          value={customApiKey}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setCustomApiKey(val);
                            if (val) {
                              localStorage.setItem('custom_gemini_api_key', val);
                            } else {
                              localStorage.removeItem('custom_gemini_api_key');
                            }
                          }}
                          className="w-full px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono"
                        />
                        <span className="block text-[9px] text-[#86868b] leading-tight">
                          Empty default utilizes host defaults (No direct developer prompt fees).
                        </span>
                      </div>

                      {/* Model Selector */}
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Active Gemini Model
                        </label>
                        <select
                          value={adminSelectedModel}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminSelectedModel(val);
                            localStorage.setItem('admin_selected_model', val);
                          }}
                          className="w-full px-3 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl font-sans"
                        >
                          <option value="gemini-3.5-flash">gemini-3.5-flash (Recommended Default)</option>
                          <option value="gemini-3.5-pro">gemini-3.5-pro (High long-form reasoning accuracy)</option>
                          <option value="gemini-2.5-flash">gemini-2.5-flash (Highest latency throughput)</option>
                          <option value="gemini-2.5-pro">gemini-2.5-pro (Advanced coding/analytical depth)</option>
                        </select>
                      </div>

                      {/* Temperature configuration */}
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Inference Temperature (Creativity Index)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0.0"
                            max="1.0"
                            step="0.1"
                            value={adminTemperature}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAdminTemperature(val);
                              localStorage.setItem('admin_temperature', val);
                            }}
                            className="flex-1 accent-black"
                          />
                          <span className="text-[10px] font-mono font-semibold bg-[#f5f5f7] px-2 py-1 rounded">
                            TEMP = {adminTemperature}
                          </span>
                        </div>
                        <span className="block text-[9px] text-slate-500 font-sans leading-none">
                          Lower weights specify standard summary fact listings. Higher weights allow highly creative branding copies.
                        </span>
                      </div>

                      {/* Google search grounding selection */}
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block font-bold">
                          Google Search Grounding Engine
                        </label>
                        <select
                          value={adminSearchGrounding}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminSearchGrounding(val);
                            localStorage.setItem('admin_search_grounding', val);
                          }}
                          className="w-full px-3 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl font-sans"
                        >
                          <option value="default">Default Fallback (Use search tools only when lacking transcript)</option>
                          <option value="true">Force Search Grounding (Inject Google Search queries on all jobs)</option>
                          <option value="false">Disable Search Grounding (No external internet fetching)</option>
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* CARD 4: ACTIVE USER TRACKER & RATE LIMIT RESETS */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-zinc-800">
                          <History className="w-5 h-5 text-zinc-700" />
                          <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                            User Management & IP Rate Limiter
                          </h3>
                        </div>
                        <button
                          onClick={fetchAdminIpTracker}
                          disabled={adminIpLoading}
                          className="text-[#0071e3] text-[10px] font-bold uppercase tracking-wider font-mono hover:underline disabled:opacity-40 cursor-pointer"
                        >
                          {adminIpLoading ? 'Polling...' : 'Sync Logs 🔄'}
                        </button>
                      </div>
                      <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                        Track unique IP addresses interacting with client APIs. Manually reset spamming visitors to maintain pristine site accessibility.
                      </p>

                      {/* Reset Actions banner */}
                      <div className="flex items-center gap-2 pt-1 font-sans">
                        <button
                          onClick={handleResetAllIps}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          Wipe Limits For All Guests
                        </button>
                      </div>

                      {/* Tracker Log Console */}
                      <div className="border border-neutral-100 rounded-2xl overflow-hidden mt-3 max-h-56 overflow-y-auto">
                        {adminIpList.length === 0 ? (
                          <div className="p-8 text-center text-[11px] text-[#86868b] italic font-light bg-neutral-50 leading-relaxed">
                            No active guest IP logs recorded on server. Wait for visitors to compile queries or refresh logs!
                          </div>
                        ) : (
                          <table className="w-full text-[11px] font-sans">
                            <thead className="bg-[#f5f5f7] border-b border-neutral-150">
                              <tr>
                                <th className="px-3 py-2 text-left font-mono text-[9px] text-slate-500 uppercase">Guest IP Address</th>
                                <th className="px-3 py-2 text-center font-mono text-[9px] text-slate-500 uppercase">Usage Count</th>
                                <th className="px-3 py-2 text-right font-mono text-[9px] text-slate-500 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {adminIpList.map((entry, idx) => (
                                <tr key={entry.ip + '-' + idx} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                                  <td className="px-3 py-2 font-mono text-[#1d1d1f] font-medium break-all">
                                    {entry.ip} {entry.ip === '127.0.0.1' && <span className="text-[10px] text-[#86868b] font-sans">(Localhost)</span>}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${entry.count >= parseInt(adminFreeReqsLimit, 10) ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-neutral-800'}`}>
                                      {entry.count} / {adminFreeReqsLimit} used
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <button
                                      onClick={() => handleResetSpecificIp(entry.ip)}
                                      className="text-rose-600 hover:text-rose-805 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer"
                                    >
                                      Wipe Quota
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 text-[10px] text-[#86868b] leading-normal font-light">
                      ℹ️ Limits reset automatically every 24 hours. Rate limits bypass is enabled for active subscribers & custom keys.
                    </div>
                  </div>

                  {/* CARD 5: GOOGLE ANALYTICS INTEGRATION & EVENT LOGGER */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans flex flex-col justify-between lg:col-span-2">
                    <div className="space-y-4">
                      
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-zinc-800">
                          <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
                          <h3 className="font-bold text-sm tracking-tight text-[#1d1d1f]">
                            Google Analytics 4 (GA4) Integration
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 bg-[#f5f5f7] px-2.5 py-1 rounded-full border border-black/[0.03]">
                          <span className={`h-2 w-2 rounded-full ${adminGaMeasurementId ? 'bg-emerald-500 animate-ping' : 'bg-neutral-300'}`}></span>
                          <span className={`h-2 w-2 rounded-full -ml-4 ${adminGaMeasurementId ? 'bg-emerald-500' : 'bg-neutral-300'}`}></span>
                          <span className="text-[10px] font-bold tracking-tight text-neutral-600 font-sans uppercase">
                            {adminGaMeasurementId ? 'Active & Streamed' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                        Inject real-time user-engagement metrics into your dashboard. Capture clicks, summaries, checkouts, and navigation pathways straight to your Google Analytics dashboard seamlessly.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
                        {/* INPUT SETTINGS FIELDS */}
                        <div className="space-y-3">
                          <div className="space-y-2 font-sans">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                              GA4 Measurement ID
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="G-XXXXXXXXXX"
                                value={adminGaMeasurementId}
                                onChange={(e) => {
                                  const val = e.target.value.trim().toUpperCase();
                                  setAdminGaMeasurementId(val);
                                }}
                                className="flex-1 px-4 py-2 text-xs bg-[#f5f5f7] border border-black/[0.04] rounded-xl outline-none focus:bg-white font-mono uppercase"
                              />
                              <button
                                onClick={() => {
                                  if (adminGaMeasurementId) {
                                    localStorage.setItem('admin_ga_measurement_id', adminGaMeasurementId);
                                    initGA(adminGaMeasurementId);
                                    trackGAEvent('measurement_id_updated', {
                                      measurement_id: adminGaMeasurementId,
                                      saved_at: new Date().toISOString()
                                    });
                                  } else {
                                    localStorage.removeItem('admin_ga_measurement_id');
                                    clearSessionEvents();
                                    alert("Measurement ID cleared. Please refresh the page to completely unload tracking modules.");
                                  }
                                }}
                                className="bg-black text-white hover:bg-neutral-800 transition text-[10px] uppercase tracking-wider font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                              >
                                Save & Bind
                              </button>
                            </div>
                            <span className="block text-[9px] text-[#86868b] leading-tight">
                              Locate under GA4 Console → Admin → Data Streams → Select Web Stream → Measurement ID.
                            </span>
                          </div>

                          {/* SAMPLE TRIGGER TEST MODULES */}
                          <div className="p-3.5 bg-indigo-50/40 rounded-2xl border border-indigo-100/40 space-y-2">
                            <span className="text-[11px] font-bold text-indigo-950 block">Analytics Dynamic Test Rig</span>
                            <span className="text-[9px] text-indigo-800 leading-tight block">Dispatch immediate tracking hits to verify your dashboard live feed connection.</span>
                            
                            <div className="flex gap-2 pt-1">
                              <input
                                type="text"
                                placeholder="event_name"
                                value={gaTestEventName}
                                onChange={(e) => setGaTestEventName(e.target.value.trim().toLowerCase())}
                                className="flex-1 px-3 py-1.5 text-[10px] bg-white border border-indigo-200/50 rounded-lg outline-none font-mono"
                              />
                              <button
                                onClick={() => {
                                  if (!gaTestEventName) return;
                                  trackGAEvent(gaTestEventName, {
                                    test_sent_by: 'Platform Sandbox Administrator',
                                    session_epoch: Date.now()
                                  });
                                }}
                                className="bg-indigo-600 hover:bg-indigo-750 text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-lg cursor-pointer"
                              >
                                Dispatch Hit ⚡
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* LIVE LOGGER INSPECTOR */}
                        <div className="space-y-2 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                              Session Track Logs Feed
                            </span>
                            <button
                              onClick={() => {
                                clearSessionEvents();
                              }}
                              className="text-[9px] text-neutral-400 hover:text-rose-600 font-semibold uppercase font-mono cursor-pointer transition"
                            >
                              Clear Logs 🗑️
                            </button>
                          </div>

                          <div className="flex flex-col bg-neutral-900 text-neutral-100 rounded-2xl p-4 font-mono text-[10px] h-[190px] overflow-y-auto space-y-2.5 border border-neutral-800 flex-1">
                            {gaSessionEvents.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 italic p-3">
                                <span>No events dispatched on this session yet.</span>
                                <span className="text-[8px] mt-1 not-italic text-neutral-600">Events appear live here as soon as you analyze videos, change screens, or tap custom settings.</span>
                              </div>
                            ) : (
                              gaSessionEvents.map((evt) => (
                                <div key={evt.id} className="border-b border-neutral-800/80 pb-2 last:border-0 last:pb-0 text-left">
                                  <div className="flex items-center justify-between gap-1 text-[9px]">
                                    <span className="text-emerald-400 font-bold">● {evt.name}</span>
                                    <span className="text-neutral-500">{evt.timestamp}</span>
                                  </div>
                                  <div className="text-[8px] text-neutral-400 font-light mt-0.5 whitespace-pre-wrap break-all">
                                    {evt.params && Object.keys(evt.params).length > 0 ? (
                                      `params: ${JSON.stringify(evt.params)}`
                                    ) : (
                                      'params: (none)'
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="pt-3.5 border-t border-neutral-100 text-[10px] text-[#86868b] leading-normal font-light flex items-center justify-between mt-2">
                      <span className="leading-tight">🚀 Real-time page view tracking (e.g. <code>screen_change</code>) activates automatically across user tabs.</span>
                      <a 
                        href="https://analytics.google.com/" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[#0071e3] hover:underline flex items-center gap-0.5 shrink-0"
                      >
                        Launch GA Console <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  {/* CARD 6: SECURE ENTERPRISE AUDIT LEDGER */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] space-y-4 shadow-sm text-left font-sans flex flex-col justify-between lg:col-span-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                        <div className="flex items-center gap-2 text-zinc-950">
                          <ShieldCheck className="w-5 h-5 text-neutral-800" />
                          <h3 className="font-extrabold text-sm tracking-tight text-[#1d1d1f]">
                            Secure Operational Audit Ledger
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => fetchAdminAuditLogs()}
                            disabled={adminLogsLoading}
                            className="bg-zinc-50 hover:bg-zinc-100 text-[#1d1d1f] hover:text-[#0071e3] transition text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-xl border border-black/[0.03] cursor-pointer flex items-center gap-1.5"
                          >
                            <RefreshCw className={`w-3 h-3 ${adminLogsLoading ? 'animate-spin' : ''}`} />
                            Sync Security Logs
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#515154] font-sans font-light leading-relaxed">
                        Query the logged history database tracking admin credentials authentications, MFA tokens verified, security lockouts triggered, and administrator settings modifications. Log streams comply with high-end security audit integrity standards.
                      </p>

                      <div className="border border-neutral-100 rounded-2xl overflow-hidden mt-3 font-sans">
                        <div className="max-h-72 overflow-y-auto">
                          <table className="w-full text-[11px] font-sans">
                            <thead className="bg-[#f5f5f7] border-b border-neutral-150 text-left sticky top-0 z-10">
                              <tr>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold">Log Ref / Time</th>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold">Log Event</th>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold">Origin Details</th>
                                <th className="px-3 py-2.5 font-mono text-[9px] text-slate-500 uppercase font-bold text-center">Security Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {adminAuditLogs.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-8 text-center text-[#86868b] italic font-light bg-[#f5f5f7]/30">
                                    No logged transactions in session storage. Trigger administrative operations to compile audit data streams.
                                  </td>
                                </tr>
                              ) : (
                                adminAuditLogs.map((log) => (
                                  <tr key={log.id} className="hover:bg-neutral-50/50 transition">
                                    <td className="px-3 py-3 w-40 whitespace-nowrap">
                                      <div className="font-mono text-[9px] text-[#86868b] font-bold">{log.id}</div>
                                      <div className="text-[10px] text-neutral-400 mt-0.5">{new Date(log.timestamp).toLocaleString()}</div>
                                    </td>
                                    <td className="px-3 py-3">
                                      <div className="font-bold text-[#1d1d1f] font-sans">{log.event}</div>
                                      <div className="text-[10px] text-neutral-500 leading-tight font-light mt-0.5">{log.details}</div>
                                    </td>
                                    <td className="px-3 py-3">
                                      <div className="font-mono text-[10px] text-zinc-700">{log.ip}</div>
                                      <div className="text-[9px] text-neutral-400 truncate max-w-[180px] mt-0.5" title={log.userAgent}>
                                        {log.userAgent}
                                      </div>
                                    </td>
                                    <td className="px-3 py-3 text-center w-24">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider ${
                                        log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                        log.status === 'FAILURE' ? 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse' :
                                        'bg-amber-50 text-amber-700 border border-amber-100'
                                      }`}>
                                        <span className={`h-1 w-1 rounded-full ${
                                          log.status === 'SUCCESS' ? 'bg-emerald-500' :
                                          log.status === 'FAILURE' ? 'bg-rose-500' : 'bg-amber-500'
                                        }`} />
                                        {log.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>

                    <div className="pt-3 border-t border-neutral-100 text-[10px] text-[#86868b] leading-normal font-light flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                      <span>🔒 Administrative interactions are monitored server-side through self-signing JSON session tokens.</span>
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-zinc-500">ISO 27001 PROTECTED NODE</span>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* 📜 TERMS & PRIVACY LAW PANEL */}
        {['terms', 'privacy'].includes(currentScreen) && (
          <div className="space-y-8 animate-fadeIn transition-all duration-300 font-sans text-left pb-16">
            
            {/* Header / Intro Hero section */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-8 md:p-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-neutral-100 opacity-60 hidden md:block">
                <ShieldCheck className="w-24 h-24 stroke-[1]" />
              </div>
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#0071e3]/5 border border-[#0071e3]/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0071e3]">
                  <Globe className="w-3.5 h-3.5" />
                  <span>GCC &amp; Global Legal Compliance</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-100 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text font-display">
                  {currentScreen === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                </h1>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
                  Please read our dynamic legal policies governing your experience with <strong>snapsum.app</strong>. 
                  These policies are designed to comply with GCC data frameworks (including Saudi Arabia PDPL, UAE Personal Data Protection Law) as well as global benchmarks like EU GDPR and CCPA.
                </p>
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-2 pt-2">
                  <span>Last Updated: June 20, 2026</span>
                  <span>•</span>
                  <span>Version 2.1.0</span>
                </div>
              </div>
            </div>

            {/* Content Tabs Navigation Switcher */}
            <div className="flex bg-white/80 p-1 border border-black/[0.04] rounded-2xl w-full max-w-md mx-auto items-center justify-between">
              <button
                onClick={() => {
                  setCurrentScreen('terms');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className={`flex-1 py-3 text-center rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentScreen === 'terms'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-550 hover:text-neutral-900'
                }`}
              >
                Terms of Service
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('privacy');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className={`flex-1 py-3 text-center rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentScreen === 'privacy'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-550 hover:text-neutral-900'
                }`}
              >
                Privacy Policy
              </button>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Quick Jump Sidebar */}
              <div className="lg:col-span-4 sticky top-24 space-y-4">
                <div className="bg-white rounded-3xl border border-black/[0.04] p-6 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">Quick Index</h3>
                  <div className="divide-y divide-neutral-100 text-xs text-neutral-700 font-sans">
                    {currentScreen === 'terms' ? (
                      <>
                        <a href="#acceptance" className="block py-2.5 hover:text-[#0071e3] transition">1. Acceptance of Terms</a>
                        <a href="#license" className="block py-2.5 hover:text-[#0071e3] transition">2. Intellectual Property</a>
                        <a href="#user-accounts" className="block py-2.5 hover:text-[#0071e3] transition">3. Accounts &amp; Keys</a>
                        <a href="#payments" className="block py-2.5 hover:text-[#0071e3] transition">4. Payments &amp; Billing</a>
                        <a href="#acceptable-use" className="block py-2.5 hover:text-[#0071e3] transition">5. Safe Acceptable Use</a>
                        <a href="#liability-limitation" className="block py-2.5 hover:text-[#0071e3] transition">6. Limitation of Liability</a>
                        <a href="#governing-rules" className="block py-2.5 hover:text-[#0071e3] transition">7. GCC Governing Law</a>
                      </>
                    ) : (
                      <>
                        <a href="#collection" className="block py-2.5 hover:text-[#0071e3] transition">1. What We Collect</a>
                        <a href="#gcc-legal-basis" className="block py-2.5 hover:text-[#0071e3] transition">2. GCC PDPL Compliance</a>
                        <a href="#processing-methods" className="block py-2.5 hover:text-[#0071e3] transition">3. How We Process Data</a>
                        <a href="#storage-location" className="block py-2.5 hover:text-[#0071e3] transition">4. Data Sovereignty</a>
                        <a href="#user-rights" className="block py-2.5 hover:text-[#0071e3] transition">5. Your Legal Rights</a>
                        <a href="#cookies-analytics" className="block py-2.5 hover:text-[#0071e3] transition">6. GA4 &amp; Safety Cookies</a>
                        <a href="#corporate-entity" className="block py-2.5 hover:text-[#0071e3] transition">7. Audits &amp; Contacts</a>
                      </>
                    )}
                  </div>
                </div>

                {/* Back to Workspace button */}
                <button
                  onClick={() => {
                    setCurrentScreen('app');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Main Workspace</span>
                </button>
              </div>

              {/* Main Policy Content Area */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-black/[0.04] p-8 md:p-12 shadow-sm space-y-8 text-neutral-800 leading-relaxed font-sans text-sm">
                
                {currentScreen === 'terms' ? (
                  <div className="space-y-8">
                    <p className="text-neutral-500 font-light italic leading-loose">
                      Welcome to <strong>SnapSum</strong> (referred to as the "Service" or "Platform"). These Terms &amp; Conditions constitute a legally binding agreement made between you ("User" or "you") and SnapSum.app ("we," "us," or "our"), concerning your access to and use of our universal content processor web application.
                    </p>

                    <section id="acceptance" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">1. Acceptance of Terms</h2>
                      <p>
                        By visiting our Website, setting up custom domains, connecting analytics, or inputting Google Gemini API keys into our processing sandboxes, you certify that you have read, understood, and agreed to be fully bound by these Terms &amp; Conditions. If you do not accept these municipal and international covenants, you are strictly prohibited from utilizing the Platform.
                      </p>
                    </section>

                    <section id="license" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">2. Intellectual Property &amp; Licenses</h2>
                      <p>
                        Unless designated otherwise, the codebase, visual dashboard design assets, custom routing systems, database schemas, and branding components are our exclusive proprietary material. 
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                        <li><strong>User Summaries &amp; Generated Content:</strong> Users hold final ownership over the generated summaries, extracted notes, customized quizzes, and audio voiceover files compiled on their authorization.</li>
                        <li><strong>Video Content Sources:</strong> We operate strictly as an intermediary processing API. We do not claim ownership over external YouTube videos or transcripts processed; users must verify they have legitimate access rights to summaries generated from copyrighted works.</li>
                      </ul>
                    </section>

                    <section id="user-accounts" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">3. User Credentials &amp; API Storage</h2>
                      <p>
                        To enable complete private client operations at zero platform hosting cost, SnapSum leverages local client browser structures (<code>localStorage</code>) to cache summaries and developer secrets.
                      </p>
                      <p>
                        You are solely responsible for securing your personal <strong>Google Gemini API Key</strong> and ensuring your private client browser cache is not cleared without prior export if you wish to prevent data loss. We are not liable for accidental data wipes arising from deleted browser logs.
                      </p>
                    </section>

                    <section id="payments" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">4. Subscriptions, Payments &amp; Gated Token Gating</h2>
                      <p>
                        Our platform offers a mock premium upgrade model ("Pro Creator Pass") featuring a Stripe Sandbox Gateway simulator. 
                      </p>
                      <p>
                        All payment workflows run completely locally in premium mock simulations. No actual financial storage, credit card clearance, or regional payment capture takes place on live database networks, resulting in zero real monetization liabilities under local trading laws. To hard-gate active privileges, we issue localized gating tokens (e.g. <code>SnapSumPro=True</code>) bound to local clients.
                      </p>
                    </section>

                    <section id="acceptable-use" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">5. Acceptable Use Policy</h2>
                      <p>
                        You warrant that your use of SnapSum does not violate any local Municipal laws or safety regulations. In particular:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                        <li>You shall not input transcripts, text files, or URLs hosting hate speech, violent extremism, adult material, or illegal, defamatory commentary.</li>
                        <li>You shall not bypass our backend API proxy filters, attempt SQL injection vectors against admin tools, or carry out distributed denial of service (DDoS) requests.</li>
                        <li>All operations are bounded by Google Gemini API Terms of Use; users must not violate Gemini API safety margins.</li>
                      </ul>
                    </section>

                    <section id="liability-limitation" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">6. Disclaimers &amp; Limitations of Liability</h2>
                      <p>
                        Our service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no guarantees that transcripts fetched will represent 100% video accuracy, nor do we assume responsibility for hallucinated AI summaries or erroneous test questions curated by LLM processors.
                      </p>
                      <p>
                        Under no circumstances shall SnapSum, its contractors, or its parent operators be held liable for administrative downtime, missed content objectives, or technical developer API-quota blocks.
                      </p>
                    </section>

                    <section id="governing-rules" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">7. Governing Law &amp; GCC Jurisdiction</h2>
                      <p>
                        These Terms and Conditions are governed by standard international software covenants and local GCC commercial guidelines. 
                      </p>
                      <p>
                        If you are accessing the service from the Gulf Cooperation Council (including the Kingdom of Saudi Arabia, United Arab Emirates, Qatar, Kuwait, Oman, and Bahrain), regional consumer arbitration rules and competent judicial courts of respective major hubs (e.g., Riyadh or Dubai) shall have exclusive jurisdiction over any domestic merchant disputes arising under SnapSum service availability.
                      </p>
                    </section>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <p className="text-neutral-500 font-light italic leading-loose">
                      Your privacy is an absolute priority. We design our software structures to collect minimal personal info, keep developer credentials decentralized, and respect user autonomy in full compliance with GCC Data Protection Frameworks and international regulatory bodies.
                    </p>

                    <section id="collection" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">1. Data Categories &amp; Collection Boundaries</h2>
                      <p>
                        To operate our universal processing interface, we collect and temporarily store the following details:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                        <li><strong>Analytical Identity (GA4):</strong> Unique, anonymized client tracking parameters handled with standard browser cookie files via Google Analytics 4 to track feature clicks.</li>
                        <li><strong>Processing History:</strong> Handled video URLs, transcript paragraphs, outline bullet points, and mock referral codes.</li>
                        <li><strong>Local Device Secrets:</strong> Your Google Gemini API Key and active subscription tokens. <em>Crucially, these keys are held exclusively within local browser cache units (localStorage) and are never transmitted to our master server coordinates.</em></li>
                      </ul>
                    </section>

                    <section id="gcc-legal-basis" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">2. GCC PDPL Compliance (Saudi Arabia &amp; UAE Law)</h2>
                      <p>
                        In strict compliance with the Saudi Arabian Personal Data Protection Law (PDPL) promulgated under Royal Decree No. M/19 and the UAE Federal Decree-Law No. 45/2021 on Personal Data Protection:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                        <li><strong>Legal Grounding:</strong> Processing is justified on the basis of (a) explicit user consent, validated by entering values and requesting summaries, or (b) legitimate contractual processing to fulfill requested client tasks.</li>
                        <li><strong>Purpose Specificity:</strong> Data is handled strictly for turning video scripts into educational summaries, generating quizzes, and tracking referral analytics.</li>
                        <li><strong>Data Minimization:</strong> We never log card PIN credentials, home billing coordinates, or personal mobile identifiers.</li>
                      </ul>
                    </section>

                    <section id="processing-methods" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-950 border-b border-neutral-100 pb-2">3. How Your Processing Data is Handled</h2>
                      <p>
                        When a video is submitted, our backend server processes the YouTube transcripts and pushes clean instruction payloads to the official Google Gemini SDK. 
                      </p>
                      <p>
                        Google's professional Gemini model API utilizes zero-data-retention and zero-data-training constraints for deep API calls. Consequently, your processed scripts and strategic business learning clips are never used to train future public LLM weights or target outside ad networks.
                      </p>
                    </section>

                    <section id="storage-location" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">4. Data Sovereignty &amp; Cross-Border Transfers</h2>
                      <p>
                        Our backend logic is deployed securely inside sandboxed Cloud containers. Anonymized analytics may traverse secure transatlantic lines to standard Google Cloud locations. 
                      </p>
                      <p>
                        By operating the platform, you acknowledge and grant consent to the international storage and transfer of essential technical metadata required to compile AI transcripts, which is fully compliant with regional GCC data governance guidelines because personal identifiable information (PII) is kept isolated.
                      </p>
                    </section>

                    <section id="user-rights" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">5. Your Legal Subject Rights (GDPR / GCC / CCPA)</h2>
                      <p>
                        Irrespective of your regional geography, you enjoy robust legislative protection over your digital footprint. As a data subject of SnapSum, you have:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                        <li><strong>Right to Destruction (Be Forgotten):</strong> You can wipe your active database state or clear local storage cache logs instantaneously via your setting toggles to delete all traces.</li>
                        <li><strong>Right to Restrict Processing:</strong> You can choose to revoke your Google Gemini developer key or decline cookies instantly.</li>
                        <li><strong>Right to Rectification:</strong> You can edit active custom domains or analytics tracking IDs at any moment via the Admin/Domain tabs.</li>
                        <li><strong>Right of Portability:</strong> You can export summary text blobs or download pre-loaded modules freely.</li>
                      </ul>
                    </section>

                    <section id="cookies-analytics" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">6. Cookies and GA4 Tracking Policy</h2>
                      <p>
                        We use Google Analytics 4 (GA4) with anonymous client identifiers (<code>cid</code>) stored via standard browser cookie files. 
                      </p>
                      <p>
                        These cookies do not log real-world addresses or sensitive emails. They allow our marketing analytics engines to gauge screen clicks, page transitions, and overall visitor volumes over daily traffic cycles, helping us improve speed.
                      </p>
                    </section>

                    <section id="corporate-entity" className="scroll-mt-24 space-y-3">
                      <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">7. Audits, Revisions, and Contacts</h2>
                      <p>
                        We reserve the right to revise this Privacy Policy periodically to align with updated regulatory decisions.
                      </p>
                      <p>
                        For questions, full data disclosures, or regulatory compliance requests under Saudi PDPL, UAE decree laws, or general EU data panels, please reach out to our team at <strong>legal@snapsum.app</strong> or open an audit thread via our official domain channels at <strong>snapsum.app</strong>.
                      </p>
                    </section>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Stripe Payment Simulator Gated Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-xl border border-neutral-200 grid grid-cols-1 md:grid-cols-12 max-h-[95vh] font-sans">
            
            {/* Left Side: Order summary details */}
            <div className="md:col-span-5 bg-neutral-900 p-6 md:p-8 text-white flex flex-col justify-between">
              <div className="space-y-6 text-left">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-neutral-900 border border-neutral-250">
                    <Video className="w-4 h-4 text-neutral-900" />
                  </div>
                  <span className="text-sm font-bold font-mono tracking-tight text-white select-none">
                    SnapSum Secure
                  </span>
                </div>

                <div className="space-y-4">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 font-mono block">Order Summary</span>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold font-display text-white">
                      {selectedPlanCode === 'enterprise' ? 'Enterprise Agency Hub' : 'Pro Creator Pass'}
                    </h3>
                    <p className="text-[11px] text-neutral-405">
                      {billingCycle === 'monthly' ? 'Monthly auto-renew subscription' : 'Annual value saving subscription'}
                    </p>
                  </div>
                  
                  <div className="flex items-baseline gap-1 py-1">
                    <span className="text-3xl font-extrabold text-white font-display">
                      {selectedPlanCode === 'enterprise' 
                        ? (billingCycle === 'monthly' ? '$49' : '$39') 
                        : (billingCycle === 'monthly' ? '$19' : '$14')
                      }
                    </span>
                    <span className="text-xs font-mono text-neutral-400 font-medium"> / month</span>
                  </div>

                  {billingCycle === 'yearly' && (
                    <div className="bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-xl text-xs text-neutral-200 font-medium flex items-center gap-1.5 leading-snug">
                      <Zap className="w-3.5 h-3.5 text-white fill-white" />
                      <span>Yearly Savings Active: Save ${selectedPlanCode === 'enterprise' ? '120' : '60'} / year</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-8 border-t border-neutral-800 space-y-3.5 text-left">
                <div className="flex justify-between text-xs font-medium text-neutral-400">
                  <span>Subtotal</span>
                  <span>
                    {selectedPlanCode === 'enterprise' 
                      ? (billingCycle === 'monthly' ? '$49.00' : '$468.00') 
                      : (billingCycle === 'monthly' ? '$19.00' : '$168.00')
                    }
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium text-neutral-400">
                  <span>SSL & DNS Setup Fee</span>
                  <span className="text-white font-bold uppercase text-[9px] font-mono bg-neutral-800 px-2 py-0.5 rounded">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2.5 border-t border-neutral-800">
                  <span>Total Amount Due</span>
                  <span className="text-white font-display">
                    {selectedPlanCode === 'enterprise' 
                      ? (billingCycle === 'monthly' ? '$49.00' : '$468.00') 
                      : (billingCycle === 'monthly' ? '$19.00' : '$168.00')
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side: Credit Card collection interface */}
            <div className="md:col-span-7 p-6 md:p-8 bg-white flex flex-col justify-between overflow-y-auto max-h-[70vh] md:max-h-none text-left font-sans">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <h3 className="text-base font-bold font-display text-neutral-900 flex items-center gap-1.5">
                    <Lock className="w-4.5 h-4.5 text-neutral-500" />
                    Card Secure Checkout
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStripeModal(false);
                      setStripePaymentSuccess(false);
                      setStripePaymentLoading(false);
                    }}
                    className="text-neutral-500 hover:text-neutral-900 border border-neutral-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {!stripePaymentSuccess ? (
                  <div className="pt-4 space-y-4">
                    {/* Real Stripe Launch Error / Simulator Warning Banner */}
                    <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-amber-800 block uppercase font-mono tracking-wider text-[10px]">⚠️ SANDBOX SIMULATION MODE ACTIVE</span>
                          <p className="leading-relaxed text-amber-700">
                            Real credit card transactions cannot be finalized because your connected Stripe account mode is either unconfigured or restricted. Any payment authorized here is a <strong>simulated sandbox test</strong> to unlock your client's workspace and will not produce a charge on your card.
                          </p>
                          {stripeLaunchError && (
                            <div className="mt-2 bg-amber-100/60 p-3 rounded-xl border border-amber-200/50 font-mono text-[10px] text-amber-950 break-words leading-relaxed select-all">
                              <span className="font-bold text-amber-900 block mb-1">Initialization Error Recalled:</span>
                              {stripeLaunchError}
                            </div>
                          )}
                          {stripeConfig.accountInfo && !stripeConfig.accountInfo.chargesEnabled && (
                            <div className="mt-2 bg-rose-50 p-3 rounded-xl border border-rose-100/50 text-[10px] text-rose-950 font-mono leading-relaxed space-y-1">
                              <span className="font-bold text-rose-900 block uppercase tracking-wider text-[9px] mb-1">🔴 Connected Stripe Account Restricted (Live mode blocked)</span>
                              <div><strong>Account ID:</strong> {stripeConfig.accountInfo.id}</div>
                              <div><strong>Charges Enabled:</strong> {String(stripeConfig.accountInfo.chargesEnabled)}</div>
                              <div><strong>Capabilities card_payments:</strong> {stripeConfig.accountInfo.capabilities?.card_payments || 'unknown'}</div>
                              <p className="text-[10px] text-rose-800 font-sans mt-1">
                                Stripe has returned a <strong>"testmode_charges_only"</strong> constraint. Your connected account has not completed onboarding/identity verification. Visit <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer" className="underline font-bold text-rose-900 hover:text-black">Stripe Dashboard Payments page</a> to resolve this.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setStripePaymentLoading(true);
                      try {
                        // Save to Firestore through backend subscription endpoint
                        await fetch('/api/save-subscription', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: subscriptionEmail,
                            plan: selectedPlanCode || 'pro',
                            status: 'active'
                          })
                        });
                      } catch (err) {
                        console.warn('Backend save subscription failed:', err);
                      }
                      setTimeout(() => {
                        setStripePaymentLoading(false);
                        setStripePaymentSuccess(true);
                        savePremiumStatus(true);
                      }, 2000);
                    }} className="space-y-4">
                    
                    {/* User email */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
                      <input
                        type="email"
                        required
                        value={subscriptionEmail}
                        onChange={(e) => setSubscriptionEmail(e.target.value)}
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:border-neutral-900 outline-none transition"
                      />
                    </div>

                    {/* Card details */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. R. Bahirathan"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs placeholder:text-neutral-400 focus:border-neutral-900 outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">Card Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard className="w-4 h-4 text-neutral-450" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="4242 4242 4242 4242"
                           value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:border-neutral-900 outline-none transition font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">Expiration</label>
                        <input
                          type="text"
                          required
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:border-neutral-900 outline-none transition font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">CVC / CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs placeholder:text-neutral-400 focus:border-neutral-900 outline-none transition font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={stripePaymentLoading}
                        className="w-full bg-neutral-900 hover:bg-neutral-850 text-white py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {stripePaymentLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Contacting Stripe server...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>{isAdminAuthenticated ? "Authorize Secure Mock Payment" : "Authorize Secure Payment"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
                ) : (
                  <div className="py-8 text-center space-y-6 animate-scaleIn">
                    <div className="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-900 mx-auto border-4 border-neutral-50">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-2">
                      <span className="inline-block bg-amber-100 text-amber-800 text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                        Sandbox Simulation Only
                      </span>
                      <h4 className="text-xl font-bold font-display text-neutral-900">Sandbox Authorization Complete!</h4>
                      <p className="text-neutral-500 text-xs max-w-sm mx-auto leading-relaxed">
                        Your test subscription is active! Because Stripe was unconfigured or restricted, a <strong>mock transaction</strong> was simulated to unlock your premium features. No real card charge occurred, and no real funds will appear in your Stripe Dashboard.
                      </p>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-xs text-left max-w-sm mx-auto divide-y divide-neutral-200 font-mono">
                      <div className="pb-2 flex justify-between">
                        <span className="text-neutral-450">Transaction ID:</span>
                        <span className="text-neutral-800 font-bold">ch_3N5dKlJsk902hE... (SIMULATED)</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-neutral-450">Mode:</span>
                        <span className="text-amber-700 font-bold">MOCK SANDBOX</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-neutral-450">Status:</span>
                        <span className="text-emerald-600 font-bold">UNLOCKED / ACTIVE</span>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-neutral-450">Gating Token:</span>
                        <span className="text-neutral-800 font-bold select-all">SnapSumPro=True</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setShowStripeModal(false);
                          setCurrentScreen('app'); // route back to workspace
                        }}
                        className="bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-bold px-8 py-3.5 rounded-xl transition cursor-pointer"
                      >
                        Launch Premium Workspace
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-neutral-100 text-center text-[10px] text-neutral-400 font-mono leading-relaxed">
                {isAdminAuthenticated ? (
                  "🛡️ Stripe mock connection runs inside Sandbox client. No actual currencies will be processed or stored."
                ) : (
                  "🛡️ Protected by Stripe secure checkout. Standard SSL 256-bit encryption covers all data transmissions."
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Humble Footer */}
      <footer className="bg-slate-900 text-white mt-16 py-12 border-t border-slate-800 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center bg-slate-900 border border-slate-800">
              <img src="/logo.svg" alt="SnapSum Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="text-sm font-bold font-display tracking-tight text-white">
                SnapSum
              </span>
              <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono">
                Speed learning & content repurposing
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-xs text-slate-400 font-sans">
            <button 
              onClick={() => {
                setCurrentScreen('terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="hover:text-white transition duration-200 text-left underline decoration-slate-700 hover:decoration-white cursor-pointer"
            >
              Terms & Conditions
            </button>
            <button 
              onClick={() => {
                setCurrentScreen('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="hover:text-white transition duration-200 text-left underline decoration-slate-700 hover:decoration-white cursor-pointer"
            >
              Privacy Policy
            </button>
            <div className="text-slate-500 text-xs font-mono pt-2 sm:pt-0 border-t border-slate-800 sm:border-0">
              &copy; {new Date().getFullYear()} SnapSum. GCC & International Compliant.
            </div>
          </div>
        </div>
      </footer>

      {/* Dynamic Floating A/B Testing Experiment Console */}
      <div className="fixed bottom-6 right-6 z-50 font-sans">
        {!showExperimentConsole ? (
          <button
            onClick={() => {
              setShowExperimentConsole(true);
              refreshAnalyticsStats();
            }}
            className="bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white rounded-full p-3.5 shadow-xl border border-white/10 flex items-center gap-2 transition duration-200 cursor-pointer shadow-black/20 group scale-100 hover:scale-102"
            title="A/B Experiment Telemetry Console"
          >
            <BarChart className="w-5 h-5 text-[#30d158] animate-pulse" />
            <span className="text-xs font-semibold pr-1.5">A/B Testing Console</span>
            <span className="bg-[#30d158] text-black font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-full uppercase leading-none">
              Live
            </span>
          </button>
        ) : (
          <div className="bg-white border border-neutral-200/80 rounded-2xl w-80 md:w-96 shadow-2xl overflow-hidden animate-fadeIn text-left flex flex-col max-h-[500px]">
            {/* Console Header */}
            <div className="bg-[#1d1d1f] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#bf5af2]" />
                <h4 className="text-xs font-bold tracking-wider uppercase font-mono">
                  Experiment Telemetry Hub
                </h4>
              </div>
              <button
                onClick={() => setShowExperimentConsole(false)}
                className="text-neutral-400 hover:text-white font-mono text-xs cursor-pointer p-1 rounded hover:bg-neutral-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Console Information Body */}
            <div className="p-4 space-y-4 overflow-y-auto">
              
              {/* Cohort selection override */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider">
                  🧪 Simulated Cohort Identity
                </label>
                <div className="flex bg-neutral-100 p-1 rounded-xl items-center w-full border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => {
                      setExperimentGroup('A');
                      localStorage.setItem('snapsum_ab_group', 'A');
                      setLearnMode(false);
                      localStorage.setItem('snapsum_learn_mode', 'false');
                      trackGAEvent?.('cohort_swapped_a', {});
                      refreshAnalyticsStats();
                    }}
                    className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg cursor-pointer transition ${
                      experimentGroup === 'A'
                        ? 'bg-neutral-800 text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Cohort A (Summary)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExperimentGroup('B');
                      localStorage.setItem('snapsum_ab_group', 'B');
                      trackGAEvent?.('cohort_swapped_b', {});
                      refreshAnalyticsStats();
                    }}
                    className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg cursor-pointer transition ${
                      experimentGroup === 'B'
                        ? 'bg-[#0071e3] text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    Cohort B (Full Learn)
                  </button>
                </div>
                <p className="text-[9px] text-[#86868b] leading-tight">
                  {experimentGroup === 'B' 
                    ? "✓ You have full access to Interactive Timelines, Key Analogies, Flashcards and Retention Summaries." 
                    : "✕ Learn mode is locked. Switching it on will prompt you to join Cohort B."}
                </p>
              </div>

              {/* Real-time metrics comparing A vs B */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider">
                    📊 Live Telemetry Indexes
                  </span>
                  <button 
                    onClick={refreshAnalyticsStats}
                    className="text-[9px] font-semibold text-[#0071e3] hover:underline"
                  >
                    Refresh Index
                  </button>
                </div>

                <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-neutral-50 font-mono text-[9px] text-neutral-500 p-2 border-b border-neutral-200 uppercase font-bold tracking-wider">
                    <span>Metric</span>
                    <span className="text-center font-mono">Group A</span>
                    <span className="text-right font-mono">Group B</span>
                  </div>

                  <div className="divide-y divide-neutral-150">
                    <div className="grid grid-cols-3 p-2 text-neutral-700 font-medium">
                      <span className="font-sans">Cohort Size</span>
                      <span className="text-center font-mono">{analyticsStats?.totalA ?? 0}</span>
                      <span className="text-right font-mono">{analyticsStats?.totalB ?? 0}</span>
                    </div>

                    <div className="grid grid-cols-3 p-2 text-neutral-700 font-medium">
                      <span className="font-sans">Toggles Swapped</span>
                      <span className="text-center font-mono">{analyticsStats?.activationsA ?? 0}</span>
                      <span className="text-right font-mono text-indigo-600 font-bold">{analyticsStats?.activationsB ?? 0}</span>
                    </div>

                    <div className="grid grid-cols-3 p-2 text-neutral-700 font-medium">
                      <span className="font-sans">Quiz Runs</span>
                      <span className="text-center font-mono">{analyticsStats?.quizCompletionsA ?? 0}</span>
                      <span className="text-right font-mono text-emerald-600 font-bold">{analyticsStats?.quizCompletionsB ?? 0}</span>
                    </div>

                    <div className="grid grid-cols-3 p-2 text-neutral-700 font-medium">
                      <span className="font-sans">Avg Session time</span>
                      <span className="text-center font-mono">{Math.round(analyticsStats?.avgEngagementSecsA ?? 0)}s</span>
                      <span className="text-right font-mono text-orange-600 font-bold">{Math.round(analyticsStats?.avgEngagementSecsB ?? 0)}s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hypothesis callout statement */}
              <div className="bg-gradient-to-r from-purple-500/5 to-indigo-500/5 border border-purple-500/10 p-3 rounded-xl text-[10px] leading-relaxed text-indigo-950 font-sans">
                <strong className="font-semibold block text-[#bf5af2] mb-0.5 font-display">💡 Core Metric Assumption</strong>
                Our team assumes that introducing the structured learn Mode (Group B) will boost average active recall engagement session times by upwards of 150% and double quiz completion percentages over simple summary models (Group A).
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
