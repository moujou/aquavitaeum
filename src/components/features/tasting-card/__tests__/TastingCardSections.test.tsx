import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import { LanguageProvider } from '@/context/LanguageContext';
import { TastingHeaderSection } from '../sections/TastingHeaderSection';
import { TastingMetadataSection } from '../sections/TastingMetadataSection';
import { TastingFlavorSection } from '../sections/TastingFlavorSection';
import { TastingFinishSection } from '../sections/TastingFinishSection';
import { TastingRatingSection } from '../sections/TastingRatingSection';
import { TastingCard } from '../TastingCard';

describe('Modular OO Tasting Card Sections', () => {
  const sampleSpirit = MOCK_SPIRITS[0];

  describe('TastingHeaderSection', () => {
    it('renders distillery badge, title, subtitle and spirit type with gear actions menu', () => {
      const deleteFn = vi.fn();
      const mockT = (key: string) => key;

      render(
        <TastingHeaderSection
          spirit={sampleSpirit}
          displayName="Laphroaig 10"
          subtitleLocation="Islay, Scotland"
          onDelete={deleteFn}
          t={mockT}
        />
      );

      expect(screen.getByText('Single Malt Scotch')).toBeDefined();
      expect(screen.getByText('Laphroaig 10')).toBeDefined();
      expect(screen.getByText('Islay, Scotland')).toBeDefined();

      // Check gear menu button
      const gearBtn = screen.getByRole('button', { name: /card actions|karten-aktionen/i });
      expect(gearBtn).toBeDefined();
    });
  });

  describe('TastingMetadataSection', () => {
    it('renders 2-column production metadata, age, abv, price and color scale', () => {
      const updateFn = vi.fn();
      const mockT = (key: string) => key;

      render(
        <LanguageProvider>
          <TastingMetadataSection
            spirit={sampleSpirit}
            update={updateFn}
            language="EN"
            t={mockT}
          />
        </LanguageProvider>
      );

      const distilleryInput = screen.getByDisplayValue('Laphroaig');
      expect(distilleryInput).toBeDefined();

      fireEvent.change(distilleryInput, { target: { value: 'Ardbeg' } });
      expect(updateFn).toHaveBeenCalledWith('distillery', 'Ardbeg');

      const distDateInput = screen.getByLabelText(/distillationDate/i);
      expect(distDateInput).toBeDefined();
      fireEvent.change(distDateInput, { target: { value: '1998' } });
      expect(updateFn).toHaveBeenCalledWith('distillationDate', '1998');

      const botDateInput = screen.getByLabelText(/bottlingDate/i);
      expect(botDateInput).toBeDefined();
      fireEvent.change(botDateInput, { target: { value: '2023' } });
      expect(updateFn).toHaveBeenCalledWith('bottlingDate', '2023');

      // Check Liquid Colour Slider
      const colourSlider = screen.getByRole('slider', { name: /spirit colour/i });
      expect(colourSlider).toBeDefined();
      fireEvent.keyDown(colourSlider, { key: 'ArrowRight' });
      expect(updateFn).toHaveBeenCalled();

      // Check Characteristics Sommelier Badge Chips
      const caskStrengthChip = screen.getByRole('button', { name: /char_Cask_Strength|Cask Strength/i });
      expect(caskStrengthChip).toBeDefined();
      fireEvent.click(caskStrengthChip);
      expect(updateFn).toHaveBeenCalledWith('characteristics', expect.any(Array));

      // Check Tasting Addition chip
      const waterChip = screen.getByRole('button', { name: /^Water$/i });
      expect(waterChip).toBeDefined();
      fireEvent.click(waterChip);
      expect(updateFn).toHaveBeenCalledWith('tastingAdditions', expect.any(Array));
    });
  });

  describe('TastingFlavorSection', () => {
    it('renders radar graph, nose and taste intensity sliders', () => {
      const updateFn = vi.fn();
      const mockT = (key: string) => key;

      render(
        <LanguageProvider>
          <TastingFlavorSection
            spirit={sampleSpirit}
            update={updateFn}
            t={mockT}
          />
        </LanguageProvider>
      );

      expect(screen.getByText('noseTasteRadar')).toBeDefined();
    });
  });

  describe('TastingFinishSection', () => {
    it('renders finish diagram and finish notes input', () => {
      const updateFn = vi.fn();
      const mockT = (key: string) => key;

      render(
        <LanguageProvider>
          <TastingFinishSection
            spirit={sampleSpirit}
            update={updateFn}
            t={mockT}
          />
        </LanguageProvider>
      );

      expect(screen.getByText('finishNotes')).toBeDefined();
      const finishTextarea = screen.getByDisplayValue('Ex-Bourbon & Quarter Cask Finish');
      expect(finishTextarea).toBeDefined();

      fireEvent.change(finishTextarea, { target: { value: 'New Sherry Finish' } });
      expect(updateFn).toHaveBeenCalledWith('finishNotes', 'New Sherry Finish');
    });
  });

  describe('TastingRatingSection', () => {
    it('renders clean Rating score medallion, stars, timeline milestones and bar verdict chips', () => {
      const updateFn = vi.fn();
      const mockT = (key: string) => key;

      render(
        <LanguageProvider>
          <TastingRatingSection
            spirit={sampleSpirit}
            stars={4.5}
            update={updateFn}
            t={mockT}
          />
        </LanguageProvider>,
      );

      expect(screen.getAllByText('92').length).toBeGreaterThan(0);
      expect(screen.getByText(/Daily Sipper/i)).toBeDefined();
      expect(screen.getByText(/Showcase Bottle|Vitrinen-Highlight/i)).toBeDefined();

      // Test toggling a bar verdict chip
      const dailySipperBtn = screen.getByRole('button', { name: /Daily Sipper/i });
      fireEvent.click(dailySipperBtn);
      expect(updateFn).toHaveBeenCalledWith('barRole', expect.any(Array));

      // Test clicking score milestone
      const milestone80Btn = screen.getByRole('button', { name: /Score 80|80/i });
      fireEvent.click(milestone80Btn);
      expect(updateFn).toHaveBeenCalledWith('rating100', 80);
    });
  });

  describe('Master Composite TastingCard Component', () => {
    it('composes all 5 sections cleanly inside TastingCard container', () => {
      const saveFn = vi.fn();
      const deleteFn = vi.fn();

      const { container } = render(
        <LanguageProvider>
          <TastingCard
            initialSpirit={sampleSpirit}
            onSave={saveFn}
            onDelete={deleteFn}
          />
        </LanguageProvider>
      );

      expect(screen.getAllByText(/Laphroaig/i).length).toBeGreaterThan(0);
      expect(screen.getByText('92')).toBeDefined();

      // Verify design animation class matches new snappy fade-in specification
      const cardElement = container.querySelector('.parchment');
      expect(cardElement).toBeDefined();
      expect(cardElement?.className).toContain('animate-fade-in');
      expect(cardElement?.className).not.toContain('animate-fade-in-up');
    });
  });
});
