'use client';

import React, { useRef, useState } from 'react';
import { Camera, Upload, SwitchCamera, X, AlertCircle, Info } from 'lucide-react';
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
  isCameraActive = false,
  cameraError = null,
  videoRef,
  onStartCamera,
  onStopCamera,
  onToggleCameraFacing,
  onCapturePhoto,
}: ScanPhotoTabProps) {
  const [isDragOver, setIsDragOver] = useState(false);
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
  };

  if (isCameraActive && videoRef) {
    return (
      <div className="flex flex-col gap-3.5 w-full animate-fade-in py-1">
        <div className="relative w-full h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden bg-black border-2 border-[var(--forest-green)] shadow-lg flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover"
          />

          {/* Bottle Aiming Reticle Frame */}
          <div className="absolute inset-x-10 inset-y-6 sm:inset-x-20 sm:inset-y-8 border-2 border-dashed border-[var(--brass-accent)]/90 rounded-2xl pointer-events-none flex flex-col justify-between items-center p-3 shadow-[0_0_0_9999px_rgba(0,0,0,0.40)]">
            <span className="text-[11px] font-mono font-bold text-amber-200 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
              {language === 'DE' ? 'Flaschen-Etikett' : 'Bottle Label'}
            </span>
            <div className="w-12 h-0.5 bg-amber-300/60 rounded-full" />
          </div>

          {/* Top Status Pill */}
          <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none">
            <span className="px-3.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-mono font-semibold flex items-center gap-2 border border-white/20 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {language === 'DE'
                ? 'Etikett im Rahmen zentrieren'
                : 'Center label in frame'}
            </span>
          </div>

          {/* Switch Camera Button (Front/Back) */}
          {onToggleCameraFacing && (
            <button
              type="button"
              onClick={onToggleCameraFacing}
              className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 border border-white/20 backdrop-blur-sm cursor-pointer transition-all shadow-xs active:scale-95"
              title={language === 'DE' ? 'Kamera wechseln' : 'Switch camera'}
              aria-label={language === 'DE' ? 'Kamera wechseln' : 'Switch camera'}
            >
              <SwitchCamera size={18} />
            </button>
          )}

          {/* Bottom Action Controls */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center items-center gap-2.5">
            {onCapturePhoto && (
              <button
                type="button"
                onClick={onCapturePhoto}
                data-testid="shutter-capture-btn"
                className="h-11 px-5 rounded-full bg-[var(--forest-green)] text-white hover:bg-[var(--fab-bg-hover)] font-display font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg active:scale-95 border border-emerald-400/30 flex items-center gap-2 select-none"
              >
                <Camera size={17} className="text-white shrink-0" />
                <span>{language === 'DE' ? 'Foto aufnehmen' : 'Capture Photo'}</span>
              </button>
            )}

            {onStopCamera && (
              <button
                type="button"
                onClick={onStopCamera}
                className="h-11 px-4 rounded-full bg-black/75 text-white hover:bg-black border border-white/25 text-xs font-semibold backdrop-blur-sm cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-1.5 select-none"
                title={language === 'DE' ? 'Kamera schließen' : 'Close camera'}
                aria-label={language === 'DE' ? 'Kamera schließen' : 'Close camera'}
              >
                <X size={15} />
                <span>{language === 'DE' ? 'Kamera schließen' : 'Close camera'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Camera Tip */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--foreground)] text-xs font-body leading-relaxed shadow-xs">
          <Info size={16} className="text-[var(--forest-green)] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[var(--foreground)]">
              {language === 'DE' ? 'Kamera-Tipp:' : 'Camera Tip:'}
            </span>{' '}
            <span className="text-[var(--sepia-text)]">
              {language === 'DE'
                ? 'Halte die Flasche ruhig vor die Kamera. Ein scharfes Bild aller Texte liefert beste Ergebnisse.'
                : 'Hold the bottle steady in front of the camera. A clear, well-lit photo yields the best results.'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between flex-1 gap-4 w-full animate-fade-in py-1">
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

        {/* Compact, balanced capture area with side-by-side action buttons */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 sm:p-7 text-center gap-4 transition-all',
            isDragOver
              ? 'border-[var(--forest-green)] bg-[var(--forest-green)]/10 scale-[0.99]'
              : 'border-[var(--parchment-border)] bg-[var(--pub-bg-alt)]/30 hover:border-[var(--forest-green)]/70'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleInputChange}
            className="hidden"
          />

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

          {/* Compact Action Buttons Side-by-Side */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {onStartCamera && (
              <button
                type="button"
                onClick={onStartCamera}
                data-testid="start-photo-camera-btn"
                className="h-11 px-5 rounded-full bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] hover:border-[var(--forest-green)] hover:bg-black/5 text-[var(--sepia-text)] font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98] flex items-center gap-2 select-none"
                title={language === 'DE' ? 'Kamera' : 'Camera'}
                aria-label={language === 'DE' ? 'Kamera' : 'Camera'}
              >
                <Camera size={17} className="text-[var(--forest-green)] shrink-0" />
                <span>{language === 'DE' ? 'Kamera' : 'Camera'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-11 px-5 rounded-full bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] hover:border-[var(--forest-green)] hover:bg-black/5 text-[var(--sepia-text)] font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98] flex items-center gap-2 select-none"
            >
              <Upload size={17} className="text-[var(--forest-green)] shrink-0" />
              <span>{language === 'DE' ? 'Datei wählen' : 'Choose File'}</span>
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
