"use client"

import { useEffect } from 'react';
import { useQuizSettings } from './use-quiz-settings';

export function useGlobalZoom() {
  const { settings } = useQuizSettings();

  useEffect(() => {
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.zoom = `${settings.zoom}`;
    }
  }, [settings.zoom]);
}
