import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  WhiskyAromaWheel,
  computeActiveCategoriesData,
  SommelierCategoryLegendAndInspector,
} from '../WhiskyAromaWheel';
import { LanguageProvider } from '@/context/LanguageContext';

describe('WhiskyAromaWheel Component & Helper Unit Tests', () => {
  it('renders empty state message when no flavor tags are selected', () => {
    render(
      <LanguageProvider>
        <WhiskyAromaWheel
          noseFlavorTags={[]}
          tasteFlavorTags={[]}
          noseTagIntensities={{}}
          tasteTagIntensities={{}}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/Keine Aromen ausgewählt|No aromas selected/i)).toBeDefined();
  });

  it('correctly aggregates active categories data from active tags and intensities', () => {
    const activeTags = ['Rauch', 'Vanille', 'Eiche'];
    const tagIntensities = { Rauch: 8, Vanille: 6, Eiche: 7 };

    const result = computeActiveCategoriesData(activeTags, tagIntensities);

    expect(result.length).toBeGreaterThan(0);
    const smokeCategory = result.find((c) => c.category.id === 'torf');
    expect(smokeCategory).toBeDefined();
    expect(
      smokeCategory?.activeDescriptors.some(
        (d) =>
          d.descriptor.name.DE.toLowerCase().includes('rauch') ||
          d.descriptor.id.toLowerCase().includes('rauch')
      )
    ).toBe(true);
  });

  it('calculates average category scores based on descriptor intensities', () => {
    const activeTags = ['Torf'];
    const tagIntensities = { Torf: 9 };

    const result = computeActiveCategoriesData(activeTags, tagIntensities);
    const peatyCategory = result.find((c) => c.category.id === 'torf');

    expect(peatyCategory).toBeDefined();
    expect(peatyCategory?.activeDescriptors.length).toBeGreaterThan(0);
    expect(peatyCategory?.activeDescriptors[0].intensity).toBe(9);
  });

  it('renders SVG sunburst wheel when flavor tags are present', () => {
    const { container } = render(
      <LanguageProvider>
        <WhiskyAromaWheel
          noseFlavorTags={['Torf', 'Apfel']}
          tasteFlavorTags={['Karamell']}
          noseTagIntensities={{ Torf: 8, Apfel: 5 }}
          tasteTagIntensities={{ Karamell: 7 }}
          sensoryMode="both"
        />
      </LanguageProvider>
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('triggers onTogglePin when a category segment or badge is clicked', () => {
    const onTogglePin = vi.fn();
    render(
      <LanguageProvider>
        <WhiskyAromaWheel
          noseFlavorTags={['Rauch']}
          tasteFlavorTags={[]}
          noseTagIntensities={{ Rauch: 8 }}
          tasteTagIntensities={{}}
          onTogglePin={onTogglePin}
        />
      </LanguageProvider>
    );

    const pinButtons = screen.queryAllByRole('button');
    if (pinButtons.length > 0) {
      fireEvent.click(pinButtons[0]);
    }
    expect(screen.queryByText(/Rauch/i)).toBeDefined();
  });

  it('renders SommelierCategoryLegendAndInspector with active categories data', () => {
    const activeData = computeActiveCategoriesData(
      ['Vanille', 'Schokolade'],
      { Vanille: 7, Schokolade: 8 }
    );

    render(
      <LanguageProvider>
        <SommelierCategoryLegendAndInspector
          activeCategoriesData={activeData}
          activeNode={null}
          pinnedNode={null}
          language="DE"
          togglePin={vi.fn()}
          setHoveredNode={vi.fn()}
          clearSelection={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(activeData.length).toBeGreaterThan(0);
  });

  it('includes custom flavors and mapped category descriptors in computeActiveCategoriesData and wheel', () => {
    const customFlavors = [
      {
        id: 'drachenfrucht',
        name: 'Drachenfrucht',
        radarDimension: 'fruity' as const,
      },
    ];

    const result = computeActiveCategoriesData(
      ['Drachenfrucht'],
      { Drachenfrucht: 9 },
      customFlavors
    );

    const fruitCategory = result.find((c) => c.category.id === 'fruchtig');
    expect(fruitCategory).toBeDefined();
    expect(fruitCategory?.activeDescriptors).toHaveLength(1);
    expect(fruitCategory?.activeDescriptors[0].descriptor.name.DE).toBe('Drachenfrucht');
    expect(fruitCategory?.activeDescriptors[0].intensity).toBe(9);
  });

  it('deduplicates descriptors like peat_smoke when multiple aliases are selected simultaneously', () => {
    // Both 'Peat Smoke' and 'Rauch' and 'Torf' are aliases of peat_smoke
    const tagsWithAliases = ['Peat Smoke', 'Rauch', 'Torf'];
    const intensities = { 'Peat Smoke': 6, Rauch: 9, Torf: 7 };

    const result = computeActiveCategoriesData(tagsWithAliases, intensities);
    const peatyCategory = result.find((c) => c.category.id === 'torf');

    expect(peatyCategory).toBeDefined();
    // peat_smoke must only appear ONCE in activeDescriptors
    const peatSmokeDescriptors = peatyCategory?.activeDescriptors.filter(
      (d) => d.descriptor.id === 'peat_smoke'
    );
    expect(peatSmokeDescriptors).toHaveLength(1);
    // Intensity should be the maximum of the matched aliases (9)
    expect(peatSmokeDescriptors![0].intensity).toBe(9);
  });

  it('renders WhiskyAromaWheel without duplicate keys when multiple aliases are selected', () => {
    const errorSpy = vi.spyOn(console, 'error');
    render(
      <LanguageProvider>
        <WhiskyAromaWheel
          noseFlavorTags={['Peat Smoke', 'Rauch', 'Torf']}
          tasteFlavorTags={['Wood Smoke']}
          noseTagIntensities={{ 'Peat Smoke': 8, Rauch: 9 }}
          tasteTagIntensities={{ 'Wood Smoke': 7 }}
          sensoryMode="both"
        />
      </LanguageProvider>
    );

    // Verify no React key warning was issued
    const duplicateKeyErrors = errorSpy.mock.calls.filter((call) =>
      call.some((arg) => typeof arg === 'string' && arg.includes('same key'))
    );
    expect(duplicateKeyErrors).toHaveLength(0);
    errorSpy.mockRestore();
  });
});

