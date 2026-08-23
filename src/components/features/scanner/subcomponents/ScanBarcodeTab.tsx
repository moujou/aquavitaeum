'use client';

import React from 'react';
import {
  Barcode,
  Camera,
  Info,
  AlertCircle,
  SwitchCamera,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/i18n/translations';

interface ScanBarcodeTabProps {
  language: Language;
  barcodeQuery: string;
  onBarcodeChange: (digits: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isCameraActive: boolean;
  cameraError: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onToggleCameraFacing: () => void;
}

export function ScanBarcodeTab({
  language,
  barcodeQuery,
  onBarcodeChange,
  onSubmit,
  isCameraActive,
  cameraError,
  videoRef,
  onStartCamera,
  onStopCamera,
  onToggleCameraFacing,
}: ScanBarcodeTabProps) {
  if (isCameraActive) {
    return (
      <div className="flex flex-col gap-3.5 w-full animate-fade-in py-1">
        <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-black border-2 border-[var(--forest-green)] shadow-lg flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover"
          />

          {/* Aiming Reticle Frame with Soft Dimmed Vignette */}
          <div className="absolute inset-x-8 inset-y-8 sm:inset-x-16 sm:inset-y-10 border-2 border-dashed border-[var(--brass-accent)]/90 rounded-xl pointer-events-none flex flex-col justify-center items-center shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
            {/* Animated Laser Beam */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse" />
          </div>

          {/* Top Status Pill */}
          <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none">
            <span className="px-3.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-mono font-semibold flex items-center gap-2 border border-white/20 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {language === 'DE'
                ? 'Barcode im Zielrahmen zentrieren...'
                : 'Align barcode within target frame...'}
            </span>
          </div>

          {/* Switch Camera Button (Front/Back) */}
          <button
            type="button"
            onClick={onToggleCameraFacing}
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 border border-white/20 backdrop-blur-sm cursor-pointer transition-all shadow-xs"
            title={language === 'DE' ? 'Kamera wechseln' : 'Switch camera'}
          >
            <SwitchCamera size={18} />
          </button>

          {/* Bottom Close Camera Scanner Button */}
          <button
            type="button"
            onClick={onStopCamera}
            className="absolute bottom-3 inset-x-auto px-4 py-1.5 rounded-full bg-black/80 text-white hover:bg-black border border-white/25 text-xs font-semibold backdrop-blur-sm cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <X size={14} />
            <span>{language === 'DE' ? 'Kamera schließen' : 'Close camera'}</span>
          </button>
        </div>

        {/* Live Camera Tip */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-xs text-[var(--sepia-text)] shadow-xs">
          <span className="text-amber-500 font-bold shrink-0">💡 {language === 'DE' ? 'Tipp:' : 'Tip:'}</span>
          <span>
            {language === 'DE'
              ? 'Halte den Flaschen-Barcode parallel zur Kamera. Bei ausreichendem Licht wird der Code automatisch erfasst.'
              : 'Hold the barcode level with the camera. In sufficient lighting, it will be detected automatically.'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col justify-between flex-1 gap-4 w-full py-1 animate-fade-in">
      <div className="flex flex-col gap-3">
        <label
          htmlFor="spirit-barcode-query"
          className="font-display text-xs sm:text-sm font-bold text-[var(--sepia-text)]"
        >
          {language === 'DE' ? 'EAN / UPC Barcode-Nummer' : 'EAN / UPC Barcode'}
        </label>

        {/* Search Bar + Clover Green Camera Scanner Button on the right */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Numeric Search Bar */}
          <div className="relative flex-1 flex items-center bg-[var(--parchment-bg)] border-[1.5px] border-[var(--forest-green)]/45 focus-within:border-[var(--forest-green)] rounded-full px-4 sm:px-5 h-12 transition-all duration-200 shadow-xs focus-within:shadow-[0_2px_14px_rgba(46,148,93,0.20)]">
            <Barcode size={20} className="text-[var(--forest-green)] mr-2.5 sm:mr-3 flex-shrink-0" />
            <input
              id="spirit-barcode-query"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={14}
              value={barcodeQuery}
              onChange={(e) => onBarcodeChange(e.target.value.replace(/\D/g, ''))}
              placeholder={
                language === 'DE'
                  ? 'z. B. 5010493015401 (EAN-13)...'
                  : 'e.g. 5010493015401 (EAN-13)...'
              }
              className="w-full bg-transparent text-sm sm:text-base font-mono text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/50 focus:outline-none tracking-wider min-w-0"
              autoFocus
            />
            <button
              type="submit"
              data-testid="spirit-barcode-submit-btn"
              disabled={barcodeQuery.trim().length < 8}
              className="ml-1 sm:ml-2 px-3.5 sm:px-4 py-2 rounded-full bg-[var(--wood-dark)] text-white hover:bg-[var(--wood-accent)] transition-all font-semibold text-xs sm:text-sm shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {language === 'DE' ? 'Erkennen' : 'Scan'}
            </button>
          </div>

          {/* Compact Clover Green Live Camera Button */}
          <button
            type="button"
            onClick={onStartCamera}
            className="h-12 px-3.5 sm:px-4 rounded-full bg-[var(--forest-green)] text-white hover:bg-[#1b5e39] font-display font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-[0_3px_12px_rgba(35,115,71,0.28)] hover:shadow-[0_5px_16px_rgba(35,115,71,0.38)] hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/30 flex items-center gap-1.5 sm:gap-2 shrink-0 select-none"
            title={language === 'DE' ? 'Live-Kamera Barcode-Scanner starten' : 'Start Live Camera Scanner'}
            aria-label={language === 'DE' ? 'Live-Kamera Barcode-Scanner starten' : 'Start Live Camera Scanner'}
          >
            <Camera size={17} className="text-white shrink-0" />
            <span className="hidden sm:inline-block">
              {language === 'DE' ? 'Kamera' : 'Camera'}
            </span>
          </button>
        </div>

        {cameraError && (
          <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg flex items-center gap-2 animate-fade-in">
            <AlertCircle size={14} className="shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Digit Counter */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--sepia-muted)] px-1">
          <span>
            {language === 'DE'
              ? 'Standard-Formate: 8, 12, 13 oder 14 Ziffern'
              : 'Standard formats: 8, 12, 13 or 14 digits'}
          </span>
          <span
            className={cn(
              'font-bold px-2 py-0.5 rounded-md transition-colors',
              [8, 12, 13, 14].includes(barcodeQuery.length)
                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10'
                : barcodeQuery.length > 0
                ? 'text-amber-700 dark:text-amber-300 bg-amber-500/10'
                : ''
            )}
          >
            {barcodeQuery.length} / 13 {language === 'DE' ? 'Ziffern' : 'Digits'}
          </span>
        </div>
      </div>

      {/* Informative Accuracy Notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--foreground)] text-xs font-body leading-relaxed shadow-xs">
        <Info size={16} className="text-[var(--forest-green)] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[var(--foreground)]">
            {language === 'DE' ? 'Hinweis zur Barcode-Genauigkeit:' : 'Barcode Accuracy Note:'}
          </span>{' '}
          <span className="text-[var(--sepia-text)]">
            {language === 'DE'
              ? 'Barcodes eignen sich optimal für weltweite Standard-Originalabfüllungen (z. B. Lagavulin 16, Laphroaig 10, Glenfiddich 12). Bei seltenen Einzelfässern oder unabhängigen Abfüllern (z. B. Signatory Vintage) empfehlen wir die Textsuche nach Namen oder ein Foto des Etiketts.'
              : 'Barcodes work best for global standard bottlings (e.g. Lagavulin 16, Laphroaig 10). For rare single casks or independent bottlers, we recommend searching by name or uploading a label photo.'}
          </span>
        </div>
      </div>
    </form>
  );
}
