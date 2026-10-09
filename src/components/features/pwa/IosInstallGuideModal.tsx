'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, Share, PlusSquare, Smartphone, Sparkles, Monitor } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface IosInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IosInstallGuideModal({ isOpen, onClose }: IosInstallGuideModalProps) {
  const { language } = useLanguage();
  useLockBodyScroll(isOpen, onClose);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-guide-title"
      className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-[var(--parchment-bg)] border border-[var(--parchment-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-[var(--wood-dark)] text-white border-b border-black/10 shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-amber-200 shrink-0" />
            <h2
              id="pwa-install-guide-title"
              className="font-display font-bold text-base sm:text-lg tracking-wide text-white drop-shadow-xs"
            >
              {language === 'DE' ? 'App auf Homescreen installieren' : 'Install App on Home Screen'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer shadow-xs flex items-center justify-center active:scale-95"
            title={language === 'DE' ? 'Schließen' : 'Close'}
            aria-label={language === 'DE' ? 'Schließen' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">
          {/* Intro Box */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-xs sm:text-sm text-[var(--foreground)] leading-relaxed shadow-xs">
            <Sparkles className="w-5 h-5 text-[var(--brass-accent)] shrink-0" />
            <span>
              {language === 'DE'
                ? 'Als Progressive Web App (PWA) läuft Aqua Vitaeum wie eine echte App im Vollbildmodus, speichert Notizen lokal und funktioniert offline.'
                : 'As a Progressive Web App (PWA), Aqua Vitaeum runs fullscreen like a native app, saves notes locally, and works offline.'}
            </span>
          </div>

          {/* Section: iPhone & iPad (Safari) */}
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-sm font-bold text-[var(--sepia-text)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[var(--wood-dark)] text-white text-xs flex items-center justify-center font-mono">
                iOS
              </span>
              <span>{language === 'DE' ? 'Anleitung für iPhone & iPad (Safari):' : 'Guide for iPhone & iPad (Safari):'}</span>
            </h3>

            <div className="flex flex-col gap-2.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--pub-bg-alt)]/40 border border-[var(--parchment-border)] text-xs text-[var(--sepia-text)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--wood-dark)] text-amber-200 flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--foreground)]">
                    {language === 'DE' ? 'Teilen-Button antippen' : 'Tap the Share Button'}
                  </p>
                  <p className="text-[var(--sepia-muted)] mt-0.5 flex items-center gap-1.5 flex-wrap">
                    {language === 'DE'
                      ? 'Tippe in der Safari-Menüleiste unten auf das Teilen-Symbol'
                      : 'In Safari’s bottom toolbar, tap the Share icon'}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/10 font-mono font-bold text-[11px]">
                      <Share size={12} /> {language === 'DE' ? 'Teilen' : 'Share'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--pub-bg-alt)]/40 border border-[var(--parchment-border)] text-xs text-[var(--sepia-text)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--wood-dark)] text-amber-200 flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--foreground)]">
                    {language === 'DE' ? '„Zum Home-Bildschirm“ wählen' : 'Select “Add to Home Screen”'}
                  </p>
                  <p className="text-[var(--sepia-muted)] mt-0.5 flex items-center gap-1.5 flex-wrap">
                    {language === 'DE'
                      ? 'Scrolle im Menü nach unten und wähle'
                      : 'Scroll down the menu and choose'}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/10 font-mono font-bold text-[11px]">
                      <PlusSquare size={12} /> {language === 'DE' ? 'Zum Home-Bildschirm' : 'Add to Home Screen'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--pub-bg-alt)]/40 border border-[var(--parchment-border)] text-xs text-[var(--sepia-text)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--wood-dark)] text-amber-200 flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--foreground)]">
                    {language === 'DE' ? 'Mit „Hinzufügen“ bestätigen' : 'Confirm by tapping “Add”'}
                  </p>
                  <p className="text-[var(--sepia-muted)] mt-0.5">
                    {language === 'DE'
                      ? 'Tippe oben rechts auf „Hinzufügen“. Das quadratische Aqua Vitaeum App-Icon erscheint sofort auf deinem Homescreen!'
                      : 'Tap “Add” in the top-right corner. The Aqua Vitaeum app icon will appear on your home screen!'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Android & Desktop Info */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-xs text-[var(--sepia-muted)]">
            <Monitor className="w-4 h-4 text-[var(--forest-green)] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[var(--foreground)]">
                {language === 'DE' ? 'Android & Desktop:' : 'Android & Desktop:'}
              </span>{' '}
              {language === 'DE'
                ? 'Auf Android (Chrome) und Mac/PC klicke einfach im Drei-Punkte-Menü (⋮) auf „App installieren“ oder das Installations-Symbol in der Adressleiste.'
                : 'On Android (Chrome) or desktop, tap the three-dot menu (⋮) and select “Install App” or the install icon in the address bar.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:px-6 border-t border-[var(--parchment-divider)] bg-[var(--pub-bg-panel)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-[var(--wood-dark)] text-white hover:bg-[var(--wood-accent)] font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            {language === 'DE' ? 'Verstanden' : 'Got it'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
