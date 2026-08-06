'use client';

import React from 'react';

export function SpiritCardSkeleton() {
  return (
    <div className="w-full flex-shrink-0 rounded-xl border border-white/5 bg-white/[0.03] p-4 animate-pulse overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="w-12 h-16 rounded-sm bg-white/10 flex-shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
            <div className="h-2.5 bg-white/5 rounded w-2/3" />
          </div>
        </div>
        <div className="w-12 h-10 rounded bg-white/10 flex-shrink-0" />
      </div>
    </div>
  );
}
