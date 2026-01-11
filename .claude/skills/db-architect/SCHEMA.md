# Schema Oficial - Catálogo Digital

Este es el schema ÚNICO Y OFICIAL del proyecto. Cualquier código que interactúe con la base de datos DEBE usar estos campos exactos.

## Tablas y Campos

### 1. SETTINGS (Configuración del negocio)

| Campo | Tipo | Nullable | Default | DB Column | Descripción |
|-------|------|----------|---------|-----------|-------------|
| id | String | No | "main" | id | ID único (siempre "main") |
| businessName | String | No | - | business_name | Nombre del negocio |
| logo | String | Sí | null | logo | URL del logo |
| logoPublicId | String | Sí | null | logo_public_id | ID en Cloudinary |
| whatsapp | String | No | - | whatsapp | Número WhatsApp con código país |
| currency | String | No | "S/" | currency | Símbolo de moneda |
| description | String | Sí | null | description | Descripción del negocio |
| address | String | Sí | null | address | Dirección física |
| schedule | String | Sí | null | schedule | Horario de atención |
| cartEnabled | Boolean | No | true | cart_enabled | Carrito activo/inactivo |
| welcomeMessage | String | Sí | null | welcome_message | Mensaje inicial WhatsApp |
| seoTitle | String | Sí | null | seo_title | SEO: Meta título del sitio |
| seoDescription | String | Sí | null | seo_description | SEO: Meta descripción |
| seoKeywords | String | Sí | null | seo_keywords | SEO: Keywords (coma separados) |
| ogImage | String | Sí | null | og_image | SEO: Open Graph image URL |
| ogImagePublicId | String | Sí | null | og_image_public_id | SEO: OG Image ID Cloudinary |
| googleAnalyticsId | String | Sí | null | google_analytics_id | ADS: GA4 G-XXXXXXXXXX |
| googleTagManagerId | String | Sí | null | google_tag_manager_id | ADS: GTM-XXXXXXX |
| facebookPixelId | String | Sí | null | facebook_pixel_id | ADS: Facebook/Meta Pixel ID |
| tiktokPixelId | String | Sí | null | tiktok_pixel_id | ADS: TikTok Pixel ID |
| updatedAt | DateTime | No | auto | updated_at | Última actualización |

---

### 2. USER (Usuarios admin)

| Campo | Tipo | Nullable | Default | DB Column | Descripción |
|-------|------|----------|---------|-----------|-------------|
| id | String | No | cuid() | id | ID único |
| email | String | No | - | email | Email (único) |
| password | String | No | - | password | Hash bcrypt |
| name | String | No | - | name | Nombre del usuario |
| role | UserRole | No | EDITOR | role | ADMIN o EDITOR |
| refreshToken | String | Sí | null | refresh_token | Token de refresco |
| createdAt | DateTime | No | now() | created_at | Fecha creación |
| updatedAt | DateTime | No | auto | updated_at | Última actualización |

**Enum UserRole:** `ADMIN`, `EDITOR`

---

### 3. CATEGORY (Categorías)

| Campo | Tipo | Nullable | Default | DB Column | Descripción |
|-------|------|----------|---------|-----------|-------------|
| id | String | No | cuid() | id | ID único |
| name | String | No | - | name | Nombre categoría |
| slug | String | No | - | slug | URL amigable (único) |
| image | String | Sí | null | image | URL imagen |
| imagePublicId | String | Sí | null | image_public_id | ID en Cloudinary |
| order | Int | No | 0 | order | Orden de visualización |
| isActive | Boolean | No | true | is_active | Activa/inactiva |
| seoTitle | String | Sí | null | seo_title | SEO: Meta título categoría |
| seoDescription | String | Sí | null | seo_description | SEO: Meta descripción |
| seoKeywords | String | Sí | null | seo_keywords | SEO: Keywords |
| createdAt | DateTime | No | now() | created_at | Fecha creación |
| updatedAt | DateTime | No | auto | updated_at | Última actualización |

**Relaciones:**

- `products` → Product[] (1:N)

**Índices:**
- `[isActive, order]`

---

### 4. PRODUCT (Productos)

| Campo | Tipo | Nullable | Default | DB Column | Descripción |
|-------|------|----------|---------|-----------|-------------|
| id | String | No | cuid() | id | ID único |
| categoryId | String | No | - | category_id | FK a Category |
| name | String | No | - | name | Nombre producto |
| slug | String | No | - | slug | URL amigable (único) |
| description | String | Sí | null | description | Descripción |
| price | Decimal | No | - | price | Precio normal |
| salePrice | Decimal | Sí | null | sale_price | Precio oferta |
| showPrice | Boolean | No | true | show_price | Mostrar precio |
| stock | Int | Sí | null | stock | Cantidad disponible |
| showStock | Boolean | No | false | show_stock | Mostrar stock |
| stockMessage | String | Sí | null | stock_message | Mensaje sin stock |
| isActive | Boolean | No | true | is_active | Activo/inactivo |
| isFeatured | Boolean | No | false | is_featured | Destacado |
| order | Int | No | 0 | order | Orden |
| seoTitle | String | Sí | null | seo_title | SEO: Meta título producto |
| seoDescription | String | Sí | null | seo_description | SEO: Meta descripción |
| seoKeywords | String | Sí | null | seo_keywords | SEO: Keywords |
| createdAt | DateTime | No | now() | created_at | Fecha creación |
| updatedAt | DateTime | No | auto | updated_at | Última actualización |

**Relaciones:**

- `category` → Category (N:1)
- `images` → ProductImage[] (1:N)
- `variantGroups` → VariantGroup[] (1:N)
- `stats` → ProductStat[] (1:N)

**Índices:**
- `[categoryId, isActive, order]`
- `[isActive, isFeatured]`
- `[slug]`

---

### 5. PRODUCT_IMAGE (Imágenes del producto)

| Campo | Tipo | Nullable | Default | DB Column | Descripción |
|-------|------|----------|---------|-----------|-------------|
| id | String | No | cuid() | id | ID único |
| productId | String | No | - | product_id | FK a Product |
| url | String | No | - | url | URL de imagen |
| publicId | String | No | - | public_id | ID en Cloudinary |
| order | Int | No | 0 | order | Orden |
| createdAt | DateTime | No | now() | created_at | Fecha creación |

**Relaciones:**
- `product` → Product (N:1, onDelete: Cascade)

**Índices:**
- `[productId, order]`

---

### 6. VARIANT_GROUP (Grupos de variantes)

| Campo | Tipo | Nullable | Default | DB Column | Descripción |
|-------|------|----------|---------|-----------|-------------|
| id | String | No | cuid() | id | ID único |
| productId | String | No | - | product_id | FK a Product |
| name | String | No | - | name | Nombre (Talla, Color) |
| isRequired | Boolean | No | true | is_required | Selección obligatoria |
| displayType | VariantDisplayType | No | BUTTONS | display_type | Tipo visualización |
| order | Int | No | 0 | order | Orden |
| createdAt | DateTime | No | now() | created_at | Fecha creación |
| updatedAt | DateTime | No | auto | updated_at | Última actualización |

**Enum VariantDisplayType:** `BUTTONS`, `DROPDOWN`, `IMAGES`

**Relaciones:**
- `product` → Product (N:1, onDelete: Cascade)
- `options` → VariantOption[] (1:N)

**Índices:**
- `[productId, order]`

---

### 7. VARIANT_OPTION (Opciones de variante)

| Campo | Tipo | Nullable | Default | DB Column | Descripción |
|-------|------|----------|---------|-----------|-------------|
| id | String | No | cuid() | id | ID único |
| groupId | String | No | - | group_id | FK a VariantGroup |
| name | String | No | - | name | Nombre (S, M, Rojo) |
| image | String | Sí | null | image | URL imagen |
| imagePublicId | String | Sí | null | image_public_id | ID en Cloudinary |
| additionalPrice | Decimal | No | 0 | additional_price | Precio adicional |
| isActive | Boolean | No | true | is_active | Activo/inactivo |
| order | Int | No | 0 | order | Orden |
| createdAt | DateTime | No | now() | created_at | Fecha creación |
| updatedAt | DateTime | No | auto | updated_at | Última actualización |

**Relaciones:**
- `group` → VariantGroup (N:1, onDelete: Cascade)

**Índices:**
- `[groupId, isActive, order]`

---

### 8. PRODUCT_STAT (Estadísticas)

| Campo | Tipo | Nullable | Default | DB Column | Descripción |
|-------|------|----------|---------|-----------|-------------|
| id | String | No | cuid() | id | ID único |
| productId | String | Sí | null | product_id | FK a Product (nullable para stats globales) |
| type | StatType | No | - | type | Tipo de evento |
| date | DateTime | No | - | date | Fecha (solo fecha, sin hora) |
| count | Int | No | 1 | count | Contador |
| metadata | Json | Sí | null | metadata | Datos extra (ej: query de búsqueda) |

**Enum StatType:** `PAGE_VIEW`, `PRODUCT_VIEW`, `WHATSAPP_CLICK`, `CATEGORY_VIEW`, `SEARCH`, `ADD_TO_CART`, `CHECKOUT_START`, `PURCHASE`

**Relaciones:**
- `product` → Product (N:1, onDelete: Cascade)

**Índices:**
- `[productId, type, date]` (único)
- `[type, date]`
- `[productId, type]`

---

### 9. TRACKING_PIXEL (Píxeles de Ads adicionales)

| Campo | Tipo | Nullable | Default | DB Column | Descripción |
|-------|------|----------|---------|-----------|-------------|
| id | String | No | cuid() | id | ID único |
| name | String | No | - | name | Nombre descriptivo |
| type | PixelType | No | - | type | Tipo de píxel |
| pixelId | String | No | - | pixel_id | ID del píxel (ej: AW-123) |
| isActive | Boolean | No | true | is_active | Activo/inactivo |
| config | Json | Sí | null | config | Config adicional |
| createdAt | DateTime | No | now() | created_at | Fecha creación |
| updatedAt | DateTime | No | auto | updated_at | Última actualización |

**Enum PixelType:** `GOOGLE_ADS`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `PINTEREST`, `TWITTER`, `LINKEDIN`, `CUSTOM`

---

## Resumen de Enums

```typescript
enum UserRole {
  ADMIN
  EDITOR
}

enum VariantDisplayType {
  BUTTONS
  DROPDOWN
  IMAGES
}

enum StatType {
  PAGE_VIEW
  PRODUCT_VIEW
  WHATSAPP_CLICK
  CATEGORY_VIEW
  SEARCH
  ADD_TO_CART
  CHECKOUT_START
  PURCHASE
}

enum PixelType {
  GOOGLE_ADS
  FACEBOOK
  TIKTOK
  SNAPCHAT
  PINTEREST
  TWITTER
  LINKEDIN
  CUSTOM
}
```

---

## Mapa de Relaciones

```
Settings (1) ─────────────────────────────────────────────────────

User (N) ─────────────────────────────────────────────────────────

Category (N)
    │
    └──── products ──────► Product (N)
                              │
                              ├──── images ──────► ProductImage (N)
                              │
                              ├──── variantGroups ──► VariantGroup (N)
                              │                          │
                              │                          └──── options ──► VariantOption (N)
                              │
                              └──── stats ──────► ProductStat (N)
```

---

## Checklist de Validación

Antes de usar cualquier campo, verificar:

- [ ] El campo existe en esta tabla
- [ ] El tipo de dato coincide
- [ ] La nullabilidad es correcta
- [ ] El nombre de la columna DB es correcto
- [ ] Las relaciones están bien definidas
