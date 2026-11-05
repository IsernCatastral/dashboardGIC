import { useState, useCallback, useRef, useEffect } from 'react';
import { usePolling } from './usePolling';

/**
 * Configuration options for the useDataFetch hook
 */
export interface UseDataFetchOptions {
  /**
   * Polling interval in milliseconds
   * @default 30000 (30 seconds)
   */
  refreshInterval?: number;

  /**
   * Maximum number of retry attempts on failure
   * @default 3
   */
  retryAttempts?: number;

  /**
   * Initial retry delay in milliseconds for exponential backoff
   * @default 1000 (1 second)
   */
  retryDelay?: number;

  /**
   * Whether to start polling automatically
   * @default true
   */
  autoStart?: boolean;
}

/**
 * Return type of the useDataFetch hook
 */
export interface UseDataFetchResult<T> {
  /**
   * The fetched data, or null if not yet loaded
   */
  data: T | null;

  /**
   * Whether data is currently being loaded
   */
  isLoading: boolean;

  /**
   * Error message if fetch failed, null otherwise
   */
  error: string | null;

  /**
   * Timestamp of the last successful data fetch
   */
  lastUpdate: Date | null;

  /**
   * Manually trigger a data refetch
   */
  refetch: () => void;
}

/**
 * Custom hook for fetching data with automatic polling and retry logic
 * 
 * Features:
 * - Automatic polling at configurable intervals
 * - Exponential backoff retry strategy (max 3 attempts)
 * - Manual refetch capability
 * - Loading and error states
 * - Timestamp tracking for successful updates
 * 
 * @param fetchFn - The async function to fetch data
 * @param options - Configuration options
 * @returns Object with data, loading, error states and refetch function
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error, lastUpdate, refetch } = useDataFetch(
 *   fetchDashboardData,
 *   { refreshInterval: 30000, retryAttempts: 3 }
 * );
 * ```
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 7.4, 8.2**
 */
export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseDataFetchOptions = {}
): UseDataFetchResult<T> {
  const {
    refreshInterval = 30000,
    retryAttempts = 3,
    retryDelay = 1000,
    autoStart = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Use ref to track if this is the initial load
  const isInitialLoad = useRef(true);
  const retryCountRef = useRef(0);
  const isFetchingRef = useRef(false);

  /**
   * Exponential backoff delay calculation
   */
  const getBackoffDelay = useCallback((attempt: number): number => {
    return retryDelay * Math.pow(2, attempt);
  }, [retryDelay]);

  /**
   * Core fetch logic with retry and exponential backoff
   */
  const fetchData = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    // Only show loading on initial load
    if (isInitialLoad.current) {
      setIsLoading(true);
    }

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < retryAttempts) {
      try {
        const result = await fetchFn();

        // Success: update state
        setData(result);
        setError(null);
        setLastUpdate(new Date());
        setIsLoading(false);

        // Reset retry counter and initial load flag
        retryCountRef.current = 0;
        isInitialLoad.current = false;
        isFetchingRef.current = false;

        return;
      } catch (err) {
        lastError = err as Error;
        attempt++;
        retryCountRef.current = attempt;

        // If not the last attempt, wait with exponential backoff
        if (attempt < retryAttempts) {
          const delay = getBackoffDelay(attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    const errorMessage = lastError?.message || 'Error al obtener datos';
    setError(errorMessage);
    setIsLoading(false);
    isInitialLoad.current = false;
    isFetchingRef.current = false;
  }, [fetchFn, retryAttempts, getBackoffDelay]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(() => {
    // Reset retry counter for manual refetch
    retryCountRef.current = 0;
    fetchData();
  }, [fetchData]);

  // Setup polling
  usePolling(fetchData, {
    interval: refreshInterval,
    autoStart,
  });

  // Initial fetch on mount (if autoStart is true)
  useEffect(() => {
    if (autoStart) {
      fetchData();
    }
  }, []); // Only run on mount

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    refetch,
  };
}
