import { Spirit, FlavorProfile } from '@/types/spirit.types';

/**
 * Validates whether an Alcohol By Volume (ABV) percentage is within standard range (0%–100%).
 */
export function isValidAbv(abv: number): boolean {
  return typeof abv === 'number' && !isNaN(abv) && abv >= 0 && abv <= 100;
}

/**
 * Maps a 1–100 rating score to a human-readable quality category.
 */
export function calculateRatingCategory(score: number): string {
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  return 'Below Average';
}

/**
 * Converts a 1–100 numerical score into a 1–5 star rating (in 0.5 increments).
 */
export function scoreToStars(score: number): number {
  return Math.round((score / 100) * 5 * 2) / 2;
}

/**
 * Trims whitespace, removes empty entries, and deduplicates flavor tags.
 */
export function deduplicateTags(tags: string[]): string[] {
  if (!Array.isArray(tags)) return [];
  const cleanedTags = tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  return Array.from(new Set(cleanedTags));
}

/**
 * Default zeroed flavor profile for nose and taste dimensions.
 */
export const DEFAULT_FLAVOR_PROFILE: FlavorProfile = {
  fruity: 0,
  floral: 0,
  spicy: 0,
  cereal: 0,
  peaty: 0,
  sulphury: 0,
  feinty: 0,
  nutty: 0,
  woody: 0,
  winey: 0,
  chocolate: 0,
};

/**
 * Factory creating a fresh blank Spirit object initialized with default properties.
 */
export function createBlankSpirit(): Spirit {
  return {
    id: `new-${Date.now()}`,
    spiritType: 'Single Malt Scotch',
    distillery: '',
    name: '',
    region: '',
    abv: 40,
    dateTasted: new Date().toISOString().split('T')[0],
    rating100: 75,
    starRating: 3.5,
    colour: 'Gold',
    glance: 'Smooth',
    finish: 'Medium',
    finishNotes: '',
    noseProfile: { ...DEFAULT_FLAVOR_PROFILE },
    tasteProfile: { ...DEFAULT_FLAVOR_PROFILE },
    flavorTags: [],
    images: [],
    isCaskStrength: false,
    addedWater: false,
    onTheRocks: false,
  };
}
