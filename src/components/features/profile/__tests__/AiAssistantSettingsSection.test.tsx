import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AiAssistantSettingsSection } from '../AiAssistantSettingsSection';
import { LanguageProvider } from '@/context/LanguageContext';
import * as aiService from '@/services/ai-assistant-service';

describe('AiAssistantSettingsSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const renderSection = () => {
    return render(
      <LanguageProvider>
        <AiAssistantSettingsSection />
      </LanguageProvider>
    );
  };

  it('renders API key input when no key is stored', () => {
    renderSection();
    expect(screen.getByText(/Cask & Spirit Assistent|Cask & Spirit Assistant/)).toBeDefined();
    expect(screen.getByPlaceholderText('AIzaSy...')).toBeDefined();
    expect(screen.getByText(/Schlüssel speichern|Save/i)).toBeDefined();
  });

  it('saves and tests API key on submission', async () => {
    vi.spyOn(aiService, 'testAiAssistantConnection').mockResolvedValue({
      success: true,
      message: 'Verbindung zu Google Gemini erfolgreich hergestellt!',
    });

    renderSection();
    const input = screen.getByPlaceholderText('AIzaSy...');
    fireEvent.change(input, { target: { value: 'AIzaValidKey12345' } });

    const saveBtn = screen.getByText(/Schlüssel speichern|Save/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/erfolgreich|successfully/i)).toBeDefined();
    });

    expect(aiService.getStoredAiApiKey()).toBe('AIzaValidKey12345');
  });

  it('renders masked key and allows removing it', async () => {
    aiService.setStoredAiApiKey('AIzaValidKey12345');

    renderSection();
    expect(screen.getByText(/•••••••••••••2345/)).toBeDefined();

    const removeBtn = screen.getByRole('button', { name: /entfernen|Remove/i });
    fireEvent.click(removeBtn);

    expect(aiService.getStoredAiApiKey()).toBeNull();
  });
});
