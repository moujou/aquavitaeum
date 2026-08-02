export const SUPPORTED_LANGUAGES = ['EN', 'DE'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const TRANSLATIONS = {
  EN: {
    // Header & Brand
    appTitle: 'Aqua Vitaeum',
    appSubtitle: 'Fine Spirits Journal',
    uncasking: 'Uncasking…',
    inJournal: 'in journal',

    // Collection Sidebar
    collection: 'Collection',
    newNote: 'New Note',
    searchPlaceholder: 'Search spirits…',
    allTypes: 'All Types',
    noMatchingFilter: 'No spirits match your filter.',

    // Card Header
    spiritType: 'Spirit Type',
    distilleryProducer: 'Distillery / Producer',
    spiritName: 'Name',
    regionOrigin: 'Region / Origin',
    ageYears: 'Age',
    caskBatchNo: 'Cask / Batch No.',
    abvPercent: 'ABV %',
    dateTasted: 'Date Tasted',
    finishType: 'Finish',
    caskStrength: 'Cask Strength',
    addedColour: 'Added Colour',
    chillFiltered: 'Chill Filtered',
    bottlePrice: 'Bottle Price',

    // Tasting Additions
    tastingAdditions: 'Tasting Additions',
    addedWaterBtn: 'Water',
    onTheRocksBtn: 'On the Rocks',
    withChocolateBtn: 'With Chocolate',

    // Visuals & Texture
    colour: 'Colour',
    glanceMouthfeel: 'Glance / Mouthfeel',
    activeFlavors: 'Active Flavors & Flavor Profile',
    activeFlavorsSummary: 'Active Flavors',
    spiritPhotos: 'Spirit Photos',
    noPhotosAdded: 'No Photos Added',
    addPhotoDesc: 'Add bottle label, spirit colour, or tasting setup photos',
    addPhoto: 'Add Photo',
    useAsThumbnail: 'Use as Thumbnail',
    useAsThumbnailActive: 'Use as Thumbnail (Active)',
    deletePhoto: 'Delete photo',
    addAnotherPhoto: 'Add photo',

    // Flavor Categories
    cat_peat_smoke: 'Peat & Smoke',
    cat_cask_wood: 'Cask & Wood',
    cat_fruity_floral: 'Fruity & Floral',
    cat_sweetness_bakery: 'Sweetness & Bakery',
    cat_cereal_grain: 'Cereal & Grain',
    cat_nutty_oily: 'Nutty & Oily',
    cat_herbal_botanical: 'Herbal & Botanical',
    cat_maritime_mineral: 'Maritime & Mineral',

    // Radar & Sliders
    noseTasteRadar: 'Nose & Taste Radar',
    noseIntensity: 'Nose Intensity',
    tasteIntensity: 'Taste Intensity',

    // Finish Section
    finishLength: 'Finish Length',
    finishNotes: 'Finish Notes',
    finishNotesPlaceholder: 'Describe the lingering finish, warmth, and persistence…',

    // Rating & Score
    scoreRatingSection: 'Score & Rating Section',
    score: 'Score',
    deleteTastingNote: 'Delete Tasting Note',
    reset: 'Reset',
    saveTastingNote: 'Save Tasting Note',
    saved: 'Saved!',

    // Delete Modal
    deleteModalTitle: 'Delete Tasting Note?',
    deleteModalSubtitle: 'This action cannot be undone.',
    deleteModalMessage: 'Are you sure you want to permanently delete the tasting note for',
    yesDeleteNote: 'Yes, Delete Note',
    cancel: 'Cancel',

    // Spirit Colours
    colour_Clear: 'Clear',
    colour_White_Wine: 'White Wine',
    colour_Straw: 'Straw',
    colour_Honey: 'Honey',
    colour_Gold: 'Gold',
    colour_Amber: 'Amber',
    colour_Copper: 'Copper',
    colour_Mahogany: 'Mahogany',
    colour_Dark_Oak: 'Dark Oak',

    // Glances / Mouthfeel
    glance_Watery: 'Watery',
    glance_Oily: 'Oily',
    glance_Creamy: 'Creamy',
    glance_Smooth: 'Smooth',

    // Finish Durations
    finish_Short: 'Short',
    finish_Medium: 'Medium',
    finish_Long: 'Long',

    // Radar Dimensions
    radar_fruity: 'Fruity',
    radar_floral: 'Floral',
    radar_spicy: 'Spicy',
    radar_cereal: 'Cereal',
    radar_peaty: 'Peaty',
    radar_sulphury: 'Sulphury',
    radar_feinty: 'Feinty',
    radar_nutty: 'Nutty',
    radar_woody: 'Woody',
    radar_winey: 'Winey',
    radar_chocolate: 'Chocolate',
  },
  DE: {
    // Header & Brand
    appTitle: 'Aqua Vitaeum',
    appSubtitle: 'Edelspirituosen Journal',
    uncasking: 'Öffne Fass…',
    inJournal: 'im Journal',

    // Collection Sidebar
    collection: 'Sammlung',
    newNote: 'Neue Notiz',
    searchPlaceholder: 'Spirituosen suchen…',
    allTypes: 'Alle Typen',
    noMatchingFilter: 'Keine Spirituosen entsprechen deinem Filter.',

    // Card Header
    spiritType: 'Spirituosen-Typ',
    distilleryProducer: 'Destillerie / Hersteller',
    spiritName: 'Name',
    regionOrigin: 'Herkunft / Region',
    ageYears: 'Alter',
    caskBatchNo: 'Fass / Batch-Nr.',
    abvPercent: 'Alk. %',
    dateTasted: 'Verkostungsdatum',
    finishType: 'Abgang / Fass-Finish',
    caskStrength: 'Fassstärke',
    addedColour: 'Farbstoff',
    chillFiltered: 'Kühlgefiltert',
    bottlePrice: 'Flaschenpreis',

    // Tasting Additions
    tastingAdditions: 'Tasting-Zusätze',
    addedWaterBtn: 'Wasser',
    onTheRocksBtn: 'Auf Eis',
    withChocolateBtn: 'Mit Schokolade',

    // Visuals & Texture
    colour: 'Farbe',
    glanceMouthfeel: 'Mundgefühl',
    activeFlavors: 'Aktive Aromen & Geschmacksprofil',
    activeFlavorsSummary: 'Aktive Aromen',
    spiritPhotos: 'Spirituosen-Fotos',
    noPhotosAdded: 'Keine Fotos vorhanden',
    addPhotoDesc: 'Füge Flaschenetikett, Farbe oder Verkostungsfotos hinzu',
    addPhoto: 'Foto hinzufügen',
    useAsThumbnail: 'Als Cover nutzen',
    useAsThumbnailActive: 'Als Cover aktiv',
    deletePhoto: 'Foto löschen',
    addAnotherPhoto: 'Foto hinzufügen',

    // Flavor Categories
    cat_peat_smoke: 'Torf & Rauch',
    cat_cask_wood: 'Fass & Holz',
    cat_fruity_floral: 'Fruchtig & Blumig',
    cat_sweetness_bakery: 'Süße & Gebäck',
    cat_cereal_grain: 'Getreide & Korn',
    cat_nutty_oily: 'Nussig & Ölig',
    cat_herbal_botanical: 'Kräuter & Botanicals',
    cat_maritime_mineral: 'Maritim & Mineralisch',

    // Radar & Sliders
    noseTasteRadar: 'Nase & Geschmack Radar',
    noseIntensity: 'Nasen-Intensität',
    tasteIntensity: 'Geschmacks-Intensität',

    // Finish Section
    finishLength: 'Abgangslänge',
    finishNotes: 'Abgangsnotizen',
    finishNotesPlaceholder: 'Beschreibe den anhaltenden Nachklang, die Wärme und Komplexität…',

    // Rating & Score
    scoreRatingSection: 'Bewertung & Punkte',
    score: 'Punkte',
    deleteTastingNote: 'Verkostung löschen',
    reset: 'Zurücksetzen',
    saveTastingNote: 'Verkostung speichern',
    saved: 'Gespeichert!',

    // Delete Modal
    deleteModalTitle: 'Verkostung wirklich löschen?',
    deleteModalSubtitle: 'Diese Aktion kann nicht rückgängig gemacht werden.',
    deleteModalMessage: 'Bist du sicher, dass du die Verkostungsnotiz löschen möchtest für',
    yesDeleteNote: 'Ja, Notiz löschen',
    cancel: 'Abbrechen',

    // Spirit Colours
    colour_Clear: 'Klar',
    colour_White_Wine: 'Weißwein',
    colour_Straw: 'Stroh',
    colour_Honey: 'Honig',
    colour_Gold: 'Gold',
    colour_Amber: 'Bernstein',
    colour_Copper: 'Kupfer',
    colour_Mahogany: 'Mahagoni',
    colour_Dark_Oak: 'Dunkle Eiche',

    // Glances / Mouthfeel
    glance_Watery: 'Wässrig',
    glance_Oily: 'Ölig',
    glance_Creamy: 'Cremig',
    glance_Smooth: 'Weich',

    // Finish Durations
    finish_Short: 'Kurz',
    finish_Medium: 'Mittel',
    finish_Long: 'Lang',

    // Radar Dimensions
    radar_fruity: 'Fruchtig',
    radar_floral: 'Blumig',
    radar_spicy: 'Würzig',
    radar_cereal: 'Getreidig',
    radar_peaty: 'Torfbetont',
    radar_sulphury: 'Schwefelig',
    radar_feinty: 'Feinty',
    radar_nutty: 'Nussig',
    radar_woody: 'Holzig',
    radar_winey: 'Weinig',
    radar_chocolate: 'Schokolade',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.EN;

export function t(key: TranslationKey, lang: Language): string {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.EN[key] ?? key;
}

export function translateColour(colour: string, lang: Language): string {
  const normalizedKey = `colour_${colour.replace(/\s+/g, '_')}` as TranslationKey;
  return TRANSLATIONS[lang]?.[normalizedKey] ?? colour;
}

export function translateGlance(glance: string, lang: Language): string {
  const normalizedKey = `glance_${glance}` as TranslationKey;
  return TRANSLATIONS[lang]?.[normalizedKey] ?? glance;
}

export function translateFinish(finish: string, lang: Language): string {
  const normalizedKey = `finish_${finish}` as TranslationKey;
  return TRANSLATIONS[lang]?.[normalizedKey] ?? finish;
}

export function translateRadarDimension(dim: string, lang: Language): string {
  const normalizedKey = `radar_${dim.toLowerCase()}` as TranslationKey;
  return TRANSLATIONS[lang]?.[normalizedKey] ?? dim;
}
