import { FlavorProfile } from '@/types/spirit.types';

export interface FlavorDescriptor {
  id: string;
  name: { EN: string; DE: string };
  radarDimension: keyof FlavorProfile;
  color?: string; // Human-instinctive UI color (WCAG compliant)
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

// ─── SWRI-aligned Scotch Whisky Flavour Taxonomy ─────────────────────────────
// Based on the Scotch Whisky Research Institute (SWRI) 8-category flavour taxonomy.
// Each descriptor is placed in the semantically correct SWRI category.
export const SPIRIT_FLAVOR_TAXONOMY: FlavorCategory[] = [

  // ─── 1. PEATY ──────────────────────────────────────────────────────────────
  {
    id: 'torf',
    name: { EN: 'Peat & Smoke', DE: 'Torf & Rauch' },
    emoji: '🔥',
    radarDimension: 'peaty',
    subcategories: [
      {
        id: 'verbrannt',
        name: { EN: 'Burnt', DE: 'Verbrannt' },
        descriptors: [
          { id: 'asche', name: { EN: 'Ash', DE: 'Asche' }, radarDimension: 'peaty', color: '#4F565C', aliases: ['Ash', 'Asche'] },
          { id: 'russ', name: { EN: 'Soot', DE: 'Ruß' }, radarDimension: 'peaty', color: '#383D42', aliases: ['Soot', 'Ruß'] },
          { id: 'teer', name: { EN: 'Tar', DE: 'Teer' }, radarDimension: 'peaty', color: '#2D3136', aliases: ['Tar', 'Teer'] },
          { id: 'grillkohle', name: { EN: 'Charcoal', DE: 'Grillkohle' }, radarDimension: 'peaty', color: '#42474D', aliases: ['Charcoal', 'Grillkohle'] },
        ],
      },
      {
        id: 'rauchig',
        name: { EN: 'Smoky', DE: 'Rauchig' },
        descriptors: [
          { id: 'peat_smoke', name: { EN: 'Peat Smoke', DE: 'Torfrauch' }, radarDimension: 'peaty', color: '#655A52', aliases: ['Peat Smoke', 'Wood Smoke', 'Rauch', 'Torf'] },
          { id: 'verbranntes_holz', name: { EN: 'Burnt Wood', DE: 'Verbranntes Holz' }, radarDimension: 'peaty', color: '#5C4E43', aliases: ['Burnt Wood', 'Verbranntes Holz'] },
          { id: 'geraeucherte_lebensmittel', name: { EN: 'Smoked Food', DE: 'Geräucherte Lebensmittel' }, radarDimension: 'peaty', color: '#6E5646', aliases: ['Smoked Food'] },
          { id: 'lagerfeuer', name: { EN: 'Campfire', DE: 'Lagerfeuer' }, radarDimension: 'peaty', color: '#7C5438', aliases: ['Campfire', 'Lagerfeuer'] },
        ],
      },
      {
        id: 'medizinisch',
        name: { EN: 'Medicinal', DE: 'Medizinisch' },
        descriptors: [
          { id: 'jod', name: { EN: 'Iodine', DE: 'Jod' }, radarDimension: 'peaty', color: '#1C6878', aliases: ['Iodine', 'Jod', 'Medicinal / Iodine'] },
          { id: 'medizinisch_note', name: { EN: 'Medicinal', DE: 'Medizinisch' }, radarDimension: 'peaty', color: '#1C6878', aliases: ['Medicinal', 'Medizinisch'] },
          { id: 'desinfektionsmittel', name: { EN: 'Antiseptic', DE: 'Desinfektionsmittel' }, radarDimension: 'peaty', color: '#1F7385', aliases: ['Antiseptic', 'Desinfektionsmittel'] },
          { id: 'heftpflaster', name: { EN: 'Bandage / Plaster', DE: 'Heftpflaster' }, radarDimension: 'peaty', color: '#1F7385', aliases: ['Bandage', 'Plaster', 'Pflaster'] },
        ],
      },
    ],
  },

  // ─── 2. FEINTY ─────────────────────────────────────────────────────────────
  {
    id: 'feinty',
    name: { EN: 'Feinty & Leather', DE: 'Feinty & Leder' },
    emoji: '🐂',
    radarDimension: 'feinty',
    subcategories: [
      {
        id: 'leder_tabak',
        name: { EN: 'Leather & Tobacco', DE: 'Leder & Tabak' },
        descriptors: [
          { id: 'leather', name: { EN: 'Leather', DE: 'Leder' }, radarDimension: 'feinty', color: '#634026', aliases: ['Leather', 'Leder'] },
          { id: 'nasses_leder', name: { EN: 'Wet Leather', DE: 'Nasses Leder' }, radarDimension: 'feinty', color: '#57371F', aliases: ['Wet Leather', 'Nasses Leder'] },
          { id: 'tabakblaetter', name: { EN: 'Fresh Tobacco Leaves', DE: 'Frische Tabakblätter' }, radarDimension: 'feinty', color: '#705335', aliases: ['Tobacco', 'Tabak'] },
          { id: 'trockener_tabak', name: { EN: 'Dry Tobacco', DE: 'Trockener Tabak' }, radarDimension: 'feinty', color: '#694E32', aliases: ['Dry Tobacco'] },
          { id: 'altes_buch', name: { EN: 'Old Book / Library', DE: 'Altes Buch / Bibliothek' }, radarDimension: 'feinty', color: '#735738', aliases: ['Old Book', 'Library', 'Bibliothek'] },
          { id: 'zigarrenkiste', name: { EN: 'Cigar Box', DE: 'Zigarrenkiste' }, radarDimension: 'feinty', color: '#6E4D2C', aliases: ['Cigar Box', 'Zigarrenkiste'] },
        ],
      },
      {
        id: 'wachsig_fettig',
        name: { EN: 'Waxy & Fatty', DE: 'Wachsig & Fettig' },
        descriptors: [
          { id: 'bienenwachs', name: { EN: 'Beeswax', DE: 'Bienenwachs' }, radarDimension: 'feinty', color: '#B58D3D', aliases: ['Beeswax'] },
          { id: 'honigwabe', name: { EN: 'Honeycomb', DE: 'Honigwabe' }, radarDimension: 'feinty', color: '#C49533', aliases: ['Honeycomb', 'Wabe'] },
        ],
      },
      {
        id: 'feinty_kaese',
        name: { EN: 'Cheesy & Sweaty', DE: 'Käsig & Schweißig' },
        descriptors: [
          { id: 'schimmelkaese', name: { EN: 'Blue Cheese', DE: 'Schimmelkäse' }, radarDimension: 'feinty', color: '#78825C', aliases: ['Blue Cheese'] },
        ],
      },
      {
        id: 'loesungsmittel',
        name: { EN: 'Solventy', DE: 'Lösungsmittel' },
        descriptors: [
          { id: 'nagellackentferner', name: { EN: 'Nail Polish Remover', DE: 'Nagellackentferner' }, radarDimension: 'fruity', color: '#8F5374', aliases: ['Nail Polish Remover'] },
        ],
      },
      {
        id: 'hefe_malz',
        name: { EN: 'Yeasty & Malty', DE: 'Hefe & Malznoten' },
        descriptors: [
          { id: 'gemaelzte_gerste', name: { EN: 'Malted Barley', DE: 'Gemälzte Gerste' }, radarDimension: 'feinty', color: '#9C7A3C', aliases: ['Malted Barley', 'Wort'] },
          { id: 'hefeextrakt', name: { EN: 'Yeast Extract', DE: 'Hefeextrakt' }, radarDimension: 'feinty', color: '#8F7B56', aliases: ['Yeast'] },
        ],
      },
    ],
  },

  // ─── 3. SULPHURY ───────────────────────────────────────────────────────────
  {
    id: 'sulphury',
    name: { EN: 'Sulphury & Savory', DE: 'Schwefelig & Herzhaft' },
    emoji: '🥩',
    radarDimension: 'sulphury',
    subcategories: [
      {
        id: 'verbrannter_schwefel',
        name: { EN: 'Burnt Sulphur', DE: 'Verbrannter Schwefel' },
        descriptors: [
          { id: 'gummi', name: { EN: 'Rubber', DE: 'Gummi' }, radarDimension: 'sulphury', color: '#47413C', aliases: ['Rubber', 'Gummi'] },
          { id: 'streichholz', name: { EN: 'Burnt Match', DE: 'Streichholz' }, radarDimension: 'sulphury', color: '#734832', aliases: ['Burnt Match', 'Match'] },
          { id: 'boeller', name: { EN: 'Spent Fireworks', DE: 'Feuerwerk' }, radarDimension: 'sulphury', color: '#664736', aliases: ['Fireworks'] },
        ],
      },
      {
        id: 'herzhaft_fleischig',
        name: { EN: 'Savory & Meaty', DE: 'Herzhaft & Fleischig' },
        descriptors: [
          { id: 'fleischig', name: { EN: 'Meaty / Gravy', DE: 'Fleischig / Bratensauce' }, radarDimension: 'sulphury', color: '#823B33', aliases: ['Meaty', 'Gravy'] },
          { id: 'braten', name: { EN: 'Roast Beef', DE: 'Rinderbraten' }, radarDimension: 'sulphury', color: '#733029', aliases: ['Roast Beef'] },
          { id: 'speck', name: { EN: 'Bacon', DE: 'Speck' }, radarDimension: 'sulphury', color: '#8F382E', aliases: ['Bacon'] },
        ],
      },
    ],
  },

  // ─── 4. MARITIME & MINERAL ─────────────────────────────────────────────────
  {
    id: 'maritim',
    name: { EN: 'Maritime & Mineral', DE: 'Maritim & Mineralisch' },
    emoji: '🌊',
    radarDimension: 'sulphury',
    subcategories: [
      {
        id: 'kueste',
        name: { EN: 'Coastline', DE: 'Küste' },
        descriptors: [
          { id: 'sea_salt', name: { EN: 'Sea Salt', DE: 'Meersalz' }, radarDimension: 'sulphury', color: '#2B788B', aliases: ['Sea Salt', 'Meersalz', 'Salz'] },
          { id: 'seegras', name: { EN: 'Seaweed / Kelp', DE: 'Seegras / Tang' }, radarDimension: 'sulphury', color: '#246D5E', aliases: ['Seaweed', 'Kelp', 'Seegras', 'Tang'] },
        ],
      },
    ],
  },

  // ─── 4. HERBAL & SPICY ─────────────────────────────────────────────────────
  {
    id: 'pflanzlich',
    name: { EN: 'Herbal & Spicy', DE: 'Pflanzlich & Würzig' },
    emoji: '🌿',
    radarDimension: 'spicy',
    subcategories: [
      {
        id: 'kraeuter',
        name: { EN: 'Herbal & Green', DE: 'Kräuter & Grün' },
        descriptors: [
          { id: 'eukalyptus', name: { EN: 'Eucalyptus / Mint', DE: 'Eukalyptus / Minze' }, radarDimension: 'spicy', color: '#2B705B', aliases: ['Eucalyptus', 'Mint', 'Minze'] },
          { id: 'kiefer', name: { EN: 'Pine Needles', DE: 'Kiefernnadeln' }, radarDimension: 'spicy', color: '#2E5E3A', aliases: ['Pine Needles', 'Pine'] },
          { id: 'anissaat', name: { EN: 'Anise / Fennel', DE: 'Anis / Fenchel' }, radarDimension: 'spicy', color: '#3B6B4D', aliases: ['Anise', 'Fennel', 'Anis'] },
        ],
      },
      {
        id: 'wuerzen',
        name: { EN: 'Baking Spices', DE: 'Backgewürze' },
        descriptors: [
          { id: 'zimt', name: { EN: 'Cinnamon', DE: 'Zimt' }, radarDimension: 'spicy', color: '#993D22', aliases: ['Cinnamon', 'Zimt'] },
          { id: 'nelke', name: { EN: 'Clove', DE: 'Nelke' }, radarDimension: 'spicy', color: '#7A3525', aliases: ['Clove', 'Nelke'] },
          { id: 'muskat', name: { EN: 'Nutmeg', DE: 'Muskatnuss' }, radarDimension: 'spicy', color: '#854629', aliases: ['Nutmeg'] },
          { id: 'ingwer', name: { EN: 'Ginger', DE: 'Ingwer' }, radarDimension: 'spicy', color: '#AD5F1D', aliases: ['Ginger', 'Ingwer'] },
          { id: 'schwarzer_pfeffer', name: { EN: 'Black Pepper', DE: 'Schwarzer Pfeffer' }, radarDimension: 'spicy', color: '#A63324', aliases: ['Black Pepper', 'Pfeffer'] },
        ],
      },
    ],
  },

  // ─── 5. WOODY & OAK ────────────────────────────────────────────────────────
  {
    id: 'holzig',
    name: { EN: 'Woody & Oak', DE: 'Holzig & Eiche' },
    emoji: '🪵',
    radarDimension: 'woody',
    subcategories: [
      {
        id: 'holz_typen',
        name: { EN: 'Oak & Wood Character', DE: 'Eiche & Holzcharakter' },
        descriptors: [
          { id: 'eiche', name: { EN: 'Oak', DE: 'Eiche' }, radarDimension: 'woody', color: '#8B4513', aliases: ['Oak', 'Eiche'] },
          { id: 'zeder', name: { EN: 'Cedar', DE: 'Zeder' }, radarDimension: 'woody', color: '#94532B', aliases: ['Cedar', 'Zeder'] },
          { id: 'vanille_holz', name: { EN: 'Vanilla Oak', DE: 'Vanilleeiche' }, radarDimension: 'woody', color: '#B37B30', aliases: ['Vanilla Oak'] },
          { id: 'toast', name: { EN: 'Toasted Wood', DE: 'Getoastetes Holz' }, radarDimension: 'woody', color: '#9C5B26', aliases: ['Toasted Wood', 'Toast', 'Toasted Oak'] },
          { id: 'sherry_cask', name: { EN: 'Sherry Cask', DE: 'Sherryfass' }, radarDimension: 'woody', color: '#7E2A2B', aliases: ['Sherry Cask', 'Sherryfass'] },
          { id: 'bourbon_cask', name: { EN: 'Bourbon Cask', DE: 'Bourbonfass' }, radarDimension: 'woody', color: '#A65E26', aliases: ['Bourbon Cask'] },
          { id: 'saegemehl', name: { EN: 'Sawdust', DE: 'Sägemehl' }, radarDimension: 'woody', color: '#A6854E', aliases: ['Sawdust'] },
          { id: 'harz', name: { EN: 'Resin / Pine', DE: 'Harz / Kiefer' }, radarDimension: 'woody', color: '#5E6E38', aliases: ['Resin'] },
        ],
      },
      {
        id: 'nussig_oelig',
        name: { EN: 'Nutty & Oily', DE: 'Nussig & Ölig' },
        descriptors: [
          { id: 'walnuss', name: { EN: 'Walnut', DE: 'Walnuss' }, radarDimension: 'nutty', color: '#7E5733', aliases: ['Walnut', 'Walnuss'] },
          { id: 'haselnuss', name: { EN: 'Hazelnut', DE: 'Haselnuss' }, radarDimension: 'nutty', color: '#8B6239', aliases: ['Hazelnut', 'Haselnuss'] },
          { id: 'gebrannte_mandel', name: { EN: 'Roasted Almond', DE: 'Gebrannte Mandel' }, radarDimension: 'nutty', color: '#9C774C', aliases: ['Almond', 'Mandel'] },
          { id: 'marzipan', name: { EN: 'Marzipan', DE: 'Marzipan' }, radarDimension: 'nutty', color: '#B08E5D', aliases: ['Marzipan'] },
          { id: 'oelig', name: { EN: 'Oily', DE: 'Ölig' }, radarDimension: 'feinty', color: '#7E733D', aliases: ['Oily', 'Ölig'] },
        ],
      },
    ],
  },

  // ─── 6. WINEY & DRIED FRUIT ────────────────────────────────────────────────
  {
    id: 'weinartig',
    name: { EN: 'Winey & Dried Fruit', DE: 'Weinartig & Trockenobst' },
    emoji: '🍇',
    radarDimension: 'winey',
    subcategories: [
      {
        id: 'trockenobst',
        name: { EN: 'Dried Fruit & Raisin', DE: 'Trockenobst & Rosinen' },
        descriptors: [
          { id: 'dried_fig', name: { EN: 'Dried Fig', DE: 'Getrocknete Feige' }, radarDimension: 'winey', color: '#6E2235', aliases: ['Dried Fig', 'Feige'] },
          { id: 'raisin', name: { EN: 'Raisin', DE: 'Rosine' }, radarDimension: 'winey', color: '#5B1C2E', aliases: ['Raisin', 'Rosine'] },
          { id: 'dattel', name: { EN: 'Date', DE: 'Dattel' }, radarDimension: 'winey', color: '#63271D', aliases: ['Date', 'Dattel'] },
          { id: 'pflaume', name: { EN: 'Prune / Stewed Plum', DE: 'Pflaume / Eingemachte Pflaume' }, radarDimension: 'winey', color: '#4A1B2E', aliases: ['Prune', 'Plum', 'Pflaume'] },
        ],
      },
      {
        id: 'weinnoten',
        name: { EN: 'Fortified Wine', DE: 'Starkweinnoten' },
        descriptors: [
          { id: 'sherry_wein', name: { EN: 'Sherry Wine', DE: 'Sherrywein' }, radarDimension: 'winey', color: '#7A1F2D', aliases: ['Sherry Wine'] },
          { id: 'portwein', name: { EN: 'Port Wine', DE: 'Portwein' }, radarDimension: 'winey', color: '#6B132B', aliases: ['Port Wine', 'Port'] },
          { id: 'rotwein', name: { EN: 'Red Wine', DE: 'Rotwein' }, radarDimension: 'winey', color: '#731627', aliases: ['Red Wine'] },
        ],
      },
    ],
  },

  // ─── 7. FRUITY ─────────────────────────────────────────────────────────────
  {
    id: 'fruchtig',
    name: { EN: 'Fruity & Citrus', DE: 'Fruchtig & Zitrus' },
    emoji: '🍏',
    radarDimension: 'fruity',
    subcategories: [
      {
        id: 'kernobst',
        name: { EN: 'Orchard Fruit', DE: 'Kernobst' },
        descriptors: [
          { id: 'gruener_apfel', name: { EN: 'Green Apple', DE: 'Grüner Apfel' }, radarDimension: 'fruity', color: '#3E8E41', aliases: ['Green Apple', 'Apfel'] },
          { id: 'roter_apfel', name: { EN: 'Red Apple', DE: 'Roter Apfel' }, radarDimension: 'fruity', color: '#AD3228', aliases: ['Red Apple'] },
          { id: 'birne', name: { EN: 'Pear', DE: 'Birne' }, radarDimension: 'fruity', color: '#84A338', aliases: ['Pear', 'Birne'] },
        ],
      },
      {
        id: 'zitrus',
        name: { EN: 'Citrus', DE: 'Zitrusfrüchte' },
        descriptors: [
          { id: 'citrus_peel', name: { EN: 'Citrus Peel', DE: 'Zitruszeste' }, radarDimension: 'fruity', color: '#C88210', aliases: ['Citrus Peel', 'Zitruszeste', 'Zitrone'] },
          { id: 'orange', name: { EN: 'Orange Peel', DE: 'Orangenschale' }, radarDimension: 'fruity', color: '#C66513', aliases: ['Orange', 'Orange Peel'] },
          { id: 'grapefruit', name: { EN: 'Grapefruit', DE: 'Grapefruit' }, radarDimension: 'fruity', color: '#BD4532', aliases: ['Grapefruit'] },
        ],
      },
      {
        id: 'steinobst',
        name: { EN: 'Stone Fruit & Tropical', DE: 'Steinobst & Tropisch' },
        descriptors: [
          { id: 'pfirsich', name: { EN: 'Peach', DE: 'Pfirsich' }, radarDimension: 'fruity', color: '#C2673B', aliases: ['Peach', 'Pfirsich'] },
          { id: 'aprikose', name: { EN: 'Apricot', DE: 'Aprikose' }, radarDimension: 'fruity', color: '#C9732B', aliases: ['Apricot', 'Aprikose'] },
          { id: 'ananas', name: { EN: 'Pineapple', DE: 'Ananas' }, radarDimension: 'fruity', color: '#C49B1F', aliases: ['Pineapple', 'Ananas'] },
          { id: 'beeren', name: { EN: 'Wild Berries', DE: 'Waldbeeren' }, radarDimension: 'fruity', color: '#9E2B4B', aliases: ['Berries', 'Waldbeeren'] },
        ],
      },
    ],
  },

  // ─── 8. SWEETNESS & BAKERY ─────────────────────────────────────────────────
  {
    id: 'suesse',
    name: { EN: 'Sweetness & Bakery', DE: 'Süße & Gebäck' },
    emoji: '🍯',
    radarDimension: 'cereal',
    subcategories: [
      {
        id: 'vanille_honig',
        name: { EN: 'Vanilla & Honey', DE: 'Vanille & Honig' },
        descriptors: [
          { id: 'vanilla', name: { EN: 'Vanilla', DE: 'Vanille' }, radarDimension: 'cereal', color: '#CBA038', aliases: ['Vanilla', 'Vanille'] },
          { id: 'honig', name: { EN: 'Honey', DE: 'Honig' }, radarDimension: 'cereal', color: '#D49B22', aliases: ['Honey', 'Honig'] },
          { id: 'karamell', name: { EN: 'Caramel', DE: 'Karamell' }, radarDimension: 'cereal', color: '#A8631E', aliases: ['Caramel', 'Karamell'] },
          { id: 'toffee', name: { EN: 'Toffee', DE: 'Toffee' }, radarDimension: 'cereal', color: '#945017', aliases: ['Toffee'] },
          { id: 'brauner_zucker', name: { EN: 'Brown Sugar', DE: 'Brauner Zucker' }, radarDimension: 'cereal', color: '#8C4E1D', aliases: ['Brown Sugar'] },
        ],
      },
      {
        id: 'schokolade',
        name: { EN: 'Chocolate & Cocoa', DE: 'Schokolade & Kakao' },
        descriptors: [
          { id: 'dark_chocolate', name: { EN: 'Dark Chocolate', DE: 'Dunkle Schokolade' }, radarDimension: 'chocolate', color: '#4A2E1B', aliases: ['Dark Chocolate', 'Schokolade'] },
          { id: 'milchschokolade', name: { EN: 'Milk Chocolate', DE: 'Vollmilchschokolade' }, radarDimension: 'chocolate', color: '#734B2A', aliases: ['Milk Chocolate'] },
          { id: 'kakao', name: { EN: 'Cocoa Powder', DE: 'Kakaopulver' }, radarDimension: 'chocolate', color: '#59361E', aliases: ['Cocoa', 'Kakao'] },
        ],
      },
      {
        id: 'gebaeck',
        name: { EN: 'Bakery & Cereal', DE: 'Gebäck & Getreide' },
        descriptors: [
          { id: 'gebaeck_butter', name: { EN: 'Butter Pastry / Biscuit', DE: 'Buttergebäck / Keks' }, radarDimension: 'cereal', color: '#A88B4C', aliases: ['Pastry', 'Biscuit', 'Gebäck', 'Keks'] },
          { id: 'haferbrei', name: { EN: 'Oatmeal Porridge', DE: 'Haferbrei' }, radarDimension: 'cereal', color: '#9E8A5E', aliases: ['Oatmeal', 'Porridge'] },
          { id: 'brotkruste', name: { EN: 'Bread Crust', DE: 'Brotkruste' }, radarDimension: 'cereal', color: '#8F6B38', aliases: ['Bread Crust'] },
        ],
      },
    ],
  },
];

// ─── SSOT Derived Helpers ───────────────────────────────────────────────────

export function getAllFlavorDescriptors(): FlavorDescriptor[] {
  return SPIRIT_FLAVOR_TAXONOMY.flatMap((cat) =>
    cat.subcategories.flatMap((sub) => sub.descriptors),
  );
}

export function getDescriptorsByCategory(categoryId: string): FlavorDescriptor[] {
  const category = SPIRIT_FLAVOR_TAXONOMY.find((cat) => cat.id.toLowerCase() === categoryId.toLowerCase());
  if (!category) return [];
  return category.subcategories.flatMap((sub) => sub.descriptors);
}

export function getDescriptorsByRadarDimension(dimension: keyof FlavorProfile): FlavorDescriptor[] {
  return getAllFlavorDescriptors().filter((desc) => desc.radarDimension === dimension);
}

export function findFlavorDescriptor(query: string): FlavorDescriptor | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();

  return getAllFlavorDescriptors().find((desc) => {
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
