/**
 * Storage Service
 * Manages localStorage operations for theme preferences
 * Validates: Requirements 9.3 - Persistence of theme preferences with error handling
 */

/**
 * Storage key for theme preference
 */
export const THEME_STORAGE_KEY = 'dashboard-theme';

/**
 * Valid theme values
 */
type ThemeValue = 'light' | 'dark';

/**
 * Saves the theme preference to localStorage
 * Handles errors gracefully without throwing
 * 
 * @param theme - The theme to save ('light' or 'dark')
 */
export function saveTheme(theme: ThemeValue): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // Handle localStorage errors gracefully:
    // - QuotaExceededError: Storage quota exceeded
    // - SecurityError: Access denied (private browsing mode)
    // - Other errors: localStorage not available
    console.warn('Failed to save theme preference:', error);
    // Fail silently - application continues to work without persistence
  }
}

/**
 * Loads the theme preference from localStorage
 * Returns null if no valid theme is stored or on error
 * 
 * @returns The stored theme ('light' or 'dark') or null
 */
export function loadTheme(): ThemeValue | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    
    // Validate the stored value
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    
    // Return null for invalid or empty values
    return null;
  } catch (error) {
    // Handle localStorage errors gracefully:
    // - SecurityError: Access denied (private browsing mode)
    // - Other errors: localStorage not available
    console.warn('Failed to load theme preference:', error);
    return null;
  }
}
