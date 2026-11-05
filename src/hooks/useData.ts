/**
 * useData Hook
 * Provides access to data context and dashboard data management functions
 */

import { useContext } from 'react';
import { DataContext } from '../contexts/DataContext';

/**
 * Custom hook to access data context
 * Must be used within a DataProvider
 * 
 * @throws Error if used outside of DataProvider
 * @returns Dashboard data state and management functions
 */
export function useData() {
  const context = useContext(DataContext);
  
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  
  return context;
}
