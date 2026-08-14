'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleButtonProps {
  id?: string;
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
  ariaLabel?: string;
}

export function ToggleButton({
  id,
  active,
  onClick,
  label,
  className,
  ariaLabel,
}: ToggleButtonProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel || label}
      className={cn(
        'px-3.5 py-2 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-body font-semibold rounded-xs border transition-all duration-300 ease-out cursor-pointer min-h-[38px] sm:min-h-0',
        active
          ? 'bg-[var(--wood-selection)] border-[var(--brass-accent)] text-[var(--parchment-bg)] shadow-xs'
          : 'border-[var(--parchment-border)]/60 bg-[var(--sepia-text)]/5 text-[var(--sepia-muted)] hover:bg-[var(--sepia-text)]/12 hover:border-[var(--parchment-border)]',
        className
      )}
    >
      {label}
    </button>
  );
}
