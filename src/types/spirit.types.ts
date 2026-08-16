// ─── Spirit Domain Constants & Types ──────────────────────────────────────────

export const SPIRIT_TYPES = [
  'Single Malt Scotch',
  'Blended Scotch',
  'Bourbon',
  'Irish Whiskey',
  'Japanese Whisky',
  'Rye Whiskey',
  'Rum',
  'Gin',
  'Tequila',
  'Mezcal',
  'Cognac',
  'Armagnac',
  'Other',
] as const;

export type SpiritType = typeof SPIRIT_TYPES[number];

export const SPIRIT_COLOURS = [
  'Clear',
  'White Wine',
  'Straw',
  'Honey',
  'Gold',
  'Amber',
  'Copper',
  'Mahogany',
  'Dark Oak',
] as const;

export type SpiritColour = typeof SPIRIT_COLOURS[number];

/** Canonical hex colour values for each SpiritColour, used for UI rendering. */
export const SPIRIT_COLOUR_HEX: Record<SpiritColour, string> = {
  'Clear':      '#F0F4FF',
  'White Wine': '#F5F0DC',
  'Straw':      '#E8D8A0',
  'Honey':      '#FFC04D',
  'Gold':       '#FFD700',
  'Amber':      '#FFBF00',
  'Copper':     '#B87333',
  'Mahogany':   '#6B2D0F',
  'Dark Oak':   '#3B1A05',
};

export const SPIRIT_GLANCES = ['Watery', 'Oily', 'Creamy', 'Smooth'] as const;

export type SpiritGlance = typeof SPIRIT_GLANCES[number];

export const SPIRIT_FINISH_DURATIONS = ['Short', 'Medium', 'Long'] as const;

export type SpiritFinishDuration = typeof SPIRIT_FINISH_DURATIONS[number];

export interface FinishCurveParams {
  startTime: number;
  peakTime: number;
  peakIntensity: number;
  endTime: number;
}

export { RADAR_DIMENSION_COLORS } from '@/data/spirit-flavor-taxonomy';

export const SUPPORTED_CURRENCIES = ['€', '$', '£', 'CHF'] as const;

export type Currency = typeof SUPPORTED_CURRENCIES[number];

export type FlavorTag = string;

// ─── Flavor Profile ────────────────────────────────────────────────────────────

/** Nose and taste intensity scores on a 0–10 scale. */
export interface FlavorProfile {
  fruity: number;
  floral: number;
  spicy: number;
  cereal: number;
  peaty: number;
  sulphury: number;
  feinty: number;
  nutty: number;
  woody: number;
  winey: number;
  chocolate: number;
}

export interface Journal {
  id: string;
  name: string;
  description?: string;
  /** Optional user-selected cover photo for the journal card. Stored as a base64 DataURL. */
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Spirit Entity ────────────────────────────────────────────────────────────

export interface Spirit {
  id: string;
  journalId: string; // Associated journal folder ID
  spiritType: SpiritType;
  distillery: string;
  name: string;
  region: string;
  age?: number;
  caskNo?: string;
  abv: number;
  dateTasted: string;
  rating100: number; // 1–100 score
  starRating: number; // 1–5 scale
  colour: SpiritColour;
  glance?: SpiritGlance[];
  finish?: string;
  finishNotes: string;
  finishCurves?: Record<string, FinishCurveParams>;
  noseProfile: FlavorProfile;
  tasteProfile: FlavorProfile;
  /** Overall aggregated tasting flavor tags. */
  flavorTags: string[];
  /** Independent flavor tags selected specifically under Nose. */
  noseFlavorTags?: string[];
  /** Independent flavor tags selected specifically under Taste / Palate. */
  tasteFlavorTags?: string[];
  /** Dynamic tag intensity scores for Nose tags (0-10). */
  noseTagIntensities?: Record<string, number>;
  /** Dynamic tag intensity scores for Taste tags (0-10). */
  tasteTagIntensities?: Record<string, number>;
  /** Optional array of uploaded bottle/label image Data URLs or URLs. */
  images?: string[];
  /** Optional custom cover/thumbnail image URL from uploaded images. */
  thumbnailImage?: string;
  /** Production attributes */
  isCaskStrength?: boolean;
  addedColour?: boolean;
  chillFiltered?: boolean;
  /** Tasting Additions / Serving methods */
  addedWater?: boolean;
  onTheRocks?: boolean;
  withChocolate?: boolean;
  /** Bottle Price & Currency */
  price?: number;
  currency?: Currency;
  /** Optional sync & audit timestamps */
  createdAt?: string;
  updatedAt?: string;
}
