'use client';

import React, { useRef, useState } from 'react';
import { Pencil, Check, Download, Upload, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Spirit } from '@/types/spirit.types';
import { PageActionsDropdown } from '@/components/ui/PageActionsDropdown';
import { exportSingleSpiritFile, parseSingleSpiritFile } from '@/lib/google-drive-sync';
import { TranslationKey } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

interface TastingHeaderSectionProps {
  spirit: Spirit;
  displayName: string;
  subtitleLocation: string;
  isEditingTitle: boolean;
  setIsEditingTitle: (v: boolean) => void;
  update: <K extends keyof Spirit>(key: K, value: Spirit[K]) => void;
  onDelete?: () => void;
  onImportSpirit?: (imported: Spirit) => void;
  t: (key: TranslationKey) => string;
  language?: string;
}

export function TastingHeaderSection({
  spirit,
  displayName,
  subtitleLocation,
  isEditingTitle,
  setIsEditingTitle,
  update,
  onDelete,
  onImportSpirit,
  t,
  language = 'EN',
}: TastingHeaderSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      const message = err instanceof Error ? err.message : t('noteImportError');
      setImportNotice({
        type: 'error',
        message,
      });
      setTimeout(() => setImportNotice(null), 4000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative bg-[var(--wood-dark)] text-center py-5 px-6 border-b border-[var(--wood-dark)]/80 flex flex-col items-center justify-center gap-1.5 shadow-[inset_0_-10px_20px_-10px_rgba(0,0,0,0.25)]">
      {/* Top Right Gear Action Menu */}
      <div className="absolute top-3 right-3 sm:top-3.5 sm:right-4 z-20">
        <PageActionsDropdown
          title={language === 'DE' ? 'Karten-Aktionen' : 'Card Actions'}
          items={[
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

      {/* Spirit Type Badge */}
      <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[var(--brass-light)]">
        {spirit.spiritType}
      </span>

      {/* Big Spirit Name (Editable inline with Pencil icon) */}
      {isEditingTitle ? (
        <div className="flex items-center gap-2 max-w-md w-full my-1">
          <input
            id="header-name-edit-input"
            type="text"
            value={spirit.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Spirit / Bottling Name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsEditingTitle(false);
            }}
            className="w-full bg-[var(--parchment-bg)] text-[var(--sepia-text)] font-display text-xl sm:text-2xl font-bold px-3 py-1 rounded border border-[var(--brass-accent)] focus:outline-none text-center uppercase tracking-wider"
          />
          <button
            type="button"
            onClick={() => setIsEditingTitle(false)}
            className="p-1.5 rounded-full bg-[var(--brass-accent)] text-[var(--parchment-bg)] hover:bg-[var(--brass-light)] transition-colors cursor-pointer"
            title="Done editing name"
          >
            <Check size={18} />
          </button>
        </div>
      ) : (
        <div
          className="flex items-center justify-center gap-2.5 group cursor-pointer"
          onClick={() => setIsEditingTitle(true)}
        >
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-widest text-[var(--parchment-bg)] uppercase leading-tight">
            {displayName}
          </h1>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
            className="p-1 rounded text-white/70 opacity-60 group-hover:opacity-100 hover:text-[var(--brass-light)] transition-opacity cursor-pointer"
            title="Edit Spirit Name"
          >
            <Pencil size={16} />
          </button>
        </div>
      )}

      {/* Subtitle (Hersteller & Herkunft) with Crystal Clear Legibility */}
      <p className="font-display text-xs sm:text-sm uppercase tracking-[0.2em] text-[var(--brass-light)]/90 font-medium italic">
        {subtitleLocation}
      </p>

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
