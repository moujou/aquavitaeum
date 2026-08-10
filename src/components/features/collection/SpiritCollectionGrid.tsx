'use client';

import { Spirit } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { SpiritCard } from './SpiritCard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpiritCollectionGridProps {
  title?: string;
  spirits: Spirit[];
  selectedId: string | null;
  isLoading?: boolean;
  onSelect: (spirit: Spirit) => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpiritCollectionGrid({
  title,
  spirits,
  selectedId,
  isLoading = false,
  onSelect,
  className,
}: SpiritCollectionGridProps) {
  const { t } = useLanguage();

  return (
    <div className={cn('h-full flex flex-col gap-3.5 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-0.5 gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <h2 className="font-display text-sm sm:text-base font-bold text-[#C59B27] truncate">
            {title || t('collection')}
          </h2>
          <span className="text-xs text-white/40 font-body shrink-0">({spirits.length})</span>
        </div>
      </div>

      {/* Dynamic Scrollable Spirit Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-2.5">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center select-none gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#C59B27]/20 border-t-[#C59B27] animate-spin" />
            <span className="text-xs text-white/40 font-display tracking-widest uppercase animate-pulse">
              {t('uncasking')}
            </span>
          </div>
        ) : spirits.length === 0 ? (
          <p className="text-center text-xs text-white/30 font-body py-10 italic">
            {t('noMatchingFilter')}
          </p>
        ) : (
          spirits.map((spirit) => (
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
