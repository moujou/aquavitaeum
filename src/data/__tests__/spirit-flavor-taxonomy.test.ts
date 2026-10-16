import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCategoryByDescriptorId,
  getDescriptorsByCategory,
  getCategoryForRadarDimension,
  inferCategoryFromTagName,
  registerCustomFlavorIfMissing,
} from '../spirit-flavor-taxonomy';
import { CustomFlavorDescriptor } from '@/types/spirit.types';

describe('spirit-flavor-taxonomy Custom Flavor & Categorization', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('maps canonical radar dimensions to taxonomy categories', () => {
    expect(getCategoryForRadarDimension('peaty')?.id).toBe('torf');
    expect(getCategoryForRadarDimension('fruity')?.id).toBe('fruchtig');
    expect(getCategoryForRadarDimension('spicy')?.id).toBe('wuerzig');
    expect(getCategoryForRadarDimension('chocolate')?.id).toBe('suesse');
    expect(getCategoryForRadarDimension('nutty')?.id).toBe('holzig');
  });

  it('infers category from aroma tag names via keywords', () => {
    expect(inferCategoryFromTagName('Lagerfeuerasche')?.id).toBe('torf');
    expect(inferCategoryFromTagName('Torfrauch')?.id).toBe('torf');
    expect(inferCategoryFromTagName('Getrocknete Aprikose')?.id).toBe('fruchtig');
    expect(inferCategoryFromTagName('Zartbitterschokolade')?.id).toBe('suesse');
    expect(inferCategoryFromTagName('Eichenfass')?.id).toBe('holzig');
    expect(inferCategoryFromTagName('Schwarzer Pfeffer')?.id).toBe('wuerzig');
    expect(inferCategoryFromTagName('Oloroso Sherry')?.id).toBe('weinartig');
    expect(inferCategoryFromTagName('Heidekraut')?.id).toBe('pflanzlich');
    expect(inferCategoryFromTagName('Meersalz')?.id).toBe('maritim');
    expect(inferCategoryFromTagName('Altes Leder')?.id).toBe('feinty');
  });

  it('resolves category for Custom Flavors via their radarDimension', () => {
    const customFlavors: CustomFlavorDescriptor[] = [
      {
        id: 'drachenfrucht',
        name: 'Drachenfrucht',
        radarDimension: 'fruity',
      },
      {
        id: 'kandierter_ingwer',
        name: 'Kandierter Ingwer',
        radarDimension: 'spicy',
      },
    ];

    const fruitCat = getCategoryByDescriptorId('Drachenfrucht', customFlavors);
    expect(fruitCat).toBeDefined();
    expect(fruitCat?.id).toBe('fruchtig');

    const spicyCat = getCategoryByDescriptorId('Kandierter Ingwer', customFlavors);
    expect(spicyCat).toBeDefined();
    expect(spicyCat?.id).toBe('wuerzig');
  });

  it('includes Custom Flavors in getDescriptorsByCategory', () => {
    const customFlavors: CustomFlavorDescriptor[] = [
      {
        id: 'blutorange_custom',
        name: 'Blutorange',
        radarDimension: 'fruity',
        color: '#D81B60',
      },
    ];

    const fruitDescriptors = getDescriptorsByCategory('fruchtig', customFlavors);
    const foundCustom = fruitDescriptors.find((d) => d.id === 'blutorange_custom');
    expect(foundCustom).toBeDefined();
    expect(foundCustom?.name.DE).toBe('Blutorange');
    expect(foundCustom?.radarDimension).toBe('fruity');
  });

  it('registers new custom flavor with registerCustomFlavorIfMissing', () => {
    const customDesc = registerCustomFlavorIfMissing('Kandierte Ananas', 'fruity');
    expect(customDesc.name).toBe('Kandierte Ananas');
    expect(customDesc.radarDimension).toBe('fruity');

    // Category should be resolvable now
    const cat = getCategoryByDescriptorId('Kandierte Ananas');
    expect(cat).toBeDefined();
    expect(cat?.id).toBe('fruchtig');
  });

  it('does not duplicate existing standard descriptors in registerCustomFlavorIfMissing', () => {
    // "Green Apple" / "Grüner Apfel" is already in taxonomy
    const registered = registerCustomFlavorIfMissing('Green Apple');
    expect(registered.id).toBe('gruener_apfel');
    expect(registered.radarDimension).toBe('fruity');
  });
});
