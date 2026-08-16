'use client';

import React from 'react';
import { Spirit } from '@/types/spirit.types';
import { NoteListItem } from '@/components/features/collection/NoteListItem';

interface NoteListViewProps {
  spirits: Spirit[];
  onSelect: (id: string) => void;
  isSelectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onTouchStart: (e: React.TouchEvent, id: string) => void;
  cancelLongPress: () => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function NoteListView({
  spirits,
  onSelect,
  isSelectMode,
  selectedIds,
  onToggleSelect,
  onTouchStart,
  cancelLongPress,
  onTouchEnd
}: NoteListViewProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:gap-3 py-4 w-full">
      {spirits.map((spirit) => (
        <NoteListItem
          key={spirit.id}
          spirit={spirit}
          onClick={() => isSelectMode ? onToggleSelect(spirit.id) : onSelect(spirit.id)}
          isSelectMode={isSelectMode}
          isSelected={selectedIds.has(spirit.id)}
          onTouchStart={(e) => onTouchStart(e, spirit.id)}
          onTouchCancel={cancelLongPress}
          onTouchMove={cancelLongPress}
          onTouchEnd={onTouchEnd}
        />
      ))}
    </div>
  );
}
