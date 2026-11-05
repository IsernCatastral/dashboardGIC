/**
 * Dashboard Data Service
 * Reads the raw backend payloads (records_tramites.json + grupos_tramites.json)
 * and derives every calculated value the UI needs: metric totals, risk
 * breakdown by dataset, zones, summary totals, and per-record risk/days.
 *
 * records_tramites.json (project root) is the source of `metrics`, `records`
 * and `recordCadaMes` (the monthly series behind chart-5, "Trámites radicados por mes").
 * entradas_salidas.json (project root) is the source of chart-4, "Entradas y salidas".
 * grupos_tramites.json (project root) provides, per procedureCode,
 * the allotted calendar days and the BAJO/MEDIO/ALTO elapsed-days thresholds
 * used to classify risk.
 *
 * No styling or presentation data lives here or in the source JSON —
 * colors are defined as CSS variables in src/styles/globals.css.
 */

import recordsTramitesJson from '../../records_tramites.json';
import gruposTramitesJson from '../../grupos_tramites.json';
import entradasSalidasJson from '../../entradas_salidas.json';
import type {
  Metric,
  KPIsByDataset,
  KPIRiskBreakdown,
  ZoneData,
  LocationZone,
  SummaryData,
  Record as DashboardRecord,
  RecordStatus,
  Dataset,
} from '../types';

/** [riesgoBajo, riesgoMedio, riesgoAlto] */
type RiskArray = [number, number, number];

interface RawRecord {
  radicado: string;
  usuarioEncargado: string;
  dependencia: string;
  tipoTramite: string;
  codigoTramite: number;
  fechaRadicacion: string;
  /** Short dependency code (GIC/SE/SIFJ), the real "origin dependency" */
  dependenciaOrigen: string;
  grupo: string;
  codigoActividad: number;
  estado: string;
  loteId: string;
  coordLat: number | null;
  coordLong: number | null;
}

interface RawRecordsTramitesData {
  metrics: Record<string, RiskArray>[];
  records: RawRecord[];
  recordCadaMes: {
    labels: string[];
    total: number[];
    gic: number[];
    se: number[];
    sifj: number[];
  };
}

/** Shape of entradas_salidas.json: monthly entries and exits, aligned with `labels` */
interface RawEntradasSalidasData {
  entradasSalidasCadaMes: {
    labels: string[];
    entradas: number[];
    salidas: number[];
    entradasGic: number[];
    entradasSe: number[];
    entradasSifj: number[];
    salidasGic: number[];
    salidasSe: number[];
    salidasSifj: number[];
  };
}

export type EntriesExitsDependency = 'Totales' | 'GIC' | 'SE' | 'SIFJ';

const rawEntradasSalidas = (entradasSalidasJson as unknown as RawEntradasSalidasData)
  .entradasSalidasCadaMes;

/** One entry of grupos_tramites.json, keyed by procedureCode (as string) */
interface RawGrupoTramite {
  'DÍAS CALENDARIO': number;
  BAJO: number;
  MEDIO: number;
  ALTO: number;
  DEPENDENCIA: string;
}

/**
 * metrics, records and recordCadaMes source for the whole dashboard (main
 * metric cards, KPIs, pie chart, map zones, summary panel, records table
 * and the evolution/monthly charts).
 */
const rawRecordsTramites = recordsTramitesJson as unknown as RawRecordsTramitesData;
const rawMetrics = rawRecordsTramites.metrics;
const rawRecords = rawRecordsTramites.records;
const rawRecordCadaMes = rawRecordsTramites.recordCadaMes;

/**
 * Allotted calendar days and BAJO/MEDIO/ALTO elapsed-days thresholds
 * per procedureCode, used by getRecords() to compute allottedDays and status.
 */
const gruposTramites = gruposTramitesJson as unknown as Record<string, RawGrupoTramite>;

/** Maps the metric label coming from the backend to the internal dataset id */
const LABEL_TO_DATASET_ID: Record<string, 'total' | 'gic' | 'se' | 'sifj'> = {
  'Solicitudes Totales': 'total',
  'Solicitudes Abiertas GIC': 'gic',
  'Solicitudes Abiertas SE': 'se',
  'Solicitudes Abiertas SIFJ': 'sifj',
};

/** Display labels shown in the UI for each dataset (independent of the JSON keys) */
const DATASET_LABELS: Record<'total' | 'gic' | 'se' | 'sifj', LocationZone> = {
  total: 'Trámites Totales',
  gic: 'Gerencia de Información Catastral',
  se: 'Subgerencia de Información Económica',
  sifj: 'Subgerencia de Información Física y Jurídica',
};

const DATASET_ORDER: Array<{ label: LocationZone; datasetId: 'total' | 'gic' | 'se' | 'sifj' }> = [
  { label: DATASET_LABELS.total, datasetId: 'total' },
  { label: DATASET_LABELS.gic, datasetId: 'gic' },
  { label: DATASET_LABELS.se, datasetId: 'se' },
  { label: DATASET_LABELS.sifj, datasetId: 'sifj' },
];

function sumRisk([bajo, medio, alto]: RiskArray): number {
  return bajo + medio + alto;
}

function toRiskBreakdown([bajo, medio, alto]: RiskArray): KPIRiskBreakdown {
  return { riesgoBajo: bajo, riesgoMedio: medio, riesgoAlto: alto };
}

/**
 * Builds the 4 main metric cards, with value calculated as the sum
 * of the risk breakdown array for each dataset.
 */
export function getMetrics(): Metric[] {
  return rawMetrics.map((entry, index) => {
    const label = Object.keys(entry)[0];
    const riskArray = entry[label];
    return {
      id: `metric-${index + 1}`,
      datasetId: LABEL_TO_DATASET_ID[label],
      label: DATASET_LABELS[LABEL_TO_DATASET_ID[label]],
      value: sumRisk(riskArray),
      unit: 'solicitudes',
    };
  });
}

/**
 * Builds the risk breakdown per dataset (total, gic, se, sifj),
 * used by KPIs, the pie chart and the map.
 */
export function getKpisByDataset(): KPIsByDataset {
  const result = {} as KPIsByDataset;
  rawMetrics.forEach((entry) => {
    const label = Object.keys(entry)[0];
    const datasetId = LABEL_TO_DATASET_ID[label];
    if (datasetId) {
      result[datasetId] = toRiskBreakdown(entry[label]);
    }
  });
  return result;
}

/**
 * Builds the map "zones" (one per solicitud type) from the same
 * risk breakdown used by the KPIs.
 */
export function getZones(): ZoneData[] {
  const kpisByDataset = getKpisByDataset();
  return DATASET_ORDER.map(({ label, datasetId }) => {
    const risk = kpisByDataset[datasetId];
    return {
      zone: label,
      approved: risk.riesgoBajo,
      pending: risk.riesgoMedio,
      rejected: risk.riesgoAlto,
    };
  });
}

/**
 * Builds the final summary panel data. Risk totals are the sum of
 * GIC + SE + SIFJ (not the independent "total" dataset), matching
 * the business rule confirmed for the dashboard.
 */
export function getSummaryData(): SummaryData {
  const { gic, se, sifj } = getKpisByDataset();
  const totalValue = getMetrics().find((m) => m.datasetId === 'total')?.value ?? 0;
  return {
    total: totalValue,
    approved: gic.riesgoBajo + se.riesgoBajo + sifj.riesgoBajo,
    pending: gic.riesgoMedio + se.riesgoMedio + sifj.riesgoMedio,
    rejected: gic.riesgoAlto + se.riesgoAlto + sifj.riesgoAlto,
  };
}

/**
 * Determines risk level from elapsed days since filing, using the
 * BAJO/MEDIO thresholds of the record's procedureCode group.
 * ALTO is informational only and is not used as a cutoff: anything
 * past MEDIO is already Riesgo Alto.
 *
 * elapsedDays <= BAJO: Riesgo Bajo
 * BAJO < elapsedDays <= MEDIO: Riesgo Medio
 * elapsedDays > MEDIO: Riesgo Alto
 * No grupo found for the procedureCode: Riesgo Alto (safety fallback)
 * elapsedDays < 0 (filing date in the future): Riesgo Bajo
 */
function calculateRiskStatus(elapsedDays: number, grupo: RawGrupoTramite | undefined): RecordStatus {
  if (!grupo) return 'Riesgo Alto';
  if (elapsedDays < 0) return 'Riesgo Bajo';
  if (elapsedDays <= grupo.BAJO) return 'Riesgo Bajo';
  if (elapsedDays <= grupo.MEDIO) return 'Riesgo Medio';
  return 'Riesgo Alto';
}

/**
 * Builds the records table data. Allotted days and risk status are
 * calculated here from fechaRadicacion + grupos_tramites.json (keyed
 * by procedureCode), never stored in the source JSON.
 */
export function getRecords(): DashboardRecord[] {
  const today = new Date();
  return rawRecords.map((raw) => {
    const grupo = gruposTramites[String(raw.codigoTramite)];
    const allottedDays = grupo?.['DÍAS CALENDARIO'] ?? 0;
    const filingDate = new Date(raw.fechaRadicacion);
    const elapsedDays = Math.floor(
      (today.getTime() - filingDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysUntilDue = allottedDays - elapsedDays;

    return {
      id: raw.radicado,
      radicado: raw.radicado,
      assignedUser: raw.usuarioEncargado,
      // dependency comes from grupos_tramites.json (short code GIC/SE/SIFJ),
      // not from the raw `dependencia` field in records_tramites.json, which
      // holds long descriptive names, not the short codes the UI filters on.
      dependency: grupo?.DEPENDENCIA ?? raw.dependencia,
      // sourceDependency is the short origin dependency code (GIC/SE/SIFJ)
      // from the raw `dependenciaOrigen` field, used by screens that scope
      // their content to a single dependency (e.g. GIC screen, SIFJ screen).
      sourceDependency: raw.dependenciaOrigen,
      group: raw.grupo,
      procedureType: raw.tipoTramite,
      procedureCode: raw.codigoTramite,
      workflowState: raw.estado,
      lotId: raw.loteId,
      latitude: raw.coordLat ?? null,
      longitude: raw.coordLong ?? null,
      allottedDays,
      status: calculateRiskStatus(elapsedDays, grupo),
      filingDate: raw.fechaRadicacion,
      daysUntilDue,
    };
  });
}

/** How many of the most recent months the entries/exits and cumulative charts cover */
const ENTRIES_EXITS_MONTHS = 13;

/** "Dic 2025" -> "dic-25"; labels that don't follow "Mes AAAA" are returned unchanged */
function formatMonthLabel(label: string): string {
  const match = /^(\S+)\s+(\d{4})$/.exec(label.trim());
  if (!match) return label;
  return `${match[1].toLowerCase()}-${match[2].slice(2)}`;
}

/**
 * Builds the "Entradas y salidas" chart (chart-4): the last 13 months of entries and exits,
 * read from entradas_salidas.json (independent from records_tramites.json). `dependency`
 * picks the totals or the series of one dependency.
 */
export function getEntriesExitsChart(
  dependency: EntriesExitsDependency = 'Totales'
): { labels: string[]; datasets: Dataset[] } {
  const { labels } = rawEntradasSalidas;
  const series = {
    Totales: { entradas: rawEntradasSalidas.entradas, salidas: rawEntradasSalidas.salidas },
    GIC: { entradas: rawEntradasSalidas.entradasGic, salidas: rawEntradasSalidas.salidasGic },
    SE: { entradas: rawEntradasSalidas.entradasSe, salidas: rawEntradasSalidas.salidasSe },
    SIFJ: { entradas: rawEntradasSalidas.entradasSifj, salidas: rawEntradasSalidas.salidasSifj },
  }[dependency];
  const { entradas, salidas } = series;
  const start = Math.max(0, labels.length - ENTRIES_EXITS_MONTHS);
  return {
    labels: labels.slice(start).map(formatMonthLabel),
    datasets: [
      { id: 'entradas', label: 'Entradas', data: entradas.slice(start), backgroundColor: 'rgba(132, 204, 22, 0.8)' },
      { id: 'salidas', label: 'Salidas', data: salidas.slice(start), backgroundColor: 'rgba(var(--chart-sifj), 0.8)' },
    ],
  };
}

/**
 * Builds the "Trámites radicados por mes" chart (chart-5): the `gic`, `se` and `sifj` series of
 * `recordCadaMes` in records_tramites.json, over all the months the file provides. The chart
 * stacks them, so each bar adds up to the month's total.
 */
export function getCumulativeChart(): { labels: string[]; datasets: Dataset[] } {
  const { labels, gic, se, sifj } = rawRecordCadaMes;
  return {
    labels: labels.map(formatMonthLabel),
    datasets: [
      { id: 'gic', label: 'GIC', data: gic, backgroundColor: 'rgba(var(--chart-gic), 0.8)' },
      { id: 'se', label: 'SE', data: se, backgroundColor: 'rgba(var(--chart-se), 0.8)' },
      { id: 'sifj', label: 'SIFJ', data: sifj, backgroundColor: 'rgba(var(--chart-sifj), 0.8)' },
    ],
  };
}
