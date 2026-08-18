'use client';

import React from 'react';
import { SPIRIT_BAR_ROLES } from '@/types/spirit.types';
import { Language, TranslationKey, translateBarRole } from '@/lib/i18n/translations';
import { Check } from 'lucide-react';
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
    default:
      return '✨';
  }
}

interface BarVerdictRoleSelectorProps {
  activeRoles: string[];
  onToggleRole: (role: string) => void;
  language: Language;
  t: (key: TranslationKey) => string;
  className?: string;
}

export function BarVerdictRoleSelector({
  activeRoles = [],
  onToggleRole,
  language,
  t,
  className,
}: BarVerdictRoleSelectorProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl bg-[var(--parchment-bg-alt)]/50 border border-[var(--parchment-border)] flex flex-col gap-2.5 shadow-2xs',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-display uppercase tracking-wider font-bold text-[var(--sepia-muted)]">
          {t('barVerdictLabel')}
        </span>
        <span className="text-xs text-[var(--sepia-muted)] font-mono font-medium">
          {activeRoles.length} {language === 'DE' ? 'gewählt' : 'selected'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
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
                'px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-bold font-body transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none min-h-[34px]',
                isSelected
                  ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-white shadow-xs scale-[1.02]'
                  : 'border-[var(--parchment-border)] bg-white/60 dark:bg-black/20 text-[var(--foreground)] hover:bg-white hover:border-[var(--brass-accent)]'
              )}
              aria-pressed={isSelected}
            >
              <span>{emoji}</span>
              <span>{translatedText}</span>
              {isSelected && <Check size={14} className="ml-0.5 text-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
