'use client';

import React, { useRef, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getScoreTierConfig } from '@/components/ui/SommelierScoreMedallion';
import { cn } from '@/lib/utils';

interface SommelierScoreSliderProps {
  score: number;
  onChange: (score: number) => void;
  className?: string;
  id?: string;
}

const SCORE_MILESTONES = [
  { value: 30, label: '30', mobileVisible: false },
  { value: 50, label: '50', mobileVisible: true },
  { value: 60, label: '60', mobileVisible: false },
  { value: 70, label: '70', mobileVisible: false },
  { value: 80, label: '80', mobileVisible: true },
  { value: 90, label: '90', mobileVisible: false },
  { value: 100, label: '100', mobileVisible: true },
];

export function SommelierScoreSlider({
  score,
  onChange,
  className,
  id = 'sommelier-score-slider',
}: SommelierScoreSliderProps) {
  const { language } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const trackRectRef = useRef<DOMRect | null>(null);
  const isDragging = useRef(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isPendingTouch = useRef(false);
  const [isDraggingState, setIsDraggingState] = React.useState(false);
  const [dragScore, setDragScore] = React.useState<number | null>(null);
  const lastScoreRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const safeScore = Math.max(1, Math.min(100, score || 1));
  const effectiveScore = dragScore !== null ? dragScore : safeScore;
  const tier = getScoreTierConfig(effectiveScore);
  const percentage = ((effectiveScore - 1) / 99) * 100;

  // Synchronize dragScore when score prop changes from outside and not actively dragging
  React.useEffect(() => {
    if (!isDragging.current) {
      setDragScore(null);
      lastScoreRef.current = safeScore;
    }
  }, [score, safeScore]);

  // Clean up any pending animation frame on unmount
  React.useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const updateFromPointer = useCallback(
    (clientX: number) => {
      const rect = trackRectRef.current || trackRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0) return;
      const rawRatio = (clientX - rect.left) / rect.width;
      const clampedRatio = Math.max(0, Math.min(1, rawRatio));
      const targetScore = Math.max(1, Math.min(100, Math.round(1 + clampedRatio * 99)));

      if (targetScore === lastScoreRef.current) return;
      lastScoreRef.current = targetScore;

      setDragScore(targetScore);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        onChange(targetScore);
      });
    },
    [onChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (trackRef.current) {
      trackRectRef.current = trackRef.current.getBoundingClientRect();
    }

    // Desktop mouse interaction: Instant drag & value update
    if (e.pointerType === 'mouse') {
      isDragging.current = true;
      setIsDraggingState(true);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      updateFromPointer(e.clientX);
      return;
    }

    // Touch interaction: Record start position without mutating score or blocking vertical scroll
    touchStartPos.current = { x: e.clientX, y: e.clientY };
    isPendingTouch.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPendingTouch.current && touchStartPos.current) {
      const deltaX = Math.abs(e.clientX - touchStartPos.current.x);
      const deltaY = Math.abs(e.clientY - touchStartPos.current.y);

      // If user moved vertically, this is a native page scroll -> cancel touch capture
      if (deltaY > 6 && deltaY > deltaX) {
        isPendingTouch.current = false;
        return;
      }

      // If user moved horizontally past threshold, engage active score slider dragging
      if (deltaX > 6 && deltaX > deltaY) {
        isPendingTouch.current = false;
        isDragging.current = true;
        setIsDraggingState(true);
        if (trackRef.current) {
          trackRectRef.current = trackRef.current.getBoundingClientRect();
        }
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        updateFromPointer(e.clientX);
        return;
      }
    }

    if (isDragging.current) {
      updateFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPendingTouch.current) {
      // Intentional stationary tap on the score track without vertical scrolling
      isPendingTouch.current = false;
      if (trackRef.current) {
        trackRectRef.current = trackRef.current.getBoundingClientRect();
      }
      updateFromPointer(e.clientX);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (lastScoreRef.current !== null) {
        onChange(lastScoreRef.current);
      }
      return;
    }

    if (isDragging.current) {
      isDragging.current = false;
      setIsDraggingState(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (lastScoreRef.current !== null) {
        onChange(lastScoreRef.current);
      }
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handlePointerCancel = () => {
    isPendingTouch.current = false;
    if (isDragging.current) {
      isDragging.current = false;
      setIsDraggingState(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (lastScoreRef.current !== null) {
        onChange(lastScoreRef.current);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(100, safeScore + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(1, safeScore - 1));
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      onChange(Math.min(100, safeScore + 5));
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      onChange(Math.max(1, safeScore - 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(100);
    }
  };

  return (
    <div id={id} className={cn('flex flex-col gap-1 w-full select-none', className)}>
      {/* Interactive Sommelier Liquid Cask Gauge */}
      <div
        ref={trackRef}
        role="slider"
        aria-label="Sommelier Score"
        aria-valuemin={1}
        aria-valuemax={100}
        aria-valuenow={safeScore}
        aria-valuetext={`${safeScore} / 100 - ${language === 'DE' ? tier.labelDe : tier.labelEn}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="relative w-full py-2 sm:py-2.5 cursor-pointer touch-pan-y focus:outline-none group select-none"
      >
        {/* Continuous Distiller's Amber Liquid Tube */}
        <div className="w-full h-3.5 sm:h-4 rounded-full border border-[var(--parchment-border)] bg-[var(--pub-bg-alt)]/80 relative overflow-hidden shadow-[inset_0_2px_4px_rgba(43,30,20,0.15)]">
          {/* Active Liquid Gold Fill Ribbon */}
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[var(--brass-muted)] via-[var(--brass-accent)] to-[var(--brass-light)] rounded-full shadow-xs",
              isDraggingState ? "transition-none" : "transition-all duration-150"
            )}
            style={{ width: `${percentage}%` }}
          />

          {/* Specular Top-Half Sheen */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

          {/* Internal Milestone Divider Ticks */}
          <div className="absolute inset-0 flex items-center pointer-events-none">
            {SCORE_MILESTONES.map((m) => {
              const tickPos = ((m.value - 1) / 99) * 100;
              return (
                <div
                  key={m.value}
                  style={{ left: `${tickPos}%` }}
                  className={cn(
                    'absolute w-0.5 -translate-x-1/2',
                    m.mobileVisible
                      ? 'h-2 sm:h-2.5 bg-[var(--sepia-muted)]/50'
                      : 'h-1.5 sm:h-2 bg-[var(--sepia-muted)]/35 hidden sm:block'
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Glowing Sommelier Thumb Indicator + Floating Live Droplet on Drag */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none",
            isDraggingState ? "transition-none" : "transition-all duration-150"
          )}
          style={{ left: `${percentage}%` }}
        >
          {/* Floating Score Tooltip (Parchment badge styling matching app theme) */}
          {isDraggingState && (
            <div
              style={{ transform: `translateX(-${percentage}%)` }}
              className="absolute -top-8 left-1/2 px-2.5 py-0.5 rounded-full bg-[var(--parchment-bg)] border border-[var(--parchment-border)] text-[var(--sepia-text)] text-xs font-display font-black tracking-wider shadow-[0_4px_16px_rgba(43,30,20,0.22)] animate-fade-in whitespace-nowrap flex items-center gap-1.5 z-30"
            >
              <span className="font-black text-[var(--sepia-text)]">{effectiveScore}</span>
              <span
                className="text-[9.5px] font-bold uppercase"
                style={{ color: tier?.colorHex || 'var(--brass-accent)' }}
              >
                {language === 'DE' ? tier.badgeDe : tier.badgeEn}
              </span>
            </div>
          )}

          <div
            className={cn(
              'w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(43,30,20,0.45),0_0_12px_rgba(201,122,30,0.55)] flex items-center justify-center transition-transform',
              isDraggingState ? 'scale-115 ring-3 ring-[var(--brass-accent)]/30' : 'group-hover:scale-108'
            )}
            style={{
              backgroundColor: tier?.colorHex || '#D97706',
            }}
          >
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shadow-2xs" />
          </div>
        </div>
      </div>

      {/* Sommelier Milestone Labels Row along the Spectrum Track (Mobile-Optimized Spacing) */}
      <div className="relative w-full h-5 sm:h-6 text-[11px] sm:text-xs font-display font-bold tabular-nums text-[var(--sepia-muted)]">
        {SCORE_MILESTONES.map((m) => {
          const tickPos = ((m.value - 1) / 99) * 100;
          const isNear = Math.abs(safeScore - m.value) <= 2;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange(m.value)}
              aria-label={`Score ${m.label}`}
              style={{ left: `${tickPos}%` }}
              className={cn(
                'absolute -translate-x-1/2 cursor-pointer transition-all duration-150 py-0.5 px-1.5 rounded-sm focus:outline-none select-none touch-manipulation',
                m.mobileVisible ? 'inline-flex' : 'hidden sm:inline-flex',
                isNear
                  ? 'text-[var(--brass-accent)] font-black scale-115 drop-shadow-2xs'
                  : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:scale-110 font-bold'
              )}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
