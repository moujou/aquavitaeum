'use client';

import React from 'react';
import { Spirit } from '@/types/spirit.types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { RatingStars } from '@/components/ui/RatingStars';
import { TranslationKey } from '@/lib/i18n/translations';
import { useLanguage } from '@/context/LanguageContext';
import { SommelierScoreMedallion, getScoreTierConfig } from '@/components/ui/SommelierScoreMedallion';
import { SommelierScoreSlider } from '@/components/ui/SommelierScoreSlider';
import { BarVerdictRoleSelector } from './BarVerdictRoleSelector';
import { cn } from '@/lib/utils';

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
  const { language } = useLanguage();
  const currentScore = spirit.rating100 || 85;
  const currentTier = getScoreTierConfig(currentScore);
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
      className="border-t border-[var(--parchment-divider)] pt-5 flex flex-col gap-5 w-full"
      aria-label="Score & Rating Section"
    >
      <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/50 pb-1.5">
        <SectionHeader className="mb-0">{t('scoreRatingSection')}</SectionHeader>
      </div>

      {/* Main Rating Card (Medallion + Timeline Slider) */}
      <div className="bg-[var(--parchment-bg-alt)]/70 p-5 sm:p-6 rounded-2xl border border-[var(--parchment-border)] shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
        
        {/* Left / Center Column: Interactive Golden Score Timeline */}
        <div className="flex-1 w-full flex flex-col gap-3.5">
          
          {/* Header Row: Tier Pill Badge (WCAG AA Dark Mode Contrast) */}
          <div className="flex items-center justify-center sm:justify-start">
            <span
              className={cn(
                'px-3.5 py-1 rounded-full text-xs font-display font-black uppercase tracking-wider shadow-2xs border flex items-center gap-1.5 transition-all text-black',
                currentTier.pillBg,
                currentTier.pillBorder
              )}
            >
              <span>{currentTier.emoji}</span>
              <span className="text-black font-black">{language === 'DE' ? currentTier.labelDe : currentTier.labelEn}</span>
            </span>
          </div>

          {/* Sommelier Score Spectrum Slider Track */}
          <div className="pt-1">
            <SommelierScoreSlider
              score={currentScore}
              onChange={(val) => update('rating100', val)}
            />
          </div>
        </div>

        {/* Right Column: Hero Sommelier Wax Seal Medallion + Centered Interactive Stars */}
        <div className="shrink-0 flex flex-col items-center justify-center gap-2.5">
          <SommelierScoreMedallion score={currentScore} size="lg" />
          <div className="flex items-center justify-center pt-0.5">
            <RatingStars stars={stars} size={22} />
          </div>
        </div>
      </div>

      {/* Bar Verdict & Recommendations (Extracted Subcomponent) */}
      <BarVerdictRoleSelector
        activeRoles={activeBarRoles}
        onToggleRole={handleToggleBarRole}
        language={language}
        t={t}
      />
    </section>
  );
}
