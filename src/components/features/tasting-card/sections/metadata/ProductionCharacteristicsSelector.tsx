'use client';

import React, { useState } from 'react';
import { SPIRIT_CHARACTERISTICS } from '@/types/spirit.types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Language, TranslationKey, translateCharacteristic } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

interface ProductionCharacteristicsSelectorProps {
  characteristics?: string[];
  isCaskStrength?: boolean;
  addedColour?: boolean;
  chillFiltered?: boolean;
  onChangeCharacteristics: (chars: string[]) => void;
  onSyncBooleans?: (key: 'isCaskStrength' | 'addedColour' | 'chillFiltered', val: boolean) => void;
  language: Language;
  t: (key: TranslationKey) => string;
  className?: string;
}

export function ProductionCharacteristicsSelector({
  characteristics,
  isCaskStrength,
  addedColour,
  chillFiltered,
  onChangeCharacteristics,
  onSyncBooleans,
  language,
  t,
  className,
}: ProductionCharacteristicsSelectorProps) {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Derive active characteristics from array or legacy booleans
  const currentCharacteristics: string[] = Array.isArray(characteristics)
    ? characteristics
    : [
        ...(isCaskStrength ? ['Cask Strength'] : []),
        ...(addedColour === false ? ['Natural Colour'] : []),
        ...(chillFiltered === false ? ['Non-Chill Filtered'] : []),
      ];

  const allAvailableCharacteristics = Array.from(
    new Set([...(SPIRIT_CHARACTERISTICS as readonly string[]), ...currentCharacteristics])
  );

  const handleToggle = (char: string) => {
    const isActive = currentCharacteristics.includes(char);
    const nextChars = isActive
      ? currentCharacteristics.filter((x) => x !== char)
      : [...currentCharacteristics, char];

    onChangeCharacteristics(nextChars);

    // Sync legacy boolean flags
    if (onSyncBooleans) {
      if (char === 'Cask Strength') onSyncBooleans('isCaskStrength', !isActive);
      if (char === 'Natural Colour') onSyncBooleans('addedColour', isActive);
      if (char === 'Non-Chill Filtered') onSyncBooleans('chillFiltered', isActive);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) {
      setIsAddingCustom(false);
      return;
    }
    if (!currentCharacteristics.includes(trimmed)) {
      onChangeCharacteristics([...currentCharacteristics, trimmed]);
    }
    setCustomInput('');
    setIsAddingCustom(false);
  };

  const handleRemoveCustom = (e: React.MouseEvent, char: string) => {
    e.stopPropagation();
    onChangeCharacteristics(currentCharacteristics.filter((x) => x !== char));
  };

  return (
    <div className={cn('border-t border-[var(--parchment-border)]/60 pt-4 flex flex-col gap-1.5 w-full', className)}>
      <SectionHeader className="mb-0.5">{t('characteristics')}</SectionHeader>
      <div className="flex flex-wrap gap-1.5 items-center">
        {allAvailableCharacteristics.map((char) => {
          const isActive = currentCharacteristics.includes(char);
          const isPreset = (SPIRIT_CHARACTERISTICS as readonly string[]).includes(char);

          return (
            <button
              key={char}
              id={`char-${char.toLowerCase().replace(/[-\s]+/g, '-')}`}
              type="button"
              onClick={() => handleToggle(char)}
              className={cn(
                'px-2.5 py-1 rounded-full border text-xs sm:text-[13px] font-body font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 min-h-[30px]',
                isActive
                  ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
                  : 'border-[var(--parchment-border)]/60 bg-[var(--sepia-text)]/5 text-[var(--sepia-muted)] hover:bg-[var(--sepia-text)]/12 hover:border-[var(--parchment-border)]'
              )}
              aria-pressed={isActive}
            >
              <span>{translateCharacteristic(char, language)}</span>
              {!isPreset && isActive && (
                <span
                  onClick={(e) => handleRemoveCustom(e, char)}
                  className="ml-0.5 hover:text-red-300 transition-colors cursor-pointer text-xs"
                  title="Remove custom characteristic"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}

        {/* + Custom Characteristic Chip / Inline Input */}
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
              placeholder={t('customCharacteristicPlaceholder')}
              className="bg-transparent text-xs sm:text-[13px] font-body text-[var(--sepia-text)] focus:outline-none w-32 sm:w-44 placeholder:text-[var(--parchment-border)]"
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
            id="add-custom-characteristic-btn"
            onClick={() => setIsAddingCustom(true)}
            className="px-2.5 py-1 rounded-full border border-dashed border-[var(--parchment-border)] text-xs font-body text-[var(--sepia-muted)] hover:text-[var(--sepia-text)] hover:border-[var(--sepia-muted)] transition-all cursor-pointer min-h-[30px] flex items-center"
          >
            {t('addCustomCharacteristic')}
          </button>
        )}
      </div>
    </div>
  );
}
