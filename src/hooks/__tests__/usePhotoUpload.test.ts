/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhotoUpload } from '../usePhotoUpload';

// ─── FileReader / Canvas Mocks ────────────────────────────────────────────────
// JSDOM does not implement FileReader.readAsDataURL fully, and does not support
// HTMLCanvasElement.getContext('2d'). We mock both to test the upload pipeline.

class MockFileReader {
  onloadend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  result: string | null = null;

  readAsDataURL(file: File): void {
    // Simulate async completion
    setTimeout(() => {
      this.result = `data:${file.type};base64,MOCK_BASE64`;
      this.onloadend?.();
    }, 0);
  }
}

// compressImage creates a new Image() and waits for onload.
// We mock the global Image constructor to immediately fire onload with 100x100px.
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width = 100;
  height = 100;
  private _src = '';

  get src() { return this._src; }
  set src(value: string) {
    this._src = value;
    // Immediately fire onload on next microtask
    setTimeout(() => this.onload?.(), 0);
  }
}

// Minimal canvas context stub — getContext returns an object with drawImage
const mockContext = {
  drawImage: vi.fn(),
};

// ─── Shared setup ─────────────────────────────────────────────────────────────

beforeEach(() => {
  // Replace global FileReader with mock
  vi.stubGlobal('FileReader', MockFileReader);
  // Replace global Image constructor so compressImage resolves immediately
  vi.stubGlobal('Image', MockImage);

  // Stub canvas.getContext so compressImage resolves via canvas path
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as any);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,COMPRESSED');

  // Stub window.alert to prevent JSDOM noise
  vi.stubGlobal('alert', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFile(name: string, type: string, size: number): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

function makeChangeEvent(files: File[]): React.ChangeEvent<HTMLInputElement> {
  const input = document.createElement('input');
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  return { target: input } as any;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('usePhotoUpload Hook', () => {

  // ── File validation ────────────────────────────────────────────────────────

  it('shows alert and does NOT call onChange when a non-image file is uploaded', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => usePhotoUpload([], onChange));

    const badFile = makeFile('document.pdf', 'application/pdf', 1000);
    act(() => {
      result.current.handleFileUpload(makeChangeEvent([badFile]));
    });

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('is not a valid image file'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows alert and does NOT call onChange when file exceeds 5MB limit', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => usePhotoUpload([], onChange));

    const bigFile = makeFile('huge.jpg', 'image/jpeg', 6 * 1024 * 1024); // 6MB
    act(() => {
      result.current.handleFileUpload(makeChangeEvent([bigFile]));
    });

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('exceeds the 5MB image size limit'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does NOT call onChange when no files are selected (empty event)', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => usePhotoUpload([], onChange));

    const emptyEvent = { target: { files: null } } as any;
    act(() => {
      result.current.handleFileUpload(emptyEvent);
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  // ── Upload pipeline ────────────────────────────────────────────────────────

  it('calls onChange with compressed image DataURL when a valid image is uploaded', async () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => usePhotoUpload([], onChange));

    const imageFile = makeFile('photo.jpg', 'image/jpeg', 100 * 1024); // 100KB

    await act(async () => {
      result.current.handleFileUpload(makeChangeEvent([imageFile]));
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringMatching(/^data:image\/jpeg/)]),
    );
  });

  // ── Image navigation ──────────────────────────────────────────────────────

  it('nextImage wraps around from last index to 0', () => {
    const images = ['img1', 'img2', 'img3'];
    const { result } = renderHook(() => usePhotoUpload(images));

    // Manually set activeIndex to last image
    act(() => {
      result.current.setActiveIndex(2);
    });
    expect(result.current.activeIndex).toBe(2);

    act(() => {
      result.current.nextImage();
    });
    expect(result.current.activeIndex).toBe(0); // wraps
  });

  it('prevImage wraps around from index 0 to last index', () => {
    const images = ['img1', 'img2', 'img3'];
    const { result } = renderHook(() => usePhotoUpload(images));

    expect(result.current.activeIndex).toBe(0);

    act(() => {
      result.current.prevImage();
    });
    expect(result.current.activeIndex).toBe(2); // wraps to last
  });

  it('nextImage and prevImage do nothing when images array is empty', () => {
    const { result } = renderHook(() => usePhotoUpload([]));

    act(() => {
      result.current.nextImage();
      result.current.prevImage();
    });

    expect(result.current.activeIndex).toBe(0); // stays at 0
  });

  // ── Delete ─────────────────────────────────────────────────────────────────

  it('handleDelete removes the image at the given index and calls onChange', () => {
    const onChange = vi.fn();
    const images = ['img1', 'img2', 'img3'];
    const { result } = renderHook(() => usePhotoUpload(images, onChange));

    act(() => {
      result.current.handleDelete(1); // remove 'img2'
    });

    expect(onChange).toHaveBeenCalledWith(['img1', 'img3']);
  });

  it('handleDelete clamps activeIndex to 0 when deleting the last remaining image', () => {
    const onChange = vi.fn();
    const images = ['only-image'];
    const { result } = renderHook(() => usePhotoUpload(images, onChange));

    act(() => {
      result.current.handleDelete(0);
    });

    expect(onChange).toHaveBeenCalledWith([]);
    expect(result.current.activeIndex).toBe(0);
  });

  // ── triggerFileInput ───────────────────────────────────────────────────────

  it('triggerFileInput programmatically clicks the hidden file input ref', () => {
    const { result } = renderHook(() => usePhotoUpload([]));

    // Attach a mock click function to the ref
    const clickMock = vi.fn();
    Object.defineProperty(result.current.fileInputRef, 'current', {
      value: { click: clickMock },
      writable: true,
    });

    act(() => {
      result.current.triggerFileInput();
    });

    expect(clickMock).toHaveBeenCalledTimes(1);
  });
});
