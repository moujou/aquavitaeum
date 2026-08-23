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
  const currentScore = spirit.rating100 || 1;
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
      <div className="bg-[var(--parchment-bg-alt)]/70 p-4 sm:p-6 rounded-2xl border border-[var(--parchment-border)] shadow-xs flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-5 lg:gap-8">
        
        {/* Mobile/Tablet: Centered Hero Sommelier Seal (160px–192px Majestic Cask Stamp) */}
        <div className="flex lg:hidden items-center justify-center pt-1 pb-1">
          <SommelierScoreMedallion score={currentScore} size="lg" />
        </div>

        {/* Left Column (Desktop) / Main Controls (Mobile): Full Width Slider + Recommendations */}
        <div className="flex-1 w-full flex flex-col gap-5 justify-between">
          {/* Sommelier Score Amber Liquid Gauge Slider (100% Full Width) */}
          <div className="w-full">
            <SommelierScoreSlider
              score={currentScore}
              onChange={(val) => update('rating100', val)}
            />
          </div>

          {/* Integrated Bar Recommendations Chips (Full Width) */}
          <div className="pt-3.5 sm:pt-4 border-t border-[var(--parchment-border)]/50 w-full">
            <BarVerdictRoleSelector
              activeRoles={activeBarRoles}
              onToggleRole={handleToggleBarRole}
              language={language}
              t={t}
            />
          </div>
        </div>

        {/* Desktop-Only: Right Hero Sommelier Seal Column (Vertically & Horizontally Centered) */}
        <div className="hidden lg:flex shrink-0 items-center justify-center self-center my-auto p-2">
          <SommelierScoreMedallion score={currentScore} size="lg" />
        </div>
      </div>
    </section>
  );
}
