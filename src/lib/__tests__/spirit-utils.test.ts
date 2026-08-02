import { describe, it, expect } from 'vitest';
import {
  isValidAbv,
  calculateRatingCategory,
  deduplicateTags,
  createBlankSpirit,
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
      expect(blank.chillFiltered).toBe(true);
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

  describe('calculateRatingCategory', () => {
    it('correctly categorizes 1-100 scores', () => {
      expect(calculateRatingCategory(95)).toBe('Exceptional');
      expect(calculateRatingCategory(90)).toBe('Exceptional');
      expect(calculateRatingCategory(85)).toBe('Great');
      expect(calculateRatingCategory(80)).toBe('Great');
      expect(calculateRatingCategory(75)).toBe('Good');
      expect(calculateRatingCategory(60)).toBe('Average');
      expect(calculateRatingCategory(45)).toBe('Below Average');
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

    it('validates that all mock spirits produce valid rating categories', () => {
      MOCK_SPIRITS.forEach((spirit) => {
        const category = calculateRatingCategory(spirit.rating100);
        expect(['Exceptional', 'Great', 'Good', 'Average', 'Below Average']).toContain(category);
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
