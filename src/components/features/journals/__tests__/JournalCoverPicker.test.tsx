import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '@/context/LanguageContext';
import { JournalCoverPicker } from '../JournalCoverPicker';

describe('JournalCoverPicker', () => {
  it('renders placeholder when no cover image is provided', () => {
    render(
      <LanguageProvider>
        <JournalCoverPicker onChange={vi.fn()} />
      </LanguageProvider>
    );
    expect(screen.getByText(/Cover Photo/i)).toBeDefined();
    expect(screen.getByText(/No cover selected/i)).toBeDefined();
    expect(screen.getByText(/Upload from Device/i)).toBeDefined();
  });

  it('renders image preview and allows removing it', () => {
    const onChange = vi.fn();
    render(
      <LanguageProvider>
        <JournalCoverPicker
          currentCoverImage="data:image/jpeg;base64,dummycoverdata"
          onChange={onChange}
        />
      </LanguageProvider>
    );

    const img = screen.getByAltText('Journal cover preview');
    expect(img).toBeDefined();

    const removeBtn = screen.getByTitle(/Remove cover photo|Cover-Foto entfernen/i);
    expect(removeBtn).toBeDefined();
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('validates non-image files with inline alert banner', () => {
    const onChange = vi.fn();
    const { container } = render(
      <LanguageProvider>
        <JournalCoverPicker onChange={onChange} />
      </LanguageProvider>
    );

    const input = container.querySelector('#journal-cover-file-input') as HTMLInputElement;
    expect(input).toBeDefined();

    const invalidFile = new File(['hello'], 'document.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText(/document\.pdf/i)).toBeDefined();
    expect(onChange).not.toHaveBeenCalled();
  });
});
