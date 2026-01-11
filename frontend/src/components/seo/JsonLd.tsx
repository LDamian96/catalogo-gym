import type { CatalogSettings, CatalogProduct, CatalogCategory } from '@/lib/api/catalog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization Schema
export function OrganizationJsonLd({ settings }: { settings: CatalogSettings }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.businessName || 'Catálogo Digital',
    description: settings.description || settings.seoDescription,
    url: SITE_URL,
    logo: settings.logo || undefined,
    address: settings.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
        }
      : undefined,
    contactPoint: settings.whatsapp
      ? {
          '@type': 'ContactPoint',
          telephone: settings.whatsapp,
          contactType: 'customer service',
          availableLanguage: 'Spanish',
        }
      : undefined,
    sameAs: [
      settings.facebook,
      settings.instagram,
    ].filter(Boolean),
  };

  return <JsonLd data={data} />;
}

// WebSite Schema (para búsqueda)
export function WebSiteJsonLd({ settings }: { settings: CatalogSettings }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.businessName || 'Catálogo Digital',
    description: settings.seoDescription,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/buscar?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={data} />;
}

// Product Schema
export function ProductJsonLd({
  product,
  settings,
}: {
  product: CatalogProduct;
  settings: CatalogSettings;
}) {
  const price = product.salePrice || product.price;
  const mainImage = product.images?.[0]?.url;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.seoDescription,
    image: mainImage ? [mainImage] : undefined,
    sku: product.id,
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand.name,
        }
      : undefined,
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/productos/${product.slug}`,
      priceCurrency: 'PEN',
      price: typeof price === 'string' ? parseFloat(price) : price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stock && product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: settings.businessName || 'Catálogo Digital',
      },
    },
  };

  return <JsonLd data={data} />;
}

// BreadcrumbList Schema
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return <JsonLd data={data} />;
}

// ItemList Schema (para categorías con productos)
export function CategoryJsonLd({
  category,
  products,
}: {
  category: CatalogCategory;
  products: CatalogProduct[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || category.seoDescription,
    url: `${SITE_URL}/categorias/${category.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/productos/${product.slug}`,
        name: product.name,
      })),
    },
  };

  return <JsonLd data={data} />;
}

// LocalBusiness Schema (alternativa a Organization)
export function LocalBusinessJsonLd({ settings }: { settings: CatalogSettings }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.businessName || 'Catálogo Digital',
    description: settings.description || settings.seoDescription,
    url: SITE_URL,
    image: settings.logo || settings.ogImage,
    telephone: settings.whatsapp,
    address: settings.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
          addressCountry: 'PE',
        }
      : undefined,
    openingHours: settings.businessHours,
    priceRange: '$$',
    sameAs: [
      settings.facebook,
      settings.instagram,
    ].filter(Boolean),
  };

  return <JsonLd data={data} />;
}
