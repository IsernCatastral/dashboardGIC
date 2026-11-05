# Guía Rápida de Docker - Dashboard Entidad

## 🚀 Inicio Rápido

### Levantar el proyecto en modo desarrollo

```bash
# Paso 1: Construir la imagen de desarrollo
docker build -t dashboard-entidad:dev --target development .

# Paso 2: Levantar el contenedor
docker run -it --rm -p 5173:5173 -v $(pwd):/app -v /app/node_modules --name dashboard-entidad-dev dashboard-entidad:dev
```

La aplicación estará disponible en: **http://localhost:5173**

Para detener el contenedor: presiona `Ctrl+C` en la terminal

## 🏭 Producción

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

## 🔧 Comandos de Desarrollo

### Ejecutar comandos NPM dentro del contenedor

```bash
# Tests
docker exec -it dashboard-entidad-dev npm test

# Linter
docker exec -it dashboard-entidad-dev npm run lint

# Formatter
docker exec -it dashboard-entidad-dev npm run format

# Build
docker exec -it dashboard-entidad-dev npm run build
```

