import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpotlightFlavorSearch } from '../SpotlightFlavorSearch';
import { LanguageProvider } from '@/context/LanguageContext';

describe('SpotlightFlavorSearch', () => {
  it('renders search input with sensory mode badge', () => {
    render(
      <LanguageProvider>
        <SpotlightFlavorSearch
          activeTags={[]}
          activeSensoryMode="nose"
          onToggleTag={vi.fn()}
          onRequestCustomFlavor={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByPlaceholderText(/Quick-add aroma|Aroma schnell hinzufügen/i)).toBeDefined();
  });

  it('filters descriptors on input change and selects tag on click', () => {
    const onToggleTag = vi.fn();
    render(
      <LanguageProvider>
        <SpotlightFlavorSearch
          activeTags={[]}
          activeSensoryMode="taste"
          onToggleTag={onToggleTag}
          onRequestCustomFlavor={vi.fn()}
        />
      </LanguageProvider>
    );

    const input = screen.getByPlaceholderText(/Quick-add aroma|Aroma schnell hinzufügen/i);
    fireEvent.change(input, { target: { value: 'Vanilla' } });

    expect(screen.getByText('Vanilla Oak')).toBeDefined();

    const tagItem = screen.getByText('Vanilla Oak');
    fireEvent.click(tagItem);

    expect(onToggleTag).toHaveBeenCalledWith('Vanilla Oak');
  });

  it('triggers onRequestCustomFlavor when custom plus button is clicked', () => {
    const onRequestCustomFlavor = vi.fn();
    render(
      <LanguageProvider>
        <SpotlightFlavorSearch
          activeTags={[]}
          activeSensoryMode="nose"
          onToggleTag={vi.fn()}
          onRequestCustomFlavor={onRequestCustomFlavor}
        />
      </LanguageProvider>
    );

    const input = screen.getByPlaceholderText(/Quick-add aroma|Aroma schnell hinzufügen/i);
    fireEvent.change(input, { target: { value: 'Exotic Passionfruit' } });

    const newBtn = screen.getByRole('button', { name: /Neu|New/i });
    expect(newBtn).toBeDefined();

    fireEvent.click(newBtn);
    expect(onRequestCustomFlavor).toHaveBeenCalledWith('Exotic Passionfruit');
  });
});
