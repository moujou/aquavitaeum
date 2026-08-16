import {
  Spirit,
  SPIRIT_TYPES,
  SPIRIT_COLOURS,
  SPIRIT_GLANCES,
  SUPPORTED_CURRENCIES,
  FlavorProfile,
} from '@/types/spirit.types';
import { isValidAbv } from '@/lib/spirit-utils';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const RADAR_DIMENSIONS: (keyof FlavorProfile)[] = [
  'fruity',
  'floral',
  'spicy',
  'cereal',
  'peaty',
  'sulphury',
  'feinty',
  'nutty',
  'woody',
  'winey',
  'chocolate',
];

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

  if (spirit.finish && spirit.finish.length > 200) {
    errors.finish = 'Finish cannot exceed 200 characters.';
  }

  if (spirit.finishNotes && spirit.finishNotes.length > 2000) {
    errors.finishNotes = 'Finish notes cannot exceed 2000 characters.';
  }

  if (spirit.volumeMl !== undefined && (spirit.volumeMl < 0 || spirit.volumeMl > 5000)) {
    errors.volumeMl = 'Volume must be between 0 and 5000 ml.';
  }

  // Boolean attributes validation
  if (spirit.isCaskStrength !== undefined && typeof spirit.isCaskStrength !== 'boolean') {
    errors.isCaskStrength = 'isCaskStrength must be a boolean.';
  }
  if (spirit.addedColour !== undefined && typeof spirit.addedColour !== 'boolean') {
    errors.addedColour = 'addedColour must be a boolean.';
  }
  if (spirit.chillFiltered !== undefined && typeof spirit.chillFiltered !== 'boolean') {
    errors.chillFiltered = 'chillFiltered must be a boolean.';
  }
  if (spirit.addedWater !== undefined && typeof spirit.addedWater !== 'boolean') {
    errors.addedWater = 'addedWater must be a boolean.';
  }
  if (spirit.onTheRocks !== undefined && typeof spirit.onTheRocks !== 'boolean') {
    errors.onTheRocks = 'onTheRocks must be a boolean.';
  }
  if (spirit.withChocolate !== undefined && typeof spirit.withChocolate !== 'boolean') {
    errors.withChocolate = 'withChocolate must be a boolean.';
  }

  // Array attributes validation
  if (spirit.flavorTags !== undefined && (!Array.isArray(spirit.flavorTags) || spirit.flavorTags.some(t => typeof t !== 'string'))) {
    errors.flavorTags = 'flavorTags must be an array of strings.';
  }
  if (spirit.noseFlavorTags !== undefined && (!Array.isArray(spirit.noseFlavorTags) || spirit.noseFlavorTags.some(t => typeof t !== 'string'))) {
    errors.noseFlavorTags = 'noseFlavorTags must be an array of strings.';
  }
  if (spirit.tasteFlavorTags !== undefined && (!Array.isArray(spirit.tasteFlavorTags) || spirit.tasteFlavorTags.some(t => typeof t !== 'string'))) {
    errors.tasteFlavorTags = 'tasteFlavorTags must be an array of strings.';
  }
  if (spirit.images !== undefined && (!Array.isArray(spirit.images) || spirit.images.some(i => typeof i !== 'string'))) {
    errors.images = 'images must be an array of strings.';
  }

  // Radar profiles validation
  if (spirit.noseProfile !== undefined) {
    if (typeof spirit.noseProfile !== 'object' || spirit.noseProfile === null) {
      errors.noseProfile = 'noseProfile must be an object.';
    } else {
      for (const dim of RADAR_DIMENSIONS) {
        const val = spirit.noseProfile[dim];
        if (val !== undefined && (typeof val !== 'number' || val < 0 || val > 10)) {
          errors.noseProfile = `Invalid noseProfile value for ${dim}. Must be a number between 0 and 10.`;
          break;
        }
      }
    }
  }

  if (spirit.tasteProfile !== undefined) {
    if (typeof spirit.tasteProfile !== 'object' || spirit.tasteProfile === null) {
      errors.tasteProfile = 'tasteProfile must be an object.';
    } else {
      for (const dim of RADAR_DIMENSIONS) {
        const val = spirit.tasteProfile[dim];
        if (val !== undefined && (typeof val !== 'number' || val < 0 || val > 10)) {
          errors.tasteProfile = `Invalid tasteProfile value for ${dim}. Must be a number between 0 and 10.`;
          break;
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Type-guard verifying that raw data is a valid Spirit record.
 */
export function isValidSpiritData(data: unknown): data is Spirit {
  if (!data || typeof data !== 'object') return false;
  const spirit = data as Partial<Spirit>;
  if (!spirit.id || typeof spirit.id !== 'string') return false;
  if (!spirit.name || typeof spirit.name !== 'string') return false;
  if (!spirit.spiritType || typeof spirit.spiritType !== 'string') return false;

  const validation = validateSpirit(spirit);
  return validation.valid;
}
