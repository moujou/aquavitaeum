'use client';

import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useLanguage } from '@/context/LanguageContext';
import { JournalWithStats } from '@/hooks/useJournals';
import { Spirit, NoteSortOption, NoteFilterState } from '@/types/spirit.types';
import { OverviewLayout } from '@/hooks/useLayoutPreference';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { exportJournalsToFile, exportSpiritsToFile, importSpiritsIntoJournal } from '@/lib/google-drive-sync';
import { notifyDataMutated } from '@/lib/sync-events';
import { SpiritScanModal, SpiritApplyMode } from '@/components/features/scanner/SpiritScanModal';
import { SpiritAnalysisResult } from '@/services/ai-assistant-service';
import { JournalLandingHeader } from './JournalLandingHeader';
import { NoteEmptyState } from './NoteEmptyState';
import { NoteListView } from './layouts/NoteListView';
import { NoteGridView } from './layouts/NoteGridView';

interface JournalLandingPageProps {
  journal: JournalWithStats;
  spirits: Spirit[];
  layout: OverviewLayout;
  isLoading: boolean;
  onSelectSpirit: (id: string) => void;
  onNewNote: () => void;
  onNewNoteFromScan?: (
    result: SpiritAnalysisResult,
    uploadedImage?: string,
    mode?: SpiritApplyMode
  ) => Promise<string | null>;
  onDeleteSpirit: (id: string) => Promise<void>;
  onSelectModeChange?: (active: boolean) => void;
}

export function JournalLandingPage({
  journal,
  spirits,
  layout,
  isLoading,
  onSelectSpirit,
  onNewNote,
  onNewNoteFromScan,
  onDeleteSpirit,
  onSelectModeChange,
}: JournalLandingPageProps) {
  // ── Language ──────────────────────────────────────────────────────────────
  const { t, language } = useLanguage();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // ── Sorting state (persisted in localStorage) ─────────────────────────────
  const [sortBy, setSortBy] = useState<NoteSortOption>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aquavitaeum_note_sort') as NoteSortOption | null;
      if (saved && ['date_desc', 'rating_desc', 'rating_asc', 'name_asc', 'name_desc', 'abv_desc'].includes(saved)) {
        return saved;
      }
    }
    return 'date_desc';
  });

  const handleSortChange = (val: NoteSortOption) => {
    setSortBy(val);
    try {
      localStorage.setItem('aquavitaeum_note_sort', val);
    } catch {
      // ignore quota or storage issues
    }
  };

  // ── Filter state (Category & Min Rating only) ────────────────────────────
  const [filterState, setFilterState] = useState<NoteFilterState>({
    spiritType: 'All',
    minRating: 0,
  });

  // Filtered and sorted spirits
  const sortedAndFilteredSpirits = useMemo(() => {
    const filtered = spirits.filter((s) => {
      if (filterState.spiritType !== 'All' && s.spiritType !== filterState.spiritType) {
        return false;
      }
      if (filterState.minRating > 0 && (s.rating100 || 0) < filterState.minRating) {
        return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating_desc':
          return (b.rating100 || 0) - (a.rating100 || 0);
        case 'rating_asc':
          return (a.rating100 || 0) - (b.rating100 || 0);
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '', undefined, { sensitivity: 'base' });
        case 'abv_desc':
          return (b.abv || 0) - (a.abv || 0);
        case 'date_desc':
        default: {
          const dateA = new Date(a.dateTasted || a.createdAt || 0).getTime();
          const dateB = new Date(b.dateTasted || b.createdAt || 0).getTime();
          return dateB - dateA;
        }
      }
    });
  }, [spirits, filterState, sortBy]);

  // ── Multi-Select (shared hook — identical logic to JournalsOverview) ──────
  const {
    isSelectMode,
    selectedIds,
    confirmBulkDelete,
    setConfirmBulkDelete,
    enterSelectMode,
    exitSelectMode,
    toggleSelection,
    handleTouchStart,
    cancelLongPress,
    handleTouchEnd,
    handleBulkDelete,
  } = useMultiSelect(onSelectModeChange);

  const canDelete = selectedIds.size > 0;

  const handleImportNotes = async (file: File) => {
    const result = await importSpiritsIntoJournal(file, journal.id);
    notifyDataMutated();
    return result;
  };

  const handleApplyScan = async (
    result: SpiritAnalysisResult,
    uploadedImage?: string,
    mode?: SpiritApplyMode
  ) => {
    if (onNewNoteFromScan) {
      const newId = await onNewNoteFromScan(result, uploadedImage, mode);
      if (newId) {
        onSelectSpirit(newId);
      }
    }
  };

  // ── Shared props piped to every layout view ───────────────────────────────
  const selectModeProps = {
    isSelectMode,
    selectedIds,
    onToggleSelect: toggleSelection,
    onTouchStart: handleTouchStart,
    cancelLongPress,
    onTouchEnd: handleTouchEnd,
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full min-h-[300px]">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-[var(--brass-accent)] animate-spin mb-3" />
        <p className="font-display text-xs text-[var(--brass-accent)] animate-pulse uppercase tracking-wider">Uncasking...</p>
      </div>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full max-w-6xl mx-auto w-full px-3 sm:px-6 pt-2 sm:pt-4 pb-6">
      {/* ── Header with twin Sort & Filter dropdowns ────── */}
      <JournalLandingHeader
        journal={journal}
        noteCount={sortedAndFilteredSpirits.length}
        totalCount={spirits.length}
        filteredCount={sortedAndFilteredSpirits.length}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        filterState={filterState}
        onFilterChange={setFilterState}
        isSelectMode={isSelectMode}
        selectedCount={selectedIds.size}
        canDelete={canDelete}
        onConfirmDelete={() => setConfirmBulkDelete(true)}
        onExitSelectMode={exitSelectMode}
        onEnterSelectMode={enterSelectMode}
        onScanNote={() => setIsScanModalOpen(true)}
        onExportJournal={(id) => exportJournalsToFile([id])}
        onExportSelectedNotes={() => exportSpiritsToFile([...selectedIds], journal?.name || 'Journal')}
        onImportNotes={handleImportNotes}
        language={language}
      />

      {/* ── Layout content or Empty states ─────────────────────────────────── */}
      {spirits.length === 0 ? (
        <NoteEmptyState
          onNewNote={onNewNote}
          onScanNote={() => setIsScanModalOpen(true)}
        />
      ) : sortedAndFilteredSpirits.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-6 sm:p-10 my-4 rounded-2xl bg-[var(--pub-bg-panel)]/50 border border-[var(--parchment-border)] animate-fade-in">
          <div className="w-10 h-10 rounded-full border border-[var(--parchment-border)] bg-[var(--pub-bg-alt)] flex items-center justify-center text-[var(--forest-green)] mb-2.5 shadow-xs">
            <Filter size={18} />
          </div>
          <h3 className="font-display text-sm font-bold text-[var(--foreground)] mb-1">
            {t('noFilteredNotes')}
          </h3>
          <p className="text-xs text-[var(--sepia-muted)] mb-3 max-w-xs">
            {language === 'DE'
              ? 'Passe die Filter an oder setze sie zurück, um Notizen zu sehen.'
              : 'Adjust or reset your active filters to see tasting notes.'}
          </p>
          <button
            type="button"
            onClick={() => setFilterState({ spiritType: 'All', minRating: 0 })}
            className="px-3 py-1.5 rounded-lg border border-[var(--brass-accent)]/40 bg-[var(--brass-accent)]/10 text-[var(--brass-accent)] hover:bg-[var(--brass-accent)]/20 text-xs font-display font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {t('resetFilters')}
          </button>
        </div>
      ) : (
        <div className="flex-1">
          {layout === 'list' && (
            <NoteListView
              spirits={sortedAndFilteredSpirits}
              onSelect={onSelectSpirit}
              {...selectModeProps}
            />
          )}
          {layout === 'grid' && (
            <NoteGridView
              spirits={sortedAndFilteredSpirits}
              onSelect={onSelectSpirit}
              {...selectModeProps}
            />
          )}
        </div>
      )}

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmBulkDelete}
        title={language === 'DE' ? 'Warnung / Achtung!' : 'Warning / Achtung!'}
        subtitle={t('deleteModalSubtitle')}
        message={
          selectedIds.size === 1
            ? <>{t('deleteModalMessage')}?</>
            : <>{selectedIds.size} {t('deleteBulkNotesConfirm')}</>
        }
        confirmLabel={t('confirmDelete')}
        cancelLabel={t('cancel')}
        onConfirm={() => handleBulkDelete(onDeleteSpirit)}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      {/* AI Assistant Spirit Scan Modal */}
      <SpiritScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onApply={handleApplyScan}
      />
    </div>
  );
}
