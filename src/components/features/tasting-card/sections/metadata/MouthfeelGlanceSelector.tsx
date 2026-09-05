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
  const [showAllGlances, setShowAllGlances] = useState(false);

  const INITIAL_VISIBLE_COUNT = 6;
  const currentGlance: string[] = Array.isArray(glance)
    ? glance
    : glance ? [glance] : [];

  const displayedGlances = showAllGlances
    ? (SPIRIT_GLANCES as readonly string[])
    : (SPIRIT_GLANCES as readonly string[]).slice(0, INITIAL_VISIBLE_COUNT);
  const hiddenCount = (SPIRIT_GLANCES as readonly string[]).length - INITIAL_VISIBLE_COUNT;

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
        {/* Preset standard mouthfeel chips */}
        {displayedGlances.map((g) => {
          const isActive = currentGlance.includes(g);

          return (
            <button
              key={g}
              id={`glance-${g.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => handleToggle(g)}
              className={cn(
                'px-3 py-1.5 rounded-full border text-xs sm:text-sm font-body font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 min-h-[32px]',
                isActive
                  ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
                  : 'border-[var(--parchment-border)] bg-[var(--parchment-bg-alt)]/60 text-[var(--foreground)] hover:bg-[var(--parchment-bg-alt)] hover:border-[var(--brass-accent)]'
              )}
              aria-pressed={isActive}
            >
              <span>{translateGlance(g, language)}</span>
            </button>
          );
        })}

        {/* Toggle expand/collapse other mouthfeels */}
        {(hiddenCount > 0 || showAllGlances) && (
          <button
            type="button"
            onClick={() => setShowAllGlances(!showAllGlances)}
            className="px-2.5 py-1 rounded-full text-xs font-body font-semibold text-[var(--forest-green)] hover:bg-[var(--forest-green)]/10 transition-colors cursor-pointer select-none"
          >
            {showAllGlances
              ? (language === 'DE' ? 'Weniger' : 'Show less')
              : (language === 'DE' ? `+ ${hiddenCount} weitere…` : `+ ${hiddenCount} more…`)}
          </button>
        )}

        {/* Custom added mouthfeel chips */}
        {currentGlance
          .filter((g) => !(SPIRIT_GLANCES as readonly string[]).includes(g))
          .map((customMouthfeel) => (
            <div
              key={customMouthfeel}
              className="px-2.5 py-1 rounded-full border border-[var(--wood-selection)] bg-[var(--wood-selection)] text-white text-xs sm:text-[13px] font-semibold font-body shadow-xs flex items-center gap-1.5 min-h-[30px] select-none"
            >
              <span>✨ {customMouthfeel}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveCustom(e, customMouthfeel)}
                className="ml-0.5 text-xs opacity-75 hover:opacity-100 hover:text-red-200 cursor-pointer"
                title={language === 'DE' ? 'Entfernen' : 'Remove'}
              >
                ×
              </button>
            </div>
          ))}

        {/* + Custom Mouthfeel Chip / Inline Input */}
        {isAddingCustom ? (
          <div className="flex items-center gap-1.5 bg-[var(--parchment-bg)] border border-[var(--wood-selection)] rounded-full px-2 py-0.5 shadow-xs animate-fade-in">
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
              placeholder={t('customMouthfeelPlaceholder')}
              className="w-24 text-xs font-body bg-transparent outline-none text-[var(--foreground)] px-1"
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="px-2 py-0.5 rounded-full bg-[var(--wood-selection)] text-white text-[11px] font-bold cursor-pointer hover:scale-105"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingCustom(false);
                setCustomInput('');
              }}
              className="text-xs text-[var(--sepia-muted)] hover:text-[var(--sepia-text)] px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            id="add-custom-mouthfeel-btn"
            onClick={() => setIsAddingCustom(true)}
            className="px-2.5 py-1 rounded-full border border-dashed border-[var(--parchment-border)] text-xs font-body font-semibold text-[var(--sepia-muted)] hover:text-[var(--sepia-text)] hover:border-[var(--sepia-muted)] transition-all cursor-pointer min-h-[30px] flex items-center"
          >
            <span>{t('addCustomMouthfeel')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
