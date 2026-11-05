/**
 * NavigationContext
 * Manages application navigation state and screen management
 */

import React, { createContext, useState, useCallback } from 'react';
import { Screen } from '../types/navigation.types';

/**
 * Navigation context value interface
 */
export interface NavigationContextValue {
  currentScreen: string;
  screens: Screen[];
  navigateTo: (screenId: string) => void;
  addScreen: (screen: Screen) => void;
}

/**
 * Navigation context for global navigation state management
 */
export const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

/**
 * Navigation provider component props
 */
interface NavigationProviderProps {
  children: React.ReactNode;
}

/**
 * Default screens available in the application
 */
const DEFAULT_SCREENS: Screen[] = [
  {
    id: 'dashboard',
    label: 'GENERAL',
    component: () => React.createElement('div', null, 'Dashboard Screen Placeholder')
  },
  {
    id: 'sifj',
    label: 'SIFJ',
    component: () => React.createElement('div', null, 'SIFJ Screen Placeholder')
  },
  {
    id: 'se',
    label: 'SE',
    component: () => React.createElement('div', null, 'SE Screen Placeholder')
  },
  {
    id: 'gic',
    label: 'GIC',
    component: () => React.createElement('div', null, 'GIC Screen Placeholder')
  }
];

/**
 * NavigationProvider component
 * Provides navigation state and management functions to the application
 * Default screen: 'dashboard'
 */
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [screens, setScreens] = useState<Screen[]>(DEFAULT_SCREENS);
  
  /**
   * Navigate to a specific screen by ID
   * Only navigates if the screen exists in the screens list
   */
  const navigateTo = useCallback((screenId: string) => {
    if (screens.find(s => s.id === screenId)) {
      setCurrentScreen(screenId);
    }
  }, [screens]);
  
  /**
   * Add a new screen to the screens list
   * Does not add if a screen with the same ID already exists
   */
  const addScreen = useCallback((screen: Screen) => {
    setScreens(prev => {
      if (prev.find(s => s.id === screen.id)) {
        return prev;
      }
      return [...prev, screen];
    });
  }, []);
  
  const value: NavigationContextValue = {
    currentScreen,
    screens,
    navigateTo,
    addScreen
  };
  
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
