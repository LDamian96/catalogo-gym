/**
 * Auto-genera campos SEO cuando el admin los deja vacíos.
 * Usa datos del producto/combo/categoría/marca + nombre del negocio.
 */

interface ProductSeoInput {
  name: string;
  categoryName?: string;
  brandName?: string;
  price?: number | string;
  currency?: string;
  businessName?: string;
}

interface ComboSeoInput {
  name: string;
  price?: number | string;
  currency?: string;
  productCount?: number;
  businessName?: string;
}

interface CategorySeoInput {
  name: string;
  businessName?: string;
}

interface BrandSeoInput {
  name: string;
  businessName?: string;
}

interface SeoFields {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

export function generateProductSeo(input: ProductSeoInput): SeoFields {
  const { name, categoryName, brandName, price, currency = 'S/', businessName } = input;

  const brandPart = brandName ? ` de ${brandName}` : '';
  const shopPart = businessName ? ` - ${businessName}` : '';
  const pricePart = price ? ` Precio: ${currency} ${Number(price).toFixed(2)}.` : '';
  const categoryPart = categoryName ? ` en ${categoryName}` : '';

  const seoTitle = truncate(`${name}${brandPart}${shopPart}`, 70);
  const seoDescription = truncate(
    `Compra ${name}${brandPart}.${pricePart} Envío a domicilio.${categoryPart}. ${businessName || 'Catálogo digital'}.`,
    160,
  );

  const keywords = [
    name.toLowerCase(),
    brandName?.toLowerCase(),
    categoryName?.toLowerCase(),
    businessName?.toLowerCase(),
    'delivery',
    'envío',
  ].filter(Boolean).join(', ');

  return {
    seoTitle,
    seoDescription,
    seoKeywords: truncate(keywords, 200),
  };
}

export function generateComboSeo(input: ComboSeoInput): SeoFields {
  const { name, price, currency = 'S/', productCount, businessName } = input;

  const shopPart = businessName ? ` - ${businessName}` : '';
  const pricePart = price ? ` Precio: ${currency} ${Number(price).toFixed(2)}.` : '';
  const productsPart = productCount ? ` ${productCount} productos incluidos.` : '';

  const seoTitle = truncate(`${name}${shopPart}`, 70);
  const seoDescription = truncate(
    `${name}.${pricePart}${productsPart} Ahorra comprando en combo. ${businessName || 'Catálogo digital'}.`,
    160,
  );

  const keywords = [
    name.toLowerCase(),
    'combo',
    'pack',
    'oferta',
    businessName?.toLowerCase(),
    'delivery',
  ].filter(Boolean).join(', ');

  return {
    seoTitle,
    seoDescription,
    seoKeywords: truncate(keywords, 200),
  };
}

export function generateCategorySeo(input: CategorySeoInput): SeoFields {
  const { name, businessName } = input;
  const shopPart = businessName ? ` - ${businessName}` : '';

  const seoTitle = truncate(`${name}${shopPart}`, 70);
  const seoDescription = truncate(
    `Explora productos de ${name}. Catálogo completo con precios y envío a domicilio. ${businessName || 'Catálogo digital'}.`,
    160,
  );

  const keywords = [
    name.toLowerCase(),
    'productos',
    businessName?.toLowerCase(),
    'catálogo',
    'delivery',
  ].filter(Boolean).join(', ');

  return {
    seoTitle,
    seoDescription,
    seoKeywords: truncate(keywords, 200),
  };
}

export function generateBrandSeo(input: BrandSeoInput): SeoFields {
  const { name, businessName } = input;
  const shopPart = businessName ? ` - ${businessName}` : '';

  const seoTitle = truncate(`${name}${shopPart}`, 70);
  const seoDescription = truncate(
    `Todos los productos de ${name}. Precios, disponibilidad y envío a domicilio. ${businessName || 'Catálogo digital'}.`,
    160,
  );

  const keywords = [
    name.toLowerCase(),
    'marca',
    'productos',
    businessName?.toLowerCase(),
    'delivery',
  ].filter(Boolean).join(', ');

  return {
    seoTitle,
    seoDescription,
    seoKeywords: truncate(keywords, 200),
  };
}
