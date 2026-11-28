import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastContext';

function ToastTestConsumer() {
  const { showToast, dismissToast } = useToast();
  return (
    <div>
      <button type="button" onClick={() => showToast('Aroma erstellt', 'success')}>
        Trigger Success
      </button>
      <button type="button" onClick={() => showToast('Fehler beim Speichern', 'error')}>
        Trigger Error
      </button>
      <button type="button" onClick={dismissToast}>
        Dismiss
      </button>
    </div>
  );
}

describe('ToastContext & ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays floating toast pill and auto-dismisses after timeout', () => {
    render(
      <ToastProvider>
        <ToastTestConsumer />
      </ToastProvider>
    );

    expect(screen.queryByTestId('app-toast-pill')).toBeNull();

    fireEvent.click(screen.getByText('Trigger Success'));
    expect(screen.getByTestId('app-toast-pill')).toBeDefined();
    expect(screen.getByText('Aroma erstellt')).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(2700);
    });

    expect(screen.queryByTestId('app-toast-pill')).toBeNull();
  });

  it('replaces previous toast when a new toast is triggered and dismisses on click', () => {
    render(
      <ToastProvider>
        <ToastTestConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Success'));
    expect(screen.getByText('Aroma erstellt')).toBeDefined();

    fireEvent.click(screen.getByText('Trigger Error'));
    expect(screen.queryByText('Aroma erstellt')).toBeNull();
    expect(screen.getByText('Fehler beim Speichern')).toBeDefined();

    fireEvent.click(screen.getByTestId('app-toast-pill'));
    expect(screen.queryByTestId('app-toast-pill')).toBeNull();
  });
});
