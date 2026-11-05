# Plan de Implementación: Dashboard Entidad

## Visión General

Este plan implementa un dashboard de visualización de inteligencia de negocios en tiempo real usando React 18 + TypeScript + Vite + Tailwind CSS + Recharts. La arquitectura sigue un patrón basado en componentes con gestión de estado mediante Context API, actualización automática de datos mediante polling, y soporte para temas claro/oscuro.

## Prácticas de Desarrollo Obligatorias

### Metodología TDD (Test-Driven Development)

**CRÍTICO:** Todo el código debe seguir el ciclo Red-Green-Refactor:

1. **Red (Rojo)**: Escribir el test PRIMERO - debe fallar
2. **Green (Verde)**: Escribir código mínimo para que el test pase
3. **Refactor**: Mejorar código manteniendo tests verdes

**OBLIGATORIO vs OPCIONAL:**
- **Unit tests**: OBLIGATORIOS para cada componente/función
- **Property tests**: OPCIONALES (marcados con `*`) para validación exhaustiva

**Orden de implementación para cada tarea:**
```
1. Definir tipos TypeScript de la interfaz
2. Escribir unit tests para casos específicos (OBLIGATORIO)
3. Escribir property tests si aplica (OPCIONAL)
4. Implementar código hasta que tests pasen
5. Refactorizar manteniendo cobertura
```

**Ejemplo práctico:**
```typescript
// 1. Definir tipo
interface Metric { id: string; label: string; value: number; unit: string; }

// 2. Escribir test PRIMERO
describe('MetricCard', () => {
  it('debe mostrar todos los campos de una métrica', () => {
    const metric = { id: '1', label: 'Ventas', value: 100, unit: 'USD' };
    render(<MetricCard metric={metric} />);
    expect(screen.getByText('Ventas')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });
});

// 3. Implementar componente para pasar el test
const MetricCard = ({ metric }) => (
  <div>
    <h3>{metric.label}</h3>
    <span>{metric.value}</span>
    <span>{metric.unit}</span>
  </div>
);
```

### Principios Clean Code

**Reglas de nomenclatura:**
- Variables/funciones: `camelCase` descriptivo
- Componentes: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Nombres que revelen intención sin comentarios

**Reglas de funciones:**
- Máximo 20 líneas (ideal: 10-15)
- Máximo 3-4 parámetros
- Una función = una responsabilidad
- Funciones puras preferidas

**Reglas de componentes:**
- Máximo 200 líneas
- Separar lógica (hooks) de presentación
- Máximo 5-7 props
- Extraer lógica compleja a custom hooks

**Ejemplo de refactoring:**
```typescript
// Incorrecto: Función hace demasiadas cosas
function processUserData(user) {
  validateUser(user);
  const formatted = formatUser(user);
  saveToDatabase(formatted);
  sendEmail(user.email);
  return formatted;
}

// Correcto: Separar responsabilidades
function validateUser(user) { /* ... */ }
function formatUser(user) { /* ... */ }
function saveUser(user) { /* ... */ }
function notifyUser(email) { /* ... */ }
```

### Principios SOLID

**S - Single Responsibility:**
- Un módulo = una razón para cambiar
- Ejemplo: `MetricCard` solo muestra, no obtiene datos

**O - Open/Closed:**
- Usar composition para extender sin modificar
- Ejemplo: `ChartWrapper` acepta tipos sin cambiar código

**L - Liskov Substitution:**
- Subtipos deben ser intercambiables
- Todos los Chart components usan misma interfaz

**I - Interface Segregation:**
- Interfaces pequeñas y específicas
- No obligar props innecesarios

**D - Dependency Inversion:**
- Depender de abstracciones (hooks, contexts)
- No depender de implementaciones concretas

**Ejemplo de aplicación:**
```typescript
// Correcto: Depende de abstracción (hook)
const MyComponent = () => {
  const { data, isLoading } = useDataFetch(fetchDashboardData);
  // ...
};

// Incorrecto: Depende de implementación concreta
const MyComponent = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('http://api.com/data').then(/* ... */);
  }, []);
  // ...
};
```

### Checklist por Tarea

Antes de considerar una tarea completa, verificar:

- [ ] Tests escritos ANTES del código (TDD)
- [ ] **Unit tests implementados (OBLIGATORIO)**
- [ ] Property tests con mínimo 100 iteraciones (OPCIONAL, marcados con `*`)
- [ ] Cobertura de código >= 80%
- [ ] Nombres descriptivos sin abreviaciones
- [ ] Funciones <= 20 líneas
- [ ] Componentes <= 200 líneas
- [ ] Máximo 3-4 parámetros por función
- [ ] Una responsabilidad por módulo (SRP)
- [ ] TypeScript strict sin `any`
- [ ] ESLint pasa sin warnings
- [ ] Prettier aplicado
- [ ] Comentarios solo para "por qué", no "qué"

## Tareas

### Configuración de Docker

**Dockerfile (multi-stage):**
- Stage 1 (development): node:18-alpine + Vite dev server
- Stage 2 (build): compilar aplicación para producción
- Stage 3 (production): nginx:alpine sirviendo archivos estáticos

**Comandos disponibles:**
```bash
# Desarrollo local con Docker
docker build -t dashboard-entidad:dev --target development .
docker run -p 5173:5173 -v $(pwd):/app dashboard-entidad:dev

# Build de producción
docker build -t dashboard-entidad:prod --target production .

# Run producción
docker run -p 80:80 dashboard-entidad:prod
```

## Tareas

- [x] 1. Configurar proyecto y estructura base
  - Inicializar proyecto Vite con plantilla React + TypeScript
  - Configurar Tailwind CSS con soporte para dark mode
  - Configurar ESLint y Prettier para calidad de código
  - Crear estructura de carpetas según diseño (components/, contexts/, hooks/, services/, types/, utils/, screens/, styles/)
  - Configurar variables de entorno para API base URL
  - Crear Dockerfile multi-stage para development y production
  - Crear .dockerignore para optimizar builds
  - Documentar comandos Docker en README.md
  - _Requerimientos: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Definir tipos y modelos de datos TypeScript
  - Crear types/dashboard.types.ts con interfaces DashboardData, Metric, KPI, ChartConfig, ChartData, Dataset, Record, RecordStatus, LocationZone, ZoneData, SummaryData
  - Crear types/metric.types.ts con tipos TrendType, KPIStatus, ChartType
  - Crear types/theme.types.ts con interfaces Theme, ThemeColors
  - Crear types/navigation.types.ts con interfaz Screen
  - _Requerimientos: 2.1, 3.1, 4.1, 9.1, 10.1, 12.1, 12.2, 12.3, 12.4, 13.1, 13.2, 13.3, 14.1_

- [ ] 3. Implementar servicios de datos y API
  - [x] 3.1 Crear cliente HTTP con timeout y manejo de errores
    - Implementar en services/api.ts la clase APIError con statusCode y code
    - Implementar función fetchWithTimeout con AbortController para timeout de 5 segundos
    - Implementar función fetchDashboardData que consume GET /api/dashboard
    - Manejar errores de red (NETWORK_ERROR), timeout (TIMEOUT), y errores del servidor (SERVICE_UNAVAILABLE)
    - _Requerimientos: 5.1, 5.3, 5.5, 7.1, 7.3_
  
  - [ ] 3.2 Escribir property test para timeout de operaciones
    - **Property 8: Timeout de operaciones de datos**
    - **Valida: Requerimientos 5.5**
    - Verificar que operaciones que exceden 5 segundos son canceladas y retornan error de timeout
  
  - [x] 3.3 Crear servicio de almacenamiento local
    - Implementar services/storageService.ts con funciones para guardar/cargar preferencias de tema
    - Manejar errores de localStorage con fallbacks apropiados
    - _Requerimientos: 9.3_
  
  - [ ] 3.4 Escribir property test para persistencia de tema
    - **Property 12: Persistencia de preferencia de tema**
    - **Valida: Requerimientos 9.3**
    - Verificar que cualquier tema guardado y recargado mantiene el mismo valor
  
  - [x] 3.5 Crear los dos archivos JSON de datos crudos
    - Crear records_tramites.json (raíz del proyecto) con las secciones `metrics` (4 claves de Dataset, cada una con su tripleta [riesgoBajo, riesgoMedio, riesgoAlto]; las claves conservan los textos antiguos "Solicitudes Totales", "Solicitudes Abiertas GIC", "Solicitudes Abiertas SE" y "Solicitudes Abiertas SIFJ" y son solo claves de lectura, no etiquetas visibles), `recordCadaMes` (arreglo `labels` y series `total`, `gic`, `se`, `sifj`) y `records` (radicado, usuarioEncargado, dependencia, tipoTramite, codigoTramite, fechaRadicacion)
    - Crear grupos_tramites.json (raíz del proyecto) con el mapa ProcedureCode → objeto con `DÍAS CALENDARIO`, `BAJO`, `MEDIO`, `ALTO` y `DEPENDENCIA`
    - Excluir de los dos archivos todo valor derivado precalculado (días asignados por registro, estado de riesgo, valores totales de métrica, totales de resumen) y todo atributo de estilo o color
    - _Requerimientos: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.20, 17.7_
  
  - [x] 3.5.1 Migrar el apuntamiento de metrics y records a records_tramites.json
    - Actualizar services/dashboardData.service.ts para importar records_tramites.json (recordsTramitesJson) e importar de él las secciones `metrics` y `records`
    - _Requerimientos: 16.1, 16.2, 16.4, 16.7, 16.8, 16.9, 16.10_
  
  - [x] 3.5.2 Agregar el Código de Trámite a la tabla de registros
    - Agregar el campo `procedureCode` al tipo Record en types/dashboard.types.ts, mapeado desde `codigoTramite` del Records_Tramites_File en getRecords()
    - Agregar la columna "Código de Trámite" a la tabla de Últimos Registros en DashboardScreen.tsx, junto a Tipo de Trámite
    - _Requerimientos: 12.2_
  
  - [x] 3.5.3 Migrar Días por Trámite y Estado a grupos_tramites.json
    - Importar grupos_tramites.json (gruposTramitesJson) en services/dashboardData.service.ts, indexado por ProcedureCode (como string)
    - Actualizar getRecords() para calcular allottedDays desde `grupo['DÍAS CALENDARIO']` en vez de diasPorTramite[tipoTramite], con fallback 0 si el ProcedureCode no tiene grupo
    - Reescribir calculateRiskStatus(elapsedDays, grupo) para clasificar por los umbrales BAJO/MEDIO del grupo (elapsedDays <= BAJO: Riesgo Bajo; BAJO < elapsedDays <= MEDIO: Riesgo Medio; elapsedDays > MEDIO: Riesgo Alto), con fallback Riesgo Alto si no hay grupo y Riesgo Bajo si elapsedDays es negativo
    - Eliminar src/mocks/diasPorTramite.json y sus referencias, ya sin uso
    - _Requerimientos: 16.6, 16.11, 16.12, 16.13, 16.14, 16.15, 16.16, 16.16.1, 16.16.2, 16.16.3_
  
  - [x] 3.5.7 Corregir el origen del campo dependency de cada Record
    - Actualizar getRecords() para asignar dependency desde `grupo.DEPENDENCIA` (grupos_tramites.json, buscado por codigoTramite) en vez de raw.dependencia (nombre descriptivo largo del Records_Tramites_File que no coincide con los códigos cortos GIC/SE/SIFJ usados por los filtros, el Sidebar y la SifjScreen)
    - Mantener como fallback raw.dependencia sin transformar cuando el codigoTramite no tiene grupo asociado
    - _Requerimientos: 16.11.1, 16.11.2_
  
  - [x] 3.5.8 Agregar sourceDependency a Record y acotar la tabla de la Screen GIC
    - Agregar el campo `sourceDependency` al tipo Record en types/dashboard.types.ts, asignado en getRecords() como raw.dependencia sin transformar
    - En DashboardScreen.tsx, filtrar dashboardData.records a `sourceDependency === 'GERENCIA DE INFORMACION CATASTRAL'` (constante GIC_SOURCE_DEPENDENCY) antes de calcular las opciones de los filtros de usuario/tipo de trámite y de aplicar el resto de los filtros
    - Eliminar el estado dependencyFilter y el dropdown "Todas las dependencias / GIC / SE / SIFJ" de la tabla de Últimos Registros de DashboardScreen.tsx
    - _Requerimientos: 12.1, 12.7, 16.11.3_
  
  - [x] 3.5.9 Unificar ambas Screens al criterio de dependencia de origen
    - Corregir la columna "Dependencia" de la tabla en DashboardScreen.tsx para mostrar record.sourceDependency en vez de record.dependency
    - Corregir SifjScreen.tsx: renombrar SIFJ_DEPENDENCY a SIFJ_SOURCE_DEPENDENCY, filtrar sifjRecords por record.sourceDependency en vez de record.dependency, y mostrar record.sourceDependency en la columna "Dependencia" de su tabla
    - Reemplazar el panel de resumen de 4 cards de DashboardScreen.tsx (Total Solicitudes, Total Riesgo Bajo/Medio/Alto) para contar gicRecords por status, en vez de usar dashboardData.summaryData
    - _Requerimientos: 12.1, 12.2, 14.1, 14.2, 19.4, 19.5_
  
  - [x] 3.5.10 Migrar sourceDependency al campo dependenciaOrigen real
    - Agregar los campos `dependenciaOrigen` (código corto GIC/SE/SIFJ) y `grupo` a la interfaz RawRecord en services/dashboardData.service.ts
    - Actualizar getRecords() para asignar sourceDependency desde raw.dependenciaOrigen en vez de raw.dependencia (nombre largo)
    - Actualizar la constante GIC_SOURCE_DEPENDENCY en DashboardScreen.tsx de 'GERENCIA DE INFORMACION CATASTRAL' a 'GIC'
    - Actualizar la constante SIFJ_SOURCE_DEPENDENCY en SifjScreen.tsx de 'SUBGERENCIA INFORMACION FISICA  JURIDICA' a 'SIFJ'
    - _Requerimientos: 12.1, 16.11.3, 19.4_
  
  - [x] 3.5.11 Agregar la columna Grupo a la tabla de Últimos Registros de ambas Screens
    - Agregar el campo `group` al tipo Record en types/dashboard.types.ts, asignado en getRecords() como raw.grupo sin transformar
    - Agregar la columna "Grupo" (junto a Tipo de Trámite) a la tabla de Últimos Registros en DashboardScreen.tsx y en SifjScreen.tsx
    - _Requerimientos: 12.2, 19.5, 16.11.4_
  
  - [x] 3.5.12 Agregar el diagrama "Cantidad por Riesgo vs Grupo" a la Screen SIFJ
    - En screens/SifjScreen.tsx, construir un ChartConfig `status-by-group` (tipo `bar`) de barras apiladas a partir de filteredRecords: una barra por Group presente en filteredRecords, con un tramo por cada RecordStatus con el conteo de filteredRecords que cumplen ese Group y ese status
    - Usar como labels las etiquetas cortas G1, G2, ... Gn (`groupShortLabels`, mismo orden alfabético de los Group), definidas antes de `statusByGroupChart`
    - Colorear cada serie con las Chart_Color_Variable `--chart-riesgo-bajo`, `--chart-riesgo-medio` y `--chart-riesgo-alto` existentes
    - Renderizar el diagrama con `<BarChart data={statusByGroupChart.data} horizontalLabels stacked />` debajo de la tabla de Últimos Registros
    - _Requerimientos: 19.7, 19.8, 19.9_

  - [x] 3.5.13 Agregar la variante apilada al componente BarChart
    - Añadir la prop opcional `stacked` (por defecto false) a src/components/charts/BarChart.tsx: las series comparten `stackId="stack"` y cada `<Bar>` incluye un `<LabelList>` con el conteo dentro del tramo, sin mostrar ceros, con `fill="rgb(var(--chart-segment-label))"`
    - Declarar `--chart-segment-label: 15, 23, 42` en src/styles/globals.css
    - Compartir `groupShortLabels` entre "Cantidad por Riesgo vs Grupo" y "Cantidad de Trámites por Grupo" con una única leyenda de grupos (`groupLegend`) debajo de ambos diagramas de barras
    - Renombrar el título del diagrama circular de SIFJ a "Cantidad de Trámites por Riesgo vs Grupo"
    - _Requerimientos: 17.2, 17.4, 19.7, 19.8, 19.9_
  
  - [x] 3.5.4 Migrar recordCadaMes (chart-3) a records_tramites.json
    - Agregar `recordCadaMes` a la interfaz RawRecordsTramitesData en services/dashboardData.service.ts y leerlo desde rawRecordsTramites.recordCadaMes
    - Actualizar getMonthlyBarChart() para usar esta nueva referencia en vez de dashboardData.json
    - Eliminar src/mocks/dashboardData.json, ya sin ninguna sección en uso
    - _Requerimientos: 16.1, 16.3, 16.17_
  
  - [x] 3.5.6 Eliminar el diagrama de evolución interactivo (antiguo chart-1) y su lógica exclusiva
    - Eliminar getEvolutionChart() y el helper accumulate() de services/dashboardData.service.ts
    - Eliminar src/components/charts/InteractiveChart.tsx y su export en components/charts/index.ts
    - Eliminar en ChartWrapper.tsx la rama que renderizaba InteractiveChart y las props selectedDatasetId/onDatasetChange de ChartWrapperProps
    - Eliminar en api.mock.ts la entrada chart-1 de mockCharts, la constante evolutionChart y el import de getEvolutionChart
    - Eliminar en DashboardScreen.tsx la constante interactiveChart, dynamicChartTitle, el bloque JSX que renderizaba el ChartWrapper de chart-1, y ajustar otherCharts para usar dashboardData.charts directamente
    - Actualizar metricsWithCalculatedChange para leer el histórico desde chart-3 ("Registros por mes") en vez de chart-1, agregando id (total/gic/se/sifj) a los datasets de getMonthlyBarChart()
    - Ajustar el texto de ayuda de la sección "Métricas Principales" para no referenciar el gráfico eliminado
    - _Requerimientos: 2.3, 4.1, 4.2, 15.4 (retirado)_
  
  - [x] 3.6 Implementar el Derivation_Service
    - Crear services/dashboardData.service.ts con getMetrics(), getKpisByDataset(), getZones(), getSummaryData(), getRecords() y getMonthlyBarChart()
    - Implementar los helpers sumRisk, toRiskBreakdown y calculateRiskStatus, y las constantes LABEL_TO_DATASET_ID, DATASET_LABELS y DATASET_ORDER
    - LABEL_TO_DATASET_ID mapea las claves antiguas de `metrics` de records_tramites.json ("Solicitudes Totales", "Solicitudes Abiertas GIC", "Solicitudes Abiertas SE", "Solicitudes Abiertas SIFJ") al id interno (total/gic/se/sifj); son claves de lectura, no etiquetas visibles
    - DATASET_LABELS mapea cada id interno a la etiqueta visible: "Trámites Totales", "Gerencia de Información Catastral", "Subgerencia de Información Económica" y "Subgerencia de Información Física y Jurídica"; getMetrics(), getZones() y getMonthlyBarChart() (leyenda de "Registros por mes") usan DATASET_LABELS en el orden de DATASET_ORDER
    - Derivar el valor de cada Metric como la suma de su tripleta de riesgo (leída de records_tramites.json) y construir kpisByDataset desde los mismos arreglos
    - Derivar las 4 Location_Zone en el orden canónico de Datasets, mapeando riesgoBajo/riesgoMedio/riesgoAlto a approved/pending/rejected
    - Derivar summaryData con Total Solicitudes desde el Dataset "Trámites Totales" y los tres totales de riesgo como suma de GIC + SE + SIFJ
    - Asignar allottedDays y status consultando grupos_tramites.json por ProcedureCode (ver 3.5.3)
    - Construir las series del diagrama de barras "Registros por mes" con los valores mensuales de recordCadaMes, y las del diagrama de evolución interactivo con su versión acumulada (ver 3.5.4, 3.5.5)
    - _Requerimientos: 16.7, 16.8, 16.9, 16.10, 16.11, 16.12, 16.13, 16.14, 16.15, 16.16, 16.17, 16.19, 16.2.1, 4.9_
  
  - [x] 3.7 Refactorizar api.mock.ts para ensamblar los datos derivados
    - Reemplazar los datos literales de mockDashboardData por el ensamblado de DashboardData a partir del Derivation_Service
    - Mantener el flujo records_tramites.json + grupos_tramites.json → dashboardData.service.ts → api.mock.ts → api.ts → componentes
    - _Requerimientos: 16.18, 16.19_
  
  - [ ] 3.8 Escribir property test para el valor de métrica igual a la suma de su tripleta
    - **Property 24: Valor de métrica igual a la suma de su desglose de riesgo**
    - **Valida: Requerimientos 16.7, 15.2**
    - Implementar en tests/properties/derivation.properties.test.ts usando el generador rawMetrics
  
  - [ ] 3.9 Escribir property test para el round trip entre tripleta cruda y desglose
    - **Property 25: Round trip entre tripleta cruda y desglose de riesgo**
    - **Valida: Requerimientos 16.8, 16.2**
    - Verificar que kpisByDataset reproduce los tres valores de cada tripleta en el orden riesgoBajo, riesgoMedio, riesgoAlto
  
  - [ ] 3.10 Escribir property test para las zonas derivadas del desglose de riesgo
    - **Property 26: Zonas del mapa derivadas del desglose de riesgo**
    - **Valida: Requerimientos 16.9, 13.1, 13.2**
    - Verificar que hay exactamente 4 zonas en el orden canónico y que approved/pending/rejected igualan la tripleta del Dataset
  
  - [ ] 3.11 Escribir property test para los totales del panel de resumen
    - **Property 28: Totales del panel de resumen**
    - **Valida: Requerimientos 14.2, 14.3, 16.10**
    - Verificar que alterar solo la tripleta del Dataset "Trámites Totales" (clave de lectura "Solicitudes Totales" en el JSON) no modifica los tres totales de riesgo
  
  - [ ] 3.12 Escribir property test para los días asignados desde el mapa de trámites
    - **Property 29: Días asignados desde el mapa de trámites**
    - **Valida: Requerimientos 16.11, 16.12**
    - Incluir en el generador rawRecord códigos de trámite ausentes del mapa de grupos para cubrir el fallback 0
  
  - [ ] 3.13 Escribir property test para el cálculo de días restantes
    - **Property 30: Cálculo de días restantes**
    - **Valida: Requerimientos 16.13, 12.5**
    - Verificar que daysUntilDue es igual a allottedDays menos los días completos transcurridos desde la fecha de radicación
  
  - [ ] 3.14 Escribir property test para la clasificación del estado de riesgo
    - **Property 31: Clasificación del estado de riesgo por umbrales del grupo de trámite**
    - **Valida: Requerimientos 16.14, 16.15, 16.16, 16.16.1, 16.16.2**
    - Usar los generadores elapsedDays y grupoTramite cubriendo los límites BAJO, MEDIO y valores negativos, y el caso sin grupo asociado; verificar que la clasificación es total y mutuamente excluyente
  
  - [ ] 3.15 Escribir property test para las series del diagrama de barras
    - **Property 32: Series del diagrama de barras derivadas de recordCadaMes**
    - **Valida: Requerimientos 16.17, 4.6, 4.1**
    - Verificar que el diagrama de barras "Registros por mes" reproduce las mismas etiquetas y las cuatro series punto por punto, sin transformar, con recordCadaMes
  
  - [ ] 3.16 Escribir property test para la pureza de los archivos de datos crudos
    - **Property 33: Pureza de los archivos de datos crudos**
    - **Valida: Requerimientos 16.5, 16.20, 17.7**
    - Verificar que ninguna clave de records_tramites.json ni de grupos_tramites.json corresponde a un valor derivado ni a un atributo de estilo o color
  
  - [ ] 3.17 Escribir property test para la derivación en tiempo de lectura
    - **Property 34: Derivación en tiempo de lectura**
    - **Valida: Requerimientos 16.19, 16.18**
    - Verificar que los valores entregados son función únicamente de los archivos crudos y la fecha actual, y que el objeto del cliente API en modo sin backend coincide con el ensamblado del servicio de derivación

- [ ] 4. Implementar utilidades y funciones de formato
  - [x] 4.1 Crear utilidades de formato y validación
    - Implementar utils/formatters.ts con formatTimestamp para marcas de tiempo legibles
    - Implementar getKPIStatus que calcula estado basado en currentValue/targetValue (success >= 1.0, warning >= 0.8, error < 0.8)
    - Implementar calculateTrend que determina tendencia (up/down/stable) comparando valores
    - _Requerimientos: 3.3, 3.4, 8.3_
  
  - [x] 4.1.1 Escribir unit tests para utilidades de formato
    - Tests para formatTimestamp con diferentes formatos de fecha
    - Tests para getKPIStatus con valores por encima, en, y por debajo del objetivo
    - Tests para calculateTrend con aumentos, disminuciones y valores estables
    - Tests para casos borde (valores negativos, cero, null, undefined)
  
  - [ ] 4.2 Escribir property tests para cálculo de estado de KPI
    - **Property 3: Cálculo correcto del estado de KPI**
    - **Valida: Requerimientos 3.3, 3.5, 3.6**
    - Verificar que para cualquier KPI, el estado calculado es correcto según la comparación de valores
  
  - [ ] 4.3 Escribir property test para formato de marca de tiempo
    - **Property 10: Formato de marca de tiempo**
    - **Valida: Requerimientos 8.3**
    - Verificar que cualquier fecha/hora formateada produce una cadena legible con información de hora/fecha
  
  - [x] 4.4 Crear constantes de la aplicación
    - Implementar utils/constants.ts con REFRESH_INTERVAL (30000ms), REQUEST_TIMEOUT (5000ms), MAX_RETRY_ATTEMPTS (3)
    - Definir configuración de colores del tema (azul oscuro principal, colores complementarios)
    - _Requerimientos: 5.2, 5.5, 11.1, 11.2, 11.4_

- [ ] 5. Implementar hooks personalizados
  - [x] 5.1 Crear hook useDataFetch para obtención de datos con polling
    - Implementar hooks/useDataFetch.ts con estado para data, isLoading, error, lastUpdate
    - Implementar lógica de polling automático usando useEffect con setInterval
    - Implementar función refetch para reintentos manuales
    - Implementar estrategia de reintentos con backoff exponencial (máximo 3 intentos)
    - Actualizar lastUpdate solo en obtenciones exitosas
    - _Requerimientos: 5.1, 5.2, 5.3, 5.4, 7.4, 8.2_
  
  - [x] 5.1.1 Escribir unit tests para useDataFetch
    - Tests para carga inicial de datos
    - Tests para actualización automática con polling
    - Tests para manejo de errores y reintentos
    - Tests para refetch manual
    - Tests para actualización de lastUpdate en éxito
    - Tests para cleanup de intervalos
  
  - [ ] 5.2 Escribir property test para actualización automática
    - **Property 6: Actualización automática de datos**
    - **Valida: Requerimientos 2.3, 4.5, 5.2**
    - Verificar que con cualquier intervalo de refresco, la función de obtención de datos se invoca automáticamente
  
  - [ ] 5.3 Escribir property test para actualización de marca de tiempo
    - **Property 9: Actualización de marca de tiempo**
    - **Valida: Requerimientos 8.2**
    - Verificar que después de cualquier actualización exitosa, la marca de tiempo refleja el momento de obtención
  
  - [x] 5.4 Crear hook usePolling reutilizable
    - Implementar hooks/usePolling.ts para abstraer lógica de polling
    - Soportar configuración de intervalo, auto-start, y cleanup apropiado
    - _Requerimientos: 5.2_
  
  - [x] 5.4.1 Escribir unit tests para usePolling
    - Tests para inicio y detención de polling
    - Tests para configuración de intervalo
    - Tests para auto-start
    - Tests para cleanup
  
  - [x] 5.5 Crear hook useTheme para gestión de tema
    - Implementar hooks/useTheme.ts que accede a ThemeContext
    - Lanzar error si se usa fuera de ThemeProvider
    - _Requerimientos: 9.1, 9.2_
  
  - [x] 5.5.1 Escribir unit tests para useTheme
    - Tests para acceso correcto al contexto
    - Tests para error cuando se usa fuera de provider
    - Tests para toggleTheme y setTheme
  
  - [x] 5.6 Crear hook useNavigation para gestión de navegación
    - Implementar hooks/useNavigation.ts que accede a NavigationContext
    - Proporcionar funciones navigateTo y addScreen
    - _Requerimientos: 10.3, 10.5_
  
  - [x] 5.6.1 Escribir unit tests para useNavigation
    - Tests para navigateTo con pantallas válidas e inválidas
    - Tests para addScreen con pantallas nuevas y duplicadas
    - Tests para acceso al currentScreen

- [ ] 6. Implementar contextos de gestión de estado
  - [x] 6.1 Crear ThemeContext para gestión de temas
    - Implementar contexts/ThemeContext.tsx con estado theme (light/dark)
    - Implementar toggleTheme que alterna entre temas
    - Implementar setTheme para establecer tema específico
    - Persistir preferencia en localStorage al cambiar
    - **CRITICAL: Aplicar AMBOS atributo data-theme Y clase .dark al document.documentElement**
    - La clase .dark es requerida por Tailwind CSS (darkMode: 'class')
    - El atributo data-theme es usado por variables CSS personalizadas
    - Cargar tema guardado al inicializar (default: 'dark')
    - **AJUSTE FINAL: Tema oscuro usa slate-900 (#0f172a) para fondos en lugar de gray-900**
    - **AJUSTE FINAL: Tema claro usa blanco (#ffffff) para fondos**
    - _Requerimientos: 9.1, 9.2, 9.3, 11.1, 11.2_
  
  - [ ] 6.2 Escribir property test para alternancia de tema
    - **Property 11: Alternancia de tema**
    - **Valida: Requerimientos 9.2**
    - Verificar que desde cualquier estado de tema, toggleTheme cambia al tema opuesto
  
  - [x] 6.3 Crear DataContext para gestión de datos del dashboard
    - Implementar contexts/DataContext.tsx usando useDataFetch
    - Proporcionar dashboardData, isLoading, error, lastUpdate, refetch
    - Configurar polling con REFRESH_INTERVAL y MAX_RETRY_ATTEMPTS
    - _Requerimientos: 5.1, 5.2, 5.3, 5.4, 8.2_
  
  - [x] 6.4 Crear NavigationContext para gestión de navegación
    - Implementar contexts/NavigationContext.tsx con estado currentScreen y screens array
    - Implementar navigateTo para cambiar pantalla actual
    - Implementar addScreen para agregar pantallas dinámicamente
    - Inicializar con pantalla 'dashboard' por defecto
    - _Requerimientos: 10.1, 10.3, 10.4, 10.5_

- [ ] 7. Implementar componentes comunes
  - [ ] 7.1 Crear componente LoadingSpinner
    - Implementar components/common/LoadingSpinner.tsx con indicador de carga visual
    - Usar role="status" para accesibilidad
    - Aplicar estilos responsivos al tema actual
    - _Requerimientos: 6.1, 6.2_
  
  - [ ] 7.1.1 Escribir unit tests para LoadingSpinner
    - Tests para renderizado correcto del spinner
    - Tests para atributo role="status"
    - Tests para aplicación de estilos según tema
  
  - [ ] 7.2 Crear componente ErrorMessage
    - Implementar components/common/ErrorMessage.tsx con props message y onRetry
    - Usar role="alert" para accesibilidad
    - Mostrar mensaje de error y botón de reintento
    - Aplicar estilos según tema actual
    - _Requerimientos: 5.3, 7.1, 7.2, 7.4_
  
  - [ ] 7.2.1 Escribir unit tests para ErrorMessage
    - Tests para renderizado de mensaje de error
    - Tests para atributo role="alert"
    - Tests para botón de reintento y callback onRetry
    - Tests para aplicación de estilos según tema
  
  - [ ] 7.3 Escribir property test para visualización de errores
    - **Property 7: Visualización de errores**
    - **Valida: Requerimientos 5.3, 7.1**
    - Verificar que cualquier error produce un mensaje visible al usuario
  
  - [ ] 7.4 Crear componente ThemeToggle
    - Implementar components/common/ThemeToggle.tsx con botón para alternar tema
    - Mostrar icono apropiado según tema actual (sol/luna)
    - Llamar a toggleTheme del contexto al hacer clic
    - _Requerimientos: 9.1, 9.2_
  
  - [ ] 7.4.1 Escribir unit tests para ThemeToggle
    - Tests para renderizado de icono correcto según tema
    - Tests para llamada a toggleTheme al hacer clic
    - Tests para accesibilidad del botón

- [ ] 8. Implementar componentes de layout
  - [ ] 8.1 Crear componente Header
    - Implementar components/layout/Header.tsx mostrando título "Dashboard Entidad"
    - Agregar botón "Cerrar sesión" (funcionalidad placeholder para futuro)
    - Mostrar marca de tiempo de última actualización usando formatTimestamp
    - Integrar componente ThemeToggle en header-actions
    - Aplicar estilos según tema actual
    - _Requerimientos: 1.3, 1.5, 8.1, 8.3, 9.1_
  
  - [ ] 8.1.2 Escribir property test para la ausencia de la marca de tiempo en la interfaz
    - **Property 18: Marca de tiempo ausente de la interfaz**
    - **Valida: Requerimientos 8.3**
    - Verificar que para cualquier valor de lastUpdate registrado internamente, el render del encabezado no contiene ninguna representación visible de esa marca de tiempo
  
  - [ ] 8.2 Crear componente WelcomeMessage
    - Implementar components/layout/WelcomeMessage.tsx con el mensaje de bienvenida
    - Mostrar "Bienvenido!"
    - Aplicar estilos según tema actual
    - _Requerimientos: 1.5_
  
  - [ ] 8.3 Crear componente Sidebar
    - Implementar components/layout/Sidebar.tsx con lista de items navegables
    - Renderizar items con indicación visual de item activo
    - Llamar a onItemClick al seleccionar item
    - Aplicar color azul oscuro como color principal del sidebar
    - Soportar iconos opcionales para items
    - _Requerimientos: 1.1, 10.1, 10.2, 10.4, 11.1, 11.2_
  
  - [ ] 8.4 Escribir property test para navegación entre pantallas
    - **Property 14: Navegación entre pantallas**
    - **Valida: Requerimientos 10.3**
    - Verificar que al seleccionar cualquier pantalla del Sidebar, el contenido principal muestra esa pantalla
  
  - [ ] 8.5 Escribir property test para indicación de pantalla activa
    - **Property 15: Indicación de pantalla activa**
    - **Valida: Requerimientos 10.4**
    - Verificar que la pantalla actualmente mostrada tiene estado visual "activo" en el Sidebar
  
  - [ ] 8.6 Escribir property test para registro dinámico de pantallas
    - **Property 16: Registro dinámico de pantallas**
    - **Valida: Requerimientos 10.5**
    - Verificar que cualquier nueva pantalla agregada aparece en la lista del Sidebar
  
  - [ ] 8.7 Crear componente MainLayout
    - Implementar components/layout/MainLayout.tsx con estructura Sidebar + contenido principal
    - Integrar Header y WelcomeMessage dentro del área de contenido principal
    - Aplicar diseño responsivo con cuadrícula para resoluciones estándar (1920x1080 mínimo)
    - _Requerimientos: 1.1, 1.2, 1.4, 1.5_
  
  - [x] 8.8 Crear la Screen "SIFJ" y conectar la navegación a la pantalla activa
    - Registrar la Screen `{ id: 'sifj', label: 'SIFJ' }` en DEFAULT_SCREENS de contexts/NavigationContext.tsx y en defaultScreens de components/layout/MainLayout.tsx, junto a la Screen "GIC" existente
    - Crear screens/SifjScreen.tsx: filtra dashboardData.records a dependency === 'SIFJ', muestra un panel de resumen de 4 cards (Total Solicitudes, Total Riesgo Bajo, Total Riesgo Medio, Total Riesgo Alto) calculado contando esos registros por status, y una tabla de Últimos Registros con los mismos filtros y columnas que DashboardScreen excepto el filtro de Dependencia
    - Exportar SifjScreen desde screens/index.ts
    - Actualizar App.tsx para leer currentScreen de useNavigation() y renderizar SifjScreen cuando currentScreen === 'sifj', o DashboardScreen en cualquier otro caso
    - _Requerimientos: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

- [ ] 9. Implementar componentes de métricas
  - [ ] 9.1 Crear componente MetricCard
    - Implementar components/metrics/MetricCard.tsx mostrando label, value, unit, icon
    - Agregar visualización de changePercent y changeLabel
    - Aplicar estilo de indicador positivo/negativo según changePercent
    - Manejar estados de loading, error y success
    - Mostrar LoadingSpinner durante carga
    - Mostrar ErrorMessage si hay error
    - Aplicar estilos según tema actual
    - _Requerimientos: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 7.2_
  
  - [ ] 9.1.1 Escribir unit tests para MetricCard
    - Tests para renderizado de todos los campos (label, value, unit, icon)
    - Tests para visualización de changePercent positivo y negativo
    - Tests para estados loading, error y success
    - Tests para aplicación de estilos según tema
  
  - [ ] 9.2 Escribir property test para completitud de visualización de métricas
    - **Property 1: Completitud de visualización de métricas**
    - **Valida: Requerimientos 2.2**
    - Verificar que cualquier métrica renderizada muestra etiqueta, valor, unidad, icono y cambio porcentual
  
  - [ ] 9.3 Crear componente MetricList
    - Implementar components/metrics/MetricList.tsx que renderiza array de MetricCard
    - Aplicar diseño de cuadrícula responsiva para 4 cards
    - Mostrar sección visualmente distinta para métricas
    - _Requerimientos: 2.1, 2.6_
  
  - [ ] 9.3.1 Escribir unit tests para MetricList
    - Tests para renderizado de múltiples MetricCard
    - Tests para diseño de cuadrícula responsiva
    - Tests para manejo de array vacío
  
  - [ ] 9.4 Escribir property test para el cambio porcentual derivado del histórico
    - **Property 19: Cambio porcentual derivado del histórico de la métrica**
    - **Valida: Requerimientos 2.3**
    - Verificar que el cambio mostrado es ((último - penúltimo) / penúltimo) * 100 redondeado a un decimal, 0 cuando el penúltimo valor es cero, y sin cambio calculado con menos de dos puntos
  
  - [ ] 9.5 Escribir property test para la selección única de métrica
    - **Property 20: Selección única de métrica**
    - **Valida: Requerimientos 2.6**
    - Verificar que exactamente una card presenta el estado visual de selección y que corresponde al Dataset seleccionado

- [ ] 10. Implementar componentes de KPIs
  - [ ] 10.1 Crear componente TrendIndicator
    - Implementar components/kpis/TrendIndicator.tsx con props trend (up/down/stable)
    - Mostrar icono de flecha apropiado según tendencia
    - Aplicar colores según tema actual
    - _Requerimientos: 3.4_
  
  - [ ] 10.1.1 Escribir unit tests para TrendIndicator
    - Tests para renderizado de icono up, down y stable
    - Tests para aplicación de colores según tema
  
  - [ ] 10.2 Crear componente KPICard
    - Implementar components/kpis/KPICard.tsx mostrando label, currentValue, targetValue, unit
    - Calcular estado usando getKPIStatus y aplicar clase CSS status-{status}
    - Mostrar estado success para KPIs >= objetivo, warning/error para KPIs debajo
    - Integrar TrendIndicator para mostrar tendencia
    - Manejar estados de loading, error y success
    - Aplicar estilos según tema actual
    - _Requerimientos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ] 10.2.1 Escribir unit tests para KPICard
    - Tests para renderizado de todos los campos
    - Tests para cálculo de estado (success, warning, error)
    - Tests para integración con TrendIndicator
    - Tests para estados loading, error y success
  
  - [ ] 10.3 Escribir property test para completitud de visualización de KPIs
    - **Property 2: Completitud de visualización de KPIs**
    - **Valida: Requerimientos 3.2**
    - Verificar que cualquier KPI renderizado muestra el valor objetivo
  
  - [ ] 10.4 Escribir property test para presencia de indicador de tendencia
    - **Property 4: Presencia de indicador de tendencia en KPIs**
    - **Valida: Requerimientos 3.4**
    - Verificar que cualquier KPI renderizado muestra un indicador de tendencia
  
  - [ ] 10.5 Crear componente KPIList
    - Implementar components/kpis/KPIList.tsx que renderiza array de KPICard
    - Aplicar diseño de cuadrícula responsiva
    - _Requerimientos: 3.1_
  
  - [ ] 10.5.1 Escribir unit tests para KPIList
    - Tests para renderizado de múltiples KPICard
    - Tests para diseño de cuadrícula responsiva
    - Tests para manejo de array vacío

- [ ] 11. Implementar componentes de visualización de datos
  - [ ] 11.1 Crear componente BarChart
    - Implementar components/charts/BarChart.tsx usando Recharts
    - Configurar ejes con etiquetas claras y leyenda
    - Aplicar colores según tema actual
    - _Requerimientos: 4.2, 4.4_
  
  - [ ] 11.2 Crear componente LineChart
    - Implementar components/charts/LineChart.tsx usando Recharts
    - Configurar ejes con etiquetas claras y leyenda
    - Aplicar colores según tema actual
    - _Requerimientos: 4.2, 4.4_
  
  - [ ] 11.3 Crear componente PieChart
    - Implementar components/charts/PieChart.tsx usando Recharts
    - Configurar leyenda con etiquetas claras
    - Aplicar colores según tema actual
    - _Requerimientos: 4.2, 4.4_
  
  - [ ] 11.4 Crear componente ChartWrapper
    - Implementar components/charts/ChartWrapper.tsx con props title, type, data
    - Renderizar título descriptivo del diagrama
    - Seleccionar componente de gráfico apropiado según type (bar/line/pie)
    - Manejar estados de loading, error y success
    - Aplicar React.memo para optimización de rendimiento
    - _Requerimientos: 4.1, 4.3, 6.3, 7.2_
  
  - [ ] 11.5 Escribir property test para completitud de visualización de diagramas
    - **Property 5: Completitud de visualización de diagramas**
    - **Valida: Requerimientos 4.3**
    - Verificar que cualquier diagrama renderizado muestra el título descriptivo
  
  - [x] 11.6 Mover los colores de los diagramas a variables CSS
    - Definir en src/styles/globals.css las variables --chart-total, --chart-gic, --chart-se, --chart-sifj, --chart-riesgo-bajo, --chart-riesgo-medio y --chart-riesgo-alto como tripletas RGB
    - Consumir los colores en LineChart, BarChart y PieChart mediante rgba(var(--chart-*), alpha)
    - Eliminar el archivo src/styles/chartColors.ts y cualquier literal de color de los diagramas en TypeScript
    - _Requerimientos: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_
  
  - [ ] 11.7 Escribir property test para los colores de diagramas como variables CSS
    - **Property 35: Colores de diagramas expresados como variables CSS**
    - **Valida: Requerimientos 17.2, 17.3, 17.4, 17.5**
    - Implementar en tests/properties/chart-colors.properties.test.ts verificando que cada color es una expresión rgba(var(--chart-*), alpha) y que las ocho variables (incluida `--chart-segment-label`, que se consume como `rgb(var(--chart-segment-label))`) están definidas como tripletas de enteros 0-255

- [ ] 12. Implementar componentes de registros y mapa
  - [ ] 12.1 Crear componente RecordsTable
    - Implementar components/records/RecordsTable.tsx con tabla de 5 registros recientes
    - Mostrar columnas: ID (CHF-2024-XXX), Dirección, Estado, Fecha, Acciones
    - Implementar botones Ver y Editar para cada registro
    - Aplicar badge con color según RecordStatus
    - Agregar botón "Ver todos" en header de tabla
    - Manejar estados de loading, error y success
    - Aplicar estilos según tema actual
    - _Requerimientos: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  
  - [ ] 12.1.1 Escribir unit tests para RecordsTable
    - Tests para renderizado de tabla con 5 registros
    - Tests para columnas y formato de datos
    - Tests para botones Ver y Editar
    - Tests para badge de estado con colores correctos
    - Tests para botón "Ver todos"
    - Tests para estados loading, error y success
  
  - [ ] 12.1.2 Escribir property test para completitud de la fila de registro
    - **Property 21: Completitud de la fila de registro**
    - **Valida: Requerimientos 12.2, 12.3, 12.4**
    - Verificar que la fila contiene los ocho valores del registro y que el radicado cumple el formato RAD-AAAA-NNNNN
  
  - [ ] 12.1.3 Escribir property test para el filtrado combinado de registros
    - **Property 22: Filtrado combinado de registros**
    - **Valida: Requerimientos 12.12, 12.7, 12.8, 12.10, 12.11**
    - Implementar en tests/properties/records-filter.properties.test.ts cubriendo los límites de los rangos de días restantes 0/1, 3/4 y 7/8
  
  - [ ] 12.1.4 Escribir property test para las opciones dinámicas de tipo de trámite
    - **Property 23: Opciones de tipo de trámite derivadas de los registros**
    - **Valida: Requerimientos 12.9**
    - Verificar en records-filter.properties.test.ts que las opciones son exactamente el conjunto de tipos de trámite distintos, sin duplicados
  
  - [ ] 12.2 Crear componente MapVisualization
    - Implementar components/map/MapVisualization.tsx con visualización de zonas
    - Mostrar 8 zonas: Norte, Noreste, Centro, Este, Sur, Oeste, Suroeste, Sureste
    - Implementar indicadores de estado por zona (Aprobado, Pendiente, Rechazado)
    - Aplicar colores diferenciados según RecordStatus
    - Mostrar título "Mapa de ubicaciones" y subtítulo "Distribución geográfica"
    - Manejar estados de loading, error y success
    - Aplicar estilos según tema actual
    - _Requerimientos: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ] 12.2.1 Escribir unit tests para MapVisualization
    - Tests para renderizado de 8 zonas
    - Tests para indicadores de estado por zona
    - Tests para aplicación de colores según RecordStatus
    - Tests para estados loading, error y success
  
  - [x] 12.2.2 Eliminar el porcentaje de aprobación de las cards de zona
    - Quitar approvalRate del render de las 4 cards de components/map/MapVisualization.tsx
    - Dejar en cada card únicamente el nombre de la Location_Zone y el total de solicitudes (suma de sus tres niveles de riesgo)
    - _Requerimientos: 13.4, 13.5_
  
  - [ ] 12.2.3 Escribir property test para la card de zona sin porcentaje
    - **Property 27: Card de zona muestra nombre y total exacto**
    - **Valida: Requerimientos 13.4, 13.5**
    - Verificar que la card contiene el nombre de la zona y el total exacto, y que no contiene ningún porcentaje de aprobación
  
  - [ ] 12.2.4 Integrar el mapa geográfico con ArcGIS Online
    - Sustituir el espacio reservado "Mapa ArcGIS Online / Integración pendiente" dentro de components/map/MapVisualization.tsx por el mapa real
    - Mantener las 4 cards de Location_Zone y la leyenda de niveles de riesgo
    - _Requerimientos: 13.3, 13.6, 13.7_
  
  - [ ] 12.3 Crear componente SummaryPanel
    - Implementar components/summary/SummaryPanel.tsx con 4 cards de resumen
    - Mostrar cards: Total, Aprobados, Pendientes, Rechazados
    - Aplicar diseño compacto y prominente
    - Manejar estados de loading, error y success
    - Aplicar estilos según tema actual
    - _Requerimientos: 14.1, 14.2, 14.3, 14.4_
  
  - [ ] 12.3.1 Escribir unit tests para SummaryPanel
    - Tests para renderizado de 4 cards de resumen
    - Tests para valores correctos en cada card
    - Tests para diseño compacto
    - Tests para estados loading, error y success

- [ ] 13. Implementar pantalla principal del dashboard
  - [ ] 13.1 Crear componente DashboardScreen
    - Implementar screens/DashboardScreen.tsx que consume DataContext
    - Renderizar WelcomeMessage con el texto "Bienvenido!"
    - Renderizar MetricList con las 4 métricas principales
    - Renderizar KPIList con KPIs del dashboard
    - Renderizar ChartWrapper para cada gráfico en charts array
    - Renderizar RecordsTable con últimos 5 registros
    - Renderizar MapVisualization con datos de zonas
    - Renderizar SummaryPanel con datos de resumen
    - Mostrar LoadingSpinner durante carga inicial (isLoading && !data)
    - Mostrar ErrorMessage si hay error con botón de refetch
    - Aplicar diseño de cuadrícula responsiva
    - _Requerimientos: 1.2, 1.5, 2.1, 2.5, 3.1, 4.1, 4.5, 5.3, 5.4, 6.1, 6.2, 6.3, 12.1, 13.1, 14.1_
  
  - [ ] 13.2 Crear archivo de exportación de pantallas
    - Implementar screens/index.ts exportando todas las pantallas disponibles
    - _Requerimientos: 10.1_
  
  - [x] 13.3 Estabilizar el orden de hooks en DashboardScreen
    - Reordenar screens/DashboardScreen.tsx para ejecutar todos los useState y el useMemo del diagrama circular antes de los retornos anticipados por isLoading, error o ausencia de datos
    - Usar optional chaining en los cálculos intermedios que dependen de dashboardData
    - Eliminar el error en tiempo de ejecución "Rendered more hooks than during the previous render"
    - _Requerimientos: 18.1, 18.2, 18.3_
  
  - [ ] 13.4 Escribir property test para el orden estable de hooks
    - **Property 36: Orden estable de hooks en la pantalla principal**
    - **Valida: Requerimientos 18.1, 18.2, 18.3**
    - Verificar que para cualquier combinación y secuencia de transiciones entre los estados de carga, error y disponibilidad de datos, el render se completa sin errores de las Rules of Hooks y con cantidad y orden de hooks constantes

- [ ] 14. Configurar estilos y tematización
  - [x] 14.1 Crear configuración de temas
    - Implementar styles/themes.ts con definiciones de ThemeColors para light y dark
    - Configurar paleta con azul oscuro (#1e3a8a) como color principal del tema oscuro
    - **AJUSTE FINAL: Configurar slate-900 (#0f172a) como color de fondo para tema oscuro**
    - **AJUSTE FINAL: Configurar blanco (#ffffff) como color de fondo para tema claro**
    - Configurar colores complementarios para acentos y elementos interactivos
    - Asegurar ratio de contraste mínimo 4.5:1 entre texto y fondo para ambos temas
    - **DOCUMENTADO: Tailwind requiere darkMode: 'class' y aplicación de clase .dark al root**
    - _Requerimientos: 9.4, 11.1, 11.2, 11.3, 11.4_
  
  - [ ] 14.2 Escribir property test para contraste de colores
    - **Property 17: Contraste de colores para accesibilidad**
    - **Valida: Requerimientos 11.3**
    - Verificar que cualquier combinación de texto/fondo tiene ratio >= 4.5:1
  
  - [x] 14.3 Crear estilos globales
    - Implementar styles/globals.css con estilos base y variables CSS para temas
    - Configurar transiciones suaves para cambios de tema
    - Definir clases utility personalizadas si es necesario
    - _Requerimientos: 9.4_

- [ ] 15. Implementar aplicación principal y configuración de providers
  - [ ] 15.1 Crear componente App
    - Implementar App.tsx con estructura de providers anidados (ThemeProvider > NavigationProvider > DataProvider)
    - Integrar MainLayout como contenedor principal
    - Renderizar pantalla actual según NavigationContext
    - Implementar ErrorBoundary para captura de errores de renderizado
    - _Requerimientos: 1.1, 1.2_
  
  - [ ] 15.2 Escribir property test para aplicación global de tema
    - **Property 13: Aplicación global de tema**
    - **Valida: Requerimientos 9.4**
    - Verificar que al cambiar tema, todos los componentes visibles reflejan el nuevo tema
  
  - [ ] 15.3 Configurar punto de entrada de la aplicación
    - Implementar index.tsx con ReactDOM.render y StrictMode
    - Importar estilos globales
    - _Requerimientos: 1.1_

- [ ] 16. Configurar testing
  - [x] 16.1 Configurar Vitest y React Testing Library
    - Instalar vitest, @testing-library/react, @testing-library/jest-dom
    - Crear vitest.config.ts con configuración apropiada
    - Configurar setup file para testing-library
    - _Requerimientos: Testing strategy_
  
  - [ ] 16.2 Configurar fast-check para property-based testing
    - Instalar fast-check
    - Crear configuración con numRuns: 100 mínimo
    - Crear generadores (arbitraries) para Metric, KPI, Theme, Record, ZoneData
    - _Requerimientos: Testing strategy_
  
  - [ ] 16.2.1 Agregar los generadores de datos crudos y derivación
    - Agregar a la configuración de arbitraries los generadores riskArray (tripleta de naturales), rawMetrics (las 4 etiquetas de Dataset con su tripleta), rawRecord (incluyendo codigoTramite ausentes del mapa de grupos), grupoTramite (con BAJO <= MEDIO <= ALTO) y elapsedDays (enteros cubriendo los límites BAJO, MEDIO y valores negativos)
    - _Requerimientos: 16.2, 16.4, 16.12, 16.14, 16.15, 16.16, 16.16.1, 16.16.2_
  
  - [x] 16.3 Crear mocks de API
    - Implementar mocks/api.mock.ts con mockDashboardData
    - Incluir datos mock para records, zones, summaryData
    - Implementar mockFetchDashboardData y mockFetchDashboardDataError
    - _Requerimientos: Testing strategy_

- [ ] 17. Checkpoint final - Verificación completa del sistema
  - Ejecutar todos los tests (unit y property-based)
  - Verificar que el dashboard se carga correctamente con todos los componentes
  - Verificar que el mensaje de bienvenida muestra "Bienvenido!"
  - Verificar que las 4 métricas principales se muestran con iconos y porcentajes
  - Verificar que la tabla de registros recientes muestra 5 registros con acciones
  - Verificar que el mapa geográfico muestra las 8 zonas con indicadores de estado
  - Verificar que el panel de resumen muestra las cifras totales
  - Verificar mediante tests que todos los valores derivados provienen de records_tramites.json y grupos_tramites.json a través del Derivation_Service
  - Verificar mediante tests que los colores de los diagramas se resuelven desde las variables CSS --chart-*
  - Verificar mediante tests que la pantalla principal renderiza sin errores de Rules of Hooks en todos los estados
  - Verificar actualización automática de datos cada 30 segundos
  - Verificar cambio de tema funciona y persiste
  - Verificar navegación del sidebar funciona correctamente
  - Verificar que todos los componentes manejan estados de loading y error
  - Verificar accesibilidad básica (navegación por teclado, ARIA labels)
  - Verificar rendimiento en navegador (tiempo de carga < 2s)
  - Preguntar al usuario si hay dudas o ajustes necesarios antes de finalizar

## Notas

### Prácticas de Desarrollo
- **TDD OBLIGATORIO**: Tests primero, código después, refactorizar al final
- **Clean Code**: Nombres descriptivos, funciones pequeñas, una responsabilidad
- **SOLID**: Aplicar los 5 principios en cada componente y función
- Cobertura mínima: 80% de código, 100% de funciones críticas
- TypeScript strict mode sin uso de `any`

### Gestión de Tareas
- Tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requerimientos específicos para trazabilidad
- Los checkpoints aseguran validación incremental del progreso
- Los property tests validan propiedades universales de corrección con mínimo 100 iteraciones
- Los unit tests validarán ejemplos específicos y casos borde

### Configuración del Proyecto
- El intervalo de actualización es configurable pero por defecto 30 segundos
- El timeout de API es fijo en 5 segundos según requerimientos
- La aplicación está optimizada para resoluciones 1920x1080 mínimo
- El tema por defecto es oscuro con azul oscuro como color principal

### Funcionalidad Placeholder
- El botón "Cerrar sesión" es un placeholder visual; la funcionalidad de autenticación está fuera de alcance
- Las acciones Ver/Editar en la tabla de registros tendrán implementación placeholder inicialmente
- Los datos del mockup (registros, zonas) se utilizarán como datos mock para desarrollo inicial
- El área del mapa muestra el espacio reservado "Mapa ArcGIS Online / Integración pendiente"; la integración real está registrada en la tarea 12.2.4

### Arquitectura de Datos (Completado)

Los datos crudos viven en dos archivos JSON independientes y todos los valores derivados se calculan en tiempo de lectura:

- `records_tramites.json` (raíz del proyecto): secciones `metrics` (tripletas de riesgo por Dataset; sus claves conservan las etiquetas antiguas "Solicitudes Totales" y "Solicitudes Abiertas GIC/SE/SIFJ" solo como claves de lectura), `recordCadaMes` (etiquetas y series total/gic/se/sifj) y `records` (radicado, usuarioEncargado, dependencia, tipoTramite, codigoTramite, fechaRadicacion)
- `grupos_tramites.json` (raíz del proyecto): mapa ProcedureCode → objeto con `DÍAS CALENDARIO`, `BAJO`, `MEDIO`, `ALTO` y `DEPENDENCIA`
- `src/services/dashboardData.service.ts`: Derivation_Service con `getMetrics`, `getKpisByDataset`, `getZones`, `getSummaryData`, `getRecords`, `getMonthlyBarChart`, los helpers `sumRisk`, `toRiskBreakdown`, `calculateRiskStatus` y las constantes `LABEL_TO_DATASET_ID` (claves antiguas del JSON → id interno), `DATASET_LABELS` (id interno → etiqueta visible) y `DATASET_ORDER`
- `src/mocks/api.mock.ts`: ensambla `DashboardData` desde el servicio, sin datos literales

Reglas de derivación: valor de métrica = suma de la tripleta; `allottedDays` desde `grupos_tramites.json` buscando por `codigoTramite` con fallback 0; `daysUntilDue` = `allottedDays` menos días transcurridos; `status` por los umbrales `BAJO`/`MEDIO` del grupo del trámite (elapsedDays ≤ BAJO Riesgo Bajo; BAJO < elapsedDays ≤ MEDIO Riesgo Medio; elapsedDays > MEDIO Riesgo Alto; sin grupo Riesgo Alto; elapsedDays negativo Riesgo Bajo); `summaryData` con el total del Dataset "Trámites Totales" y los riesgos como suma de GIC + SE + SIFJ; "Registros por mes" (`chart-3`) muestra los valores mensuales de `recordCadaMes` sin transformar. El diagrama de evolución interactivo (antiguo `chart-1`) fue eliminado por decisión del usuario; `changePercent` de las MetricCard ahora se calcula desde `chart-3`.

### Colores de Diagramas en CSS (Completado)

Los ocho colores de diagramas se declaran como tripletas RGB en `src/styles/globals.css` (`--chart-total`, `--chart-gic`, `--chart-se`, `--chart-sifj`, `--chart-riesgo-bajo`, `--chart-riesgo-medio`, `--chart-riesgo-alto`, `--chart-segment-label`) y los componentes `LineChart`, `BarChart` y `PieChart` los consumen con `rgba(var(--chart-*), alpha)`; `--chart-segment-label` (color de las etiquetas de los tramos apilados) se consume como `rgb(var(--chart-segment-label))`. El módulo `src/styles/chartColors.ts` fue eliminado. `InteractiveChart.tsx` (usado solo por el antiguo `chart-1`) también fue eliminado por decisión del usuario (tarea 3.5.6).

### Orden de Hooks en DashboardScreen (Completado)

`DashboardScreen` ejecuta todos los `useState` y el `useMemo` del diagrama circular antes de los retornos anticipados por carga, error o ausencia de datos, con optional chaining en los cálculos intermedios. Esto resolvió el error en tiempo de ejecución "Rendered more hooks than during the previous render".

### Ajustes de Colores de Tema (Completado)

Durante la implementación se identificó un problema con la aplicación del tema oscuro donde las cards y contenedores no aplicaban correctamente los colores del tema. Se realizaron los siguientes ajustes:

**Problema identificado:**
1. Espacios blancos visibles entre cards cuando el tema oscuro estaba activo
2. Las cards no aplicaban el fondo oscuro correctamente
3. Discrepancia entre el selector de modo oscuro de Tailwind (`.dark` class) y la implementación inicial (solo `data-theme` attribute)

**Solución implementada:**

1. **ThemeContext actualizado** (`src/contexts/ThemeContext.tsx`):
   - Ahora aplica AMBOS: clase `.dark` Y atributo `data-theme` al `document.documentElement`
   - La clase `.dark` es requerida por Tailwind CSS (`darkMode: 'class'` configuración)
   - El atributo `data-theme` es usado por variables CSS personalizadas
   - Se aplica en dos lugares: función `setTheme` y hook `useEffect` inicial

2. **Componentes actualizados con colores finalizados:**
   - `MainLayout`: Aplicado `bg-white dark:bg-slate-900` a contenedor principal y área de contenido
   - `Header`: Cambiado de `dark:bg-gray-800` a `dark:bg-slate-900`
   - `MetricCard`: Cambiado de `bg-surface` a `bg-white dark:bg-slate-900`
   - `ChartWrapper`: Cambiado de `bg-surface` a `bg-white dark:bg-slate-900`
   - `MapVisualization`: Cambiado de `bg-surface` a `bg-white dark:bg-slate-900`
   - `ThemeToggle`: Cambiado de `bg-surface` a `bg-gray-100 dark:bg-slate-800`
   - `DashboardScreen` (tabla de registros): Aplicado `bg-white dark:bg-slate-900`

3. **Esquema de colores finalizado:**
   - **Tema claro**: Fondo blanco (`#ffffff`)
   - **Tema oscuro**: Fondo slate-900 (`#0f172a` - azul-oscuro)
   - **Color primario tema oscuro**: `#1e3a8a` (azul oscuro para sidebar y navegación)

**Archivos modificados:**
- `src/contexts/ThemeContext.tsx` - CRITICAL: Aplicación dual de clase y atributo
- `src/components/layout/MainLayout.tsx`
- `src/components/layout/Header.tsx`
- `src/components/metrics/MetricCard.tsx`
- `src/components/charts/ChartWrapper.tsx`
- `src/components/map/MapVisualization.tsx`
- `src/components/common/ThemeToggle.tsx`
- `src/screens/DashboardScreen.tsx`

**Validación:**
- Usuario confirmó "ahora si" (ahora sí) después de los ajustes
- Los componentes ahora aplican correctamente los colores de tema en ambos modos (claro y oscuro)
- No hay espacios blancos visibles en tema oscuro
- Las transiciones de tema funcionan correctamente
