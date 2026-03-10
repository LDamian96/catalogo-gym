import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCatalogCategory, getCatalogHome } from '@/lib/api/catalog';
import { CategoryProducts } from './category-products';
import { CategoryJsonLd, BreadcrumbJsonLd } from '@/components/seo';
import { CatalogWrapper } from '@/components/catalog';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; minPrice?: string; maxPrice?: string; sort?: string; brandId?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getCatalogCategory(slug, { page: 1, limit: 1 });
    const { category } = data;

    return {
      title: category.seoTitle || `${category.name} | Catálogo`,
      description: category.seoDescription || category.description || `Explora productos en ${category.name}`,
      keywords: category.seoKeywords || undefined,
      openGraph: {
        title: category.seoTitle || category.name,
        description: category.seoDescription || category.description || `Explora productos en ${category.name}`,
        images: category.image ? [{ url: category.image, alt: category.name }] : [],
        type: 'website',
      },
    };
  } catch {
    return {
      title: 'Categoría no encontrada',
    };
  }
}

// Map frontend sort values to backend sortBy/sortOrder
function getSortParams(sort?: string): { sortBy?: 'order' | 'price' | 'name' | 'createdAt'; sortOrder?: 'asc' | 'desc' } {
  switch (sort) {
    case 'newest':
      return { sortBy: 'createdAt', sortOrder: 'desc' };
    case 'price_asc':
      return { sortBy: 'price', sortOrder: 'asc' };
    case 'price_desc':
      return { sortBy: 'price', sortOrder: 'desc' };
    case 'name':
      return { sortBy: 'name', sortOrder: 'asc' };
    default:
      return { sortBy: 'order', sortOrder: 'asc' };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page = '1', minPrice, maxPrice, sort, brandId } = await searchParams;

  try {
    const sortParams = getSortParams(sort);

    const [categoryData, homeData] = await Promise.all([
      getCatalogCategory(slug, {
        page: parseInt(page),
        limit: 12,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        brandId: brandId || undefined,
        ...sortParams,
      }),
      getCatalogHome(),
    ]);

    // If no settings, we can't render properly
    if (!homeData.settings) {
      notFound();
    }

    const breadcrumbs = [
      { name: 'Inicio', url: '/' },
      { name: 'Categorías', url: '/categorias' },
      { name: categoryData.category.name, url: `/categorias/${categoryData.category.slug}` },
    ];

    return (
      <CatalogWrapper settings={homeData.settings}>
        <CategoryJsonLd category={categoryData.category} products={categoryData.products} />
        <BreadcrumbJsonLd items={breadcrumbs} />
        <CategoryProducts
          category={categoryData.category}
          products={categoryData.products}
          pagination={categoryData.meta}
          filters={categoryData.filters}
          settings={homeData.settings}
          categories={homeData.categories}
          currentSort={sort}
          currentMinPrice={minPrice}
          currentMaxPrice={maxPrice}
        />
      </CatalogWrapper>
    );
  } catch (error) {
    console.error('Error loading category:', error);
    notFound();
  }
}
