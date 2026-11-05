/**
 * Metric Types
 * Defines enumerations and types for metrics, KPIs, and chart configurations
 */

/**
 * Trend direction for KPI indicators
 */
export type TrendType = 'up' | 'down' | 'stable';

/**
 * KPI status based on current vs target value comparison
 * - success: KPI meets or exceeds target (ratio >= 1.0)
 * - warning: KPI approaching target (ratio >= 0.8)
 * - error: KPI below threshold (ratio < 0.8)
 * - neutral: No specific status
 */
export type KPIStatus = 'success' | 'warning' | 'error' | 'neutral';

/**
 * Chart visualization types supported by the dashboard
 */
export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'doughnut';
