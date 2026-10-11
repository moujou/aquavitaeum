'use client';

import React, { useRef } from 'react';
import {
  Barcode,
  Camera,
  Upload,
  Info,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/i18n/translations';

interface ScanBarcodeTabProps {
  language: Language;
  barcodeQuery: string;
  onBarcodeChange: (digits: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onFileSelect?: (file: File) => void;
  isCameraActive?: boolean;
  cameraError?: string | null;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onStartCamera?: () => void;
  onStopCamera?: () => void;
  onToggleCameraFacing?: () => void;
}

export function ScanBarcodeTab({
  language,
  barcodeQuery,
  onBarcodeChange,
  onSubmit,
  onFileSelect,
  cameraError = null,
  onStartCamera,
}: ScanBarcodeTabProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) onFileSelect(file);
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
    <form onSubmit={onSubmit} className="flex flex-col justify-between flex-1 gap-4 w-full py-1 animate-fade-in">
      {/* Hidden native camera capture input (Switches to phone's native camera app) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
        id="scan-barcode-camera"
      />

      {/* Hidden native file/gallery input (Opens phone's photo library/storage) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        onChange={handleInputChange}
        className="hidden"
        id="scan-barcode-upload"
      />

      <div className="flex flex-col gap-3">
        <label
          htmlFor="spirit-barcode-query"
          className="font-display text-xs sm:text-sm font-bold text-[var(--sepia-text)]"
        >
          {language === 'DE' ? 'EAN / UPC Barcode-Nummer' : 'EAN / UPC Barcode'}
        </label>

        {/* 1. Numeric Search Bar */}
        <div className="relative flex items-center bg-[var(--parchment-bg)] border-[1.5px] border-[var(--forest-green)]/45 focus-within:border-[var(--forest-green)] rounded-full px-4 sm:px-5 h-12 transition-all duration-200 shadow-xs focus-within:shadow-[0_2px_14px_rgba(46,148,93,0.20)]">
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
            className="w-full bg-transparent text-sm sm:text-base font-mono text-[var(--foreground)] placeholder:text-[var(--placeholder-text)] focus:outline-none tracking-wider min-w-0"
            autoFocus
          />
          <button
            type="submit"
            data-testid="spirit-barcode-submit-btn"
            disabled={barcodeQuery.trim().length < 8}
            className="ml-1 sm:ml-2 px-3.5 sm:px-4 py-2 rounded-full bg-[var(--fab-bg)] text-[var(--fab-text)] hover:bg-[var(--fab-bg-hover)] border border-[var(--fab-border)] transition-all font-semibold text-xs sm:text-sm shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {language === 'DE' ? 'Erkennen' : 'Scan'}
          </button>
        </div>

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

        {/* 2. Visual Separator */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-[var(--parchment-border)]/60" />
          <span className="text-[11px] font-body text-[var(--sepia-muted)] uppercase tracking-wider">
            {language === 'DE' ? 'oder Barcode fotografieren' : 'or photograph barcode'}
          </span>
          <div className="flex-1 h-px bg-[var(--parchment-border)]/60" />
        </div>

        {/* 3. Action Buttons: Exact same styling and behavior as SpiritPhotoCarousel */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleCameraClick}
            data-testid="start-barcode-camera-btn"
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

        {cameraError && (
          <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg flex items-center gap-2 animate-fade-in">
            <AlertCircle size={14} className="shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}
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
