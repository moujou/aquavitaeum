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

  it('renders active flavor tags and allows removing via the (x) button', () => {
    const lagavulin = MOCK_SPIRITS.find((s) => s.id === 'lagavulin-16')!;
    const handleChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector noseFlavorTags={lagavulin.flavorTags} onNoseTagsChange={handleChange} />
      </LanguageProvider>,
    );

    expect(screen.getByText(/Peat Smoke/i)).toBeDefined();

    // Remove Peat Smoke
    const removeBtns = screen.getAllByRole('button', { name: /Remove aroma/i });
    expect(removeBtns.length).toBeGreaterThan(0);
    fireEvent.click(removeBtns[0]);

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders both Nose and Taste sections simultaneously without hidden tabs', () => {
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

    // Both section titles and active tags are visible at once
    expect(screen.getByText(/Nose Aromas|Nase Aromen/i)).toBeDefined();
    expect(screen.getByText(/Taste Aromas|Geschmack Aromen/i)).toBeDefined();

    expect(screen.getByText(/Peat Smoke/i)).toBeDefined();
    expect(screen.getByText(/Vanilla/i)).toBeDefined();
  });

  it('renders dedicated Spotlight search inputs and adds autocomplete suggestions', () => {
    const handleNoseChange = vi.fn();
    const handleTasteChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector
          noseFlavorTags={[]}
          tasteFlavorTags={[]}
          onNoseTagsChange={handleNoseChange}
          onTasteTagsChange={handleTasteChange}
        />
      </LanguageProvider>,
    );

    const noseSearchInput = screen.getByPlaceholderText(/Search aroma for Nose|Aroma für Nase suchen/i);
    expect(noseSearchInput).toBeDefined();

    // Type "Peat" into Nose search
    fireEvent.change(noseSearchInput, { target: { value: 'Peat' } });

    // Autocomplete dropdown should show Peat Smoke
    const suggestionBtn = screen.getByRole('button', { name: /Peat Smoke/i });
    expect(suggestionBtn).toBeDefined();

    // Click suggestion
    fireEvent.click(suggestionBtn);
    expect(handleNoseChange).toHaveBeenCalledWith(['Peat Smoke']);
  });

  it('allows opening the Sensory Compass Drawer and selecting aroma descriptors', () => {
    const handleChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector noseFlavorTags={[]} onNoseTagsChange={handleChange} />
      </LanguageProvider>,
    );

    const openCompassBtn = screen.getByRole('button', { name: /Flavor Compass|Aromen-Kompass/i });
    expect(openCompassBtn).toBeDefined();

    fireEvent.click(openCompassBtn);

    // Drawer should be open
    expect(screen.getByText(/Sommelier Flavor Compass|Sommelier Aromen-Kompass/i)).toBeDefined();

    // Select Peat Smoke in drawer
    const peatSmokeBtn = screen.getByRole('button', { name: /Peat Smoke/i });
    fireEvent.click(peatSmokeBtn);

    expect(handleChange).toHaveBeenCalledWith(['Peat Smoke']);
  });

  it('allows opening Custom Flavor Modal and creating a custom descriptor', () => {
    const handleChange = vi.fn();

    render(
      <LanguageProvider>
        <FlavorTagSelector noseFlavorTags={[]} onNoseTagsChange={handleChange} />
      </LanguageProvider>,
    );

    const createBtn = screen.getByRole('button', { name: /createCustomFlavor|Eigenes Aroma|Custom Flavor/i });
    expect(createBtn).toBeDefined();

    fireEvent.click(createBtn);

    // Modal title should be visible
    expect(screen.getByText(/Create Custom Flavor|Eigenes Aroma erstellen/i)).toBeDefined();

    // Fill in custom name
    const nameInput = screen.getByPlaceholderText(/e.g. Honeycrisp Apple|z.B. Boskoop Apfel/i);
    fireEvent.change(nameInput, { target: { value: 'Honeycrisp Apple' } });

    // Submit form
    const saveBtn = screen.getByRole('button', { name: /Save & Add to Note|Speichern & zur Notiz hinzufügen/i });
    fireEvent.click(saveBtn);

    expect(handleChange).toHaveBeenCalledWith(['Honeycrisp Apple']);
  });
});
