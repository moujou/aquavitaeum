'use client';

import React from 'react';
import { BookOpen, Library } from 'lucide-react';
import { JournalShelfLayout } from '@/hooks/useLayoutPreference';
import { cn } from '@/lib/utils';

interface JournalLayoutToggleProps {
  value: JournalShelfLayout;
  onChange: (l: JournalShelfLayout) => void;
  className?: string;
}

export function JournalLayoutToggle({ value, onChange, className }: JournalLayoutToggleProps) {
  return (
    <div className={cn('bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] rounded-lg p-0.5 flex gap-0.5', className)}>
      <button
        type="button"
        onClick={() => onChange('manuscript')}
        className={cn(
          'p-2 rounded-md transition-all cursor-pointer',
          value === 'manuscript'
            ? 'bg-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
            : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
        )}
        aria-label="Manuscript View"
        title="Manuscript View"
      >
        <BookOpen size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange('bookshelf')}
        className={cn(
          'p-2 rounded-md transition-all cursor-pointer',
          value === 'bookshelf'
            ? 'bg-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
            : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
        )}
        aria-label="Bookshelf View"
        title="Bookshelf View"
      >
        <Library size={16} />
      </button>
    </div>
  );
}
