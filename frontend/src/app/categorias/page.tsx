import { Metadata } from 'next';
import { getCatalogHome } from '@/lib/api/catalog';
import { CategoriesPage } from './categories-page';
import { CatalogWrapper } from '@/components/catalog';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getCatalogHome();
    const settings = data.settings;

    return {
      title: settings?.seoTitle ? `Categorías | ${settings.seoTitle}` : 'Categorías | Catálogo',
      description: 'Explora todas nuestras categorías de productos',
    };
  } catch {
    return {
      title: 'Categorías | Catálogo',
      description: 'Explora todas nuestras categorías de productos',
    };
  }
}

export default async function CategoriesIndexPage() {
  const data = await getCatalogHome();

  if (!data.settings) {
    return null;
  }

  return (
    <CatalogWrapper settings={data.settings}>
      <CategoriesPage
        categories={data.categories}
        settings={data.settings}
      />
    </CatalogWrapper>
  );
}
