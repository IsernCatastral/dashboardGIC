/**
 * LineChart Component
 * Line/Area chart visualization using Recharts
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '../../types';
import {
  ALIGNED_CHART_MARGIN,
  ALIGNED_LEGEND_STYLE,
  ALIGNED_Y_AXIS_WIDTH,
} from '../../utils/chartScale';

interface LineChartProps {
  data: ChartData;
  /** Draws every X axis label (horizontal, small font) instead of letting Recharts hide the ones that overlap */
  showAllXLabels?: boolean;
  /** Chart height in px (default 300) */
  height?: number;
  /**
   * Fixed Y ticks (e.g. from getSharedYTicks). The axis spans 0 to the last tick, so charts
   * given the same ticks and height draw identical gridlines.
   */
  yTicks?: number[];
}

// Color values live in globals.css as CSS variables (--chart-*).
const DATASET_KEYS = ['total', 'gic', 'se', 'sifj'];
const DATASET_PALETTE = DATASET_KEYS.map((key) => ({
  border: `rgba(var(--chart-${key}), 1)`,
  background: `rgba(var(--chart-${key}), 0.2)`,
}));

export const LineChart = ({ data, showAllXLabels = false, height = 300, yTicks }: LineChartProps) => {
  // Transform data for Recharts
  const chartData = data.labels.map((label, index) => {
    const dataPoint: Record<string, string | number> = { name: label };
    data.datasets.forEach((dataset) => {
      dataPoint[dataset.label] = dataset.data[index];
    });
    return dataPoint;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={yTicks ? ALIGNED_CHART_MARGIN : undefined}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
        <XAxis
          dataKey="name"
          className="text-sm text-gray-600 dark:text-gray-400"
          {...(showAllXLabels
            ? { interval: 0, tick: { fontSize: 11 } }
            : {})}
        />
        <YAxis
          className="text-sm text-gray-600 dark:text-gray-400"
          {...(yTicks
            ? { ticks: yTicks, domain: [0, yTicks[yTicks.length - 1]], allowDecimals: false, width: ALIGNED_Y_AXIS_WIDTH }
            : {})}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.5rem',
            color: 'var(--color-text)',
          }}
          labelStyle={{ color: 'var(--color-text)' }}
          itemStyle={{ color: 'var(--color-text)' }}
        />
        <Legend wrapperStyle={yTicks ? ALIGNED_LEGEND_STYLE : undefined} />
        {data.datasets.map((dataset, index) => {
          const palette = DATASET_PALETTE[index % DATASET_PALETTE.length];
          return (
            <Area
              key={dataset.label}
              type="monotone"
              dataKey={dataset.label}
              stroke={dataset.borderColor || palette.border}
              fill={
                (Array.isArray(dataset.backgroundColor)
                  ? dataset.backgroundColor[0]
                  : dataset.backgroundColor) || palette.background
              }
              strokeWidth={dataset.borderWidth || 2}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
};
