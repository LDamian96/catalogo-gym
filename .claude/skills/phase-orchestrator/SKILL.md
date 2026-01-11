---
name: phase-orchestrator
description: Orquestador principal del proyecto Catálogo Digital. Coordina las 14 fases de desarrollo, delega a los skills especializados (db-architect, backend-dev, frontend-dev, api-sync) y asegura consistencia entre backend y frontend.
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task
---

# Phase Orchestrator - Catálogo Digital

Soy el orquestador principal del proyecto. Mi trabajo es coordinar el desarrollo por fases, delegando a los skills especializados y asegurando que todo esté sincronizado.

## Mis Responsabilidades

1. **Coordinar las 14 fases de desarrollo**
2. **Delegar tareas a skills especializados**
3. **Verificar consistencia entre backend y frontend**
4. **Asegurar que no haya errores de integración**
5. **Mantener el progreso del proyecto**

---

## Skills Bajo Mi Coordinación

| Skill | Responsabilidad | Cuándo Invocar |
|-------|-----------------|----------------|
| `db-architect` | Schema Prisma, tablas, campos | Antes de cualquier cambio de DB |
| `backend-dev` | NestJS, endpoints, DTOs | Fases Backend (1,3,5,7,9,12) |
| `frontend-dev` | Next.js, componentes, API client | Fases Frontend (2,4,6,8,10,11) |
| `api-sync` | Verificar consistencia | Después de cada fase |

---

## Las 14 Fases de Desarrollo

### FASE 1: Setup + Auth (Backend)
**Status**: ⬜ Pendiente

**Tareas**:
1. Configurar proyecto NestJS
2. Configurar Prisma + PostgreSQL
3. Configurar Redis
4. Crear módulo Auth (login, refresh, me, logout)
5. Implementar JWT con refresh tokens
6. Crear Guards de autenticación

**Archivos a crear**:
```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   └── configuration.ts
│   ├── common/
│   │   ├── guards/jwt.guard.ts
│   │   ├── pipes/zod-validation.pipe.ts
│   │   └── interceptors/transform.interceptor.ts
│   └── modules/
│       └── auth/
│           ├── auth.module.ts
│           ├── auth.controller.ts
│           ├── auth.service.ts
│           ├── dto/login.dto.ts
│           └── strategies/jwt.strategy.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

**Verificación**: Invocar `api-sync` para verificar endpoints auth.

---

### FASE 2: Auth + Layout (Frontend)
**Status**: ⬜ Pendiente

**Tareas**:
1. Configurar proyecto Next.js
2. Configurar Tailwind + shadcn/ui
3. Configurar Framer Motion
4. Crear página de login
5. Implementar AuthProvider
6. Crear layout del admin

**Archivos a crear**:
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── (auth)/login/page.tsx
│   │   └── (admin)/layout.tsx
│   ├── components/
│   │   ├── ui/ (shadcn)
│   │   └── auth/LoginForm.tsx
│   ├── lib/
│   │   ├── api/client.ts
│   │   └── api/auth.ts
│   ├── hooks/useAuth.ts
│   └── providers/AuthProvider.tsx
└── package.json
```

**Verificación**: Login funciona con backend auth.

---

### FASE 3: Settings + Categories + SEO (Backend)
**Status**: ⬜ Pendiente

**Tareas**:
1. Crear módulo Settings (CRUD + campos SEO + Ads)
2. Crear módulo Categories (CRUD + campos SEO)
3. Implementar upload de imágenes a Cloudinary (logo + ogImage)
4. Configurar caché Redis
5. Crear módulo TrackingPixels (CRUD píxeles adicionales)

**Endpoints a crear**:
- GET/PATCH /settings (incluye seoTitle, seoDescription, seoKeywords, ogImage, googleAnalyticsId, facebookPixelId, etc.)
- POST /settings/logo
- POST /settings/og-image
- GET/POST /categories (incluye seoTitle, seoDescription, seoKeywords)
- PATCH/DELETE /categories/:id
- POST /categories/:id/image
- PATCH /categories/reorder
- GET/POST /tracking-pixels
- PATCH/DELETE /tracking-pixels/:id

---

### FASE 4: Settings + Categories + SEO (Frontend)
**Status**: ⬜ Pendiente

**Tareas**:
1. Página de configuración del negocio (con sección SEO)
2. Formulario de settings con campos SEO (seoTitle, seoDescription, seoKeywords, ogImage)
3. Sección de píxeles de Ads (Google Analytics, FB Pixel, TikTok)
4. Página de categorías con campos SEO
5. Drag & drop para reordenar
6. Upload de imágenes (logo + ogImage)

---

### FASE 5: Products + SEO (Backend)
**Status**: ⬜ Pendiente

**Tareas**:
1. Crear módulo Products (CRUD completo + campos SEO)
2. Implementar paginación
3. Implementar búsqueda
4. Upload múltiple de imágenes
5. Duplicar producto
6. Incluir seoTitle, seoDescription, seoKeywords en DTOs

**Endpoints a crear**:
- GET/POST /products
- GET/PATCH/DELETE /products/:id
- POST /products/:id/duplicate
- POST /products/:id/images
- DELETE /products/:id/images/:imageId
- PATCH /products/:id/images/reorder

---

### FASE 6: Products (Frontend)
**Status**: ⬜ Pendiente

**Tareas**:
1. Lista de productos con paginación
2. Formulario de producto completo
3. Galería de imágenes con reordenamiento
4. Filtros y búsqueda
5. Estados de carga animados

---

### FASE 7: Variants (Backend)
**Status**: ⬜ Pendiente

**Tareas**:
1. Crear endpoints de VariantGroups
2. Crear endpoints de VariantOptions
3. Upload de imagen para opciones

**Endpoints a crear**:
- POST /products/:id/variant-groups
- PATCH/DELETE /variant-groups/:id
- PATCH /variant-groups/reorder
- POST /variant-groups/:id/options
- PATCH/DELETE /variant-options/:id
- POST /variant-options/:id/image
- PATCH /variant-options/reorder

---

### FASE 8: Variants (Frontend)
**Status**: ⬜ Pendiente

**Tareas**:
1. UI de grupos de variantes en formulario producto
2. Selector de tipo de display (botones, dropdown, imágenes)
3. Agregar/editar/eliminar opciones
4. Preview de cómo se verá

---

### FASE 9: Catalog Público (Backend)
**Status**: ⬜ Pendiente

**Tareas**:
1. Crear módulo Catalog (público, sin auth)
2. Endpoints optimizados para SSG/ISR
3. Tracking de eventos

**Endpoints a crear**:
- GET /catalog
- GET /catalog/products/:slug
- GET /catalog/categories/:slug
- GET /catalog/search
- POST /catalog/track

---

### FASE 10: Catalog Público + SEO Completo (Frontend)
**Status**: ⬜ Pendiente

**Tareas**:
1. Landing page del catálogo con SEO
2. Lista de productos por categoría
3. Página de detalle de producto
4. Selector de variantes interactivo
5. Buscador
6. Animaciones de transición
7. **SEO: Meta tags dinámicos (Next.js Metadata API)**
8. **SEO: Open Graph tags para compartir**
9. **SEO: JSON-LD Structured Data (Product, Organization, BreadcrumbList)**
10. **SEO: Sitemap dinámico (/sitemap.xml)**
11. **SEO: Robots.txt (/robots.txt)**
12. **ADS: TrackingProvider (GA4, FB Pixel, TikTok)**
13. **ADS: useTracking hook para eventos**

---

### FASE 11: Cart + WhatsApp (Frontend)
**Status**: ⬜ Pendiente

**Tareas**:
1. Carrito de compras (opcional por settings)
2. Persistencia en localStorage
3. Generador de mensaje WhatsApp
4. Botón flotante de WhatsApp
5. Animaciones del carrito

---

### FASE 12: Stats + QR (Full Stack)
**Status**: ⬜ Pendiente

**Backend**:
- GET /stats/dashboard
- GET /stats/products/:id
- Procesamiento async con Bull

**Frontend**:
- Dashboard de estadísticas
- Gráficos con recharts
- Generador de QR
- Compartir link

---

### FASE 13: Import/Export + Polish
**Status**: ⬜ Pendiente

**Backend - Import**:
- POST /import/excel
- GET /import/status/:jobId
- GET /import/template
- Procesamiento con Bull queues

**Backend - Export**:
- GET /export/products (con filtros: categoryId, isActive, format)
- GET /export/categories
- GET /export/template
- GET /export/stats (con filtros: startDate, endDate, type)

**Frontend**:
- UI de importación con drag & drop
- UI de exportación con filtros
- Progreso en tiempo real
- Descarga de archivos Excel
- Manejo de errores
- Polish general

---

### FASE 14: Deploy
**Status**: ⬜ Pendiente

**Tareas**:
1. Docker Compose producción
2. Configurar Nginx
3. Variables de entorno producción
4. SSL/HTTPS
5. Documentación de deploy

---

## Protocolo de Desarrollo

### Antes de Cada Fase:

1. **Consultar db-architect**
   ```
   ¿El schema tiene todos los campos necesarios para esta fase?
   ```

2. **Si es fase Backend, invocar backend-dev**
   ```
   Implementar los endpoints de la fase X siguiendo ENDPOINTS.md
   ```

3. **Si es fase Frontend, invocar frontend-dev**
   ```
   Implementar las páginas de la fase X siguiendo API-CLIENT.md
   ```

4. **Al terminar, invocar api-sync**
   ```
   Verificar consistencia entre backend y frontend para fase X
   ```

---

## Comandos de Verificación

### Verificar Estado del Proyecto
```bash
# Backend funcionando
curl http://localhost:3001/health

# Frontend funcionando
curl http://localhost:3000

# Base de datos
docker-compose exec backend npx prisma studio

# Redis
docker-compose exec redis redis-cli ping
```

### Verificar Migraciones
```bash
# Ver estado de migraciones
docker-compose exec backend npx prisma migrate status

# Crear migración
docker-compose exec backend npx prisma migrate dev --name <nombre>
```

### Verificar Tipos
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run type-check
```

---

## Reporte de Progreso

Al finalizar cada fase, genero un reporte:

```
═══════════════════════════════════════════════════
            FASE X COMPLETADA
═══════════════════════════════════════════════════

✅ Tareas completadas:
   - [Lista de tareas]

📁 Archivos creados:
   - [Lista de archivos]

🔗 Endpoints implementados:
   - [Lista de endpoints]

⚠️ Pendientes/Notas:
   - [Si hay algo pendiente]

📊 Verificación api-sync:
   - Endpoints: ✅
   - DTOs/Types: ✅
   - Campos: ✅

═══════════════════════════════════════════════════
            PRÓXIMA: FASE X+1
═══════════════════════════════════════════════════
```

---

## Documentación de Referencia

| Documento | Ubicación | Contenido |
|-----------|-----------|-----------|
| Arquitectura | `docs/01-ARQUITECTURA-GENERAL.md` | Stack, SOLID, patrones |
| Schema DB | `docs/02-DATABASE-SCHEMA.md` | Prisma schema completo |
| Backend | `docs/03-BACKEND-STRUCTURE.md` | Estructura NestJS |
| Frontend | `docs/04-FRONTEND-STRUCTURE.md` | Estructura Next.js |
| Endpoints | `docs/05-API-ENDPOINTS.md` | API completa |
| Docker | `docs/06-DOCKER-CONFIG.md` | Configuración Docker |
| Seguridad | `docs/07-SECURITY.md` | OWASP implementación |
| Fases | `docs/08-DEVELOPMENT-PHASES.md` | Detalle de fases |
| **SEO & Ads** | `docs/09-SEO-ADS.md` | SEO, Meta tags, Píxeles, Tracking |

---

## Reglas de Oro

### 1. NUNCA inventar campos
```
❌ Agregar campo que no está en schema
✅ Consultar db-architect primero
```

### 2. NUNCA cambiar rutas sin sincronizar
```
❌ Cambiar /products por /product en backend
✅ Mantener rutas idénticas backend ↔ frontend
```

### 3. SIEMPRE verificar nullabilidad
```
❌ Frontend: price: number
   Backend: price: number | null
✅ Ambos: price: number | null
```

### 4. SIEMPRE completar fase antes de avanzar
```
❌ Empezar fase 4 sin terminar fase 3
✅ Verificar con api-sync antes de avanzar
```

### 5. SIEMPRE mantener consistencia
```
❌ DTO con 5 campos, Type con 4 campos
✅ Mismos campos en ambos lados
```
