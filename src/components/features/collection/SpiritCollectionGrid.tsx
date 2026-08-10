'use client';

import { FileText } from 'lucide-react';
import { Spirit } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { SpiritCard } from './SpiritCard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpiritCollectionGridProps {
  title?: string;
  description?: string;
  spirits: Spirit[];
  selectedId: string | null;
  isLoading?: boolean;
  onSelect: (spirit: Spirit) => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpiritCollectionGrid({
  title,
  description,
  spirits,
  selectedId,
  isLoading = false,
  onSelect,
  className,
}: SpiritCollectionGridProps) {
  const { t } = useLanguage();

  return (
    <div className={cn('h-full flex flex-col gap-3.5 overflow-hidden', className)}>
      {/* Header: Centered layout with Title, Right-Aligned Counter (no parentheses) & Description */}
      <div className="flex-shrink-0 flex flex-col justify-center px-1 pb-3 border-b border-white/10 relative">
        {/* Header Row */}
        <div className="w-full flex items-center justify-center relative px-12">
          {/* Center-aligned Name */}
          <h2 className="font-display text-base sm:text-lg font-bold text-white tracking-wide truncate text-center mx-auto max-w-[90%]">
            {title || t('collection')}
          </h2>
          
          {/* Right-aligned Note Counter Pill */}
          <div className="absolute right-0.5 flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full shrink-0 select-none" title={`${spirits.length} notes`}>
            <FileText size={14} className="text-[#C59B27]" />
            <span className="font-bold font-mono text-xs text-white leading-none">{spirits.length}</span>
          </div>
        </div>

        {description && (
          <p className="font-body text-xs text-white/50 italic mt-0.5 leading-normal max-w-[240px] text-center mx-auto break-words">
            {description}
          </p>
        )}
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
