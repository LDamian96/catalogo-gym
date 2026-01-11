import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// URLs de imágenes por categoría
const CATEGORY_IMAGES: Record<string, string> = {
  'polos': 'https://images.unsplash.com/photo-1625910513413-5fc45e5d5e11?w=800',
  'zapatillas': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  'sudaderas': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
  'shorts': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800',
  'jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
  'camisetas': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
  'pantalones': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
  'chaquetas': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
  'camisas': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
  'vestidos': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
  'faldas': 'https://images.unsplash.com/photo-1583496661160-fb5886a0edd5?w=800',
  'blusas': 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800',
  'gorras': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
  'mochilas': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
  'bolsos': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
  'accesorios': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
};

// Imágenes por color para cada categoría
const COLOR_IMAGES: Record<string, Record<string, string>> = {
  'polos': {
    'Negro': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
    'Blanco': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    'Azul': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600',
    'Rojo': 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600',
    'Verde': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
    'Gris': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
    'Navy': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600',
    'Rosa': 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600',
  },
  'zapatillas': {
    'Negro': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600',
    'Blanco': 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600',
    'Rojo': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    'Azul': 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600',
    'Gris': 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600',
    'Verde': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600',
    'Navy': 'https://images.unsplash.com/photo-1584735175315-9d5df23be6c4?w=600',
  },
  'sudaderas': {
    'Negro': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
    'Gris': 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600',
    'Blanco': 'https://images.unsplash.com/photo-1618354691551-44de113f0164?w=600',
    'Navy': 'https://images.unsplash.com/photo-1609873814058-a8928924184a?w=600',
    'Azul': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600',
    'Rojo': 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9f?w=600',
  },
  'camisetas': {
    'Negro': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
    'Blanco': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    'Gris': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
    'Navy': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600',
    'Rojo': 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600',
    'Azul': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600',
  },
  'shorts': {
    'Negro': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600',
    'Gris': 'https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?w=600',
    'Azul': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600',
    'Blanco': 'https://images.unsplash.com/photo-1617952739858-28043cecdae3?w=600',
    'Navy': 'https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=600',
    'Rojo': 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600',
  },
  'jeans': {
    'Azul': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
    'Azul Medio': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600',
    'Azul Oscuro': 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600',
    'Negro': 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600',
    'Gris': 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600',
    'Blanco': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
  },
  'pantalones': {
    'Negro': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
    'Gris': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
    'Navy': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',
    'Azul': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
    'Verde': 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600',
  },
  'chaquetas': {
    'Negro': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',
    'Azul': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
    'Navy': 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=600',
    'Verde': 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=600',
    'Rojo': 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600',
    'Gris': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
  },
  'camisas': {
    'Blanco': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
    'Azul Claro': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600',
    'Rosa': 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600',
    'Negro': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
    'Verde': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
  },
  'vestidos': {
    'Negro': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
    'Azul': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
    'Rosa': 'https://images.unsplash.com/photo-1623609163859-ca93c959b5ba?w=600',
    'Blanco': 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600',
  },
  'faldas': {
    'Negro': 'https://images.unsplash.com/photo-1583496661160-fb5886a0edd5?w=600',
    'Beige': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
    'Azul': 'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=600',
  },
  'blusas': {
    'Blanco': 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600',
    'Negro': 'https://images.unsplash.com/photo-1562572159-4efc207f5aab?w=600',
    'Rosa': 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600',
  },
  'gorras': {
    'Negro': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600',
    'Blanco': 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600',
    'Navy': 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=600',
    'Rojo': 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600',
  },
  'mochilas': {
    'Negro': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    'Gris': 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600',
    'Navy': 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600',
    'Azul': 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600',
    'Amarillo': 'https://images.unsplash.com/photo-1558470598-a5dda9640f68?w=600',
    'Rosa': 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600',
  },
  'bolsos': {
    'Negro': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
    'Camel': 'https://images.unsplash.com/photo-1591561954555-607968c989ab?w=600',
    'Beige': 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600',
    'Rosa': 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600',
  },
  'accesorios': {
    'Negro': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600',
    'Blanco': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600',
    'Gris': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600',
  },
};

function getColorImage(categorySlug: string, color: string): string {
  const catImages = COLOR_IMAGES[categorySlug];
  if (catImages) {
    if (catImages[color]) return catImages[color];
    for (const key of Object.keys(catImages)) {
      if (color.toLowerCase().includes(key.toLowerCase())) return catImages[key];
    }
    return Object.values(catImages)[0];
  }
  return CATEGORY_IMAGES[categorySlug] || 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600';
}

async function main() {
  console.log('🚀 Iniciando importación CSV...\n');

  const csvPath = path.join(__dirname, '../../productos-catalogo-completo.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  console.log(`📄 ${lines.length - 1} productos encontrados\n`);

  // Limpiar datos
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.variantValueImage.deleteMany();
  await prisma.productVariantVariantValue.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productVariantValue.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productStat.deleteMany();
  await prisma.product.deleteMany();
  await prisma.variantTypeValue.deleteMany();
  await prisma.variantType.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();

  // Settings
  console.log('⚙️  Creando settings...');
  await prisma.settings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      businessName: 'Fashion Store',
      whatsapp: '+51999888777',
      currency: 'S/',
      cartEnabled: true,
      welcomeMessage: '¡Hola! 👋 Bienvenido a Fashion Store',
      description: 'Tu tienda de moda con las mejores marcas',
    },
  });

  // Usuario admin
  console.log('👤 Creando usuario admin...');
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

  // Parsear CSV
  interface ProductData {
    nombre: string;
    precio: number;
    categoria: string;
    descripcion: string;
    precio_oferta: number | null;
    stock: number | null;
    marca: string;
    activo: boolean;
    destacado: boolean;
    variante_talla: string[];
    variante_color: string[];
    variante_imagen: string;
  }

  const productsData: ProductData[] = [];
  const categoriesSet = new Set<string>();
  const brandsSet = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 5) continue;

    const data: ProductData = {
      nombre: values[0] || '',
      precio: parseFloat(values[1]) || 0,
      categoria: values[2] || '',
      descripcion: values[3] || '',
      precio_oferta: values[4] ? parseFloat(values[4]) : null,
      stock: values[5] ? parseInt(values[5]) : null,
      marca: values[6] || '',
      activo: (values[7] || 'si').toLowerCase() === 'si',
      destacado: (values[8] || '').toLowerCase() === 'si',
      variante_talla: (values[9] || '').split(',').map(v => v.trim()).filter(v => v),
      variante_color: (values[10] || '').split(',').map(v => v.trim()).filter(v => v),
      variante_imagen: values[13] || values[10] ? 'color' : '',
    };

    if (data.nombre && data.categoria) {
      productsData.push(data);
      categoriesSet.add(data.categoria);
      if (data.marca) brandsSet.add(data.marca);
    }
  }

  // Crear tipos de variante
  console.log('🏷️  Creando tipos de variante...');
  const variantTypes: Record<string, string> = {};

  const vtTalla = await prisma.variantType.create({
    data: { name: 'Talla', description: 'Tallas', order: 0, isActive: true },
  });
  variantTypes['Talla'] = vtTalla.id;

  const vtColor = await prisma.variantType.create({
    data: { name: 'Color', description: 'Colores', order: 1, isActive: true },
  });
  variantTypes['Color'] = vtColor.id;

  // Recopilar valores únicos
  const allTallas = new Set<string>();
  const allColores = new Set<string>();
  for (const p of productsData) {
    p.variante_talla.forEach(v => allTallas.add(v));
    p.variante_color.forEach(v => allColores.add(v));
  }

  // Crear valores de variante
  let order = 0;
  for (const value of allTallas) {
    await prisma.variantTypeValue.create({
      data: { variantTypeId: variantTypes['Talla'], value, order: order++, isActive: true },
    });
  }
  order = 0;
  for (const value of allColores) {
    await prisma.variantTypeValue.create({
      data: { variantTypeId: variantTypes['Color'], value, order: order++, isActive: true },
    });
  }
  console.log(`   ✅ ${allTallas.size} tallas, ${allColores.size} colores\n`);

  // Crear marcas
  console.log('🏪 Creando marcas...');
  const brands: Record<string, string> = {};
  let brandOrder = 0;
  for (const brandName of brandsSet) {
    const created = await prisma.brand.create({
      data: {
        name: brandName,
        slug: generateSlug(brandName),
        order: brandOrder++,
        isActive: true,
      },
    });
    brands[brandName] = created.id;
  }
  console.log(`   ✅ ${Object.keys(brands).length} marcas\n`);

  // Crear categorías
  console.log('📁 Creando categorías...');
  const categories: Record<string, { id: string; slug: string }> = {};
  let catOrder = 0;
  for (const catName of categoriesSet) {
    const slug = generateSlug(catName);
    const image = CATEGORY_IMAGES[slug] || 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800';
    const created = await prisma.category.create({
      data: {
        name: catName,
        slug,
        description: `Categoría ${catName}`,
        image,
        order: catOrder++,
        isActive: true,
      },
    });
    categories[catName] = { id: created.id, slug };
  }
  console.log(`   ✅ ${Object.keys(categories).length} categorías\n`);

  // Crear productos
  console.log('📦 Creando productos...');
  let productCount = 0;
  let variantCount = 0;

  for (const p of productsData) {
    const category = categories[p.categoria];
    if (!category) continue;

    const slug = generateSlug(`${p.nombre}-${productCount}`);
    const brandId = p.marca ? brands[p.marca] : null;

    let discountPercent: number | null = null;
    if (p.precio_oferta && p.precio > 0) {
      discountPercent = Math.round(((p.precio - p.precio_oferta) / p.precio) * 100);
    }

    const firstColor = p.variante_color[0] || 'Negro';
    const mainImage = getColorImage(category.slug, firstColor);

    // Crear producto
    const product = await prisma.product.create({
      data: {
        name: p.nombre,
        slug,
        description: p.descripcion,
        price: p.precio,
        salePrice: p.precio_oferta,
        discountPercent,
        showPrice: true,
        stock: p.stock,
        showStock: p.stock !== null,
        isActive: p.activo,
        isFeatured: p.destacado,
        order: productCount,
        categoryId: category.id,
        brandId,
        imageVariantTypeId: p.variante_color.length > 0 ? variantTypes['Color'] : null,
      },
    });

    // Imagen principal
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: mainImage,
        publicId: `seed-${product.id}`,
        order: 0,
      },
    });

    // Crear ProductVariantValue (valores del producto padre)
    for (const talla of p.variante_talla) {
      await prisma.productVariantValue.create({
        data: { productId: product.id, variantTypeId: variantTypes['Talla'], value: talla },
      });
    }
    for (const color of p.variante_color) {
      await prisma.productVariantValue.create({
        data: { productId: product.id, variantTypeId: variantTypes['Color'], value: color },
      });
    }

    // Crear imágenes por valor de variante (para Color)
    if (p.variante_color.length > 0) {
      for (let i = 0; i < p.variante_color.length; i++) {
        const color = p.variante_color[i];
        const colorImage = getColorImage(category.slug, color);
        await prisma.variantValueImage.create({
          data: {
            productId: product.id,
            variantTypeId: variantTypes['Color'],
            value: color,
            url: colorImage,
            publicId: `seed-${product.id}-${color}`,
            order: i,
          },
        });
      }
    }

    // Crear sub-productos (combinaciones)
    if (p.variante_talla.length > 0 && p.variante_color.length > 0) {
      for (const talla of p.variante_talla) {
        for (const color of p.variante_color) {
          const variant = await prisma.productVariant.create({
            data: {
              productId: product.id,
              stock: Math.floor(Math.random() * 15) + 1,
              isActive: true,
              order: variantCount,
            },
          });
          await prisma.productVariantVariantValue.createMany({
            data: [
              { productVariantId: variant.id, variantTypeId: variantTypes['Talla'], value: talla },
              { productVariantId: variant.id, variantTypeId: variantTypes['Color'], value: color },
            ],
          });
          variantCount++;
        }
      }
    } else if (p.variante_color.length > 0) {
      for (const color of p.variante_color) {
        const variant = await prisma.productVariant.create({
          data: { productId: product.id, stock: Math.floor(Math.random() * 15) + 1, isActive: true, order: variantCount },
        });
        await prisma.productVariantVariantValue.create({
          data: { productVariantId: variant.id, variantTypeId: variantTypes['Color'], value: color },
        });
        variantCount++;
      }
    } else if (p.variante_talla.length > 0) {
      for (const talla of p.variante_talla) {
        const variant = await prisma.productVariant.create({
          data: { productId: product.id, stock: Math.floor(Math.random() * 15) + 1, isActive: true, order: variantCount },
        });
        await prisma.productVariantVariantValue.create({
          data: { productVariantId: variant.id, variantTypeId: variantTypes['Talla'], value: talla },
        });
        variantCount++;
      }
    }

    productCount++;
    if (productCount % 25 === 0) console.log(`   📦 ${productCount} productos...`);
  }

  console.log(`\n   ✅ ${productCount} productos, ${variantCount} sub-productos\n`);

  console.log('====================================');
  console.log('     IMPORTACIÓN COMPLETADA!');
  console.log('====================================\n');
  console.log('Admin: admin@catalogo.com / admin123\n');
  console.log(`Categorías: ${Object.keys(categories).length}`);
  console.log(`Marcas: ${Object.keys(brands).length}`);
  console.log(`Productos: ${productCount}`);
  console.log(`Sub-productos: ${variantCount}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
