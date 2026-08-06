'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { Spirit, SpiritType, SPIRIT_TYPES } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { SpiritCard } from './SpiritCard';
import { SpiritCardSkeleton } from './SpiritCardSkeleton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpiritCollectionGridProps {
  spirits: Spirit[];
  selectedId: string | null;
  isLoading?: boolean;
  onSelect: (spirit: Spirit) => void;
  onNewNote: () => void;
  onClose?: () => void;
  className?: string;
}

const TYPE_FILTERS: (SpiritType | 'All')[] = ['All', ...SPIRIT_TYPES];

// ─── Component ────────────────────────────────────────────────────────────────

export function SpiritCollectionGrid({
  spirits,
  selectedId,
  isLoading = false,
  onSelect,
  onNewNote,
  onClose,
  className,
}: SpiritCollectionGridProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<SpiritType | 'All'>('All');

  const filtered = useMemo(() => {
    return spirits.filter((s) => {
      const matchesType = typeFilter === 'All' || s.spiritType === typeFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.distillery.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.spiritType.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [spirits, search, typeFilter]);

  return (
    <div className={cn('h-full flex flex-col gap-3.5 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-0.5 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <WhiskyLogo size={16} className="text-[#C59B27] shrink-0" />
          <h2 className="font-display text-sm sm:text-base font-bold text-[#C59B27] truncate">
            {t('collection')}
          </h2>
          <span className="text-xs text-white/40 font-body shrink-0">({spirits.length})</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="new-tasting-note-btn"
            type="button"
            disabled={isLoading}
            onClick={onNewNote}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded text-[11px] sm:text-xs font-display uppercase tracking-wider font-bold border shrink-0 whitespace-nowrap',
              'bg-[#1A120B] text-[#C59B27] border-[#C59B27] hover:bg-[#C59B27] hover:text-[#1A120B] transition-colors duration-200 cursor-pointer shadow-xs',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <Plus size={13} />
            {t('newNote')}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#C4A87A] hover:text-white transition-colors cursor-pointer rounded border border-white/10 hover:border-white/30 bg-white/5 shrink-0"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search & Themed Type Filter Dropdown */}
      <div className="flex-shrink-0 flex gap-2 items-center">
        <div className="relative flex-1 min-w-0">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            id="collection-search"
            type="text"
            value={search}
            disabled={isLoading}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={cn(
              'w-full pl-7 pr-2.5 py-1.5 rounded-md bg-[#1A120B]/40 border border-[#C4A87A]/30',
              'text-xs text-[#e8d5b7] font-body placeholder:text-white/30',
              'focus:outline-none focus:border-[#C59B27]/80 transition-colors',
              'disabled:opacity-50',
            )}
          />
        </div>
        <select
          id="collection-type-filter"
          value={typeFilter}
          disabled={isLoading}
          onChange={(e) => setTypeFilter(e.target.value as SpiritType | 'All')}
          className={cn(
            'bg-[#1A120B] border border-[#C4A87A]/40 text-[11px] text-[#C59B27] font-body rounded-md px-2 py-1.5',
            'focus:outline-none focus:border-[#C59B27] cursor-pointer transition-colors w-[100px] sm:w-[110px] flex-shrink-0',
            'disabled:opacity-50',
          )}
          aria-label="Filter spirits by type"
        >
          <option value="All">{t('allTypes')}</option>
          {TYPE_FILTERS.filter((t) => t !== 'All').map((type) => (
            <option key={type} value={type} className="bg-[#1A120B] text-white">
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Scrollable Spirit Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-2.5">
        {isLoading ? (
          <>
            <SpiritCardSkeleton />
            <SpiritCardSkeleton />
            <SpiritCardSkeleton />
            <SpiritCardSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <p className="text-center text-xs text-white/30 font-body py-10 italic">
            {t('noMatchingFilter')}
          </p>
        ) : (
          filtered.map((spirit) => (
            <SpiritCard
              key={spirit.id}
              spirit={spirit}
              isSelected={spirit.id === selectedId}
              onClick={() => onSelect(spirit)}
            />
          ))
        )}
      </div>
    </div>
  );
}
