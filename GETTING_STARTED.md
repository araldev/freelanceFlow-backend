# 🎯 Guía de Inicio Rápido

## ✅ Resumen de lo Creado

Se ha generado una estructura completa de backend con:

### 📁 Estructura del Proyecto

- ✅ Arquitectura modular por dominio (Feature-based)
- ✅ TypeScript configurado con strictMode
- ✅ Express + CORS + Helmet + Error Handling
- ✅ Drizzle ORM con Turso (LibSQL)
- ✅ Middleware de autenticación y validación
- ✅ Módulo completo de Clients implementado

### 📦 Archivos Principales

```
freelanceFlow-backend/
├── src/
│   ├── config/
│   │   ├── db.ts              # Conexión a Turso
│   │   └── schema.ts          # Schema de DB con Drizzle
│   ├── middleware/
│   │   ├── auth.ts            # Autenticación JWT
│   │   ├── errorHandler.ts   # Manejo global de errores
│   │   └── validation.ts     # Validación con Zod
│   ├── modules/
│   │   └── clients/           # Módulo completo: controller, service, repository
│   ├── shared/
│   │   └── types/             # Tipos compartidos
│   ├── app.ts                 # Configuración Express
│   └── server.ts              # Punto de entrada
├── drizzle/
│   └── schema.sql             # SQL para crear tablas
├── docs/
│   ├── crear-modulos.md       # Guía para crear nuevos módulos
│   └── despliegue-render.md  # Guía de despliegue
├── scripts/
│   └── generate-token.ts      # Script para generar JWT
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🚀 Pasos para Levantar el Servidor

### 1️⃣ Instalar Dependencias

```bash
cd /home/arturo/workspace/freelanceFlow-backend
npm install
```

### 2️⃣ Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales
nano .env  # o usa tu editor favorito
```

Tu archivo `.env` debe tener:

```env
NODE_ENV=development
PORT=3000

# Credenciales de Turso (obtenerlas de turso.tech)
TURSO_DATABASE_URL=libsql://tu-database.turso.io
TURSO_AUTH_TOKEN=tu-token-aqui

JWT_SECRET=tu-super-secreto-cambiar
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
API_VERSION=v1
```

### 3️⃣ Configurar Turso

**Opción A: Usar Turso CLI (Recomendado)**

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Crear base de datos
turso db create freelanceflow-dev

# Obtener URL
turso db show freelanceflow-dev --url
# Copiar esta URL a TURSO_DATABASE_URL

# Crear token
turso db tokens create freelanceflow-dev
# Copiar este token a TURSO_AUTH_TOKEN
```

**Opción B: Usar Turso Web Dashboard**

1. Ve a [turso.tech](https://turso.tech)
2. Regístrate/inicia sesión
3. Crea una nueva base de datos
4. Copia la URL y el token a tu `.env`

### 4️⃣ Crear las Tablas

```bash
# Opción 1: Push automático con Drizzle (Recomendado)
npm run db:push

# Opción 2: Ejecutar SQL manualmente
turso db shell freelanceflow-dev < drizzle/schema.sql
```

### 5️⃣ Iniciar el Servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev
```

Deberías ver:

```
✅ Conexión a Turso establecida correctamente
╔═══════════════════════════════════════════════╗
║     🚀 FreelanceFlow Backend API              ║
╚═══════════════════════════════════════════════╝

📍 Servidor:     http://localhost:3000
🌍 Entorno:      development
📚 API Docs:     http://localhost:3000/api/v1
💚 Health Check: http://localhost:3000/health

✅ Servidor listo para recibir peticiones
```

## 🧪 Probar la API

### Opción 1: Usar REST Client (VSCode Extension)

1. Instala la extensión "REST Client" en VSCode
2. Abre el archivo `api-examples.http`
3. Click en "Send Request" sobre cualquier petición

### Opción 2: Usar cURL

```bash
# Health check
curl http://localhost:3000/health

# Listar clientes (requiere autenticación)
# Primero genera un token:
npm run tsx scripts/generate-token.ts

# Luego usa el token:
curl -X GET http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer TU-TOKEN-AQUI"
```

### Opción 3: Testing sin Auth (Solo Desarrollo)

Para hacer testing rápido sin implementar auth:

1. Edita `src/modules/clients/clients.routes.ts`
2. Reemplaza `authenticate` por `mockAuthenticate`
3. Haz peticiones con el header `x-user-id`:

```bash
curl -X GET http://localhost:3000/api/v1/clients \
  -H "x-user-id: test-user-id-123"
```

### Opción 4: Usar Postman

1. Importa la colección desde `api-examples.http`
2. Configura las variables de entorno
3. Ejecuta las peticiones

## 📝 Crear un Cliente de Ejemplo

```bash
curl -X POST http://localhost:3000/api/v1/clients \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-id-123" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+34 600 123 456",
    "company": "Acme Corp",
    "city": "Madrid",
    "country": "España"
  }'
```

## 🔧 Herramientas Útiles

### Drizzle Studio (UI para ver la DB)

```bash
npm run db:studio
```

Abre `https://local.drizzle.studio` en tu navegador.

### Generar Token JWT

```bash
tsx scripts/generate-token.ts [userId] [email]

# Ejemplo:
tsx scripts/generate-token.ts test-user-id-123 user@example.com
```

### Verificar Tipos TypeScript

```bash
npm run type-check
```

### Build para Producción

```bash
npm run build
npm start
```

## 📚 Próximos Pasos

### 1. Implementar Módulo de Auth

Crea registro y login de usuarios. Revisa la guía en `docs/crear-modulos.md`.

### 2. Añadir Más Módulos

- **Invoices**: Facturas para los clientes
- **Projects**: Proyectos relacionados con clientes
- **Expenses**: Gastos del freelancer

### 3. Testing

Añade tests con Jest o Vitest:

```bash
npm install -D vitest @vitest/ui
```

### 4. Documentación de API

Implementa Swagger/OpenAPI:

```bash
npm install swagger-ui-express swagger-jsdoc
```

### 5. Deploy

Revisa la guía completa en `docs/despliegue-render.md`.

## 🆘 Problemas Comunes

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Cannot connect to Turso"

Verifica que:

- ✅ `TURSO_DATABASE_URL` esté correcta (debe empezar con `libsql://`)
- ✅ `TURSO_AUTH_TOKEN` sea válido
- ✅ Tengas conexión a internet

### Error: "Port 3000 already in use"

```bash
# Cambiar el puerto en .env
PORT=3001

# O matar el proceso que usa el puerto 3000
lsof -ti:3000 | xargs kill -9
```

### Errores de TypeScript

```bash
# Verificar que tsconfig.json esté correcto
npm run type-check

# Compilar manualmente
npm run build
```

## 📖 Documentación Adicional

- **Crear Módulos**: `docs/crear-modulos.md`
- **Despliegue**: `docs/despliegue-render.md`
- **README Principal**: `README.md`
- **Drizzle ORM**: https://orm.drizzle.team
- **Turso Docs**: https://docs.turso.tech

## 🎉 ¡Listo!

Tu backend está configurado y listo para recibir peticiones.

**Estructura actual:**

- ✅ Express configurado con seguridad (Helmet, CORS)
- ✅ Base de datos Turso conectada
- ✅ Módulo de Clients completo (CRUD)
- ✅ Multi-tenancy implementado
- ✅ Validación con Zod
- ✅ Error handling centralizado
- ✅ TypeScript estricto

**Siguiente paso:** Implementa el módulo de autenticación o añade más módulos siguiendo el patrón establecido.

---

**¿Necesitas ayuda?** Revisa la documentación o crea un issue en el repositorio.
