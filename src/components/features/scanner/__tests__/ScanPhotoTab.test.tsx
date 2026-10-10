import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScanPhotoTab } from '../subcomponents/ScanPhotoTab';

describe('ScanPhotoTab', () => {
  it('renders camera and choose file buttons in German and English', () => {
    const onStartCamera = vi.fn();
    const { rerender } = render(
      <ScanPhotoTab language="DE" onFileSelect={vi.fn()} onStartCamera={onStartCamera} />
    );
    expect(screen.getByText('Kamera')).toBeDefined();
    expect(screen.getByText('Datei wählen')).toBeDefined();
    expect(screen.getByText(/Hinweis zur Etikett-Erkennung:/)).toBeDefined();

    fireEvent.click(screen.getByText('Kamera'));
    expect(onStartCamera).toHaveBeenCalledTimes(1);

    rerender(<ScanPhotoTab language="EN" onFileSelect={vi.fn()} onStartCamera={onStartCamera} />);
    expect(screen.getByText('Camera')).toBeDefined();
    expect(screen.getByText('Choose File')).toBeDefined();
    expect(screen.getByText(/Label Recognition Note:/)).toBeDefined();
  });

  it('renders active camera viewfinder with shutter and controls', () => {
    const videoRef = { current: document.createElement('video') };
    const onCapturePhoto = vi.fn();
    const onToggleFacing = vi.fn();
    const onStopCamera = vi.fn();

    render(
      <ScanPhotoTab
        language="DE"
        onFileSelect={vi.fn()}
        isCameraActive={true}
        videoRef={videoRef}
        onCapturePhoto={onCapturePhoto}
        onToggleCameraFacing={onToggleFacing}
        onStopCamera={onStopCamera}
      />
    );

    expect(screen.getByText('Etikett im Rahmen zentrieren')).toBeDefined();
    expect(screen.getByTestId('shutter-capture-btn')).toBeDefined();

    fireEvent.click(screen.getByTestId('shutter-capture-btn'));
    expect(onCapturePhoto).toHaveBeenCalledTimes(1);

    const switchBtn = screen.getByTitle('Kamera wechseln');
    fireEvent.click(switchBtn);
    expect(onToggleFacing).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByTitle('Kamera schließen');
    fireEvent.click(closeBtn);
    expect(onStopCamera).toHaveBeenCalledTimes(1);
  });

  it('triggers onFileSelect when a file is dropped', () => {
    const onFileSelect = vi.fn();
    render(<ScanPhotoTab language="DE" onFileSelect={onFileSelect} />);

    const dropzone = screen.getByText(/Oder Bild hierher ziehen/i).closest('div[class*="border-dashed"]');
    expect(dropzone).toBeDefined();

    // Test dragover & dragleave state styling
    fireEvent.dragOver(dropzone!);
    fireEvent.dragLeave(dropzone!);

    const file = new File(['dummy'], 'whisky.jpg', { type: 'image/jpeg' });
    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('triggers onFileSelect when a file is selected via input', () => {
    const onFileSelect = vi.fn();
    const { container } = render(<ScanPhotoTab language="EN" onFileSelect={onFileSelect} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDefined();

    const file = new File(['image-content'], 'ardbeg.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('triggers file input click when choose file button is clicked', () => {
    const { container } = render(<ScanPhotoTab language="EN" onFileSelect={vi.fn()} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');

    const chooseBtn = screen.getByText('Choose File');
    expect(chooseBtn).toBeDefined();
    fireEvent.click(chooseBtn);

    expect(clickSpy).toHaveBeenCalled();
  });
});
