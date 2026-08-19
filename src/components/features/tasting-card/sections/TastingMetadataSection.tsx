'use client';

import React from 'react';
import {
  Spirit,
  Currency,
  SPIRIT_TYPES,
} from '@/types/spirit.types';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { FlavorTagSelector } from '@/components/features/flavor-tags/FlavorTagSelector';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  Language,
  TranslationKey,
} from '@/lib/i18n/translations';
import { LiquidColourSlider } from '@/components/ui/LiquidColourSlider';
import { cn } from '@/lib/utils';
import { MouthfeelGlanceSelector } from './metadata/MouthfeelGlanceSelector';
import { ProductionCharacteristicsSelector } from './metadata/ProductionCharacteristicsSelector';
import { TastingAdditionsSelector } from './metadata/TastingAdditionsSelector';
import { PricingVolumeRow } from './metadata/PricingVolumeRow';

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  className,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full bg-transparent border-b border-[var(--parchment-border)] pb-1 text-sm sm:text-base text-[var(--sepia-text)]',
        'placeholder:text-[var(--parchment-border)] font-body focus:outline-none focus:border-[var(--sepia-muted)]',
        'transition-colors duration-200',
        className
      )}
    />
  );
}

interface TastingMetadataSectionProps {
  spirit: Spirit;
  update: <K extends keyof Spirit>(key: K, value: Spirit[K]) => void;
  language: Language;
  t: (key: TranslationKey) => string;
}

export function TastingMetadataSection({
  spirit,
  update,
  language,
  t,
}: TastingMetadataSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* 2-Column Symmetrical Metadata Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {/* Row 1: Name des Whiskys (Full Width) */}
        <div className="col-span-2 flex flex-col gap-1">
          <FieldLabel htmlFor="name-input">{t('spiritName')}</FieldLabel>
          <TextInput
            id="name-input"
            value={spirit.name}
            onChange={(v) => update('name', v)}
            placeholder="e.g. Laphroaig Quarter Cask"
          />
        </div>

        {/* Row 2: Typ des Whiskys (Editable Combobox with standard presets) */}
        <div className="col-span-2 flex flex-col gap-1">
          <FieldLabel htmlFor="spirit-type-input">{t('spiritType')}</FieldLabel>
          <div className="relative w-full">
            <input
              id="spirit-type-input"
              list="spirit-types-list"
              type="text"
              value={spirit.spiritType}
              onChange={(e) => update('spiritType', e.target.value)}
              placeholder="e.g. Single Malt Scotch, Bourbon, etc."
              className="w-full bg-transparent border-b border-[var(--parchment-border)] pb-1 text-sm sm:text-base text-[var(--sepia-text)] font-body focus:outline-none focus:border-[var(--sepia-muted)] placeholder:text-[var(--parchment-border)] transition-colors"
            />
            <datalist id="spirit-types-list">
              {SPIRIT_TYPES.map((tVal) => (
                <option key={tVal} value={tVal} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Row 3: Destillerie / Hersteller (Full Width) */}
        <div className="col-span-2 flex flex-col gap-1">
          <FieldLabel htmlFor="distillery-input">{t('distilleryProducer')}</FieldLabel>
          <TextInput
            id="distillery-input"
            value={spirit.distillery}
            onChange={(v) => update('distillery', v)}
            placeholder="e.g. Laphroaig"
          />
        </div>

        {/* Row 4: Herkunft / Region & Alter */}
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="region-input">{t('regionOrigin')}</FieldLabel>
          <TextInput
            id="region-input"
            value={spirit.region}
            onChange={(v) => update('region', v)}
            placeholder="e.g. Islay, Scotland"
          />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="age-input">{t('ageYears')}</FieldLabel>
          <input
            id="age-input"
            type="number"
            min={0}
            max={100}
            value={spirit.age ?? ''}
            placeholder="Years"
            onChange={(e) => update('age', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-transparent border-b border-[var(--parchment-border)] pb-1 text-sm sm:text-base text-[var(--sepia-text)] font-body focus:outline-none focus:border-[var(--sepia-muted)] placeholder:text-[var(--parchment-border)]"
          />
        </div>

        {/* Row 5: Fass / Batch-Nr & Finish */}
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="cask-input">{t('caskBatchNo')}</FieldLabel>
          <TextInput
            id="cask-input"
            value={spirit.caskNo ?? ''}
            onChange={(v) => update('caskNo', v)}
            placeholder="Optional"
          />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="finish-input">{t('finishType')}</FieldLabel>
          <TextInput
            id="finish-input"
            value={spirit.finish ?? ''}
            onChange={(v) => update('finish', v)}
            placeholder="e.g. Oloroso Sherry Finish"
          />
        </div>

        {/* Row 6: ABV % */}
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="abv-input">{t('abvPercent')}</FieldLabel>
          <input
            id="abv-input"
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={spirit.abv === 0 ? '' : spirit.abv}
            placeholder="40.0"
            onChange={(e) => {
              const val = e.target.value;
              update('abv', val === '' ? 0 : parseFloat(val) || 0);
            }}
            className="w-full bg-transparent border-b border-[var(--parchment-border)] pb-1 text-sm sm:text-base text-[var(--sepia-text)] font-body focus:outline-none focus:border-[var(--sepia-muted)] placeholder:text-[var(--sepia-muted)]/50"
          />
        </div>

        {/* Row 7: Pricing & Volume Subcomponent (Flaschenvolumen, Verkostungsdatum, Flaschenpreis) */}
        <PricingVolumeRow
          volumeMl={spirit.volumeMl}
          price={spirit.price}
          currency={spirit.currency}
          dateTasted={spirit.dateTasted}
          onChangeVolume={(v) => update('volumeMl', v)}
          onChangePrice={(p) => update('price', p)}
          onChangeCurrency={(c) => update('currency', c as Currency)}
          onChangeDateTasted={(d) => update('dateTasted', d ?? '')}
          language={language}
          t={t}
        />

        {/* Row 8: Destillationsdatum & Abfülldatum */}
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="distillation-date-input">{t('distillationDate')}</FieldLabel>
          <TextInput
            id="distillation-date-input"
            value={spirit.distillationDate ?? ''}
            onChange={(v) => update('distillationDate', v)}
            placeholder={t('distillationDatePlaceholder')}
          />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="bottling-date-input">{t('bottlingDate')}</FieldLabel>
          <TextInput
            id="bottling-date-input"
            value={spirit.bottlingDate ?? ''}
            onChange={(v) => update('bottlingDate', v)}
            placeholder={t('bottlingDatePlaceholder')}
          />
        </div>
      </div>

      {/* Characteristics Section (Extracted Subcomponent) */}
      <ProductionCharacteristicsSelector
        characteristics={spirit.characteristics}
        isCaskStrength={spirit.isCaskStrength}
        addedColour={spirit.addedColour}
        chillFiltered={spirit.chillFiltered}
        onChangeCharacteristics={(chars) => update('characteristics', chars)}
        onSyncBooleans={(key, val) => update(key, val)}
        language={language}
        t={t}
      />

      {/* Colour Spectrum Section (Full Width Liquid Colour Slider) */}
      <div className="border-t border-[var(--parchment-divider)] pt-4 flex flex-col gap-1.5 w-full">
        <SectionHeader className="mb-0.5">{t('colour')}</SectionHeader>
        <LiquidColourSlider
          id="spirit-liquid-colour-slider"
          value={spirit.colour}
          onChange={(newColour) => update('colour', newColour)}
          language={language}
        />
      </div>

      {/* 2-Column Section: Left Glance / Mouthfeel | Right Tasting Additions */}
      <div className="border-t border-[var(--parchment-divider)] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* Left Column: Glance / Mouthfeel Subcomponent */}
        <MouthfeelGlanceSelector
          glance={spirit.glance}
          onChange={(glances) => update('glance', glances)}
          language={language}
          t={t}
        />

        {/* Right Column: Tasting Additions Subcomponent */}
        <TastingAdditionsSelector
          tastingAdditions={spirit.tastingAdditions}
          addedWater={spirit.addedWater}
          onTheRocks={spirit.onTheRocks}
          withChocolate={spirit.withChocolate}
          onChangeAdditions={(additions) => update('tastingAdditions', additions)}
          onSyncBooleans={(key, val) => update(key, val)}
          language={language}
          t={t}
        />
      </div>

      {/* Active Flavor Tag Selector (Left Column Bottom) */}
      <div className="border-t border-[var(--parchment-divider)] pt-4 flex flex-col gap-2 w-full">
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
          className="mt-1 w-full"
        />
      </div>
    </div>
  );
}
