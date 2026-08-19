'use client';

import React from 'react';
import { Currency, SUPPORTED_CURRENCIES } from '@/types/spirit.types';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { LocalizedDatePicker } from '@/components/ui/LocalizedDatePicker';
import { Language, TranslationKey } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

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
  return (
    <>
      {/* Flaschenvolumen */}
      <div className={cn('flex flex-col gap-1', className)}>
        <FieldLabel htmlFor="volume-select">{t('bottleVolume')}</FieldLabel>
        <div className="flex items-center gap-1.5 border-b border-[var(--parchment-border)]">
          <select
            id="volume-select"
            value={
              volumeMl !== undefined && volumeMl !== null
                ? [50, 500, 700, 1000].includes(volumeMl)
                  ? volumeMl
                  : 'custom'
                : ''
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                onChangeVolume(undefined);
              } else if (val !== 'custom') {
                onChangeVolume(parseInt(val, 10));
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
          {volumeMl !== undefined && ![50, 500, 700, 1000].includes(volumeMl) && (
            <input
              id="custom-volume-input"
              type="number"
              min={0}
              max={5000}
              step={10}
              value={volumeMl ?? ''}
              placeholder="ml"
              onChange={(e) => onChangeVolume(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-16 bg-transparent pb-1 text-sm sm:text-base text-[var(--sepia-text)] font-mono font-bold focus:outline-none text-right placeholder:text-[var(--sepia-muted)]/50"
            />
          )}
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
            className="w-full bg-transparent pb-1 text-sm sm:text-base text-[var(--sepia-text)] font-body focus:outline-none placeholder:text-[var(--parchment-border)]"
          />
          <select
            id="currency-select"
            value={currency ?? '€'}
            onChange={(e) => onChangeCurrency(e.target.value as Currency)}
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
    </>
  );
}
