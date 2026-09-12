'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronDown, Check, Clock, Layers, Star, ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JournalSortOption } from '@/components/features/journals/JournalsOverview';
import { useLanguage } from '@/context/LanguageContext';

export interface SortDropdownProps {
  value: JournalSortOption;
  onChange: (value: JournalSortOption) => void;
  className?: string;
}

export function JournalSortDropdown({ value, onChange, className }: SortDropdownProps) {
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

  const sortOptions: { value: JournalSortOption; label: string; icon: React.ReactNode }[] = [
    {
      value: 'last_updated',
      label: t('sortLastEdited'),
      icon: <Clock size={16} />,
    },
    {
      value: 'bottle_count',
      label: t('sortBottleCount'),
      icon: <Layers size={16} />,
    },
    {
      value: 'rating',
      label: t('sortRating'),
      icon: <Star size={16} />,
    },
    {
      value: 'name_asc',
      label: t('sortNameAsc'),
      icon: <ArrowDownAZ size={16} />,
    },
    {
      value: 'name_desc',
      label: t('sortNameDesc'),
      icon: <ArrowUpZA size={16} />,
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
        aria-label={t('sortJournals')}
        title={t('sortJournals')}
        className={cn(
          'h-9 px-2.5 sm:px-3 rounded-lg border border-[var(--forest-green)]/35 bg-[var(--pub-bg-panel)] hover:bg-[var(--forest-green)]/10 text-[var(--forest-green)] hover:border-[var(--forest-green)] flex items-center gap-1.5 text-xs font-display font-semibold transition-all shadow-xs active:scale-95 cursor-pointer min-h-[36px]',
          isOpen && 'bg-[var(--forest-green)]/15 border-[var(--forest-green)] text-[var(--forest-green)] ring-2 ring-[var(--forest-green)]/25 shadow-sm'
        )}
      >
        <ArrowUpDown size={14} className="text-[var(--brass-accent)] shrink-0" />
        <span className="truncate max-w-[120px] sm:max-w-none text-[var(--foreground)]">{currentOption.label}</span>
        <ChevronDown
          size={13}
          className={cn('text-[var(--sepia-muted)] transition-transform duration-200 shrink-0 ml-0.5', isOpen && 'rotate-180')}
        />
      </button>

      {/* Floating Parchment Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t('sortJournals')}
          className="absolute left-0 top-full mt-2 w-56 sm:w-60 bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] shadow-[0_12px_36px_rgba(40,28,15,0.24)] rounded-xl p-1.5 z-[100] animate-fade-in flex flex-col gap-0.5 select-none"
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
                  'flex items-center justify-between gap-2.5 w-full px-3 py-2.5 text-xs font-display font-semibold rounded-lg transition-colors text-left cursor-pointer active:scale-[0.99] min-h-[38px]',
                  isSelected
                    ? 'bg-[var(--forest-green)]/15 text-[var(--forest-green)] font-bold'
                    : 'text-[var(--foreground)] hover:bg-[var(--forest-green)]/10 hover:text-[var(--forest-green)]'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={cn('shrink-0', isSelected ? 'text-[var(--forest-green)]' : 'text-[var(--sepia-muted)]')}>
                    {option.icon}
                  </span>
                  <span className="truncate">{option.label}</span>
                </div>
                {isSelected && <Check size={15} className="text-[var(--brass-accent)] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
