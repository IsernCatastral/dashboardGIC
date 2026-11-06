/**
 * KPICard Component
 * Displays a KPI with current value, target value, status, and trend indicator
 */

import type { KPI } from '../../types';
import { getKPIStatus, formatNumber } from '../../utils/formatters';

interface KPICardProps {
  kpi: KPI;
}

export const KPICard = ({ kpi }: KPICardProps) => {
  // Calculate status if not provided
  const status = kpi.status || getKPIStatus(kpi.currentValue, kpi.targetValue);

  // Status colors
  const statusColors: Record<typeof status, string> = {
    success: 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20',
    warning: 'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    error: 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20',
    neutral: 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/20',
  };

  const statusTextColors: Record<typeof status, string> = {
    success: 'text-green-700 dark:text-green-400',
    warning: 'text-yellow-700 dark:text-yellow-400',
    error: 'text-red-700 dark:text-red-400',
    neutral: 'text-gray-700 dark:text-gray-400',
  };

  return (
    <div
      className={`p-4 sm:p-6 rounded-lg border-2 transition-all hover:shadow-lg ${statusColors[status]}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-secondary">{kpi.label}</h3>
      </div>

      <div className="space-y-2">
        {/* Current Value */}
        <div>
          <span className="text-3xl font-bold">
            {formatNumber(kpi.currentValue)}
          </span>
          <span className="text-sm text-secondary ml-2">{kpi.unit}</span>
        </div>

        {/* Status Badge */}
        <div className="pt-2 text-right">
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusTextColors[status]}`}
          >
            {status === 'success' && 'A tiempo por contestar'}
            {status === 'warning' && 'Riesgo del tiempo de vencimiento'}
            {status === 'error' && 'Cerca de tiempo de vencimiento'}
          </span>
        </div>
      </div>
    </div>
  );
};
