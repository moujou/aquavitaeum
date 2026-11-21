import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AromaCatalogView, purgeDeletedAromasFromSpirit } from '../AromaCatalogView';
import { LanguageProvider } from '@/context/LanguageContext';
import { createBlankSpirit } from '@/lib/spirit-utils';
import { db } from '@/lib/db';
import {
  MIN_FLAVOR_CATEGORIES,
  MAX_FLAVOR_CATEGORIES,
  getEffectiveFlavorTaxonomy,
  saveCustomCategory,
  deleteCustomCategory,
  resetCustomCategories,
  registerCustomFlavor,
  deleteStoredCustomFlavor,
  getStoredCustomFlavors,
  saveStandardFlavorOverride,
  resetStandardFlavorOverride,
  getStandardFlavorOverrides,
  saveCustomSubcategory,
  deleteCustomSubcategory,
  resetCustomSubcategories,
  getStoredCustomSubcategories,
  assignAromaToSubcategory,
  resolveSmartCatalogAroma,
  registerCustomFlavorIfMissing,
} from '@/data/spirit-flavor-taxonomy';
import { getDynamicRadarCategories } from '@/components/features/radar-chart/FlavorRadarChart';

describe('AromaCatalogView Component', () => {
  beforeEach(() => {
    const existing = getStoredCustomFlavors();
    existing.forEach((f) => deleteStoredCustomFlavor(f.id));
    Object.keys(getStandardFlavorOverrides()).forEach((id) => resetStandardFlavorOverride(id));
    resetCustomSubcategories();
    resetCustomCategories();
  });

  it('renders unboxed search and category filter toolbar and unified single-line aroma rows', () => {
    render(
      <LanguageProvider>
        <AromaCatalogView
          journals={[]}
          isCreateOpen={false}
          onOpenCreate={vi.fn()}
          onCloseCreate={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByPlaceholderText(/Search aromas|Aromen durchsuchen/i)).toBeDefined();
    expect(screen.getAllByText(/Peat & Smoke|Torf & Rauch/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Peat$|^Torf$/i).length).toBeGreaterThan(0);

    // No redundant filter mode buttons
    expect(screen.queryByRole('button', { name: /All Aromas|Alle Aromen/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /My Aromas|Eigene Aromen/i })).toBeNull();
  });

  it('filters descriptors by search query', () => {
    render(
      <LanguageProvider>
        <AromaCatalogView
          journals={[]}
          isCreateOpen={false}
          onOpenCreate={vi.fn()}
          onCloseCreate={vi.fn()}
        />
      </LanguageProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search aromas|Aromen durchsuchen/i);
    fireEvent.change(searchInput, { target: { value: 'Beeswax' } });

    expect(screen.getByText(/Beeswax|Bienenwachs/i)).toBeDefined();
  });

  it('hides permanent delete icon in normal mode, keeps a framed edit button, and deletes via Select Mode + ConfirmDialog protection', async () => {
    registerCustomFlavor({
      id: 'custom_wild_cherry',
      name: 'Wild Cherry Reserve',
      emoji: '🍒',
      radarDimension: 'fruity',
      color: '#D81B60',
    });

    const onOpenCreate = vi.fn();

    render(
      <LanguageProvider>
        <AromaCatalogView
          journals={[]}
          isCreateOpen={false}
          onOpenCreate={onOpenCreate}
          onCloseCreate={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Wild Cherry Reserve')).toBeDefined();
    expect(screen.queryByText(/^Custom$|^Eigenes Aroma$/i)).toBeNull();

    // Filter to Wild Cherry Reserve
    const searchInput = screen.getByPlaceholderText(/Search aromas|Aromen durchsuchen/i);
    fireEvent.change(searchInput, { target: { value: 'Wild Cherry Reserve' } });

    // In normal mode, NO permanent delete button is exposed on the row
    expect(screen.queryByRole('button', { name: /Remove aroma|Aroma entfernen/i })).toBeNull();

    // Framed Edit button works in normal mode
    const editBtn = screen.getByRole('button', { name: /Edit Custom Flavor|Eigenes Aroma bearbeiten/i });
    fireEvent.click(editBtn);
    expect(onOpenCreate).toHaveBeenCalledTimes(1);

    // Enter Select Mode via long-press on the aroma row (500ms)
    vi.useFakeTimers();
    const rowText = screen.getByText('Wild Cherry Reserve');
    fireEvent.touchStart(rowText);
    act(() => {
      vi.advanceTimersByTime(550);
    });
    fireEvent.touchEnd(rowText);
    vi.useRealTimers();

    // Select Mode is active and 1 aroma is selected (search bar is replaced by selection count badge)
    expect(screen.getByText(/1 selected|1 ausgewählt/i)).toBeDefined();

    // Open Actions menu in Select Mode and click Delete (1) -> opens ConfirmDialog (does NOT delete immediately)
    const actionsBtn = screen.getByRole('button', { name: /Actions|Aktionen/i });
    fireEvent.click(actionsBtn);
    const deleteMenuOption = screen.getByText(/Delete \(1\)|Löschen \(1\)/i);
    fireEvent.click(deleteMenuOption);

    // ConfirmDialog is open and aroma still exists until confirmed
    expect(screen.getByText(/Delete Aroma\?|Aroma löschen\?/i)).toBeDefined();
    expect(screen.getAllByText(/Wild Cherry Reserve/i).length).toBeGreaterThan(0);

    // Confirm deletion inside ConfirmDialog
    const confirmBtn = screen.getByRole('button', { name: /^Delete Aroma$|^Aroma löschen$/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(screen.queryByText('Wild Cherry Reserve')).toBeNull();
  });

  it('allows multi-selecting and deleting standard and custom aromas via PageActionsDropdown + ConfirmDialog', async () => {
    saveStandardFlavorOverride({
      id: 'peat_smoke',
      name: { EN: 'Islay Peat Smoke', DE: 'Islay Torfrauch' },
      radarDimension: 'peaty',
      emoji: '🔥',
    });

    render(
      <LanguageProvider>
        <AromaCatalogView
          journals={[]}
          isCreateOpen={false}
          onOpenCreate={vi.fn()}
          onCloseCreate={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/Islay Peat Smoke|Islay Torfrauch/i)).toBeDefined();

    // Filter to Islay Peat Smoke
    const searchInput = screen.getByPlaceholderText(/Search aromas|Aromen durchsuchen/i);
    fireEvent.change(searchInput, { target: { value: 'Islay Peat Smoke' } });

    // Enter Select Mode via Top Actions Dropdown
    const actionsBtn = screen.getByRole('button', { name: /Actions|Aktionen/i });
    fireEvent.click(actionsBtn);
    const selectModeOption = screen.getByText(/Select Aromas|Aromen auswählen/i);
    fireEvent.click(selectModeOption);

    // Click row to select it
    fireEvent.click(screen.getByText(/Islay Peat Smoke|Islay Torfrauch/i));
    expect(screen.getByText(/1 selected|1 ausgewählt/i)).toBeDefined();

    // Open Actions menu and click Delete (1) -> ConfirmDialog
    fireEvent.click(screen.getByRole('button', { name: /Actions|Aktionen/i }));
    fireEvent.click(screen.getByText(/Delete \(1\)|Löschen \(1\)/i));

    const confirmBtn = screen.getByRole('button', { name: /^Delete Aroma$|^Aroma löschen$/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(screen.queryByText(/Islay Peat Smoke|Islay Torfrauch/i)).toBeNull();
  });

  it('warns when deleting an aroma used in tasting notes and cascades cleanup of tags, intensities, and finish curves', async () => {
    const customCherry = {
      id: 'custom_black_cherry',
      name: 'Black Cherry Cask',
      emoji: '🍒',
      radarDimension: 'fruity' as const,
      color: '#B91C1C',
    };
    registerCustomFlavor(customCherry);

    const spirit = {
      ...createBlankSpirit('journal-1'),
      id: 'spirit-cherry-test',
      name: 'Glendronach Single Cask',
      noseFlavorTags: ['Black Cherry Cask', 'Vanilla'],
      tasteFlavorTags: ['Black Cherry Cask', 'Dark Chocolate'],
      flavorTags: ['Black Cherry Cask', 'Vanilla', 'Dark Chocolate'],
      noseTagIntensities: { 'Black Cherry Cask': 8, Vanilla: 6 },
      tasteTagIntensities: { 'Black Cherry Cask': 9, 'Dark Chocolate': 7 },
      finishCurves: {
        'Black Cherry Cask': { startTime: 0, peakTime: 10, peakIntensity: 8, endTime: 45 },
        'Dark Chocolate': { startTime: 0, peakTime: 15, peakIntensity: 7, endTime: 60 },
      },
    };

    // Unit test pure cascade cleanup helper directly
    const cleaned = purgeDeletedAromasFromSpirit(spirit, [{ type: 'custom', cf: customCherry }]);
    expect(cleaned).not.toBeNull();
    expect(cleaned?.noseFlavorTags).toEqual(['Vanilla']);
    expect(cleaned?.tasteFlavorTags).toEqual(['Dark Chocolate']);
    expect(cleaned?.flavorTags).toEqual(['Vanilla', 'Dark Chocolate']);
    expect(cleaned?.noseTagIntensities).toEqual({ Vanilla: 6 });
    expect(cleaned?.tasteTagIntensities).toEqual({ 'Dark Chocolate': 7 });
    expect(cleaned?.finishCurves).toEqual({
      'Dark Chocolate': { startTime: 0, peakTime: 15, peakIntensity: 7, endTime: 60 },
    });

    // Also test full UI ConfirmDialog warning + DB cascade cleanup
    const toArraySpy = vi.spyOn(db.spirits, 'toArray').mockResolvedValue([spirit]);
    const putSpy = vi.spyOn(db.spirits, 'put').mockResolvedValue('spirit-cherry-test');

    render(
      <LanguageProvider>
        <AromaCatalogView
          journals={[]}
          isCreateOpen={false}
          onOpenCreate={vi.fn()}
          onCloseCreate={vi.fn()}
        />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Black Cherry Cask')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Search aromas|Aromen durchsuchen/i);
    fireEvent.change(searchInput, { target: { value: 'Black Cherry Cask' } });

    // Usage badge 1× is shown
    expect(screen.getByText('1×')).toBeDefined();

    // Enter Select Mode and select Black Cherry Cask
    const actionsBtn = screen.getByRole('button', { name: /Actions|Aktionen/i });
    fireEvent.click(actionsBtn);
    fireEvent.click(screen.getByText(/Select Aromas|Aromen auswählen/i));
    fireEvent.click(screen.getByText('Black Cherry Cask'));

    // Open Delete via Actions menu and verify ConfirmDialog warning about 1 tasting note
    fireEvent.click(screen.getByRole('button', { name: /Actions|Aktionen/i }));
    fireEvent.click(screen.getByText(/Delete \(1\)|Löschen \(1\)/i));
    expect(screen.getAllByText(/1 tasting note|1 Tasting-Notiz/i).length).toBeGreaterThan(0);

    // Confirm deletion and verify db.spirits.put was called with cleaned spirit
    const confirmBtn = screen.getByRole('button', { name: /^Delete Aroma$|^Aroma löschen$/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(putSpy).toHaveBeenCalledTimes(1);
    const savedSpirit = putSpy.mock.calls[0][0];
    expect(savedSpirit.noseFlavorTags).toEqual(['Vanilla']);
    expect(savedSpirit.tasteFlavorTags).toEqual(['Dark Chocolate']);
    expect(savedSpirit.noseTagIntensities).toEqual({ Vanilla: 6 });

    toArraySpy.mockRestore();
    putSpy.mockRestore();
  });

  it('displays optional description under the aroma name in the catalog when provided', () => {
    registerCustomFlavor({
      id: 'custom_laphroaig_peat',
      name: 'Coastal Peat',
      description: 'Medicinal seaweed and sweet iodine',
      emoji: '🌊',
      radarDimension: 'peaty',
    });

    render(
      <LanguageProvider>
        <AromaCatalogView
          journals={[]}
          isCreateOpen={false}
          onOpenCreate={vi.fn()}
          onCloseCreate={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Coastal Peat')).toBeDefined();
    expect(screen.getByText('Medicinal seaweed and sweet iodine')).toBeDefined();
  });

  it('sanitizes and rejects malformed or injected localStorage entries in getStoredCustomFlavors and getStandardFlavorOverrides', () => {
    localStorage.setItem(
      'aquavitaeum_custom_flavors',
      JSON.stringify([
        { id: 123, name: null, radarDimension: 'invalid_dim' },
        { id: 'legacy_no_emoji', name: 'Random Legacy Tag', radarDimension: 'fruity' },
        {
          id: 'valid_custom',
          name: 'Salted Butterscotch',
          emoji: '🍮',
          radarDimension: 'cereal',
          description: 'Rich golden butterscotch',
        },
      ])
    );

    localStorage.setItem(
      'aquavitaeum_standard_flavor_overrides',
      JSON.stringify({
        invalid_entry: { id: 'bad', name: 'not_an_object', radarDimension: 'invalid' },
        vanille: {
          id: 'vanille',
          name: { EN: 'Bourbon Vanilla', DE: 'Bourbon-Vanille' },
          radarDimension: 'cereal',
          emoji: '🍦',
        },
      })
    );

    const storedCustom = getStoredCustomFlavors();
    expect(storedCustom).toHaveLength(1);
    expect(storedCustom[0].id).toBe('valid_custom');
    expect(storedCustom[0].name).toBe('Salted Butterscotch');

    const storedOverrides = getStandardFlavorOverrides();
    expect(storedOverrides.invalid_entry).toBeUndefined();
    expect(storedOverrides.vanille?.name.EN).toBe('Bourbon Vanilla');
  });

  it('renders Variant B user subcategories inside a category and allows assigning and unassigning aromas', () => {
    saveCustomSubcategory({
      id: 'subcat_citrus',
      name: 'Zitrusfrüchte',
      categoryId: 'fruchtig',
      emoji: '🍋',
    });

    assignAromaToSubcategory('lemon_curd', false, 'subcat_citrus');

    render(
      <LanguageProvider>
        <AromaCatalogView
          journals={[]}
          isCreateOpen={false}
          onOpenCreate={vi.fn()}
          onCloseCreate={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Zitrusfrüchte')).toBeDefined();
    expect(screen.getAllByText(/General|Allgemein/i).length).toBeGreaterThan(0);

    // Deleting the subcategory preserves the aroma and moves it back to general
    deleteCustomSubcategory('subcat_citrus');
    expect(getStoredCustomSubcategories().some((s) => s.id === 'subcat_citrus')).toBe(false);
    expect(getStandardFlavorOverrides().lemon_curd?.subcategoryId).toBe('');
  });

  it('smart-matches plural and adjective aroma variants to existing catalog aromas and files genuinely new aromas into the matching subcategory', () => {
    // 1. Variants of existing catalog aromas ("Dunkle Rosinen", "Grüne Äpfel", "Kräftiger Torfrauch")
    const raisinRes = resolveSmartCatalogAroma('Dunkle Rosinen', 'DE');
    expect(raisinRes.isNew).toBe(false);
    expect(raisinRes.canonicalName).toBe('Rosine');

    const appleRes = resolveSmartCatalogAroma('Grüne Äpfel', 'DE');
    expect(appleRes.isNew).toBe(false);
    expect(appleRes.canonicalName).toBe('Apfel');

    const peatRes = resolveSmartCatalogAroma('Kräftiger Torfrauch', 'DE');
    expect(peatRes.isNew).toBe(false);
    expect(peatRes.canonicalName).toBe('Torf');

    // Calling registerCustomFlavorIfMissing on "Dunkle Rosinen" must NOT create a duplicate custom flavor
    registerCustomFlavorIfMissing('Dunkle Rosinen', 'winey', 'DE');
    expect(getStoredCustomFlavors()).toHaveLength(0);

    // 2. Genuinely new aroma ("Litschi") -> isNew: true, filed into Fruchtig > Tropisch
    const lycheeRes = resolveSmartCatalogAroma('Litschi', 'DE');
    expect(lycheeRes.isNew).toBe(true);
    expect(lycheeRes.targetCategory.id).toBe('fruchtig');
    expect(lycheeRes.targetSubcategory?.id).toBe('sub_tropisch');

    const savedCustom = registerCustomFlavorIfMissing('Litschi', undefined, 'DE');
    expect(savedCustom.name).toBe('Litschi');
    expect(savedCustom.subcategoryId).toBe('sub_tropisch');
  });

  it('supports editing default categories, creating custom main categories up to max 12, and enforcing min 3 categories on deletion', () => {
    expect(getEffectiveFlavorTaxonomy()).toHaveLength(9);

    // 1. Edit an existing default category ("torf" -> "Islay Rauch & Torf")
    expect(
      saveCustomCategory({
        id: 'torf',
        name: 'Islay Rauch & Torf',
        emoji: '🌋',
        color: '#E65100',
        radarDimension: 'peaty',
      })
    ).toBe(true);

    const updatedTorf = getEffectiveFlavorTaxonomy().find((c) => c.id === 'torf');
    expect(updatedTorf?.name.DE).toBe('Islay Rauch & Torf');
    expect(updatedTorf?.emoji).toBe('🌋');
    expect(updatedTorf?.color).toBe('#E65100');

    // 2. Add 3 new custom categories to reach MAX_FLAVOR_CATEGORIES (12)
    expect(
      saveCustomCategory({
        id: 'cat_roest',
        name: 'Röstaromen & Kaffee',
        emoji: '☕',
        color: '#3E2723',
        radarDimension: 'woody',
      })
    ).toBe(true);
    expect(
      saveCustomCategory({
        id: 'cat_tropen',
        name: 'Exotische Früchte',
        emoji: '🥭',
        color: '#F57C00',
        radarDimension: 'fruity',
      })
    ).toBe(true);
    expect(
      saveCustomCategory({
        id: 'cat_kraeuterlikoer',
        name: 'Alpenkräuter',
        emoji: '🌿',
        color: '#2E945D',
        radarDimension: 'floral',
      })
    ).toBe(true);

    expect(getEffectiveFlavorTaxonomy()).toHaveLength(MAX_FLAVOR_CATEGORIES);
    expect(getDynamicRadarCategories()).toHaveLength(MAX_FLAVOR_CATEGORIES);

    // 3. Attempting to add a 13th category is blocked
    expect(
      saveCustomCategory({
        id: 'cat_overflow_13',
        name: 'Dreizehnte Kategorie',
        emoji: '🥃',
        color: '#C59B27',
        radarDimension: 'cereal',
      })
    ).toBe(false);
    expect(getEffectiveFlavorTaxonomy()).toHaveLength(MAX_FLAVOR_CATEGORIES);

    // 4. Delete categories down to MIN_FLAVOR_CATEGORIES (3) and verify 3-category floor is enforced
    const allIds = getEffectiveFlavorTaxonomy().map((c) => c.id);
    for (let i = 0; i < allIds.length - MIN_FLAVOR_CATEGORIES; i++) {
      expect(deleteCustomCategory(allIds[i])).toBe(true);
    }
    expect(getEffectiveFlavorTaxonomy()).toHaveLength(MIN_FLAVOR_CATEGORIES);

    const remainingId = getEffectiveFlavorTaxonomy()[0].id;
    expect(deleteCustomCategory(remainingId)).toBe(false);
    expect(getEffectiveFlavorTaxonomy()).toHaveLength(MIN_FLAVOR_CATEGORIES);
  });
});
