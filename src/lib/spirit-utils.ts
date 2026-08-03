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
    noseFlavorTags: [],
    tasteFlavorTags: [],
    noseTagIntensities: {},
    tasteTagIntensities: {},
    images: [],
    isCaskStrength: false,
    addedColour: false,
    chillFiltered: false,
    addedWater: false,
    onTheRocks: false,
    withChocolate: false,
    price: undefined,
    currency: '€',
  };
}

/**
 * Formats an ISO date string (YYYY-MM-DD) according to the active language setting.
 * German (DE): DD.MM.YYYY
 * English (EN): MM/DD/YYYY
 */
export function formatDateByLanguage(isoDateStr?: string, language: 'EN' | 'DE' = 'EN'): string {
  if (!isoDateStr || typeof isoDateStr !== 'string') return '';
  const datePart = isoDateStr.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length !== 3) return isoDateStr;
  const [year, month, day] = parts;
  if (!year || !month || !day || year.length !== 4) return isoDateStr;

  const formattedDay = day.padStart(2, '0');
  const formattedMonth = month.padStart(2, '0');

  if (language === 'DE') {
    return `${formattedDay}.${formattedMonth}.${year}`;
  }
  return `${formattedMonth}/${formattedDay}/${year}`;
}

/**
 * Parses user input date string into ISO YYYY-MM-DD format based on language setting.
 * Returns ISO string if valid, or null if parsing fails.
 */
export function parseDateInputToIso(formattedStr?: string, language: 'EN' | 'DE' = 'EN'): string | null {
  if (!formattedStr || typeof formattedStr !== 'string') return null;
  const trimmed = formattedStr.trim();
  if (!trimmed) return null;

  // Check if already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Split by common date separators (. / -)
  const parts = trimmed.split(/[.\/-]/);
  if (parts.length !== 3) return null;

  let day: number, month: number, year: number;

  if (language === 'DE') {
    // German format: DD.MM.YYYY
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else {
    // English format: MM/DD/YYYY
    month = parseInt(parts[0], 10);
    day = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  }

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (year < 1900 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const paddedYear = String(year).padStart(4, '0');
  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');

  return `${paddedYear}-${paddedMonth}-${paddedDay}`;
}

