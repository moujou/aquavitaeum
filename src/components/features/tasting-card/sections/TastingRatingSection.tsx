'use client';

import React from 'react';
import { Spirit } from '@/types/spirit.types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TranslationKey } from '@/lib/i18n/translations';
import { useLanguage } from '@/context/LanguageContext';
import { SommelierScoreMedallion } from '@/components/ui/SommelierScoreMedallion';
import { SommelierScoreSlider } from '@/components/ui/SommelierScoreSlider';
import { BarVerdictRoleSelector } from './BarVerdictRoleSelector';

interface TastingRatingSectionProps {
  spirit: Spirit;
  stars?: number;
  update: <K extends keyof Spirit>(key: K, value: Spirit[K]) => void;
  t: (key: TranslationKey) => string;
}

export function TastingRatingSection({
  spirit,
  update,
  t,
}: TastingRatingSectionProps) {
  const { language } = useLanguage();
  const currentScore = spirit.rating100 || 85;
  const activeBarRoles = spirit.barRole || [];

  const handleToggleBarRole = (role: string) => {
    if (activeBarRoles.includes(role)) {
      update(
        'barRole',
        activeBarRoles.filter((r) => r !== role)
      );
    } else {
      update('barRole', [...activeBarRoles, role]);
    }
  };

  return (
    <section
      className="border-t border-[var(--parchment-border)]/60 pt-5 flex flex-col gap-4 w-full"
      aria-label="Score & Rating Section"
    >
      <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/50 pb-1.5">
        <SectionHeader className="mb-0">{t('scoreRatingSection')}</SectionHeader>
      </div>

      {/* Main Unified Rating & Recommendations Card */}
      <div className="bg-[var(--parchment-bg-alt)]/70 p-5 sm:p-6 rounded-2xl border border-[var(--parchment-border)] shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
        
        {/* Left Column: Score Slider + Recommendations (Matching Full Width) */}
        <div className="flex-1 w-full flex flex-col gap-4">
          
          {/* Sommelier Score Amber Liquid Gauge Slider (Full Width) */}
          <div className="w-full">
            <SommelierScoreSlider
              score={currentScore}
              onChange={(val) => update('rating100', val)}
            />
          </div>

          {/* Integrated Bar Recommendations Chips (Matching Full Width) */}
          <div className="pt-3 border-t border-[var(--parchment-border)]/40 w-full">
            <BarVerdictRoleSelector
              activeRoles={activeBarRoles}
              onToggleRole={handleToggleBarRole}
              language={language}
              t={t}
            />
          </div>
        </div>

        {/* Right Column: Hero Sommelier Cask Brand Seal (Vertically & Horizontally Centered) */}
        <div className="shrink-0 flex items-center justify-center self-center my-auto p-2">
          <SommelierScoreMedallion score={currentScore} size="lg" />
        </div>
      </div>
    </section>
  );
}
