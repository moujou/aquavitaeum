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

export interface RatingTierStyle {
  bg: string;
  border: string;
  text: string;
  starColor: string;
}

/**
 * Returns dynamic styling classes matching authentic spirits noble metal & oak judging tiers.
 */
export function getRatingTierStyle(score: number): RatingTierStyle {
  if (score >= 90) {
    // Masterpiece / Exceptional: Radiant 24k Gold with Solid Dark Obsidian Backing
    return {
      bg: 'bg-[#14120A]',
      border: 'border-amber-400/90',
      text: 'text-amber-300',
      starColor: 'fill-amber-400 text-amber-400',
    };
  }
  if (score >= 80) {
    // Distinguished / Very Good: Warm Aged Brass with Solid Dark Backing
    return {
      bg: 'bg-[#13120C]',
      border: 'border-[var(--brass-accent)]',
      text: 'text-[var(--foreground)]',
      starColor: 'fill-[var(--brass-accent)] text-[var(--brass-accent)]',
    };
  }
  if (score >= 70) {
    // Pleasant / Good: Toasted Copper Oak with Solid Dark Backing
    return {
      bg: 'bg-[#150F0B]',
      border: 'border-amber-700/90',
      text: 'text-amber-200',
      starColor: 'fill-amber-600 text-amber-600',
    };
  }
  // Standard / Developing: Aged Slate & Parchment with Solid Dark Backing
  return {
    bg: 'bg-[#111412]',
    border: 'border-white/35',
    text: 'text-white/90',
    starColor: 'fill-white/70 text-white/70',
  };
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
export function createBlankSpirit(journalId: string = 'default-compendium'): Spirit {
  return {
    id: `new-${Date.now()}`,
    journalId,
    spiritType: 'Single Malt Scotch',
    distillery: '',
    name: '',
    region: '',
    abv: 0,
    dateTasted: '',
    rating100: 0,
    starRating: 0,
    colour: 'Clear',
    glance: [],
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

