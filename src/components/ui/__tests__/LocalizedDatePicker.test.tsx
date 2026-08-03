import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LocalizedDatePicker } from '../LocalizedDatePicker';

describe('LocalizedDatePicker UI Component', () => {
  it('renders date formatted as DD.MM.YYYY and format hint DD.MM.YYYY when language is DE', () => {
    const handleChange = vi.fn();
    render(
      <LocalizedDatePicker
        id="date-input-test"
        value="2026-08-04"
        onChange={handleChange}
        language="DE"
      />,
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('04.08.2026');
    expect(screen.getByText('DD.MM.YYYY')).toBeDefined();
  });

  it('renders date formatted as MM/DD/YYYY and format hint MM/DD/YYYY when language is EN', () => {
    const handleChange = vi.fn();
    render(
      <LocalizedDatePicker
        id="date-input-test"
        value="2026-08-04"
        onChange={handleChange}
        language="EN"
      />,
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('08/04/2026');
    expect(screen.getByText('MM/DD/YYYY')).toBeDefined();
  });

  it('calls onChange with ISO string when text input is typed in German format', () => {
    const handleChange = vi.fn();
    render(
      <LocalizedDatePicker
        id="date-input-test"
        value="2026-08-04"
        onChange={handleChange}
        language="DE"
      />,
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '15.09.2026' } });

    expect(handleChange).toHaveBeenCalledWith('2026-09-15');
  });

  it('calls onChange with ISO string when text input is typed in English format', () => {
    const handleChange = vi.fn();
    render(
      <LocalizedDatePicker
        id="date-input-test"
        value="2026-08-04"
        onChange={handleChange}
        language="EN"
      />,
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '09/15/2026' } });

    expect(handleChange).toHaveBeenCalledWith('2026-09-15');
  });
});
