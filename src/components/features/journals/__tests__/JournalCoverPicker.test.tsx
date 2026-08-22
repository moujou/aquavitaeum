import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JournalCoverPicker } from '../JournalCoverPicker';

describe('JournalCoverPicker', () => {
  it('renders placeholder when no cover image is provided', () => {
    render(<JournalCoverPicker onChange={vi.fn()} />);
    expect(screen.getByText('Cover Photo')).toBeDefined();
    expect(screen.getByText('No cover selected')).toBeDefined();
    expect(screen.getByText('Upload from Device')).toBeDefined();
  });

  it('renders image preview and allows removing it', () => {
    const onChange = vi.fn();
    render(
      <JournalCoverPicker
        currentCoverImage="data:image/jpeg;base64,dummycoverdata"
        onChange={onChange}
      />
    );

    const img = screen.getByAltText('Journal cover preview');
    expect(img).toBeDefined();

    const removeBtn = screen.getByTitle('Remove cover photo');
    expect(removeBtn).toBeDefined();
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('validates non-image files with alert', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const onChange = vi.fn();
    const { container } = render(<JournalCoverPicker onChange={onChange} />);

    const input = container.querySelector('#journal-cover-file-input') as HTMLInputElement;
    expect(input).toBeDefined();

    const invalidFile = new File(['hello'], 'document.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(alertSpy).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
