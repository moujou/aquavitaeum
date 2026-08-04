import { describe, it, expect } from 'vitest';
import {
  isValidAbv,
  deduplicateTags,
  createBlankSpirit,
  formatDateByLanguage,
  parseDateInputToIso,
} from '../spirit-utils';
import { MOCK_SPIRITS } from '@/data/mock-spirits';

describe('Spirit Utilities', () => {
  describe('createBlankSpirit', () => {
    it('initializes a new spirit object with default attributes', () => {
      const blank = createBlankSpirit();
      expect(blank.id).toMatch(/^new-/);
      expect(blank.spiritType).toBe('Single Malt Scotch');
      expect(blank.isCaskStrength).toBe(false);
      expect(blank.addedColour).toBe(false);
      expect(blank.chillFiltered).toBe(false);
      expect(blank.addedWater).toBe(false);
      expect(blank.onTheRocks).toBe(false);
      expect(blank.withChocolate).toBe(false);
      expect(blank.currency).toBe('€');
    });
  });

  describe('isValidAbv', () => {
    it('returns true for valid ABV values between 0 and 100', () => {
      expect(isValidAbv(40.0)).toBe(true);
      expect(isValidAbv(0)).toBe(true);
      expect(isValidAbv(100)).toBe(true);
      expect(isValidAbv(58.2)).toBe(true);
    });

    it('returns false for invalid ABV values', () => {
      expect(isValidAbv(-5)).toBe(false);
      expect(isValidAbv(105)).toBe(false);
      expect(isValidAbv(NaN)).toBe(false);
    });
  });

  describe('deduplicateTags', () => {
    it('trims whitespace and removes duplicate tags', () => {
      const rawTags = [' Peat Smoke ', 'Peat Smoke', 'Vanilla', ' Vanilla '];
      expect(deduplicateTags(rawTags)).toEqual(['Peat Smoke', 'Vanilla']);
    });

    it('filters out empty strings', () => {
      const rawTags = ['Oak', '', '  ', 'Citrus'];
      expect(deduplicateTags(rawTags)).toEqual(['Oak', 'Citrus']);
    });

    it('returns an empty array when given non-array inputs', () => {
      expect(deduplicateTags(null as unknown as string[])).toEqual([]);
      expect(deduplicateTags(undefined as unknown as string[])).toEqual([]);
    });
  });

  describe('formatDateByLanguage', () => {
    it('formats ISO dates correctly according to language setting', () => {
      expect(formatDateByLanguage('2026-08-04', 'DE')).toBe('04.08.2026');
      expect(formatDateByLanguage('2026-08-04', 'EN')).toBe('08/04/2026');
      expect(formatDateByLanguage('2026-01-01', 'DE')).toBe('01.01.2026');
      expect(formatDateByLanguage('2026-12-31', 'EN')).toBe('12/31/2026');
    });

    it('handles empty or malformed date strings gracefully', () => {
      expect(formatDateByLanguage('')).toBe('');
      expect(formatDateByLanguage(undefined)).toBe('');
      expect(formatDateByLanguage('invalid-date')).toBe('invalid-date');
    });
  });

  describe('parseDateInputToIso', () => {
    it('parses German DD.MM.YYYY input strings into ISO YYYY-MM-DD', () => {
      expect(parseDateInputToIso('04.08.2026', 'DE')).toBe('2026-08-04');
      expect(parseDateInputToIso('4.8.2026', 'DE')).toBe('2026-08-04');
    });

    it('parses English MM/DD/YYYY input strings into ISO YYYY-MM-DD', () => {
      expect(parseDateInputToIso('08/04/2026', 'EN')).toBe('2026-08-04');
      expect(parseDateInputToIso('8/4/2026', 'EN')).toBe('2026-08-04');
    });

    it('accepts existing YYYY-MM-DD ISO strings directly', () => {
      expect(parseDateInputToIso('2026-08-04', 'DE')).toBe('2026-08-04');
      expect(parseDateInputToIso('2026-08-04', 'EN')).toBe('2026-08-04');
    });

    it('returns null for invalid date inputs', () => {
      expect(parseDateInputToIso('invalid', 'DE')).toBeNull();
      expect(parseDateInputToIso('99.99.9999', 'DE')).toBeNull();
      expect(parseDateInputToIso('', 'EN')).toBeNull();
    });
  });

  describe('Integration with MOCK_SPIRITS dataset', () => {
    it('validates that all mock spirits have valid ABVs', () => {
      MOCK_SPIRITS.forEach((spirit) => {
        expect(isValidAbv(spirit.abv)).toBe(true);
      });
    });

    it('validates that all mock spirits have non-empty, deduplicated flavor tags', () => {
      MOCK_SPIRITS.forEach((spirit) => {
        const cleaned = deduplicateTags(spirit.flavorTags);
        expect(cleaned.length).toBeGreaterThan(0);
        expect(cleaned).toEqual(spirit.flavorTags);
      });
    });

    it('validates that all mock spirits have finish duration and finish notes properties', () => {
      MOCK_SPIRITS.forEach((spirit) => {
        expect(['Short', 'Medium', 'Long']).toContain(spirit.finish);
        expect(typeof spirit.finishNotes).toBe('string');
        expect(spirit.finishNotes.length).toBeGreaterThan(0);
      });
    });
  });
});
