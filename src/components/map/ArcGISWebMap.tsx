/**
 * ArcGISWebMap Component
 * Renders an existing ArcGIS Online Web Map via its portalItem id and draws one point per
 * record on top of it, colored by risk.
 *
 * Isolated from MapVisualization so all ArcGIS SDK concerns (imports,
 * stylesheet, view lifecycle) live in one place. The `map` and `view`
 * instances are kept in refs so the points layer can be redrawn when the
 * records or the risk filter change, without recreating the map.
 */

import { useEffect, useRef, useState } from 'react';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Home from '@arcgis/core/widgets/Home';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import '@arcgis/core/assets/esri/themes/light/main.css';
import type { Record as DashboardRecord } from '../../types';

// Publicly accessible Web Map hosted on ArcGIS Online
const WEB_MAP_ID = 'fe583ba3466c44f0a78d10e77abd4af8';

// CSS variable (in globals.css) that holds the RGB triplet of each risk color
const RISK_COLOR_VARIABLES: Record<string, string> = {
  'Riesgo Bajo': '--chart-riesgo-bajo',
  'Riesgo Medio': '--chart-riesgo-medio',
  'Riesgo Alto': '--chart-riesgo-alto',
};

/** Reads the RGB triplet of a CSS variable, e.g. "34, 197, 94" -> [34, 197, 94] */
const readRgbVariable = (name: string): [number, number, number] => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  const [r, g, b] = value.split(',').map((part) => Number(part.trim()));
  return [r, g, b];
};

interface ArcGISWebMapProps {
  records: DashboardRecord[];
  /** Risk shown on the map: "Todos" or one of "Riesgo Bajo" / "Riesgo Medio" / "Riesgo Alto" */
  riskFilter: string;
  /** Dependency shown on the map: "Todas" or one of "GIC" / "SE" / "SIFJ" */
  dependencyFilter: string;
}

export const ArcGISWebMap = ({ records, riskFilter, dependencyFilter }: ArcGISWebMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const mapRef = useRef<WebMap | null>(null);
  const layerRef = useRef<GraphicsLayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    // Guard against React StrictMode running effects twice in development,
    // which would otherwise stack two MapViews in the same container.
    if (viewRef.current) return;

    const map = new WebMap({
      portalItem: { id: WEB_MAP_ID },
    });
    mapRef.current = map;

    const view = new MapView({
      container: containerRef.current,
      map,
    });
    viewRef.current = view;

    const layer = new GraphicsLayer();
    layerRef.current = layer;
    map.add(layer);

    // view.when() is the extension point: widgets are added here and, once the view is ready,
    // the points effect below can draw.
    view
      .when(() => {
        // Zoom widget ships enabled by default on MapView (top-left).
        // Home returns the view to the Web Map's initial extent.
        view.ui.add(new Home({ view }), 'top-left');
        setIsReady(true);
      })
      .catch(() => setError('No se pudo cargar el mapa de ArcGIS Online'));

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Redraws the points whenever the records or the risk filter change
  useEffect(() => {
    const layer = layerRef.current;
    if (!isReady || !layer) return;

    layer.removeAll();
    records.forEach((record) => {
      if (record.latitude === null || record.longitude === null) return;
      if (riskFilter !== 'Todos' && record.status !== riskFilter) return;
      if (dependencyFilter !== 'Todas' && record.sourceDependency !== dependencyFilter) return;

      const variable = RISK_COLOR_VARIABLES[record.status];
      const [r, g, b] = readRgbVariable(variable);

      layer.add(
        new Graphic({
          // WGS84 decimal degrees: x is the longitude and y is the latitude
          geometry: new Point({ x: record.longitude, y: record.latitude, spatialReference: { wkid: 4326 } }),
          symbol: {
            type: 'simple-marker',
            color: [r, g, b, 0.85],
            size: 8,
            outline: { color: [255, 255, 255, 1], width: 1 },
          },
          attributes: {
            radicado: record.radicado,
            profesional: record.assignedUser,
            estado: record.workflowState,
            riesgo: record.status,
          },
          popupTemplate: {
            title: 'Radicado {radicado}',
            content: [
              {
                type: 'fields',
                fieldInfos: [
                  { fieldName: 'profesional', label: 'Profesional encargado' },
                  { fieldName: 'estado', label: 'Estado' },
                  { fieldName: 'riesgo', label: 'Riesgo' },
                ],
              },
            ],
          },
        })
      );
    });
  }, [records, riskFilter, dependencyFilter, isReady]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-sm text-secondary text-center px-4">{error}</p>
      </div>
    );
  }

  return <div ref={containerRef} className="absolute inset-0" />;
};
