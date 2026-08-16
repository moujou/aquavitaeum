/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { MapPin, Star, CheckCircle2 } from 'lucide-react';
import { Spirit, SPIRIT_COLOUR_HEX, SpiritColour } from '@/types/spirit.types';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { cn } from '@/lib/utils';
import { getRatingTierStyle } from '@/lib/spirit-utils';

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
  const colourHex = SPIRIT_COLOUR_HEX[spirit.colour as SpiritColour] ?? '#FFD700';
  const tierStyle = getRatingTierStyle(spirit.rating100);

  const formattedDate = spirit.dateTasted
    ? new Date(spirit.dateTasted).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

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
        'bg-[var(--parchment-bg)] border border-[var(--parchment-border)] shadow-[0_4px_16px_var(--parchment-shadow)]',
        isSelectMode
          ? isSelectChecked
            ? 'border-[var(--wood-selection)] ring-2 ring-[var(--wood-selection)]/45 shadow-[0_0_25px_rgba(179,137,93,0.3)] scale-[1.02] opacity-100 z-10 bg-[var(--pub-bg-panel)]'
            : 'border-[var(--parchment-border)]/50 opacity-40 scale-[0.98]'
          : [
              'hover:border-[var(--forest-green)]/60 hover:shadow-[0_12px_28px_rgba(35,115,71,0.12)] hover:scale-[1.015]',
              isSelected
                ? 'border-[var(--wood-selection)] ring-2 ring-[var(--wood-selection)]/45 shadow-[0_0_20px_rgba(179,137,93,0.25)]'
                : '',
            ].join(' '),
      )}
      aria-pressed={isSelected}
    >
      {/* 1. Seamless Edge-to-Edge Bottle Photo (Tall Portrait Showcase) */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-gradient-to-br from-[var(--pub-bg-alt)] via-[var(--parchment-bg)] to-[var(--pub-bg-alt)] flex items-center justify-center shrink-0">
        {/* Ambient Liquid Color Backglow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            background: `radial-gradient(circle at center, ${colourHex} 0%, transparent 75%)`,
          }}
        />

        {spirit.thumbnailImage ? (
          <img
            src={spirit.thumbnailImage}
            alt={spirit.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none z-10"
            draggable={false}
          />
        ) : (
          /* Classic Archival Glass Atelier Placeholder (Clover Green) */
          <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/30 flex items-center justify-center text-[var(--forest-green)] shadow-xs transition-transform duration-300 group-hover:scale-110">
              <WhiskyLogo size={36} className="text-[var(--forest-green)] sm:size-[44px]" />
            </div>
          </div>
        )}

        {/* Subtle Bottom Vignette for seamless blend */}
        <div className="absolute inset-x-0 bottom-0 h-5 sm:h-6 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-15" />

        {/* Prominent Floating Score Medal (Top-Right - 100% Opaque & High-Contrast Against Any Photo) */}
        <div
          className={cn(
            'absolute top-2 right-2 sm:top-3 sm:right-3 z-20 h-7 sm:h-8 px-2 sm:px-3 rounded-lg border font-display font-black text-xs sm:text-sm flex items-center gap-1 shadow-[0_4px_16px_rgba(0,0,0,0.9)] select-none',
            tierStyle.bg,
            tierStyle.border,
            tierStyle.text
          )}
        >
          <Star size={13} className={cn('sm:size-[14px] shrink-0 -mt-0.5', tierStyle.starColor)} />
          <span>{spirit.rating100}</span>
        </div>

        {/* Select Mode Checkbox (Top-Left) */}
        {isSelectMode && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
            <div
              className={cn(
                'w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-md',
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

      {/* 3. Editorial Card Body (Calibrated for 2-column mobile and multi-column desktop) */}
      <div className="w-full p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0 justify-between">
        {/* Identity */}
        <div className="min-w-0">
          <h3 className="font-display text-xs sm:text-base lg:text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--brass-accent)] transition-colors duration-300 truncate leading-snug tracking-wide">
            {spirit.distillery}
          </h3>
          <p className="text-[11px] sm:text-xs lg:text-[13px] font-body text-[var(--sepia-muted)] leading-snug truncate mt-0.5 font-medium">
            {spirit.name}
          </p>
        </div>

        {/* Classification & Specs Track */}
        <div className="flex flex-col gap-1 sm:gap-1.5 min-w-0">
          <div className="min-w-0">
            <span className="inline-flex items-center text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] px-1.5 sm:px-2 py-0.5 rounded text-[var(--sepia-text)] truncate max-w-full">
              {spirit.spiritType}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
            {spirit.age && (
              <span className="h-5 sm:h-6 px-1.5 sm:px-2 rounded-md bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] text-[10px] sm:text-xs font-mono font-bold text-[var(--sepia-text)] flex items-center shrink-0">
                {spirit.age}yr
              </span>
            )}
            <span className="h-5 sm:h-6 px-1.5 sm:px-2 rounded-md bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] text-[10px] sm:text-xs font-mono font-bold text-[var(--sepia-text)] flex items-center shrink-0">
              {spirit.abv}%
            </span>
          </div>
        </div>
      </div>

      {/* 4. Signature Clover Green Grounded Footer: Provenance & Date */}
      <div className="w-full bg-[var(--wood-dark)] px-2.5 sm:px-4 py-2 border-t border-[var(--wood-dark)]/80 flex items-center justify-between gap-1 sm:gap-2 text-[10px] sm:text-xs shrink-0">
        <div className="flex items-center gap-1.5 min-w-0 text-[var(--parchment-bg)] font-body font-medium">
          <MapPin size={11} className="sm:size-[13px] text-[var(--brass-light)] shrink-0" />
          <span className="truncate">{spirit.region || '—'}</span>
        </div>

        {formattedDate && (
          <span className="font-mono text-[var(--parchment-bg)]/80 whitespace-nowrap text-right shrink-0 hidden xs:inline sm:inline">
            {formattedDate}
          </span>
        )}
      </div>
    </button>
  );
}
