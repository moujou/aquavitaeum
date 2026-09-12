import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageProvider } from '@/context/LanguageContext';
import { JournalCoverPicker } from '../JournalCoverPicker';

describe('JournalCoverPicker', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

  it('validates file size limit exceeded (>5MB)', () => {
    const onChange = vi.fn();
    const { container } = render(
      <LanguageProvider>
        <JournalCoverPicker onChange={onChange} />
      </LanguageProvider>
    );

    const input = container.querySelector('#journal-cover-file-input') as HTMLInputElement;
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'giant.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText(/giant\.png/i)).toBeDefined();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('triggers file input click when upload button is clicked', () => {
    const { container } = render(
      <LanguageProvider>
        <JournalCoverPicker onChange={vi.fn()} />
      </LanguageProvider>
    );

    const input = container.querySelector('#journal-cover-file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    const uploadBtn = screen.getByRole('button', { name: /Upload from Device|Vom Gerät hochladen/i });
    fireEvent.click(uploadBtn);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('compresses and passes valid image file to onChange', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <LanguageProvider>
        <JournalCoverPicker onChange={onChange} />
      </LanguageProvider>
    );

    // Mock canvas context
    const mockContext = {
      drawImage: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,compressed_image');

    // Mock Image
    const originalImage = global.Image;
    global.Image = class {
      width = 2000;
      height = 1000;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
    } as unknown as typeof Image;

    const input = container.querySelector('#journal-cover-file-input') as HTMLInputElement;
    const validFile = new File(['image-bytes'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('data:image/jpeg;base64,compressed_image');
    });

    global.Image = originalImage;
  });
});
