'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/i18n/translations';

interface ScanPhotoTabProps {
  language: Language;
  onFileSelect: (file: File) => void;
}

export function ScanPhotoTab({ language, onFileSelect }: ScanPhotoTabProps) {
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

  return (
    <div className="flex flex-col justify-between flex-1 gap-4 w-full animate-fade-in">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'w-full h-64 sm:h-72 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center gap-4 cursor-pointer transition-all',
          isDragOver
            ? 'border-[var(--forest-green)] bg-[var(--forest-green)]/10 scale-[0.99]'
            : 'border-[var(--parchment-border)] bg-[var(--pub-bg-alt)]/30 hover:bg-[var(--pub-bg-alt)]/60 hover:border-[var(--wood-dark)]'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="w-16 h-16 rounded-full bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/30 flex items-center justify-center text-[var(--forest-green)] shadow-xs">
          <UploadCloud size={32} />
        </div>
        <div className="flex flex-col gap-1.5 max-w-sm">
          <p className="font-display text-base font-bold text-[var(--foreground)]">
            {language === 'DE'
              ? 'Flaschen- oder Etikettenfoto hochladen'
              : 'Upload Bottle or Label Photo'}
          </p>
          <p className="font-body text-xs sm:text-sm text-[var(--sepia-muted)]">
            {language === 'DE'
              ? 'Bild hierher ziehen oder zum Auswählen klicken (Handykamera / Datei)'
              : 'Drag image here or click to browse (Camera / File)'}
          </p>
        </div>
      </div>

      {/* Sommelier Tip */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-xs text-[var(--sepia-text)] shadow-xs">
        <span className="text-amber-500 font-bold shrink-0">⭐ {language === 'DE' ? 'Tipp:' : 'Tip:'}</span>
        <span>
          {language === 'DE'
            ? 'Höchste Genauigkeit: Liest Fassnummern, Einzelfass-Details, Alter und % vol direkt vom Etikett ab.'
            : 'Highest accuracy: Directly reads cask numbers, single cask details, age, and ABV from the label.'}
        </span>
      </div>
    </div>
  );
}
