/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useRef, useCallback, useState } from 'react';
import { Upload, X, Camera, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setErrorMessage(null);

      if (!file.type.startsWith('image/')) {
        setErrorMessage(`"${file.name}" ${t('invalidImageFile')}`);
        e.target.value = '';
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setErrorMessage(`"${file.name}" ${t('imageSizeLimitExceeded')}`);
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
    [onChange, t],
  );

  const handleRemove = useCallback(() => {
    setErrorMessage(null);
    onChange(undefined);
  }, [onChange]);

  return (
    <div className="flex flex-col gap-2.5">
      <label className="block text-xs font-body text-[var(--sepia-muted)] tracking-wider">
        {t('coverPhotoOptional')}
      </label>

      {/* Preview Area (Standard unified canvas preview) */}
      <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-[var(--parchment-border)] bg-[var(--pub-bg-alt)]/60 shrink-0 flex items-center justify-center p-2.5 shadow-xs">
        <div className="w-full h-full rounded-lg overflow-hidden border border-[var(--parchment-border)]/60 relative flex items-center justify-center bg-[var(--parchment-bg)]">
          {currentCoverImage ? (
            <>
              <img
                src={currentCoverImage}
                alt="Journal cover preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B1E14]/20 via-transparent to-black/5 pointer-events-none" />
              {/* Remove button */}
              <button
                type="button"
                onClick={handleRemove}
                title={t('removeCoverPhoto')}
                aria-label={t('removeCoverPhoto')}
                className="absolute top-2 right-2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--pub-bg-panel)]/95 text-[var(--sepia-text)] hover:text-red-500 border border-[var(--parchment-border)] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 text-[var(--sepia-muted)]/60 select-none p-4">
              <div className="w-10 h-10 rounded-full bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/30 flex items-center justify-center text-[var(--forest-green)]">
                <Camera size={18} strokeWidth={1.75} />
              </div>
              <span className="text-[11px] font-body text-center">{t('noCoverSelected')}</span>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-body">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

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
          className="flex items-center gap-2 min-h-[38px] px-3.5 rounded-lg bg-[var(--pub-bg-alt)] hover:bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--sepia-text)] hover:text-[var(--foreground)] text-xs sm:text-sm font-body transition-all active:scale-95 cursor-pointer shadow-2xs"
        >
          <Upload size={14} />
          <span>{t('uploadFromDevice')}</span>
        </button>
      </div>
    </div>
  );
}

