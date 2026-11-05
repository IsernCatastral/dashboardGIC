/**
 * Theme Types
 * Defines theme configuration and color palette interfaces
 */

/**
 * Theme configuration with mode and color palette
 */
export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
}

/**
 * Theme color palette
 * All color properties should maintain WCAG 2.1 Level AA contrast ratio (minimum 4.5:1)
 */
export interface ThemeColors {
  /** Primary color (dark blue #1e3a8a for dark theme, lighter blue for light theme) */
  primary: string;
  /** Secondary/accent color for interactive elements */
  secondary: string;
  /** Main background color */
  background: string;
  /** Surface color for cards and elevated components */
  surface: string;
  /** Primary text color */
  text: string;
  /** Secondary text color for less prominent information */
  textSecondary: string;
  /** Success state color (green) */
  success: string;
  /** Warning state color (yellow/orange) */
  warning: string;
  /** Error state color (red) */
  error: string;
  /** Border color for dividers and outlines */
  border: string;
}
