/* eslint-disable @next/next/no-img-element */
import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/context/LanguageContext';
import { JournalWithStats } from '@/hooks/useJournals';
import { Trash2, Edit3, Star, X, FileText, Clock, Compass, CheckCircle2, BookOpen, Download, Upload, AlertCircle, CheckSquare } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageActionsDropdown } from '@/components/ui/PageActionsDropdown';
import { JournalCoverPicker } from './JournalCoverPicker';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { exportJournalsToFile, importJournalFile } from '@/lib/google-drive-sync';
import { cn } from '@/lib/utils';

interface JournalsOverviewProps {
  journals: JournalWithStats[];
  onCreateJournal: (name: string, description?: string, coverImage?: string) => Promise<unknown>;
  onRenameJournal: (id: string, name: string, description?: string, coverImage?: string) => Promise<unknown>;
  onDeleteJournal: (id: string) => Promise<unknown>;
  onSelectJournal: (id: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
  onSelectModeChange?: (active: boolean) => void;
}

export function JournalsOverview({
  journals,
  onCreateJournal,
  onRenameJournal,
  onDeleteJournal,
  onSelectJournal,
  isCreateOpen,
  onCloseCreate,
  onSelectModeChange,
}: JournalsOverviewProps) {
  const { t, language } = useLanguage();

  // Modals & Inline inputs state
  const [isCreateOpenLocal, setIsCreateOpenLocal] = useState(false);
  const [newJournalName, setNewJournalName] = useState('');
  const [newJournalDescription, setNewJournalDescription] = useState('');
  const [newJournalCoverImage, setNewJournalCoverImage] = useState<string | undefined>(undefined);

  const isCreateVisible = isCreateOpen !== undefined ? isCreateOpen : isCreateOpenLocal;
  const triggerCloseCreate = onCloseCreate ? onCloseCreate : () => setIsCreateOpenLocal(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCoverImage, setEditCoverImage] = useState<string | undefined>(undefined);

  useLockBodyScroll(isCreateVisible || !!editingId, () => {
    if (isCreateVisible) triggerCloseCreate();
    if (editingId) setEditingId(null);
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const journalFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportJournal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus(null);
      const result = await importJournalFile(file);
      setImportStatus({
        type: 'success',
        message: `${result.journalCount} Journal(e) & ${result.spiritCount} Notiz(en) importiert!`,
      });
      setTimeout(() => {
        setImportStatus(null);
        window.location.reload();
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('journalImportError');
      setImportStatus({
        type: 'error',
        message,
      });
      setTimeout(() => setImportStatus(null), 4000);
    } finally {
      if (journalFileInputRef.current) journalFileInputRef.current.value = '';
    }
  };

  // ── Long-press Select Mode (shared logic from useMultiSelect) ───────────────
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
    handleBulkDelete: execBulkDelete,
  } = useMultiSelect(onSelectModeChange);

  const handleCardClick = useCallback(
    (journalId: string, isEditing: boolean) => {
      if (isSelectMode) {
        toggleSelection(journalId);
        return;
      }
      if (!isEditing) {
        onSelectJournal(journalId);
      }
    },
    [isSelectMode, toggleSelection, onSelectJournal],
  );

  const handleBulkDelete = () => execBulkDelete(async (id) => { await onDeleteJournal(id); });

  const handleEditFromSelectMode = () => {
    const [id] = selectedIds;
    const journal = journals.find((j) => j.id === id);
    if (!journal) return;
    exitSelectMode();
    setEditingId(journal.id);
    setEditName(journal.name);
    setEditDescription(journal.description || '');
    setEditCoverImage(journal.coverImage);
  };

  // ── Standard CRUD handlers ─────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournalName.trim()) return;
    try {
      await onCreateJournal(newJournalName, newJournalDescription, newJournalCoverImage);
      setNewJournalName('');
      setNewJournalDescription('');
      setNewJournalCoverImage(undefined);
      triggerCloseCreate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      await onRenameJournal(id, editName, editDescription, editCoverImage);
      setEditingId(null);
      setEditName('');
      setEditDescription('');
      setEditCoverImage(undefined);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteJournal(id);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deletableSelected = [...selectedIds].filter((id) => id !== 'default-compendium');
  const canDelete = deletableSelected.length > 0;
  const canEdit = selectedIds.size === 1;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-8 animate-fade-in">
      {/* Shelf Header — doubles as action bar in select mode */}
      <div className="relative z-30 pb-2 mb-8 flex flex-col">
        <div className="flex items-center justify-between gap-3 min-w-0 min-h-[36px]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-wide truncate min-w-0">
              {t('journalsTitle')}
            </h2>
            {/* Selection count badge (left, aligned with JournalLandingHeader) */}
            {isSelectMode && selectedIds.size > 0 && (
              <span className="text-xs font-body text-[var(--brass-accent)] font-semibold tabular-nums shrink-0 bg-[var(--brass-accent)]/10 px-2.5 py-0.5 rounded-full border border-[var(--brass-accent)]/30">
                {selectedIds.size} {language === 'DE' ? 'ausgewählt' : 'selected'}
              </span>
            )}
            {!isSelectMode && (
              <div className="bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] px-3 py-1 rounded-full text-xs font-mono text-[var(--sepia-text)] font-semibold shrink-0">
                {journals.length} {journals.length === 1 ? (language === 'DE' ? 'Journal' : 'journal') : (language === 'DE' ? 'Journale' : 'journals')}
              </div>
            )}
          </div>

          {isSelectMode ? (
            /* Select mode action buttons: Actions Dropdown (Bearbeiten, Exportieren, Löschen) + Done button */
            <div className="flex items-center gap-2 animate-fade-in shrink-0">
              {/* Multi-Select Actions Dropdown */}
              <PageActionsDropdown
                title={language === 'DE' ? 'Aktionen' : 'Actions'}
                items={[
                  {
                    id: 'edit-selected',
                    label: language === 'DE' ? 'Bearbeiten' : 'Edit',
                    icon: <Edit3 size={16} />,
                    onClick: handleEditFromSelectMode,
                    disabled: !canEdit,
                  },
                  {
                    id: 'export-selected',
                    label: `${t('exportJournals')}${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`,
                    icon: <Download size={16} />,
                    onClick: () => exportJournalsToFile([...selectedIds]),
                    disabled: selectedIds.size === 0,
                  },
                  {
                    id: 'delete-selected',
                    label: `${language === 'DE' ? 'Löschen' : 'Delete'}${deletableSelected.length > 0 ? ` (${deletableSelected.length})` : ''}`,
                    icon: <Trash2 size={16} />,
                    onClick: () => canDelete && setConfirmBulkDelete(true),
                    disabled: !canDelete,
                    destructive: true,
                  },
                ]}
              />

              {/* Done / Cancel */}
              <button
                onClick={exitSelectMode}
                title={language === 'DE' ? 'Fertig' : 'Done'}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] hover:bg-[var(--pub-bg-alt)] text-[var(--foreground)] transition-all flex items-center gap-1 text-xs font-display font-bold uppercase tracking-wider shadow-xs active:scale-95 cursor-pointer select-none min-h-[38px]"
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
                    id: 'select-mode',
                    label: language === 'DE' ? 'Journale auswählen' : 'Select Journals',
                    icon: <CheckSquare size={16} />,
                    onClick: () => enterSelectMode(),
                  },
                  {
                    id: 'import-journal',
                    label: t('importJournal'),
                    icon: <Upload size={16} />,
                    onClick: () => journalFileInputRef.current?.click(),
                  },
                ]}
              />
              <input
                type="file"
                ref={journalFileInputRef}
                onChange={handleImportJournal}
                accept=".json,application/json"
                className="hidden"
              />
            </div>
          )}
        </div>

        {importStatus && (
          <div
            className={cn(
              'mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-md border animate-fade-in font-medium',
              importStatus.type === 'success'
                ? 'bg-[var(--forest-green)]/10 text-[var(--forest-green)] border-[var(--forest-green)]/30'
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:border-red-900'
            )}
          >
            {importStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Specular Clover Green Gradient Divider */}
        <div className="divider-clover-glow mt-4" />
      </div>

      {/* Open Books Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
        {journals.map((journal) => {
          const isDefault = journal.id === 'default-compendium';
          const isEditing = editingId === journal.id;
          const isSelected = selectedIds.has(journal.id);

          return (
            <div
              key={journal.id}
              onClick={() => handleCardClick(journal.id, isEditing)}
              onTouchStart={(e) => handleTouchStart(e, journal.id)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={cancelLongPress}
              onContextMenu={(e) => {
                if (!isSelectMode) e.preventDefault();
              }}
              className={cn(
                'group relative flex flex-col rounded-xl sm:rounded-2xl border transition-all duration-300 transform overflow-hidden cursor-pointer select-none',
                'bg-[var(--parchment-bg)] border border-[var(--parchment-border)] shadow-[0_6px_20px_-3px_rgba(35,20,8,0.12),0_2px_6px_rgba(35,20,8,0.06),2px_2px_0_rgba(208,194,171,0.45)]',
                isSelected
                  ? 'border-[var(--wood-selection)] ring-2 ring-[var(--wood-selection)]/45 shadow-[0_0_25px_rgba(46,148,93,0.35)] scale-[1.01] opacity-100 bg-[var(--pub-bg-panel)] z-10'
                  : isSelectMode
                    ? 'border-[var(--parchment-border)]/50 scale-[0.98] opacity-40 shadow-xs'
                    : 'hover:border-[var(--forest-green)] hover:shadow-[0_14px_30px_-3px_rgba(35,115,71,0.22),0_4px_12px_rgba(35,20,8,0.08),3px_3px_0_rgba(208,194,171,0.6)] hover:-translate-y-0.5',
              )}
            >
              {/* 1. Signature Irish Forest / Pub Wood Top Header Banner */}
              <div
                className={cn(
                  'w-full bg-[var(--wood-dark)] px-3.5 sm:px-4 border-b border-[var(--wood-dark)]/80 flex items-center justify-between z-10 shrink-0 text-left',
                  journal.description ? 'py-2 min-h-[48px] sm:min-h-[52px]' : 'h-11 sm:h-12'
                )}
              >
                <div className="flex flex-col justify-center min-w-0 flex-1 pr-2">
                  <h3 className="font-display text-sm sm:text-base font-bold text-[var(--parchment-bg)] group-hover:text-[var(--brass-light)] transition-colors truncate tracking-wide leading-tight">
                    {journal.name}
                  </h3>
                  {journal.description && (
                    <p className="text-[11px] sm:text-xs text-[var(--parchment-bg)]/75 italic truncate max-w-full font-body mt-0.5 leading-snug">
                      {journal.description}
                    </p>
                  )}
                </div>

                {/* Right: Action overlay & select checkbox */}
                <div className="flex items-center gap-2 shrink-0 my-auto">
                  {/* Select mode checkbox */}
                  {isSelectMode && !isEditing && (
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-md',
                        isSelected
                          ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)]'
                          : 'bg-[var(--pub-bg-panel)]/90 border-[var(--parchment-border)] shadow-xs',
                      )}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--parchment-bg)]" />}
                    </div>
                  )}

                  {/* Hover action overlay (Edit / Delete) */}
                  {!isEditing && !isSelectMode && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity my-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(journal.id);
                          setEditName(journal.name);
                          setEditDescription(journal.description || '');
                          setEditCoverImage(journal.coverImage);
                        }}
                        className="p-1 rounded bg-black/30 hover:bg-black/50 text-[var(--parchment-bg)] transition-all cursor-pointer"
                        title={t('renameAction')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(journal.id);
                          }}
                          className="p-1 rounded bg-black/30 hover:bg-red-900/80 text-[var(--parchment-bg)] hover:text-red-200 transition-all cursor-pointer"
                          title={t('deleteAction')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Journal Content (Left: Image Canvas, Right: Tasting Manuscript) */}
              <div className="flex flex-row flex-1 min-h-[190px] sm:min-h-[220px]">
                {/* ─── LINKE SEITE (100% Vollflächiges Bild) ─── */}
                <div className="flex w-[36%] sm:w-[38%] lg:w-[36%] shrink-0 border-r border-[var(--parchment-border)]/50 min-h-[150px] sm:min-h-full overflow-hidden bg-[var(--pub-bg-alt)]/60">
                  <div className="flex-1 relative flex flex-col items-center justify-center p-0 m-0 w-full h-full overflow-hidden">
                    {journal.coverImage ? (
                      <img
                        src={journal.coverImage}
                        alt={`${journal.name} cover`}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 text-center">
                        <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-full bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/30 flex items-center justify-center text-[var(--forest-green)] shadow-2xs transition-transform duration-300 group-hover:scale-110 mb-1.5 sm:mb-2">
                          <BookOpen className="w-5 h-5 sm:w-8 sm:h-8 text-[var(--forest-green)] stroke-[1.75]" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-display font-bold text-[var(--sepia-text)] uppercase tracking-wider text-center leading-tight">
                          {language === 'DE' ? 'Tasting Buch' : 'Tasting Book'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── RECHTE SEITE (Manuskript & Sommelier-Ledger) ─────────── */}
                <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 text-left relative min-w-0 bg-[var(--parchment-bg)]">
                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleRename(e, journal.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex flex-col gap-3 w-full"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-body text-[var(--sepia-muted)] tracking-wider">{t('journalNameLabel')}</label>
                        <input
                          type="text"
                          required
                          maxLength={40}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-md bg-[var(--pub-bg)] border border-[var(--parchment-border)] text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 font-body text-xs focus:outline-none focus:border-[var(--brass-accent)]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-body text-[var(--sepia-muted)] tracking-wider">{t('descriptionOptionalLabel')}</label>
                        <input
                          type="text"
                          maxLength={120}
                          placeholder={t('descriptionPlaceholder')}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-md bg-[var(--pub-bg)] border border-[var(--parchment-border)] text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 font-body text-xs focus:outline-none focus:border-[var(--brass-accent)]"
                        />
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <JournalCoverPicker
                          currentCoverImage={editCoverImage}
                          onChange={setEditCoverImage}
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          type="submit"
                          className="min-h-[36px] px-3.5 rounded-lg bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] border border-[var(--fab-border)] text-[var(--fab-text)] text-xs font-bold transition-all active:scale-95 cursor-pointer"
                        >
                          {t('saveAction')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="min-h-[36px] p-2 rounded-lg bg-[var(--pub-bg-alt)] hover:bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--sepia-muted)] hover:text-[var(--foreground)] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col justify-between h-full">
                      {/* Sommelier Tasting Insights (Recent 3 Tastings + Top 3 Drams) */}
                      {((journal.recentSpirits && journal.recentSpirits.length > 0) || (journal.topDrams && journal.topDrams.length > 0)) ? (
                        <div className="flex flex-col gap-2.5 my-auto">
                          {/* 3 Zuletzt verkostete Drams mit Datum */}
                          {/* 3 Zuletzt verkostete Drams mit sicher sichtbarem Datum */}
                          {journal.recentSpirits && journal.recentSpirits.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--sepia-muted)] select-none">
                                {language === 'DE' ? 'Zuletzt verkostet:' : 'Recently Tasted:'}
                              </span>
                              <div className="flex flex-col gap-1">
                                {journal.recentSpirits.map((item, idx) => (
                                  <div
                                    key={`${item.name}-${idx}`}
                                    className="flex items-center justify-between gap-2 text-xs px-2 py-0.5 rounded-md border border-[var(--parchment-border)] bg-[var(--parchment-bg-alt)]/60 text-[var(--sepia-text)] min-w-0"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                      <Clock className="w-3.5 h-3.5 text-[var(--brass-accent)] shrink-0" />
                                      <span className="font-semibold text-xs truncate leading-snug text-[var(--sepia-text)]" title={item.name}>
                                        {item.name}
                                      </span>
                                    </div>
                                    {item.date ? (
                                      <span className="text-[10px] text-[var(--sepia-muted)] font-mono shrink-0 select-none text-right tabular-nums">
                                        {new Date(item.date).toLocaleDateString(language === 'DE' ? 'de-DE' : 'en-US', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-[var(--sepia-muted)]/50 font-mono shrink-0 select-none text-right">
                                        —
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Top-Bewertungen (Gold, Silver, Bronze) */}
                          {journal.topDrams && journal.topDrams.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--sepia-muted)] select-none">
                                {language === 'DE' ? (journal.topDrams.length === 1 ? 'Top-Bewertung:' : 'Top-Bewertungen:') : (journal.topDrams.length === 1 ? 'Top Rated:' : 'Top Rated:')}
                              </span>
                              <div className="flex flex-col gap-1">
                                {journal.topDrams.slice(0, 3).map((dram, idx) => {
                                  const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                                  const rankBorder =
                                    idx === 0
                                      ? 'bg-amber-500/10 border-amber-500/35'
                                      : idx === 1
                                      ? 'bg-slate-400/10 border-slate-400/35'
                                      : 'bg-amber-700/10 border-amber-700/35';

                                  return (
                                    <div
                                      key={`${dram.name}-${idx}`}
                                      className={`flex items-center justify-between gap-2 text-xs px-2 py-0.5 rounded-md border ${rankBorder} bg-[var(--parchment-bg-alt)]/60 text-[var(--sepia-text)] min-w-0`}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                        <span className="text-xs shrink-0 select-none">{medalEmoji}</span>
                                        <span className="font-semibold text-xs truncate leading-snug text-[var(--sepia-text)]" title={dram.name}>
                                          {dram.name}
                                        </span>
                                      </div>
                                      <span className="font-mono text-[11px] font-bold text-[var(--brass-accent)] shrink-0 select-none text-right tabular-nums">
                                        {dram.rating}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center my-auto py-3 text-center">
                          <p className="font-body text-xs text-[var(--sepia-muted)]/70 italic">
                            {language === 'DE' ? 'Noch keine Notizen erfasst.' : 'No tasting notes yet.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Dedicated Grounded Ledger Footer Bar */}
              {!isEditing && (
                <div className="w-full bg-[var(--pub-bg-alt)]/65 border-t border-[var(--parchment-border)] px-4 py-2 sm:py-2.5 grid grid-cols-3 gap-2 shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[10px] sm:text-[10.5px] text-[var(--sepia-muted)] uppercase tracking-wider font-bold">
                      {language === 'DE' ? 'Notizen' : 'Notes'}
                    </span>
                    <span className="font-bold text-[var(--sepia-text)] text-xs sm:text-sm mt-0.5 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[var(--sepia-muted)] shrink-0" />
                      {journal.bottleCount}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] sm:text-[10.5px] text-[var(--sepia-muted)] uppercase tracking-wider font-bold">
                      {language === 'DE' ? 'Ø Score' : 'Avg Score'}
                    </span>
                    <span className="font-bold text-[var(--sepia-text)] text-xs sm:text-sm mt-0.5 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[var(--brass-accent)] fill-[var(--brass-accent)] -mt-0.5" />
                      {journal.averageRating > 0 ? journal.averageRating : '—'}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] sm:text-[10.5px] text-[var(--sepia-muted)] uppercase tracking-wider font-bold">
                      {language === 'DE' ? 'Regionen' : 'Regions'}
                    </span>
                    <span className="font-bold text-[var(--sepia-text)] text-xs sm:text-sm mt-0.5 flex items-center gap-1 truncate max-w-full">
                      <Compass className="w-3.5 h-3.5 text-[var(--sepia-muted)] shrink-0" />
                      {journal.regionCount !== undefined && journal.regionCount > 0 ? journal.regionCount : (journal.regionsSummary ? 1 : '—')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={confirmBulkDelete}
        title={t('warningTitle')}
        subtitle={t('deleteModalSubtitle')}
        message={
          deletableSelected.length === 1
            ? <>{t('deleteJournalConfirm')}</>
            : <>{deletableSelected.length} {t('deleteBulkJournalsConfirm')}</>
        }
        confirmLabel={language === 'DE' ? 'Löschen bestätigen' : 'Confirm Delete'}
        cancelLabel={t('cancel')}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      {/* Creation Modal / Dialog Overlay (Portaled safely at z-[1000]) */}
      {isCreateVisible && typeof window !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-journal-modal-title"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => {
            triggerCloseCreate();
            setNewJournalName('');
            setNewJournalDescription('');
            setNewJournalCoverImage(undefined);
          }}
        >
          <div
            className="w-full max-w-md bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-2xl p-6 shadow-2xl max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/60 pb-3 mb-4">
              <h3 id="create-journal-modal-title" className="font-display text-lg font-bold text-[var(--foreground)] uppercase tracking-wider">
                {t('createJournalBtn')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  triggerCloseCreate();
                  setNewJournalName('');
                  setNewJournalDescription('');
                  setNewJournalCoverImage(undefined);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 text-[var(--sepia-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-body text-[var(--sepia-muted)] mb-1.5 tracking-wider">
                  {t('journalNameLabel')}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={40}
                  placeholder={t('journalNamePlaceholder')}
                  value={newJournalName}
                  onChange={(e) => setNewJournalName(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-[var(--pub-bg)] border border-[var(--parchment-border)] text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 font-body text-sm focus:outline-none focus:border-[var(--brass-accent)] mb-4"
                />
              </div>
              <div>
                <label className="block text-xs font-body text-[var(--sepia-muted)] mb-1.5 tracking-wider">
                  {t('descriptionOptionalLabel')}
                </label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder={t('descriptionPlaceholder')}
                  value={newJournalDescription}
                  onChange={(e) => setNewJournalDescription(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-[var(--pub-bg)] border border-[var(--parchment-border)] text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 font-body text-sm focus:outline-none focus:border-[var(--brass-accent)]"
                />
              </div>
              <JournalCoverPicker
                currentCoverImage={newJournalCoverImage}
                onChange={setNewJournalCoverImage}
              />
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerCloseCreate();
                    setNewJournalName('');
                    setNewJournalDescription('');
                    setNewJournalCoverImage(undefined);
                  }}
                  className="min-h-[44px] px-4 rounded-lg bg-[var(--pub-bg-alt)] hover:bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--sepia-muted)] hover:text-[var(--foreground)] text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 rounded-lg bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] border border-[var(--fab-border)] text-[var(--fab-text)] font-bold text-sm transition-all cursor-pointer shadow-md active:scale-95"
                >
                  {t('createJournalBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title={t('warningTitle')}
        subtitle={t('deleteModalSubtitle')}
        message={<>{t('deleteJournalConfirm')}</>}
        confirmLabel={language === 'DE' ? 'Journal löschen' : 'Delete Journal'}
        cancelLabel={t('cancel')}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
