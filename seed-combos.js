const { PrismaClient } = require("@prisma/client");

async function seedCombos() {
  const prisma = new PrismaClient();

  const p = async (slug) => {
    const prod = await prisma.product.findUnique({ where: { slug } });
    return prod;
  };

  const gs5 = await p("gold-standard-whey-5lb");
  const crOn = await p("creatina-300g-optimum-nutrition");
  const serious = await p("serious-mass-chocolate-6-lbs");
  const psycho = await p("psychotic-fruit-punch-30-sv");
  const amino = await p("amino-energy-270g");
  const nitro2 = await p("nitrotech-whey-gold-chocolate-2-lb");
  const creaMt = await p("creatina-muscletech-400g");
  const lipo = await p("lipo-6-black-ultra-60caps");
  const prostar = await p("prostar-whey-5lb");
  const creaNutrex = await p("creatina-monohidratada-300g-nutrex");

  const combos = [
    {
      name: "Combo Proteína + Creatina ON",
      slug: "combo-proteina-creatina-on",
      description: "El combo clásico para ganar masa muscular. Gold Standard Whey 5LB + Creatina Optimum Nutrition 300g. Ahorra comprando juntos.",
      price: 624,
      salePrice: 499,
      products: [gs5, crOn],
    },
    {
      name: "Combo Masa Muscular",
      slug: "combo-masa-muscular",
      description: "Para los que quieren ganar peso y volumen. Serious Mass 6LBS + Creatina Nutrex 300g. Ideal para ectomorfos.",
      price: 298,
      salePrice: 259,
      products: [serious, creaNutrex],
    },
    {
      name: "Combo Pre-Entreno + Recuperación",
      slug: "combo-pre-entreno-recuperacion",
      description: "Máxima energía + recuperación. Psychotic Pre-Workout + Amino Energy. Entrena más fuerte y recupérate más rápido.",
      price: 328,
      salePrice: 265,
      products: [psycho, amino],
    },
    {
      name: "Combo MuscleTech Power",
      slug: "combo-muscletech-power",
      description: "Proteína + Creatina de MuscleTech. NitroTech Whey Gold 2LB + Creatina MuscleTech 400g. Calidad comprobada.",
      price: 398,
      salePrice: 339,
      products: [nitro2, creaMt],
    },
    {
      name: "Combo Definición Total",
      slug: "combo-definicion-total",
      description: "Proteína aislada + quemador de grasa. Prostar Whey 5LB + Lipo-6 Black Ultra. Para marcar músculo y quemar grasa.",
      price: 588,
      salePrice: 459,
      products: [prostar, lipo],
    },
  ];

  let count = 0;
  for (const c of combos) {
    const existing = await prisma.combo.findUnique({ where: { slug: c.slug } });
    if (existing) { console.log("Skip: " + c.name); continue; }

    const combo = await prisma.combo.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        price: c.price,
        salePrice: c.salePrice,
        isActive: true,
        comboProducts: {
          create: c.products.map((prod, i) => ({
            productId: prod.id,
            quantity: 1,
            order: i,
          })),
        },
      },
    });

    // Use first product's image as combo image
    const firstProductImage = await prisma.productImage.findFirst({
      where: { productId: c.products[0].id },
      orderBy: { order: "asc" },
    });

    if (firstProductImage) {
      await prisma.combo.update({
        where: { id: combo.id },
        data: { image: firstProductImage.url },
      });
    }

    count++;
    console.log("OK: " + c.name);
  }

  console.log("Total: " + count + " combos creados");
  await prisma.$disconnect();
}

seedCombos().catch(console.error);
