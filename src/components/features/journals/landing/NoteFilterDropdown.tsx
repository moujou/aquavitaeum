'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NoteFilterState, SPIRIT_TYPES } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';

export interface NoteFilterDropdownProps {
  filterState: NoteFilterState;
  onChange: (nextState: NoteFilterState) => void;
  className?: string;
}

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

  const activeCount =
    (filterState.spiritType !== 'All' ? 1 : 0) +
    (filterState.minRating > 0 ? 1 : 0);

  const isFiltered = activeCount > 0;

  const handleReset = () => {
    onChange({
      spiritType: 'All',
      minRating: 0,
    });
  };

  const ratingOptions = [
    { label: language === 'DE' ? 'Alle' : 'All', value: 0 },
    { label: '80+', value: 80 },
    { label: '85+', value: 85 },
    { label: '90+', value: 90 },
  ];

  return (
    <div className={cn('relative inline-block text-left', className)} ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={t('filterNotes')}
        title={t('filterNotes')}
        className={cn(
          'h-9 px-2.5 sm:px-3 rounded-lg border border-[var(--forest-green)]/35 bg-[var(--pub-bg-panel)] hover:bg-[var(--forest-green)]/10 text-[var(--forest-green)] hover:border-[var(--forest-green)] flex items-center gap-1.5 text-xs font-display font-semibold transition-all shadow-xs active:scale-95 cursor-pointer min-h-[36px]',
          isFiltered && 'border-[var(--forest-green)] bg-[var(--forest-green)]/10 text-[var(--forest-green)] font-bold',
          isOpen && 'bg-[var(--forest-green)]/15 border-[var(--forest-green)] ring-2 ring-[var(--forest-green)]/25 shadow-sm'
        )}
      >
        <Filter size={14} className="text-[var(--brass-accent)] shrink-0" />
        <span className="text-[var(--foreground)]">
          {t('filterNotes')}
          {isFiltered && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[var(--forest-green)] text-white text-[10px] font-mono font-bold leading-none inline-block">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          size={13}
          className={cn('text-[var(--sepia-muted)] transition-transform duration-200 shrink-0 ml-0.5', isOpen && 'rotate-180')}
        />
      </button>

      {/* Floating Filter Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={t('filterNotes')}
          className="absolute left-0 sm:left-0 top-full mt-2 w-64 sm:w-72 max-w-[calc(100vw-32px)] bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] shadow-[0_12px_36px_rgba(40,28,15,0.24)] rounded-xl p-3 z-[100] animate-fade-in flex flex-col gap-2.5 select-none text-xs"
        >
          {/* Header & Reset shortcut */}
          <div className="flex items-center justify-between pb-1 border-b border-[var(--parchment-border)]/50">
            <span className="font-display font-bold text-xs uppercase tracking-wider text-[var(--forest-green)]">
              {t('filterNotes')}
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-[var(--brass-accent)] hover:text-[var(--brass-accent)]/80 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw size={11} />
                {t('resetFilters')}
              </button>
            )}
          </div>

          {/* 1. Spirit Category Filter */}
          <div className="flex flex-col gap-1">
            <label htmlFor="note-filter-spirit-type" className="font-display font-semibold text-[11px] text-[var(--sepia-muted)]">
              {t('spiritType')}
            </label>
            <select
              id="note-filter-spirit-type"
              value={filterState.spiritType}
              onChange={(e) => onChange({ ...filterState, spiritType: e.target.value })}
              className="w-full h-8 px-2.5 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg)] text-xs text-[var(--foreground)] font-medium focus:outline-none focus:border-[var(--forest-green)] cursor-pointer"
            >
              <option value="All">{t('filterAllTypes')}</option>
              {SPIRIT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Rating Threshold (Segmented Bar with clean 'Alle' / 'All' label) */}
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
        </div>
      )}
    </div>
  );
}
