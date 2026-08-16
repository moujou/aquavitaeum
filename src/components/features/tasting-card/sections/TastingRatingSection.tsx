'use client';

import React from 'react';
import { Spirit } from '@/types/spirit.types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { RatingStars } from '@/components/ui/RatingStars';
import { TranslationKey } from '@/lib/i18n/translations';

interface TastingRatingSectionProps {
  spirit: Spirit;
  stars: number;
  update: <K extends keyof Spirit>(key: K, value: Spirit[K]) => void;
  t: (key: TranslationKey) => string;
}

export function TastingRatingSection({
  spirit,
  stars,
  update,
  t,
}: TastingRatingSectionProps) {
  return (
    <section className="border-t border-[var(--parchment-divider)] pt-5 flex flex-col gap-4 w-full" aria-label="Score & Rating Section">
      <SectionHeader>{t('scoreRatingSection')}</SectionHeader>
      <div className="bg-[var(--sepia-text)]/5 p-5 rounded border border-[var(--parchment-border)]/60 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Rating Score & Enlarged Stars */}
        <div className="flex items-center gap-5 w-full sm:w-auto">
          <span className="font-display text-4xl sm:text-5xl font-bold text-[var(--sepia-text)] leading-none">
            {spirit.rating100}
          </span>
          <div className="flex flex-col gap-1 flex-1 sm:flex-none">
            <RatingStars stars={stars} size={28} />
          </div>
        </div>

        {/* Rating Slider */}
        <div className="flex-1 max-w-md w-full flex items-center gap-3">
          <span className="text-xs sm:text-sm text-[var(--sepia-light)] font-body font-semibold">1</span>
          <input
            id="rating-slider"
            type="range"
            min={1}
            max={100}
            value={spirit.rating100}
            onChange={(e) => update('rating100', Number(e.target.value))}
            className="flex-1 accent-[var(--brass-accent)] h-2.5 cursor-pointer"
            aria-label="Rating score"
          />
          <span className="text-xs sm:text-sm text-[var(--sepia-light)] font-body font-semibold">100</span>
        </div>
      </div>
    </section>
  );
}
