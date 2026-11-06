/**
 * MapVisualization Component
 * Card that hosts the ArcGIS Online Web Map with one point per record, colored by risk,
 * and a risk filter.
 */

import { useState } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { ArcGISWebMap } from './ArcGISWebMap';
import type { Record as DashboardRecord } from '../../types';

interface MapVisualizationProps {
  records?: DashboardRecord[];
  /** Dependency shown on the map: "Todas" or one of "GIC" / "SE" / "SIFJ" */
  dependencyFilter: string;
  onDependencyChange: (dependency: string) => void;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export const MapVisualization = ({
  records = [],
  dependencyFilter,
  onDependencyChange,
  isLoading = false,
  error,
  onRetry,
}: MapVisualizationProps) => {
  const [riskFilter, setRiskFilter] = useState<string>('Todos');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  const recordsWithoutLocation = records.filter(
    (record) => record.latitude === null || record.longitude === null
  ).length;

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Mapa de ubicaciones</h3>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto [&>select]:flex-1 sm:[&>select]:flex-none">
          <select
            value={dependencyFilter}
            onChange={(e) => onDependencyChange(e.target.value)}
            aria-label="Filtrar el mapa por dependencia"
            className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="Todas">Todas las dependencias</option>
            <option value="GIC">GIC</option>
            <option value="SE">SE</option>
            <option value="SIFJ">SIFJ</option>
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            aria-label="Filtrar el mapa por riesgo"
            className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="Todos">Todos los riesgos</option>
            <option value="Riesgo Bajo">Riesgo Bajo</option>
            <option value="Riesgo Medio">Riesgo Medio</option>
            <option value="Riesgo Alto">Riesgo Alto</option>
          </select>
        </div>
      </div>

      {/* ArcGIS Online Web Map */}
      <div className="relative flex-1 min-h-[320px] md:min-h-[460px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <ArcGISWebMap
          records={records}
          riskFilter={riskFilter}
          dependencyFilter={dependencyFilter}
        />
      </div>

      {recordsWithoutLocation > 0 && (
        <p className="text-xs text-secondary mt-2">
          {recordsWithoutLocation} registros sin ubicación
        </p>
      )}
    </div>
  );
};
