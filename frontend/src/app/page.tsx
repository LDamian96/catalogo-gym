import { Suspense } from 'react';
import { Metadata } from 'next';
import { getCatalogHome } from '@/lib/api/catalog';
import { CatalogLanding } from './catalog-landing';
import { OrganizationJsonLd, WebSiteJsonLd, LocalBusinessJsonLd } from '@/components/seo';
import { CatalogWrapper } from '@/components/catalog';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

async function getCatalogData() {
  try {
    return await getCatalogHome();
  } catch (error) {
    console.error('Error fetching catalog data:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getCatalogHome();
    const settings = data.settings;

    if (!settings) {
      return { title: 'Catálogo', description: 'Explora nuestros productos' };
    }

    return {
      title: settings.seoTitle || settings.businessName || 'Catálogo',
      description: settings.seoDescription || settings.description || 'Explora nuestros productos',
      keywords: settings.seoKeywords || undefined,
      openGraph: {
        title: settings.seoTitle || settings.businessName || 'Catálogo',
        description: settings.seoDescription || settings.description || 'Explora nuestros productos',
        images: settings.ogImage ? [{ url: settings.ogImage, alt: settings.businessName || 'Catálogo' }] : [],
        type: 'website',
        locale: 'es_PE',
      },
      twitter: {
        card: 'summary_large_image',
        title: settings.seoTitle || settings.businessName || 'Catálogo',
        description: settings.seoDescription || settings.description || 'Explora nuestros productos',
        images: settings.ogImage ? [settings.ogImage] : [],
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: 'Catálogo', description: 'Explora nuestros productos' };
  }
}

export default async function HomePage() {
  const catalogData = await getCatalogData();

  if (!catalogData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Catálogo no disponible</h1>
          <p className="text-white/60">Por favor, intenta más tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <CatalogWrapper settings={catalogData.settings}>
      {catalogData.settings && (
        <>
          <OrganizationJsonLd settings={catalogData.settings} />
          <WebSiteJsonLd settings={catalogData.settings} />
          <LocalBusinessJsonLd settings={catalogData.settings} />
        </>
      )}
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogLanding data={catalogData} />
      </Suspense>
    </CatalogWrapper>
  );
}

function CatalogSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 animate-pulse">
      <div className="h-screen bg-slate-900" />
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="h-8 w-48 bg-slate-800 rounded mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
