'use client';

import React from 'react';
import { Spirit } from '@/types/spirit.types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FlavorRadarChart, DynamicProfileSliders } from '@/components/features/radar-chart/FlavorRadarChart';
import { FlavorTagSelector } from '@/components/features/flavor-tags/FlavorTagSelector';
import { TranslationKey } from '@/lib/i18n/translations';
import { SpiritAnalysisResult } from '@/services/ai-assistant-service';
import { SpiritApplyMode } from '@/components/features/scanner/SpiritScanModal';

interface TastingFlavorSectionProps {
  spirit: Spirit;
  update: <K extends keyof Spirit>(key: K, value: Spirit[K]) => void;
  onAnalyzeSpirit?: (result: SpiritAnalysisResult, uploadedImage?: string, mode?: SpiritApplyMode) => void;
  t: (key: TranslationKey) => string;
}

export function TastingFlavorSection({
  spirit,
  update,
  t,
}: TastingFlavorSectionProps) {
  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full">
      {/* ── Tier 1: 2-Column Aroma Tag Selector (Nase | Geschmack) ── */}
      <div className="flex flex-col gap-2 w-full">
        <FlavorTagSelector
          spiritId={spirit.id}
          noseFlavorTags={spirit.noseFlavorTags ?? []}
          tasteFlavorTags={spirit.tasteFlavorTags ?? []}
          onNoseTagsChange={(tags) => {
            update('noseFlavorTags', tags);
            update('flavorTags', Array.from(new Set([...tags, ...(spirit.tasteFlavorTags ?? [])])));
          }}
          onTasteTagsChange={(tags) => {
            update('tasteFlavorTags', tags);
            update('flavorTags', Array.from(new Set([...(spirit.noseFlavorTags ?? []), ...tags])));
          }}
          className="w-full"
        />
      </div>

      {/* ── Tier 2: Grand Centerpiece Visualizer (Aromenrad / Netzdiagramm) ── */}
      <div className="flex flex-col gap-2 border-t border-[var(--parchment-border)]/60 pt-5 sm:pt-6 w-full">
        <div className="flex items-center justify-between">
          <SectionHeader>{t('noseTasteRadar')}</SectionHeader>
        </div>
        <FlavorRadarChart
          noseProfile={spirit.noseProfile}
          tasteProfile={spirit.tasteProfile}
          noseFlavorTags={spirit.noseFlavorTags ?? []}
          tasteFlavorTags={spirit.tasteFlavorTags ?? []}
          noseTagIntensities={spirit.noseTagIntensities ?? {}}
          tasteTagIntensities={spirit.tasteTagIntensities ?? {}}
        />
      </div>

      {/* ── Tier 3: 2-Column Side-by-Side Dynamic Intensity Sliders (Nase | Geschmack) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 border-t border-[var(--parchment-border)]/60 pt-5 sm:pt-6 items-start w-full">
        {/* Left Column: Nose Sliders */}
        <div className="w-full">
          <DynamicProfileSliders
            title={t('noseIntensity')}
            type="nose"
            activeTags={spirit.noseFlavorTags ?? []}
            tagIntensities={spirit.noseTagIntensities ?? {}}
            onIntensityChange={(tagName, val) => {
              const updated = { ...(spirit.noseTagIntensities ?? {}), [tagName]: val };
              update('noseTagIntensities', updated);
            }}
          />
        </div>

        {/* Right Column: Taste Sliders */}
        <div className="w-full">
          <DynamicProfileSliders
            title={t('tasteIntensity')}
            type="taste"
            activeTags={spirit.tasteFlavorTags ?? []}
            tagIntensities={spirit.tasteTagIntensities ?? {}}
            onIntensityChange={(tagName, val) => {
              const updated = { ...(spirit.tasteTagIntensities ?? {}), [tagName]: val };
              update('tasteTagIntensities', updated);
            }}
          />
        </div>
      </div>
    </div>
  );
}
