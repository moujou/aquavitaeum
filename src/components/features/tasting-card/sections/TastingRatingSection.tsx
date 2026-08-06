'use client';

import React from 'react';
import { RotateCcw, CheckCircle, Trash2 } from 'lucide-react';
import { Spirit } from '@/types/spirit.types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { RatingStars } from '@/components/ui/RatingStars';
import { TranslationKey } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

interface TastingRatingSectionProps {
  spirit: Spirit;
  stars: number;
  saved: boolean;
  update: <K extends keyof Spirit>(key: K, value: Spirit[K]) => void;
  handleSave: () => void;
  handleReset: () => void;
  onDelete?: (id: string) => void;
  setShowDeleteModal: (show: boolean) => void;
  t: (key: TranslationKey) => string;
}

export function TastingRatingSection({
  spirit,
  stars,
  saved,
  update,
  handleSave,
  handleReset,
  onDelete,
  setShowDeleteModal,
  t,
}: TastingRatingSectionProps) {
  return (
    <section className="border-t border-[#D4C3A3] pt-5 flex flex-col gap-4 w-full" aria-label="Score & Rating Section">
      <SectionHeader>{t('scoreRatingSection')}</SectionHeader>
      <div className="bg-[#1A120B]/5 p-5 rounded border border-[#C4A87A]/60 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Rating Score & Enlarged Stars */}
        <div className="flex items-center gap-5 w-full sm:w-auto">
          <span className="font-display text-4xl sm:text-5xl font-bold text-[#1A120B] leading-none">
            {spirit.rating100}
          </span>
          <div className="flex flex-col gap-1 flex-1 sm:flex-none">
            <RatingStars stars={stars} size={28} />
          </div>
        </div>

        {/* Rating Slider */}
        <div className="flex-1 max-w-md w-full flex items-center gap-3">
          <span className="text-xs sm:text-sm text-[#755030] font-body font-semibold">1</span>
          <input
            id="rating-slider"
            type="range"
            min={1}
            max={100}
            value={spirit.rating100}
            onChange={(e) => update('rating100', Number(e.target.value))}
            className="flex-1 accent-[#C59B27] h-2.5 cursor-pointer"
            aria-label="Rating score"
          />
          <span className="text-xs sm:text-sm text-[#755030] font-body font-semibold">100</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3.5 justify-end items-center">
        {onDelete && (
          <button
            id="tasting-card-delete"
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-sm border border-red-900/60 bg-red-950/20',
              'text-xs sm:text-sm font-display uppercase tracking-wider font-semibold text-red-900 hover:bg-red-900 hover:text-white transition-colors duration-200 cursor-pointer',
            )}
          >
            <Trash2 size={15} />
            {t('deleteTastingNote')}
          </button>
        )}
        <button
          id="tasting-card-reset"
          type="button"
          onClick={handleReset}
          className={cn(
            'flex items-center gap-2 px-5 py-3 rounded-sm border border-[#C4A87A]',
            'text-xs sm:text-sm font-display uppercase tracking-wider font-semibold text-[#5c3d22] hover:bg-[#1A120B] hover:text-[#F5EEDC] hover:border-[#1A120B] transition-colors duration-200 cursor-pointer',
          )}
        >
          <RotateCcw size={15} />
          {t('reset')}
        </button>
        <button
          id="tasting-card-save"
          type="button"
          onClick={handleSave}
          className={cn(
            'min-w-[140px] flex items-center justify-center gap-2 px-6 py-3 rounded-sm border',
            'text-xs sm:text-sm font-display uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer',
            saved
              ? 'bg-green-800 text-white border-green-800'
              : 'bg-[#1A120B] text-[#F5EEDC] border-[#C59B27] hover:bg-[#2A1B12] hover:border-[#e8c247]',
          )}
        >
          <CheckCircle size={15} />
          {saved ? t('saved') : t('saveTastingNote')}
        </button>
      </div>
    </section>
  );
}
