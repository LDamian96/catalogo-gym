import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCombos() {
  console.log('Seeding combos...');

  // Get some existing products to include in combos
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    take: 10,
    select: { id: true, name: true, price: true },
  });

  if (products.length < 2) {
    console.log('Not enough products to create combos. Need at least 2 active products.');
    return;
  }

  const combosData = [
    {
      name: 'Combo Fuerza Total',
      slug: 'combo-fuerza-total',
      description: 'El pack perfecto para maximizar tu fuerza: proteína de alta calidad + creatina monohidratada. Ideal para atletas que buscan resultados reales.',
      price: 189.90,
      salePrice: 159.90,
      discountPercent: 16,
      order: 0,
      isActive: true,
      image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/fish-vegetables',
      seoTitle: 'Combo Fuerza Total - Proteína + Creatina | Ahorra 16%',
      seoDescription: 'Maximiza tu rendimiento con nuestro Combo Fuerza Total. Incluye proteína whey premium y creatina monohidratada. Envío nacional gratis. Ahorra 16% comprando el pack.',
      seoKeywords: 'combo fuerza,proteína whey,creatina,suplementos gym,pack fitness,ahorro suplementos',
    },
    {
      name: 'Combo Beast Mode',
      slug: 'combo-beast-mode',
      description: 'Activa el modo bestia: pre-entreno explosivo + aminoácidos BCAA + shaker profesional. Todo lo que necesitas para entrenamientos intensos.',
      price: 249.90,
      salePrice: 199.90,
      discountPercent: 20,
      order: 1,
      isActive: true,
      image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/spices',
      seoTitle: 'Combo Beast Mode - Pre-Entreno + BCAA + Shaker | -20%',
      seoDescription: 'Entrena como bestia con nuestro combo Beast Mode. Pre-workout de alta potencia, BCAA recuperación y shaker gratis. Envío contraentrega disponible.',
      seoKeywords: 'combo beast mode,pre entreno,bcaa,shaker,suplementos deportivos,pack gym',
    },
    {
      name: 'Combo Definición Pro',
      slug: 'combo-definicion-pro',
      description: 'Pack de definición muscular: proteína isolate baja en grasa + quemador termogénico + L-Carnitina líquida. Resultados visibles en semanas.',
      price: 299.90,
      salePrice: 239.90,
      discountPercent: 20,
      order: 2,
      isActive: true,
      image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/pot-mussels',
      seoTitle: 'Combo Definición Pro - Isolate + Quemador + L-Carnitina',
      seoDescription: 'Define tu cuerpo con el Combo Definición Pro. Proteína isolate premium, termogénico potente y L-Carnitina líquida. Envío a todo el país.',
      seoKeywords: 'combo definición,proteína isolate,quemador grasa,l-carnitina,definición muscular,pack adelgazar',
    },
    {
      name: 'Combo Ganancia Muscular',
      slug: 'combo-ganancia-muscular',
      description: 'El stack completo para ganar masa: mass gainer de alto rendimiento + glutamina recuperadora. Gana volumen limpio y recupera más rápido.',
      price: 219.90,
      salePrice: 179.90,
      discountPercent: 18,
      order: 3,
      isActive: true,
      image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/food/dessert',
      seoTitle: 'Combo Ganancia Muscular - Mass Gainer + Glutamina | -18%',
      seoDescription: 'Aumenta tu masa muscular con el Combo Ganancia. Mass gainer premium y glutamina para recuperación. Ahorra 18%. Contraentrega disponible.',
      seoKeywords: 'combo ganancia muscular,mass gainer,glutamina,ganar masa,volumen muscular,suplementos masa',
    },
  ];

  for (const comboData of combosData) {
    // Check if combo already exists
    const existing = await prisma.combo.findUnique({
      where: { slug: comboData.slug },
    });

    if (existing) {
      console.log(`  Combo "${comboData.name}" already exists, skipping...`);
      continue;
    }

    const combo = await prisma.combo.create({
      data: comboData,
    });

    // Add 2-3 random products to each combo
    const numProducts = Math.min(2 + Math.floor(Math.random() * 2), products.length);
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    const selectedProducts = shuffled.slice(0, numProducts);

    for (let i = 0; i < selectedProducts.length; i++) {
      try {
        await prisma.comboProduct.create({
          data: {
            comboId: combo.id,
            productId: selectedProducts[i].id,
            quantity: 1,
            order: i,
          },
        });
      } catch {
        // Skip if duplicate
      }
    }

    console.log(`  Created combo "${combo.name}" with ${selectedProducts.length} products`);
  }

  console.log('Combos seeded successfully!');
}

seedCombos()
  .catch((e) => {
    console.error('Error seeding combos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
