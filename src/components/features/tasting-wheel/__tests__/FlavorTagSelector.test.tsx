import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FlavorTagSelector, isTagSelected } from '../FlavorTagSelector';
import { LanguageProvider } from '@/context/LanguageContext';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import {
  SPIRIT_FLAVOR_TAXONOMY,
  getAllFlavorDescriptors,
  getDescriptorsByCategory,
  getDescriptorsByRadarDimension,
  findFlavorDescriptor,
  translateFlavorTag,
} from '@/data/spirit-flavor-taxonomy';

describe('FlavorTagSelector Component & Generic Taxonomy Helpers', () => {
  it('provides SSOT derived helper getters for all flavor descriptors', () => {
    const all = getAllFlavorDescriptors();
    expect(all.length).toBeGreaterThan(30);

    const peatCategoryDescriptors = getDescriptorsByCategory('torf');
    expect(peatCategoryDescriptors.length).toBeGreaterThan(0);
    expect(peatCategoryDescriptors.some((d) => d.id === 'peat_smoke')).toBe(true);

    const peatyRadarDescriptors = getDescriptorsByRadarDimension('peaty');
    expect(peatyRadarDescriptors.length).toBeGreaterThan(0);

    const foundJod = findFlavorDescriptor('Iodine');
    expect(foundJod).toBeDefined();
    expect(foundJod?.id).toBe('jod');

    expect(translateFlavorTag('Peat Smoke', 'DE')).toBe('Torfrauch');
    expect(translateFlavorTag('Ash', 'DE')).toBe('Asche');
    expect(translateFlavorTag('Sea Salt', 'DE')).toBe('Meersalz');
    expect(translateFlavorTag('Peat Smoke', 'EN')).toBe('Peat Smoke');
  });

  it('ensures each descriptor is strictly autonomous (e.g. selecting "Ash" does NOT select "Dry Tobacco")', () => {
    const allDescriptors = SPIRIT_FLAVOR_TAXONOMY.flatMap((cat) =>
      cat.subcategories.flatMap((sub) => sub.descriptors),
    );

    const ashDesc = allDescriptors.find((d) => d.id === 'asche')!;
    const tobaccoDesc = allDescriptors.find((d) => d.id === 'trockener_tabak')!;

    expect(isTagSelected(ashDesc, ['Ash'])).toBe(true);
    expect(isTagSelected(tobaccoDesc, ['Ash'])).toBe(false);
  });

  it('correctly matches legacy spirit flavor tags (e.g. Lagavulin 16) using isTagSelected helper', () => {
    const lagavulin = MOCK_SPIRITS.find((s) => s.id === 'lagavulin-16')!;
    expect(lagavulin.flavorTags).toEqual([
      'Peat Smoke',
      'Dried Fig',
      'Dark Chocolate',
      'Sea Salt',
      'Raisin',
      'Sherry Cask',
    ]);

    const allDescriptors = SPIRIT_FLAVOR_TAXONOMY.flatMap((cat) =>
      cat.subcategories.flatMap((sub) => sub.descriptors),
    );

    const peatDesc = allDescriptors.find((d) => d.id === 'peat_smoke')!;
    const figDesc = allDescriptors.find((d) => d.id === 'dried_fig')!;
    const chocolateDesc = allDescriptors.find((d) => d.id === 'dark_chocolate')!;
    const saltDesc = allDescriptors.find((d) => d.id === 'sea_salt')!;
    const raisinDesc = allDescriptors.find((d) => d.id === 'raisin')!;
    const sherryDesc = allDescriptors.find((d) => d.id === 'sherry_cask')!;

    expect(isTagSelected(peatDesc, lagavulin.flavorTags)).toBe(true);
    expect(isTagSelected(figDesc, lagavulin.flavorTags)).toBe(true);
    expect(isTagSelected(chocolateDesc, lagavulin.flavorTags)).toBe(true);
    expect(isTagSelected(saltDesc, lagavulin.flavorTags)).toBe(true);
    expect(isTagSelected(raisinDesc, lagavulin.flavorTags)).toBe(true);
    expect(isTagSelected(sherryDesc, lagavulin.flavorTags)).toBe(true);
  });

  it('renders Lagavulin 16 active flavor tags as highlighted active buttons in the UI', () => {
    const lagavulin = MOCK_SPIRITS.find((s) => s.id === 'lagavulin-16')!;
    const handleChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector noseFlavorTags={lagavulin.flavorTags} onNoseTagsChange={handleChange} />
      </LanguageProvider>,
    );

    expect(screen.getByText(/Active Flavors/i)).toBeDefined();

    const peatBtn = screen.getByRole('button', { name: /Peat Smoke/i });
    const figBtn = screen.getByRole('button', { name: /Dried Fig/i });
    const chocolateBtn = screen.getByRole('button', { name: /Dark Chocolate/i });
    const saltBtn = screen.getByRole('button', { name: /Sea Salt/i });
    const raisinBtn = screen.getByRole('button', { name: /Raisin/i });
    const sherryBtn = screen.getByRole('button', { name: /Sherry Cask/i });

    expect(peatBtn.getAttribute('aria-pressed')).toBe('true');
    expect(figBtn.getAttribute('aria-pressed')).toBe('true');
    expect(chocolateBtn.getAttribute('aria-pressed')).toBe('true');
    expect(saltBtn.getAttribute('aria-pressed')).toBe('true');
    expect(raisinBtn.getAttribute('aria-pressed')).toBe('true');
    expect(sherryBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('switches between Nose and Taste sensory modes independently', () => {
    const handleNoseChange = vi.fn();
    const handleTasteChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector
          noseFlavorTags={['Peat Smoke']}
          tasteFlavorTags={['Vanilla']}
          onNoseTagsChange={handleNoseChange}
          onTasteTagsChange={handleTasteChange}
        />
      </LanguageProvider>,
    );

    const noseBtn = screen.getByRole('button', { name: /Nose|Nase/i });
    const tasteBtn = screen.getByRole('button', { name: /Taste|Geschmack/i });
    expect(noseBtn.getAttribute('aria-pressed')).toBe('true');

    // Peat Smoke is selected under Nose
    const peatBtn = screen.getByRole('button', { name: /Peat Smoke/i });
    expect(peatBtn.getAttribute('aria-pressed')).toBe('true');

    // Switch to Taste mode
    fireEvent.click(tasteBtn);
    expect(tasteBtn.getAttribute('aria-pressed')).toBe('true');

    // Under Taste, Vanilla is active, Peat Smoke is not active
    const vanillaBtn = screen.getByRole('button', { name: /Vanilla/i });
    expect(vanillaBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('filters taxonomy categories dynamically when typing in the search input field', () => {
    const handleChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector noseFlavorTags={[]} onNoseTagsChange={handleChange} />
      </LanguageProvider>,
    );

    const searchInput = screen.getByPlaceholderText(/Search flavor descriptors…|Aromen durchsuchen…/i);
    
    // Type "Peat"
    fireEvent.change(searchInput, { target: { value: 'Peat' } });

    // Peat & Smoke category should remain visible
    expect(screen.getByText(/Peat & Smoke/i)).toBeDefined();

    // Non-matching categories (e.g. Sweetness & Bakery) should be hidden
    expect(screen.queryByText(/Sweetness & Bakery/i)).toBeNull();
  });

  it('filters taxonomy categories when searching German terms like "Ölig"', () => {
    const handleChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector noseFlavorTags={[]} onNoseTagsChange={handleChange} />
      </LanguageProvider>,
    );

    const searchInput = screen.getByPlaceholderText(/Search flavor descriptors…|Aromen durchsuchen…/i);
    
    fireEvent.change(searchInput, { target: { value: 'Ölig' } });

    // After SWRI reorganization, nutty/oily descriptors moved under Cask & Oak ("Nutty & Oily" subcategory)
    expect(screen.getByText(/Nutty & Oily|Nussig & Ölig/i)).toBeDefined();
  });

  it('renders Active Flavors summary section with semantically divided Nose and Taste tags', () => {
    const handleNoseChange = vi.fn();
    const handleTasteChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector
          noseFlavorTags={['Peat Smoke', 'Dried Fig']}
          tasteFlavorTags={['Vanilla', 'Dark Chocolate']}
          onNoseTagsChange={handleNoseChange}
          onTasteTagsChange={handleTasteChange}
        />
      </LanguageProvider>,
    );

    expect(screen.getByText(/Active Flavors \(4\)|Aktive Aromen \(4\)/i)).toBeDefined();
    expect(screen.getByText(/Peat Smoke · Dried Fig/i)).toBeDefined();
    expect(screen.getByText(/Vanilla · Dark Chocolate/i)).toBeDefined();
  });

  it('allows collapsing a category even when it contains active flavor tags', () => {
    const handleChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector noseFlavorTags={['Peat Smoke']} onNoseTagsChange={handleChange} />
      </LanguageProvider>,
    );

    expect(screen.getByRole('button', { name: /Peat Smoke/i })).toBeDefined();

    const categoryHeaderBtn = screen.getByRole('button', { name: /Peat & Smoke/i });
    fireEvent.click(categoryHeaderBtn);

    expect(screen.queryByRole('button', { name: /Peat Smoke/i })).toBeNull();
  });

  it('toggles a descriptor on and off when clicked', () => {
    const handleChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector noseFlavorTags={['Peat Smoke']} onNoseTagsChange={handleChange} />
      </LanguageProvider>,
    );

    const peatBtn = screen.getByRole('button', { name: /Peat Smoke/i });
    expect(peatBtn.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(peatBtn);
    expect(handleChange).toHaveBeenCalledWith([]);
  });
});
