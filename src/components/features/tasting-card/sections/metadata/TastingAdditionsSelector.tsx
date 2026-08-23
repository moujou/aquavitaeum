'use client';

import React, { useState } from 'react';
import { TASTING_ADDITIONS } from '@/types/spirit.types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Language, TranslationKey, translateTastingAddition } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

interface TastingAdditionsSelectorProps {
  tastingAdditions?: string[];
  addedWater?: boolean;
  onTheRocks?: boolean;
  withChocolate?: boolean;
  onChangeAdditions: (additions: string[]) => void;
  onSyncBooleans?: (key: 'addedWater' | 'onTheRocks' | 'withChocolate', val: boolean) => void;
  language: Language;
  t: (key: TranslationKey) => string;
  className?: string;
}

export function TastingAdditionsSelector({
  tastingAdditions,
  addedWater,
  onTheRocks,
  withChocolate,
  onChangeAdditions,
  onSyncBooleans,
  language,
  t,
  className,
}: TastingAdditionsSelectorProps) {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const currentAdditions: string[] = Array.isArray(tastingAdditions)
    ? tastingAdditions
    : [
        ...(addedWater ? ['Water'] : []),
        ...(onTheRocks ? ['On the Rocks'] : []),
        ...(withChocolate ? ['With Chocolate'] : []),
      ];

  const allAvailableAdditions = Array.from(
    new Set([...(TASTING_ADDITIONS as readonly string[]), ...currentAdditions])
  );

  const handleToggle = (addition: string) => {
    const isActive = currentAdditions.includes(addition);
    const nextAdditions = isActive
      ? currentAdditions.filter((x) => x !== addition)
      : [...currentAdditions, addition];

    onChangeAdditions(nextAdditions);

    // Sync legacy boolean flags
    if (onSyncBooleans) {
      if (addition === 'Water') onSyncBooleans('addedWater', !isActive);
      if (addition === 'On the Rocks') onSyncBooleans('onTheRocks', !isActive);
      if (addition === 'With Chocolate') onSyncBooleans('withChocolate', !isActive);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) {
      setIsAddingCustom(false);
      return;
    }
    if (!currentAdditions.includes(trimmed)) {
      onChangeAdditions([...currentAdditions, trimmed]);
    }
    setCustomInput('');
    setIsAddingCustom(false);
  };

  const handleRemoveCustom = (e: React.MouseEvent, addition: string) => {
    e.stopPropagation();
    onChangeAdditions(currentAdditions.filter((x) => x !== addition));
  };

  return (
    <div className={cn('flex flex-col gap-1.5 min-w-0', className)}>
      <SectionHeader className="mb-0.5">{t('tastingAdditions')}</SectionHeader>
      <div className="flex flex-wrap gap-1.5 items-center">
        {allAvailableAdditions.map((addition) => {
          const isActive = currentAdditions.includes(addition);
          const isPreset = (TASTING_ADDITIONS as readonly string[]).includes(addition);

          return (
            <button
              key={addition}
              id={`addition-${addition.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => handleToggle(addition)}
              className={cn(
                'px-2.5 py-1 rounded-full border text-xs sm:text-[13px] font-body font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 min-h-[30px]',
                isActive
                  ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
                  : 'border-[var(--parchment-border)]/60 bg-[var(--sepia-text)]/5 text-[var(--sepia-muted)] hover:bg-[var(--sepia-text)]/12 hover:border-[var(--parchment-border)]'
              )}
              aria-pressed={isActive}
            >
              <span>{translateTastingAddition(addition, language)}</span>
              {!isPreset && isActive && (
                <span
                  onClick={(e) => handleRemoveCustom(e, addition)}
                  className="ml-0.5 hover:text-red-300 transition-colors cursor-pointer text-xs"
                  title="Remove custom addition"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}

        {/* + Custom Addition Chip / Inline Input */}
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
              placeholder={t('customAdditionPlaceholder')}
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
            id="add-custom-addition-btn"
            onClick={() => setIsAddingCustom(true)}
            className="px-2.5 py-1 rounded-full border border-dashed border-[var(--parchment-border)] text-xs font-body text-[var(--sepia-muted)] hover:text-[var(--sepia-text)] hover:border-[var(--sepia-muted)] transition-all cursor-pointer min-h-[30px] flex items-center"
          >
            {t('addCustomAddition')}
          </button>
        )}
      </div>
    </div>
  );
}
