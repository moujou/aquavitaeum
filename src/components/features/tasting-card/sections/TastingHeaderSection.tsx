'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, Trash2, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Check } from 'lucide-react';
import { Spirit } from '@/types/spirit.types';
import { PageActionsDropdown } from '@/components/ui/PageActionsDropdown';
import { useAiAssistantConfig } from '@/hooks/useAiAssistantConfig';
import { exportSingleSpiritFile, parseSingleSpiritFile, formatSyncOrImportError } from '@/lib/google-drive-sync';
import { TranslationKey } from '@/lib/i18n/translations';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface TastingHeaderSectionProps {
  spirit: Spirit;
  saved?: boolean;
  displayName: string;
  subtitleLocation: string;
  onDelete?: () => void;
  onImportSpirit?: (imported: Spirit) => void;
  onScanSpirit?: () => void;
  t: (key: TranslationKey) => string;
}

export function TastingHeaderSection({
  spirit,
  saved = true,
  displayName,
  subtitleLocation,
  onDelete,
  onImportSpirit,
  onScanSpirit,
  t,
}: TastingHeaderSectionProps) {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { hasAiKey } = useAiAssistantConfig();
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showJustSaved, setShowJustSaved] = useState(false);
  const hadUnsavedEditRef = useRef(false);

  useEffect(() => {
    if (!saved) {
      hadUnsavedEditRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowJustSaved(false);
      return;
    }
    if (saved && hadUnsavedEditRef.current) {
      hadUnsavedEditRef.current = false;
      setShowJustSaved(true);
      const timer = setTimeout(() => {
        setShowJustSaved(false);
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportNotice(null);
      const parsedSpirit = await parseSingleSpiritFile(file);
      onImportSpirit?.(parsedSpirit);
      setImportNotice({
        type: 'success',
        message: t('noteImportSuccess'),
      });
      setTimeout(() => setImportNotice(null), 3000);
    } catch (err: unknown) {
      setImportNotice({
        type: 'error',
        message: formatSyncOrImportError(err, language),
      });
      setTimeout(() => setImportNotice(null), 4000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative bg-[var(--wood-dark)] text-center py-4 sm:py-5 px-12 sm:px-16 border-b border-[var(--wood-dark)]/80 flex flex-col items-center justify-center gap-1.5 sm:gap-2 shadow-[inset_0_-10px_20px_-10px_rgba(0,0,0,0.25)]">
      {/* Top Left Subtle Auto-Save Status Indicator (Symmetric to Top Right Actions Menu) */}
      <div
        data-testid="autosave-status-indicator"
        className={cn(
          'absolute top-3 left-3 sm:top-3.5 sm:left-4 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-body font-medium transition-opacity duration-300 select-none pointer-events-none',
          !saved || showJustSaved
            ? 'opacity-100 bg-black/20 text-[var(--fab-text)]/90 border border-white/15'
            : 'opacity-0'
        )}
      >
        {!saved ? (
          <>
            <RefreshCw size={12} className="animate-spin text-amber-200 shrink-0" />
            <span className="hidden sm:inline">{t('saving')}</span>
          </>
        ) : showJustSaved ? (
          <>
            <Check size={12} className="text-emerald-300 shrink-0" strokeWidth={2.5} />
            <span className="hidden sm:inline">{t('saved')}</span>
          </>
        ) : null}
      </div>

      {/* Top Right Dedicated Action Menu Slot */}
      <div className="absolute top-3 right-3 sm:top-3.5 sm:right-4 z-20">
        <PageActionsDropdown
          variant="on-dark-banner"
          title={t('cardActionsTitle')}
          items={[
            ...(hasAiKey && onScanSpirit
              ? [
                  {
                    id: 'scan-spirit',
                    label: t('analyzeBottleAi'),
                    icon: <Sparkles size={16} />,
                    onClick: onScanSpirit,
                  },
                ]
              : []),
            {
              id: 'export-note',
              label: t('exportSingleNote'),
              icon: <Download size={16} />,
              onClick: () => exportSingleSpiritFile(spirit),
            },
            {
              id: 'import-note',
              label: t('importSingleNote'),
              icon: <Upload size={16} />,
              onClick: () => fileInputRef.current?.click(),
            },
            ...(onDelete
              ? [
                  {
                    id: 'delete-note',
                    label: t('deleteTastingNote'),
                    icon: <Trash2 size={16} />,
                    onClick: onDelete,
                    destructive: true,
                  },
                ]
              : []),
          ]}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".json,application/json"
          className="hidden"
        />
      </div>

      {/* Spirit Type Badge (Own dedicated line, only shown when spiritType is set) */}
      {spirit.spiritType && (
        <span className="font-display text-xs sm:text-sm uppercase font-semibold tracking-[0.2em] text-[var(--brass-light)]">
          {spirit.spiritType}
        </span>
      )}

      {/* Big Spirit Name - Full Width with generous breathing room */}
      <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-wide text-[var(--fab-text)] leading-tight w-full max-w-4xl mx-auto break-words px-1">
        {displayName}
      </h1>

      {/* Subtitle (Hersteller & Herkunft) — Only rendered when distillery, bottler, or region is present */}
      {subtitleLocation && (
        <p className="font-display text-xs sm:text-sm uppercase tracking-[0.15em] text-[var(--brass-light)] font-medium w-full max-w-3xl mx-auto break-words px-1">
          {subtitleLocation}
        </p>
      )}

      {/* Inline Import Notice Toast */}
      {importNotice && (
        <div
          className={cn(
            'mt-2 flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border animate-fade-in font-medium z-10',
            importNotice.type === 'success'
              ? 'bg-[var(--forest-green)]/20 text-white border-[var(--forest-green)]/50'
              : 'bg-red-950/80 text-red-200 border-red-800'
          )}
        >
          {importNotice.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{importNotice.message}</span>
        </div>
      )}
    </div>
  );
}
