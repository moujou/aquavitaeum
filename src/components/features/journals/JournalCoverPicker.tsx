/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useRef, useCallback } from 'react';
import { Upload, X, Camera } from 'lucide-react';

// ─── Image compression (same pipeline as usePhotoUpload) ─────────────────────
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function compressImage(
  dataUrl: string,
  maxWidth = 1200,
  maxHeight = 800,
  quality = 0.85,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
interface JournalCoverPickerProps {
  /** The currently-selected cover DataURL (or undefined if none). */
  currentCoverImage?: string;
  onChange: (img: string | undefined) => void;
}

export function JournalCoverPicker({
  currentCoverImage,
  onChange,
}: JournalCoverPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        window.alert(`"${file.name}" is not a valid image file.`);
        e.target.value = '';
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        window.alert(`"${file.name}" exceeds the 5 MB image size limit.`);
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          compressImage(reader.result).then((compressed) => {
            onChange(compressed);
          });
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [onChange],
  );

  const handleRemove = useCallback(() => {
    onChange(undefined);
  }, [onChange]);

  return (
    <div className="flex flex-col gap-3">
      <label className="block text-xs font-body text-[var(--sepia-muted)] tracking-wider">
        Cover Photo{' '}
        <span className="text-[var(--sepia-muted)]/60 font-normal">(optional)</span>
      </label>

      {/* Preview Area */}
      <div className="relative w-full h-36 rounded-lg overflow-hidden border border-[var(--parchment-border)] bg-gradient-to-br from-[var(--pub-bg-alt)] to-[var(--parchment-bg)] shrink-0">
        {currentCoverImage ? (
          <>
            <img
              src={currentCoverImage}
              alt="Journal cover preview"
              className="w-full h-full object-cover"
            />
            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemove}
              title="Remove cover photo"
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--pub-bg-panel)]/90 text-[var(--sepia-text)] hover:text-red-500 border border-[var(--parchment-border)] flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-[var(--sepia-muted)]/40 select-none">
            <Camera size={24} strokeWidth={1.5} />
            <span className="text-[11px] font-body">No cover selected</span>
          </div>
        )}
      </div>

      {/* Upload button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="journal-cover-file-input"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 h-8 px-3 rounded bg-[var(--pub-bg-alt)] hover:bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--sepia-text)] hover:text-[var(--foreground)] text-xs font-body transition-colors cursor-pointer"
        >
          <Upload size={13} />
          Upload from Device
        </button>
      </div>
    </div>
  );
}
