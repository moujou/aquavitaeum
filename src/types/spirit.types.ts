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

export const SPIRIT_GLANCES = ['Watery', 'Oily', 'Creamy', 'Smooth'] as const;

export type SpiritGlance = typeof SPIRIT_GLANCES[number];

export const SPIRIT_FINISH_DURATIONS = ['Short', 'Medium', 'Long'] as const;

export type SpiritFinishDuration = typeof SPIRIT_FINISH_DURATIONS[number];

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
  finish: SpiritFinishDuration;
  finishNotes: string;
  noseProfile: FlavorProfile;
  tasteProfile: FlavorProfile;
  /** Free-form tasting flavor tags selected from the Flavor Tag Selector. */
  flavorTags: string[];
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
