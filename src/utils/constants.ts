/**
 * Application Constants
 * Contains configuration values for refresh intervals, timeouts, retry attempts,
 * and theme color configuration.
 *
 * Requirements: 5.2, 5.5, 11.1, 11.2, 11.4
 */

// Data Refresh Configuration
// Requirement 5.2: Automatic data refresh interval
export const REFRESH_INTERVAL = 30000; // 30 seconds in milliseconds

// API Configuration
// Requirement 5.5: Request timeout for data fetch operations
export const REQUEST_TIMEOUT = 5000; // 5 seconds in milliseconds

// Retry Configuration
export const MAX_RETRY_ATTEMPTS = 3;

// Theme Color Configuration
// Requirements 11.1, 11.2, 11.4: Dark blue primary color with complementary colors
export const THEME_COLORS = {
  light: {
    primary: '#3b82f6', // Blue
    primaryDark: '#2563eb', // Darker blue for hover states
    primaryLight: '#60a5fa', // Lighter blue for accents
    secondary: '#8b5cf6', // Purple for complementary accents
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: '#0f172a',
    textSecondary: '#64748b',
    success: '#10b981', // Green
    warning: '#f59e0b', // Amber
    error: '#ef4444', // Red
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
  },
  dark: {
    primary: '#1e3a8a', // Dark blue - main theme color (Requirement 11.1, 11.2)
    primaryDark: '#1e40af', // Darker blue for depth
    primaryLight: '#3b82f6', // Lighter blue for accents and hover states
    secondary: '#7c3aed', // Purple for complementary accents (Requirement 11.4)
    background: '#0f172a', // Deep slate
    surface: '#1e293b', // Slate surface
    surfaceHover: '#334155', // Lighter slate for hover states
    text: '#f1f5f9', // Light text (Requirement 11.3 - ensures 4.5:1 contrast)
    textSecondary: '#94a3b8', // Muted text
    success: '#22c55e', // Green
    warning: '#fb923c', // Orange
    error: '#f87171', // Red
    border: '#334155',
    borderLight: '#475569',
  },
} as const;

// Color contrast ratios ensure WCAG 2.1 AA compliance (minimum 4.5:1)
// Requirement 11.3: Text/background contrast ratios for accessibility
export const MIN_CONTRAST_RATIO = 4.5;

// Export type for theme color keys
export type ThemeMode = keyof typeof THEME_COLORS;
export type ThemeColorKeys = keyof typeof THEME_COLORS.light;
