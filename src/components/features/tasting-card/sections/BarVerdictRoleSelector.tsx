'use client';

import React from 'react';
import { SPIRIT_BAR_ROLES } from '@/types/spirit.types';
import { Language, TranslationKey, translateBarRole } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

export function getRoleEmoji(role: string): string {
  switch (role) {
    case 'Daily Sipper':
      return '🥃';
    case 'Showcase Bottle':
      return '👑';
    case 'Buy Again':
      return '🛒';
    case 'Great Value':
      return '💎';
    case 'Guest Favorite':
      return '👥';
    case 'Gift Idea':
      return '🎁';
    case 'Beginner Friendly':
      return '🌱';
    case 'Connoisseur Choice':
      return '🧐';
    default:
      return '✨';
  }
}

interface BarVerdictRoleSelectorProps {
  activeRoles: string[];
  onToggleRole: (role: string) => void;
  language: Language;
  t?: (key: TranslationKey) => string;
  className?: string;
}

export function BarVerdictRoleSelector({
  activeRoles = [],
  onToggleRole,
  language,
  className,
}: BarVerdictRoleSelectorProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: 2-Column Responsive Masonry Flow | Tablet & Desktop: Inline Fluid Flex */}
      <div className="columns-2 sm:columns-none sm:flex sm:flex-wrap gap-2 space-y-2 sm:space-y-0">
        {SPIRIT_BAR_ROLES.map((role) => {
          const isSelected = activeRoles.includes(role);
          const emoji = getRoleEmoji(role);
          const translatedText = translateBarRole(role, language);

          return (
            <button
              key={role}
              type="button"
              onClick={() => onToggleRole(role)}
              className={cn(
                'break-inside-avoid w-full sm:w-auto inline-flex items-center justify-start gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold font-body transition-all duration-150 cursor-pointer select-none min-h-[36px] shadow-2xs',
                isSelected
                  ? 'bg-[var(--wood-selection)] border-[var(--brass-accent)] text-white shadow-xs font-bold'
                  : 'border-[var(--parchment-border)] bg-white/80 dark:bg-black/25 text-[var(--foreground)] hover:bg-white hover:border-[var(--brass-accent)] active:scale-95'
              )}
              aria-pressed={isSelected}
            >
              <span className="text-base shrink-0 select-none">{emoji}</span>
              <span className="truncate text-left">{translatedText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
