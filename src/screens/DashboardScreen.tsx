/**
 * DashboardScreen Component
 * Main dashboard view with metrics, KPIs, charts, and data tables
 */

import { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { MetricCard } from '../components/metrics/MetricCard';
import { KPIList } from '../components/kpis/KPIList';
import { ChartWrapper } from '../components/charts/ChartWrapper';
import { MapVisualization } from '../components/map/MapVisualization';
import { getSharedYTicks } from '../utils/chartScale';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { getEntriesExitsChart, type EntriesExitsDependency } from '../services/dashboardData.service';
import { formatNumber } from '../utils/formatters';

// Plot height shared by the two time-series charts so their gridlines line up. The cards
// are compact (less padding), so the card grows by about this value minus what the padding gave back.
const TIME_SERIES_PLOT_HEIGHT = 480;
const TIME_SERIES_PLOT_HEIGHT_MOBILE = 360;
const TIME_SERIES_HORIZONTAL_PLOT_HEIGHT = 560;
const TIME_SERIES_HORIZONTAL_PLOT_HEIGHT_MOBILE = 500;
const TIME_SERIES_AXIS_WIDTH = 72;

// Header cell of the records table. `sticky top-0` keeps the header visible while the rows scroll
// inside the table's container. It is set on each cell (not on <tr>/<thead>, which browsers don't
// handle reliably), so every cell needs its own opaque background and bottom border.
const TABLE_HEADER_CELL =
  'sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm';

// The map's dependency filter and the main metric cards share one selection: each card id
// matches one dependency of the map ("total" is "Todas")
const DATASET_TO_MAP_DEPENDENCY: Record<string, string> = {
  total: 'Todas',
  gic: 'GIC',
  se: 'SE',
  sifj: 'SIFJ',
};
const MAP_DEPENDENCY_TO_DATASET: Record<string, string> = {
  Todas: 'total',
  GIC: 'gic',
  SE: 'se',
  SIFJ: 'sifj',
};

// Records table on this screen is scoped to the GIC dependency, matched
// against the original source `dependenciaOrigen` field (short code).
const GIC_SOURCE_DEPENDENCY = 'GIC';

export const DashboardScreen = () => {
  const { dashboardData, isLoading, error, refetch } = useData();
  const isMobile = useBreakpoint() === 'mobile';
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('total'); // Default to total
  const [radicadoFilter, setRadicadoFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [assignedUserFilter, setAssignedUserFilter] = useState<string>('Todos');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [procedureTypeFilter, setProcedureTypeFilter] = useState<string>('Todos');
  const [dependencyFilter, setDependencyFilter] = useState<string>('Todas');
  const [entriesExitsFilter, setEntriesExitsFilter] = useState<EntriesExitsDependency>('Totales');
  const [isRecordsOpen, setIsRecordsOpen] = useState<boolean>(false);

  const otherCharts = dashboardData?.charts ?? [];

  // Get KPIs for selected dataset
  const selectedKPIData = dashboardData?.kpisByDataset[selectedDatasetId as keyof typeof dashboardData.kpisByDataset];

  // Optimized pie chart - only recreate when selectedKPIData changes
  const optimizedPieChart = useMemo(() => {
    const pieChart = otherCharts.find((chart) => chart.id === 'chart-2');
    if (!pieChart || !selectedKPIData) return null;

    return {
      ...pieChart,
      data: {
        labels: pieChart.data.labels,
        datasets: [
          {
            ...pieChart.data.datasets[0],
            data: [
              selectedKPIData.riesgoBajo,
              selectedKPIData.riesgoMedio,
              selectedKPIData.riesgoAlto,
            ],
          },
        ],
      },
    };
  }, [selectedKPIData, otherCharts]);

  if (isLoading && !dashboardData) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  if (!dashboardData) {
    return <ErrorMessage message="No hay datos disponibles" onRetry={refetch} />;
  }

  const handleMetricClick = (datasetId: string | undefined) => {
    if (datasetId) {
      setSelectedDatasetId(datasetId);
    }
  };

  // "Entradas y salidas" and "Trámites acumulados" share one Y scale: the ticks are built
  // from the largest value of both charts (the cumulative one), so their gridlines match.
  // Plain computation (no hooks), placed after the early returns like the rest of the data.
  const timeSeriesCharts = dashboardData.charts.filter(
    (chart) => chart.id === 'chart-4' || chart.id === 'chart-5'
  );
  const timeSeriesYTicks = getSharedYTicks(
    timeSeriesCharts.flatMap((chart) =>
      chart.stacked
        ? [chart.data.labels.map((_, i) => chart.data.datasets.reduce((sum, d) => sum + (d.data[i] ?? 0), 0))]
        : chart.data.datasets.map((dataset) => dataset.data)
    )
  );

  // Records table on this screen is scoped to GIC, matched against the
  // original source dependency field (sourceDependency), not the derived
  // short code.
  const gicRecords = dashboardData.records.filter(
    (record) => record.sourceDependency === GIC_SOURCE_DEPENDENCY
  );

  // Unique procedure types for the filter dropdown (GIC only)
  const procedureTypes = Array.from(new Set(gicRecords.map((record) => record.procedureType)));

  // Unique assigned users for the filter dropdown (GIC only)
  const assignedUsers = Array.from(new Set(gicRecords.map((record) => record.assignedUser))).sort();

  // Calculate days until due as allottedDays minus days elapsed since filingDate
  const recordsWithCalculatedDaysUntilDue = gicRecords.map((record) => {
    const filingDate = new Date(record.filingDate);
    const today = new Date();
    const elapsedDays = Math.floor((today.getTime() - filingDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      ...record,
      daysUntilDue: record.allottedDays - elapsedDays,
    };
  });

  // Filter records by radicado, status, assigned user, procedure type and date range
  const filteredRecords = recordsWithCalculatedDaysUntilDue.filter((record) => {
    if (
      radicadoFilter.trim() &&
      !record.radicado.toLowerCase().includes(radicadoFilter.trim().toLowerCase())
    ) {
      return false;
    }
    if (statusFilter !== 'Todos' && record.status !== statusFilter) {
      return false;
    }
    if (assignedUserFilter !== 'Todos' && record.assignedUser !== assignedUserFilter) {
      return false;
    }
    if (procedureTypeFilter !== 'Todos' && record.procedureType !== procedureTypeFilter) {
      return false;
    }
    if (dateFrom && record.filingDate < dateFrom) {
      return false;
    }
    if (dateTo && record.filingDate > dateTo) {
      return false;
    }
    return true;
  });

  // Build dynamic KPIs based on selected dataset
  const dynamicKPIs = selectedKPIData ? [
    {
      id: 'kpi-bajo',
      label: 'Solicitudes en Riesgo Bajo',
      currentValue: selectedKPIData.riesgoBajo,
      targetValue: Math.floor(selectedKPIData.riesgoBajo * 0.9),
      unit: 'solicitudes',
      trend: 'stable' as const,
      status: 'success' as const,
    },
    {
      id: 'kpi-medio',
      label: 'Solicitudes en Riesgo Medio',
      currentValue: selectedKPIData.riesgoMedio,
      targetValue: Math.floor(selectedKPIData.riesgoMedio * 1.2),
      unit: 'solicitudes',
      trend: 'up' as const,
      status: 'warning' as const,
    },
    {
      id: 'kpi-alto',
      label: 'Solicitudes en Riesgo Alto',
      currentValue: selectedKPIData.riesgoAlto,
      targetValue: Math.floor(selectedKPIData.riesgoAlto * 0.8),
      unit: 'solicitudes',
      trend: 'down' as const,
      status: 'error' as const,
    },
  ] : dashboardData.kpis;

  return (
    <div className="space-y-6 min-h-full bg-white dark:bg-slate-900">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 sm:p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">
          Bienvenido!
        </h2>
      </div>

      {/* Metrics Section */}
      <div>
        <h3 className="text-xl sm:text-2xl font-semibold mb-4">Métricas Principales</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Haz clic en cualquier métrica para ver su desglose de riesgo
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.metrics.map((metric) => (
            <MetricCard 
              key={metric.id} 
              metric={metric} 
              isClickable={!!metric.datasetId}
              isSelected={metric.datasetId === selectedDatasetId}
              onClick={() => handleMetricClick(metric.datasetId)}
            />
          ))}
        </div>
      </div>

      {/* KPIs Section */}
      <div>
        <h3 className="text-xl sm:text-2xl font-semibold mb-4">Indicadores de Oportunidad</h3>
        <KPIList kpis={dynamicKPIs} />
      </div>

      {/* Charts and Map Section */}
      <div>
        <h3 className="text-xl sm:text-2xl font-semibold mb-4">Análisis de Datos</h3>

        {/* Pie chart + Map - side by side row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {otherCharts
            .filter((chart) => chart.id === 'chart-2')
            .map((chart) => {
              // Use optimized pie chart for better performance
              if (chart.id === 'chart-2' && optimizedPieChart) {
                return (
                  <ChartWrapper
                    key={chart.id}
                    chart={optimizedPieChart}
                    height={isMobile ? 320 : 460}
                    outerRadius={isMobile ? 105 : 150}
                  />
                );
              }
              return <ChartWrapper key={chart.id} chart={chart} />;
            })}

          {/* Map Visualization - Same size as pie chart */}
          <MapVisualization
            records={dashboardData.records}
            dependencyFilter={DATASET_TO_MAP_DEPENDENCY[selectedDatasetId] ?? 'Todas'}
            onDependencyChange={(dependency) =>
              setSelectedDatasetId(MAP_DEPENDENCY_TO_DATASET[dependency] ?? 'total')
            }
          />
        </div>

        {/* Entries/exits and cumulative trámites (last 12 months) - side by side, below the pie chart and map.
            Both use the same Y ticks and plot height, so their gridlines line up */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {timeSeriesCharts.map((chart) => {
            const isDependencyChart = chart.id === 'chart-5';
            const isEntriesExitsChart = chart.id === 'chart-4';
            const shownChart = isEntriesExitsChart
              ? { ...chart, data: getEntriesExitsChart(entriesExitsFilter) }
              : isDependencyChart && dependencyFilter !== 'Todas'
                ? {
                    ...chart,
                    data: {
                      ...chart.data,
                      datasets: chart.data.datasets.filter(
                        (dataset) => dataset.label === dependencyFilter
                      ),
                    },
                  }
                : chart;
            const radicadosTotal = shownChart.data.datasets.reduce(
              (sum, dataset) => sum + dataset.data.reduce((a, b) => a + b, 0),
              0
            );
            const drawnChart = isDependencyChart
              ? {
                  ...shownChart,
                  data: {
                    ...shownChart.data,
                    labels: [...shownChart.data.labels].reverse(),
                    datasets: shownChart.data.datasets.map((dataset) => ({
                      ...dataset,
                      data: [...dataset.data].reverse(),
                    })),
                  },
                }
              : shownChart;
            return (
              <ChartWrapper
                key={chart.id}
                chart={drawnChart}
                dynamicTitle={
                  isDependencyChart
                    ? `Trámites ${dependencyFilter === 'Todas' ? 'Totales' : dependencyFilter} radicados por mes: ${formatNumber(radicadosTotal)}`
                    : isEntriesExitsChart
                      ? `${chart.title} · ${entriesExitsFilter}`
                      : undefined
                }
                showAllXLabels
                horizontal={isDependencyChart}
                axisWidth={isDependencyChart ? TIME_SERIES_AXIS_WIDTH : undefined}
                rotateXLabels={isMobile && !isDependencyChart}
                compact
                yTicks={timeSeriesYTicks}
                plotHeight={
                  isDependencyChart
                    ? isMobile ? TIME_SERIES_HORIZONTAL_PLOT_HEIGHT_MOBILE : TIME_SERIES_HORIZONTAL_PLOT_HEIGHT
                    : isMobile ? TIME_SERIES_PLOT_HEIGHT_MOBILE : TIME_SERIES_PLOT_HEIGHT
                }
                headerAction={
                  isDependencyChart ? (
                    <select
                      value={dependencyFilter}
                      onChange={(e) => setDependencyFilter(e.target.value)}
                      aria-label="Filtrar por dependencia"
                      className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="Todas">Todas las dependencias</option>
                      {chart.data.datasets.map((dataset) => (
                        <option key={dataset.id} value={dataset.label}>
                          {dataset.label}
                        </option>
                      ))}
                    </select>
                  ) : isEntriesExitsChart ? (
                    <select
                      value={entriesExitsFilter}
                      onChange={(e) => setEntriesExitsFilter(e.target.value as EntriesExitsDependency)}
                      aria-label="Filtrar entradas y salidas por dependencia"
                      className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="Totales">Totales</option>
                      <option value="GIC">GIC</option>
                      <option value="SE">SE</option>
                      <option value="SIFJ">SIFJ</option>
                    </select>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setIsRecordsOpen((open) => !open)}
          aria-expanded={isRecordsOpen}
          className={`flex w-full items-center justify-between text-left ${isRecordsOpen ? 'mb-4' : ''}`}
        >
          <div>
            <h3 className="text-lg font-semibold">Últimos Registros</h3>
            <p className="text-sm text-secondary">10 registros más recientes</p>
          </div>
          <span
            aria-hidden="true"
            className={`text-sm text-secondary transition-transform ${isRecordsOpen ? 'rotate-180' : ''}`}
          >
            ▼
          </span>
        </button>

        {isRecordsOpen && (
        <>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4 [&>select]:w-full sm:[&>select]:w-auto [&>div]:w-full sm:[&>div]:w-auto [&>div>input]:flex-1 sm:[&>div>input]:flex-none">
          <input
            type="text"
            value={radicadoFilter}
            onChange={(e) => setRadicadoFilter(e.target.value)}
            placeholder="Buscar radicado"
            aria-label="Buscar por radicado"
            className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 w-full sm:w-44"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Riesgo Bajo">Riesgo Bajo</option>
            <option value="Riesgo Medio">Riesgo Medio</option>
            <option value="Riesgo Alto">Riesgo Alto</option>
          </select>

          <select
            value={assignedUserFilter}
            onChange={(e) => setAssignedUserFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="Todos">Todos los profesionales</option>
            {assignedUsers.map((user) => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>

          <select
            value={procedureTypeFilter}
            onChange={(e) => setProcedureTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="Todos">Todos los trámites</option>
            {procedureTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <label className="text-sm text-secondary">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-secondary">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-80 sm:max-h-96">
          <table className="w-full [&_td]:px-2 [&_td]:py-2 [&_td]:text-xs sm:[&_td]:px-4 sm:[&_td]:py-3 sm:[&_td]:text-sm">
            <thead>
              <tr>
                <th className={TABLE_HEADER_CELL}>Radicado</th>
                <th className={TABLE_HEADER_CELL}>Profesional Encargado</th>
                <th className={TABLE_HEADER_CELL}>Tipo de Trámite</th>
                <th className={TABLE_HEADER_CELL}>Grupo</th>
                <th className={TABLE_HEADER_CELL}>Código de Trámite</th>
                <th className={TABLE_HEADER_CELL}>Días por Trámite</th>
                <th className={TABLE_HEADER_CELL}>Riesgo</th>
                <th className={TABLE_HEADER_CELL}>Fecha de Radicación</th>
                <th className={TABLE_HEADER_CELL}>Días Restantes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-sm font-mono">{record.radicado}</td>
                  <td className="py-3 px-4 text-sm">{record.assignedUser}</td>
                  <td className="py-3 px-4 text-sm">{record.procedureType}</td>
                  <td className="py-3 px-4 text-sm">{record.group}</td>
                  <td className="py-3 px-4 text-sm">{record.procedureCode}</td>
                  <td className="py-3 px-4 text-sm">{record.allottedDays}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        record.status === 'Riesgo Bajo'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : record.status === 'Riesgo Medio'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{record.filingDate}</td>
                  <td className="py-3 px-4 text-sm">{record.daysUntilDue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>
    </div>
  );
};
