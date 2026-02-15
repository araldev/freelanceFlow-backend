# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar tu backend FreelanceFlow en Render.com con Turso.

## Prerequisitos

- Cuenta en [Render.com](https://render.com)
- Cuenta en [Turso.tech](https://turso.tech)
- Repositorio de Git (GitHub, GitLab, etc.)

## Paso 1: Configurar Turso para Producción

### 1.1 Crear Base de Datos en Turso

```bash
# Si no tienes Turso CLI instalado
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Crear base de datos de producción
turso db create freelanceflow-production

# Obtener URL de conexión
turso db show freelanceflow-production --url

# Crear token de autenticación
turso db tokens create freelanceflow-production
```

### 1.2 Aplicar el Schema

```bash
# Opción 1: Usando Turso CLI
turso db shell freelanceflow-production < database/schema.sql

# Opción 2: Usando Drizzle (recomendado)
# Actualiza .env con las credenciales de producción y ejecuta:
npm run db:push
```

## Paso 2: Preparar el Repositorio

### 2.1 Asegúrate de tener estos archivos en tu repositorio

```
freelanceFlow-backend/
├── src/
├── package.json
├── tsconfig.json
├── .gitignore      # ← Asegúrate de que incluye .env
└── README.md
```

### 2.2 Verificar que .env está en .gitignore

```bash
# .gitignore debe incluir:
.env
.env.local
.env.production
```

### 2.3 Commit y Push

```bash
git add .
git commit -m "feat: initial backend setup"
git push origin main
```

## Paso 3: Configurar Render

### 3.1 Crear nuevo Web Service

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub/GitLab
4. Selecciona el repositorio `freelanceFlow-backend`

### 3.2 Configuración del Servicio

**General:**

- **Name:** `freelanceflow-backend`
- **Region:** Elige la más cercana a tus usuarios
- **Branch:** `main`
- **Root Directory:** Déjalo vacío (o especifica la carpeta si tu backend está en una subcarpeta)

**Build & Deploy:**

- **Runtime:** `Node`
- **Build Command:**
  ```bash
  npm install && npm run build
  ```
- **Start Command:**
  ```bash
  npm start
  ```

**Plan:**

- Selecciona `Free` para empezar (puedes escalar después)

### 3.3 Configurar Variables de Entorno

En la sección "Environment", añade:

```env
NODE_ENV=production
PORT=3000

# Turso Database
TURSO_DATABASE_URL=<tu-url-de-turso-production>
TURSO_AUTH_TOKEN=<tu-token-de-turso-production>

# JWT
JWT_SECRET=<genera-un-secreto-seguro-aleatorio>
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://tu-frontend.vercel.app

# API
API_VERSION=v1
```

> 💡 **Tip:** Genera un JWT_SECRET seguro con:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3.4 Click en "Create Web Service"

Render comenzará a:

1. Clonar tu repositorio
2. Instalar dependencias
3. Compilar TypeScript
4. Iniciar el servidor

## Paso 4: Verificar el Despliegue

### 4.1 Esperar a que el deploy termine

En el dashboard de Render verás los logs en tiempo real. Espera a ver:

```
✅ Conexión a Turso establecida correctamente
🚀 FreelanceFlow Backend API
📍 Servidor: http://0.0.0.0:3000
✅ Servidor listo para recibir peticiones
```

### 4.2 Obtener la URL de tu API

Render te asignará una URL como:

```
https://freelanceflow-backend.onrender.com
```

### 4.3 Probar el Health Check

```bash
curl https://freelanceflow-backend.onrender.com/health
```

Deberías recibir:

```json
{
  "status": "ok",
  "timestamp": "2024-02-15T10:30:00.000Z",
  "uptime": 45.234,
  "environment": "production"
}
```

### 4.4 Probar un Endpoint

```bash
# Crear un token JWT de prueba (usa el usuario de ejemplo)
# En tu máquina local con el .env apuntando a producción:
tsx scripts/generate-token.ts test-user-id-123 freelancer@example.com

# Usar el token para hacer una petición
curl -X GET https://freelanceflow-backend.onrender.com/api/v1/clients \
  -H "Authorization: Bearer <tu-token-jwt>"
```

## Paso 5: Configuración Avanzada (Opcional)

### 5.1 Custom Domain

1. En Render, ve a "Settings" → "Custom Domain"
2. Añade tu dominio: `api.tudominio.com`
3. Configura los DNS records en tu proveedor de dominios:
   - Type: `CNAME`
   - Name: `api`
   - Value: `freelanceflow-backend.onrender.com`

### 5.2 Health Check Endpoint

Render automáticamente revisa `/health` cada 5 minutos. Tu endpoint ya está configurado en `src/app.ts`.

### 5.3 Auto-Deploy

Por defecto, Render hace auto-deploy cada vez que haces push a la rama `main`. Puedes desactivarlo en Settings si prefieres deploys manuales.

### 5.4 Configurar Alertas

1. Ve a "Settings" → "Notifications"
2. Añade tu email para recibir alertas de:
   - Deploy fallidos
   - Service down
   - High memory usage

## Paso 6: Conectar con el Frontend

### 6.1 Actualizar la URL en el Frontend

En tu aplicación frontend (Vite, Next.js, etc.), actualiza la URL de la API:

```typescript
// .env.production en el frontend
VITE_API_URL=https://freelanceflow-backend.onrender.com/api/v1
```

### 6.2 Actualizar CORS

Si cambias la URL del frontend, actualiza la variable `CORS_ORIGIN` en Render:

```env
CORS_ORIGIN=https://tu-frontend-nuevo.vercel.app
```

## 🐛 Troubleshooting

### Error: "Application failed to respond"

**Causa:** El servidor no está escuchando en el puerto correcto.

**Solución:** Asegúrate de que tu código use `process.env.PORT`:

```typescript
const PORT = process.env.PORT || 3000;
```

### Error: "Build failed"

**Causa:** Error en la compilación de TypeScript.

**Solución:**

1. Revisa los logs en Render
2. Prueba localmente: `npm run build`
3. Asegúrate de que todas las dependencias estén en `dependencies` (no en `devDependencies`)

### Error: "Cannot connect to database"

**Causa:** Credenciales incorrectas de Turso.

**Solución:**

1. Verifica `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`
2. Genera un nuevo token: `turso db tokens create freelanceflow-production`

### El servicio se duerme (Free Plan)

**Causa:** El plan gratuito de Render duerme el servicio después de 15 minutos de inactividad.

**Soluciones:**

1. Upgrade a plan de pago ($7/mes)
2. Usar un servicio de ping (UptimeRobot) para mantenerlo activo
3. Implementar un cron job que haga ping cada 10 minutos

## 📊 Monitoreo

### Logs en Tiempo Real

```bash
# Ver logs desde el dashboard de Render o con Render CLI
render logs -s freelanceflow-backend
```

### Métricas

En el dashboard de Render verás:

- CPU usage
- Memory usage
- Request count
- Response time

### Configurar Sentry (Opcional)

Para monitoreo de errores en producción:

```bash
npm install @sentry/node
```

```typescript
// src/server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 🔒 Mejores Prácticas de Seguridad

- ✅ Usa HTTPS (Render lo proporciona automáticamente)
- ✅ Rota los JWT_SECRET regularmente
- ✅ Usa tokens de Turso con permisos limitados
- ✅ No commitees archivos `.env` al repo
- ✅ Limita CORS a tus dominios específicos
- ✅ Implementa rate limiting (express-rate-limit)
- ✅ Usa Helmet para headers de seguridad (ya incluido)

## 🚀 Escalado

Cuando tu aplicación crezca:

1. **Upgrade del Plan de Render**
   - Standard: $7/mes - 512MB RAM
   - Pro: $25/mes - 2GB RAM
   - Pro Plus: $85/mes - 4GB RAM

2. **Escalar Turso**
   - Plan gratuito: 500MB storage
   - Scaler: $29/mes - 8GB storage
   - Enterprise: Contactar ventas

3. **Añadir CDN** (Cloudflare, etc.)

4. **Redis para Cache** (Render Redis o Upstash)

## 📚 Recursos Adicionales

- [Render Docs](https://render.com/docs)
- [Turso Docs](https://docs.turso.tech)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

¡Felicidades! Tu backend está en producción 🎉
