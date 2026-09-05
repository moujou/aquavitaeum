/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Check, Calendar } from 'lucide-react';
import { Spirit, SPIRIT_COLOUR_HEX, SpiritColour } from '@/types/spirit.types';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { getActiveFlavorCategories } from '@/data/spirit-flavor-taxonomy';
import { translateCharacteristic } from '@/lib/i18n/translations';
import { formatSpiritCardSpecs, scoreToStars } from '@/lib/spirit-utils';
import { SommelierScoreMedallion } from '@/components/ui/SommelierScoreMedallion';
import { RatingStars } from '@/components/ui/RatingStars';

interface NoteListItemProps {
  spirit: Spirit;
  onClick: () => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchCancel?: () => void;
  onTouchMove?: () => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

export function NoteListItem({
  spirit,
  onClick,
  isSelectMode = false,
  isSelected = false,
  onTouchStart,
  onTouchCancel,
  onTouchMove,
  onTouchEnd,
}: NoteListItemProps) {
  const { language } = useLanguage();
  const colourHex = SPIRIT_COLOUR_HEX[spirit.colour as SpiritColour] ?? '#FFD700';

  const activeCategories = React.useMemo(
    () => getActiveFlavorCategories(spirit.flavorTags),
    [spirit.flavorTags]
  );

  const { formattedDate, specsRow4, specsRow5, specsRow6 } = React.useMemo(
    () => formatSpiritCardSpecs(spirit, language, translateCharacteristic),
    [spirit, language]
  );

  const stars = React.useMemo(
    () => scoreToStars(spirit.rating100 || 1),
    [spirit.rating100]
  );

  // Extract a representative tasting note quote snippet
  const tastingQuote = spirit.finishNotes || null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelectMode ? isSelected : false}
      onTouchStart={onTouchStart}
      onTouchCancel={onTouchCancel}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
      className={cn(
        'w-full flex flex-col rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer group relative overflow-hidden text-left select-none',
        'bg-[var(--parchment-bg)] border border-[var(--parchment-border)] shadow-[0_6px_20px_-3px_rgba(35,20,8,0.12),0_2px_6px_rgba(35,20,8,0.06)]',
        isSelectMode
          ? isSelected
            ? 'border-[var(--wood-selection)] ring-2 ring-[var(--wood-selection)]/45 shadow-[0_0_28px_rgba(46,148,93,0.35)] scale-[1.01] opacity-100 bg-[var(--pub-bg-panel)] z-10'
            : 'border-[var(--parchment-border)]/50 opacity-40 scale-[0.99] shadow-xs'
          : 'hover:border-[var(--forest-green)] hover:shadow-[0_12px_28px_-3px_rgba(35,115,71,0.20),0_4px_12px_rgba(35,20,8,0.08)] hover:-translate-y-0.5'
      )}
    >
      {/* ── 1. Signature Clover Green Top Header Banner ── */}
      <div className="w-full bg-[var(--wood-dark)] px-3 sm:px-4 py-2 sm:py-2.5 border-b border-[var(--wood-dark)]/80 flex items-center justify-between gap-3 min-h-[44px] sm:min-h-[48px] z-10 shrink-0 text-left">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm sm:text-base font-bold text-[var(--parchment-bg)] group-hover:text-[var(--brass-light)] transition-colors leading-snug line-clamp-2 break-words tracking-wide">
            {spirit.name || spirit.distillery}
          </h3>
        </div>
        {spirit.rating100 ? (
          <div className="shrink-0 flex items-center justify-center self-center">
            <SommelierScoreMedallion score={spirit.rating100} size="sm" variant="badge" />
          </div>
        ) : null}
      </div>

      {/* ── 2. Showcase Section: Prominent Bottle Image (Left) + Structured Continuous Rows (Right) ── */}
      <div className="w-full flex flex-row items-stretch border-b border-[var(--parchment-divider)]">
        {/* Generous Flush Bottle Showcase Frame (Left) */}
        <div className="w-[80px] sm:w-[145px] md:w-[170px] shrink-0 bg-[var(--pub-bg-alt)]/60 border-r border-[var(--parchment-border)] relative flex items-center justify-center p-0 overflow-hidden min-h-[105px] sm:min-h-[140px]">
          {spirit.thumbnailImage ? (
            <img
              src={spirit.thumbnailImage}
              alt={spirit.name}
              className="w-full h-full object-contain p-0 transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none z-10"
              draggable={false}
            />
          ) : (
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/30 flex items-center justify-center text-[var(--forest-green)] shadow-xs transition-transform duration-300 group-hover:scale-110 z-10">
              <WhiskyLogo size={32} className="text-[var(--forest-green)] sm:size-[48px]" />
            </div>
          )}

          {/* Liquid Color Shimmer Ribbon along right paper seam */}
          <div
            className="absolute top-0 right-0 bottom-0 w-1.5 overflow-hidden shrink-0 pointer-events-none z-20"
            style={{ backgroundColor: colourHex }}
          >
            <div
              className="absolute inset-0 animate-fluid-flow"
              style={{
                backgroundImage:
                  'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 30%, rgba(0,0,0,0.2) 70%, rgba(255,255,255,0.4) 100%)',
                backgroundSize: '100% 200%',
              }}
            />
          </div>

          {/* Select Mode Checkbox (Top-Left) */}
          {isSelectMode && (
            <div className="absolute top-2 left-2 z-30 pointer-events-none">
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-md',
                  isSelected
                    ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)]'
                    : 'bg-[var(--pub-bg-panel)]/90 border-[var(--parchment-border)] shadow-xs'
                )}
              >
                {isSelected && <Check size={11} strokeWidth={3} className="text-[var(--parchment-bg)]" />}
              </div>
            </div>
          )}
        </div>

        {/* Editorial Metadata Block (Takes full remaining space) */}
        <div className="flex-1 min-w-0 p-2.5 sm:p-4 md:p-4.5 flex flex-col justify-center gap-1 sm:gap-1.5 z-10">
          {/* Row 1: Typ des Whiskys */}
          <div className="font-display text-[11px] sm:text-xs md:text-sm uppercase tracking-wider text-[var(--sepia-text)] font-bold leading-tight line-clamp-2 break-words">
            {spirit.spiritType}
          </div>

          {/* Row 2: Destillerie • Herkunft */}
          <div className="text-[12.5px] sm:text-sm md:text-base font-body text-[var(--sepia-text)] font-bold leading-tight flex items-center gap-1.5 min-w-0 flex-wrap">
            <span className="break-words">{spirit.distillery}</span>
            {spirit.region && (
              <>
                <span className="text-[var(--sepia-muted)]/50 select-none">·</span>
                <span className="font-semibold text-[var(--sepia-text)] break-words">{spirit.region}</span>
              </>
            )}
          </div>

          {/* Row 3: Years · vol · bottle size (Continuous Text) */}
          {specsRow4.length > 0 && (
            <div className="text-xs sm:text-sm md:text-base font-body text-[var(--sepia-text)] font-medium leading-tight flex items-center gap-1 sm:gap-2 flex-wrap">
              {specsRow4.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-[var(--sepia-muted)]/50 select-none">·</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Row 4: Strength · Added Colour · Chill Filtered (Continuous Text) */}
          <div className="text-[11.5px] sm:text-xs md:text-sm font-body text-[var(--sepia-muted)] font-medium leading-tight flex items-center gap-1 sm:gap-2 flex-wrap">
            {specsRow5.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[var(--sepia-muted)]/50 select-none">·</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>

          {/* Row 5: Finish · Cask / Batch No. (Continuous Text, conditional) */}
          {specsRow6.length > 0 && (
            <div className="text-[11.5px] sm:text-xs md:text-sm font-body text-[var(--sepia-muted)] font-medium leading-tight flex items-center gap-1 sm:gap-2 flex-wrap">
              {specsRow6.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-[var(--sepia-muted)]/50 select-none">·</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Middle Section: Dedicated Full-Width Sensory Canvas (Flavor Category Icons & Tasting Notes) ── */}
      <div className="w-full p-3 sm:p-4 md:p-4.5 flex flex-col gap-2.5 sm:gap-3 z-10">
        {/* Active Flavor Category Badges (Circular Category Icons) */}
        {activeCategories.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {activeCategories.map((cat) => (
              <span
                key={cat.id}
                title={`${cat.name[language] ?? cat.name.EN} (${cat.count})`}
                style={{
                  backgroundColor: `${cat.color}20`,
                  borderColor: `${cat.color}50`,
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center text-sm sm:text-base shadow-2xs shrink-0 select-none cursor-default transition-transform hover:scale-110"
              >
                <span>{cat.emoji}</span>
              </span>
            ))}
          </div>
        )}

        {/* Tasting Notes Snippet Quote on Warm Parchment Panel */}
        {tastingQuote && (
          <p className="text-[12.5px] sm:text-sm md:text-[15px] text-[var(--sepia-text)]/90 italic font-body leading-relaxed bg-[var(--pub-bg-alt)]/40 border border-[var(--parchment-border)]/50 rounded-lg sm:rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5">
            „{tastingQuote}“
          </p>
        )}
      </div>

      {/* ── 4. Light Parchment Grounded Footer: Stars (Left) & Date (Right) ── */}
      <div className="w-full bg-[var(--pub-bg-alt)]/35 px-3 sm:px-4 py-1.5 sm:py-2 border-t border-[var(--parchment-border)]/60 flex items-center justify-between gap-2 text-[11px] sm:text-xs shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <RatingStars stars={stars} size={13.5} className="shrink-0 gap-0.5" />
        </div>

        {formattedDate && (
          <div className="flex items-center gap-1 font-mono text-[var(--sepia-muted)] whitespace-nowrap text-right shrink-0">
            <Calendar size={11} className="sm:size-[12px] text-[var(--sepia-light)] shrink-0" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>
    </button>
  );
}
