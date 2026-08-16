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
    notes: 'Notes',
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
    drinkingStrength: 'Standard Strength',
    caskStrength: 'Cask Strength',
    naturalColour: 'Natural Colour',
    addedColour: 'Added Colour',
    nonChillFiltered: 'Non-Chill Filtered',
    chillFiltered: 'Chill Filtered',
    bottlePrice: 'Bottle Price',
    bottleVolume: 'Bottle Size (ml)',

    // Tasting Additions & Characteristics
    characteristics: 'Characteristics',
    characteristicsAndServe: 'Characteristics & Serve',
    tastingAdditions: 'Tasting Additions',
    addedWaterBtn: 'Water',
    onTheRocksBtn: 'On the Rocks',
    withChocolateBtn: 'With Chocolate',

    // Visuals & Texture
    colour: 'Colour',
    glanceMouthfeel: 'Glance / Mouthfeel',
    activeFlavors: 'Flavor Profile',
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
    noseTasteRadar: 'Taste & Note',
    noseIntensity: 'Nose Intensity',
    tasteIntensity: 'Taste Intensity',

    // Finish Section
    finishTimeIntensityDiagram: 'Finish Intensity',
    finishLength: 'Finish Length & Temporal Profile',
    finishNotes: 'Finish Notes',
    finishNotesPlaceholder: 'Describe the lingering finish, warmth, and persistence…',
    simpleMode: 'Simple',
    advancedMode: 'Advanced',
    finish_Short: 'Short (0-5s)',
    finish_Medium: 'Medium (5-12s)',
    finish_Long: 'Long (10-20s+)',
    attackPhase: 'Attack (0-3s)',
    midPhase: 'Mid-Palate (3-10s)',
    finishPhase: 'Finish (10-30s+)',
    timeSeconds: 'Time (seconds)',
    intensityScale: 'Intensity (0-10)',
    startTime: 'Start (s)',
    peakIntensity: 'Peak',
    finishDuration: 'Length (s)',
    noActiveFlavorTagsFinish: 'Select flavor tags under Nose or Taste to view and edit flavor evolution curves in the finish diagram.',
    interactiveControlsHint: 'Drag control points on the canvas or adjust sliders below.',

    // Rating & Score
    scoreRatingSection: 'Rating',
    score: 'Score',
    deleteTastingNote: 'Delete',
    reset: 'Reset',
    saveTastingNote: 'Save',
    saved: 'Saved!',
    saving: 'Saving...',

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
    cellarEmptyTitle: 'Your Cellar is Empty',
    cellarEmptySubtitle: 'Start recording your collection by clicking "New Note" in the sidebar.',

    // Welcome Screen
    welcomeTitle: 'Aqua Vitaeum',
    welcomeSubtitle: 'Your Fine Spirits Tasting Journal',
    createFirstJournal: 'Create your first Journal',
    enterJournalBtn: 'Open Tasting Journal',
    
    // Journals Overview
    journalsTitle: 'My Journals',
    createJournalBtn: 'Create Journal',
    journalNamePlaceholder: 'e.g. Islay Malts, Caribbean Rums...',
    deleteJournalConfirm: 'Are you sure you want to delete this journal? All associated tasting notes will be permanently removed.',
    statsBottles: 'Bottles',
    statsAvgRating: 'Rating',
    statsLatest: 'Latest',
    statsUnrated: 'No notes yet',
    profileTab: 'You',
    profileLanguage: 'Language',

    // Overview Layout Preference
    overviewLayout: 'Tasting Notes Layout',
    overviewLayoutDesc: 'Display style for tasting notes in journals',
    layoutList: 'List',
    layoutGrid: 'Grid',

    // Bulk Tasting Note Delete (JournalLandingPage)
    deleteBulkNotesConfirm: 'notes will be permanently deleted. This action cannot be undone.',
    confirmDelete: 'Confirm Delete',

    // Google Drive Sync & Backup
    googleSyncTitle: 'Google Drive Sync',
    googleSyncDesc: 'Sync journals & tasting notes with your Google Drive (Aqua Vitaeum/ folder)',
    googleSyncOffline: 'Local Only (Offline)',
    googleSyncConnected: 'Connected to Drive',
    googleSyncConnect: 'Sync with Google Drive',
    googleSyncDisconnect: 'Disconnect Drive',
    googleSyncNow: 'Sync Now',
    googleSyncing: 'Syncing with Drive…',
    googleSyncSuccess: 'Sync completed successfully',
    googleSyncError: 'Sync failed. Please try again.',
    googleSyncLastSynced: 'Last synced',
    googleSyncLocalContinue: 'Start Offline & Local',
    googleSyncWelcomeOr: 'or',
    welcomePrivacyHint: '100% Private: Your tasting notes stay locally on your device or in your personal Google Drive.',
    exportLocalJson: 'Export JSON Backup',
    importLocalJson: 'Import JSON Backup',
    exportSingleNote: 'Export',
    importSingleNote: 'Import',
    exportJournal: 'Export Journal',
    exportJournals: 'Export',
    importJournal: 'Import Journal',
    journalImportSuccess: 'Journal imported successfully',
    journalImportError: 'Invalid or corrupt journal file',
    noteImportSuccess: 'Tasting note imported successfully',
    noteImportError: 'Invalid or corrupt tasting note file',
    privacyNoteGoogle: '100% Private: Your tasting notes and journals are saved directly to your personal Google Drive. No developer or third-party servers are used.',
  },
  DE: {
    // Header & Brand
    appTitle: 'Aqua Vitaeum',
    appSubtitle: 'Edelspirituosen Journal',
    uncasking: 'Öffne Fass…',
    inJournal: 'im Journal',

    // Collection Sidebar
    collection: 'Sammlung',
    notes: 'Notizen',
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
    drinkingStrength: 'Trinkstärke',
    caskStrength: 'Fassstärke',
    naturalColour: 'Ohne Farbstoff',
    addedColour: 'Mit Farbstoff',
    nonChillFiltered: 'Nicht kühlgefiltert',
    chillFiltered: 'Kühlgefiltert',
    bottlePrice: 'Flaschenpreis',
    bottleVolume: 'Füllmenge (ml)',

    // Tasting Additions & Characteristics
    characteristics: 'Eigenschaften',
    characteristicsAndServe: 'Eigenschaften & Servieren',
    tastingAdditions: 'Tasting-Zusätze',
    addedWaterBtn: 'Wasser',
    onTheRocksBtn: 'Auf Eis',
    withChocolateBtn: 'Mit Schokolade',

    // Visuals & Texture
    colour: 'Farbe',
    glanceMouthfeel: 'Mundgefühl',
    activeFlavors: 'Aroma-Profil',
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
    noseTasteRadar: 'Geschmack & Nase',
    noseIntensity: 'Nasen-Intensität',
    tasteIntensity: 'Geschmacks-Intensität',

    // Finish Section
    finishTimeIntensityDiagram: 'Abgangs-Intensität',
    finishLength: 'Abgangslänge & Zeitverlauf',
    finishNotes: 'Abgangsnotizen',
    finishNotesPlaceholder: 'Beschreibe den anhaltenden Nachklang, die Wärme und Komplexität…',
    simpleMode: 'Einfach',
    advancedMode: 'Erweitert',
    finish_Short: 'Kurz (0-5s)',
    finish_Medium: 'Mittel (5-12s)',
    finish_Long: 'Lang (10-20s+)',
    attackPhase: 'Auftakt (0-3s)',
    midPhase: 'Mitte (3-10s)',
    finishPhase: 'Abgang / Nachhall (10-30s+)',
    timeSeconds: 'Zeit (Sekunden)',
    intensityScale: 'Intensität (0-10)',
    startTime: 'Start (s)',
    peakIntensity: 'Peak',
    finishDuration: 'Länge (s)',
    noActiveFlavorTagsFinish: 'Wähle oben Aromen bei Nase oder Geschmack aus, um Entfaltungskurven im Abgangs-Diagramm anzuzeigen und zu bearbeiten.',
    interactiveControlsHint: 'Ziehe Kontrollpunkte im Graphen oder bewege die Regler unten.',

    // Rating & Score
    scoreRatingSection: 'Bewertung',
    score: 'Punkte',
    deleteTastingNote: 'Löschen',
    reset: 'Zurücksetzen',
    saveTastingNote: 'Speichern',
    saved: 'Gespeichert!',
    saving: 'Speichern...',

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
    cellarEmptyTitle: 'Dein Keller ist leer',
    cellarEmptySubtitle: 'Beginne mit deiner Sammlung, indem du im Seitenmenü auf "Neue Notiz" klickst.',

    // Welcome Screen
    welcomeTitle: 'Aqua Vitaeum',
    welcomeSubtitle: 'Dein feines Spirituosen-Verkostungsjournal',
    createFirstJournal: 'Erstelle dein erstes Journal',
    enterJournalBtn: 'Tasting-Journal öffnen',
    
    // Journals Overview
    journalsTitle: 'Meine Journals',
    createJournalBtn: 'Journal erstellen',
    journalNamePlaceholder: 'z.B. Islay Malts, Karibischer Rum...',
    deleteJournalConfirm: 'Bist du sicher, dass du dieses Journal löschen möchtest? Alle zugehörigen Verkostungsnotizen werden unwiderruflich gelöscht.',
    statsBottles: 'Flaschen',
    statsAvgRating: 'Bewertung',
    statsLatest: 'Zuletzt',
    statsUnrated: 'Noch keine Notizen',
    profileTab: 'Du',
    profileLanguage: 'Sprache',

    // Overview Layout Preference
    overviewLayout: 'Tasting-Karten Layout',
    overviewLayoutDesc: 'Anzeigestil der Notizen im Journal',
    layoutList: 'Liste',
    layoutGrid: 'Raster',

    // Bulk Tasting Note Delete (JournalLandingPage)
    deleteBulkNotesConfirm: 'Notizen werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
    confirmDelete: 'Löschen bestätigen',

    // Google Drive Sync & Backup
    googleSyncTitle: 'Google Drive Synchronisation',
    googleSyncDesc: 'Synchronisiere Journals & Tasting-Karten mit deinem Google Drive (Ordner Aqua Vitaeum/)',
    googleSyncOffline: 'Nur Lokal (Offline)',
    googleSyncConnected: 'Mit Google Drive synchronisiert',
    googleSyncConnect: 'Google Drive Sync aktivieren',
    googleSyncDisconnect: 'Drive trennen',
    googleSyncNow: 'Jetzt synchronisieren',
    googleSyncing: 'Synchronisiere mit Drive…',
    googleSyncSuccess: 'Synchronisation erfolgreich abgeschlossen',
    googleSyncError: 'Synchronisation fehlgeschlagen. Bitte erneut versuchen.',
    googleSyncLastSynced: 'Zuletzt synchronisiert',
    googleSyncLocalContinue: 'Lokal & Offline starten',
    googleSyncWelcomeOr: 'oder',
    welcomePrivacyHint: '100% Privat: Deine Notizen bleiben lokal auf deinem Gerät oder in deinem persönlichen Google Drive.',
    exportLocalJson: 'JSON-Backup exportieren',
    importLocalJson: 'JSON-Backup importieren',
    exportSingleNote: 'Export',
    importSingleNote: 'Import',
    exportJournal: 'Journal exportieren',
    exportJournals: 'Export',
    importJournal: 'Journal importieren',
    journalImportSuccess: 'Journal erfolgreich importiert',
    journalImportError: 'Ungültige oder beschädigte Journal-Datei',
    noteImportSuccess: 'Verkostungsnotiz erfolgreich importiert',
    noteImportError: 'Ungültige oder beschädigte Notiz-Datei',
    privacyNoteGoogle: '100% Privat: Deine Verkostungsnotizen und Journals werden direkt in deinem persönlichen Google Drive gespeichert. Es werden keine Server von Drittanbietern oder Entwicklern verwendet.',
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

export function translateRadarDimension(dim: string, lang: Language): string {
  const normalizedKey = `radar_${dim.toLowerCase()}` as TranslationKey;
  return TRANSLATIONS[lang]?.[normalizedKey] ?? dim;
}
