'use client';

import React, { useRef, useState } from 'react';
import { Trash2, X, Download, CheckSquare, Upload, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { JournalWithStats } from '@/hooks/useJournals';
import { useAiAssistantConfig } from '@/hooks/useAiAssistantConfig';
import { PageActionsDropdown } from '@/components/ui/PageActionsDropdown';
import { NoteSortDropdown } from './NoteSortDropdown';
import { NoteFilterDropdown } from './NoteFilterDropdown';
import { NoteSortOption, NoteFilterState } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface JournalLandingHeaderProps {
  journal: JournalWithStats;
  noteCount?: number;
  totalCount?: number;
  filteredCount?: number;
  sortBy?: NoteSortOption;
  onSortChange?: (value: NoteSortOption) => void;
  filterState?: NoteFilterState;
  onFilterChange?: (nextState: NoteFilterState) => void;
  /** Select mode — when true, shows Trash + Cancel instead of normal controls */
  isSelectMode?: boolean;
  selectedCount?: number;
  canDelete?: boolean;
  onConfirmDelete?: () => void;
  onExitSelectMode?: () => void;
  onEnterSelectMode?: () => void;
  onScanNote?: () => void;
  onExportJournal?: (id: string) => void;
  onExportSelectedNotes?: () => void;
  onImportNotes?: (file: File) => Promise<{ importedCount: number }>;
  language?: string;
}

export function JournalLandingHeader({
  journal,
  sortBy,
  onSortChange,
  filterState,
  onFilterChange,
  isSelectMode = false,
  selectedCount = 0,
  canDelete = false,
  onConfirmDelete,
  onExitSelectMode,
  onEnterSelectMode,
  onScanNote,
  onExportJournal,
  onExportSelectedNotes,
  onImportNotes,
  language = 'EN',
}: JournalLandingHeaderProps) {
  const { language: currentLang } = useLanguage();
  const activeLang = language || currentLang;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { hasAiKey } = useAiAssistantConfig();
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportNotice(null);
      if (onImportNotes) {
        const result = await onImportNotes(file);
        setImportNotice({
          type: 'success',
          message:
            activeLang === 'DE'
              ? `${result.importedCount} Notiz(en) erfolgreich importiert!`
              : `Successfully imported ${result.importedCount} note(s)!`,
        });
        setTimeout(() => setImportNotice(null), 3500);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : activeLang === 'DE'
            ? 'Import fehlgeschlagen.'
            : 'Import failed.';
      setImportNotice({
        type: 'error',
        message,
      });
      setTimeout(() => setImportNotice(null), 4000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="pb-1 w-full">
      <div className="flex items-center justify-between gap-2 w-full min-h-[36px]">
        {/* Left Slot: Sort & Filter twin dropdowns (or Selection badge in select mode) */}
        <div className="flex items-center gap-2 min-w-0">
          {isSelectMode ? (
            selectedCount > 0 ? (
              <span className="text-xs font-body text-[var(--brass-accent)] font-semibold tabular-nums shrink-0 bg-[var(--brass-accent)]/10 px-2.5 py-1 rounded-full border border-[var(--brass-accent)]/30">
                {selectedCount} {activeLang === 'DE' ? 'ausgewählt' : 'selected'}
              </span>
            ) : null
          ) : (
            sortBy && onSortChange && filterState && onFilterChange && (
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <NoteSortDropdown
                  value={sortBy}
                  onChange={onSortChange}
                />
                <NoteFilterDropdown
                  filterState={filterState}
                  onChange={onFilterChange}
                />
              </div>
            )
          )}
        </div>

        {/* Right Slot: Actions (AI assistant button, PageActionsDropdown, or Done button) */}
        <div className="flex items-center gap-2 shrink-0">
          {isSelectMode ? (
            <>
              {/* Actions Dropdown in Multi-Select Mode */}
              <PageActionsDropdown
                title={activeLang === 'DE' ? 'Aktionen' : 'Actions'}
                items={[
                  {
                    id: 'export-selected-notes',
                    label: `${activeLang === 'DE' ? 'Notizen exportieren' : 'Export Notes'}${selectedCount > 0 ? ` (${selectedCount})` : ''}`,
                    icon: <Download size={16} />,
                    onClick: () => onExportSelectedNotes?.(),
                    disabled: selectedCount === 0,
                  },
                  {
                    id: 'delete-selected-notes',
                    label: `${activeLang === 'DE' ? 'Notizen löschen' : 'Delete Notes'}${selectedCount > 0 ? ` (${selectedCount})` : ''}`,
                    icon: <Trash2 size={16} />,
                    onClick: () => onConfirmDelete?.(),
                    disabled: !canDelete,
                    destructive: true,
                  },
                ]}
              />
              {/* Done button */}
              <button
                type="button"
                onClick={onExitSelectMode}
                title={activeLang === 'DE' ? 'Fertig' : 'Done'}
                className="h-9 px-2.5 sm:px-3 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] hover:bg-[var(--pub-bg-alt)] text-[var(--foreground)] transition-all flex items-center gap-1 text-xs font-display font-bold uppercase tracking-wider shadow-xs active:scale-95 cursor-pointer select-none min-h-[36px]"
              >
                <X className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{activeLang === 'DE' ? 'Fertig' : 'Done'}</span>
              </button>
            </>
          ) : (
            <>
              {/* Cask & Spirit AI Assistant Scan Button */}
              {hasAiKey && onScanNote && (
                <button
                  type="button"
                  onClick={onScanNote}
                  className="w-9 h-9 rounded-lg bg-[var(--forest-green)] hover:bg-[var(--fab-bg-hover)] text-white border border-emerald-400/30 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 min-h-[36px]"
                  title={activeLang === 'DE' ? 'Cask & Spirit Assistent: Flasche scannen' : 'Cask & Spirit Assistant: Scan bottle'}
                  aria-label={activeLang === 'DE' ? 'Flasche scannen' : 'Scan bottle'}
                >
                  <Sparkles size={16} />
                </button>
              )}

              {/* Gear / Page Actions Dropdown */}
              <PageActionsDropdown
                title={activeLang === 'DE' ? 'Aktionen' : 'Actions'}
                items={[
                  {
                    id: 'select-notes',
                    label: activeLang === 'DE' ? 'Notizen auswählen' : 'Select Notes',
                    icon: <CheckSquare size={16} />,
                    onClick: () => onEnterSelectMode?.(),
                  },
                  {
                    id: 'import-notes',
                    label: activeLang === 'DE' ? 'Notizen importieren' : 'Import Notes',
                    icon: <Upload size={16} />,
                    onClick: () => fileInputRef.current?.click(),
                  },
                  {
                    id: 'export-journal',
                    label: activeLang === 'DE' ? 'Journal exportieren' : 'Export Journal',
                    icon: <Download size={16} />,
                    onClick: () => onExportJournal?.(journal?.id || ''),
                  },
                ]}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept=".json,application/json"
                className="hidden"
              />
            </>
          )}
        </div>
      </div>

      {importNotice && (
        <div
          className={cn(
            'mt-2 flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border animate-fade-in font-medium z-10 w-fit',
            importNotice.type === 'success'
              ? 'bg-[var(--forest-green)]/15 text-[var(--forest-green)] border-[var(--forest-green)]/40 dark:text-emerald-300'
              : 'bg-red-950/40 text-red-700 dark:text-red-300 border-red-500/40'
          )}
        >
          {importNotice.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{importNotice.message}</span>
        </div>
      )}

      {/* Modern Specular Clover Green Gradient Divider */}
      <div className="divider-clover-glow mt-1.5 mb-2.5" />

      {/* Subtle Journal Context: Name & Description */}
      {!isSelectMode && journal && (
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-2 min-w-0">
          <h2 className="font-display font-bold text-sm sm:text-base text-[var(--foreground)] tracking-wide truncate shrink-0">
            {journal.name}
          </h2>
          {journal.description && (
            <p className="font-body text-[11px] sm:text-xs text-[var(--sepia-muted)] italic truncate max-w-xl">
              {journal.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
