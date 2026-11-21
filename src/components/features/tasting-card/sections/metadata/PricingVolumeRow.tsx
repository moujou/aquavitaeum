'use client';

import React, { useState } from 'react';
import { Currency, SUPPORTED_CURRENCIES } from '@/types/spirit.types';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { LocalizedDatePicker } from '@/components/ui/LocalizedDatePicker';
import { Language, TranslationKey } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

export type VolumeUnit = 'ml' | 'cl' | 'l' | 'fl oz';
export const SUPPORTED_VOLUME_UNITS: VolumeUnit[] = ['ml', 'cl', 'l', 'fl oz'];

export function convertMlToUnit(ml: number, unit: VolumeUnit): number {
  switch (unit) {
    case 'cl':
      return Math.round((ml / 10) * 100) / 100;
    case 'l':
      return Math.round((ml / 1000) * 1000) / 1000;
    case 'fl oz':
      return Math.round((ml / 29.5735) * 10) / 10;
    case 'ml':
    default:
      return ml;
  }
}

export function convertUnitToMl(val: number, unit: VolumeUnit): number {
  switch (unit) {
    case 'cl':
      return Math.round(val * 10);
    case 'l':
      return Math.round(val * 1000);
    case 'fl oz': {
      const calculated = val * 29.5735;
      if (Math.abs(calculated - 750) < 2) return 750;
      if (Math.abs(calculated - 50) < 1) return 50;
      return Math.round(calculated);
    }
    case 'ml':
    default:
      return Math.round(val);
  }
}

interface PricingVolumeRowProps {
  volumeMl?: number;
  price?: number;
  currency?: Currency;
  dateTasted?: string;
  onChangeVolume: (val?: number) => void;
  onChangePrice: (val?: number) => void;
  onChangeCurrency: (val: Currency) => void;
  onChangeDateTasted: (isoDate?: string) => void;
  language: Language;
  t: (key: TranslationKey) => string;
  className?: string;
}

export function PricingVolumeRow({
  volumeMl,
  price,
  currency = '€',
  dateTasted,
  onChangeVolume,
  onChangePrice,
  onChangeCurrency,
  onChangeDateTasted,
  language,
  t,
  className,
}: PricingVolumeRowProps) {
  const [unit, setUnit] = useState<VolumeUnit>('ml');
  const [localVolumeText, setLocalVolumeText] = useState<string>(() =>
    volumeMl !== undefined && volumeMl !== null ? String(convertMlToUnit(volumeMl, 'ml')) : ''
  );
  const [lastVolumeProp, setLastVolumeProp] = useState<number | undefined>(volumeMl);

  // Synchronize when volumeMl prop changes externally (e.g. initial load, AI scan, reset)
  if (volumeMl !== lastVolumeProp) {
    setLastVolumeProp(volumeMl);
    setLocalVolumeText(
      volumeMl !== undefined && volumeMl !== null ? String(convertMlToUnit(volumeMl, unit)) : ''
    );
  }

  const handleUnitChange = (newUnit: VolumeUnit) => {
    setUnit(newUnit);
    if (volumeMl !== undefined && volumeMl !== null) {
      setLocalVolumeText(String(convertMlToUnit(volumeMl, newUnit)));
    }
  };

  const handleVolumeTextChange = (text: string) => {
    setLocalVolumeText(text);
    if (text.trim() === '') {
      onChangeVolume(undefined);
      return;
    }
    const parsed = parseFloat(text.replace(',', '.'));
    if (!isNaN(parsed) && parsed >= 0) {
      const ml = convertUnitToMl(parsed, unit);
      onChangeVolume(ml);
    }
  };

  return (
    <>
      {/* Flaschenvolumen */}
      <div className={cn('flex flex-col gap-1', className)}>
        <FieldLabel htmlFor="volume-input">{t('bottleVolume')}</FieldLabel>
        <div className="flex items-center gap-1.5 border-b border-[var(--parchment-border)]">
          <input
            id="volume-input"
            type="number"
            min={0}
            max={unit === 'l' ? 10 : unit === 'cl' ? 1000 : unit === 'fl oz' ? 300 : 10000}
            step={unit === 'l' ? 0.05 : unit === 'fl oz' ? 0.1 : 1}
            value={localVolumeText}
            placeholder={unit === 'l' ? '0.7' : unit === 'cl' ? '70' : unit === 'fl oz' ? '25.4' : '700'}
            onChange={(e) => handleVolumeTextChange(e.target.value)}
            className="w-full bg-transparent pb-1 text-sm sm:text-base text-[var(--sepia-text)] font-body font-normal focus:outline-none placeholder:text-[var(--placeholder-text)] placeholder:italic placeholder:font-light"
          />
          <select
            id="volume-unit-select"
            value={unit}
            onChange={(e) => handleUnitChange(e.target.value as VolumeUnit)}
            className="bg-transparent text-sm sm:text-base text-[var(--sepia-light)] font-body font-medium focus:outline-none cursor-pointer border-none pb-1 pr-0.5"
            aria-label="Volume unit"
          >
            {SUPPORTED_VOLUME_UNITS.map((u) => (
              <option key={u} value={u} className="bg-[var(--parchment-bg)] text-[var(--sepia-text)]">
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Flaschenpreis & Währung */}
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="price-input">{t('bottlePrice')}</FieldLabel>
        <div className="flex items-center gap-1.5 border-b border-[var(--parchment-border)]">
          <input
            id="price-input"
            type="number"
            min={0}
            max={100000}
            step={0.01}
            value={price ?? ''}
            placeholder="0.00"
            onChange={(e) => onChangePrice(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-transparent pb-1 text-sm sm:text-base text-[var(--sepia-text)] font-body font-normal focus:outline-none placeholder:text-[var(--placeholder-text)] placeholder:italic placeholder:font-light"
          />
          <select
            id="currency-select"
            value={currency ?? '€'}
            onChange={(e) => onChangeCurrency(e.target.value as Currency)}
            className="bg-transparent text-sm sm:text-base text-[var(--sepia-light)] font-body font-medium focus:outline-none cursor-pointer border-none pb-1 pr-0.5"
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

      {/* Verkostungsdatum */}
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="date-tasted-input">{t('dateTasted')}</FieldLabel>
        <LocalizedDatePicker
          id="date-tasted-input"
          value={dateTasted ?? ''}
          onChange={onChangeDateTasted}
          language={language}
        />
      </div>
    </>
  );
}
