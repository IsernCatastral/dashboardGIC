/**
 * TrendIndicator Component
 * Displays trend arrow icon (up/down/stable) with appropriate colors
 */

import type { TrendType } from '../../types';

interface TrendIndicatorProps {
  trend: TrendType;
}

export const TrendIndicator = ({ trend }: TrendIndicatorProps) => {
  if (trend === 'up') {
    return (
      <svg
        className="w-5 h-5 text-success"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-label="Tendencia ascendente"
      >
        <path
          fillRule="evenodd"
          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (trend === 'down') {
    return (
      <svg
        className="w-5 h-5 text-error"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-label="Tendencia descendente"
      >
        <path
          fillRule="evenodd"
          d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  // stable
  return (
    <svg
      className="w-5 h-5 text-gray-500 dark:text-gray-400"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-label="Tendencia estable"
    >
      <path
        fillRule="evenodd"
        d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
};
