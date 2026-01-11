import api from './client';

// =============================================
// VARIANT TYPES (Tipos globales: Talla, Color, Material)
// =============================================

export interface VariantTypeValue {
  id: string;
  value: string;
  order: number;
  isActive: boolean;
}

export interface VariantType {
  id: string;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  values: VariantTypeValue[];
}

export async function getVariantTypes(includeInactive = false): Promise<VariantType[]> {
  const { data } = await api.get<VariantType[]>(`/variant-types?includeInactive=${includeInactive}`);
  return data;
}

// =============================================
// PRODUCT VARIANTS (Sub-productos de un producto)
// =============================================

export interface ProductVariantValue {
  id: string;
  variantTypeId: string;
  value: string;
  variantType: {
    id: string;
    name: string;
  };
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string | null;
  description: string | null;
  price: number | null;
  salePrice: number | null;
  discountPercent: number | null;
  stock: number | null;
  sku: string | null;
  image: string | null;
  imagePublicId: string | null;
  isActive: boolean;
  order: number;
  variantValues: ProductVariantValue[];
}

export interface CreateProductVariantDto {
  name?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  discountPercent?: number;
  stock?: number;
  sku?: string;
  isActive?: boolean;
  variantValues: { variantTypeId: string; value: string }[];
}

export interface UpdateProductVariantDto {
  name?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  discountPercent?: number;
  stock?: number;
  sku?: string;
  isActive?: boolean;
  variantValues?: { variantTypeId: string; value: string }[];
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const { data } = await api.get<ProductVariant[]>(`/products/${productId}/variants`);
  return data;
}

export async function getProductVariant(id: string): Promise<ProductVariant> {
  const { data } = await api.get<ProductVariant>(`/product-variants/${id}`);
  return data;
}

export async function createProductVariant(productId: string, dto: CreateProductVariantDto): Promise<ProductVariant> {
  const { data } = await api.post<ProductVariant>(`/products/${productId}/variants`, dto);
  return data;
}

export async function updateProductVariant(id: string, dto: UpdateProductVariantDto): Promise<ProductVariant> {
  const { data } = await api.patch<ProductVariant>(`/product-variants/${id}`, dto);
  return data;
}

export async function deleteProductVariant(id: string): Promise<void> {
  await api.delete(`/product-variants/${id}`);
}

export async function uploadProductVariantImage(id: string, file: File): Promise<ProductVariant> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<ProductVariant>(`/product-variants/${id}/image`, formData);
  return data;
}

export async function deleteProductVariantImage(id: string): Promise<ProductVariant> {
  const { data } = await api.delete<ProductVariant>(`/product-variants/${id}/image`);
  return data;
}

export async function reorderProductVariants(productId: string, items: { id: string; order: number }[]): Promise<ProductVariant[]> {
  const { data } = await api.patch<ProductVariant[]>(`/products/${productId}/variants/reorder`, { items });
  return data;
}

export interface GenerateCombinationsResult {
  created: number;
  skipped: number;
  variants: ProductVariant[];
}

/**
 * Generar todas las combinaciones de variantes automáticamente
 * Ejemplo: Talla (S, M, L) x Color (Rojo, Azul) = 6 variantes
 */
export async function generateVariantCombinations(productId: string): Promise<GenerateCombinationsResult> {
  const { data } = await api.post<GenerateCombinationsResult>(`/products/${productId}/variants/generate`);
  return data;
}

/**
 * Eliminar todas las variantes de un producto
 */
export async function deleteAllProductVariants(productId: string): Promise<void> {
  await api.delete(`/products/${productId}/variants`);
}

// =============================================
// VARIANT VALUE IMAGES (Imágenes por valor de variante)
// Ejemplo: Color "Negro" tiene múltiples imágenes
// =============================================

export interface VariantValueImage {
  id: string;
  productId: string;
  variantTypeId: string;
  value: string;
  url: string;
  publicId: string;
  order: number;
  createdAt: string;
  variantType: {
    id: string;
    name: string;
  };
}

export interface ImageVariantConfig {
  imageVariantType: {
    id: string;
    name: string;
  } | null;
  imagesByValue: Record<string, VariantValueImage[]>;
  totalImages: number;
}

/**
 * Obtener todas las imágenes por valor de variante de un producto
 */
export async function getVariantValueImages(productId: string): Promise<VariantValueImage[]> {
  const { data } = await api.get<VariantValueImage[]>(`/products/${productId}/variant-value-images`);
  return data;
}

/**
 * Obtener configuración completa de imágenes por variante
 */
export async function getImageVariantConfig(productId: string): Promise<ImageVariantConfig> {
  const { data } = await api.get<ImageVariantConfig>(`/products/${productId}/variant-value-images/config`);
  return data;
}

/**
 * Obtener imágenes de un valor específico (ej: Color="Negro")
 */
export async function getImagesByValue(
  productId: string,
  variantTypeId: string,
  value: string,
): Promise<VariantValueImage[]> {
  const { data } = await api.get<VariantValueImage[]>(
    `/products/${productId}/variant-value-images/by-value?variantTypeId=${variantTypeId}&value=${encodeURIComponent(value)}`,
  );
  return data;
}

/**
 * Subir imagen para un valor de variante (ej: Color="Negro")
 */
export async function uploadVariantValueImage(
  productId: string,
  variantTypeId: string,
  value: string,
  file: File,
): Promise<VariantValueImage> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('variantTypeId', variantTypeId);
  formData.append('value', value);

  const { data } = await api.post<VariantValueImage>(
    `/products/${productId}/variant-value-images`,
    formData,
  );
  return data;
}

/**
 * Eliminar una imagen de valor de variante
 */
export async function deleteVariantValueImage(imageId: string): Promise<void> {
  await api.delete(`/variant-value-images/${imageId}`);
}

/**
 * Eliminar todas las imágenes de un valor específico
 */
export async function deleteAllImagesByValue(
  productId: string,
  variantTypeId: string,
  value: string,
): Promise<void> {
  await api.delete(
    `/products/${productId}/variant-value-images/by-value?variantTypeId=${variantTypeId}&value=${encodeURIComponent(value)}`,
  );
}

/**
 * Reordenar imágenes de valores de variante
 */
export async function reorderVariantValueImages(
  productId: string,
  items: { id: string; order: number }[],
): Promise<VariantValueImage[]> {
  const { data } = await api.patch<VariantValueImage[]>(
    `/products/${productId}/variant-value-images/reorder`,
    { items },
  );
  return data;
}

/**
 * Establecer qué tipo de variante tiene imágenes vinculadas
 */
export async function setImageVariantType(
  productId: string,
  variantTypeId: string | null,
): Promise<{ imageVariantType: { id: string; name: string } | null }> {
  const { data } = await api.patch<{ imageVariantType: { id: string; name: string } | null }>(
    `/products/${productId}/image-variant-type`,
    { variantTypeId },
  );
  return data;
}
