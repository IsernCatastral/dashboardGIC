/**
 * DataContext
 * Manages application data state with automatic polling and error handling
 */

import React, { createContext } from 'react';
import { useDataFetch } from '../hooks/useDataFetch';
import { fetchDashboardData } from '../services/api';
import { DashboardData } from '../types/dashboard.types';

/**
 * Data context value interface
 */
export interface DataContextValue {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => void;
}

/**
 * Data context for global dashboard data state management
 */
export const DataContext = createContext<DataContextValue | undefined>(undefined);

/**
 * Data provider component props
 */
interface DataProviderProps {
  children: React.ReactNode;
}

/**
 * Configuration constants for data fetching
 */
const REFRESH_INTERVAL = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;

/**
 * DataProvider component
 * Provides dashboard data state and management functions to the application
 * Automatically polls data at configured intervals with retry logic
 * 
 * Features:
 * - Automatic polling every 30 seconds
 * - Retry logic with exponential backoff (max 3 attempts)
 * - Loading and error states
 * - Manual refetch capability
 * - Last update timestamp tracking
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 8.2**
 */
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { data, isLoading, error, lastUpdate, refetch } = useDataFetch(
    fetchDashboardData,
    {
      refreshInterval: REFRESH_INTERVAL,
      retryAttempts: MAX_RETRY_ATTEMPTS,
      autoStart: true
    }
  );

  const value: DataContextValue = {
    dashboardData: data,
    isLoading,
    error,
    lastUpdate,
    refetch
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
