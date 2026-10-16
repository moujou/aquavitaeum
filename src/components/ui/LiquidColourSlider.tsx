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
  const isDraggingRef = useRef(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isPendingTouch = useRef(false);

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
    // Desktop mouse interaction: Instant drag & value update
    if (e.pointerType === 'mouse') {
      e.preventDefault();
      setIsDragging(true);
      isDraggingRef.current = true;
      handlePointerAtX(e.clientX);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      return;
    }

    // Touch interaction: Record position without mutating value or blocking scroll
    touchStartPos.current = { x: e.clientX, y: e.clientY };
    isPendingTouch.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPendingTouch.current && touchStartPos.current) {
      const deltaX = Math.abs(e.clientX - touchStartPos.current.x);
      const deltaY = Math.abs(e.clientY - touchStartPos.current.y);

      // If user moved vertically, this is a native page scroll -> cancel touch capture
      if (deltaY > 6 && deltaY > deltaX) {
        isPendingTouch.current = false;
        return;
      }

      // If user moved horizontally past threshold, engage active slider dragging
      if (deltaX > 6 && deltaX > deltaY) {
        isPendingTouch.current = false;
        isDraggingRef.current = true;
        setIsDragging(true);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        handlePointerAtX(e.clientX);
        return;
      }
    }

    if (isDraggingRef.current) {
      handlePointerAtX(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPendingTouch.current) {
      // Intentional stationary tap on the slider track without vertical scrolling
      isPendingTouch.current = false;
      handlePointerAtX(e.clientX);
      return;
    }

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handlePointerCancel = () => {
    isPendingTouch.current = false;
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
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
      <div className="flex items-center gap-2 min-h-[26px]">
        <div
          className="w-3.5 h-3.5 rounded-full border border-[var(--parchment-border)] shadow-xs transition-colors duration-300 shrink-0"
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
        onPointerCancel={handlePointerCancel}
        className="relative w-full py-2 sm:py-2.5 cursor-pointer touch-pan-y focus:outline-none group select-none"
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
                  'w-0.5 h-1 sm:h-1.5 rounded-full transition-all',
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
          {/* Floating Live Droplet Tooltip (Parchment badge styling matching app theme) */}
          {isDragging && (
            <div
              style={{ transform: `translateX(-${percentage}%)` }}
              className="absolute -top-7 left-1/2 px-2 py-0.5 rounded-md bg-[var(--parchment-bg)] border border-[var(--parchment-border)] text-[var(--sepia-text)] text-[10.5px] font-display font-bold uppercase tracking-wider whitespace-nowrap shadow-[0_4px_16px_rgba(43,30,20,0.22)] animate-fade-in pointer-events-none flex items-center gap-1.5"
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                style={{ backgroundColor: activeHex }}
              />
              <span>{translateColour(activeColour, language)}</span>
            </div>
          )}

          {/* The Glass Orb Thumb */}
          <div
            className={cn(
              'w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full border-2 border-[var(--brass-accent)] bg-[var(--parchment-bg)] shadow-[0_3px_10px_rgba(0,0,0,0.35)] flex items-center justify-center transition-transform',
              isDragging ? 'scale-115 ring-3 ring-[var(--brass-accent)]/30' : 'group-hover:scale-108'
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
