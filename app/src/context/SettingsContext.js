import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STEP_THRESHOLD, DAILY_STEP_GOAL } from '../constants/theme';

const DEFAULTS = {
  threshold: STEP_THRESHOLD,
  dailyGoal: DAILY_STEP_GOAL,
  blockedApps: {
    instagram: true,
    tiktok: true,
    youtube: true,
    twitter: false,
    snapchat: false,
    reddit: false,
  },
  strictMode: false,
  haptics: true,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const raw = await AsyncStorage.getItem('settings');
      if (raw) {
        const saved = JSON.parse(raw);
        setSettings({
            ...DEFAULTS,
            ...saved,
            blockedApps: { ...DEFAULTS.blockedApps, ...(saved.blockedApps || {}) },
        });
      }
    } catch (e) {
      console.log('failed to load settings', e);
    } finally {
      setLoaded(true);
    }
  };

  const updateSettings = async (newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(merged));
    } catch (e) {
      console.log('failed to save settings', e);
    }
  };

  if (!loaded) return null;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}