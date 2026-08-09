import {
  Spirit,
  SPIRIT_TYPES,
  SPIRIT_COLOURS,
  SPIRIT_GLANCES,
  SUPPORTED_CURRENCIES,
} from '@/types/spirit.types';
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

  if (!spirit.spiritType || !(SPIRIT_TYPES as readonly string[]).includes(spirit.spiritType)) {
    errors.spiritType = 'Valid spirit type is required.';
  }

  if (spirit.colour && !(SPIRIT_COLOURS as readonly string[]).includes(spirit.colour)) {
    errors.colour = 'Invalid spirit colour choice.';
  }

  if (spirit.glance) {
    if (!Array.isArray(spirit.glance)) {
      errors.glance = 'Mouthfeel must be an array of choices.';
    } else {
      const hasInvalid = spirit.glance.some((g) => !(SPIRIT_GLANCES as readonly string[]).includes(g));
      if (hasInvalid) {
        errors.glance = 'Invalid spirit mouthfeel choice(s).';
      }
    }
  }

  if (spirit.finishCurves) {
    for (const [tag, curve] of Object.entries(spirit.finishCurves)) {
      if (
        curve.startTime < 0 ||
        curve.startTime > 30 ||
        curve.peakTime < 0 ||
        curve.peakTime > 30 ||
        curve.endTime < 0 ||
        curve.endTime > 60 ||
        curve.peakIntensity < 0 ||
        curve.peakIntensity > 10
      ) {
        errors.finishCurves = `Invalid curve parameters for ${tag}.`;
        break;
      }
    }
  }

  if (spirit.abv !== undefined && !isValidAbv(spirit.abv)) {
    errors.abv = 'ABV must be a valid percentage between 0 and 100.';
  }

  if (spirit.rating100 !== undefined && spirit.rating100 !== 0 && (spirit.rating100 < 1 || spirit.rating100 > 100)) {
    errors.rating100 = 'Rating score must be between 1 and 100.';
  }

  if (spirit.age !== undefined && (spirit.age < 0 || spirit.age > 120)) {
    errors.age = 'Age must be between 0 and 120 years.';
  }

  if (spirit.price !== undefined && (spirit.price < 0 || spirit.price > 100000)) {
    errors.price = 'Price must be a positive amount up to 100,000.';
  }

  if (spirit.currency && !(SUPPORTED_CURRENCIES as readonly string[]).includes(spirit.currency)) {
    errors.currency = 'Invalid currency choice.';
  }

  if (spirit.distillery && spirit.distillery.length > 150) {
    errors.distillery = 'Distillery name cannot exceed 150 characters.';
  }

  if (spirit.name && spirit.name.length > 150) {
    errors.name = 'Spirit name cannot exceed 150 characters.';
  }

  if (spirit.region && spirit.region.length > 150) {
    errors.region = 'Region cannot exceed 150 characters.';
  }

  if (spirit.caskNo && spirit.caskNo.length > 100) {
    errors.caskNo = 'Cask number cannot exceed 100 characters.';
  }

  if (spirit.finishNotes && spirit.finishNotes.length > 2000) {
    errors.finishNotes = 'Finish notes cannot exceed 2000 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
