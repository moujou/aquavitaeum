import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRef } from 'react';
import { CalendarPopup } from '../CalendarPopup';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a stable anchorRef that points to a real DOM element. */
function makeAnchorRef() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const ref = createRef<HTMLElement>();
  // createRef is read-only via .current, so we use Object.defineProperty
  Object.defineProperty(ref, 'current', { value: div, writable: false });
  return ref;
}

function renderCalendar(props: Partial<Parameters<typeof CalendarPopup>[0]> = {}) {
  const defaults = {
    value: '2026-07-15',   // July 15 2026 — a fixed reference date
    language: 'EN' as const,
    onSelect: vi.fn(),
    onClose: vi.fn(),
    anchorRef: makeAnchorRef(),
  };
  return render(<CalendarPopup {...defaults} {...props} />);
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('CalendarPopup', () => {
  beforeEach(() => {
    // CalendarPopup uses document event listeners; clean up between tests
    vi.restoreAllMocks();
  });

  // ── Locale: month names ────────────────────────────────────────────────────

  it('renders the English month name "July" for 2026-07-15 in EN', () => {
    renderCalendar({ language: 'EN', value: '2026-07-15' });
    // The header contains "July 2026" (separated by &nbsp;)
    expect(screen.getByText(/July/)).toBeDefined();
  });

  it('renders the German month name "Juli" for 2026-07-15 in DE', () => {
    renderCalendar({ language: 'DE', value: '2026-07-15' });
    expect(screen.getByText(/Juli/)).toBeDefined();
  });

  it('renders "June" in EN when navigating to June 2026', () => {
    renderCalendar({ language: 'EN', value: '2026-07-15' });
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText(/June/)).toBeDefined();
  });

  it('renders "Juni" in DE when navigating to June 2026', () => {
    renderCalendar({ language: 'DE', value: '2026-07-15' });
    fireEvent.click(screen.getByRole('button', { name: 'Vorheriger Monat' }));
    expect(screen.getByText(/Juni/)).toBeDefined();
  });

  // ── Locale: weekday headers ────────────────────────────────────────────────

  it('renders EN weekday grid starting with "Su" (Sunday-first)', () => {
    renderCalendar({ language: 'EN' });
    const weekdays = screen.getAllByText(/^(Su|Mo|Tu|We|Th|Fr|Sa)$/);
    expect(weekdays[0].textContent).toBe('Su');
    expect(weekdays[6].textContent).toBe('Sa');
  });

  it('renders DE weekday grid starting with "Mo" (Monday-first)', () => {
    renderCalendar({ language: 'DE' });
    const weekdays = screen.getAllByText(/^(Mo|Di|Mi|Do|Fr|Sa|So)$/);
    expect(weekdays[0].textContent).toBe('Mo');
    expect(weekdays[6].textContent).toBe('So');
  });

  // ── Day selection ──────────────────────────────────────────────────────────

  it('calls onSelect with the correct ISO string when a day button is clicked', () => {
    const onSelect = vi.fn();
    renderCalendar({ language: 'EN', value: '2026-07-15', onSelect });
    // Click the day labelled "10 July 2026"
    fireEvent.click(screen.getByRole('button', { name: '10 July 2026' }));
    expect(onSelect).toHaveBeenCalledWith('2026-07-10');
  });

  it('calls onSelect with the correct ISO string in DE locale', () => {
    const onSelect = vi.fn();
    renderCalendar({ language: 'DE', value: '2026-07-15', onSelect });
    fireEvent.click(screen.getByRole('button', { name: '10 Juli 2026' }));
    expect(onSelect).toHaveBeenCalledWith('2026-07-10');
  });

  // ── Month navigation ───────────────────────────────────────────────────────

  it('navigates to the previous month (June) when the left chevron is clicked (EN)', () => {
    renderCalendar({ language: 'EN', value: '2026-07-15' });
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText(/June/)).toBeDefined();
  });

  it('navigates to the next month (August) when the right chevron is clicked (EN)', () => {
    renderCalendar({ language: 'EN', value: '2026-07-15' });
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText(/August/)).toBeDefined();
  });

  it('wraps correctly from December to January when navigating forward', () => {
    renderCalendar({ language: 'EN', value: '2026-12-01' });
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText(/January/)).toBeDefined();
    expect(screen.getByText(/2027/)).toBeDefined();
  });

  it('wraps correctly from January to December when navigating backward', () => {
    renderCalendar({ language: 'EN', value: '2026-01-01' });
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText(/December/)).toBeDefined();
    expect(screen.getByText(/2025/)).toBeDefined();
  });

  // ── Today / Heute shortcut ─────────────────────────────────────────────────

  it('renders "Today" footer button in EN', () => {
    renderCalendar({ language: 'EN' });
    expect(screen.getByRole('button', { name: 'Today' })).toBeDefined();
  });

  it('renders "Heute" footer button in DE', () => {
    renderCalendar({ language: 'DE' });
    expect(screen.getByRole('button', { name: 'Heute' })).toBeDefined();
  });

  it('calls onSelect with today ISO when "Today" is clicked', () => {
    const onSelect = vi.fn();
    renderCalendar({ language: 'EN', onSelect });
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    const today = new Date();
    const expectedIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(onSelect).toHaveBeenCalledWith(expectedIso);
  });

  // ── Accessibility & close ──────────────────────────────────────────────────

  it('has role="dialog" and the correct aria-label in EN', () => {
    renderCalendar({ language: 'EN' });
    expect(screen.getByRole('dialog', { name: 'Calendar' })).toBeDefined();
  });

  it('has role="dialog" and the correct aria-label in DE', () => {
    renderCalendar({ language: 'DE' });
    expect(screen.getByRole('dialog', { name: 'Kalender' })).toBeDefined();
  });

  it('calls onClose when the Escape key is pressed', () => {
    const onClose = vi.fn();
    renderCalendar({ onClose });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Selected day highlighting ──────────────────────────────────────────────

  it('marks the selected day button as aria-pressed="true"', () => {
    renderCalendar({ language: 'EN', value: '2026-07-15' });
    const selectedBtn = screen.getByRole('button', { name: '15 July 2026' });
    expect(selectedBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('marks non-selected days as aria-pressed="false"', () => {
    renderCalendar({ language: 'EN', value: '2026-07-15' });
    const otherBtn = screen.getByRole('button', { name: '10 July 2026' });
    expect(otherBtn.getAttribute('aria-pressed')).toBe('false');
  });
});
