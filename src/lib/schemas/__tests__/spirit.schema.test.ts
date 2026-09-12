import { describe, it, expect } from 'vitest';
import { validateSpirit, isValidSpiritData } from '../spirit.schema';
import { SpiritType, SpiritColour, SpiritGlance, Currency, FlavorProfile } from '@/types/spirit.types';
import { DEFAULT_FLAVOR_PROFILE } from '@/lib/spirit-utils';

describe('Spirit Schema Validation', () => {
  it('validates a valid spirit object with no errors', () => {
    const validSpirit = {
      id: 'spirit-123',
      name: 'Lagavulin 16',
      spiritType: 'Single Malt Scotch' as const,
      colour: 'Gold' as const,
      glance: ['Oily'] as SpiritGlance[],
      abv: 43.0,
      rating100: 92,
      age: 12,
      price: 59.99,
      currency: '€' as const,
      addedColour: false,
      chillFiltered: true,
      tastingAdditions: ['Water'],
      characteristics: ['Single Cask'],
      finishCharacter: ['Long'],
      barRole: ['Showcase'],
      images: ['img1.jpg'],
      noseProfile: { ...DEFAULT_FLAVOR_PROFILE, peaty: 8, fruity: 3 },
      tasteProfile: { ...DEFAULT_FLAVOR_PROFILE, peaty: 9, chocolate: 4 },
      finishCurves: {
        'Peat Smoke': { startTime: 0, peakTime: 4, peakIntensity: 8, endTime: 20 },
      },
    };
    const result = validateSpirit(validSpirit);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors).length).toEqual(0);

    expect(isValidSpiritData(validSpirit)).toBe(true);
  });

  it('detects invalid spiritType values outside as const tuple', () => {
    const invalidSpiritType = {
      spiritType: 'Moonshine' as unknown as SpiritType,
    };
    const result = validateSpirit(invalidSpiritType);
    expect(result.valid).toBe(false);
    expect(result.errors.spiritType).toBeDefined();
  });

  it('detects invalid colour values outside as const tuple', () => {
    const invalidColour = {
      spiritType: 'Bourbon' as const,
      colour: 'Neon Blue' as unknown as SpiritColour,
    };
    const result = validateSpirit(invalidColour);
    expect(result.valid).toBe(false);
    expect(result.errors.colour).toBeDefined();
  });

  it('detects invalid glance/mouthfeel values outside as const tuple or non-array', () => {
    const invalidGlance = {
      spiritType: 'Irish Whiskey' as const,
      glance: ['Sandpaper'] as unknown as SpiritGlance[],
    };
    const result = validateSpirit(invalidGlance);
    expect(result.valid).toBe(false);
    expect(result.errors.glance).toBeDefined();

    expect(validateSpirit({ spiritType: 'Bourbon', glance: 'Oily' as unknown as SpiritGlance[] }).valid).toBe(false);
  });

  it('detects invalid tastingAdditions, characteristics, finishCharacter, and barRole', () => {
    expect(validateSpirit({ spiritType: 'Bourbon', tastingAdditions: 'Water' as unknown as string[] }).valid).toBe(false);
    expect(validateSpirit({ spiritType: 'Bourbon', characteristics: 123 as unknown as string[] }).valid).toBe(false);
    expect(validateSpirit({ spiritType: 'Bourbon', finishCharacter: 'Long' as unknown as string[] }).valid).toBe(false);
    expect(validateSpirit({ spiritType: 'Bourbon', barRole: 'NotAnArray' as unknown as string[] }).valid).toBe(false);

    expect(validateSpirit({ spiritType: 'Bourbon', characteristics: [''] }).valid).toBe(false);
    expect(validateSpirit({ spiritType: 'Bourbon', barRole: ['A'.repeat(51)] }).valid).toBe(false);
  });

  it('detects invalid radar profiles (out of bounds or non-object)', () => {
    expect(validateSpirit({ spiritType: 'Bourbon', noseProfile: 'invalid' as unknown as FlavorProfile }).valid).toBe(false);
    expect(validateSpirit({ spiritType: 'Bourbon', tasteProfile: null as unknown as FlavorProfile }).valid).toBe(false);

    expect(validateSpirit({ spiritType: 'Bourbon', noseProfile: { ...DEFAULT_FLAVOR_PROFILE, peaty: 15 } }).valid).toBe(false);
    expect(validateSpirit({ spiritType: 'Bourbon', tasteProfile: { ...DEFAULT_FLAVOR_PROFILE, fruity: -2 } }).valid).toBe(false);
  });

  it('detects invalid images array', () => {
    expect(validateSpirit({ spiritType: 'Bourbon', images: 'photo.jpg' as unknown as string[] }).valid).toBe(false);
  });

  it('detects invalid finishCurves parameter values', () => {
    const invalidFinish = {
      spiritType: 'Japanese Whisky' as const,
      finishCurves: {
        'Peat Smoke': { startTime: -5, peakTime: 4, peakIntensity: 15, endTime: 20 },
      },
    };
    const result = validateSpirit(invalidFinish);
    expect(result.valid).toBe(false);
    expect(result.errors.finishCurves).toBeDefined();
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

  it('detects invalid price or currency', () => {
    const invalidPrice = {
      spiritType: 'Single Malt Scotch' as const,
      price: -10,
    };
    expect(validateSpirit(invalidPrice).valid).toBe(false);

    const invalidCurrency = {
      spiritType: 'Single Malt Scotch' as const,
      currency: 'BTC' as unknown as Currency,
    };
    expect(validateSpirit(invalidCurrency).valid).toBe(false);
  });

  it('detects string length boundary violations', () => {
    const oversizedDistillery = {
      spiritType: 'Single Malt Scotch' as const,
      distillery: 'A'.repeat(151),
    };
    const result = validateSpirit(oversizedDistillery);
    expect(result.valid).toBe(false);
    expect(result.errors.distillery).toBeDefined();
  });

  it('validates with isValidSpiritData guard', () => {
    expect(isValidSpiritData(null)).toBe(false);
    expect(isValidSpiritData({})).toBe(false);
    expect(isValidSpiritData({ id: '1', name: 'Whisky' })).toBe(false);
    expect(isValidSpiritData({ id: '1', name: 'Whisky', spiritType: 'Invalid' })).toBe(false);
  });
});
