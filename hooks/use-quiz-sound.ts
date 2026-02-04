import { useCallback } from 'react';
import { useQuizSettings } from './use-quiz-settings';

export function useQuizSound() {
  const { settings } = useQuizSettings();

  const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, startTime: number, ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }, []);

  const playCorrect = useCallback(() => {
    if (!settings.soundEnabled) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    // Play a happy major chord (C5 - E5 - G5)
    playTone(523.25, 'sine', 0.4, now, ctx);       // C5
    playTone(659.25, 'sine', 0.4, now + 0.1, ctx); // E5
    playTone(783.99, 'sine', 0.6, now + 0.2, ctx); // G5
  }, [playTone, settings.soundEnabled]);

  const playIncorrect = useCallback(() => {
    if (!settings.soundEnabled) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    // Play a sad descending tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.4);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }, [settings.soundEnabled]);

  const playComplete = useCallback(() => {
    if (!settings.soundEnabled) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    // Victory fanfare
    playTone(523.25, 'square', 0.2, now, ctx);       // C5
    playTone(523.25, 'square', 0.2, now + 0.2, ctx); // C5
    playTone(523.25, 'square', 0.2, now + 0.4, ctx); // C5
    playTone(659.25, 'square', 0.6, now + 0.6, ctx); // E5
    playTone(783.99, 'square', 0.8, now + 0.8, ctx); // G5
  }, [playTone, settings.soundEnabled]);

  return { playCorrect, playIncorrect, playComplete };
}
