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
        'px-2.5 py-1 text-xs font-body font-semibold rounded-xs border transition-all duration-300 ease-out cursor-pointer',
        active
          ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] shadow-xs'
          : 'border-[#C4A87A]/60 bg-[#1A120B]/5 text-[#5c3d22] hover:bg-[#1A120B]/12 hover:border-[#C4A87A]',
        className
      )}
    >
      {label}
    </button>
  );
}
