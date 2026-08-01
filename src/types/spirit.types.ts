// ─── Spirit Types ─────────────────────────────────────────────────────────────

export type SpiritType =
  | 'Single Malt Scotch'
  | 'Blended Scotch'
  | 'Bourbon'
  | 'Irish Whiskey'
  | 'Japanese Whisky'
  | 'Rye Whiskey'
  | 'Rum'
  | 'Gin'
  | 'Tequila'
  | 'Mezcal'
  | 'Cognac'
  | 'Armagnac'
  | 'Other';

export type SpiritColour =
  | 'Clear'
  | 'White Wine'
  | 'Straw'
  | 'Honey'
  | 'Gold'
  | 'Amber'
  | 'Copper'
  | 'Mahogany'
  | 'Dark Oak';

export type SpiritGlance = 'Watery' | 'Oily' | 'Creamy' | 'Smooth';

export type SpiritFinishDuration = 'Short' | 'Medium' | 'Long';

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

// ─── Spirit ───────────────────────────────────────────────────────────────────

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
  rating100: number;        // 1–100 score
  starRating: number;       // 1–5 scale
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
  /** Tasting checkboxes */
  isCaskStrength?: boolean;
  addedWater?: boolean;
  onTheRocks?: boolean;
}
