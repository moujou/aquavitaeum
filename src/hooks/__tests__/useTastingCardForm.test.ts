import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTastingCardForm } from '../useTastingCardForm';
import { MOCK_SPIRITS } from '@/data/mock-spirits';

describe('useTastingCardForm Hook', () => {
  it('initializes with initial spirit and default state', () => {
    const testSpirit = MOCK_SPIRITS[0];
    const { result } = renderHook(() => useTastingCardForm(testSpirit));

    expect(result.current.spirit.id).toBe(testSpirit.id);
    expect(result.current.displayName).toBe(testSpirit.name);
    expect(result.current.saved).toBe(false);
    expect(result.current.showDeleteModal).toBe(false);
  });

  it('updates a field and marks form as unsaved', () => {
    const { result } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0]));

    act(() => {
      result.current.update('distillery', 'New Distillery');
    });

    expect(result.current.spirit.distillery).toBe('New Distillery');
    expect(result.current.saved).toBe(false);
  });

  it('updates nose profile dimension and marks form as unsaved', () => {
    const { result } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0]));

    act(() => {
      result.current.updateProfile('noseProfile', 'peaty', 9);
    });

    expect(result.current.spirit.noseProfile.peaty).toBe(9);
  });

  it('saves note and calls onSave callback with cleaned tags & calculated star rating', () => {
    const onSaveMock = vi.fn();
    const { result } = renderHook(() => useTastingCardForm(MOCK_SPIRITS[0], onSaveMock));

    act(() => {
      result.current.handleSave();
    });

    expect(result.current.saved).toBe(true);
    expect(onSaveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: MOCK_SPIRITS[0].id,
        starRating: 4.5, // 92 / 100 * 5 rounded
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

  it('executes delete action via confirmDelete', () => {
    const onDeleteMock = vi.fn();
    const { result } = renderHook(() =>
      useTastingCardForm(MOCK_SPIRITS[0], undefined, onDeleteMock),
    );

    act(() => {
      result.current.confirmDelete();
    });

    expect(onDeleteMock).toHaveBeenCalledWith(MOCK_SPIRITS[0].id);
  });
});
