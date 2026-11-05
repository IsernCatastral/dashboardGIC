import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Configuration options for the usePolling hook
 */
export interface UsePollingOptions {
  /**
   * The interval in milliseconds between each poll
   * @default 30000 (30 seconds)
   */
  interval?: number;
  
  /**
   * Whether to start polling automatically when the hook is mounted
   * @default true
   */
  autoStart?: boolean;
}

/**
 * Return type of the usePolling hook
 */
export interface UsePollingReturn {
  /**
   * Start the polling interval
   */
  start: () => void;
  
  /**
   * Stop the polling interval
   */
  stop: () => void;
  
  /**
   * Whether polling is currently active
   */
  isActive: boolean;
}

/**
 * Custom hook for polling a callback function at a specified interval
 * 
 * Features:
 * - Configurable polling interval
 * - Auto-start option
 * - Manual start/stop controls
 * - Proper cleanup on unmount
 * - Handles callback and interval changes
 * 
 * @param callback - The function to call on each poll
 * @param options - Configuration options
 * @returns Object with start, stop functions and isActive state
 * 
 * @example
 * ```typescript
 * const { start, stop, isActive } = usePolling(
 *   () => fetchData(),
 *   { interval: 5000, autoStart: true }
 * );
 * ```
 * 
 * **Validates: Requirements 5.2**
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions = {}
): UsePollingReturn {
  const {
    interval = 30000,
    autoStart = true,
  } = options;

  const [isActive, setIsActive] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup interval
  const cleanup = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start polling
  const start = useCallback(() => {
    // Prevent multiple intervals
    if (intervalRef.current !== null) {
      return;
    }

    setIsActive(true);

    // Call immediately
    try {
      callbackRef.current();
    } catch (error) {
      // Silently catch errors to prevent polling from stopping
      console.error('Polling callback error:', error);
    }

    // Setup interval
    intervalRef.current = setInterval(() => {
      try {
        callbackRef.current();
      } catch (error) {
        // Silently catch errors to prevent polling from stopping
        console.error('Polling callback error:', error);
      }
    }, interval);
  }, [interval]);

  // Stop polling
  const stop = useCallback(() => {
    cleanup();
    setIsActive(false);
  }, [cleanup]);

  // Auto-start on mount if enabled
  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      cleanup();
    };
  }, []); // Only run on mount/unmount

  // Restart polling when interval or callback changes (if currently active)
  useEffect(() => {
    if (isActive && intervalRef.current !== null) {
      stop();
      start();
    }
  }, [interval, callback]); // Restart when these change

  return {
    start,
    stop,
    isActive,
  };
}
