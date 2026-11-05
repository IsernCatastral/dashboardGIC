/**
 * PieChart Component
 * Pie chart visualization using Recharts
 */

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '../../types';

interface PieChartProps {
  data: ChartData;
  /** Container height in px (default 300) */
  height?: number;
  /** Pie outer radius in px (default 80) */
  outerRadius?: number;
  /** When false, slice labels show only the percentage (use with long names and your own legend) */
  showSliceNames?: boolean;
  /** When false, the built-in legend is hidden so the caller can render its own */
  showLegend?: boolean;
  /** Called with the slice name when a slice is clicked; also shows a pointer cursor */
  onSliceClick?: (name: string) => void;
  /** Name of the selected slice: the other slices are drawn lighter (leave unset for no selection) */
  selectedName?: string;
}

// Color values live in globals.css as CSS variables (--chart-*).
// Order: [Riesgo Bajo, Riesgo Medio, Riesgo Alto]
const RISK_COLORS = [
  'rgba(var(--chart-riesgo-bajo), 0.8)',
  'rgba(var(--chart-riesgo-medio), 0.8)',
  'rgba(var(--chart-riesgo-alto), 0.8)',
];

export const PieChart = ({
  data,
  height = 300,
  outerRadius = 80,
  showSliceNames = true,
  showLegend = true,
  onSliceClick,
  selectedName,
}: PieChartProps) => {
  // Transform data for Recharts, dropping zero-value slices so they don't
  // render a stray 0%-wide label that collides with its neighbors
  const chartData = data.labels
    .map((label, index) => ({
      name: label,
      value: data.datasets[0].data[index],
      colorIndex: index,
    }))
    .filter((entry) => entry.value > 0);

  // Use dataset colors if provided, otherwise fall back to the risk palette
  const colors = Array.isArray(data.datasets[0].backgroundColor)
    ? data.datasets[0].backgroundColor
    : data.datasets[0].backgroundColor
      ? [data.datasets[0].backgroundColor]
      : RISK_COLORS;

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-secondary"
        style={{ height }}
      >
        No hay registros para esta selección
      </div>
    );
  }

  return (
    <ResponsiveContainer
      width="100%"
      height={height}
      className={onSliceClick ? '[&_.recharts-pie-sector]:cursor-pointer' : undefined}
    >
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => {
            const percentText = `${((percent ?? 0) * 100).toFixed(0)}%`;
            return showSliceNames ? `${name}: ${percentText}` : percentText;
          }}
          minAngle={chartData.length > 1 ? 8 : 0}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
          onClick={
            onSliceClick
              ? (_: unknown, index: number) => {
                  const slice = chartData[index];
                  if (slice) onSliceClick(slice.name);
                }
              : undefined
          }
          animationBegin={0}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {chartData.map((entry) => (
            <Cell
              key={`cell-${entry.colorIndex}`}
              fill={colors[entry.colorIndex % colors.length]}
              fillOpacity={selectedName === undefined || selectedName === entry.name ? 1 : 0.35}
            />
          ))}
        </Pie>
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
        {showLegend && <Legend />}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
