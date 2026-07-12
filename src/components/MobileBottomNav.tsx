import React from 'react';
import { Search, BookOpen, GraduationCap, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileBottomNavProps {
  currentScreen: string;
  activeSummary: any;
  learnMode: boolean;
  showProfileModal: boolean;
  onNavigateHome: () => void;
  onNavigateWorkspace: () => void;
  onNavigateDashboard: () => void;
  onOpenLeaderboard: () => void;
}

export default function MobileBottomNav({
  currentScreen,
  activeSummary,
  learnMode,
  showProfileModal,
  onNavigateHome,
  onNavigateWorkspace,
  onNavigateDashboard,
  onOpenLeaderboard
}: MobileBottomNavProps) {
  const isHomeActive = currentScreen === 'app' && !activeSummary && !learnMode && !showProfileModal;
  const isWorkspaceActive = currentScreen === 'app' && !!activeSummary && !showProfileModal;
  const isDashboardActive = currentScreen === 'app' && !activeSummary && learnMode && !showProfileModal;
  const isLeaderboardActive = showProfileModal;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-zinc-900 z-45 md:hidden pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center h-16 px-2">
        {/* Summarize / Home */}
        <button
          onClick={onNavigateHome}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none active:scale-95 transition cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Search
              className={`w-5 h-5 transition duration-200 ${
                isHomeActive
                  ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                  : 'text-slate-400 dark:text-zinc-500'
              }`}
            />
            {isHomeActive && (
              <motion.span
                layoutId="activeDot"
                className="absolute -bottom-1.5 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"
              />
            )}
          </div>
          <span
            className={`text-[10px] mt-1 font-semibold tracking-wide ${
              isHomeActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-450 dark:text-zinc-500'
            }`}
          >
            Summarize
          </span>
        </button>

        {/* Study Workspace */}
        <button
          onClick={onNavigateWorkspace}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none active:scale-95 transition cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <BookOpen
              className={`w-5 h-5 transition duration-200 ${
                isWorkspaceActive
                  ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                  : activeSummary
                  ? 'text-slate-600 dark:text-zinc-300'
                  : 'text-slate-300 dark:text-zinc-700'
              }`}
            />
            {!activeSummary && (
              <span className="absolute -top-1 -right-1 bg-amber-500 w-1.5 h-1.5 rounded-full ring-2 ring-white dark:ring-zinc-950" />
            )}
            {isWorkspaceActive && (
              <motion.span
                layoutId="activeDot"
                className="absolute -bottom-1.5 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"
              />
            )}
          </div>
          <span
            className={`text-[10px] mt-1 font-semibold tracking-wide ${
              isWorkspaceActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : activeSummary
                ? 'text-slate-500 dark:text-zinc-400'
                : 'text-slate-350 dark:text-zinc-650'
            }`}
          >
            Study Board
          </span>
        </button>

        {/* Learning Hub */}
        <button
          onClick={onNavigateDashboard}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none active:scale-95 transition cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <GraduationCap
              className={`w-5 h-5 transition duration-200 ${
                isDashboardActive
                  ? 'text-indigo-600 dark:text-indigo-400 scale-110 font-bold'
                  : 'text-slate-400 dark:text-zinc-500'
              }`}
            />
            {isDashboardActive && (
              <motion.span
                layoutId="activeDot"
                className="absolute -bottom-1.5 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"
              />
            )}
          </div>
          <span
            className={`text-[10px] mt-1 font-semibold tracking-wide ${
              isDashboardActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-450 dark:text-zinc-500'
            }`}
          >
            Learning Hub
          </span>
        </button>

        {/* Leaderboard / Profile */}
        <button
          onClick={onOpenLeaderboard}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none active:scale-95 transition cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Trophy
              className={`w-5 h-5 transition duration-200 ${
                isLeaderboardActive
                  ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                  : 'text-slate-400 dark:text-zinc-500'
              }`}
            />
            {isLeaderboardActive && (
              <motion.span
                layoutId="activeDot"
                className="absolute -bottom-1.5 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"
              />
            )}
          </div>
          <span
            className={`text-[10px] mt-1 font-semibold tracking-wide ${
              isLeaderboardActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-450 dark:text-zinc-500'
            }`}
          >
            Referrals
          </span>
        </button>
      </div>
    </div>
  );
}
