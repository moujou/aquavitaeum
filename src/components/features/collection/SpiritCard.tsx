/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { MapPin, Star, CheckCircle2 } from 'lucide-react';
import { Spirit, SPIRIT_COLOUR_HEX, SpiritColour } from '@/types/spirit.types';
import { cn } from '@/lib/utils';
import { scoreToStars } from '@/lib/spirit-utils';

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

export function SpiritCard({ spirit, isSelected, onClick, isSelectMode = false, isSelectChecked = false, onTouchStart, onTouchEnd, onTouchCancel, onTouchMove }: SpiritCardProps) {
  const stars = scoreToStars(spirit.rating100);
  const colourHex = SPIRIT_COLOUR_HEX[spirit.colour as SpiritColour] ?? '#FFD700';

  return (
    <button
      id={`spirit-card-${spirit.id}`}
      type="button"
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      onTouchMove={onTouchMove}
      // Prevent iOS Safari native image long-press callout from freezing interaction
      style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
      className={cn(
        'w-full flex flex-col text-left rounded-2xl border transition-all duration-300 ease-out group overflow-hidden cursor-pointer relative shrink-0 select-none',
        'bg-gradient-to-b from-[#18241D]/95 via-[#131D16]/98 to-[#0E1510] backdrop-blur-xl shadow-xl',
        isSelectMode
          ? isSelectChecked
            ? 'border-[var(--brass-accent)] ring-2 ring-[var(--brass-accent)]/50 shadow-[0_0_25px_rgba(197,155,39,0.3)] scale-[1.02]'
            : 'border-white/8 opacity-50 scale-[0.98]'
          : [
              'border-t-white/18 border-x-white/10 border-b-black/50',
              'hover:border-[var(--brass-accent)]/60 hover:shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(197,155,39,0.18)] hover:scale-[1.015]',
              isSelected
                ? 'border-[var(--brass-accent)] ring-2 ring-[var(--brass-accent)]/50 shadow-[0_0_20px_rgba(197,155,39,0.25)]'
                : '',
            ].join(' '),
      )}
      aria-pressed={isSelected}
    >
      {/* Per-item dim scrim for unselected cards in select mode */}
      {isSelectMode && !isSelectChecked && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-10" />
      )}

      {/* Cover Image / Widescreen Thumbnail Container */}
      <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-[#1C130D] to-[#0A0704] border-b border-white/8 shrink-0">
        {spirit.thumbnailImage ? (
          <img
            src={spirit.thumbnailImage}
            alt={spirit.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none"
            draggable={false}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at center, ${colourHex}25 0%, #1A130E 70%, #0D0906 100%)`,
            }}
          >
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        )}

        {/* Circular checkbox in select mode (top-right of thumbnail) */}
        {isSelectMode && (
          <div className="absolute top-2.5 right-2.5 z-20">
            <div
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-md',
                isSelectChecked
                  ? 'bg-[var(--brass-accent)] border-[var(--brass-accent)]'
                  : 'bg-black/60 border-white/40',
              )}
            >
              {isSelectChecked && <CheckCircle2 className="w-4 h-4 text-[var(--wood-dark)]" />}
            </div>
          </div>
        )}
      </div>

      {/* Padded Text Details Section with Right Padding for Column spacing */}
      <div className="w-full p-4 pr-[9%] sm:p-4.5 sm:pr-[9%] flex flex-col gap-2 flex-1 min-w-0 relative">
        {/* 6% Width Accent Column (self-contained fluid flow shimmer) */}
        <div
          className="absolute top-0 right-0 bottom-0 w-[6%] overflow-hidden shrink-0 pointer-events-none"
          style={{ backgroundColor: colourHex }}
        >
          {/* Shimmer liquid flow overlay */}
          <div
            className="absolute inset-0 animate-fluid-flow"
            style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 30%, rgba(0,0,0,0.18) 70%, rgba(255,255,255,0.22) 100%)',
              backgroundSize: '100% 200%',
            }}
          />
          {/* Inner Depth Shadow */}
          <div className="absolute inset-0 shadow-[inset_1px_0_4px_rgba(0,0,0,0.35),inset_-1px_0_4px_rgba(255,255,255,0.15)] pointer-events-none" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Distillery Name (High contrast editorial serif) */}
          <p className="font-display text-lg sm:text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--brass-accent)] transition-colors duration-300 truncate leading-snug tracking-wide">
            {spirit.distillery}
          </p>

          {/* Spirit Bottle / Label Name (High visibility 85% white) */}
          <p className="text-xs sm:text-[13px] font-body text-white/85 leading-snug truncate mt-0.5 font-medium">
            {spirit.name}
          </p>

          {/* Star Rating Bar & Rating Score Row */}
          <div className="flex items-center justify-between gap-2 mt-2.5 pr-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={cn(
                    stars >= s
                      ? 'fill-[var(--brass-accent)] text-[var(--brass-accent)]'
                      : stars >= s - 0.5
                      ? 'fill-[var(--brass-accent)]/60 text-[var(--brass-accent)]'
                      : 'fill-none text-white/20',
                  )}
                />
              ))}
            </div>
            {/* Sculpted Score Medal */}
            <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[var(--brass-accent)]/15 border border-[var(--brass-accent)]/40 text-[var(--brass-accent)] font-display font-black text-xs shadow-xs">
              {spirit.rating100}
            </div>
          </div>

          {/* Specifications: Region, Age, ABV (Solid readable pills) */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap text-white/80 font-body text-xs">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-[var(--brass-accent)] shrink-0" />
              <span className="truncate max-w-[120px]">{spirit.region || '—'}</span>
            </span>
            {spirit.age && (
              <span className="bg-white/8 px-2 py-0.5 rounded border border-white/15 text-[11px] font-mono font-semibold leading-none text-white/90">
                {spirit.age}yr
              </span>
            )}
            <span className="bg-white/8 px-2 py-0.5 rounded border border-white/15 text-[11px] font-mono font-semibold leading-none text-white/90">
              {spirit.abv}%
            </span>
          </div>
        </div>

        {/* Separator / Footer of the Card: Spirit Type Pill */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/8">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/6 border border-white/15 px-2.5 py-0.5 rounded text-white/75 truncate">
            {spirit.spiritType}
          </span>
        </div>
      </div>
    </button>
  );
}
