import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma.service';
import {
  CloudinaryService,
  UploadResult,
} from '../../common/services/cloudinary.service';
import {
  CacheService,
  CACHE_KEYS,
  CACHE_TTL,
} from '../../common/services/cache.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto, PaginatedProducts } from './dto/product-query.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { Product, ProductImage, Prisma } from '@prisma/client';
import { generateSlug } from '../../common/utils/slug.util';
import { generateProductSeo } from '../../common/utils/auto-seo.util';
import { ProductSyncEvent } from '../../common/services/sheet-sync.service';

type ProductWithRelations = Product & {
  category?: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string; logo: string | null } | null;
  images?: ProductImage[];
  _count?: { variants: number };
};

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private cache: CacheService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    query: ProductQueryDto,
  ): Promise<PaginatedProducts<ProductWithRelations>> {
    const { page, limit, categoryId, brandId, search, isActive, isFeatured, sortBy, sortOrder } =
      query;

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy with stable secondary sort
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;
    const orderByArray: Prisma.ProductOrderByWithRelationInput[] = [
      orderBy,
      { createdAt: 'desc' },
    ];

    // Get total count
    const total = await this.prisma.product.count({ where });

    // Get products
    const products = await this.prisma.product.findMany({
      where,
      orderBy: orderByArray,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { variants: true },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<ProductWithRelations> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        variantValues: {
          include: {
            variantType: {
              select: { id: true, name: true },
            },
          },
        },
        variants: {
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
        },
        _count: {
          select: { variants: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async findBySlug(slug: string): Promise<ProductWithRelations> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        variantValues: {
          include: {
            variantType: {
              select: { id: true, name: true },
            },
          },
        },
        variants: {
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
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async create(dto: CreateProductDto): Promise<ProductWithRelations> {
    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verify brand exists if provided
    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
      });

      if (!brand) {
        throw new NotFoundException('Marca no encontrada');
      }
    }

    // Generate slug if not provided
    const slug = dto.slug || generateSlug(dto.name);

    // Check if slug exists
    const existing = await this.prisma.product.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Ya existe un producto con ese slug');
    }

    // Get max order for category
    const maxOrder = await this.prisma.product.aggregate({
      where: { categoryId: dto.categoryId },
      _max: { order: true },
    });
    const order = dto.order ?? (maxOrder._max.order ?? -1) + 1;

    // Auto-generate SEO fields if not provided
    if (!dto.seoTitle || !dto.seoDescription || !dto.seoKeywords) {
      const settings = await this.prisma.settings.findUnique({ where: { id: 'main' }, select: { businessName: true, currency: true } });
      const brandName = dto.brandId ? (await this.prisma.brand.findUnique({ where: { id: dto.brandId }, select: { name: true } }))?.name : undefined;
      const autoSeo = generateProductSeo({
        name: dto.name,
        categoryName: category.name,
        brandName,
        price: dto.salePrice || dto.price,
        currency: settings?.currency || 'S/',
        businessName: settings?.businessName,
      });
      if (!dto.seoTitle) dto.seoTitle = autoSeo.seoTitle;
      if (!dto.seoDescription) dto.seoDescription = autoSeo.seoDescription;
      if (!dto.seoKeywords) dto.seoKeywords = autoSeo.seoKeywords;
    }

    // Extract variantValues from DTO
    const { variantValues, ...productData } = dto;

    // Create product with variant values in a transaction
    const product = await this.prisma.$transaction(async (tx) => {
      // Create the product
      const newProduct = await tx.product.create({
        data: {
          ...productData,
          slug,
          order,
        },
      });

      // Create variant values if provided
      if (variantValues && variantValues.length > 0) {
        // Verify all variant types exist (use unique IDs for comparison)
        const variantTypeIds = [...new Set(variantValues.map((v) => v.variantTypeId))];
        const existingTypes = await tx.variantType.findMany({
          where: { id: { in: variantTypeIds } },
        });

        if (existingTypes.length !== variantTypeIds.length) {
          throw new NotFoundException('Uno o más tipos de variante no existen');
        }

        // Create variant values
        await tx.productVariantValue.createMany({
          data: variantValues.map((v) => ({
            productId: newProduct.id,
            variantTypeId: v.variantTypeId,
            value: v.value,
          })),
        });
      }

      return newProduct;
    });

    // Invalidate cache
    await this.cache.invalidateProducts();

    // Return product with relations
    const createdProduct = await this.findOne(product.id);

    // Emitir evento para sincronizar con Google Sheets (fire-and-forget)
    this.emitProductEvent('created', createdProduct);

    return createdProduct;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductWithRelations> {
    // Check if product exists
    await this.findOne(id);

    // If categoryId is provided, verify it exists
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    // If brandId is provided, verify it exists
    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
      });

      if (!brand) {
        throw new NotFoundException('Marca no encontrada');
      }
    }

    // Check slug uniqueness if provided
    if (dto.slug) {
      const existing = await this.prisma.product.findFirst({
        where: {
          slug: dto.slug,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Ya existe un producto con ese slug');
      }
    }

    // Extract variantValues from DTO
    const { variantValues, ...productData } = dto;

    // Update product with variant values in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Update the product
      await tx.product.update({
        where: { id },
        data: productData,
      });

      // Update variant values if provided
      if (variantValues !== undefined) {
        // Delete existing variant values
        await tx.productVariantValue.deleteMany({
          where: { productId: id },
        });

        // Create new variant values if any
        if (variantValues.length > 0) {
          // Verify all variant types exist (use unique IDs for comparison)
          const variantTypeIds = [...new Set(variantValues.map((v) => v.variantTypeId))];
          const existingTypes = await tx.variantType.findMany({
            where: { id: { in: variantTypeIds } },
          });

          if (existingTypes.length !== variantTypeIds.length) {
            throw new NotFoundException('Uno o más tipos de variante no existen');
          }

          // Create variant values
          await tx.productVariantValue.createMany({
            data: variantValues.map((v) => ({
              productId: id,
              variantTypeId: v.variantTypeId,
              value: v.value,
            })),
          });
        }
      }
    });

    // Invalidate cache
    await this.cache.invalidateProduct(id);

    // Return product with relations
    const updatedProduct = await this.findOne(id);

    // Emitir evento para sincronizar con Google Sheets (fire-and-forget)
    this.emitProductEvent('updated', updatedProduct);

    return updatedProduct;
  }

  async delete(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        await this.cloudinary.deleteImage(image.publicId);
      }
    }

    // Guardar datos antes de eliminar para el evento
    const deletedProductData = {
      id: product.id,
      name: product.name,
    };

    await this.prisma.product.delete({
      where: { id },
    });

    // Invalidate cache
    await this.cache.invalidateProducts();

    // Emitir evento para sincronizar con Google Sheets (fire-and-forget)
    this.emitProductEvent('deleted', { id: deletedProductData.id, name: deletedProductData.name } as any);
  }

  async duplicate(id: string): Promise<ProductWithRelations> {
    const product = await this.findOne(id);

    // Generate new slug
    let newSlug = `${product.slug}-copia`;
    let counter = 1;

    while (await this.prisma.product.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${product.slug}-copia-${counter}`;
      counter++;
    }

    // Get max order
    const maxOrder = await this.prisma.product.aggregate({
      where: { categoryId: product.categoryId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? 0) + 1;

    // Create duplicate (without images and variants)
    const duplicate = await this.prisma.product.create({
      data: {
        categoryId: product.categoryId,
        brandId: product.brandId,
        name: `${product.name} (copia)`,
        slug: newSlug,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        showPrice: product.showPrice,
        stock: product.stock,
        showStock: product.showStock,
        stockMessage: product.stockMessage,
        isActive: false, // Duplicate starts as inactive
        isFeatured: false,
        order,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        seoKeywords: product.seoKeywords,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        images: true,
        _count: {
          select: { variants: true },
        },
      },
    });

    // Invalidate cache
    await this.cache.invalidateProducts();

    return duplicate;
  }

  async uploadImages(
    id: string,
    files: Express.Multer.File[],
  ): Promise<ProductWithRelations> {
    const product = await this.findOne(id);

    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron imágenes');
    }

    // Get max order
    const maxOrder = await this.prisma.productImage.aggregate({
      where: { productId: id },
      _max: { order: true },
    });
    let order = (maxOrder._max.order ?? -1) + 1;

    // Upload images to Cloudinary and create records
    const uploadPromises = files.map(async (file) => {
      const result: UploadResult = await this.cloudinary.uploadImage(
        file,
        'products',
      );

      const imageRecord = await this.prisma.productImage.create({
        data: {
          productId: id,
          url: result.url,
          publicId: result.publicId,
          order: order++,
        },
      });

      return imageRecord;
    });

    await Promise.all(uploadPromises);

    // Invalidate cache
    await this.cache.invalidateProduct(id);

    // Return updated product
    return this.findOne(id);
  }

  async deleteImage(productId: string, imageId: string): Promise<ProductWithRelations> {
    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
    });

    if (!image) {
      throw new NotFoundException('Imagen no encontrada');
    }

    // Delete from Cloudinary
    if (image.publicId) {
      await this.cloudinary.deleteImage(image.publicId);
    }

    // Delete record
    await this.prisma.productImage.delete({
      where: { id: imageId },
    });

    // Invalidate cache
    await this.cache.invalidateProduct(productId);

    return this.findOne(productId);
  }

  async reorderImages(
    productId: string,
    dto: ReorderImagesDto,
  ): Promise<ProductWithRelations> {
    // Verify product exists
    await this.findOne(productId);

    // Update all orders in a transaction
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.productImage.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    // Invalidate cache
    await this.cache.invalidateProduct(productId);

    return this.findOne(productId);
  }

  /**
   * Emite evento de producto para sincronización con Google Sheets
   * Fire-and-forget: nunca bloquea ni falla la operación principal
   */
  private emitProductEvent(
    action: 'created' | 'updated' | 'deleted',
    product: ProductWithRelations | { id: string; name: string },
  ): void {
    try {
      const event: ProductSyncEvent = {
        action,
        product: {
          id: product.id,
          name: 'name' in product ? product.name : undefined,
          price: 'price' in product ? Number(product.price) : undefined,
          salePrice: 'salePrice' in product && product.salePrice ? Number(product.salePrice) : null,
          categoryName: 'category' in product ? product.category?.name : undefined,
          brandName: 'brand' in product ? product.brand?.name : undefined,
          description: 'description' in product ? product.description : undefined,
          stock: 'stock' in product ? product.stock : undefined,
          isActive: 'isActive' in product ? product.isActive : undefined,
          seoTitle: 'seoTitle' in product ? product.seoTitle : undefined,
          seoDescription: 'seoDescription' in product ? product.seoDescription : undefined,
          seoKeywords: 'seoKeywords' in product ? product.seoKeywords : undefined,
          imageUrl: 'images' in product && product.images?.[0] ? product.images[0].url : undefined,
        },
      };

      this.eventEmitter.emit(`product.${action}`, event);
    } catch (error) {
      // Nunca fallar la operación principal por un error de sync
      this.logger.error(`Error al emitir evento product.${action}: ${error.message}`);
    }
  }
}
