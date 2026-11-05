/**
 * API Client
 * HTTP client with timeout and error handling for Dashboard Entidad
 * 
 * Features:
 * - AbortController for request timeout (5 seconds)
 * - Error handling for network, timeout, and server errors
 * - Proper error codes: NETWORK_ERROR, TIMEOUT, SERVICE_UNAVAILABLE
 * 
 * Requirements: 5.1, 5.3, 5.5, 7.1, 7.3
 */

import type { DashboardData } from '../types';
import { mockDashboardData } from '../mocks/api.mock';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const REQUEST_TIMEOUT = 5000; // 5 seconds

/**
 * Check if mock data should be used
 * Can be overridden for testing purposes
 */
export const shouldUseMockData = (): boolean => {
  return import.meta.env.VITE_USE_MOCK_DATA !== 'false';
};

/**
 * Custom error class for API errors with status code and error code
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Fetch with timeout support using AbortController
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: 5000)
 * @returns Promise with Response
 * @throws Error when request is aborted or fails
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Fetches dashboard data from the API endpoint or mock data
 * 
 * Endpoint: GET /api/dashboard
 * 
 * Error handling:
 * - NETWORK_ERROR: Network connection issues
 * - TIMEOUT: Request exceeds 5 seconds
 * - SERVICE_UNAVAILABLE: Server returns 503
 * 
 * @returns Promise with DashboardData
 * @throws APIError with appropriate error code and message
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  // Use mock data in development by default
  if (shouldUseMockData()) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardData;
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/dashboard`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error?.message || 'Error al obtener datos',
        response.status,
        errorData.error?.code
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    if ((error as Error).name === 'AbortError') {
      throw new APIError('Tiempo de espera agotado', 408, 'TIMEOUT');
    }

    throw new APIError(
      'No se pudo conectar con el servidor',
      0,
      'NETWORK_ERROR'
    );
  }
}
