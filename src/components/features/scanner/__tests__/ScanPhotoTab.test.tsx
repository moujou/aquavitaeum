import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScanPhotoTab } from '../subcomponents/ScanPhotoTab';

describe('ScanPhotoTab', () => {
  it('renders photo upload instructions in German and English', () => {
    const { rerender } = render(
      <ScanPhotoTab language="DE" onFileSelect={vi.fn()} />
    );
    expect(screen.getByText('Flaschen- oder Etikettenfoto hochladen')).toBeDefined();
    expect(screen.getByText(/Tipp:/)).toBeDefined();

    rerender(<ScanPhotoTab language="EN" onFileSelect={vi.fn()} />);
    expect(screen.getByText('Upload Bottle or Label Photo')).toBeDefined();
    expect(screen.getByText(/Tip:/)).toBeDefined();
  });

  it('triggers onFileSelect when a file is dropped', () => {
    const onFileSelect = vi.fn();
    render(<ScanPhotoTab language="DE" onFileSelect={onFileSelect} />);

    const dropzone = screen.getByText('Flaschen- oder Etikettenfoto hochladen').closest('div[class*="border-dashed"]');
    expect(dropzone).toBeDefined();

    const file = new File(['dummy'], 'whisky.jpg', { type: 'image/jpeg' });
    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });
});
