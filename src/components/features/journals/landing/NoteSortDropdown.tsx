'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronDown, Check, Clock, Star, ArrowDownAZ, ArrowUpZA, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NoteSortOption } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';

export interface NoteSortDropdownProps {
  value: NoteSortOption;
  onChange: (value: NoteSortOption) => void;
  className?: string;
}

export function NoteSortDropdown({ value, onChange, className }: NoteSortDropdownProps) {
  const { t } = useLanguage();
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

  const sortOptions: { value: NoteSortOption; label: string; icon: React.ReactNode }[] = [
    {
      value: 'date_desc',
      label: t('sortTastedDate'),
      icon: <Clock size={15} />,
    },
    {
      value: 'rating_desc',
      label: t('sortRatingHigh'),
      icon: <Star size={15} />,
    },
    {
      value: 'rating_asc',
      label: t('sortRatingLow'),
      icon: <Star size={15} />,
    },
    {
      value: 'name_asc',
      label: t('sortNameAsc'),
      icon: <ArrowDownAZ size={15} />,
    },
    {
      value: 'name_desc',
      label: t('sortNameDesc'),
      icon: <ArrowUpZA size={15} />,
    },
    {
      value: 'abv_desc',
      label: t('sortAbv'),
      icon: <Flame size={15} />,
    },
  ];

  const currentOption = sortOptions.find((opt) => opt.value === value) || sortOptions[0];

  return (
    <div className={cn('relative inline-block text-left', className)} ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('sortNotes')}
        title={t('sortNotes')}
        className={cn(
          'h-9 px-2.5 sm:px-3 rounded-lg border border-[var(--forest-green)]/35 bg-[var(--pub-bg-panel)] hover:bg-[var(--forest-green)]/10 text-[var(--forest-green)] hover:border-[var(--forest-green)] flex items-center gap-1.5 text-xs font-display font-semibold transition-all shadow-xs active:scale-95 cursor-pointer min-h-[36px]',
          isOpen && 'bg-[var(--forest-green)]/15 border-[var(--forest-green)] text-[var(--forest-green)] ring-2 ring-[var(--forest-green)]/25 shadow-sm'
        )}
      >
        <ArrowUpDown size={14} className="text-[var(--brass-accent)] shrink-0" />
        <span className="truncate max-w-[100px] sm:max-w-none text-[var(--foreground)]">{currentOption.label}</span>
        <ChevronDown
          size={13}
          className={cn('text-[var(--sepia-muted)] transition-transform duration-200 shrink-0 ml-0.5', isOpen && 'rotate-180')}
        />
      </button>

      {/* Floating Parchment Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t('sortNotes')}
          className="absolute right-0 sm:left-0 sm:right-auto top-full mt-2 w-52 sm:w-56 bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] shadow-[0_12px_36px_rgba(40,28,15,0.24)] rounded-xl p-1.5 z-[100] animate-fade-in flex flex-col gap-0.5 select-none"
        >
          {sortOptions.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center justify-between gap-2 w-full px-2.5 py-2 text-xs font-display font-semibold rounded-lg transition-colors text-left cursor-pointer active:scale-[0.99] min-h-[34px]',
                  isSelected
                    ? 'bg-[var(--forest-green)]/15 text-[var(--forest-green)] font-bold'
                    : 'text-[var(--foreground)] hover:bg-[var(--forest-green)]/10 hover:text-[var(--forest-green)]'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn('shrink-0', isSelected ? 'text-[var(--forest-green)]' : 'text-[var(--sepia-muted)]')}>
                    {option.icon}
                  </span>
                  <span className="truncate">{option.label}</span>
                </div>
                {isSelected && <Check size={14} className="text-[var(--brass-accent)] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
