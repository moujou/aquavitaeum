'use client';

import React from 'react';
import { Pencil, Check } from 'lucide-react';
import { Spirit } from '@/types/spirit.types';

interface TastingHeaderSectionProps {
  spirit: Spirit;
  displayName: string;
  subtitleLocation: string;
  isEditingTitle: boolean;
  setIsEditingTitle: (v: boolean) => void;
  update: <K extends keyof Spirit>(key: K, value: Spirit[K]) => void;
}

export function TastingHeaderSection({
  spirit,
  displayName,
  subtitleLocation,
  isEditingTitle,
  setIsEditingTitle,
  update,
}: TastingHeaderSectionProps) {
  return (
    <div className="bg-[var(--wood-dark)] text-center py-5 px-6 border-b border-[var(--wood-dark)]/80 flex flex-col items-center justify-center gap-1.5 shadow-[inset_0_-10px_20px_-10px_rgba(0,0,0,0.25)]">
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
      <p className="font-display text-xs sm:text-sm uppercase tracking-[0.2em] text-[#D6EBE0] font-medium italic">
        {subtitleLocation}
      </p>
    </div>
  );
}
