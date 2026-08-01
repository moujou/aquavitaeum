import { Spirit } from '@/types/spirit.types';
import { isValidAbv } from '@/lib/spirit-utils';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a Spirit object against domain business rules.
 */
export function validateSpirit(spirit: Partial<Spirit>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!spirit.spiritType) {
    errors.spiritType = 'Spirit type is required.';
  }

  if (spirit.abv !== undefined && !isValidAbv(spirit.abv)) {
    errors.abv = 'ABV must be a valid percentage between 0 and 100.';
  }

  if (spirit.rating100 !== undefined && (spirit.rating100 < 1 || spirit.rating100 > 100)) {
    errors.rating100 = 'Rating score must be between 1 and 100.';
  }

  if (spirit.age !== undefined && (spirit.age < 0 || spirit.age > 120)) {
    errors.age = 'Age must be between 0 and 120 years.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
