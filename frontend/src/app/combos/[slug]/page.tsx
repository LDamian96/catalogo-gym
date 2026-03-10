import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCatalogCombo, getCatalogCombos, getCatalogHome } from '@/lib/api/catalog';
import { ComboDetail } from './combo-detail';
import { CatalogWrapper } from '@/components/catalog';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const combo = await getCatalogCombo(slug);
    return {
      title: combo.seoTitle || `${combo.name} | Combo`,
      description: combo.seoDescription || combo.description || `Descubre el ${combo.name}`,
      keywords: combo.seoKeywords || undefined,
      openGraph: {
        title: combo.seoTitle || combo.name,
        description: combo.seoDescription || combo.description || `Descubre el ${combo.name}`,
        images: combo.image ? [{ url: combo.image, alt: combo.name }] : [],
        type: 'website',
      },
    };
  } catch {
    return { title: 'Combo no encontrado' };
  }
}

export default async function ComboPage({ params }: Props) {
  const { slug } = await params;

  try {
    const [combo, homeData, allCombos] = await Promise.all([
      getCatalogCombo(slug),
      getCatalogHome(),
      getCatalogCombos(),
    ]);

    if (!homeData.settings) {
      notFound();
    }

    const otherCombos = allCombos.filter(c => c.slug !== slug);

    return (
      <CatalogWrapper settings={homeData.settings}>
        <ComboDetail
          combo={combo}
          settings={homeData.settings}
          categories={homeData.categories}
          otherCombos={otherCombos}
        />
      </CatalogWrapper>
    );
  } catch (error) {
    console.error('Error loading combo:', error);
    notFound();
  }
}
