import { Metadata } from 'next';
import { getCatalogCombos, getCatalogHome } from '@/lib/api/catalog';
import { CombosListing } from './combos-listing';
import { CatalogWrapper } from '@/components/catalog';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Combos y Packs | Ahorra comprando en combo',
    description: 'Descubre nuestros combos y packs con descuento. Ahorra comprando tus productos favoritos en combo.',
  };
}

export default async function CombosPage() {
  const [combos, homeData] = await Promise.all([
    getCatalogCombos(),
    getCatalogHome(),
  ]);

  if (!homeData.settings) {
    return null;
  }

  return (
    <CatalogWrapper settings={homeData.settings}>
      <CombosListing
        combos={combos}
        settings={homeData.settings}
        categories={homeData.categories}
      />
    </CatalogWrapper>
  );
}
