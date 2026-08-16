/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { MapPin, Check, Star } from 'lucide-react';
import { Spirit, SPIRIT_COLOUR_HEX, SpiritColour } from '@/types/spirit.types';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { cn } from '@/lib/utils';
import { getRatingTierStyle } from '@/lib/spirit-utils';

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
  onTouchEnd
}: NoteListItemProps) {
  const colourHex = SPIRIT_COLOUR_HEX[spirit.colour as SpiritColour] ?? '#FFD700';
  const tierStyle = getRatingTierStyle(spirit.rating100);
  
  const formattedDate = spirit.dateTasted
    ? new Date(spirit.dateTasted).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  // Get top 2 flavor tags for preview (clean text tags, no emoji clutter)
  const topFlavorTags = (spirit.flavorTags ?? []).slice(0, 2);

  return (
    <button
      type="button"
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchCancel={onTouchCancel}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={cn(
        "w-full flex items-center gap-3 sm:gap-4.5 pl-3.5 sm:pl-4.5 pr-6 sm:pr-8 py-3.5 rounded-xl border transition-all duration-300 cursor-pointer group relative overflow-hidden text-left select-none",
        "bg-[var(--parchment-bg)] border border-[var(--parchment-border)] shadow-[0_3px_14px_rgba(30,20,10,0.11),0_1px_4px_rgba(30,20,10,0.06)]",
        isSelectMode
          ? isSelected
            ? "border-[var(--wood-selection)] ring-2 ring-[var(--wood-selection)]/45 shadow-[0_0_20px_rgba(46,148,93,0.35)] scale-[1.015] opacity-100 bg-[var(--pub-bg-panel)] z-10"
            : "border-[var(--parchment-border)]/50 opacity-40 scale-[0.98] shadow-xs"
          : "hover:border-[var(--forest-green)] hover:shadow-[0_10px_26px_rgba(35,115,71,0.18),inset_4px_0_12px_rgba(35,115,71,0.06)] hover:scale-[1.006]"
      )}
    >
      {/* Signature Animated Liquid Accent Column (Refined Liquid Bar) */}
      <div
        className="absolute top-0 right-0 bottom-0 w-2 sm:w-2.5 overflow-hidden shrink-0 pointer-events-none z-10"
        style={{ backgroundColor: colourHex }}
      >
        <div
          className="absolute inset-0 animate-fluid-flow"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 30%, rgba(0,0,0,0.2) 70%, rgba(255,255,255,0.3) 100%)',
            backgroundSize: '100% 200%',
          }}
        />
        <div className="absolute inset-0 shadow-[inset_1px_0_3px_rgba(0,0,0,0.45)] pointer-events-none" />
      </div>

      {/* Ambient Spirit Color Light-Pipe Backglow */}
      <div
        className="absolute -left-6 -top-6 w-28 h-28 rounded-full pointer-events-none opacity-25 blur-xl transition-opacity duration-300 group-hover:opacity-45"
        style={{ background: `radial-gradient(circle, ${colourHex} 0%, transparent 70%)` }}
      />

      {/* Select Mode Checkbox */}
      {isSelectMode && (
        <div className={cn(
          "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-30",
          isSelected ? "border-[var(--wood-selection)] bg-[var(--wood-selection)] shadow-xs" : "border-[var(--parchment-border)] bg-[var(--pub-bg-panel)]/90 shadow-xs"
        )}>
          {isSelected && <Check size={11} strokeWidth={3} className="text-[var(--parchment-bg)]" />}
        </div>
      )}

      {/* Thumbnail with Spirit Hue Indicator */}
      <div className="w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] rounded-lg shrink-0 overflow-hidden bg-gradient-to-br from-[var(--pub-bg-alt)] to-[var(--parchment-bg)] border border-[var(--parchment-border)] relative flex items-center justify-center shadow-xs group-hover:border-[var(--forest-green)]/60 transition-colors z-10">
        {spirit.thumbnailImage ? (
          <img src={spirit.thumbnailImage} alt={spirit.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center text-[var(--forest-green)]">
            <WhiskyLogo size={26} className="text-[var(--forest-green)]" />
          </div>
        )}
        {/* Ambient Liquid Pip */}
        <div
          className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-[var(--parchment-border)] shadow-xs"
          style={{ backgroundColor: colourHex }}
          title={`Spirit color: ${spirit.colour ?? 'Natural'}`}
        />
      </div>

      {/* Distillery & Name & Flavor Chips */}
      <div className="flex-1 min-w-0 flex flex-col justify-center z-10">
        <div className="font-display font-bold text-sm sm:text-base text-[var(--foreground)] group-hover:text-[var(--brass-accent)] transition-colors truncate leading-snug">
          {spirit.distillery}
        </div>
        <div className="font-body text-xs sm:text-[13px] text-[var(--sepia-muted)] truncate mt-0.5 font-medium leading-snug">
          {spirit.name}
        </div>

        {/* Top Flavor Tags (Solid readable chips) */}
        {topFlavorTags.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 mt-1.5 overflow-hidden">
            {topFlavorTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-[10px] font-semibold tracking-wide bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] px-2 py-0.5 rounded text-[var(--sepia-text)] truncate"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Spirit Type Badge */}
      <div className="shrink-0 hidden md:block text-[11px] font-semibold tracking-wide bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] px-2.5 py-1 rounded-full text-[var(--sepia-text)] z-10">
        {spirit.spiritType}
      </div>

      {/* Region */}
      <div className="shrink-0 hidden lg:flex items-center gap-1.5 text-xs text-[var(--sepia-muted)] font-body min-w-[100px] z-10">
        <MapPin size={12} className="text-[var(--brass-accent)] shrink-0" />
        <span className="truncate">{spirit.region || '—'}</span>
      </div>

      {/* Date */}
      <div className="shrink-0 hidden xl:block text-xs font-mono text-[var(--sepia-muted)]/70 min-w-[85px] text-right z-10">
        {formattedDate}
      </div>

      {/* Dynamic Score-Tier Rating Medal */}
      <div
        className={cn(
          "shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg border font-display font-black text-sm sm:text-base shadow-xs min-w-[50px] sm:min-w-[58px] z-10",
          tierStyle.bg,
          tierStyle.border,
          tierStyle.text
        )}
      >
        <Star size={13} className={cn("shrink-0 -mt-0.5", tierStyle.starColor)} />
        <span>{spirit.rating100}</span>
      </div>
    </button>
  );
}
