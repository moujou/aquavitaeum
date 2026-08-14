'use client';

import React from 'react';
import { AlignJustify, LayoutGrid, Table2 } from 'lucide-react';
import { OverviewLayout } from '@/hooks/useLayoutPreference';
import { cn } from '@/lib/utils';

interface LayoutToggleProps {
  value: OverviewLayout;
  onChange: (l: OverviewLayout) => void;
  className?: string;
}

export function LayoutToggle({ value, onChange, className }: LayoutToggleProps) {
  return (
    <div className={cn('bg-white/5 border border-white/10 rounded-lg p-0.5 flex gap-0.5', className)}>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={cn(
          'p-2 rounded-md transition-all cursor-pointer',
          value === 'list'
            ? 'bg-[var(--brass-accent)] text-[var(--wood-dark)]'
            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
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
            ? 'bg-[var(--brass-accent)] text-[var(--wood-dark)]'
            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
        )}
        aria-label="Grid View"
      >
        <LayoutGrid size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange('table')}
        className={cn(
          'p-2 rounded-md transition-all cursor-pointer',
          value === 'table'
            ? 'bg-[var(--brass-accent)] text-[var(--wood-dark)]'
            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
        )}
        aria-label="Table View"
      >
        <Table2 size={16} />
      </button>
    </div>
  );
}
