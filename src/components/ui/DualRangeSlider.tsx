'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  minDistance?: number;
  activeColor?: string;
  className?: string;
  ariaLabelStart?: string;
  ariaLabelEnd?: string;
}

export function DualRangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  minDistance = 2,
  activeColor = '#C59B27',
  className,
  ariaLabelStart = 'Start time',
  ariaLabelEnd = 'End time',
}: DualRangeSliderProps) {
  const [startVal, endVal] = value;
  const [activeThumb, setActiveThumb] = useState<'start' | 'end'>('start');

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextStart = Number(e.target.value);
    if (endVal - nextStart >= minDistance) {
      onChange([nextStart, endVal]);
    } else {
      onChange([Math.max(min, endVal - minDistance), endVal]);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextEnd = Number(e.target.value);
    if (nextEnd - startVal >= minDistance) {
      onChange([startVal, nextEnd]);
    } else {
      onChange([startVal, Math.min(max, startVal + minDistance)]);
    }
  };

  const leftPercent = Math.max(0, Math.min(100, ((startVal - min) / (max - min)) * 100));
  const rightPercent = Math.max(0, Math.min(100, ((endVal - min) / (max - min)) * 100));

  return (
    <div className={cn('relative w-full h-7 flex items-center select-none', className)}>
      {/* Slider Track Background */}
      <div className="absolute w-full h-2 rounded-full bg-[var(--sepia-text)]/20 border border-[var(--parchment-border)]/40 overflow-hidden" />

      {/* Active Range Highlight Fill */}
      <div
        className="absolute h-2 rounded-full transition-all duration-75 shadow-xs"
        style={{
          left: `${leftPercent}%`,
          width: `${Math.max(0, rightPercent - leftPercent)}%`,
          backgroundColor: activeColor,
        }}
      />

      {/* Start Range Input (Left Thumb) */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={startVal}
        onFocus={() => setActiveThumb('start')}
        onMouseDown={() => setActiveThumb('start')}
        onTouchStart={() => setActiveThumb('start')}
        onChange={handleStartChange}
        aria-label={ariaLabelStart}
        className={cn(
          'absolute w-full h-2 appearance-none bg-transparent cursor-pointer',
          'pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto',
          activeThumb === 'start' ? 'z-30' : 'z-20'
        )}
        style={{
          WebkitAppearance: 'none',
          accentColor: activeColor,
        }}
      />

      {/* End Range Input (Right Thumb) */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={endVal}
        onFocus={() => setActiveThumb('end')}
        onMouseDown={() => setActiveThumb('end')}
        onTouchStart={() => setActiveThumb('end')}
        onChange={handleEndChange}
        aria-label={ariaLabelEnd}
        className={cn(
          'absolute w-full h-2 appearance-none bg-transparent cursor-pointer',
          'pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto',
          activeThumb === 'end' ? 'z-30' : 'z-20'
        )}
        style={{
          WebkitAppearance: 'none',
          accentColor: activeColor,
        }}
      />
    </div>
  );
}
