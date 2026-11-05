/**
 * useNavigation Hook
 * Provides access to navigation context and navigation management functions
 */

import { useContext } from 'react';
import { NavigationContext } from '../contexts/NavigationContext';
import { Screen } from '../types/navigation.types';

/**
 * Result type for useNavigation hook
 */
export interface UseNavigationResult {
  currentScreen: string;
  screens: Screen[];
  navigateTo: (screenId: string) => void;
  addScreen: (screen: Screen) => void;
}

/**
 * Custom hook to access navigation context
 * Must be used within a NavigationProvider
 * 
 * @throws Error if used outside of NavigationProvider
 * @returns Navigation state and management functions
 */
export function useNavigation(): UseNavigationResult {
  const context = useContext(NavigationContext);
  
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  
  return context;
}
