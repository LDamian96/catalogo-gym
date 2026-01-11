# Development Phases - Plan de Desarrollo

## Metodología

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DESARROLLO ITERATIVO                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   FASE 1        FASE 2        FASE 3        FASE 4        FASE 5       │
│  ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐      │
│  │BACK 1│ ──▶  │FRONT1│ ──▶  │BACK 2│ ──▶  │FRONT2│ ──▶  │BACK 3│ ... │
│  └──────┘      └──────┘      └──────┘      └──────┘      └──────┘      │
│                                                                         │
│  Cada fase entrega funcionalidad completa y probada                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## FASE 1: Setup + Auth (Backend)

### Objetivo
Configurar proyecto backend con autenticación funcional.

### Tareas

```
□ 1.1 Setup del proyecto
    ├── Crear proyecto NestJS
    ├── Configurar TypeScript strict mode
    ├── Configurar ESLint + Prettier
    ├── Estructura de carpetas (ver 03-BACKEND-STRUCTURE.md)
    └── Configurar .env y variables

□ 1.2 Docker desarrollo
    ├── docker-compose.yml con PostgreSQL + Redis
    ├── Dockerfile backend (development)
    ├── Verificar conexiones
    └── Scripts de inicio

□ 1.3 Base de datos
    ├── Configurar Prisma
    ├── Crear schema inicial (User, Settings)
    ├── Primera migración
    ├── Seed de usuario admin
    └── Prisma Studio funcionando

□ 1.4 Módulo Auth
    ├── POST /api/v1/auth/login
    ├── POST /api/v1/auth/refresh
    ├── POST /api/v1/auth/logout
    ├── GET /api/v1/auth/me
    ├── JWT Strategy
    ├── Refresh Token Strategy
    ├── Guards (JwtAuthGuard)
    └── Tests unitarios

□ 1.5 Configuración global
    ├── Exception filters
    ├── Transform interceptor (response format)
    ├── Logging interceptor
    ├── Throttle guard (rate limiting)
    ├── Helmet (security headers)
    └── CORS configurado
```

### Endpoints Listos
```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
GET    /api/v1/health
```

### Criterio de Completado
- [ ] Login con email/password funciona
- [ ] Access token expira en 15 min
- [ ] Refresh token renueva el access token
- [ ] Rutas protegidas rechazan sin token
- [ ] Rate limiting bloquea después de 5 intentos

---

## FASE 2: Auth + Layout (Frontend)

### Objetivo
Setup frontend con login funcional y layout admin.

### Tareas

```
□ 2.1 Setup del proyecto
    ├── Crear proyecto Next.js 14 (App Router)
    ├── Configurar TypeScript
    ├── Instalar Tailwind CSS
    ├── Configurar estructura de carpetas
    └── Variables de entorno

□ 2.2 Componentes UI base
    ├── Button (variantes: primary, secondary, ghost, danger)
    ├── Input (con estados: error, disabled)
    ├── Spinner
    ├── Toast notifications
    └── Card

□ 2.3 Configuración API
    ├── Cliente HTTP (axios/fetch) configurado
    ├── Interceptor para tokens
    ├── Manejo de errores global
    └── Types de API responses

□ 2.4 Autenticación
    ├── Página /admin/login
    ├── Formulario con React Hook Form + Zod
    ├── Store de auth (Zustand)
    ├── Middleware de protección de rutas
    ├── Persistencia de sesión
    └── Logout funcional

□ 2.5 Layout Admin
    ├── Sidebar con navegación
    ├── Header con usuario y logout
    ├── Layout responsive
    ├── Animaciones de transición (Framer Motion)
    └── Loading states
```

### Páginas Listas
```
/admin/login    → Formulario de login
/admin          → Dashboard (placeholder)
```

### Criterio de Completado
- [ ] Login muestra errores de validación
- [ ] Login incorrecto muestra mensaje de error
- [ ] Login correcto redirige a /admin
- [ ] Refresh automático de token funciona
- [ ] Rutas /admin/* protegidas
- [ ] Logout limpia sesión y redirige

---

## FASE 3: Settings + Categories (Backend)

### Objetivo
CRUD completo de configuración y categorías.

### Tareas

```
□ 3.1 Módulo Settings
    ├── GET /api/v1/settings
    ├── PATCH /api/v1/settings
    ├── POST /api/v1/settings/logo (upload)
    ├── Integración Cloudinary
    ├── Cache con Redis (TTL: 1 hora)
    └── Tests

□ 3.2 Módulo Categories
    ├── GET /api/v1/categories
    ├── GET /api/v1/categories/:id
    ├── POST /api/v1/categories
    ├── PATCH /api/v1/categories/:id
    ├── DELETE /api/v1/categories/:id
    ├── POST /api/v1/categories/:id/image
    ├── PATCH /api/v1/categories/reorder
    ├── Generación automática de slug
    ├── Cache con Redis
    └── Tests

□ 3.3 Módulo Images (compartido)
    ├── Servicio de Cloudinary
    ├── Validación de tipos de archivo
    ├── Validación de tamaño (max 2MB)
    ├── Optimización automática
    └── Eliminación de imágenes
```

### Endpoints Listos
```
GET    /api/v1/settings
PATCH  /api/v1/settings
POST   /api/v1/settings/logo

GET    /api/v1/categories
GET    /api/v1/categories/:id
POST   /api/v1/categories
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id
POST   /api/v1/categories/:id/image
PATCH  /api/v1/categories/reorder
```

### Criterio de Completado
- [ ] Settings se obtienen y actualizan
- [ ] Logo se sube a Cloudinary
- [ ] Categorías CRUD completo
- [ ] Slug se genera automáticamente
- [ ] Reordenar categorías funciona
- [ ] Cache se invalida al modificar

---

## FASE 4: Settings + Categories (Frontend)

### Objetivo
Interfaces de administración para configuración y categorías.

### Tareas

```
□ 4.1 Página Configuración
    ├── /admin/configuracion
    ├── Formulario de datos del negocio
    ├── Upload de logo con preview
    ├── Validación con Zod
    ├── Toast de éxito/error
    └── Loading states

□ 4.2 Página Categorías
    ├── /admin/categorias
    ├── Tabla de categorías
    ├── Modal crear/editar
    ├── Confirmación de eliminación
    ├── Drag & drop para reordenar (dnd-kit)
    ├── Upload de imagen
    ├── Toggle activo/inactivo
    └── Skeleton loading

□ 4.3 Componentes compartidos
    ├── ImageUploader (con crop opcional)
    ├── ConfirmDialog
    ├── DataTable base
    ├── EmptyState
    └── SortableList
```

### Páginas Listas
```
/admin/configuracion  → Formulario settings
/admin/categorias     → Lista + CRUD categorías
```

### Criterio de Completado
- [ ] Configuración se guarda correctamente
- [ ] Logo se muestra en preview antes de subir
- [ ] Categorías se listan con paginación
- [ ] Crear/editar categoría funciona
- [ ] Eliminar pide confirmación
- [ ] Reordenar con drag & drop funciona

---

## FASE 5: Products (Backend)

### Objetivo
CRUD completo de productos con imágenes.

### Tareas

```
□ 5.1 Módulo Products
    ├── GET /api/v1/products (con filtros y paginación)
    ├── GET /api/v1/products/:id
    ├── POST /api/v1/products
    ├── PATCH /api/v1/products/:id
    ├── DELETE /api/v1/products/:id
    ├── POST /api/v1/products/:id/duplicate
    ├── Generación de slug único
    ├── Relación con Category
    └── Tests

□ 5.2 Imágenes de productos
    ├── POST /api/v1/products/:id/images (múltiples)
    ├── DELETE /api/v1/products/:id/images/:imageId
    ├── PATCH /api/v1/products/:id/images/reorder
    ├── Límite de 4 imágenes
    └── Eliminación en cascada

□ 5.3 Cache
    ├── Cache de lista de productos
    ├── Cache de producto individual
    ├── Invalidación al modificar
    └── Cache de productos destacados
```

### Endpoints Listos
```
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
POST   /api/v1/products/:id/duplicate
POST   /api/v1/products/:id/images
DELETE /api/v1/products/:id/images/:imageId
PATCH  /api/v1/products/:id/images/reorder
```

### Criterio de Completado
- [ ] Productos CRUD completo
- [ ] Filtros por categoría, estado, búsqueda
- [ ] Paginación funciona
- [ ] Hasta 4 imágenes por producto
- [ ] Duplicar producto crea copia
- [ ] Eliminar producto borra imágenes

---

## FASE 6: Products (Frontend)

### Objetivo
Interfaces de administración de productos.

### Tareas

```
□ 6.1 Lista de productos
    ├── /admin/productos
    ├── Tabla con columnas ordenables
    ├── Filtros (categoría, estado, búsqueda)
    ├── Paginación
    ├── Acciones rápidas (activar, destacar, eliminar)
    └── Skeleton loading

□ 6.2 Crear/Editar producto
    ├── /admin/productos/nuevo
    ├── /admin/productos/[id]
    ├── Formulario con tabs o secciones
    ├── Galería de imágenes (upload múltiple)
    ├── Reordenar imágenes (drag & drop)
    ├── Preview de producto
    └── Validación completa

□ 6.3 Componentes
    ├── ProductForm (completo)
    ├── ImageGalleryManager
    ├── PriceInput (con moneda)
    ├── CategorySelect
    └── ProductPreview
```

### Páginas Listas
```
/admin/productos        → Lista de productos
/admin/productos/nuevo  → Crear producto
/admin/productos/[id]   → Editar producto
```

### Criterio de Completado
- [ ] Lista muestra productos con imágenes
- [ ] Filtros funcionan correctamente
- [ ] Crear producto con imágenes funciona
- [ ] Editar producto actualiza todo
- [ ] Galería permite reordenar y eliminar
- [ ] Validación muestra errores claros

---

## FASE 7: Variants (Backend)

### Objetivo
Sistema completo de variantes de productos.

### Tareas

```
□ 7.1 Módulo Variants
    ├── POST /api/v1/products/:id/variant-groups
    ├── PATCH /api/v1/variant-groups/:id
    ├── DELETE /api/v1/variant-groups/:id
    ├── POST /api/v1/variant-groups/:id/options
    ├── PATCH /api/v1/variant-options/:id
    ├── DELETE /api/v1/variant-options/:id
    ├── POST /api/v1/variant-options/:id/image
    ├── Reordenar grupos y opciones
    └── Tests

□ 7.2 Actualizar Product endpoint
    ├── GET /api/v1/products/:id incluye variantes
    ├── Cascade delete de variantes
    ├── Duplicar incluye variantes
    └── Cache actualizado
```

### Endpoints Listos
```
POST   /api/v1/products/:id/variant-groups
PATCH  /api/v1/variant-groups/:id
DELETE /api/v1/variant-groups/:id
POST   /api/v1/variant-groups/:id/options
PATCH  /api/v1/variant-options/:id
DELETE /api/v1/variant-options/:id
POST   /api/v1/variant-options/:id/image
```

### Criterio de Completado
- [ ] Crear grupo de variantes funciona
- [ ] Agregar opciones al grupo funciona
- [ ] Opciones pueden tener imagen
- [ ] Precio adicional se calcula correctamente
- [ ] Eliminar grupo elimina opciones

---

## FASE 8: Variants (Frontend)

### Objetivo
Interfaz para gestionar variantes de productos.

### Tareas

```
□ 8.1 Sección variantes en producto
    ├── /admin/productos/[id]/variantes (o tab en edición)
    ├── Lista de grupos de variantes
    ├── Modal crear/editar grupo
    ├── Lista de opciones por grupo
    ├── Modal crear/editar opción
    ├── Upload de imagen para opción
    ├── Reordenar con drag & drop
    └── Tipo de visualización (botones/dropdown/imágenes)

□ 8.2 Componentes
    ├── VariantGroupForm
    ├── VariantOptionForm
    ├── VariantGroupCard
    ├── VariantOptionCard
    └── DisplayTypeSelector
```

### Criterio de Completado
- [ ] Crear grupo con nombre y tipo funciona
- [ ] Agregar opciones con precio adicional
- [ ] Subir imagen a opción funciona
- [ ] Cambiar tipo de visualización
- [ ] Reordenar grupos y opciones

---

## FASE 9: Catalog Public (Backend)

### Objetivo
API pública para el catálogo (lo que ve el cliente).

### Tareas

```
□ 9.1 Módulo Catalog
    ├── GET /api/v1/catalog (catálogo completo)
    ├── GET /api/v1/catalog/products/:slug
    ├── GET /api/v1/catalog/categories/:slug
    ├── GET /api/v1/catalog/search
    ├── POST /api/v1/catalog/track (eventos)
    ├── Cache agresivo (TTL: 5-10 min)
    ├── Solo productos/categorías activos
    └── Tests

□ 9.2 Estadísticas (Queue)
    ├── Configurar Bull queue
    ├── Processor para estadísticas
    ├── Registrar PAGE_VIEW
    ├── Registrar PRODUCT_VIEW
    ├── Registrar WHATSAPP_CLICK
    └── Agregar por fecha (no duplicar)
```

### Endpoints Listos
```
GET    /api/v1/catalog
GET    /api/v1/catalog/products/:slug
GET    /api/v1/catalog/categories/:slug
GET    /api/v1/catalog/search
POST   /api/v1/catalog/track
```

### Criterio de Completado
- [ ] Catálogo devuelve solo activos
- [ ] Producto público incluye variantes
- [ ] Búsqueda funciona
- [ ] Cache reduce consultas a DB
- [ ] Eventos se registran async

---

## FASE 10: Catalog Public (Frontend)

### Objetivo
Vista pública del catálogo (lo que ve el cliente).

### Tareas

```
□ 10.1 Página principal
    ├── / (catálogo)
    ├── Header con logo y búsqueda
    ├── Categorías
    ├── Productos destacados
    ├── Grid de productos
    ├── Footer con info del negocio
    └── SSG con revalidación

□ 10.2 Página de producto
    ├── /producto/[slug]
    ├── Galería de imágenes
    ├── Información del producto
    ├── Selector de variantes (interactivo)
    ├── Cambio de imagen al seleccionar color
    ├── Precio calculado con variantes
    ├── Botón WhatsApp
    └── ISR con revalidación

□ 10.3 Otras páginas
    ├── /categoria/[slug]
    ├── /buscar?q=...
    └── Página 404

□ 10.4 SEO
    ├── Meta tags dinámicos
    ├── Open Graph images
    ├── JSON-LD structured data
    └── Sitemap dinámico

□ 10.5 Componentes
    ├── ProductCard
    ├── ProductGallery
    ├── VariantSelector
    ├── PriceDisplay
    ├── WhatsAppButton
    └── SearchBar
```

### Páginas Listas
```
/                    → Catálogo principal
/producto/[slug]     → Detalle de producto
/categoria/[slug]    → Productos por categoría
/buscar              → Resultados de búsqueda
```

### Criterio de Completado
- [ ] Catálogo carga rápido (SSG)
- [ ] Productos muestran precio correcto
- [ ] Variantes cambian imagen/precio
- [ ] Búsqueda encuentra productos
- [ ] SEO tags correctos
- [ ] Responsive en móvil

---

## FASE 11: Cart + WhatsApp

### Objetivo
Carrito de compras y envío por WhatsApp.

### Tareas

```
□ 11.1 Carrito (Frontend)
    ├── CartStore (Zustand + persistencia)
    ├── CartDrawer (slide desde derecha)
    ├── CartItem (con variantes)
    ├── CartButton (con contador)
    ├── Agregar/quitar/actualizar cantidad
    ├── Animaciones al agregar
    └── CartSummary (total)

□ 11.2 WhatsApp Integration
    ├── Generar mensaje formateado
    ├── Un producto: mensaje simple
    ├── Carrito: mensaje con lista
    ├── Incluir variantes seleccionadas
    ├── Incluir precios y total
    ├── Abrir WhatsApp (wa.me)
    └── Registrar evento WHATSAPP_CLICK

□ 11.3 Configuración
    ├── Toggle carrito en settings
    ├── Si desactivado: solo botón directo
    ├── Mensaje de bienvenida personalizable
    └── Preview del mensaje
```

### Criterio de Completado
- [ ] Agregar al carrito funciona
- [ ] Carrito persiste en localStorage
- [ ] Cantidad se puede modificar
- [ ] WhatsApp abre con mensaje correcto
- [ ] Variantes aparecen en mensaje
- [ ] Total calculado correctamente

---

## FASE 12: Stats + QR (Backend + Frontend)

### Objetivo
Dashboard de estadísticas y generador de QR.

### Tareas

```
□ 12.1 Stats Backend
    ├── GET /api/v1/stats/dashboard
    ├── GET /api/v1/stats/products/:id
    ├── Visitas totales y por día
    ├── Top productos
    ├── Clics en WhatsApp
    ├── Cache de stats (1 min)
    └── Queries optimizadas

□ 12.2 Stats Frontend
    ├── /admin/estadisticas
    ├── Cards con métricas principales
    ├── Gráfico de visitas (últimos 7 días)
    ├── Top 10 productos más vistos
    ├── Animaciones de números
    └── Actualización automática

□ 12.3 QR Generator
    ├── /admin/qr
    ├── QR del catálogo principal
    ├── QR por categoría
    ├── QR por producto
    ├── Descargar PNG/PDF
    ├── Copiar link
    └── Preview visual
```

### Endpoints Listos
```
GET /api/v1/stats/dashboard
GET /api/v1/stats/products/:id
```

### Criterio de Completado
- [ ] Dashboard muestra métricas reales
- [ ] Top productos ordenados por visitas
- [ ] QR genera correctamente
- [ ] Descarga PNG funciona
- [ ] Link copiable

---

## FASE 13: Import/Export + Polish

### Objetivo
Importación y exportación desde/hacia Excel y pulido final.

### Tareas

```
□ 13.1 Import Excel (Backend)
    ├── POST /api/v1/import/excel
    ├── GET /api/v1/import/status/:jobId
    ├── GET /api/v1/import/template
    ├── Bull queue para procesamiento
    ├── Validación de datos
    ├── Reporte de errores
    └── Progreso en tiempo real

□ 13.2 Export Excel (Backend)
    ├── GET /api/v1/export/products (filtros: categoryId, isActive, format)
    ├── GET /api/v1/export/categories
    ├── GET /api/v1/export/template
    ├── GET /api/v1/export/stats (filtros: startDate, endDate, type)
    ├── Generación de archivos .xlsx
    └── Stream de respuesta para archivos grandes

□ 13.3 Import/Export (Frontend)
    ├── /admin/importar
    ├── /admin/exportar
    ├── Descargar plantilla
    ├── Upload de archivo (drag & drop)
    ├── Barra de progreso
    ├── Lista de errores
    ├── Filtros para exportación
    ├── Descarga de archivos Excel
    └── Resultado final

□ 13.4 Polish general
    ├── Revisar todas las animaciones
    ├── Optimizar imágenes (next/image)
    ├── Lazy loading donde corresponda
    ├── Error boundaries
    ├── Mensajes de error claros
    ├── Empty states
    └── Responsive final

□ 13.5 Testing
    ├── Tests e2e críticos
    ├── Tests de performance
    ├── Tests de seguridad básicos
    └── Cross-browser testing
```

### Endpoints Listos
```
POST   /api/v1/import/excel
GET    /api/v1/import/status/:jobId
GET    /api/v1/import/template
GET    /api/v1/export/products
GET    /api/v1/export/categories
GET    /api/v1/export/template
GET    /api/v1/export/stats
```

### Criterio de Completado
- [ ] Importar Excel funciona
- [ ] Exportar productos/categorías funciona
- [ ] Filtros de exportación funcionan
- [ ] Errores se reportan claramente
- [ ] Lighthouse score > 90
- [ ] Sin errores en consola
- [ ] Responsive perfecto

---

## FASE 14: Deploy

### Objetivo
Despliegue en producción.

### Tareas

```
□ 14.1 Preparación
    ├── Variables de entorno producción
    ├── Secrets seguros
    ├── Dominio configurado
    ├── SSL certificado
    └── Cloudinary cuenta producción

□ 14.2 Docker Production
    ├── Construir imágenes
    ├── docker-compose.prod.yml
    ├── Nginx configurado
    ├── Health checks
    └── Logging configurado

□ 14.3 Deploy
    ├── Servidor configurado
    ├── Deploy inicial
    ├── Migraciones ejecutadas
    ├── Seed de admin
    └── Verificar funcionamiento

□ 14.4 Monitoreo
    ├── Logs centralizados
    ├── Alertas configuradas
    ├── Backup automático DB
    └── Documentación de operación
```

### Criterio de Completado
- [ ] Sitio accesible en dominio
- [ ] HTTPS funcionando
- [ ] Login funciona
- [ ] Catálogo público carga
- [ ] WhatsApp funciona
- [ ] Backups programados

---

## Resumen de Fases

| Fase | Nombre | Backend | Frontend |
|------|--------|---------|----------|
| 1 | Setup + Auth | ✓ | |
| 2 | Auth + Layout | | ✓ |
| 3 | Settings + Categories | ✓ | |
| 4 | Settings + Categories | | ✓ |
| 5 | Products | ✓ | |
| 6 | Products | | ✓ |
| 7 | Variants | ✓ | |
| 8 | Variants | | ✓ |
| 9 | Catalog Public | ✓ | |
| 10 | Catalog Public | | ✓ |
| 11 | Cart + WhatsApp | | ✓ |
| 12 | Stats + QR | ✓ | ✓ |
| 13 | Import/Export + Polish | ✓ | ✓ |
| 14 | Deploy | ✓ | ✓ |
