'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NoteFilterState } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';

export interface NoteFilterDropdownProps {
  filterState: NoteFilterState;
  onChange: (nextState: NoteFilterState) => void;
  className?: string;
}

const FACT_FILTER_CHIPS: { id: string; labelDe: string; labelEn: string }[] = [
  { id: 'Cask Strength', labelDe: 'Fassstärke', labelEn: 'Cask Strength' },
  { id: 'Natural Colour', labelDe: 'Ohne Farbstoff', labelEn: 'Natural Colour' },
  { id: 'Non-Chill Filtered', labelDe: 'Nicht kühlgefiltert', labelEn: 'Non-Chill Filtered' },
  { id: 'Peated', labelDe: 'Getorft', labelEn: 'Peated' },
  { id: 'Single Cask', labelDe: 'Einzelfass', labelEn: 'Single Cask' },
  { id: 'Buy Again', labelDe: 'Wiederkauf', labelEn: 'Buy Again' },
  { id: 'Daily Sipper', labelDe: 'Tages-Dram', labelEn: 'Daily Sipper' },
  { id: 'Great Value', labelDe: 'Preis-Hit', labelEn: 'Great Value' },
];

export function NoteFilterDropdown({
  filterState,
  onChange,
  className,
}: NoteFilterDropdownProps) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const minAge = filterState.minAge ?? 0;
  const selectedChars = filterState.characteristics ?? [];

  const activeCount =
    (filterState.minRating > 0 ? 1 : 0) +
    (minAge > 0 ? 1 : 0) +
    selectedChars.length;

  const isFiltered = activeCount > 0;

  const handleReset = () => {
    onChange({
      minRating: 0,
      minAge: 0,
      characteristics: [],
    });
  };

  const toggleCharacteristic = (chipId: string) => {
    const next = selectedChars.includes(chipId)
      ? selectedChars.filter((c) => c !== chipId)
      : [...selectedChars, chipId];
    onChange({
      ...filterState,
      characteristics: next,
    });
  };

  const ratingOptions = [
    { label: language === 'DE' ? 'Alle' : 'All', value: 0 },
    { label: '80+', value: 80 },
    { label: '85+', value: 85 },
    { label: '90+', value: 90 },
  ];

  const ageOptions = [
    { label: language === 'DE' ? 'Alle' : 'All', value: 0 },
    { label: '10+', value: 10 },
    { label: '12+', value: 12 },
    { label: '18+', value: 18 },
  ];

  return (
    <div className={cn('relative inline-block text-left', className)} ref={menuRef}>
      {/* Trigger Button (Square w-9 h-9 Icon-Only Standard matching toolbar buttons) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={t('filterNotes')}
        title={t('filterNotes')}
        className={cn(
          'relative w-9 h-9 rounded-lg border border-[var(--forest-green)]/35 bg-[var(--pub-bg-panel)] hover:bg-[var(--forest-green)]/10 text-[var(--forest-green)] hover:border-[var(--forest-green)] flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer min-h-[36px]',
          isFiltered && 'border-[var(--forest-green)] bg-[var(--forest-green)]/10 text-[var(--forest-green)] font-bold',
          isOpen && 'bg-[var(--forest-green)]/15 border-[var(--forest-green)] ring-2 ring-[var(--forest-green)]/25 shadow-sm'
        )}
      >
        <Filter size={16} className="text-[var(--forest-green)] shrink-0" />
        <span className="sr-only">{t('filterNotes')}</span>
        {isFiltered && (
          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-[var(--forest-green)] text-white text-[10px] font-mono font-bold leading-none shadow-2xs">
            {activeCount}
          </span>
        )}
      </button>

      {/* Floating Filter Panel (Centered within mobile viewport so it never overflows right edge) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={t('filterNotes')}
          className="absolute -left-28 sm:left-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] shadow-[0_12px_36px_rgba(40,28,15,0.24)] rounded-xl p-3.5 z-[100] animate-fade-in flex flex-col gap-3 select-none text-xs"
        >
          {/* Header & Reset shortcut */}
          <div className="flex items-center justify-between pb-1.5 border-b border-[var(--parchment-border)]/50">
            <span className="font-display font-bold text-xs uppercase tracking-wider text-[var(--forest-green)]">
              {t('filterNotes')}
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-[var(--brass-accent)] hover:text-[var(--brass-accent)]/80 hover:underline font-semibold cursor-pointer"
              >
                {t('resetFilters')}
              </button>
            )}
          </div>

          {/* 1. Rating Threshold (Segmented Bar) */}
          <div className="flex flex-col gap-1">
            <span className="font-display font-semibold text-[11px] text-[var(--sepia-muted)]">
              {t('filterRatingMin')}
            </span>
            <div className="grid grid-cols-4 p-0.5 bg-[var(--pub-bg)] rounded-lg border border-[var(--parchment-border)]">
              {ratingOptions.map((opt) => {
                const isSelected = filterState.minRating === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange({ ...filterState, minRating: opt.value })}
                    className={cn(
                      'py-1 rounded-md text-[11px] font-mono font-semibold transition-all text-center flex items-center justify-center cursor-pointer',
                      isSelected
                        ? 'bg-[var(--forest-green)] text-white shadow-xs font-bold'
                        : 'text-[var(--sepia-text)] hover:bg-[var(--forest-green)]/10 hover:text-[var(--forest-green)]'
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Minimum Age (Segmented Bar in Years) */}
          <div className="flex flex-col gap-1">
            <span className="font-display font-semibold text-[11px] text-[var(--sepia-muted)]">
              {language === 'DE' ? 'Mindestalter (Jahre)' : 'Min Age (Years)'}
            </span>
            <div className="grid grid-cols-4 p-0.5 bg-[var(--pub-bg)] rounded-lg border border-[var(--parchment-border)]">
              {ageOptions.map((opt) => {
                const isSelected = minAge === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange({ ...filterState, minAge: opt.value })}
                    className={cn(
                      'py-1 rounded-md text-[11px] font-mono font-semibold transition-all text-center flex items-center justify-center cursor-pointer',
                      isSelected
                        ? 'bg-[var(--forest-green)] text-white shadow-xs font-bold'
                        : 'text-[var(--sepia-text)] hover:bg-[var(--forest-green)]/10 hover:text-[var(--forest-green)]'
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Characteristics & Bar Verdict Chips */}
          <div className="flex flex-col gap-1.5">
            <span className="font-display font-semibold text-[11px] text-[var(--sepia-muted)]">
              {language === 'DE' ? 'Eigenschaften & Fazit' : 'Characteristics & Verdict'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FACT_FILTER_CHIPS.map((chip) => {
                const isSelected = selectedChars.includes(chip.id);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => toggleCharacteristic(chip.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[11px] font-body font-semibold border transition-all cursor-pointer select-none',
                      isSelected
                        ? 'bg-[var(--forest-green)] text-white border-[var(--forest-green)] shadow-2xs'
                        : 'bg-[var(--pub-bg)] text-[var(--sepia-text)] border-[var(--parchment-border)] hover:border-[var(--forest-green)]'
                    )}
                  >
                    {language === 'DE' ? chip.labelDe : chip.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
