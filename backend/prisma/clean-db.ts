import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🗑️  Limpiando base de datos...\n');

  try {
    // 1. Eliminar estadísticas
    const statsDeleted = await prisma.productStat.deleteMany();
    console.log(`✅ ProductStat: ${statsDeleted.count} registros eliminados`);

    // 2. Eliminar imágenes de valores de variante
    const variantValueImagesDeleted = await prisma.variantValueImage.deleteMany();
    console.log(`✅ VariantValueImage: ${variantValueImagesDeleted.count} registros eliminados`);

    // 3. Eliminar valores de variante de sub-productos
    const productVariantValuesDeleted = await prisma.productVariantVariantValue.deleteMany();
    console.log(`✅ ProductVariantVariantValue: ${productVariantValuesDeleted.count} registros eliminados`);

    // 4. Eliminar sub-productos (variantes)
    const variantsDeleted = await prisma.productVariant.deleteMany();
    console.log(`✅ ProductVariant: ${variantsDeleted.count} registros eliminados`);

    // 5. Eliminar valores de variante de productos
    const productValuesDeleted = await prisma.productVariantValue.deleteMany();
    console.log(`✅ ProductVariantValue: ${productValuesDeleted.count} registros eliminados`);

    // 6. Eliminar imágenes de productos
    const imagesDeleted = await prisma.productImage.deleteMany();
    console.log(`✅ ProductImage: ${imagesDeleted.count} registros eliminados`);

    // 7. Eliminar productos
    const productsDeleted = await prisma.product.deleteMany();
    console.log(`✅ Product: ${productsDeleted.count} registros eliminados`);

    // 8. Eliminar valores de tipos de variante
    const variantTypeValuesDeleted = await prisma.variantTypeValue.deleteMany();
    console.log(`✅ VariantTypeValue: ${variantTypeValuesDeleted.count} registros eliminados`);

    // 9. Eliminar tipos de variante
    const variantTypesDeleted = await prisma.variantType.deleteMany();
    console.log(`✅ VariantType: ${variantTypesDeleted.count} registros eliminados`);

    // 10. Eliminar categorías
    const categoriesDeleted = await prisma.category.deleteMany();
    console.log(`✅ Category: ${categoriesDeleted.count} registros eliminados`);

    // 11. Eliminar marcas
    const brandsDeleted = await prisma.brand.deleteMany();
    console.log(`✅ Brand: ${brandsDeleted.count} registros eliminados`);

    console.log('\n✨ Base de datos limpia!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
