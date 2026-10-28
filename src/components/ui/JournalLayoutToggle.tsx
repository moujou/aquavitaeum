'use client';

import React from 'react';
import { BookOpen, Book } from 'lucide-react';
import { JournalShelfLayout } from '@/hooks/useLayoutPreference';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface JournalLayoutToggleProps {
  value: JournalShelfLayout;
  onChange: (l: JournalShelfLayout) => void;
  className?: string;
}

export function JournalLayoutToggle({ value, onChange, className }: JournalLayoutToggleProps) {
  let manuscriptLabel = 'Open Manuscript View';
  let bookshelfLabel = 'Hardcover Books View';

  try {
    const lang = useLanguage();
    if (lang?.t) {
      manuscriptLabel = lang.t('layoutManuscriptView');
      bookshelfLabel = lang.t('layoutBookshelfView');
    }
  } catch {
    // Graceful fallback for test environments without LanguageProvider
  }

  return (
    <div className={cn('bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] rounded-lg p-0.5 flex gap-0.5', className)}>
      <button
        type="button"
        onClick={() => onChange('manuscript')}
        className={cn(
          'p-2 rounded-md transition-all cursor-pointer',
          value === 'manuscript'
            ? 'bg-[var(--wood-selection)] text-[var(--fab-text)] shadow-xs'
            : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
        )}
        aria-label={manuscriptLabel}
        title={manuscriptLabel}
      >
        <BookOpen size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange('bookshelf')}
        className={cn(
          'p-2 rounded-md transition-all cursor-pointer',
          value === 'bookshelf'
            ? 'bg-[var(--wood-selection)] text-[var(--fab-text)] shadow-xs'
            : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
        )}
        aria-label={bookshelfLabel}
        title={bookshelfLabel}
      >
        <Book size={16} />
      </button>
    </div>
  );
}
