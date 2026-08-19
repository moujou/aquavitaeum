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
  { value: 50, label: '50' },
  { value: 60, label: '60' },
  { value: 70, label: '70' },
  { value: 80, label: '80' },
  { value: 85, label: '85' },
  { value: 90, label: '90' },
  { value: 95, label: '95' },
  { value: 100, label: '100' },
];

export function SommelierScoreSlider({
  score,
  onChange,
  className,
  id = 'sommelier-score-slider',
}: SommelierScoreSliderProps) {
  const { language } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const safeScore = Math.max(1, Math.min(100, score || 85));
  const tier = getScoreTierConfig(safeScore);
  const percentage = ((safeScore - 1) / 99) * 100;

  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const rawRatio = (clientX - rect.left) / rect.width;
      const clampedRatio = Math.max(0, Math.min(1, rawRatio));
      const targetScore = Math.round(1 + clampedRatio * 99);
      onChange(Math.max(1, Math.min(100, targetScore)));
    },
    [onChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
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
    <div id={id} className={cn('flex flex-col gap-1.5 w-full select-none', className)}>
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
        onPointerCancel={handlePointerUp}
        className="relative w-full py-2.5 cursor-pointer touch-none focus:outline-none group"
      >
        {/* Continuous Distiller's Amber Liquid Tube */}
        <div className="w-full h-4 sm:h-5 rounded-full border border-[var(--parchment-border)] bg-[var(--pub-bg-alt)]/80 relative overflow-hidden shadow-[inset_0_2px_4px_rgba(43,30,20,0.15)]">
          {/* Active Liquid Gold Fill Ribbon */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[var(--wood-dark)] via-[var(--brass-accent)] to-[var(--brass-light)] rounded-full transition-all duration-75 shadow-xs"
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
                  className="absolute w-0.5 h-2 bg-[var(--sepia-muted)]/30 -translate-x-1/2"
                />
              );
            })}
          </div>
        </div>

        {/* Glowing Sommelier Thumb Indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-75"
          style={{ left: `${percentage}%` }}
        >
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(43,30,20,0.45),0_0_12px_rgba(201,122,30,0.55)] flex items-center justify-center transition-transform group-hover:scale-110"
            style={{
              backgroundColor: tier?.colorHex || '#D97706',
            }}
          >
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shadow-2xs" />
          </div>
        </div>
      </div>

      {/* Sommelier Milestone Labels Row along the Spectrum Track */}
      <div className="relative w-full h-5 text-[9px] sm:text-[10.5px] font-mono font-bold text-[var(--sepia-muted)]">
        {SCORE_MILESTONES.map((m) => {
          const tickPos = ((m.value - 1) / 99) * 100;
          const isNear = Math.abs(safeScore - m.value) <= 2;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange(m.value)}
              style={{ left: `${tickPos}%` }}
              className={cn(
                'absolute -translate-x-1/2 cursor-pointer transition-all duration-150 hover:text-[var(--foreground)] py-0.5 px-1 rounded-sm focus:outline-none',
                isNear ? 'text-[var(--brass-accent)] font-black scale-115' : 'text-[var(--sepia-muted)]'
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
