import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScanBarcodeTab } from '../subcomponents/ScanBarcodeTab';

describe('ScanBarcodeTab', () => {
  it('renders numeric barcode input and triggers onBarcodeChange with digits only', () => {
    const onBarcodeChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ScanBarcodeTab
        language="DE"
        barcodeQuery=""
        onBarcodeChange={onBarcodeChange}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText('EAN / UPC Barcode-Nummer')).toBeDefined();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '5010abc493' } });
    expect(onBarcodeChange).toHaveBeenCalledWith('5010493');
  });

  it('renders native camera and upload buttons and triggers file selection', () => {
    const onFileSelect = vi.fn();

    render(
      <ScanBarcodeTab
        language="DE"
        barcodeQuery=""
        onBarcodeChange={vi.fn()}
        onSubmit={vi.fn()}
        onFileSelect={onFileSelect}
      />
    );

    expect(screen.getByText('Kamera')).toBeDefined();
    expect(screen.getByText('Foto hochladen')).toBeDefined();

    const cameraInput = document.getElementById('scan-barcode-camera') as HTMLInputElement;
    const file = new File(['fake barcode'], 'barcode.jpg', { type: 'image/jpeg' });
    fireEvent.change(cameraInput, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });
});
