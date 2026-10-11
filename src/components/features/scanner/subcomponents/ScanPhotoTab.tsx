'use client';

import React, { useRef, useState } from 'react';
import { Camera, Upload, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/i18n/translations';

interface ScanPhotoTabProps {
  language: Language;
  onFileSelect: (file: File) => void;
  isCameraActive?: boolean;
  cameraError?: string | null;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onStartCamera?: () => void;
  onStopCamera?: () => void;
  onToggleCameraFacing?: () => void;
  onCapturePhoto?: () => void;
}

export function ScanPhotoTab({
  language,
  onFileSelect,
  cameraError = null,
  onStartCamera,
}: ScanPhotoTabProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  };

  const handleCameraClick = () => {
    onStartCamera?.();
    cameraInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col justify-between flex-1 gap-4 w-full animate-fade-in py-1">
      {/* Hidden native camera capture input (Switches to phone's native camera app) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
        id="scan-photo-camera"
      />

      {/* Hidden native file/gallery input (Opens phone's photo library/storage) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        onChange={handleInputChange}
        className="hidden"
        id="scan-photo-upload"
      />

      <div className="flex flex-col gap-3">
        <label className="font-display text-xs sm:text-sm font-bold text-[var(--sepia-text)]">
          {language === 'DE' ? 'Flaschen-Etikett erfassen' : 'Capture Bottle Label'}
        </label>

        {cameraError && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/20 border border-red-800/40 text-red-900 dark:text-red-300 text-xs">
            <AlertCircle size={16} className="text-red-700 shrink-0 mt-0.5" />
            <p>{cameraError}</p>
          </div>
        )}

        {/* Upload dropzone identical in interaction to SpiritPhotoCarousel */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 sm:p-8 text-center gap-4 transition-all',
            isDragOver
              ? 'border-[var(--forest-green)] bg-[var(--forest-green)]/10 scale-[0.99]'
              : 'border-[var(--parchment-border)] bg-[var(--pub-bg-alt)]/30 hover:border-[var(--forest-green)]/70'
          )}
        >
          <div className="w-14 h-14 rounded-full bg-[var(--forest-green)]/10 flex items-center justify-center text-[var(--forest-green)] shadow-xs">
            <Camera size={28} />
          </div>

          <div className="flex flex-col items-center gap-1">
            <p className="font-display text-xs sm:text-sm font-bold text-[var(--foreground)]">
              {language === 'DE'
                ? 'Foto aufnehmen oder Datei auswählen'
                : 'Take photo or choose file'}
            </p>
            <p className="font-body text-[11px] sm:text-xs text-[var(--sepia-muted)]">
              {language === 'DE'
                ? 'Erkennt Destillerie, Abfüllung, Fassnummern & Details'
                : 'Recognizes distillery, bottling, cask numbers & details'}
            </p>
          </div>

          {/* Action Buttons: Exact same styling and behavior as SpiritPhotoCarousel */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleCameraClick}
              data-testid="start-photo-camera-btn"
              className={cn(
                'flex items-center gap-2 px-4.5 py-2.5 rounded-full border border-[var(--parchment-border)]',
                'bg-[var(--pub-bg-panel)] text-[var(--sepia-text)] text-xs sm:text-sm font-body font-medium',
                'hover:bg-[var(--pub-bg-alt)] transition-all cursor-pointer shadow-xs active:scale-95'
              )}
              title={language === 'DE' ? 'Kamera' : 'Camera'}
              aria-label={language === 'DE' ? 'Kamera' : 'Camera'}
            >
              <Camera size={16} className="text-[var(--forest-green)]" />
              <span>{language === 'DE' ? 'Kamera' : 'Camera'}</span>
            </button>

            <button
              type="button"
              onClick={handleFileClick}
              className={cn(
                'flex items-center gap-2 px-4.5 py-2.5 rounded-full border border-[var(--parchment-border)]',
                'bg-[var(--pub-bg-panel)] text-[var(--sepia-text)] text-xs sm:text-sm font-body font-medium',
                'hover:bg-[var(--pub-bg-alt)] transition-all cursor-pointer shadow-xs active:scale-95'
              )}
              title={language === 'DE' ? 'Foto hochladen' : 'Upload photo'}
              aria-label={language === 'DE' ? 'Foto hochladen' : 'Upload photo'}
            >
              <Upload size={16} className="text-[var(--forest-green)]" />
              <span>{language === 'DE' ? 'Foto hochladen' : 'Upload photo'}</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-[var(--sepia-muted)]">
            {language === 'DE'
              ? 'Oder Bild hierher ziehen (JPEG, PNG, WebP)'
              : 'Or drag image here (JPEG, PNG, WebP)'}
          </span>
        </div>
      </div>

      {/* Accuracy Notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--foreground)] text-xs font-body leading-relaxed shadow-xs">
        <Info size={16} className="text-[var(--forest-green)] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[var(--foreground)]">
            {language === 'DE' ? 'Hinweis zur Etikett-Erkennung:' : 'Label Recognition Note:'}
          </span>{' '}
          <span className="text-[var(--sepia-text)]">
            {language === 'DE'
              ? 'Höchste Genauigkeit: Liest Brennerei, Fassnummern, Einzelfass-Details, Alter und % vol direkt vom Etikett ab.'
              : 'Highest accuracy: Directly reads distillery, cask numbers, single cask details, age, and ABV from the label.'}
          </span>
        </div>
      </div>
    </div>
  );
}
