import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CloudinaryService, UploadResult } from '../../common/services/cloudinary.service';
import { CacheService, CACHE_KEYS, CACHE_TTL } from '../../common/services/cache.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { Category } from '@prisma/client';
import { generateSlug } from '../../common/utils/slug.util';
import { generateCategorySeo } from '../../common/utils/auto-seo.util';

// Tipo para categoría con relaciones jerárquicas
export type CategoryWithHierarchy = Category & {
  parent?: CategoryWithHierarchy | null;
  children?: CategoryWithHierarchy[];
  _count?: { products: number };
};

// Tipo para el árbol de categorías
export type CategoryTreeNode = CategoryWithHierarchy & {
  children: CategoryTreeNode[];
};

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private cache: CacheService,
  ) {}

  async findAll(): Promise<CategoryWithHierarchy[]> {
    // Check cache
    const cached = await this.cache.get<CategoryWithHierarchy[]>(CACHE_KEYS.CATEGORIES);
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
      include: {
        parent: true,
        children: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    // Cache result
    await this.cache.set(CACHE_KEYS.CATEGORIES, categories, CACHE_TTL.CATEGORIES);

    return categories;
  }

  // Obtener categorías en formato árbol (solo raíces con hijos anidados)
  async findAllTree(): Promise<CategoryTreeNode[]> {
    const cacheKey = `${CACHE_KEYS.CATEGORIES}:tree`;
    const cached = await this.cache.get<CategoryTreeNode[]>(cacheKey);
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // Construir árbol
    const tree = this.buildTree(categories);

    // Cache result
    await this.cache.set(cacheKey, tree, CACHE_TTL.CATEGORIES);

    return tree;
  }

  // Construir árbol recursivo de categorías
  private buildTree(categories: Category[]): CategoryTreeNode[] {
    const map = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    // Primero crear todos los nodos
    categories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] } as CategoryTreeNode);
    });

    // Luego construir la jerarquía
    categories.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  // Obtener ancestros (breadcrumb) de una categoría
  async getAncestors(id: string): Promise<Category[]> {
    const ancestors: Category[] = [];
    let current = await this.prisma.category.findUnique({
      where: { id },
      include: { parent: true },
    });

    while (current?.parent) {
      ancestors.unshift(current.parent);
      current = await this.prisma.category.findUnique({
        where: { id: current.parentId! },
        include: { parent: true },
      });
    }

    return ancestors;
  }

  // Obtener todos los descendientes de una categoría
  async getDescendants(id: string): Promise<Category[]> {
    const descendants: Category[] = [];
    const queue = [id];

    while (queue.length > 0) {
      const parentId = queue.shift()!;
      const children = await this.prisma.category.findMany({
        where: { parentId },
      });

      for (const child of children) {
        descendants.push(child);
        queue.push(child.id);
      }
    }

    return descendants;
  }

  async findOne(id: string): Promise<CategoryWithHierarchy> {
    // Check cache
    const cached = await this.cache.get<CategoryWithHierarchy>(CACHE_KEYS.CATEGORY(id));
    if (cached) return cached;

    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Cache result
    await this.cache.set(CACHE_KEYS.CATEGORY(id), category, CACHE_TTL.CATEGORY);

    return category;
  }

  async findBySlug(slug: string): Promise<CategoryWithHierarchy> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    // Generate slug if not provided
    const slug = dto.slug || generateSlug(dto.name);

    // Check if slug exists
    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese slug');
    }

    // Calcular level basado en el parent
    let level = 0;
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('La categoría padre no existe');
      }
      level = parent.level + 1;
    }

    // Get max order dentro del mismo nivel/padre
    const maxOrder = await this.prisma.category.aggregate({
      where: { parentId: dto.parentId || null },
      _max: { order: true },
    });
    const order = dto.order ?? (maxOrder._max.order ?? -1) + 1;

    // Auto-generate SEO fields if not provided
    let { seoTitle, seoDescription, seoKeywords } = dto;
    if (!seoTitle || !seoDescription || !seoKeywords) {
      const settings = await this.prisma.settings.findUnique({ where: { id: 'main' }, select: { businessName: true } });
      const autoSeo = generateCategorySeo({ name: dto.name, businessName: settings?.businessName });
      if (!seoTitle) seoTitle = autoSeo.seoTitle;
      if (!seoDescription) seoDescription = autoSeo.seoDescription;
      if (!seoKeywords) seoKeywords = autoSeo.seoKeywords;
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        parentId: dto.parentId || null,
        level,
        order,
        isActive: dto.isActive ?? true,
        seoTitle,
        seoDescription,
        seoKeywords,
      },
    });

    // Invalidate cache
    await this.cache.invalidateCategories();

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    // Check if exists
    const current = await this.findOne(id);

    // Check slug uniqueness if provided
    if (dto.slug) {
      const existing = await this.prisma.category.findFirst({
        where: {
          slug: dto.slug,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Ya existe una categoría con ese slug');
      }
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = { ...dto };

    // Si se está cambiando el parentId
    if (dto.parentId !== undefined) {
      // No puede ser hijo de sí mismo
      if (dto.parentId === id) {
        throw new BadRequestException('Una categoría no puede ser hija de sí misma');
      }

      // No puede ser hijo de sus descendientes (evitar ciclos)
      if (dto.parentId) {
        const descendants = await this.getDescendants(id);
        if (descendants.some((d) => d.id === dto.parentId)) {
          throw new BadRequestException('No se puede mover una categoría a uno de sus descendientes');
        }

        // Verificar que el nuevo padre existe
        const newParent = await this.prisma.category.findUnique({
          where: { id: dto.parentId },
        });
        if (!newParent) {
          throw new BadRequestException('La categoría padre no existe');
        }

        // Calcular nuevo level
        updateData.level = newParent.level + 1;
      } else {
        // Si parentId es null, es categoría raíz
        updateData.level = 0;
      }

      // Actualizar level de todos los descendientes
      const descendants = await this.getDescendants(id);
      const levelDiff = (updateData.level as number) - current.level;

      if (levelDiff !== 0 && descendants.length > 0) {
        await this.prisma.$transaction(
          descendants.map((desc) =>
            this.prisma.category.update({
              where: { id: desc.id },
              data: { level: desc.level + levelDiff },
            }),
          ),
        );
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateData,
    });

    // Invalidate cache
    await this.cache.invalidateCategories();

    return category;
  }

  async delete(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Delete image from Cloudinary if exists
    if (category.imagePublicId) {
      await this.cloudinary.deleteImage(category.imagePublicId);
    }

    await this.prisma.category.delete({
      where: { id },
    });

    // Invalidate cache
    await this.cache.invalidateCategories();
  }

  async uploadImage(id: string, file: Express.Multer.File): Promise<Category> {
    const category = await this.findOne(id);

    // Delete old image if exists
    if (category.imagePublicId) {
      await this.cloudinary.deleteImage(category.imagePublicId);
    }

    // Upload new image
    const result: UploadResult = await this.cloudinary.uploadImage(file, 'categories');

    // Update category
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        image: result.url,
        imagePublicId: result.publicId,
      },
    });

    // Invalidate cache
    await this.cache.invalidateCategory(id);

    return updated;
  }

  async deleteImage(id: string): Promise<Category> {
    const category = await this.findOne(id);

    // Delete from Cloudinary
    if (category.imagePublicId) {
      await this.cloudinary.deleteImage(category.imagePublicId);
    }

    // Update category
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        image: null,
        imagePublicId: null,
      },
    });

    // Invalidate cache
    await this.cache.invalidateCategory(id);

    return updated;
  }

  async reorder(dto: ReorderCategoriesDto): Promise<Category[]> {
    // Update all orders in a transaction
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.category.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    // Invalidate cache
    await this.cache.invalidateCategories();

    // Return updated list
    return this.findAll();
  }
}
