/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { MapPin, Check, Star } from 'lucide-react';
import { Spirit, SPIRIT_COLOUR_HEX, SpiritColour } from '@/types/spirit.types';
import { cn } from '@/lib/utils';

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
        "w-full flex items-center gap-3 sm:gap-4.5 pl-3.5 sm:pl-4.5 pr-6 sm:pr-8 py-3.5 rounded-xl border transition-all duration-300 cursor-pointer group relative overflow-hidden text-left",
        "bg-gradient-to-r from-[#121B15]/85 via-[#0E1511]/90 to-[#0A0F0C] backdrop-blur-md shadow-md",
        isSelectMode
          ? isSelected
            ? "border-[var(--brass-accent)] ring-1 ring-[var(--brass-accent)]/50 shadow-[0_0_16px_rgba(197,155,39,0.22)] scale-[1.01]"
            : "border-white/6 opacity-50 hover:opacity-80"
          : "border-t-white/12 border-x-white/6 border-b-black/40 hover:border-[var(--brass-accent)]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.45),inset_4px_0_12px_rgba(197,155,39,0.12)] hover:scale-[1.008]"
      )}
    >
      {/* Signature Animated Liquid Accent Column (Matching SpiritCard) */}
      <div
        className="absolute top-0 right-0 bottom-0 w-2 sm:w-2.5 overflow-hidden shrink-0 pointer-events-none z-10"
        style={{ backgroundColor: colourHex }}
      >
        <div
          className="absolute inset-0 animate-fluid-flow"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 30%, rgba(0,0,0,0.2) 70%, rgba(255,255,255,0.22) 100%)',
            backgroundSize: '100% 200%',
          }}
        />
        <div className="absolute inset-0 shadow-[inset_1px_0_3px_rgba(0,0,0,0.35)] pointer-events-none" />
      </div>

      {/* Ambient Spirit Color Light-Pipe Backglow */}
      <div
        className="absolute -left-6 -top-6 w-28 h-28 rounded-full pointer-events-none opacity-20 blur-xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: `radial-gradient(circle, ${colourHex} 0%, transparent 70%)` }}
      />

      {/* Per-item dim scrim for unselected items in select mode */}
      {isSelectMode && !isSelected && (
        <div className="absolute inset-0 rounded-xl bg-black/35 pointer-events-none z-20" />
      )}

      {/* Select Mode Checkbox */}
      {isSelectMode && (
        <div className={cn(
          "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-30",
          isSelected ? "border-[var(--brass-accent)] bg-[var(--brass-accent)]" : "border-white/30 bg-transparent"
        )}>
          {isSelected && <Check size={11} strokeWidth={3} className="text-[var(--wood-dark)]" />}
        </div>
      )}

      {/* Thumbnail with Spirit Hue Indicator */}
      <div className="w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] rounded-lg shrink-0 overflow-hidden bg-gradient-to-br from-[#1C130D] to-[#0A0704] border border-white/10 relative flex items-center justify-center shadow-xs group-hover:border-[var(--brass-accent)]/40 transition-colors z-10">
        {spirit.thumbnailImage ? (
          <img src={spirit.thumbnailImage} alt={spirit.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(circle at center, ${colourHex}55 0%, #16110B 75%, #0A0704 100%)`,
            }}
          />
        )}
        {/* Ambient Liquid Pip */}
        <div
          className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-black/50 shadow-xs"
          style={{ backgroundColor: colourHex }}
          title={`Spirit color: ${spirit.colour ?? 'Natural'}`}
        />
      </div>

      {/* Distillery & Name & Flavor Chips */}
      <div className="flex-1 min-w-0 flex flex-col justify-center z-10">
        <div className="font-display font-bold text-sm sm:text-base text-[var(--foreground)] group-hover:text-[var(--brass-accent)] transition-colors truncate leading-snug">
          {spirit.distillery}
        </div>
        <div className="font-body text-xs sm:text-[13px] text-white/70 truncate mt-0.5 font-medium leading-snug">
          {spirit.name}
        </div>

        {/* Top Flavor Tags (Clean pill chips) */}
        {topFlavorTags.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 mt-1.5 overflow-hidden">
            {topFlavorTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-[10px] font-medium tracking-wide bg-white/[0.04] border border-white/8 px-2 py-0.5 rounded text-white/60 truncate"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Spirit Type Badge */}
      <div className="shrink-0 hidden md:block text-[11px] font-semibold tracking-wide bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-full text-white/75 z-10">
        {spirit.spiritType}
      </div>

      {/* Region */}
      <div className="shrink-0 hidden lg:flex items-center gap-1.5 text-xs text-white/55 font-body min-w-[100px] z-10">
        <MapPin size={12} className="text-[var(--brass-accent)]/60 shrink-0" />
        <span className="truncate">{spirit.region || '—'}</span>
      </div>

      {/* Date */}
      <div className="shrink-0 hidden xl:block text-xs font-mono text-white/35 min-w-[85px] text-right z-10">
        {formattedDate}
      </div>

      {/* Rating Medal */}
      <div className="shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--brass-accent)]/10 border border-[var(--brass-accent)]/30 text-[var(--brass-accent)] font-display font-black text-sm sm:text-base shadow-xs min-w-[50px] sm:min-w-[58px] z-10">
        <Star size={13} className="fill-[var(--brass-accent)] -mt-0.5" />
        <span>{spirit.rating100}</span>
      </div>
    </button>
  );
}
