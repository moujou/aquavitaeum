export type WhiskyColour =
  | 'Clear'
  | 'White Wine'
  | 'Straw'
  | 'Honey'
  | 'Gold'
  | 'Amber'
  | 'Copper'
  | 'Mahogany'
  | 'Dark Oak';

export type WhiskyGlance = 'Watery' | 'Oily' | 'Creamy' | 'Smooth';

export type WhiskyFinishDuration = 'Short' | 'Medium' | 'Long';

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

export interface Whisky {
  id: string;
  distillery: string;
  name: string;
  region: string;
  age?: number;
  caskNo?: string;
  abv: number;
  dateTasted: string;
  rating100: number; // 1-100 score
  starRating: number; // 1-5 scale score
  colour: WhiskyColour;
  glance: WhiskyGlance;
  finish: WhiskyFinishDuration;
  finishNotes: string;
  noseProfile: FlavorProfile;
  tasteProfile: FlavorProfile;
  whicFlavours: string[]; // German "whic" Tasting Wheel tags array
}
