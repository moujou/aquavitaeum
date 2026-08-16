/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { JournalWithStats } from '@/hooks/useJournals';
import { Trash2, Edit3, Star, X, FileText, Calendar, CheckCircle2, BookOpen, Download, Upload, AlertCircle, CheckSquare } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageActionsDropdown } from '@/components/ui/PageActionsDropdown';
import { JournalCoverPicker } from './JournalCoverPicker';
import { useMultiSelect } from '@/hooks/useMultiSelect';
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
      <div className="pb-2 mb-8 flex flex-col">
        <div className="flex items-center justify-between gap-3 min-w-0 min-h-[36px]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-wide truncate min-w-0">
              {t('journalsTitle')}
            </h2>
            {/* Selection count badge */}
            {isSelectMode && selectedIds.size > 0 && (
              <span className="text-xs font-body text-[var(--brass-accent)] font-semibold tabular-nums shrink-0 bg-[var(--brass-accent)]/10 px-2.5 py-0.5 rounded-full border border-[var(--brass-accent)]/30">
                {selectedIds.size} selected
              </span>
            )}
          </div>

          {isSelectMode ? (
            /* Select mode action buttons: Gear Dropdown (Bearbeiten, Exportieren, Löschen) + Done button */
            <div className="flex items-center gap-2 shrink-0">
              {/* Gear Dropdown with Edit, Export & Bulk Delete */}
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

      {/* Bookshelf Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              className={[
                'group relative flex flex-col justify-between h-auto min-h-[280px] rounded-2xl transition-all duration-300 transform overflow-hidden cursor-pointer select-none',
                'bg-[var(--parchment-bg)] border border-[var(--parchment-border)] shadow-[0_6px_22px_rgba(30,20,10,0.12),0_2px_6px_rgba(30,20,10,0.06)]',
                isSelected
                  ? 'border-[var(--wood-selection)] ring-2 ring-[var(--wood-selection)]/45 shadow-[0_0_25px_rgba(46,148,93,0.35)] scale-[1.02] opacity-100 bg-[var(--pub-bg-panel)] z-10'
                  : isSelectMode
                    ? 'border-[var(--parchment-border)]/50 scale-[0.98] opacity-40 shadow-xs'
                    : 'hover:border-[var(--forest-green)] hover:shadow-[0_16px_36px_rgba(35,115,71,0.22),0_4px_12px_rgba(30,20,10,0.08)] hover:scale-[1.015]',
              ].join(' ')}
            >
              {/* Signature Clover Green Top Header Banner with Journal Name & Description */}
              <div className="w-full bg-[var(--wood-dark)] px-4 py-2.5 sm:py-3 border-b border-[var(--wood-dark)]/80 flex flex-col justify-center z-10 shrink-0">
                <h3 className="font-display text-lg sm:text-xl font-bold text-[var(--parchment-bg)] group-hover:text-[var(--brass-light)] transition-colors leading-tight truncate tracking-wide">
                  {journal.name}
                </h3>
                {journal.description && (
                  <p className="font-body text-xs sm:text-[13px] text-[var(--parchment-bg)]/85 italic line-clamp-1 mt-0.5 leading-snug font-normal">
                    {journal.description}
                  </p>
                )}
              </div>

              {/* Cover Image Container */}
              <div className="relative w-full h-36 sm:h-44 overflow-hidden bg-gradient-to-br from-[var(--wood-dark)]/10 via-[var(--pub-bg-alt)] to-[var(--parchment-bg)] border-b border-[var(--parchment-border)] flex-1 min-h-[140px]">
                {!isEditing && journal.coverImage ? (
                  <img
                    src={journal.coverImage}
                    alt={`${journal.name} cover`}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[var(--wood-dark)]/15 via-[var(--pub-bg-alt)] to-[var(--parchment-bg)]">
                    <div className="w-14 h-14 rounded-full bg-[var(--forest-green)]/15 border border-[var(--forest-green)]/35 flex items-center justify-center text-[var(--forest-green)] shadow-xs transition-transform duration-300 group-hover:scale-110">
                      <BookOpen className="w-7 h-7 text-[var(--forest-green)] stroke-[1.75]" />
                    </div>
                  </div>
                )}

                {/* Select mode: circular checkbox (top-right) */}
                {isSelectMode && !isEditing && (
                  <div className="absolute top-3 right-3 z-30">
                    <div
                      className={[
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-md',
                        isSelected
                          ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)]'
                          : 'bg-[var(--pub-bg-panel)]/90 border-[var(--parchment-border)] shadow-xs',
                      ].join(' ')}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--parchment-bg)]" />}
                    </div>
                  </div>
                )}

                {/* Desktop hover: Edit & Delete overlay (top-left) */}
                {!isEditing && !isSelectMode && (
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(journal.id);
                        setEditName(journal.name);
                        setEditDescription(journal.description || '');
                        setEditCoverImage(journal.coverImage);
                      }}
                      className="p-1.5 rounded-md bg-[var(--pub-bg-panel)]/90 hover:bg-[var(--fab-bg)] border border-[var(--parchment-border)] hover:border-[var(--brass-accent)] text-[var(--sepia-text)] hover:text-[var(--fab-text)] transition-all cursor-pointer shadow-xs"
                      title="Rename"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {!isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(journal.id);
                        }}
                        className="p-1.5 rounded-md bg-[var(--pub-bg-panel)]/90 hover:bg-red-950/70 border border-[var(--parchment-border)] hover:border-red-500/50 text-[var(--sepia-text)] hover:text-red-400 transition-all cursor-pointer shadow-xs"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Edit Form or Stats Shelf Container */}
              {isEditing ? (
                <form
                  onSubmit={(e) => handleRename(e, journal.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-col gap-3 w-full p-4 z-10 bg-[var(--pub-bg-panel)]"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-body text-[var(--sepia-muted)] tracking-wider">Name</label>
                    <input
                      type="text"
                      required
                      maxLength={40}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-md bg-[var(--pub-bg)] border border-[var(--parchment-border)] text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 font-body text-xs focus:outline-none focus:border-[var(--brass-accent)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-body text-[var(--sepia-muted)] tracking-wider">Description</label>
                    <input
                      type="text"
                      maxLength={120}
                      placeholder="Description (optional)"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-md bg-[var(--pub-bg)] border border-[var(--parchment-border)] text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 font-body text-xs focus:outline-none focus:border-[var(--brass-accent)]"
                    />
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <JournalCoverPicker
                      currentCoverImage={editCoverImage}
                      onChange={setEditCoverImage}
                    />
                  </div>
                  <div className="flex justify-end gap-1.5 mt-1">
                    <button
                      type="submit"
                      className="h-7 px-3 rounded bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] border border-[var(--fab-border)] text-[var(--fab-text)] text-xs font-bold transition-all cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded bg-[var(--pub-bg-alt)] hover:bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--sepia-muted)] hover:text-[var(--foreground)] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                /* Stats Shelf */
                <div className="w-full bg-[var(--pub-bg-alt)]/60 border-t border-[var(--parchment-border)]/60 px-4 py-3 grid grid-cols-3 gap-2 mt-auto text-left">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--sepia-muted)] uppercase tracking-wider font-bold">{language === 'DE' ? 'Notizen' : 'Notes'}</span>
                    <span className="font-bold text-[var(--foreground)] text-xs mt-0.5 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[var(--brass-accent)] shrink-0" />
                      {journal.bottleCount}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-[var(--sepia-muted)] uppercase tracking-wider font-bold">{language === 'DE' ? 'Ø Score' : 'Avg Score'}</span>
                    <span className="font-bold text-[var(--foreground)] text-xs mt-0.5 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[var(--brass-accent)] fill-[var(--brass-accent)] -mt-0.5" />
                      {journal.averageRating > 0 ? journal.averageRating : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-[var(--sepia-muted)] uppercase tracking-wider font-bold">{t('statsLatest')}</span>
                    <span className="font-bold text-[var(--foreground)] text-xs mt-0.5 flex items-center gap-1 truncate max-w-full">
                      <Calendar className="w-3.5 h-3.5 text-[var(--brass-accent)] shrink-0" />
                      {journal.latestTastedDate ? new Date(journal.latestTastedDate).toLocaleDateString(language === 'DE' ? 'de-DE' : 'en-US', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'}
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
        title={language === 'DE' ? 'Warnung / Achtung!' : 'Warning / Achtung!'}
        message={
          deletableSelected.length === 1
            ? <>{t('deleteJournalConfirm')}</>
            : language === 'DE'
              ? <>{deletableSelected.length} Journale und alle enthaltenen Einträge werden permanent gelöscht.</>
              : <>{deletableSelected.length} journals and all their entries will be permanently deleted.</>
        }
        confirmLabel={language === 'DE' ? 'Löschen bestätigen' : 'Confirm Delete'}
        cancelLabel={t('cancel')}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      {/* Creation Modal / Dialog Overlay */}
      {/* Create Journal Modal */}
      {isCreateVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-md bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/60 pb-3 mb-4">
              <h3 className="font-display text-lg font-bold text-[var(--foreground)] uppercase tracking-wider">
                {t('createJournalBtn')}
              </h3>
              <button
                onClick={() => {
                  triggerCloseCreate();
                  setNewJournalName('');
                  setNewJournalDescription('');
                  setNewJournalCoverImage(undefined);
                }}
                className="p-1 rounded hover:bg-black/5 text-[var(--sepia-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-body text-[var(--sepia-muted)] mb-1.5 tracking-wider">
                  Journal Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={40}
                  placeholder={t('journalNamePlaceholder')}
                  value={newJournalName}
                  onChange={(e) => setNewJournalName(e.target.value)}
                  className="w-full h-11 px-3 rounded bg-[var(--pub-bg)] border border-[var(--parchment-border)] text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 font-body text-sm focus:outline-none focus:border-[var(--brass-accent)] mb-4"
                />
              </div>
              <div>
                <label className="block text-xs font-body text-[var(--sepia-muted)] mb-1.5 tracking-wider">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="e.g. Peated single malts from Islay..."
                  value={newJournalDescription}
                  onChange={(e) => setNewJournalDescription(e.target.value)}
                  className="w-full h-11 px-3 rounded bg-[var(--pub-bg)] border border-[var(--parchment-border)] text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 font-body text-sm focus:outline-none focus:border-[var(--brass-accent)]"
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
                  className="h-10 px-4 rounded-lg bg-[var(--pub-bg-alt)] hover:bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--sepia-muted)] hover:text-[var(--foreground)] text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] border border-[var(--fab-border)] text-[var(--fab-text)] font-bold text-sm transition-all cursor-pointer shadow-md"
                >
                  {t('createJournalBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title={language === 'DE' ? 'Warnung / Achtung!' : 'Warning / Achtung!'}
        message={<>{t('deleteJournalConfirm')}</>}
        confirmLabel={language === 'DE' ? 'Journal löschen' : 'Delete Journal'}
        cancelLabel={t('cancel')}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

