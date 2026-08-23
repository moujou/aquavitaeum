import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LiquidColourSlider } from '../LiquidColourSlider';
import { SPIRIT_COLOURS } from '@/types/spirit.types';

describe('LiquidColourSlider', () => {
  it('renders slider with selected color in German and English', () => {
    const { rerender } = render(
      <LiquidColourSlider
        value="Amber"
        onChange={vi.fn()}
        language="DE"
      />
    );

    expect(screen.getByText('Bernstein')).toBeDefined();

    rerender(
      <LiquidColourSlider
        value="Amber"
        onChange={vi.fn()}
        language="EN"
      />
    );

    expect(screen.getByText('Amber')).toBeDefined();
  });

  it('supports keyboard navigation (ArrowLeft, ArrowRight, Home, End)', () => {
    const onChange = vi.fn();
    render(
      <LiquidColourSlider
        value="Amber"
        onChange={onChange}
        language="DE"
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider).toBeDefined();

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalled();

    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalled();

    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith(SPIRIT_COLOURS[0]);

    fireEvent.keyDown(slider, { key: 'End' });
    expect(onChange).toHaveBeenCalledWith(SPIRIT_COLOURS[SPIRIT_COLOURS.length - 1]);
  });
});
