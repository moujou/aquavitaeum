'use client';

import { useState, useEffect } from 'react';
import { hasConfiguredAiApiKey } from '@/services/ai-assistant-service';

export function useAiAssistantConfig() {
  const [hasAiKey, setHasAiKey] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return hasConfiguredAiApiKey();
  });

  useEffect(() => {
    const update = () => {
      setHasAiKey(hasConfiguredAiApiKey());
    };

    update();
    window.addEventListener('storage', update);
    window.addEventListener('aqua_ai_key_changed', update);

    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('aqua_ai_key_changed', update);
    };
  }, []);

  return { hasAiKey };
}
