/**
 * useTheme Hook Tests
 * Unit tests for theme hook functionality
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTheme } from './useTheme';
import { ThemeProvider } from '../contexts/ThemeContext';
import React from 'react';

describe('useTheme', () => {
  it('should throw error when used outside of ThemeProvider', () => {
    // Suppress console.error for this test since we expect an error
    const originalError = console.error;
    console.error = () => {};
    
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within ThemeProvider');
    
    console.error = originalError;
  });
  
  it('should return theme context when used within ThemeProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);
    
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current).toHaveProperty('theme');
    expect(result.current).toHaveProperty('toggleTheme');
    expect(result.current).toHaveProperty('setTheme');
    expect(['light', 'dark']).toContain(result.current.theme);
  });
  
  it('should provide toggleTheme function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);
    
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(typeof result.current.toggleTheme).toBe('function');
  });
  
  it('should provide setTheme function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);
    
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(typeof result.current.setTheme).toBe('function');
  });
});
