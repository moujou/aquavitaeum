'use client';

import { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { Language } from '@/lib/i18n/translations';
import { formatDateByLanguage, parseDateInputToIso } from '@/lib/spirit-utils';
import { cn } from '@/lib/utils';
import { CalendarPopup } from './CalendarPopup';

interface LocalizedDatePickerProps {
  id?: string;
  value: string; // ISO string format YYYY-MM-DD
  onChange: (isoDate: string) => void;
  language: Language;
  className?: string;
}

/**
 * Locale-aware DatePicker & Date Input component.
 * Dynamically formats date based on active app Language:
 * - DE: DD.MM.YYYY (e.g. 04.08.2026)
 * - EN: MM/DD/YYYY (e.g. 08/04/2026)
 * Uses a fully custom calendar popup (not the native browser picker) so that
 * month and weekday names always reflect the app language, not the OS locale.
 */
export function LocalizedDatePicker({
  id = 'date-tasted-input',
  value,
  onChange,
  language,
  className,
}: LocalizedDatePickerProps) {
  const [inputText, setInputText] = useState(() => formatDateByLanguage(value, language));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Anchor ref forwarded to CalendarPopup for outside-click detection
  const wrapperRef = useRef<HTMLDivElement>(null);
  const calendarBtnRef = useRef<HTMLButtonElement>(null);

  // Synchronize input text whenever value or language setting changes.
  // Uses React's derived-state pattern (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes):
  // track previous props in state and update inputText during render when they change.
  const [prevSync, setPrevSync] = useState<{ value: string; language: string }>({ value, language });
  if (prevSync.value !== value || prevSync.language !== language) {
    setPrevSync({ value, language });
    setInputText(formatDateByLanguage(value, language));
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputText(newVal);
    const parsedIso = parseDateInputToIso(newVal, language);
    if (parsedIso) {
      onChange(parsedIso);
    }
  };

  const handleBlur = () => {
    const parsedIso = parseDateInputToIso(inputText, language);
    if (parsedIso) {
      onChange(parsedIso);
      setInputText(formatDateByLanguage(parsedIso, language));
    } else {
      // Fallback to current value formatted
      setInputText(formatDateByLanguage(value, language));
    }
  };

  const handleCalendarSelect = (isoDate: string) => {
    onChange(isoDate);
    setInputText(formatDateByLanguage(isoDate, language));
    setIsCalendarOpen(false);
  };

  const formatHint = language === 'DE' ? 'DD.MM.YYYY' : 'MM/DD/YYYY';

  return (
    <div ref={wrapperRef} className={cn('relative flex items-center w-full', className)}>
      <input
        id={id}
        type="text"
        value={inputText}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder={formatHint}
        className="w-full bg-transparent border-b border-[var(--parchment-border)] pb-1 pr-7 text-sm sm:text-base text-[var(--sepia-text)] font-body focus:outline-none focus:border-[var(--sepia-muted)] placeholder:text-[var(--parchment-border)]/60"
      />
      {/* Calendar Icon Button */}
      <button
        ref={calendarBtnRef}
        type="button"
        id={`${id}-calendar-btn`}
        onClick={() => setIsCalendarOpen((prev) => !prev)}
        className="absolute right-0 bottom-1 p-0.5 text-[var(--sepia-muted)] hover:text-[var(--brass-accent)] transition-colors cursor-pointer"
        title={language === 'DE' ? 'Kalender öffnen' : 'Open calendar'}
        aria-expanded={isCalendarOpen}
        aria-haspopup="dialog"
      >
        <Calendar size={17} />
      </button>

      {/* Custom calendar popup */}
      {isCalendarOpen && (
        <CalendarPopup
          value={value}
          language={language}
          onSelect={handleCalendarSelect}
          onClose={() => setIsCalendarOpen(false)}
          anchorRef={calendarBtnRef}
        />
      )}
    </div>
  );
}
