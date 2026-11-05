/**
 * KPIList Component
 * Renders a grid of KPI cards
 */

import type { KPI } from '../../types';
import { KPICard } from './KPICard';

interface KPIListProps {
  kpis: KPI[];
}

export const KPIList = ({ kpis }: KPIListProps) => {
  if (!kpis || kpis.length === 0) {
    return (
      <div className="text-center text-secondary py-8">
        No hay KPIs disponibles
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi) => (
        <KPICard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
};
