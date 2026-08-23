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
        isCameraActive={false}
        cameraError={null}
        videoRef={{ current: null }}
        onStartCamera={vi.fn()}
        onStopCamera={vi.fn()}
        onToggleCameraFacing={vi.fn()}
      />
    );

    expect(screen.getByText('EAN / UPC Barcode-Nummer')).toBeDefined();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '5010abc493' } });
    expect(onBarcodeChange).toHaveBeenCalledWith('5010493');
  });

  it('renders live camera controls when isCameraActive is true', () => {
    const onStopCamera = vi.fn();
    const onToggleCameraFacing = vi.fn();

    render(
      <ScanBarcodeTab
        language="DE"
        barcodeQuery=""
        onBarcodeChange={vi.fn()}
        onSubmit={vi.fn()}
        isCameraActive={true}
        cameraError={null}
        videoRef={{ current: null }}
        onStartCamera={vi.fn()}
        onStopCamera={onStopCamera}
        onToggleCameraFacing={onToggleCameraFacing}
      />
    );

    expect(screen.getByText('Barcode im Zielrahmen zentrieren...')).toBeDefined();
    const closeBtn = screen.getByText('Kamera schließen');
    fireEvent.click(closeBtn);
    expect(onStopCamera).toHaveBeenCalled();

    const switchBtn = screen.getByTitle('Kamera wechseln');
    fireEvent.click(switchBtn);
    expect(onToggleCameraFacing).toHaveBeenCalled();
  });
});
