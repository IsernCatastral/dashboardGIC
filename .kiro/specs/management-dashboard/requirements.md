# Documento de Requerimientos

## Introducción

El Dashboard Entidad es un sistema de visualización basado en web que proporciona inteligencia de negocios en tiempo real al equipo de gestión. El panel consolida indicadores clave de rendimiento, métricas operativas y diagramas visuales en una interfaz con navegación lateral para apoyar la toma de decisiones basada en datos, con foco en el seguimiento de solicitudes por dependencia y nivel de riesgo de vencimiento.

En la implementación actual los datos provienen de dos archivos JSON separados, ambos en la raíz del proyecto: `records_tramites.json` con las métricas por Dataset (`metrics`), los registros de solicitudes (`records`) y la evolución mensual (`recordCadaMes`), y `grupos_tramites.json` con los días asignados y los umbrales de riesgo por ProcedureCode. A partir de esos dos archivos, un servicio de derivación calcula todos los valores mostrados en la interfaz (totales de métricas, desgloses de riesgo por conjunto de datos, zonas del mapa, panel de resumen, días restantes y estado de riesgo de cada registro); ningún valor derivado se almacena precalculado en los archivos JSON. Los colores y estilos de los diagramas se declaran como variables CSS en `src/styles/globals.css`, no en archivos TypeScript.

Un elemento permanece como espacio reservado a la espera de su fuente definitiva: el mapa geográfico, pendiente de integración con ArcGIS Online.

## Glosario

- **Dashboard**: La aplicación web Dashboard Entidad que muestra métricas, KPIs y diagramas
- **Metric**: Una medición cuantificable rastreada a lo largo del tiempo
- **KPI**: Indicador Clave de Rendimiento - una métrica de negocio crítica que mide el éxito
- **Diagram**: Una representación visual de datos (gráficos, diagramas, etc.)
- **User**: Un miembro del equipo de gestión que visualiza el panel
- **Data_Source**: El sistema backend que proporciona valores de métricas y KPIs. En la implementación actual está representado por dos archivos JSON separados: el Records_Tramites_File y el Procedure_Groups_File
- **Records_Tramites_File**: El archivo JSON `records_tramites.json`, ubicado en la raíz del proyecto, que contiene las secciones `metrics` (tripleta de riesgo por Dataset), `records` (registros crudos de solicitudes) y `recordCadaMes` (evolución mensual) de los datos crudos del Dashboard
- **Procedure_Groups_File**: El archivo JSON `grupos_tramites.json`, ubicado en la raíz del proyecto, que contiene un mapa de cada ProcedureCode a un objeto con los días calendario asignados (`DÍAS CALENDARIO`) y los umbrales de días transcurridos `BAJO`, `MEDIO` y `ALTO` usados para clasificar el RecordStatus, además del campo informativo `DEPENDENCIA`
- **Derivation_Service**: El módulo `src/services/dashboardData.service.ts` que lee el Records_Tramites_File y el Procedure_Groups_File y calcula todos los valores derivados que consume la interfaz
- **ElapsedDays**: El número de días completos transcurridos entre la fechaRadicacion de un Record y la fecha actual
- **Refresh_Interval**: El período de tiempo entre actualizaciones automáticas de datos
- **Theme**: La configuración de apariencia visual que controla colores, contraste y estilo del Dashboard
- **Sidebar**: Panel lateral de navegación que permite cambiar entre diferentes pantallas del Dashboard
- **Screen**: Una vista específica dentro del Dashboard accesible a través del Sidebar
- **Record**: Un registro individual de una solicitud con radicado, usuario encargado, dependencia, tipo de trámite y fecha de radicación
- **RecordStatus**: El nivel de riesgo de vencimiento de un Record (Riesgo Bajo, Riesgo Medio, Riesgo Alto)
- **Dataset**: Uno de los cuatro conjuntos de datos disponibles en el Dashboard (Trámites Totales, Gerencia de Información Catastral, Subgerencia de Información Económica, Subgerencia de Información Física y Jurídica) utilizado para segmentar Metrics, KPIs, el Diagram de distribución por riesgo y el mapa de ubicaciones
- **Location_Zone**: Una categoría del mapa de ubicaciones que corresponde a uno de los cuatro Dataset, mostrando el desglose de RecordStatus de ese Dataset
- **Dependencia**: La unidad organizacional responsable de un Record (GIC, SE o SIFJ). El Derivation_Service la obtiene del campo `DEPENDENCIA` del grupo de trámite asociado al ProcedureCode del Record en el Procedure_Groups_File, no del campo `dependencia` (nombre descriptivo largo) del Records_Tramites_File
- **SourceDependency**: El código corto de la dependencia de origen de un Record (GIC, SE o SIFJ), tomado sin transformar del campo `dependenciaOrigen` del Records_Tramites_File. Se usa para acotar el panel de resumen y la tabla de Últimos Registros de las Screens "GIC" y "SIFJ" a una dependencia de origen específica
- **Group**: La categoría de trámite de un Record (ej. "CABIDA Y LINDEROS", "DINÁMICA", "ENGLOBES - DESENGLOBES NPH"), tomada sin transformar del campo `grupo` del Records_Tramites_File
- **ProcedureType**: La clasificación del trámite asociado a un Record (Certificacion, Solicitud de Permiso, Recurso Apelacion), declarada en el campo `tipoTramite` del Records_Tramites_File
- **ProcedureCode**: El código numérico del trámite asociado a un Record, declarado en el campo `codigoTramite` del Records_Tramites_File y usado como clave de búsqueda en el Procedure_Groups_File
- **AllottedDays**: El número de días calendario asignados a un ProcedureCode para su resolución, obtenido del Procedure_Groups_File a partir del ProcedureCode del Record
- **DaysUntilDue**: El número de días restantes de un Record, calculado como AllottedDays menos los días transcurridos entre su fecha de radicación y la fecha actual
- **Chart_Color_Variable**: Una variable CSS definida en `src/styles/globals.css` que declara un color de gráfico como tripleta RGB

## Requerimientos

### Requerimiento 1: Mostrar Interfaz del Panel

**Historia de Usuario:** Como miembro del equipo de gestión, quiero ver un panel con navegación lateral, para poder evaluar rápidamente el rendimiento del negocio y navegar entre diferentes pantallas.

#### Criterios de Aceptación

1. EL Dashboard DEBERÁ mostrar un Sidebar lateral para navegación entre diferentes Screens
2. EL Dashboard DEBERÁ organizar el contenido principal en un diseño de cuadrícula que se ajuste a resoluciones de escritorio estándar (1920x1080 mínimo)
3. EL Dashboard DEBERÁ mostrar un encabezado que muestre el título "Dashboard Entidad"
4. EL Dashboard DEBERÁ mantener un diseño responsivo que se adapte a diferentes tamaños de pantalla
5. EL Dashboard DEBERÁ mostrar un mensaje de bienvenida con el texto "Bienvenido!", sin texto secundario adicional

### Requerimiento 2: Mostrar Métricas Principales

**Historia de Usuario:** Como miembro del equipo de gestión, quiero ver las métricas operativas actuales y poder seleccionarlas para explorar su desglose de riesgo, para poder monitorear el rendimiento diario del negocio.

#### Criterios de Aceptación

1. EL Dashboard DEBERÁ mostrar exactamente 4 cards de métricas principales: Trámites Totales, Gerencia de Información Catastral, Subgerencia de Información Económica, Subgerencia de Información Física y Jurídica
2. EL Dashboard DEBERÁ mostrar cada métrica con una etiqueta descriptiva, valor numérico y unidad de medida "solicitudes"
3. EL Dashboard DEBERÁ mostrar cada métrica con un indicador de cambio porcentual respecto al período anterior, calculado dinámicamente a partir de los dos últimos valores mensuales de esa métrica en la sección `recordCadaMes`, obtenidos a través del diagrama de barras "Registros por mes"
4. CUANDO un valor de métrica cambie, EL Dashboard DEBERÁ actualizar el valor mostrado dentro del Refresh_Interval
5. EL Dashboard DEBERÁ mostrar las métricas en una sección visualmente distinta al inicio del contenido principal, con el título de sección "Métricas Principales" en tamaño de fuente aumentado
6. CUANDO el User seleccione una card de métrica, EL Dashboard DEBERÁ indicar visualmente cuál métrica está actualmente seleccionada
7. EL Dashboard DEBERÁ seleccionar la métrica "Trámites Totales" de forma predeterminada al cargar

### Requerimiento 3: Mostrar Indicadores Clave de Rendimiento

**Historia de Usuario:** Como miembro del equipo de gestión, quiero ver KPIs de riesgo con su estado respecto al tiempo de vencimiento, para poder entender si estamos cumpliendo nuestros objetivos de tiempos de respuesta.

#### Criterios de Aceptación

1. EL Dashboard DEBERÁ mostrar exactamente 3 KPIs (Solicitudes en Riesgo Bajo, Solicitudes en Riesgo Medio, Solicitudes en Riesgo Alto) con sus valores actuales
2. EL Dashboard DEBERÁ calcular el estado de cada KPI (éxito, advertencia, alerta) comparando su valor actual contra un valor objetivo interno, sin mostrar el valor objetivo en la interfaz
3. CUANDO un KPI esté en estado de éxito, EL Dashboard DEBERÁ mostrar la insignia de estado con el texto "A tiempo por contestar"
4. CUANDO un KPI esté en estado de advertencia, EL Dashboard DEBERÁ mostrar la insignia de estado con el texto "Riesgo del tiempo de vencimiento"
5. CUANDO un KPI esté en estado de alerta, EL Dashboard DEBERÁ mostrar la insignia de estado con el texto "Cerca de tiempo de vencimiento"
6. EL Dashboard DEBERÁ mostrar la insignia de estado alineada a la derecha de la card, sin icono de tendencia
7. EL Dashboard DEBERÁ mostrar cada card de KPI con un borde completo de 2px alrededor de toda la card, con color según su estado
8. EL Dashboard DEBERÁ mostrar el título de cada card de KPI en un tamaño de fuente aumentado
9. EL Dashboard DEBERÁ mostrar la sección de KPIs con el título "Indicadores de Desempeño" en tamaño de fuente aumentado

### Requerimiento 4: Mostrar Diagramas Visuales

**Historia de Usuario:** Como miembro del equipo de gestión, quiero ver gráficos y diagramas legibles en cualquier Theme, para poder entender patrones y tendencias de datos visualmente.

#### Criterios de Aceptación

1. EL Dashboard DEBERÁ mostrar al menos 2 diagramas diferentes que representen datos del negocio
2. EL Dashboard DEBERÁ soportar múltiples tipos de diagramas (circular, barras)
3. EL Dashboard DEBERÁ mostrar cada diagrama con un título descriptivo
4. EL Dashboard DEBERÁ renderizar diagramas con etiquetas de ejes y leyendas claras donde sea aplicable
5. CUANDO los datos subyacentes cambien, EL Dashboard DEBERÁ actualizar los diagramas dentro del Refresh_Interval
6. EL Dashboard DEBERÁ mostrar el diagrama de barras "Registros por mes" con 4 series correspondientes a Trámites Totales, Gerencia de Información Catastral, Subgerencia de Información Económica y Subgerencia de Información Física y Jurídica, con el valor mensual (no acumulado) de cada mes
7. EL Dashboard DEBERÁ mostrar las etiquetas emergentes (tooltips) del diagrama circular "Distribución por nivel de riesgo" con color de fondo, color de texto de elemento y color de texto de etiqueta legibles tanto en Theme claro como en Theme oscuro
8. EL Dashboard DEBERÁ mostrar el título de la sección "Análisis de Datos" en un tamaño de fuente aumentado


### Requerimiento 5: Obtener Datos desde la Fuente

**Historia de Usuario:** Como miembro del equipo de gestión, quiero que el panel se actualice automáticamente con datos actuales, para siempre ver información actualizada.

#### Criterios de Aceptación

1. CUANDO el Dashboard se cargue, EL Dashboard DEBERÁ obtener datos iniciales desde el Data_Source
2. EL Dashboard DEBERÁ actualizar automáticamente los datos desde el Data_Source en el Refresh_Interval configurado
3. SI el Data_Source no está disponible, ENTONCES EL Dashboard DEBERÁ mostrar un mensaje de error indicando que los datos no pueden ser cargados
4. CUANDO la actualización de datos falle, EL Dashboard DEBERÁ mostrar los últimos datos cargados exitosamente con un indicador de advertencia
5. EL Dashboard DEBERÁ completar cada operación de obtención de datos dentro de 5 segundos

### Requerimiento 6: Manejar Estados de Carga

**Historia de Usuario:** Como miembro del equipo de gestión, quiero ver indicadores de carga, para saber que el panel está funcionando cuando se están obteniendo datos.

#### Criterios de Aceptación

1. MIENTRAS los datos están siendo obtenidos, EL Dashboard DEBERÁ mostrar un indicador de carga
2. CUANDO la carga inicial esté completa, EL Dashboard DEBERÁ ocultar el indicador de carga y mostrar los datos
3. MIENTRAS la actualización en segundo plano esté ocurriendo, EL Dashboard DEBERÁ mostrar un indicador de actualización sutil sin bloquear la interfaz

### Requerimiento 7: Manejar Estados de Error

**Historia de Usuario:** Como miembro del equipo de gestión, quiero ver mensajes de error claros cuando algo sale mal, para conocer el estado del sistema.

#### Criterios de Aceptación

1. SI la obtención de datos falla, ENTONCES EL Dashboard DEBERÁ mostrar un mensaje de error con una descripción del fallo
2. SI una métrica o diagrama específico falla al cargar, ENTONCES EL Dashboard DEBERÁ mostrar un estado de error solo para ese componente
3. SI la conexión con el Data_Source se pierde, ENTONCES EL Dashboard DEBERÁ mostrar un mensaje de error de conexión
4. EL Dashboard DEBERÁ proporcionar una opción de reintento manual cuando ocurran errores

### Requerimiento 8: Registrar Marca de Tiempo de Actualización

**Historia de Usuario:** Como miembro del equipo de gestión, quiero que el sistema registre internamente cuándo los datos fueron actualizados por última vez, para que esa información esté disponible para uso futuro o depuración aunque no se muestre en la interfaz actual.

#### Criterios de Aceptación

1. EL Dashboard DEBERÁ registrar internamente la marca de tiempo de la última actualización exitosa de datos
2. EL Dashboard DEBERÁ actualizar la marca de tiempo registrada cada vez que los datos se actualicen exitosamente
3. EL Dashboard NO DEBERÁ mostrar la marca de tiempo de última actualización en ningún componente visible de la interfaz
4. EL Dashboard DEBERÁ formatear las marcas de tiempo en un formato legible para humanos (ej., "2:30 PM") si en una futura iteración se decide exponerlas nuevamente en la interfaz

### Requerimiento 9: Cambio de Tema Visual

**Historia de Usuario:** Como usuario, quiero cambiar entre tema claro y tema oscuro, para poder adaptar la visualización a mis preferencias y condiciones de iluminación.

#### Criterios de Aceptación

1. EL Dashboard DEBERÁ proporcionar un botón para cambiar entre Theme claro y Theme oscuro
2. CUANDO el User haga clic en el botón de tema, EL Dashboard DEBERÁ cambiar inmediatamente entre Theme claro y Theme oscuro
3. EL Dashboard DEBERÁ recordar la preferencia de Theme del User entre sesiones
4. EL Dashboard DEBERÁ aplicar el Theme seleccionado a todos los componentes visibles incluyendo métricas, KPIs, diagramas, Sidebar, mapa de ubicaciones, tabla de registros y panel de resumen

### Requerimiento 10: Sidebar de Navegación

**Historia de Usuario:** Como usuario, quiero un panel lateral de navegación, para poder cambiar entre diferentes pantallas y secciones del Dashboard.

#### Criterios de Aceptación

1. EL Dashboard DEBERÁ mostrar un Sidebar lateral fijo en el lado izquierdo de la interfaz
2. EL Sidebar DEBERÁ contener una lista de Screens disponibles para navegación
3. CUANDO el User seleccione una Screen en el Sidebar, EL Dashboard DEBERÁ cargar y mostrar esa Screen en el área de contenido principal
4. EL Sidebar DEBERÁ indicar visualmente cuál Screen está actualmente seleccionada
5. EL Sidebar DEBERÁ permitir agregar nuevas Screens dinámicamente para expansión futura
6. EL Dashboard DEBERÁ incluir por defecto la Screen "GIC" como pantalla principal de navegación en el Sidebar

### Requerimiento 11: Paleta de Colores y Estilo Visual

**Historia de Usuario:** Como usuario, quiero una interfaz con temática azul oscura en modo oscuro y blanca en modo claro, para tener una experiencia visual consistente y profesional.

#### Criterios de Aceptación

1. EL Dashboard DEBERÁ utilizar una paleta de colores con azul oscuro (#1e3a8a) como color principal en el Theme oscuro y fondo slate-900 (#0f172a) para las cards y contenedores
2. EL Dashboard DEBERÁ utilizar fondo blanco (#ffffff) para el Theme claro
3. EL Dashboard DEBERÁ aplicar el tema consistentemente a todos los componentes: Header, Sidebar, cards de métricas, KPIs, gráficos, mapa, tabla de registros y panel de resumen
4. EL Dashboard DEBERÁ mantener suficiente contraste entre texto y fondo para garantizar legibilidad (mínimo ratio 4.5:1 según WCAG 2.1)
5. EL Dashboard DEBERÁ utilizar colores complementarios al azul oscuro para acentos y elementos interactivos
6. EL Dashboard DEBERÁ aplicar tanto el atributo data-theme como la clase .dark al elemento raíz para compatibilidad con Tailwind CSS y variables CSS personalizadas

### Requerimiento 12: Visualización y Filtrado de Registros

**Historia de Usuario:** Como miembro del equipo de gestión, quiero ver y filtrar una tabla con los registros de solicitudes de la dependencia GIC, para poder monitorear y analizar la actividad reciente según distintos criterios.

#### Criterios de Aceptación

1. EL Dashboard DEBERÁ mostrar una tabla con los Record cuyo SourceDependency sea "GIC"
2. EL Dashboard DEBERÁ mostrar cada Record con las columnas Radicado, Usuario Encargado, Dependencia, Tipo de Trámite, Grupo, Código de Trámite, Días por Trámite, Estado, Fecha de Radicación y Días Restantes
3. EL Dashboard DEBERÁ mostrar el Radicado de cada Record en el formato RAD-AAAA-NNNNN
4. EL Dashboard DEBERÁ mostrar el RecordStatus de cada Record (Riesgo Bajo, Riesgo Medio, Riesgo Alto)
5. EL Dashboard DEBERÁ calcular el valor de Días Restantes de cada Record como AllottedDays menos los días transcurridos entre la Fecha de Radicación y la fecha actual
6. EL Dashboard DEBERÁ mostrar la tabla de Record con desplazamiento vertical y una altura máxima fija
7. EL Dashboard NO DEBERÁ proporcionar un filtro por Dependencia en esta tabla, dado que ya está acotada a la dependencia GIC
8. EL Dashboard DEBERÁ proporcionar un filtro por RecordStatus con las opciones Todos, Riesgo Bajo, Riesgo Medio y Riesgo Alto
9. EL Dashboard DEBERÁ proporcionar un filtro por ProcedureType con opciones generadas dinámicamente a partir de los Record disponibles en esta tabla
10. EL Dashboard DEBERÁ proporcionar un filtro por rango de fechas de radicación mediante campos "Desde" y "Hasta"
11. EL Dashboard DEBERÁ proporcionar un filtro por Días Restantes con las opciones Todos, Vencido, 1-3 días, 4-7 días y 8+ días
12. CUANDO el User aplique múltiples filtros simultáneamente, EL Dashboard DEBERÁ mostrar únicamente los Record que cumplan todos los filtros seleccionados

### Requerimiento 13: Visualización de Mapa de Ubicaciones por Tipo de Solicitud

**Historia de Usuario:** Como miembro del equipo de gestión, quiero ver un mapa con la distribución de solicitudes por tipo y su nivel de riesgo, para poder entender la proporción de riesgo por cada Dataset.

#### Criterios de Aceptación

1. EL Dashboard DEBERÁ mostrar un mapa de visualización con las siguientes Location_Zone: Trámites Totales, Gerencia de Información Catastral, Subgerencia de Información Económica y Subgerencia de Información Física y Jurídica
2. EL Dashboard DEBERÁ construir cada Location_Zone a partir de los valores de RecordStatus del Dataset asociado (Riesgo Bajo, Riesgo Medio, Riesgo Alto)
3. EL Dashboard DEBERÁ mostrar el mapa con título "Mapa de ubicaciones" y subtítulo "Distribución geográfica por intensidad"
4. EL Dashboard DEBERÁ mostrar debajo del área del mapa exactamente 4 cards, una por cada Location_Zone
5. EL Dashboard DEBERÁ mostrar en cada card de Location_Zone únicamente el nombre de la Location_Zone y el total de solicitudes de esa Location_Zone, calculado como la suma de sus tres niveles de RecordStatus
6. EL Dashboard DEBERÁ mostrar una leyenda con tres categorías de color (verde, amarillo, rojo) indicando niveles relativos de riesgo dentro de cada Location_Zone
7. MIENTRAS la integración con ArcGIS Online no esté implementada, EL Dashboard DEBERÁ mostrar un espacio reservado para el mapa geográfico con el texto "Mapa ArcGIS Online" y "Integración pendiente"

### Requerimiento 14: Panel de Resumen de la Screen GIC

**Historia de Usuario:** Como miembro del equipo de gestión, quiero ver un panel de resumen con las cifras totales de riesgo de la dependencia GIC, para poder obtener una vista rápida de los números clave de esa dependencia.

#### Criterios de Aceptación

1. LA Screen "GIC" DEBERÁ mostrar encima de su tabla de Últimos Registros un panel con 4 cards de resumen: Total Solicitudes, Total Riesgo Bajo, Total Riesgo Medio y Total Riesgo Alto
2. LOS 4 valores del panel de resumen de la Screen "GIC" DEBERÁN calcularse contando únicamente los Record cuyo SourceDependency sea "GIC": Total Solicitudes como la cantidad total de esos Record, y Total Riesgo Bajo/Medio/Alto como la cantidad de esos Record en cada RecordStatus, de forma consistente con la tabla de Últimos Registros mostrada debajo
3. EL Dashboard DEBERÁ mostrar cada card de resumen con su valor numérico actualizado
4. EL Dashboard DEBERÁ ubicar el panel de resumen en una posición prominente de la interfaz, encima de la tabla de Últimos Registros
5. CUANDO los datos cambien, EL Dashboard DEBERÁ actualizar los valores del panel de resumen dentro del Refresh_Interval

### Requerimiento 15: Interactividad entre Métricas, KPIs y Diagramas

**Historia de Usuario:** Como miembro del equipo de gestión, quiero que al seleccionar una métrica se actualicen los KPIs y el diagrama de distribución de riesgo relacionados, para poder analizar el desglose de riesgo de cada tipo de solicitud sin cambiar de pantalla.

#### Criterios de Aceptación

1. CUANDO el User seleccione una card de métrica, EL Dashboard DEBERÁ recalcular los 3 KPIs de la sección "Indicadores de Desempeño" utilizando el desglose de riesgo (Riesgo Bajo, Riesgo Medio, Riesgo Alto) del Dataset asociado a la métrica seleccionada
2. LA suma de los valores de los 3 KPIs recalculados DEBERÁ ser igual al valor de la métrica seleccionada
3. CUANDO el User seleccione una card de métrica, EL Dashboard DEBERÁ actualizar el diagrama circular "Distribución por nivel de riesgo" con los mismos valores de riesgo del Dataset seleccionado
4. EL Dashboard DEBERÁ seleccionar el Dataset "total" de forma predeterminada al cargar, mostrando los KPIs y el diagrama circular correspondientes a Trámites Totales

### Requerimiento 16: Fuentes de Datos en Dos Archivos JSON Separados

**Historia de Usuario:** Como desarrollador, quiero que los datos del Dashboard provengan de dos archivos JSON separados (métricas, registros y evolución mensual de trámites; y grupos de trámites con sus umbrales de riesgo), para poder actualizar los datos operativos y las reglas de riesgo de cada trámite de forma independiente sin modificar código.

#### Criterios de Aceptación

1. EL Dashboard DEBERÁ obtener todos los datos crudos desde exactamente dos archivos JSON: el Records_Tramites_File y el Procedure_Groups_File
2. EL Records_Tramites_File DEBERÁ contener la sección `metrics` como un arreglo de 4 objetos, donde cada objeto asocia la clave de un Dataset ("Solicitudes Totales", "Solicitudes Abiertas GIC", "Solicitudes Abiertas SE", "Solicitudes Abiertas SIFJ") con un arreglo de tres números en el orden [riesgoBajo, riesgoMedio, riesgoAlto]. Esas son las claves reales del archivo JSON y no las etiquetas visibles; el Derivation_Service las usa solo como claves de lectura y las mapea al identificador interno (total/gic/se/sifj) y a las etiquetas visibles del Dataset ("Trámites Totales", "Gerencia de Información Catastral", "Subgerencia de Información Económica", "Subgerencia de Información Física y Jurídica")
2.1. EL Derivation_Service DEBERÁ mostrar en la interfaz las etiquetas visibles del Dataset mapeadas ("Trámites Totales", "Gerencia de Información Catastral", "Subgerencia de Información Económica", "Subgerencia de Información Física y Jurídica"), independientemente de las claves de la sección `metrics` del Records_Tramites_File
3. EL Records_Tramites_File DEBERÁ contener la sección `recordCadaMes` con el arreglo `labels` de meses y las series numéricas `total`, `gic`, `se` y `sifj`, cada una con el valor mensual (no acumulado) de solicitudes de ese mes
4. EL Records_Tramites_File DEBERÁ contener la sección `records` como un arreglo de registros, donde cada registro incluye los campos `radicado`, `usuarioEncargado`, `dependencia`, `tipoTramite`, `codigoTramite`, `fechaRadicacion`, `dependenciaOrigen` y `grupo`
5. EL Records_Tramites_File DEBERÁ excluir de cada registro los días asignados y el RecordStatus, dado que ambos son valores calculados
6. EL Procedure_Groups_File DEBERÁ contener un mapa que asocia cada ProcedureCode con un objeto con los campos `DÍAS CALENDARIO`, `BAJO`, `MEDIO`, `ALTO` y `DEPENDENCIA`
7. EL Derivation_Service DEBERÁ calcular el valor de cada Metric como la suma de los tres elementos del arreglo de riesgo del Dataset correspondiente en el Records_Tramites_File
8. EL Derivation_Service DEBERÁ construir el desglose de riesgo por Dataset (`kpisByDataset`) a partir de los arreglos de riesgo del Records_Tramites_File
9. EL Derivation_Service DEBERÁ construir las 4 Location_Zone del mapa a partir del mismo desglose de riesgo por Dataset, asignando riesgoBajo, riesgoMedio y riesgoAlto a los campos `approved`, `pending` y `rejected` respectivamente
10. EL Derivation_Service DEBERÁ calcular el valor Total Solicitudes del panel de resumen a partir del Dataset "Trámites Totales" y los tres totales de riesgo como la suma de los Dataset GIC, SE y SIFJ
11. EL Derivation_Service DEBERÁ asignar a cada Record el valor de AllottedDays consultando su ProcedureCode en el Procedure_Groups_File y leyendo el campo `DÍAS CALENDARIO` de la entrada encontrada
11.1. EL Derivation_Service DEBERÁ asignar a cada Record el valor de Dependencia consultando su ProcedureCode en el Procedure_Groups_File y leyendo el campo `DEPENDENCIA` de la entrada encontrada, en lugar de usar el campo `dependencia` (nombre descriptivo largo, no un código corto) del Records_Tramites_File
11.2. SI el ProcedureCode de un Record no existe en el Procedure_Groups_File, ENTONCES EL Derivation_Service DEBERÁ asignar como Dependencia de ese Record el valor del campo `dependencia` del Records_Tramites_File sin transformar, como mecanismo de respaldo
11.3. EL Derivation_Service DEBERÁ asignar a cada Record el valor de SourceDependency como el campo `dependenciaOrigen` del Records_Tramites_File, sin transformar
11.4. EL Derivation_Service DEBERÁ asignar a cada Record el valor de Group como el campo `grupo` del Records_Tramites_File, sin transformar
12. SI el ProcedureCode de un Record no existe en el Procedure_Groups_File, ENTONCES EL Derivation_Service DEBERÁ asignar 0 días asignados a ese Record
13. EL Derivation_Service DEBERÁ calcular el DaysUntilDue de cada Record como AllottedDays menos el ElapsedDays entre la fechaRadicacion y la fecha actual
14. CUANDO el ElapsedDays de un Record sea menor o igual que el umbral `BAJO` de su ProcedureCode en el Procedure_Groups_File, EL Derivation_Service DEBERÁ asignar el RecordStatus "Riesgo Bajo"
15. CUANDO el ElapsedDays de un Record sea mayor que el umbral `BAJO` y menor o igual que el umbral `MEDIO` de su ProcedureCode, EL Derivation_Service DEBERÁ asignar el RecordStatus "Riesgo Medio"
16. CUANDO el ElapsedDays de un Record sea mayor que el umbral `MEDIO` de su ProcedureCode, EL Derivation_Service DEBERÁ asignar el RecordStatus "Riesgo Alto"
16.1. SI el ProcedureCode de un Record no existe en el Procedure_Groups_File, ENTONCES EL Derivation_Service DEBERÁ asignar el RecordStatus "Riesgo Alto" a ese Record
16.2. SI el ElapsedDays de un Record es negativo (fecha de radicación futura), ENTONCES EL Derivation_Service DEBERÁ asignar el RecordStatus "Riesgo Bajo" a ese Record, sin consultar los umbrales del Procedure_Groups_File
16.3. EL Derivation_Service NO DEBERÁ usar el umbral `ALTO` del Procedure_Groups_File como punto de corte para la clasificación del RecordStatus; ese campo se conserva en el archivo únicamente con fines informativos
17. EL Derivation_Service DEBERÁ construir las series del diagrama de barras "Registros por mes" directamente a partir de los valores mensuales de la sección `recordCadaMes` del Records_Tramites_File
18. EL Dashboard DEBERÁ entregar los datos derivados a los componentes de la interfaz siguiendo el flujo Records_Tramites_File y Procedure_Groups_File hacia el Derivation_Service, luego hacia `api.mock.ts`, luego hacia `api.ts` y finalmente hacia los componentes
19. EL Derivation_Service DEBERÁ calcular en tiempo de lectura todos los valores derivados (totales de Metric, desglose de riesgo por Dataset, Location_Zone, valores del panel de resumen, AllottedDays, DaysUntilDue y RecordStatus) a partir del Records_Tramites_File y el Procedure_Groups_File
20. EL Records_Tramites_File y el Procedure_Groups_File DEBERÁN excluir cualquier valor derivado precalculado

### Requerimiento 17: Definición de Colores y Estilos en CSS

**Historia de Usuario:** Como desarrollador, quiero que los colores y estilos de los gráficos se definan en CSS y no en archivos TypeScript, para poder ajustar la apariencia visual desde una única capa de estilos.

#### Criterios de Aceptación

1. EL Dashboard DEBERÁ definir los colores de los diagramas como Chart_Color_Variable en `src/styles/globals.css`
2. EL Dashboard DEBERÁ definir las siguientes Chart_Color_Variable: `--chart-total`, `--chart-gic`, `--chart-se`, `--chart-sifj`, `--chart-riesgo-bajo`, `--chart-riesgo-medio`, `--chart-riesgo-alto` y `--chart-segment-label`, esta última usada para el texto de los valores dentro de los tramos apilados del diagrama de barras "Cantidad por Riesgo vs Grupo" de la Screen "SIFJ" (tripleta RGB 15, 23, 42)
3. EL Dashboard DEBERÁ declarar el valor de cada Chart_Color_Variable como una tripleta RGB para permitir su uso con niveles de opacidad variables
4. LOS componentes de diagramas DEBERÁN consumir los colores mediante la expresión `rgba(var(--chart-*), alpha)`
5. EL Dashboard DEBERÁ mantener los archivos TypeScript libres de valores literales de color para los diagramas
6. EL Dashboard DEBERÁ definir los colores de los diagramas únicamente en la capa de estilos CSS, sin un módulo TypeScript dedicado a colores de diagramas
7. EL Records_Tramites_File y el Procedure_Groups_File DEBERÁN contener exclusivamente datos de negocio, dejando los colores y cualquier otro atributo de estilo en la capa de estilos CSS

### Requerimiento 18: Orden de Ejecución de Hooks en la Pantalla Principal

**Historia de Usuario:** Como usuario, quiero que el Dashboard cargue sin errores en tiempo de ejecución, para poder consultar la información sin interrupciones.

#### Criterios de Aceptación

1. LA pantalla principal del Dashboard DEBERÁ ejecutar todos sus hooks de React antes de cualquier retorno anticipado por estado de carga, error o ausencia de datos
2. CUANDO el estado de carga, error o ausencia de datos cambie, EL Dashboard DEBERÁ mantener constante el orden y la cantidad de hooks ejecutados en la pantalla principal
3. EL Dashboard DEBERÁ renderizar la pantalla principal sin errores en tiempo de ejecución relacionados con las Rules of Hooks de React

### Requerimiento 19: Pantalla Dedicada a la Dependencia SIFJ

**Historia de Usuario:** Como miembro del equipo de gestión, quiero una pestaña de navegación dedicada a la dependencia SIFJ con sus propios totales y su propia tabla de registros, para poder consultar la actividad de esa dependencia sin los demás elementos del Dashboard general.

#### Criterios de Aceptación

1. EL Sidebar DEBERÁ incluir una Screen adicional con `id: 'sifj'` y etiqueta "SIFJ", junto a la Screen "GIC" existente
2. CUANDO el User seleccione la Screen "SIFJ" en el Sidebar, EL Dashboard DEBERÁ mostrar el contenido de esa Screen en el área de contenido principal, en lugar del contenido de la Screen "GIC"
3. LA Screen "SIFJ" DEBERÁ mostrar únicamente un panel de resumen con 4 cards (Total Solicitudes, Total Riesgo Bajo, Total Riesgo Medio, Total Riesgo Alto) y una tabla de Últimos Registros; NO DEBERÁ mostrar Métricas Principales, Indicadores de Desempeño, diagramas ni el mapa de ubicaciones
4. LOS 4 valores del panel de resumen de la Screen "SIFJ" DEBERÁN calcularse contando únicamente los Record cuyo SourceDependency sea "SIFJ": Total Solicitudes como la cantidad total de esos Record, y Total Riesgo Bajo/Medio/Alto como la cantidad de esos Record en cada RecordStatus
5. LA tabla de Últimos Registros de la Screen "SIFJ" DEBERÁ mostrar únicamente los Record cuyo SourceDependency sea "SIFJ", con las mismas columnas que la tabla de la Screen "GIC", incluyendo Grupo
6. LA tabla de Últimos Registros de la Screen "SIFJ" DEBERÁ proporcionar los mismos filtros que la Screen "GIC" (RecordStatus, usuario encargado, ProcedureType, rango de fechas, Días Restantes), excepto el filtro por Dependencia, que no aplica porque la Screen ya está acotada a SIFJ
7. LA Screen "SIFJ" DEBERÁ mostrar debajo de la tabla de Últimos Registros un diagrama de barras apiladas "Cantidad por Riesgo vs Grupo", con una sola barra por cada Group presente en los Record filtrados de la tabla y tres tramos apilados por RecordStatus (Riesgo Bajo en verde, Riesgo Medio en amarillo, Riesgo Alto en rojo), mostrando dentro de cada tramo el valor numérico (conteo) de ese RecordStatus y omitiendo el número en los tramos con valor 0
8. CUANDO el User aplique cualquier filtro de la tabla de Últimos Registros de la Screen "SIFJ", EL Dashboard DEBERÁ recalcular el diagrama "Cantidad por Riesgo vs Grupo" utilizando el mismo conjunto de Record filtrados que se muestra en la tabla
9. EL Dashboard DEBERÁ mostrar en el eje X del diagrama "Cantidad por Riesgo vs Grupo" etiquetas cortas "G1", "G2", ... "Gn" (una por Group, en orden alfabético de los Group) en lugar del nombre completo, y mostrar debajo de los dos diagramas de barras del área de gráficos una leyenda compartida que relacione cada etiqueta corta con el nombre completo del Group (por ejemplo "G1: CABIDA Y LINDEROS"), usando las mismas etiquetas cortas y el mismo orden en el diagrama hermano "Cantidad de Trámites por Grupo"

## Consideraciones Futuras (Fuera de Alcance)

Las siguientes características están identificadas para fases futuras pero NO están incluidas en los requerimientos actuales:

- **Sistema de Login e Inicio de Sesión**: Autenticación y autorización de usuarios con gestión de permisos y cierre de sesión (no implementado en la versión actual; el encabezado no incluye actualmente un botón de "Cerrar sesión")
- Capacidades de filtrado interactivo avanzado y exploración detallada con drill-down en diagramas y mapa
- Comparación de datos históricos y selección de rango de tiempo personalizado para diagramas de series temporales
- Funcionalidad de exportación de datos a formatos externos (PDF, Excel, CSV)
- Sistema de reportes programados y notificaciones automáticas
- Interactividad en el mapa geográfico (zoom, pan, tooltips detallados, integración real con ArcGIS Online). El mapa actual es un espacio reservado según Requerimiento 13.7
- Visualización del porcentaje de aprobación en las cards de Location_Zone (se retiró por decisión del usuario; las cards muestran solo nombre y total según Requerimiento 13.5)
- Visualización de la marca de tiempo de última actualización en la interfaz (se retiró del encabezado; el dato solo se registra internamente según Requerimiento 8)
- Reemplazo del Records_Tramites_File y el Procedure_Groups_File por endpoints de un backend real, manteniendo el mismo contrato de datos crudos y las mismas reglas de derivación
- Derivación de `recordCadaMes` directamente de las fechas de los `records`: actualmente `recordCadaMes` se declara como una serie precalculada dentro del Records_Tramites_File; una futura iteración podría calcularla en el Derivation_Service a partir de las fechas de radicación de los `records`, eliminando esa sección precalculada
- Uso del umbral `ALTO` del Procedure_Groups_File: actualmente ese campo se lee pero no se usa como punto de corte del RecordStatus (Requerimiento 16.16.3); una futura iteración podría introducir un cuarto nivel de riesgo o un indicador visual adicional cuando el ElapsedDays supere ese umbral


- Diagrama de evolución interactivo por Dataset ("Evolución solicitudes", antiguo chart-1): se retiró por decisión del usuario. Mostraba el valor acumulado mes a mes de cada Dataset y permitía seleccionar cuál serie ver; esa funcionalidad podría reintroducirse en el futuro reutilizando `recordCadaMes` como fuente de datos, igual que hace hoy el diagrama de barras "Registros por mes"
- Pantallas dedicadas para los demás valores de SourceDependency: actualmente solo existen pantallas acotadas para "GERENCIA DE INFORMACION CATASTRAL" (Screen "GIC") y "SUBGERENCIA INFORMACION FISICA JURIDICA" (Screen "SIFJ", Requerimiento 19). Los valores "SUBGERENCIA INFORMACION ECONOMICA", "GERENCIA JURIDICA" y "CONTROL GESTION INTERMEDIA TRAMITES SIFJ" no tienen una Screen dedicada; sus Record solo se ven reflejados en las Métricas Principales, KPIs, diagramas y mapa de la Screen "GIC", que sí consideran todos los Record sin acotar por SourceDependency
- Uso de `summaryData` (`SummaryData`, `getSummaryData()`): tras acotar el panel de resumen de la Screen "GIC" al conteo de Record con SourceDependency "GERENCIA DE INFORMACION CATASTRAL" (Requerimiento 14.2), el campo `summaryData` del `DashboardData` global ya no tiene un consumidor visual en ninguna Screen. Se mantiene en el contrato de datos y en el Derivation_Service por compatibilidad, a la espera de decidir si se retira o se reutiliza para un futuro panel agregado
