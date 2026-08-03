'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { Language } from '@/lib/i18n/translations';
import { formatDateByLanguage, parseDateInputToIso } from '@/lib/spirit-utils';
import { cn } from '@/lib/utils';

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
 * Automatically adapts when switching language settings and provides a native calendar picker.
 */
export function LocalizedDatePicker({
  id = 'date-tasted-input',
  value,
  onChange,
  language,
  className,
}: LocalizedDatePickerProps) {
  const [inputText, setInputText] = useState(() => formatDateByLanguage(value, language));
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  // Synchronize input text whenever value or language setting changes
  useEffect(() => {
    setInputText(formatDateByLanguage(value, language));
  }, [value, language]);

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

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedIso = e.target.value;
    if (pickedIso) {
      onChange(pickedIso);
      setInputText(formatDateByLanguage(pickedIso, language));
    }
  };

  const openCalendar = () => {
    const inputEl = hiddenDateInputRef.current;
    if (!inputEl) return;

    const pickerInput = inputEl as HTMLInputElement & { showPicker?: () => void };
    if (typeof pickerInput.showPicker === 'function') {
      try {
        pickerInput.showPicker();
      } catch {
        pickerInput.focus();
      }
    } else {
      pickerInput.focus();
    }
  };

  const formatHint = language === 'DE' ? 'DD.MM.YYYY' : 'MM/DD/YYYY';

  return (
    <div className={cn('relative flex items-center w-full', className)}>
      <input
        id={id}
        type="text"
        value={inputText}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder={formatHint}
        className="w-full bg-transparent border-b border-[#C4A87A] pb-1 pr-14 text-sm sm:text-base text-[#1A120B] font-body focus:outline-none focus:border-[#5c3d22] placeholder:text-[#c4a87a]/60"
      />
      {/* Format Badge Indicator */}
      <span className="absolute right-7 bottom-1.5 text-[10px] font-bold text-[#8c6440]/70 uppercase select-none pointer-events-none font-body">
        {formatHint}
      </span>
      {/* Calendar Icon Button */}
      <button
        type="button"
        id={`${id}-calendar-btn`}
        onClick={openCalendar}
        className="absolute right-0 bottom-1 p-0.5 text-[#5c3d22] hover:text-[#C59B27] transition-colors cursor-pointer"
        title={language === 'DE' ? 'Kalender öffnen' : 'Open calendar'}
      >
        <Calendar size={17} />
      </button>

      {/* Hidden native date picker with language-specific lang attribute */}
      <input
        ref={hiddenDateInputRef}
        type="date"
        key={`native-date-picker-${language}`}
        lang={language === 'DE' ? 'de-DE' : 'en-US'}
        value={value}
        onChange={handleNativePickerChange}
        className="sr-only opacity-0 w-0 h-0 absolute pointer-events-none"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
