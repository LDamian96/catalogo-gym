# API Client - Frontend

Esta es la documentación OFICIAL de cómo consumir el backend desde el frontend.

## Configuración Base

```typescript
// lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
```

---

## AUTH API

```typescript
// lib/api/auth.ts

// POST /auth/login
export async function login(data: { email: string; password: string }) {
  // Returns: { user, accessToken, refreshToken, expiresIn }
}

// POST /auth/refresh
export async function refreshToken(refreshToken: string) {
  // Returns: { accessToken, expiresIn }
}

// POST /auth/logout
export async function logout() {
  // Returns: { message }
}

// GET /auth/me
export async function getCurrentUser() {
  // Returns: { id, email, name, role }
}
```

---

## SETTINGS API

```typescript
// lib/api/settings.ts

// GET /settings
export async function getSettings() {
  // Returns: Settings
}

// PATCH /settings
export async function updateSettings(data: UpdateSettingsDto) {
  // Returns: Settings
}

// POST /settings/logo
export async function uploadLogo(file: File) {
  // Returns: { logo, logoPublicId }
}
```

**UpdateSettingsDto:**
```typescript
interface UpdateSettingsDto {
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

## CATEGORIES API

```typescript
// lib/api/categories.ts

// GET /categories
export async function getCategories(params?: {
  includeInactive?: boolean;
  includeProducts?: boolean;
}) {
  // Returns: Category[]
}

// GET /categories/:id
export async function getCategory(id: string) {
  // Returns: Category
}

// POST /categories
export async function createCategory(data: CreateCategoryDto) {
  // Returns: Category
}

// PATCH /categories/:id
export async function updateCategory(id: string, data: UpdateCategoryDto) {
  // Returns: Category
}

// DELETE /categories/:id
export async function deleteCategory(id: string) {
  // Returns: { message }
}

// POST /categories/:id/image
export async function uploadCategoryImage(id: string, file: File) {
  // Returns: { image, imagePublicId }
}

// PATCH /categories/reorder
export async function reorderCategories(order: Array<{ id: string; order: number }>) {
  // Returns: { message }
}
```

**CreateCategoryDto:**
```typescript
interface CreateCategoryDto {
  name: string;
  isActive?: boolean;
}
```

---

## PRODUCTS API

```typescript
// lib/api/products.ts

// GET /products
export async function getProducts(params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  // Returns: { items: Product[], pagination: Pagination }
}

// GET /products/:id
export async function getProduct(id: string) {
  // Returns: Product (con images, variantGroups, category)
}

// POST /products
export async function createProduct(data: CreateProductDto) {
  // Returns: Product
}

// PATCH /products/:id
export async function updateProduct(id: string, data: UpdateProductDto) {
  // Returns: Product
}

// DELETE /products/:id
export async function deleteProduct(id: string) {
  // Returns: { message }
}

// POST /products/:id/duplicate
export async function duplicateProduct(id: string) {
  // Returns: Product (copia)
}

// POST /products/:id/images
export async function uploadProductImages(id: string, files: File[]) {
  // Returns: { images: ProductImage[] }
}

// DELETE /products/:id/images/:imageId
export async function deleteProductImage(productId: string, imageId: string) {
  // Returns: { message }
}

// PATCH /products/:id/images/reorder
export async function reorderProductImages(productId: string, order: Array<{ id: string; order: number }>) {
  // Returns: { message }
}
```

**CreateProductDto:**
```typescript
interface CreateProductDto {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  showPrice?: boolean;
  stock?: number | null;
  showStock?: boolean;
  stockMessage?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}
```

---

## VARIANTS API

```typescript
// lib/api/variants.ts

// POST /products/:productId/variant-groups
export async function createVariantGroup(productId: string, data: CreateVariantGroupDto) {
  // Returns: VariantGroup
}

// PATCH /variant-groups/:id
export async function updateVariantGroup(id: string, data: UpdateVariantGroupDto) {
  // Returns: VariantGroup
}

// DELETE /variant-groups/:id
export async function deleteVariantGroup(id: string) {
  // Returns: { message }
}

// PATCH /variant-groups/reorder
export async function reorderVariantGroups(order: Array<{ id: string; order: number }>) {
  // Returns: { message }
}

// POST /variant-groups/:groupId/options
export async function createVariantOption(groupId: string, data: CreateVariantOptionDto) {
  // Returns: VariantOption
}

// PATCH /variant-options/:id
export async function updateVariantOption(id: string, data: UpdateVariantOptionDto) {
  // Returns: VariantOption
}

// DELETE /variant-options/:id
export async function deleteVariantOption(id: string) {
  // Returns: { message }
}

// POST /variant-options/:id/image
export async function uploadVariantOptionImage(id: string, file: File) {
  // Returns: { image, imagePublicId }
}

// PATCH /variant-options/reorder
export async function reorderVariantOptions(order: Array<{ id: string; order: number }>) {
  // Returns: { message }
}
```

**CreateVariantGroupDto:**
```typescript
interface CreateVariantGroupDto {
  name: string;
  isRequired?: boolean;
  displayType?: 'BUTTONS' | 'DROPDOWN' | 'IMAGES';
}
```

**CreateVariantOptionDto:**
```typescript
interface CreateVariantOptionDto {
  name: string;
  additionalPrice?: number;
  isActive?: boolean;
}
```

---

## CATALOG API (Público)

```typescript
// lib/api/catalog.ts

// GET /catalog
export async function getCatalog(params?: {
  categorySlug?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  // Returns: { settings, categories, products, featured }
}

// GET /catalog/products/:slug
export async function getPublicProduct(slug: string) {
  // Returns: { product, related }
}

// GET /catalog/categories/:slug
export async function getPublicCategory(slug: string) {
  // Returns: { category, products }
}

// GET /catalog/search
export async function searchProducts(params: {
  q: string;
  page?: number;
  limit?: number;
}) {
  // Returns: { items, pagination }
}

// POST /catalog/track
export async function trackEvent(data: TrackEventDto) {
  // Returns: { success }
}
```

**TrackEventDto:**
```typescript
interface TrackEventDto {
  type: 'PAGE_VIEW' | 'PRODUCT_VIEW' | 'WHATSAPP_CLICK' | 'CATEGORY_VIEW' | 'SEARCH';
  productId?: string;
  categoryId?: string;
  query?: string;
}
```

---

## STATS API

```typescript
// lib/api/stats.ts

// GET /stats/dashboard
export async function getDashboardStats() {
  // Returns: DashboardStats
}

// GET /stats/products/:id
export async function getProductStats(id: string, params?: {
  startDate?: string;
  endDate?: string;
}) {
  // Returns: ProductStats
}
```

---

## IMPORT API

```typescript
// lib/api/import.ts

// POST /import/excel
export async function importExcel(file: File) {
  // Returns: { jobId, message, statusUrl }
}

// GET /import/status/:jobId
export async function getImportStatus(jobId: string) {
  // Returns: ImportStatus
}

// GET /import/template
export async function downloadTemplate() {
  // Returns: Blob (archivo xlsx)
}
```

---

## Tipos de Respuesta

### Pagination
```typescript
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### ApiResponse
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface ApiError {
  success: false;
  error: {
    code: number;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  timestamp: string;
}
```

---

## Uso en Componentes

### Server Component (RSC)
```typescript
// app/(catalog)/page.tsx
export default async function CatalogPage() {
  const data = await getCatalog();
  return <CatalogView {...data} />;
}
```

### Client Component con React Query
```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function ProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

### Manejo de Errores
```typescript
try {
  const product = await createProduct(data);
  toast.success('Producto creado');
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
    // Mostrar errores de validación
    error.details?.forEach(d => {
      form.setError(d.field, { message: d.message });
    });
  }
}
```
