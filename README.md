# 🚀 FreelanceFlow Backend

Backend API REST para SaaS B2B de gestión para freelancers. Construido con Node.js, TypeScript, Express y Turso (LibSQL).

## 📋 Características

- ✅ **Arquitectura Modular** por dominio (Feature-based)
- ✅ **TypeScript** estricto con tipado completo
- ✅ **Multi-tenancy** con aislamiento de datos por usuario
- ✅ **Validación** automática con Zod
- ✅ **ORM** ligero y type-safe con Drizzle
- ✅ **Seguridad** con Helmet, CORS y JWT
- ✅ **Error Handling** centralizado
- ✅ **Base de datos** Turso (LibSQL) serverless

## 🏗️ Estructura del Proyecto

```
freelanceFlow-backend/
├── src/
│   ├── config/           # Configuración de DB y schemas
│   │   ├── db.ts
│   │   └── schema.ts
│   ├── middleware/       # Middleware global
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── modules/          # Módulos por dominio
│   │   └── clients/
│   │       ├── clients.controller.ts
│   │       ├── clients.service.ts
│   │       ├── clients.repository.ts
│   │       ├── clients.routes.ts
│   │       └── clients.schema.ts
│   ├── shared/           # Utilidades compartidas
│   │   └── types/
│   │       └── apiResponse.ts
│   ├── app.ts            # Configuración de Express
│   └── server.ts         # Punto de entrada
├── drizzle/
│   └── schema.sql        # Schema SQL inicial
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── .env.example
```

## 🚦 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` y añade tus credenciales de Turso:

```env
NODE_ENV=development
PORT=3000

# Obtén estas credenciales desde turso.tech
TURSO_DATABASE_URL=libsql://tu-base-de-datos.turso.io
TURSO_AUTH_TOKEN=tu-token-de-autenticacion

JWT_SECRET=tu-super-secreto-jwt-cambiar-en-produccion
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
API_VERSION=v1
```

### 3. Configurar Base de Datos en Turso

#### Opción A: Crear base de datos desde Turso CLI

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Crear base de datos
turso db create freelanceflow-db

# Obtener URL de conexión
turso db show freelanceflow-db --url

# Crear token de autenticación
turso db tokens create freelanceflow-db
```

#### Opción B: Usar la interfaz web de Turso

1. Ve a [turso.tech](https://turso.tech)
2. Crea una cuenta y una base de datos
3. Copia la URL y el token de autenticación

### 4. Crear las Tablas

```bash
# Usando Drizzle Kit (recomendado)
npm run db:push

# O manualmente con el SQL del archivo drizzle/schema.sql
```

### 5. Iniciar el Servidor en Modo Desarrollo

```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

## 📚 Endpoints Disponibles

### Health Check

```http
GET /health
```

### API Info

```http
GET /api/v1
```

### Clients (requiere autenticación)

```http
# Listar todos los clientes
GET /api/v1/clients?page=1&pageSize=10&search=nombre&isActive=true

# Crear un cliente
POST /api/v1/clients
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+34 600 123 456",
  "company": "Acme Corp",
  "address": "Calle Principal 123",
  "city": "Madrid",
  "country": "España",
  "taxId": "B12345678",
  "notes": "Cliente VIP"
}

# Obtener un cliente específico
GET /api/v1/clients/:id

# Actualizar un cliente
PUT /api/v1/clients/:id

# Eliminar un cliente
DELETE /api/v1/clients/:id
```

## 🔐 Autenticación

Todas las rutas de `/api/v1/clients` requieren un token JWT válido en el header:

```http
Authorization: Bearer {tu-token-jwt}
```

### Testing sin Auth (solo desarrollo)

Para probar sin implementar auth completo, puedes usar el middleware `mockAuthenticate` temporalmente:

1. Edita `src/modules/clients/clients.routes.ts`
2. Reemplaza `authenticate` por `mockAuthenticate`
3. Añade el header `x-user-id: test-user-id-123` a tus peticiones

## 🛠️ Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run dev

# Compilar TypeScript
npm run build

# Producción
npm start

# Push schema a Turso
npm run db:push

# Drizzle Studio (UI para ver la DB)
npm run db:studio

# Verificar tipos
npm run type-check
```

## 🔒 Multi-tenancy y Seguridad

⚠️ **IMPORTANTE**: Todas las queries incluyen filtrado por `user_id` para garantizar el aislamiento de datos:

```typescript
// ✅ Correcto - Siempre filtrar por userId
.where(and(
  eq(clients.id, clientId),
  eq(clients.userId, userId)  // ← Aislamiento de datos
))

// ❌ Incorrecto - NUNCA hacer queries sin userId
.where(eq(clients.id, clientId))  // ← Riesgo de seguridad
```

## 📦 Próximos Pasos

1. **Implementar módulo de Auth** (registro, login, recuperación de contraseña)
2. **Añadir módulo de Invoices** (facturas)
3. **Añadir módulo de Projects** (proyectos)
4. **Implementar tests** con Jest o Vitest
5. **Añadir documentación** con Swagger/OpenAPI
6. **Configurar CI/CD** para Render

## 🚀 Despliegue en Render

1. Conecta tu repositorio de GitHub
2. Configura las variables de entorno en Render
3. Comando de build: `npm run build`
4. Comando de inicio: `npm start`

## 📄 Licencia

MIT

---

**Desarrollado con ❤️ para Freelancers**
