/**
 * ThemeContext Tests
 * Unit tests for theme context functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider } from './ThemeContext';
import { useTheme } from '../hooks/useTheme';
import React from 'react';

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document theme attribute
    document.documentElement.removeAttribute('data-theme');
  });

  it('should provide default dark theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    // Set initial theme to light
    localStorage.setItem('dashboard-theme', 'light');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
  });

  it('should set specific theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
  });

  it('should persist theme to localStorage', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('light');
    });

    expect(localStorage.getItem('dashboard-theme')).toBe('light');

    act(() => {
      result.current.setTheme('dark');
    });

    expect(localStorage.getItem('dashboard-theme')).toBe('dark');
  });

  it('should load theme from localStorage on initialization', () => {
    localStorage.setItem('dashboard-theme', 'light');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('light');
  });

  it('should apply theme attribute to document element', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Default should be dark
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should handle invalid localStorage values gracefully', () => {
    localStorage.setItem('dashboard-theme', 'invalid-theme');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Should default to dark when invalid value is stored
    expect(result.current.theme).toBe('dark');
  });
});
