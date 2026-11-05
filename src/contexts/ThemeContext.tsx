/**
 * ThemeContext
 * Manages application theme state with localStorage persistence
 */

import React, { createContext, useState, useCallback, useEffect } from 'react';

/**
 * Theme context value interface
 */
export interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

/**
 * Theme context for global theme state management
 */
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme provider component props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider component
 * Provides theme state and management functions to the application
 * Persists theme preference to localStorage
 * Default theme: 'dark'
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('dashboard-theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
    }
    return 'dark';
  });
  
  /**
   * Set theme and persist to localStorage
   */
  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('dashboard-theme', newTheme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
    // Apply dark class to document root for Tailwind
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Also set data-theme attribute for CSS variables
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);
  
  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);
  
  // Apply theme attribute and class on mount and when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  const value: ThemeContextValue = {
    theme,
    toggleTheme,
    setTheme
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
