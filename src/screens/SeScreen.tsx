/**
 * SeScreen Component
 * Dependency-scoped view for SE: summary totals, interlinked charts and the
 * "Registros SE" table, all filtered to records matching the SE source dependency.
 */

import { useState, useRef, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { BarChart } from '../components/charts/BarChart';
import { PieChart } from '../components/charts/PieChart';
import { formatNumber } from '../utils/formatters';
import { getSharedYTicks } from '../utils/chartScale';
import { colorFromPalette, PROCEDURE_TYPE_COLORS, STATE_COLORS } from '../utils/chartColors';

// Risk status colors, consistent with --chart-riesgo-* variables in globals.css
const RISK_STATUS_COLORS: Record<string, string> = {
  'Riesgo Bajo': 'rgba(var(--chart-riesgo-bajo), 0.8)',
  'Riesgo Medio': 'rgba(var(--chart-riesgo-medio), 0.8)',
  'Riesgo Alto': 'rgba(var(--chart-riesgo-alto), 0.8)',
};

// Header cell of the records table. `sticky top-0` keeps the header visible while the rows scroll
// inside the table's container. It is set on each cell (not on <tr>/<thead>, which browsers don't
// handle reliably), so every cell needs its own opaque background and bottom border.
const TABLE_HEADER_CELL =
  'sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 text-left py-3 px-4 font-medium text-sm';

// Records on this screen are scoped to SE, matched against the original
// source `dependenciaOrigen` field (short code), consistent with how the
// other dependency screens scope their records.
const SE_SOURCE_DEPENDENCY = 'SE';

export const SeScreen = () => {
  const { dashboardData, isLoading, error, refetch } = useData();
  const [radicadoFilter, setRadicadoFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [assignedUserFilter, setAssignedUserFilter] = useState<string>('Todos');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [chartGroupFilter, setChartGroupFilter] = useState<string>('Todos');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedProcedureType, setSelectedProcedureType] = useState<string | null>(null);
  const [selectedTypeRisk, setSelectedTypeRisk] = useState<string>('Todos');
  // Text being typed in the "Profesional Encargado" search box, or null when the
  // user isn't typing. While it is null the box shows the table's user filter
  // (assignedUserFilter), so picking a professional anywhere (table dropdown,
  // chart label or this box) is reflected here, and typing never snaps back.
  const [userPieInputText, setUserPieInputText] = useState<string | null>(null);
  const [isUserPieDropdownOpen, setIsUserPieDropdownOpen] = useState(false);
  const userPieDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userPieDropdownRef.current &&
        !userPieDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserPieDropdownOpen(false);
        // Drop any half-typed text so the box goes back to showing the real filter
        setUserPieInputText(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading && !dashboardData) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  if (!dashboardData) {
    return <ErrorMessage message="No hay datos disponibles" onRetry={refetch} />;
  }

  // Scope everything to SE records only
  const seRecords = dashboardData.records.filter(
    (record) => record.sourceDependency === SE_SOURCE_DEPENDENCY
  );

  // Options for the filter dropdowns (SE only)
  const assignedUsers: string[] = Array.from(
    new Set<string>(seRecords.map((record) => record.assignedUser))
  ).sort();
  const chartGroupOptions: string[] = Array.from(
    new Set<string>(seRecords.map((record) => record.group))
  ).sort();
  const procedureTypeOptions: string[] = Array.from(
    new Set<string>(seRecords.map((record) => record.procedureType))
  ).sort();
  const stateOptions: string[] = Array.from(
    new Set<string>(seRecords.map((record) => record.workflowState))
  ).sort();
  const activeState =
    selectedState !== null && stateOptions.includes(selectedState) ? selectedState : null;
  const handleGroupFilterChange = (group: string) => {
    setChartGroupFilter(group);
  };

  // Calculate days until due as allottedDays minus days elapsed since filingDate
  const recordsWithCalculatedDaysUntilDue = seRecords.map((record) => {
    const filingDate = new Date(record.filingDate);
    const today = new Date();
    const elapsedDays = Math.floor((today.getTime() - filingDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      ...record,
      daysUntilDue: record.allottedDays - elapsedDays,
    };
  });

  // Table filters: radicado, status, state, assigned user and date range.
  // The charts read these same filters, so a click on a chart only has to change
  // one of them. `ignoreUser` lets the professional chart keep listing everybody
  // while one professional is selected.
  const matchesTableFilters = (
    record: (typeof recordsWithCalculatedDaysUntilDue)[number],
    ignoreUser = false
  ) => {
    if (
      radicadoFilter.trim() &&
      !record.radicado.toLowerCase().includes(radicadoFilter.trim().toLowerCase())
    ) {
      return false;
    }
    if (statusFilter !== 'Todos' && record.status !== statusFilter) {
      return false;
    }
    if (
      !ignoreUser &&
      assignedUserFilter !== 'Todos' &&
      record.assignedUser !== assignedUserFilter
    ) {
      return false;
    }
    if (activeState !== null && record.workflowState !== activeState) {
      return false;
    }
    if (dateFrom && record.filingDate < dateFrom) {
      return false;
    }
    if (dateTo && record.filingDate > dateTo) {
      return false;
    }
    return true;
  };
  const inSelectedGroup = (record: { group: string }) =>
    chartGroupFilter === 'Todos' || record.group === chartGroupFilter;

  // Summary totals: count of SE records per status, consistent with the table below
  const totalSolicitudes = seRecords.length;
  const totalRiesgoBajo = seRecords.filter((r) => r.status === 'Riesgo Bajo').length;
  const totalRiesgoMedio = seRecords.filter((r) => r.status === 'Riesgo Medio').length;
  const totalRiesgoAlto = seRecords.filter((r) => r.status === 'Riesgo Alto').length;

  // "Cantidad por Riesgo vs Grupo" and "Cantidad de Trámites por Grupo" depend
  // only on the group filter ("Filtro de Grupo" and the bars of the second
  // chart). They ignore every other table filter (user, type, status, dates),
  // so choosing a professional or a procedure type never changes them.
  const recordsForGroupCharts = seRecords;
  const recordsForTypePie = seRecords.filter(inSelectedGroup);
  const groupsInFilteredRecords: string[] = Array.from(
    new Set<string>(recordsForGroupCharts.map((r) => r.group))
  ).sort();
  const statusesForChart = ['Riesgo Bajo', 'Riesgo Medio', 'Riesgo Alto'] as const;
  const activeProcedureType =
    selectedProcedureType !== null &&
    recordsForTypePie.some((r) => r.procedureType === selectedProcedureType)
      ? selectedProcedureType
      : null;
  const typeRiskFilter = activeProcedureType === null ? 'Todos' : selectedTypeRisk;
  const matchesTypeChain = (r: { procedureType: string; status: string }) =>
    (activeProcedureType === null || r.procedureType === activeProcedureType) &&
    (typeRiskFilter === 'Todos' || r.status === typeRiskFilter);
  const recordsForStateChart = recordsForTypePie.filter((r) => matchesTypeChain(r));
  const tableRecords = recordsWithCalculatedDaysUntilDue.filter(
    (record) => matchesTableFilters(record) && inSelectedGroup(record) && matchesTypeChain(record)
  );
  const handleProcedureTypeChange = (type: string | null) => {
    setSelectedProcedureType(type);
    setSelectedTypeRisk('Todos');
  };
  const handleTypeRiskClick = (index: number) => {
    const risk = statusesForChart[index];
    if (!risk) return;
    setSelectedTypeRisk(selectedTypeRisk === risk ? 'Todos' : risk);
  };
  // Short "G1, G2, ..." labels are derived from the full group list
  // (chartGroupOptions), so a group keeps the same label in every
  // chart, even when a filter leaves only some of the groups visible. The
  // legend below maps each short label back to its full group name.
  const groupShortLabelOf = (group: string) => `G${chartGroupOptions.indexOf(group) + 1}`;
  const groupShortLabels = groupsInFilteredRecords.map(groupShortLabelOf);

  // Clicking a bar in "Cantidad de trámites por Riesgo por Grupo" selects that group in the
  // table's "Grupo" filter (and in "Filtro de Grupo"); clicking another group replaces it.
  // The filter is cleared with the "Todos los grupos" dropdown.
  const handleGroupBarClick = (index: number) => {
    const group = groupsInFilteredRecords[index];
    if (!group) return;
    handleGroupFilterChange(group);
  };
  const statusByGroupChart = {
    id: 'status-by-group',
    title: 'Cantidad por Riesgo vs Grupo',
    type: 'bar' as const,
    data: {
      labels: groupShortLabels,
      datasets: statusesForChart.map((status) => ({
        label: status,
        data: groupsInFilteredRecords.map(
          (group) =>
            recordsForGroupCharts.filter((r) => r.group === group && r.status === status).length
        ),
        backgroundColor: RISK_STATUS_COLORS[status],
      })),
    },
  };

  const groupLegend = groupsInFilteredRecords.map((group, index) => ({
    shortLabel: groupShortLabels[index],
    group,
  }));

  const recordCountByState = new Map<string, number>();
  recordsForStateChart.forEach((r) => {
    recordCountByState.set(r.workflowState, (recordCountByState.get(r.workflowState) ?? 0) + 1);
  });
  const workflowStates: string[] = Array.from(recordCountByState.keys()).sort(
    (a, b) => (recordCountByState.get(b) ?? 0) - (recordCountByState.get(a) ?? 0) || a.localeCompare(b)
  );
  const chartState =
    activeState !== null && workflowStates.includes(activeState) ? activeState : null;
  const allWorkflowStates: string[] = Array.from(
    new Set<string>(seRecords.map((r) => r.workflowState))
  ).sort();
  const stateColorOf = (state: string) =>
    colorFromPalette(STATE_COLORS, allWorkflowStates.indexOf(state));
  const totalForStates = workflowStates.reduce((sum, s) => sum + (recordCountByState.get(s) ?? 0), 0);
  const stateLegend = workflowStates.map((state) => {
    const count = recordCountByState.get(state) ?? 0;
    return {
      state,
      count,
      percent: totalForStates > 0 ? Math.round((count / totalForStates) * 100) : 0,
      color: stateColorOf(state),
    };
  });
  const statePieChart = {
    id: 'state-distribution-pie',
    title: 'Cantidad de trámites por Estado',
    type: 'pie' as const,
    data: {
      labels: workflowStates,
      datasets: [
        {
          label: 'Trámites',
          data: workflowStates.map((state) => recordCountByState.get(state) ?? 0),
          backgroundColor: workflowStates.map(stateColorOf),
        },
      ],
    },
  };
  const handleStateClick = (state: string) => {
    setSelectedState(chartState === state ? null : state);
  };

  const allProcedureTypes: string[] = Array.from(
    new Set<string>(seRecords.map((r) => r.procedureType))
  ).sort();
  const procedureTypeColorOf = (type: string) =>
    colorFromPalette(PROCEDURE_TYPE_COLORS, allProcedureTypes.indexOf(type));
  const procedureTypesInPie: string[] = procedureTypeOptions.filter((type) =>
    recordsForTypePie.some((r) => r.procedureType === type)
  );
  const procedureTypeLegend = procedureTypesInPie.map((type) => ({
    type,
    count: recordsForTypePie.filter((r) => r.procedureType === type).length,
    color: procedureTypeColorOf(type),
  }));
  const riskOfProcedureTypeChart = {
    id: 'risk-of-procedure-type',
    title: 'Riesgo del trámite',
    type: 'bar' as const,
    data: {
      labels: [...statusesForChart],
      datasets: [
        {
          label: 'Trámites',
          data: statusesForChart.map(
            (status) =>
              recordsForTypePie.filter(
                (r) => r.procedureType === activeProcedureType && r.status === status
              ).length
          ),
          backgroundColor: statusesForChart.map((status) => RISK_STATUS_COLORS[status]),
        },
      ],
    },
  };
  const groupPieChart = {
    id: 'procedure-type-distribution-pie',
    title: 'Cantidad de Trámites por Tipo de Trámite',
    type: 'pie' as const,
    data: {
      labels: procedureTypesInPie,
      datasets: [
        {
          label: 'Trámites',
          data: procedureTypesInPie.map(
            (type) => recordsForTypePie.filter((r) => r.procedureType === type).length
          ),
          backgroundColor: procedureTypesInPie.map(procedureTypeColorOf),
        },
      ],
    },
  };

  // Fourth chart: number of trámites per Profesional Encargado, one bar per
  // professional sorted from most to fewest. It ignores the user filter, so it keeps listing
  // every professional while one of them is selected and the user can switch to
  // another. The professional is chosen with a click on a name, with the search
  // box, or with the table's user filter; all three set the same filter
  // (assignedUserFilter). assignedUsers only contains users present in SE
  // records, so the list never includes GIC/SIFJ staff.
  const recordsForProfessionalChart = recordsForStateChart.filter(
    (r) => chartState === null || r.workflowState === chartState
  );
  const recordCountByUser = new Map<string, number>();
  recordsForProfessionalChart.forEach((r) => {
    recordCountByUser.set(r.assignedUser, (recordCountByUser.get(r.assignedUser) ?? 0) + 1);
  });
  const usersWithRecords: string[] = Array.from(recordCountByUser.keys()).sort(
    (a, b) => (recordCountByUser.get(b) ?? 0) - (recordCountByUser.get(a) ?? 0) || a.localeCompare(b)
  );
  // Highlighted name in the chart: the table's user filter, if that person is listed
  const activeTableProfessional = usersWithRecords.includes(assignedUserFilter)
    ? assignedUserFilter
    : 'Todos';
  const handleProfessionalLabelClick = (name: string) => {
    setUserPieInputText(null);
    setAssignedUserFilter(assignedUserFilter === name ? 'Todos' : name);
  };
  const recordCountByUserChart = {
    id: 'record-count-by-user',
    title: 'Cantidad de Trámites por Profesional Encargado',
    type: 'bar' as const,
    data: {
      labels: usersWithRecords,
      datasets: [
        {
          label: 'Trámites',
          data: usersWithRecords.map((user) => recordCountByUser.get(user) ?? 0),
          backgroundColor: 'rgba(var(--chart-total), 0.8)',
        },
      ],
    },
  };

  const groupTotals = statusByGroupChart.data.labels.map((_, i) =>
    statusByGroupChart.data.datasets.reduce((sum, d) => sum + d.data[i], 0)
  );
  const sharedYTicks = getSharedYTicks([groupTotals]);

  return (
    <div className="space-y-6 min-h-full bg-white dark:bg-slate-900">
      {/* Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Solicitudes</p>
          <p className="text-3xl font-bold mt-2">{formatNumber(totalSolicitudes)}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Riesgo Bajo</p>
          <p className="text-3xl font-bold mt-2">{formatNumber(totalRiesgoBajo)}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Total Riesgo Medio</p>
          <p className="text-3xl font-bold mt-2">{formatNumber(totalRiesgoMedio)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Riesgo Alto</p>
          <p className="text-3xl font-bold mt-2">{formatNumber(totalRiesgoAlto)}</p>
        </div>
      </div>

      {/* Charts: risk vs group and record count vs group. They only react to the group filter above and to the bars of the second chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Riesgo por Grupo</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 min-h-[2.25rem]">
              <h4 className="text-sm font-medium text-secondary">Cantidad de trámites por Riesgo por Grupo</h4>
              <select
                value={chartGroupFilter}
                onChange={(e) => handleGroupFilterChange(e.target.value)}
                aria-label="Filtrar por grupo"
                className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              >
                <option value="Todos">Todos los grupos</option>
                {chartGroupOptions.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <BarChart
              data={statusByGroupChart.data}
              horizontalLabels
              stacked
              yTicks={sharedYTicks}
              onBarClick={handleGroupBarClick}
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 min-h-[2.25rem]">
              <h4 className="text-sm font-medium text-secondary">
                {activeProcedureType === null
                  ? 'Cantidad de Trámites por Tipo de Trámite vs Grupo'
                  : `Riesgo del trámite ${activeProcedureType}`}
              </h4>
              <select
                value={activeProcedureType ?? 'Todos'}
                onChange={(e) =>
                  handleProcedureTypeChange(e.target.value === 'Todos' ? null : e.target.value)
                }
                aria-label="Filtrar por tipo de trámite"
                className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 max-w-xs"
              >
                <option value="Todos">Todos los trámites</option>
                {procedureTypesInPie.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            {activeProcedureType === null ? (
              <>
                <PieChart
                  data={groupPieChart.data}
                  height={360}
                  outerRadius={130}
                  showSliceNames={false}
                  showLegend={false}
                  onSliceClick={handleProcedureTypeChange}
                />
                <div className="flex flex-col gap-1.5 mt-3">
                  {procedureTypeLegend.map(({ type, count, color }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleProcedureTypeChange(type)}
                      aria-label={`Ver riesgo del trámite ${type}`}
                      className="flex items-center gap-1.5 text-left hover:underline"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-secondary">{type}: {count}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <BarChart
                data={riskOfProcedureTypeChart.data}
                horizontalLabels
                showValues
                selectedIndex={(statusesForChart as readonly string[]).indexOf(typeRiskFilter)}
                onBarClick={handleTypeRiskClick}
              />
            )}
          </div>
        </div>
        {/* Legend: maps each short label (G1, G2, ...) of the risk-by-group chart to its group name */}
        <div className="flex flex-wrap gap-3 mt-4">
          {groupLegend.map(({ shortLabel, group }) => (
            <span key={shortLabel} className="text-xs text-secondary">{shortLabel}: {group}</span>
          ))}
        </div>
      </div>

      {/* States by risk and trámites per Profesional Encargado. The second card is a bit wider (5:6) so the professionals' names fit */}
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_6fr] gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-lg font-semibold">Cantidad de trámites por Estado por Riesgo</h3>
            <select
              value={chartState ?? 'Todos'}
              onChange={(e) => setSelectedState(e.target.value === 'Todos' ? null : e.target.value)}
              aria-label="Filtrar por estado"
              className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            >
              <option value="Todos">Todos los estados</option>
              {workflowStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <PieChart
            data={statePieChart.data}
            height={360}
            outerRadius={130}
            showSliceNames={false}
            showLegend={false}
            selectedName={chartState ?? undefined}
            onSliceClick={handleStateClick}
          />
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 mt-3">
            {stateLegend.map(({ state, count, percent, color }) => (
              <button
                key={state}
                type="button"
                onClick={() => handleStateClick(state)}
                aria-pressed={chartState === state}
                aria-label={`Filtrar por el estado ${state}`}
                className={`flex items-center gap-1.5 text-left hover:underline ${chartState === state ? 'font-bold' : ''}`}
              >
                <span
                  className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-secondary">{state}: {count} ({percent}%)</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Cantidad de Trámites por Profesional Encargado</h3>
            <div className="relative flex items-center gap-2" ref={userPieDropdownRef}>
              <input
                type="text"
                value={userPieInputText ?? (assignedUserFilter === 'Todos' ? '' : assignedUserFilter)}
                onChange={(e) => {
                  const typed = e.target.value;
                  setUserPieInputText(typed);
                  setIsUserPieDropdownOpen(true);
                  // Apply the filter only once the typed text exactly matches
                  // a known user, or clear it back to "Todos" when emptied.
                  if (typed.trim() === '') {
                    setAssignedUserFilter('Todos');
                  } else if (assignedUsers.includes(typed)) {
                    setAssignedUserFilter(typed);
                  }
                }}
                onFocus={() => setIsUserPieDropdownOpen(true)}
                placeholder="Todos los profesionales"
                className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 w-64"
              />
              {assignedUserFilter !== 'Todos' && (
                <button
                  type="button"
                  onClick={() => {
                    setUserPieInputText(null);
                    setAssignedUserFilter('Todos');
                  }}
                  className="text-xs text-secondary hover:text-primary px-2 py-1"
                  aria-label="Limpiar filtro de profesional encargado"
                >
                  ✕
                </button>
              )}
              {isUserPieDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-64 max-h-56 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow-lg z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setUserPieInputText(null);
                      setAssignedUserFilter('Todos');
                      setIsUserPieDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Todos los profesionales
                  </button>
                  {assignedUsers
                    .filter((user) =>
                      user.toLowerCase().includes((userPieInputText ?? '').toLowerCase())
                    )
                    .map((user) => (
                      <button
                        key={user}
                        type="button"
                        onClick={() => {
                          setUserPieInputText(null);
                          setAssignedUserFilter(user);
                          setIsUserPieDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        {user}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
          <BarChart
            data={recordCountByUserChart.data}
            horizontal
            maxVisibleBars={10}
            onLabelClick={handleProfessionalLabelClick}
            selectedLabel={activeTableProfessional}
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Registros SE</h3>
            <p className="text-sm text-secondary">Registros de la dependencia SE</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="text"
            value={radicadoFilter}
            onChange={(e) => setRadicadoFilter(e.target.value)}
            placeholder="Buscar radicado"
            aria-label="Buscar por radicado"
            className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 w-44"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="Todos">Todos los riesgos</option>
            <option value="Riesgo Bajo">Riesgo Bajo</option>
            <option value="Riesgo Medio">Riesgo Medio</option>
            <option value="Riesgo Alto">Riesgo Alto</option>
          </select>

          <select
            value={activeState ?? 'Todos'}
            onChange={(e) => setSelectedState(e.target.value === 'Todos' ? null : e.target.value)}
            aria-label="Filtrar por estado"
            className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="Todos">Todos los estados</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
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
        <div className="overflow-x-auto overflow-y-auto max-h-96">
          <table className="w-full">
            <thead>
              <tr>
                <th className={TABLE_HEADER_CELL}>Radicado</th>
                <th className={TABLE_HEADER_CELL}>Profesional Encargado</th>
                <th className={TABLE_HEADER_CELL}>Tipo de Trámite</th>
                <th className={TABLE_HEADER_CELL}>Grupo</th>
                <th className={TABLE_HEADER_CELL}>Código de Trámite</th>
                <th className={TABLE_HEADER_CELL}>Días por Trámite</th>
                <th className={TABLE_HEADER_CELL}>Riesgo</th>
                <th className={TABLE_HEADER_CELL}>Estado</th>
                <th className={TABLE_HEADER_CELL}>Fecha de Radicación</th>
                <th className={TABLE_HEADER_CELL}>Días Restantes</th>
              </tr>
            </thead>
            <tbody>
              {tableRecords.map((record) => (
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
                  <td className="py-3 px-4 text-sm">{record.workflowState}</td>
                  <td className="py-3 px-4 text-sm">{record.filingDate}</td>
                  <td className="py-3 px-4 text-sm">{record.daysUntilDue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
