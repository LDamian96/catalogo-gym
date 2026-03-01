import { Metadata } from 'next';
import { searchCatalog, getCatalogHome } from '@/lib/api/catalog';
import { SearchResults } from './search-results';
import { CatalogWrapper } from '@/components/catalog';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{
    q?: string;
    page?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    filter?: string;
    marca?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;

  return {
    title: q ? `Resultados para "${q}" | Catálogo` : 'Productos | Catálogo',
    description: q
      ? `Encuentra productos relacionados con "${q}" en nuestro catálogo`
      : 'Explora todos nuestros productos',
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page = '1', categoryId, minPrice, maxPrice, sort, filter, marca } = await searchParams;

  const homeData = await getCatalogHome();

  // Always search - if no query, shows all products
  let searchData = null;
  try {
    searchData = await searchCatalog({
      q: q || '',
      page: parseInt(page),
      limit: 12,
      categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sort: sort as 'newest' | 'price_asc' | 'price_desc' | 'name' | 'relevance' | undefined,
    });
  } catch (error) {
    console.error('Search error:', error);
  }

  // If no settings, we can't render properly
  if (!homeData.settings) {
    return null;
  }

  return (
    <CatalogWrapper settings={homeData.settings}>
      <SearchResults
        initialQuery={q || ''}
        initialResults={searchData}
        settings={homeData.settings}
        categories={homeData.categories}
        initialFilter={filter}
        initialBrandSlug={marca}
      />
    </CatalogWrapper>
  );
}
