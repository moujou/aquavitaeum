/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { JournalWithStats } from '@/hooks/useJournals';
import { Trash2, Edit3, Star, X, FileText, Calendar, CheckCircle2, BookOpen } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { JournalCoverPicker } from './JournalCoverPicker';
import { useMultiSelect } from '@/hooks/useMultiSelect';

interface JournalsOverviewProps {
  journals: JournalWithStats[];
  onCreateJournal: (name: string, description?: string, coverImage?: string) => Promise<unknown>;
  onRenameJournal: (id: string, name: string, description?: string, coverImage?: string) => Promise<unknown>;
  onDeleteJournal: (id: string) => Promise<unknown>;
  onSelectJournal: (id: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function JournalsOverview({
  journals,
  onCreateJournal,
  onRenameJournal,
  onDeleteJournal,
  onSelectJournal,
  isCreateOpen,
  onCloseCreate,
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

  // ── Long-press Select Mode (shared logic from useMultiSelect) ───────────────
  const {
    isSelectMode,
    selectedIds,
    confirmBulkDelete,
    setConfirmBulkDelete,
    exitSelectMode,
    toggleSelection,
    handleTouchStart,
    cancelLongPress,
    handleTouchEnd,
    handleBulkDelete: execBulkDelete,
  } = useMultiSelect();

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
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Shelf Header — doubles as action bar in select mode */}
      <div className="pb-2 mb-8 flex flex-col">
        <div className="flex items-center justify-between gap-3 min-w-0">
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
            /* Select mode action icons */
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Edit — amber, only active for single selection */}
              <button
                onClick={handleEditFromSelectMode}
                disabled={!canEdit}
                title={language === 'DE' ? 'Bearbeiten' : 'Edit'}
                className={[
                  'p-2 rounded-lg border transition-all cursor-pointer',
                  canEdit
                    ? 'bg-[var(--brass-accent)]/15 border-[var(--brass-accent)]/40 text-[var(--brass-accent)] hover:bg-[var(--brass-accent)]/25'
                    : 'bg-transparent border-transparent text-white/15 cursor-not-allowed',
                ].join(' ')}
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Delete — red, active when ≥1 deletable selected */}
              <button
                onClick={() => canDelete && setConfirmBulkDelete(true)}
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
                onClick={exitSelectMode}
                title={language === 'DE' ? 'Abbrechen' : 'Cancel'}
                className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/25 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>

        {/* Specular Gradient Hairline Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--brass-accent)]/30 to-transparent mt-4" />
      </div>

      {/* Full-screen dim overlay in select mode */}
      {isSelectMode && (
        <div className="fixed inset-0 z-10 bg-black/25 pointer-events-none transition-opacity duration-300 animate-fade-in" />
      )}

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
                'group relative flex flex-col justify-between h-auto min-h-[260px] rounded-2xl transition-all duration-300 transform overflow-hidden cursor-pointer',
                'bg-gradient-to-b from-[#131C16]/90 via-[#0E1511]/95 to-[#0A0F0C] backdrop-blur-xl border border-t-white/12 border-x-white/6 border-b-black/40 shadow-xl',
                isSelected
                  ? 'border-[var(--brass-accent)] ring-2 ring-[var(--brass-accent)]/50 shadow-[0_0_25px_rgba(197,155,39,0.3)] scale-[1.02]'
                  : isSelectMode
                    ? 'border-white/6 scale-[0.97] opacity-60'
                    : 'hover:border-[var(--brass-accent)]/50 hover:shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(197,155,39,0.15)] hover:scale-[1.015]',
              ].join(' ')}
            >
              {/* Cover Image Container */}
              <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-gradient-to-br from-[#1A120B] to-[#0A0704] border-b border-white/5 shrink-0">
                {!isEditing && journal.coverImage ? (
                  <img
                    src={journal.coverImage}
                    alt={`${journal.name} cover`}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(197,155,39,0.14) 0%, #16100C 70%, #0A0704 100%)',
                    }}
                  >
                    <BookOpen className="w-8 h-8 text-[var(--brass-accent)]/45 stroke-[1.2]" />
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  </div>
                )}

                {/* Dark scrim overlay for unselected cards in select mode */}
                {isSelectMode && !isSelected && !isEditing && (
                  <div className="absolute inset-0 z-20 bg-black/40 transition-opacity duration-200 pointer-events-none rounded-2xl" />
                )}

                {/* Select mode: circular checkbox (top-right) */}
                {isSelectMode && !isEditing && (
                  <div className="absolute top-3 right-3 z-30">
                    <div
                      className={[
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-md',
                        isSelected
                          ? 'bg-[var(--brass-accent)] border-[var(--brass-accent)]'
                          : 'bg-black/60 border-white/40',
                      ].join(' ')}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--wood-dark)]" />}
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
                      className="p-1.5 rounded-md bg-black/70 hover:bg-[var(--fab-bg)] border border-white/10 hover:border-[var(--brass-accent)]/40 text-gray-300 hover:text-[var(--fab-text)] transition-all cursor-pointer shadow-xs"
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
                        className="p-1.5 rounded-md bg-black/70 hover:bg-red-950/70 border border-white/10 hover:border-red-500/50 text-gray-300 hover:text-red-400 transition-all cursor-pointer shadow-xs"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Middle & Bottom Details Container */}
              <div className="w-full pt-4 pb-0 flex flex-col gap-2 flex-1 min-w-0">
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleRename(e, journal.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col gap-3 w-full p-4 z-10"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-body text-gray-400 tracking-wider">Name</label>
                      <input
                        type="text"
                        required
                        maxLength={40}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-md bg-[var(--pub-bg)] border border-[var(--brass-accent)]/40 text-gray-100 font-body text-xs focus:outline-none focus:border-[var(--brass-accent)]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-body text-gray-400 tracking-wider">Description</label>
                      <input
                        type="text"
                        maxLength={120}
                        placeholder="Description (optional)"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-md bg-[var(--pub-bg)] border border-[var(--brass-accent)]/40 text-gray-100 font-body text-xs focus:outline-none focus:border-[var(--brass-accent)]"
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
                        className="h-7 px-3 rounded bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] border border-[var(--brass-accent)]/40 text-[var(--fab-text)] text-xs font-bold transition-all cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                    <div className="min-w-0 text-center w-full px-4 pt-1 pb-3">
                      <h3 className="font-display text-lg sm:text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--brass-accent)] transition-colors leading-snug truncate text-center tracking-wide">
                        {journal.name}
                      </h3>
                      {journal.description ? (
                        <p className="font-body text-xs sm:text-[13px] text-white/65 line-clamp-2 mt-1 leading-relaxed text-center font-normal">
                          {journal.description}
                        </p>
                      ) : (
                        <p className="font-body text-xs text-white/35 italic mt-1 leading-relaxed text-center">
                          Archival spirit ledger
                        </p>
                      )}
                    </div>

                    {/* Frosted Glass Stats Shelf */}
                    <div className="w-full bg-white/[0.03] border-t border-white/6 px-4 py-3 grid grid-cols-3 gap-2 mt-auto text-left">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{language === 'DE' ? 'Notizen' : 'Notes'}</span>
                        <span className="font-bold text-white text-xs mt-0.5 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[var(--brass-accent)] shrink-0" />
                          {journal.bottleCount}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{language === 'DE' ? 'Ø Score' : 'Avg Score'}</span>
                        <span className="font-bold text-white text-xs mt-0.5 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-[var(--brass-accent)] fill-[var(--brass-accent)] -mt-0.5" />
                          {journal.averageRating > 0 ? journal.averageRating : '—'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{t('statsLatest')}</span>
                        <span className="font-bold text-white text-xs mt-0.5 flex items-center gap-1 truncate max-w-full">
                          <Calendar className="w-3.5 h-3.5 text-[var(--brass-accent)] shrink-0" />
                          {journal.latestTastedDate ? new Date(journal.latestTastedDate).toLocaleDateString(language === 'DE' ? 'de-DE' : 'en-US', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
      {isCreateVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-md bg-[var(--pub-bg-panel)] border border-[var(--brass-accent)]/30 rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--brass-accent)]/20 pb-3 mb-4">
              <h3 className="font-display text-lg font-bold text-[var(--brass-accent)] uppercase tracking-wider">
                {t('createJournalBtn')}
              </h3>
              <button
                onClick={() => {
                  triggerCloseCreate();
                  setNewJournalName('');
                  setNewJournalDescription('');
                  setNewJournalCoverImage(undefined);
                }}
                className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-body text-gray-400 mb-1.5 tracking-wider">
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
                  className="w-full h-11 px-3 rounded bg-[var(--pub-bg)] border border-white/10 text-gray-100 placeholder-gray-500 font-body text-sm focus:outline-none focus:border-[var(--brass-accent)] mb-4"
                />
              </div>
              <div>
                <label className="block text-xs font-body text-gray-400 mb-1.5 tracking-wider">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="e.g. Peated single malts from Islay..."
                  value={newJournalDescription}
                  onChange={(e) => setNewJournalDescription(e.target.value)}
                  className="w-full h-11 px-3 rounded bg-[var(--pub-bg)] border border-white/10 text-gray-100 placeholder-gray-500 font-body text-sm focus:outline-none focus:border-[var(--brass-accent)]"
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
                  className="h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] border border-[var(--brass-accent)]/40 text-[var(--fab-text)] font-bold text-sm transition-all cursor-pointer shadow-lg"
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

