'use client';

import React, { useMemo } from 'react';
import { JournalWithStats } from '@/hooks/useJournals';
import { Star, FileText, Edit3, Trash2, CheckCircle2, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface JournalBookshelfViewProps {
  journals: JournalWithStats[];
  selectedIds: Set<string>;
  isSelectMode: boolean;
  editingId: string | null;
  onCardClick: (journalId: string, isEditing: boolean) => void;
  onTouchStart: (e: React.TouchEvent, journalId: string) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onCancelLongPress: () => void;
  onStartEdit: (journal: JournalWithStats) => void;
  onStartDelete: (journalId: string) => void;
}

// 8 Matte, Velvet-Finish Aqua Vitaeum Bookbinding Palettes (Zero White)
export interface SpinePalette {
  key: string;
  nameDE: string;
  nameEN: string;
  hex: string;
  bg: string;
  swatchBg: string;
  text: string;
  textShadow?: string;
  foilBorder: string;
  foilGlow: string;
}

export const BOOK_SPINE_PALETTES: SpinePalette[] = [
  {
    key: 'green',
    nameDE: 'Irisches Moosgrün',
    nameEN: 'Irish Moss Green',
    hex: '#385644',
    bg: 'bg-[var(--spine-green)]',
    swatchBg: 'bg-[var(--spine-green)]',
    text: 'text-amber-100',
    foilBorder: 'border-amber-300/25',
    foilGlow: 'hover:border-emerald-400/40',
  },
  {
    key: 'ruby',
    nameDE: 'Portwein Rubinrot',
    nameEN: 'Port Wine Ruby',
    hex: '#6E3F42',
    bg: 'bg-[var(--spine-ruby)]',
    swatchBg: 'bg-[var(--spine-ruby)]',
    text: 'text-amber-100',
    foilBorder: 'border-amber-300/25',
    foilGlow: 'hover:border-rose-400/40',
  },
  {
    key: 'amber',
    nameDE: 'Pot-Still Bernstein',
    nameEN: 'Pot-Still Amber',
    hex: '#885C35',
    bg: 'bg-[var(--spine-amber)]',
    swatchBg: 'bg-[var(--spine-amber)]',
    text: 'text-amber-50',
    foilBorder: 'border-amber-200/25',
    foilGlow: 'hover:border-amber-300/50',
  },
  {
    key: 'teal',
    nameDE: 'Islay Maritime-Petrol',
    nameEN: 'Islay Sea Teal',
    hex: '#34535F',
    bg: 'bg-[var(--spine-teal)]',
    swatchBg: 'bg-[var(--spine-teal)]',
    text: 'text-teal-100',
    foilBorder: 'border-amber-300/25',
    foilGlow: 'hover:border-teal-300/40',
  },
  {
    key: 'havana',
    nameDE: 'Havanna Sattelleder',
    nameEN: 'Havana Leather',
    hex: '#5E4434',
    bg: 'bg-[var(--spine-havana)]',
    swatchBg: 'bg-[var(--spine-havana)]',
    text: 'text-amber-100',
    foilBorder: 'border-amber-300/25',
    foilGlow: 'hover:border-amber-400/40',
  },
  {
    key: 'indigo',
    nameDE: 'Atlantik Tiefsee-Indigo',
    nameEN: 'Atlantic Deep Indigo',
    hex: '#2E4057',
    bg: 'bg-[var(--spine-indigo)]',
    swatchBg: 'bg-[var(--spine-indigo)]',
    text: 'text-amber-100',
    foilBorder: 'border-amber-300/25',
    foilGlow: 'hover:border-sky-400/40',
  },
  {
    key: 'heather',
    nameDE: 'Highland Heideviolett',
    nameEN: 'Highland Heather',
    hex: '#5C4355',
    bg: 'bg-[var(--spine-heather)]',
    swatchBg: 'bg-[var(--spine-heather)]',
    text: 'text-purple-100',
    foilBorder: 'border-amber-300/25',
    foilGlow: 'hover:border-purple-300/40',
  },
  {
    key: 'slate',
    nameDE: 'Oxford Schiefergrau',
    nameEN: 'Oxford Slate Charcoal',
    hex: '#424953',
    bg: 'bg-[var(--spine-slate)]',
    swatchBg: 'bg-[var(--spine-slate)]',
    text: 'text-amber-100',
    foilBorder: 'border-amber-300/25',
    foilGlow: 'hover:border-amber-300/40',
  },
];

/**
 * Resolves a spine palette: uses user-selected color first, or falls back to deterministic hash based strictly on journal ID/name.
 */
export function getSpinePalette(journal: JournalWithStats): SpinePalette {
  if (journal.id === 'default-compendium') {
    return BOOK_SPINE_PALETTES[0]; // Master Compendium always wears Signature Irish Forest Green
  }
  if (journal.color) {
    const matched = BOOK_SPINE_PALETTES.find((p) => p.key === journal.color);
    if (matched) return matched;
  }
  let hash = 0;
  const str = journal.id || journal.name || 'journal';
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return BOOK_SPINE_PALETTES[hash % BOOK_SPINE_PALETTES.length];
}

const MAX_BOOKS_PER_SHELF = 4;

export function JournalBookshelfView({
  journals,
  selectedIds,
  isSelectMode,
  editingId,
  onCardClick,
  onTouchStart,
  onTouchEnd,
  onCancelLongPress,
  onStartEdit,
  onStartDelete,
}: JournalBookshelfViewProps) {
  const { language } = useLanguage();

  // Split journals into responsive tiers of 4 items each
  const shelfRows = useMemo(() => {
    const rows: JournalWithStats[][] = [];
    for (let i = 0; i < journals.length; i += MAX_BOOKS_PER_SHELF) {
      rows.push(journals.slice(i, i + MAX_BOOKS_PER_SHELF));
    }
    return rows.length > 0 ? rows : [[]];
  }, [journals]);

  return (
    <div className="w-full flex flex-col items-center pt-2 pb-8 animate-fade-in select-none gap-6 sm:gap-8">
      {shelfRows.map((rowJournals, shelfIdx) => {
        return (
          <div key={`shelf-tier-${shelfIdx}`} className="w-full max-w-2xl sm:max-w-3xl flex flex-col items-center">
            {/* ─── 1. The Books Row (Uniform 4-slot grid alignment per shelf tier) ─── */}
            <div className="w-full flex items-end justify-center px-3 sm:px-6 z-10 relative h-[300px] sm:h-[325px] md:h-[345px]">
              <div className="grid grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 w-full max-w-xl sm:max-w-2xl items-end justify-items-center">
                {rowJournals.map((journal) => {
                  const isDefault = journal.id === 'default-compendium';
                  const isEditing = editingId === journal.id;
                  const isSelected = selectedIds.has(journal.id);
                  const palette = getSpinePalette(journal);

                  return (
                    <div
                      key={journal.id}
                      onClick={() => onCardClick(journal.id, isEditing)}
                      onTouchStart={(e) => onTouchStart(e, journal.id)}
                      onTouchEnd={onTouchEnd}
                      onTouchMove={onCancelLongPress}
                      onContextMenu={(e) => {
                        if (!isSelectMode) e.preventDefault();
                      }}
                      style={{ backgroundColor: `var(--spine-${palette.key})` }}
                      className={cn(
                        'group relative flex flex-col justify-between items-center',
                        isDefault
                          ? 'w-[68px] sm:w-[80px] md:w-[86px] h-[295px] sm:h-[320px] md:h-[340px]'
                          : 'w-[62px] sm:w-[72px] md:w-[78px] h-[280px] sm:h-[305px] md:h-[325px]',
                        'rounded-t-lg rounded-b-none border transition-all duration-300 transform select-none cursor-pointer overflow-visible',
                        palette.bg,
                        'border-black/25',
                        palette.foilGlow,
                        // Subtle, soft matte spine curvature & gentle shadow
                        'shadow-[inset_3px_0_6px_rgba(0,0,0,0.2),inset_-3px_0_6px_rgba(0,0,0,0.2),0_4px_14px_rgba(0,0,0,0.14)]',
                        isSelected
                          ? 'ring-2 ring-[var(--wood-selection)] -translate-y-7 shadow-[0_18px_32px_rgba(46,148,93,0.35)] z-30'
                          : isSelectMode
                            ? 'opacity-40 scale-95'
                            : 'hover:-translate-y-5 hover:shadow-[0_16px_28px_rgba(0,0,0,0.28)] z-20',
                      )}
                    >
                      {/* Soft Matte Ambient Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/22 pointer-events-none rounded-t-lg" />

                      {/* ─── TOP SECTION: Gilded Hairline & Rating / Actions ─── */}
                      <div className="w-full flex flex-col items-center pt-2.5 px-1.5 z-10 shrink-0">
                        {/* Top Gilded Double Hairline Band */}
                        <div className={cn('w-[80%] border-y py-0.5 mb-2 bg-black/10 flex items-center justify-center', palette.foilBorder)}>
                          <div className="w-1 h-1 rounded-full bg-amber-300/50" />
                        </div>

                        {isSelectMode ? (
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-md',
                              isSelected
                                ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)]'
                                : 'bg-[var(--pub-bg-panel)] border-[var(--parchment-border)]',
                            )}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--parchment-bg)]" />}
                          </div>
                        ) : (
                          <div className="relative w-full flex justify-center min-h-[22px]">
                            {/* Score Star & Average Rating */}
                            <div className="flex flex-col items-center gap-0.5 group-hover:opacity-0 transition-opacity">
                              {journal.averageRating > 0 ? (
                                <div className="flex items-center gap-0.5 bg-black/30 px-1.5 py-0.5 rounded-full border border-amber-300/20 shadow-inner">
                                  <Star className="w-3 h-3 text-[var(--brass-accent)] fill-[var(--brass-accent)]" />
                                  <span className="font-mono text-[10px] font-bold text-amber-200">
                                    {journal.averageRating}
                                  </span>
                                </div>
                              ) : (
                                <Flame className="w-3.5 h-3.5 text-amber-300/50" />
                              )}
                            </div>

                            {/* Hover Action Buttons */}
                            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStartEdit(journal);
                                }}
                                className="p-1 rounded bg-black/70 hover:bg-black/90 text-amber-200 transition-all cursor-pointer shadow-xs border border-amber-300/30"
                                title={language === 'DE' ? 'Bearbeiten' : 'Edit'}
                              >
                                <Edit3 className="w-3 h-3 text-amber-200" />
                              </button>
                              {!isDefault && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStartDelete(journal.id);
                                  }}
                                  className="p-1 rounded bg-black/70 hover:bg-red-950 text-red-300 hover:text-red-100 transition-all cursor-pointer shadow-xs border border-red-300/30"
                                  title={language === 'DE' ? 'Löschen' : 'Delete'}
                                >
                                  <Trash2 className="w-3 h-3 text-red-300" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ─── CENTER SECTION: Direct Spine Book Title (Max 2 Rows) ─── */}
                      <div className="flex-1 flex items-center justify-center my-2 px-1 z-10 w-full overflow-hidden min-h-0">
                        <span
                          className={cn(
                            'font-display font-bold text-[11px] sm:text-xs tracking-wider uppercase',
                            '[writing-mode:vertical-rl] rotate-180 text-center select-none leading-tight',
                            'max-h-[175px] sm:max-h-[205px] max-w-[38px] sm:max-w-[46px] overflow-hidden break-words line-clamp-2',
                            palette.text,
                            palette.textShadow || 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]',
                          )}
                          title={journal.name}
                        >
                          {journal.name}
                        </span>
                      </div>

                      {/* ─── BOTTOM SECTION: Note Count Pill & Gilded Hairline ─── */}
                      <div className="w-full flex flex-col items-center pb-1.5 px-1.5 shrink-0 z-10">
                        {/* Note Count Pill */}
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/35 border border-amber-300/20 shadow-inner mb-1.5"
                          title={`${journal.bottleCount} ${language === 'DE' ? 'Notizen' : 'Notes'}`}
                        >
                          <FileText className="w-3 h-3 text-[var(--brass-accent)]" />
                          <span className="font-mono text-[10px] sm:text-[11px] font-bold text-amber-100 tabular-nums">
                            {journal.bottleCount}
                          </span>
                        </div>

                        {/* Lower Gilded Double Hairline Band */}
                        <div className={cn('w-[80%] border-y py-0.5 bg-black/10 flex items-center justify-center', palette.foilBorder)}>
                          <div className="w-1 h-1 rounded-full bg-amber-300/50" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── 2. SOLID SINGLE-PIECE IRISH PUB OAK SHELF PLANK ─── */}
            <div className="w-full relative z-0 mt-[-1px]">
              {/* Solid continuous Oak Plank (Single unified element, zero hairline gaps) */}
              <div className="w-full h-6 sm:h-7 rounded-b-md border-t border-[var(--shelf-wood-bevel)]/90 bg-gradient-to-b from-[var(--shelf-wood-top)] via-[var(--shelf-wood-front)] to-[#53341E] shadow-[0_6px_16px_var(--shelf-wood-shadow)] relative overflow-hidden">
                {/* Subtle top edge specular oak sheen */}
                <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-amber-200/20 via-amber-100/5 to-transparent pointer-events-none" />
                {/* Subtle horizontal grain lines */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/15 pointer-events-none" />
                {/* Bottom chamfer depth */}
                <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
              </div>

              {/* Soft Ambient Shadow Under Shelf */}
              <div className="w-[96%] mx-auto h-2.5 bg-black/20 blur-xs rounded-full pointer-events-none -mt-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
