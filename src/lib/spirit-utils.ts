import { format as dateFnsFormat, parse as dateFnsParse, isValid } from 'date-fns';
import { Spirit, FlavorProfile } from '@/types/spirit.types';

/**
 * Validates whether an Alcohol By Volume (ABV) percentage is within standard range (0%–100%).
 */
export function isValidAbv(abv: number): boolean {
  return typeof abv === 'number' && !isNaN(abv) && abv >= 0 && abv <= 100;
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
    dateTasted: '',
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
 * English (EN): MM/dd/yyyy  e.g. 08/04/2026
 * German  (DE): dd.MM.yyyy  e.g. 04.08.2026
 */
export function formatDateByLanguage(isoDateStr?: string, language: 'EN' | 'DE' = 'EN'): string {
  if (!isoDateStr || typeof isoDateStr !== 'string') return '';
  const [y, m, d] = isoDateStr.split('T')[0].split('-').map(Number);
  if (!y || !m || !d) return isoDateStr;
  // Date.UTC avoids local-timezone shift when constructing from ISO parts
  const date = new Date(Date.UTC(y, m - 1, d));
  return dateFnsFormat(date, language === 'DE' ? 'dd.MM.yyyy' : 'MM/dd/yyyy');
}

/**
 * Parses a user-entered date string into ISO YYYY-MM-DD format.
 * English (EN): expects MM/dd/yyyy  e.g. 08/04/2026
 * German  (DE): expects dd.MM.yyyy  e.g. 04.08.2026
 * Returns null if the input cannot be parsed.
 */
export function parseDateInputToIso(formattedStr?: string, language: 'EN' | 'DE' = 'EN'): string | null {
  if (!formattedStr || typeof formattedStr !== 'string') return null;
  const trimmed = formattedStr.trim();
  if (!trimmed) return null;
  // Accept raw ISO input directly (e.g. from the calendar popup output)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const fmt = language === 'DE' ? 'dd.MM.yyyy' : 'MM/dd/yyyy';
  const parsed = dateFnsParse(trimmed, fmt, new Date(2000, 0, 1));
  if (!isValid(parsed)) return null;
  return dateFnsFormat(parsed, 'yyyy-MM-dd');
}

