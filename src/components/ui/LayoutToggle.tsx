'use client';

import React from 'react';
import { AlignJustify, LayoutGrid } from 'lucide-react';
import { OverviewLayout } from '@/hooks/useLayoutPreference';
import { cn } from '@/lib/utils';

interface LayoutToggleProps {
  value: OverviewLayout;
  onChange: (l: OverviewLayout) => void;
  className?: string;
}

export function LayoutToggle({ value, onChange, className }: LayoutToggleProps) {
  return (
    <div className={cn('bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] rounded-lg p-0.5 flex gap-0.5', className)}>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={cn(
          'p-2 rounded-md transition-all cursor-pointer',
          value === 'list'
            ? 'bg-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
            : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
        )}
        aria-label="List View"
      >
        <AlignJustify size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={cn(
          'p-2 rounded-md transition-all cursor-pointer',
          value === 'grid'
            ? 'bg-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
            : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
        )}
        aria-label="Grid View"
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  );
}
