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
        />
      </LanguageProvider>
    );

    const input = screen.getByPlaceholderText(/Quick-add aroma|Aroma schnell hinzufügen/i);
    fireEvent.change(input, { target: { value: 'Vanilla' } });

    expect(screen.getByText(/Vanilla|Vanille/i)).toBeDefined();

    const tagItem = screen.getByText(/Vanilla|Vanille/i);
    fireEvent.click(tagItem);

    expect(onToggleTag).toHaveBeenCalled();
  });

  it('operates in pure search-and-pick mode without inline creation buttons', () => {
    const onToggleTag = vi.fn();
    render(
      <LanguageProvider>
        <SpotlightFlavorSearch
          activeTags={[]}
          activeSensoryMode="nose"
          onToggleTag={onToggleTag}
        />
      </LanguageProvider>
    );

    const input = screen.getByPlaceholderText(/Quick-add aroma|Aroma schnell hinzufügen/i);
    fireEvent.change(input, { target: { value: 'Vanilla' } });

    // No "+ New" / "+ Neu" creation button inside the search field
    expect(screen.queryByRole('button', { name: /Neu|New/i })).toBeNull();

    // Pressing Enter selects the highlighted descriptor
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onToggleTag).toHaveBeenCalled();
  });
});
