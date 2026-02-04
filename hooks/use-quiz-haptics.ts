import { useCallback } from 'react';
import { useQuizSettings } from './use-quiz-settings';

export function useQuizHaptics() {
  const { settings } = useQuizSettings();

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!settings.hapticsEnabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, [settings.hapticsEnabled]);

  const hapticSuccess = useCallback(() => {
    // Two short pulses
    vibrate([50, 50, 50]);
  }, [vibrate]);

  const hapticError = useCallback(() => {
    // One long heavy pulse
    vibrate(300);
  }, [vibrate]);

  const hapticImpact = useCallback(() => {
    // Very short pulse for button taps
    vibrate(20);
  }, [vibrate]);

  return { hapticSuccess, hapticError, hapticImpact };
}
