import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CloudinaryService, UploadResult } from '../../common/services/cloudinary.service';
import { CacheService } from '../../common/services/cache.service';
import { ProductVariant, VariantValueImage } from '@prisma/client';
import { CreateProductVariantDto, UpdateProductVariantDto, CreateVariantValueImageDto } from './dto';

type ProductVariantWithValues = ProductVariant & {
  variantValues: {
    id: string;
    variantTypeId: string;
    value: string;
    variantType: {
      id: string;
      name: string;
    };
  }[];
};

@Injectable()
export class VariantsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private cache: CacheService,
  ) {}

  // =============================================
  // PRODUCT VARIANTS (Sub-productos)
  // =============================================

  async findByProduct(productId: string): Promise<ProductVariantWithValues[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { order: 'asc' },
      include: {
        variantValues: {
          include: {
            variantType: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<ProductVariantWithValues> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        variantValues: {
          include: {
            variantType: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Variante no encontrada');
    }

    return variant;
  }

  async create(productId: string, dto: CreateProductVariantDto): Promise<ProductVariantWithValues> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Get max order
    const maxOrder = await this.prisma.productVariant.aggregate({
      where: { productId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        salePrice: dto.salePrice,
        discountPercent: dto.discountPercent,
        stock: dto.stock,
        sku: dto.sku,
        isActive: dto.isActive ?? true,
        order,
        variantValues: {
          create: dto.variantValues.map((vv) => ({
            variantTypeId: vv.variantTypeId,
            value: vv.value,
          })),
        },
      },
      include: {
        variantValues: {
          include: {
            variantType: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    await this.cache.invalidateProduct(productId);

    return variant;
  }

  async update(id: string, dto: UpdateProductVariantDto): Promise<ProductVariantWithValues> {
    const existing = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Variante no encontrada');
    }

    // Update variant values if provided
    if (dto.variantValues) {
      // Delete existing variant values
      await this.prisma.productVariantVariantValue.deleteMany({
        where: { productVariantId: id },
      });

      // Create new variant values
      await this.prisma.productVariantVariantValue.createMany({
        data: dto.variantValues.map((vv) => ({
          productVariantId: id,
          variantTypeId: vv.variantTypeId,
          value: vv.value,
        })),
      });
    }

    const variant = await this.prisma.productVariant.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        salePrice: dto.salePrice,
        discountPercent: dto.discountPercent,
        stock: dto.stock,
        sku: dto.sku,
        isActive: dto.isActive,
      },
      include: {
        variantValues: {
          include: {
            variantType: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    await this.cache.invalidateProduct(existing.productId);

    return variant;
  }

  async delete(id: string): Promise<void> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new NotFoundException('Variante no encontrada');
    }

    // Delete image from Cloudinary if exists
    if (variant.imagePublicId) {
      await this.cloudinary.deleteImage(variant.imagePublicId);
    }

    await this.prisma.productVariant.delete({
      where: { id },
    });

    await this.cache.invalidateProduct(variant.productId);
  }

  async uploadImage(id: string, file: Express.Multer.File): Promise<ProductVariantWithValues> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new NotFoundException('Variante no encontrada');
    }

    // Delete old image if exists
    if (variant.imagePublicId) {
      await this.cloudinary.deleteImage(variant.imagePublicId);
    }

    const result: UploadResult = await this.cloudinary.uploadImage(file, 'product-variants');

    const updated = await this.prisma.productVariant.update({
      where: { id },
      data: {
        image: result.url,
        imagePublicId: result.publicId,
      },
      include: {
        variantValues: {
          include: {
            variantType: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    await this.cache.invalidateProduct(variant.productId);

    return updated;
  }

  async deleteImage(id: string): Promise<ProductVariantWithValues> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new NotFoundException('Variante no encontrada');
    }

    if (variant.imagePublicId) {
      await this.cloudinary.deleteImage(variant.imagePublicId);
    }

    const updated = await this.prisma.productVariant.update({
      where: { id },
      data: {
        image: null,
        imagePublicId: null,
      },
      include: {
        variantValues: {
          include: {
            variantType: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    await this.cache.invalidateProduct(variant.productId);

    return updated;
  }

  async reorder(productId: string, items: { id: string; order: number }[]): Promise<ProductVariantWithValues[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.productVariant.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    await this.cache.invalidateProduct(productId);

    return this.findByProduct(productId);
  }

  /**
   * Generar todas las combinaciones de variantes automáticamente
   * Ejemplo: Talla (S, M, L) x Color (Rojo, Azul) = 6 variantes
   */
  async generateCombinations(productId: string): Promise<{
    created: number;
    skipped: number;
    variants: ProductVariantWithValues[];
  }> {
    // Get product with its variant values
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        variantValues: {
          include: {
            variantType: { select: { id: true, name: true } },
          },
        },
        variants: {
          include: {
            variantValues: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Group product variant values by type
    // Example: { "color-type-id": ["Rojo", "Azul"], "talla-type-id": ["S", "M", "L"] }
    const valuesByType: Record<string, { variantTypeId: string; typeName: string; values: string[] }> = {};

    for (const pv of product.variantValues) {
      if (!valuesByType[pv.variantTypeId]) {
        valuesByType[pv.variantTypeId] = {
          variantTypeId: pv.variantTypeId,
          typeName: pv.variantType.name,
          values: [],
        };
      }
      valuesByType[pv.variantTypeId].values.push(pv.value);
    }

    const typeIds = Object.keys(valuesByType);

    if (typeIds.length === 0) {
      throw new BadRequestException('El producto no tiene valores de variante configurados');
    }

    // Generate all combinations using cartesian product
    const generateCartesian = (arrays: string[][]): string[][] => {
      if (arrays.length === 0) return [[]];
      if (arrays.length === 1) return arrays[0].map(v => [v]);

      const [first, ...rest] = arrays;
      const restCombinations = generateCartesian(rest);

      const result: string[][] = [];
      for (const value of first) {
        for (const combo of restCombinations) {
          result.push([value, ...combo]);
        }
      }
      return result;
    };

    const valuesArrays = typeIds.map(typeId => valuesByType[typeId].values);
    const combinations = generateCartesian(valuesArrays);

    // Get existing combinations to avoid duplicates
    const existingCombos = new Set(
      product.variants.map(v =>
        v.variantValues
          .map(vv => `${vv.variantTypeId}:${vv.value}`)
          .sort()
          .join('|')
      )
    );

    // Get current max order
    const maxOrder = await this.prisma.productVariant.aggregate({
      where: { productId },
      _max: { order: true },
    });
    let currentOrder = (maxOrder._max.order ?? -1) + 1;

    let created = 0;
    let skipped = 0;

    // Create new variants for each combination
    for (const combo of combinations) {
      // Build variant values for this combination
      const variantValues = combo.map((value, index) => ({
        variantTypeId: typeIds[index],
        value,
      }));

      // Check if this combination already exists
      const comboKey = variantValues
        .map(vv => `${vv.variantTypeId}:${vv.value}`)
        .sort()
        .join('|');

      if (existingCombos.has(comboKey)) {
        skipped++;
        continue;
      }

      // Create variant with this combination
      await this.prisma.productVariant.create({
        data: {
          productId,
          isActive: true,
          order: currentOrder++,
          variantValues: {
            create: variantValues,
          },
        },
      });

      created++;
    }

    await this.cache.invalidateProduct(productId);

    return {
      created,
      skipped,
      variants: await this.findByProduct(productId),
    };
  }

  /**
   * Eliminar todas las variantes de un producto
   */
  async deleteAllVariants(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Delete variant images from Cloudinary
    for (const variant of product.variants) {
      if (variant.imagePublicId) {
        await this.cloudinary.deleteImage(variant.imagePublicId);
      }
    }

    // Delete all variants (cascade deletes variant values)
    await this.prisma.productVariant.deleteMany({
      where: { productId },
    });

    await this.cache.invalidateProduct(productId);
  }

  // =============================================
  // VARIANT VALUE IMAGES (Imágenes por valor de variante)
  // Ejemplo: Color "Negro" tiene 3 imágenes, "Blanco" tiene 2
  // =============================================

  /**
   * Obtener imágenes por valor de variante de un producto
   */
  async getVariantValueImages(productId: string): Promise<VariantValueImage[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { imageVariantType: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.prisma.variantValueImage.findMany({
      where: { productId },
      orderBy: [
        { value: 'asc' },
        { order: 'asc' },
      ],
      include: {
        variantType: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Obtener imágenes de un valor específico (ej: Color="Negro")
   */
  async getImagesByValue(
    productId: string,
    variantTypeId: string,
    value: string,
  ): Promise<VariantValueImage[]> {
    return this.prisma.variantValueImage.findMany({
      where: {
        productId,
        variantTypeId,
        value,
      },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Subir imagen para un valor de variante
   */
  async uploadVariantValueImage(
    productId: string,
    dto: CreateVariantValueImageDto,
    file: Express.Multer.File,
  ): Promise<VariantValueImage> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar que el tipo de variante existe
    const variantType = await this.prisma.variantType.findUnique({
      where: { id: dto.variantTypeId },
    });

    if (!variantType) {
      throw new BadRequestException('Tipo de variante no encontrado');
    }

    // Upload to Cloudinary
    const result: UploadResult = await this.cloudinary.uploadImage(
      file,
      `products/${productId}/variant-values`,
    );

    // Get max order for this value
    const maxOrder = await this.prisma.variantValueImage.aggregate({
      where: {
        productId,
        variantTypeId: dto.variantTypeId,
        value: dto.value,
      },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    const image = await this.prisma.variantValueImage.create({
      data: {
        productId,
        variantTypeId: dto.variantTypeId,
        value: dto.value,
        url: result.url,
        publicId: result.publicId,
        order,
      },
      include: {
        variantType: {
          select: { id: true, name: true },
        },
      },
    });

    // Si es la primera imagen de este tipo, establecerlo como imageVariantType
    if (!product.imageVariantTypeId) {
      await this.prisma.product.update({
        where: { id: productId },
        data: { imageVariantTypeId: dto.variantTypeId },
      });
    }

    await this.cache.invalidateProduct(productId);

    return image;
  }

  /**
   * Eliminar una imagen de valor de variante
   */
  async deleteVariantValueImage(imageId: string): Promise<void> {
    const image = await this.prisma.variantValueImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Imagen no encontrada');
    }

    // Delete from Cloudinary
    await this.cloudinary.deleteImage(image.publicId);

    // Delete from database
    await this.prisma.variantValueImage.delete({
      where: { id: imageId },
    });

    await this.cache.invalidateProduct(image.productId);
  }

  /**
   * Eliminar todas las imágenes de un valor específico
   */
  async deleteAllImagesByValue(
    productId: string,
    variantTypeId: string,
    value: string,
  ): Promise<void> {
    const images = await this.prisma.variantValueImage.findMany({
      where: { productId, variantTypeId, value },
    });

    // Delete all from Cloudinary
    for (const image of images) {
      await this.cloudinary.deleteImage(image.publicId);
    }

    // Delete all from database
    await this.prisma.variantValueImage.deleteMany({
      where: { productId, variantTypeId, value },
    });

    await this.cache.invalidateProduct(productId);
  }

  /**
   * Reordenar imágenes de un valor de variante
   */
  async reorderVariantValueImages(
    productId: string,
    items: { id: string; order: number }[],
  ): Promise<VariantValueImage[]> {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.variantValueImage.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    await this.cache.invalidateProduct(productId);

    return this.getVariantValueImages(productId);
  }

  /**
   * Establecer qué tipo de variante tiene imágenes vinculadas
   */
  async setImageVariantType(productId: string, variantTypeId: string | null) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (variantTypeId) {
      const variantType = await this.prisma.variantType.findUnique({
        where: { id: variantTypeId },
      });

      if (!variantType) {
        throw new BadRequestException('Tipo de variante no encontrado');
      }
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { imageVariantTypeId: variantTypeId },
      include: {
        imageVariantType: {
          select: { id: true, name: true },
        },
      },
    });

    await this.cache.invalidateProduct(productId);

    return updated;
  }

  /**
   * Obtener configuración de imágenes por variante del producto
   */
  async getImageVariantConfig(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        imageVariantType: {
          select: { id: true, name: true },
        },
        variantValueImages: {
          orderBy: [{ value: 'asc' }, { order: 'asc' }],
          include: {
            variantType: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Agrupar imágenes por valor
    const imagesByValue: Record<string, VariantValueImage[]> = {};
    for (const img of product.variantValueImages) {
      const key = img.value;
      if (!imagesByValue[key]) {
        imagesByValue[key] = [];
      }
      imagesByValue[key].push(img);
    }

    return {
      imageVariantType: product.imageVariantType,
      imagesByValue,
      totalImages: product.variantValueImages.length,
    };
  }
}
