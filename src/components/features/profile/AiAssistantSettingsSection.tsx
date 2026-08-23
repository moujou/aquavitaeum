'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Key,
  ExternalLink,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Info,
} from 'lucide-react';
import {
  getStoredAiApiKey,
  setStoredAiApiKey,
  removeStoredAiApiKey,
  getMaskedAiApiKey,
  testAiAssistantConnection,
} from '@/services/ai-assistant-service';
import { cn } from '@/lib/utils';

export function AiAssistantSettingsSection() {
  const { language } = useLanguage();
  const [storedKey, setStoredKey] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? getStoredAiApiKey() : null;
  });
  const [inputKey, setInputKey] = useState('');
  const [isEditing, setIsEditing] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? !getStoredAiApiKey() : true;
  });
  const [showKeyText, setShowKeyText] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const handleKeyChanged = () => {
      const key = getStoredAiApiKey();
      setStoredKey(key);
      if (!key) {
        setIsEditing(true);
      }
    };

    window.addEventListener('aqua_ai_key_changed', handleKeyChanged);
    return () => window.removeEventListener('aqua_ai_key_changed', handleKeyChanged);
  }, []);

  const handleSaveAndTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = inputKey.trim();
    if (!cleanKey) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testAiAssistantConnection(cleanKey, language as 'DE' | 'EN');
      if (res.success) {
        setStoredAiApiKey(cleanKey);
        setStoredKey(cleanKey);
        setInputKey('');
        setIsEditing(false);
        setTestResult({
          type: 'success',
          message:
            language === 'DE'
              ? 'API-Key erfolgreich verifiziert und sicher auf diesem Gerät gespeichert!'
              : 'API key successfully verified and securely stored on this device!',
        });
      } else {
        setTestResult({
          type: 'error',
          message:
            language === 'DE'
              ? `Verbindung fehlgeschlagen: ${res.message}`
              : `Connection failed: ${res.message}`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        type: 'error',
        message:
          language === 'DE'
            ? `Fehler beim Testen: ${msg}`
            : `Test error: ${msg}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleLiveTest = async () => {
    if (!storedKey) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testAiAssistantConnection(storedKey, language as 'DE' | 'EN');
      setTestResult({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        type: 'error',
        message: msg,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemove = () => {
    removeStoredAiApiKey();
    setStoredKey(null);
    setInputKey('');
    setIsEditing(true);
    setTestResult({
      type: 'success',
      message:
        language === 'DE'
          ? 'API-Key wurde von diesem Gerät entfernt.'
          : 'API key has been removed from this device.',
    });
  };

  const hasActiveKey = Boolean(storedKey && storedKey.length > 0);

  return (
    <div className="flex flex-col p-4 sm:p-5 border-t border-[var(--parchment-divider)] transition-colors">
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-lg border bg-[var(--forest-green)]/10 border-[var(--forest-green)]/30 text-[var(--forest-green)] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm sm:text-base font-semibold text-[var(--foreground)]">
              {language === 'DE' ? 'Cask & Spirit Assistent' : 'Cask & Spirit Assistant'}
            </p>
            <p className="font-body text-xs text-[var(--sepia-muted)] mt-0.5">
              {language === 'DE'
                ? 'Automatische Flaschen-, Etikett- und Fass-Erkennung (BYOK)'
                : 'Automated bottle, label and cask identification (BYOK)'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {hasActiveKey && !isEditing && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/30 text-[var(--forest-green)] text-xs font-mono font-semibold shrink-0 shadow-2xs">
            <CheckCircle2 size={13} className="shrink-0" />
            <span>{language === 'DE' ? 'Aktiv' : 'Active'}</span>
          </div>
        )}
      </div>

      {/* ── Mode 1: Active Key Display ── */}
      {hasActiveKey && !isEditing ? (
        <div className="mt-4 flex flex-col gap-3 p-3.5 rounded-xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Key size={16} className="text-[var(--forest-green)] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-mono text-[var(--sepia-text)] font-semibold truncate tracking-wider">
                  {getMaskedAiApiKey(storedKey || '')}
                </p>
                <p className="text-[11px] text-[var(--sepia-muted)]">
                  {language === 'DE' ? 'Lokal auf diesem Gerät gespeichert' : 'Stored locally on this device'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleLiveTest}
                disabled={isTesting}
                className="px-3 py-2 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg-alt)] hover:bg-black/5 text-[var(--sepia-text)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95 min-h-[38px]"
                title={language === 'DE' ? 'Verbindung testen' : 'Test connection'}
              >
                <RefreshCw size={13} className={cn(isTesting && 'animate-spin text-[var(--forest-green)]')} />
                <span>{language === 'DE' ? 'Testen' : 'Test'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputKey(storedKey || '');
                  setIsEditing(true);
                  setTestResult(null);
                }}
                className="px-3 py-2 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg-alt)] hover:bg-black/5 text-[var(--sepia-text)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 min-h-[38px]"
                title={language === 'DE' ? 'Key ändern' : 'Edit key'}
              >
                <Edit2 size={13} />
                <span>{language === 'DE' ? 'Ändern' : 'Edit'}</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-transparent text-[var(--sepia-muted)] hover:text-red-700 hover:bg-red-500/10 hover:border-red-300 text-xs transition-all cursor-pointer min-h-[38px]"
                title={language === 'DE' ? 'Key entfernen' : 'Remove key'}
                aria-label={language === 'DE' ? 'Key entfernen' : 'Remove key'}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Mode 2: Setup / Edit Form ── */
        <form onSubmit={handleSaveAndTest} className="mt-4 flex flex-col gap-3">
          {/* Explanation Box with Google AI Studio Link */}
          <div className="p-3.5 rounded-xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] flex flex-col gap-2 shadow-xs">
            <div className="flex items-start gap-2 text-xs font-body leading-relaxed">
              <Info size={16} className="text-[var(--forest-green)] shrink-0 mt-0.5" />
              <span className="text-[var(--foreground)]">
                {language === 'DE'
                  ? 'Kostenlos & privat: Aqua Vitaeum nutzt deinen eigenen Google Gemini API-Key.'
                  : 'Free & private: Aqua Vitaeum uses your personal Google Gemini API key.'}
              </span>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg bg-[var(--forest-green)]/10 hover:bg-[var(--forest-green)]/20 border border-[var(--forest-green)]/30 text-[var(--forest-green)] text-xs font-display font-semibold transition-all cursor-pointer mt-1"
            >
              <span>{language === 'DE' ? 'Kostenlosen Key bei Google AI Studio erstellen' : 'Get free key at Google AI Studio'}</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Key Input Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="gemini-api-key-input" className="text-xs font-display font-bold text-[var(--sepia-text)]">
              {language === 'DE' ? 'Google Gemini API-Key eingeben' : 'Enter Google Gemini API Key'}
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 flex items-center bg-[var(--parchment-bg)] border-[1.5px] border-[var(--forest-green)]/45 focus-within:border-[var(--forest-green)] rounded-xl px-3.5 h-11 transition-all duration-200 shadow-xs">
                <Key size={16} className="text-[var(--forest-green)] mr-2.5 shrink-0" />
                <input
                  id="gemini-api-key-input"
                  type={showKeyText ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-transparent text-sm font-mono text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/50 focus:outline-none tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowKeyText(!showKeyText)}
                  className="text-[var(--sepia-muted)] hover:text-[var(--foreground)] p-1 rounded transition-colors cursor-pointer"
                  title={showKeyText ? 'Verbergen' : 'Anzeigen'}
                  aria-label={showKeyText ? 'Verbergen' : 'Anzeigen'}
                >
                  {showKeyText ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="submit"
                  disabled={!inputKey.trim() || isTesting}
                  className="flex-1 sm:flex-initial h-11 px-4 rounded-xl bg-[var(--wood-dark)] text-white hover:bg-[var(--wood-accent)] font-display font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-amber-200" />
                      <span>{language === 'DE' ? 'Prüfe...' : 'Testing...'}</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span>{language === 'DE' ? 'Speichern & Testen' : 'Save & Test'}</span>
                    </>
                  )}
                </button>

                {hasActiveKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setInputKey('');
                      setTestResult(null);
                    }}
                    className="h-11 px-3 rounded-xl border border-[var(--parchment-border)] bg-[var(--pub-bg-alt)] hover:bg-black/5 text-[var(--sepia-text)] font-semibold text-xs transition-all cursor-pointer"
                  >
                    {language === 'DE' ? 'Abbrechen' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ── Test Result Banner (High Contrast Dark Text / Black) ── */}
      {testResult && (
        <div
          className={cn(
            'mt-3 p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-fade-in shadow-xs bg-[var(--pub-bg-panel)] border-[var(--parchment-border)]'
          )}
        >
          {testResult.type === 'success' ? (
            <CheckCircle2 size={18} className="text-[var(--forest-green)] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed text-[var(--foreground)] font-semibold">
            {testResult.message}
          </span>
        </div>
      )}
    </div>
  );
}
