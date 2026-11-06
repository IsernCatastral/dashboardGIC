/**
 * Application Constants
 * Contains configuration values for refresh intervals, timeouts and retry attempts.
 *
 * Requirements: 5.2, 5.5, 11.3
 */

// Data Refresh Configuration
// Requirement 5.2: Automatic data refresh interval
export const REFRESH_INTERVAL = 30000; // 30 seconds in milliseconds

// API Configuration
// Requirement 5.5: Request timeout for data fetch operations
export const REQUEST_TIMEOUT = 5000; // 5 seconds in milliseconds

// Retry Configuration
export const MAX_RETRY_ATTEMPTS = 3;

// Color contrast ratios ensure WCAG 2.1 AA compliance (minimum 4.5:1)
// Requirement 11.3: Text/background contrast ratios for accessibility
export const MIN_CONTRAST_RATIO = 4.5;
