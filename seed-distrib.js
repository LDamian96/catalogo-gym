const { PrismaClient } = require("@prisma/client");

function makeSlug(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").substring(0,80);
}

function mapCategory(cat) {
  cat = cat.toLowerCase();
  if (cat.includes("aislada") || cat.includes("whey") || cat.includes("otra") || cat.includes("ganador")) return "proteinas";
  if (cat.includes("creatina")) return "creatinas";
  if (cat.includes("pre")) return "pre-entrenos";
  if (cat.includes("amino") || cat.includes("glutam") || cat.includes("bcaa")) return "aminoacidos";
  if (cat.includes("quemador") || cat.includes("salud") || cat.includes("omega")) return "vitaminas";
  return "proteinas";
}

function guessBrand(name) {
  const n = name.toLowerCase();
  if (n.includes("gold standard") || n.includes("serious mass") || n.includes("hydrowhey") || n.includes("creatina 300g optimum")) return "optimum-nutrition";
  if (n.includes("muscletech") || n.includes("nitrotech") || n.includes("isowhey muscletech") || n.includes("creatina muscletech")) return "muscletech";
  if (n.includes("nutrex") || n.includes("lipo 6") || n.includes("creatina monohidratada")) return "nutrex";
  if (n.includes("insane") || n.includes("psychotic")) return "insane-labz";
  if (n.includes("level pro")) return "level-pro";
  if (n.includes("ronnie") || n.includes("creatine xs")) return "ronnie-coleman";
  if (n.includes("dragon pharma") || n.includes("venom") || n.includes("bulk mass") || n.includes("mass phorm") || n.includes("black viper")) return "dragon-pharma";
  if (n.includes("mutant")) return "mutant";
  if (n.includes("perfect sports") || n.includes("diesel")) return "perfect-sports";
  if (n.includes("redcon") || n.includes("citrulina")) return "redcon1";
  if (n.includes("ritual") || n.includes("iprep") || n.includes("warrior")) return "ans-performance";
  if (n.includes("pvl") || n.includes("glutamina") || n.includes("quench")) return "pvl";
  if (n.includes("yava") || n.includes("elite whey") || n.includes("pure iso")) return "yava-labs";
  if (n.includes("carnivor")) return "musclemeds";
  if (n.includes("nutrabio") || n.includes("omega")) return "nutrabio";
  if (n.includes("hyde")) return "prosupps";
  return null;
}

async function seed() {
  const prisma = new PrismaClient();
  const cats = await prisma.category.findMany();
  const catMap = {};
  for (const c of cats) catMap[c.slug] = c.id;

  const brandNames = [
    {name:"Insane Labz",slug:"insane-labz"},{name:"Level Pro",slug:"level-pro"},
    {name:"Ronnie Coleman",slug:"ronnie-coleman"},{name:"Dragon Pharma",slug:"dragon-pharma"},
    {name:"Mutant",slug:"mutant"},{name:"Perfect Sports",slug:"perfect-sports"},
    {name:"Redcon1",slug:"redcon1"},{name:"ANS Performance",slug:"ans-performance"},
    {name:"PVL",slug:"pvl"},{name:"Yava Labs",slug:"yava-labs"},
    {name:"MuscleMeds",slug:"musclemeds"},{name:"NutraBio",slug:"nutrabio"},
    {name:"ProSupps",slug:"prosupps"},
  ];
  const brandMap = {};
  const existingBrands = await prisma.brand.findMany();
  for (const b of existingBrands) brandMap[b.slug] = b.id;
  for (const b of brandNames) {
    if (!brandMap[b.slug]) {
      const brand = await prisma.brand.create({data:{name:b.name,slug:b.slug,isActive:true}});
      brandMap[b.slug] = brand.id;
    }
  }

  const products = [
    {n:"Citrulina Redcon1 180g",p:119,sp:null,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/12/citru.jpg",cat:"Pre Entrenos"},
    {n:"Serious Mass Vainilla 6 LBS",p:199,sp:189,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/12/serious-mas-6lb.png",cat:"Ganadores"},
    {n:"Serious Mass Chocolate 6 LBS",p:199,sp:189,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/12/serious-mass-6-lbs.jpg",cat:"Ganadores"},
    {n:"Hydrowhey 3.5 LBS Vainilla",p:359,sp:339,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/descarga-7.jpg",cat:"Proteínas Aisladas"},
    {n:"Creatina Perfect Sports 1 KG",p:259,sp:229,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/descarga-6.jpg",cat:"Creatinas"},
    {n:"Creatina Perfect Sports 400g",p:119,sp:null,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/descarga-6.jpg",cat:"Creatinas"},
    {n:"Diesel Chocolate 2 LB",p:229,sp:219,img:"https://distribuidorafitness.pe/wp-content/uploads/2023/05/diesel-chocolate-500x500-1.png",cat:"Proteínas Aisladas"},
    {n:"Creatina Monohidratada 1 KG Nutrex",p:249,sp:229,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/Sin-titulo-2.png",cat:"Creatinas"},
    {n:"Mutant Iso Surge 5 LB Vainilla",p:409,sp:389,img:"https://distribuidorafitness.pe/wp-content/uploads/2023/03/isooo-surgeee.jpg",cat:"Proteínas Aisladas"},
    {n:"IsoWhey MuscleTech 5 LBS Chocolate",p:429,sp:399,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/169803-800-auto.png",cat:"Proteínas Aisladas"},
    {n:"IsoWhey MuscleTech 5 LBS Vainilla",p:429,sp:399,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/Sin-titulo.png",cat:"Proteínas Aisladas"},
    {n:"NitroTech Whey Gold Chocolate 2 LB",p:199,sp:185,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/nitro-2-lbs-1.png",cat:"Proteínas Whey"},
    {n:"NitroTech Whey Gold Vainilla 2 LBS",p:199,sp:185,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/nitro-2-lbs.png",cat:"Proteínas Whey"},
    {n:"Creatina MuscleTech 400g",p:199,sp:175,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/crea-muscletech-1.png",cat:"Creatinas"},
    {n:"Level Pro Iso Gold Whey Vainilla 2.4 LBS",p:169,sp:145,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/iso-gol.png",cat:"Proteínas Aisladas"},
    {n:"Creatine 300g Insane Labz",p:109,sp:89,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/descarga-1-1.jpeg",cat:"Creatinas"},
    {n:"Psychotic Fruit Punch 30 SV",p:179,sp:159,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/psycotic.png",cat:"Pre Entrenos"},
    {n:"Venom Inferno Limon 40 SV",p:179,sp:159,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/11/descarga.jpeg",cat:"Pre Entrenos"},
    {n:"Level Pro Mass Pro Vainilla 6.6 LBS",p:169,sp:145,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/02/22.png",cat:"Ganadores"},
    {n:"Level Pro Whey Gold Chocolate 6.6 LBS",p:239,sp:215,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/02/13.png",cat:"Proteínas Whey"},
    {n:"Level Pro Whey Gold Vainilla 6.6 LBS",p:239,sp:215,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/02/12.png",cat:"Proteínas Whey"},
    {n:"Level Pro Iso Gold Chocolate 2.4 LBS",p:169,sp:145,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/02/7.png",cat:"Proteínas Aisladas"},
    {n:"Level Pro Iso Gold Chocolate 6.6 LBS",p:319,sp:299,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/02/2.png",cat:"Proteínas Aisladas"},
    {n:"Level Pro Iso Gold Vainilla 6.6 LBS",p:319,sp:299,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/02/3.png",cat:"Proteínas Aisladas"},
    {n:"Creatina 300g Optimum Nutrition",p:135,sp:125,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/02/CARRUSEL-1-1920-x-1920-px-1.png",cat:"Creatinas"},
    {n:"Lipo 6 Intense Ultra 60 Capsulas",p:179,sp:159,img:"https://distribuidorafitness.pe/wp-content/uploads/2025/01/Diseno-sin-titulo-9.webp",cat:"Quemadores"},
    {n:"Gold Standard Isolate 5 LBS Vainilla",p:499,sp:479,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/11/GOL-ISOLATE-ON-CHOCO.png",cat:"Proteínas Aisladas"},
    {n:"Gold Standard Isolate 5 LBS Chocolate",p:499,sp:479,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/11/GOL-ISOLATE-ON-CHOCO.png",cat:"Proteínas Aisladas"},
    {n:"Hyde Nightmare 30 SV Blood Berry",p:169,sp:null,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/10/hyde-nightmare-scaled.png",cat:"Pre Entrenos"},
    {n:"Omega-3 Fish Oil NutraBio 400 Caps",p:209,sp:189,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/10/eee.jpg",cat:"Salud"},
    {n:"Creatina Monohidratada 300g Nutrex",p:99,sp:89,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/10/CARRUSEL-1-1920-x-1920-px.jpg",cat:"Creatinas"},
    {n:"Creatine XS 1 KG Ronnie Coleman",p:209,sp:null,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/10/Creatina-ronnie-coleman-1kg-1.png",cat:"Creatinas"},
    {n:"NitroTech Whey Gold Cookies Cream 5 LB",p:349,sp:319,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/08/DKT-19775-Muscletech-Nitro-Tech-Whey-Gold-Cookies-and-Cream-5lbs-USA-Front-scaled.webp",cat:"Proteínas Whey"},
    {n:"iPrep Fruit Punch 30 SV",p:159,sp:149,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/05/IPREP-PNG.png",cat:"Pre Entrenos"},
    {n:"Creatine XS 300g Ronnie Coleman",p:119,sp:99,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/04/CREATINA-XS-300G.png",cat:"Creatinas"},
    {n:"Ritual Glacier Grape 360g 30 SV",p:139,sp:null,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/03/ritual-png-1.png",cat:"Pre Entrenos"},
    {n:"Bulk Mass 3KG Chocolate",p:200,sp:179,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/02/BULKS-MASS-3-KG-500-X-500.png",cat:"Ganadores"},
    {n:"Elite Whey Protein Chocolate 1KG",p:159,sp:null,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/02/YAVA-LABS-ELITE-WHEY-PROTEIN-1KG-CHOCOLATE-500-X-500.png",cat:"Proteínas Whey"},
    {n:"Elite Whey Protein Chocolate 2 KG",p:300,sp:279,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/02/ELITE-WHEY-PROYEIN-2-KG-YAVA-LABS-CHOCOLATE-500-X-500.png",cat:"Proteínas Whey"},
    {n:"Pure Iso Whey 1KG Chocolate",p:219,sp:199,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/02/YAVA-LABS-PURE-ISO-WHEY-1-KG-CHOCOLATE.png",cat:"Proteínas Aisladas"},
    {n:"Pure Iso Whey 1KG Vainilla",p:219,sp:199,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/02/YAVA-LABS-PURE-ISO-WHEY-1-KG-VAINILLA.png",cat:"Proteínas Aisladas"},
    {n:"Pure Iso Whey 2KG Vainilla",p:339,sp:309,img:"https://distribuidorafitness.pe/wp-content/uploads/2024/02/PURE-ISO-WHEY-YAVA-LABS-2-KG-VAINILLA-500-X-500.png",cat:"Proteínas Aisladas"},
    {n:"Quench BCAA Fruit Punch 30 SRV",p:145,sp:129,img:"https://distribuidorafitness.pe/wp-content/uploads/2020/11/QUENCH-BCAA-30-2.jpg",cat:"Aminoácidos"},
    {n:"Glutamina PVL 400g",p:160,sp:109,img:"https://distribuidorafitness.pe/wp-content/uploads/2020/10/GLUTAMINA-400.jpg",cat:"Aminoácidos"},
    {n:"Quench BCAA Fruit Punch 100 SRV",p:289,sp:259,img:"https://distribuidorafitness.pe/wp-content/uploads/2020/11/QUENCH-BCAA-100-SUPERFRUIT-min.png",cat:"Aminoácidos"},
    {n:"Quench BCAA Limonade 100 SRV",p:289,sp:259,img:"https://distribuidorafitness.pe/wp-content/uploads/2020/11/QUENCH-BCAA-PINK-LEMONEADE.png",cat:"Aminoácidos"},
    {n:"Carnivor 4.2 LB Chocolate",p:299,sp:289,img:"https://distribuidorafitness.pe/wp-content/uploads/2023/12/carnivor-png.png",cat:"Otras Proteínas"},
    {n:"Mutant EAA Geear 30 SV 400g",p:149,sp:139,img:"https://distribuidorafitness.pe/wp-content/uploads/2023/11/nuevo.jpg",cat:"Aminoácidos"},
    {n:"Black Viper 90 Capsulas",p:159,sp:null,img:"https://distribuidorafitness.pe/wp-content/uploads/2023/11/BLACK-VIPER-90-CAP-DRAGON-PHARMA-500-X-500.png",cat:"Quemadores"},
    {n:"Creatina Dragon Pharma 1KG",p:259,sp:229,img:"https://distribuidorafitness.pe/wp-content/uploads/2023/11/CREATINA-DRAGON-PHARMA-1-KG-500-X-500.png",cat:"Creatinas"},
    {n:"Mass Phorm 12 LB Chocolate",p:299,sp:null,img:"https://distribuidorafitness.pe/wp-content/uploads/2023/11/MASS-PHORM-CHOCOLATE-12-LB-DRAGON-PHARMA-500-X-500.png",cat:"Ganadores"},
  ];

  let count = 0;
  for (const p of products) {
    const slug = makeSlug(p.n);
    const existing = await prisma.product.findUnique({where:{slug}});
    if (existing) { console.log("Skip: " + p.n); continue; }

    const catSlug = mapCategory(p.cat);
    const categoryId = catMap[catSlug];
    if (!categoryId) { console.log("No cat: " + p.n + " -> " + catSlug); continue; }

    const brandSlug = guessBrand(p.n);
    const brandId = brandSlug ? brandMap[brandSlug] : null;

    const product = await prisma.product.create({
      data: {
        name: p.n, slug, price: p.p, salePrice: p.sp,
        description: p.n + ". Suplemento deportivo de alta calidad.",
        categoryId, brandId, isFeatured: !!(p.sp && p.sp < p.p),
        isActive: true, showPrice: true, order: count,
      }
    });

    await prisma.productImage.create({
      data: { productId: product.id, url: p.img, publicId: "ext-" + slug, order: 0 }
    });

    count++;
    console.log("OK: " + p.n);
  }

  console.log("Total: " + count + " productos de Distribuidora Fitness");
  await prisma.$disconnect();
}

seed().catch(console.error);
