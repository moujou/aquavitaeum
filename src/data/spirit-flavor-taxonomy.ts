import { FlavorProfile } from '@/types/spirit.types';

export interface FlavorDescriptor {
  id: string;
  name: { EN: string; DE: string };
  radarDimension: keyof FlavorProfile;
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

// ─── SWRI-aligned Scotch Whisky Flavour Taxonomy ─────────────────────────────
// Based on the Scotch Whisky Research Institute (SWRI) 8-category flavour wheel.
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
          { id: 'asche', name: { EN: 'Ash', DE: 'Asche' }, radarDimension: 'peaty', aliases: ['Ash', 'Asche'] },
          { id: 'russ', name: { EN: 'Soot', DE: 'Ruß' }, radarDimension: 'peaty', aliases: ['Soot', 'Ruß'] },
          { id: 'teer', name: { EN: 'Tar', DE: 'Teer' }, radarDimension: 'peaty', aliases: ['Tar', 'Teer'] },
          { id: 'grillkohle', name: { EN: 'Charcoal', DE: 'Grillkohle' }, radarDimension: 'peaty', aliases: ['Charcoal', 'Grillkohle'] },
        ],
      },
      {
        id: 'rauchig',
        name: { EN: 'Smoky', DE: 'Rauchig' },
        descriptors: [
          { id: 'peat_smoke', name: { EN: 'Peat Smoke', DE: 'Torfrauch' }, radarDimension: 'peaty', aliases: ['Peat Smoke', 'Wood Smoke', 'Rauch', 'Torf'] },
          { id: 'verbranntes_holz', name: { EN: 'Burnt Wood', DE: 'Verbranntes Holz' }, radarDimension: 'peaty', aliases: ['Burnt Wood', 'Verbranntes Holz'] },
          { id: 'geraeucherte_lebensmittel', name: { EN: 'Smoked Food', DE: 'Geräucherte Lebensmittel' }, radarDimension: 'peaty', aliases: ['Smoked Food'] },
          { id: 'lagerfeuer', name: { EN: 'Campfire', DE: 'Lagerfeuer' }, radarDimension: 'peaty', aliases: ['Campfire', 'Lagerfeuer'] },
        ],
      },
      {
        id: 'medizinisch',
        name: { EN: 'Medicinal', DE: 'Medizinisch' },
        descriptors: [
          { id: 'jod', name: { EN: 'Iodine', DE: 'Jod' }, radarDimension: 'peaty', aliases: ['Iodine', 'Jod'] },
          { id: 'medizinisch_note', name: { EN: 'Medicinal', DE: 'Medizinisch' }, radarDimension: 'peaty', aliases: ['Medicinal', 'Medizinisch'] },
          { id: 'desinfektionsmittel', name: { EN: 'Antiseptic', DE: 'Desinfektionsmittel' }, radarDimension: 'peaty', aliases: ['Antiseptic', 'Desinfektionsmittel'] },
          { id: 'heftpflaster', name: { EN: 'Bandage / Plaster', DE: 'Heftpflaster' }, radarDimension: 'peaty', aliases: ['Bandage', 'Plaster', 'Pflaster'] },
        ],
      },
    ],
  },

  // ─── 2. FEINTY ─────────────────────────────────────────────────────────────
  // SWRI: Leather, tobacco, sweaty, cheesy/waxy notes from distillation tails
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
          { id: 'leather', name: { EN: 'Leather', DE: 'Leder' }, radarDimension: 'feinty', aliases: ['Leather', 'Leder'] },
          // SWRI: Wet leather is Feinty, not Sulphury
          { id: 'nasses_leder', name: { EN: 'Wet Leather', DE: 'Nasses Leder' }, radarDimension: 'feinty', aliases: ['Wet Leather', 'Nasses Leder'] },
          { id: 'tabakblaetter', name: { EN: 'Fresh Tobacco Leaves', DE: 'Frische Tabakblätter' }, radarDimension: 'feinty', aliases: ['Tobacco', 'Tabak'] },
          { id: 'trockener_tabak', name: { EN: 'Dry Tobacco', DE: 'Trockener Tabak' }, radarDimension: 'feinty', aliases: ['Dry Tobacco'] },
          { id: 'altes_buch', name: { EN: 'Old Book / Library', DE: 'Altes Buch / Bibliothek' }, radarDimension: 'feinty', aliases: ['Old Book', 'Library', 'Bibliothek'] },
          { id: 'zigarrenkiste', name: { EN: 'Cigar Box', DE: 'Zigarrenkiste' }, radarDimension: 'feinty', aliases: ['Cigar Box', 'Zigarrenkiste'] },
        ],
      },
      {
        id: 'wachsig_fettig',
        name: { EN: 'Waxy & Fatty', DE: 'Wachsig & Fettig' },
        descriptors: [
          // SWRI: Beeswax & Honeycomb = Feinty (waxy/fatty notes from distillation)
          { id: 'bienenwachs', name: { EN: 'Beeswax', DE: 'Bienenwachs' }, radarDimension: 'feinty', aliases: ['Beeswax'] },
          { id: 'honigwabe', name: { EN: 'Honeycomb', DE: 'Honigwabe' }, radarDimension: 'feinty', aliases: ['Honeycomb', 'Wabe'] },
        ],
      },
      {
        id: 'feinty_kaese',
        name: { EN: 'Cheesy & Sweaty', DE: 'Käsig & Schweißig' },
        descriptors: [
          // SWRI: Blue Cheese is firmly Feinty (cheesy/sweaty notes)
          { id: 'schimmelkaese', name: { EN: 'Blue Cheese', DE: 'Schimmelkäse' }, radarDimension: 'feinty', aliases: ['Blue Cheese'] },
        ],
      },
      {
        id: 'loesungsmittel',
        name: { EN: 'Solventy', DE: 'Lösungsmittel' },
        descriptors: [
          // SWRI: Nail polish / solvents are officially under Fruity (estery/solventy)
          { id: 'nagellackentferner', name: { EN: 'Nail Polish Remover', DE: 'Nagellackentferner' }, radarDimension: 'fruity', aliases: ['Nail Polish Remover'] },
        ],
      },
      {
        id: 'hefe_malz',
        name: { EN: 'Yeasty & Malty', DE: 'Hefe & Malznoten' },
        descriptors: [
          { id: 'gemaelzte_gerste', name: { EN: 'Malted Barley', DE: 'Gemälzte Gerste' }, radarDimension: 'feinty', aliases: ['Malted Barley', 'Wort'] },
          { id: 'hefeextrakt', name: { EN: 'Yeast Extract', DE: 'Hefeextrakt' }, radarDimension: 'feinty', aliases: ['Yeast'] },
        ],
      },
    ],
  },

  // ─── 3. CEREAL ─────────────────────────────────────────────────────────────
  // SWRI: Grain / malt / bakery notes from raw materials
  {
    id: 'getreide',
    name: { EN: 'Cereal & Grain', DE: 'Getreidenoten' },
    emoji: '🌾',
    radarDimension: 'cereal',
    subcategories: [
      {
        id: 'malz',
        name: { EN: 'Malt & Bakery', DE: 'Malz & Backwaren' },
        descriptors: [
          { id: 'cereal', name: { EN: 'Cereal', DE: 'Getreide' }, radarDimension: 'cereal', aliases: ['Cereal', 'Wort', 'Biscuit', 'Toast'] },
          { id: 'bierwuerze', name: { EN: 'Beer Wort', DE: 'Bierwürze' }, radarDimension: 'cereal', aliases: ['Beer Wort', 'Wort'] },
          { id: 'frisches_brot', name: { EN: 'Fresh Bread', DE: 'Frisches Brot' }, radarDimension: 'cereal', aliases: ['Fresh Bread', 'Brot'] },
          { id: 'cornflakes', name: { EN: 'Cornflakes', DE: 'Cornflakes' }, radarDimension: 'cereal', aliases: ['Cornflakes'] },
          { id: 'haferbrei', name: { EN: 'Oatmeal / Porridge', DE: 'Haferbrei' }, radarDimension: 'cereal', aliases: ['Oatmeal', 'Porridge', 'Haferbrei'] },
          { id: 'butterkeks', name: { EN: 'Butter Biscuit', DE: 'Butterkeks' }, radarDimension: 'cereal', aliases: ['Biscuit', 'Butterkeks'] },
        ],
      },
      {
        id: 'maischartig',
        name: { EN: 'Mash', DE: 'Maischartig' },
        descriptors: [
          { id: 'gerste', name: { EN: 'Barley', DE: 'Gerste' }, radarDimension: 'cereal', aliases: ['Barley', 'Gerste'] },
          { id: 'weizen', name: { EN: 'Wheat', DE: 'Weizen' }, radarDimension: 'cereal', aliases: ['Wheat', 'Weizen'] },
        ],
      },
      {
        id: 'zerealien',
        name: { EN: 'Toasted Cereals', DE: 'Zerealien & Toast' },
        descriptors: [
          { id: 'verbrannter_toast', name: { EN: 'Burnt Toast', DE: 'Verbrannter Toast' }, radarDimension: 'cereal', aliases: ['Toast', 'Burnt Toast'] },
          { id: 'geroestetes_malz', name: { EN: 'Roasted Malt', DE: 'Geröstetes Malz' }, radarDimension: 'cereal', aliases: ['Roasted Malt'] },
        ],
      },
      {
        id: 'roestaromen',
        name: { EN: 'Roasted Aromas', DE: 'Röstaromen' },
        descriptors: [
          { id: 'kakao', name: { EN: 'Cocoa', DE: 'Kakao' }, radarDimension: 'cereal', aliases: ['Cocoa', 'Kakao'] },
          { id: 'kaffee', name: { EN: 'Coffee', DE: 'Kaffee' }, radarDimension: 'cereal', aliases: ['Coffee', 'Kaffee'] },
        ],
      },
    ],
  },

  // ─── 4. HERBAL & SPICY ─────────────────────────────────────────────────────
  // SWRI: Spicy is part of Woody in some wheels; here kept as Spicy (radarDimension)
  {
    id: 'pflanzlich',
    name: { EN: 'Herbal & Spicy', DE: 'Pflanzlich & Würzig' },
    emoji: '🌿',
    radarDimension: 'spicy',
    subcategories: [
      {
        id: 'scharfe_gewuerze',
        name: { EN: 'Pungent & Hot Spices', DE: 'Scharfe Gewürze' },
        descriptors: [
          { id: 'schwarzer_pfeffer', name: { EN: 'Black Pepper', DE: 'Schwarzer Pfeffer' }, radarDimension: 'spicy', aliases: ['Black Pepper', 'Pfeffer'] },
          { id: 'weisser_pfeffer', name: { EN: 'White Pepper', DE: 'Weißer Pfeffer' }, radarDimension: 'spicy', aliases: ['White Pepper'] },
          { id: 'chili_catch', name: { EN: 'Chili Catch', DE: 'Chili-Schärfe' }, radarDimension: 'spicy', aliases: ['Chili Catch', 'Chili', 'Prickeln'] },
          { id: 'alcoholic_prickle', name: { EN: 'Alcoholic Prickle', DE: 'Prickelnde Alkohol-Schärfe' }, radarDimension: 'spicy', aliases: ['Prickle', 'Alcoholic Prickle'] },
        ],
      },
      {
        id: 'warme_gewuerze',
        name: { EN: 'Warm Baking Spices', DE: 'Süße & Warme Gewürze' },
        descriptors: [
          { id: 'zimt', name: { EN: 'Cinnamon', DE: 'Zimt' }, radarDimension: 'spicy', aliases: ['Cinnamon', 'Zimt'] },
          { id: 'muskatnuss', name: { EN: 'Nutmeg', DE: 'Muskatnuss' }, radarDimension: 'spicy', aliases: ['Nutmeg', 'Muskatnuss'] },
          { id: 'piment', name: { EN: 'Allspice', DE: 'Piment' }, radarDimension: 'spicy', aliases: ['Allspice', 'Piment'] },
          { id: 'kardamom', name: { EN: 'Cardamom', DE: 'Kardamom' }, radarDimension: 'spicy', aliases: ['Cardamom', 'Kardamom'] },
        ],
      },
      {
        id: 'kraeuter',
        name: { EN: 'Herbs & Botanicals', DE: 'Kräuter & Botanicals' },
        descriptors: [
          { id: 'garden_herbs', name: { EN: 'Garden Herbs', DE: 'Gartenkräuter' }, radarDimension: 'spicy', aliases: ['Garden Herbs', 'Kräuter'] },
          { id: 'juniper', name: { EN: 'Juniper', DE: 'Wacholder' }, radarDimension: 'spicy', aliases: ['Juniper', 'Wacholder'] },
          { id: 'lemongrass', name: { EN: 'Lemongrass', DE: 'Zitronengras' }, radarDimension: 'spicy', aliases: ['Lemongrass', 'Zitronengras'] },
          { id: 'ingwer', name: { EN: 'Ginger', DE: 'Ingwer' }, radarDimension: 'spicy', aliases: ['Ginger', 'Ingwer'] },
          { id: 'anis', name: { EN: 'Aniseed', DE: 'Anis' }, radarDimension: 'spicy', aliases: ['Aniseed', 'Anis'] },
          { id: 'lakritz', name: { EN: 'Licorice', DE: 'Lakritz' }, radarDimension: 'spicy', aliases: ['Licorice', 'Lakritz'] },
        ],
      },
      {
        id: 'gruenlich',
        name: { EN: 'Green & Vegetal', DE: 'Grünlich & Pflanzlich' },
        descriptors: [
          { id: 'tomatenpflanzen', name: { EN: 'Tomato Plants', DE: 'Tomatenpflanzen' }, radarDimension: 'spicy', aliases: ['Tomato Plants'] },
          { id: 'geschnittenes_gras', name: { EN: 'Fresh Cut Grass', DE: 'Frisch geschnittenes Gras' }, radarDimension: 'spicy', aliases: ['Grass', 'Fresh Cut Grass'] },
          { id: 'gruene_blaetter', name: { EN: 'Green Leaves', DE: 'Grüne Blätter' }, radarDimension: 'spicy', aliases: ['Green Leaves'] },
        ],
      },
    ],
  },

  // ─── 5. FLORAL ─────────────────────────────────────────────────────────────
  // SWRI: Floral includes flowers, grassy/hay, and soapy (perfumed) notes
  {
    id: 'floral',
    name: { EN: 'Floral & Blossom', DE: 'Floral & Blumig' },
    emoji: '🌸',
    radarDimension: 'floral',
    subcategories: [
      {
        id: 'natuerlich',
        name: { EN: 'Natural Flowers', DE: 'Natürliche Blumen' },
        descriptors: [
          { id: 'fresh_blossom', name: { EN: 'Fresh Blossom', DE: 'Frische Blüten' }, radarDimension: 'floral', aliases: ['Fresh Blossom', 'Blüten'] },
          { id: 'lavender', name: { EN: 'Lavender', DE: 'Lavendel' }, radarDimension: 'floral', aliases: ['Lavender', 'Lavendel'] },
          { id: 'rose', name: { EN: 'Rose', DE: 'Rose' }, radarDimension: 'floral', aliases: ['Rose', 'Rosen'] },
          { id: 'carnations', name: { EN: 'Carnations', DE: 'Gartennelken' }, radarDimension: 'floral', aliases: ['Carnations'] },
          { id: 'nelken', name: { EN: 'Cloves', DE: 'Gewürznelken' }, radarDimension: 'floral', aliases: ['Clove', 'Cloves', 'Nelken'] },
          { id: 'heidekraut', name: { EN: 'Heather', DE: 'Heidekraut' }, radarDimension: 'floral', aliases: ['Heather', 'Heidekraut'] },
          { id: 'veilchen', name: { EN: 'Violet', DE: 'Veilchen' }, radarDimension: 'floral', aliases: ['Violet', 'Veilchen'] },
        ],
      },
      {
        id: 'grasig_heu',
        // SWRI: Barnyard and Hay fall under Floral (grassy/hay subcategory)
        name: { EN: 'Grassy & Hay', DE: 'Grasig & Heu' },
        descriptors: [
          { id: 'heu', name: { EN: 'Hay', DE: 'Heu' }, radarDimension: 'floral', aliases: ['Hay', 'Heu'] },
          { id: 'stroh', name: { EN: 'Straw', DE: 'Stroh' }, radarDimension: 'floral', aliases: ['Straw', 'Stroh'] },
          // SWRI: Barnyard is under Floral / Hay subcategory
          { id: 'schweinestall', name: { EN: 'Barnyard', DE: 'Stallnoten' }, radarDimension: 'floral', aliases: ['Barnyard'] },
        ],
      },
      {
        id: 'seifig_parfuemiert',
        // SWRI: Soapy notes belong under Floral (perfumed/soapy)
        name: { EN: 'Soapy & Perfumed', DE: 'Seifig & Parfümiert' },
        descriptors: [
          { id: 'unparfuemierte_seife', name: { EN: 'Unscented Soap', DE: 'Unparfümierte Seife' }, radarDimension: 'floral', aliases: ['Soap', 'Seife'] },
          { id: 'parfuemiert', name: { EN: 'Perfumed', DE: 'Parfümiert' }, radarDimension: 'floral', aliases: ['Perfumed'] },
        ],
      },
    ],
  },

  // ─── 6. FRUITY ─────────────────────────────────────────────────────────────
  // SWRI: Fruity includes solventy esters (nail varnish) as well as fresh/dried fruit
  {
    id: 'esternoten',
    name: { EN: 'Fruity & Estery', DE: 'Esternoten & Frucht' },
    emoji: '🍎',
    radarDimension: 'fruity',
    subcategories: [
      {
        id: 'loesungsmittel_ester',
        // SWRI: Solventy / nail varnish = Fruity (ester-based)
        name: { EN: 'Solventy & Estery', DE: 'Lösungsmittel & Ester' },
        descriptors: [
          { id: 'nagellackentferner', name: { EN: 'Nail Polish Remover', DE: 'Nagellackentferner' }, radarDimension: 'fruity', aliases: ['Nail Polish Remover'] },
        ],
      },
      {
        id: 'zitrus',
        name: { EN: 'Citrus', DE: 'Zitrusfrüchte' },
        descriptors: [
          { id: 'citrus_peel', name: { EN: 'Citrus Peel', DE: 'Zitrus-Schale' }, radarDimension: 'fruity', aliases: ['Citrus Peel', 'Zitrus'] },
          { id: 'zitrone', name: { EN: 'Lemon', DE: 'Zitrone' }, radarDimension: 'fruity', aliases: ['Lemon', 'Zitrone'] },
          { id: 'limette', name: { EN: 'Lime', DE: 'Limette' }, radarDimension: 'fruity', aliases: ['Lime', 'Limette'] },
          { id: 'orange', name: { EN: 'Orange', DE: 'Orange' }, radarDimension: 'fruity', aliases: ['Orange'] },
          { id: 'grapefruit', name: { EN: 'Grapefruit', DE: 'Grapefruit' }, radarDimension: 'fruity', aliases: ['Grapefruit'] },
        ],
      },
      {
        id: 'kernobst_beeren',
        name: { EN: 'Orchard & Berries', DE: 'Kernobst & Beeren' },
        descriptors: [
          { id: 'green_apple', name: { EN: 'Green Apple', DE: 'Grüner Apfel' }, radarDimension: 'fruity', aliases: ['Green Apple', 'Apfel'] },
          { id: 'pear', name: { EN: 'Pear', DE: 'Birne' }, radarDimension: 'fruity', aliases: ['Pear', 'Birne'] },
          { id: 'peach', name: { EN: 'Peach', DE: 'Pfirsich' }, radarDimension: 'fruity', aliases: ['Peach', 'Pfirsich'] },
          { id: 'kirsche', name: { EN: 'Cherry', DE: 'Kirsche' }, radarDimension: 'fruity', aliases: ['Cherry', 'Kirsche'] },
          { id: 'himbeere', name: { EN: 'Raspberry', DE: 'Himbeere' }, radarDimension: 'fruity', aliases: ['Raspberry', 'Himbeere'] },
        ],
      },
      {
        id: 'tropisch',
        name: { EN: 'Tropical Fruits', DE: 'Exotische Früchte' },
        descriptors: [
          { id: 'banana', name: { EN: 'Banana', DE: 'Banane' }, radarDimension: 'fruity', aliases: ['Banana', 'Banane'] },
          { id: 'ananas', name: { EN: 'Pineapple', DE: 'Ananas' }, radarDimension: 'fruity', aliases: ['Pineapple', 'Ananas'] },
          { id: 'mango', name: { EN: 'Mango', DE: 'Mango' }, radarDimension: 'fruity', aliases: ['Mango'] },
          { id: 'melone', name: { EN: 'Melon', DE: 'Melone' }, radarDimension: 'fruity', aliases: ['Melon', 'Melone'] },
        ],
      },
      {
        id: 'trockenobst',
        name: { EN: 'Dried Fruits', DE: 'Trockenobst' },
        descriptors: [
          { id: 'dried_fig', name: { EN: 'Dried Fig', DE: 'Getrocknete Feige' }, radarDimension: 'fruity', aliases: ['Dried Fig', 'Fig', 'Feige'] },
          { id: 'raisin', name: { EN: 'Raisin', DE: 'Rosinen' }, radarDimension: 'fruity', aliases: ['Raisin', 'Rosine', 'Rosinen'] },
          { id: 'datteln', name: { EN: 'Date', DE: 'Datteln' }, radarDimension: 'fruity', aliases: ['Date', 'Dattel', 'Datteln'] },
          { id: 'doerrpflaume', name: { EN: 'Prune', DE: 'Dörrpflaume' }, radarDimension: 'fruity', aliases: ['Prune', 'Pflaume', 'Dörrpflaume'] },
        ],
      },
    ],
  },

  // ─── 7. SWEETNESS & CONFECTIONERY ──────────────────────────────────────────
  {
    id: 'suesse',
    name: { EN: 'Sweetness & Confectionery', DE: 'Süße & Gebäck' },
    emoji: '🍫',
    radarDimension: 'chocolate',
    subcategories: [
      {
        id: 'honig_dessert',
        name: { EN: 'Honey & Dessert', DE: 'Honig & Dessert' },
        descriptors: [
          { id: 'honey', name: { EN: 'Honey', DE: 'Honig' }, radarDimension: 'chocolate', aliases: ['Honey', 'Honig'] },
          { id: 'vanilla', name: { EN: 'Vanilla', DE: 'Vanille' }, radarDimension: 'chocolate', aliases: ['Vanilla', 'Vanille'] },
          { id: 'caramel', name: { EN: 'Caramel', DE: 'Karamell' }, radarDimension: 'chocolate', aliases: ['Caramel', 'Karamell'] },
          { id: 'toffee', name: { EN: 'Toffee', DE: 'Toffee' }, radarDimension: 'chocolate', aliases: ['Toffee'] },
          { id: 'dark_chocolate', name: { EN: 'Dark Chocolate', DE: 'Dunkle Schokolade' }, radarDimension: 'chocolate', aliases: ['Dark Chocolate', 'Schokolade', 'Chocolate'] },
          { id: 'butterscotch', name: { EN: 'Butterscotch', DE: 'Butterscotch' }, radarDimension: 'chocolate', aliases: ['Butterscotch'] },
          { id: 'maple_syrup', name: { EN: 'Maple Syrup', DE: 'Ahornsirup' }, radarDimension: 'chocolate', aliases: ['Maple Syrup', 'Sirup'] },
          { id: 'marzipan', name: { EN: 'Marzipan', DE: 'Marzipan' }, radarDimension: 'chocolate', aliases: ['Marzipan'] },
          { id: 'zuckerwatte', name: { EN: 'Cotton Candy', DE: 'Zuckerwatte' }, radarDimension: 'chocolate', aliases: ['Cotton Candy', 'Zuckerwatte'] },
          { id: 'melasse', name: { EN: 'Molasses', DE: 'Melasse' }, radarDimension: 'chocolate', aliases: ['Molasses', 'Melasse'] },
        ],
      },
    ],
  },

  // ─── 8. CASK & OAK (WOODY) ─────────────────────────────────────────────────
  // SWRI: Woody = oak influence. Winey = previous cask contents influence.
  // SWRI also places Nutty and Oily/Creamy notes under Winey.
  {
    id: 'fasseinfluss',
    name: { EN: 'Cask & Oak Influence', DE: 'Fasseinfluss & Holz' },
    emoji: '🪵',
    radarDimension: 'woody',
    subcategories: [
      {
        id: 'bourbon_eiche',
        name: { EN: 'Bourbon & Oak', DE: 'Bourbon & Eiche' },
        descriptors: [
          { id: 'bourbon_barrel', name: { EN: 'Bourbon Barrel', DE: 'Bourbon-Fass' }, radarDimension: 'woody', aliases: ['Bourbon Barrel', 'Bourbon Cask'] },
          { id: 'toasted_oak', name: { EN: 'Toasted Oak', DE: 'Getoastete Eiche' }, radarDimension: 'woody', aliases: ['Toasted Oak', 'Charred Wood', 'Spicy Oak', 'Oak'] },
          { id: 'saegespaene', name: { EN: 'Fresh Sawdust', DE: 'Frische Sägespäne' }, radarDimension: 'woody', aliases: ['Fresh Sawdust', 'Sawdust', 'Sägespäne'] },
          { id: 'adstringierend', name: { EN: 'Astringent Wood Tannins', DE: 'Adstringierend / Tannine' }, radarDimension: 'woody', aliases: ['Astringent', 'Tannins', 'Adstringierend'] },
        ],
      },
      {
        id: 'verbrauchtes_fass',
        name: { EN: 'Refill Cask', DE: 'Verbrauchtes Fass' },
        descriptors: [
          { id: 'sour_wood', name: { EN: 'Sour Wood', DE: 'Säuerliches Holz' }, radarDimension: 'woody', aliases: ['Sour Wood'] },
          { id: 'refill_wood', name: { EN: 'Refill Wood', DE: 'Refill-Holz' }, radarDimension: 'woody', aliases: ['Refill Wood'] },
        ],
      },
      {
        id: 'winey_sherry',
        name: { EN: 'Sherry & Wine Cask', DE: 'Sherry & Weinfass' },
        descriptors: [
          { id: 'sherry_cask', name: { EN: 'Sherry Cask', DE: 'Sherry-Fass' }, radarDimension: 'winey', aliases: ['Sherry Cask', 'Wine Cask'] },
          { id: 'rum_cask', name: { EN: 'Rum Cask', DE: 'Rum-Fass' }, radarDimension: 'winey', aliases: ['Rum Cask'] },
          { id: 'port_wine', name: { EN: 'Port Wine', DE: 'Portwein' }, radarDimension: 'winey', aliases: ['Port Wine'] },
        ],
      },
      {
        id: 'winey_nussig_oelig',
        // SWRI: Nutty, Oily/Creamy notes are Winey (from sherry/wine cask influence)
        name: { EN: 'Nutty & Oily', DE: 'Nussig & Ölig' },
        descriptors: [
          { id: 'walnut', name: { EN: 'Walnut', DE: 'Walnuss' }, radarDimension: 'winey', aliases: ['Walnut', 'Walnuss'] },
          { id: 'almond', name: { EN: 'Almond', DE: 'Mandel' }, radarDimension: 'winey', aliases: ['Almond', 'Mandel'] },
          { id: 'hazelnut', name: { EN: 'Hazelnut', DE: 'Haselnuss' }, radarDimension: 'winey', aliases: ['Hazelnut', 'Haselnuss'] },
          { id: 'creamy_butter', name: { EN: 'Creamy Butter', DE: 'Cremige Butter' }, radarDimension: 'winey', aliases: ['Creamy Butter'] },
          { id: 'fresh_cream', name: { EN: 'Fresh Cream', DE: 'Frische Sahne' }, radarDimension: 'winey', aliases: ['Fresh Cream', 'Sahne'] },
          { id: 'olivenoel', name: { EN: 'Olive Oil', DE: 'Olivenöl' }, radarDimension: 'winey', aliases: ['Olive Oil', 'Olivenöl'] },
        ],
      },
    ],
  },

  // ─── 9. MARITIME & MINERAL ─────────────────────────────────────────────────
  // Closely related to Sulphury in SWRI; kept separate for UX clarity
  {
    id: 'maritime_mineral',
    name: { EN: 'Maritime & Mineral', DE: 'Maritim & Mineralisch' },
    emoji: '🌊',
    radarDimension: 'sulphury',
    subcategories: [
      {
        id: 'maritime',
        name: { EN: 'Maritime', DE: 'Maritim' },
        descriptors: [
          { id: 'sea_salt', name: { EN: 'Sea Salt', DE: 'Meersalz' }, radarDimension: 'sulphury', aliases: ['Sea Salt', 'Brine', 'Meersalz', 'Salz'] },
          { id: 'seaweed', name: { EN: 'Seaweed', DE: 'Seetang' }, radarDimension: 'sulphury', aliases: ['Seaweed', 'Seetang', 'Algen'] },
        ],
      },
      {
        id: 'mineral',
        name: { EN: 'Mineral', DE: 'Mineralisch' },
        descriptors: [
          { id: 'damp_earth', name: { EN: 'Damp Earth', DE: 'Feuchte Erde' }, radarDimension: 'sulphury', aliases: ['Damp Earth', 'Earth'] },
          { id: 'metallic', name: { EN: 'Metallic', DE: 'Metallisch' }, radarDimension: 'sulphury', aliases: ['Metallic'] },
          { id: 'mineral_note', name: { EN: 'Mineral', DE: 'Mineralisch' }, radarDimension: 'sulphury', aliases: ['Mineral'] },
          { id: 'feuerstein', name: { EN: 'Flint', DE: 'Feuerstein' }, radarDimension: 'sulphury', aliases: ['Flint', 'Feuerstein'] },
        ],
      },
    ],
  },

  // ─── 10. SULPHURY ──────────────────────────────────────────────────────────
  // SWRI: Sulphury = matches, rubber, cooked vegetables, meaty notes
  {
    id: 'schwefel_sauer',
    name: { EN: 'Sulphury & Sour', DE: 'Schwefel & Sauer' },
    emoji: '🧄',
    radarDimension: 'sulphury',
    subcategories: [
      {
        id: 'fleischig_gemuese',
        name: { EN: 'Meaty & Vegetal', DE: 'Fleischig & Gemüse' },
        descriptors: [
          { id: 'gekochtes_fleisch', name: { EN: 'Cooked Meat', DE: 'Gekochtes Fleisch' }, radarDimension: 'sulphury', aliases: ['Broth', 'Fleisch'] },
          { id: 'knoblauch', name: { EN: 'Garlic', DE: 'Knoblauch' }, radarDimension: 'sulphury', aliases: ['Garlic', 'Knoblauch'] },
          { id: 'zwiebel', name: { EN: 'Onion', DE: 'Zwiebel' }, radarDimension: 'sulphury', aliases: ['Onion', 'Zwiebel'] },
          { id: 'gekochtes_gemuese', name: { EN: 'Cooked Vegetables', DE: 'Gekochtes Gemüse' }, radarDimension: 'sulphury', aliases: ['Cooked Vegetables', 'Gemüse'] },
        ],
      },
      {
        id: 'gummi_streichhoelzer',
        name: { EN: 'Rubber & Matches', DE: 'Gummi & Streichhölzer' },
        descriptors: [
          { id: 'streichhoelzer', name: { EN: 'Struck Matches', DE: 'Streichhölzer' }, radarDimension: 'sulphury', aliases: ['Matches', 'Sulfur'] },
          { id: 'autoreifen', name: { EN: 'Tire Rubber', DE: 'Autoreifen' }, radarDimension: 'sulphury', aliases: ['Rubber', 'Gummi'] },
        ],
      },
    ],
  },
];

// ─── SSOT Derived Helper Getters ─────────────────────────────────────────────

/**
 * Derived helper: Get all flavor descriptors across all categories (SSOT flat array)
 */
export function getAllFlavorDescriptors(): FlavorDescriptor[] {
  return SPIRIT_FLAVOR_TAXONOMY.flatMap((cat) =>
    cat.subcategories.flatMap((sub) => sub.descriptors),
  );
}

/**
 * Derived helper: Get all flavor descriptors for a specific category ID
 */
export function getDescriptorsByCategory(catId: string): FlavorDescriptor[] {
  const category = SPIRIT_FLAVOR_TAXONOMY.find((cat) => cat.id === catId);
  return category ? category.subcategories.flatMap((sub) => sub.descriptors) : [];
}

/**
 * Derived helper: Get all flavor descriptors mapped to a specific Radar Chart dimension
 */
export function getDescriptorsByRadarDimension(
  dimension: keyof FlavorProfile,
): FlavorDescriptor[] {
  return getAllFlavorDescriptors().filter((d) => d.radarDimension === dimension);
}

/**
 * Derived helper: Find a descriptor by ID, name, or alias
 */
export function findFlavorDescriptor(query: string): FlavorDescriptor | undefined {
  const qLower = query.trim().toLowerCase();
  if (!qLower) return undefined;

  return getAllFlavorDescriptors().find((d) => {
    if (d.id.toLowerCase() === qLower) return true;
    if (d.name.EN.toLowerCase() === qLower) return true;
    if (d.name.DE.toLowerCase() === qLower) return true;
    return (d.aliases || []).some((a) => a.toLowerCase() === qLower);
  });
}

/**
 * Derived helper: Translate a flavor tag (by ID, English/German name, or alias) to the active language.
 */
export function translateFlavorTag(tag: string, language: 'EN' | 'DE' = 'EN'): string {
  if (!tag) return '';
  const desc = findFlavorDescriptor(tag);
  if (!desc) return tag;
  return desc.name[language] ?? desc.name.EN ?? tag;
}

