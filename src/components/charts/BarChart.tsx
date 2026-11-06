/**
 * BarChart Component
 * Bar chart visualization using Recharts
 */

import {
  BarChart as RechartsBarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '../../types';
import {
  ALIGNED_CHART_MARGIN,
  ALIGNED_LEGEND_HEIGHT,
  ALIGNED_LEGEND_STYLE,
  ALIGNED_Y_AXIS_WIDTH,
} from '../../utils/chartScale';

interface BarChartProps {
  data: ChartData;
  /** When true, renders X axis labels horizontally instead of angled (default angled) */
  horizontalLabels?: boolean;
  /** Stacks all series into a single bar per category and shows each segment's value */
  stacked?: boolean;
  /** Called with the category index when a bar is clicked; also shows a pointer cursor */
  onBarClick?: (index: number) => void;
  /**
   * Draws one horizontal bar per category (names on the left, count at the end of the bar),
   * growing in height with the number of categories. Meant for long category names.
   */
  horizontal?: boolean;
  /** With `horizontal`: how many bars fit before the chart gets a vertical scrollbar */
  maxVisibleBars?: number;
  /** With `horizontal`: makes each category name a button that reports its name when clicked */
  onLabelClick?: (name: string) => void;
  /** With `onLabelClick`: the category name currently selected (its label is highlighted) */
  selectedLabel?: string;
  /** Draws every X axis label instead of letting Recharts hide the ones that overlap */
  showAllXLabels?: boolean;
  /** Chart height in px for vertical bars (default 380) */
  height?: number;
  xAxisHeight?: number;
  axisWidth?: number;
  alignLabelsRight?: boolean;
  rotateXLabels?: boolean;
  showValues?: boolean;
  selectedIndex?: number;
  /**
   * Fixed Y ticks (e.g. from getSharedYTicks). The axis spans 0 to the last tick, so charts
   * given the same ticks and height draw identical gridlines.
   */
  yTicks?: number[];
}

// Horizontal layout sizing: row height per category (fits a two-line name), bar thickness,
// top/bottom room (axis) and the width reserved for the category names on the left
const HORIZONTAL_ROW_HEIGHT = 36;
const HORIZONTAL_BAR_SIZE = 18;
const HORIZONTAL_PADDING = 60;
const HORIZONTAL_AXIS_WIDTH = 290;
const HORIZONTAL_LABEL_MAX_CHARS = 38;
const HORIZONTAL_LABEL_MAX_LINES = 2;

/** Greedy word wrap; the last allowed line is cut with an ellipsis if the name still doesn't fit */
const wrapLabel = (text: string, maxChars: number, maxLines: number): string[] => {
  const lines: string[] = [];
  let current = '';
  text.split(' ').forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1];
  kept[maxLines - 1] = `${last.slice(0, Math.max(0, maxChars - 1))}…`;
  return kept;
};

interface CategoryTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  /** When set, the label acts as a button that reports its category name */
  onLabelClick?: (name: string) => void;
  /** Category currently selected through its label; drawn highlighted */
  selectedLabel?: string;
  axisWidth?: number;
  alignLabelsRight?: boolean;
}

/**
 * Centered, wrapped category label for horizontal bars; the full name is kept as a hover title.
 * With `onLabelClick` it behaves as a button (pointer cursor, keyboard activation, selected state).
 */
const HorizontalCategoryTick = ({
  x = 0,
  y = 0,
  payload,
  onLabelClick,
  selectedLabel,
  axisWidth,
  alignLabelsRight,
}: CategoryTickProps) => {
  const width = axisWidth ?? HORIZONTAL_AXIS_WIDTH;
  const alignRight = alignLabelsRight ?? axisWidth !== undefined;
  const name = payload?.value ?? '';
  const maxChars =
    axisWidth !== undefined ? Math.floor((width - 12) / (alignRight ? 6 : 5.5)) : HORIZONTAL_LABEL_MAX_CHARS;
  const lines = wrapLabel(name, maxChars, HORIZONTAL_LABEL_MAX_LINES);
  const lineHeight = 12;
  const left = x - width + 4;
  // Anchor of the text: right edge of the axis when the width is set, otherwise the center of the names column
  const center = alignRight ? x - 8 : x - width / 2;
  // Centers the block of lines vertically on the row
  const firstLineY = y + 4 - ((lines.length - 1) * lineHeight) / 2;
  const isSelected = selectedLabel !== undefined && selectedLabel === name;
  const isClickable = Boolean(onLabelClick);

  return (
    <g
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-pressed={isClickable ? isSelected : undefined}
      aria-label={isClickable ? `Filtrar por ${name}` : undefined}
      onClick={isClickable ? () => onLabelClick?.(name) : undefined}
      onKeyDown={
        isClickable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onLabelClick?.(name);
              }
            }
          : undefined
      }
      className={isClickable ? 'cursor-pointer outline-none [&:focus-visible>text]:underline' : undefined}
    >
      {isClickable && (
        // Transparent hit area over the whole label so the click target is easy to reach
        <rect
          x={left - 4}
          y={y - HORIZONTAL_ROW_HEIGHT / 2}
          width={width - 4}
          height={HORIZONTAL_ROW_HEIGHT}
          rx={4}
          className={
            isSelected
              ? 'fill-blue-100 dark:fill-blue-900/40'
              : 'fill-transparent hover:fill-gray-100 dark:hover:fill-slate-800'
          }
        />
      )}
      <text
        x={center}
        y={firstLineY}
        textAnchor={alignRight ? 'end' : 'middle'}
        fontSize={11}
        fontWeight={isSelected ? 700 : 400}
        className={
          isSelected
            ? 'fill-blue-700 dark:fill-blue-300'
            : 'fill-gray-600 dark:fill-gray-400'
        }
      >
        <title>{name}</title>
        {lines.map((line, index) => (
          <tspan key={index} x={center} dy={index === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// Color values live in globals.css as CSS variables (--chart-*).
const DATASET_KEYS = ['total', 'gic', 'se', 'sifj'];
const DATASET_SOLID_PALETTE = DATASET_KEYS.map((key) => `rgba(var(--chart-${key}), 0.8)`);

export const BarChart = ({
  data,
  horizontalLabels = false,
  stacked = false,
  onBarClick,
  horizontal = false,
  maxVisibleBars,
  onLabelClick,
  selectedLabel,
  showAllXLabels = false,
  height,
  xAxisHeight,
  axisWidth,
  alignLabelsRight,
  rotateXLabels,
  showValues = false,
  selectedIndex,
  yTicks,
}: BarChartProps) => {
  // Transform data for Recharts
  const chartData = data.labels.map((label, index) => {
    const dataPoint: Record<string, string | number> = { name: label };
    data.datasets.forEach((dataset) => {
      dataPoint[dataset.label] = dataset.data[index];
    });
    return dataPoint;
  });

  const stackTotals = chartData.map((point) =>
    data.datasets.reduce((sum, dataset) => sum + (Number(point[dataset.label]) || 0), 0)
  );

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[380px] text-sm text-secondary">
        No hay registros para esta selección
      </div>
    );
  }

  const showLegend = horizontal ? data.datasets.length > 1 : !showValues;
  const horizontalLegendRoom = horizontal && showLegend ? ALIGNED_LEGEND_HEIGHT : 0;
  const horizontalBarSize = stacked
    ? HORIZONTAL_BAR_SIZE
    : Math.min(HORIZONTAL_BAR_SIZE, Math.floor(26 / data.datasets.length));

  // Horizontal charts give every bar its own row so each name stays readable
  const chartHeight = horizontal
    ? (height ?? chartData.length * HORIZONTAL_ROW_HEIGHT + HORIZONTAL_PADDING + horizontalLegendRoom)
    : (height ?? 380);
  // Visible window: up to maxVisibleBars rows; beyond that the chart scrolls vertically
  const scrollStyle =
    horizontal && maxVisibleBars
      ? {
          maxHeight: maxVisibleBars * HORIZONTAL_ROW_HEIGHT + HORIZONTAL_PADDING,
          overflowY: 'auto' as const,
          // With overflow-y set, the browser would otherwise turn overflow-x into auto and show a
          // horizontal bar whenever the vertical one takes a few pixels of width
          overflowX: 'hidden' as const,
        }
      : undefined;

  return (
    // w-full: inside a flex-centered parent (ChartWrapper) this div would otherwise shrink to its
    // content, and the chart below, sized as 100% of it, would collapse to zero width
    <div style={scrollStyle} className="w-full">
    <ResponsiveContainer
      width="100%"
      height={chartHeight}
      className={onBarClick ? '[&_.recharts-wrapper]:cursor-pointer' : undefined}
    >
      <RechartsBarChart
        data={chartData}
        onClick={
          onBarClick
            ? (state) => {
                const index = state?.activeTooltipIndex;
                if (typeof index === 'number') onBarClick(index);
              }
            : undefined
        }
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={
          horizontal
            ? { top: 5, right: 40, bottom: 5, left: 0 }
            : yTicks
              ? showValues
                ? { ...ALIGNED_CHART_MARGIN, bottom: ALIGNED_CHART_MARGIN.bottom + ALIGNED_LEGEND_HEIGHT }
                : ALIGNED_CHART_MARGIN
              : { top: stacked || showValues ? 20 : 5, bottom: 24 }
        }
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
        {horizontal ? (
          <>
            <XAxis
              type="number"
              allowDecimals={false}
              className="text-sm text-gray-600 dark:text-gray-400"
              {...(yTicks ? { ticks: yTicks, domain: [0, yTicks[yTicks.length - 1]] } : {})}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={axisWidth ?? HORIZONTAL_AXIS_WIDTH}
              interval={0}
              tick={
                <HorizontalCategoryTick
                  onLabelClick={onLabelClick}
                  selectedLabel={selectedLabel}
                  axisWidth={axisWidth}
                  alignLabelsRight={alignLabelsRight}
                />
              }
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              className="text-sm text-gray-600 dark:text-gray-400"
              interval={showAllXLabels ? 0 : 'preserveEnd'}
              tick={showAllXLabels ? { fontSize: 11 } : undefined}
              angle={rotateXLabels ? -90 : horizontalLabels ? 0 : -30}
              textAnchor={rotateXLabels ? 'end' : horizontalLabels ? 'middle' : 'end'}
              height={xAxisHeight ?? (rotateXLabels ? 56 : horizontalLabels ? 30 : 50)}
            />
            <YAxis
              className="text-sm text-gray-600 dark:text-gray-400"
              {...(yTicks
                ? { ticks: yTicks, domain: [0, yTicks[yTicks.length - 1]], allowDecimals: false, width: ALIGNED_Y_AXIS_WIDTH }
                : {})}
            />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.5rem',
            color: 'var(--color-text)',
          }}
          labelStyle={{ color: 'var(--color-text)' }}
          itemStyle={{ color: 'var(--color-text)' }}
          cursor={{ fill: 'var(--color-border)', opacity: 0.3 }}
        />
        {showLegend && <Legend wrapperStyle={yTicks ? ALIGNED_LEGEND_STYLE : undefined} />}
        {data.datasets.map((dataset, index) => {
          // Per-point coloring: when backgroundColor is an array with one
          // color per data point, render a <Cell> per bar so each point
          // (e.g. each group) gets its own distinct color.
          const perPointColors =
            Array.isArray(dataset.backgroundColor) &&
            dataset.backgroundColor.length === dataset.data.length
              ? dataset.backgroundColor
              : null;
          const fallbackFill =
            (Array.isArray(dataset.backgroundColor)
              ? dataset.backgroundColor[0]
              : dataset.backgroundColor) ||
            DATASET_SOLID_PALETTE[index % DATASET_SOLID_PALETTE.length];

          return (
            <Bar
              key={dataset.label}
              dataKey={dataset.label}
              fill={fallbackFill}
              stackId={stacked ? 'stack' : undefined}
              barSize={horizontal ? horizontalBarSize : undefined}
            >
              {perPointColors?.map((color, pointIndex) => (
                <Cell
                  key={`cell-${pointIndex}`}
                  fill={color}
                  fillOpacity={
                    selectedIndex === undefined || selectedIndex < 0 || selectedIndex === pointIndex
                      ? 1
                      : 0.35
                  }
                />
              ))}
              {stacked && (
                <LabelList
                  dataKey={dataset.label}
                  position="center"
                  fill="rgb(var(--chart-segment-label))"
                  fontSize={12}
                  fontWeight={600}
                  formatter={(value: number) => (value > 0 ? value : '')}
                />
              )}
              {stacked && index === data.datasets.length - 1 && (
                <LabelList
                  position={horizontal ? 'right' : 'top'}
                  valueAccessor={(_: unknown, i: number) => stackTotals[i]}
                  fill="currentColor"
                  fontSize={12}
                  fontWeight={700}
                />
              )}
              {showValues && !horizontal && !stacked && (
                <LabelList
                  dataKey={dataset.label}
                  position="top"
                  fill="currentColor"
                  fontSize={12}
                  fontWeight={600}
                />
              )}
              {horizontal && !stacked && (
                <LabelList
                  dataKey={dataset.label}
                  position="right"
                  fill="currentColor"
                  fontSize={12}
                  fontWeight={600}
                />
              )}
            </Bar>
          );
        })}
      </RechartsBarChart>
    </ResponsiveContainer>
    </div>
  );
};
