import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface Category {
  slug: string;
  updatedAt?: string;
}

interface Product {
  slug: string;
  updatedAt?: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/catalog`, {
      next: { revalidate: 3600 }, // Revalidar cada hora
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.categories || data.categories || [];
  } catch {
    return [];
  }
}

async function getAllProducts(): Promise<Product[]> {
  try {
    // Obtener todos los productos paginando
    const products: Product[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 20) { // Máximo 20 páginas (1000 productos)
      const res = await fetch(`${API_URL}/catalog/search?q=&page=${page}&limit=50`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;

      const data = await res.json();
      const pageProducts = data.data?.products || data.products || [];
      products.push(...pageProducts);

      const meta = data.data?.meta || data.meta;
      hasMore = meta?.hasNextPage || false;
      page++;
    }

    return products;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getAllProducts(),
  ]);

  const now = new Date().toISOString();

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/categorias`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/productos`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Páginas de categorías
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/categorias/${category.slug}`,
    lastModified: category.updatedAt || now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Páginas de productos
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/productos/${product.slug}`,
    lastModified: product.updatedAt || now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
