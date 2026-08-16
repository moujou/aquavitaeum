'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useGoogleDriveSync } from '@/hooks/useGoogleDriveSync';
import { X, RefreshCw } from 'lucide-react';

interface WelcomePageProps {
  hasJournals: boolean;
  onComplete: (firstJournalName: string, description?: string) => void;
  onEnter: () => void;
}

export function WelcomePage({ hasJournals, onComplete, onEnter }: WelcomePageProps) {
  const { t } = useLanguage();
  const { connect, isSyncing, syncError } = useGoogleDriveSync();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleEnterClick = () => {
    setIsAnimating(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aqua-vitaeum-welcome-completed', 'true');
    }
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  const handleGoogleSync = async () => {
    const success = await connect();
    if (success) {
      setIsAnimating(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aqua-vitaeum-welcome-completed', 'true');
      }
      setTimeout(() => {
        onEnter();
        window.location.reload();
      }, 600);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const journalName = name.trim() || t('welcomeSubtitle');
    const journalDesc = description.trim();
    
    // Close modal and trigger slide-out fade animation
    setIsModalOpen(false);
    setIsAnimating(true);
    setTimeout(() => {
      // Set completed flag in localStorage
      localStorage.setItem('aqua-vitaeum-welcome-completed', 'true');
      onComplete(journalName, journalDesc || undefined);
    }, 600); // matches transition timing
  };

  const basePath = process.env.NODE_ENV === 'production' ? '/aquavitaeum' : '';

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[var(--pub-bg)] overflow-hidden select-none transition-all duration-700 ease-in-out ${
        isAnimating ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >

      {/* Immersive Emerald Aurora & Malt Glow Atmospheric Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-80">
        {/* Shifting Emerald Fluid Glow Spot 1 */}
        <div
          className="absolute rounded-full bg-gradient-to-tr from-[#164E2F] via-[#237347] to-[#3AB472] w-[60vw] h-[60vw] lg:w-[650px] lg:h-[650px] opacity-75"
          style={{
            top: '-15%',
            left: '-15%',
            filter: 'blur(clamp(50px, 8vw, 85px))',
            animation: 'liquidGlow 18s ease-in-out infinite alternate',
          }}
        />

        {/* Shifting Irish Clover Fluid Glow Spot 2 */}
        <div
          className="absolute rounded-full bg-gradient-to-br from-[#2E945D] via-[#237347] to-[#164E2F] w-[70vw] h-[70vw] lg:w-[750px] lg:h-[750px] opacity-75"
          style={{
            bottom: '-20%',
            right: '-15%',
            filter: 'blur(clamp(55px, 9vw, 95px))',
            animation: 'liquidGlow 22s ease-in-out infinite alternate-reverse',
          }}
        />

        {/* Shifting Central Highland Malt Glow Spot 3 */}
        <div
          className="absolute rounded-full bg-gradient-to-br from-[#C97A1E]/40 via-[#FFD166]/25 to-transparent w-[50vw] h-[50vw] lg:w-[500px] lg:h-[500px] opacity-60"
          style={{
            top: '25%',
            left: '25%',
            filter: 'blur(clamp(60px, 10vw, 100px))',
            animation: 'liquidGlow 26s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Flowing Liquid Waves at the Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-52 overflow-hidden pointer-events-none z-0 opacity-75">
        <svg
          className="absolute bottom-0 w-[200%] h-full animate-wave-slow"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,60 C150,90 350,30 500,60 C650,90 850,30 1000,60 C1150,90 1350,30 1500,60 L1500,120 L0,120 Z"
            fill="url(#emeraldWave1)"
          />
        </svg>
        <svg
          className="absolute bottom-0 w-[200%] h-[90%] animate-wave-fast"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,50 C200,20 400,80 600,50 C800,20 1000,80 1200,50 L1200,120 L0,120 Z"
            fill="url(#emeraldWave2)"
          />
        </svg>
      </div>

      {/* Gradients definition for the liquid waves */}
      <svg className="hidden">
        <defs>
          <linearGradient id="emeraldWave1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#164E2F" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#237347" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--pub-bg)" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="emeraldWave2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E945D" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#237347" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--pub-bg)" stopOpacity="0.98" />
          </linearGradient>
        </defs>
      </svg>

      {/* CSS Animation Keyframes */}
      <style jsx global>{`
        @keyframes liquidGlow {
          0% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
          50% {
            transform: translate(70px, -50px) scale(1.15) rotate(180deg);
          }
          100% {
            transform: translate(-40px, 60px) scale(0.9) rotate(360deg);
          }
        }
        @keyframes waveSlow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes waveFast {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-wave-slow {
          animation: waveSlow 20s linear infinite;
        }
        .animate-wave-fast {
          animation: waveFast 14s linear infinite;
        }
      `}</style>

      {/* Welcome Screen Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full py-16 px-6 max-w-xl mx-auto text-center w-full">
        {/* Upper half: Logo, Brand & Elegant cursive Subtitle */}
        <div className="flex-1 flex flex-col items-center justify-center pt-16">
          {/* Logo */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center mb-6 drop-shadow-[0_12px_32px_rgba(35,115,71,0.30)] animate-fade-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${basePath}/whisky-logo-with-circle-v5.svg`}
              alt="Aqua Vitaeum Logo"
              className="w-full h-full select-none pointer-events-none"
              width={144}
              height={144}
            />
          </div>

          {/* Brand Title */}
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-widest uppercase mb-3">
            {t('welcomeTitle')}
          </h1>

          {/* Subtitle */}
          <p className="font-serif italic text-lg sm:text-xl text-[var(--brass-accent)] tracking-wide">
            {t('welcomeSubtitle')}
          </p>
        </div>

        {/* Bottom half: Action Buttons (Google Drive Sync + Local Continue) */}
        <div className="w-full max-w-sm mt-auto pb-8 flex flex-col items-center gap-3">
          {/* Primary CTA: Google Drive Sync */}
          <button
            type="button"
            disabled={isSyncing}
            onClick={handleGoogleSync}
            className="w-full h-12 rounded-lg bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] border border-[var(--fab-border)] text-[var(--fab-text)] font-body text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md cursor-pointer transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-60"
          >
            {isSyncing ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>{t('googleSyncing')}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t('googleSyncConnect')}</span>
              </>
            )}
          </button>

          {/* Sync Error Notice */}
          {syncError && (
            <p className="text-xs text-red-700 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded border border-red-200 text-center w-full">
              {syncError}
            </p>
          )}

          {/* Subtle 'or' Divider */}
          <div className="flex items-center gap-3 w-full my-0.5">
            <div className="flex-1 h-px bg-[var(--parchment-border)]/60" />
            <span className="text-[11px] font-serif uppercase tracking-widest text-[var(--sepia-light)]">
              {t('googleSyncWelcomeOr')}
            </span>
            <div className="flex-1 h-px bg-[var(--parchment-border)]/60" />
          </div>

          {/* Secondary CTA: Continue Locally */}
          <button
            type="button"
            onClick={hasJournals ? handleEnterClick : () => setIsModalOpen(true)}
            className="w-full h-11 rounded-lg bg-[var(--parchment-bg)] hover:bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] text-[var(--foreground)] font-body text-xs sm:text-sm font-semibold tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            {hasJournals ? t('googleSyncLocalContinue') : t('createFirstJournal')}
          </button>

          {/* Discreet Local-First Privacy Hint */}
          <p className="text-[11px] sm:text-xs font-body text-[var(--sepia-muted)] tracking-wide leading-relaxed text-center mt-2 px-2 opacity-90">
            {t('welcomePrivacyHint')}
          </p>
        </div>
      </div>

      {/* Creation Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-md bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/60 pb-3 mb-5">
              <h3 className="font-display text-base sm:text-lg font-bold text-[var(--foreground)] uppercase tracking-wider">
                {t('createFirstJournal')}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setName('');
                  setDescription('');
                }}
                className="p-1 rounded hover:bg-black/5 text-[var(--sepia-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-body text-[var(--sepia-muted)] mb-2 tracking-wider">
                  Journal Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={40}
                  placeholder={t('journalNamePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-[var(--pub-bg)] border border-[var(--parchment-border)] text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 font-body text-sm focus:outline-none focus:border-[var(--brass-accent)] mb-4"
                />
              </div>

              <div>
                <label className="block text-xs font-body text-[var(--sepia-muted)] mb-2 tracking-wider">
                  Description (optional)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="e.g. My collection of Single Malts..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-[var(--pub-bg)] border border-[var(--parchment-border)] text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 font-body text-sm focus:outline-none focus:border-[var(--brass-accent)]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setName('');
                    setDescription('');
                  }}
                  className="h-10 px-4 rounded-lg bg-[var(--pub-bg-alt)] hover:bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--sepia-muted)] hover:text-[var(--foreground)] text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] border border-[var(--fab-border)] text-[var(--fab-text)] font-semibold text-sm transition-all cursor-pointer shadow-md active:scale-[0.98]"
                >
                  {t('createJournalBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
