import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme, THEME_STORAGE_KEY } from '../ThemeContext';
import React from 'react';

describe('ThemeContext & useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    const existingMeta = document.querySelector('meta[name="theme-color"]');
    if (existingMeta) {
      existingMeta.remove();
    }
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', '#ECE5D8');
    document.head.appendChild(meta);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  it('defaults to light theme when localStorage is empty', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('initializes with pub-dark when stored in localStorage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'pub-dark');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('pub-dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('pub-dark');
  });

  it('initializes with pub-dark when documentElement data-theme attribute already set', () => {
    document.documentElement.setAttribute('data-theme', 'pub-dark');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('pub-dark');
  });

  it('updates theme, data-theme attribute, and localStorage via setTheme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('pub-dark');
    });

    expect(result.current.theme).toBe('pub-dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('pub-dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('pub-dark');
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#0D1115');

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#ECE5D8');
  });

  it('toggles theme between light and pub-dark via toggleTheme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('pub-dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('pub-dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('pub-dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('throws an error when useTheme is called outside ThemeProvider', () => {
    // Suppress console.error during expected throw
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
    consoleError.mockRestore();
  });
});
