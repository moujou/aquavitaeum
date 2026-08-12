/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { JournalWithStats } from '@/hooks/useJournals';
import { Trash2, Edit3, Star, X, AlertTriangle, FileText, Calendar, CheckCircle2 } from 'lucide-react';
import { JournalCoverPicker } from './JournalCoverPicker';

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

  // ── Long-press Select Mode ──────────────────────────────────────────────────
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressActive = useRef(false);

  const enterSelectMode = useCallback((journalId: string) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(40);
    }
    setIsSelectMode(true);
    setSelectedIds(new Set([journalId]));
  }, []);

  const exitSelectMode = useCallback(() => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
    longPressActive.current = false;
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, journalId: string) => {
      if (isSelectMode) {
        // Already in select mode: a tap will toggle via onClick; just ensure ref is clear
        longPressActive.current = false;
        return;
      }
      longPressActive.current = false;
      longPressTimer.current = setTimeout(() => {
        longPressActive.current = true;
        enterSelectMode(journalId);
      }, 500);
    },
    [isSelectMode, enterSelectMode],
  );

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      cancelLongPress();
      if (longPressActive.current) {
        // Long-press just fired — swallow the synthetic click and reset the flag
        e.preventDefault();
        longPressActive.current = false;
      }
    },
    [cancelLongPress],
  );

  const handleCardClick = useCallback(
    (journalId: string, isEditing: boolean) => {
      if (longPressActive.current) {
        longPressActive.current = false;
        return;
      }
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

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedIds) {
        await onDeleteJournal(id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmBulkDelete(false);
      exitSelectMode();
    }
  };

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
      <div className="border-b border-[#C59B27]/20 pb-4 mb-8 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#C59B27] tracking-wider uppercase truncate min-w-0">
            {t('journalsTitle')}
          </h2>
          {/* Selection count badge */}
          {isSelectMode && selectedIds.size > 0 && (
            <span className="text-xs font-body text-white/50 tabular-nums shrink-0">
              ({selectedIds.size})
            </span>
          )}
        </div>

        {isSelectMode ? (
          /* Select mode action icons — always visible in the header, shrink-0 so they never get squeezed */
          <div className="flex items-center gap-1 shrink-0">
            {/* Edit — amber, only active for single selection */}
            <button
              onClick={handleEditFromSelectMode}
              disabled={!canEdit}
              title={language === 'DE' ? 'Bearbeiten' : 'Edit'}
              className={[
                'p-2 rounded-lg border transition-all cursor-pointer',
                canEdit
                  ? 'bg-[#E8D5B7]/10 border-[#C59B27]/40 text-[#C59B27] hover:bg-[#E8D5B7]/20'
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
                  ? 'bg-red-950/40 border-red-500/40 text-red-400 hover:bg-red-900/50'
                  : 'bg-transparent border-transparent text-white/15 cursor-not-allowed',
              ].join(' ')}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Cancel */}
            <button
              onClick={exitSelectMode}
              title={language === 'DE' ? 'Abbrechen' : 'Cancel'}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Full-screen dim overlay in select mode (pointer-events-none so cards stay interactive) */}
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
                'group relative flex flex-col justify-between h-auto min-h-[220px] rounded-xl transition-all duration-300 transform overflow-hidden bg-[#224229]/10 border cursor-pointer',
                isSelected
                  ? 'border-[#C59B27] ring-2 ring-[#C59B27]/50 shadow-[0_0_18px_rgba(197,155,39,0.25)] scale-[1.02]'
                  : isSelectMode
                    ? 'border-[#2A5E3F]/20 scale-[0.97]'
                    : 'border-[#2A5E3F]/20 hover:shadow-[0_0_20px_rgba(42,94,63,0.15)] hover:border-[#2A5E3F]/40 hover:scale-[1.01]',
              ].join(' ')}
            >
              {/* Cover Image Container */}
              <div className="relative w-full h-32 overflow-hidden bg-gradient-to-br from-[#122418] to-[#0A140F] border-b border-white/5 shrink-0">
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
                      background: 'radial-gradient(circle at center, #2A5E3F1c 0%, #121212 80%, #0C0C0C 100%)',
                    }}
                  >
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  </div>
                )}

                {/* Dark scrim overlay for unselected cards in select mode */}
                {isSelectMode && !isSelected && !isEditing && (
                  <div className="absolute inset-0 z-20 bg-black/40 transition-opacity duration-200 pointer-events-none rounded-xl" />
                )}

                {/* Select mode: circular checkbox (top-right) */}
                {isSelectMode && !isEditing && (
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <div
                      className={[
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                        isSelected
                          ? 'bg-[#C59B27] border-[#C59B27]'
                          : 'bg-black/50 border-white/40',
                      ].join(' ')}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1a0f00]" />}
                    </div>
                  </div>
                )}

                {/* Desktop hover: Edit & Delete overlay (top-left) — hidden in select mode */}
                {!isEditing && !isSelectMode && (
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(journal.id);
                        setEditName(journal.name);
                        setEditDescription(journal.description || '');
                        setEditCoverImage(journal.coverImage);
                      }}
                      className="p-1.5 rounded bg-black/60 hover:bg-[#E8D5B7] border border-white/10 hover:border-[#C59B27]/40 text-gray-300 hover:text-[#311e15] transition-all cursor-pointer"
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
                        className="p-1.5 rounded bg-black/60 hover:bg-red-950/60 border border-white/10 hover:border-red-500/50 text-gray-300 hover:text-red-400 transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Middle & Bottom Details Container */}
              <div className="w-full pt-3.5 pb-3.5 pl-4 pr-4 flex flex-col gap-2 flex-1 min-w-0 bg-black/15">
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleRename(e, journal.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col gap-3 w-full z-10"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-body text-gray-400 tracking-wider">Name</label>
                      <input
                        type="text"
                        required
                        maxLength={40}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full h-8 px-2 rounded bg-[var(--pub-bg)] border border-[#C59B27]/40 text-gray-100 font-body text-xs focus:outline-none focus:border-[#C59B27]"
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
                        className="w-full h-8 px-2 rounded bg-[var(--pub-bg)] border border-[#C59B27]/40 text-gray-100 font-body text-xs focus:outline-none focus:border-[#C59B27]"
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
                        className="h-7 px-3 rounded bg-[#E8D5B7] hover:bg-[#F5F2EB] border border-[#C59B27]/40 text-[#311e15] text-xs font-bold transition-all cursor-pointer"
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
                    <div className="min-w-0 text-center w-full">
                      <h3 className="font-display text-[17px] lg:text-[19px] font-black text-white group-hover:text-[#C59B27] transition-colors leading-snug truncate text-center">
                        {journal.name}
                      </h3>
                      {journal.description ? (
                        <p className="font-body text-[14px] text-white/70 italic line-clamp-2 mt-1 leading-snug text-center">
                          {journal.description}
                        </p>
                      ) : (
                        <p className="font-body text-[14px] text-white/40 italic mt-1 leading-snug text-center">
                          No description provided.
                        </p>
                      )}
                    </div>
                    <div className="w-full">
                      <div className="w-full border-t border-white/5 mt-3 pt-3" />
                      <div className="grid grid-cols-3 text-xs font-body text-white/60 gap-1 mt-1 text-left">
                        <div className="flex flex-col">
                          <span className="text-[11px] text-white/40 uppercase tracking-wider font-bold">{language === 'DE' ? 'Notizen' : 'Notes'}</span>
                          <span className="font-bold text-white mt-0.5 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                            {journal.bottleCount}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[11px] text-white/40 uppercase tracking-wider font-bold">{language === 'DE' ? 'Durchschnitt' : 'Average Rating'}</span>
                          <span className="font-bold text-white mt-0.5 flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 text-[#C59B27] fill-[#C59B27] -mt-0.5" />
                            {journal.averageRating > 0 ? journal.averageRating : '-'}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[11px] text-white/40 uppercase tracking-wider font-bold">{t('statsLatest')}</span>
                          <span className="font-bold text-white mt-0.5 flex items-center gap-1 truncate max-w-full">
                            <Calendar className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                            {journal.latestTastedDate ? new Date(journal.latestTastedDate).toLocaleDateString(language === 'DE' ? 'de-DE' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {/* ── Bulk Delete Confirmation ── */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-md bg-[#224229] border border-red-500/30 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4 border-b border-red-500/10 pb-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-bounce" />
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-red-500">
                Warning / Achtung!
              </h3>
            </div>
            <p className="font-body text-sm text-gray-300 leading-relaxed mb-6">
              {deletableSelected.length === 1
                ? t('deleteJournalConfirm')
                : language === 'DE'
                  ? `${deletableSelected.length} Journale und alle enthaltenen Einträge werden permanent gelöscht.`
                  : `${deletableSelected.length} journals and all their entries will be permanently deleted.`}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleBulkDelete}
                className="h-10 px-5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 font-semibold text-sm transition-colors cursor-pointer shadow-lg"
              >
                {language === 'DE' ? 'Löschen bestätigen' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal / Dialog Overlay */}
      {isCreateVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-md bg-[#224229] border border-[#C59B27]/30 rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#C59B27]/20 pb-3 mb-4">
              <h3 className="font-display text-lg font-bold text-[#C59B27] uppercase tracking-wider">
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
                  className="w-full h-11 px-3 rounded bg-[var(--pub-bg)] border border-white/10 text-gray-100 placeholder-gray-500 font-body text-sm focus:outline-none focus:border-[#C59B27] mb-4"
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
                  className="w-full h-11 px-3 rounded bg-[var(--pub-bg)] border border-white/10 text-gray-100 placeholder-gray-500 font-body text-sm focus:outline-none focus:border-[#C59B27]"
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
                  className="h-10 px-5 rounded-lg bg-[#E8D5B7] hover:bg-[#F5F2EB] border border-[#C59B27]/40 text-[#311e15] font-bold text-sm transition-all cursor-pointer shadow-lg"
                >
                  {t('createJournalBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (single item — desktop hover button) */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-md bg-[#224229] border border-red-500/30 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4 border-b border-red-500/10 pb-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-bounce" />
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-red-500">
                Warning / Achtung!
              </h3>
            </div>
            <p className="font-body text-sm text-gray-300 leading-relaxed mb-6">
              {t('deleteJournalConfirm')}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                className="h-10 px-5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 font-semibold text-sm transition-colors cursor-pointer shadow-lg"
              >
                Delete Journal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

