/**
 * API Mock Data
 * Provides mock data for testing and development of the Dashboard Entidad
 */

import type {
  DashboardData,
  KPI,
  ChartConfig,
} from '../types';
import {
  getMetrics,
  getKpisByDataset,
  getZones,
  getSummaryData,
  getRecords,
  getEntriesExitsChart,
  getCumulativeChart,
} from '../services/dashboardData.service';

/**
 * Metrics are derived from records_tramites.json (sum of the risk
 * breakdown array for each dataset). See dashboardData.service.ts.
 */
const mockMetrics = getMetrics();

/**
 * Fallback KPI list, only used if a dataset has no risk data at all.
 */
const mockKPIs: KPI[] = [
  {
    id: 'kpi-2',
    label: 'Solicitudes en Riesgo Bajo',
    currentValue: 0,
    targetValue: 1,
    unit: 'solicitudes',
    trend: 'stable',
    status: 'success',
  },
  {
    id: 'kpi-1',
    label: 'Solicitudes en Riesgo Medio',
    currentValue: 0,
    targetValue: 1,
    unit: 'solicitudes',
    trend: 'up',
    status: 'warning',
  },
  {
    id: 'kpi-3',
    label: 'Solicitudes en Riesgo Alto',
    currentValue: 0,
    targetValue: 1,
    unit: 'solicitudes',
    trend: 'down',
    status: 'error',
  },
];

/**
 * Risk breakdown by dataset, derived from records_tramites.json.
 * See dashboardData.service.ts.
 */
const mockKPIsByDataset = getKpisByDataset();

/**
 * Charts - entries/exits (chart-4) comes from entradas_salidas.json and cumulative trámites
 * (chart-5) from recordCadaMes in records_tramites.json. The pie chart (chart-2) defaults to the
 * "total" dataset risk breakdown; DashboardScreen overrides its data
 * live based on the selected metric.
 */
const entriesExitsChart = getEntriesExitsChart();
const cumulativeChart = getCumulativeChart();
const totalRisk = mockKPIsByDataset.total;

const mockCharts: ChartConfig[] = [
  {
    id: 'chart-2',
    title: 'Distribución por nivel de riesgo',
    type: 'pie',
    data: {
      labels: ['Riesgo Bajo', 'Riesgo Medio', 'Riesgo Alto'],
      datasets: [
        {
          label: 'Solicitudes por riesgo',
          data: [totalRisk.riesgoBajo, totalRisk.riesgoMedio, totalRisk.riesgoAlto],
        },
      ],
    },
  },
  {
    id: 'chart-4',
    title: 'Entradas y salidas',
    type: 'bar',
    data: entriesExitsChart,
  },
  {
    id: 'chart-5',
    title: 'Trámites radicados por mes',
    type: 'bar',
    stacked: true,
    data: cumulativeChart,
  },
];

/**
 * Records table data. Risk status and remaining days are calculated
 * per record from fechaRadicacion + grupos_tramites.json (never fixed).
 * See dashboardData.service.ts.
 */
const mockRecords = getRecords();

/**
 * Map "zones" (one per solicitud type), derived from the same risk
 * breakdown used by the KPIs. See dashboardData.service.ts.
 */
const mockZones = getZones();

/**
 * Summary panel data. Risk totals are the sum of GIC + SE + SIFJ.
 * See dashboardData.service.ts.
 */
const mockSummaryData = getSummaryData();

/**
 * Complete mock dashboard data
 */
export const mockDashboardData: DashboardData = {
  metrics: mockMetrics,
  kpis: mockKPIs,
  kpisByDataset: mockKPIsByDataset,
  charts: mockCharts,
  records: mockRecords,
  zones: mockZones,
  summaryData: mockSummaryData,
  lastUpdate: new Date().toISOString(),
};

/**
 * Mock function to fetch dashboard data successfully
 * Simulates an API call with a delay
 * @param delay - Milliseconds to delay the response (default: 500ms)
 * @returns Promise resolving to mock dashboard data
 */
export const mockFetchDashboardData = async (
  delay: number = 500
): Promise<DashboardData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...mockDashboardData,
        lastUpdate: new Date().toISOString(),
      });
    }, delay);
  });
};

/**
 * Mock function to simulate an API error
 * @param delay - Milliseconds to delay the error (default: 500ms)
 * @param errorMessage - Custom error message (default: 'Error al obtener datos del dashboard')
 * @returns Promise rejecting with an error
 */
export const mockFetchDashboardDataError = async (
  delay: number = 500,
  errorMessage: string = 'Error al obtener datos del dashboard'
): Promise<DashboardData> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage));
    }, delay);
  });
};
