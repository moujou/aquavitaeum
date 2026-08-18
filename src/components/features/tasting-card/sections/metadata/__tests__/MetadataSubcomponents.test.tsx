import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MouthfeelGlanceSelector } from '../MouthfeelGlanceSelector';
import { ProductionCharacteristicsSelector } from '../ProductionCharacteristicsSelector';
import { TastingAdditionsSelector } from '../TastingAdditionsSelector';
import { PricingVolumeRow } from '../PricingVolumeRow';
import { LanguageProvider } from '@/context/LanguageContext';

describe('Metadata Subcomponents', () => {
  const mockT = (k: string) => k;

  describe('MouthfeelGlanceSelector', () => {
    it('renders glance chips and toggles item', () => {
      const changeFn = vi.fn();
      render(
        <MouthfeelGlanceSelector
          glance={['Oily']}
          onChange={changeFn}
          language="EN"
          t={mockT}
        />
      );

      const oilyBtn = screen.getByRole('button', { name: /Oily/i });
      expect(oilyBtn.getAttribute('aria-pressed')).toBe('true');
      fireEvent.click(oilyBtn);
      expect(changeFn).toHaveBeenCalledWith([]);
    });
  });

  describe('ProductionCharacteristicsSelector', () => {
    it('renders characteristics and triggers boolean sync', () => {
      const changeFn = vi.fn();
      const syncFn = vi.fn();

      render(
        <ProductionCharacteristicsSelector
          characteristics={['Cask Strength']}
          onChangeCharacteristics={changeFn}
          onSyncBooleans={syncFn}
          language="EN"
          t={mockT}
        />
      );

      const caskBtn = screen.getByRole('button', { name: /Cask Strength/i });
      expect(caskBtn.getAttribute('aria-pressed')).toBe('true');
      fireEvent.click(caskBtn);
      expect(changeFn).toHaveBeenCalledWith([]);
      expect(syncFn).toHaveBeenCalledWith('isCaskStrength', false);
    });
  });

  describe('TastingAdditionsSelector', () => {
    it('renders additions and handles custom addition creation', () => {
      const changeFn = vi.fn();
      render(
        <TastingAdditionsSelector
          tastingAdditions={['Water']}
          onChangeAdditions={changeFn}
          language="EN"
          t={mockT}
        />
      );

      const waterBtn = screen.getByRole('button', { name: /^Water$/i });
      expect(waterBtn.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('PricingVolumeRow', () => {
    it('renders bottle size, price, and currency selector', () => {
      const changeVolFn = vi.fn();
      const changePriceFn = vi.fn();
      const changeCurrFn = vi.fn();
      const changeDateFn = vi.fn();

      render(
        <LanguageProvider>
          <PricingVolumeRow
            volumeMl={700}
            price={49.99}
            currency="€"
            dateTasted="2026-08-18"
            onChangeVolume={changeVolFn}
            onChangePrice={changePriceFn}
            onChangeCurrency={changeCurrFn}
            onChangeDateTasted={changeDateFn}
            language="EN"
            t={mockT}
          />
        </LanguageProvider>
      );

      const priceInput = screen.getByDisplayValue('49.99');
      expect(priceInput).toBeDefined();

      fireEvent.change(priceInput, { target: { value: '59.99' } });
      expect(changePriceFn).toHaveBeenCalledWith(59.99);
    });
  });
});
