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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pt-4 pb-2 w-full">
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
