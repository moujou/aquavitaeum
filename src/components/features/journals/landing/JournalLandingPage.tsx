'use client';

import React from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useLanguage } from '@/context/LanguageContext';
import { JournalWithStats } from '@/hooks/useJournals';
import { Spirit } from '@/types/spirit.types';
import { OverviewLayout } from '@/hooks/useLayoutPreference';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { exportJournalsToFile, exportSpiritsToFile, importSpiritsIntoJournal } from '@/lib/google-drive-sync';
import { notifyDataMutated } from '@/lib/sync-events';
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
  onDeleteSpirit,
  onSelectModeChange,
}: JournalLandingPageProps) {
  // ── Language ──────────────────────────────────────────────────────────────
  const { t, language } = useLanguage();

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
      <div className="flex flex-col items-center justify-center flex-1 h-full min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[var(--brass-accent)] animate-spin mb-4" />
        <p className="font-display text-[var(--brass-accent)] animate-pulse">Uncasking...</p>
      </div>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full max-w-6xl mx-auto w-full px-4 sm:px-6 pt-8 pb-8">

      {/* ── Header — always shown; select mode props toggle inline Trash+X ────── */}
      <JournalLandingHeader
        journal={journal}
        noteCount={spirits.length}
        isSelectMode={isSelectMode}
        selectedCount={selectedIds.size}
        canDelete={canDelete}
        onConfirmDelete={() => setConfirmBulkDelete(true)}
        onExitSelectMode={exitSelectMode}
        onEnterSelectMode={enterSelectMode}
        onExportJournal={(id) => exportJournalsToFile([id])}
        onExportSelectedNotes={() => exportSpiritsToFile([...selectedIds], journal?.name || 'Journal')}
        onImportNotes={handleImportNotes}
        language={language}
      />

      {/* ── Layout content or Empty state ─────────────────────────────────── */}
      {spirits.length === 0 ? (
        <NoteEmptyState onNewNote={onNewNote} />
      ) : (
        <div className="flex-1">
          {layout === 'list' && (
            <NoteListView
              spirits={spirits}
              onSelect={onSelectSpirit}
              {...selectModeProps}
            />
          )}
          {layout === 'grid' && (
            <NoteGridView
              spirits={spirits}
              onSelect={onSelectSpirit}
              {...selectModeProps}
            />
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmBulkDelete}
        title={language === 'DE' ? 'Warnung / Achtung!' : 'Warning / Achtung!'}
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
    </div>
  );
}
