import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function randomPrice(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ============================================
// IMAGE URLs (Unsplash)
// ============================================

const CATEGORY_IMAGES = {
  zapatos: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  ropa: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
  suplementos: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  proteinas: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
  creatinas: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  preentreno: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  mochilas: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
  comidaperuana: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
  panaderia: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  accesorios: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
  tecnologia: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80',
  hogar: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80',
};

const BRAND_IMAGES = {
  nike: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  adidas: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&q=80',
  puma: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80',
  reebok: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
  newbalance: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80',
  optimum: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80',
  muscletech: 'https://images.unsplash.com/photo-1579722820903-4a0f22c3b9e0?w=400&q=80',
  bsn: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
  northface: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
  jansport: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400&q=80',
  generic: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80',
};

const PRODUCT_IMAGES = {
  zapatillas: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
    'https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=600&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055uj8?w=600&q=80',
  ],
  ropa: [
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80',
    'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=600&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
  ],
  suplementos: [
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&q=80',
    'https://images.unsplash.com/photo-1579722820903-4a0f22c3b9e0?w=600&q=80',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
  ],
  mochilas: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&q=80',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80',
    'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80',
  ],
  comida: [
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
    'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
  ],
  panaderia: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&q=80',
    'https://images.unsplash.com/photo-1517433670267-30f41c09ec0e?w=600&q=80',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
  ],
};

// ============================================
// DATA DEFINITIONS
// ============================================

const CATEGORIES_DATA = [
  { name: 'Zapatos', description: 'Calzado deportivo y casual de las mejores marcas', image: CATEGORY_IMAGES.zapatos },
  { name: 'Ropa Deportiva', description: 'Prendas cómodas para entrenar y hacer deporte', image: CATEGORY_IMAGES.ropa },
  { name: 'Proteínas', description: 'Suplementos proteicos para aumentar masa muscular', image: CATEGORY_IMAGES.proteinas },
  { name: 'Creatinas', description: 'Creatina monohidratada y otras fórmulas para fuerza', image: CATEGORY_IMAGES.creatinas },
  { name: 'Pre-Entreno', description: 'Suplementos para maximizar tu rendimiento', image: CATEGORY_IMAGES.preentreno },
  { name: 'Post-Entreno', description: 'Recuperación muscular después del ejercicio', image: CATEGORY_IMAGES.suplementos },
  { name: 'Mochilas', description: 'Mochilas resistentes para el día a día', image: CATEGORY_IMAGES.mochilas },
  { name: 'Comida Peruana', description: 'Los platos típicos más deliciosos del Perú', image: CATEGORY_IMAGES.comidaperuana },
  { name: 'Panadería', description: 'Pan artesanal y productos horneados', image: CATEGORY_IMAGES.panaderia },
  { name: 'Accesorios', description: 'Complementos para tu estilo deportivo', image: CATEGORY_IMAGES.accesorios },
  { name: 'Tecnología', description: 'Gadgets y accesorios tecnológicos', image: CATEGORY_IMAGES.tecnologia },
  { name: 'Hogar', description: 'Productos para el hogar', image: CATEGORY_IMAGES.hogar },
];

const BRANDS_DATA = [
  { name: 'Nike', description: 'Just Do It', logo: BRAND_IMAGES.nike },
  { name: 'Adidas', description: 'Impossible is Nothing', logo: BRAND_IMAGES.adidas },
  { name: 'Puma', description: 'Forever Faster', logo: BRAND_IMAGES.puma },
  { name: 'Reebok', description: 'Be More Human', logo: BRAND_IMAGES.reebok },
  { name: 'New Balance', description: 'Fearlessly Independent', logo: BRAND_IMAGES.newbalance },
  { name: 'Optimum Nutrition', description: 'True Strength', logo: BRAND_IMAGES.optimum },
  { name: 'MuscleTech', description: 'Strength Redefined', logo: BRAND_IMAGES.muscletech },
  { name: 'BSN', description: 'Finish First', logo: BRAND_IMAGES.bsn },
  { name: 'The North Face', description: 'Never Stop Exploring', logo: BRAND_IMAGES.northface },
  { name: 'JanSport', description: 'Built to Last', logo: BRAND_IMAGES.jansport },
  { name: 'Under Armour', description: 'The Only Way Is Through', logo: BRAND_IMAGES.generic },
  { name: 'Asics', description: 'Sound Mind Sound Body', logo: BRAND_IMAGES.generic },
  { name: 'Dymatize', description: 'Nutrition Perfected', logo: BRAND_IMAGES.generic },
  { name: 'MyProtein', description: 'Fuel Your Ambition', logo: BRAND_IMAGES.generic },
  { name: 'Cellucor', description: 'Live Loud', logo: BRAND_IMAGES.generic },
];

const VARIANT_TYPES_DATA = [
  { name: 'Talla', description: 'Tallas de ropa y calzado' },
  { name: 'Color', description: 'Colores disponibles' },
  { name: 'Material', description: 'Tipo de material' },
  { name: 'Sabor', description: 'Sabores de suplementos' },
  { name: 'Tamaño', description: 'Tamaño del producto' },
  { name: 'Peso', description: 'Peso del producto' },
];

const VARIANT_VALUES = {
  Talla: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  Color: ['Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Gris', 'Naranja', 'Amarillo', 'Rosa', 'Morado'],
  Material: ['Algodón', 'Poliéster', 'Nylon', 'Cuero', 'Sintético', 'Lona', 'Mesh'],
  Sabor: ['Chocolate', 'Vainilla', 'Fresa', 'Cookies & Cream', 'Banana', 'Café', 'Sin Sabor', 'Frutas'],
  Tamaño: ['Pequeño', 'Mediano', 'Grande', 'Extra Grande'],
  Peso: ['250g', '500g', '1kg', '2kg', '2.5kg', '5kg'],
};

// Product templates by category
const PRODUCT_TEMPLATES = {
  zapatos: [
    { name: 'Zapatillas Running', basePrice: 299.90, desc: 'Zapatillas para correr con amortiguación superior' },
    { name: 'Zapatillas Training', basePrice: 249.90, desc: 'Zapatillas para entrenamiento en gimnasio' },
    { name: 'Zapatillas Casual', basePrice: 199.90, desc: 'Zapatillas cómodas para el día a día' },
    { name: 'Zapatillas Basketball', basePrice: 399.90, desc: 'Zapatillas de basketball con soporte de tobillo' },
    { name: 'Zapatillas Skate', basePrice: 179.90, desc: 'Zapatillas resistentes para skateboarding' },
    { name: 'Botas Hiking', basePrice: 449.90, desc: 'Botas impermeables para senderismo' },
    { name: 'Sandalias Deportivas', basePrice: 99.90, desc: 'Sandalias cómodas para después del entrenamiento' },
    { name: 'Zapatillas Tenis', basePrice: 349.90, desc: 'Zapatillas profesionales para tenis' },
    { name: 'Zapatillas Fútbol', basePrice: 279.90, desc: 'Chimpunes para cancha sintética' },
    { name: 'Slip-On Deportivo', basePrice: 129.90, desc: 'Zapatillas sin cordones fáciles de poner' },
  ],
  ropa: [
    { name: 'Polo Deportivo', basePrice: 79.90, desc: 'Polo con tecnología dry-fit' },
    { name: 'Camiseta Training', basePrice: 59.90, desc: 'Camiseta ligera para entrenar' },
    { name: 'Short Deportivo', basePrice: 69.90, desc: 'Short cómodo con bolsillos' },
    { name: 'Pantalón Jogger', basePrice: 129.90, desc: 'Pantalón jogger estilo urbano' },
    { name: 'Casaca Cortaviento', basePrice: 199.90, desc: 'Casaca impermeable ligera' },
    { name: 'Hoodie Classic', basePrice: 149.90, desc: 'Hoodie con capucha y bolsillo' },
    { name: 'Leggins Compression', basePrice: 89.90, desc: 'Leggins de compresión para mejor rendimiento' },
    { name: 'Top Deportivo', basePrice: 49.90, desc: 'Top para entrenamiento femenino' },
    { name: 'Bividi Training', basePrice: 39.90, desc: 'Bividi transpirable para gimnasio' },
    { name: 'Conjunto Deportivo', basePrice: 199.90, desc: 'Conjunto casaca y pantalón' },
  ],
  proteinas: [
    { name: 'Whey Protein Gold Standard', basePrice: 249.90, desc: '100% Whey Protein Isolate' },
    { name: 'Mass Gainer Premium', basePrice: 189.90, desc: 'Ganador de masa con proteína y carbohidratos' },
    { name: 'Protein Bar Pack', basePrice: 89.90, desc: 'Pack de 12 barras proteicas' },
    { name: 'Casein Protein', basePrice: 229.90, desc: 'Proteína de liberación lenta' },
    { name: 'Vegan Protein', basePrice: 199.90, desc: 'Proteína vegana de guisante y arroz' },
    { name: 'Hydro Whey', basePrice: 299.90, desc: 'Proteína hidrolizada de rápida absorción' },
    { name: 'Beef Protein', basePrice: 219.90, desc: 'Proteína de carne bovina' },
    { name: 'Egg Protein', basePrice: 179.90, desc: 'Proteína de clara de huevo' },
  ],
  creatinas: [
    { name: 'Creatina Monohidratada', basePrice: 89.90, desc: 'Creatina pura micronizada' },
    { name: 'Creatina HCL', basePrice: 129.90, desc: 'Creatina clorhidrato de alta absorción' },
    { name: 'Creatina Kre-Alkalyn', basePrice: 149.90, desc: 'Creatina buffered sin carga' },
    { name: 'Creatina + Glutamina', basePrice: 119.90, desc: 'Combo de creatina y glutamina' },
    { name: 'Cell-Tech Creatina', basePrice: 169.90, desc: 'Fórmula avanzada de creatina' },
  ],
  preentreno: [
    { name: 'Pre-Workout Extreme', basePrice: 149.90, desc: 'Máxima energía y focus' },
    { name: 'C4 Original', basePrice: 129.90, desc: 'Pre-entreno clásico con beta-alanina' },
    { name: 'Pump No-Stim', basePrice: 99.90, desc: 'Pre-entreno sin estimulantes' },
    { name: 'Total War', basePrice: 159.90, desc: 'Pre-entreno de alta intensidad' },
    { name: 'Amino Energy', basePrice: 89.90, desc: 'Energía con aminoácidos' },
  ],
  postentreno: [
    { name: 'BCAA 2:1:1', basePrice: 79.90, desc: 'Aminoácidos ramificados para recuperación' },
    { name: 'Glutamina Pura', basePrice: 69.90, desc: 'L-Glutamina para recuperación muscular' },
    { name: 'Recovery Formula', basePrice: 119.90, desc: 'Fórmula completa post-entreno' },
    { name: 'EAA Complete', basePrice: 99.90, desc: 'Aminoácidos esenciales completos' },
    { name: 'ZMA Sleep', basePrice: 59.90, desc: 'Zinc y magnesio para recuperación nocturna' },
  ],
  mochilas: [
    { name: 'Mochila Escolar', basePrice: 149.90, desc: 'Mochila resistente con compartimentos' },
    { name: 'Mochila Laptop', basePrice: 199.90, desc: 'Mochila con compartimento acolchado para laptop' },
    { name: 'Mochila Trekking', basePrice: 299.90, desc: 'Mochila de 40L para excursiones' },
    { name: 'Morral Urbano', basePrice: 129.90, desc: 'Morral casual para el día a día' },
    { name: 'Mochila Gym', basePrice: 99.90, desc: 'Mochila compacta para el gimnasio' },
    { name: 'Mochila Viajera', basePrice: 349.90, desc: 'Mochila de viaje con múltiples compartimentos' },
    { name: 'Bolso Deportivo', basePrice: 119.90, desc: 'Bolso con correa ajustable' },
  ],
  comidaperuana: [
    { name: 'Ceviche de Pescado', basePrice: 35.90, desc: 'Ceviche fresco con camote y cancha' },
    { name: 'Lomo Saltado', basePrice: 39.90, desc: 'Lomo fino con papas fritas y arroz' },
    { name: 'Ají de Gallina', basePrice: 29.90, desc: 'Cremoso ají de gallina con papas' },
    { name: 'Causa Limeña', basePrice: 24.90, desc: 'Causa rellena de pollo' },
    { name: 'Arroz con Pollo', basePrice: 27.90, desc: 'Arroz verde con pollo y papas' },
    { name: 'Tacu Tacu', basePrice: 32.90, desc: 'Tacu tacu con lomo o huevo frito' },
    { name: 'Papa a la Huancaína', basePrice: 18.90, desc: 'Papas con salsa huancaína' },
    { name: 'Anticuchos', basePrice: 22.90, desc: 'Anticuchos de corazón con papas' },
    { name: 'Seco de Res', basePrice: 34.90, desc: 'Seco de res con frijoles y arroz' },
    { name: 'Pollo a la Brasa', basePrice: 45.90, desc: 'Pollo a la brasa con papas y ensalada' },
    { name: 'Chicharrón de Cerdo', basePrice: 28.90, desc: 'Chicharrón crocante con mote' },
    { name: 'Rocoto Relleno', basePrice: 26.90, desc: 'Rocoto relleno de carne con pastel de papa' },
  ],
  panaderia: [
    { name: 'Pan Francés (6 unid)', basePrice: 3.50, desc: 'Pan francés crujiente recién horneado' },
    { name: 'Croissant de Mantequilla', basePrice: 4.90, desc: 'Croissant hojaldrado con mantequilla' },
    { name: 'Pan de Molde Integral', basePrice: 8.90, desc: 'Pan de molde con harina integral' },
    { name: 'Ciabatta Artesanal', basePrice: 6.90, desc: 'Pan ciabatta rústico' },
    { name: 'Pan de Chocolate', basePrice: 3.90, desc: 'Pan dulce relleno de chocolate' },
    { name: 'Empanada de Carne', basePrice: 5.90, desc: 'Empanada horneada de carne' },
    { name: 'Pie de Manzana', basePrice: 12.90, desc: 'Pie de manzana tradicional' },
    { name: 'Alfajor de Manjar', basePrice: 4.50, desc: 'Alfajor relleno de manjar blanco' },
    { name: 'Queque de Vainilla', basePrice: 24.90, desc: 'Queque esponjoso de vainilla' },
    { name: 'Torta de Chocolate', basePrice: 49.90, desc: 'Torta de chocolate para 12 personas' },
    { name: 'Cachitos (4 unid)', basePrice: 7.90, desc: 'Cachitos de mantequilla' },
    { name: 'Pan Campesino', basePrice: 9.90, desc: 'Pan rústico de masa madre' },
  ],
  accesorios: [
    { name: 'Gorra Deportiva', basePrice: 49.90, desc: 'Gorra con visera curva' },
    { name: 'Medias Pack x3', basePrice: 29.90, desc: 'Pack de 3 pares de medias deportivas' },
    { name: 'Muñequera Sudor', basePrice: 19.90, desc: 'Muñequera absorbente de sudor' },
    { name: 'Cintillo Deportivo', basePrice: 24.90, desc: 'Cintillo elástico antideslizante' },
    { name: 'Guantes Gym', basePrice: 39.90, desc: 'Guantes con grip para pesas' },
    { name: 'Botella Shaker', basePrice: 34.90, desc: 'Shaker de 700ml con mezclador' },
    { name: 'Toalla Microfibra', basePrice: 29.90, desc: 'Toalla de secado rápido' },
    { name: 'Bolsa de Tela', basePrice: 14.90, desc: 'Bolsa ecológica reutilizable' },
  ],
};

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log('🚀 Starting massive seed...\n');

  // Clean existing data (optional - uncomment to reset)
  // console.log('🗑️  Cleaning existing data...');
  // await prisma.productVariantVariantValue.deleteMany();
  // await prisma.productVariant.deleteMany();
  // await prisma.productVariantValue.deleteMany();
  // await prisma.productImage.deleteMany();
  // await prisma.productStat.deleteMany();
  // await prisma.product.deleteMany();
  // await prisma.variantTypeValue.deleteMany();
  // await prisma.variantType.deleteMany();
  // await prisma.brand.deleteMany();
  // await prisma.category.deleteMany();

  // ============================================
  // SETTINGS
  // ============================================
  console.log('⚙️  Creating settings...');
  await prisma.settings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      businessName: 'MegaCatálogo Perú',
      whatsapp: '+51999888777',
      currency: 'S/',
      cartEnabled: true,
      welcomeMessage: '¡Hola! 👋 Gracias por visitar MegaCatálogo. ¿En qué puedo ayudarte?',
      description: 'Tu tienda online con los mejores productos deportivos, suplementos y comida peruana',
      seoTitle: 'MegaCatálogo Perú - Deportes, Suplementos y Más',
      seoDescription: 'Encuentra zapatillas, ropa deportiva, suplementos, mochilas y comida peruana. Compra fácil por WhatsApp.',
    },
  });

  // ============================================
  // USERS
  // ============================================
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@catalogo.com' },
    update: {},
    create: {
      email: 'admin@catalogo.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  const editorPassword = await bcrypt.hash('editor123', 12);
  await prisma.user.upsert({
    where: { email: 'editor@catalogo.com' },
    update: {},
    create: {
      email: 'editor@catalogo.com',
      password: editorPassword,
      name: 'Editor',
      role: 'EDITOR',
    },
  });

  // ============================================
  // VARIANT TYPES
  // ============================================
  console.log('🏷️  Creating variant types...');
  const variantTypes: Record<string, { id: string }> = {};

  for (let i = 0; i < VARIANT_TYPES_DATA.length; i++) {
    const vt = VARIANT_TYPES_DATA[i];
    const created = await prisma.variantType.upsert({
      where: { name: vt.name },
      update: {},
      create: {
        name: vt.name,
        description: vt.description,
        order: i,
        isActive: true,
      },
    });
    variantTypes[vt.name] = { id: created.id };

    // Create variant type values
    const values = VARIANT_VALUES[vt.name as keyof typeof VARIANT_VALUES] || [];
    for (let j = 0; j < values.length; j++) {
      await prisma.variantTypeValue.upsert({
        where: {
          variantTypeId_value: {
            variantTypeId: created.id,
            value: values[j],
          },
        },
        update: {},
        create: {
          variantTypeId: created.id,
          value: values[j],
          order: j,
          isActive: true,
        },
      });
    }
  }
  console.log(`   ✅ Created ${VARIANT_TYPES_DATA.length} variant types with values`);

  // ============================================
  // BRANDS
  // ============================================
  console.log('🏪 Creating brands...');
  const brands: { id: string; name: string }[] = [];

  for (let i = 0; i < BRANDS_DATA.length; i++) {
    const b = BRANDS_DATA[i];
    const created = await prisma.brand.upsert({
      where: { slug: generateSlug(b.name) },
      update: {},
      create: {
        name: b.name,
        slug: generateSlug(b.name),
        description: b.description,
        logo: b.logo,
        order: i,
        isActive: true,
      },
    });
    brands.push({ id: created.id, name: created.name });
  }
  console.log(`   ✅ Created ${brands.length} brands`);

  // ============================================
  // CATEGORIES
  // ============================================
  console.log('📁 Creating categories...');
  const categories: { id: string; name: string; slug: string }[] = [];

  for (let i = 0; i < CATEGORIES_DATA.length; i++) {
    const c = CATEGORIES_DATA[i];
    const slug = generateSlug(c.name);
    const created = await prisma.category.upsert({
      where: { slug },
      update: { description: c.description, image: c.image },
      create: {
        name: c.name,
        slug,
        description: c.description,
        image: c.image,
        order: i,
        isActive: true,
        seoTitle: `${c.name} - MegaCatálogo`,
        seoDescription: c.description,
      },
    });
    categories.push({ id: created.id, name: created.name, slug: created.slug });
  }
  console.log(`   ✅ Created ${categories.length} categories`);

  // ============================================
  // PRODUCTS (200 products)
  // ============================================
  console.log('📦 Creating 200 products...');

  const createdProducts: { id: string; categorySlug: string }[] = [];
  let productCount = 0;

  // Map category slugs to template keys
  const categoryTemplateMap: Record<string, string> = {
    'zapatos': 'zapatos',
    'ropa-deportiva': 'ropa',
    'proteinas': 'proteinas',
    'creatinas': 'creatinas',
    'pre-entreno': 'preentreno',
    'post-entreno': 'postentreno',
    'mochilas': 'mochilas',
    'comida-peruana': 'comidaperuana',
    'panaderia': 'panaderia',
    'accesorios': 'accesorios',
  };

  // Distribute products across categories
  const productsPerCategory = Math.ceil(200 / categories.length);

  for (const category of categories) {
    const templateKey = categoryTemplateMap[category.slug] || 'accesorios';
    const templates = PRODUCT_TEMPLATES[templateKey as keyof typeof PRODUCT_TEMPLATES] || PRODUCT_TEMPLATES.accesorios;

    for (let i = 0; i < productsPerCategory && productCount < 200; i++) {
      const template = templates[i % templates.length];
      const variation = Math.floor(i / templates.length) + 1;
      const productName = variation > 1 ? `${template.name} ${['Pro', 'Elite', 'Plus', 'Max', 'Ultra'][variation % 5]}` : template.name;

      // Random attributes
      const hasBrand = Math.random() > 0.3; // 70% have brand
      const hasDiscount = Math.random() > 0.6; // 40% have discount
      const isFeatured = Math.random() > 0.85; // 15% featured

      // Get appropriate brand for category
      let brandId: string | null = null;
      if (hasBrand) {
        if (['zapatos', 'ropa-deportiva', 'accesorios'].includes(category.slug)) {
          const sportBrands = brands.filter(b => ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Under Armour', 'Asics'].includes(b.name));
          brandId = randomElement(sportBrands)?.id || null;
        } else if (['proteinas', 'creatinas', 'pre-entreno', 'post-entreno'].includes(category.slug)) {
          const suppBrands = brands.filter(b => ['Optimum Nutrition', 'MuscleTech', 'BSN', 'Dymatize', 'MyProtein', 'Cellucor'].includes(b.name));
          brandId = randomElement(suppBrands)?.id || null;
        } else if (['mochilas'].includes(category.slug)) {
          const bagBrands = brands.filter(b => ['The North Face', 'JanSport', 'Nike', 'Adidas'].includes(b.name));
          brandId = randomElement(bagBrands)?.id || null;
        }
      }

      const price = template.basePrice * (0.8 + Math.random() * 0.4); // ±20%
      const salePrice = hasDiscount ? price * (0.7 + Math.random() * 0.2) : null; // 10-30% off
      const discountPercent = salePrice ? Math.round((1 - salePrice / price) * 100) : null;

      const slug = generateSlug(`${productName}-${productCount}`);

      // Get image for category
      const imageCategory = ['proteinas', 'creatinas', 'pre-entreno', 'post-entreno'].includes(category.slug)
        ? 'suplementos'
        : ['comida-peruana'].includes(category.slug)
          ? 'comida'
          : ['zapatos'].includes(category.slug)
            ? 'zapatillas'
            : categoryTemplateMap[category.slug] || 'ropa';
      const images = PRODUCT_IMAGES[imageCategory as keyof typeof PRODUCT_IMAGES] || PRODUCT_IMAGES.ropa;
      const imageUrl = randomElement(images);

      try {
        const product = await prisma.product.create({
          data: {
            name: productName,
            slug,
            description: template.desc,
            price: Math.round(price * 100) / 100,
            salePrice: salePrice ? Math.round(salePrice * 100) / 100 : null,
            discountPercent,
            showPrice: true,
            stock: randomInt(0, 100),
            showStock: Math.random() > 0.5,
            isActive: true,
            isFeatured,
            order: i,
            categoryId: category.id,
            brandId,
          },
        });

        // Add product image
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: imageUrl,
            publicId: `seed-${product.id}`,
            order: 0,
          },
        });

        createdProducts.push({ id: product.id, categorySlug: category.slug });
        productCount++;

        if (productCount % 50 === 0) {
          console.log(`   📦 ${productCount} products created...`);
        }
      } catch (e) {
        // Skip if slug collision
        continue;
      }
    }
  }
  console.log(`   ✅ Created ${productCount} products`);

  // ============================================
  // PRODUCT VARIANTS (500 variants)
  // ============================================
  console.log('🎨 Creating 500 product variants...');

  let variantCount = 0;
  const variantsPerProduct = Math.ceil(500 / createdProducts.length);

  for (const product of createdProducts) {
    if (variantCount >= 500) break;

    // Determine which variant types to use based on category
    let variantTypesToUse: { typeId: string; typeName: string; values: string[] }[] = [];

    if (['zapatos'].includes(product.categorySlug)) {
      variantTypesToUse = [
        { typeId: variantTypes['Talla'].id, typeName: 'Talla', values: ['38', '39', '40', '41', '42', '43', '44'] },
        { typeId: variantTypes['Color'].id, typeName: 'Color', values: ['Negro', 'Blanco', 'Gris', 'Azul'] },
      ];
    } else if (['ropa-deportiva'].includes(product.categorySlug)) {
      variantTypesToUse = [
        { typeId: variantTypes['Talla'].id, typeName: 'Talla', values: ['S', 'M', 'L', 'XL', 'XXL'] },
        { typeId: variantTypes['Color'].id, typeName: 'Color', values: ['Negro', 'Blanco', 'Rojo', 'Azul', 'Gris'] },
      ];
    } else if (['proteinas', 'creatinas', 'pre-entreno', 'post-entreno'].includes(product.categorySlug)) {
      variantTypesToUse = [
        { typeId: variantTypes['Sabor'].id, typeName: 'Sabor', values: ['Chocolate', 'Vainilla', 'Fresa', 'Cookies & Cream'] },
        { typeId: variantTypes['Peso'].id, typeName: 'Peso', values: ['1kg', '2kg', '2.5kg'] },
      ];
    } else if (['mochilas'].includes(product.categorySlug)) {
      variantTypesToUse = [
        { typeId: variantTypes['Color'].id, typeName: 'Color', values: ['Negro', 'Azul', 'Gris', 'Verde'] },
        { typeId: variantTypes['Tamaño'].id, typeName: 'Tamaño', values: ['Mediano', 'Grande'] },
      ];
    } else if (['accesorios'].includes(product.categorySlug)) {
      variantTypesToUse = [
        { typeId: variantTypes['Color'].id, typeName: 'Color', values: ['Negro', 'Blanco', 'Rojo'] },
      ];
    }

    // Skip categories without variants (food, bakery)
    if (variantTypesToUse.length === 0) continue;

    // Create combinations
    const numVariants = Math.min(variantsPerProduct, 500 - variantCount);

    for (let v = 0; v < numVariants; v++) {
      try {
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            stock: randomInt(0, 50),
            isActive: true,
            order: v,
          },
        });

        // Add variant values
        for (const vt of variantTypesToUse) {
          const value = randomElement(vt.values);
          await prisma.productVariantVariantValue.create({
            data: {
              productVariantId: variant.id,
              variantTypeId: vt.typeId,
              value,
            },
          });
        }

        variantCount++;
      } catch (e) {
        continue;
      }
    }

    if (variantCount % 100 === 0) {
      console.log(`   🎨 ${variantCount} variants created...`);
    }
  }
  console.log(`   ✅ Created ${variantCount} product variants`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n====================================');
  console.log('       SEED COMPLETED!');
  console.log('====================================\n');
  console.log('Credenciales de acceso:');
  console.log('------------------------');
  console.log('Admin:');
  console.log('  Email: admin@catalogo.com');
  console.log('  Password: admin123');
  console.log('');
  console.log('Editor:');
  console.log('  Email: editor@catalogo.com');
  console.log('  Password: editor123');
  console.log('');
  console.log('Datos creados:');
  console.log('------------------------');
  console.log(`  - ${VARIANT_TYPES_DATA.length} Tipos de Variante`);
  console.log(`  - ${brands.length} Marcas con imágenes`);
  console.log(`  - ${categories.length} Categorías con imágenes`);
  console.log(`  - ${productCount} Productos con imágenes`);
  console.log(`  - ${variantCount} Sub-productos (variantes)`);
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
