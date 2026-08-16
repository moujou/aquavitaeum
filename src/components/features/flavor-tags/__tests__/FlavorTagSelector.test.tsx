import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlavorTagSelector, isTagSelected } from '../FlavorTagSelector';
import { SPIRIT_FLAVOR_TAXONOMY } from '@/data/spirit-flavor-taxonomy';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import { LanguageProvider } from '@/context/LanguageContext';

describe('FlavorTagSelector Component', () => {
  it('correctly maps all SWRI flavour taxonomy categories', () => {
    expect(SPIRIT_FLAVOR_TAXONOMY).toHaveLength(9);

    const categoryIds = SPIRIT_FLAVOR_TAXONOMY.map((c) => c.id);
    expect(categoryIds).toContain('torf');
    expect(categoryIds).toContain('feinty');
    expect(categoryIds).toContain('sulphury');
    expect(categoryIds).toContain('maritim');
    expect(categoryIds).toContain('pflanzlich');
    expect(categoryIds).toContain('holzig');
    expect(categoryIds).toContain('weinartig');
    expect(categoryIds).toContain('fruchtig');
    expect(categoryIds).toContain('suesse');
  });

  it('correctly checks isTagSelected with aliases and multilingual names', () => {
    const peatDescriptor = SPIRIT_FLAVOR_TAXONOMY[0].subcategories[1].descriptors[0]; // Peat Smoke

    // Exact English name
    expect(isTagSelected(peatDescriptor, ['Peat Smoke'])).toBe(true);

    // Exact German name
    expect(isTagSelected(peatDescriptor, ['Torfrauch'])).toBe(true);

    // Descriptor ID
    expect(isTagSelected(peatDescriptor, ['peat_smoke'])).toBe(true);

    // Partial/Unmatched
    expect(isTagSelected(peatDescriptor, ['Apple'])).toBe(false);
    expect(isTagSelected(peatDescriptor, [])).toBe(false);
  });

  it('correctly associates mock spirits flavor tags with taxonomy descriptors', () => {
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

  it('renders Lagavulin 16 active flavor tags and allows expanding categories', () => {
    const lagavulin = MOCK_SPIRITS.find((s) => s.id === 'lagavulin-16')!;
    const handleChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector noseFlavorTags={lagavulin.flavorTags} onNoseTagsChange={handleChange} />
      </LanguageProvider>,
    );

    expect(screen.getByText(/Active Flavors/i)).toBeDefined();

    // Expand Peat & Smoke category
    const peatHeader = screen.getByRole('button', { name: /Peat & Smoke/i });
    fireEvent.click(peatHeader);

    const peatBtn = screen.getByRole('button', { name: /Peat Smoke/i });
    expect(peatBtn.getAttribute('aria-pressed')).toBe('true');
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

    // Expand Peat & Smoke category under Nose
    fireEvent.click(screen.getByRole('button', { name: /Peat & Smoke/i }));
    const peatBtn = screen.getByRole('button', { name: /Peat Smoke/i });
    expect(peatBtn.getAttribute('aria-pressed')).toBe('true');

    // Switch to Taste mode
    fireEvent.click(tasteBtn);
    expect(tasteBtn.getAttribute('aria-pressed')).toBe('true');

    // Expand Sweetness & Bakery category under Taste
    fireEvent.click(screen.getByRole('button', { name: /Sweetness & Bakery/i }));
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

  it('starts collapsed by default and allows expanding when clicked', () => {
    const handleChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector noseFlavorTags={['Peat Smoke']} onNoseTagsChange={handleChange} />
      </LanguageProvider>,
    );

    // Collapsed by default -> descriptor button not rendered yet
    expect(screen.queryByRole('button', { name: /Peat Smoke/i })).toBeNull();

    // Click category header to expand
    const categoryHeaderBtn = screen.getByRole('button', { name: /Peat & Smoke/i });
    fireEvent.click(categoryHeaderBtn);

    // Now descriptor button is visible
    expect(screen.getByRole('button', { name: /Peat Smoke/i })).toBeDefined();
  });

  it('toggles a descriptor on and off when clicked', () => {
    const handleChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector noseFlavorTags={['Peat Smoke']} onNoseTagsChange={handleChange} />
      </LanguageProvider>,
    );

    // Expand category
    const categoryHeaderBtn = screen.getByRole('button', { name: /Peat & Smoke/i });
    fireEvent.click(categoryHeaderBtn);

    const peatBtn = screen.getByRole('button', { name: /Peat Smoke/i });
    expect(peatBtn.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(peatBtn);
    expect(handleChange).toHaveBeenCalledWith([]);
  });
});
