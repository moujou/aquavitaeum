'use client';

import React from 'react';
import {
  Spirit,
  SpiritType,
  SpiritColour,
  SUPPORTED_CURRENCIES,
  Currency,
  SPIRIT_TYPES,
  SPIRIT_GLANCES,
  SPIRIT_COLOURS,
  SPIRIT_COLOUR_HEX,
} from '@/types/spirit.types';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ToggleButton } from '@/components/ui/ToggleButton';
import { LocalizedDatePicker } from '@/components/ui/LocalizedDatePicker';
import { FlavorTagSelector } from '@/components/features/flavor-tags/FlavorTagSelector';
import { translateColour, translateGlance, Language, TranslationKey } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

const COLOURS: { value: SpiritColour; hex: string }[] = SPIRIT_COLOURS.map(
  (value) => ({ value, hex: SPIRIT_COLOUR_HEX[value] }),
);

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
        className,
      )}
    />
  );
}

function SegmentedSwitch({
  id,
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  id: string;
  label?: string;
  leftLabel: string;
  rightLabel: string;
  value: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="grid grid-cols-2 p-0.5 rounded-xs bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] shadow-xs gap-1">
        <button
          id={`${id}-false`}
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'py-1.5 px-2 rounded-xs font-body text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center select-none truncate min-h-[34px] flex items-center justify-center',
            !value
              ? 'bg-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
              : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-[var(--parchment-bg)]/40'
          )}
        >
          {leftLabel}
        </button>
        <button
          id={`${id}-true`}
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'py-1.5 px-2 rounded-xs font-body text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center select-none truncate min-h-[34px] flex items-center justify-center',
            value
              ? 'bg-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
              : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-[var(--parchment-bg)]/40'
          )}
        >
          {rightLabel}
        </button>
      </div>
    </div>
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

        {/* Row 2: Typ des Whiskys (Full Width) */}
        <div className="col-span-2 flex flex-col gap-1">
          <FieldLabel htmlFor="spirit-type-select">{t('spiritType')}</FieldLabel>
          <select
            id="spirit-type-select"
            value={spirit.spiritType}
            onChange={(e) => update('spiritType', e.target.value as SpiritType)}
            className="w-full bg-transparent border-b border-[var(--parchment-border)] pb-1 text-sm sm:text-base text-[var(--sepia-text)] font-body focus:outline-none focus:border-[var(--sepia-muted)] cursor-pointer"
          >
            {SPIRIT_TYPES.map((tVal) => (
              <option key={tVal} value={tVal} className="bg-[var(--parchment-bg)] text-[var(--sepia-text)]">
                {tVal}
              </option>
            ))}
          </select>
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

        {/* Row 6: ABV % & Flaschenvolumen */}
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
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="volume-select">{t('bottleVolume')}</FieldLabel>
          <div className="flex items-center gap-1.5 border-b border-[var(--parchment-border)]">
            <select
              id="volume-select"
              value={
                spirit.volumeMl !== undefined && spirit.volumeMl !== null
                  ? [50, 500, 700, 1000].includes(spirit.volumeMl)
                    ? spirit.volumeMl
                    : 'custom'
                  : ''
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  update('volumeMl', undefined);
                } else if (val !== 'custom') {
                  update('volumeMl', parseInt(val, 10));
                }
              }}
              className="w-full bg-transparent pb-1 text-sm sm:text-base text-[var(--sepia-text)] font-body focus:outline-none cursor-pointer border-none"
            >
              <option value="" className="bg-[var(--parchment-bg)] text-[var(--sepia-muted)]">
                -- {language === 'DE' ? 'Füllmenge wählen' : 'Select size'} --
              </option>
              <option value={700} className="bg-[var(--parchment-bg)] text-[var(--sepia-text)]">700 ml</option>
              <option value={500} className="bg-[var(--parchment-bg)] text-[var(--sepia-text)]">500 ml</option>
              <option value={1000} className="bg-[var(--parchment-bg)] text-[var(--sepia-text)]">1.000 ml (1L)</option>
              <option value={50} className="bg-[var(--parchment-bg)] text-[var(--sepia-text)]">50 ml (Sample)</option>
              <option value="custom" className="bg-[var(--parchment-bg)] text-[var(--sepia-text)]">
                {language === 'DE' ? 'Eigene Füllmenge…' : 'Custom size…'}
              </option>
            </select>
            {spirit.volumeMl !== undefined && ![50, 500, 700, 1000].includes(spirit.volumeMl) && (
              <input
                id="custom-volume-input"
                type="number"
                min={0}
                max={5000}
                step={10}
                value={spirit.volumeMl ?? ''}
                placeholder="ml"
                onChange={(e) => update('volumeMl', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="w-16 bg-transparent pb-1 text-sm sm:text-base text-[var(--sepia-text)] font-mono font-bold focus:outline-none text-right placeholder:text-[var(--sepia-muted)]/50"
              />
            )}
          </div>
        </div>

        {/* Row 7: Verkostungsdatum & Flaschenpreis */}
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="date-tasted-input">{t('dateTasted')}</FieldLabel>
          <LocalizedDatePicker
            id="date-tasted-input"
            value={spirit.dateTasted}
            onChange={(isoDate) => update('dateTasted', isoDate)}
            language={language}
          />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="price-input">{t('bottlePrice')}</FieldLabel>
          <div className="flex items-center gap-1.5 border-b border-[var(--parchment-border)]">
            <input
              id="price-input"
              type="number"
              min={0}
              max={100000}
              step={0.01}
              value={spirit.price ?? ''}
              placeholder="0.00"
              onChange={(e) => update('price', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-transparent pb-1 text-sm sm:text-base text-[var(--sepia-text)] font-body focus:outline-none placeholder:text-[var(--parchment-border)]"
            />
            <select
              id="currency-select"
              value={spirit.currency ?? '€'}
              onChange={(e) => update('currency', e.target.value as Currency)}
              className="bg-transparent text-sm sm:text-base text-[var(--sepia-light)] font-body font-bold focus:outline-none cursor-pointer border-none pb-1 pr-0.5"
              aria-label="Currency"
            >
              {SUPPORTED_CURRENCIES.map((curr) => (
                <option key={curr} value={curr} className="bg-[var(--parchment-bg)] text-[var(--sepia-text)]">
                  {curr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2-Column Visuals & Characteristics Section (Compact Colour Left | 3 Rows Right) */}
      <div className="border-t border-[var(--parchment-divider)] pt-4 grid grid-cols-1 sm:grid-cols-[155px_1fr] gap-4 sm:gap-6 items-start">
        {/* Left Column: Compact Colour Scale */}
        <div className="flex flex-col items-start gap-1">
          <SectionHeader className="mb-1">{t('colour')}</SectionHeader>
          <div className="mt-1 flex flex-col gap-1 w-full">
            {COLOURS.map(({ value, hex }) => (
              <button
                key={value}
                id={`colour-${value.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => update('colour', value)}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm border transition-all duration-200 text-left w-full cursor-pointer min-h-[32px]',
                  spirit.colour === value
                    ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] font-semibold text-[var(--parchment-bg)] shadow-xs'
                    : 'border-transparent hover:border-[var(--parchment-border)]/40 hover:bg-[var(--sepia-text)]/8 text-[var(--sepia-muted)]',
                )}
                aria-pressed={spirit.colour === value}
              >
                <span
                  className="w-4 h-4 rounded-sm border border-[var(--parchment-border)] flex-shrink-0"
                  style={{ backgroundColor: hex }}
                />
                <span className="text-xs sm:text-sm font-medium font-body whitespace-nowrap">
                  {translateColour(value, language)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Row 1 Characteristics -> Row 2 Glance/Mouthfeel -> Row 3 Tasting Additions */}
        <div className="flex flex-col gap-3.5">
          {/* Row 1: Characteristics (No redundant subheadings, direct buttons) */}
          <div className="flex flex-col gap-1.5">
            <SectionHeader className="mb-0.5">{t('characteristics')}</SectionHeader>
            <div className="flex flex-col gap-1.5">
              <SegmentedSwitch
                id="cask-strength-switch"
                leftLabel={t('drinkingStrength')}
                rightLabel={t('caskStrength')}
                value={spirit.isCaskStrength ?? false}
                onChange={(v) => update('isCaskStrength', v)}
              />
              <SegmentedSwitch
                id="added-colour-switch"
                leftLabel={t('naturalColour')}
                rightLabel={t('addedColour')}
                value={spirit.addedColour ?? false}
                onChange={(v) => update('addedColour', v)}
              />
              <SegmentedSwitch
                id="chill-filtered-switch"
                leftLabel={t('nonChillFiltered')}
                rightLabel={t('chillFiltered')}
                value={spirit.chillFiltered ?? false}
                onChange={(v) => update('chillFiltered', v)}
              />
            </div>
          </div>

          {/* Row 2: Glance / Mouthfeel (2x2 Grid) */}
          <div className="border-t border-[var(--parchment-divider)] pt-3 flex flex-col gap-1">
            <SectionHeader className="mb-0.5">{t('glanceMouthfeel')}</SectionHeader>
            <div className="mt-0.5 grid grid-cols-2 gap-1.5">
              {SPIRIT_GLANCES.map((g) => {
                const currentGlance = Array.isArray(spirit.glance)
                  ? spirit.glance
                  : (spirit.glance ? [spirit.glance] : []);
                const isActive = currentGlance.includes(g);

                const handleToggle = () => {
                  const next = isActive
                    ? currentGlance.filter((x) => x !== g)
                    : [...currentGlance, g];
                  update('glance', next);
                };

                return (
                  <button
                    key={g}
                    id={`glance-${g.toLowerCase()}`}
                    type="button"
                    onClick={handleToggle}
                    className={cn(
                      'px-2 py-1.5 rounded-xs border text-xs sm:text-sm font-body font-semibold transition-all duration-200 text-center cursor-pointer min-h-[32px]',
                      isActive
                        ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
                        : 'border-[var(--parchment-border)]/60 bg-[var(--sepia-text)]/5 text-[var(--sepia-muted)] hover:bg-[var(--sepia-text)]/12 hover:border-[var(--parchment-border)]',
                    )}
                    aria-pressed={isActive}
                  >
                    {translateGlance(g, language)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Tasting Additions (Dedicated section with 3 buttons) */}
          <div className="border-t border-[var(--parchment-divider)] pt-3 flex flex-col gap-1">
            <SectionHeader className="mb-0.5">{t('tastingAdditions')}</SectionHeader>
            <div className="mt-0.5 grid grid-cols-3 gap-1.5">
              <ToggleButton
                id="tasting-addition-water-btn"
                active={spirit.addedWater ?? false}
                onClick={() => update('addedWater', !spirit.addedWater)}
                label={t('addedWaterBtn')}
              />
              <ToggleButton
                id="tasting-addition-rocks-btn"
                active={spirit.onTheRocks ?? false}
                onClick={() => update('onTheRocks', !spirit.onTheRocks)}
                label={t('onTheRocksBtn')}
              />
              <ToggleButton
                id="tasting-addition-chocolate-btn"
                active={spirit.withChocolate ?? false}
                onClick={() => update('withChocolate', !spirit.withChocolate)}
                label={t('withChocolateBtn')}
              />
            </div>
          </div>
        </div>
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
