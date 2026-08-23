import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LayoutToggle } from '../LayoutToggle';

describe('LayoutToggle UI Component', () => {
  it('renders both List View and Card View toggle buttons', () => {
    render(<LayoutToggle value="list" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'List View' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Card View' })).toBeDefined();
  });

  it('highlights the List View button when value is "list"', () => {
    render(<LayoutToggle value="list" onChange={vi.fn()} />);

    const listBtn = screen.getByRole('button', { name: 'List View' });
    const cardBtn = screen.getByRole('button', { name: 'Card View' });

    expect(listBtn.className).toContain('bg-[var(--wood-selection)]');
    expect(cardBtn.className).toContain('text-[var(--sepia-muted)]');
  });

  it('highlights the Card View button when value is "grid"', () => {
    render(<LayoutToggle value="grid" onChange={vi.fn()} />);

    const listBtn = screen.getByRole('button', { name: 'List View' });
    const cardBtn = screen.getByRole('button', { name: 'Card View' });

    expect(cardBtn.className).toContain('bg-[var(--wood-selection)]');
    expect(listBtn.className).toContain('text-[var(--sepia-muted)]');
  });

  it('calls onChange with "grid" when Card View button is clicked', () => {
    const handleChange = vi.fn();
    render(<LayoutToggle value="list" onChange={handleChange} />);

    const cardBtn = screen.getByRole('button', { name: 'Card View' });
    fireEvent.click(cardBtn);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('grid');
  });

  it('calls onChange with "list" when List View button is clicked', () => {
    const handleChange = vi.fn();
    render(<LayoutToggle value="grid" onChange={handleChange} />);

    const listBtn = screen.getByRole('button', { name: 'List View' });
    fireEvent.click(listBtn);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('list');
  });

  it('merges and applies custom className to container', () => {
    const { container } = render(
      <LayoutToggle value="list" onChange={vi.fn()} className="custom-test-class" />,
    );

    expect(container.firstChild).toBeDefined();
    expect((container.firstChild as HTMLElement).className).toContain('custom-test-class');
  });
});
