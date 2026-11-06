/**
 * ChartWrapper Component
 * Wrapper component that selects and renders the appropriate chart type
 */

import { memo, type ReactNode } from 'react';
import type { ChartConfig } from '../../types';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { PieChart } from './PieChart';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface ChartWrapperProps {
  chart: ChartConfig;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  dynamicTitle?: string;
  /** Chart height in px; forwarded to pie charts */
  height?: number;
  /** Pie outer radius in px; only applies to pie charts */
  outerRadius?: number;
  /** Shows every X axis label on bar and area charts (e.g. all 12 months) */
  showAllXLabels?: boolean;
  horizontal?: boolean;
  axisWidth?: number;
  rotateXLabels?: boolean;
  /** Fixed Y ticks for bar and area charts; charts given the same ticks share the same gridlines */
  yTicks?: number[];
  /** Plot height in px for bar and area charts, so charts side by side can match */
  plotHeight?: number;
  /** Tighter card padding and title spacing, to give the chart more room in the same card */
  compact?: boolean;
  headerAction?: ReactNode;
}

const ChartWrapperComponent = ({ 
  chart, 
  isLoading = false,
  error,
  onRetry,
  dynamicTitle,
  height,
  outerRadius,
  showAllXLabels,
  horizontal,
  axisWidth,
  rotateXLabels,
  yTicks,
  plotHeight,
  compact = false,
  headerAction
}: ChartWrapperProps) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  const renderChart = () => {
    switch (chart.type) {
      case 'bar':
        return (
          <BarChart
            data={chart.data}
            showAllXLabels={showAllXLabels}
            horizontalLabels={showAllXLabels}
            stacked={chart.stacked}
            horizontal={horizontal}
            axisWidth={axisWidth}
            rotateXLabels={rotateXLabels}
            height={plotHeight}
            yTicks={yTicks}
          />
        );
      case 'line':
      case 'area':
        return (
          <LineChart
            data={chart.data}
            showAllXLabels={showAllXLabels}
            height={plotHeight}
            yTicks={yTicks}
          />
        );
      case 'pie':
        return <PieChart data={chart.data} height={height} outerRadius={outerRadius} />;
      default:
        return (
          <div className="text-center text-secondary py-8">
            Tipo de gráfico no soportado: {chart.type}
          </div>
        );
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'} rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col`}
    >
      <div className={`flex flex-wrap justify-between items-center gap-2 ${compact ? 'mb-2' : 'mb-4'}`}>
        <h3 className="text-lg font-semibold">{dynamicTitle || chart.title}</h3>
        {headerAction}
      </div>
      <div className="w-full flex-1 flex items-center justify-center">
        {renderChart()}
      </div>
    </div>
  );
};

// Memoize component for performance optimization
export const ChartWrapper = memo(ChartWrapperComponent);
