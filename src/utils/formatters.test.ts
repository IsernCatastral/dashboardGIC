/**
 * Unit Tests for Formatter Utilities
 * Tests formatTimestamp, getKPIStatus, and calculateTrend functions
 * Validates: Requirements 3.3, 3.4, 8.3
 */

import { describe, it, expect } from 'vitest';
import { formatTimestamp, getKPIStatus, calculateTrend } from './formatters';

describe('formatTimestamp', () => {
  it('should format a Date object to human-readable format', () => {
    const date = new Date('2024-01-15T14:30:00Z');
    const result = formatTimestamp(date);
    
    // Should contain time information
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should format an ISO string to human-readable format', () => {
    const isoString = '2024-01-15T14:30:00Z';
    const result = formatTimestamp(isoString);
    
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should handle different date formats consistently', () => {
    const date1 = new Date('2024-01-15T14:30:00Z');
    const date2 = '2024-01-15T14:30:00Z';
    
    const result1 = formatTimestamp(date1);
    const result2 = formatTimestamp(date2);
    
    // Both should produce the same output
    expect(result1).toBe(result2);
  });

  it('should format current date without errors', () => {
    const now = new Date();
    const result = formatTimestamp(now);
    
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should handle past dates correctly', () => {
    const pastDate = new Date('2020-01-01T00:00:00Z');
    const result = formatTimestamp(pastDate);
    
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('getKPIStatus', () => {
  it('should return "success" when currentValue >= targetValue (ratio >= 1.0)', () => {
    // Validates: Requirements 3.3
    expect(getKPIStatus(100, 100)).toBe('success');
    expect(getKPIStatus(120, 100)).toBe('success');
    expect(getKPIStatus(1000, 500)).toBe('success');
  });

  it('should return "warning" when ratio is between 0.8 and 1.0', () => {
    // Validates: Requirements 3.3
    expect(getKPIStatus(80, 100)).toBe('warning');
    expect(getKPIStatus(85, 100)).toBe('warning');
    expect(getKPIStatus(90, 100)).toBe('warning');
    expect(getKPIStatus(99, 100)).toBe('warning');
  });

  it('should return "error" when ratio is below 0.8', () => {
    // Validates: Requirements 3.3
    expect(getKPIStatus(70, 100)).toBe('error');
    expect(getKPIStatus(50, 100)).toBe('error');
    expect(getKPIStatus(10, 100)).toBe('error');
    expect(getKPIStatus(0, 100)).toBe('error');
  });

  it('should handle edge case at exactly 0.8 ratio', () => {
    expect(getKPIStatus(80, 100)).toBe('warning');
    expect(getKPIStatus(8, 10)).toBe('warning');
  });

  it('should handle edge case just below 0.8 ratio', () => {
    expect(getKPIStatus(79.9, 100)).toBe('error');
    expect(getKPIStatus(79, 100)).toBe('error');
  });

  it('should handle edge case at exactly 1.0 ratio', () => {
    expect(getKPIStatus(100, 100)).toBe('success');
    expect(getKPIStatus(50, 50)).toBe('success');
  });

  it('should work with decimal values', () => {
    expect(getKPIStatus(85.5, 100.0)).toBe('warning');
    expect(getKPIStatus(92.7, 90.0)).toBe('success');
    expect(getKPIStatus(2.5, 5.0)).toBe('error');
  });

  it('should work with different scales of numbers', () => {
    expect(getKPIStatus(85000, 100000)).toBe('warning');
    expect(getKPIStatus(0.85, 1.0)).toBe('warning');
    expect(getKPIStatus(850, 1000)).toBe('warning');
  });
});

describe('calculateTrend', () => {
  it('should return "up" when currentValue > previousValue', () => {
    // Validates: Requirements 3.4
    expect(calculateTrend(100, 90)).toBe('up');
    expect(calculateTrend(150, 100)).toBe('up');
    expect(calculateTrend(1, 0)).toBe('up');
  });

  it('should return "down" when currentValue < previousValue', () => {
    // Validates: Requirements 3.4
    expect(calculateTrend(90, 100)).toBe('down');
    expect(calculateTrend(50, 100)).toBe('down');
    expect(calculateTrend(0, 1)).toBe('down');
  });

  it('should return "stable" when currentValue === previousValue', () => {
    // Validates: Requirements 3.4
    expect(calculateTrend(100, 100)).toBe('stable');
    expect(calculateTrend(0, 0)).toBe('stable');
    expect(calculateTrend(50.5, 50.5)).toBe('stable');
  });

  it('should work with decimal values', () => {
    expect(calculateTrend(85.7, 85.6)).toBe('up');
    expect(calculateTrend(85.6, 85.7)).toBe('down');
    expect(calculateTrend(85.5, 85.5)).toBe('stable');
  });

  it('should work with negative values', () => {
    expect(calculateTrend(-5, -10)).toBe('up');
    expect(calculateTrend(-10, -5)).toBe('down');
    expect(calculateTrend(-7, -7)).toBe('stable');
  });

  it('should work with large differences', () => {
    expect(calculateTrend(1000000, 500000)).toBe('up');
    expect(calculateTrend(500000, 1000000)).toBe('down');
  });

  it('should work with very small differences', () => {
    expect(calculateTrend(100.0001, 100.0000)).toBe('up');
    expect(calculateTrend(100.0000, 100.0001)).toBe('down');
  });
});
