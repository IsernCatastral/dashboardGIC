import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDataFetch } from './useDataFetch';

describe('useDataFetch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('initial data loading', () => {
    it('should start with isLoading true and data null', () => {
      const fetchFn = vi.fn().mockResolvedValue({ value: 'test' });

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoStart: false })
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdate).toBeNull();
    });

    it('should fetch data on initial mount when autoStart is true', async () => {
      const mockData = { value: 'test data' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoStart: true, refreshInterval: 10000 })
      );

      // Wait for the fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdate).toBeInstanceOf(Date);
    });

    it('should not fetch data on initial mount when autoStart is false', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ value: 'test' });

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoStart: false })
      );

      // Advance timers to ensure no automatic fetch happens
      vi.advanceTimersByTime(1000);

      expect(fetchFn).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
    });

    it('should update lastUpdate only on successful fetch', async () => {
      const mockData = { value: 'test' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoStart: true })
      );

      expect(result.current.lastUpdate).toBeNull();

      await waitFor(() => {
        expect(result.current.lastUpdate).toBeInstanceOf(Date);
      });

      const firstUpdate = result.current.lastUpdate;
      expect(firstUpdate).not.toBeNull();
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('polling behavior', () => {
    it('should poll at the specified refresh interval', async () => {
      const mockData = { value: 'test' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);
      const refreshInterval = 5000;

      renderHook(() =>
        useDataFetch(fetchFn, { autoStart: true, refreshInterval })
      );

      // Initial fetch
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      // Advance by interval
      vi.advanceTimersByTime(refreshInterval);
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(2);
      });

      // Advance by interval again
      vi.advanceTimersByTime(refreshInterval);
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(3);
      });
    });

    it('should use default refresh interval of 30 seconds when not specified', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ value: 'test' });

      renderHook(() => useDataFetch(fetchFn, { autoStart: true }));

      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      // Advance by default interval (30000ms)
      vi.advanceTimersByTime(30000);
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(2);
      });
    });

    it('should not show loading state during background polling', async () => {
      const mockData = { value: 'test' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);
      const refreshInterval = 5000;

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoStart: true, refreshInterval })
      );

      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);

      // Advance by interval to trigger background poll
      vi.advanceTimersByTime(refreshInterval);

      // isLoading should remain false during background update
      expect(result.current.isLoading).toBe(false);

      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(2);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should set error state when fetch fails', async () => {
      const errorMessage = 'Network error';
      const fetchFn = vi.fn().mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoStart: true, retryAttempts: 1 })
      );

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.lastUpdate).toBeNull();
    });

    it('should keep last successful data when subsequent fetch fails', async () => {
      const mockData = { value: 'test' };
      const fetchFn = vi
        .fn()
        .mockResolvedValueOnce(mockData)
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, {
          autoStart: true,
          refreshInterval: 5000,
          retryAttempts: 1,
        })
      );

      // Wait for initial successful fetch
      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      const lastUpdateBeforeError = result.current.lastUpdate;
      expect(result.current.error).toBeNull();

      // Trigger polling that will fail
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      // Data should still be available
      expect(result.current.data).toEqual(mockData);
      // lastUpdate should not change on error
      expect(result.current.lastUpdate).toEqual(lastUpdateBeforeError);
    });

    it('should not update lastUpdate when fetch fails', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoStart: true, retryAttempts: 1 })
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Failed');
      });

      expect(result.current.lastUpdate).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('retry logic with exponential backoff', () => {
    it('should retry up to max attempts with exponential backoff', async () => {
      const fetchFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockRejectedValueOnce(new Error('Attempt 3'));

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, {
          autoStart: true,
          retryAttempts: 3,
          retryDelay: 1000,
        })
      );

      // Initial attempt
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      // First retry after 1s (2^0 * 1000)
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(2);
      });

      // Second retry after 2s (2^1 * 1000)
      vi.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(3);
      });

      // All retries exhausted
      await waitFor(() => {
        expect(result.current.error).toBe('Attempt 3');
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should stop retrying after successful fetch', async () => {
      const mockData = { value: 'success' };
      const fetchFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockResolvedValueOnce(mockData);

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, {
          autoStart: true,
          retryAttempts: 3,
          retryDelay: 1000,
        })
      );

      // Initial attempt fails
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      // First retry succeeds
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(fetchFn).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should use default retry attempts of 3 when not specified', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('Failed'));

      renderHook(() =>
        useDataFetch(fetchFn, {
          autoStart: true,
          retryDelay: 100,
        })
      );

      // Wait for initial attempt
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      // Wait for all retries with short delays
      vi.advanceTimersByTime(100); // 2^0 * 100
      await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));

      vi.advanceTimersByTime(200); // 2^1 * 100
      await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(3));

      // Total attempts should be 3 (default)
      expect(fetchFn).toHaveBeenCalledTimes(3);
    });

    it('should calculate exponential backoff correctly', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('Failed'));
      const retryDelay = 1000;

      renderHook(() =>
        useDataFetch(fetchFn, {
          autoStart: true,
          retryAttempts: 3,
          retryDelay,
        })
      );

      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      // First retry: 1000ms (2^0 * 1000)
      vi.advanceTimersByTime(999);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(1);
      await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));

      // Second retry: 2000ms (2^1 * 1000)
      vi.advanceTimersByTime(1999);
      expect(fetchFn).toHaveBeenCalledTimes(2);
      vi.advanceTimersByTime(1);
      await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(3));
    });
  });

  describe('manual refetch', () => {
    it('should provide refetch function that triggers immediate fetch', async () => {
      const mockData = { value: 'test' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoStart: false })
      );

      expect(fetchFn).not.toHaveBeenCalled();

      // Call refetch manually
      result.current.refetch();

      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should reset retry counter on manual refetch', async () => {
      const mockData = { value: 'success' };
      const fetchFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockRejectedValueOnce(new Error('Attempt 3'))
        .mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, {
          autoStart: true,
          retryAttempts: 3,
          retryDelay: 100,
        })
      );

      // Wait for all initial retries to fail
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      vi.advanceTimersByTime(100);
      await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));

      vi.advanceTimersByTime(200);
      await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(3));

      // Now manual refetch should work
      result.current.refetch();

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(result.current.error).toBeNull();
    });

    it('should allow multiple manual refetches', async () => {
      const mockData1 = { value: 'data1' };
      const mockData2 = { value: 'data2' };
      const mockData3 = { value: 'data3' };

      const fetchFn = vi
        .fn()
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2)
        .mockResolvedValueOnce(mockData3);

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoStart: false })
      );

      result.current.refetch();
      await waitFor(() => expect(result.current.data).toEqual(mockData1));

      result.current.refetch();
      await waitFor(() => expect(result.current.data).toEqual(mockData2));

      result.current.refetch();
      await waitFor(() => expect(result.current.data).toEqual(mockData3));

      expect(fetchFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('edge cases', () => {
    it('should handle concurrent fetch attempts gracefully', async () => {
      const mockData = { value: 'test' };
      let resolvePromise: (value: any) => void;
      const fetchFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
      );

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoStart: true, refreshInterval: 1000 })
      );

      // Initial fetch is pending
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Try to trigger refetch while first is pending
      result.current.refetch();

      // Should still only have one call (concurrent prevention)
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Resolve the pending fetch
      resolvePromise!(mockData);

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });
    });

    it('should handle empty error message gracefully', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error(''));

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoStart: true, retryAttempts: 1 })
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Error al obtener datos');
      });
    });

    it('should handle non-Error thrown values', async () => {
      const fetchFn = vi.fn().mockRejectedValue('String error');

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoStart: true, retryAttempts: 1 })
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Error al obtener datos');
      });
    });

    it('should update lastUpdate timestamp on each successful fetch', async () => {
      const mockData1 = { value: 'data1' };
      const mockData2 = { value: 'data2' };

      const fetchFn = vi
        .fn()
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2);

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, {
          autoStart: true,
          refreshInterval: 5000,
        })
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData1);
      });

      const firstUpdate = result.current.lastUpdate;
      expect(firstUpdate).toBeInstanceOf(Date);

      // Wait a bit to ensure timestamp will be different
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData2);
      });

      const secondUpdate = result.current.lastUpdate;
      expect(secondUpdate).toBeInstanceOf(Date);
      expect(secondUpdate).not.toEqual(firstUpdate);
    });

    it('should cleanup properly on unmount', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ value: 'test' });

      const { unmount } = renderHook(() =>
        useDataFetch(fetchFn, {
          autoStart: true,
          refreshInterval: 1000,
        })
      );

      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      unmount();

      // After unmount, polling should stop
      vi.advanceTimersByTime(5000);
      expect(fetchFn).toHaveBeenCalledTimes(1); // No additional calls
    });
  });

  describe('integration with usePolling', () => {
    it('should integrate correctly with usePolling hook', async () => {
      const mockData = { value: 'test' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);
      const refreshInterval = 3000;

      renderHook(() =>
        useDataFetch(fetchFn, {
          autoStart: true,
          refreshInterval,
        })
      );

      // Initial fetch
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      // First poll
      vi.advanceTimersByTime(refreshInterval);
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(2);
      });

      // Second poll
      vi.advanceTimersByTime(refreshInterval);
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(3);
      });
    });

    it('should pass correct options to usePolling', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ value: 'test' });

      renderHook(() =>
        useDataFetch(fetchFn, {
          autoStart: false,
          refreshInterval: 10000,
        })
      );

      // With autoStart false, should not fetch initially
      expect(fetchFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(10000);
      expect(fetchFn).not.toHaveBeenCalled();
    });
  });
});
