'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MIN_FLAVOR_CATEGORIES,
  getEffectiveFlavorTaxonomy,
  FlavorCategory,
  FlavorDescriptor,
  RADAR_DIMENSION_COLORS,
  getStoredCustomFlavors,
  registerCustomFlavor,
  updateStoredCustomFlavor,
  deleteStoredCustomFlavor,
  getStandardFlavorOverrides,
  saveStandardFlavorOverride,
  deleteStandardFlavor,
  StandardFlavorOverride,
  getStoredCustomCategories,
  saveCustomCategory,
  deleteCustomCategory,
  getStoredCustomSubcategories,
  saveCustomSubcategory,
  deleteCustomSubcategory,
  assignAromaToSubcategory,
} from '@/data/spirit-flavor-taxonomy';
import {
  CustomFlavorCategory,
  CustomFlavorDescriptor,
  CustomFlavorSubcategory,
  FlavorProfile,
  Spirit,
} from '@/types/spirit.types';
import { JournalWithStats } from '@/hooks/useJournals';
import { db } from '@/lib/db';
import { DATA_MUTATED_EVENT, notifyDataMutated } from '@/lib/sync-events';
import { useLanguage } from '@/context/LanguageContext';
import { CustomFlavorModal } from '@/components/features/flavor-tags/CustomFlavorModal';
import { isCustomFlavorInCategory } from '@/components/features/flavor-tags/SensoryCompassDrawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageActionsDropdown } from '@/components/ui/PageActionsDropdown';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { Search, X, Edit3, Trash2, BookOpen, ArrowUpRight, CheckCircle2, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AromaCatalogViewProps {
  journals: JournalWithStats[];
  isCreateOpen: boolean;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
  onNavigateToSpirit?: (spiritId: string, journalId: string) => void;
  onSelectModeChange?: (active: boolean) => void;
}

interface SpiritAromaMatch {
  spirit: Spirit;
  journalName: string;
  inNose: boolean;
  inTaste: boolean;
}

export type AromaDeleteSource =
  | { type: 'custom'; cf: CustomFlavorDescriptor }
  | { type: 'standard'; desc: FlavorDescriptor };

export interface UnifiedAromaRow {
  id: string;
  name: string;
  description?: string;
  subcategoryId?: string;
  emoji: string;
  color: string;
  radarDimension: keyof FlavorProfile;
  matches: SpiritAromaMatch[];
  source: AromaDeleteSource;
}

export function doesTagMatchDescriptor(tag: string, desc: FlavorDescriptor): boolean {
  const tLower = tag.trim().toLowerCase();
  if (!tLower) return false;
  if (
    tLower === desc.id.toLowerCase() ||
    tLower === desc.name.EN.toLowerCase() ||
    tLower === desc.name.DE.toLowerCase()
  ) {
    return true;
  }
  return (desc.aliases || []).some((a) => a.toLowerCase() === tLower);
}

export function doesTagMatchCustomFlavor(tag: string, cf: CustomFlavorDescriptor): boolean {
  const tLower = tag.trim().toLowerCase();
  if (!tLower) return false;
  const cfName = cf.name.trim().toLowerCase();
  const cfWithEmoji = cf.emoji ? `${cf.emoji} ${cf.name}`.trim().toLowerCase() : '';
  return tLower === cf.id.toLowerCase() || tLower === cfName || (cfWithEmoji !== '' && tLower === cfWithEmoji);
}

export function doesTagMatchAromaSource(tag: string, source: AromaDeleteSource): boolean {
  if (source.type === 'custom') {
    return doesTagMatchCustomFlavor(tag, source.cf);
  }
  return doesTagMatchDescriptor(tag, source.desc);
}

/**
 * Purges one or more deleted aromas from a Spirit record (tags, intensities, and finish decay curves).
 * Returns the cleaned Spirit object if any field was modified, or null if unaffected.
 */
export function purgeDeletedAromasFromSpirit(
  spirit: Spirit,
  deletedSources: AromaDeleteSource[]
): Spirit | null {
  if (deletedSources.length === 0) return null;

  const isDeletedTag = (tag: string) =>
    deletedSources.some((src) => doesTagMatchAromaSource(tag, src));

  let changed = false;

  const filterTags = (tags?: string[]) => {
    if (!tags) return tags;
    const next = tags.filter((t) => !isDeletedTag(t));
    if (next.length !== tags.length) {
      changed = true;
    }
    return next;
  };

  const filterRecord = <T,>(rec?: Record<string, T>) => {
    if (!rec) return rec;
    const next: Record<string, T> = {};
    for (const [k, v] of Object.entries(rec)) {
      if (isDeletedTag(k)) {
        changed = true;
      } else {
        next[k] = v;
      }
    }
    return next;
  };

  const nextNoseTags = filterTags(spirit.noseFlavorTags);
  const nextTasteTags = filterTags(spirit.tasteFlavorTags);
  const nextLegacyTags = filterTags(spirit.flavorTags) ?? [];
  const nextNoseIntensities = filterRecord(spirit.noseTagIntensities);
  const nextTasteIntensities = filterRecord(spirit.tasteTagIntensities);
  const nextFinishCurves = filterRecord(spirit.finishCurves);

  if (!changed) return null;

  return {
    ...spirit,
    noseFlavorTags: nextNoseTags,
    tasteFlavorTags: nextTasteTags,
    flavorTags: nextLegacyTags,
    noseTagIntensities: nextNoseIntensities,
    tasteTagIntensities: nextTasteIntensities,
    finishCurves: nextFinishCurves,
    updatedAt: new Date().toISOString(),
  };
}

export function AromaCatalogView({
  journals,
  isCreateOpen,
  onOpenCreate,
  onCloseCreate,
  onNavigateToSpirit,
  onSelectModeChange,
}: AromaCatalogViewProps) {
  const { language, t } = useLanguage();
  const [customFlavors, setCustomFlavors] = useState<CustomFlavorDescriptor[]>(() => getStoredCustomFlavors());
  const [standardOverrides, setStandardOverrides] = useState<Record<string, StandardFlavorOverride>>(() =>
    getStandardFlavorOverrides()
  );
  const [customCategories, setCustomCategories] = useState<CustomFlavorCategory[]>(() =>
    getStoredCustomCategories()
  );
  const [customSubcategories, setCustomSubcategories] = useState<CustomFlavorSubcategory[]>(() =>
    getStoredCustomSubcategories(language)
  );
  const [categoryPendingDelete, setCategoryPendingDelete] = useState<FlavorCategory | null>(null);
  const [subcategoryPendingDelete, setSubcategoryPendingDelete] = useState<CustomFlavorSubcategory | null>(null);
  const [allSpirits, setAllSpirits] = useState<Spirit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Unified Create / Edit modal state
  const [editingFlavor, setEditingFlavor] = useState<CustomFlavorDescriptor | null>(null);
  const [editingStandardDesc, setEditingStandardDesc] = useState<FlavorDescriptor | null>(null);
  const [editingCategory, setEditingCategory] = useState<CustomFlavorCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<CustomFlavorSubcategory | null>(null);
  const [preselectedDimension, setPreselectedDimension] = useState<keyof FlavorProfile | undefined>(undefined);
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<string | undefined>(undefined);
  const [modalInitialMode, setModalInitialMode] = useState<'aroma' | 'category' | 'subcategory'>('aroma');

  // Drag & Drop state for moving aromas into subcategories
  const [draggedAroma, setDraggedAroma] = useState<{
    id: string;
    isCustom: boolean;
    categoryId: string;
  } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  // Inspected aroma (shows which spirits have this aroma)
  const [inspectedAroma, setInspectedAroma] = useState<{
    name: string;
    color: string;
    emoji?: string;
    matches: SpiritAromaMatch[];
  } | null>(null);

  const loadData = useCallback(async () => {
    setCustomFlavors([...getStoredCustomFlavors()]);
    setStandardOverrides({ ...getStandardFlavorOverrides() });
    setCustomCategories([...getStoredCustomCategories()]);
    setCustomSubcategories([...getStoredCustomSubcategories(language)]);
    try {
      const spirits = await db.spirits.toArray();
      setAllSpirits(spirits);
    } catch {
      // ignore in environments without full indexedDB
    }
  }, [language]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    const handleMutation = () => {
      loadData();
    };
    window.addEventListener(DATA_MUTATED_EVENT, handleMutation);
    return () => window.removeEventListener(DATA_MUTATED_EVENT, handleMutation);
  }, [loadData]);

  const effectiveTaxonomy = useMemo(() => {
    void standardOverrides;
    void customCategories;
    return getEffectiveFlavorTaxonomy();
  }, [standardOverrides, customCategories]);

  const journalNameMap = useMemo(() => {
    const map = new Map<string, string>();
    journals.forEach((j) => map.set(j.id, j.name));
    return map;
  }, [journals]);

  const getDescriptorMatches = useCallback(
    (desc: FlavorDescriptor): SpiritAromaMatch[] => {
      const matches: SpiritAromaMatch[] = [];
      for (const s of allSpirits) {
        const noseTags = s.noseFlavorTags || [];
        const tasteTags = s.tasteFlavorTags || [];
        const legacyTags = s.flavorTags || [];

        const inNose =
          noseTags.some((tag) => doesTagMatchDescriptor(tag, desc)) ||
          (noseTags.length === 0 && legacyTags.some((tag) => doesTagMatchDescriptor(tag, desc)));
        const inTaste = tasteTags.some((tag) => doesTagMatchDescriptor(tag, desc));

        if (inNose || inTaste) {
          matches.push({
            spirit: s,
            journalName: journalNameMap.get(s.journalId) || 'Journal',
            inNose,
            inTaste,
          });
        }
      }
      return matches;
    },
    [allSpirits, journalNameMap]
  );

  const getCustomFlavorMatches = useCallback(
    (cf: CustomFlavorDescriptor): SpiritAromaMatch[] => {
      const matches: SpiritAromaMatch[] = [];
      for (const s of allSpirits) {
        const noseTags = s.noseFlavorTags || [];
        const tasteTags = s.tasteFlavorTags || [];
        const legacyTags = s.flavorTags || [];

        const inNose =
          noseTags.some((tag) => doesTagMatchCustomFlavor(tag, cf)) ||
          (noseTags.length === 0 && legacyTags.some((tag) => doesTagMatchCustomFlavor(tag, cf)));
        const inTaste = tasteTags.some((tag) => doesTagMatchCustomFlavor(tag, cf));

        if (inNose || inTaste) {
          matches.push({
            spirit: s,
            journalName: journalNameMap.get(s.journalId) || 'Journal',
            inNose,
            inTaste,
          });
        }
      }
      return matches;
    },
    [allSpirits, journalNameMap]
  );

  // Unified Save Handler (handles both Custom Flavors and Standard Taxonomy Overrides)
  const handleSaveFlavor = async (saved: CustomFlavorDescriptor) => {
    if (editingStandardDesc) {
      const origDesc = editingStandardDesc;
      const oldPrimaryEN = origDesc.name.EN;
      const oldPrimaryDE = origDesc.name.DE;

      const updatedName =
        language === 'DE'
          ? { EN: origDesc.name.EN, DE: saved.name }
          : { EN: saved.name, DE: origDesc.name.DE };

      saveStandardFlavorOverride({
        id: origDesc.id,
        name: updatedName,
        radarDimension: saved.radarDimension,
        categoryId: saved.categoryId,
        emoji: saved.emoji,
        color: saved.color,
        description: saved.description,
        subcategoryId: saved.subcategoryId,
      });

      try {
        const spirits = await db.spirits.toArray();
        for (const s of spirits) {
          const matchesOld = (t: string) =>
            t.trim().toLowerCase() === oldPrimaryEN.toLowerCase() ||
            t.trim().toLowerCase() === oldPrimaryDE.toLowerCase();

          const hasInNose = (s.noseFlavorTags || []).some(matchesOld);
          const hasInTaste = (s.tasteFlavorTags || []).some(matchesOld);
          const hasInLegacy = (s.flavorTags || []).some(matchesOld);

          if (hasInNose || hasInTaste || hasInLegacy) {
            const replaceTag = (tags?: string[]) =>
              tags?.map((t) => (matchesOld(t) ? saved.name : t));
            await db.spirits.put({
              ...s,
              noseFlavorTags: replaceTag(s.noseFlavorTags),
              tasteFlavorTags: replaceTag(s.tasteFlavorTags),
              flavorTags: replaceTag(s.flavorTags) || [],
            });
          }
        }
      } catch {
        // ignore in non-db tests
      }
    } else if (editingFlavor) {
      const oldName = editingFlavor.name;
      updateStoredCustomFlavor(editingFlavor.id, saved);

      if (oldName.toLowerCase() !== saved.name.toLowerCase()) {
        try {
          const spirits = await db.spirits.toArray();
          for (const s of spirits) {
            let changed = false;
            const replaceTag = (tags?: string[]) =>
              tags?.map((t) => {
                if (t.trim().toLowerCase() === oldName.toLowerCase()) {
                  changed = true;
                  return saved.name;
                }
                return t;
              });
            const nextNose = replaceTag(s.noseFlavorTags);
            const nextTaste = replaceTag(s.tasteFlavorTags);
            const nextLegacy = replaceTag(s.flavorTags);
            if (changed) {
              await db.spirits.put({
                ...s,
                noseFlavorTags: nextNose,
                tasteFlavorTags: nextTaste,
                flavorTags: nextLegacy || [],
              });
            }
          }
        } catch {
          // ignore
        }
      }
    } else {
      registerCustomFlavor(saved);
    }

    setEditingFlavor(null);
    setEditingStandardDesc(null);
    setEditingCategory(null);
    setEditingSubcategory(null);
    setPreselectedDimension(undefined);
    setPreselectedCategoryId(undefined);
    onCloseCreate();
    await loadData();
    notifyDataMutated();
  };

  const handleSaveCategory = async (cat: CustomFlavorCategory) => {
    saveCustomCategory(cat);
    setEditingCategory(null);
    setEditingSubcategory(null);
    setEditingFlavor(null);
    setEditingStandardDesc(null);
    onCloseCreate();
    await loadData();
    notifyDataMutated();
  };

  const handleSaveSubcategory = async (sub: CustomFlavorSubcategory) => {
    saveCustomSubcategory(sub);
    setEditingCategory(null);
    setEditingSubcategory(null);
    setEditingFlavor(null);
    setEditingStandardDesc(null);
    onCloseCreate();
    await loadData();
    notifyDataMutated();
  };

  const confirmDeleteSubcategory = () => {
    if (!subcategoryPendingDelete) return;
    deleteCustomSubcategory(subcategoryPendingDelete.id);
    setSubcategoryPendingDelete(null);
    setCustomSubcategories([...getStoredCustomSubcategories(language)]);
    setCustomFlavors([...getStoredCustomFlavors()]);
    setStandardOverrides({ ...getStandardFlavorOverrides() });
    notifyDataMutated();
  };

  // ── Long-Press & Multi-Select Mode (shared hook — identical to Journals & Notes) ──
  const {
    isSelectMode,
    selectedIds,
    confirmBulkDelete,
    setConfirmBulkDelete,
    enterSelectMode,
    exitSelectMode,
    toggleSelection,
    handleTouchStart,
    cancelLongPress,
    handleTouchEnd,
  } = useMultiSelect(onSelectModeChange);

  const mouseLongPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const mouseLongPressActive = React.useRef(false);

  const cancelMouseLongPress = useCallback(() => {
    if (mouseLongPressTimer.current) {
      clearTimeout(mouseLongPressTimer.current);
      mouseLongPressTimer.current = null;
    }
  }, []);

  const handleMouseDownRow = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (isSelectMode || e.button !== 0) {
        mouseLongPressActive.current = false;
        return;
      }
      mouseLongPressActive.current = false;
      mouseLongPressTimer.current = setTimeout(() => {
        mouseLongPressActive.current = true;
        enterSelectMode(id);
      }, 500);
    },
    [isSelectMode, enterSelectMode]
  );

  const handleMouseUpRow = useCallback(() => {
    cancelMouseLongPress();
  }, [cancelMouseLongPress]);

  const openEditRow = (row: UnifiedAromaRow, catId?: string) => {
    setModalInitialMode('aroma');
    setEditingCategory(null);
    setEditingSubcategory(null);
    if (row.source.type === 'custom') {
      setEditingStandardDesc(null);
      setEditingFlavor({
        ...row.source.cf,
        categoryId: row.source.cf.categoryId ?? catId,
      });
      setPreselectedDimension(row.source.cf.radarDimension);
      setPreselectedCategoryId(row.source.cf.categoryId ?? catId);
    } else {
      const desc = row.source.desc;
      setEditingFlavor({
        id: desc.id,
        name: row.name,
        radarDimension: desc.radarDimension,
        categoryId: desc.categoryId ?? catId,
        emoji: row.emoji,
        color: row.color,
        description: row.description,
        subcategoryId: row.subcategoryId,
      });
      setEditingStandardDesc(desc);
      setPreselectedDimension(desc.radarDimension);
      setPreselectedCategoryId(desc.categoryId ?? catId);
    }
    onOpenCreate();
  };

  const openEditCategory = (cat: FlavorCategory) => {
    setEditingFlavor(null);
    setEditingStandardDesc(null);
    setEditingSubcategory(null);
    setEditingCategory({
      id: cat.id,
      name: cat.name[language] ?? cat.name.DE,
      emoji: cat.emoji,
      color: cat.color ?? RADAR_DIMENSION_COLORS[cat.radarDimension] ?? '#C59B27',
      radarDimension: cat.radarDimension,
    });
    setModalInitialMode('category');
    onOpenCreate();
  };

  const openEditSubcategory = (sub: CustomFlavorSubcategory) => {
    setEditingFlavor(null);
    setEditingStandardDesc(null);
    setEditingCategory(null);
    setEditingSubcategory(sub);
    setModalInitialMode('subcategory');
    onOpenCreate();
  };

  const handleCloseModal = () => {
    setEditingFlavor(null);
    setEditingStandardDesc(null);
    setEditingCategory(null);
    setEditingSubcategory(null);
    setPreselectedDimension(undefined);
    setPreselectedCategoryId(undefined);
    setModalInitialMode('aroma');
    onCloseCreate();
  };

  const handleDropIntoSubcategory = (targetCategoryId: string, targetSubcategoryId: string | undefined) => {
    if (!draggedAroma || draggedAroma.categoryId !== targetCategoryId) {
      setDraggedAroma(null);
      setDragOverTarget(null);
      return;
    }
    assignAromaToSubcategory(draggedAroma.id, draggedAroma.isCustom, targetSubcategoryId);
    setDraggedAroma(null);
    setDragOverTarget(null);
    setCustomFlavors([...getStoredCustomFlavors()]);
    setStandardOverrides({ ...getStandardFlavorOverrides() });
    notifyDataMutated();
  };

  const q = searchQuery.trim().toLowerCase();

  // Complete unfiltered catalog lookup map for selection & bulk deletion
  const allRowsMap = useMemo(() => {
    const map = new Map<string, UnifiedAromaRow>();
    effectiveTaxonomy.forEach((cat) => {
      const catColor = cat.color ?? RADAR_DIMENSION_COLORS[cat.radarDimension] ?? '#C59B27';
      const catSubcategories = customSubcategories.filter((s) => s.categoryId === cat.id);
      const validSubcategoryIds = new Set(catSubcategories.map((s) => s.id));

      customFlavors.forEach((cf) => {
        if (!isCustomFlavorInCategory(cf, cat.id)) return;
        map.set(cf.id, {
          id: cf.id,
          name: cf.name,
          description: cf.description,
          subcategoryId: cf.subcategoryId && validSubcategoryIds.has(cf.subcategoryId) ? cf.subcategoryId : undefined,
          emoji: cf.emoji || cat.emoji,
          color: cf.color || catColor,
          radarDimension: cf.radarDimension,
          matches: getCustomFlavorMatches(cf),
          source: { type: 'custom', cf },
        });
      });

      cat.subcategories.forEach((sub) => {
        sub.descriptors.forEach((desc) => {
          const label = desc.name[language] ?? desc.name.EN;
          map.set(desc.id, {
            id: desc.id,
            name: label,
            description: desc.description,
            subcategoryId:
              desc.subcategoryId && validSubcategoryIds.has(desc.subcategoryId)
                ? desc.subcategoryId
                : undefined,
            emoji: desc.emoji || cat.emoji,
            color: desc.color || catColor,
            radarDimension: desc.radarDimension,
            matches: getDescriptorMatches(desc),
            source: { type: 'standard', desc },
          });
        });
      });
    });
    return map;
  }, [effectiveTaxonomy, customFlavors, customSubcategories, language, getCustomFlavorMatches, getDescriptorMatches]);

  const selectedAromaRows = useMemo(() => {
    const rows: UnifiedAromaRow[] = [];
    selectedIds.forEach((id) => {
      const row = allRowsMap.get(id);
      if (row) rows.push(row);
    });
    return rows;
  }, [selectedIds, allRowsMap]);

  const affectedSpiritsCount = useMemo(() => {
    const spiritIds = new Set<string>();
    selectedAromaRows.forEach((row) => {
      row.matches.forEach((m) => spiritIds.add(m.spirit.id));
    });
    return spiritIds.size;
  }, [selectedAromaRows]);

  const confirmDeleteSelectedAromas = async () => {
    if (selectedAromaRows.length === 0) {
      setConfirmBulkDelete(false);
      exitSelectMode();
      return;
    }

    const deletedSources = selectedAromaRows.map((r) => r.source);

    // 1. Cleanly purge deleted aromas from all affected tasting notes in IndexedDB
    try {
      const spirits = await db.spirits.toArray();
      for (const s of spirits) {
        const cleaned = purgeDeletedAromasFromSpirit(s, deletedSources);
        if (cleaned) {
          await db.spirits.put(cleaned);
        }
      }
    } catch {
      // ignore in environments without full IndexedDB
    }

    // 2. Delete selected aromas from catalog storage
    for (const row of selectedAromaRows) {
      if (row.source.type === 'custom') {
        deleteStoredCustomFlavor(row.source.cf.id);
      } else {
        deleteStandardFlavor(row.source.desc.id);
      }
    }

    setConfirmBulkDelete(false);
    exitSelectMode();
    await loadData();
    notifyDataMutated();
  };

  const confirmDeleteCategory = async () => {
    if (!categoryPendingDelete) return;
    const catToDelete = categoryPendingDelete;

    // Collect all aroma sources inside this category for cascading note cleanup
    const catDeletedSources: AromaDeleteSource[] = [];
    customFlavors.forEach((cf) => {
      if (isCustomFlavorInCategory(cf, catToDelete.id)) {
        catDeletedSources.push({ type: 'custom', cf });
      }
    });
    catToDelete.subcategories.forEach((sub) => {
      sub.descriptors.forEach((desc) => {
        catDeletedSources.push({ type: 'standard', desc });
      });
    });

    const deleted = deleteCustomCategory(catToDelete.id);
    if (deleted && catDeletedSources.length > 0) {
      try {
        const spirits = await db.spirits.toArray();
        for (const s of spirits) {
          const cleaned = purgeDeletedAromasFromSpirit(s, catDeletedSources);
          if (cleaned) {
            await db.spirits.put(cleaned);
          }
        }
      } catch {
        // ignore in environments without full IndexedDB
      }
    }

    if (selectedCategoryId === catToDelete.id) {
      setSelectedCategoryId('all');
    }
    setCategoryPendingDelete(null);
    await loadData();
    notifyDataMutated();
  };

  // Merge all aromas per category into a single unified list
  const filteredCategories = useMemo(() => {
    return effectiveTaxonomy
      .filter((cat) => selectedCategoryId === 'all' || cat.id === selectedCategoryId)
      .map((cat) => {
        const catColor = cat.color ?? RADAR_DIMENSION_COLORS[cat.radarDimension] ?? '#C59B27';
        const rows: UnifiedAromaRow[] = [];
        const catSubcategories = customSubcategories.filter((s) => s.categoryId === cat.id);
        const validSubcategoryIds = new Set(catSubcategories.map((s) => s.id));

        // 1. User-created aromas in this category
        customFlavors.forEach((cf) => {
          if (!isCustomFlavorInCategory(cf, cat.id)) return;
          if (q && !cf.name.toLowerCase().includes(q) && !cf.description?.toLowerCase().includes(q)) return;
          rows.push({
            id: cf.id,
            name: cf.name,
            description: cf.description,
            subcategoryId: cf.subcategoryId && validSubcategoryIds.has(cf.subcategoryId) ? cf.subcategoryId : undefined,
            emoji: cf.emoji || cat.emoji,
            color: cf.color || catColor,
            radarDimension: cf.radarDimension,
            matches: getCustomFlavorMatches(cf),
            source: { type: 'custom', cf },
          });
        });

        // 2. Taxonomy aromas in this category
        cat.subcategories.forEach((sub) => {
          sub.descriptors.forEach((desc) => {
            if (q) {
              const matchesSearch =
                desc.name.EN.toLowerCase().includes(q) ||
                desc.name.DE.toLowerCase().includes(q) ||
                desc.id.toLowerCase().includes(q) ||
                (desc.description && desc.description.toLowerCase().includes(q)) ||
                (desc.aliases || []).some((a) => a.toLowerCase().includes(q));
              if (!matchesSearch) return;
            }
            const label = desc.name[language] ?? desc.name.EN;
            rows.push({
              id: desc.id,
              name: label,
              description: desc.description,
              subcategoryId:
                desc.subcategoryId && validSubcategoryIds.has(desc.subcategoryId)
                  ? desc.subcategoryId
                  : undefined,
              emoji: desc.emoji || cat.emoji,
              color: desc.color || catColor,
              radarDimension: desc.radarDimension,
              matches: getDescriptorMatches(desc),
              source: { type: 'standard', desc },
            });
          });
        });

        return {
          ...cat,
          rows,
          catSubcategories,
          totalItems: rows.length,
        };
      })
      .filter((cat) => cat.totalItems > 0 || cat.catSubcategories.length > 0 || !q);
  }, [
    effectiveTaxonomy,
    selectedCategoryId,
    customFlavors,
    customSubcategories,
    q,
    language,
    getCustomFlavorMatches,
    getDescriptorMatches,
  ]);

  const canDeleteSelected = selectedIds.size > 0;
  const canEditSelected = selectedIds.size === 1;

  const handleEditFromSelectMode = () => {
    const [id] = selectedIds;
    const row = id ? allRowsMap.get(id) : undefined;
    if (!row) return;
    exitSelectMode();
    openEditRow(row);
  };

  const renderAromaRow = (row: UnifiedAromaRow, catId: string) => {
    const isSelected = selectedIds.has(row.id);

    return (
      <div
        key={row.id}
        draggable={!isSelectMode}
        onClick={() => {
          if (mouseLongPressActive.current) {
            mouseLongPressActive.current = false;
            return;
          }
          if (isSelectMode) {
            toggleSelection(row.id);
          }
        }}
        onTouchStart={(e) => handleTouchStart(e, row.id)}
        onTouchEnd={handleTouchEnd}
        onTouchMove={cancelLongPress}
        onMouseDown={(e) => handleMouseDownRow(e, row.id)}
        onMouseUp={handleMouseUpRow}
        onMouseLeave={cancelMouseLongPress}
        onContextMenu={(e) => {
          if (!isSelectMode) e.preventDefault();
        }}
        onDragStart={(e) => {
          if (isSelectMode) {
            e.preventDefault();
            return;
          }
          cancelMouseLongPress();
          e.dataTransfer.effectAllowed = 'move';
          setDraggedAroma({
            id: row.id,
            isCustom: row.source.type === 'custom',
            categoryId: catId,
          });
        }}
        onDragEnd={() => {
          setDraggedAroma(null);
          setDragOverTarget(null);
        }}
        className={cn(
          'flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--parchment-border)]/50 md:odd:border-r transition-all duration-300 select-none',
          isSelectMode
            ? isSelected
              ? 'cursor-pointer rounded-xl border border-[var(--wood-selection)] ring-2 ring-[var(--wood-selection)]/45 shadow-[0_0_25px_rgba(46,148,93,0.35)] scale-[1.015] opacity-100 bg-[var(--pub-bg-panel)] z-20 relative'
              : 'cursor-pointer opacity-40 scale-[0.99] hover:opacity-65'
            : 'hover:bg-[var(--pub-bg-panel)]',
          draggedAroma?.id === row.id && 'opacity-45'
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-lg leading-none select-none shrink-0 w-6 text-center">
            {row.emoji}
          </span>

          <div className="min-w-0 flex-1 flex flex-col">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-body font-semibold text-sm text-[var(--sepia-text)] truncate">
                {row.name}
              </span>
              <span
                className="w-4 h-4 rounded-md border border-black/20 dark:border-white/25 shadow-2xs shrink-0"
                style={{ backgroundColor: row.color }}
                title={row.color}
              />
            </div>
            {row.description && (
              <span className="font-body text-xs text-[var(--sepia-muted)] italic truncate mt-0.5">
                {row.description}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {row.matches.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                if (isSelectMode) return;
                e.stopPropagation();
                setInspectedAroma({
                  name: row.name,
                  color: row.color,
                  emoji: row.emoji,
                  matches: row.matches,
                });
              }}
              className="px-2 py-1 rounded-md bg-[var(--forest-green)]/15 hover:bg-[var(--forest-green)]/25 text-[var(--forest-green)] font-mono text-xs font-bold cursor-pointer transition-colors"
            >
              {row.matches.length}×
            </button>
          )}

          {isSelectMode ? (
            <div className="h-8 w-9 flex items-center justify-center shrink-0">
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-2xs',
                  isSelected
                    ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)]'
                    : 'bg-[var(--pub-bg-panel)] border-[var(--parchment-border)]'
                )}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--fab-text)]" />}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openEditRow(row, catId);
              }}
              title={t('editCustomFlavorTitle')}
              aria-label={t('editCustomFlavorTitle')}
              className="h-8 w-9 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] hover:bg-[var(--pub-bg-alt)] hover:border-[var(--wood-selection)] text-[var(--sepia-text)] shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5 text-[var(--sepia-text)]" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4 pb-20 animate-fade-in">
      {/* ── 1. Clean Top Search & Category Filter Bar (Unboxed) ─────────── */}
      <div className="pb-1 w-full">
        {/* Top Row: Search Input (Always visible) + Multi-Select / Gear Actions on Right */}
        <div className="flex items-center justify-between gap-2 w-full min-h-[36px]">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[var(--sepia-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchAromaCatalogPlaceholder')}
              className="w-full h-9 pl-9 pr-8 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] text-xs sm:text-sm font-body text-[var(--sepia-text)] placeholder:text-[var(--placeholder-text)] focus:outline-none focus:border-[var(--wood-selection)] transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                title={t('clearSearch')}
                aria-label={t('clearSearch')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 text-[var(--sepia-muted)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isSelectMode ? (
            <div className="flex items-center gap-1.5 shrink-0">
              {selectedIds.size > 0 && (
                <span className="text-xs font-body text-[var(--brass-accent)] font-semibold tabular-nums shrink-0 bg-[var(--brass-accent)]/10 px-2.5 py-1 rounded-full border border-[var(--brass-accent)]/30">
                  {selectedIds.size} {language === 'DE' ? 'ausgewählt' : 'selected'}
                </span>
              )}

              <PageActionsDropdown
                title={language === 'DE' ? 'Aktionen' : 'Actions'}
                items={[
                  {
                    id: 'edit-selected-aroma',
                    label: language === 'DE' ? 'Bearbeiten' : 'Edit',
                    icon: <Edit3 size={16} />,
                    onClick: handleEditFromSelectMode,
                    disabled: !canEditSelected,
                  },
                  {
                    id: 'delete-selected-aromas',
                    label: `${language === 'DE' ? 'Löschen' : 'Delete'}${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`,
                    icon: <Trash2 size={16} />,
                    onClick: () => canDeleteSelected && setConfirmBulkDelete(true),
                    disabled: !canDeleteSelected,
                    destructive: true,
                  },
                ]}
              />

              <button
                type="button"
                onClick={exitSelectMode}
                title={language === 'DE' ? 'Fertig' : 'Done'}
                className="h-9 px-2.5 sm:px-3 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] hover:bg-[var(--pub-bg-alt)] text-[var(--foreground)] transition-all flex items-center gap-1 text-xs font-display font-bold tracking-wide shadow-2xs active:scale-95 cursor-pointer select-none min-h-[36px]"
              >
                <X className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{language === 'DE' ? 'Fertig' : 'Done'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <PageActionsDropdown
                title={language === 'DE' ? 'Aktionen' : 'Actions'}
                items={[
                  {
                    id: 'select-aromas',
                    label: language === 'DE' ? 'Aromen auswählen' : 'Select Aromas',
                    icon: <CheckSquare size={16} />,
                    onClick: () => enterSelectMode(),
                  },
                ]}
              />
            </div>
          )}
        </div>

        {/* Category Quick-Filter (Always visible, including in Select Mode) */}
        <div className="flex items-center gap-2 pt-2.5 pb-1.5 flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory md:flex-wrap md:overflow-visible">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={cn(
              'min-h-[42px] px-4 py-2 rounded-full text-xs sm:text-sm font-body font-semibold border transition-all cursor-pointer whitespace-nowrap flex items-center justify-center shrink-0 snap-start active:scale-95',
              selectedCategoryId === 'all'
                ? 'bg-[var(--wood-selection)] text-white border-[var(--wood-selection)] shadow-xs'
                : 'bg-[var(--pub-bg-panel)] text-[var(--foreground)] border-[var(--parchment-border)] hover:bg-[var(--pub-bg-alt)] hover:border-[var(--wood-selection)]'
            )}
          >
            {t('allCategoriesFilter')}
          </button>
          {effectiveTaxonomy.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const catTitle = cat.name[language] ?? cat.name.EN;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(isSelected ? 'all' : cat.id)}
                className={cn(
                  'min-h-[42px] px-4 py-2 rounded-full text-xs sm:text-sm font-body font-semibold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 snap-start active:scale-95',
                  isSelected
                    ? 'bg-[var(--wood-selection)] text-white border-[var(--wood-selection)] shadow-xs'
                    : 'bg-[var(--pub-bg-panel)] text-[var(--foreground)] border-[var(--parchment-border)] hover:bg-[var(--pub-bg-alt)] hover:border-[var(--wood-selection)]'
                )}
              >
                <span className="text-lg leading-none">{cat.emoji}</span>
                <span>{catTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Specular Clover Green Gradient Divider */}
        <div className="divider-clover-glow mt-1.5 mb-3" />
      </div>

      {/* ── 2. Unified Category Lists (With Variant B Subcategory Folders) ── */}
      <div className="flex flex-col gap-5">
        {filteredCategories.map((cat) => {
          const catTitle = cat.name[language] ?? cat.name.EN;
          const catColor = cat.color ?? RADAR_DIMENSION_COLORS[cat.radarDimension] ?? '#C59B27';
          const hasSubcategories = cat.catSubcategories.length > 0;
          const uncategorizedRows = cat.rows.filter((r) => !r.subcategoryId);

          return (
            <section
              key={cat.id}
              className="rounded-2xl border border-[var(--parchment-border)] bg-[var(--parchment-bg)] shadow-xs"
            >
              {/* Category Header Bar with Edit (normal mode) or Delete (select mode, if > 3 categories) */}
              <div
                className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-[var(--wood-dark)]/80 bg-[var(--wood-dark)] rounded-t-2xl flex items-center justify-between gap-3"
                style={{ borderLeftWidth: '5px', borderLeftColor: catColor }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg sm:text-xl leading-none shrink-0">{cat.emoji}</span>
                  <h3 className="font-display font-bold text-sm sm:text-base text-[var(--fab-text)] tracking-wide truncate">
                    {catTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isSelectMode ? (
                    effectiveTaxonomy.length > MIN_FLAVOR_CATEGORIES && (
                      <button
                        type="button"
                        onClick={() => setCategoryPendingDelete(cat)}
                        title={language === 'DE' ? 'Kategorie löschen' : 'Delete Category'}
                        aria-label={language === 'DE' ? 'Kategorie löschen' : 'Delete Category'}
                        className="h-7 px-2 rounded-lg border border-red-300/40 bg-red-500/20 hover:bg-red-500/35 text-white cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => openEditCategory(cat)}
                      title={language === 'DE' ? 'Kategorie bearbeiten' : 'Edit Category'}
                      aria-label={language === 'DE' ? 'Kategorie bearbeiten' : 'Edit Category'}
                      className="h-7 px-2 rounded-lg border border-white/25 bg-white/10 hover:bg-white/20 text-[var(--fab-text)] shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {!hasSubcategories ? (
                /* Flat 2-Column List when no subcategories exist */
                cat.rows.length > 0 ? (
                  <div className="divide-y divide-[var(--parchment-border)]/60 grid grid-cols-1 md:grid-cols-2 md:divide-y-0">
                    {cat.rows.map((row) => renderAromaRow(row, cat.id))}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-center text-xs text-[var(--sepia-muted)] italic font-body">
                    {language === 'DE'
                      ? 'Noch keine Aromen in dieser Kategorie — füge über + ein Aroma hinzu.'
                      : 'No aromas in this category yet — add one via +.'}
                  </div>
                )
              ) : (
                /* Full-Width Stacked Subcategory Folders (Top to Bottom, Zero Vertical Gaps) */
                <div className="flex flex-col gap-3 p-3 sm:p-4">
                  {/* 1. Always Top: General / Uncategorized Aromas Folder ("Allgemein") */}
                  <div
                    onDragOver={(e) => {
                      if (draggedAroma?.categoryId === cat.id) {
                        e.preventDefault();
                        setDragOverTarget(`general_${cat.id}`);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverTarget === `general_${cat.id}`) setDragOverTarget(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropIntoSubcategory(cat.id, undefined);
                    }}
                    className={cn(
                      'w-full rounded-xl border bg-[var(--pub-bg-panel)]/45 transition-all',
                      dragOverTarget === `general_${cat.id}`
                        ? 'border-[var(--wood-selection)] ring-2 ring-[var(--wood-selection)]/40 bg-[var(--wood-selection)]/10'
                        : 'border-[var(--parchment-border)]'
                    )}
                  >
                    <div className="px-4 py-2 bg-[var(--pub-bg-alt)]/75 border-b border-[var(--parchment-border)] rounded-t-xl flex items-center gap-2">
                      <span className="text-base leading-none shrink-0">{cat.emoji}</span>
                      <span className="font-display font-bold text-xs sm:text-sm text-[var(--foreground)]">
                        {language === 'DE' ? 'Allgemein' : 'General'}
                      </span>
                    </div>
                    {uncategorizedRows.length > 0 ? (
                      <div className="divide-y divide-[var(--parchment-border)]/50 grid grid-cols-1 md:grid-cols-2 md:divide-y-0">
                        {uncategorizedRows.map((row) => renderAromaRow(row, cat.id))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-center text-xs text-[var(--sepia-muted)] italic font-body">
                        {language === 'DE'
                          ? 'Ziehe allgemeine Aromen hierher'
                          : 'Drag general aromas here'}
                      </div>
                    )}
                  </div>

                  {/* 2. Full-Width Stacked Subcategory Folders */}
                  {cat.catSubcategories.map((sub) => {
                    const subRows = cat.rows.filter((r) => r.subcategoryId === sub.id);
                    const isDragTarget = dragOverTarget === sub.id;

                    return (
                      <div
                        key={sub.id}
                        onDragOver={(e) => {
                          if (draggedAroma?.categoryId === cat.id) {
                            e.preventDefault();
                            setDragOverTarget(sub.id);
                          }
                        }}
                        onDragLeave={() => {
                          if (dragOverTarget === sub.id) setDragOverTarget(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleDropIntoSubcategory(cat.id, sub.id);
                        }}
                        className={cn(
                          'w-full rounded-xl border bg-[var(--pub-bg-panel)]/45 transition-all',
                          isDragTarget
                            ? 'border-[var(--wood-selection)] ring-2 ring-[var(--wood-selection)]/40 bg-[var(--wood-selection)]/10'
                            : 'border-[var(--parchment-border)]'
                        )}
                      >
                        {/* Subcategory Folder Header */}
                        <div className="px-4 py-2 bg-[var(--pub-bg-alt)]/75 border-b border-[var(--parchment-border)] rounded-t-xl flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base leading-none shrink-0">{sub.emoji || '📁'}</span>
                            <span className="font-display font-bold text-xs sm:text-sm text-[var(--foreground)] truncate">
                              {sub.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSelectMode ? (
                              <button
                                type="button"
                                onClick={() => setSubcategoryPendingDelete(sub)}
                                title={language === 'DE' ? 'Unterkategorie entfernen' : 'Remove Subcategory'}
                                aria-label={language === 'DE' ? 'Unterkategorie entfernen' : 'Remove Subcategory'}
                                className="h-7 px-2 rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 cursor-pointer transition-all active:scale-95 flex items-center justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openEditSubcategory(sub)}
                                title={language === 'DE' ? 'Unterkategorie bearbeiten' : 'Edit Subcategory'}
                                aria-label={language === 'DE' ? 'Unterkategorie bearbeiten' : 'Edit Subcategory'}
                                className="h-7 px-2 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] hover:bg-[var(--pub-bg-alt)] hover:border-[var(--wood-selection)] text-[var(--sepia-text)] shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center justify-center"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[var(--sepia-text)]" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Subcategory Aroma Rows (2-Column Grid inside Full-Width Folder) */}
                        {subRows.length > 0 ? (
                          <div className="divide-y divide-[var(--parchment-border)]/50 grid grid-cols-1 md:grid-cols-2 md:divide-y-0">
                            {subRows.map((row) => renderAromaRow(row, cat.id))}
                          </div>
                        ) : (
                          <div className="px-4 py-3 text-center text-xs text-[var(--sepia-muted)] italic font-body">
                            {language === 'DE'
                              ? 'Ziehe Aromen hierher oder weise sie über ✏️ zu'
                              : 'Drag aromas here or assign via ✏️'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* ── 3. Spirit Usage Inspector Dialog ("Spirituosen mit diesem Aroma") ── */}
      {inspectedAroma && (
        <div
          className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in"
          onClick={() => setInspectedAroma(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--parchment-border)] bg-[var(--parchment-bg)] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-[var(--wood-dark)] text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl">{inspectedAroma.emoji || '🥃'}</span>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-base sm:text-lg truncate">
                    {inspectedAroma.name}
                  </h4>
                  <p className="text-[11px] text-white/80 font-body">
                    {t('spiritsWithAromaTitle')} ({inspectedAroma.matches.length})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedAroma(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title={t('close')}
                aria-label={t('close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex flex-col gap-2.5">
              {inspectedAroma.matches.map(({ spirit, journalName, inNose, inTaste }) => (
                <div
                  key={spirit.id}
                  onClick={() => {
                    if (onNavigateToSpirit) {
                      setInspectedAroma(null);
                      onNavigateToSpirit(spirit.id, spirit.journalId);
                    }
                  }}
                  className={cn(
                    'p-3 rounded-xl border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] flex items-center justify-between gap-3 transition-all',
                    onNavigateToSpirit && 'hover:border-[var(--wood-selection)] cursor-pointer group'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-sm text-[var(--sepia-text)] group-hover:text-[var(--wood-selection)] truncate flex items-center gap-1.5">
                      <span className="truncate">{spirit.name || spirit.distillery || 'Unbenannte Abfüllung'}</span>
                      {onNavigateToSpirit && (
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-[var(--sepia-muted)] font-body flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1 truncate">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        {journalName}
                      </span>
                      {spirit.rating100 > 0 && (
                        <span className="font-mono font-bold text-[var(--brass-accent)]">
                          · {spirit.rating100}/100
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {inNose && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-body font-bold bg-[var(--sensory-nose)]/15 text-[var(--sensory-nose)] border border-[var(--sensory-nose)]/30">
                        {t('inNose')}
                      </span>
                    )}
                    {inTaste && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-body font-bold bg-[var(--sensory-taste)]/15 text-[var(--sensory-taste)] border border-[var(--sensory-taste)]/30">
                        {t('inTaste')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Confirm Delete Selected Aromas Dialog ("Bist du sicher?" Schutz + Kaskaden-Bereinigung) ── */}
      <ConfirmDialog
        isOpen={confirmBulkDelete}
        title={
          selectedAromaRows.length === 1
            ? language === 'DE'
              ? 'Aroma löschen?'
              : 'Delete Aroma?'
            : language === 'DE'
              ? `${selectedAromaRows.length} Aromen löschen?`
              : `Delete ${selectedAromaRows.length} Aromas?`
        }
        subtitle={
          affectedSpiritsCount > 0
            ? language === 'DE'
              ? `Wird aktuell in ${affectedSpiritsCount} Tasting-Notiz${affectedSpiritsCount === 1 ? '' : 'en'} verwendet.`
              : `Currently used in ${affectedSpiritsCount} tasting note${affectedSpiritsCount === 1 ? '' : 's'}.`
            : language === 'DE'
              ? 'Diese Aktion entfernt die Auswahl aus dem Aromakatalog.'
              : 'This action removes the selection from the aroma catalog.'
        }
        message={
          selectedAromaRows.length === 1 ? (
            language === 'DE' ? (
              <>
                Möchtest du das Aroma{' '}
                <strong className="font-semibold text-[var(--foreground)]">
                  {selectedAromaRows[0]?.emoji} {selectedAromaRows[0]?.name}
                </strong>{' '}
                wirklich löschen?
                {affectedSpiritsCount > 0 && (
                  <>
                    {' '}
                    Es wird aktuell in{' '}
                    <strong className="font-semibold text-[var(--brass-accent)]">
                      {affectedSpiritsCount} Tasting-Notiz{affectedSpiritsCount === 1 ? '' : 'en'}
                    </strong>{' '}
                    verwendet und beim Löschen auch sauber aus diesen Notizen entfernt.
                  </>
                )}
              </>
            ) : (
              <>
                Are you sure you want to delete the aroma{' '}
                <strong className="font-semibold text-[var(--foreground)]">
                  {selectedAromaRows[0]?.emoji} {selectedAromaRows[0]?.name}
                </strong>
                ?
                {affectedSpiritsCount > 0 && (
                  <>
                    {' '}
                    It is currently used in{' '}
                    <strong className="font-semibold text-[var(--brass-accent)]">
                      {affectedSpiritsCount} tasting note{affectedSpiritsCount === 1 ? '' : 's'}
                    </strong>{' '}
                    and will be cleanly removed from those notes as well.
                  </>
                )}
              </>
            )
          ) : language === 'DE' ? (
            <>
              Möchtest du die{' '}
              <strong className="font-semibold text-[var(--foreground)]">
                {selectedAromaRows.length} ausgewählten Aromen
              </strong>{' '}
              wirklich löschen?
              {affectedSpiritsCount > 0 && (
                <>
                  {' '}
                  Sie werden aktuell in{' '}
                  <strong className="font-semibold text-[var(--brass-accent)]">
                    {affectedSpiritsCount} Tasting-Notiz{affectedSpiritsCount === 1 ? '' : 'en'}
                  </strong>{' '}
                  verwendet und beim Löschen auch sauber aus diesen Notizen entfernt.
                </>
              )}
            </>
          ) : (
            <>
              Are you sure you want to delete the{' '}
              <strong className="font-semibold text-[var(--foreground)]">
                {selectedAromaRows.length} selected aromas
              </strong>
              ?
              {affectedSpiritsCount > 0 && (
                <>
                  {' '}
                  They are currently used in{' '}
                  <strong className="font-semibold text-[var(--brass-accent)]">
                    {affectedSpiritsCount} tasting note{affectedSpiritsCount === 1 ? '' : 's'}
                  </strong>{' '}
                  and will be cleanly removed from those notes as well.
                </>
              )}
            </>
          )
        }
        confirmLabel={
          selectedAromaRows.length === 1
            ? language === 'DE'
              ? 'Aroma löschen'
              : 'Delete Aroma'
            : language === 'DE'
              ? `${selectedAromaRows.length} Aromen löschen`
              : `Delete ${selectedAromaRows.length} Aromas`
        }
        cancelLabel={t('cancel')}
        closeLabel={t('close')}
        onConfirm={confirmDeleteSelectedAromas}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      {/* ── 5. Confirm Delete Subcategory Dialog ("Bist du sicher?" Schutz) ── */}
      <ConfirmDialog
        isOpen={Boolean(subcategoryPendingDelete)}
        title={language === 'DE' ? 'Unterkategorie löschen?' : 'Delete Subcategory?'}
        subtitle={
          language === 'DE'
            ? 'Die enthaltenen Aromen bleiben erhalten.'
            : 'All aromas inside will be preserved.'
        }
        message={
          language === 'DE' ? (
            <>
              Möchtest du die Unterkategorie{' '}
              <strong className="font-semibold text-[var(--foreground)]">
                {subcategoryPendingDelete?.emoji} {subcategoryPendingDelete?.name}
              </strong>{' '}
              wirklich entfernen? Alle darin enthaltenen Aromen bleiben erhalten und werden automatisch unter{' '}
              <strong className="font-semibold text-[var(--foreground)]">Allgemein</strong> einsortiert.
            </>
          ) : (
            <>
              Are you sure you want to remove the subcategory{' '}
              <strong className="font-semibold text-[var(--foreground)]">
                {subcategoryPendingDelete?.emoji} {subcategoryPendingDelete?.name}
              </strong>
              ? All aromas inside will be preserved and moved to{' '}
              <strong className="font-semibold text-[var(--foreground)]">General</strong>.
            </>
          )
        }
        confirmLabel={language === 'DE' ? 'Unterkategorie entfernen' : 'Remove Subcategory'}
        cancelLabel={t('cancel')}
        closeLabel={t('close')}
        onConfirm={confirmDeleteSubcategory}
        onCancel={() => setSubcategoryPendingDelete(null)}
      />

      {/* ── 6. Confirm Delete Main Category Dialog ("Bist du sicher?" Schutz + Kaskaden-Bereinigung) ── */}
      <ConfirmDialog
        isOpen={Boolean(categoryPendingDelete)}
        title={language === 'DE' ? 'Hauptkategorie löschen?' : 'Delete Main Category?'}
        subtitle={
          language === 'DE'
            ? 'Entfernt die Kategorie samt zugehörigen Unterkategorien und Aromen.'
            : 'Removes the category along with its subcategories and aromas.'
        }
        message={
          language === 'DE' ? (
            <>
              Möchtest du die Hauptkategorie{' '}
              <strong className="font-semibold text-[var(--foreground)]">
                {categoryPendingDelete?.emoji}{' '}
                {categoryPendingDelete?.name[language] ?? categoryPendingDelete?.name.DE}
              </strong>{' '}
              wirklich löschen? Alle darin enthaltenen Unterkategorien und Aromen werden aus dem Katalog sowie aus bestehenden Tasting-Notizen entfernt.
            </>
          ) : (
            <>
              Are you sure you want to delete the main category{' '}
              <strong className="font-semibold text-[var(--foreground)]">
                {categoryPendingDelete?.emoji}{' '}
                {categoryPendingDelete?.name[language] ?? categoryPendingDelete?.name.EN}
              </strong>
              ? All subcategories and aromas inside will be removed from the catalog and from existing tasting notes.
            </>
          )
        }
        confirmLabel={language === 'DE' ? 'Kategorie löschen' : 'Delete Category'}
        cancelLabel={t('cancel')}
        closeLabel={t('close')}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setCategoryPendingDelete(null)}
      />

      {/* ── 7. Create / Edit Aroma, Category or Subcategory Modal ────────── */}
      <CustomFlavorModal
        isOpen={isCreateOpen}
        onClose={handleCloseModal}
        onSave={handleSaveFlavor}
        onSaveCategory={handleSaveCategory}
        onSaveSubcategory={handleSaveSubcategory}
        customSubcategories={customSubcategories}
        initialDimension={preselectedDimension}
        initialCategoryId={preselectedCategoryId}
        initialMode={modalInitialMode}
        editingFlavor={editingFlavor}
        editingCategory={editingCategory}
        editingSubcategory={editingSubcategory}
        submitLabel={t('saveCustomFlavorBtn')}
      />
    </div>
  );
}
