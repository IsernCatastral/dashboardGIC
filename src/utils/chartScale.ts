/**
 * Shared Y scale helpers, used when several charts must show the same gridlines
 * (e.g. "Entradas y salidas" next to "Trámites acumulados").
 */

import type { CSSProperties } from 'react';

/** Target number of gridline intervals; the real count depends on the "nice" step chosen */
const TARGET_INTERVALS = 6;

/**
 * Builds Y ticks (0, step, 2*step, ...) that cover every value of every series, with a
 * "nice" step (1, 2 or 5 times a power of ten). Charts that receive the same ticks draw
 * identical gridlines.
 */
export function getSharedYTicks(series: number[][]): number[] {
  const maxValue = Math.max(1, ...series.flat().filter((value) => Number.isFinite(value)));
  const rawStep = maxValue / TARGET_INTERVALS;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;
  const niceFactor = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  const step = niceFactor * magnitude;
  const top = Math.ceil(maxValue / step) * step;

  const ticks: number[] = [];
  for (let value = 0; value <= top; value += step) {
    ticks.push(value);
  }
  return ticks;
}

/**
 * Charts drawn with shared ticks also share margins and legend height, so their plot areas
 * have the same size and the gridlines line up. (A chart's legend height depends on how many
 * entries wrap onto extra lines, which would otherwise shrink one plot area more than the other.)
 */
export const ALIGNED_CHART_MARGIN = { top: 20, right: 16, bottom: 0, left: 0 };
/**
 * Fixed width of the Y axis labels. Both charts use the same value so their plot areas start at
 * the same x position; it fits the 4-digit values of the cumulative chart.
 */
export const ALIGNED_Y_AXIS_WIDTH = 48;
export const ALIGNED_LEGEND_HEIGHT = 64;
export const ALIGNED_LEGEND_STYLE: CSSProperties = { height: ALIGNED_LEGEND_HEIGHT };
