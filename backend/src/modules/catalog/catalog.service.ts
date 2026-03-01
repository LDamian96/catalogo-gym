import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService, CACHE_KEYS, CACHE_TTL } from '../../common/services/cache.service';
import { CatalogCategoryQueryDto, CatalogSearchQueryDto, TrackEventDto } from './dto';
import { Prisma, StatType } from '@prisma/client';

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  /**
   * GET /catalog - Datos generales del catálogo
   * Retorna: settings, categorías activas, productos destacados
   */
  async getCatalogHome() {
    // Try cache first
    const cacheKey = 'catalog:home';
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch all data in parallel
    const [settings, categories, featuredProducts, brands] = await Promise.all([
      // Settings
      this.prisma.settings.findUnique({
        where: { id: 'main' },
      }),

      // Active categories with product count (hierarchical)
      this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ level: 'asc' }, { order: 'asc' }],
        select: {
          id: true,
          parentId: true,
          name: true,
          slug: true,
          image: true,
          description: true,
          level: true,
          seoTitle: true,
          seoDescription: true,
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              parentId: true,
              name: true,
              slug: true,
              image: true,
              level: true,
              _count: { select: { products: { where: { isActive: true } } } },
            },
          },
          _count: { select: { products: { where: { isActive: true } } } },
        },
      }),

      // Featured products
      this.prisma.product.findMany({
        where: {
          isActive: true,
          isFeatured: true,
        },
        orderBy: { order: 'asc' },
        take: 12,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true, logo: true } },
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
      }),

      // Active brands
      this.prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          _count: { select: { products: { where: { isActive: true } } } },
        },
      }),
    ]);

    const result = {
      settings: settings
        ? {
            businessName: settings.businessName,
            logo: settings.logo,
            whatsapp: settings.whatsapp,
            currency: settings.currency,
            description: settings.description,
            address: settings.address,
            schedule: settings.schedule,
            cartEnabled: settings.cartEnabled,
            variantsEnabled: settings.variantsEnabled,
            welcomeMessage: settings.welcomeMessage,
            seoTitle: settings.seoTitle,
            seoDescription: settings.seoDescription,
            seoKeywords: settings.seoKeywords,
            ogImage: settings.ogImage,
            googleAnalyticsId: settings.googleAnalyticsId,
            googleTagManagerId: settings.googleTagManagerId,
            facebookPixelId: settings.facebookPixelId,
            tiktokPixelId: settings.tiktokPixelId,
          }
        : null,
      categories,
      featuredProducts,
      brands,
    };

    // Cache for 5 minutes
    await this.cache.set(cacheKey, result, 300);

    return result;
  }

  /**
   * GET /catalog/products/:slug - Detalle de producto público
   */
  async getProductBySlug(slug: string) {
    // Try cache first
    const cacheKey = `catalog:product:${slug}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        images: { orderBy: { order: 'asc' } },
        // Tipo de variante que tiene imágenes vinculadas (ej: Color, Sabor)
        imageVariantType: { select: { id: true, name: true } },
        // Imágenes por valor de variante (ej: Color=Negro tiene 3 fotos)
        variantValueImages: {
          orderBy: [{ value: 'asc' }, { order: 'asc' }],
          include: {
            variantType: { select: { id: true, name: true } },
          },
        },
        variantValues: {
          include: {
            variantType: { select: { id: true, name: true } },
          },
        },
        variants: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            variantValues: {
              include: {
                variantType: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Get related products (same category, excluding this one)
    const relatedProducts = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        NOT: { id: product.id },
      },
      orderBy: { order: 'asc' },
      take: 4,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    // Agrupar imágenes por valor de variante para facilitar el uso en frontend
    const imagesByVariantValue: Record<string, typeof product.variantValueImages> = {};
    for (const img of product.variantValueImages) {
      const key = img.value;
      if (!imagesByVariantValue[key]) {
        imagesByVariantValue[key] = [];
      }
      imagesByVariantValue[key].push(img);
    }

    // Imagen por defecto del producto padre (primera imagen)
    const defaultImage = product.images?.[0]?.url || null;

    // Procesar variantes: heredar imagen del padre si no tienen imagen propia
    const variantsWithInheritedImage = product.variants.map((variant) => {
      let inheritedImage = variant.image;

      // Si la variante no tiene imagen propia
      if (!inheritedImage) {
        // Intentar obtener imagen del valor de variante asociado (ej: Color=Negro)
        if (product.imageVariantType) {
          const matchingValue = variant.variantValues?.find(
            (vv) => vv.variantTypeId === product.imageVariantType?.id,
          );
          if (matchingValue && imagesByVariantValue[matchingValue.value]?.[0]) {
            inheritedImage = imagesByVariantValue[matchingValue.value][0].url;
          }
        }

        // Si aún no tiene imagen, usar la imagen del producto padre
        if (!inheritedImage) {
          inheritedImage = defaultImage;
        }
      }

      return {
        ...variant,
        image: inheritedImage, // Imagen heredada automáticamente
      };
    });

    const result = {
      ...product,
      variants: variantsWithInheritedImage, // Variantes con imagen heredada
      imagesByVariantValue, // Imágenes agrupadas por valor (ej: { "Negro": [...], "Blanco": [...] })
      relatedProducts,
    };

    // Cache for 10 minutes
    await this.cache.set(cacheKey, result, 600);

    return result;
  }

  /**
   * GET /catalog/categories/:slug - Productos por categoría
   */
  async getProductsByCategory(slug: string, query: CatalogCategoryQueryDto) {
    const { page, limit, sortBy, sortOrder, minPrice, maxPrice, brandId } = query;

    // Find category first
    const category = await this.prisma.category.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      categoryId: category.id,
      isActive: true,
    };

    if (brandId) {
      where.brandId = brandId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Build orderBy
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    // Get total count
    const total = await this.prisma.product.count({ where });

    // Get products
    const products = await this.prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        images: { orderBy: { order: 'asc' }, take: 1 },
        _count: { select: { variants: { where: { isActive: true } } } },
      },
    });

    // Get available brands in this category for filters
    const brandsInCategory = await this.prisma.brand.findMany({
      where: {
        isActive: true,
        products: {
          some: {
            categoryId: category.id,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
      },
      orderBy: { name: 'asc' },
    });

    // Get price range in this category
    const priceRange = await this.prisma.product.aggregate({
      where: {
        categoryId: category.id,
        isActive: true,
      },
      _min: { price: true },
      _max: { price: true },
    });

    // Get variant type filters (showAsFilter = true)
    const variantFilters = await this.getVariantFiltersForCategory(category.id);

    const totalPages = Math.ceil(total / limit);

    return {
      category,
      products,
      filters: {
        brands: brandsInCategory,
        priceRange: {
          min: priceRange._min.price ? Number(priceRange._min.price) : 0,
          max: priceRange._max.price ? Number(priceRange._max.price) : 0,
        },
        variantTypes: variantFilters,
      },
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

  /**
   * GET /catalog/search - Búsqueda pública
   */
  async searchProducts(query: CatalogSearchQueryDto) {
    const { q, page, limit, categoryId, brandId, minPrice, maxPrice } = query;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    // Only apply search filter if query is not empty
    if (q && q.trim()) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Get total count
    const total = await this.prisma.product.count({ where });

    // Get products
    const products = await this.prisma.product.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        images: { orderBy: { order: 'asc' }, take: 1 },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      query: q,
      products,
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

  /**
   * Get variant type filters for a category
   * Returns variant types with showAsFilter=true and their available values
   */
  private async getVariantFiltersForCategory(categoryId: string) {
    // Get variant types that should show as filters
    const variantTypes = await this.prisma.variantType.findMany({
      where: {
        isActive: true,
        showAsFilter: true,
      },
      orderBy: { order: 'asc' },
      include: {
        values: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    // Get all variant values used by products in this category
    const usedValues = await this.prisma.productVariantValue.findMany({
      where: {
        product: {
          categoryId,
          isActive: true,
        },
        variantType: {
          showAsFilter: true,
        },
      },
      select: {
        variantTypeId: true,
        value: true,
      },
      distinct: ['variantTypeId', 'value'],
    });

    // Create a map of used values per variant type
    const usedValuesMap = new Map<string, Set<string>>();
    for (const item of usedValues) {
      if (!usedValuesMap.has(item.variantTypeId)) {
        usedValuesMap.set(item.variantTypeId, new Set());
      }
      usedValuesMap.get(item.variantTypeId)!.add(item.value);
    }

    // Filter variant types to only include those with used values
    return variantTypes
      .map((vt) => ({
        id: vt.id,
        name: vt.name,
        values: vt.values
          .filter((v) => usedValuesMap.get(vt.id)?.has(v.value))
          .map((v) => ({
            id: v.id,
            value: v.value,
          })),
      }))
      .filter((vt) => vt.values.length > 0);
  }

  /**
   * Get variant type filters for all products (search page)
   */
  private async getVariantFiltersForSearch() {
    // Get variant types that should show as filters
    const variantTypes = await this.prisma.variantType.findMany({
      where: {
        isActive: true,
        showAsFilter: true,
      },
      orderBy: { order: 'asc' },
      include: {
        values: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    // Get all variant values used by active products
    const usedValues = await this.prisma.productVariantValue.findMany({
      where: {
        product: {
          isActive: true,
        },
        variantType: {
          showAsFilter: true,
        },
      },
      select: {
        variantTypeId: true,
        value: true,
      },
      distinct: ['variantTypeId', 'value'],
    });

    // Create a map of used values per variant type
    const usedValuesMap = new Map<string, Set<string>>();
    for (const item of usedValues) {
      if (!usedValuesMap.has(item.variantTypeId)) {
        usedValuesMap.set(item.variantTypeId, new Set());
      }
      usedValuesMap.get(item.variantTypeId)!.add(item.value);
    }

    // Filter variant types to only include those with used values
    return variantTypes
      .map((vt) => ({
        id: vt.id,
        name: vt.name,
        values: vt.values
          .filter((v) => usedValuesMap.get(vt.id)?.has(v.value))
          .map((v) => ({
            id: v.id,
            value: v.value,
          })),
      }))
      .filter((vt) => vt.values.length > 0);
  }

  /**
   * POST /catalog/track - Tracking de eventos
   */
  async trackEvent(dto: TrackEventDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert stat (increment count if exists, create if not)
    await this.prisma.productStat.upsert({
      where: {
        productId_type_date: {
          productId: dto.productId || '',
          type: dto.type as StatType,
          date: today,
        },
      },
      update: {
        count: { increment: 1 },
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      },
      create: {
        productId: dto.productId || null,
        type: dto.type as StatType,
        date: today,
        count: 1,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return { success: true };
  }

  /**
   * GET /catalog/filters - Get all available filters for products page
   */
  async getFilters() {
    // Get all categories
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        level: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    // Get all brands
    const brands = await this.prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    // Get variant type filters
    const variantTypes = await this.getVariantFiltersForSearch();

    // Get global price range
    const priceRange = await this.prisma.product.aggregate({
      where: { isActive: true },
      _min: { price: true },
      _max: { price: true },
    });

    return {
      categories,
      brands,
      variantTypes,
      priceRange: {
        min: priceRange._min.price ? Number(priceRange._min.price) : 0,
        max: priceRange._max.price ? Number(priceRange._max.price) : 0,
      },
    };
  }
}
