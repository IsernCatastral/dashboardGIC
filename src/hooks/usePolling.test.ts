import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePolling } from './usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('basic functionality', () => {
    it('should call the callback function immediately when auto-start is true', () => {
      const callback = vi.fn();
      
      renderHook(() => usePolling(callback, { interval: 1000, autoStart: true }));
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not call the callback immediately when auto-start is false', () => {
      const callback = vi.fn();
      
      renderHook(() => usePolling(callback, { interval: 1000, autoStart: false }));
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call the callback at the specified interval', async () => {
      const callback = vi.fn();
      const interval = 1000;
      
      renderHook(() => usePolling(callback, { interval, autoStart: true }));
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(interval);
      expect(callback).toHaveBeenCalledTimes(2);
      
      vi.advanceTimersByTime(interval);
      expect(callback).toHaveBeenCalledTimes(3);
      
      vi.advanceTimersByTime(interval);
      expect(callback).toHaveBeenCalledTimes(4);
    });

    it('should start polling when start is called', () => {
      const callback = vi.fn();
      const interval = 1000;
      
      const { result } = renderHook(() => 
        usePolling(callback, { interval, autoStart: false })
      );
      
      expect(callback).not.toHaveBeenCalled();
      
      result.current.start();
      expect(callback).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(interval);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should stop polling when stop is called', () => {
      const callback = vi.fn();
      const interval = 1000;
      
      const { result } = renderHook(() => 
        usePolling(callback, { interval, autoStart: true })
      );
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(interval);
      expect(callback).toHaveBeenCalledTimes(2);
      
      result.current.stop();
      
      vi.advanceTimersByTime(interval * 3);
      expect(callback).toHaveBeenCalledTimes(2); // Should not increase
    });

    it('should toggle polling when start is called after stop', () => {
      const callback = vi.fn();
      const interval = 1000;
      
      const { result } = renderHook(() => 
        usePolling(callback, { interval, autoStart: true })
      );
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      result.current.stop();
      vi.advanceTimersByTime(interval * 2);
      expect(callback).toHaveBeenCalledTimes(1); // Should not increase
      
      result.current.start();
      expect(callback).toHaveBeenCalledTimes(2); // Called immediately on start
      
      vi.advanceTimersByTime(interval);
      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe('cleanup', () => {
    it('should cleanup interval on unmount', () => {
      const callback = vi.fn();
      const interval = 1000;
      
      const { unmount } = renderHook(() => 
        usePolling(callback, { interval, autoStart: true })
      );
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(interval);
      expect(callback).toHaveBeenCalledTimes(2);
      
      unmount();
      
      vi.advanceTimersByTime(interval * 3);
      expect(callback).toHaveBeenCalledTimes(2); // Should not increase after unmount
    });

    it('should cleanup and restart interval when interval changes', () => {
      const callback = vi.fn();
      
      const { rerender } = renderHook(
        ({ interval }) => usePolling(callback, { interval, autoStart: true }),
        { initialProps: { interval: 1000 } }
      );
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(2);
      
      // Change interval
      rerender({ interval: 2000 });
      expect(callback).toHaveBeenCalledTimes(3); // Called immediately on restart
      
      vi.advanceTimersByTime(2000);
      expect(callback).toHaveBeenCalledTimes(4);
      
      // Old interval should not trigger
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(4); // No change
    });

    it('should cleanup and restart when callback changes', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const interval = 1000;
      
      const { rerender } = renderHook(
        ({ cb }) => usePolling(cb, { interval, autoStart: true }),
        { initialProps: { cb: callback1 } }
      );
      
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(interval);
      expect(callback1).toHaveBeenCalledTimes(2);
      expect(callback2).not.toHaveBeenCalled();
      
      // Change callback
      rerender({ cb: callback2 });
      expect(callback2).toHaveBeenCalledTimes(1); // Called immediately on restart
      
      vi.advanceTimersByTime(interval);
      expect(callback1).toHaveBeenCalledTimes(2); // No more calls to old callback
      expect(callback2).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple start calls without creating multiple intervals', () => {
      const callback = vi.fn();
      const interval = 1000;
      
      const { result } = renderHook(() => 
        usePolling(callback, { interval, autoStart: false })
      );
      
      result.current.start();
      result.current.start();
      result.current.start();
      
      expect(callback).toHaveBeenCalledTimes(1); // Only one initial call
      
      vi.advanceTimersByTime(interval);
      expect(callback).toHaveBeenCalledTimes(2); // Only one interval running
    });

    it('should handle multiple stop calls safely', () => {
      const callback = vi.fn();
      const interval = 1000;
      
      const { result } = renderHook(() => 
        usePolling(callback, { interval, autoStart: true })
      );
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      result.current.stop();
      result.current.stop();
      result.current.stop();
      
      vi.advanceTimersByTime(interval * 2);
      expect(callback).toHaveBeenCalledTimes(1); // Should stay stopped
    });

    it('should use default interval when not provided', () => {
      const callback = vi.fn();
      
      renderHook(() => usePolling(callback, { autoStart: true }));
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      // Default interval should be 30000ms (30 seconds)
      vi.advanceTimersByTime(30000);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should auto-start by default when autoStart is not provided', () => {
      const callback = vi.fn();
      
      renderHook(() => usePolling(callback, { interval: 1000 }));
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle async callbacks correctly', async () => {
      const asyncCallback = vi.fn().mockResolvedValue(undefined);
      const interval = 1000;
      
      renderHook(() => usePolling(asyncCallback, { interval, autoStart: true }));
      
      expect(asyncCallback).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(interval);
      expect(asyncCallback).toHaveBeenCalledTimes(2);
      
      vi.advanceTimersByTime(interval);
      expect(asyncCallback).toHaveBeenCalledTimes(3);
    });

    it('should continue polling even if callback throws an error', () => {
      const callback = vi.fn()
        .mockImplementationOnce(() => { throw new Error('Test error'); })
        .mockImplementationOnce(() => { throw new Error('Test error'); })
        .mockImplementation(() => {});
      const interval = 1000;
      
      renderHook(() => usePolling(callback, { interval, autoStart: true }));
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(interval);
      expect(callback).toHaveBeenCalledTimes(2);
      
      vi.advanceTimersByTime(interval);
      expect(callback).toHaveBeenCalledTimes(3); // Should continue despite errors
    });
  });

  describe('isActive state', () => {
    it('should return isActive as true when polling is active', () => {
      const callback = vi.fn();
      
      const { result } = renderHook(() => 
        usePolling(callback, { interval: 1000, autoStart: true })
      );
      
      expect(result.current.isActive).toBe(true);
    });

    it('should return isActive as false when polling is not started', () => {
      const callback = vi.fn();
      
      const { result } = renderHook(() => 
        usePolling(callback, { interval: 1000, autoStart: false })
      );
      
      expect(result.current.isActive).toBe(false);
    });

    it('should update isActive when start is called', () => {
      const callback = vi.fn();
      
      const { result } = renderHook(() => 
        usePolling(callback, { interval: 1000, autoStart: false })
      );
      
      expect(result.current.isActive).toBe(false);
      
      result.current.start();
      expect(result.current.isActive).toBe(true);
    });

    it('should update isActive when stop is called', () => {
      const callback = vi.fn();
      
      const { result } = renderHook(() => 
        usePolling(callback, { interval: 1000, autoStart: true })
      );
      
      expect(result.current.isActive).toBe(true);
      
      result.current.stop();
      expect(result.current.isActive).toBe(false);
    });
  });
});
