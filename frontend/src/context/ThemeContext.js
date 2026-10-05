import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { getThemeColors, lightColors, darkColors } from '../theme';

const ThemeContext = createContext({
  themeMode: 'light',
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

const THEME_STORAGE_KEY = 'app_theme';

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState('light');

  // Initialize theme from storage or system preferences
  useEffect(() => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
          setThemeModeState(saved);
          return;
        }

        // Auto-detect OS prefer-color-scheme if no prior choice
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setThemeModeState('dark');
        }
      }
    } catch (e) {
      console.warn('Could not read saved theme preference:', e);
    }
  }, []);

  const setThemeMode = (mode) => {
    setThemeModeState(mode);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
      }
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  const isDark = themeMode === 'dark';
  const colors = getThemeColors(themeMode);

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
