/**
 * Dashboard Types
 * Defines all core data structures for the Dashboard Entidad application
 */

import { TrendType, KPIStatus, ChartType } from './metric.types';

/**
 * KPI risk breakdown structure
 */
export interface KPIRiskBreakdown {
  riesgoBajo: number;
  riesgoMedio: number;
  riesgoAlto: number;
}

/**
 * KPIs organized by dataset ID
 */
export interface KPIsByDataset {
  total: KPIRiskBreakdown;
  gic: KPIRiskBreakdown;
  se: KPIRiskBreakdown;
  sifj: KPIRiskBreakdown;
}

/**
 * Main dashboard data structure containing all dashboard information
 */
export interface DashboardData {
  metrics: Metric[];
  kpis: KPI[];
  kpisByDataset: KPIsByDataset;
  charts: ChartConfig[];
  records: Record[];
  zones: ZoneData[];
  summaryData: SummaryData;
  lastUpdate: string;
}

/**
 * Metric data for operational metrics display
 */
export interface Metric {
  id: string;
  datasetId?: string; // Optional ID to link with chart datasets
  label: string;
  value: number;
  unit: string;
  icon?: React.ReactNode;
}

/**
 * Key Performance Indicator with target and trend information
 */
export interface KPI {
  id: string;
  label: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: TrendType;
  status: KPIStatus;
}

/**
 * Chart configuration for data visualizations
 */
export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  data: ChartData;
  interactive?: boolean;
  defaultDataset?: string;
  stacked?: boolean;
}

/**
 * Chart data structure containing labels and datasets
 */
export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

/**
 * Dataset for chart visualization
 */
export interface Dataset {
  id?: string;
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

/**
 * Record status enumeration
 * Represents the risk level of a record
 */
export type RecordStatus = 'Riesgo Bajo' | 'Riesgo Medio' | 'Riesgo Alto';

/**
 * Individual record in the system
 */
export interface Record {
  id: string;
  radicado: string;
  assignedUser: string;
  dependency: string;
  /** Original long-form dependency name from the source file (raw `dependencia`) */
  sourceDependency: string;
  /** Procedure group/category from the source file (raw `grupo`) */
  group: string;
  procedureType: string;
  procedureCode: number;
  workflowState: string;
  lotId: string;
  latitude: number | null;
  longitude: number | null;
  allottedDays: number;
  status: RecordStatus;
  filingDate: string;
  daysUntilDue: number;
}

/**
 * Geographic location zones for record distribution
 */
export type LocationZone = 
  | 'Trámites Totales'
  | 'Gerencia de Información Catastral'
  | 'Subgerencia de Información Económica'
  | 'Subgerencia de Información Física y Jurídica';

/**
 * Zone data with record counts by status
 */
export interface ZoneData {
  zone: LocationZone;
  approved: number;
  pending: number;
  rejected: number;
}

/**
 * Summary data showing aggregate statistics
 */
export interface SummaryData {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}
