'use client';

import React, { useRef, useState, useCallback } from 'react';
import { SPIRIT_COLOURS, SPIRIT_COLOUR_HEX, SpiritColour } from '@/types/spirit.types';
import { translateColour, Language } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

interface LiquidColourSliderProps {
  id?: string;
  value?: SpiritColour;
  onChange: (colour: SpiritColour) => void;
  language?: Language;
  className?: string;
}

export function LiquidColourSlider({
  id = 'liquid-colour-slider',
  value = 'Yellow Gold',
  onChange,
  language = 'DE',
  className,
}: LiquidColourSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Normalize current active index across the 21-shade scale
  const activeIndex = SPIRIT_COLOURS.findIndex(
    (c) => c.toLowerCase() === (value || '').toLowerCase()
  );
  // Default to Yellow Gold / 0.5 (index 5) or Pale Gold if unmatched
  const safeIndex = activeIndex === -1 ? 5 : activeIndex;

  const activeColour = SPIRIT_COLOURS[safeIndex];
  const activeHex = SPIRIT_COLOUR_HEX[activeColour] ?? '#F7C830';
  const percentage = (safeIndex / (SPIRIT_COLOURS.length - 1)) * 100;

  const handlePointerAtX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const ratio = rect.width > 0 ? relativeX / rect.width : 0;
      const targetIndex = Math.round(ratio * (SPIRIT_COLOURS.length - 1));
      const clampedIndex = Math.max(0, Math.min(targetIndex, SPIRIT_COLOURS.length - 1));
      const chosenColour = SPIRIT_COLOURS[clampedIndex];

      if (chosenColour !== value) {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(12);
          } catch {
            // ignore haptic failure
          }
        }
        onChange(chosenColour);
      }
    },
    [value, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    handlePointerAtX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handlePointerAtX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = Math.min(safeIndex + 1, SPIRIT_COLOURS.length - 1);
      onChange(SPIRIT_COLOURS[nextIndex]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prevIndex = Math.max(safeIndex - 1, 0);
      onChange(SPIRIT_COLOURS[prevIndex]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(SPIRIT_COLOURS[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(SPIRIT_COLOURS[SPIRIT_COLOURS.length - 1]);
    }
  };

  return (
    <div id={id} className={cn('flex flex-col gap-2 w-full select-none', className)}>
      {/* 1. Header Display: Active Colour Swatch & Name (Clean, without counter) */}
      <div className="flex items-center gap-2 min-h-[28px]">
        <div
          className="w-4 h-4 rounded-full border border-[var(--parchment-border)] shadow-xs transition-colors duration-300 shrink-0"
          style={{ backgroundColor: activeHex }}
        />
        <span className="font-display text-xs sm:text-sm font-bold text-[var(--foreground)] tracking-wide">
          {translateColour(activeColour, language)}
        </span>
      </div>

      {/* 2. Interactive Liquid 21-Shade Spectrum Slider Track */}
      <div
        ref={trackRef}
        role="slider"
        aria-label="Spirit Colour"
        aria-valuemin={0}
        aria-valuemax={SPIRIT_COLOURS.length - 1}
        aria-valuenow={safeIndex}
        aria-valuetext={translateColour(activeColour, language)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full py-3 cursor-pointer touch-none focus:outline-none group"
      >
        {/* The Liquid Gradient Tube spanning all 21 shades */}
        <div
          className="w-full h-3.5 sm:h-4 rounded-full border border-[var(--parchment-border)] relative overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] transition-all"
          style={{
            background:
              'linear-gradient(to right, #F8FAFC 0%, #F4F3D8 5%, #EFE4A0 10%, #EAD870 15%, #F3D050 20%, #F7C830 25%, #F2B720 30%, #E9A318 35%, #DD8E12 40%, #D07A10 45%, #C2650E 50%, #B65410 55%, #A84512 60%, #9B3814 65%, #8E2C18 70%, #80221A 75%, #6F1B18 80%, #5D1614 85%, #4D1310 90%, #3C0F0C 95%, #240B08 100%)',
          }}
        >
          {/* Glass Specular Highlight Sheen */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

          {/* 21 Snap Breakpoint Ticks along the tube */}
          <div className="absolute inset-0 flex justify-between px-1 pointer-events-none items-center">
            {SPIRIT_COLOURS.map((col, idx) => (
              <div
                key={col}
                className={cn(
                  'w-0.5 h-1 sm:w-1 sm:h-1 rounded-full transition-all',
                  idx === safeIndex
                    ? 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.9)] scale-125'
                    : 'bg-black/25'
                )}
              />
            ))}
          </div>
        </div>

        {/* 3. Glowing Thumb Droplet Indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-75 ease-out"
          style={{ left: `${percentage}%` }}
        >
          {/* Floating Live Droplet Tooltip */}
          {isDragging && (
            <div
              className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[var(--wood-dark)] text-[var(--parchment-bg)] text-[10px] font-display font-bold uppercase tracking-wider whitespace-nowrap shadow-md border border-[var(--brass-accent)]/40 animate-fade-in pointer-events-none"
            >
              {translateColour(activeColour, language)}
            </div>
          )}

          {/* The Glass Orb Thumb */}
          <div
            className={cn(
              'w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-[var(--brass-accent)] bg-[var(--parchment-bg)] shadow-[0_3px_10px_rgba(0,0,0,0.35)] flex items-center justify-center transition-transform',
              isDragging ? 'scale-115 ring-4 ring-[var(--brass-accent)]/30' : 'group-hover:scale-108'
            )}
            style={{
              boxShadow: `0 0 14px ${activeHex}90, 0 3px 8px rgba(0,0,0,0.35)`,
            }}
          >
            <div
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-black/20 shadow-inner"
              style={{ backgroundColor: activeHex }}
            />
          </div>
        </div>
      </div>

      {/* 4. Spectrum Range Labels (0.0 Gin Clear -> 2.0 Treacle) */}
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-display uppercase tracking-widest text-[var(--sepia-muted)] font-bold px-0.5">
        <button
          type="button"
          onClick={() => onChange(SPIRIT_COLOURS[0])}
          className="hover:text-[var(--foreground)] transition-colors cursor-pointer"
        >
          {translateColour(SPIRIT_COLOURS[0], language)}
        </button>
        <button
          type="button"
          onClick={() => onChange(SPIRIT_COLOURS[SPIRIT_COLOURS.length - 1])}
          className="hover:text-[var(--foreground)] transition-colors cursor-pointer"
        >
          {translateColour(SPIRIT_COLOURS[SPIRIT_COLOURS.length - 1], language)}
        </button>
      </div>
    </div>
  );
}
