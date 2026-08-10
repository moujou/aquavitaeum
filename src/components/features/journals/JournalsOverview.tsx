'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { JournalWithStats } from '@/hooks/useJournals';
import { Plus, Trash2, Edit3, Star, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JournalsOverviewProps {
  journals: JournalWithStats[];
  onCreateJournal: (name: string, description?: string) => Promise<unknown>;
  onRenameJournal: (id: string, name: string, description?: string) => Promise<unknown>;
  onDeleteJournal: (id: string) => Promise<unknown>;
  onSelectJournal: (id: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
  onOpenCreate?: () => void;
}

export function JournalsOverview({
  journals,
  onCreateJournal,
  onRenameJournal,
  onDeleteJournal,
  onSelectJournal,
  isCreateOpen,
  onCloseCreate,
  onOpenCreate,
}: JournalsOverviewProps) {
  const { t, language } = useLanguage();
  
  // Modals & Inline inputs state
  const [isCreateOpenLocal, setIsCreateOpenLocal] = useState(false);
  const [newJournalName, setNewJournalName] = useState('');
  const [newJournalDescription, setNewJournalDescription] = useState('');
  
  const isCreateVisible = isCreateOpen !== undefined ? isCreateOpen : isCreateOpenLocal;
  const triggerCloseCreate = onCloseCreate ? onCloseCreate : () => setIsCreateOpenLocal(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournalName.trim()) return;
    try {
      await onCreateJournal(newJournalName, newJournalDescription);
      setNewJournalName('');
      setNewJournalDescription('');
      triggerCloseCreate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      await onRenameJournal(id, editName, editDescription);
      setEditingId(null);
      setEditName('');
      setEditDescription('');
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t('statsUnrated');
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === 'DE' ? 'de-DE' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Shelf Header */}
      <div className="border-b border-[#C59B27]/20 pb-4 mb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#C59B27] tracking-wider uppercase">
          {t('journalsTitle')}
        </h2>
      </div>

      {/* Bookshelf Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {journals.map((journal) => {
          const isDefault = journal.id === 'default-compendium';
          const isEditing = editingId === journal.id;

          return (
            <div
              key={journal.id}
              onClick={() => !isEditing && onSelectJournal(journal.id)}
              className="group relative flex flex-col justify-between h-48 bg-[#224229] border border-white/[0.05] rounded-xl p-5 shadow-[0_10px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_30px_rgba(197,155,39,0.15)] hover:border-[#C59B27]/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
            >
              {/* Right Side Bleed Image Stack Container (Only shown when not editing) */}
              {!isEditing && journal.recentImages && journal.recentImages.length > 0 && (
                <div className="absolute top-0 right-0 bottom-0 w-24 sm:w-36 h-full flex overflow-hidden rounded-r-xl select-none pointer-events-none z-0 border-l border-black/40">
                  {/* Subtle gold divider line on the left edge of the image zone */}
                  <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#C59B27]/30 to-transparent z-40" />
                  
                  {journal.recentImages.map((img, idx) => {
                    const len = journal.recentImages.length;
                    let leftStyle = '';
                    let widthStyle = '';
                    let zIndexClass = '';
                    
                    if (len === 1) {
                      leftStyle = 'left-0';
                      widthStyle = 'w-full';
                      zIndexClass = 'z-30';
                    } else if (len === 2) {
                      leftStyle = idx === 0 ? 'left-0' : 'left-[50%]';
                      widthStyle = 'w-[65%]'; // 15% overlap
                      zIndexClass = idx === 0 ? 'z-30 shadow-[4px_0_10px_rgba(0,0,0,0.5)]' : 'z-20';
                    } else {
                      leftStyle = idx === 0 ? 'left-0' : idx === 1 ? 'left-[33.3%]' : 'left-[66.6%]';
                      widthStyle = 'w-[50%]'; // 16.6% overlap
                      zIndexClass = idx === 0 ? 'z-30 shadow-[4px_0_10px_rgba(0,0,0,0.5)]' :
                                    idx === 1 ? 'z-20 shadow-[4px_0_10px_rgba(0,0,0,0.5)]' : 'z-10';
                    }
                    
                    return (
                      <div 
                        key={idx}
                        className={cn(
                          "absolute top-0 bottom-0 h-full overflow-hidden border-l border-black/30 transition-all duration-300",
                          idx === 0 ? "group-hover:translate-x-1" :
                          idx === 1 ? "group-hover:-translate-x-0.5" : "group-hover:-translate-x-2",
                          leftStyle,
                          widthStyle,
                          zIndexClass
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt="Recent Bottle Preview"
                          className="w-full h-full object-cover grayscale-[40%] brightness-[0.45] saturate-[0.6] group-hover:grayscale-0 group-hover:brightness-[0.7] group-hover:saturate-100 transition-all duration-500"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Top Bar: Rename/Delete Controls */}
              <div className="flex items-start justify-start h-8 z-10 relative">
                {/* Edit & Delete Actions (hide delete for default compendium) */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(journal.id);
                      setEditName(journal.name);
                      setEditDescription(journal.description || '');
                    }}
                    className="p-1.5 rounded bg-white/5 hover:bg-[#E8D5B7] border border-white/10 hover:border-[#C59B27]/40 text-gray-400 hover:text-[#311e15] transition-all cursor-pointer"
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
                      className="p-1.5 rounded bg-white/5 hover:bg-red-950/40 border border-white/10 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Middle: Title & Edit Input */}
              <div className={cn(
                "my-3 flex-1 flex flex-col justify-center transition-all duration-300",
                !isEditing && journal.recentImages && journal.recentImages.length > 0 ? "mr-20 sm:mr-32" : ""
              )}>
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleRename(e, journal.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col gap-2 w-full"
                  >
                    <input
                      type="text"
                      required
                      maxLength={40}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full h-8 px-2 rounded bg-[var(--pub-bg)] border border-[#C59B27]/40 text-gray-100 font-body text-xs focus:outline-none focus:border-[#C59B27]"
                    />
                    <input
                      type="text"
                      maxLength={120}
                      placeholder="Description (optional)"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full h-8 px-2 rounded bg-[var(--pub-bg)] border border-[#C59B27]/40 text-gray-100 font-body text-xs focus:outline-none focus:border-[#C59B27]"
                    />
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
                  <div 
                    onClick={() => onSelectJournal(journal.id)}
                    className="cursor-pointer text-left"
                  >
                    <h3 className="font-display text-xl font-bold text-gray-100 group-hover:text-[#C59B27] transition-colors leading-tight line-clamp-1">
                      {journal.name}
                    </h3>
                    {journal.description ? (
                      <p className="font-body text-xs text-gray-400 line-clamp-2 mt-1 leading-normal">
                        {journal.description}
                      </p>
                    ) : (
                      <p className="font-body text-[11px] text-gray-500 italic mt-1 leading-normal">
                        No description provided.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom: Statistics Grid */}
              <div 
                onClick={() => !isEditing && onSelectJournal(journal.id)}
                className={cn(
                  "grid grid-cols-3 border-t border-white/[0.06] pt-3 text-[11px] font-body text-gray-400 gap-1 cursor-pointer transition-all duration-300 z-10 relative",
                  !isEditing && journal.recentImages && journal.recentImages.length > 0 ? "mr-20 sm:mr-32" : ""
                )}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t('statsBottles')}</span>
                  <span className="font-semibold text-gray-200 mt-0.5">{journal.bottleCount}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t('statsAvgRating')}</span>
                  <span className="font-semibold text-gray-200 mt-0.5 flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-[#C59B27] fill-[#C59B27] -mt-0.5" />
                    {journal.averageRating > 0 ? journal.averageRating : '-'}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t('statsLatest')}</span>
                  <span className="font-semibold text-gray-200 mt-0.5 text-right line-clamp-1">
                    {journal.latestTastedDate ? formatDate(journal.latestTastedDate) : '-'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Creation Modal / Dialog Overlay */}
      {isCreateVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-md bg-[#224229] border border-[#C59B27]/30 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#C59B27]/20 pb-3 mb-4">
              <h3 className="font-display text-lg font-bold text-[#C59B27] uppercase tracking-wider">
                {t('createJournalBtn')}
              </h3>
              <button
                onClick={() => {
                  triggerCloseCreate();
                  setNewJournalName('');
                  setNewJournalDescription('');
                }}
                className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-body uppercase text-gray-400 mb-1.5 tracking-wider">
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
                <label className="block text-xs font-body uppercase text-gray-400 mb-1.5 tracking-wider">
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

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerCloseCreate();
                    setNewJournalName('');
                    setNewJournalDescription('');
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

      {/* Delete Confirmation Modal (Cascade Delete) */}
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
