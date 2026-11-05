/**
 * useNavigation Hook Tests
 * Unit tests for navigation hook functionality
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigation } from './useNavigation';
import { NavigationProvider } from '../contexts/NavigationContext';
import React from 'react';

describe('useNavigation', () => {
  it('should throw error when used outside of NavigationProvider', () => {
    // Suppress console.error for this test since we expect an error
    const originalError = console.error;
    console.error = () => {};
    
    expect(() => {
      renderHook(() => useNavigation());
    }).toThrow('useNavigation must be used within NavigationProvider');
    
    console.error = originalError;
  });
  
  it('should return navigation context when used within NavigationProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);
    
    const { result } = renderHook(() => useNavigation(), { wrapper });
    
    expect(result.current).toHaveProperty('currentScreen');
    expect(result.current).toHaveProperty('screens');
    expect(result.current).toHaveProperty('navigateTo');
    expect(result.current).toHaveProperty('addScreen');
    expect(typeof result.current.currentScreen).toBe('string');
    expect(Array.isArray(result.current.screens)).toBe(true);
  });
  
  it('should provide navigateTo function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);
    
    const { result } = renderHook(() => useNavigation(), { wrapper });
    
    expect(typeof result.current.navigateTo).toBe('function');
  });
  
  it('should navigate to valid screen', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);
    
    const { result } = renderHook(() => useNavigation(), { wrapper });
    
    const initialScreen = result.current.currentScreen;
    
    // Default screen should be 'dashboard'
    expect(initialScreen).toBe('dashboard');
    
    // Navigate to the same screen (should work since it exists)
    act(() => {
      result.current.navigateTo('dashboard');
    });
    
    expect(result.current.currentScreen).toBe('dashboard');
  });
  
  it('should not navigate to invalid screen', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);
    
    const { result } = renderHook(() => useNavigation(), { wrapper });
    
    const initialScreen = result.current.currentScreen;
    
    // Try to navigate to non-existent screen
    act(() => {
      result.current.navigateTo('non-existent-screen');
    });
    
    // Current screen should remain unchanged
    expect(result.current.currentScreen).toBe(initialScreen);
  });
  
  it('should provide addScreen function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);
    
    const { result } = renderHook(() => useNavigation(), { wrapper });
    
    expect(typeof result.current.addScreen).toBe('function');
  });
  
  it('should add new screen to screens list', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);
    
    const { result } = renderHook(() => useNavigation(), { wrapper });
    
    const initialScreenCount = result.current.screens.length;
    
    const TestComponent = () => React.createElement('div', null, 'Test');
    const newScreen = {
      id: 'test-screen',
      label: 'Test Screen',
      component: TestComponent
    };
    
    act(() => {
      result.current.addScreen(newScreen);
    });
    
    expect(result.current.screens.length).toBe(initialScreenCount + 1);
    expect(result.current.screens.find(s => s.id === 'test-screen')).toBeDefined();
  });
  
  it('should not add duplicate screen', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);
    
    const { result } = renderHook(() => useNavigation(), { wrapper });
    
    const TestComponent = () => React.createElement('div', null, 'Test');
    const newScreen = {
      id: 'duplicate-test',
      label: 'Duplicate Test',
      component: TestComponent
    };
    
    act(() => {
      result.current.addScreen(newScreen);
    });
    
    const screenCountAfterFirst = result.current.screens.length;
    
    // Try to add the same screen again
    act(() => {
      result.current.addScreen(newScreen);
    });
    
    // Screen count should remain the same
    expect(result.current.screens.length).toBe(screenCountAfterFirst);
  });
  
  it('should access currentScreen property', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);
    
    const { result } = renderHook(() => useNavigation(), { wrapper });
    
    expect(typeof result.current.currentScreen).toBe('string');
    expect(result.current.currentScreen.length).toBeGreaterThan(0);
  });
});
