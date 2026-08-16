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
      const updateFn = vi.fn();
      const deleteFn = vi.fn();
      const mockT = (key: string) => key;

      render(
        <TastingHeaderSection
          spirit={sampleSpirit}
          displayName="Laphroaig 10"
          subtitleLocation="Islay, Scotland"
          update={updateFn}
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
      const setModeFn = vi.fn();
      const mockT = (key: string) => key;

      render(
        <LanguageProvider>
          <TastingFinishSection
            spirit={sampleSpirit}
            finishViewMode="simple"
            setFinishViewMode={setModeFn}
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
    it('renders clean Rating score badge, stars and slider without redundant buttons', () => {
      const updateFn = vi.fn();
      const mockT = (key: string) => key;

      render(
        <TastingRatingSection
          spirit={sampleSpirit}
          stars={4.5}
          update={updateFn}
          t={mockT}
        />,
      );

      expect(screen.getByText('92')).toBeDefined();
      expect(screen.queryByText('Score')).toBeNull(); // Redundant sub-header removed
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
