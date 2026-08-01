import { describe, it, expect } from 'vitest';
import { validateSpirit } from '../spirit.schema';

describe('Spirit Schema Validation', () => {
  it('validates a valid spirit object with no errors', () => {
    const validSpirit = {
      spiritType: 'Single Malt Scotch' as const,
      abv: 43.0,
      rating100: 92,
      age: 12,
    };
    const result = validateSpirit(validSpirit);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors).length).toEqual(0);
  });

  it('detects invalid ABV values', () => {
    const invalidAbv = {
      spiritType: 'Bourbon' as const,
      abv: 120, // invalid > 100
    };
    const result = validateSpirit(invalidAbv);
    expect(result.valid).toBe(false);
    expect(result.errors.abv).toBeDefined();
  });

  it('detects invalid rating100 score', () => {
    const invalidRating = {
      spiritType: 'Rum' as const,
      rating100: 150, // invalid > 100
    };
    const result = validateSpirit(invalidRating);
    expect(result.valid).toBe(false);
    expect(result.errors.rating100).toBeDefined();
  });

  it('detects invalid age', () => {
    const invalidAge = {
      spiritType: 'Gin' as const,
      age: -5,
    };
    const result = validateSpirit(invalidAge);
    expect(result.valid).toBe(false);
    expect(result.errors.age).toBeDefined();
  });
});
