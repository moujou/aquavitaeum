'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { useLanguage } from '@/context/LanguageContext';

interface NoteEmptyStateProps {
  onNewNote: () => void;
}

export function NoteEmptyState({ onNewNote }: NoteEmptyStateProps) {
  const { t } = useLanguage();
  return (
    // Centering wrapper — works in both journal-landing scroll container and detail flex section
    <div className="flex items-center justify-center w-full p-6 py-12">
      <div className="w-full max-w-xl flex flex-col items-center justify-center min-h-[380px] rounded-2xl border border-[var(--parchment-border)] bg-[var(--parchment-bg)] p-8 sm:p-12 text-center shadow-[0_4px_24px_var(--parchment-shadow)] animate-fade-in">
        <div className="w-20 h-20 rounded-full border-2 border-[var(--forest-green)]/40 flex items-center justify-center bg-[var(--wood-dark)]/10 mb-6 shadow-[0_0_24px_rgba(35,115,71,0.15)] animate-fade-in-up">
          <WhiskyLogo size={38} className="text-[var(--forest-green)]" />
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-wide mb-3">
          {t('cellarEmptyTitle')}
        </h2>
        <p className="font-body text-xs sm:text-sm text-[var(--sepia-muted)] max-w-md leading-relaxed mb-8">
          {t('cellarEmptySubtitle')}
        </p>
        <button
          type="button"
          onClick={onNewNote}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-xs sm:text-sm font-display uppercase tracking-wider font-bold border shrink-0 bg-[var(--fab-bg)] text-[var(--fab-text)] border-[var(--fab-border)] hover:bg-[var(--fab-bg-hover)] transition-all duration-250 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} />
          {t('newNote')}
        </button>
      </div>
    </div>
  );
}
