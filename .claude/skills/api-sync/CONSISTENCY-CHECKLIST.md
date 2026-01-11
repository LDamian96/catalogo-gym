# Checklist de Consistencia - API Sync

Este checklist debe verificarse antes de cada integración Backend ↔ Frontend.

---

## 1. AUTH MODULE

### Endpoints
| Backend | Frontend | Status |
|---------|----------|--------|
| `POST /auth/login` | `lib/api/auth.ts → login()` | ⬜ |
| `POST /auth/refresh` | `lib/api/auth.ts → refreshToken()` | ⬜ |
| `POST /auth/logout` | `lib/api/auth.ts → logout()` | ⬜ |
| `GET /auth/me` | `lib/api/auth.ts → getCurrentUser()` | ⬜ |

### DTOs/Types
| Backend DTO | Frontend Type | Campos | Status |
|-------------|---------------|--------|--------|
| `LoginDto` | `LoginData` | email, password | ⬜ |
| `LoginResponse` | `AuthResponse` | user, accessToken, refreshToken, expiresIn | ⬜ |
| `UserResponse` | `User` | id, email, name, role | ⬜ |

---

## 2. SETTINGS MODULE

### Endpoints
| Backend | Frontend | Status |
|---------|----------|--------|
| `GET /settings` | `lib/api/settings.ts → getSettings()` | ⬜ |
| `PATCH /settings` | `lib/api/settings.ts → updateSettings()` | ⬜ |
| `POST /settings/logo` | `lib/api/settings.ts → uploadLogo()` | ⬜ |
| `POST /settings/og-image` | `lib/api/settings.ts → uploadOgImage()` | ⬜ |

### DTOs/Types
| Backend DTO | Frontend Type | Campos | Status |
|-------------|---------------|--------|--------|
| `UpdateSettingsDto` | `UpdateSettingsData` | businessName?, whatsapp?, currency?, description?, address?, schedule?, cartEnabled?, welcomeMessage?, seoTitle?, seoDescription?, seoKeywords?, googleAnalyticsId?, googleTagManagerId?, facebookPixelId?, tiktokPixelId? | ⬜ |
| `Settings` (entity) | `Settings` | id, businessName, logo, logoPublicId, whatsapp, currency, description, address, schedule, cartEnabled, welcomeMessage, seoTitle, seoDescription, seoKeywords, ogImage, ogImagePublicId, googleAnalyticsId, googleTagManagerId, facebookPixelId, tiktokPixelId, updatedAt | ⬜ |

---

## 3. CATEGORIES MODULE

### Endpoints
| Backend | Frontend | Status |
|---------|----------|--------|
| `GET /categories` | `lib/api/categories.ts → getCategories()` | ⬜ |
| `GET /categories/:id` | `lib/api/categories.ts → getCategory()` | ⬜ |
| `POST /categories` | `lib/api/categories.ts → createCategory()` | ⬜ |
| `PATCH /categories/:id` | `lib/api/categories.ts → updateCategory()` | ⬜ |
| `DELETE /categories/:id` | `lib/api/categories.ts → deleteCategory()` | ⬜ |
| `POST /categories/:id/image` | `lib/api/categories.ts → uploadCategoryImage()` | ⬜ |
| `PATCH /categories/reorder` | `lib/api/categories.ts → reorderCategories()` | ⬜ |

### DTOs/Types
| Backend DTO | Frontend Type | Campos | Status |
|-------------|---------------|--------|--------|
| `CreateCategoryDto` | `CreateCategoryData` | name, isActive?, seoTitle?, seoDescription?, seoKeywords? | ⬜ |
| `UpdateCategoryDto` | `UpdateCategoryData` | name?, isActive?, seoTitle?, seoDescription?, seoKeywords? | ⬜ |
| `Category` (entity) | `Category` | id, name, slug, image, imagePublicId, isActive, order, seoTitle, seoDescription, seoKeywords, createdAt, updatedAt | ⬜ |

### Query Params
| Param | Backend | Frontend | Status |
|-------|---------|----------|--------|
| includeInactive | `@Query('includeInactive')` | `params.includeInactive` | ⬜ |
| includeProducts | `@Query('includeProducts')` | `params.includeProducts` | ⬜ |

---

## 4. PRODUCTS MODULE

### Endpoints
| Backend | Frontend | Status |
|---------|----------|--------|
| `GET /products` | `lib/api/products.ts → getProducts()` | ⬜ |
| `GET /products/:id` | `lib/api/products.ts → getProduct()` | ⬜ |
| `POST /products` | `lib/api/products.ts → createProduct()` | ⬜ |
| `PATCH /products/:id` | `lib/api/products.ts → updateProduct()` | ⬜ |
| `DELETE /products/:id` | `lib/api/products.ts → deleteProduct()` | ⬜ |
| `POST /products/:id/duplicate` | `lib/api/products.ts → duplicateProduct()` | ⬜ |
| `POST /products/:id/images` | `lib/api/products.ts → uploadProductImages()` | ⬜ |
| `DELETE /products/:id/images/:imageId` | `lib/api/products.ts → deleteProductImage()` | ⬜ |
| `PATCH /products/:id/images/reorder` | `lib/api/products.ts → reorderProductImages()` | ⬜ |

### DTOs/Types
| Backend DTO | Frontend Type | Campos | Status |
|-------------|---------------|--------|--------|
| `CreateProductDto` | `CreateProductData` | categoryId, name, description?, price, salePrice?, showPrice?, stock?, showStock?, stockMessage?, isActive?, isFeatured?, seoTitle?, seoDescription?, seoKeywords? | ⬜ |
| `UpdateProductDto` | `UpdateProductData` | categoryId?, name?, description?, price?, salePrice?, showPrice?, stock?, showStock?, stockMessage?, isActive?, isFeatured?, seoTitle?, seoDescription?, seoKeywords? | ⬜ |
| `Product` (entity) | `Product` | id, categoryId, name, slug, description, price, salePrice, showPrice, stock, showStock, stockMessage, isActive, isFeatured, order, seoTitle, seoDescription, seoKeywords, createdAt, updatedAt, images?, variantGroups?, category? | ⬜ |
| `ProductImage` | `ProductImage` | id, productId, url, publicId, order | ⬜ |

### Query Params
| Param | Backend | Frontend | Status |
|-------|---------|----------|--------|
| page | `@Query('page')` | `params.page` | ⬜ |
| limit | `@Query('limit')` | `params.limit` | ⬜ |
| categoryId | `@Query('categoryId')` | `params.categoryId` | ⬜ |
| search | `@Query('search')` | `params.search` | ⬜ |
| isActive | `@Query('isActive')` | `params.isActive` | ⬜ |
| isFeatured | `@Query('isFeatured')` | `params.isFeatured` | ⬜ |
| sortBy | `@Query('sortBy')` | `params.sortBy` | ⬜ |
| sortOrder | `@Query('sortOrder')` | `params.sortOrder` | ⬜ |

---

## 5. VARIANTS MODULE

### Endpoints
| Backend | Frontend | Status |
|---------|----------|--------|
| `POST /products/:productId/variant-groups` | `lib/api/variants.ts → createVariantGroup()` | ⬜ |
| `PATCH /variant-groups/:id` | `lib/api/variants.ts → updateVariantGroup()` | ⬜ |
| `DELETE /variant-groups/:id` | `lib/api/variants.ts → deleteVariantGroup()` | ⬜ |
| `PATCH /variant-groups/reorder` | `lib/api/variants.ts → reorderVariantGroups()` | ⬜ |
| `POST /variant-groups/:groupId/options` | `lib/api/variants.ts → createVariantOption()` | ⬜ |
| `PATCH /variant-options/:id` | `lib/api/variants.ts → updateVariantOption()` | ⬜ |
| `DELETE /variant-options/:id` | `lib/api/variants.ts → deleteVariantOption()` | ⬜ |
| `POST /variant-options/:id/image` | `lib/api/variants.ts → uploadVariantOptionImage()` | ⬜ |
| `PATCH /variant-options/reorder` | `lib/api/variants.ts → reorderVariantOptions()` | ⬜ |

### DTOs/Types
| Backend DTO | Frontend Type | Campos | Status |
|-------------|---------------|--------|--------|
| `CreateVariantGroupDto` | `CreateVariantGroupData` | name, isRequired?, displayType? | ⬜ |
| `UpdateVariantGroupDto` | `UpdateVariantGroupData` | name?, isRequired?, displayType? | ⬜ |
| `VariantGroup` (entity) | `VariantGroup` | id, productId, name, isRequired, displayType, order, options? | ⬜ |
| `CreateVariantOptionDto` | `CreateVariantOptionData` | name, additionalPrice?, isActive? | ⬜ |
| `UpdateVariantOptionDto` | `UpdateVariantOptionData` | name?, additionalPrice?, isActive? | ⬜ |
| `VariantOption` (entity) | `VariantOption` | id, variantGroupId, name, additionalPrice, image, imagePublicId, isActive, order | ⬜ |

### Enums
| Backend | Frontend | Valores | Status |
|---------|----------|---------|--------|
| `DisplayType` | `DisplayType` | BUTTONS, DROPDOWN, IMAGES | ⬜ |

---

## 6. CATALOG MODULE (Público)

### Endpoints
| Backend | Frontend | Status |
|---------|----------|--------|
| `GET /catalog` | `lib/api/catalog.ts → getCatalog()` | ⬜ |
| `GET /catalog/products/:slug` | `lib/api/catalog.ts → getPublicProduct()` | ⬜ |
| `GET /catalog/categories/:slug` | `lib/api/catalog.ts → getPublicCategory()` | ⬜ |
| `GET /catalog/search` | `lib/api/catalog.ts → searchProducts()` | ⬜ |
| `POST /catalog/track` | `lib/api/catalog.ts → trackEvent()` | ⬜ |

### DTOs/Types
| Backend DTO | Frontend Type | Campos | Status |
|-------------|---------------|--------|--------|
| `TrackEventDto` | `TrackEventData` | type, productId?, categoryId?, query?, metadata? | ⬜ |
| `CatalogResponse` | `CatalogData` | settings, categories, products, featured | ⬜ |

### Enums
| Backend | Frontend | Valores | Status |
|---------|----------|---------|--------|
| `StatType` | `StatType` | PAGE_VIEW, PRODUCT_VIEW, WHATSAPP_CLICK, CATEGORY_VIEW, SEARCH, ADD_TO_CART, CHECKOUT_START, PURCHASE | ⬜ |

---

## 7. STATS MODULE

### Endpoints
| Backend | Frontend | Status |
|---------|----------|--------|
| `GET /stats/dashboard` | `lib/api/stats.ts → getDashboardStats()` | ⬜ |
| `GET /stats/products/:id` | `lib/api/stats.ts → getProductStats()` | ⬜ |

### DTOs/Types
| Backend DTO | Frontend Type | Campos | Status |
|-------------|---------------|--------|--------|
| `DashboardStats` | `DashboardStats` | totalProducts, totalCategories, totalViews, totalWhatsAppClicks, topProducts, recentActivity | ⬜ |
| `ProductStats` | `ProductStats` | views, whatsAppClicks, viewsByDate | ⬜ |

---

## 8. TRACKING PIXELS MODULE

### Endpoints

| Backend | Frontend | Status |
|---------|----------|--------|
| `GET /tracking-pixels` | `lib/api/tracking-pixels.ts → getTrackingPixels()` | ⬜ |
| `POST /tracking-pixels` | `lib/api/tracking-pixels.ts → createTrackingPixel()` | ⬜ |
| `PATCH /tracking-pixels/:id` | `lib/api/tracking-pixels.ts → updateTrackingPixel()` | ⬜ |
| `DELETE /tracking-pixels/:id` | `lib/api/tracking-pixels.ts → deleteTrackingPixel()` | ⬜ |

### DTOs/Types

| Backend DTO | Frontend Type | Campos | Status |
|-------------|---------------|--------|--------|
| `CreateTrackingPixelDto` | `CreateTrackingPixelData` | name, type, pixelId, isActive?, config? | ⬜ |
| `UpdateTrackingPixelDto` | `UpdateTrackingPixelData` | name?, type?, pixelId?, isActive?, config? | ⬜ |
| `TrackingPixel` (entity) | `TrackingPixel` | id, name, type, pixelId, isActive, config, createdAt, updatedAt | ⬜ |

### Enums

| Backend | Frontend | Valores | Status |
|---------|----------|---------|--------|
| `PixelType` | `PixelType` | GOOGLE_ADS, FACEBOOK, TIKTOK, SNAPCHAT, PINTEREST, TWITTER, LINKEDIN, CUSTOM | ⬜ |

---

## 9. IMPORT MODULE

### Endpoints
| Backend | Frontend | Status |
|---------|----------|--------|
| `POST /import/excel` | `lib/api/import.ts → importExcel()` | ⬜ |
| `GET /import/status/:jobId` | `lib/api/import.ts → getImportStatus()` | ⬜ |
| `GET /import/template` | `lib/api/import.ts → downloadTemplate()` | ⬜ |

### DTOs/Types
| Backend DTO | Frontend Type | Campos | Status |
|-------------|---------------|--------|--------|
| `ImportResponse` | `ImportResponse` | jobId, message, statusUrl | ⬜ |
| `ImportStatus` | `ImportStatus` | status, progress, errors, completed, total | ⬜ |

---

## 10. EXPORT MODULE

### Endpoints
| Backend | Frontend | Status |
|---------|----------|--------|
| `GET /export/products` | `lib/api/export.ts → exportProducts()` | ⬜ |
| `GET /export/categories` | `lib/api/export.ts → exportCategories()` | ⬜ |
| `GET /export/template` | `lib/api/export.ts → downloadTemplate()` | ⬜ |
| `GET /export/stats` | `lib/api/export.ts → exportStats()` | ⬜ |

### DTOs/Types
| Backend DTO | Frontend Type | Campos | Status |
|-------------|---------------|--------|--------|
| `ExportProductsQuery` | `ExportProductsParams` | categoryId?, isActive?, format? | ⬜ |
| `ExportStatsQuery` | `ExportStatsParams` | startDate?, endDate?, type? | ⬜ |

### Query Params
| Param | Backend | Frontend | Status |
|-------|---------|----------|--------|
| categoryId | `@Query('categoryId')` | `params.categoryId` | ⬜ |
| isActive | `@Query('isActive')` | `params.isActive` | ⬜ |
| format | `@Query('format')` | `params.format` | ⬜ |
| startDate | `@Query('startDate')` | `params.startDate` | ⬜ |
| endDate | `@Query('endDate')` | `params.endDate` | ⬜ |
| type | `@Query('type')` | `params.type` | ⬜ |

### Response Types
| Endpoint | Content-Type | Respuesta |
|----------|-------------|-----------|
| `/export/products` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Archivo .xlsx |
| `/export/categories` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Archivo .xlsx |
| `/export/template` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Archivo .xlsx |
| `/export/stats` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Archivo .xlsx |

---

## Verificaciones Adicionales

### Tipos Comunes
| Tipo | Backend | Frontend | Status |
|------|---------|----------|--------|
| `Pagination` | `PaginationMeta` | page, limit, total, totalPages | ⬜ |
| `ApiResponse<T>` | `ApiResponse<T>` | success, data, timestamp | ⬜ |
| `ApiError` | `ApiError` | success, error: { code, message, details? } | ⬜ |

### Nullabilidad Crítica
| Campo | Backend | Frontend | Status |
|-------|---------|----------|--------|
| `Product.salePrice` | `number \| null` | `number \| null` | ⬜ |
| `Product.stock` | `number \| null` | `number \| null` | ⬜ |
| `Product.description` | `string \| null` | `string \| null` | ⬜ |
| `Category.image` | `string \| null` | `string \| null` | ⬜ |
| `VariantOption.image` | `string \| null` | `string \| null` | ⬜ |

### Valores por Defecto
| Campo | Backend Default | Frontend Default | Status |
|-------|-----------------|------------------|--------|
| `Product.isActive` | `true` | `true` | ⬜ |
| `Product.isFeatured` | `false` | `false` | ⬜ |
| `Product.showPrice` | `true` | `true` | ⬜ |
| `Product.showStock` | `false` | `false` | ⬜ |
| `Category.isActive` | `true` | `true` | ⬜ |
| `VariantGroup.isRequired` | `true` | `true` | ⬜ |
| `VariantGroup.displayType` | `BUTTONS` | `BUTTONS` | ⬜ |
| `VariantOption.isActive` | `true` | `true` | ⬜ |
| `Settings.cartEnabled` | `true` | `true` | ⬜ |

### Campos SEO (todos nullable)
| Campo | Backend | Frontend | Status |
|-------|---------|----------|--------|
| `Settings.seoTitle` | `string \| null` | `string \| null` | ⬜ |
| `Settings.seoDescription` | `string \| null` | `string \| null` | ⬜ |
| `Settings.seoKeywords` | `string \| null` | `string \| null` | ⬜ |
| `Settings.ogImage` | `string \| null` | `string \| null` | ⬜ |
| `Settings.googleAnalyticsId` | `string \| null` | `string \| null` | ⬜ |
| `Settings.facebookPixelId` | `string \| null` | `string \| null` | ⬜ |
| `Settings.tiktokPixelId` | `string \| null` | `string \| null` | ⬜ |
| `Settings.googleTagManagerId` | `string \| null` | `string \| null` | ⬜ |
| `Settings.logoPublicId` | `string \| null` | `string \| null` | ⬜ |
| `Settings.ogImagePublicId` | `string \| null` | `string \| null` | ⬜ |
| `Category.seoTitle` | `string \| null` | `string \| null` | ⬜ |
| `Category.seoDescription` | `string \| null` | `string \| null` | ⬜ |
| `Category.seoKeywords` | `string \| null` | `string \| null` | ⬜ |
| `Product.seoTitle` | `string \| null` | `string \| null` | ⬜ |
| `Product.seoDescription` | `string \| null` | `string \| null` | ⬜ |
| `Product.seoKeywords` | `string \| null` | `string \| null` | ⬜ |

---

## Cómo Usar Este Checklist

### Al Crear Backend:
1. ✅ Crear endpoint según la ruta especificada
2. ✅ Crear DTO con TODOS los campos listados
3. ✅ Respetar nullabilidad y valores por defecto
4. ✅ Marcar ⬜ como ✅ cuando esté implementado

### Al Crear Frontend:
1. ✅ Crear función API con la ruta EXACTA del backend
2. ✅ Crear type/interface con TODOS los campos
3. ✅ Verificar que tipos coincidan (especialmente nullables)
4. ✅ Marcar ⬜ como ✅ cuando esté implementado

### Al Integrar:
1. ✅ Verificar que todas las filas tengan ✅
2. ✅ Probar cada endpoint manualmente
3. ✅ Verificar respuestas de error
4. ✅ Verificar casos con campos opcionales/null

---

## Leyenda

- ⬜ = Pendiente
- ✅ = Implementado y verificado
- ⚠️ = Implementado con diferencias (requiere fix)
- ❌ = No implementado / Error
