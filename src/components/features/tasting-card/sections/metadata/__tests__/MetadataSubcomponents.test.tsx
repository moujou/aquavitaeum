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

    it('allows adding a custom mouthfeel via plus button and enter key', () => {
      const changeFn = vi.fn();
      render(
        <MouthfeelGlanceSelector
          glance={['Oily']}
          onChange={changeFn}
          language="EN"
          t={mockT}
        />
      );

      const addBtn = screen.getByRole('button', { name: /addCustomMouthfeel/i });
      fireEvent.click(addBtn);

      const input = screen.getByPlaceholderText('customMouthfeelPlaceholder');
      fireEvent.change(input, { target: { value: 'Velvety Smooth' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(changeFn).toHaveBeenCalledWith(['Oily', 'Velvety Smooth']);
    });

    it('cancels custom mouthfeel input on Escape key', () => {
      render(
        <MouthfeelGlanceSelector
          glance={['Oily']}
          onChange={vi.fn()}
          language="EN"
          t={mockT}
        />
      );

      const addBtn = screen.getByRole('button', { name: /addCustomMouthfeel/i });
      fireEvent.click(addBtn);

      const input = screen.getByPlaceholderText('customMouthfeelPlaceholder');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(screen.queryByPlaceholderText('customMouthfeelPlaceholder')).toBeNull();
    });
  });

  describe('ProductionCharacteristicsSelector', () => {
    it('renders characteristics and triggers boolean sync for multiple attributes', () => {
      const changeFn = vi.fn();
      const syncFn = vi.fn();

      render(
        <ProductionCharacteristicsSelector
          characteristics={['Cask Strength', 'Natural Colour']}
          onChangeCharacteristics={changeFn}
          onSyncBooleans={syncFn}
          language="EN"
          t={mockT}
        />
      );

      const caskBtn = screen.getByRole('button', { name: /Cask Strength/i });
      expect(caskBtn.getAttribute('aria-pressed')).toBe('true');
      fireEvent.click(caskBtn);
      expect(changeFn).toHaveBeenCalledWith(['Natural Colour']);
      expect(syncFn).toHaveBeenCalledWith('isCaskStrength', false);

      const natColourBtn = screen.getByRole('button', { name: /Natural Colour/i });
      fireEvent.click(natColourBtn);
      expect(syncFn).toHaveBeenCalledWith('addedColour', true);
    });
  });

  describe('TastingAdditionsSelector', () => {
    it('renders additions and handles custom addition creation via check button and enter key', () => {
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

      const addBtn = screen.getByRole('button', { name: /addCustomAddition/i });
      fireEvent.click(addBtn);

      const input = screen.getByPlaceholderText('customAdditionPlaceholder');
      fireEvent.change(input, { target: { value: '3 Drops Spring Water' } });

      const checkBtn = screen.getByRole('button', { name: '✓' });
      fireEvent.click(checkBtn);

      expect(changeFn).toHaveBeenCalledWith(['Water', '3 Drops Spring Water']);
    });

    it('cancels custom addition input on cancel button click', () => {
      render(
        <TastingAdditionsSelector
          tastingAdditions={['Water']}
          onChangeAdditions={vi.fn()}
          language="EN"
          t={mockT}
        />
      );

      const addBtn = screen.getByRole('button', { name: /addCustomAddition/i });
      fireEvent.click(addBtn);

      const cancelBtn = screen.getByRole('button', { name: '✕' });
      fireEvent.click(cancelBtn);

      expect(screen.queryByPlaceholderText('customAdditionPlaceholder')).toBeNull();
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

      // Volume dropdown change
      const volumeSelect = screen.getByLabelText(/bottleVolume/i);
      fireEvent.change(volumeSelect, { target: { value: '500' } });
      expect(changeVolFn).toHaveBeenCalledWith(500);

      // Currency dropdown change
      const currencySelect = screen.getByLabelText('Currency');
      fireEvent.change(currencySelect, { target: { value: '$' } });
      expect(changeCurrFn).toHaveBeenCalledWith('$');

      // Price input change
      const priceInput = screen.getByDisplayValue('49.99');
      fireEvent.change(priceInput, { target: { value: '59.99' } });
      expect(changePriceFn).toHaveBeenCalledWith(59.99);

      // Empty price input
      fireEvent.change(priceInput, { target: { value: '' } });
      expect(changePriceFn).toHaveBeenCalledWith(undefined);
    });

    it('handles custom volume input field when custom option is selected', () => {
      const changeVolFn = vi.fn();
      render(
        <LanguageProvider>
          <PricingVolumeRow
            volumeMl={350} // Non-standard volume
            price={35.00}
            currency="€"
            onChangeVolume={changeVolFn}
            onChangePrice={vi.fn()}
            onChangeCurrency={vi.fn()}
            onChangeDateTasted={vi.fn()}
            language="EN"
            t={mockT}
          />
        </LanguageProvider>
      );

      const customInput = screen.getByPlaceholderText('ml');
      expect(customInput).toBeDefined();
      expect((customInput as HTMLInputElement).value).toBe('350');

      fireEvent.change(customInput, { target: { value: '375' } });
      expect(changeVolFn).toHaveBeenCalledWith(375);
    });
  });
});
