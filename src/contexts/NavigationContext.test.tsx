/**
 * NavigationContext Tests
 * Unit tests for navigation context functionality
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { NavigationProvider } from './NavigationContext';
import { useNavigation } from '../hooks/useNavigation';
import React from 'react';

describe('NavigationContext', () => {
  it('should provide default dashboard screen', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);

    const { result } = renderHook(() => useNavigation(), { wrapper });

    expect(result.current.currentScreen).toBe('dashboard');
    expect(result.current.screens.length).toBeGreaterThan(0);
    expect(result.current.screens[0].id).toBe('dashboard');
  });

  it('should navigate to existing screen', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);

    const { result } = renderHook(() => useNavigation(), { wrapper });

    // Add a new screen
    const TestScreen = () => React.createElement('div', null, 'Test');
    act(() => {
      result.current.addScreen({
        id: 'test-screen',
        label: 'Test Screen',
        component: TestScreen
      });
    });

    // Navigate to the new screen
    act(() => {
      result.current.navigateTo('test-screen');
    });

    expect(result.current.currentScreen).toBe('test-screen');
  });

  it('should not navigate to non-existent screen', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);

    const { result } = renderHook(() => useNavigation(), { wrapper });

    const initialScreen = result.current.currentScreen;

    act(() => {
      result.current.navigateTo('non-existent');
    });

    expect(result.current.currentScreen).toBe(initialScreen);
  });

  it('should add new screen dynamically', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);

    const { result } = renderHook(() => useNavigation(), { wrapper });

    const initialCount = result.current.screens.length;

    const NewScreen = () => React.createElement('div', null, 'New Screen');
    act(() => {
      result.current.addScreen({
        id: 'new-screen',
        label: 'New Screen',
        component: NewScreen
      });
    });

    expect(result.current.screens.length).toBe(initialCount + 1);
    expect(result.current.screens.find(s => s.id === 'new-screen')).toBeDefined();
  });

  it('should not add duplicate screen', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);

    const { result } = renderHook(() => useNavigation(), { wrapper });

    const DuplicateScreen = () => React.createElement('div', null, 'Duplicate');
    
    act(() => {
      result.current.addScreen({
        id: 'duplicate',
        label: 'Duplicate',
        component: DuplicateScreen
      });
    });

    const countAfterFirst = result.current.screens.length;

    act(() => {
      result.current.addScreen({
        id: 'duplicate',
        label: 'Duplicate Again',
        component: DuplicateScreen
      });
    });

    expect(result.current.screens.length).toBe(countAfterFirst);
  });

  it('should provide list of all screens', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(NavigationProvider, null, children);

    const { result } = renderHook(() => useNavigation(), { wrapper });

    expect(Array.isArray(result.current.screens)).toBe(true);
    expect(result.current.screens.length).toBeGreaterThan(0);
    expect(result.current.screens[0]).toHaveProperty('id');
    expect(result.current.screens[0]).toHaveProperty('label');
    expect(result.current.screens[0]).toHaveProperty('component');
  });
});
