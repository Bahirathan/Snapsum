import React, { useState, useEffect } from 'react';
import { 
  X, Gift, Copy, Check, Share2, Twitter, Linkedin, 
  Send, Sparkles, Trophy, Users, ArrowRight, Zap, CheckCircle2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
}

export default function ReferralModal({ isOpen, onClose, userId = 'STUDY_2026', userEmail }: ReferralModalProps) {
  const [copied, setCopied] = useState(false);
  const [referredCount, setReferredCount] = useState<number>(0);
  const [claimedCredits, setClaimedCredits] = useState<number>(5);

  const referralCode = (userId || 'STUDY_2026').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();
  const referralUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?ref=${referralCode}` 
    : `https://www.zipytiny.app/?ref=${referralCode}`;

  useEffect(() => {
    // Load local referral metrics
    try {
      const savedCount = localStorage.getItem('zipytiny_referral_count');
      if (savedCount) setReferredCount(parseInt(savedCount, 10));
      const savedCredits = localStorage.getItem('zipytiny_referral_credits');
      if (savedCredits) setClaimedCredits(parseInt(savedCredits, 10));
    } catch (e) {
      // Ignore
    }
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      // Ignore
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Hey! I'm using Zipytiny to turn YouTube video lectures and PDFs into flashcards & study notes in 10 seconds. Try it with my invite link:`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralUrl)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${referralUrl}`)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent('Free AI Study Suite Access - Zipytiny')}&body=${encodeURIComponent(`${shareText}\n\n${referralUrl}`)}`;

  const milestones = [
    { target: 1, reward: '+5 Free Video Summaries', unlocked: referredCount >= 1 },
    { target: 3, reward: '1 Month Free Pro Pass', unlocked: referredCount >= 3 },
    { target: 5, reward: 'Unlimited Anki & Mind Map Exports', unlocked: referredCount >= 5 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-white/20 backdrop-blur-md rounded-xl text-amber-300">
              <Gift className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-90">Zipytiny Referral Loop</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight leading-tight">
            Invite Study Buddies, Get Free Pro Conversions
          </h2>
          <p className="text-xs text-indigo-100 mt-1.5 leading-relaxed">
            Give your friends free access to AI video summarization. Earn 5 free Pro video summaries for every classmate who joins!
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {/* Milestone Progress */}
          <div className="bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-200/80 dark:border-zinc-700/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-zinc-200">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Your Referral Rewards</span>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{referredCount} Friends Joined</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {milestones.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    m.unlocked 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                      : 'bg-white dark:bg-zinc-800 border-neutral-200 dark:border-zinc-700 text-neutral-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {m.unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                    <span className="text-[10px] font-bold font-mono">{m.target} Friends</span>
                  </div>
                  <p className="text-[10px] font-semibold leading-tight">{m.reward}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Link Copy Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Your Unique Referral Link</span>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">Code: {referralCode}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="flex-1 px-3.5 py-2.5 bg-neutral-100 dark:bg-zinc-800/80 border border-neutral-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-neutral-800 dark:text-zinc-200 focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* One-Click Social Share Buttons */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono font-extrabold uppercase text-neutral-400 dark:text-zinc-500 block">
              Share Direct to Social
            </span>
            <div className="grid grid-cols-4 gap-2">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-[#1da1f2]/10 hover:bg-[#1da1f2]/20 border border-[#1da1f2]/30 text-[#1da1f2] rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Twitter className="w-4 h-4" />
                <span className="hidden sm:inline">Twitter</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20 border border-[#0a66c2]/30 text-[#0a66c2] rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Linkedin className="w-4 h-4" />
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
              <a
                href={emailUrl}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-zinc-800/40 border-t border-neutral-200/80 dark:border-zinc-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Bonus credits applied instantly to your account</span>
          </div>
          <button 
            onClick={onClose}
            className="font-bold text-neutral-800 dark:text-zinc-200 hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
