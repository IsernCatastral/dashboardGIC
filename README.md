# Dashboard Entidad

Dashboard de visualización de inteligencia de negocios en tiempo real construido con React 18, TypeScript, Vite, Tailwind CSS y Recharts.

## 🚀 Características

- **Dashboard en tiempo real** con actualización automática de datos
- **Visualización de métricas y KPIs** con indicadores de tendencia
- **Gráficos interactivos** usando Recharts
- **Tema claro/oscuro** con persistencia de preferencia
- **Arquitectura basada en componentes** con TypeScript
- **Testing completo** con Vitest y React Testing Library
- **Totalmente Dockerizado** para desarrollo y producción

## 📋 Requisitos Previos

- Docker 20.10 o superior
- **NO se requiere Node.js o npm instalado localmente**

## 🐳 Comandos Docker

### Desarrollo Local

```bash
# Paso 1: Construir imagen de desarrollo
docker build -t dashboard-entidad:dev --target development .

# Paso 2: Levantar el contenedor
docker run -it --rm -p 5173:5173 -v $(pwd):/app -v /app/node_modules --name dashboard-entidad-dev dashboard-entidad:dev
```

La aplicación estará disponible en: **http://localhost:5173**

Para detener: presiona `Ctrl+C` en la terminal

### Producción

```bash
# Construir imagen de producción
docker build -t dashboard-entidad:prod --target production .

# Ejecutar contenedor de producción
docker run -d -p 80:80 --name dashboard-entidad-prod dashboard-entidad:prod
```

La aplicación estará disponible en: **http://localhost**

```bash
# Detener y eliminar contenedor
docker stop dashboard-entidad-prod
docker rm dashboard-entidad-prod
```

### Comandos Útiles

#### Ver logs del contenedor

```bash
# Desarrollo
docker logs -f dashboard-entidad-dev

# Producción
docker logs -f dashboard-entidad-prod
```

#### Ejecutar comandos dentro del contenedor

```bash
# Abrir shell
docker exec -it dashboard-entidad-dev sh

# Ejecutar tests
docker exec -it dashboard-entidad-dev npm test

# Ejecutar linter
docker exec -it dashboard-entidad-dev npm run lint

# Ejecutar formatter
docker exec -it dashboard-entidad-dev npm run format
```

#### Limpiar imágenes y contenedores

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes sin usar
docker image prune

# Eliminar todo (usar con precaución)
docker system prune -a
```


## 🏗️ Estructura del Proyecto

```
dashboard-entidad/
├── public/                    # Archivos estáticos
├── src/
│   ├── components/           # Componentes React
│   │   ├── common/          # Componentes comunes (LoadingSpinner, ErrorMessage, etc.)
│   │   ├── layout/          # Componentes de layout (Header, Sidebar, MainLayout)
│   │   ├── metrics/         # Componentes de métricas
│   │   ├── kpis/            # Componentes de KPIs
│   │   ├── charts/          # Componentes de gráficos
│   │   ├── records/         # Componentes de tabla de registros
│   │   ├── map/             # Componentes de mapa geográfico
│   │   └── summary/         # Componentes de panel de resumen
│   ├── contexts/            # React Context providers
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Servicios de API y datos
│   ├── types/               # Definiciones de tipos TypeScript
│   ├── utils/               # Funciones utilitarias
│   ├── screens/             # Componentes de pantalla principal
│   ├── styles/              # Estilos globales
│   ├── tests/               # Configuración de tests
│   ├── App.tsx              # Componente raíz
│   └── main.tsx             # Punto de entrada
├── Dockerfile               # Multi-stage Dockerfile
├── docker-compose.yml       # Configuración Docker Compose (opcional)
├── nginx.conf               # Configuración Nginx para producción
├── .dockerignore            # Archivos ignorados por Docker
├── vite.config.ts           # Configuración Vite
├── vitest.config.ts         # Configuración Vitest
├── tailwind.config.js       # Configuración Tailwind CSS
├── tsconfig.json            # Configuración TypeScript
├── .eslintrc.json           # Configuración ESLint
├── .prettierrc              # Configuración Prettier
└── package.json             # Dependencias y scripts
```

## 🔧 Variables de Entorno

Copiar `.env.example` a `.env` y configurar las variables:

```bash
cp .env.example .env
```

Variables disponibles:

- `VITE_API_BASE_URL`: URL base de la API backend (default: `http://localhost:3000`)
- `VITE_USE_MOCK_DATA`: Usar datos simulados en lugar de API real (default: `true`)
- `VITE_REFRESH_INTERVAL`: Intervalo de actualización en ms (default: `30000`)
- `VITE_REQUEST_TIMEOUT`: Timeout de peticiones en ms (default: `5000`)
- `VITE_MAX_RETRY_ATTEMPTS`: Intentos máximos de reintento (default: `3`)

**Modo de Desarrollo**: Por defecto, la aplicación usa datos simulados (`VITE_USE_MOCK_DATA=true`) para permitir desarrollo sin un backend funcionando. Para conectar a una API real, establece `VITE_USE_MOCK_DATA=false`.


## 🧪 Testing

### Ejecutar tests dentro del contenedor

```bash
# Tests unitarios
docker exec -it dashboard-entidad-dev npm test

# Tests con UI interactiva
docker exec -it dashboard-entidad-dev npm run test:ui

# Tests con cobertura
docker exec -it dashboard-entidad-dev npm run test:coverage
```

### Estrategia de Testing

El proyecto implementa dos tipos de testing:

1. **Unit Tests**: Prueban componentes y funciones individuales
2. **Property-Based Tests**: Verifican propiedades universales con fast-check

Cobertura mínima requerida: **80%**

## 📦 Tecnologías

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos utility-first
- **Recharts** - Biblioteca de gráficos
- **Vitest** - Framework de testing
- **React Testing Library** - Testing de componentes
- **fast-check** - Property-based testing
- **date-fns** - Utilidades de fecha
- **ESLint** - Linter
- **Prettier** - Code formatter
- **Docker** - Containerización
- **Nginx** - Servidor web para producción

## 📝 Scripts NPM (dentro del contenedor)

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Previsualizar build de producción
npm run lint         # Ejecutar linter
npm run format       # Formatear código con Prettier
npm run format:check # Verificar formato sin modificar
npm test             # Ejecutar tests
npm run test:ui      # Tests con UI interactiva
npm run test:coverage # Tests con reporte de cobertura
```

## 🎨 Temas

El dashboard soporta tema claro y oscuro:

- **Tema oscuro** (por defecto): Paleta azul oscuro (#1e3a8a)
- **Tema claro**: Paleta azul claro (#3b82f6)
- La preferencia se persiste en `localStorage`


## 🚢 Deployment

### Producción

Para producción, construir la imagen y desplegar en cualquier plataforma que soporte Docker:

```bash
docker build -t dashboard-entidad:prod --target production .
docker run -d -p 80:80 dashboard-entidad:prod
```

## 📖 Arquitectura

### Gestión de Estado

- **ThemeContext**: Manejo de tema claro/oscuro
- **DataContext**: Gestión de datos del dashboard con polling automático
- **NavigationContext**: Gestión de navegación entre pantallas

### Flujo de Datos

1. La aplicación carga y obtiene datos iniciales del backend
2. Los datos se actualizan automáticamente cada 30 segundos (configurable)
3. Los componentes se suscriben a los contextos para recibir actualizaciones
4. Los errores se manejan en múltiples capas con reintentos automáticos

## 🤝 Contribución

1. Seguir metodología TDD (Test-Driven Development)
2. Escribir tests antes de implementar funcionalidad
3. Mantener cobertura >= 80%
4. Seguir principios Clean Code y SOLID
5. Usar TypeScript strict mode (sin `any`)
6. Formatear código con Prettier antes de commit
7. Verificar que ESLint pasa sin warnings

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Desarrollado por el equipo de Dashboard Entidad.

---

**Nota**: Todos los comandos deben ejecutarse con Docker. No se requiere instalación local de Node.js.
