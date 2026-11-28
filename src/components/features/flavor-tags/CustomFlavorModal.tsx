'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  CustomFlavorCategory,
  CustomFlavorDescriptor,
  CustomFlavorSubcategory,
  FlavorProfile,
} from '@/types/spirit.types';
import {
  MAX_FLAVOR_CATEGORIES,
  RADAR_DIMENSION_COLORS,
  SPIRIT_FLAVOR_TAXONOMY,
  getCategoryForRadarDimension,
  getEffectiveFlavorTaxonomy,
  inferCategoryFromTagName,
} from '@/data/spirit-flavor-taxonomy';
import { useLanguage } from '@/context/LanguageContext';
import { X, Pipette, Trash2 } from 'lucide-react';
import { AromaIcon } from '@/components/ui/AromaIcon';
import { cn } from '@/lib/utils';

interface CustomFlavorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (flavor: CustomFlavorDescriptor) => void;
  onSaveCategory?: (category: CustomFlavorCategory) => void;
  onSaveSubcategory?: (subcategory: CustomFlavorSubcategory) => void;
  onDeleteFlavor?: () => void;
  onDeleteCategory?: () => void;
  onDeleteSubcategory?: () => void;
  customSubcategories?: CustomFlavorSubcategory[];
  initialName?: string;
  initialDimension?: keyof FlavorProfile;
  initialCategoryId?: string;
  initialMode?: 'aroma' | 'category' | 'subcategory';
  editingFlavor?: CustomFlavorDescriptor | null;
  editingCategory?: CustomFlavorCategory | null;
  editingSubcategory?: CustomFlavorSubcategory | null;
  submitLabel?: string;
}

const EMOJI_QUICK_PICKS = [
  // Orchard, Stone Fruit, Citrus & Melons
  '🍏', '🍎', '🍐', '🍑', '🍒', '🍋', '🍊', '🍈', '🍉', '🍇', '🍅', '🫒', '🥑',
  // Berries & Tropical Fruits
  '🍓', '🫐', '🥭', '🍍', '🥥', '🥝', '🍌',
  // Sweets, Honey, Caramel, Candy & Desserts
  '🍯', '🍬', '🍭', '🍮', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍿', '🍡', '🥮',
  // Bakery, Bread, Grain, Malt & Cereal
  '🌾', '🌽', '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🥣', '🍚', '🍘',
  // Coffee, Tea, Cocoa, Wine, Spirits & Drinks
  '☕', '🍵', '🫖', '🧋', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🫗', '🥛', '🧃', '🧉', '🧊',
  // Nuts, Seeds, Roast & Cask Wood
  '🌰', '🥜', '🫘', '🪵', '🌳', '🌲', '🌴', '🎋', '🎍', '🛢️', '📦',
  // Spices, Pepper, Roots & Vegetables
  '🌶️', '🫚', '🧄', '🧅', '🫑', '🫛', '🥕', '🥔', '🍠', '🍆', '🥒', '🥬', '🥦', '🍄',
  // Herbs, Leaves, Grass, Floral & Botanicals
  '🌿', '🌱', '☘️', '🍀', '🍃', '🍂', '🍁', '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🪻', '🪷', '🌵',
  // Fire, Smoke, Peat, Ash, Medicinal & Lab
  '🔥', '💨', '🏕️', '🌋', '⚡', '🕯️', '🪔', '🧪', '💊', '🩹', '🧴', '🧼', '🧽',
  // Leather, Wax, Bees, Parchment & Vintage
  '👞', '🥾', '👜', '📜', '📖', '🐝', '🧶', '🧵', '🧺',
  // Savory, Meaty, Dairy & Umami
  '🥩', '🥓', '🍖', '🍗', '🧀', '🧈', '🥚', '🍳', '🍲', '🥘', '🫕', '🥣', '🥫',
  // Maritime, Sea, Salt, Mineral & Weather
  '🌊', '💧', '💦', '🧂', '🦪', '🐚', '🦀', '🦞', '🦐', '🦑', '🐟', '⚓', '🪨', '⛰️', '🌧️', '🌫️',
];

const COLOR_SWATCHES = [
  { label: 'Flame Smoke', value: '#E65100' },
  { label: 'Crimson Berry', value: '#D81B60' },
  { label: 'Warm Amber', value: '#F57C00' },
  { label: 'Golden Honey', value: '#C59B27' },
  { label: 'Clover Green', value: '#2E945D' },
  { label: 'Forest Olive', value: '#558B2F' },
  { label: 'Coastal Teal', value: '#00796B' },
  { label: 'Lavender', value: '#8E24AA' },
  { label: 'Burgundy', value: '#880E4F' },
  { label: 'Dark Cocoa', value: '#3E2723' },
  { label: 'Toasted Oak', value: '#6D4C41' },
  { label: 'Smoke Slate', value: '#4F565C' },
];

export function CustomFlavorModal({
  isOpen,
  onClose,
  onSave,
  onSaveCategory,
  onSaveSubcategory,
  onDeleteFlavor,
  onDeleteCategory,
  onDeleteSubcategory,
  customSubcategories = [],
  initialName = '',
  initialDimension,
  initialCategoryId,
  initialMode = 'aroma',
  editingFlavor = null,
  editingCategory = null,
  editingSubcategory = null,
  submitLabel,
}: CustomFlavorModalProps) {
  if (!isOpen) return null;

  const dialogKey = editingCategory
    ? `edit_cat_${editingCategory.id}`
    : editingSubcategory
      ? `edit_sub_${editingSubcategory.id}`
      : editingFlavor
        ? `edit_aroma_${editingFlavor.id}`
        : `new_${initialMode}_${initialName}_${initialDimension ?? ''}_${initialCategoryId ?? ''}`;

  const resolvedInitialMode: 'aroma' | 'category' | 'subcategory' = editingCategory
    ? 'category'
    : editingSubcategory
      ? 'subcategory'
      : editingFlavor
        ? 'aroma'
        : initialMode;

  return (
    <CustomFlavorDialog
      key={dialogKey}
      onClose={onClose}
      onSave={onSave}
      onSaveCategory={onSaveCategory}
      onSaveSubcategory={onSaveSubcategory}
      onDeleteFlavor={onDeleteFlavor}
      onDeleteCategory={onDeleteCategory}
      onDeleteSubcategory={onDeleteSubcategory}
      customSubcategories={customSubcategories}
      initialName={initialName}
      initialDimension={initialDimension}
      initialCategoryId={initialCategoryId}
      initialMode={resolvedInitialMode}
      editingFlavor={editingFlavor}
      editingCategory={editingCategory}
      editingSubcategory={editingSubcategory}
      submitLabel={submitLabel}
    />
  );
}

function CustomFlavorDialog({
  onClose,
  onSave,
  onSaveCategory,
  onSaveSubcategory,
  onDeleteFlavor,
  onDeleteCategory,
  onDeleteSubcategory,
  customSubcategories = [],
  initialName = '',
  initialDimension,
  initialCategoryId,
  initialMode = 'aroma',
  editingFlavor = null,
  editingCategory = null,
  editingSubcategory = null,
  submitLabel,
}: {
  onClose: () => void;
  onSave: (flavor: CustomFlavorDescriptor) => void;
  onSaveCategory?: (category: CustomFlavorCategory) => void;
  onSaveSubcategory?: (subcategory: CustomFlavorSubcategory) => void;
  onDeleteFlavor?: () => void;
  onDeleteCategory?: () => void;
  onDeleteSubcategory?: () => void;
  customSubcategories?: CustomFlavorSubcategory[];
  initialName?: string;
  initialDimension?: keyof FlavorProfile;
  initialCategoryId?: string;
  initialMode?: 'aroma' | 'category' | 'subcategory';
  editingFlavor?: CustomFlavorDescriptor | null;
  editingCategory?: CustomFlavorCategory | null;
  editingSubcategory?: CustomFlavorSubcategory | null;
  submitLabel?: string;
}) {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState<'aroma' | 'category' | 'subcategory'>(initialMode);

  const effectiveTaxonomy = useMemo(() => getEffectiveFlavorTaxonomy(), []);
  const activeCategoryCount = effectiveTaxonomy.length;
  const isMaxCategoriesReached = !editingCategory && activeCategoryCount >= MAX_FLAVOR_CATEGORIES;

  const defaultDim: keyof FlavorProfile = editingFlavor?.radarDimension ?? initialDimension ?? 'fruity';
  const defaultCat =
    (editingFlavor?.categoryId
      ? effectiveTaxonomy.find((c) => c.id.toLowerCase() === editingFlavor.categoryId!.toLowerCase())
      : undefined) ??
    (initialCategoryId
      ? effectiveTaxonomy.find((c) => c.id.toLowerCase() === initialCategoryId.toLowerCase())
      : undefined) ??
    getCategoryForRadarDimension(defaultDim) ??
    effectiveTaxonomy[0] ??
    SPIRIT_FLAVOR_TAXONOMY[0];
  const defaultCatEmoji = defaultCat?.emoji ?? '🍎';

  // Aroma State
  const [name, setName] = useState(editingFlavor ? editingFlavor.name : initialName);
  const [description, setDescription] = useState(editingFlavor?.description || '');
  const [emoji, setEmoji] = useState(
    editingFlavor ? (editingFlavor.emoji ?? '') : defaultCatEmoji
  );
  const [selectedDimension, setSelectedDimension] = useState<keyof FlavorProfile>(
    defaultCat?.radarDimension ?? defaultDim
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(defaultCat.id);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | undefined>(
    editingFlavor?.subcategoryId
  );
  const [customColor, setCustomColor] = useState<string | null>(editingFlavor?.color ?? null);

  // Category State
  const [catName, setCatName] = useState<string>(editingCategory ? editingCategory.name : '');
  const [catEmoji, setCatEmoji] = useState<string>(
    editingCategory ? (editingCategory.emoji ?? '') : '☕'
  );
  const [catColor, setCatColor] = useState<string>(editingCategory?.color || '#C59B27');

  // Subcategory State
  const [subName, setSubName] = useState(editingSubcategory ? editingSubcategory.name : '');
  const [subCategoryId, setSubCategoryId] = useState<string>(
    editingSubcategory?.categoryId || initialCategoryId || defaultCat.id
  );
  const [subEmoji, setSubEmoji] = useState<string>(
    editingSubcategory ? (editingSubcategory.emoji ?? '') : '📁'
  );

  const activeCategoryForAroma =
    effectiveTaxonomy.find((c) => c.id.toLowerCase() === selectedCategoryId.toLowerCase()) ??
    getCategoryForRadarDimension(selectedDimension) ??
    effectiveTaxonomy[0] ??
    SPIRIT_FLAVOR_TAXONOMY[0];
  const activeColor =
    customColor ||
    activeCategoryForAroma?.color ||
    RADAR_DIMENSION_COLORS[selectedDimension] ||
    '#C59B27';
  const subcategoriesForCurrentCategory = customSubcategories.filter(
    (s) => s.categoryId === activeCategoryForAroma?.id
  );

  const handleCategorySelectForAroma = (catId: string, dim: keyof FlavorProfile) => {
    setSelectedCategoryId(catId);
    setSelectedDimension(dim);
    setCustomColor(null);
    if (selectedSubcategoryId) {
      const stillValid = customSubcategories.some(
        (s) => s.id === selectedSubcategoryId && s.categoryId === catId
      );
      if (!stillValid) {
        setSelectedSubcategoryId(undefined);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'category' && onSaveCategory) {
      const trimmedCat = catName.trim();
      const trimmedCatEmoji = catEmoji.trim();
      if (!trimmedCat || isMaxCategoriesReached) return;
      const randomSuffix = crypto.randomUUID().slice(0, 8);
      const id = editingCategory?.id
        ? editingCategory.id
        : `cat_${trimmedCat.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${randomSuffix}`;
      const inferredDim =
        editingCategory?.radarDimension ??
        inferCategoryFromTagName(trimmedCat)?.radarDimension ??
        'woody';
      onSaveCategory({
        id,
        name: trimmedCat,
        emoji: trimmedCatEmoji,
        color: catColor || '#C59B27',
        radarDimension: inferredDim,
      });
      onClose();
      return;
    }

    if (mode === 'subcategory' && onSaveSubcategory) {
      const trimmedSub = subName.trim();
      if (!trimmedSub) return;
      const randomSuffix = crypto.randomUUID().slice(0, 8);
      const id = editingSubcategory?.id
        ? editingSubcategory.id
        : `subcat_${trimmedSub.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${randomSuffix}`;
      onSaveSubcategory({
        id,
        name: trimmedSub,
        categoryId: subCategoryId,
        emoji: subEmoji.trim(),
      });
      onClose();
      return;
    }

    const trimmed = name.trim();
    if (!trimmed) return;

    const randomSuffix = crypto.randomUUID().slice(0, 8);
    const id = editingFlavor?.id
      ? editingFlavor.id
      : `custom_${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${randomSuffix}`;
    const customDesc: CustomFlavorDescriptor = {
      id,
      name: trimmed,
      emoji: emoji.trim(),
      radarDimension: selectedDimension,
      categoryId: selectedCategoryId,
      color: activeColor,
      description: description.trim() || undefined,
      subcategoryId: selectedSubcategoryId || undefined,
    };

    onSave(customDesc);
    onClose();
  };

  if (typeof window === 'undefined') return null;

  const canSwitchMode =
    !editingFlavor &&
    !editingCategory &&
    !editingSubcategory &&
    (Boolean(onSaveSubcategory) || Boolean(onSaveCategory));

  const isSubmitDisabled =
    mode === 'category'
      ? !catName.trim() || isMaxCategoriesReached
      : mode === 'subcategory'
        ? !subName.trim()
        : !name.trim();

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[var(--parchment-bg)] border border-[var(--parchment-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[var(--wood-dark)] text-white border-b border-black/10 shadow-sm shrink-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <AromaIcon className="w-6 h-6 text-amber-200 shrink-0" />
            <h3 className="font-display font-bold text-base sm:text-xl tracking-wide text-white drop-shadow-xs truncate">
              {editingCategory
                ? language === 'DE'
                  ? 'Kategorie bearbeiten'
                  : 'Edit Category'
                : editingSubcategory
                  ? language === 'DE'
                    ? 'Unterkategorie bearbeiten'
                    : 'Edit Subcategory'
                  : editingFlavor
                    ? language === 'DE'
                      ? 'Aroma bearbeiten'
                      : 'Edit Aroma'
                    : mode === 'category'
                      ? language === 'DE'
                        ? 'Kategorie erstellen'
                        : 'Create Category'
                      : mode === 'subcategory'
                        ? language === 'DE'
                          ? 'Unterkategorie erstellen'
                          : 'Create Subcategory'
                        : language === 'DE'
                          ? 'Aroma hinzufügen'
                          : 'Add Aroma'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer shadow-xs shrink-0"
            aria-label={t('close')}
            title={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Full-Width 3-Tab Bar Below Header (Aroma | Kategorie | Unterkategorie — Text-Only Standard) */}
        {canSwitchMode && (
          <div className="px-4 sm:px-6 py-2.5 bg-[var(--parchment-bg-alt)]/60 border-b border-[var(--parchment-border)]/60 flex items-center shrink-0">
            <div
              className={cn(
                'grid gap-2 w-full p-1 rounded-xl bg-black/5 border border-[var(--parchment-border)]/40',
                onSaveCategory && onSaveSubcategory ? 'grid-cols-3' : 'grid-cols-2'
              )}
            >
              <button
                type="button"
                onClick={() => setMode('aroma')}
                className={cn(
                  'flex items-center justify-center py-2 px-2.5 sm:px-3 rounded-lg text-xs sm:text-sm font-display font-bold transition-all cursor-pointer truncate',
                  mode === 'aroma'
                    ? 'bg-[var(--wood-selection)] text-white shadow-xs'
                    : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-[var(--pub-bg-panel)]'
                )}
              >
                <span>{language === 'DE' ? 'Aroma' : 'Aroma'}</span>
              </button>
              {onSaveCategory && (
                <button
                  type="button"
                  onClick={() => setMode('category')}
                  className={cn(
                    'flex items-center justify-center py-2 px-2.5 sm:px-3 rounded-lg text-xs sm:text-sm font-display font-bold transition-all cursor-pointer truncate',
                    mode === 'category'
                      ? 'bg-[var(--wood-selection)] text-white shadow-xs'
                      : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-[var(--pub-bg-panel)]'
                  )}
                >
                  <span>{language === 'DE' ? 'Kategorie' : 'Category'}</span>
                </button>
              )}
              {onSaveSubcategory && (
                <button
                  type="button"
                  onClick={() => setMode('subcategory')}
                  className={cn(
                    'flex items-center justify-center py-2 px-2.5 sm:px-3 rounded-lg text-xs sm:text-sm font-display font-bold transition-all cursor-pointer truncate',
                    mode === 'subcategory'
                      ? 'bg-[var(--wood-selection)] text-white shadow-xs'
                      : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-[var(--pub-bg-panel)]'
                  )}
                >
                  <span>{language === 'DE' ? 'Unterkategorie' : 'Subcategory'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
          {mode === 'category' ? (
            /* ── MAIN CATEGORY CREATION / EDIT FORM ───────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column (md:col-span-6): Name, Color & Capacity Info */}
              <div className="md:col-span-6 flex flex-col gap-5">
                {/* Capacity Status Banner */}
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)]">
                  <div className="flex flex-col">
                    <span className="text-xs font-display font-bold text-[var(--foreground)]">
                      {language === 'DE'
                        ? 'Diagramm-Achsen & Aromarad'
                        : 'Radar Chart Axes & Aroma Wheel'}
                    </span>
                    <span className="text-[11px] font-body text-[var(--sepia-muted)]">
                      {language === 'DE'
                        ? 'Maximal 12 Hauptkategorien für optimale Übersicht'
                        : 'Maximum 12 main categories for optimal clarity'}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-mono font-bold shrink-0',
                      isMaxCategoriesReached
                        ? 'bg-[var(--brass-accent)]/20 text-[var(--brass-accent)] border border-[var(--brass-accent)]/40'
                        : 'bg-[var(--wood-selection)]/15 text-[var(--wood-selection)] border border-[var(--wood-selection)]/30'
                    )}
                  >
                    {activeCategoryCount} / {MAX_FLAVOR_CATEGORIES}
                  </span>
                </div>

                {isMaxCategoriesReached && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-[var(--brass-accent)]/15 border border-[var(--brass-accent)]/40 text-xs font-body text-[var(--sepia-text)]">
                    {language === 'DE'
                      ? 'Das Maximum von 12 Hauptkategorien ist erreicht. Du kannst bestehende Kategorien jederzeit bearbeiten oder im Auswählen-Modus löschen.'
                      : 'The maximum of 12 main categories has been reached. You can edit existing categories or delete one in Select Mode.'}
                  </div>
                )}

                {/* 1. Category Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-display font-bold tracking-wide text-[var(--foreground)]">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    disabled={isMaxCategoriesReached}
                    placeholder={
                      language === 'DE'
                        ? 'z. B. Röstaromen & Kaffee, Tropenfrüchte...'
                        : 'e.g. Roast & Coffee, Tropical Fruits...'
                    }
                    className="w-full bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-lg px-3.5 py-2.5 text-sm sm:text-base font-body text-[var(--foreground)] focus:outline-none focus:border-[var(--wood-selection)] placeholder:text-[var(--placeholder-text)] transition-colors shadow-inner disabled:opacity-50"
                    required
                  />
                </div>

                {/* 2. Category Color Picker */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm font-display font-bold tracking-wide text-[var(--foreground)]">
                    {language === 'DE' ? 'Farbe' : 'Color'}
                  </label>
                  <div className="flex items-center gap-2 flex-wrap p-2.5 bg-black/5 rounded-xl border border-[var(--parchment-border)]/40">
                    {COLOR_SWATCHES.map((swatch) => {
                      const isSelected = catColor.toLowerCase() === swatch.value.toLowerCase();
                      return (
                        <button
                          key={swatch.value}
                          type="button"
                          onClick={() => setCatColor(swatch.value)}
                          title={swatch.label}
                          className={cn(
                            'w-7 h-7 rounded-full border transition-all cursor-pointer relative flex items-center justify-center',
                            isSelected
                              ? 'border-white ring-2 ring-[var(--wood-selection)] scale-110 shadow-sm'
                              : 'border-black/20 hover:scale-110 opacity-85 hover:opacity-100'
                          )}
                          style={{ backgroundColor: swatch.value }}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                        </button>
                      );
                    })}

                    <label
                      title={t('customColor')}
                      className="w-7 h-7 rounded-full border border-dashed border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform relative overflow-hidden"
                    >
                      <Pipette className="w-3.5 h-3.5 text-[var(--sepia-text)] pointer-events-none" />
                      <input
                        type="color"
                        value={catColor}
                        onChange={(e) => setCatColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column (md:col-span-6): Emoji Icon Wall & Live Category Header Preview */}
              <div className="md:col-span-6 flex flex-col gap-5">
                {/* 3. Emoji Icon Wall with "Kein Icon" Option */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs sm:text-sm font-display font-bold tracking-wide text-[var(--foreground)]">
                      Icon
                    </label>
                    <button
                      type="button"
                      onClick={() => setCatEmoji('')}
                      className={cn(
                        'px-2.5 py-1 rounded-lg border text-xs font-body font-semibold flex items-center justify-center transition-all cursor-pointer',
                        catEmoji === ''
                          ? 'bg-[var(--wood-selection)] text-white border-[var(--wood-selection)] shadow-2xs'
                          : 'bg-[var(--pub-bg-panel)] text-[var(--sepia-text)] border-[var(--parchment-border)] hover:border-[var(--wood-selection)]'
                      )}
                    >
                      <span>{language === 'DE' ? 'Kein Icon' : 'No Icon'}</span>
                    </button>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <input
                        type="text"
                        value={catEmoji}
                        onChange={(e) => setCatEmoji(e.target.value)}
                        maxLength={4}
                        placeholder="—"
                        className="w-14 h-12 text-center text-2xl bg-[var(--pub-bg-panel)] border-2 border-[var(--wood-selection)] rounded-xl focus:outline-none shadow-sm shrink-0 placeholder:text-[var(--sepia-muted)]/40 not-italic"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center max-h-56 overflow-y-auto p-2 bg-black/5 rounded-xl border border-[var(--parchment-border)]/40 w-full">
                      {EMOJI_QUICK_PICKS.map((em, index) => (
                        <button
                          key={`cat_${em}_${index}`}
                          type="button"
                          onClick={() => setCatEmoji(em)}
                          className={cn(
                            'w-8 h-8 text-base rounded-lg flex items-center justify-center transition-all cursor-pointer select-none',
                            catEmoji === em
                              ? 'bg-[var(--wood-selection)] text-white scale-110 shadow-sm'
                              : 'hover:bg-black/10 hover:scale-105'
                          )}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Live Category Header Preview */}
                <div className="flex flex-col gap-2 pt-2 border-t border-[var(--parchment-divider)]">
                  <span className="text-[11px] font-display tracking-wide text-[var(--sepia-muted)] font-bold text-center">
                    {language === 'DE' ? 'Vorschau' : 'Preview'}
                  </span>
                  <div className="p-4 rounded-xl bg-black/5 border border-dashed border-[var(--parchment-border)]">
                    <div
                      className="px-4 py-2.5 rounded-xl bg-[var(--wood-dark)] flex items-center justify-between gap-3 shadow-md"
                      style={{ borderLeftWidth: '6px', borderLeftColor: catColor }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {catEmoji.trim() && (
                          <span className="text-xl leading-none shrink-0">{catEmoji}</span>
                        )}
                        <span className="font-display font-bold text-sm sm:text-base text-[var(--fab-text)] tracking-wide truncate">
                          {catName.trim() || (language === 'DE' ? 'Kategorie-Name' : 'Category Name')}
                        </span>
                      </div>
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                        style={{ backgroundColor: catColor }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : mode === 'subcategory' ? (
            /* ── SUBCATEGORY CREATION / EDIT FORM ─────────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Subcategory Name & Parent Category */}
              <div className="md:col-span-6 flex flex-col gap-5">
                {/* 1. Subcategory Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-display font-bold tracking-wide text-[var(--foreground)]">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder={
                      language === 'DE'
                        ? 'z. B. Zitrus, Tropisch, Beeren, Rauchig...'
                        : 'e.g. Citrus, Tropical, Berries, Medicinal...'
                    }
                    className="w-full bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-lg px-3.5 py-2.5 text-sm sm:text-base font-body text-[var(--foreground)] focus:outline-none focus:border-[var(--wood-selection)] placeholder:text-[var(--placeholder-text)] transition-colors shadow-inner"
                    required
                  />
                </div>

                {/* 2. Parent Category Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm font-display font-bold tracking-wide text-[var(--foreground)]">
                    {language === 'DE' ? 'Kategorie' : 'Category'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1.5 bg-black/5 rounded-xl border border-[var(--parchment-border)]/40">
                    {effectiveTaxonomy.map((cat) => {
                      const isCatActive = subCategoryId === cat.id;
                      const catNameLabel = cat.name[language] ?? cat.name.EN;
                      const catColorVal = cat.color ?? RADAR_DIMENSION_COLORS[cat.radarDimension] ?? '#C59B27';

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSubCategoryId(cat.id)}
                          className={cn(
                            'px-3 py-2 rounded-lg border text-xs sm:text-sm font-body font-semibold transition-all flex items-center gap-2 cursor-pointer text-left',
                            isCatActive
                              ? 'border-transparent text-white shadow-xs scale-[1.01]'
                              : 'border-[var(--parchment-border)]/60 bg-[var(--pub-bg-panel)] text-[var(--foreground)] hover:bg-[var(--pub-bg-alt)] hover:border-[var(--wood-selection)]/60'
                          )}
                          style={{
                            backgroundColor: isCatActive ? catColorVal : undefined,
                          }}
                        >
                          {cat.emoji && <span className="text-base shrink-0">{cat.emoji}</span>}
                          <span className="truncate">{catNameLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Subcategory Emoji Picker with "Kein Icon" & Preview */}
              <div className="md:col-span-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs sm:text-sm font-display font-bold tracking-wide text-[var(--foreground)]">
                      Icon
                    </label>
                    <button
                      type="button"
                      onClick={() => setSubEmoji('')}
                      className={cn(
                        'px-2.5 py-1 rounded-lg border text-xs font-body font-semibold flex items-center justify-center transition-all cursor-pointer',
                        subEmoji === ''
                          ? 'bg-[var(--wood-selection)] text-white border-[var(--wood-selection)] shadow-2xs'
                          : 'bg-[var(--pub-bg-panel)] text-[var(--sepia-text)] border-[var(--parchment-border)] hover:border-[var(--wood-selection)]'
                      )}
                    >
                      <span>{language === 'DE' ? 'Kein Icon' : 'No Icon'}</span>
                    </button>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="text"
                      value={subEmoji}
                      onChange={(e) => setSubEmoji(e.target.value)}
                      maxLength={4}
                      placeholder="—"
                      className="w-14 h-12 text-center text-2xl bg-[var(--pub-bg-panel)] border-2 border-[var(--wood-selection)] rounded-xl focus:outline-none shadow-sm shrink-0 placeholder:text-[var(--sepia-muted)]/40 not-italic"
                    />
                    <div className="flex flex-wrap gap-1.5 items-center max-h-56 overflow-y-auto p-2 bg-black/5 rounded-xl border border-[var(--parchment-border)]/40 w-full">
                      {EMOJI_QUICK_PICKS.map((em, index) => (
                        <button
                          key={`sub_${em}_${index}`}
                          type="button"
                          onClick={() => setSubEmoji(em)}
                          className={cn(
                            'w-8 h-8 text-base rounded-lg flex items-center justify-center transition-all cursor-pointer select-none',
                            subEmoji === em
                              ? 'bg-[var(--wood-selection)] text-white scale-110 shadow-sm'
                              : 'hover:bg-black/10 hover:scale-105'
                          )}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Subcategory Preview */}
                <div className="flex flex-col gap-2 pt-2 border-t border-[var(--parchment-divider)]">
                  <span className="text-[11px] font-display tracking-wide text-[var(--sepia-muted)] font-bold text-center">
                    {language === 'DE' ? 'Vorschau' : 'Preview'}
                  </span>
                  <div className="p-4 rounded-xl bg-black/5 border border-dashed border-[var(--parchment-border)]">
                    <div className="px-4 py-2 bg-[var(--pub-bg-alt)]/75 border border-[var(--parchment-border)] rounded-xl flex items-center gap-2">
                      {subEmoji.trim() && (
                        <span className="text-base leading-none shrink-0">{subEmoji}</span>
                      )}
                      <span className="font-display font-bold text-xs sm:text-sm text-[var(--foreground)] truncate">
                        {subName.trim() || 'Name'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── AROMA CREATION / EDIT FORM ───────────────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column (md:col-span-6): Name, Category, Subcategory & Color */}
              <div className="md:col-span-6 flex flex-col gap-5">
                {/* 1. Flavor Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-display font-bold tracking-wide text-[var(--foreground)]">
                    {t('flavorNameLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('flavorNamePlaceholder')}
                    className="w-full bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-lg px-3.5 py-2.5 text-sm sm:text-base font-body text-[var(--foreground)] focus:outline-none focus:border-[var(--wood-selection)] placeholder:text-[var(--placeholder-text)] transition-colors shadow-inner"
                    required
                  />
                </div>

                {/* 1b. Optional Catalog Description / Sensory Note */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-display font-bold tracking-wide text-[var(--foreground)]">
                    {language === 'DE' ? 'Beschreibung' : 'Description'}
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      language === 'DE'
                        ? 'z. B. Medizinischer Küstenrauch, süßes Karamell...'
                        : 'e.g. Medicinal coastal smoke, rich butterscotch...'
                    }
                    className="w-full bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-lg px-3.5 py-2 text-xs sm:text-sm font-body text-[var(--foreground)] focus:outline-none focus:border-[var(--wood-selection)] placeholder:text-[var(--placeholder-text)] transition-colors shadow-inner"
                  />
                </div>

                {/* 2. Category / Flavor Wheel Axis */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm font-display font-bold tracking-wide text-[var(--foreground)]">
                    {t('flavorDimensionLabel')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1.5 bg-black/5 rounded-xl border border-[var(--parchment-border)]/40">
                    {effectiveTaxonomy.map((cat) => {
                      const isCatActive = selectedCategoryId === cat.id;
                      const catNameLabel = cat.name[language] ?? cat.name.EN;
                      const catColorVal = cat.color ?? RADAR_DIMENSION_COLORS[cat.radarDimension] ?? '#C59B27';

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategorySelectForAroma(cat.id, cat.radarDimension)}
                          className={cn(
                            'px-3 py-2 rounded-lg border text-xs sm:text-sm font-body font-semibold transition-all flex items-center gap-2 cursor-pointer text-left',
                            isCatActive
                              ? 'border-transparent text-white shadow-xs scale-[1.01]'
                              : 'border-[var(--parchment-border)]/60 bg-[var(--pub-bg-panel)] text-[var(--foreground)] hover:bg-[var(--pub-bg-alt)] hover:border-[var(--wood-selection)]/60'
                          )}
                          style={{
                            backgroundColor: isCatActive ? catColorVal : undefined,
                          }}
                        >
                          <span className="text-base shrink-0">{cat.emoji}</span>
                          <span className="truncate">{catNameLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2b. Subcategory / Folder Assignment (Shown when subcategories exist in this category) */}
                {subcategoriesForCurrentCategory.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-display font-bold tracking-wide text-[var(--foreground)]">
                      {language === 'DE' ? 'Unterkategorie' : 'Subcategory'}
                    </label>
                    <div className="flex flex-wrap gap-2 p-2 bg-black/5 rounded-xl border border-[var(--parchment-border)]/40">
                      <button
                        type="button"
                        onClick={() => setSelectedSubcategoryId(undefined)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg border text-xs font-body font-semibold transition-all cursor-pointer',
                          !selectedSubcategoryId
                            ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-white shadow-xs'
                            : 'bg-[var(--pub-bg-panel)] border-[var(--parchment-border)] text-[var(--sepia-text)] hover:bg-[var(--pub-bg-alt)] hover:border-[var(--wood-selection)]'
                        )}
                      >
                        {language === 'DE' ? 'Allgemein' : 'General'}
                      </button>
                      {subcategoriesForCurrentCategory.map((sub) => {
                        const isSubSelected = selectedSubcategoryId === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setSelectedSubcategoryId(sub.id)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg border text-xs font-body font-semibold transition-all flex items-center gap-1.5 cursor-pointer',
                              isSubSelected
                                ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-white shadow-xs'
                                : 'bg-[var(--pub-bg-panel)] border-[var(--parchment-border)] text-[var(--sepia-text)] hover:bg-[var(--pub-bg-alt)] hover:border-[var(--wood-selection)]'
                            )}
                          >
                            <span>{sub.emoji || '📁'}</span>
                            <span>{sub.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Color Picker */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-display font-bold tracking-wide text-[var(--foreground)]">
                      {t('flavorColorLabel')}
                    </label>
                    {customColor && (
                      <button
                        type="button"
                        onClick={() => setCustomColor(null)}
                        className="text-xs text-[var(--wood-selection)] hover:underline font-body cursor-pointer font-semibold"
                      >
                        {t('defaultCategoryColor')} ↺
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap p-2.5 bg-black/5 rounded-xl border border-[var(--parchment-border)]/40">
                    {COLOR_SWATCHES.map((swatch) => {
                      const isSelected = activeColor.toLowerCase() === swatch.value.toLowerCase();

                      return (
                        <button
                          key={swatch.value}
                          type="button"
                          onClick={() => setCustomColor(swatch.value)}
                          title={swatch.label}
                          className={cn(
                            'w-7 h-7 rounded-full border transition-all cursor-pointer relative flex items-center justify-center',
                            isSelected
                              ? 'border-white ring-2 ring-[var(--wood-selection)] scale-110 shadow-sm'
                              : 'border-black/20 hover:scale-110 opacity-85 hover:opacity-100'
                          )}
                          style={{ backgroundColor: swatch.value }}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                        </button>
                      );
                    })}

                    {/* Free Custom Color Pipette */}
                    <label
                      title={t('customColor')}
                      className="w-7 h-7 rounded-full border border-dashed border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform relative overflow-hidden"
                    >
                      <Pipette className="w-3.5 h-3.5 text-[var(--sepia-text)] pointer-events-none" />
                      <input
                        type="color"
                        value={activeColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column (md:col-span-6): Emoji Palette & Live Large Preview */}
              <div className="md:col-span-6 flex flex-col gap-5">
                {/* 4. Emoji Icon Palette (160+ Icons + "Kein Icon") */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs sm:text-sm font-display font-bold tracking-wide text-[var(--foreground)]">
                      {t('flavorEmojiLabel')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setEmoji('')}
                      className={cn(
                        'px-2.5 py-1 rounded-lg border text-xs font-body font-semibold flex items-center justify-center transition-all cursor-pointer',
                        emoji === ''
                          ? 'bg-[var(--wood-selection)] text-white border-[var(--wood-selection)] shadow-2xs'
                          : 'bg-[var(--pub-bg-panel)] text-[var(--sepia-text)] border-[var(--parchment-border)] hover:border-[var(--wood-selection)]'
                      )}
                    >
                      <span>{language === 'DE' ? 'Kein Icon' : 'No Icon'}</span>
                    </button>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="text"
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      maxLength={4}
                      placeholder="—"
                      className="w-14 h-12 text-center text-2xl bg-[var(--pub-bg-panel)] border-2 border-[var(--wood-selection)] rounded-xl focus:outline-none shadow-sm shrink-0 placeholder:text-[var(--sepia-muted)]/40 not-italic"
                    />
                    <div className="flex flex-wrap gap-1.5 items-center max-h-56 overflow-y-auto p-2 bg-black/5 rounded-xl border border-[var(--parchment-border)]/40 w-full">
                      {EMOJI_QUICK_PICKS.map((em, index) => (
                        <button
                          key={`${em}_${index}`}
                          type="button"
                          onClick={() => setEmoji(em)}
                          className={cn(
                            'w-8 h-8 text-base rounded-lg flex items-center justify-center transition-all cursor-pointer select-none',
                            emoji === em
                              ? 'bg-[var(--wood-selection)] text-white scale-110 shadow-sm'
                              : 'hover:bg-black/10 hover:scale-105'
                          )}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Live Centered Large Chip Preview */}
                <div className="flex flex-col gap-2 pt-2 border-t border-[var(--parchment-divider)]">
                  <span className="text-[11px] font-display tracking-wide text-[var(--sepia-muted)] font-bold text-center">
                    {language === 'DE' ? 'Vorschau' : 'Preview'}
                  </span>
                  <div className="flex items-center justify-center p-5 rounded-xl bg-black/5 border border-dashed border-[var(--parchment-border)]">
                    <div
                      className="px-5 py-2 rounded-full text-white text-sm sm:text-base font-body font-bold flex items-center gap-2.5 shadow-md transition-all scale-105"
                      style={{ backgroundColor: activeColor }}
                    >
                      {emoji.trim() && <span className="text-lg">{emoji}</span>}
                      <span>{name.trim() || 'Name'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Bottom Actions (Split-Footer Layout: Left [🗑️] in Edit Mode, Right [Abbrechen] [Speichern]) */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--parchment-divider)] shrink-0">
            <div>
              {((mode === 'category' && editingCategory && onDeleteCategory) ||
                (mode === 'subcategory' && editingSubcategory && onDeleteSubcategory) ||
                (mode === 'aroma' && editingFlavor && onDeleteFlavor)) && (
                <button
                  type="button"
                  onClick={() => {
                    if (mode === 'category' && editingCategory && onDeleteCategory) {
                      onDeleteCategory();
                    } else if (mode === 'subcategory' && editingSubcategory && onDeleteSubcategory) {
                      onDeleteSubcategory();
                    } else if (mode === 'aroma' && editingFlavor && onDeleteFlavor) {
                      onDeleteFlavor();
                    }
                  }}
                  title={t('deleteAction')}
                  aria-label={t('deleteAction')}
                  className="w-10 h-10 rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white transition-all flex items-center justify-center shadow-2xs active:scale-95 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[var(--parchment-border)] text-xs sm:text-sm font-display tracking-wide font-semibold text-[var(--sepia-text)] hover:bg-black/5 transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={cn(
                  'px-6 py-2 rounded-lg bg-[var(--wood-selection)] text-white text-xs sm:text-sm font-display tracking-wide font-bold shadow-md transition-all flex items-center justify-center cursor-pointer',
                  isSubmitDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                )}
              >
                <span>{submitLabel || t('saveAction')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
