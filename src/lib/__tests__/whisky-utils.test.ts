import { describe, it, expect } from 'vitest';
import {
  isValidAbv,
  calculateRatingCategory,
  deduplicateTags,
} from '../whisky-utils';
import { MOCK_WHISKIES } from '@/data/mock-whiskies';

describe('Whisky Utilities', () => {
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

  describe('Integration with MOCK_WHISKIES Dataset', () => {
    it('validates that all mock whiskies have valid ABVs', () => {
      MOCK_WHISKIES.forEach((whisky) => {
        expect(isValidAbv(whisky.abv)).toBe(true);
      });
    });

    it('validates that all mock whiskies have non-empty, deduplicated flavor tags', () => {
      MOCK_WHISKIES.forEach((whisky) => {
        const cleaned = deduplicateTags(whisky.whicFlavours);
        expect(cleaned.length).toBeGreaterThan(0);
        expect(cleaned).toEqual(whisky.whicFlavours);
      });
    });

    it('validates that all mock whiskies produce valid rating categories', () => {
      MOCK_WHISKIES.forEach((whisky) => {
        const category = calculateRatingCategory(whisky.rating100);
        expect(['Exceptional', 'Great', 'Good', 'Average', 'Below Average']).toContain(category);
      });
    });
  });
});
