/**
 * Storage Service Tests
 * Tests for localStorage theme preference management
 * Validates: Requirements 9.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveTheme, loadTheme, THEME_STORAGE_KEY } from './storageService';

describe('storageService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('saveTheme', () => {
    it('should save light theme to localStorage', () => {
      saveTheme('light');
      
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBe('light');
    });

    it('should save dark theme to localStorage', () => {
      saveTheme('dark');
      
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBe('dark');
    });

    it('should overwrite existing theme preference', () => {
      saveTheme('light');
      saveTheme('dark');
      
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      expect(stored).toBe('dark');
    });

    it('should handle localStorage not available gracefully', () => {
      // Mock localStorage.setItem to throw error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage is not available');
      });

      // Should not throw error
      expect(() => saveTheme('dark')).not.toThrow();

      setItemSpy.mockRestore();
    });

    it('should handle QuotaExceededError gracefully', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      // Should not throw error
      expect(() => saveTheme('dark')).not.toThrow();

      setItemSpy.mockRestore();
    });

    it('should handle SecurityError gracefully', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new Error('SecurityError');
        error.name = 'SecurityError';
        throw error;
      });

      // Should not throw error
      expect(() => saveTheme('light')).not.toThrow();

      setItemSpy.mockRestore();
    });
  });

  describe('loadTheme', () => {
    it('should load light theme from localStorage', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      
      const theme = loadTheme();
      expect(theme).toBe('light');
    });

    it('should load dark theme from localStorage', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      
      const theme = loadTheme();
      expect(theme).toBe('dark');
    });

    it('should return null when no theme is stored', () => {
      const theme = loadTheme();
      expect(theme).toBeNull();
    });

    it('should return null when stored value is invalid', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'invalid-theme');
      
      const theme = loadTheme();
      expect(theme).toBeNull();
    });

    it('should return null when stored value is empty string', () => {
      localStorage.setItem(THEME_STORAGE_KEY, '');
      
      const theme = loadTheme();
      expect(theme).toBeNull();
    });

    it('should handle localStorage not available gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage is not available');
      });

      // Should not throw and return null
      const theme = loadTheme();
      expect(theme).toBeNull();

      getItemSpy.mockRestore();
    });

    it('should handle SecurityError gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        const error = new Error('SecurityError');
        error.name = 'SecurityError';
        throw error;
      });

      // Should not throw and return null
      const theme = loadTheme();
      expect(theme).toBeNull();

      getItemSpy.mockRestore();
    });

    it('should handle null return from localStorage gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const theme = loadTheme();
      expect(theme).toBeNull();

      getItemSpy.mockRestore();
    });
  });

  describe('integration scenarios', () => {
    it('should save and load theme successfully', () => {
      saveTheme('dark');
      const loaded = loadTheme();
      expect(loaded).toBe('dark');
    });

    it('should update saved theme preference', () => {
      saveTheme('light');
      expect(loadTheme()).toBe('light');
      
      saveTheme('dark');
      expect(loadTheme()).toBe('dark');
    });

    it('should handle save failure and load fallback', () => {
      // Ensure localStorage starts clean
      localStorage.clear();
      
      // Mock localStorage.setItem to fail
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      // Mock localStorage.getItem to return null (as if nothing was saved)
      localStorage.getItem = vi.fn().mockReturnValue(null);

      // Try to save theme (should fail silently)
      saveTheme('dark');
      
      // Should return null since save failed and getItem returns null
      const theme = loadTheme();
      expect(theme).toBeNull();

      // Restore original methods
      localStorage.setItem = originalSetItem;
      localStorage.getItem = Storage.prototype.getItem;
    });
  });
});
