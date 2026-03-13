import { useState, useEffect } from 'react';

type QuizSettings = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  fontSize: number;
};

const DEFAULT_SETTINGS: QuizSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  fontSize: 16,
};

export function useQuizSettings() {
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem('quiz-settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load quiz settings", e);
    }
    setLoaded(true);
  }, []);

  const updateSettings = (newSettings: Partial<QuizSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('quiz-settings', JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save quiz settings", e);
      }
      return updated;
    });
  };

  const toggleSound = () => updateSettings({ soundEnabled: !settings.soundEnabled });
  const toggleHaptics = () => updateSettings({ hapticsEnabled: !settings.hapticsEnabled });
  const updateFontSize = (size: number) => updateSettings({ fontSize: size });

  return {
    settings,
    updateSettings,
    toggleSound,
    toggleHaptics,
    updateFontSize,
    loaded
  };
}
