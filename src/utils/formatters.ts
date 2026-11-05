/**
 * Formatter Utilities
 * Provides formatting and validation functions for dashboard data
 * Validates: Requirements 3.3, 3.4, 8.3
 */

import type { KPIStatus, TrendType } from '../types/metric.types';

/**
 * Formats a timestamp to human-readable format
 * 
 * @param timestamp - Date object or ISO string to format
 * @returns Formatted timestamp string in human-readable format
 * 
 * Validates: Requirements 8.3
 * 
 * @example
 * formatTimestamp(new Date('2024-01-15T14:30:00Z'))
 * // Returns: "2:30 PM" or "15 Ene 2024, 2:30 PM" depending on locale
 */
export function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  // Format to locale-specific time format
  const timeString = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  // Format to locale-specific date format
  const dateString = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  return `${dateString}, ${timeString}`;
}

/**
 * Calculates KPI status based on current value vs target value
 * 
 * Status logic:
 * - success: ratio >= 1.0 (meets or exceeds target)
 * - warning: ratio >= 0.8 and < 1.0 (within 80% of target)
 * - error: ratio < 0.8 (below 80% of target)
 * 
 * @param currentValue - The current KPI value
 * @param targetValue - The target/goal value
 * @returns KPI status ('success', 'warning', or 'error')
 * 
 * Validates: Requirements 3.3
 * 
 * @example
 * getKPIStatus(85, 100) // Returns: 'warning'
 * getKPIStatus(100, 100) // Returns: 'success'
 * getKPIStatus(70, 100) // Returns: 'error'
 */
export function getKPIStatus(currentValue: number, targetValue: number): KPIStatus {
  const ratio = currentValue / targetValue;
  
  if (ratio >= 1.0) {
    return 'success';
  } else if (ratio >= 0.8) {
    return 'warning';
  } else {
    return 'error';
  }
}

/**
 * Calculates trend direction by comparing two values
 * 
 * @param currentValue - The current value
 * @param previousValue - The previous value to compare against
 * @returns Trend direction ('up', 'down', or 'stable')
 * 
 * Validates: Requirements 3.4
 * 
 * @example
 * calculateTrend(100, 90) // Returns: 'up'
 * calculateTrend(90, 100) // Returns: 'down'
 * calculateTrend(100, 100) // Returns: 'stable'
 */
export function calculateTrend(
  currentValue: number,
  previousValue: number
): TrendType {
  if (currentValue > previousValue) {
    return 'up';
  } else if (currentValue < previousValue) {
    return 'down';
  } else {
    return 'stable';
  }
}

/**
 * Formats a number using a dot (.) as the thousands separator, regardless
 * of the browser's locale settings.
 *
 * @param value - The number to format
 * @returns Formatted string, e.g. formatNumber(1234) -> "1.234"
 *
 * @example
 * formatNumber(1234) // Returns: "1.234"
 * formatNumber(1234567) // Returns: "1.234.567"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('es-CO');
}
