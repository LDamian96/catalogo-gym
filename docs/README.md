# Catálogo Digital - Documentación del Proyecto

## Descripción

Sistema de catálogo digital con QR y pedidos por WhatsApp para negocios. Permite crear un catálogo de productos con variantes, compartirlo mediante QR o link, y recibir pedidos directamente en WhatsApp.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Backend** | NestJS + TypeScript |
| **Frontend** | Next.js (App Router) + TypeScript |
| **Base de datos** | PostgreSQL |
| **Cache/Queues** | Redis + Bull |
| **ORM** | Prisma |
| **Estilos** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **Animaciones** | Framer Motion |
| **Validación** | Zod + React Hook Form |
| **Imágenes** | Cloudinary |
| **Contenedores** | Docker + Docker Compose |

---

## Documentación

| Archivo | Contenido |
|---------|-----------|
| [01-ARQUITECTURA-GENERAL.md](./01-ARQUITECTURA-GENERAL.md) | Arquitectura, SOLID, patrones de diseño, flujo de requests, estrategia de caché |
| [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md) | Modelo de datos completo, Prisma schema, índices, queries optimizadas |
| [03-BACKEND-STRUCTURE.md](./03-BACKEND-STRUCTURE.md) | Estructura de carpetas backend, módulos, configuración NestJS |
| [04-FRONTEND-STRUCTURE.md](./04-FRONTEND-STRUCTURE.md) | Estructura de carpetas frontend, SSG/SSR/ISR, componentes, stores |
| [05-API-ENDPOINTS.md](./05-API-ENDPOINTS.md) | Documentación completa de todos los endpoints con request/response |
| [06-DOCKER-CONFIG.md](./06-DOCKER-CONFIG.md) | Docker Compose, Dockerfiles, Nginx, comandos |
| [07-SECURITY.md](./07-SECURITY.md) | Implementación OWASP Top 10, checklist de seguridad |
| [08-DEVELOPMENT-PHASES.md](./08-DEVELOPMENT-PHASES.md) | Plan de desarrollo por fases (Backend ↔ Frontend) |

---

## Estructura del Proyecto

```
catalogo-digital/
├── docs/                    # Documentación (estás aquí)
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/        # Módulos por feature
│   │   ├── common/         # Guards, pipes, decorators
│   │   ├── config/         # Configuración
│   │   └── ...
│   ├── prisma/
│   └── Dockerfile
├── frontend/                # Next.js App
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Componentes React
│   │   ├── lib/           # Utilidades
│   │   └── ...
│   └── Dockerfile
├── nginx/                   # Reverse proxy (producción)
├── docker-compose.yml       # Desarrollo
└── docker-compose.prod.yml  # Producción
```

---

## Inicio Rápido

### Requisitos
- Docker + Docker Compose
- Node.js (para desarrollo local sin Docker)
- Cuenta en Cloudinary (para imágenes)

### Desarrollo con Docker

```bash
# 1. Clonar repositorio
git clone <repo>
cd catalogo-digital

# 2. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 3. Iniciar servicios
docker-compose up -d

# 4. Ejecutar migraciones
docker-compose exec backend npx prisma migrate dev

# 5. Acceder
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
# API Docs: http://localhost:3001/docs
```

### Desarrollo Local (sin Docker)

```bash
# Terminal 1: Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

---

## Funcionalidades Principales

### Panel Admin
- Login con JWT
- Configuración del negocio (nombre, logo, WhatsApp, moneda)
- CRUD de categorías con imágenes
- CRUD de productos con galería de imágenes
- Sistema de variantes (talla, color, etc.) con imágenes
- Generador de QR y links
- Dashboard de estadísticas
- Importación desde Excel

### Catálogo Público
- Vista responsive del catálogo
- Búsqueda de productos
- Filtro por categorías
- Selector de variantes interactivo
- Carrito de compras (opcional)
- Envío de pedido por WhatsApp

---

## Modelo de Datos Simplificado

```
Settings (1)        → Configuración del negocio
User (N)            → Usuarios admin
Category (N)        → Categorías de productos
Product (N)         → Productos
├── ProductImage    → Imágenes del producto (1-4)
├── VariantGroup    → Grupos de variantes (talla, color)
│   └── VariantOption → Opciones (S, M, L, Rojo, Azul)
└── ProductStat     → Estadísticas de visitas
```

---

## API Endpoints Principales

```
AUTH
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me

SETTINGS
GET    /api/v1/settings
PATCH  /api/v1/settings

CATEGORIES
GET    /api/v1/categories
POST   /api/v1/categories
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id

PRODUCTS
GET    /api/v1/products
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
POST   /api/v1/products/:id/images

VARIANTS
POST   /api/v1/products/:id/variant-groups
POST   /api/v1/variant-groups/:id/options

CATALOG (Público)
GET    /api/v1/catalog
GET    /api/v1/catalog/products/:slug
GET    /api/v1/catalog/search

STATS
GET    /api/v1/stats/dashboard
```

Ver documentación completa en [05-API-ENDPOINTS.md](./05-API-ENDPOINTS.md)

---

## Fases de Desarrollo

El desarrollo sigue un enfoque iterativo alternando Backend y Frontend:

1. **Fase 1-2**: Auth (Backend) → Auth + Layout (Frontend)
2. **Fase 3-4**: Settings + Categories (Backend) → (Frontend)
3. **Fase 5-6**: Products (Backend) → (Frontend)
4. **Fase 7-8**: Variants (Backend) → (Frontend)
5. **Fase 9-10**: Catalog público (Backend) → (Frontend)
6. **Fase 11**: Cart + WhatsApp (Frontend)
7. **Fase 12**: Stats + QR (Full Stack)
8. **Fase 13**: Import + Polish
9. **Fase 14**: Deploy

Ver detalle completo en [08-DEVELOPMENT-PHASES.md](./08-DEVELOPMENT-PHASES.md)

---

## Seguridad

El proyecto implementa protecciones OWASP Top 10:

- JWT con refresh tokens
- Rate limiting
- Validación con Zod (frontend + backend)
- Prepared statements (Prisma)
- Headers de seguridad (Helmet)
- CORS configurado
- Password hashing (bcrypt)

Ver implementación en [07-SECURITY.md](./07-SECURITY.md)

---

## Próximos Pasos

1. Revisar la documentación completa
2. Configurar variables de entorno
3. Iniciar con Fase 1 (Setup + Auth Backend)
4. Seguir el plan de desarrollo por fases
