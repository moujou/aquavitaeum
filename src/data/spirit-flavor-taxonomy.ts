import { FlavorProfile, CustomFlavorDescriptor } from '@/types/spirit.types';

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

// ─── SWRI-aligned Scotch Whisky & Fine Spirits Flavour Taxonomy ──────────────
// Based on the Scotch Whisky Research Institute (SWRI) and Master Sommelier aroma wheels.
// Comprehensive coverage of Fruits, Sweets, Bakery, Malt, Oak, Herbs, Peat, and Mouthfeel.
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
        name: { EN: 'Smoky & Campfire', DE: 'Rauchig & Lagerfeuer' },
        descriptors: [
          { id: 'peat_smoke', name: { EN: 'Peat Smoke', DE: 'Torfrauch' }, radarDimension: 'peaty', color: '#655A52', aliases: ['Peat Smoke', 'Wood Smoke', 'Rauch', 'Torf'] },
          { id: 'lagerfeuer', name: { EN: 'Campfire Glow', DE: 'Lagerfeuerglut' }, radarDimension: 'peaty', color: '#7C5438', aliases: ['Campfire', 'Lagerfeuer'] },
          { id: 'kaminasche', name: { EN: 'Hearth Ash', DE: 'Kaminasche' }, radarDimension: 'peaty', color: '#4F565C', aliases: ['Ash', 'Asche', 'Hearth'] },
          { id: 'verbranntes_holz', name: { EN: 'Charred Wood', DE: 'Verbranntes Holz' }, radarDimension: 'peaty', color: '#5C4E43', aliases: ['Burnt Wood', 'Verbranntes Holz'] },
          { id: 'geraeucherte_lebensmittel', name: { EN: 'Smoked Ham / Bacon', DE: 'Räucherspeck / Katenrauch' }, radarDimension: 'peaty', color: '#6E5646', aliases: ['Smoked Food', 'Räucherspeck'] },
          { id: 'verbranntes_heidekraut', name: { EN: 'Burnt Heather', DE: 'Verbranntes Heidekraut' }, radarDimension: 'peaty', color: '#694838', aliases: ['Burnt Heather'] },
          { id: 'grillkohle', name: { EN: 'Charcoal', DE: 'Grillkohle' }, radarDimension: 'peaty', color: '#42474D', aliases: ['Charcoal', 'Grillkohle'] },
        ],
      },
      {
        id: 'medizinisch',
        name: { EN: 'Medicinal & Coast', DE: 'Medizinisch & Küste' },
        descriptors: [
          { id: 'jod', name: { EN: 'Iodine / Seaweed', DE: 'Jod / Seetang' }, radarDimension: 'peaty', color: '#1C6878', aliases: ['Iodine', 'Jod', 'Medicinal / Iodine'] },
          { id: 'medizinisch_note', name: { EN: 'Medicinal', DE: 'Medizinisch' }, radarDimension: 'peaty', color: '#1C6878', aliases: ['Medicinal', 'Medizinisch'] },
          { id: 'desinfektionsmittel', name: { EN: 'Antiseptic', DE: 'Desinfektionsmittel' }, radarDimension: 'peaty', color: '#1F7385', aliases: ['Antiseptic', 'Desinfektionsmittel'] },
          { id: 'heftpflaster', name: { EN: 'Bandage / Plaster', DE: 'Heftpflaster' }, radarDimension: 'peaty', color: '#1F7385', aliases: ['Bandage', 'Plaster', 'Pflaster'] },
          { id: 'teer', name: { EN: 'Coal Tar', DE: 'Kohlenteer' }, radarDimension: 'peaty', color: '#2D3136', aliases: ['Tar', 'Teer', 'Coal Tar'] },
        ],
      },
    ],
  },

  // ─── 2. FEINTY, WAXY & LEATHER (Wachsig, Fettig & Leder) ───────────────────
  {
    id: 'feinty',
    name: { EN: 'Feinty & Waxy', DE: 'Wachsig & Leder' },
    emoji: '🐂',
    radarDimension: 'feinty',
    subcategories: [
      {
        id: 'wachsig_fettig',
        name: { EN: 'Waxy & Rich Texture', DE: 'Wachsig & Fettig / Mundgefühl' },
        descriptors: [
          { id: 'bienenwachs', name: { EN: 'Beeswax', DE: 'Bienenwachs' }, radarDimension: 'feinty', color: '#B58D3D', aliases: ['Beeswax', 'Wachs'] },
          { id: 'kerzenwachs', name: { EN: 'Candle Wax', DE: 'Kerzenwachs' }, radarDimension: 'feinty', color: '#C29A44', aliases: ['Candle Wax'] },
          { id: 'honigwabe', name: { EN: 'Honeycomb', DE: 'Honigwabe' }, radarDimension: 'feinty', color: '#C49533', aliases: ['Honeycomb', 'Wabe'] },
          { id: 'buttrig_textur', name: { EN: 'Velvety Butter', DE: 'Buttrig / Samtig' }, radarDimension: 'feinty', color: '#C9A74E', aliases: ['Buttery', 'Buttrig', 'Velvety'] },
          { id: 'fettig', name: { EN: 'Fatty / Oily Texture', DE: 'Fettig / Ölige Schwere' }, radarDimension: 'feinty', color: '#A89244', aliases: ['Fatty', 'Fettig', 'Oily'] },
          { id: 'lanolin', name: { EN: 'Lanolin / Wool Fat', DE: 'Lanolin / Wollwachs' }, radarDimension: 'feinty', color: '#9E884F', aliases: ['Lanolin', 'Wolle'] },
          { id: 'olivenoel', name: { EN: 'Olive Oil', DE: 'Olivenöl' }, radarDimension: 'feinty', color: '#7E7D3A', aliases: ['Olive Oil', 'Olivenöl'] },
        ],
      },
      {
        id: 'leder_tabak',
        name: { EN: 'Leather & Tobacco', DE: 'Leder & Tabak' },
        descriptors: [
          { id: 'leather', name: { EN: 'Vintage Saddle Leather', DE: 'Antikes Sattelleder' }, radarDimension: 'feinty', color: '#634026', aliases: ['Leather', 'Leder'] },
          { id: 'nasses_leder', name: { EN: 'Wet Leather', DE: 'Nasses Leder' }, radarDimension: 'feinty', color: '#57371F', aliases: ['Wet Leather', 'Nasses Leder'] },
          { id: 'pfeifentabak', name: { EN: 'Sweet Pipe Tobacco', DE: 'Süßer Pfeifentabak' }, radarDimension: 'feinty', color: '#784D28', aliases: ['Pipe Tobacco', 'Pfeifentabak'] },
          { id: 'tabakblaetter', name: { EN: 'Fresh Tobacco Leaves', DE: 'Frische Tabakblätter' }, radarDimension: 'feinty', color: '#705335', aliases: ['Tobacco', 'Tabak'] },
          { id: 'zigarrenkiste', name: { EN: 'Cedar Cigar Box', DE: 'Zedern-Zigarrenkiste' }, radarDimension: 'feinty', color: '#6E4D2C', aliases: ['Cigar Box', 'Zigarrenkiste'] },
          { id: 'altes_buch', name: { EN: 'Old Parchment / Library', DE: 'Altes Pergament / Bibliothek' }, radarDimension: 'feinty', color: '#735738', aliases: ['Old Book', 'Library', 'Bibliothek', 'Pergament'] },
        ],
      },
    ],
  },

  // ─── 3. MARITIME & MINERAL (Küste & Salzig) ────────────────────────────────
  {
    id: 'maritim',
    name: { EN: 'Maritime & Mineral', DE: 'Maritim & Mineralisch' },
    emoji: '🌊',
    radarDimension: 'sulphury',
    subcategories: [
      {
        id: 'kueste',
        name: { EN: 'Ocean & Coastline', DE: 'Küste & Ozean' },
        descriptors: [
          { id: 'sea_salt', name: { EN: 'Fleur de Sel / Sea Salt', DE: 'Meersalzkristalle' }, radarDimension: 'sulphury', color: '#2B788B', aliases: ['Sea Salt', 'Meersalz', 'Salz', 'Fleur de Sel'] },
          { id: 'meeresbrise', name: { EN: 'Atlantic Sea Spray', DE: 'Atlantische Meeresbrise' }, radarDimension: 'sulphury', color: '#2C889E', aliases: ['Sea Spray', 'Meeresbrise', 'Gischt'] },
          { id: 'seegras', name: { EN: 'Seaweed / Kelp', DE: 'Seegras / Tang' }, radarDimension: 'sulphury', color: '#246D5E', aliases: ['Seaweed', 'Kelp', 'Seegras', 'Tang'] },
          { id: 'austernschale', name: { EN: 'Oyster Shell', DE: 'Austernschale / Kiesel' }, radarDimension: 'sulphury', color: '#3E7D8A', aliases: ['Oyster Shell', 'Kiesel'] },
          { id: 'salzkruste', name: { EN: 'Salt Crust', DE: 'Salzkruste' }, radarDimension: 'sulphury', color: '#4B8896', aliases: ['Salt Crust'] },
        ],
      },
      {
        id: 'herzhaft_fleischig',
        name: { EN: 'Savory & Meaty', DE: 'Herzhaft & Umami' },
        descriptors: [
          { id: 'fleischig', name: { EN: 'Meaty / Gravy', DE: 'Fleischig / Bratensauce' }, radarDimension: 'sulphury', color: '#823B33', aliases: ['Meaty', 'Gravy', 'Bratensauce'] },
          { id: 'speck', name: { EN: 'Crispy Bacon', DE: 'Geräucherter Speck' }, radarDimension: 'sulphury', color: '#8F382E', aliases: ['Bacon', 'Speck'] },
          { id: 'hefeextrakt', name: { EN: 'Yeast Extract / Umami', DE: 'Hefeextrakt / Umami' }, radarDimension: 'sulphury', color: '#8F7B56', aliases: ['Yeast', 'Umami'] },
        ],
      },
    ],
  },

  // ─── 4. HERBAL, GRASSY & BOTANICAL (Kräuter, Laub & Grasig) ───────────────
  {
    id: 'pflanzlich',
    name: { EN: 'Herbal & Green', DE: 'Kräuter, Laub & Grasig' },
    emoji: '🌿',
    radarDimension: 'floral',
    subcategories: [
      {
        id: 'grasig_frisch',
        name: { EN: 'Cut Grass & Meadow', DE: 'Frisch gemähtes Gras & Wiese' },
        descriptors: [
          { id: 'frisches_gras', name: { EN: 'Fresh Cut Grass', DE: 'Frisch gemähtes Gras' }, radarDimension: 'floral', color: '#3A8A3E', aliases: ['Cut Grass', 'Gras', 'Grasig'] },
          { id: 'wiesenheu', name: { EN: 'Summer Meadow Hay', DE: 'Süßes Sommerheu' }, radarDimension: 'floral', color: '#8C9E38', aliases: ['Hay', 'Heu', 'Wiese'] },
          { id: 'gruener_tee', name: { EN: 'Green Tea / Sencha', DE: 'Grüner Tee / Sencha' }, radarDimension: 'floral', color: '#4E8C4A', aliases: ['Green Tea', 'Matcha', 'Grüner Tee'] },
          { id: 'zitronengras', name: { EN: 'Lemongrass', DE: 'Zitronengras' }, radarDimension: 'floral', color: '#7AA336', aliases: ['Lemongrass', 'Zitronengras'] },
        ],
      },
      {
        id: 'wald_laub',
        name: { EN: 'Forest & Autumn Leaves', DE: 'Waldboden & Laub' },
        descriptors: [
          { id: 'herbstlaub', name: { EN: 'Damp Autumn Leaves', DE: 'Feuchtes Herbstlaub' }, radarDimension: 'floral', color: '#8A5D2E', aliases: ['Autumn Leaves', 'Laub', 'Herbstlaub'] },
          { id: 'waldboden', name: { EN: 'Forest Floor & Moss', DE: 'Waldboden & Moos' }, radarDimension: 'floral', color: '#4A5E33', aliases: ['Forest Floor', 'Moos', 'Waldboden'] },
          { id: 'fichtenharz', name: { EN: 'Pine Resin / Needles', DE: 'Fichtenharz & Tannennadeln' }, radarDimension: 'floral', color: '#2E5E3A', aliases: ['Pine', 'Kiefer', 'Harz', 'Nadeln'] },
          { id: 'heidekraut', name: { EN: 'Scottish Heather', DE: 'Schottisches Heidekraut' }, radarDimension: 'floral', color: '#824670', aliases: ['Heather', 'Heidekraut'] },
        ],
      },
      {
        id: 'kraeuter_wuerzig',
        name: { EN: 'Fresh Herbs', DE: 'Gartenkräuter & Minze' },
        descriptors: [
          { id: 'eukalyptus', name: { EN: 'Eucalyptus & Mint', DE: 'Eukalyptus & Pfefferminze' }, radarDimension: 'floral', color: '#2B705B', aliases: ['Eucalyptus', 'Mint', 'Minze', 'Pfefferminze'] },
          { id: 'salbei', name: { EN: 'Sage', DE: 'Salbei' }, radarDimension: 'floral', color: '#3E6B52', aliases: ['Sage', 'Salbei'] },
          { id: 'rosmarin', name: { EN: 'Wild Rosemary', DE: 'Wilder Rosmarin' }, radarDimension: 'floral', color: '#38634B', aliases: ['Rosemary', 'Rosmarin'] },
          { id: 'thymian', name: { EN: 'Thyme', DE: 'Thymian' }, radarDimension: 'floral', color: '#456B4E', aliases: ['Thyme', 'Thymian'] },
          { id: 'anissaat', name: { EN: 'Anise & Fennel', DE: 'Anis & Fenchelsaat' }, radarDimension: 'floral', color: '#3B6B4D', aliases: ['Anise', 'Fennel', 'Anis', 'Fenchel'] },
          { id: 'lavendel', name: { EN: 'Lavender Blossoms', DE: 'Lavendelblüten' }, radarDimension: 'floral', color: '#7E4D8A', aliases: ['Lavender', 'Lavendel'] },
          { id: 'kamille', name: { EN: 'Chamomile', DE: 'Kamillentee' }, radarDimension: 'floral', color: '#B3993D', aliases: ['Chamomile', 'Kamille'] },
        ],
      },
    ],
  },

  // ─── 5. SPICY & BAKING SPICES (Backgewürze & Schärfe) ──────────────────────
  {
    id: 'wuerzig',
    name: { EN: 'Spicy & Baking Spices', DE: 'Gewürze & Schärfe' },
    emoji: '🌶️',
    radarDimension: 'spicy',
    subcategories: [
      {
        id: 'wuerzen',
        name: { EN: 'Warming Baking Spices', DE: 'Warme Backgewürze' },
        descriptors: [
          { id: 'zimt', name: { EN: 'Ceylon Cinnamon', DE: 'Ceylon-Zimt' }, radarDimension: 'spicy', color: '#993D22', aliases: ['Cinnamon', 'Zimt'] },
          { id: 'nelke', name: { EN: 'Aromatic Clove', DE: 'Gewürznelke' }, radarDimension: 'spicy', color: '#7A3525', aliases: ['Clove', 'Nelke'] },
          { id: 'muskat', name: { EN: 'Grated Nutmeg', DE: 'Geriebene Muskatnuss' }, radarDimension: 'spicy', color: '#854629', aliases: ['Nutmeg', 'Muskat'] },
          { id: 'ingwer', name: { EN: 'Candied Ginger', DE: 'Kandierter Ingwer' }, radarDimension: 'spicy', color: '#AD5F1D', aliases: ['Ginger', 'Ingwer'] },
          { id: 'schwarzer_pfeffer', name: { EN: 'Cracked Black Pepper', DE: 'Geschroteter schwarzer Pfeffer' }, radarDimension: 'spicy', color: '#A63324', aliases: ['Black Pepper', 'Pfeffer'] },
          { id: 'kardamom', name: { EN: 'Green Cardamom', DE: 'Grüner Kardamom' }, radarDimension: 'spicy', color: '#8F542A', aliases: ['Cardamom', 'Kardamom'] },
          { id: 'piment', name: { EN: 'Allspice / Pimento', DE: 'Piment / Nelkenpfeffer' }, radarDimension: 'spicy', color: '#7C3B24', aliases: ['Allspice', 'Piment'] },
        ],
      },
    ],
  },

  // ─── 6. WOODY, OAK & ROASTED (Eiche, Nüsse & Röstaromen) ───────────────────
  {
    id: 'holzig',
    name: { EN: 'Woody, Oak & Roasted', DE: 'Holzig, Nüsse & Röstaromen' },
    emoji: '🪵',
    radarDimension: 'woody',
    subcategories: [
      {
        id: 'holz_typen',
        name: { EN: 'Oak Cask Character', DE: 'Fassholz & Eiche' },
        descriptors: [
          { id: 'eiche', name: { EN: 'Toasted Oak', DE: 'Getoastete Eiche' }, radarDimension: 'woody', color: '#8B4513', aliases: ['Oak', 'Eiche', 'Toasted Oak'] },
          { id: 'virgin_oak', name: { EN: 'Virgin American Oak', DE: 'Frische amerikanische Weißeiche' }, radarDimension: 'woody', color: '#9E5B28', aliases: ['Virgin Oak', 'Weißeiche'] },
          { id: 'charred_cask', name: { EN: 'Alligator Char Cask', DE: 'Ausgebranntes Fass' }, radarDimension: 'woody', color: '#4A2A1A', aliases: ['Charred Cask', 'Alligator Char'] },
          { id: 'zeder', name: { EN: 'Cedarwood', DE: 'Zedernholz' }, radarDimension: 'woody', color: '#94532B', aliases: ['Cedar', 'Zeder'] },
          { id: 'sandelholz', name: { EN: 'Sandalwood', DE: 'Sandelholz' }, radarDimension: 'woody', color: '#8A583A', aliases: ['Sandalwood', 'Sandelholz'] },
          { id: 'vanille_holz', name: { EN: 'Vanilla Oak', DE: 'Vanilleeiche' }, radarDimension: 'woody', color: '#B37B30', aliases: ['Vanilla Oak'] },
          { id: 'sherry_cask', name: { EN: 'Oloroso Sherry Cask', DE: 'Oloroso-Sherryfass' }, radarDimension: 'woody', color: '#7E2A2B', aliases: ['Sherry Cask', 'Sherryfass'] },
          { id: 'bourbon_cask', name: { EN: 'First-Fill Bourbon Cask', DE: 'First-Fill Bourbonfass' }, radarDimension: 'woody', color: '#A65E26', aliases: ['Bourbon Cask'] },
        ],
      },
      {
        id: 'roestaromen',
        name: { EN: 'Roasted Aromas & Coffee', DE: 'Röstaromen & Kaffee' },
        descriptors: [
          { id: 'espresso', name: { EN: 'Dark Roast Espresso', DE: 'Dunkler Espresso' }, radarDimension: 'chocolate', color: '#3E251A', aliases: ['Espresso', 'Kaffee', 'Coffee'] },
          { id: 'kaffeebohnen', name: { EN: 'Roasted Coffee Beans', DE: 'Geröstete Kaffeebohnen' }, radarDimension: 'chocolate', color: '#4A2D1F', aliases: ['Coffee Beans', 'Kaffeebohnen'] },
          { id: 'kakaonibs', name: { EN: 'Roasted Cocoa Nibs', DE: 'Kakaonibs' }, radarDimension: 'chocolate', color: '#452A18', aliases: ['Cocoa Nibs', 'Kakaonibs'] },
          { id: 'roestkastanien', name: { EN: 'Roasted Chestnuts', DE: 'Geröstete Maronen' }, radarDimension: 'nutty', color: '#7A4826', aliases: ['Chestnuts', 'Maronen'] },
        ],
      },
      {
        id: 'nussig_oelig',
        name: { EN: 'Nutty & Kernels', DE: 'Nussig & Kerne' },
        descriptors: [
          { id: 'haselnuss', name: { EN: 'Roasted Hazelnut', DE: 'Geröstete Haselnuss' }, radarDimension: 'nutty', color: '#8B6239', aliases: ['Hazelnut', 'Haselnuss'] },
          { id: 'walnuss', name: { EN: 'Black Walnut', DE: 'Walnuss' }, radarDimension: 'nutty', color: '#7E5733', aliases: ['Walnut', 'Walnuss'] },
          { id: 'gebrannte_mandel', name: { EN: 'Roasted Almond', DE: 'Gebrannte Mandel' }, radarDimension: 'nutty', color: '#9C774C', aliases: ['Almond', 'Mandel'] },
          { id: 'marzipan', name: { EN: 'Noble Marzipan', DE: 'Edel-Marzipan' }, radarDimension: 'nutty', color: '#B08E5D', aliases: ['Marzipan'] },
          { id: 'pekannuss', name: { EN: 'Pecan Nut', DE: 'Pekannuss' }, radarDimension: 'nutty', color: '#8C562E', aliases: ['Pecan', 'Pekannuss'] },
          { id: 'paranuss', name: { EN: 'Brazil Nut', DE: 'Paranuss' }, radarDimension: 'nutty', color: '#785332', aliases: ['Brazil Nut', 'Paranuss'] },
          { id: 'macadamia', name: { EN: 'Buttery Macadamia', DE: 'Buttrige Macadamianuss' }, radarDimension: 'nutty', color: '#A88856', aliases: ['Macadamia'] },
          { id: 'haselnusscreme', name: { EN: 'Hazelnut Nougat Cream', DE: 'Nuss-Nougat-Creme' }, radarDimension: 'nutty', color: '#6E4324', aliases: ['Nougat', 'Nuss-Nougat'] },
        ],
      },
    ],
  },

  // ─── 7. FRUITY, TROPICAL & CITRUS (Früchte, Tropisch & Zitrus) ─────────────
  {
    id: 'fruchtig',
    name: { EN: 'Fruity, Tropical & Citrus', DE: 'Früchte, Tropisch & Zitrus' },
    emoji: '🍌',
    radarDimension: 'fruity',
    subcategories: [
      {
        id: 'tropisch',
        name: { EN: 'Tropical & Exotic Fruit', DE: 'Tropische Früchte & Banane' },
        descriptors: [
          { id: 'banane', name: { EN: 'Ripe Banana', DE: 'Reife Banane' }, radarDimension: 'fruity', color: '#CFA727', aliases: ['Banana', 'Banane'] },
          { id: 'flambierte_banane', name: { EN: 'Flambéed Banana', DE: 'Flambierte Banane' }, radarDimension: 'fruity', color: '#BA891E', aliases: ['Flambeed Banana', 'Gebackene Banane'] },
          { id: 'ananas', name: { EN: 'Charred Pineapple', DE: 'Gegrillte Ananas' }, radarDimension: 'fruity', color: '#C49B1F', aliases: ['Pineapple', 'Ananas'] },
          { id: 'mango', name: { EN: 'Juicy Mango', DE: 'Saftige Mango' }, radarDimension: 'fruity', color: '#C9751E', aliases: ['Mango'] },
          { id: 'passionsfrucht', name: { EN: 'Passion Fruit / Maracuja', DE: 'Passionsfrucht / Maracuja' }, radarDimension: 'fruity', color: '#C45727', aliases: ['Passion Fruit', 'Maracuja'] },
          { id: 'papaya', name: { EN: 'Papaya', DE: 'Papaya' }, radarDimension: 'fruity', color: '#C76A28', aliases: ['Papaya'] },
          { id: 'kokosnuss', name: { EN: 'Toasted Coconut', DE: 'Geröstete Kokosnuss' }, radarDimension: 'fruity', color: '#A88D5E', aliases: ['Coconut', 'Kokos', 'Kokosnuss'] },
          { id: 'guave', name: { EN: 'Guava', DE: 'Guave' }, radarDimension: 'fruity', color: '#BD4852', aliases: ['Guava', 'Guave'] },
        ],
      },
      {
        id: 'kernobst_steinobst',
        name: { EN: 'Orchard & Stone Fruit', DE: 'Kern- & Steinobst' },
        descriptors: [
          { id: 'gruener_apfel', name: { EN: 'Green Crisp Apple', DE: 'Grüner Apfel' }, radarDimension: 'fruity', color: '#3E8E41', aliases: ['Green Apple', 'Apfel'] },
          { id: 'roter_apfel', name: { EN: 'Red Ripe Apple', DE: 'Roter Apfel' }, radarDimension: 'fruity', color: '#AD3228', aliases: ['Red Apple'] },
          { id: 'bratapfel', name: { EN: 'Baked Apple with Spices', DE: 'Würziger Bratapfel' }, radarDimension: 'fruity', color: '#9E4424', aliases: ['Baked Apple', 'Bratapfel'] },
          { id: 'birne', name: { EN: 'Poached Pear', DE: 'Pochierte Birne' }, radarDimension: 'fruity', color: '#84A338', aliases: ['Pear', 'Birne'] },
          { id: 'quitte', name: { EN: 'Quince Jelly', DE: 'Quittengelee' }, radarDimension: 'fruity', color: '#B39424', aliases: ['Quince', 'Quitte'] },
          { id: 'pfirsich', name: { EN: 'Yellow Peach', DE: 'Gelber Pfirsich' }, radarDimension: 'fruity', color: '#C2673B', aliases: ['Peach', 'Pfirsich'] },
          { id: 'aprikose', name: { EN: 'Sun-Dried Apricot', DE: 'Reife Aprikose' }, radarDimension: 'fruity', color: '#C9732B', aliases: ['Apricot', 'Aprikose'] },
          { id: 'schwarzkirsche', name: { EN: 'Black Cherry', DE: 'Schwarzkirsche' }, radarDimension: 'fruity', color: '#69182E', aliases: ['Black Cherry', 'Kirsche', 'Cherry'] },
          { id: 'mirabelle', name: { EN: 'Mirabelle Plum', DE: 'Mirabelle' }, radarDimension: 'fruity', color: '#C4912B', aliases: ['Mirabelle'] },
        ],
      },
      {
        id: 'beeren_dunkle_fruechte',
        name: { EN: 'Berries & Wild Berries', DE: 'Beeren & Waldfrüchte' },
        descriptors: [
          { id: 'beeren', name: { EN: 'Wild Berries', DE: 'Waldbeeren' }, radarDimension: 'fruity', color: '#9E2B4B', aliases: ['Berries', 'Waldbeeren'] },
          { id: 'cassis', name: { EN: 'Blackcurrant / Cassis', DE: 'Schwarze Johannisbeere / Cassis' }, radarDimension: 'fruity', color: '#5C1738', aliases: ['Blackcurrant', 'Cassis', 'Johannisbeere'] },
          { id: 'brombeere', name: { EN: 'Ripe Blackberry', DE: 'Brombeere' }, radarDimension: 'fruity', color: '#4D153B', aliases: ['Blackberry', 'Brombeere'] },
          { id: 'himbeere', name: { EN: 'Forest Raspberry', DE: 'Waldhimbeere' }, radarDimension: 'fruity', color: '#A82548', aliases: ['Raspberry', 'Himbeere'] },
          { id: 'heidelbeere', name: { EN: 'Blueberry', DE: 'Heidelbeere' }, radarDimension: 'fruity', color: '#3B3666', aliases: ['Blueberry', 'Heidelbeere', 'Blaubeere'] },
        ],
      },
      {
        id: 'zitrus',
        name: { EN: 'Citrus & Zest', DE: 'Zitrusfrüchte & Zesten' },
        descriptors: [
          { id: 'lemon_curd', name: { EN: 'Lemon Curd / Zest', DE: 'Zitronencreme / Zeste' }, radarDimension: 'fruity', color: '#C88210', aliases: ['Lemon Curd', 'Zitrone', 'Zitronenzeste'] },
          { id: 'orange', name: { EN: 'Orange Peel & Marmalade', DE: 'Orangenschale & Marmelade' }, radarDimension: 'fruity', color: '#C66513', aliases: ['Orange', 'Orange Peel', 'Orangenschale'] },
          { id: 'blutorange', name: { EN: 'Blood Orange', DE: 'Saftige Blutorange' }, radarDimension: 'fruity', color: '#B83421', aliases: ['Blood Orange', 'Blutorange'] },
          { id: 'grapefruit', name: { EN: 'Pink Grapefruit', DE: 'Grapefruit' }, radarDimension: 'fruity', color: '#BD4532', aliases: ['Grapefruit'] },
          { id: 'limette', name: { EN: 'Fresh Lime', DE: 'Frische Limette' }, radarDimension: 'fruity', color: '#689E28', aliases: ['Lime', 'Limette'] },
          { id: 'bergamotte', name: { EN: 'Bergamot (Earl Grey)', DE: 'Bergamotte (Earl Grey)' }, radarDimension: 'fruity', color: '#969930', aliases: ['Bergamot', 'Bergamotte', 'Earl Grey'] },
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
        name: { EN: 'Dried Fruit & Raisin', DE: 'Trockenobst & Rosinen' },
        descriptors: [
          { id: 'raisin', name: { EN: 'Sun-Dried Raisins / Sultanas', DE: 'Rosinen & Sultaninen' }, radarDimension: 'winey', color: '#5B1C2E', aliases: ['Raisin', 'Rosine', 'Sultaninen'] },
          { id: 'dried_fig', name: { EN: 'Dried Turkish Fig', DE: 'Getrocknete Feige' }, radarDimension: 'winey', color: '#6E2235', aliases: ['Dried Fig', 'Feige'] },
          { id: 'dattel', name: { EN: 'Medjool Date', DE: 'Medjool-Dattel' }, radarDimension: 'winey', color: '#63271D', aliases: ['Date', 'Dattel'] },
          { id: 'pflaume', name: { EN: 'Stewed Prunes & Plums', DE: 'Backpflaumen & Rumtopf' }, radarDimension: 'winey', color: '#4A1B2E', aliases: ['Prune', 'Plum', 'Pflaume', 'Backpflaume', 'Rumtopf'] },
        ],
      },
      {
        id: 'weinnoten',
        name: { EN: 'Fortified Wine', DE: 'Starkweinnoten' },
        descriptors: [
          { id: 'sherry_wein', name: { EN: 'Pedro Ximénez Sherry', DE: 'PX-Sherrywein' }, radarDimension: 'winey', color: '#7A1F2D', aliases: ['Sherry Wine', 'PX'] },
          { id: 'portwein', name: { EN: 'Tawny Port Wine', DE: 'Tawny Portwein' }, radarDimension: 'winey', color: '#6B132B', aliases: ['Port Wine', 'Port', 'Portwein'] },
          { id: 'rotwein', name: { EN: 'Heavy Red Wine', DE: 'Schwerer Rotwein' }, radarDimension: 'winey', color: '#731627', aliases: ['Red Wine', 'Rotwein'] },
          { id: 'madeira', name: { EN: 'Madeira Wine', DE: 'Madeirawein' }, radarDimension: 'winey', color: '#692026', aliases: ['Madeira'] },
        ],
      },
    ],
  },

  // ─── 9. SWEETNESS, HONEY & BAKERY (Süße, Honig & Gebäck) ──────────────────
  {
    id: 'suesse',
    name: { EN: 'Sweetness & Bakery', DE: 'Süße & Gebäck' },
    emoji: '🍯',
    radarDimension: 'cereal',
    subcategories: [
      {
        id: 'vanille_cremes',
        name: { EN: 'Vanilla & Custard', DE: 'Vanille & Cremes' },
        descriptors: [
          { id: 'vanilla', name: { EN: 'Bourbon Vanilla Pod', DE: 'Bourbon-Vanilleschote' }, radarDimension: 'cereal', color: '#CBA038', aliases: ['Vanilla', 'Vanille'] },
          { id: 'creme_brulee', name: { EN: 'Crème Brûlée', DE: 'Crème Brûlée' }, radarDimension: 'cereal', color: '#C4972B', aliases: ['Creme Brulee', 'Crème Brûlée'] },
          { id: 'vanillepudding', name: { EN: 'Warm Vanilla Custard', DE: 'Vanillepudding / Custard' }, radarDimension: 'cereal', color: '#D4B048', aliases: ['Custard', 'Pudding'] },
          { id: 'marshmallow', name: { EN: 'Toasted Marshmallow', DE: 'Geröstetes Marshmallow' }, radarDimension: 'cereal', color: '#C7A867', aliases: ['Marshmallow'] },
          { id: 'weisse_schokolade', name: { EN: 'White Chocolate', DE: 'Weiße Schokolade' }, radarDimension: 'chocolate', color: '#BFA873', aliases: ['White Chocolate'] },
        ],
      },
      {
        id: 'honigarten',
        name: { EN: 'Heather & Forest Honey', DE: 'Heidehonig & Wabenhonig' },
        descriptors: [
          { id: 'honig', name: { EN: 'Scottish Heather Honey', DE: 'Schottischer Heidehonig' }, radarDimension: 'cereal', color: '#D49B22', aliases: ['Honey', 'Honig', 'Heather Honey'] },
          { id: 'waldhonig', name: { EN: 'Dark Forest Honey', DE: 'Dunkler Waldhonig' }, radarDimension: 'cereal', color: '#B5781B', aliases: ['Forest Honey', 'Waldhonig'] },
          { id: 'akazienhonig', name: { EN: 'Liquid Acacia Honey', DE: 'Akazienhonig' }, radarDimension: 'cereal', color: '#DEA935', aliases: ['Acacia Honey'] },
        ],
      },
      {
        id: 'karamell_toffee',
        name: { EN: 'Caramel, Toffee & Fudge', DE: 'Karamell, Toffee & Sirup' },
        descriptors: [
          { id: 'karamell', name: { EN: 'Rich Butter Caramel', DE: 'Butter-Karamell' }, radarDimension: 'cereal', color: '#A8631E', aliases: ['Caramel', 'Karamell'] },
          { id: 'salzkaramell', name: { EN: 'Salted Caramel', DE: 'Salzkaramell' }, radarDimension: 'cereal', color: '#B36D24', aliases: ['Salted Caramel', 'Salzkaramell'] },
          { id: 'toffee', name: { EN: 'Chewy English Toffee', DE: 'Englisches Toffee' }, radarDimension: 'cereal', color: '#945017', aliases: ['Toffee'] },
          { id: 'fudge', name: { EN: 'Scottish Butter Fudge', DE: 'Weicher Butter-Fudge' }, radarDimension: 'cereal', color: '#A15E1F', aliases: ['Fudge'] },
          { id: 'ahornsirup', name: { EN: 'Pure Maple Syrup', DE: 'Ahornsirup' }, radarDimension: 'cereal', color: '#8F4A18', aliases: ['Maple Syrup', 'Ahornsirup'] },
          { id: 'melasse', name: { EN: 'Black Treacle / Molasses', DE: 'Dunkle Melasse' }, radarDimension: 'cereal', color: '#592D14', aliases: ['Molasses', 'Treacle', 'Melasse'] },
          { id: 'brauner_zucker', name: { EN: 'Demerara Cane Sugar', DE: 'Demerara-Rohrzucker' }, radarDimension: 'cereal', color: '#8C4E1D', aliases: ['Brown Sugar', 'Demerara'] },
        ],
      },
      {
        id: 'schokolade',
        name: { EN: 'Chocolate & Cocoa', DE: 'Schokolade & Kakao' },
        descriptors: [
          { id: 'dark_chocolate', name: { EN: 'Dark Chocolate (85%)', DE: 'Edelbitterschokolade (85%)' }, radarDimension: 'chocolate', color: '#4A2E1B', aliases: ['Dark Chocolate', 'Schokolade', 'Zartbitter'] },
          { id: 'milchschokolade', name: { EN: 'Creamy Milk Chocolate', DE: 'Vollmilchschokolade' }, radarDimension: 'chocolate', color: '#734B2A', aliases: ['Milk Chocolate'] },
          { id: 'kakao', name: { EN: 'Dutch Cocoa Powder', DE: 'Dunkles Kakaopulver' }, radarDimension: 'chocolate', color: '#59361E', aliases: ['Cocoa', 'Kakao'] },
          { id: 'schokotrueffel', name: { EN: 'Chocolate Truffle', DE: 'Schokoladentrüffel' }, radarDimension: 'chocolate', color: '#402617', aliases: ['Truffle', 'Trüffel'] },
        ],
      },
      {
        id: 'gebaeck_buttrig',
        name: { EN: 'Scottish Shortbread & Bakery', DE: 'Shortbread & Buttergebäck' },
        descriptors: [
          { id: 'gebaeck_butter', name: { EN: 'Scottish Butter Shortbread', DE: 'Schottisches Butter-Shortbread' }, radarDimension: 'cereal', color: '#A88B4C', aliases: ['Pastry', 'Biscuit', 'Gebäck', 'Keks', 'Shortbread'] },
          { id: 'brioche', name: { EN: 'Warm Butter Brioche', DE: 'Warme Butter-Brioche' }, radarDimension: 'cereal', color: '#B39149', aliases: ['Brioche'] },
          { id: 'waffeln', name: { EN: 'Belgian Waffles', DE: 'Frische Waffeln' }, radarDimension: 'cereal', color: '#B89754', aliases: ['Waffles', 'Waffeln'] },
          { id: 'zimtschnecke', name: { EN: 'Cinnamon Roll / Bun', DE: 'Zimtschnecke' }, radarDimension: 'cereal', color: '#99582A', aliases: ['Cinnamon Roll', 'Zimtschnecke'] },
          { id: 'croissant', name: { EN: 'Flaky Croissant', DE: 'Buttercroissant' }, radarDimension: 'cereal', color: '#A68449', aliases: ['Croissant'] },
          { id: 'brotkruste', name: { EN: 'Artisan Bread Crust', DE: 'Knusprige Brotkruste' }, radarDimension: 'cereal', color: '#8F6B38', aliases: ['Bread Crust', 'Brotkruste'] },
        ],
      },
      {
        id: 'malz_cerealien',
        name: { EN: 'Malt Mash & Cereal', DE: 'Malz, Gerste & Cerealien' },
        descriptors: [
          { id: 'gemaelzte_gerste', name: { EN: 'Sweet Malt Mash / Wort', DE: 'Frische Malzmaische' }, radarDimension: 'cereal', color: '#9C7A3C', aliases: ['Malted Barley', 'Wort', 'Malz', 'Gerste'] },
          { id: 'gerstenmalz', name: { EN: 'Barley Malt Syrup', DE: 'Gerstenmalz-Sirup' }, radarDimension: 'cereal', color: '#8A682D', aliases: ['Barley Malt', 'Gerstenmalz'] },
          { id: 'haferbrei', name: { EN: 'Oatmeal Porridge & Granola', DE: 'Haferflocken / Granola' }, radarDimension: 'cereal', color: '#9E8A5E', aliases: ['Oatmeal', 'Porridge', 'Granola', 'Haferflocken'] },
          { id: 'butter_popcorn', name: { EN: 'Buttered Sweet Popcorn', DE: 'Butter-Popcorn' }, radarDimension: 'cereal', color: '#BA9B47', aliases: ['Popcorn', 'Butter Popcorn'] },
          { id: 'geroesteter_mais', name: { EN: 'Toasted Corn Grains', DE: 'Gerösteter Mais' }, radarDimension: 'cereal', color: '#AD8939', aliases: ['Corn', 'Mais'] },
          { id: 'roggenbrot', name: { EN: 'Rye Sourdough Bread', DE: 'Roggen-Sauerteigbrot' }, radarDimension: 'cereal', color: '#75542C', aliases: ['Rye', 'Roggen'] },
        ],
      },
    ],
  },
];

// ─── Custom Flavor Registry & Storage ────────────────────────────────────────

const CUSTOM_FLAVORS_STORAGE_KEY = 'aquavitaeum_custom_flavors';

let runtimeCustomFlavors: CustomFlavorDescriptor[] = [];

export function getStoredCustomFlavors(): CustomFlavorDescriptor[] {
  if (typeof window === 'undefined') {
    return runtimeCustomFlavors;
  }
  try {
    const raw = localStorage.getItem(CUSTOM_FLAVORS_STORAGE_KEY);
    if (!raw) return runtimeCustomFlavors;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      runtimeCustomFlavors = parsed;
      return parsed;
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

// ─── SSOT Derived Helpers ───────────────────────────────────────────────────

export function getAllFlavorDescriptors(customFlavors?: CustomFlavorDescriptor[]): FlavorDescriptor[] {
  const baseDescriptors = SPIRIT_FLAVOR_TAXONOMY.flatMap((cat) =>
    cat.subcategories.flatMap((sub) => sub.descriptors),
  );

  const customList = customFlavors ?? getStoredCustomFlavors();
  const convertedCustom: FlavorDescriptor[] = customList.map((cf) => ({
    id: cf.id,
    name: { EN: cf.name, DE: cf.name },
    radarDimension: cf.radarDimension,
    color: cf.color ?? RADAR_DIMENSION_COLORS[cf.radarDimension] ?? '#C59B27',
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

export function getDescriptorsByCategory(categoryId: string): FlavorDescriptor[] {
  const category = SPIRIT_FLAVOR_TAXONOMY.find((cat) => cat.id.toLowerCase() === categoryId.toLowerCase());
  if (!category) return [];
  return category.subcategories.flatMap((sub) => sub.descriptors);
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
  const categoryMap = new Map<string, { category: FlavorCategory | { id: string; name: { EN: string; DE: string }; emoji: string; radarDimension: keyof FlavorProfile }; count: number }>();

  for (const tag of tags) {
    const desc = findFlavorDescriptor(tag, customFlavors);
    if (!desc) continue;

    const category = SPIRIT_FLAVOR_TAXONOMY.find((cat) =>
      cat.subcategories.some((sub) =>
        sub.descriptors.some((d) => d.id === desc.id)
      )
    );

    if (category) {
      const existing = categoryMap.get(category.id);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(category.id, { category, count: 1 });
      }
    } else {
      // Custom flavor mapped to radar dimension
      const dimKey = desc.radarDimension;
      const existing = categoryMap.get(dimKey);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(dimKey, {
          category: {
            id: dimKey,
            name: { EN: dimKey.charAt(0).toUpperCase() + dimKey.slice(1), DE: dimKey.charAt(0).toUpperCase() + dimKey.slice(1) },
            emoji: '✨',
            radarDimension: dimKey,
          },
          count: 1,
        });
      }
    }
  }

  return Array.from(categoryMap.values()).map(({ category, count }) => ({
    id: category.id,
    name: category.name,
    emoji: category.emoji,
    color: RADAR_DIMENSION_COLORS[category.radarDimension] || '#C59B27',
    count,
  }));
}
