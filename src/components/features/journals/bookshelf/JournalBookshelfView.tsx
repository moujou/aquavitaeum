'use client';

import React from 'react';
import { JournalWithStats } from '@/hooks/useJournals';
import { Star, FileText, Edit3, Trash2, CheckCircle2, BookOpen, Flame } from 'lucide-react';
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

// 8 Rich, Velvet-Finish Antique Leather Bookbinding Palettes (Zero White)
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
    foilBorder: 'border-amber-300/35',
    foilGlow: 'hover:border-emerald-400/50',
  },
  {
    key: 'ruby',
    nameDE: 'Portwein Rubinrot',
    nameEN: 'Port Wine Ruby',
    hex: '#6E3F42',
    bg: 'bg-[var(--spine-ruby)]',
    swatchBg: 'bg-[var(--spine-ruby)]',
    text: 'text-amber-100',
    foilBorder: 'border-amber-300/35',
    foilGlow: 'hover:border-rose-400/50',
  },
  {
    key: 'amber',
    nameDE: 'Pot-Still Bernstein',
    nameEN: 'Pot-Still Amber',
    hex: '#885C35',
    bg: 'bg-[var(--spine-amber)]',
    swatchBg: 'bg-[var(--spine-amber)]',
    text: 'text-amber-50',
    foilBorder: 'border-amber-300/35',
    foilGlow: 'hover:border-amber-300/60',
  },
  {
    key: 'teal',
    nameDE: 'Islay Maritime-Petrol',
    nameEN: 'Islay Sea Teal',
    hex: '#34535F',
    bg: 'bg-[var(--spine-teal)]',
    swatchBg: 'bg-[var(--spine-teal)]',
    text: 'text-teal-100',
    foilBorder: 'border-amber-300/35',
    foilGlow: 'hover:border-teal-300/50',
  },
  {
    key: 'havana',
    nameDE: 'Havanna Sattelleder',
    nameEN: 'Havana Leather',
    hex: '#5E4434',
    bg: 'bg-[var(--spine-havana)]',
    swatchBg: 'bg-[var(--spine-havana)]',
    text: 'text-amber-100',
    foilBorder: 'border-amber-300/35',
    foilGlow: 'hover:border-amber-400/50',
  },
  {
    key: 'indigo',
    nameDE: 'Atlantik Tiefsee-Indigo',
    nameEN: 'Atlantic Deep Indigo',
    hex: '#2E4057',
    bg: 'bg-[var(--spine-indigo)]',
    swatchBg: 'bg-[var(--spine-indigo)]',
    text: 'text-amber-100',
    foilBorder: 'border-amber-300/35',
    foilGlow: 'hover:border-sky-400/50',
  },
  {
    key: 'heather',
    nameDE: 'Highland Heideviolett',
    nameEN: 'Highland Heather',
    hex: '#5C4355',
    bg: 'bg-[var(--spine-heather)]',
    swatchBg: 'bg-[var(--spine-heather)]',
    text: 'text-purple-100',
    foilBorder: 'border-amber-300/35',
    foilGlow: 'hover:border-purple-300/50',
  },
  {
    key: 'slate',
    nameDE: 'Oxford Schiefergrau',
    nameEN: 'Oxford Slate Charcoal',
    hex: '#424953',
    bg: 'bg-[var(--spine-slate)]',
    swatchBg: 'bg-[var(--spine-slate)]',
    text: 'text-amber-100',
    foilBorder: 'border-amber-300/35',
    foilGlow: 'hover:border-amber-300/50',
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

  return (
    <div className="w-full max-w-6xl mx-auto pt-2 pb-14 animate-fade-in select-none">
      {/* ─── PURE COMPENDIUM HARDCOVER BOOKS GALLERY (MAX 3 PER ROW ON DESKTOP) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 w-full justify-items-center">
        {journals.map((journal) => {
          const isDefault = journal.id === 'default-compendium';
          const isEditing = editingId === journal.id;
          const isSelected = selectedIds.has(journal.id);
          const palette = getSpinePalette(journal);

          return (
            <div
              key={journal.id}
              className="relative group w-full max-w-[320px] [perspective:1200px]"
            >
              {/* ─── 3D Fore-Edge Paper Block (Schnittkante der Buchseiten rechts) ─── */}
              <div
                aria-hidden="true"
                className={cn(
                  'absolute right-1 top-2 bottom-2 w-3 rounded-r-xs pointer-events-none transition-all duration-500 ease-out z-0',
                  'bg-gradient-to-r from-[#DFD6C6] via-[#F3EDE2] to-[#D5CABB] border-y border-r border-[#C5B7A0]/60',
                  'dark:from-[#151D25] dark:via-[#212C38] dark:to-[#12181F] dark:border-white/10',
                  'shadow-[3px_2px_7px_rgba(20,10,4,0.18)] dark:shadow-[3px_2px_8px_rgba(0,0,0,0.45)]',
                  'group-hover:translate-x-1.5 group-hover:scale-y-[0.99]',
                  isSelected && 'translate-x-1.5'
                )}
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
                }}
              />

              {/* ─── Main Hardcover Book Volume ─── */}
              <div
                onClick={() => onCardClick(journal.id, isEditing)}
                onTouchStart={(e) => onTouchStart(e, journal.id)}
                onTouchEnd={onTouchEnd}
                onTouchMove={onCancelLongPress}
                onContextMenu={(e) => {
                  if (!isSelectMode) e.preventDefault();
                }}
                style={{ backgroundColor: `var(--spine-${palette.key})` }}
                className={cn(
                  'relative flex flex-col justify-between w-full min-h-[390px] sm:min-h-[420px]',
                  'rounded-r-xl rounded-l-xs border transition-all duration-500 ease-out transform-gpu select-none cursor-pointer overflow-hidden origin-left z-10',
                  palette.bg,
                  'border-black/40 dark:border-white/10',
                  palette.foilGlow,
                  // Tactile Hardcover book volume shadow
                  'shadow-[0_12px_28px_rgba(25,12,5,0.22),-2px_2px_8px_rgba(25,12,5,0.12),inset_0_1px_1px_rgba(255,255,255,0.25)]',
                  'dark:shadow-[0_14px_32px_rgba(0,0,0,0.55),-2px_2px_8px_rgba(0,0,0,0.40),inset_0_1px_1px_rgba(255,255,255,0.10)]',
                  isSelected
                    ? 'ring-2 ring-[var(--wood-selection)] [transform:rotateY(-3deg)_translateY(-10px)] shadow-[14px_22px_45px_rgba(46,148,93,0.40)] z-20'
                    : isSelectMode
                      ? 'opacity-40 scale-95'
                      : 'hover:[transform:rotateY(-5deg)_translateY(-8px)] hover:shadow-[16px_24px_42px_rgba(25,12,5,0.32),-3px_4px_12px_rgba(25,12,5,0.16)] dark:hover:shadow-[16px_24px_44px_rgba(0,0,0,0.70)] z-10',
                )}
              >
                {/* Left Leather Spine Hinge (Charakteristischer gerundeter Buchrücken mit Goldprägungen) */}
                <div className="w-5 sm:w-6 h-full absolute left-0 top-0 bottom-0 z-20 bg-gradient-to-r from-black/60 via-black/25 to-black/50 border-r border-amber-300/35 shadow-[2px_0_5px_rgba(0,0,0,0.40)] pointer-events-none flex flex-col justify-between py-3.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-300/70 shadow-2xs" />
                  <div className="w-1 h-3 rounded-full bg-amber-300/40" />
                  <div className="w-0.5 h-16 bg-amber-300/30 rounded-full" />
                  <div className="w-1 h-3 rounded-full bg-amber-300/40" />
                  <div className="w-2 h-2 rounded-full bg-amber-300/70 shadow-2xs" />
                </div>

                {/* Falzrille / Hinge Groove (Physikalische Buchfalz-Vertiefung zwischen Rücken und Deckel) */}
                <div
                  aria-hidden="true"
                  className="w-[3px] h-full absolute left-5 sm:left-6 top-0 bottom-0 z-20 bg-gradient-to-r from-black/55 via-black/20 to-transparent pointer-events-none shadow-[-1px_0_3px_rgba(0,0,0,0.50)]"
                />

                {/* Ambient Front Cover Specular Sheen (Subtiler diagonaler Glanzreflex auf dem Buchdeckel) */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 ml-5 sm:ml-6 pointer-events-none z-15 bg-gradient-to-tr from-black/15 via-white/5 to-transparent opacity-70 group-hover:opacity-100 transition-opacity"
                />

                {/* ─── UPPER HALF: Full Cover Artwork Canvas ─── */}
                <div className="flex-1 ml-5 sm:ml-6 relative overflow-hidden bg-black/20 flex flex-col justify-between p-3 min-h-[230px] sm:min-h-[250px]">
                {/* Background Artwork */}
                {journal.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={journal.coverImage}
                    alt={`${journal.name} cover`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-black/20 via-transparent to-black/35">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-amber-300/35 bg-black/40 flex items-center justify-center shadow-inner mb-2">
                      <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-amber-200/85 stroke-[1.75]" />
                    </div>
                    <span className="font-display text-xs sm:text-sm font-bold text-amber-100/80 uppercase tracking-widest">
                      {isDefault ? 'Compendium' : 'Codex'}
                    </span>
                  </div>
                )}

                {/* Top Ambient Shadow Overlay on Image */}
                <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />

                {/* Top Controls Overlay (Select Checkbox or Hover Action Buttons) */}
                <div className="relative z-20 flex items-center justify-between w-full">
                  {/* Left: Select Mode Checkbox */}
                  {isSelectMode ? (
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-md',
                        isSelected
                          ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)]'
                          : 'bg-[var(--pub-bg-panel)] border-[var(--parchment-border)]',
                      )}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--fab-text)]" />}
                    </div>
                  ) : (
                    <span className="w-1" />
                  )}

                  {/* Right: Hover Action Buttons */}
                  {!isSelectMode && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartEdit(journal);
                        }}
                        className="p-1.5 rounded-md bg-black/80 hover:bg-black text-amber-200 transition-all cursor-pointer shadow-md border border-amber-300/35 active:scale-90"
                        title={language === 'DE' ? 'Bearbeiten' : 'Edit'}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-200" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartDelete(journal.id);
                        }}
                        className="p-1.5 rounded-md bg-black/80 hover:bg-red-950 text-red-300 hover:text-red-100 transition-all cursor-pointer shadow-md border border-red-400/40 active:scale-90"
                        title={language === 'DE' ? 'Löschen' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-300" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── LOWER HALF: Editorial Title, Description & Atomic Bottom Bar ─── */}
              <div className="ml-5 sm:ml-6 bg-[var(--parchment-bg)] border-t border-[var(--parchment-border)] p-3.5 sm:p-4 flex flex-col justify-between min-h-[125px] sm:min-h-[140px] relative z-10 text-left">
                {/* Title & Description Container */}
                <div className="flex flex-col min-w-0">
                  {/* Horizontal, lesbarer Titel in Playfair Display */}
                  <h3
                    className="font-display font-bold text-sm sm:text-base text-[var(--sepia-text)] group-hover:text-[var(--brass-accent)] transition-colors leading-snug line-clamp-2 break-words"
                    title={journal.name}
                  >
                    {journal.name}
                  </h3>

                  {/* Großzügige Beschreibung (falls vorhanden) */}
                  {journal.description && (
                    <p className="font-body text-xs text-[var(--sepia-muted)] italic line-clamp-2 sm:line-clamp-3 leading-relaxed mt-1">
                      {journal.description}
                    </p>
                  )}
                </div>

                {/* Atomare Fußleiste: Links Notizen-Zähler, Rechts Sterne / Rating */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--parchment-border)]/50 mt-2 w-full">
                  {/* Links: Notizen-Anzahl */}
                  <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--sepia-muted)] tabular-nums">
                    <FileText className="w-3.5 h-3.5 text-[var(--brass-accent)] shrink-0" />
                    <span>
                      <span className="font-bold text-[var(--sepia-text)]">{journal.bottleCount}</span>{' '}
                      {journal.bottleCount === 1 ? (language === 'DE' ? 'Notiz' : 'Note') : (language === 'DE' ? 'Notizen' : 'Notes')}
                    </span>
                  </div>

                  {/* Rechts (Bottom-Right): Sterne / Sommelier-Rating (Clean ohne Hintergrund) */}
                  {journal.averageRating > 0 ? (
                    <div
                      className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--sepia-text)] tabular-nums"
                      title={`${language === 'DE' ? 'Durchschnittsbewertung' : 'Average Rating'}: ${journal.averageRating}`}
                    >
                      <Star className="w-3.5 h-3.5 text-[var(--brass-accent)] fill-[var(--brass-accent)] shrink-0" />
                      <span>{journal.averageRating}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--sepia-muted)]/50">
                      <Flame className="w-3.5 h-3.5 text-[var(--sepia-muted)]/40 shrink-0" />
                      <span className="tabular-nums font-medium">—</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
}
