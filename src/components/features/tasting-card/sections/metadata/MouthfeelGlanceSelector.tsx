'use client';

import React, { useState } from 'react';
import { SPIRIT_GLANCES } from '@/types/spirit.types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Language, TranslationKey, translateGlance } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

interface MouthfeelGlanceSelectorProps {
  glance?: string | string[];
  onChange: (glances: string[]) => void;
  language: Language;
  t: (key: TranslationKey) => string;
  className?: string;
}

export function MouthfeelGlanceSelector({
  glance = [],
  onChange,
  language,
  t,
  className,
}: MouthfeelGlanceSelectorProps) {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const currentGlance: string[] = Array.isArray(glance)
    ? glance
    : glance ? [glance] : [];

  const allAvailableGlances = Array.from(
    new Set([...(SPIRIT_GLANCES as readonly string[]), ...currentGlance])
  );

  const handleToggle = (item: string) => {
    const next = currentGlance.includes(item)
      ? currentGlance.filter((x) => x !== item)
      : [...currentGlance, item];
    onChange(next);
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) {
      setIsAddingCustom(false);
      return;
    }
    if (!currentGlance.includes(trimmed)) {
      onChange([...currentGlance, trimmed]);
    }
    setCustomInput('');
    setIsAddingCustom(false);
  };

  const handleRemoveCustom = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    onChange(currentGlance.filter((x) => x !== item));
  };

  return (
    <div className={cn('flex flex-col gap-1.5 min-w-0', className)}>
      <SectionHeader className="mb-0.5">{t('glanceMouthfeel')}</SectionHeader>
      <div className="flex flex-wrap gap-1.5 items-center">
        {allAvailableGlances.map((g) => {
          const isActive = currentGlance.includes(g);
          const isPreset = (SPIRIT_GLANCES as readonly string[]).includes(g);

          return (
            <button
              key={g}
              id={`glance-${g.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => handleToggle(g)}
              className={cn(
                'px-2.5 py-1 rounded-full border text-xs sm:text-[13px] font-body font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 min-h-[30px]',
                isActive
                  ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
                  : 'border-[var(--parchment-border)]/60 bg-[var(--sepia-text)]/5 text-[var(--sepia-muted)] hover:bg-[var(--sepia-text)]/12 hover:border-[var(--parchment-border)]'
              )}
              aria-pressed={isActive}
            >
              <span>{translateGlance(g, language)}</span>
              {!isPreset && isActive && (
                <span
                  onClick={(e) => handleRemoveCustom(e, g)}
                  className="ml-0.5 hover:text-red-300 transition-colors cursor-pointer text-xs"
                  title="Remove custom mouthfeel"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}

        {/* + Custom Mouthfeel Chip / Inline Input */}
        {isAddingCustom ? (
          <div className="flex items-center gap-1 bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] rounded-full px-2 py-0.5 shadow-inner animate-fade-in">
            <input
              type="text"
              autoFocus
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              maxLength={30}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustom();
                } else if (e.key === 'Escape') {
                  setIsAddingCustom(false);
                  setCustomInput('');
                }
              }}
              onBlur={handleAddCustom}
              placeholder={t('customMouthfeelPlaceholder')}
              className="bg-transparent text-xs sm:text-[13px] font-body text-[var(--sepia-text)] focus:outline-none w-28 sm:w-36 placeholder:text-[var(--parchment-border)]"
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="text-xs font-bold text-[var(--brass-accent)] hover:text-[var(--sepia-text)] px-1 cursor-pointer"
            >
              ✓
            </button>
          </div>
        ) : (
          <button
            type="button"
            id="add-custom-mouthfeel-btn"
            onClick={() => setIsAddingCustom(true)}
            className="px-2.5 py-1 rounded-full border border-dashed border-[var(--parchment-border)] text-xs font-body text-[var(--sepia-muted)] hover:text-[var(--sepia-text)] hover:border-[var(--sepia-muted)] transition-all cursor-pointer min-h-[30px] flex items-center"
          >
            {t('addCustomMouthfeel')}
          </button>
        )}
      </div>
    </div>
  );
}
