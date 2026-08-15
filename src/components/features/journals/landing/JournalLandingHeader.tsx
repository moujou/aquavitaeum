'use client';

import React from 'react';
import { Trash2, X } from 'lucide-react';
import { JournalWithStats } from '@/hooks/useJournals';
import { cn } from '@/lib/utils';

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
            <div className="bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/25 px-3 py-1 rounded-full text-xs font-mono text-[var(--forest-green)] font-semibold shrink-0">
              {noteCount} {noteCount === 1 ? 'note' : 'notes'}
            </div>
          )}
        </div>

        {/* Right: Select mode action buttons */}
        {isSelectMode && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Delete — prominent red button with counter */}
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={!canDelete}
              title={language === 'DE' ? 'Löschen' : 'Delete'}
              className={cn(
                'px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider select-none shadow-xs',
                canDelete
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-md active:scale-95 cursor-pointer'
                  : 'bg-red-100/70 border-red-200/60 text-red-400/50 cursor-not-allowed'
              )}
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'DE' ? 'Löschen' : 'Delete'}{selectedCount > 0 ? ` (${selectedCount})` : ''}</span>
            </button>
            {/* Done / Cancel button */}
            <button
              type="button"
              onClick={onExitSelectMode}
              title={language === 'DE' ? 'Fertig' : 'Done'}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] hover:bg-[var(--pub-bg-alt)] text-[var(--foreground)] transition-all flex items-center gap-1 text-xs font-display font-bold uppercase tracking-wider shadow-xs active:scale-95 cursor-pointer select-none"
            >
              <X className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{language === 'DE' ? 'Fertig' : 'Done'}</span>
            </button>
          </div>
        )}
      </div>

      {journal.description && !isSelectMode && (
        <p className="font-body text-xs sm:text-sm text-[var(--sepia-muted)] italic mt-1.5 leading-relaxed">
          {journal.description}
        </p>
      )}

      {/* Modern Specular Gradient Hairline Divider */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--brass-accent)]/30 to-transparent mt-4" />
    </div>
  );
}
