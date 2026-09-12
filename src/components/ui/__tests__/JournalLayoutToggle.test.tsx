import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JournalLayoutToggle } from '../JournalLayoutToggle';

describe('JournalLayoutToggle UI Component', () => {
  it('renders Manuscript View and Bookshelf View buttons', () => {
    render(<JournalLayoutToggle value="manuscript" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Manuscript View/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Bookshelf View/i })).toBeDefined();
  });

  it('triggers onChange with "bookshelf" when bookshelf button is clicked', () => {
    const onChange = vi.fn();
    render(<JournalLayoutToggle value="manuscript" onChange={onChange} />);

    const bookshelfBtn = screen.getByRole('button', { name: /Bookshelf View/i });
    fireEvent.click(bookshelfBtn);

    expect(onChange).toHaveBeenCalledWith('bookshelf');
  });

  it('triggers onChange with "manuscript" when manuscript button is clicked', () => {
    const onChange = vi.fn();
    render(<JournalLayoutToggle value="bookshelf" onChange={onChange} />);

    const manuscriptBtn = screen.getByRole('button', { name: /Manuscript View/i });
    fireEvent.click(manuscriptBtn);

    expect(onChange).toHaveBeenCalledWith('manuscript');
  });
});
