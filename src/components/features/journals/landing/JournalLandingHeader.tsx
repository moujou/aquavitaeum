'use client';

import React from 'react';
import { Trash2, X } from 'lucide-react';
import { JournalWithStats } from '@/hooks/useJournals';

interface JournalLandingHeaderProps {
  journal: JournalWithStats;
  noteCount: number;
  /** Select mode — when true, shows Trash + Cancel instead of note count */
  isSelectMode?: boolean;
  selectedCount?: number;
  canDelete?: boolean;
  onConfirmDelete?: () => void;
  onExitSelectMode?: () => void;
  language?: string;
}

export function JournalLandingHeader({
  journal,
  noteCount,
  isSelectMode = false,
  selectedCount = 0,
  canDelete = false,
  onConfirmDelete,
  onExitSelectMode,
  language = 'EN',
}: JournalLandingHeaderProps) {
  return (
    <div className="px-4 sm:px-6 pt-6 pb-2 w-full">
      <div className="flex items-center justify-between gap-3 min-w-0">
        {/* Left: Journal name + count/selection badge */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-wide truncate">
            {journal.name}
          </h1>
          {isSelectMode && selectedCount > 0 && (
            <span className="text-xs font-body text-[var(--brass-accent)] font-semibold tabular-nums shrink-0 bg-[var(--brass-accent)]/10 px-2 py-0.5 rounded-full border border-[var(--brass-accent)]/30">
              {selectedCount} selected
            </span>
          )}
          {!isSelectMode && (
            <div className="bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full text-xs font-mono text-white/60 shrink-0">
              {noteCount} {noteCount === 1 ? 'note' : 'notes'}
            </div>
          )}
        </div>

        {/* Right: Select mode action buttons */}
        {isSelectMode && (
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Delete — red, active when ≥1 selected */}
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={!canDelete}
              title={language === 'DE' ? 'Löschen' : 'Delete'}
              className={[
                'p-2 rounded-lg border transition-all cursor-pointer',
                canDelete
                  ? 'bg-red-950/40 border-red-500/40 text-red-400 hover:bg-red-900/50 shadow-xs'
                  : 'bg-transparent border-transparent text-white/15 cursor-not-allowed',
              ].join(' ')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {/* Cancel */}
            <button
              type="button"
              onClick={onExitSelectMode}
              title={language === 'DE' ? 'Abbrechen' : 'Cancel'}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/25 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {journal.description && !isSelectMode && (
        <p className="font-body text-xs sm:text-sm text-white/55 italic mt-1.5 leading-relaxed">
          {journal.description}
        </p>
      )}

      {/* Modern Specular Gradient Hairline Divider */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--brass-accent)]/30 to-transparent mt-4" />
    </div>
  );
}
