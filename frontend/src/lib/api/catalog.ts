import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Cliente público sin autenticación
const catalogApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para extraer data
catalogApi.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// ============================================
// TYPES
// ============================================

export interface CatalogSettings {
  businessName: string | null;
  logo: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  currency: string;
  description: string | null;
  address: string | null;
  businessHours: string | null;
  cartEnabled: boolean;
  welcomeMessage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
  facebook: string | null;
  instagram: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  facebookPixelId: string | null;
  tiktokPixelId: string | null;
}

// Alias for backward compatibility
export type CatalogHomeData = CatalogHome;

export interface CatalogCategory {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  level: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords?: string | null;
  parent?: CatalogCategory | null;
  children?: CatalogCategory[];
  _count?: { products: number };
}

export interface CatalogBrand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  _count: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  order: number;
}

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
  name: string | null;
  description: string | null;
  price: number | string | null;
  salePrice: number | string | null;
  stock: number | null;
  sku: string | null;
  image: string | null;
  isActive: boolean;
  order: number;
  variantValues: ProductVariantValue[];
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  salePrice: number | string | null;
  showPrice: boolean;
  stock: number | null;
  showStock: boolean;
  stockMessage: string | null;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string; logo: string | null } | null;
  images: ProductImage[];
  variantValues?: ProductVariantValue[];
  variants?: ProductVariant[];
  _count?: { variants: number };
}

export interface CatalogHome {
  settings: CatalogSettings | null;
  categories: CatalogCategory[];
  featuredProducts: CatalogProduct[];
  brands: CatalogBrand[];
}

export interface CatalogCategoryFilters {
  brands: { id: string; name: string; slug: string; logo: string | null }[];
  priceRange: { min: number; max: number };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CatalogCategoryPage {
  category: CatalogCategory;
  products: CatalogProduct[];
  filters: CatalogCategoryFilters;
  meta: PaginationMeta;
}

export interface CatalogSearchResult {
  query: string;
  products: CatalogProduct[];
  meta: PaginationMeta;
}

// Alias for backward compatibility
export type CatalogSearchResponse = CatalogSearchResult;

export interface CatalogProductDetail extends CatalogProduct {
  // Tipo de variante que tiene imágenes vinculadas (ej: Color, Sabor)
  imageVariantType?: {
    id: string;
    name: string;
  } | null;
  // Imágenes por valor de variante (array completo)
  variantValueImages?: VariantValueImage[];
  // Imágenes agrupadas por valor para fácil acceso (ej: { "Negro": [...], "Blanco": [...] })
  imagesByVariantValue?: Record<string, VariantValueImage[]>;
  relatedProducts: CatalogProduct[];
}

// ============================================
// API FUNCTIONS
// ============================================

export async function getCatalogHome(): Promise<CatalogHome> {
  const { data } = await catalogApi.get<CatalogHome>('/catalog');
  return data;
}

export async function getCatalogProduct(slug: string): Promise<CatalogProductDetail> {
  const { data } = await catalogApi.get<CatalogProductDetail>(`/catalog/products/${slug}`);
  return data;
}

export async function getCatalogCategory(
  slug: string,
  params?: {
    page?: number;
    limit?: number;
    sortBy?: 'order' | 'price' | 'name' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    minPrice?: number;
    maxPrice?: number;
    brandId?: string;
  }
): Promise<CatalogCategoryPage> {
  const { data } = await catalogApi.get<CatalogCategoryPage>(`/catalog/categories/${slug}`, {
    params,
  });
  return data;
}

export async function searchCatalog(
  params: {
    q: string;
    page?: number;
    limit?: number;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'name';
  }
): Promise<CatalogSearchResult> {
  const { data } = await catalogApi.get<CatalogSearchResult>('/catalog/search', { params });
  return data;
}

export async function trackEvent(event: {
  type: 'PAGE_VIEW' | 'PRODUCT_VIEW' | 'WHATSAPP_CLICK' | 'CATEGORY_VIEW' | 'SEARCH' | 'ADD_TO_CART';
  productId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await catalogApi.post('/catalog/track', event);
}

export default catalogApi;
