'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/context/LanguageContext';
import {
  X,
  Sparkles,
  Camera,
  Search,
  Barcode,
  RefreshCw,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import {
  SpiritAnalysisResult,
  analyzeSpiritFromText,
  analyzeSpiritFromImage,
} from '@/services/ai-assistant-service';
import { cn } from '@/lib/utils';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { ScanPhotoTab } from './subcomponents/ScanPhotoTab';
import { ScanSearchTab } from './subcomponents/ScanSearchTab';
import { ScanBarcodeTab } from './subcomponents/ScanBarcodeTab';
import { ScanResultPreview, SpiritApplyMode } from './subcomponents/ScanResultPreview';

export type { SpiritApplyMode } from './subcomponents/ScanResultPreview';

interface BarcodeDetectorInstance {
  detect(image: ImageBitmapSource): Promise<Array<{ rawValue?: string }>>;
}

export interface SpiritScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (result: SpiritAnalysisResult, uploadedImage?: string, mode?: SpiritApplyMode) => void;
  initialTab?: 'photo' | 'text' | 'barcode';
}

export function SpiritScanModal({
  isOpen,
  onClose,
  onApply,
  initialTab = 'photo',
}: SpiritScanModalProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'photo' | 'text' | 'barcode'>(initialTab);
  const [textQuery, setTextQuery] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SpiritAnalysisResult | null>(null);
  const [applyMode, setApplyMode] = useState<SpiritApplyMode>('facts-only');

  // Live Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | number | null>(null);

  const stopCameraScan = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleTabChange = (tab: 'photo' | 'text' | 'barcode') => {
    if (tab !== 'barcode') {
      stopCameraScan();
    }
    setActiveTab(tab);
  };

  const handleReset = useCallback(() => {
    stopCameraScan();
    setAnalysisResult(null);
    setSelectedImage(null);
    setTextQuery('');
    setBarcodeQuery('');
    setError(null);
    setCameraError(null);
    setIsLoading(false);
  }, [stopCameraScan]);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  useLockBodyScroll(isOpen, handleClose);

  const runBarcodeAnalysis = async (digits: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeSpiritFromText(digits, {
        language: language as 'DE' | 'EN',
        includeTastingNotes: true,
      });
      setAnalysisResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        language === 'DE'
          ? `Analyse fehlgeschlagen: ${msg}`
          : `Analysis failed: ${msg}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startCameraScan = async (targetFacing: 'environment' | 'user' = cameraFacingMode) => {
    stopCameraScan();
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        language === 'DE'
          ? 'Kamera auf diesem Gerät oder Browser nicht verfügbar.'
          : 'Camera is not available on this device or browser.'
      );
      return;
    }

    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Check if native BarcodeDetector is available
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        const BarcodeDetectorConstructor = (
          window as unknown as {
            BarcodeDetector: new (options?: { formats: string[] }) => BarcodeDetectorInstance;
          }
        ).BarcodeDetector;
        const detector = new BarcodeDetectorConstructor({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
        });

        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const raw = barcodes[0].rawValue || '';
              const clean = raw.replace(/\D/g, '').trim();
              if (clean.length >= 8) {
                // Success!
                stopCameraScan();
                setBarcodeQuery(clean);
                await runBarcodeAnalysis(clean);
              }
            }
          } catch {
            // Ignore frame error during detection
          }
        }, 250);
      }
    } catch (err: unknown) {
      stopCameraScan();
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(
        language === 'DE'
          ? `Kamera konnte nicht gestartet werden: ${msg}`
          : `Could not start camera: ${msg}`
      );
    }
  };

  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    await startCameraScan(nextFacing);
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(
        language === 'DE'
          ? 'Bitte wähle eine gültige Bilddatei (JPEG, PNG, WebP) aus.'
          : 'Please select a valid image file (JPEG, PNG, WebP).'
      );
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      await runImageAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  const runImageAnalysis = async (base64: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeSpiritFromImage(base64, {
        language: language as 'DE' | 'EN',
        includeTastingNotes: true,
      });
      setAnalysisResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        language === 'DE'
          ? `Analyse fehlgeschlagen: ${msg}`
          : `Analysis failed: ${msg}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeSpiritFromText(textQuery.trim(), {
        language: language as 'DE' | 'EN',
        includeTastingNotes: true,
      });
      setAnalysisResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        language === 'DE'
          ? `Analyse fehlgeschlagen: ${msg}`
          : `Analysis failed: ${msg}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDigits = barcodeQuery.replace(/\D/g, '').trim();
    if (!cleanDigits) return;

    await runBarcodeAnalysis(cleanDigits);
  };

  const handleApply = () => {
    if (!analysisResult) return;
    onApply(analysisResult, selectedImage || undefined, applyMode);
    handleClose();
  };

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spirit-scan-modal-title"
      className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl max-h-[94dvh] sm:max-h-[90dvh] sm:min-h-[500px] bg-[var(--parchment-bg)] border border-[var(--parchment-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Flavor-Compass-Harmonized Top Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-[var(--wood-dark)] to-[var(--wood-selection)] text-white border-b border-black/10 shadow-sm shrink-0 gap-3">
          {/* Left: Branding & Title */}
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <Sparkles className="w-6 h-6 text-amber-200 shrink-0" />
            <h2
              id="spirit-scan-modal-title"
              className="font-display font-bold text-base sm:text-xl tracking-wide text-white drop-shadow-xs truncate"
            >
              {language === 'DE' ? 'Cask & Spirit Assistent' : 'Cask & Spirit Assistant'}
            </h2>
          </div>

          {/* Right: Close (X) Button (Identical to Flavor Compass) */}
          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 rounded-xl text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer shadow-xs flex items-center justify-center active:scale-95 shrink-0"
            title={language === 'DE' ? 'Schließen' : 'Close'}
            aria-label={language === 'DE' ? 'Schließen' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Sub-Bar / 3-Tab Switcher (Styled with Parchment & Forest Green) ── */}
        {!isLoading && !analysisResult && (
          <div className="px-5 sm:px-8 py-3.5 bg-[var(--parchment-bg-alt)]/60 border-b border-[var(--parchment-border)]/60 flex items-center shrink-0">
            <div className="grid grid-cols-3 gap-2 w-full max-w-2xl mx-auto p-1 rounded-xl bg-black/5 border border-[var(--parchment-border)]/40">
              <button
                type="button"
                onClick={() => handleTabChange('photo')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-display font-bold uppercase tracking-wider transition-all cursor-pointer truncate',
                  activeTab === 'photo'
                    ? 'bg-[var(--wood-dark)] text-white shadow-xs'
                    : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
                )}
              >
                <Camera size={16} className={activeTab === 'photo' ? 'text-amber-200 shrink-0' : 'shrink-0'} />
                <span className="truncate">{language === 'DE' ? 'Etikett / Foto' : 'Bottle / Photo'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('text')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-display font-bold uppercase tracking-wider transition-all cursor-pointer truncate',
                  activeTab === 'text'
                    ? 'bg-[var(--wood-dark)] text-white shadow-xs'
                    : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
                )}
              >
                <Search size={16} className={activeTab === 'text' ? 'text-amber-200 shrink-0' : 'shrink-0'} />
                <span className="truncate">{language === 'DE' ? 'Name eingeben' : 'Search Name'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('barcode')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-display font-bold uppercase tracking-wider transition-all cursor-pointer truncate',
                  activeTab === 'barcode'
                    ? 'bg-[var(--wood-dark)] text-white shadow-xs'
                    : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
                )}
              >
                <Barcode size={16} className={activeTab === 'barcode' ? 'text-amber-200 shrink-0' : 'shrink-0'} />
                <span className="truncate">{language === 'DE' ? 'EAN-Barcode' : 'EAN Barcode'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Modal Body ── */}
        <div className="p-4 sm:p-7 md:p-8 flex flex-col justify-between gap-6 overflow-y-auto flex-1">
          {/* If Loading: Atmospheric Master Blender Animation */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-5 my-auto animate-fade-in">
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-[var(--forest-green)]/30 border-t-[var(--forest-green)] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-[var(--forest-green)]">
                  <WhiskyLogo size={40} className="animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 max-w-md">
                <p className="font-display text-lg font-bold text-[var(--foreground)] tracking-wide">
                  {language === 'DE'
                    ? 'Master Blender analysiert die Abfüllung...'
                    : 'Master Blender analyzing bottling...'}
                </p>
                <p className="font-body text-xs sm:text-sm text-[var(--sepia-muted)] leading-relaxed">
                  {language === 'DE'
                    ? 'Der Cask & Spirit Assistent ermittelt Destillerie, ABV, Fässer und Aromenprofile.'
                    : 'The Cask & Spirit Assistant is identifying distillery, ABV, casks, and aroma profiles.'}
                </p>
              </div>
            </div>
          ) : analysisResult ? (
            /* ── Results Preview Subcomponent ── */
            <ScanResultPreview
              language={language}
              analysisResult={analysisResult}
              applyMode={applyMode}
              onApplyModeChange={setApplyMode}
            />
          ) : (
            /* ── Dedicated Tabs ── */
            <div className="flex flex-col justify-between flex-1 gap-6 animate-fade-in w-full max-w-2xl mx-auto">
              {activeTab === 'photo' && (
                <ScanPhotoTab
                  language={language}
                  onFileSelect={handleFileChange}
                />
              )}

              {activeTab === 'text' && (
                <ScanSearchTab
                  language={language}
                  textQuery={textQuery}
                  onQueryChange={setTextQuery}
                  onSubmit={handleTextSubmit}
                />
              )}

              {activeTab === 'barcode' && (
                <ScanBarcodeTab
                  language={language}
                  barcodeQuery={barcodeQuery}
                  onBarcodeChange={setBarcodeQuery}
                  onSubmit={handleBarcodeSubmit}
                  isCameraActive={isCameraActive}
                  cameraError={cameraError}
                  videoRef={videoRef}
                  onStartCamera={startCameraScan}
                  onStopCamera={stopCameraScan}
                  onToggleCameraFacing={toggleCameraFacing}
                />
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-950/20 border border-red-500/40 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium animate-fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="flex items-center justify-between p-3.5 sm:px-8 border-t border-[var(--parchment-divider)] bg-[var(--pub-bg-panel)] select-none shrink-0">
          {analysisResult ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[var(--parchment-border)] bg-[var(--pub-bg-alt)] hover:bg-black/5 text-[var(--sepia-text)] font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-xs"
              >
                <RefreshCw size={15} />
                <span>{t('scanAgain')}</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[var(--wood-dark)] text-white hover:bg-[var(--wood-accent)] font-display font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-md active:scale-95 border border-[var(--forest-green)]/40"
              >
                <span>{t('applyToNote')}</span>
                <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={handleClose}
                className="min-h-[44px] px-5 py-2.5 rounded-xl border border-[var(--parchment-border)] bg-[var(--pub-bg-alt)] hover:bg-black/5 text-[var(--sepia-text)] font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-xs flex items-center justify-center"
              >
                {t('cancel')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
