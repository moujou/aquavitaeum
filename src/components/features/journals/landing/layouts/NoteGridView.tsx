'use client';

import React from 'react';
import { Spirit } from '@/types/spirit.types';
import { SpiritCard } from '@/components/features/collection/SpiritCard';

interface NoteGridViewProps {
  spirits: Spirit[];
  onSelect: (id: string) => void;
  isSelectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onTouchStart: (e: React.TouchEvent, id: string) => void;
  cancelLongPress: () => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function NoteGridView({
  spirits,
  onSelect,
  isSelectMode,
  selectedIds,
  onToggleSelect,
  onTouchStart,
  cancelLongPress,
  onTouchEnd,
}: NoteGridViewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6 p-3 sm:p-6 w-full">
      {spirits.map((spirit) => (
        <div key={spirit.id} className="relative w-full">
          <SpiritCard
            spirit={spirit}
            isSelected={false}
            isSelectMode={isSelectMode}
            isSelectChecked={selectedIds.has(spirit.id)}
            onClick={() => isSelectMode ? onToggleSelect(spirit.id) : onSelect(spirit.id)}
            onTouchStart={(e) => onTouchStart(e, spirit.id)}
            onTouchEnd={onTouchEnd}
            onTouchCancel={cancelLongPress}
            onTouchMove={cancelLongPress}
          />
        </div>
      ))}
    </div>
  );
}
