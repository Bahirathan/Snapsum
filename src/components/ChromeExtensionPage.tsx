import React, { useState } from 'react';
import { Download, Puzzle, CheckCircle, ArrowRight, Play, Sparkles, ExternalLink, ShieldCheck, Heart, AlertCircle } from 'lucide-react';

interface ChromeExtensionPageProps {
  isDark: boolean;
  onLaunchApp: () => void;
}

export default function ChromeExtensionPage({ isDark, onLaunchApp }: ChromeExtensionPageProps) {
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed'>('idle');
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Download Zipytiny Extension Pack",
      desc: "Click the primary download button to receive your personal, ready-to-use 'zipytiny-chrome-extension.zip' file instantly.",
      badge: "Step 1"
    },
    {
      id: 2,
      title: "Extract the Downloaded ZIP File",
      desc: "Locate the ZIP archive on your computer and extract it. This will create a 'zipytiny-chrome-extension' folder containing the extension files.",
      badge: "Step 2"
    },
    {
      id: 3,
      title: "Navigate to chrome://extensions",
      desc: "Open a new tab in Google Chrome, paste 'chrome://extensions' into your browser address bar, and hit Enter to open your extension dashboard.",
      badge: "Step 3"
    },
    {
      id: 4,
      title: "Enable Developer Mode Toggle",
      desc: "Locate the 'Developer mode' toggle switch in the upper-right corner of the Chrome Extensions page and turn it on.",
      badge: "Step 4"
    },
    {
      id: 5,
      title: "Click 'Load unpacked' and Select Folder",
      desc: "Click the 'Load unpacked' button in the top-left menu. Select the extracted 'zipytiny-chrome-extension' folder from your computer. That's it!",
      badge: "Step 5"
    }
  ];

  const handleDownload = () => {
    setDownloadState('downloading');
    
    // Create direct anchor download to our compiled API
    const link = document.createElement('a');
    link.href = '/api/download-extension';
    link.download = 'zipytiny-chrome-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadState('completed');
    }, 2000);
  };

  return (
    <div className="space-y-12 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 👑 PREMIUM HEADER HERO BANNER */}
      <div className="space-y-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/60 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase shadow-xs">
          <Puzzle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Universal Chrome Integration</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-neutral-900 dark:text-zinc-50 leading-tight">
          Zipytiny Google Chrome Extension
        </h1>
        <p className="text-neutral-500 dark:text-zinc-400 font-light text-base sm:text-xl max-w-3xl mx-auto">
          Get **Merlin-style** AI-powered video summarization, dynamic flashcard generation, and interactive quizzes directly inside YouTube's native video player with our sleek Chrome Extension.
        </p>
      </div>

      {/* 🚀 SPLIT SECTION: HERO MOCKUP & ACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        
        {/* LEFT COLUMN: INTERACTIVE DOWNLOAD CARD & STATS */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800/60 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-amber-500/10 flex items-center justify-center rounded-2xl border border-amber-500/20 text-amber-500">
                <Puzzle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-zinc-100 font-display">Installable Extension Pack</h2>
                <p className="text-xs text-neutral-500 dark:text-zinc-400 font-mono">Compatible with Chrome, Edge, & Brave</p>
              </div>
            </div>

            <p className="text-neutral-600 dark:text-zinc-300 text-sm leading-relaxed font-light">
              This lightweight extension injects a physical, golden **"Summarize with Zipytiny"** button into YouTube's owner actions bar. Click it to immediately generate workspaces for any video on the fly.
            </p>

            {/* Quick benefits list */}
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-zinc-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Injects "Summarize" button directly under YouTube player</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Popup menu detects video and launches with 1-click</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Custom URL entry right from the browser badge</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Fully secure: runs server-side via official Zipytiny domain</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-black/5 dark:border-zinc-800/60 space-y-4">
            {downloadState === 'idle' && (
              <button
                onClick={handleDownload}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition duration-300 shadow-md cursor-pointer select-none text-sm tracking-wide"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Download Extension ZIP</span>
              </button>
            )}

            {downloadState === 'downloading' && (
              <button
                disabled
                className="w-full bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 cursor-not-allowed text-sm"
              >
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span>Preparing Zipytiny Pack...</span>
              </button>
            )}

            {downloadState === 'completed' && (
              <button
                onClick={handleDownload}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition duration-300 shadow-md cursor-pointer select-none text-sm"
              >
                <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
                <span>Package Downloaded! (Download Again)</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Verified Ad-free
              </span>
              <span className="h-3 w-px bg-neutral-200 dark:bg-neutral-800" />
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Developer Approved
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RICH CHROMIUM PLAYER SIMULATOR */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden relative group">
          {/* Subtle Ambient light behind the browser mockup */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl group-hover:bg-amber-500/10 transition duration-500 pointer-events-none" />

          {/* Simulated Browser Header */}
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-neutral-500 max-w-xs truncate">youtube.com/watch?v=dQw4w9WgXcQ</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center border border-amber-500/30 scale-105 shadow-sm">
                  <Puzzle className="w-3.5 h-3.5" />
                </div>
                <div className="w-4 h-4 rounded-full bg-neutral-700" />
              </div>
            </div>

            {/* Simulated YouTube Video Player */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 group/video">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 space-y-3">
                <div className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg cursor-pointer transform hover:scale-105 transition duration-300">
                  <Play className="w-6 h-6 fill-white ml-1" />
                </div>
                <span className="text-[11px] font-mono tracking-wider text-neutral-400">SIMULATED ACTIVE PLAYER</span>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" 
                alt="YouTube Video Thumbnail" 
                className="w-full h-full object-cover opacity-45"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Simulated YouTube Video metadata & Injected Button */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-neutral-100 truncate">
                Learn Quantum Computing in 10 Minutes - Full Beginner Course
              </h3>
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-xs border border-amber-500/20">
                    Q
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-neutral-200">QuantumHub</p>
                    <p className="text-[9px] text-neutral-500">2.4M subscribers</p>
                  </div>
                  <button className="bg-neutral-100 text-neutral-950 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-neutral-200 transition ml-3">
                    Subscribe
                  </button>
                </div>

                {/* INJECTED GOLD BUTTON MOCKUP */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onLaunchApp}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-[11px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md hover:scale-105 transition duration-200 border border-amber-400"
                  >
                    <Sparkles className="w-3 h-3 text-neutral-950 shrink-0" />
                    <span>Summarize with Zipytiny</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-[11px] text-amber-400 font-light flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              The golden button is injected directly into the active YouTube watch bar by the extension's background scripts. When you click it, it reads the current video URL and instantly boots your Zipytiny AI workspace.
            </span>
          </div>
        </div>

      </div>

      {/* 🧭 SECTION: DETAILED STEP-BY-STEP INSTALLATION GUIDE */}
      <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800/60 rounded-3xl p-6 sm:p-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-zinc-50">
            Installation Guide (Developer Mode)
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-zinc-400 font-light max-w-2xl">
            Because Chrome Web Store approvals take several weeks, you can load Zipytiny immediately using Chrome's built-in Developer Mode. It takes less than 60 seconds!
          </p>
        </div>

        {/* Steps display block */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`text-left p-5 rounded-2xl border transition duration-300 flex flex-col justify-between h-48 focus:outline-none relative ${
                activeStep === step.id
                  ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500 shadow-xs'
                  : 'bg-neutral-50/50 dark:bg-zinc-950/20 border-black/5 dark:border-zinc-800/60 hover:border-neutral-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="space-y-3">
                <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md ${
                  activeStep === step.id 
                    ? 'bg-amber-500 text-neutral-950' 
                    : 'bg-neutral-200 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-400'
                }`}>
                  {step.badge}
                </span>
                <h3 className="text-xs font-bold font-display text-neutral-900 dark:text-zinc-200 leading-tight">
                  {step.title}
                </h3>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-zinc-400 font-light leading-snug">
                {step.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Dynamic visual graphic based on active step */}
        <div className="bg-neutral-50 dark:bg-zinc-950/50 border border-black/5 dark:border-zinc-800/40 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <span className="text-[10px] font-mono uppercase font-bold text-amber-500 tracking-wider">Installation Highlight</span>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-zinc-200">
              {steps[activeStep - 1].title}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-zinc-400 font-light leading-relaxed">
              {steps[activeStep - 1].desc}
            </p>
          </div>

          <div className="shrink-0 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 p-4 rounded-xl shadow-xs w-full sm:w-80 font-mono text-[10px] text-neutral-400 space-y-2">
            {activeStep === 1 && (
              <>
                <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>zipytiny-chrome-extension.zip</span>
                </div>
                <p className="text-neutral-500 text-[9px]">File Size: ~24 KB • Format: compressed ZIP file</p>
              </>
            )}
            {activeStep === 2 && (
              <>
                <p className="text-neutral-200 font-bold">📂 Extracted Folder Contents:</p>
                <div className="pl-3 space-y-1 text-[9px] text-neutral-400">
                  <p>📄 manifest.json</p>
                  <p>📄 popup.html</p>
                  <p>📄 popup.js</p>
                  <p>📄 content.js</p>
                  <p>🖼️ icon128.png, icon48.png, icon16.png</p>
                </div>
              </>
            )}
            {activeStep === 3 && (
              <>
                <div className="bg-neutral-100 dark:bg-zinc-950 p-2 rounded-md flex items-center justify-between border border-black/5 dark:border-neutral-800">
                  <span className="text-neutral-800 dark:text-zinc-200 truncate">chrome://extensions</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
                </div>
                <p className="text-[9px] text-neutral-500">Paste in standard Google Chrome url bar.</p>
              </>
            )}
            {activeStep === 4 && (
              <>
                <div className="flex items-center justify-between bg-neutral-100 dark:bg-zinc-950 p-2 rounded-md border border-black/5 dark:border-neutral-800">
                  <span className="text-neutral-700 dark:text-neutral-300 font-bold text-[9px]">Developer Mode</span>
                  <div className="w-8 h-4 bg-amber-500 rounded-full p-0.5 flex justify-end cursor-pointer">
                    <div className="w-3 h-3 bg-white rounded-full shadow-xs" />
                  </div>
                </div>
                <p className="text-[9px] text-neutral-500">Toggle switch found in the top right header bar.</p>
              </>
            )}
            {activeStep === 5 && (
              <>
                <div className="bg-amber-500/10 text-amber-500 p-2 rounded-md border border-amber-500/20 font-bold text-center">
                  🚀 Extension Loaded Successfully!
                </div>
                <p className="text-[9px] text-neutral-500 text-center">You are fully equipped to summarize any video on demand.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 🧭 FOOTER CALLOUT BANNER */}
      <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-zinc-100 font-display">Ready to unleash your productivity?</h3>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-zinc-400 font-light">
            Download the zip pack, follow the steps, and see how much faster you can summarize videos.
          </p>
        </div>
        <div className="flex gap-4 shrink-0 w-full md:w-auto">
          <button
            onClick={onLaunchApp}
            className="flex-1 md:flex-none bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-neutral-950 font-bold px-6 py-3 rounded-2xl text-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open AI Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
