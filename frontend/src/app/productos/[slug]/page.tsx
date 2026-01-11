import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCatalogProduct, getCatalogHome } from '@/lib/api/catalog';
import { ProductDetail } from './product-detail';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo';
import { CatalogWrapper } from '@/components/catalog';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getCatalogProduct(slug);
    const mainImage = product.images?.[0]?.url;

    return {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.description || `Descubre ${product.name}`,
      keywords: product.seoKeywords || undefined,
      openGraph: {
        title: product.seoTitle || product.name,
        description: product.seoDescription || product.description || `Descubre ${product.name}`,
        images: mainImage ? [{ url: mainImage, alt: product.name }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.seoTitle || product.name,
        description: product.seoDescription || product.description || `Descubre ${product.name}`,
        images: mainImage ? [mainImage] : [],
      },
    };
  } catch {
    return { title: 'Producto no encontrado' };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  try {
    const [product, homeData] = await Promise.all([
      getCatalogProduct(slug),
      getCatalogHome(),
    ]);

    if (!homeData.settings) {
      notFound();
    }

    const breadcrumbs = [
      { name: 'Inicio', url: '/' },
      { name: 'Categorías', url: '/categorias' },
      { name: product.category.name, url: `/categorias/${product.category.slug}` },
      { name: product.name, url: `/productos/${product.slug}` },
    ];

    return (
      <CatalogWrapper settings={homeData.settings}>
        <ProductJsonLd product={product} settings={homeData.settings} />
        <BreadcrumbJsonLd items={breadcrumbs} />
        <ProductDetail
          product={product}
          relatedProducts={product.relatedProducts}
          settings={homeData.settings}
        />
      </CatalogWrapper>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }
}
