/**
 * Loading Skeleton Components
 * Provides smooth loading UX with skeleton placeholders
 */

import React from 'react';

export const AppScreenSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="col-span-1 lg:col-span-8 space-y-6">
          {/* Product Hunt Banner Skeleton */}
          <div className="relative overflow-hidden bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-zinc-700 dark:to-zinc-800 text-white p-5 sm:p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-neutral-300 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="h-16 bg-neutral-300 dark:bg-zinc-600 rounded-2xl w-full sm:w-1/2" />
          </div>

          {/* Form Card Skeleton */}
          <div className="bg-white dark:bg-zinc-900/95 rounded-3xl p-6 md:p-8 border border-black/[0.04] dark:border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
            {/* Title Skeleton */}
            <div className="space-y-4 mb-8">
              <div className="h-3 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-32 animate-pulse" />
              <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-full animate-pulse" />
              <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-5/6 animate-pulse" />
            </div>

            {/* Learning Depth Buttons Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-950/60"
                >
                  <div className="flex items-start justify-between w-full mb-3">
                    <div className="w-10 h-10 bg-neutral-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
                    <div className="w-16 h-6 bg-neutral-200 dark:bg-zinc-800 rounded-md animate-pulse" />
                  </div>
                  <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-24 mb-2 animate-pulse" />
                  <div className="h-3 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-full animate-pulse" />
                </div>
              ))}
            </div>

            {/* Input Field Skeleton */}
            <div className="space-y-4">
              <div className="flex gap-2 bg-neutral-100/60 dark:bg-zinc-950 p-1 rounded-2xl w-fit">
                <div className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 h-10 w-32 animate-pulse" />
                <div className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-zinc-900 h-10 w-32 animate-pulse" />
              </div>

              {/* Text Input Skeleton */}
              <div className="space-y-2">
                <div className="h-3 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-20 animate-pulse" />
                <div className="h-12 bg-neutral-100 dark:bg-zinc-950 rounded-2xl border border-neutral-200 dark:border-zinc-800 animate-pulse" />
              </div>

              {/* Submit Button Skeleton */}
              <div className="h-12 bg-gradient-to-r from-neutral-300 to-neutral-400 dark:from-zinc-700 dark:to-zinc-800 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          {/* Stats Card Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-950/60 border border-neutral-200/50 dark:border-zinc-800/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-200 dark:bg-zinc-800 rounded-xl animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-20 animate-pulse" />
                    <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-32 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Example Workspaces Skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-40 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            >
              <div className="aspect-video bg-neutral-200 dark:bg-zinc-800 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-3/4 animate-pulse" />
                <div className="h-3 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-full animate-pulse" />
                <div className="h-8 bg-neutral-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const WorkspaceSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-48 animate-pulse" />
          <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-96 animate-pulse" />
        </div>
        <div className="h-10 w-24 bg-neutral-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-zinc-800">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-24 bg-neutral-200 dark:bg-zinc-800 rounded-t-lg animate-pulse"
          />
        ))}
      </div>

      {/* Content Area Skeleton */}
      <div className="space-y-4">
        {/* Summary Section */}
        <div className="rounded-2xl border border-neutral-200 dark:border-zinc-800 p-6 space-y-4">
          <div className="h-5 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-32 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-5/6 animate-pulse" />
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-200 dark:border-zinc-800 p-4 space-y-3"
            >
              <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-24 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 bg-neutral-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                <div className="h-3 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-4/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PageLoadingIndicator: React.FC<{ message?: string }> = ({
  message = 'Loading your workspace...'
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950">
      <div className="text-center space-y-6 max-w-md">
        {/* Animated Logo or Icon */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0071e3] to-indigo-600 rounded-full animate-spin opacity-20" />
            <div className="absolute inset-2 bg-gradient-to-r from-[#0071e3] to-indigo-600 rounded-full animate-spin opacity-40" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-[#0071e3] to-indigo-600 rounded-full" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-lg font-semibold text-neutral-900 dark:text-zinc-100">{message}</p>
          <p className="text-sm text-neutral-500 dark:text-zinc-400">
            This usually takes 10-30 seconds
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0071e3] to-indigo-600 rounded-full"
            style={{
              animation: 'progress 2s ease-in-out infinite'
            }}
          />
        </div>

        {/* Tips */}
        <div className="text-[11px] text-neutral-400 dark:text-zinc-500 space-y-1">
          <p>💡 Tip: The first generation takes longer as we process your content.</p>
          <p>🚀 Subsequent summaries load much faster!</p>
        </div>

        <style>{`
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 100%; }
            100% { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
};
