import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  SommelierScoreMedallion,
  getScoreTierConfig,
  SCORE_TIERS_CONFIG,
} from '../SommelierScoreMedallion';
import { LanguageProvider } from '@/context/LanguageContext';

describe('SommelierScoreMedallion Component & Tiers', () => {
  describe('getScoreTierConfig Helper', () => {
    it('correctly maps each of the 5 sommelier quality bands', () => {
      expect(getScoreTierConfig(50).badgeDe).toBe('EINFACH');
      expect(getScoreTierConfig(75).badgeDe).toBe('GUT');
      expect(getScoreTierConfig(82).badgeDe).toBe('SEHR GUT');
      expect(getScoreTierConfig(88).badgeDe).toBe('AUSGEZEICHNET');
      expect(getScoreTierConfig(95).badgeDe).toBe('MEISTERWERK');
      expect(getScoreTierConfig(100).badgeDe).toBe('MEISTERWERK');
    });

    it('safely handles boundary and invalid inputs', () => {
      // 0 or negative defaults to lowest tier (Casual/Developing)
      expect(getScoreTierConfig(0).badgeDe).toBe('EINFACH');
      expect(getScoreTierConfig(-10).badgeDe).toBe('EINFACH');
      // NaN or undefined defaults safely
      expect(getScoreTierConfig(NaN).badgeDe).toBe('EINFACH');
      // Above 100 clamps to Masterpiece
      expect(getScoreTierConfig(150).badgeDe).toBe('MEISTERWERK');
    });

    it('has exactly 5 comprehensive sommelier tiers without gaps or overlaps', () => {
      expect(SCORE_TIERS_CONFIG.length).toBe(5);
      for (let i = 1; i <= 100; i++) {
        const config = getScoreTierConfig(i);
        expect(config).toBeDefined();
        expect(config.min).toBeLessThanOrEqual(i);
        expect(config.max).toBeGreaterThanOrEqual(i);
      }
    });
  });

  describe('Rendering Medallion Sizes', () => {
    it('renders size="sm" for grid cards', () => {
      render(
        <LanguageProvider>
          <SommelierScoreMedallion score={92} size="sm" />
        </LanguageProvider>
      );
      expect(screen.getByText('92')).toBeDefined();
    });

    it('renders size="md" for list rows', () => {
      render(
        <LanguageProvider>
          <SommelierScoreMedallion score={88} size="md" />
        </LanguageProvider>
      );
      expect(screen.getByText('88')).toBeDefined();
    });

    it('renders size="lg" hero medallion for tasting cards', () => {
      render(
        <LanguageProvider>
          <SommelierScoreMedallion score={95} size="lg" />
        </LanguageProvider>
      );
      expect(screen.getByText('95')).toBeDefined();
      expect(screen.getByText(/MEISTERWERK|MASTERPIECE/i)).toBeDefined();
      expect(screen.getByText(/FINE SPIRITS JOURNAL/i)).toBeDefined();
    });
  });
});
