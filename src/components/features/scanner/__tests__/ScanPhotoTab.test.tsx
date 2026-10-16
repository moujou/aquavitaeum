import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScanPhotoTab } from '../subcomponents/ScanPhotoTab';

describe('ScanPhotoTab', () => {
  it('renders camera and upload photo buttons in German and English matching SpiritPhotoCarousel', () => {
    const onStartCamera = vi.fn();
    const { rerender } = render(
      <ScanPhotoTab language="DE" onFileSelect={vi.fn()} onStartCamera={onStartCamera} />
    );
    expect(screen.getByText('Kamera')).toBeDefined();
    expect(screen.getByText('Foto hochladen')).toBeDefined();
    expect(screen.getByText(/Hinweis zur Etikett-Erkennung:/)).toBeDefined();

    fireEvent.click(screen.getByText('Kamera'));
    expect(onStartCamera).toHaveBeenCalledTimes(1);

    rerender(<ScanPhotoTab language="EN" onFileSelect={vi.fn()} onStartCamera={onStartCamera} />);
    expect(screen.getByText('Camera')).toBeDefined();
    expect(screen.getByText('Upload photo')).toBeDefined();
    expect(screen.getByText(/Label Recognition Note:/)).toBeDefined();
  });

  it('triggers camera input click when camera button is clicked', () => {
    const { container } = render(<ScanPhotoTab language="DE" onFileSelect={vi.fn()} />);

    const cameraInput = container.querySelector('#scan-photo-camera') as HTMLInputElement;
    expect(cameraInput).toBeDefined();
    expect(cameraInput.getAttribute('capture')).toBe('environment');

    const clickSpy = vi.spyOn(cameraInput, 'click');
    const cameraBtn = screen.getByText('Kamera');
    fireEvent.click(cameraBtn);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('triggers file input click when upload photo button is clicked', () => {
    const { container } = render(<ScanPhotoTab language="DE" onFileSelect={vi.fn()} />);

    const fileInput = container.querySelector('#scan-photo-upload') as HTMLInputElement;
    expect(fileInput).toBeDefined();

    const clickSpy = vi.spyOn(fileInput, 'click');
    const uploadBtn = screen.getByText('Foto hochladen');
    fireEvent.click(uploadBtn);

    expect(clickSpy).toHaveBeenCalled();
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

    const fileInput = container.querySelector('#scan-photo-upload') as HTMLInputElement;
    expect(fileInput).toBeDefined();

    const file = new File(['image-content'], 'ardbeg.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });
});
