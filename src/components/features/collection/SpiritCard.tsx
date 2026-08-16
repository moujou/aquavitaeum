/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Star, CheckCircle2, Calendar } from 'lucide-react';
import { Spirit, SPIRIT_COLOUR_HEX, SpiritColour } from '@/types/spirit.types';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { cn } from '@/lib/utils';
import { getRatingTierStyle } from '@/lib/spirit-utils';
import { useLanguage } from '@/context/LanguageContext';
import { getActiveFlavorCategories } from '@/data/spirit-flavor-taxonomy';

interface SpiritCardProps {
  spirit: Spirit;
  isSelected: boolean;
  onClick: () => void;
  /** True when the sidebar is in long-press multi-select mode */
  isSelectMode?: boolean;
  /** True when this card is checked (selected for bulk delete) */
  isSelectChecked?: boolean;
  /** Touch handlers — must be placed on the same element as onClick for correct preventDefault behaviour */
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onTouchCancel?: () => void;
  onTouchMove?: () => void;
}

export function SpiritCard({
  spirit,
  isSelected,
  onClick,
  isSelectMode = false,
  isSelectChecked = false,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  onTouchMove,
}: SpiritCardProps) {
  const { language } = useLanguage();
  const colourHex = SPIRIT_COLOUR_HEX[spirit.colour as SpiritColour] ?? '#FFD700';
  const tierStyle = getRatingTierStyle(spirit.rating100);

  const formattedDate = spirit.dateTasted
    ? new Date(spirit.dateTasted).toLocaleDateString(language === 'DE' ? 'de-DE' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  // Extract high-level active flavor categories for circular icon badges
  const activeCategories = React.useMemo(
    () => getActiveFlavorCategories(spirit.flavorTags),
    [spirit.flavorTags]
  );

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

  return (
    <button
      id={`spirit-card-${spirit.id}`}
      type="button"
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      onTouchMove={onTouchMove}
      style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
      className={cn(
        'w-full flex flex-col text-left rounded-xl sm:rounded-2xl border transition-all duration-300 ease-out group overflow-hidden cursor-pointer relative shrink-0 select-none',
        'bg-[var(--parchment-bg)] border border-[var(--parchment-border)] shadow-[0_6px_20px_-3px_rgba(35,20,8,0.12),0_2px_6px_rgba(35,20,8,0.06)]',
        isSelectMode
          ? isSelectChecked
            ? 'border-[var(--wood-selection)] ring-2 ring-[var(--wood-selection)]/45 shadow-[0_0_25px_rgba(46,148,93,0.35)] scale-[1.01] opacity-100 bg-[var(--pub-bg-panel)] z-10'
            : 'border-[var(--parchment-border)]/50 opacity-40 scale-[0.99] shadow-xs'
          : isSelected
          ? 'border-[var(--wood-selection)] ring-2 ring-[var(--wood-selection)]/35 shadow-[0_12px_28px_-3px_rgba(46,148,93,0.22)] -translate-y-0.5'
          : 'hover:border-[var(--forest-green)] hover:shadow-[0_12px_28px_-3px_rgba(35,115,71,0.20),0_4px_12px_rgba(35,20,8,0.08)] hover:-translate-y-0.5',
      )}
    >
      {/* 1. Generous Bottle Showcase Frame (Edge-to-edge full canvas) */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] bg-[var(--pub-bg-alt)]/60 border-b border-[var(--parchment-border)]/50 overflow-hidden flex items-center justify-center p-0">
        {spirit.thumbnailImage ? (
          <img
            src={spirit.thumbnailImage}
            alt={spirit.name}
            className="w-full h-full object-contain p-0 transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/30 flex items-center justify-center text-[var(--forest-green)] shadow-xs transition-transform duration-300 group-hover:scale-110">
            <WhiskyLogo size={44} className="text-[var(--forest-green)] sm:size-[52px]" />
          </div>
        )}

        {/* Dynamic Score Medal (Top-Right of photo) */}
        <div
          className={cn(
            'absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-1 rounded-lg border font-display font-black text-xs sm:text-sm shadow-md select-none z-10',
            tierStyle.bg,
            tierStyle.border,
            tierStyle.text,
          )}
        >
          <Star size={11} className={cn('sm:size-[13px] shrink-0 -mt-0.5', tierStyle.starColor)} />
          <span>{spirit.rating100}</span>
        </div>

        {/* Multi-Select Circle Checkbox Overlay (Top-Left of photo) */}
        {isSelectMode && (
          <div className="absolute top-2 left-2 z-10">
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-md',
                isSelectChecked
                  ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)]'
                  : 'bg-[var(--pub-bg-panel)]/90 border-[var(--parchment-border)] shadow-xs',
              )}
            >
              {isSelectChecked && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--parchment-bg)]" />}
            </div>
          </div>
        )}
      </div>

      {/* 2. Signature Liquid Color Shimmer Ribbon (Seamlessly attached to photo) */}
      <div
        className="w-full h-1.5 sm:h-2 shrink-0 relative overflow-hidden pointer-events-none border-b border-[var(--parchment-border)]/50"
        style={{ backgroundColor: colourHex }}
      >
        <div
          className="absolute inset-0 animate-fluid-flow"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 30%, rgba(0,0,0,0.2) 70%, rgba(255,255,255,0.35) 100%)',
            backgroundSize: '200% 100%',
          }}
        />
        <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] pointer-events-none" />
      </div>

      {/* 3. Editorial Card Body (Structured Continuous Rows + Finish/Cask + Category Icons) */}
      <div className="w-full p-2.5 sm:p-3.5 flex flex-col gap-1 sm:gap-1.5 flex-1 min-w-0 justify-between">
        {/* Row 1: Name des Whiskys */}
        <div className="min-w-0">
          <h3 className="font-display text-sm sm:text-base md:text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--brass-accent)] transition-colors duration-300 truncate leading-tight tracking-wide">
            {spirit.name || spirit.distillery}
          </h3>
        </div>

        {/* Row 2: Typ des Whiskys */}
        <div className="font-display text-[10px] sm:text-xs uppercase tracking-wider text-[var(--sepia-text)] font-semibold truncate leading-tight">
          {spirit.spiritType}
        </div>

        {/* Row 3: Destillerie • Herkunft */}
        <div className="text-xs sm:text-[13px] font-body text-[var(--sepia-text)] font-semibold truncate leading-tight flex items-center gap-1.5 min-w-0">
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
          <div className="text-[11px] sm:text-xs font-body text-[var(--sepia-text)] font-medium leading-tight flex items-center gap-1.5 flex-wrap min-w-0">
            {specsRow4.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[var(--sepia-muted)]/50 select-none">·</span>}
                <span className="truncate">{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Row 5: Strength · Added Colour · Chill Filtered (Continuous Text) */}
        <div className="text-[10.5px] sm:text-xs font-body text-[var(--sepia-muted)] font-medium leading-tight flex items-center gap-1.5 flex-wrap min-w-0">
          {specsRow5.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[var(--sepia-muted)]/50 select-none">·</span>}
              <span className="truncate">{item}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Row 6: Finish · Cask / Batch No. (Continuous Text, conditional) */}
        {specsRow6.length > 0 && (
          <div className="text-[10.5px] sm:text-xs font-body text-[var(--sepia-muted)] font-medium leading-tight flex items-center gap-1.5 flex-wrap min-w-0">
            {specsRow6.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[var(--sepia-muted)]/50 select-none">·</span>}
                <span className="truncate">{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Row 7: Active Flavor Category Badges (Circular Mini Category Icons) */}
        {activeCategories.length > 0 && (
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0 pt-0.5">
            {activeCategories.slice(0, 6).map((cat) => (
              <span
                key={cat.id}
                title={`${cat.name[language] ?? cat.name.EN} (${cat.count})`}
                style={{
                  backgroundColor: `${cat.color}20`,
                  borderColor: `${cat.color}50`,
                }}
                className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center text-[10.5px] sm:text-xs shadow-2xs shrink-0 select-none cursor-default transition-transform hover:scale-110"
              >
                <span>{cat.emoji}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 4. Signature Clover Green Grounded Footer: Date (Right) */}
      <div className="w-full bg-[var(--wood-dark)] px-3 sm:px-3.5 py-1.5 sm:py-2 border-t border-[var(--wood-dark)]/80 flex items-center justify-between gap-1 sm:gap-2 text-[10px] sm:text-xs shrink-0">
        <div className="flex items-center gap-1.5 min-w-0 text-[var(--parchment-bg)]/80 font-body font-medium">
          {activeCategories.length > 0 && (
            <span>
              {activeCategories.length} {language === 'DE' ? 'Profile' : 'Profiles'}
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
