/**
 * MetricCard Component
 * Displays a single metric with value and unit
 * Can be made clickable to interact with charts
 */

import type { Metric } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface MetricCardProps {
  metric: Metric;
  isClickable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export const MetricCard = ({ metric, isClickable = false, isSelected = false, onClick }: MetricCardProps) => {
  const baseClasses = "bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200";
  const clickableClasses = isClickable 
    ? "hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer transform hover:scale-105" 
    : "hover:shadow-lg";
  const selectedClasses = isSelected 
    ? "border-blue-500 dark:border-blue-400 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20" 
    : "";

  const CardContent = () => (
    <>
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-secondary'}`}>
          {metric.label}
        </h3>
      </div>
      
      <div className="mb-2">
        <span className={`text-3xl font-bold ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
          {formatNumber(metric.value)}
        </span>
        <span className={`text-sm ml-2 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-secondary'}`}>
          {metric.unit}
        </span>
      </div>
    </>
  );

  if (isClickable) {
    return (
      <button 
        onClick={onClick}
        className={`${baseClasses} ${clickableClasses} ${selectedClasses} text-left w-full`}
      >
        <CardContent />
      </button>
    );
  }

  return (
    <div className={`${baseClasses} ${clickableClasses} ${selectedClasses}`}>
      <CardContent />
    </div>
  );
};
