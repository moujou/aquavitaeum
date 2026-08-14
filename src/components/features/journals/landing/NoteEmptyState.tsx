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
      <div className="w-full max-w-xl flex flex-col items-center justify-center min-h-[380px] rounded-xl border border-[var(--brass-accent)]/30 bg-black/45 backdrop-blur-md p-8 sm:p-12 text-center shadow-[0_15px_35px_rgba(0,0,0,0.6)] border-t-[var(--brass-accent)]/50 border-l-[var(--brass-accent)]/50 animate-fade-in">
        <div className="w-20 h-20 rounded-full border-2 border-[var(--brass-accent)]/40 flex items-center justify-center bg-[var(--brass-accent)]/10 mb-6 shadow-[0_0_35px_rgba(197,155,39,0.25)] animate-fade-in-up">
          <WhiskyLogo size={38} className="text-[var(--brass-accent)]" />
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--brass-accent)] tracking-wide mb-3">
          {t('cellarEmptyTitle')}
        </h2>
        <p className="font-body text-xs sm:text-sm text-white/50 max-w-md leading-relaxed mb-8">
          {t('cellarEmptySubtitle')}
        </p>
        <button
          type="button"
          onClick={onNewNote}
          className="flex items-center gap-2 px-5 py-2.5 rounded text-xs sm:text-sm font-display uppercase tracking-wider font-bold border shrink-0 bg-[var(--fab-bg)] text-[var(--fab-text)] border-[var(--brass-accent)]/40 hover:bg-[var(--fab-bg-hover)] hover:text-[var(--wood-dark)] transition-all duration-250 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-[1.02]"
        >
          <Plus size={14} />
          {t('newNote')}
        </button>
      </div>
    </div>
  );
}
