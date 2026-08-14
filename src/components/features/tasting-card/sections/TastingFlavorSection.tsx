'use client';

import React from 'react';
import { Spirit } from '@/types/spirit.types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FlavorRadarChart, DynamicProfileSliders } from '@/components/features/radar-chart/FlavorRadarChart';
import { SpiritPhotoCarousel } from '@/components/features/photos/SpiritPhotoCarousel';
import { TranslationKey } from '@/lib/i18n/translations';

interface TastingFlavorSectionProps {
  spirit: Spirit;
  update: <K extends keyof Spirit>(key: K, value: Spirit[K]) => void;
  t: (key: TranslationKey) => string;
}

export function TastingFlavorSection({
  spirit,
  update,
  t,
}: TastingFlavorSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Desktop-Only Spirit Photos Carousel */}
      <div className="hidden lg:flex flex-col gap-2">
        <SectionHeader>{t('spiritPhotos')}</SectionHeader>
        <SpiritPhotoCarousel
          images={spirit.images}
          thumbnailImage={spirit.thumbnailImage}
          onChange={(imgs) => update('images', imgs)}
          onSetThumbnail={(url) => update('thumbnailImage', url as string | undefined)}
        />
      </div>

      {/* Radar Graph */}
      <div className="flex flex-col gap-2 border-t border-[var(--parchment-divider)] pt-4">
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

      {/* Dynamic Nose Tag Sliders Section */}
      <div className="border-t border-[var(--parchment-divider)] pt-4">
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

      {/* Dynamic Taste Tag Sliders Section */}
      <div className="border-t border-[var(--parchment-divider)] pt-4">
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
  );
}
