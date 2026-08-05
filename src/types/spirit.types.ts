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

export type SpiritFinishDuration = string;

export interface FinishCurveParams {
  startTime: number;
  peakTime: number;
  peakIntensity: number;
  endTime: number;
}

/** Canonical color mapping for SWRI radar dimensions across UI charts & finish diagrams. */
export const RADAR_DIMENSION_COLORS: Record<string, string> = {
  peaty:     '#E65100', // Deep Flame Smoke
  fruity:    '#D81B60', // Berry Crimson
  floral:    '#8E24AA', // Lavender Violet
  spicy:     '#F57C00', // Warm Spice Amber
  cereal:    '#C59B27', // Golden Malt
  woody:     '#6D4C41', // Toasted Oak Wood
  winey:     '#880E4F', // Sherry Burgundy
  chocolate: '#3E2723', // Dark Cocoa
  feinty:    '#00796B', // Teal Waxy
  sulphury:  '#558B2F', // Maritime Mineral Olive
  nutty:     '#795548', // Walnut Brown
};

export const SUPPORTED_CURRENCIES = ['€', '$', '£', 'CHF'] as const;

export type Currency = typeof SUPPORTED_CURRENCIES[number];

export const ALL_FLAVOR_TAGS = [
  // Peat & Smoke
  'Peat Smoke',
  'Wood Smoke',
  'Campfire',
  'Medicinal / Iodine',
  'Tar',
  'Ash',
  'Charcoal',
  // Cask & Wood
  'Bourbon Barrel',
  'Sherry Cask',
  'Port Wine',
  'Rum Cask',
  'Toasted Oak',
  'Charred Wood',
  'Spicy Oak',
  // Fruity & Floral
  'Green Apple',
  'Pear',
  'Banana',
  'Citrus Peel',
  'Dried Fig',
  'Raisin',
  'Peach',
  'Fresh Blossom',
  'Lavender',
  'Rose',
  // Sweetness & Bakery
  'Honey',
  'Vanilla',
  'Caramel',
  'Toffee',
  'Dark Chocolate',
  'Butterscotch',
  'Maple Syrup',
  'Marzipan',
  // Cereal & Grain
  'Malted Barley',
  'Wort',
  'Cereal',
  'Toast',
  'Biscuit',
  'Coffee',
  'Cocoa',
  // Nutty & Oily
  'Walnut',
  'Almond',
  'Hazelnut',
  'Creamy Butter',
  'Linseed Oil',
  // Herbal & Botanical
  'Garden Herbs',
  'Black Pepper',
  'Cinnamon',
  'Clove',
  'Dried Tobacco',
  'Leather',
  'Juniper',
  'Lemongrass',
  // Maritime & Mineral
  'Sea Salt',
  'Seaweed',
  'Damp Earth',
  'Metallic',
  'Mineral',
  'Brine',
] as const;

export type FlavorTag = typeof ALL_FLAVOR_TAGS[number];

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

// ─── Spirit Entity ────────────────────────────────────────────────────────────

export interface Spirit {
  id: string;
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
  glance: SpiritGlance;
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
}
