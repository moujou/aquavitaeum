import { FlavorProfile, CustomFlavorDescriptor, CustomFlavorSubcategory, CustomFlavorCategory } from '@/types/spirit.types';

export const MIN_FLAVOR_CATEGORIES = 3;
export const MAX_FLAVOR_CATEGORIES = 12;

export interface FlavorDescriptor {
  id: string;
  name: { EN: string; DE: string };
  radarDimension: keyof FlavorProfile;
  categoryId?: string;
  color?: string; // Human-instinctive UI color (WCAG compliant)
  emoji?: string;
  description?: string;
  subcategoryId?: string;
  aliases?: string[];
}

export interface FlavorSubcategory {
  id: string;
  name: { EN: string; DE: string };
  descriptors: FlavorDescriptor[];
}

export interface FlavorCategory {
  id: string;
  name: { EN: string; DE: string };
  emoji: string;
  radarDimension: keyof FlavorProfile;
  color?: string;
  subcategories: FlavorSubcategory[];
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

// ─── SWRI-aligned Scotch Whisky & Fine Spirits Flavour Taxonomy ──────────────
// Based on the Scotch Whisky Research Institute (SWRI) and Master Sommelier aroma wheels.
// Every descriptor has a semantically matched emoji icon.
export const SPIRIT_FLAVOR_TAXONOMY: FlavorCategory[] = [

  // ─── 1. PEAT & SMOKE (Torf & Rauch) ─────────────────────────────────────────
  {
    id: 'torf',
    name: { EN: 'Peat & Smoke', DE: 'Torf & Rauch' },
    emoji: '🔥',
    radarDimension: 'peaty',
    subcategories: [
      {
        id: 'rauchig',
        name: { EN: 'Smoke & Fire', DE: 'Rauch & Feuer' },
        descriptors: [
          { id: 'peat_smoke', name: { EN: 'Peat', DE: 'Torf' }, radarDimension: 'peaty', color: '#655A52', emoji: '🔥', aliases: ['Peat', 'Peat Smoke', 'Torf', 'Torfrauch'] },
          { id: 'verbranntes_holz', name: { EN: 'Smoke', DE: 'Rauch' }, radarDimension: 'peaty', color: '#5C4E43', emoji: '💨', aliases: ['Smoke', 'Wood Smoke', 'Oak Smoke', 'Charred Wood', 'Burnt Wood', 'Rauch', 'Holzrauch', 'Verbranntes Holz'] },
          { id: 'lagerfeuer', name: { EN: 'Campfire', DE: 'Lagerfeuer' }, radarDimension: 'peaty', color: '#7C5438', emoji: '🏕️', aliases: ['Campfire', 'Bonfire', 'Lagerfeuer', 'Lagerfeuerglut'] },
          { id: 'kaminasche', name: { EN: 'Ash', DE: 'Asche' }, radarDimension: 'peaty', color: '#4F565C', emoji: '🌋', aliases: ['Ash', 'Asche', 'Hearth', 'Kaminasche', 'Soot', 'Ruß'] },
          { id: 'grillkohle', name: { EN: 'Charcoal', DE: 'Kohle' }, radarDimension: 'peaty', color: '#42474D', emoji: '🪨', aliases: ['Charcoal', 'Coal', 'Holzkohle', 'Grillkohle', 'Kohle'] },
        ],
      },
      {
        id: 'medizinisch',
        name: { EN: 'Medicinal & Peat', DE: 'Medizinisch & Phenol' },
        descriptors: [
          { id: 'jod', name: { EN: 'Iodine', DE: 'Jod' }, radarDimension: 'peaty', color: '#1C6878', emoji: '🧪', aliases: ['Iodine', 'Jod', 'Medicinal / Iodine', 'Iodine & Phenol', 'Jod & Phenol', 'Medizinisches Jod'] },
          { id: 'medizinisch_note', name: { EN: 'Phenol', DE: 'Phenol' }, radarDimension: 'peaty', color: '#1C6878', emoji: '💊', aliases: ['Phenol', 'Medicinal', 'Medicinal Smoke', 'Medizinischer Rauch', 'Medizinisch'] },
          { id: 'desinfektionsmittel', name: { EN: 'Antiseptic', DE: 'Antiseptikum' }, radarDimension: 'peaty', color: '#1F7385', emoji: '🧴', aliases: ['Antiseptic', 'Desinfektionsmittel', 'Antiseptikum'] },
          { id: 'heftpflaster', name: { EN: 'Bandage', DE: 'Pflaster' }, radarDimension: 'peaty', color: '#1F7385', emoji: '🩹', aliases: ['Bandage', 'Plaster', 'Bandage / Plaster', 'Pflaster', 'Heftpflaster'] },
          { id: 'teer', name: { EN: 'Tar', DE: 'Teer' }, radarDimension: 'peaty', color: '#2D3136', emoji: '🛢️', aliases: ['Tar', 'Teer', 'Coal Tar', 'Kreosot', 'Kohlenteer'] },
        ],
      },
    ],
  },

  // ─── 2. LEATHER, MEATY & FEINTY (Leder, Fleischig & Wachs) ───────────────
  {
    id: 'feinty',
    name: { EN: 'Leather, Meaty & Feinty', DE: 'Leder, Fleischig & Wachs' },
    emoji: '👞',
    radarDimension: 'feinty',
    subcategories: [
      {
        id: 'leder_tabak',
        name: { EN: 'Leather & Tobacco', DE: 'Leder & Tabak' },
        descriptors: [
          { id: 'leather', name: { EN: 'Leather', DE: 'Leder' }, radarDimension: 'feinty', color: '#634026', emoji: '👞', aliases: ['Leather', 'Wet Leather', 'Leder', 'Nasses Leder', 'Sattelleder'] },
          { id: 'pfeifentabak', name: { EN: 'Tobacco', DE: 'Tabak' }, radarDimension: 'feinty', color: '#784D28', emoji: '🍂', aliases: ['Tobacco', 'Pipe Tobacco', 'Tobacco Leaves', 'Tabak', 'Pfeifentabak', 'Tabakblätter'] },
          { id: 'zigarrenkiste', name: { EN: 'Cigar', DE: 'Zigarre' }, radarDimension: 'feinty', color: '#6E4D2C', emoji: '📦', aliases: ['Cigar', 'Cigar Box', 'Zigarre', 'Zigarrenkiste'] },
          { id: 'altes_buch', name: { EN: 'Parchment', DE: 'Pergament' }, radarDimension: 'feinty', color: '#735738', emoji: '📜', aliases: ['Parchment', 'Old Parchment', 'Old Book', 'Library', 'Bibliothek', 'Pergament', 'Altes Pergament'] },
        ],
      },
      {
        id: 'fleischig_herzhaft',
        name: { EN: 'Savory & Meaty', DE: 'Fleischig & Herzhaft' },
        descriptors: [
          { id: 'fleischig', name: { EN: 'Meat', DE: 'Fleisch' }, radarDimension: 'feinty', color: '#823B33', emoji: '🥩', aliases: ['Meat', 'Meaty', 'Gravy', 'Meaty / Gravy', 'Bratensauce', 'Fleisch', 'Fleischig', 'Braten', 'Umami', 'Brühe', 'Rinderbrühe'] },
          { id: 'speck', name: { EN: 'Bacon', DE: 'Speck' }, radarDimension: 'feinty', color: '#8F382E', emoji: '🥓', aliases: ['Bacon', 'Smoked Bacon', 'Smoked Ham', 'Ham', 'Speck', 'Geräucherter Speck', 'Räucherschinken', 'Schinken', 'Bauchspeck'] },
        ],
      },
      {
        id: 'wachsig_fettig',
        name: { EN: 'Waxy & Rich', DE: 'Wachs & Mundgefühl' },
        descriptors: [
          { id: 'bienenwachs', name: { EN: 'Beeswax', DE: 'Bienenwachs' }, radarDimension: 'feinty', color: '#B58D3D', emoji: '🐝', aliases: ['Beeswax', 'Bienenwachs'] },
          { id: 'kerzenwachs', name: { EN: 'Wax', DE: 'Wachs' }, radarDimension: 'feinty', color: '#C29A44', emoji: '🕯️', aliases: ['Wax', 'Candle Wax', 'Paraffin', 'Wachs', 'Kerzenwachs'] },
          { id: 'honigwabe', name: { EN: 'Honeycomb', DE: 'Honigwabe' }, radarDimension: 'feinty', color: '#C49533', emoji: '🍯', aliases: ['Honeycomb', 'Wabe', 'Honigwabe'] },
          { id: 'buttrig_textur', name: { EN: 'Butter', DE: 'Butter' }, radarDimension: 'feinty', color: '#C9A74E', emoji: '🧈', aliases: ['Butter', 'Buttery', 'Buttrig', 'Samtig'] },
          { id: 'olivenoel', name: { EN: 'Olive', DE: 'Olive' }, radarDimension: 'feinty', color: '#7E7D3A', emoji: '🫒', aliases: ['Olive', 'Olive Oil', 'Olivenöl', 'Öl'] },
        ],
      },
    ],
  },

  // ─── 3. MARITIME & MINERAL (Maritim & Mineralisch) ────────────────────────
  {
    id: 'maritim',
    name: { EN: 'Maritime & Mineral', DE: 'Maritim & Mineralisch' },
    emoji: '🌊',
    radarDimension: 'sulphury',
    subcategories: [
      {
        id: 'kueste',
        name: { EN: 'Coast & Sea', DE: 'Küste & Meer' },
        descriptors: [
          { id: 'sea_salt', name: { EN: 'Salt', DE: 'Salz' }, radarDimension: 'sulphury', color: '#2B788B', emoji: '🧂', aliases: ['Salt', 'Sea Salt', 'Salt Crust', 'Sea', 'Sea Spray', 'Sea Breeze', 'Brine', 'Coastal Brine', 'Meersalz', 'Salz', 'Salzkruste', 'Meer', 'Meeresbrise', 'Gischt', 'Sole', 'Salzlake', 'Fleur de Sel', 'Meersalzkristalle'] },
          { id: 'seegras', name: { EN: 'Seaweed', DE: 'Seetang' }, radarDimension: 'sulphury', color: '#246D5E', emoji: '🌿', aliases: ['Seaweed', 'Kelp', 'Algae', 'Seegras', 'Seetang', 'Seetang & Algen', 'Tang', 'Algen', 'Meeresalgen'] },
          { id: 'austernschale', name: { EN: 'Oyster', DE: 'Auster' }, radarDimension: 'sulphury', color: '#3E7D8A', emoji: '🦪', aliases: ['Oyster', 'Oyster Shell', 'Auster', 'Austernschale'] },
        ],
      },
      {
        id: 'mineralisch',
        name: { EN: 'Mineral & Earth', DE: 'Mineralisch & Gestein' },
        descriptors: [
          { id: 'feuerstein', name: { EN: 'Flint', DE: 'Feuerstein' }, radarDimension: 'sulphury', color: '#4A6270', emoji: '🪨', aliases: ['Flint', 'Feuerstein', 'Kiesel', 'Kieselstein'] },
          { id: 'schiefer', name: { EN: 'Slate', DE: 'Schiefer' }, radarDimension: 'sulphury', color: '#3B4D57', emoji: '🪨', aliases: ['Slate', 'Schiefer', 'Gestein'] },
          { id: 'feuchte_erde', name: { EN: 'Earth', DE: 'Erde' }, radarDimension: 'sulphury', color: '#594A3D', emoji: '🌱', aliases: ['Earth', 'Damp Earth', 'Erde', 'Petrichor', 'Feuchte Erde', 'Damp Earth / Petrichor', 'Feuchte Erde / Petrichor'] },
          { id: 'kreide', name: { EN: 'Chalk', DE: 'Kreide' }, radarDimension: 'sulphury', color: '#6E7D85', emoji: '🪨', aliases: ['Chalk', 'Kreide', 'Kalkstein', 'Limestone', 'Chalk & Limestone', 'Kreide & Kalkstein'] },
        ],
      },
    ],
  },

  // ─── 4. HERBAL & GREEN (Kräuter, Laub & Grasig) ───────────────────────────
  {
    id: 'pflanzlich',
    name: { EN: 'Herbal & Green', DE: 'Kräuter, Laub & Grasig' },
    emoji: '🌿',
    radarDimension: 'floral',
    subcategories: [
      {
        id: 'grasig_frisch',
        name: { EN: 'Grass & Meadow', DE: 'Gras & Wiese' },
        descriptors: [
          { id: 'frisches_gras', name: { EN: 'Grass', DE: 'Gras' }, radarDimension: 'floral', color: '#3A8A3E', emoji: '🌱', aliases: ['Grass', 'Fresh Grass', 'Cut Grass', 'Gras', 'Frisches Gras', 'Grasig', 'Kräuter', 'Frisch gemähtes Gras'] },
          { id: 'wiesenheu', name: { EN: 'Hay', DE: 'Heu' }, radarDimension: 'floral', color: '#8C9E38', emoji: '🌾', aliases: ['Hay', 'Heu', 'Wiese', 'Sommerheu'] },
          { id: 'gruener_tee', name: { EN: 'Tea', DE: 'Tee' }, radarDimension: 'floral', color: '#4E8C4A', emoji: '🍵', aliases: ['Tea', 'Green Tea', 'Black Tea', 'Matcha', 'Tee', 'Grüner Tee', 'Schwarztee', 'Sencha'] },
          { id: 'zitronengras', name: { EN: 'Lemongrass', DE: 'Zitronengras' }, radarDimension: 'floral', color: '#7AA336', emoji: '🌿', aliases: ['Lemongrass', 'Zitronengras'] },
          { id: 'blueten_floral', name: { EN: 'Blossom', DE: 'Blüten' }, radarDimension: 'floral', color: '#9E3882', emoji: '🌸', aliases: ['Blossom', 'Blossoms', 'Fresh Blossom', 'Floral', 'Blumig', 'Blüten', 'Floral & Blossoms', 'Blumig & Floral', 'Frühlingsblüten'] },
          { id: 'rose', name: { EN: 'Rose', DE: 'Rose' }, radarDimension: 'floral', color: '#AD2B5E', emoji: '🌹', aliases: ['Rose', 'Rosenwasser', 'Rosenblüten'] },
        ],
      },
      {
        id: 'wald_laub',
        name: { EN: 'Forest & Leaves', DE: 'Wald & Laub' },
        descriptors: [
          { id: 'herbstlaub', name: { EN: 'Leaves', DE: 'Laub' }, radarDimension: 'floral', color: '#8A5D2E', emoji: '🍂', aliases: ['Leaves', 'Autumn Leaves', 'Laub', 'Herbstlaub'] },
          { id: 'waldboden', name: { EN: 'Moss', DE: 'Moos' }, radarDimension: 'floral', color: '#4A5E33', emoji: '🍄', aliases: ['Moss', 'Forest Floor', 'Moos', 'Waldboden', 'Forest Floor & Moss', 'Waldboden & Moos'] },
          { id: 'pilze', name: { EN: 'Mushroom', DE: 'Pilze' }, radarDimension: 'floral', color: '#6E5A48', emoji: '🍄', aliases: ['Mushroom', 'Mushrooms', 'Pilz', 'Pilze', 'Waldpilze'] },
          { id: 'kiefer', name: { EN: 'Pine', DE: 'Kiefer' }, radarDimension: 'floral', color: '#2E5E3A', emoji: '🌲', aliases: ['Pine', 'Pine Needles', 'Kiefer', 'Tannennadeln', 'Fichte'] },
          { id: 'fichtenharz', name: { EN: 'Resin', DE: 'Harz' }, radarDimension: 'floral', color: '#2E5E3A', emoji: '🌲', aliases: ['Resin', 'Pine Resin', 'Harz', 'Fichtenharz', 'Kiefernharz', 'Pine & Resin', 'Kiefernharz & Nadeln'] },
          { id: 'heidekraut', name: { EN: 'Heather', DE: 'Heidekraut' }, radarDimension: 'floral', color: '#824670', emoji: '🪻', aliases: ['Heather', 'Burnt Heather', 'Heidekraut', 'Verbranntes Heidekraut'] },
        ],
      },
      {
        id: 'kraeuter_wuerzig',
        name: { EN: 'Garden Herbs', DE: 'Kräuter & Minze' },
        descriptors: [
          { id: 'minze', name: { EN: 'Mint', DE: 'Minze' }, radarDimension: 'floral', color: '#2B705B', emoji: '🍃', aliases: ['Mint', 'Peppermint', 'Spearmint', 'Minze', 'Pfefferminze', 'Gartenminze', 'Mint & Eucalyptus', 'Minze & Eukalyptus'] },
          { id: 'eukalyptus', name: { EN: 'Eucalyptus', DE: 'Eukalyptus' }, radarDimension: 'floral', color: '#2B705B', emoji: '🍃', aliases: ['Eucalyptus', 'Eukalyptus', 'Menthol'] },
          { id: 'salbei', name: { EN: 'Sage', DE: 'Salbei' }, radarDimension: 'floral', color: '#3E6B52', emoji: '🌿', aliases: ['Sage', 'Salbei'] },
          { id: 'rosmarin', name: { EN: 'Rosemary', DE: 'Rosmarin' }, radarDimension: 'floral', color: '#38634B', emoji: '🌿', aliases: ['Rosemary', 'Rosmarin'] },
          { id: 'thymian', name: { EN: 'Thyme', DE: 'Thymian' }, radarDimension: 'floral', color: '#456B4E', emoji: '🌿', aliases: ['Thyme', 'Thymian'] },
          { id: 'anissaat', name: { EN: 'Anise', DE: 'Anis' }, radarDimension: 'floral', color: '#3B6B4D', emoji: '⭐', aliases: ['Anise', 'Anis', 'Sternanis', 'Anise & Fennel', 'Anis & Fenchel'] },
          { id: 'fenchel', name: { EN: 'Fennel', DE: 'Fenchel' }, radarDimension: 'floral', color: '#427355', emoji: '🌿', aliases: ['Fennel', 'Fenchel', 'Fenchelsamen'] },
          { id: 'lavendel', name: { EN: 'Lavender', DE: 'Lavendel' }, radarDimension: 'floral', color: '#7E4D8A', emoji: '🪻', aliases: ['Lavender', 'Lavendel', 'Lavendelblüten'] },
          { id: 'kamille', name: { EN: 'Chamomile', DE: 'Kamille' }, radarDimension: 'floral', color: '#B3993D', emoji: '🌼', aliases: ['Chamomile', 'Kamille', 'Kamillentee'] },
        ],
      },
    ],
  },

  // ─── 5. SPICY (Gewürze & Schärfe) ─────────────────────────────────────────
  {
    id: 'wuerzig',
    name: { EN: 'Spicy & Baking Spices', DE: 'Gewürze & Schärfe' },
    emoji: '🌶️',
    radarDimension: 'spicy',
    subcategories: [
      {
        id: 'wuerzen',
        name: { EN: 'Spices', DE: 'Gewürze' },
        descriptors: [
          { id: 'zimt', name: { EN: 'Cinnamon', DE: 'Zimt' }, radarDimension: 'spicy', color: '#993D22', emoji: '🪵', aliases: ['Cinnamon', 'Zimt', 'Ceylon-Zimt'] },
          { id: 'nelke', name: { EN: 'Clove', DE: 'Nelke' }, radarDimension: 'spicy', color: '#7A3525', emoji: '🌰', aliases: ['Clove', 'Nelke', 'Gewürznelke'] },
          { id: 'muskat', name: { EN: 'Nutmeg', DE: 'Muskat' }, radarDimension: 'spicy', color: '#854629', emoji: '🌰', aliases: ['Nutmeg', 'Muskat', 'Muskatnuss'] },
          { id: 'ingwer', name: { EN: 'Ginger', DE: 'Ingwer' }, radarDimension: 'spicy', color: '#AD5F1D', emoji: '🫚', aliases: ['Ginger', 'Ingwer', 'Kandierter Ingwer'] },
          { id: 'schwarzer_pfeffer', name: { EN: 'Pepper', DE: 'Pfeffer' }, radarDimension: 'spicy', color: '#A63324', emoji: '🌶️', aliases: ['Pepper', 'Black Pepper', 'White Pepper', 'Pfeffer', 'Schwarzer Pfeffer', 'Geschroteter Pfeffer'] },
          { id: 'chili', name: { EN: 'Chili', DE: 'Chili' }, radarDimension: 'spicy', color: '#B8281D', emoji: '🌶️', aliases: ['Chilli', 'Chili', 'Chilischote', 'Peperoni'] },
          { id: 'kardamom', name: { EN: 'Cardamom', DE: 'Kardamom' }, radarDimension: 'spicy', color: '#8F542A', emoji: '🫛', aliases: ['Cardamom', 'Kardamom', 'Grüner Kardamom'] },
          { id: 'piment', name: { EN: 'Allspice', DE: 'Piment' }, radarDimension: 'spicy', color: '#7C3B24', emoji: '🌶️', aliases: ['Allspice', 'Piment', 'Nelkenpfeffer'] },
          { id: 'koriander', name: { EN: 'Coriander', DE: 'Koriander' }, radarDimension: 'spicy', color: '#6E7A38', emoji: '🌿', aliases: ['Coriander', 'Koriander', 'Koriandersamen'] },
          { id: 'alkohol_rauch', name: { EN: 'Alcohol', DE: 'Alkohol' }, radarDimension: 'spicy', color: '#8F4A28', emoji: '🥃', aliases: ['Alcohol', 'Alkohol', 'Ethanol', 'High Proof', 'High Proof Spirit', 'Fassstärke', 'Cask Strength', 'Alkohol & Fassstärke'] },
        ],
      },
    ],
  },

  // ─── 6. WOODY, OAK & ROASTED (Holzig, Nüsse & Röstaromen) ─────────────────
  {
    id: 'holzig',
    name: { EN: 'Woody, Oak & Roasted', DE: 'Holzig, Nüsse & Röstaromen' },
    emoji: '🪵',
    radarDimension: 'woody',
    subcategories: [
      {
        id: 'holz_typen',
        name: { EN: 'Oak & Casks', DE: 'Eiche & Fässer' },
        descriptors: [
          { id: 'eiche', name: { EN: 'Oak', DE: 'Eiche' }, radarDimension: 'woody', color: '#8B4513', emoji: '🪵', aliases: ['Oak', 'Eiche', 'Toasted Oak', 'Fresh Oak', 'Virgin Oak', 'Vanilla Oak', 'Charred Cask', 'Bourbon Cask', 'Bourbon Barrel', 'Eichenholz', 'Frische Eiche', 'Vanilleeiche', 'Getoastetes Fass', 'Bourbonfass'] },
          { id: 'zeder', name: { EN: 'Cedar', DE: 'Zeder' }, radarDimension: 'woody', color: '#94532B', emoji: '🌲', aliases: ['Cedar', 'Cedarwood', 'Zeder', 'Zedernholz'] },
          { id: 'sandelholz', name: { EN: 'Sandalwood', DE: 'Sandelholz' }, radarDimension: 'woody', color: '#8A583A', emoji: '🪵', aliases: ['Sandalwood', 'Sandelholz'] },
        ],
      },
      {
        id: 'roestaromen',
        name: { EN: 'Roast & Coffee', DE: 'Röstaromen & Kaffee' },
        descriptors: [
          { id: 'espresso', name: { EN: 'Espresso', DE: 'Espresso' }, radarDimension: 'chocolate', color: '#3E251A', emoji: '☕', aliases: ['Espresso'] },
          { id: 'kaffeebohnen', name: { EN: 'Coffee', DE: 'Kaffee' }, radarDimension: 'chocolate', color: '#4A2D1F', emoji: '🫘', aliases: ['Coffee', 'Coffee Beans', 'Kaffeebohnen', 'Kaffee'] },
          { id: 'roestkastanien', name: { EN: 'Chestnut', DE: 'Kastanie' }, radarDimension: 'nutty', color: '#7A4826', emoji: '🌰', aliases: ['Chestnut', 'Chestnuts', 'Maronen', 'Kastanie', 'Kastanien'] },
        ],
      },
      {
        id: 'nussig_oelig',
        name: { EN: 'Nuts', DE: 'Nüsse' },
        descriptors: [
          { id: 'haselnuss', name: { EN: 'Hazelnut', DE: 'Haselnuss' }, radarDimension: 'nutty', color: '#8B6239', emoji: '🌰', aliases: ['Hazelnut', 'Haselnuss', 'Haselnüsse', 'Nüsse'] },
          { id: 'walnuss', name: { EN: 'Walnut', DE: 'Walnuss' }, radarDimension: 'nutty', color: '#7E5733', emoji: '🌰', aliases: ['Walnut', 'Walnuss', 'Walnut Oil', 'Nut Oil', 'Walnussöl', 'Nussöl'] },
          { id: 'gebrannte_mandel', name: { EN: 'Almond', DE: 'Mandel' }, radarDimension: 'nutty', color: '#9C774C', emoji: '🥜', aliases: ['Almond', 'Mandel', 'Mandeln'] },
          { id: 'marzipan', name: { EN: 'Marzipan', DE: 'Marzipan' }, radarDimension: 'nutty', color: '#B08E5D', emoji: '🍬', aliases: ['Marzipan'] },
          { id: 'pekannuss', name: { EN: 'Pecan', DE: 'Pekannuss' }, radarDimension: 'nutty', color: '#8C562E', emoji: '🥜', aliases: ['Pecan', 'Pekannuss'] },
          { id: 'paranuss', name: { EN: 'Peanut', DE: 'Erdnuss' }, radarDimension: 'nutty', color: '#785332', emoji: '🥜', aliases: ['Peanut', 'Erdnuss', 'Brazil Nut', 'Paranuss'] },
          { id: 'macadamia', name: { EN: 'Macadamia', DE: 'Macadamia' }, radarDimension: 'nutty', color: '#A88856', emoji: '🥜', aliases: ['Macadamia'] },
          { id: 'pistazie', name: { EN: 'Pistachio', DE: 'Pistazie' }, radarDimension: 'nutty', color: '#6E8F3D', emoji: '🥜', aliases: ['Pistachio', 'Pistazie'] },
          { id: 'haselnusscreme', name: { EN: 'Nougat', DE: 'Nougat' }, radarDimension: 'nutty', color: '#6E4324', emoji: '🍫', aliases: ['Nougat', 'Nuss-Nougat', 'Nuss-Nougat-Creme'] },
        ],
      },
    ],
  },

  // ─── 7. FRUITY, TROPICAL & CITRUS (Früchte, Tropisch & Zitrus) ─────────────
  {
    id: 'fruchtig',
    name: { EN: 'Fruity, Tropical & Citrus', DE: 'Früchte, Tropisch & Zitrus' },
    emoji: '🍎',
    radarDimension: 'fruity',
    subcategories: [
      {
        id: 'tropisch',
        name: { EN: 'Tropical Fruits', DE: 'Tropische Früchte' },
        descriptors: [
          { id: 'banane', name: { EN: 'Banana', DE: 'Banane' }, radarDimension: 'fruity', color: '#CFA727', emoji: '🍌', aliases: ['Banana', 'Baked Banana', 'Flambeed Banana', 'Banane', 'Gebackene Banane', 'Flambierte Banane'] },
          { id: 'ananas', name: { EN: 'Pineapple', DE: 'Ananas' }, radarDimension: 'fruity', color: '#C49B1F', emoji: '🍍', aliases: ['Pineapple', 'Ananas', 'Tropische Früchte'] },
          { id: 'mango', name: { EN: 'Mango', DE: 'Mango' }, radarDimension: 'fruity', color: '#C9751E', emoji: '🥭', aliases: ['Mango'] },
          { id: 'passionsfrucht', name: { EN: 'Passionfruit', DE: 'Maracuja' }, radarDimension: 'fruity', color: '#C45727', emoji: '🥭', aliases: ['Passionfruit', 'Passion Fruit', 'Maracuja', 'Passionsfrucht'] },
          { id: 'papaya', name: { EN: 'Papaya', DE: 'Papaya' }, radarDimension: 'fruity', color: '#C76A28', emoji: '🥭', aliases: ['Papaya'] },
          { id: 'kiwi', name: { EN: 'Kiwi', DE: 'Kiwi' }, radarDimension: 'fruity', color: '#6E942B', emoji: '🥝', aliases: ['Kiwi'] },
          { id: 'melone', name: { EN: 'Melon', DE: 'Melone' }, radarDimension: 'fruity', color: '#88A832', emoji: '🍈', aliases: ['Melon', 'Melone', 'Honigmelone', 'Zuckermelone'] },
          { id: 'kokosnuss', name: { EN: 'Coconut', DE: 'Kokosnuss' }, radarDimension: 'fruity', color: '#A88D5E', emoji: '🥥', aliases: ['Coconut', 'Kokos', 'Kokosnuss'] },
          { id: 'guave', name: { EN: 'Guave', DE: 'Guave' }, radarDimension: 'fruity', color: '#BD4852', emoji: '🍑', aliases: ['Guava', 'Guave'] },
        ],
      },
      {
        id: 'kernobst_steinobst',
        name: { EN: 'Orchard & Stone Fruit', DE: 'Kern- & Steinobst' },
        descriptors: [
          { id: 'gruener_apfel', name: { EN: 'Apple', DE: 'Apfel' }, radarDimension: 'fruity', color: '#3E8E41', emoji: '🍎', aliases: ['Apple', 'Green Apple', 'Red Apple', 'Baked Apple', 'Apfel', 'Grüner Apfel', 'Roter Apfel', 'Bratapfel'] },
          { id: 'birne', name: { EN: 'Pear', DE: 'Birne' }, radarDimension: 'fruity', color: '#84A338', emoji: '🍐', aliases: ['Pear', 'Birne'] },
          { id: 'quitte', name: { EN: 'Quince', DE: 'Quitte' }, radarDimension: 'fruity', color: '#B39424', emoji: '🍐', aliases: ['Quince', 'Quitte'] },
          { id: 'pfirsich', name: { EN: 'Peach', DE: 'Pfirsich' }, radarDimension: 'fruity', color: '#C2673B', emoji: '🍑', aliases: ['Peach', 'Pfirsich'] },
          { id: 'aprikose', name: { EN: 'Apricot', DE: 'Aprikose' }, radarDimension: 'fruity', color: '#C9732B', emoji: '🍑', aliases: ['Apricot', 'Aprikose'] },
          { id: 'weintrauben', name: { EN: 'Grape', DE: 'Traube' }, radarDimension: 'fruity', color: '#73325B', emoji: '🍇', aliases: ['Grape', 'Grapes', 'Traube', 'Trauben', 'Weintrauben'] },
          { id: 'schwarzkirsche', name: { EN: 'Cherry', DE: 'Kirsche' }, radarDimension: 'fruity', color: '#69182E', emoji: '🍒', aliases: ['Cherry', 'Black Cherry', 'Kirsche', 'Schwarzkirsche'] },
          { id: 'mirabelle', name: { EN: 'Mirabelle', DE: 'Mirabelle' }, radarDimension: 'fruity', color: '#C4912B', emoji: '🍑', aliases: ['Mirabelle'] },
        ],
      },
      {
        id: 'beeren_dunkle_fruechte',
        name: { EN: 'Berries', DE: 'Beeren' },
        descriptors: [
          { id: 'erdbeere', name: { EN: 'Strawberry', DE: 'Erdbeere' }, radarDimension: 'fruity', color: '#BD2838', emoji: '🍓', aliases: ['Strawberry', 'Erdbeere', 'Walderdbeere'] },
          { id: 'rote_johannisbeere', name: { EN: 'Currant', DE: 'Johannisbeere' }, radarDimension: 'fruity', color: '#B51E2B', emoji: '🍒', aliases: ['Currant', 'Redcurrant', 'Rote Johannisbeere', 'Johannisbeere', 'Rote Johannisbeeren'] },
          { id: 'cassis', name: { EN: 'Cassis', DE: 'Cassis' }, radarDimension: 'fruity', color: '#5C1738', emoji: '🫐', aliases: ['Cassis', 'Blackcurrant', 'Schwarze Johannisbeere', 'Schwarze Johannisbeeren'] },
          { id: 'brombeere', name: { EN: 'Blackberry', DE: 'Brombeere' }, radarDimension: 'fruity', color: '#4D153B', emoji: '🫐', aliases: ['Blackberry', 'Brombeere', 'Berries', 'Beeren', 'Waldbeeren'] },
          { id: 'himbeere', name: { EN: 'Raspberry', DE: 'Himbeere' }, radarDimension: 'fruity', color: '#A82548', emoji: '🍓', aliases: ['Raspberry', 'Himbeere'] },
          { id: 'heidelbeere', name: { EN: 'Blueberry', DE: 'Blaubeere' }, radarDimension: 'fruity', color: '#3B3666', emoji: '🫐', aliases: ['Blueberry', 'Heidelbeere', 'Blaubeere'] },
        ],
      },
      {
        id: 'zitrus',
        name: { EN: 'Citrus', DE: 'Zitrus' },
        descriptors: [
          { id: 'lemon_curd', name: { EN: 'Lemon', DE: 'Zitrone' }, radarDimension: 'fruity', color: '#C88210', emoji: '🍋', aliases: ['Lemon', 'Lemon Peel', 'Lemon Curd', 'Citrus', 'Citrus Peel', 'Zitrone', 'Zitronenzeste', 'Zitronenschale', 'Zitrus'] },
          { id: 'orange', name: { EN: 'Orange', DE: 'Orange' }, radarDimension: 'fruity', color: '#C66513', emoji: '🍊', aliases: ['Orange', 'Orange Peel', 'Blood Orange', 'Orangenschale', 'Blutorange', 'Marmelade'] },
          { id: 'grapefruit', name: { EN: 'Grapefruit', DE: 'Grapefruit' }, radarDimension: 'fruity', color: '#BD4532', emoji: '🍊', aliases: ['Grapefruit'] },
          { id: 'limette', name: { EN: 'Lime', DE: 'Limette' }, radarDimension: 'fruity', color: '#689E28', emoji: '🍋', aliases: ['Lime', 'Limette'] },
          { id: 'bergamotte', name: { EN: 'Bergamot', DE: 'Bergamotte' }, radarDimension: 'fruity', color: '#969930', emoji: '🍋', aliases: ['Bergamot', 'Bergamotte', 'Earl Grey'] },
        ],
      },
    ],
  },

  // ─── 8. WINEY & DRIED FRUIT (Weinartig & Trockenobst) ──────────────────────
  {
    id: 'weinartig',
    name: { EN: 'Winey & Dried Fruit', DE: 'Weinartig & Trockenobst' },
    emoji: '🍇',
    radarDimension: 'winey',
    subcategories: [
      {
        id: 'trockenobst',
        name: { EN: 'Dried Fruit', DE: 'Trockenobst' },
        descriptors: [
          { id: 'raisin', name: { EN: 'Raisin', DE: 'Rosine' }, radarDimension: 'winey', color: '#5B1C2E', emoji: '🍇', aliases: ['Raisin', 'Raisins', 'Sultana', 'Sultanas', 'Dark Fruit', 'Dark Fruits', 'Rosine', 'Rosinen', 'Sultaninen', 'Dried Fruit', 'Dried Fruits', 'Trockenfrüchte', 'Trockenobst', 'Dunkle Früchte'] },
          { id: 'dried_fig', name: { EN: 'Fig', DE: 'Feige' }, radarDimension: 'winey', color: '#6E2235', emoji: '🌰', aliases: ['Fig', 'Dried Fig', 'Feige', 'Getrocknete Feige'] },
          { id: 'dattel', name: { EN: 'Date', DE: 'Dattel' }, radarDimension: 'winey', color: '#63271D', emoji: '🌰', aliases: ['Date', 'Dattel'] },
          { id: 'pflaume', name: { EN: 'Plum', DE: 'Pflaume' }, radarDimension: 'winey', color: '#4A1B2E', emoji: '🍑', aliases: ['Prune', 'Plum', 'Plum / Prune', 'Pflaume', 'Backpflaume', 'Zwetschge', 'Rumtopf'] },
        ],
      },
      {
        id: 'weinnoten',
        name: { EN: 'Wine & Sherry', DE: 'Wein & Sherry' },
        descriptors: [
          { id: 'sherry_cask', name: { EN: 'Sherry', DE: 'Sherry' }, radarDimension: 'winey', color: '#7A1F2D', emoji: '🍷', aliases: ['Sherry', 'PX Sherry', 'Sherry Cask', 'Sherry Wine', 'PX', 'Oloroso', 'Sherryfass'] },
          { id: 'portwein', name: { EN: 'Port', DE: 'Portwein' }, radarDimension: 'winey', color: '#6B132B', emoji: '🍷', aliases: ['Port', 'Port Wine', 'Portwein'] },
          { id: 'rotwein', name: { EN: 'Wine', DE: 'Wein' }, radarDimension: 'winey', color: '#731627', emoji: '🍷', aliases: ['Wine', 'Red Wine', 'White Wine', 'Wein', 'Rotwein', 'Weißwein'] },
          { id: 'madeira', name: { EN: 'Madeira', DE: 'Madeira' }, radarDimension: 'winey', color: '#692026', emoji: '🍷', aliases: ['Madeira', 'Madeirawein'] },
          { id: 'rum', name: { EN: 'Rum', DE: 'Rum' }, radarDimension: 'winey', color: '#8C3B22', emoji: '🥃', aliases: ['Rum', 'Rum Cask', 'Rumfass'] },
        ],
      },
    ],
  },

  // ─── 9. SWEETNESS & BAKERY (Süße & Gebäck) ────────────────────────────────
  {
    id: 'suesse',
    name: { EN: 'Sweetness & Bakery', DE: 'Süße & Gebäck' },
    emoji: '🍯',
    radarDimension: 'cereal',
    subcategories: [
      {
        id: 'vanille_cremes',
        name: { EN: 'Vanilla & Creams', DE: 'Vanille & Cremes' },
        descriptors: [
          { id: 'vanilla', name: { EN: 'Vanilla', DE: 'Vanille' }, radarDimension: 'cereal', color: '#CBA038', emoji: '🍦', aliases: ['Vanilla', 'Vanille', 'Süße'] },
          { id: 'vanillepudding', name: { EN: 'Custard', DE: 'Pudding' }, radarDimension: 'cereal', color: '#D4B048', emoji: '🍮', aliases: ['Custard', 'Vanilla Custard', 'Pudding', 'Vanillepudding', 'Creme Brulee', 'Crème Brûlée'] },
          { id: 'marshmallow', name: { EN: 'Marshmallow', DE: 'Marshmallow' }, radarDimension: 'cereal', color: '#C7A867', emoji: '🍬', aliases: ['Marshmallow'] },
        ],
      },
      {
        id: 'honigarten',
        name: { EN: 'Honey', DE: 'Honig' },
        descriptors: [
          { id: 'honig', name: { EN: 'Honey', DE: 'Honig' }, radarDimension: 'cereal', color: '#D49B22', emoji: '🍯', aliases: ['Honey', 'Honig', 'Heather Honey', 'Heidehonig', 'Forest Honey', 'Waldhonig', 'Acacia Honey', 'Akazienhonig'] },
        ],
      },
      {
        id: 'karamell_toffee',
        name: { EN: 'Caramel & Toffee', DE: 'Karamell & Toffee' },
        descriptors: [
          { id: 'karamell', name: { EN: 'Caramel', DE: 'Karamell' }, radarDimension: 'cereal', color: '#A8631E', emoji: '🍮', aliases: ['Caramel', 'Salted Caramel', 'Butterscotch', 'Karamell', 'Salzkaramell', 'Butter-Karamell'] },
          { id: 'toffee', name: { EN: 'Toffee', DE: 'Toffee' }, radarDimension: 'cereal', color: '#945017', emoji: '🍬', aliases: ['Toffee'] },
          { id: 'fudge', name: { EN: 'Fudge', DE: 'Fudge' }, radarDimension: 'cereal', color: '#A15E1F', emoji: '🍬', aliases: ['Fudge', 'Butter-Fudge'] },
          { id: 'ahornsirup', name: { EN: 'Maple', DE: 'Ahornsirup' }, radarDimension: 'cereal', color: '#8F4A18', emoji: '🥞', aliases: ['Maple', 'Maple Syrup', 'Ahornsirup', 'Sirup', 'Syrup'] },
          { id: 'melasse', name: { EN: 'Molasses', DE: 'Melasse' }, radarDimension: 'cereal', color: '#592D14', emoji: '🍯', aliases: ['Molasses', 'Treacle', 'Melasse'] },
          { id: 'brauner_zucker', name: { EN: 'Sugar', DE: 'Zucker' }, radarDimension: 'cereal', color: '#8C4E1D', emoji: '🍬', aliases: ['Sugar', 'Brown Sugar', 'Demerara', 'Zucker', 'Brauner Zucker', 'Rohrzucker'] },
        ],
      },
      {
        id: 'schokolade',
        name: { EN: 'Chocolate & Cocoa', DE: 'Schokolade & Kakao' },
        descriptors: [
          { id: 'dark_chocolate', name: { EN: 'Chocolate', DE: 'Schokolade' }, radarDimension: 'chocolate', color: '#4A2E1B', emoji: '🍫', aliases: ['Chocolate', 'Dark Chocolate', 'Milk Chocolate', 'White Chocolate', 'Schokolade', 'Zartbitter', 'Dunkle Schokolade', 'Milchschokolade', 'Weiße Schokolade', 'Vollmilchschokolade', 'Edelbitter'] },
          { id: 'kakao', name: { EN: 'Cocoa', DE: 'Kakao' }, radarDimension: 'chocolate', color: '#59361E', emoji: '☕', aliases: ['Cocoa', 'Cocoa Nibs', 'Kakao', 'Kakaonibs', 'Kakaopulver'] },
          { id: 'schokotrueffel', name: { EN: 'Truffle', DE: 'Trüffel' }, radarDimension: 'chocolate', color: '#402617', emoji: '🍫', aliases: ['Truffle', 'Chocolate Truffle', 'Trüffel', 'Schokotrüffel'] },
        ],
      },
      {
        id: 'gebaeck_buttrig',
        name: { EN: 'Bakery & Pastry', DE: 'Gebäck & Kuchen' },
        descriptors: [
          { id: 'gebaeck_butter', name: { EN: 'Biscuit', DE: 'Keks' }, radarDimension: 'cereal', color: '#A88B4C', emoji: '🍪', aliases: ['Pastry', 'Biscuit', 'Cookie', 'Gebäck', 'Buttergebäck', 'Buttergebäck / Shortbread', 'Butter Shortbread / Biscuit', 'Keks', 'Shortbread'] },
          { id: 'kuchen', name: { EN: 'Cake', DE: 'Kuchen' }, radarDimension: 'cereal', color: '#B38B4D', emoji: '🍰', aliases: ['Cake', 'Kuchen', 'Torte'] },
          { id: 'brioche', name: { EN: 'Brioche', DE: 'Brioche' }, radarDimension: 'cereal', color: '#B39149', emoji: '🥐', aliases: ['Brioche'] },
          { id: 'waffeln', name: { EN: 'Waffle', DE: 'Waffel' }, radarDimension: 'cereal', color: '#B89754', emoji: '🧇', aliases: ['Waffle', 'Waffles', 'Waffel', 'Waffeln'] },
          { id: 'croissant', name: { EN: 'Croissant', DE: 'Croissant' }, radarDimension: 'cereal', color: '#A68449', emoji: '🥐', aliases: ['Croissant', 'Cinnamon Roll', 'Zimtschnecke'] },
          { id: 'brotkruste', name: { EN: 'Bread', DE: 'Brot' }, radarDimension: 'cereal', color: '#8F6B38', emoji: '🍞', aliases: ['Bread', 'Bread Crust', 'Brot', 'Brotkruste'] },
        ],
      },
      {
        id: 'malz_cerealien',
        name: { EN: 'Malt & Grain', DE: 'Malz & Getreide' },
        descriptors: [
          { id: 'gemaelzte_gerste', name: { EN: 'Malt', DE: 'Malz' }, radarDimension: 'cereal', color: '#9C7A3C', emoji: '🌾', aliases: ['Malt', 'Malted Barley', 'Barley Malt', 'Malt Syrup', 'Wort', 'Malz', 'Gerstenmalz', 'Malzsirup', 'Malzmaische'] },
          { id: 'gerste', name: { EN: 'Barley', DE: 'Gerste' }, radarDimension: 'cereal', color: '#8A682D', emoji: '🌾', aliases: ['Barley', 'Gerste'] },
          { id: 'weizen', name: { EN: 'Wheat', DE: 'Weizen' }, radarDimension: 'cereal', color: '#B89B48', emoji: '🌾', aliases: ['Wheat', 'Weizen', 'Weizenmalz'] },
          { id: 'roggenbrot', name: { EN: 'Rye', DE: 'Roggen' }, radarDimension: 'cereal', color: '#75542C', emoji: '🌾', aliases: ['Rye', 'Roggen', 'Rye Bread', 'Roggenbrot'] },
          { id: 'haferbrei', name: { EN: 'Oats', DE: 'Hafer' }, radarDimension: 'cereal', color: '#9E8A5E', emoji: '🥣', aliases: ['Oatmeal', 'Oats', 'Porridge', 'Oats / Porridge', 'Granola', 'Hafer', 'Haferflocken'] },
          { id: 'butter_popcorn', name: { EN: 'Popcorn', DE: 'Popcorn' }, radarDimension: 'cereal', color: '#BA9B47', emoji: '🍿', aliases: ['Popcorn', 'Butter Popcorn'] },
          { id: 'geroesteter_mais', name: { EN: 'Corn', DE: 'Mais' }, radarDimension: 'cereal', color: '#AD8939', emoji: '🌽', aliases: ['Corn', 'Mais'] },
        ],
      },
    ],
  },
];

// ─── Custom Flavor Registry & Storage ────────────────────────────────────────

const CUSTOM_FLAVORS_STORAGE_KEY = 'aquavitaeum_custom_flavors';

let runtimeCustomFlavors: CustomFlavorDescriptor[] = [];

function isNameCoveredByStandardTaxonomy(name: string): boolean {
  const q = name.trim().toLowerCase();
  if (!q) return false;
  return SPIRIT_FLAVOR_TAXONOMY.some((cat) =>
    cat.subcategories.some((sub) =>
      sub.descriptors.some(
        (d) =>
          d.id.toLowerCase() === q ||
          d.name.EN.toLowerCase() === q ||
          d.name.DE.toLowerCase() === q ||
          (d.aliases || []).some((a) => a.toLowerCase() === q)
      )
    )
  );
}

export function inferEmojiFromTagName(name: string, fallback = '🥃'): string {
  const q = (name || '').toLowerCase();
  if (/(lemon|zitrone|lime|limette|citrus|zitrus|bergamot)/i.test(q)) return '🍋';
  if (/(orange|grapefruit|mandarin|tangerine)/i.test(q)) return '🍊';
  if (/(apple|apfel)/i.test(q)) return '🍎';
  if (/(pear|birne|quince|quitte)/i.test(q)) return '🍐';
  if (/(banana|banane)/i.test(q)) return '🍌';
  if (/(pineapple|ananas)/i.test(q)) return '🍍';
  if (/(mango|papaya|maracuja|passion)/i.test(q)) return '🥭';
  if (/(cherry|kirsche|currant|johannisbeere)/i.test(q)) return '🍒';
  if (/(strawberry|erdbeere|raspberry|himbeere)/i.test(q)) return '🍓';
  if (/(berry|beere|cassis|blueberry|blackberry|brombeere|blaubeere)/i.test(q)) return '🫐';
  if (/(peach|pfirsich|apricot|aprikose|plum|pflaume|mirabelle|guava|guave)/i.test(q)) return '🍑';
  if (/(grape|traube|raisin|rosine|wine|wein)/i.test(q)) return '🍇';
  if (/(coconut|kokos)/i.test(q)) return '🥥';
  if (/(smoke|rauch|ash|asche)/i.test(q)) return '💨';
  if (/(peat|torf|fire|feuer)/i.test(q)) return '🔥';
  if (/(oak|eiche|wood|holz|cask|fass|cedar|zeder|cinnamon|zimt)/i.test(q)) return '🪵';
  if (/(vanilla|vanille)/i.test(q)) return '🍦';
  if (/(honey|honig|molasses|melasse)/i.test(q)) return '🍯';
  if (/(caramel|karamell|custard|pudding|brulee)/i.test(q)) return '🍮';
  if (/(chocolate|schokolade|truffle|trüffel|nougat)/i.test(q)) return '🍫';
  if (/(coffee|kaffee|espresso|cocoa|kakao)/i.test(q)) return '☕';
  if (/(salt|salz)/i.test(q)) return '🧂';
  if (/(sea|meer|brine|sole|ocean|maritim)/i.test(q)) return '🌊';
  if (/(leather|leder)/i.test(q)) return '👞';
  if (/(tobacco|tabak|leaves|laub)/i.test(q)) return '🍂';
  if (/(wax|wachs)/i.test(q)) return '🕯️';
  if (/(pepper|pfeffer|chili|spice|würz)/i.test(q)) return '🌶️';
  if (/(ginger|ingwer)/i.test(q)) return '🫚';
  if (/(nut|nuss|almond|mandel|pecan|peanut|erdnuss)/i.test(q)) return '🥜';
  if (/(malt|malz|barley|gerste|wheat|weizen|rye|roggen|hay|heu)/i.test(q)) return '🌾';
  if (/(bread|brot)/i.test(q)) return '🍞';
  if (/(biscuit|keks|cookie|shortbread)/i.test(q)) return '🍪';
  if (/(mint|minze|eucalyptus|eukalyptus|herb|kraut)/i.test(q)) return '🌿';
  if (/(sherry|port|madeira)/i.test(q)) return '🍷';
  return fallback;
}

const VALID_RADAR_DIMENSIONS = new Set<keyof FlavorProfile>(
  Object.keys(RADAR_DIMENSION_COLORS) as Array<keyof FlavorProfile>
);

export function getStoredCustomFlavors(): CustomFlavorDescriptor[] {
  if (typeof window === 'undefined') {
    return runtimeCustomFlavors;
  }
  try {
    const raw = localStorage.getItem(CUSTOM_FLAVORS_STORAGE_KEY);
    if (!raw) return runtimeCustomFlavors;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cleaned: CustomFlavorDescriptor[] = parsed
        .filter((item): item is CustomFlavorDescriptor => {
          if (!item || typeof item !== 'object') return false;
          const cf = item as Partial<CustomFlavorDescriptor>;
          if (typeof cf.id !== 'string' || !cf.id.trim() || cf.id.length > 120) return false;
          if (typeof cf.name !== 'string' || !cf.name.trim() || cf.name.length > 120) return false;
          if (typeof cf.emoji !== 'string' || !cf.emoji.trim() || cf.emoji.length > 16) return false;
          if (!cf.radarDimension || !VALID_RADAR_DIMENSIONS.has(cf.radarDimension)) return false;
          if (isNameCoveredByStandardTaxonomy(cf.name)) return false;
          return true;
        })
        .map((cf) => ({
          id: cf.id.trim(),
          name: cf.name.trim(),
          emoji: cf.emoji || inferEmojiFromTagName(cf.name),
          radarDimension: cf.radarDimension,
          categoryId:
            typeof cf.categoryId === 'string' && cf.categoryId.trim()
              ? cf.categoryId.trim().slice(0, 120)
              : undefined,
          color: typeof cf.color === 'string' && cf.color.length <= 32 ? cf.color : undefined,
          description:
            typeof cf.description === 'string' && cf.description.trim()
              ? cf.description.trim().slice(0, 300)
              : undefined,
          subcategoryId:
            typeof cf.subcategoryId === 'string' && cf.subcategoryId.trim()
              ? cf.subcategoryId.trim().slice(0, 120)
              : undefined,
        }));
      runtimeCustomFlavors = cleaned;
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(CUSTOM_FLAVORS_STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch {
    // ignore parse error
  }
  return runtimeCustomFlavors;
}

export function registerCustomFlavor(flavor: CustomFlavorDescriptor): void {
  const current = getStoredCustomFlavors();
  const existingIdx = current.findIndex(
    (f) =>
      f.id.toLowerCase() === flavor.id.toLowerCase() ||
      f.name.toLowerCase() === flavor.name.toLowerCase()
  );
  let updated: CustomFlavorDescriptor[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = flavor;
  } else {
    updated = [...current, flavor];
  }
  runtimeCustomFlavors = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_FLAVORS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

export function updateStoredCustomFlavor(targetId: string, updatedFlavor: CustomFlavorDescriptor): void {
  const current = getStoredCustomFlavors();
  const idx = current.findIndex((f) => f.id.toLowerCase() === targetId.toLowerCase());
  const updated = idx >= 0
    ? current.map((f, i) => (i === idx ? updatedFlavor : f))
    : [...current, updatedFlavor];
  runtimeCustomFlavors = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_FLAVORS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

export function deleteStoredCustomFlavor(id: string): void {
  const current = getStoredCustomFlavors();
  const updated = current.filter(
    (f) =>
      f.id.toLowerCase() !== id.toLowerCase() &&
      f.name.toLowerCase() !== id.toLowerCase()
  );
  runtimeCustomFlavors = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_FLAVORS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

// ─── Standard Flavor Overrides (Editable & Deletable Standard Descriptors) ──

export interface StandardFlavorOverride {
  id: string;
  name: { EN: string; DE: string };
  radarDimension: keyof FlavorProfile;
  categoryId?: string;
  emoji?: string;
  color?: string;
  description?: string;
  subcategoryId?: string;
  deleted?: boolean;
}

const STANDARD_FLAVOR_OVERRIDES_KEY = 'aquavitaeum_standard_flavor_overrides';

let runtimeStandardOverrides: Record<string, StandardFlavorOverride> = {};

export function getStandardFlavorOverrides(): Record<string, StandardFlavorOverride> {
  if (typeof window === 'undefined') {
    return runtimeStandardOverrides;
  }
  try {
    const raw = localStorage.getItem(STANDARD_FLAVOR_OVERRIDES_KEY);
    if (!raw) return runtimeStandardOverrides;
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const sanitized: Record<string, StandardFlavorOverride> = {};
      for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
        if (!val || typeof val !== 'object') continue;
        const ov = val as Partial<StandardFlavorOverride>;
        if (typeof ov.id !== 'string' || !ov.id.trim() || ov.id.length > 120) continue;
        if (!ov.radarDimension || !VALID_RADAR_DIMENSIONS.has(ov.radarDimension)) continue;
        if (
          !ov.name ||
          typeof ov.name !== 'object' ||
          typeof ov.name.EN !== 'string' ||
          typeof ov.name.DE !== 'string'
        ) {
          continue;
        }
        sanitized[key] = {
          id: ov.id.trim(),
          name: {
            EN: ov.name.EN.slice(0, 120),
            DE: ov.name.DE.slice(0, 120),
          },
          radarDimension: ov.radarDimension,
          categoryId:
            typeof ov.categoryId === 'string' && ov.categoryId.trim()
              ? ov.categoryId.trim().slice(0, 120)
              : undefined,
          emoji: typeof ov.emoji === 'string' && ov.emoji.length <= 16 ? ov.emoji : undefined,
          color: typeof ov.color === 'string' && ov.color.length <= 32 ? ov.color : undefined,
          description:
            typeof ov.description === 'string' && ov.description.trim()
              ? ov.description.trim().slice(0, 300)
              : undefined,
          subcategoryId:
            typeof ov.subcategoryId === 'string'
              ? ov.subcategoryId.trim().slice(0, 120)
              : undefined,
          deleted: Boolean(ov.deleted),
        };
      }
      runtimeStandardOverrides = sanitized;
      return runtimeStandardOverrides;
    }
  } catch {
    // ignore parse error
  }
  return runtimeStandardOverrides;
}

export function saveStandardFlavorOverride(override: StandardFlavorOverride): void {
  const current = { ...getStandardFlavorOverrides(), [override.id]: override };
  runtimeStandardOverrides = current;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STANDARD_FLAVOR_OVERRIDES_KEY, JSON.stringify(current));
    } catch {
      // ignore
    }
  }
}

export function deleteStandardFlavor(id: string): void {
  saveStandardFlavorOverride({
    id,
    name: { EN: '', DE: '' },
    radarDimension: 'fruity',
    deleted: true,
  });
}

export function resetStandardFlavorOverride(id: string): void {
  const current = { ...getStandardFlavorOverrides() };
  delete current[id];
  runtimeStandardOverrides = current;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STANDARD_FLAVOR_OVERRIDES_KEY, JSON.stringify(current));
    } catch {
      // ignore
    }
  }
}

// ─── Custom & Overridden Main Categories (Min 3, Max 12) ───────────────────

const CUSTOM_CATEGORIES_STORAGE_KEY = 'aquavitaeum_custom_categories';
let runtimeCustomCategories: CustomFlavorCategory[] = [];

export function getStoredCustomCategories(): CustomFlavorCategory[] {
  if (typeof window === 'undefined') {
    return runtimeCustomCategories;
  }
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY);
    if (!raw) return runtimeCustomCategories;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cleaned: CustomFlavorCategory[] = parsed
        .filter((item): item is CustomFlavorCategory => {
          if (!item || typeof item !== 'object') return false;
          const cat = item as Partial<CustomFlavorCategory>;
          if (typeof cat.id !== 'string' || !cat.id.trim() || cat.id.length > 120) return false;
          const isDeleted = Boolean(cat.deleted);
          if (typeof cat.name !== 'string' || (!isDeleted && !cat.name.trim()) || cat.name.length > 120) {
            return false;
          }
          if (typeof cat.emoji !== 'string' || (!isDeleted && !cat.emoji.trim()) || cat.emoji.length > 16) {
            return false;
          }
          if (typeof cat.color !== 'string' || !cat.color.trim() || cat.color.length > 32) {
            return false;
          }
          if (!cat.radarDimension || !VALID_RADAR_DIMENSIONS.has(cat.radarDimension)) return false;
          return true;
        })
        .map((cat) => ({
          id: cat.id.trim(),
          name: cat.name.trim(),
          emoji: cat.emoji.trim(),
          color: cat.color.trim(),
          radarDimension: cat.radarDimension,
          deleted: Boolean(cat.deleted),
        }));
      runtimeCustomCategories = cleaned;
      return cleaned;
    }
  } catch {
    // ignore parse error
  }
  return runtimeCustomCategories;
}

export function saveCustomCategory(cat: CustomFlavorCategory): boolean {
  const current = getStoredCustomCategories();
  const isDefaultCat = SPIRIT_FLAVOR_TAXONOMY.some(
    (d) => d.id.toLowerCase() === cat.id.toLowerCase()
  );
  const existingIdx = current.findIndex(
    (c) => c.id.toLowerCase() === cat.id.toLowerCase()
  );

  // Enforce MAX_FLAVOR_CATEGORIES when creating a brand-new active category
  if (!cat.deleted && !isDefaultCat && existingIdx < 0) {
    const activeCount = getEffectiveFlavorTaxonomy().length;
    if (activeCount >= MAX_FLAVOR_CATEGORIES) {
      return false;
    }
  }

  const sanitized: CustomFlavorCategory = {
    id: cat.id.trim(),
    name: cat.name.trim(),
    emoji: cat.emoji.trim(),
    color: cat.color.trim(),
    radarDimension: cat.radarDimension,
    deleted: Boolean(cat.deleted),
  };

  const updated =
    existingIdx >= 0
      ? current.map((c, i) => (i === existingIdx ? sanitized : c))
      : [...current, sanitized];

  runtimeCustomCategories = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return true;
}

export function deleteCustomCategory(categoryId: string): boolean {
  const targetIdLower = categoryId.trim().toLowerCase();
  const activeTaxonomy = getEffectiveFlavorTaxonomy();
  const targetActiveCat = activeTaxonomy.find((c) => c.id.toLowerCase() === targetIdLower);

  // Enforce MIN_FLAVOR_CATEGORIES (at least 3 axes for 2D radar polygon)
  if (targetActiveCat && activeTaxonomy.length <= MIN_FLAVOR_CATEGORIES) {
    return false;
  }

  const defaultCat = SPIRIT_FLAVOR_TAXONOMY.find((c) => c.id.toLowerCase() === targetIdLower);
  const current = getStoredCustomCategories();

  if (defaultCat) {
    const tombstone: CustomFlavorCategory = {
      id: defaultCat.id,
      name: defaultCat.name.DE,
      emoji: defaultCat.emoji,
      color: RADAR_DIMENSION_COLORS[defaultCat.radarDimension] ?? '#C59B27',
      radarDimension: defaultCat.radarDimension,
      deleted: true,
    };
    const existingIdx = current.findIndex((c) => c.id.toLowerCase() === targetIdLower);
    const updated =
      existingIdx >= 0
        ? current.map((c, i) => (i === existingIdx ? tombstone : c))
        : [...current, tombstone];
    runtimeCustomCategories = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  } else {
    const updated = current.filter((c) => c.id.toLowerCase() !== targetIdLower);
    runtimeCustomCategories = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  }

  // Cascade delete subcategories belonging to this category
  const allSubs = getStoredCustomSubcategories();
  for (const sub of allSubs) {
    if (sub.categoryId.toLowerCase() === targetIdLower) {
      deleteCustomSubcategory(sub.id);
    }
  }

  // Cascade delete custom flavors belonging to this category
  if (targetActiveCat) {
    const customFlavors = getStoredCustomFlavors();
    const remainingCustom = customFlavors.filter(
      (cf) => !isCustomFlavorInCategory(cf, targetActiveCat)
    );
    if (remainingCustom.length !== customFlavors.length) {
      runtimeCustomFlavors = remainingCustom;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CUSTOM_FLAVORS_STORAGE_KEY, JSON.stringify(remainingCustom));
        } catch {
          // ignore
        }
      }
    }

    // Cascade delete standard descriptors currently residing in this category
    for (const sub of targetActiveCat.subcategories) {
      for (const desc of sub.descriptors) {
        deleteStandardFlavor(desc.id);
      }
    }
  }

  return true;
}

export function resetCustomCategories(): void {
  runtimeCustomCategories = [];
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CUSTOM_CATEGORIES_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export function isCustomFlavorInCategory(
  cf: Pick<CustomFlavorDescriptor, 'categoryId' | 'radarDimension'>,
  category: Pick<FlavorCategory, 'id' | 'radarDimension'>
): boolean {
  if (cf.categoryId) {
    return cf.categoryId.toLowerCase() === category.id.toLowerCase();
  }
  const isDefaultCategory = SPIRIT_FLAVOR_TAXONOMY.some(
    (c) => c.id.toLowerCase() === category.id.toLowerCase()
  );
  if (!isDefaultCategory) return false;
  if (category.radarDimension === cf.radarDimension) return true;
  if (category.id === 'suesse' && cf.radarDimension === 'chocolate') return true;
  if (category.id === 'holzig' && cf.radarDimension === 'nutty') return true;
  return false;
}

// ─── Default & Custom Subcategories (Variant B Inheritance Folders) ─────────

export interface DefaultSubcategorySpec {
  id: string;
  name: { DE: string; EN: string };
  categoryId: string;
  emoji: string;
}

export const DEFAULT_FLAVOR_SUBCATEGORIES: DefaultSubcategorySpec[] = [
  // 1. Torf & Rauch
  { id: 'sub_medizinisch', name: { DE: 'Medizinisch', EN: 'Medicinal' }, categoryId: 'torf', emoji: '🧪' },
  // 2. Leder, Fleischig & Wachs
  { id: 'sub_herzhaft', name: { DE: 'Herzhaft', EN: 'Savory' }, categoryId: 'feinty', emoji: '🥩' },
  { id: 'sub_wachs', name: { DE: 'Wachs', EN: 'Wax' }, categoryId: 'feinty', emoji: '🕯️' },
  // 3. Maritim & Mineralisch
  { id: 'sub_gestein', name: { DE: 'Gestein', EN: 'Minerals' }, categoryId: 'maritim', emoji: '🪨' },
  // 4. Kräuter, Laub & Grasig
  { id: 'sub_floral', name: { DE: 'Floral', EN: 'Floral' }, categoryId: 'pflanzlich', emoji: '🌸' },
  { id: 'sub_kraeuter', name: { DE: 'Kräuter', EN: 'Herbs' }, categoryId: 'pflanzlich', emoji: '🍃' },
  // 5. Gewürze & Schärfe
  { id: 'sub_schaerfe', name: { DE: 'Schärfe', EN: 'Pungent' }, categoryId: 'wuerzig', emoji: '🌶️' },
  // 6. Holzig, Nüsse & Röstaromen
  { id: 'sub_nuesse', name: { DE: 'Nüsse', EN: 'Nuts' }, categoryId: 'holzig', emoji: '🥜' },
  { id: 'sub_roest', name: { DE: 'Röstaromen', EN: 'Roast' }, categoryId: 'holzig', emoji: '☕' },
  // 7. Früchte, Tropisch & Zitrus
  { id: 'sub_zitrus', name: { DE: 'Zitrus', EN: 'Citrus' }, categoryId: 'fruchtig', emoji: '🍋' },
  { id: 'sub_tropisch', name: { DE: 'Tropisch', EN: 'Tropical' }, categoryId: 'fruchtig', emoji: '🥭' },
  { id: 'sub_beeren', name: { DE: 'Beeren', EN: 'Berries' }, categoryId: 'fruchtig', emoji: '🍓' },
  // 8. Weinartig & Trockenobst
  { id: 'sub_trockenobst', name: { DE: 'Trockenobst', EN: 'Dried Fruit' }, categoryId: 'weinartig', emoji: '🍇' },
  // 9. Süße & Gebäck
  { id: 'sub_karamell', name: { DE: 'Karamell', EN: 'Caramel' }, categoryId: 'suesse', emoji: '🍮' },
  { id: 'sub_schokolade', name: { DE: 'Schokolade', EN: 'Chocolate' }, categoryId: 'suesse', emoji: '🍫' },
  { id: 'sub_gebaeck', name: { DE: 'Gebäck', EN: 'Bakery' }, categoryId: 'suesse', emoji: '🍪' },
  { id: 'sub_getreide', name: { DE: 'Getreide', EN: 'Grain' }, categoryId: 'suesse', emoji: '🌾' },
];

export const DEFAULT_DESCRIPTOR_SUBCATEGORY_MAP: Record<string, string> = {
  // Torf -> Medizinisch
  jod: 'sub_medizinisch',
  medizinisch_note: 'sub_medizinisch',
  desinfektionsmittel: 'sub_medizinisch',
  heftpflaster: 'sub_medizinisch',
  // Feinty -> Herzhaft & Wachs
  fleischig: 'sub_herzhaft',
  speck: 'sub_herzhaft',
  bienenwachs: 'sub_wachs',
  kerzenwachs: 'sub_wachs',
  honigwabe: 'sub_wachs',
  // Maritim -> Gestein
  feuerstein: 'sub_gestein',
  schiefer: 'sub_gestein',
  kreide: 'sub_gestein',
  // Pflanzlich -> Floral & Kräuter
  blueten_floral: 'sub_floral',
  rose: 'sub_floral',
  heidekraut: 'sub_floral',
  lavendel: 'sub_floral',
  kamille: 'sub_floral',
  minze: 'sub_kraeuter',
  eukalyptus: 'sub_kraeuter',
  salbei: 'sub_kraeuter',
  rosmarin: 'sub_kraeuter',
  thymian: 'sub_kraeuter',
  zitronengras: 'sub_kraeuter',
  anissaat: 'sub_kraeuter',
  fenchel: 'sub_kraeuter',
  // Würzig -> Schärfe
  schwarzer_pfeffer: 'sub_schaerfe',
  chili: 'sub_schaerfe',
  ingwer: 'sub_schaerfe',
  // Holzig -> Nüsse & Röstaromen
  haselnuss: 'sub_nuesse',
  walnuss: 'sub_nuesse',
  gebrannte_mandel: 'sub_nuesse',
  marzipan: 'sub_nuesse',
  pekannuss: 'sub_nuesse',
  paranuss: 'sub_nuesse',
  macadamia: 'sub_nuesse',
  pistazie: 'sub_nuesse',
  roestkastanien: 'sub_nuesse',
  haselnusscreme: 'sub_nuesse',
  espresso: 'sub_roest',
  kaffeebohnen: 'sub_roest',
  // Fruchtig -> Zitrus, Tropisch, Beeren
  lemon_curd: 'sub_zitrus',
  orange: 'sub_zitrus',
  grapefruit: 'sub_zitrus',
  limette: 'sub_zitrus',
  bergamotte: 'sub_zitrus',
  banane: 'sub_tropisch',
  ananas: 'sub_tropisch',
  mango: 'sub_tropisch',
  passionsfrucht: 'sub_tropisch',
  papaya: 'sub_tropisch',
  kiwi: 'sub_tropisch',
  melone: 'sub_tropisch',
  kokosnuss: 'sub_tropisch',
  guave: 'sub_tropisch',
  erdbeere: 'sub_beeren',
  rote_johannisbeere: 'sub_beeren',
  cassis: 'sub_beeren',
  brombeere: 'sub_beeren',
  himbeere: 'sub_beeren',
  heidelbeere: 'sub_beeren',
  // Weinartig -> Trockenobst
  raisin: 'sub_trockenobst',
  dried_fig: 'sub_trockenobst',
  dattel: 'sub_trockenobst',
  pflaume: 'sub_trockenobst',
  // Süße -> Karamell, Schokolade, Gebäck, Getreide
  karamell: 'sub_karamell',
  toffee: 'sub_karamell',
  fudge: 'sub_karamell',
  dark_chocolate: 'sub_schokolade',
  kakao: 'sub_schokolade',
  schokotrueffel: 'sub_schokolade',
  gebaeck_butter: 'sub_gebaeck',
  kuchen: 'sub_gebaeck',
  brioche: 'sub_gebaeck',
  waffeln: 'sub_gebaeck',
  croissant: 'sub_gebaeck',
  brotkruste: 'sub_gebaeck',
  gemaelzte_gerste: 'sub_getreide',
  gerste: 'sub_getreide',
  weizen: 'sub_getreide',
  roggenbrot: 'sub_getreide',
  haferbrei: 'sub_getreide',
  butter_popcorn: 'sub_getreide',
  geroesteter_mais: 'sub_getreide',
};

const CUSTOM_SUBCATEGORIES_STORAGE_KEY = 'aquavitaeum_custom_subcategories';
const DELETED_DEFAULT_SUBCATEGORIES_KEY = 'aquavitaeum_deleted_default_subcategories';
let runtimeCustomSubcategories: CustomFlavorSubcategory[] = [];
let runtimeDeletedDefaultSubcategories: Set<string> = new Set();

function getDeletedDefaultSubcategories(): Set<string> {
  if (typeof window === 'undefined') return runtimeDeletedDefaultSubcategories;
  try {
    const raw = localStorage.getItem(DELETED_DEFAULT_SUBCATEGORIES_KEY);
    if (!raw) return runtimeDeletedDefaultSubcategories;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      runtimeDeletedDefaultSubcategories = new Set(
        parsed.filter((x): x is string => typeof x === 'string')
      );
      return runtimeDeletedDefaultSubcategories;
    }
  } catch {
    // ignore
  }
  return runtimeDeletedDefaultSubcategories;
}

function getRawUserSubcategories(): CustomFlavorSubcategory[] {
  if (typeof window === 'undefined') {
    return runtimeCustomSubcategories;
  }
  try {
    const raw = localStorage.getItem(CUSTOM_SUBCATEGORIES_STORAGE_KEY);
    if (!raw) return runtimeCustomSubcategories;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const customCats = getStoredCustomCategories();
      const validCatIds = new Set([
        ...SPIRIT_FLAVOR_TAXONOMY.map((c) => c.id),
        ...customCats.filter((c) => !c.deleted).map((c) => c.id),
      ]);
      const cleaned: CustomFlavorSubcategory[] = parsed
        .filter((item): item is CustomFlavorSubcategory => {
          if (!item || typeof item !== 'object') return false;
          const sub = item as Partial<CustomFlavorSubcategory>;
          if (typeof sub.id !== 'string' || !sub.id.trim() || sub.id.length > 120) return false;
          if (typeof sub.name !== 'string' || !sub.name.trim() || sub.name.length > 120) return false;
          if (typeof sub.categoryId !== 'string' || !validCatIds.has(sub.categoryId)) return false;
          return true;
        })
        .map((sub) => ({
          id: sub.id.trim(),
          name: sub.name.trim(),
          categoryId: sub.categoryId,
          emoji: typeof sub.emoji === 'string' && sub.emoji.trim().length <= 16 ? sub.emoji.trim() : undefined,
        }));
      runtimeCustomSubcategories = cleaned;
      return cleaned;
    }
  } catch {
    // ignore parse error
  }
  return runtimeCustomSubcategories;
}

export function getStoredCustomSubcategories(language: 'DE' | 'EN' = 'DE'): CustomFlavorSubcategory[] {
  const deletedDefaults = getDeletedDefaultSubcategories();
  const userSubs = getRawUserSubcategories();
  const userSubMap = new Map(userSubs.map((s) => [s.id.toLowerCase(), s]));

  const defaults: CustomFlavorSubcategory[] = DEFAULT_FLAVOR_SUBCATEGORIES
    .filter((d) => !deletedDefaults.has(d.id))
    .map((d) => {
      const overridden = userSubMap.get(d.id.toLowerCase());
      if (overridden) {
        userSubMap.delete(d.id.toLowerCase());
        return overridden;
      }
      return {
        id: d.id,
        name: d.name[language] ?? d.name.DE,
        categoryId: d.categoryId,
        emoji: d.emoji,
      };
    });

  return [...defaults, ...Array.from(userSubMap.values())];
}

export function saveCustomSubcategory(sub: CustomFlavorSubcategory): void {
  const deletedDefaults = getDeletedDefaultSubcategories();
  if (deletedDefaults.has(sub.id)) {
    deletedDefaults.delete(sub.id);
    runtimeDeletedDefaultSubcategories = new Set(deletedDefaults);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DELETED_DEFAULT_SUBCATEGORIES_KEY, JSON.stringify([...deletedDefaults]));
      } catch {
        // ignore
      }
    }
  }

  const current = getRawUserSubcategories();
  const idx = current.findIndex((s) => s.id.toLowerCase() === sub.id.toLowerCase());
  const updated =
    idx >= 0 ? current.map((s, i) => (i === idx ? sub : s)) : [...current, sub];
  runtimeCustomSubcategories = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_SUBCATEGORIES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

export function deleteCustomSubcategory(subId: string): void {
  const isDefault = DEFAULT_FLAVOR_SUBCATEGORIES.some((d) => d.id.toLowerCase() === subId.toLowerCase());
  if (isDefault) {
    const deletedDefaults = getDeletedDefaultSubcategories();
    deletedDefaults.add(subId);
    runtimeDeletedDefaultSubcategories = new Set(deletedDefaults);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DELETED_DEFAULT_SUBCATEGORIES_KEY, JSON.stringify([...deletedDefaults]));
      } catch {
        // ignore
      }
    }
  }

  const current = getRawUserSubcategories();
  const updated = current.filter((s) => s.id.toLowerCase() !== subId.toLowerCase());
  runtimeCustomSubcategories = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_SUBCATEGORIES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  // Unassign any custom flavors that were inside this deleted subcategory
  const customFlavors = getStoredCustomFlavors();
  let customChanged = false;
  const updatedCustom = customFlavors.map((cf) => {
    if (cf.subcategoryId === subId) {
      customChanged = true;
      return { ...cf, subcategoryId: undefined };
    }
    return cf;
  });
  if (customChanged) {
    runtimeCustomFlavors = updatedCustom;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CUSTOM_FLAVORS_STORAGE_KEY, JSON.stringify(updatedCustom));
      } catch {
        // ignore
      }
    }
  }

  // Unassign any standard flavor overrides that were inside this deleted subcategory
  const overrides = getStandardFlavorOverrides();
  let overridesChanged = false;
  const updatedOverrides: Record<string, StandardFlavorOverride> = {};
  for (const [k, ov] of Object.entries(overrides)) {
    if (ov.subcategoryId === subId) {
      overridesChanged = true;
      updatedOverrides[k] = { ...ov, subcategoryId: '' };
    } else {
      updatedOverrides[k] = ov;
    }
  }
  if (overridesChanged) {
    runtimeStandardOverrides = updatedOverrides;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STANDARD_FLAVOR_OVERRIDES_KEY, JSON.stringify(updatedOverrides));
      } catch {
        // ignore
      }
    }
  }
}

export function resetCustomSubcategories(): void {
  runtimeCustomSubcategories = [];
  runtimeDeletedDefaultSubcategories = new Set();
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CUSTOM_SUBCATEGORIES_STORAGE_KEY);
      localStorage.removeItem(DELETED_DEFAULT_SUBCATEGORIES_KEY);
    } catch {
      // ignore
    }
  }
}

export function assignAromaToSubcategory(
  aromaId: string,
  isCustom: boolean,
  subcategoryId: string | undefined
): void {
  if (isCustom) {
    const customFlavors = getStoredCustomFlavors();
    const target = customFlavors.find((cf) => cf.id.toLowerCase() === aromaId.toLowerCase());
    if (target) {
      updateStoredCustomFlavor(target.id, {
        ...target,
        subcategoryId: subcategoryId || undefined,
      });
    }
    return;
  }

  // Standard descriptor (use '' to explicitly mark as unassigned/General so it overrides DEFAULT_DESCRIPTOR_SUBCATEGORY_MAP)
  const effectiveSubId = subcategoryId === undefined ? '' : subcategoryId;
  const overrides = getStandardFlavorOverrides();
  const existingOv = overrides[aromaId];
  if (existingOv) {
    saveStandardFlavorOverride({
      ...existingOv,
      subcategoryId: effectiveSubId,
    });
    return;
  }

  // Find original standard descriptor
  for (const cat of SPIRIT_FLAVOR_TAXONOMY) {
    for (const sub of cat.subcategories) {
      const desc = sub.descriptors.find((d) => d.id === aromaId);
      if (desc) {
        saveStandardFlavorOverride({
          id: desc.id,
          name: desc.name,
          radarDimension: desc.radarDimension,
          emoji: desc.emoji,
          color: desc.color,
          description: desc.description,
          subcategoryId: effectiveSubId,
        });
        return;
      }
    }
  }
}

export function getEffectiveFlavorTaxonomy(): FlavorCategory[] {
  const overrides = getStandardFlavorOverrides();
  const customCategories = getStoredCustomCategories();
  const customCatMap = new Map(customCategories.map((c) => [c.id.toLowerCase(), c]));
  const movedByTargetCategory = new Map<string, FlavorDescriptor[]>();

  // First pass: apply default category overrides/deletions, default subcategory mappings, and descriptor overrides
  const basePass: FlavorCategory[] = [];

  for (const cat of SPIRIT_FLAVOR_TAXONOMY) {
    const catOv = customCatMap.get(cat.id.toLowerCase());
    const isCatDeleted = Boolean(catOv?.deleted);

    const processedSubcategories = cat.subcategories.map((sub) => {
      const remainingDescriptors: FlavorDescriptor[] = [];
      for (const desc of sub.descriptors) {
        const defaultSubId = desc.subcategoryId ?? DEFAULT_DESCRIPTOR_SUBCATEGORY_MAP[desc.id];
        const ov = overrides[desc.id];
        if (!ov) {
          if (!isCatDeleted) {
            remainingDescriptors.push(
              defaultSubId ? { ...desc, subcategoryId: defaultSubId } : desc
            );
          }
          continue;
        }
        if (ov.deleted) {
          continue;
        }
        const resolvedSubcategoryId =
          ov.subcategoryId !== undefined ? (ov.subcategoryId || undefined) : defaultSubId;
        const targetCatId =
          ov.categoryId ||
          getDefaultCategoryForRadarDimension(ov.radarDimension)?.id ||
          cat.id;
        const updatedDesc: FlavorDescriptor = {
          ...desc,
          name: ov.name,
          radarDimension: ov.radarDimension,
          categoryId: targetCatId,
          emoji: ov.emoji ?? desc.emoji,
          color: ov.color ?? desc.color ?? RADAR_DIMENSION_COLORS[ov.radarDimension],
          description: ov.description ?? desc.description,
          subcategoryId: resolvedSubcategoryId,
          aliases: Array.from(
            new Set([
              ...(desc.aliases || []),
              desc.name.EN,
              desc.name.DE,
              ov.name.EN,
              ov.name.DE,
              ...(ov.emoji ? [`${ov.emoji} ${ov.name.EN}`, `${ov.emoji} ${ov.name.DE}`] : []),
            ])
          ),
        };
        if (targetCatId.toLowerCase() === cat.id.toLowerCase()) {
          if (!isCatDeleted) {
            remainingDescriptors.push(updatedDesc);
          }
        } else {
          const list = movedByTargetCategory.get(targetCatId.toLowerCase()) || [];
          list.push(updatedDesc);
          movedByTargetCategory.set(targetCatId.toLowerCase(), list);
        }
      }
      return {
        ...sub,
        descriptors: remainingDescriptors,
      };
    });

    if (!isCatDeleted) {
      basePass.push({
        ...cat,
        name: catOv ? { EN: catOv.name, DE: catOv.name } : cat.name,
        emoji: catOv?.emoji || cat.emoji,
        color: catOv?.color || cat.color || RADAR_DIMENSION_COLORS[cat.radarDimension],
        subcategories: processedSubcategories,
      });
    }
  }

  // Append user-created custom categories (not overrides of default categories)
  const defaultIds = new Set(SPIRIT_FLAVOR_TAXONOMY.map((c) => c.id.toLowerCase()));
  for (const customCat of customCategories) {
    if (customCat.deleted || defaultIds.has(customCat.id.toLowerCase())) {
      continue;
    }
    if (basePass.length >= MAX_FLAVOR_CATEGORIES) {
      break;
    }
    const catDim: keyof FlavorProfile = customCat.radarDimension ?? 'woody';
    basePass.push({
      id: customCat.id,
      name: { EN: customCat.name, DE: customCat.name },
      emoji: customCat.emoji,
      radarDimension: catDim,
      color: customCat.color || RADAR_DIMENSION_COLORS[catDim] || '#C59B27',
      subcategories: [
        {
          id: `${customCat.id}_general`,
          name: { EN: customCat.name, DE: customCat.name },
          descriptors: [],
        },
      ],
    });
  }

  const cappedPass = basePass.slice(0, MAX_FLAVOR_CATEGORIES);

  if (movedByTargetCategory.size === 0) {
    return cappedPass;
  }

  return cappedPass.map((cat) => {
    const moved = movedByTargetCategory.get(cat.id.toLowerCase());
    if (!moved || moved.length === 0 || cat.subcategories.length === 0) {
      return cat;
    }
    const [firstSub, ...restSubs] = cat.subcategories;
    return {
      ...cat,
      subcategories: [
        {
          ...firstSub,
          descriptors: [...firstSub.descriptors, ...moved],
        },
        ...restSubs,
      ],
    };
  });
}

// ─── SSOT Derived Helpers ───────────────────────────────────────────────────

export function getAllFlavorDescriptors(customFlavors?: CustomFlavorDescriptor[]): FlavorDescriptor[] {
  const baseDescriptors = getEffectiveFlavorTaxonomy().flatMap((cat) =>
    cat.subcategories.flatMap((sub) => sub.descriptors),
  );

  const customList = customFlavors ?? getStoredCustomFlavors();
  const convertedCustom: FlavorDescriptor[] = customList.map((cf) => ({
    id: cf.id,
    name: { EN: cf.name, DE: cf.name },
    radarDimension: cf.radarDimension,
    categoryId: cf.categoryId,
    subcategoryId: cf.subcategoryId,
    emoji: cf.emoji,
    color: cf.color ?? RADAR_DIMENSION_COLORS[cf.radarDimension] ?? '#C59B27',
    description: cf.description,
    aliases: [cf.name, cf.id, ...(cf.emoji ? [`${cf.emoji} ${cf.name}`] : [])],
  }));

  const seen = new Set<string>();
  const merged: FlavorDescriptor[] = [];

  for (const d of [...baseDescriptors, ...convertedCustom]) {
    const key = d.id.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(d);
    }
  }

  return merged;
}

function getDefaultCategoryForRadarDimension(
  dimension: keyof FlavorProfile
): FlavorCategory | undefined {
  if (dimension === 'chocolate') {
    return SPIRIT_FLAVOR_TAXONOMY.find((c) => c.id === 'suesse');
  }
  if (dimension === 'nutty') {
    return SPIRIT_FLAVOR_TAXONOMY.find((c) => c.id === 'holzig');
  }
  return SPIRIT_FLAVOR_TAXONOMY.find((cat) => cat.radarDimension === dimension);
}

export function getCategoryForRadarDimension(
  dimension: keyof FlavorProfile
): FlavorCategory | undefined {
  const effective = getEffectiveFlavorTaxonomy();
  if (dimension === 'chocolate') {
    return effective.find((c) => c.id === 'suesse') ?? getDefaultCategoryForRadarDimension(dimension);
  }
  if (dimension === 'nutty') {
    return effective.find((c) => c.id === 'holzig') ?? getDefaultCategoryForRadarDimension(dimension);
  }
  return effective.find((cat) => cat.radarDimension === dimension) ??
    getDefaultCategoryForRadarDimension(dimension);
}

export function inferCategoryFromTagName(name: string): FlavorCategory | undefined {
  if (!name) return undefined;
  const q = name.toLowerCase();
  const effective = getEffectiveFlavorTaxonomy();
  const findCat = (id: string) =>
    effective.find((c) => c.id === id) ?? SPIRIT_FLAVOR_TAXONOMY.find((c) => c.id === id);

  // 1. Peat & Smoke
  if (/(torf|rauch|smoke|peat|asche|kamin|teer|phenol|jod|barbecue|charcoal|glow)/i.test(q)) {
    return findCat('torf');
  }
  // 2. Fruit & Citrus
  if (/(apfel|birne|frucht|beere|zitrone|limette|grapefruit|bergamotte|mandarine|yuzu|kumquat|pomelo|orange|banane|ananas|mango|litschi|lychee|papaya|kiwi|melone|guave|guava|kirsche|pfirsich|maracuja|passionsfrucht|aprikose|holunder|cranberry|stachelbeere|grape|berry|apple|citrus|fruit|plum|pear|lemon|lime|cherry|tropical|tangerine)/i.test(q)) {
    return findCat('fruchtig');
  }
  // 3. Sweets & Cereal
  if (/(honig|vanille|karamell|zucker|toffee|malz|schokolade|kakao|getreide|butter|fudge|biskuit|keks|sweet|honey|vanilla|caramel|malt|cocoa|chocolate)/i.test(q)) {
    return findCat('suesse');
  }
  // 4. Oak & Wood
  if (/(eiche|fass|holz|oak|wood|zeder|sawdust|tannin|toast|cask)/i.test(q)) {
    return findCat('holzig');
  }
  // 5. Spices & Pepper
  if (/(pfeffer|zimt|nelke|ingwer|muskat|kardamom|würz|spice|pepper|cinnamon|clove|ginger|nutmeg|würzig|anise)/i.test(q)) {
    return findCat('wuerzig');
  }
  // 6. Dried Fruit & Wine
  if (/(sherry|port|wein|rosine|dörrobst|feige|sultana|dattel|raisin|wine|fig|date|prune)/i.test(q)) {
    return findCat('weinartig');
  }
  // 7. Herbal & Green
  if (/(blume|heide|gras|kraut|tee|minze|lavendel|floral|herb|grass|heather|mint|eukalyptus|leaf|foliage)/i.test(q)) {
    return findCat('pflanzlich');
  }
  // 8. Maritime & Mineral
  if (/(salz|meer|sole|maritim|alge|brine|salt|sea|maritime|seaweed|mineral|küste)/i.test(q)) {
    return findCat('maritim');
  }
  // 9. Leather & Feinty
  if (/(leder|tabak|zigarre|wachs|leather|tobacco|wax|fleisch|meaty|umami)/i.test(q)) {
    return findCat('feinty');
  }

  return undefined;
}

export function getDescriptorsByCategory(
  categoryId: string,
  customFlavors?: CustomFlavorDescriptor[]
): FlavorDescriptor[] {
  const category = getEffectiveFlavorTaxonomy().find((cat) => cat.id.toLowerCase() === categoryId.toLowerCase());
  if (!category) return [];

  const baseDescriptors = category.subcategories.flatMap((sub) => sub.descriptors);
  const customList = customFlavors ?? getStoredCustomFlavors();

  const matchingCustom: FlavorDescriptor[] = customList
    .filter((cf) => isCustomFlavorInCategory(cf, category))
    .map((cf) => ({
      id: cf.id,
      name: { EN: cf.name, DE: cf.name },
      radarDimension: cf.radarDimension,
      categoryId: cf.categoryId ?? category.id,
      subcategoryId: cf.subcategoryId,
      emoji: cf.emoji,
      color: cf.color ?? category.color ?? RADAR_DIMENSION_COLORS[cf.radarDimension] ?? '#C59B27',
      description: cf.description,
      aliases: [cf.name, cf.id, ...(cf.emoji ? [`${cf.emoji} ${cf.name}`] : [])],
    }));

  return [...baseDescriptors, ...matchingCustom];
}

export function getDescriptorsByRadarDimension(
  dimension: keyof FlavorProfile,
  customFlavors?: CustomFlavorDescriptor[]
): FlavorDescriptor[] {
  return getAllFlavorDescriptors(customFlavors).filter((desc) => desc.radarDimension === dimension);
}

export function findFlavorDescriptor(
  query: string,
  customFlavors?: CustomFlavorDescriptor[]
): FlavorDescriptor | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();

  return getAllFlavorDescriptors(customFlavors).find((desc) => {
    const descId = desc.id.toLowerCase();
    const descEN = desc.name.EN.toLowerCase();
    const descDE = desc.name.DE.toLowerCase();
    const aliases = (desc.aliases || []).map((a) => a.toLowerCase());

    return descId === q || descEN === q || descDE === q || aliases.includes(q);
  });
}

export function translateFlavorTag(tag: string, language: 'EN' | 'DE'): string {
  const descriptor = findFlavorDescriptor(tag);
  if (descriptor) {
    return descriptor.name[language] ?? descriptor.name.EN;
  }
  return tag;
}

export function getFlavorColor(tagName: string, customFlavors?: CustomFlavorDescriptor[]): string {
  const desc = findFlavorDescriptor(tagName, customFlavors);
  if (desc && desc.color) {
    return desc.color;
  }
  if (desc && desc.categoryId) {
    const cat = getEffectiveFlavorTaxonomy().find((c) => c.id.toLowerCase() === desc.categoryId!.toLowerCase());
    if (cat?.color) return cat.color;
  }
  if (desc && desc.radarDimension && RADAR_DIMENSION_COLORS[desc.radarDimension]) {
    return RADAR_DIMENSION_COLORS[desc.radarDimension];
  }
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 45%)`;
}

export function getCategoryByDescriptorId(
  tagNameOrId: string,
  customFlavors?: CustomFlavorDescriptor[]
): FlavorCategory | undefined {
  const desc = findFlavorDescriptor(tagNameOrId, customFlavors);
  const effective = getEffectiveFlavorTaxonomy();

  // 1. Explicit categoryId assignment or direct standard subcategory match
  if (desc) {
    if (desc.categoryId) {
      const explicitCat = effective.find(
        (cat) => cat.id.toLowerCase() === desc.categoryId!.toLowerCase()
      );
      if (explicitCat) return explicitCat;
    }

    const directMatch = effective.find((cat) =>
      cat.subcategories.some((sub) =>
        sub.descriptors.some((d) => d.id === desc.id)
      )
    );
    if (directMatch) return directMatch;

    // 2. Custom flavor or descriptor with radarDimension
    if (desc.radarDimension) {
      const dimensionCategory = getCategoryForRadarDimension(desc.radarDimension);
      if (dimensionCategory) return dimensionCategory;
    }
  }

  // 3. Heuristic keyword fallback for arbitrary or unmapped tags
  return inferCategoryFromTagName(tagNameOrId);
}

export interface ActiveFlavorCategory {
  id: string;
  name: { EN: string; DE: string };
  emoji: string;
  color: string;
  count: number;
}

export function getActiveFlavorCategories(
  tags?: string[],
  customFlavors?: CustomFlavorDescriptor[]
): ActiveFlavorCategory[] {
  if (!tags || tags.length === 0) return [];
  const categoryMap = new Map<
    string,
    { category: FlavorCategory; count: number }
  >();

  for (const tag of tags) {
    const category = getCategoryByDescriptorId(tag, customFlavors);
    if (!category) continue;

    const existing = categoryMap.get(category.id);
    if (existing) {
      existing.count++;
    } else {
      categoryMap.set(category.id, { category, count: 1 });
    }
  }

  return Array.from(categoryMap.values()).map(({ category, count }) => ({
    id: category.id,
    name: category.name,
    emoji: category.emoji,
    color: category.color ?? RADAR_DIMENSION_COLORS[category.radarDimension] ?? '#C59B27',
    count,
  }));
}

export interface SmartAromaResolution {
  isNew: boolean;
  canonicalName: string;
  matchedDescriptor?: FlavorDescriptor;
  targetCategory: FlavorCategory;
  targetSubcategory?: CustomFlavorSubcategory;
  emoji: string;
}

function generateAromaSearchCandidates(rawTag: string): string[] {
  const base = rawTag.trim().toLowerCase();
  if (!base) return [];

  const candidates = new Set<string>([base]);

  // 1. Strip common sensory adjective modifiers (DE & EN)
  const strippedAdj = base
    .replace(
      /^(dunkle[rsnm]?|helle[rsnm]?|süße[rsnm]?|suesse[rsnm]?|frische[rsnm]?|reife[rsnm]?|warme[rsnm]?|kräftige[rsnm]?|leichte[rsnm]?|sanfte[rsnm]?|intensive[rsnm]?|feine[rsnm]?|rote[rsnm]?|grüne[rsnm]?|gelbe[rsnm]?|wild[erns]*|dark|light|sweet|fresh|ripe|warm|rich|heavy|soft|red|green|golden)\s+/gi,
      ''
    )
    .trim();
  if (strippedAdj && strippedAdj !== base) {
    candidates.add(strippedAdj);
  }

  // 2. Specific common German/English plural-to-singular mappings
  const pluralMap: Record<string, string> = {
    rosinen: 'rosine',
    'grüne äpfel': 'grüner apfel',
    'rote äpfel': 'roter apfel',
    äpfel: 'apfel',
    birnen: 'birne',
    kirschen: 'kirsche',
    beeren: 'beere',
    erdbeeren: 'erdbeere',
    himbeeren: 'himbeere',
    brombeeren: 'brombeere',
    pflaumen: 'pflaume',
    feigen: 'feige',
    datteln: 'dattel',
    aprikosen: 'aprikose',
    pfirsiche: 'pfirsich',
    zitronen: 'zitrone',
    limetten: 'limette',
    orangen: 'orange',
    bananen: 'banane',
    mandeln: 'mandel',
    walnüsse: 'walnuss',
    haselnüsse: 'haselnuss',
    nüsse: 'nuss',
    nelken: 'nelke',
    kräuter: 'kräuter',
    gewürze: 'gewürz',
    raisins: 'raisin',
    apples: 'apple',
    pears: 'pear',
    cherries: 'cherry',
    berries: 'berry',
    strawberries: 'strawberry',
    raspberries: 'raspberry',
    blackberries: 'blackberry',
    plums: 'plum',
    figs: 'fig',
    dates: 'date',
    apricots: 'apricot',
    peaches: 'peach',
    lemons: 'lemon',
    limes: 'lime',
    oranges: 'orange',
    bananas: 'banana',
    almonds: 'almond',
    walnuts: 'walnut',
    hazelnuts: 'hazelnut',
    cloves: 'clove',
  };

  for (const cand of Array.from(candidates)) {
    if (pluralMap[cand]) {
      candidates.add(pluralMap[cand]);
    }
    // Generic suffix singularization for longer words
    if (cand.length > 5) {
      if (cand.endsWith('ies')) {
        candidates.add(`${cand.slice(0, -3)}y`);
      }
      if (cand.endsWith('en')) {
        candidates.add(cand.slice(0, -2));
        candidates.add(cand.slice(0, -1)); // e.g. rosinen -> rosine
      } else if (cand.endsWith('n') || cand.endsWith('s') || cand.endsWith('e')) {
        candidates.add(cand.slice(0, -1));
      }
    }
  }

  return Array.from(candidates);
}

export function inferSubcategoryFromTagName(
  tagName: string,
  categoryId: string,
  language: 'DE' | 'EN' = 'DE'
): CustomFlavorSubcategory | undefined {
  if (!tagName || !categoryId) return undefined;
  const q = tagName.toLowerCase();
  const catSubcategories = getStoredCustomSubcategories(language).filter(
    (s) => s.categoryId === categoryId
  );
  if (catSubcategories.length === 0) return undefined;

  if (categoryId === 'fruchtig') {
    if (/(zitrone|limette|orange|grapefruit|bergamotte|mandarine|yuzu|blutorange|kumquat|pomelo|zitrus|lemon|lime|citrus|tangerine)/i.test(q)) {
      return catSubcategories.find((s) => s.id === 'sub_zitrus' || /zitrus|citrus/i.test(s.name));
    }
    if (/(ananas|banane|mango|kokos|maracuja|papaya|litschi|lychee|passionsfrucht|guava|guave|kiwi|melone|tropisch|pineapple|coconut|passionfruit|tropical)/i.test(q)) {
      return catSubcategories.find((s) => s.id === 'sub_tropisch' || /tropisch|tropical/i.test(s.name));
    }
    if (/(beere|erdbeere|himbeere|brombeere|johannisbeere|heidelbeere|blaubeere|cranberry|holunder|stachelbeere|kirsche|berry|berries|strawberry|raspberry|blackberry|blueberry|currant|cherry)/i.test(q)) {
      return catSubcategories.find((s) => s.id === 'sub_beeren' || /beeren|berries/i.test(s.name));
    }
  }

  if (categoryId === 'suesse') {
    if (/(schoko|kakao|praline|nougat|trüffel|chocolate|cocoa)/i.test(q)) {
      return catSubcategories.find((s) => s.id === 'sub_schokolade' || /schoko|chocolate|kakao/i.test(s.name));
    }
    if (/(keks|biskuit|kuchen|brot|waffel|marzipan|brioche|croissant|gebäck|teig|biscuit|pastry|bread|bakery)/i.test(q)) {
      return catSubcategories.find((s) => s.id === 'sub_gebaeck' || /gebäck|pastry|bakery/i.test(s.name));
    }
    if (/(malz|getreide|gerste|weizen|hafer|mais|malt|cereal|grain|oat)/i.test(q)) {
      return catSubcategories.find((s) => s.id === 'sub_getreide' || /getreide|grain|malz|malt/i.test(s.name));
    }
    if (/(karamell|toffee|fudge|butterscotch|caramel)/i.test(q)) {
      return catSubcategories.find((s) => s.id === 'sub_karamell' || /karamell|caramel/i.test(s.name));
    }
  }

  if (categoryId === 'holzig') {
    if (/(nuss|nüsse|mandel|walnuss|haselnuss|pekannuss|pistazie|kastanie|marone|cashew|macadamia|erdnuss|nut|almond|walnut|hazelnut|pecan|pistachio|chestnut)/i.test(q)) {
      return catSubcategories.find((s) => s.id === 'sub_nuesse' || /nüsse|nuesse|nuts/i.test(s.name));
    }
    if (/(kaffee|espresso|mokka|röst|roest|coffee|mocha|roast)/i.test(q)) {
      return catSubcategories.find((s) => s.id === 'sub_roest' || /röst|roast/i.test(s.name));
    }
  }

  return undefined;
}

export function resolveSmartCatalogAroma(
  rawTag: string,
  language: 'DE' | 'EN' = 'DE',
  preferredDimension?: keyof FlavorProfile
): SmartAromaResolution {
  const trimmed = rawTag.trim();
  const candidates = generateAromaSearchCandidates(trimmed);
  const effective = getEffectiveFlavorTaxonomy();
  const fallbackCategory = effective[0] ?? SPIRIT_FLAVOR_TAXONOMY[0];

  // 1. Check direct & normalized candidate matches against all catalog descriptors
  for (const cand of candidates) {
    const matched = findFlavorDescriptor(cand);
    if (matched) {
      const cat =
        getCategoryByDescriptorId(matched.id) ??
        (matched.radarDimension ? getCategoryForRadarDimension(matched.radarDimension) : undefined) ??
        fallbackCategory;
      const canonicalName = matched.name[language] || matched.name.DE || matched.name.EN;
      return {
        isNew: false,
        canonicalName,
        matchedDescriptor: matched,
        targetCategory: cat,
        emoji: matched.emoji || cat.emoji,
      };
    }
  }

  // 2. Truly new aroma -> infer category & optional subcategory folder
  const targetCategory =
    inferCategoryFromTagName(trimmed) ??
    (preferredDimension ? getCategoryForRadarDimension(preferredDimension) : undefined) ??
    fallbackCategory;

  const targetSubcategory = inferSubcategoryFromTagName(trimmed, targetCategory.id, language);

  return {
    isNew: true,
    canonicalName: trimmed,
    targetCategory,
    targetSubcategory,
    emoji: inferEmojiFromTagName(trimmed),
  };
}

export function registerCustomFlavorIfMissing(
  name: string,
  preferredDimension?: keyof FlavorProfile,
  language: 'DE' | 'EN' = 'DE'
): CustomFlavorDescriptor {
  const trimmed = name.trim();
  const resolution = resolveSmartCatalogAroma(trimmed, language, preferredDimension);

  if (!resolution.isNew && resolution.matchedDescriptor) {
    const existing = resolution.matchedDescriptor;
    return {
      id: existing.id,
      name: resolution.canonicalName,
      radarDimension: existing.radarDimension,
      categoryId: existing.categoryId ?? resolution.targetCategory.id,
      color: existing.color,
      subcategoryId: existing.subcategoryId,
    };
  }

  const dim: keyof FlavorProfile =
    preferredDimension ||
    resolution.targetCategory.radarDimension ||
    'fruity';

  const slug = `custom_${trimmed
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || crypto.randomUUID().slice(0, 8)}`;

  const customFlavor: CustomFlavorDescriptor = {
    id: slug,
    name: trimmed,
    emoji: resolution.emoji,
    radarDimension: dim,
    categoryId: resolution.targetCategory.id,
    color: resolution.targetCategory.color ?? RADAR_DIMENSION_COLORS[dim] ?? '#C59B27',
    subcategoryId: resolution.targetSubcategory?.id,
  };

  registerCustomFlavor(customFlavor);
  return customFlavor;
}
