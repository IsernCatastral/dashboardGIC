/**
 * useTheme Hook
 * Provides access to theme context and theme management functions
 */

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * Result type for useTheme hook
 */
export interface UseThemeResult {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

/**
 * Custom hook to access theme context
 * Must be used within a ThemeProvider
 * 
 * @throws Error if used outside of ThemeProvider
 * @returns Theme state and management functions
 */
export function useTheme(): UseThemeResult {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}
