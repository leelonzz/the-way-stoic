import React from 'react';

// Lightweight skeleton component optimized for performance
const FastSkeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-stone-200 rounded ${className}`} />
);

export function JournalSkeleton(): JSX.Element {
  return (
    <div className="h-screen flex bg-stone-50">
      {/* Entry List Sidebar Skeleton - Simplified */}
      <div className="w-80 border-r border-stone-200 bg-white flex flex-col h-full">
        {/* Header Section */}
        <div className="p-4 border-b border-stone-200">
          <FastSkeleton className="h-10 w-full mb-3" />
          <FastSkeleton className="h-10 w-full" />
        </div>

        {/* Sync Status */}
        <div className="px-4 py-2 border-b border-stone-200">
          <FastSkeleton className="h-4 w-24" />
        </div>

        {/* Entries List - Reduced complexity */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Today Section */}
          <div className="mb-4">
            <div className="px-2 py-2 mb-2">
              <FastSkeleton className="h-4 w-16" />
            </div>
            <div className="space-y-1">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 rounded-lg border border-stone-200">
                  <div className="flex items-start justify-between mb-2">
                    <FastSkeleton className="h-4 w-20" />
                    <FastSkeleton className="h-3 w-12" />
                  </div>
                  <FastSkeleton className="h-3 w-full mb-1" />
                  <FastSkeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Entries - Simplified */}
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg border border-stone-200">
                <div className="flex items-start justify-between mb-2">
                  <FastSkeleton className="h-4 w-20" />
                  <FastSkeleton className="h-3 w-14" />
                </div>
                <FastSkeleton className="h-3 w-full mb-1" />
                <FastSkeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Journal Editor Skeleton */}
      <div className="flex-1 flex flex-col bg-white h-full">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FastSkeleton className="h-8 w-32" />
              <FastSkeleton className="h-6 w-20" />
            </div>
            <div className="flex items-center space-x-2">
              <FastSkeleton className="h-8 w-8" />
              <FastSkeleton className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Editor Content Skeleton */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Title Skeleton */}
            <FastSkeleton className="h-10 w-2/3" />

            {/* Content Blocks - Simplified */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <FastSkeleton className="h-4 w-full" />
                  <FastSkeleton className="h-4 w-4/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
