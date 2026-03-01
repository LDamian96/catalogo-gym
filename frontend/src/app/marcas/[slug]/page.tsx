import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCatalogBrand, getCatalogHome } from '@/lib/api/catalog';
import { BrandProducts } from './brand-products';
import { BreadcrumbJsonLd, JsonLd } from '@/components/seo';
import { CatalogWrapper } from '@/components/catalog';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; minPrice?: string; maxPrice?: string; sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getCatalogBrand(slug, { page: 1, limit: 1 });
    const { brand } = data;

    const title = brand.seoTitle || `${brand.name} | Catálogo`;
    const description = brand.seoDescription || brand.description || `Explora todos los productos de ${brand.name}. Los mejores precios y delivery.`;

    return {
      title,
      description,
      keywords: brand.seoKeywords || `${brand.name}, suplementos, precios, delivery`,
      openGraph: {
        title: brand.seoTitle || brand.name,
        description,
        images: brand.logo ? [{ url: brand.logo, alt: brand.name }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: brand.seoTitle || brand.name,
        description,
        images: brand.logo ? [brand.logo] : [],
      },
      alternates: {
        canonical: `/marcas/${slug}`,
      },
    };
  } catch {
    return { title: 'Marca no encontrada' };
  }
}

function getSortParams(sort?: string): { sortBy?: 'order' | 'price' | 'name' | 'createdAt'; sortOrder?: 'asc' | 'desc' } {
  switch (sort) {
    case 'newest': return { sortBy: 'createdAt', sortOrder: 'desc' };
    case 'price_asc': return { sortBy: 'price', sortOrder: 'asc' };
    case 'price_desc': return { sortBy: 'price', sortOrder: 'desc' };
    case 'name': return { sortBy: 'name', sortOrder: 'asc' };
    default: return { sortBy: 'order', sortOrder: 'asc' };
  }
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page = '1', minPrice, maxPrice, sort } = await searchParams;

  try {
    const sortParams = getSortParams(sort);

    const [brandData, homeData] = await Promise.all([
      getCatalogBrand(slug, {
        page: parseInt(page),
        limit: 12,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        ...sortParams,
      }),
      getCatalogHome(),
    ]);

    if (!homeData.settings) {
      notFound();
    }

    const breadcrumbs = [
      { name: 'Inicio', url: '/' },
      { name: 'Productos', url: '/productos' },
      { name: brandData.brand.name, url: `/marcas/${brandData.brand.slug}` },
    ];

    // Brand JSON-LD
    const brandJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Brand',
      name: brandData.brand.name,
      description: brandData.brand.description || brandData.brand.seoDescription,
      logo: brandData.brand.logo || undefined,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/marcas/${slug}`,
    };

    // ItemList JSON-LD for products
    const itemListJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Productos de ${brandData.brand.name}`,
      description: brandData.brand.description || `Todos los productos de ${brandData.brand.name}`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/marcas/${slug}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: brandData.products.slice(0, 10).map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/productos/${product.slug}`,
          name: product.name,
        })),
      },
    };

    return (
      <CatalogWrapper settings={homeData.settings}>
        <JsonLd data={brandJsonLd} />
        <JsonLd data={itemListJsonLd} />
        <BreadcrumbJsonLd items={breadcrumbs} />
        <BrandProducts
          brand={brandData.brand}
          products={brandData.products}
          pagination={brandData.meta}
          filters={brandData.filters}
          settings={homeData.settings}
          categories={homeData.categories}
          currentSort={sort}
          currentMinPrice={minPrice}
          currentMaxPrice={maxPrice}
        />
      </CatalogWrapper>
    );
  } catch (error) {
    console.error('Error loading brand:', error);
    notFound();
  }
}
