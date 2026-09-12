import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JournalColorPicker } from '../JournalColorPicker';
import { LanguageProvider } from '@/context/LanguageContext';

describe('JournalColorPicker Component', () => {
  it('renders all 8 vintage color swatches and allows picking a color', () => {
    const onChange = vi.fn();
    render(
      <LanguageProvider>
        <JournalColorPicker selectedColor="green" onChange={onChange} />
      </LanguageProvider>
    );

    // Expect 8 buttons for the 8 colors
    const colorButtons = screen.getAllByRole('button');
    expect(colorButtons.length).toBe(8);

    // Click on amber color swatch
    const amberButton = screen.getByTitle(/Pot-Still Bernstein|Pot-Still Amber/i);
    expect(amberButton).toBeDefined();
    fireEvent.click(amberButton);

    expect(onChange).toHaveBeenCalledWith('amber');
  });

  it('renders with custom selected color', () => {
    render(
      <LanguageProvider>
        <JournalColorPicker selectedColor="ruby" onChange={vi.fn()} />
      </LanguageProvider>
    );

    const rubyButton = screen.getByTitle(/Portwein Rubinrot|Port Wine Ruby/i);
    expect(rubyButton.className).toContain('ring-2');
  });
});
