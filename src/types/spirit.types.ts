// ─── Spirit Domain Constants & Types ──────────────────────────────────────────

export const SPIRIT_TYPES = [
  'Single Malt Scotch',
  'Blended Scotch',
  'Single Pot Still Irish',
  'Irish Whiskey',
  'Bourbon',
  'Rye Whiskey',
  'Japanese Whisky',
  'French Single Malt',
  'German / Bavarian Whisky',
  'Dutch Whisky / Genever',
  'Taiwanese Whisky',
  'Australian Whisky',
  'World Whisky',
  'Rum',
  'Rhum Agricole',
  'Gin',
  'Tequila',
  'Mezcal',
  'Cognac',
  'Armagnac',
  'Calvados',
  'Grappa',
  'Aquavit',
  'Pisco',
  'Liqueur',
  'Other',
] as const;

export type SpiritType = string;

export const SPIRIT_COLOURS = [
  'Gin Clear',
  'White Wine',
  'Pale Straw',
  'Pale Gold',
  'Ripe Corn',
  'Yellow Gold',
  'Old Gold',
  'Amber',
  'Deep Gold',
  'Amontillado',
  'Deep Copper',
  'Burnished',
  'Chestnut',
  'Russet',
  'Tawny Port',
  'Auburn',
  'Mahogany',
  'Burnt Umber',
  'Old Oak',
  'Brown Sherry',
  'Treacle',
] as const;

export type SpiritColour = typeof SPIRIT_COLOURS[number] | string;

/** Canonical hex colour values for the 21-shade sommelier scale, used for UI rendering and animated ribbons. */
export const SPIRIT_COLOUR_HEX: Record<string, string> = {
  'Gin Clear':     '#F8FAFC',
  'White Wine':    '#F4F3D8',
  'Pale Straw':    '#EFE4A0',
  'Pale Gold':     '#EAD870',
  'Ripe Corn':     '#F3D050',
  'Yellow Gold':   '#F7C830',
  'Old Gold':      '#F2B720',
  'Amber':         '#E9A318',
  'Deep Gold':     '#DD8E12',
  'Amontillado':   '#D07A10',
  'Deep Copper':   '#C2650E',
  'Burnished':     '#B65410',
  'Chestnut':      '#A84512',
  'Russet':        '#9B3814',
  'Tawny Port':    '#8E2C18',
  'Auburn':        '#80221A',
  'Mahogany':      '#6F1B18',
  'Burnt Umber':   '#5D1614',
  'Old Oak':       '#4D1310',
  'Brown Sherry':  '#3C0F0C',
  'Treacle':       '#240B08',

  // Backward compatibility aliases
  'Clear':         '#F8FAFC',
  'Straw':         '#EFE4A0',
  'Gold':          '#F7C830',
  'Copper':        '#C2650E',
  'Ruby':          '#80221A',
  'Dark Oak':      '#4D1310',
  'Honey':         '#F3D050',
};

export const SPIRIT_GLANCES = [
  'Silky',
  'Oily',
  'Creamy',
  'Viscous',
  'Smooth',
  'Velvety',
  'Warming',
  'Dry',
  'Watery',
] as const;

export type SpiritGlance = typeof SPIRIT_GLANCES[number] | string;

export const SPIRIT_CHARACTERISTICS = [
  'Cask Strength',
  'Natural Colour',
  'Non-Chill Filtered',
  'Peated',
  'Small Batch',
  'Triple Distilled',
] as const;

export type SpiritCharacteristic = typeof SPIRIT_CHARACTERISTICS[number] | string;

export const TASTING_ADDITIONS = ['Water', 'On the Rocks', 'With Chocolate'] as const;

export type TastingAddition = typeof TASTING_ADDITIONS[number] | string;

export const SPIRIT_FINISH_DURATIONS = ['Short', 'Medium', 'Long', 'Very Long'] as const;

export type SpiritFinishDuration = typeof SPIRIT_FINISH_DURATIONS[number];

export const SPIRIT_FINISH_CHARACTERS = [
  'Warming',
  'Sharp',
  'Spicy',
  'Alcoholic',
  'Peated',
  'Smoky',
  'Oaky',
  'Tannic',
  'Dry',
  'Sweet',
  'Mild',
  'Saline',
  'Mineral',
] as const;

export type SpiritFinishCharacter = typeof SPIRIT_FINISH_CHARACTERS[number] | string;

export const SPIRIT_BAR_ROLES = [
  'Daily Sipper',
  'Showcase Bottle',
  'Buy Again',
  'Great Value',
  'Guest Favorite',
  'Gift Idea',
] as const;

export type SpiritBarRole = typeof SPIRIT_BAR_ROLES[number] | string;

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

export interface CustomFlavorDescriptor {
  id: string;
  name: string;
  emoji?: string;
  radarDimension: keyof FlavorProfile;
  color?: string;
}

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
  /** Optional Distillation date / Vintage (e.g. '15.03.1996', '03/1996', '1996') */
  distillationDate?: string;
  /** Optional Bottling date (e.g. '24.11.2021', '11/2021', '2021') */
  bottlingDate?: string;
  rating100: number; // 1–100 score
  starRating: number; // 1–5 scale
  /** Sommelier verdict & bar role badges (e.g. 'Daily Sipper', 'Showcase Bottle', 'Buy Again') */
  barRole?: string[];
  colour: SpiritColour;
  glance?: SpiritGlance[];
  finish?: string;
  /** Tactile finish characteristics and warmth profile (Extensible Multi-Chip array) */
  finishCharacter?: string[];
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
  /** Optional custom user-created flavor descriptors and axis mappings. */
  customFlavors?: CustomFlavorDescriptor[];
  /** Optional array of uploaded bottle/label image Data URLs or URLs. */
  images?: string[];
  /** Optional custom cover/thumbnail image URL from uploaded images. */
  thumbnailImage?: string;
  /** Production attributes & characteristics (Extensible Multi-Chip array) */
  characteristics?: string[];
  isCaskStrength?: boolean;
  addedColour?: boolean;
  chillFiltered?: boolean;
  /** Tasting Additions / Serving methods (Extensible Multi-Chip array) */
  tastingAdditions?: string[];
  addedWater?: boolean;
  onTheRocks?: boolean;
  withChocolate?: boolean;
  /** Optional Serving & Pairing Notes */
  servingNotes?: string;
  /** Bottle Volume in ml (e.g. 700, 500, 1000, 50) */
  volumeMl?: number;
  /** Bottle Price & Currency */
  price?: number;
  currency?: Currency;
  /** Optional sync & audit timestamps */
  createdAt?: string;
  updatedAt?: string;
}
