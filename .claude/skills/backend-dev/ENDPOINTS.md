# Endpoints Oficiales - Backend

Esta es la lista ÚNICA Y OFICIAL de endpoints. El frontend DEBE usar exactamente estas rutas.

## Base URL

```
/api/v1
```

---

## AUTH

| Método | Ruta | Acceso | Body | Response |
|--------|------|--------|------|----------|
| POST | /auth/login | Público | `{ email, password }` | `{ user, accessToken, refreshToken, expiresIn }` |
| POST | /auth/refresh | Público | `{ refreshToken }` | `{ accessToken, expiresIn }` |
| POST | /auth/logout | Admin | - | `{ message }` |
| GET | /auth/me | Admin | - | `{ id, email, name, role }` |

---

## SETTINGS

| Método | Ruta | Acceso | Body | Response |
|--------|------|--------|------|----------|
| GET | /settings | Público | - | Settings completo |
| PATCH | /settings | Admin | Campos a actualizar | Settings actualizado |
| POST | /settings/logo | Admin | FormData: logo | `{ logo, logoPublicId }` |

**Campos actualizables en PATCH /settings:**
```typescript
{
  businessName?: string;
  whatsapp?: string;
  currency?: string;
  description?: string;
  address?: string;
  schedule?: string;
  cartEnabled?: boolean;
  welcomeMessage?: string;
}
```

---

## CATEGORIES

| Método | Ruta | Acceso | Body | Response |
|--------|------|--------|------|----------|
| GET | /categories | Admin | - | Category[] |
| GET | /categories/:id | Admin | - | Category |
| POST | /categories | Admin | CreateCategoryDto | Category |
| PATCH | /categories/:id | Admin | UpdateCategoryDto | Category |
| DELETE | /categories/:id | Admin | - | `{ message }` |
| POST | /categories/:id/image | Admin | FormData: image | `{ image, imagePublicId }` |
| PATCH | /categories/reorder | Admin | `{ order: [{id, order}] }` | `{ message }` |

**Query params GET /categories:**
```
?includeInactive=true
?includeProducts=true  (incluye _count.products)
```

**CreateCategoryDto:**
```typescript
{
  name: string;        // requerido
  isActive?: boolean;  // default: true
}
```

**UpdateCategoryDto:**
```typescript
{
  name?: string;
  isActive?: boolean;
}
```

---

## PRODUCTS

| Método | Ruta | Acceso | Body | Response |
|--------|------|--------|------|----------|
| GET | /products | Admin | - | `{ items, pagination }` |
| GET | /products/:id | Admin | - | Product completo |
| POST | /products | Admin | CreateProductDto | Product |
| PATCH | /products/:id | Admin | UpdateProductDto | Product |
| DELETE | /products/:id | Admin | - | `{ message }` |
| POST | /products/:id/duplicate | Admin | - | Product (copia) |
| POST | /products/:id/images | Admin | FormData: images[] | `{ images }` |
| DELETE | /products/:id/images/:imageId | Admin | - | `{ message }` |
| PATCH | /products/:id/images/reorder | Admin | `{ order: [{id, order}] }` | `{ message }` |

**Query params GET /products:**
```
?page=1
&limit=20
&categoryId=clx123...
&search=polo
&isActive=true
&isFeatured=true
&sortBy=createdAt
&sortOrder=desc
```

**CreateProductDto:**
```typescript
{
  categoryId: string;      // requerido, CUID
  name: string;            // requerido
  description?: string;
  price: number;           // requerido, positivo
  salePrice?: number;      // nullable
  showPrice?: boolean;     // default: true
  stock?: number;          // nullable
  showStock?: boolean;     // default: false
  stockMessage?: string;
  isActive?: boolean;      // default: true
  isFeatured?: boolean;    // default: false
}
```

**UpdateProductDto:** Todos los campos opcionales.

---

## VARIANTS

| Método | Ruta | Acceso | Body | Response |
|--------|------|--------|------|----------|
| POST | /products/:productId/variant-groups | Admin | CreateVariantGroupDto | VariantGroup |
| PATCH | /variant-groups/:id | Admin | UpdateVariantGroupDto | VariantGroup |
| DELETE | /variant-groups/:id | Admin | - | `{ message }` |
| PATCH | /variant-groups/reorder | Admin | `{ order: [{id, order}] }` | `{ message }` |
| POST | /variant-groups/:groupId/options | Admin | CreateVariantOptionDto | VariantOption |
| PATCH | /variant-options/:id | Admin | UpdateVariantOptionDto | VariantOption |
| DELETE | /variant-options/:id | Admin | - | `{ message }` |
| POST | /variant-options/:id/image | Admin | FormData: image | `{ image, imagePublicId }` |
| PATCH | /variant-options/reorder | Admin | `{ order: [{id, order}] }` | `{ message }` |

**CreateVariantGroupDto:**
```typescript
{
  name: string;                    // requerido
  isRequired?: boolean;            // default: true
  displayType?: 'BUTTONS' | 'DROPDOWN' | 'IMAGES';  // default: 'BUTTONS'
}
```

**CreateVariantOptionDto:**
```typescript
{
  name: string;              // requerido
  additionalPrice?: number;  // default: 0
  isActive?: boolean;        // default: true
}
```

---

## CATALOG (Público)

| Método | Ruta | Acceso | Body | Response |
|--------|------|--------|------|----------|
| GET | /catalog | Público | - | `{ settings, categories, products, featured }` |
| GET | /catalog/products/:slug | Público | - | `{ product, related }` |
| GET | /catalog/categories/:slug | Público | - | `{ category, products }` |
| GET | /catalog/search | Público | - | `{ items, pagination }` |
| POST | /catalog/track | Público | TrackEventDto | `{ success }` |

**Query params GET /catalog:**
```
?categorySlug=polos
&featured=true
&page=1
&limit=20
```

**Query params GET /catalog/search:**
```
?q=polo azul
&page=1
&limit=20
```

**TrackEventDto:**
```typescript
{
  type: 'PAGE_VIEW' | 'PRODUCT_VIEW' | 'WHATSAPP_CLICK' | 'CATEGORY_VIEW' | 'SEARCH';
  productId?: string;   // para PRODUCT_VIEW y WHATSAPP_CLICK
  categoryId?: string;  // para CATEGORY_VIEW
  query?: string;       // para SEARCH
}
```

---

## STATS

| Método | Ruta | Acceso | Body | Response |
|--------|------|--------|------|----------|
| GET | /stats/dashboard | Admin | - | DashboardStats |
| GET | /stats/products/:id | Admin | - | ProductStats |

**Query params GET /stats/products/:id:**
```
?startDate=2024-01-01
&endDate=2024-01-31
```

**DashboardStats Response:**
```typescript
{
  overview: {
    totalViews: number;
    todayViews: number;
    totalWhatsAppClicks: number;
    todayWhatsAppClicks: number;
    conversionRate: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    views: number;
    clicks: number;
  }>;
  topCategories: Array<{
    id: string;
    name: string;
    views: number;
  }>;
}
```

---

## IMPORT

| Método | Ruta | Acceso | Body | Response |
|--------|------|--------|------|----------|
| POST | /import/excel | Admin | FormData: file | `{ jobId, message, statusUrl }` |
| GET | /import/status/:jobId | Admin | - | ImportStatus |
| GET | /import/template | Admin | - | File (xlsx) |

**ImportStatus Response:**
```typescript
{
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;      // 0-100
  total: number;
  processed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}
```

---

## HEALTH

| Método | Ruta | Acceso | Response |
|--------|------|--------|----------|
| GET | /health | Público | `{ status, timestamp, services }` |

---

## Resumen de Rutas

```
AUTH
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

SETTINGS
GET    /api/v1/settings
PATCH  /api/v1/settings
POST   /api/v1/settings/logo

CATEGORIES
GET    /api/v1/categories
GET    /api/v1/categories/:id
POST   /api/v1/categories
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id
POST   /api/v1/categories/:id/image
PATCH  /api/v1/categories/reorder

PRODUCTS
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
POST   /api/v1/products/:id/duplicate
POST   /api/v1/products/:id/images
DELETE /api/v1/products/:id/images/:imageId
PATCH  /api/v1/products/:id/images/reorder

VARIANTS
POST   /api/v1/products/:productId/variant-groups
PATCH  /api/v1/variant-groups/:id
DELETE /api/v1/variant-groups/:id
PATCH  /api/v1/variant-groups/reorder
POST   /api/v1/variant-groups/:groupId/options
PATCH  /api/v1/variant-options/:id
DELETE /api/v1/variant-options/:id
POST   /api/v1/variant-options/:id/image
PATCH  /api/v1/variant-options/reorder

CATALOG
GET    /api/v1/catalog
GET    /api/v1/catalog/products/:slug
GET    /api/v1/catalog/categories/:slug
GET    /api/v1/catalog/search
POST   /api/v1/catalog/track

STATS
GET    /api/v1/stats/dashboard
GET    /api/v1/stats/products/:id

IMPORT
POST   /api/v1/import/excel
GET    /api/v1/import/status/:jobId
GET    /api/v1/import/template

HEALTH
GET    /api/v1/health
```
