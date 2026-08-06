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
    <div className="bg-[#1A120B] text-center py-5 px-6 border-b border-[#C4A87A] flex flex-col items-center justify-center gap-1.5">
      {/* Spirit Type Badge */}
      <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#C4A87A]">
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
            className="w-full bg-[#F5EEDC] text-[#1A120B] font-display text-xl sm:text-2xl font-bold px-3 py-1 rounded border border-[#C59B27] focus:outline-none text-center uppercase tracking-wider"
          />
          <button
            type="button"
            onClick={() => setIsEditingTitle(false)}
            className="p-1.5 rounded-full bg-[#C59B27] text-[#1A120B] hover:bg-[#e8c247] transition-colors cursor-pointer"
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
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-widest text-[#F5EEDC] uppercase leading-tight">
            {displayName}
          </h1>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
            className="p-1 rounded text-[#C4A87A] opacity-60 group-hover:opacity-100 hover:text-[#C59B27] transition-opacity cursor-pointer"
            title="Edit Spirit Name"
          >
            <Pencil size={16} />
          </button>
        </div>
      )}

      {/* Subtitle */}
      <p className="font-display text-xs sm:text-sm uppercase tracking-[0.25em] text-[#a07d1a] italic">
        {subtitleLocation}
      </p>
    </div>
  );
}
