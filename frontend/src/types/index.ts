// ============================================
// TIPOS BASE DEL CATÁLOGO DIGITAL
// ============================================

// Settings (Configuración del negocio)
export interface Settings {
  id: string;
  businessName: string;
  logo: string | null;
  logoPublicId: string | null;
  whatsapp: string;
  currency: string;
  description: string | null;
  address: string | null;
  schedule: string | null;
  cartEnabled: boolean;
  variantsEnabled: boolean;
  brandsFilterEnabled: boolean;
  welcomeMessage: string | null;
  // SEO
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
  ogImagePublicId: string | null;
  // Tracking
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  facebookPixelId: string | null;
  tiktokPixelId: string | null;
  updatedAt: string;
}

export interface UpdateSettingsDto {
  businessName?: string;
  whatsapp?: string;
  currency?: string;
  description?: string | null;
  address?: string | null;
  schedule?: string | null;
  cartEnabled?: boolean;
  variantsEnabled?: boolean;
  brandsFilterEnabled?: boolean;
  welcomeMessage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  googleAnalyticsId?: string | null;
  googleTagManagerId?: string | null;
  facebookPixelId?: string | null;
  tiktokPixelId?: string | null;
}

// Category (Jerárquica - como WooCommerce)
export interface Category {
  id: string;
  parentId: string | null; // ID de categoría padre (null = raíz)
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  imagePublicId: string | null;
  level: number; // 0 = raíz, 1 = hijo, 2 = nieto, etc.
  order: number;
  isActive: boolean;
  // SEO
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
  _count?: { products: number };
}

// Tipo para árbol de categorías
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  parentId?: string | null; // Categoría padre
  isActive?: boolean;
  order?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export interface ReorderCategoryItem {
  id: string;
  order: number;
}

// Brand
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  logoPublicId: string | null;
  description: string | null;
  order: number;
  isActive: boolean;
  // SEO
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface CreateBrandDto {
  name: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
  order?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
}

export type UpdateBrandDto = Partial<CreateBrandDto>;

export interface ReorderBrandItem {
  id: string;
  order: number;
}

// Tracking Pixels
export type PixelType = 'GOOGLE_ADS' | 'FACEBOOK' | 'TIKTOK' | 'SNAPCHAT' | 'PINTEREST' | 'TWITTER' | 'LINKEDIN' | 'CUSTOM';

export interface TrackingPixel {
  id: string;
  name: string;
  type: PixelType;
  pixelId: string;
  isActive: boolean;
  config: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackingPixelDto {
  name: string;
  type: PixelType;
  pixelId: string;
  isActive?: boolean;
  config?: Record<string, unknown>;
}

export type UpdateTrackingPixelDto = Partial<CreateTrackingPixelDto>;

// Valor de variante del producto principal (Talla=M, Color=Negro)
export interface ProductVariantValue {
  id: string;
  productId: string;
  variantTypeId: string;
  value: string;
  variantType: {
    id: string;
    name: string;
  };
}

export interface Product {
  id: string;
  categoryId: string;
  brandId: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  salePrice: number | string | null;
  discountPercent: number | null;
  showPrice: boolean;
  stock: number | null;
  showStock: boolean;
  stockMessage: string | null;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  // SEO
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string; logo: string | null } | null;
  images?: ProductImage[];
  variantValues?: ProductVariantValue[];
  _count?: { variants: number };
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  order: number;
  createdAt: string;
}

// =============================================
// VARIANTES POR PRODUCTO
// =============================================

export type VariantDisplayType = 'BUTTONS' | 'DROPDOWN' | 'IMAGES';

// Grupo de variante (por producto): Talla, Color, Material
export interface VariantGroup {
  id: string;
  productId: string;
  name: string; // Talla, Color, etc.
  description: string | null;
  displayType: VariantDisplayType;
  isRequired: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  options?: VariantOption[];
}

// Opción de variante: S, M, L, Rojo, Azul
export interface VariantOption {
  id: string;
  groupId: string;
  name: string; // S, M, L, Rojo, Azul
  description: string | null;
  value: string | null; // Valor adicional (hex color, código, etc.)
  price: number | string; // Precio de esta variante
  additionalPrice: number | string; // Precio adicional al base
  stock: number | null; // Stock específico de esta variante
  image: string | null;
  imagePublicId: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// DTOs para grupos de variante
export interface CreateVariantGroupDto {
  name: string;
  description?: string | null;
  displayType?: VariantDisplayType;
  isRequired?: boolean;
  order?: number;
}

export interface UpdateVariantGroupDto {
  name?: string;
  description?: string | null;
  displayType?: VariantDisplayType;
  isRequired?: boolean;
  order?: number;
}

// DTOs para opciones de variante
export interface CreateVariantOptionDto {
  name: string;
  description?: string | null;
  value?: string | null;
  price?: number;
  additionalPrice?: number;
  stock?: number | null;
  order?: number;
}

export interface UpdateVariantOptionDto {
  name?: string;
  description?: string | null;
  value?: string | null;
  price?: number;
  additionalPrice?: number;
  stock?: number | null;
  isActive?: boolean;
  order?: number;
}

export interface ReorderVariantGroupItem {
  id: string;
  order: number;
}

export interface ReorderVariantOptionItem {
  id: string;
  order: number;
}

// =============================================
// COMBOS
// =============================================

export interface ComboProduct {
  id: string;
  comboId: string;
  productId: string;
  quantity: number;
  order: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    salePrice: number | string | null;
    images?: { id: string; url: string; order: number }[];
    category?: { id: string; name: string; slug: string };
    brand?: { id: string; name: string; slug: string; logo: string | null } | null;
  };
}

export interface Combo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  imagePublicId: string | null;
  price: number | string;
  salePrice: number | string | null;
  discountPercent: number | null;
  order: number;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  createdAt: string;
  updatedAt: string;
  comboProducts?: ComboProduct[];
}

export interface CreateComboDto {
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  discountPercent?: number | null;
  isActive?: boolean;
  order?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
}

export type UpdateComboDto = Partial<CreateComboDto>;

export interface ReorderComboItem {
  id: string;
  order: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
  createdAt: string;
  updatedAt: string;
}

// Paginación
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Product DTOs
export interface CreateProductDto {
  categoryId: string;
  brandId?: string | null;
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  discountPercent?: number | null;
  showPrice?: boolean;
  stock?: number | null;
  showStock?: boolean;
  stockMessage?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  // SEO
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  // Variant values (Talla=M, Color=Negro, etc.)
  variantValues?: { variantTypeId: string; value: string }[];
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ReorderImageItem {
  id: string;
  order: number;
}

export interface PaginatedProducts {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Auth
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Query Params
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  brandId?: string;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: 'name' | 'price' | 'order' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'order' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
