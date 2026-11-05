/**
 * API Client Tests
 * Unit tests for HTTP client with timeout and error handling
 * Following TDD approach: Tests written FIRST before implementation
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { APIError, fetchWithTimeout } from './api';

describe('APIError', () => {
  it('debe crear una instancia de APIError con todos los parámetros', () => {
    const error = new APIError('Test error', 500, 'TEST_ERROR');
    
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('APIError');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('TEST_ERROR');
  });

  it('debe crear una instancia de APIError con parámetros opcionales', () => {
    const error = new APIError('Simple error');
    
    expect(error.message).toBe('Simple error');
    expect(error.statusCode).toBeUndefined();
    expect(error.code).toBeUndefined();
  });
});

describe('fetchWithTimeout', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe completar fetch exitosamente antes del timeout', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const promise = fetchWithTimeout('http://test.com/api', {}, 5000);
    const response = await promise;

    expect(response.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://test.com/api',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('debe cancelar la petición si excede el timeout', async () => {
    // Mock fetch que simula un request que responde al abort signal
    globalThis.fetch = vi.fn().mockImplementation((_url, options) => {
      return new Promise((_, reject) => {
        // Simular que el abort signal rechaza la promesa
        options.signal?.addEventListener('abort', () => {
          const error = new Error('The operation was aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });
    });

    // Timeout más corto para este test
    const promise = fetchWithTimeout('http://test.com/api', {}, 100);

    // Esperar a que el timeout ocurra y abort sea disparado
    await expect(promise).rejects.toThrow();
  }, 10000); // Aumentar timeout del test

  it('debe limpiar el timeout cuando la petición completa exitosamente', async () => {
    const mockResponse = new Response('OK');
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    await fetchWithTimeout('http://test.com/api', {}, 5000);

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('debe limpiar el timeout cuando la petición falla', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    await expect(fetchWithTimeout('http://test.com/api', {}, 5000)).rejects.toThrow();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});

describe('fetchDashboardData', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe retornar datos con estructura correcta', async () => {
    // Import fresh to avoid module caching issues
    vi.resetModules();
    const { fetchDashboardData } = await import('./api');
    
    const result = await fetchDashboardData();
    
    // Basic structure validation
    expect(result).toHaveProperty('metrics');
    expect(result).toHaveProperty('kpis');
    expect(result).toHaveProperty('charts');
    expect(result).toHaveProperty('records');
    expect(result).toHaveProperty('zones');
    expect(result).toHaveProperty('summaryData');
    expect(result).toHaveProperty('lastUpdate');
    
    expect(Array.isArray(result.metrics)).toBe(true);
    expect(Array.isArray(result.charts)).toBe(true);
    expect(Array.isArray(result.records)).toBe(true);
    expect(Array.isArray(result.zones)).toBe(true);
  });

  it('debe retornar datos mock con valores esperados', async () => {
    vi.resetModules();
    const { fetchDashboardData } = await import('./api');
    
    const result = await fetchDashboardData();
    
    expect(result.summaryData.total).toBe(1248);
    expect(result.metrics).toHaveLength(4);
    expect(result.zones).toHaveLength(4);
  });
});