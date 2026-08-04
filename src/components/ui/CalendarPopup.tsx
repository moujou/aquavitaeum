'use client';

import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '@/lib/i18n/translations';

// ─── Locale data ──────────────────────────────────────────────────────────────

const MONTH_NAMES: Record<Language, string[]> = {
  EN: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  DE: [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ],
};

/** Weekday headers: EN starts on Sunday, DE starts on Monday */
const WEEKDAY_LABELS: Record<Language, string[]> = {
  EN: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  DE: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns 0-based day-of-week for the first day of the given month,
 *  adjusted so the grid starts on Sunday (EN) or Monday (DE). */
function getMonthStartOffset(year: number, month: number, language: Language): number {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun … 6=Sat
  if (language === 'DE') {
    // Monday-first: shift so Mon=0, …, Sun=6
    return (firstDay + 6) % 7;
  }
  // Sunday-first: native getDay() is already correct
  return firstDay;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Parse ISO string to { year, month (0-based), day } or null */
function parseIso(iso?: string): { year: number; month: number; day: number } | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) - 1, day: Number(m[3]) };
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CalendarPopupProps {
  /** Currently selected ISO date (YYYY-MM-DD) */
  value?: string;
  language: Language;
  /** Called with the newly selected ISO date */
  onSelect: (isoDate: string) => void;
  /** Called when the popup should close without a selection */
  onClose: () => void;
  /** Anchor element — popup positions itself below it */
  anchorRef: RefObject<HTMLElement | null>;
}

export function CalendarPopup({ value, language, onSelect, onClose, anchorRef }: CalendarPopupProps) {
  const today = new Date();
  const parsed = parseIso(value);

  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());

  const popupRef = useRef<HTMLDivElement>(null);

  // ── Close on outside click or Escape ──────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    // Delay so the button-click that opened us doesn't immediately close us
    const id = setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose, anchorRef]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // ── Day grid ───────────────────────────────────────────────────────────────
  const offset = getMonthStartOffset(viewYear, viewMonth, language);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

  const cells: Array<number | null> = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array<null>(totalCells - offset - daysInMonth).fill(null),
  ];

  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-modal="true"
      aria-label={language === 'DE' ? 'Kalender' : 'Calendar'}
      className={[
        'absolute z-50 mt-2 w-72 rounded-xl border border-[#C4A87A]/30',
        'bg-[#1A0F0A] shadow-[0_8px_32px_rgba(0,0,0,0.6)]',
        'backdrop-blur-sm select-none',
        // Position: open downward, left-aligned
        'top-full left-0',
      ].join(' ')}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#C4A87A]/20">
        <button
          type="button"
          onClick={prevMonth}
          aria-label={language === 'DE' ? 'Vorheriger Monat' : 'Previous month'}
          className="p-1 rounded-md text-[#C4A87A] hover:text-[#F0C87A] hover:bg-[#C4A87A]/10 transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-sm font-semibold tracking-wide text-[#F0C87A] font-body">
          {MONTH_NAMES[language][viewMonth]}&nbsp;{viewYear}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          aria-label={language === 'DE' ? 'Nächster Monat' : 'Next month'}
          className="p-1 rounded-md text-[#C4A87A] hover:text-[#F0C87A] hover:bg-[#C4A87A]/10 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Weekday labels ── */}
      <div className="grid grid-cols-7 gap-px px-3 pt-3 pb-1">
        {WEEKDAY_LABELS[language].map((label) => (
          <div
            key={label}
            className="text-center text-[10px] font-bold uppercase tracking-widest text-[#C4A87A]/50"
          >
            {label}
          </div>
        ))}
      </div>

      {/* ── Day cells ── */}
      <div className="grid grid-cols-7 gap-px px-3 pb-3">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const isSelected =
            parsed?.year === viewYear &&
            parsed?.month === viewMonth &&
            parsed?.day === day;

          const isToday =
            todayY === viewYear && todayM === viewMonth && todayD === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(toIso(viewYear, viewMonth, day))}
              aria-label={`${day} ${MONTH_NAMES[language][viewMonth]} ${viewYear}`}
              aria-pressed={isSelected}
              className={[
                'relative h-8 w-full rounded-md text-xs font-medium transition-all duration-150',
                isSelected
                  ? 'bg-[#C59B27] text-[#1A0F0A] font-bold shadow-[0_0_8px_rgba(197,155,39,0.5)]'
                  : isToday
                  ? 'text-[#F0C87A] ring-1 ring-inset ring-[#C4A87A]/60 hover:bg-[#C4A87A]/15'
                  : 'text-[#D4B896] hover:bg-[#C4A87A]/10 hover:text-[#F0C87A]',
              ].join(' ')}
            >
              {day}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C59B27]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Today shortcut ── */}
      <div className="border-t border-[#C4A87A]/15 px-3 py-2 flex justify-center">
        <button
          type="button"
          onClick={() => onSelect(toIso(todayY, todayM, todayD))}
          className="text-[11px] font-semibold text-[#C4A87A] hover:text-[#F0C87A] tracking-wide uppercase transition-colors"
        >
          {language === 'DE' ? 'Heute' : 'Today'}
        </button>
      </div>
    </div>
  );
}
