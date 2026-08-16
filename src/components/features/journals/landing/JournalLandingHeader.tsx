'use client';

import React from 'react';
import { Trash2, X, Download, CheckSquare } from 'lucide-react';
import { JournalWithStats } from '@/hooks/useJournals';
import { PageActionsDropdown } from '@/components/ui/PageActionsDropdown';

interface JournalLandingHeaderProps {
  journal: JournalWithStats;
  noteCount: number;
  /** Select mode — when true, shows Trash + Cancel instead of note count */
  isSelectMode?: boolean;
  selectedCount?: number;
  canDelete?: boolean;
  onConfirmDelete?: () => void;
  onExitSelectMode?: () => void;
  onEnterSelectMode?: () => void;
  onExportJournal?: (id: string) => void;
  onExportSelectedNotes?: () => void;
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
  onEnterSelectMode,
  onExportJournal,
  onExportSelectedNotes,
  language = 'EN',
}: JournalLandingHeaderProps) {
  return (
    <div className="pb-2 w-full">
      <div className="flex items-center justify-between gap-3 min-w-0 min-h-[36px]">
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

        {/* Right: Select mode action buttons OR Normal mode Actions Dropdown */}
        {isSelectMode ? (
          <div className="flex items-center gap-2 shrink-0">
            {/* Gear Dropdown with Export Notes & Delete Note actions */}
            <PageActionsDropdown
              title={language === 'DE' ? 'Aktionen' : 'Actions'}
              items={[
                {
                  id: 'export-selected-notes',
                  label: `${language === 'DE' ? 'Notizen exportieren' : 'Export Notes'}${selectedCount > 0 ? ` (${selectedCount})` : ''}`,
                  icon: <Download size={16} />,
                  onClick: () => onExportSelectedNotes?.(),
                  disabled: selectedCount === 0,
                },
                {
                  id: 'delete-selected-notes',
                  label: `${language === 'DE' ? 'Notizen löschen' : 'Delete Notes'}${selectedCount > 0 ? ` (${selectedCount})` : ''}`,
                  icon: <Trash2 size={16} />,
                  onClick: () => onConfirmDelete?.(),
                  disabled: !canDelete,
                  destructive: true,
                },
              ]}
            />
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
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <PageActionsDropdown
              title={language === 'DE' ? 'Aktionen' : 'Actions'}
              items={[
                {
                  id: 'select-notes',
                  label: language === 'DE' ? 'Notizen auswählen' : 'Select Notes',
                  icon: <CheckSquare size={16} />,
                  onClick: () => onEnterSelectMode?.(),
                },
                {
                  id: 'export-journal',
                  label: language === 'DE' ? 'Journal exportieren' : 'Export Journal',
                  icon: <Download size={16} />,
                  onClick: () => onExportJournal?.(journal.id),
                },
              ]}
            />
          </div>
        )}
      </div>

      {journal.description && !isSelectMode && (
        <p className="font-body text-xs sm:text-sm text-[var(--sepia-muted)] italic mt-1.5 leading-relaxed">
          {journal.description}
        </p>
      )}

      {/* Modern Specular Clover Green Gradient Divider */}
      <div className="divider-clover-glow mt-4" />
    </div>
  );
}
