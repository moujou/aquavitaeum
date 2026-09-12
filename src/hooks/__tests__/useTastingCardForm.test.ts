import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTastingCardForm } from '../useTastingCardForm';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import { SpiritAnalysisResult } from '@/services/ai-assistant-service';

describe('useTastingCardForm Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('initializes with initial spirit and default state', () => {
    const testSpirit = MOCK_SPIRITS[0];
    const { result } = renderHook(() => useTastingCardForm(testSpirit));

    expect(result.current.spirit.id).toBe(testSpirit.id);
    expect(result.current.displayName).toBe(testSpirit.name);
    expect(result.current.saved).toBe(true);
    expect(result.current.showDeleteModal).toBe(false);
  });

  it('initializes with blank spirit when no initialSpirit is provided', () => {
    const { result } = renderHook(() => useTastingCardForm());
    expect(result.current.spirit).toBeDefined();
    expect(result.current.displayName).toBe('Untitled Spirit Note');
    expect(result.current.subtitleLocation).toBe('Tasting Notes');
  });

  it('updates a field, marks form as unsaved, and debounces save', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0], onSave));

    act(() => {
      result.current.update('distillery', 'New Distillery');
    });

    expect(result.current.spirit.distillery).toBe('New Distillery');
    expect(result.current.saved).toBe(false);

    // Fast-forward debounce timer (1000ms)
    act(() => {
      vi.advanceTimersByTime(1050);
    });

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ distillery: 'New Distillery' })
    );
    expect(result.current.saved).toBe(true);
  });

  it('updates nose profile and taste profile dimensions', () => {
    const { result } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0]));

    act(() => {
      result.current.updateProfile('noseProfile', 'peaty', 9);
      result.current.updateProfile('tasteProfile', 'chocolate', 8);
    });

    expect(result.current.spirit.noseProfile.peaty).toBe(9);
    expect(result.current.spirit.tasteProfile.chocolate).toBe(8);
  });

  it('handles auto-thumbnail selection when images array is updated', () => {
    const { result } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0]));

    act(() => {
      result.current.update('images', ['img1.jpg', 'img2.jpg']);
    });

    expect(result.current.spirit.images).toEqual(['img1.jpg', 'img2.jpg']);
    expect(result.current.spirit.thumbnailImage).toBe('img1.jpg');

    act(() => {
      result.current.update('images', []);
    });
    expect(result.current.spirit.thumbnailImage).toBeUndefined();
  });

  it('saves note and calls onSave callback immediately on handleSave', () => {
    const onSaveMock = vi.fn();
    const testSpirit = { ...MOCK_SPIRITS[0], rating100: 95 };
    const { result } = renderHook(() => useTastingCardForm(testSpirit, onSaveMock));

    act(() => {
      result.current.handleSave();
    });

    expect(result.current.saved).toBe(true);
    expect(onSaveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: testSpirit.id,
        rating100: 95,
        starRating: 5, // 95/100 * 5 = 4.75 -> rounded to 5
      }),
    );
  });

  it('resets form state back to initial spirit', () => {
    const { result } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0]));

    act(() => {
      result.current.update('distillery', 'Temporary Distillery Name');
    });
    expect(result.current.spirit.distillery).toBe('Temporary Distillery Name');

    act(() => {
      result.current.handleReset();
    });
    expect(result.current.spirit.distillery).toBe(MOCK_SPIRITS[0].distillery);
  });

  it('updates finishNotes free text input', () => {
    const { result } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0]));

    act(() => {
      result.current.update('finishNotes', 'Extremely long warming medicinal finish');
    });

    expect(result.current.spirit.finishNotes).toBe('Extremely long warming medicinal finish');
  });

  it('toggles Cask Strength, Added Colour, Chill Filtered, Added water, On the rocks, and With Chocolate options', () => {
    const { result } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0]));

    act(() => {
      result.current.update('isCaskStrength', true);
      result.current.update('addedColour', true);
      result.current.update('chillFiltered', false);
      result.current.update('addedWater', true);
      result.current.update('onTheRocks', false);
      result.current.update('withChocolate', true);
    });

    expect(result.current.spirit.isCaskStrength).toBe(true);
    expect(result.current.spirit.addedColour).toBe(true);
    expect(result.current.spirit.chillFiltered).toBe(false);
    expect(result.current.spirit.addedWater).toBe(true);
    expect(result.current.spirit.onTheRocks).toBe(false);
    expect(result.current.spirit.withChocolate).toBe(true);
  });

  it('updates bottle price and currency selection', () => {
    const { result } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0]));

    act(() => {
      result.current.update('price', 64.99);
      result.current.update('currency', '$');
    });

    expect(result.current.spirit.price).toBe(64.99);
    expect(result.current.spirit.currency).toBe('$');
  });

  it('executes delete action via confirmDelete and closes modal', () => {
    const onDeleteMock = vi.fn();
    const { result } = renderHook(() =>
      useTastingCardForm(MOCK_SPIRITS[0], undefined, onDeleteMock),
    );

    act(() => {
      result.current.setShowDeleteModal(true);
    });
    expect(result.current.showDeleteModal).toBe(true);

    act(() => {
      result.current.confirmDelete();
    });

    expect(result.current.showDeleteModal).toBe(false);
    expect(onDeleteMock).toHaveBeenCalledWith(MOCK_SPIRITS[0].id);
  });

  it('imports a spirit and safely preserves current card ID and journal ID', () => {
    const onSaveMock = vi.fn();
    const currentCard = MOCK_SPIRITS[0];
    const { result } = renderHook(() =>
      useTastingCardForm(currentCard, onSaveMock),
    );

    const importedForeignSpirit = {
      id: 'foreign-id-999',
      journalId: 'foreign-journal-888',
      spiritType: 'Bourbon',
      name: 'Pappy Van Winkle 15',
      distillery: 'Old Rip Van Winkle',
      region: 'Kentucky',
      abv: 53.5,
      dateTasted: '2026-08-16',
      rating100: 98,
      starRating: 5,
      colour: 'Deep Amber',
      finishNotes: 'Infinite rich oak and leather',
      flavorTags: ['Vanilla Oak', 'Caramel'],
      noseProfile: { fruity: 3, floral: 0, spicy: 6, cereal: 1, peaty: 0, sulphury: 0, feinty: 1, nutty: 4, woody: 8, winey: 2, chocolate: 4 },
      tasteProfile: { fruity: 4, floral: 0, spicy: 7, cereal: 1, peaty: 0, sulphury: 0, feinty: 1, nutty: 5, woody: 9, winey: 2, chocolate: 5 },
    };

    act(() => {
      result.current.importSpirit(importedForeignSpirit as never);
    });

    expect(result.current.spirit.name).toBe('Pappy Van Winkle 15');
    expect(result.current.spirit.distillery).toBe('Old Rip Van Winkle');
    expect(result.current.spirit.rating100).toBe(98);
    expect(result.current.spirit.id).toBe(currentCard.id);
    expect(result.current.spirit.journalId).toBe(currentCard.journalId);
    expect(onSaveMock).toHaveBeenCalled();
  });

  it('applies scan result in facts-only mode', () => {
    const { result } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0]));

    const scanResult: SpiritAnalysisResult = {
      name: 'Highland Park 18',
      distillery: 'Highland Park',
      region: 'Islands',
      spiritType: 'Single Malt Scotch',
      abv: 43,
      age: 18,
      volumeMl: 700,
      caskTypes: ['Oloroso Sherry Casks'],
      characteristics: ['Natural Colour'],
      colour: 'Deep Gold',
      glance: ['Oily'],
      barRole: ['Showcase'],
    };

    act(() => {
      result.current.applyScanResult(scanResult, 'bottle.jpg', 'facts-only');
    });

    expect(result.current.spirit.name).toBe('Highland Park 18');
    expect(result.current.spirit.distillery).toBe('Highland Park');
    expect(result.current.spirit.age).toBe(18);
    expect(result.current.spirit.caskNo).toBe('Oloroso Sherry Casks');
    expect(result.current.spirit.images).toContain('bottle.jpg');
    expect(result.current.spirit.thumbnailImage).toBe('bottle.jpg');
  });

  it('applies scan result in full mode with suggested flavor tags', () => {
    const { result } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0]));

    const scanResult: SpiritAnalysisResult = {
      name: 'Talisker 10',
      distillery: 'Talisker',
      region: 'Islands',
      spiritType: 'Single Malt Scotch',
      abv: 45.8,
      finishNotes: 'Peppery maritime finish',
      suggestedNoseTags: ['Maritime Sea Salt', 'Peat Smoke'],
      suggestedTasteTags: ['Black Pepper', 'Smoked Malt'],
    };

    act(() => {
      result.current.applyScanResult(scanResult, undefined, 'full');
    });

    expect(result.current.spirit.name).toBe('Talisker 10');
    expect(result.current.spirit.finishNotes).toBe('Peppery maritime finish');
    expect(result.current.spirit.noseFlavorTags).toContain('Maritime Sea Salt');
    expect(result.current.spirit.tasteFlavorTags).toContain('Black Pepper');
    expect(result.current.spirit.flavorTags).toContain('Black Pepper');
  });

  it('flushes pending changes on unmount', () => {
    const onSave = vi.fn();
    const { result, unmount } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0], onSave));

    act(() => {
      result.current.update('distillery', 'Unmount Test Distillery');
    });

    unmount();

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ distillery: 'Unmount Test Distillery' })
    );
  });
});
