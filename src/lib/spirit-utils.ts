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
    // Masterpiece / Exceptional: Radiant 24k Gold
    return {
      bg: 'bg-[var(--pub-bg-panel)]',
      border: 'border-[var(--parchment-border)]',
      text: 'text-amber-600 dark:text-amber-400 font-black',
      starColor: 'fill-amber-500 text-amber-500',
    };
  }
  if (score >= 80) {
    // Distinguished / Very Good: Warm Distiller's Amber Gold
    return {
      bg: 'bg-[var(--pub-bg-panel)]',
      border: 'border-[var(--parchment-border)]',
      text: 'text-[var(--brass-accent)] font-black',
      starColor: 'fill-[var(--brass-accent)] text-[var(--brass-accent)]',
    };
  }
  if (score >= 70) {
    // Pleasant / Good: Toasted Amber-Copper
    return {
      bg: 'bg-[var(--pub-bg-panel)]',
      border: 'border-[var(--parchment-border)]',
      text: 'text-amber-800 dark:text-amber-500 font-bold',
      starColor: 'fill-amber-700 text-amber-700',
    };
  }
  // Standard / Developing: Muted Slate-Sepia
  return {
    bg: 'bg-[var(--pub-bg-panel)]',
    border: 'border-[var(--parchment-border)]',
    text: 'text-[var(--sepia-muted)] font-semibold',
    starColor: 'fill-[var(--sepia-muted)] text-[var(--sepia-muted)]',
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
 * Generates a standard RFC4122 v4 UUID with crypto.randomUUID and fallback
 */
export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Factory creating a fresh blank Spirit object initialized with default properties.
 */
export function createBlankSpirit(journalId: string = 'default-compendium'): Spirit {
  const nowIso = new Date().toISOString();
  return {
    id: generateUuid(),
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
    finish: '',
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
    volumeMl: undefined,
    price: undefined,
    currency: '€',
    createdAt: nowIso,
    updatedAt: nowIso,
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

/**
 * Calculates the spirit's age from flexible distillation and bottling date strings.
 * Handles full dates (YYYY-MM-DD or DD.MM.YYYY), Month/Year (MM/YYYY), or Year (YYYY).
 * Returns integer years or null if unparseable.
 */
export function calculateAgeFromDates(distillationDate?: string, bottlingDate?: string): number | null {
  if (!distillationDate || !bottlingDate) return null;

  const distClean = distillationDate.trim();
  const botClean = bottlingDate.trim();

  // Extract 4-digit years
  const distYearMatch = distClean.match(/\b(18|19|20)\d{2}\b/);
  const botYearMatch = botClean.match(/\b(18|19|20)\d{2}\b/);

  if (!distYearMatch || !botYearMatch) return null;

  const distYear = parseInt(distYearMatch[0], 10);
  const botYear = parseInt(botYearMatch[0], 10);

  if (botYear < distYear) return null;

  // If full dates are present (e.g. YYYY-MM-DD or DD.MM.YYYY), compute exact years
  const parseExact = (s: string): Date | null => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(s)) {
      const [d, m, y] = s.split('.').map(Number);
      return new Date(y, m - 1, d);
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [m, d, y] = s.split('/').map(Number);
      return new Date(y, m - 1, d);
    }
    return null;
  };

  const exactDist = parseExact(distClean);
  const exactBot = parseExact(botClean);

  if (exactDist && exactBot && isValid(exactDist) && isValid(exactBot)) {
    let diff = exactBot.getFullYear() - exactDist.getFullYear();
    const m = exactBot.getMonth() - exactDist.getMonth();
    if (m < 0 || (m === 0 && exactBot.getDate() < exactDist.getDate())) {
      diff--;
    }
    return diff >= 0 ? diff : null;
  }

  const yearDiff = botYear - distYear;
  return yearDiff >= 0 ? yearDiff : null;
}

export interface FormattedSpiritSpecs {
  formattedDate: string;
  specsRow4: string[];
  specsRow5: string[];
  specsRow6: string[];
}

/**
 * Extracts and formats the 3-row editorial metadata specs for SpiritCard and NoteListItem.
 */
export function formatSpiritCardSpecs(
  spirit: Spirit,
  language: 'EN' | 'DE',
  translateCharacteristicFn: (key: string, lang: 'EN' | 'DE') => string
): FormattedSpiritSpecs {
  const formattedDate = spirit.dateTasted
    ? new Date(spirit.dateTasted).toLocaleDateString(
        language === 'DE' ? 'de-DE' : 'en-GB',
        { day: '2-digit', month: 'short', year: 'numeric' }
      )
    : '';

  // Row 4: Years · vol · bottle size
  const specsRow4: string[] = [];
  if (spirit.age) specsRow4.push(`${spirit.age} ${language === 'DE' ? 'Jahre' : 'Years'}`);
  if (spirit.abv > 0) specsRow4.push(`${spirit.abv}% vol`);
  if (spirit.volumeMl && spirit.volumeMl > 0) specsRow4.push(`${spirit.volumeMl}ml`);

  // Row 5: Characteristics
  const specsRow5: string[] = [];
  if (Array.isArray(spirit.characteristics) && spirit.characteristics.length > 0) {
    specsRow5.push(...spirit.characteristics.map((c) => translateCharacteristicFn(c, language)));
  } else {
    specsRow5.push(
      spirit.isCaskStrength
        ? language === 'DE' ? 'Fassstärke' : 'Cask Strength'
        : language === 'DE' ? 'Trinkstärke' : 'Standard'
    );
    specsRow5.push(
      !spirit.addedColour
        ? language === 'DE' ? 'Ohne Farbstoff' : 'Natural Colour'
        : language === 'DE' ? 'Mit Farbstoff' : 'Added Colour'
    );
    specsRow5.push(
      !spirit.chillFiltered
        ? language === 'DE' ? 'Nicht kühlgefiltert' : 'Non-Chill Filtered'
        : language === 'DE' ? 'Kühlgefiltert' : 'Chill Filtered'
    );
  }

  // Row 6: Vintage / Bottled · Finish · Cask / Batch No.
  const specsRow6: string[] = [];
  if (spirit.distillationDate && spirit.bottlingDate) {
    specsRow6.push(
      language === 'DE'
        ? `Dest. ${spirit.distillationDate} · Abgef. ${spirit.bottlingDate}`
        : `Dist. ${spirit.distillationDate} · Bottled ${spirit.bottlingDate}`
    );
  } else if (spirit.distillationDate) {
    specsRow6.push(
      language === 'DE' ? `Dest. ${spirit.distillationDate}` : `Dist. ${spirit.distillationDate}`
    );
  } else if (spirit.bottlingDate) {
    specsRow6.push(
      language === 'DE' ? `Abgef. ${spirit.bottlingDate}` : `Bottled ${spirit.bottlingDate}`
    );
  }
  if (spirit.finish) specsRow6.push(spirit.finish);
  if (spirit.caskNo) {
    specsRow6.push(
      spirit.caskNo.toLowerCase().startsWith('cask') ||
      spirit.caskNo.toLowerCase().startsWith('batch') ||
      spirit.caskNo.startsWith('#')
        ? spirit.caskNo
        : `Cask #${spirit.caskNo}`
    );
  }

  return {
    formattedDate,
    specsRow4,
    specsRow5,
    specsRow6,
  };
}


