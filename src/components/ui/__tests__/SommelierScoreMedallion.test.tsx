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
    it('correctly maps each of the 10 decades', () => {
      expect(getScoreTierConfig(5).badgeDe).toBe('HOLZ');
      expect(getScoreTierConfig(15).badgeDe).toBe('ROST');
      expect(getScoreTierConfig(25).badgeDe).toBe('EISEN');
      expect(getScoreTierConfig(35).badgeDe).toBe('KUPFER');
      expect(getScoreTierConfig(45).badgeDe).toBe('BRONZE');
      expect(getScoreTierConfig(55).badgeDe).toBe('SILBER');
      expect(getScoreTierConfig(65).badgeDe).toBe('GOLD');
      expect(getScoreTierConfig(75).badgeDe).toBe('SMARAGD');
      expect(getScoreTierConfig(85).badgeDe).toBe('PLATIN');
      expect(getScoreTierConfig(95).badgeDe).toBe('DIAMANT');
      expect(getScoreTierConfig(100).badgeDe).toBe('DIAMANT');
    });

    it('safely handles boundary and invalid inputs', () => {
      // 0 or negative defaults to lowest tier (Wood)
      expect(getScoreTierConfig(0).badgeDe).toBe('HOLZ');
      expect(getScoreTierConfig(-10).badgeDe).toBe('HOLZ');
      // NaN or undefined defaults safely
      expect(getScoreTierConfig(NaN).badgeDe).toBe('HOLZ');
      // Above 100 clamps to Diamond
      expect(getScoreTierConfig(150).badgeDe).toBe('DIAMANT');
    });

    it('has exactly 10 comprehensive tiers without gaps or overlaps', () => {
      expect(SCORE_TIERS_CONFIG.length).toBe(10);
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
      expect(screen.getByText(/DIAMANT|DIAMOND/i)).toBeDefined();
      expect(screen.getByText(/TOP TIER/i)).toBeDefined();
    });
  });
});
