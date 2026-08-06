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
import { ToggleButton } from '@/components/ui/ToggleButton';
import { LocalizedDatePicker } from '@/components/ui/LocalizedDatePicker';
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
        'w-full bg-transparent border-b border-[#C4A87A] pb-1 text-sm sm:text-base text-[#1A120B]',
        'placeholder:text-[#c4a87a] font-body focus:outline-none focus:border-[#5c3d22]',
        'transition-colors duration-200',
        className,
      )}
    />
  );
}

interface TastingMetadataFormProps {
  spirit: Spirit;
  update: <K extends keyof Spirit>(key: K, value: Spirit[K]) => void;
  language: Language;
  t: (key: TranslationKey) => string;
}

export function TastingMetadataForm({
  spirit,
  update,
  language,
  t,
}: TastingMetadataFormProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Spirit Type */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="spirit-type-select">{t('spiritType')}</FieldLabel>
        <select
          id="spirit-type-select"
          value={spirit.spiritType}
          onChange={(e) => update('spiritType', e.target.value as SpiritType)}
          className="w-full bg-transparent border-b border-[#C4A87A] pb-1 text-sm sm:text-base text-[#1A120B] font-body focus:outline-none focus:border-[#5c3d22] cursor-pointer"
        >
          {SPIRIT_TYPES.map((tVal) => (
            <option key={tVal} value={tVal} className="bg-[#F5EEDC] text-[#1A120B]">
              {tVal}
            </option>
          ))}
        </select>
      </div>

      {/* 2-Column Metadata Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {/* Distillery (Full Width) */}
        <div className="col-span-2 flex flex-col gap-1">
          <FieldLabel htmlFor="distillery-input">{t('distilleryProducer')}</FieldLabel>
          <TextInput
            id="distillery-input"
            value={spirit.distillery}
            onChange={(v) => update('distillery', v)}
            placeholder="e.g. Laphroaig"
          />
        </div>

        {/* Name (Full Width) */}
        <div className="col-span-2 flex flex-col gap-1">
          <FieldLabel htmlFor="name-input">{t('spiritName')}</FieldLabel>
          <TextInput
            id="name-input"
            value={spirit.name}
            onChange={(v) => update('name', v)}
            placeholder="e.g. 10 Year Old"
          />
        </div>

        {/* Region & Cask / Batch No */}
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
          <FieldLabel htmlFor="cask-input">{t('caskBatchNo')}</FieldLabel>
          <TextInput
            id="cask-input"
            value={spirit.caskNo ?? ''}
            onChange={(v) => update('caskNo', v)}
            placeholder="Optional"
          />
        </div>

        {/* Age & Date Tasted */}
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
            className="w-full bg-transparent border-b border-[#C4A87A] pb-1 text-sm sm:text-base text-[#1A120B] font-body focus:outline-none focus:border-[#5c3d22] placeholder:text-[#c4a87a]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="date-tasted-input">{t('dateTasted')}</FieldLabel>
          <LocalizedDatePicker
            id="date-tasted-input"
            value={spirit.dateTasted}
            onChange={(isoDate) => update('dateTasted', isoDate)}
            language={language}
          />
        </div>

        {/* ABV % & Bottle Price + Currency */}
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="abv-input">{t('abvPercent')}</FieldLabel>
          <input
            id="abv-input"
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={spirit.abv}
            onChange={(e) => update('abv', Number(e.target.value))}
            className="w-full bg-transparent border-b border-[#C4A87A] pb-1 text-sm sm:text-base text-[#1A120B] font-body focus:outline-none focus:border-[#5c3d22]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="price-input">{t('bottlePrice')}</FieldLabel>
          <div className="flex items-center gap-1.5 border-b border-[#C4A87A]">
            <input
              id="price-input"
              type="number"
              min={0}
              max={100000}
              step={0.01}
              value={spirit.price ?? ''}
              placeholder="0.00"
              onChange={(e) => update('price', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-transparent pb-1 text-sm sm:text-base text-[#1A120B] font-body focus:outline-none placeholder:text-[#c4a87a]"
            />
            <select
              id="currency-select"
              value={spirit.currency ?? '€'}
              onChange={(e) => update('currency', e.target.value as Currency)}
              className="bg-transparent text-sm sm:text-base text-[#755030] font-body font-bold focus:outline-none cursor-pointer border-none pb-1 pr-0.5"
              aria-label="Currency"
            >
              {SUPPORTED_CURRENCIES.map((curr) => (
                <option key={curr} value={curr} className="bg-[#F5EEDC] text-[#1A120B]">
                  {curr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Finish free text input (Full Width) */}
        <div className="col-span-2 flex flex-col gap-1 mt-1">
          <FieldLabel htmlFor="finish-notes-input">{t('finishType')}</FieldLabel>
          <TextInput
            id="finish-notes-input"
            value={spirit.finishNotes ?? ''}
            onChange={(v) => update('finishNotes', v)}
            placeholder="e.g. Oloroso Sherry Cask Finish, Pedro Ximénez Cask Finish, Port Cask Finish"
          />
        </div>

        {/* Production Spec Toggle Buttons */}
        <div className="col-span-2 grid grid-cols-3 gap-2 mt-1.5 pt-1">
          <ToggleButton
            id="cask-strength-btn"
            active={spirit.isCaskStrength ?? false}
            onClick={() => update('isCaskStrength', !spirit.isCaskStrength)}
            label={t('caskStrength')}
          />
          <ToggleButton
            id="added-colour-btn"
            active={spirit.addedColour ?? false}
            onClick={() => update('addedColour', !spirit.addedColour)}
            label={t('addedColour')}
          />
          <ToggleButton
            id="chill-filtered-btn"
            active={spirit.chillFiltered ?? true}
            onClick={() => update('chillFiltered', !spirit.chillFiltered)}
            label={t('chillFiltered')}
          />
        </div>
      </div>

      {/* Colour, Glance & Tasting Additions 2-Column Section */}
      <div className="border-t border-[#D4C3A3] pt-4 flex gap-4">
        {/* Left Sub-Column: Vertical colour scale */}
        <div className="flex flex-col items-start gap-1 flex-1">
          <FieldLabel>{t('colour')}</FieldLabel>
          <div className="mt-1 flex flex-col gap-1 w-full">
            {COLOURS.map(({ value, hex }) => (
              <button
                key={value}
                id={`colour-${value.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => update('colour', value)}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1 rounded-sm transition-all duration-200 text-left w-full cursor-pointer',
                  spirit.colour === value
                    ? 'bg-[#3D2616] ring-1 ring-[#C59B27] font-semibold text-[#F5EEDC]'
                    : 'hover:bg-[#1A120B]/10 text-[#5c3d22]',
                )}
                aria-pressed={spirit.colour === value}
              >
                <span
                  className="w-4.5 h-4.5 rounded-sm border border-[#C4A87A] flex-shrink-0"
                  style={{ backgroundColor: hex }}
                />
                <span className="text-xs sm:text-sm font-medium font-body whitespace-nowrap">
                  {translateColour(value, language)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Sub-Column: Glance / Mouthfeel + Tasting Additions */}
        <div className="flex flex-col flex-1 gap-4">
          <div className="flex flex-col gap-1">
            <FieldLabel>{t('glanceMouthfeel')}</FieldLabel>
            <div className="mt-1 grid grid-cols-1 gap-1">
              {SPIRIT_GLANCES.map((g) => (
                <button
                  key={g}
                  id={`glance-${g.toLowerCase()}`}
                  type="button"
                  onClick={() => update('glance', g)}
                  className={cn(
                    'px-3 py-1.5 rounded-sm border text-xs sm:text-sm font-body font-medium transition-all duration-200 text-center cursor-pointer',
                    spirit.glance === g
                      ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] font-semibold shadow-xs'
                      : 'border-[#C4A87A] text-[#5c3d22] hover:bg-[#1A120B]/10',
                  )}
                  aria-pressed={spirit.glance === g}
                >
                  {translateGlance(g, language)}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#D4C3A3] pt-3 flex flex-col gap-1.5">
            <FieldLabel>{t('tastingAdditions')}</FieldLabel>
            <div className="grid grid-cols-1 gap-1 mt-0.5">
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
    </div>
  );
}
