/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Check, Star, Calendar } from 'lucide-react';
import { Spirit, SPIRIT_COLOUR_HEX, SpiritColour } from '@/types/spirit.types';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { cn } from '@/lib/utils';
import { getRatingTierStyle } from '@/lib/spirit-utils';
import { useLanguage } from '@/context/LanguageContext';
import { translateFlavorTag, getFlavorColor } from '@/data/spirit-flavor-taxonomy';

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
  const tierStyle = getRatingTierStyle(spirit.rating100);

  const formattedDate = spirit.dateTasted
    ? new Date(spirit.dateTasted).toLocaleDateString(language === 'DE' ? 'de-DE' : 'en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  // Construct Specs Line 1 (Row 4: Years · vol · bottle size)
  const specsRow4: string[] = [];
  if (spirit.age) specsRow4.push(`${spirit.age} ${language === 'DE' ? 'Jahre' : 'Years'}`);
  if (spirit.abv > 0) specsRow4.push(`${spirit.abv}% vol`);
  if (spirit.volumeMl && spirit.volumeMl > 0) specsRow4.push(`${spirit.volumeMl}ml`);

  // Construct Specs Line 2 (Row 5: Strength · Added Colour · Chill Filtered)
  const specsRow5: string[] = [];
  specsRow5.push(
    spirit.isCaskStrength
      ? (language === 'DE' ? 'Fassstärke' : 'Cask Strength')
      : (language === 'DE' ? 'Trinkstärke' : 'Standard')
  );
  specsRow5.push(
    !spirit.addedColour
      ? (language === 'DE' ? 'Ohne Farbstoff' : 'Natural Colour')
      : (language === 'DE' ? 'Mit Farbstoff' : 'Added Colour')
  );
  specsRow5.push(
    !spirit.chillFiltered
      ? (language === 'DE' ? 'Nicht kühlgefiltert' : 'Non-Chill Filtered')
      : (language === 'DE' ? 'Kühlgefiltert' : 'Chill Filtered')
  );

  // Construct Specs Line 3 (Row 6: Finish · Cask / Batch No. - conditional)
  const specsRow6: string[] = [];
  if (spirit.finish) specsRow6.push(spirit.finish);
  if (spirit.caskNo) {
    specsRow6.push(
      spirit.caskNo.toLowerCase().startsWith('cask') ||
      spirit.caskNo.toLowerCase().startsWith('batch') ||
      spirit.caskNo.startsWith('#')
        ? spirit.caskNo
        : `Cask #${spirit.caskNo}`
    );
  }

  // Get up to 8 flavor tags for rich preview across full width
  const previewFlavorTags = (spirit.flavorTags ?? []).slice(0, 8);

  // Extract a representative tasting note quote snippet
  const tastingQuote = spirit.finishNotes || null;

  return (
    <button
      type="button"
      onClick={onClick}
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
      {/* ── 1. Top Section: Prominent Bottle Image (Left) + Structured Continuous Rows (Right) ── */}
      <div className="w-full flex flex-row items-stretch border-b border-[var(--parchment-divider)]">
        {/* Generous Flush Bottle Showcase Frame (Top-Left) */}
        <div className="w-[110px] sm:w-[145px] md:w-[170px] shrink-0 bg-[var(--pub-bg-alt)]/60 border-r border-[var(--parchment-border)] relative flex items-center justify-center p-0 overflow-hidden min-h-[115px] sm:min-h-[140px]">
          {spirit.thumbnailImage ? (
            <img
              src={spirit.thumbnailImage}
              alt={spirit.name}
              className="w-full h-full object-contain p-0 transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none z-10"
              draggable={false}
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/30 flex items-center justify-center text-[var(--forest-green)] shadow-xs transition-transform duration-300 group-hover:scale-110 z-10">
              <WhiskyLogo size={36} className="text-[var(--forest-green)] sm:size-[48px]" />
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
            <div className="absolute top-2 left-2 z-30">
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

        {/* Editorial Metadata Block (Top-Right: Structured Continuous Rows with Calibrated Responsive Typography) */}
        <div className="flex-1 min-w-0 p-3 sm:p-4 md:p-4.5 flex flex-col justify-center gap-1 sm:gap-1.5 z-10">
          {/* Row 1: Name des Whiskys & Rating Medal */}
          <div className="flex items-start justify-between gap-2.5 min-w-0">
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-bold text-base sm:text-xl md:text-2xl text-[var(--foreground)] group-hover:text-[var(--brass-accent)] transition-colors truncate leading-tight tracking-wide">
                {spirit.name || spirit.distillery}
              </h3>
            </div>

            {/* Dynamic Score Medal */}
            <div
              className={cn(
                'shrink-0 flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg border font-display font-black text-xs sm:text-sm md:text-base shadow-xs select-none',
                tierStyle.bg,
                tierStyle.border,
                tierStyle.text
              )}
            >
              <Star size={12} className={cn('sm:size-[14px] shrink-0 -mt-0.5', tierStyle.starColor)} />
              <span>{spirit.rating100}</span>
            </div>
          </div>

          {/* Row 2: Typ des Whiskys */}
          <div className="font-display text-[10.5px] sm:text-xs md:text-sm uppercase tracking-wider text-[var(--sepia-text)] font-semibold truncate leading-tight">
            {spirit.spiritType}
          </div>

          {/* Row 3: Destillerie • Herkunft */}
          <div className="text-xs sm:text-sm md:text-base font-body text-[var(--sepia-text)] font-semibold truncate leading-tight flex items-center gap-1.5 min-w-0">
            <span className="truncate">{spirit.distillery}</span>
            {spirit.region && (
              <>
                <span className="text-[var(--sepia-muted)]/50 select-none">·</span>
                <span className="truncate font-semibold text-[var(--sepia-text)]">{spirit.region}</span>
              </>
            )}
          </div>

          {/* Row 4: Years · vol · bottle size (Continuous Text) */}
          {specsRow4.length > 0 && (
            <div className="text-xs sm:text-sm md:text-base font-body text-[var(--sepia-text)] font-medium leading-tight flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {specsRow4.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-[var(--sepia-muted)]/50 select-none">·</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Row 5: Strength · Added Colour · Chill Filtered (Continuous Text) */}
          <div className="text-[11px] sm:text-xs md:text-sm font-body text-[var(--sepia-muted)] font-medium leading-tight flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {specsRow5.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[var(--sepia-muted)]/50 select-none">·</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>

          {/* Row 6: Finish · Cask / Batch No. (Continuous Text, conditional) */}
          {specsRow6.length > 0 && (
            <div className="text-[11px] sm:text-xs md:text-sm font-body text-[var(--sepia-muted)] font-medium leading-tight flex items-center gap-1.5 sm:gap-2 flex-wrap">
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

      {/* ── 2. Middle Section: Dedicated Full-Width Sensory Canvas (Flavor Tags & Tasting Notes on Parchment) ── */}
      <div className="w-full p-3 sm:p-4 md:p-4.5 flex flex-col gap-2 sm:gap-2.5 z-10">
        {/* Full-Width Soft Opacity Color Flavor Tag Pills */}
        {previewFlavorTags.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap overflow-hidden">
            {previewFlavorTags.map((tag) => {
              const color = getFlavorColor(tag);
              return (
                <span
                  key={tag}
                  style={{
                    backgroundColor: color,
                    color: '#ffffff',
                  }}
                  className="inline-flex items-center text-[10.5px] sm:text-xs md:text-sm font-semibold tracking-wide px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-2xs select-none opacity-80 transition-all hover:opacity-100 hover:scale-105"
                >
                  {translateFlavorTag(tag, language)}
                </span>
              );
            })}
          </div>
        )}

        {/* Tasting Notes Snippet Quote on Warm Parchment Panel */}
        {tastingQuote && (
          <p className="line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm md:text-base text-[var(--sepia-text)]/90 italic font-body leading-relaxed bg-[var(--pub-bg-alt)]/40 border border-[var(--parchment-border)]/50 rounded-lg sm:rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5">
            „{tastingQuote}“
          </p>
        )}
      </div>

      {/* ── 3. Signature Clover Green Grounded Footer: Date & Flavor Count ── */}
      <div className="w-full bg-[var(--wood-dark)] px-3 sm:px-4 py-1.5 sm:py-2 border-t border-[var(--wood-dark)]/80 flex items-center justify-between gap-2 text-[10px] sm:text-xs text-[var(--parchment-bg)] shrink-0">
        <div className="flex items-center gap-1.5 min-w-0 font-medium text-[var(--parchment-bg)]/80">
          {previewFlavorTags.length > 0 && (
            <span>
              {previewFlavorTags.length} {language === 'DE' ? 'Aromen erfasst' : 'Aromas captured'}
            </span>
          )}
        </div>

        {formattedDate && (
          <div className="flex items-center gap-1 font-mono text-[var(--parchment-bg)]/85 whitespace-nowrap text-right shrink-0">
            <Calendar size={11} className="sm:size-[12px] text-[var(--brass-light)] shrink-0" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>
    </button>
  );
}
