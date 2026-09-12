import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JournalSortDropdown } from '../JournalSortDropdown';
import { LanguageProvider } from '@/context/LanguageContext';

describe('JournalSortDropdown Component', () => {
  it('renders trigger button with current sort option label', () => {
    render(
      <LanguageProvider>
        <JournalSortDropdown value="last_updated" onChange={vi.fn()} />
      </LanguageProvider>
    );

    expect(screen.getByRole('button', { name: /Sort|Sortieren/i })).toBeDefined();
    expect(screen.getByText(/Last Edited|Zuletzt bearbeitet/i)).toBeDefined();
  });

  it('opens floating menu on trigger click and displays all options', () => {
    render(
      <LanguageProvider>
        <JournalSortDropdown value="last_updated" onChange={vi.fn()} />
      </LanguageProvider>
    );

    const trigger = screen.getByRole('button', { name: /Sort|Sortieren/i });
    fireEvent.click(trigger);

    // Listbox should be visible
    expect(screen.getByRole('listbox')).toBeDefined();
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(5);
  });

  it('calls onChange with selected value and closes menu when an option is clicked', () => {
    const onChange = vi.fn();
    render(
      <LanguageProvider>
        <JournalSortDropdown value="last_updated" onChange={onChange} />
      </LanguageProvider>
    );

    const trigger = screen.getByRole('button', { name: /Sort|Sortieren/i });
    fireEvent.click(trigger);

    const ratingOption = screen.getByRole('option', { name: /Rating|Bewertung/i });
    fireEvent.click(ratingOption);

    expect(onChange).toHaveBeenCalledWith('rating');
    // Dropdown should be closed
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('closes dropdown when clicking outside or pressing Escape', () => {
    render(
      <LanguageProvider>
        <div data-testid="outside">Outside area</div>
        <JournalSortDropdown value="last_updated" onChange={vi.fn()} />
      </LanguageProvider>
    );

    const trigger = screen.getByRole('button', { name: /Sort|Sortieren/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeDefined();

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();

    // Open again and click outside
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeDefined();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
