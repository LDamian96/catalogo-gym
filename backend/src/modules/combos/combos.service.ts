import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CloudinaryService, UploadResult } from '../../common/services/cloudinary.service';
import { CacheService, CACHE_KEYS, CACHE_TTL } from '../../common/services/cache.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { ReorderCombosDto } from './dto/reorder-combos.dto';
import { Combo } from '@prisma/client';
import { generateSlug } from '../../common/utils/slug.util';
import { generateComboSeo } from '../../common/utils/auto-seo.util';

const comboInclude = {
  comboProducts: {
    orderBy: { order: 'asc' as const },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          images: { orderBy: { order: 'asc' as const }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true, logo: true } },
        },
      },
    },
  },
};

@Injectable()
export class CombosService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private cache: CacheService,
  ) {}

  async findAll() {
    const cached = await this.cache.get(CACHE_KEYS.COMBOS);
    if (cached) return cached;

    const combos = await this.prisma.combo.findMany({
      orderBy: { order: 'asc' },
      include: comboInclude,
    });

    await this.cache.set(CACHE_KEYS.COMBOS, combos, CACHE_TTL.COMBOS);
    return combos;
  }

  async findOne(id: string) {
    const cached = await this.cache.get(CACHE_KEYS.COMBO(id));
    if (cached) return cached;

    const combo = await this.prisma.combo.findUnique({
      where: { id },
      include: comboInclude,
    });

    if (!combo) {
      throw new NotFoundException('Combo no encontrado');
    }

    await this.cache.set(CACHE_KEYS.COMBO(id), combo, CACHE_TTL.COMBO);
    return combo;
  }

  async create(dto: CreateComboDto) {
    const slug = dto.slug || generateSlug(dto.name);

    const existing = await this.prisma.combo.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Ya existe un combo con ese slug');
    }

    const maxOrder = await this.prisma.combo.aggregate({
      _max: { order: true },
    });
    const order = dto.order ?? (maxOrder._max.order ?? -1) + 1;

    // Auto-generate SEO fields if not provided
    if (!dto.seoTitle || !dto.seoDescription || !dto.seoKeywords) {
      const settings = await this.prisma.settings.findUnique({ where: { id: 'main' }, select: { businessName: true, currency: true } });
      const autoSeo = generateComboSeo({
        name: dto.name,
        price: dto.salePrice || dto.price,
        currency: settings?.currency || 'S/',
        businessName: settings?.businessName,
      });
      if (!dto.seoTitle) dto.seoTitle = autoSeo.seoTitle;
      if (!dto.seoDescription) dto.seoDescription = autoSeo.seoDescription;
      if (!dto.seoKeywords) dto.seoKeywords = autoSeo.seoKeywords;
    }

    const combo = await this.prisma.combo.create({
      data: { ...dto, slug, order },
      include: comboInclude,
    });

    await this.cache.invalidateCombos();
    return combo;
  }

  async update(id: string, dto: UpdateComboDto) {
    await this.findOne(id);

    if (dto.slug) {
      const existing = await this.prisma.combo.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Ya existe un combo con ese slug');
      }
    }

    const combo = await this.prisma.combo.update({
      where: { id },
      data: dto,
      include: comboInclude,
    });

    await this.cache.invalidateCombo(id);
    return combo;
  }

  async delete(id: string): Promise<void> {
    const combo = await this.findOne(id) as Combo;

    if (combo.imagePublicId) {
      await this.cloudinary.deleteImage(combo.imagePublicId);
    }

    await this.prisma.combo.delete({ where: { id } });
    await this.cache.invalidateCombos();
  }

  async uploadImage(id: string, file: Express.Multer.File) {
    const combo = await this.findOne(id) as Combo;

    if (combo.imagePublicId) {
      await this.cloudinary.deleteImage(combo.imagePublicId);
    }

    const result: UploadResult = await this.cloudinary.uploadImage(file, 'combos');

    const updated = await this.prisma.combo.update({
      where: { id },
      data: { image: result.url, imagePublicId: result.publicId },
      include: comboInclude,
    });

    await this.cache.invalidateCombo(id);
    return updated;
  }

  async deleteImage(id: string) {
    const combo = await this.findOne(id) as Combo;

    if (combo.imagePublicId) {
      await this.cloudinary.deleteImage(combo.imagePublicId);
    }

    const updated = await this.prisma.combo.update({
      where: { id },
      data: { image: null, imagePublicId: null },
      include: comboInclude,
    });

    await this.cache.invalidateCombo(id);
    return updated;
  }

  async reorder(dto: ReorderCombosDto) {
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.combo.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    await this.cache.invalidateCombos();
    return this.findAll();
  }

  async addProduct(comboId: string, productId: string, quantity = 1) {
    await this.findOne(comboId);

    // Check product exists
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Get max order
    const maxOrder = await this.prisma.comboProduct.aggregate({
      where: { comboId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    try {
      await this.prisma.comboProduct.create({
        data: { comboId, productId, quantity, order },
      });
    } catch {
      throw new ConflictException('Este producto ya está en el combo');
    }

    await this.cache.invalidateCombo(comboId);
    return this.findOne(comboId);
  }

  async removeProduct(comboId: string, productId: string) {
    await this.findOne(comboId);

    const comboProduct = await this.prisma.comboProduct.findUnique({
      where: { comboId_productId: { comboId, productId } },
    });

    if (!comboProduct) {
      throw new NotFoundException('Producto no encontrado en el combo');
    }

    await this.prisma.comboProduct.delete({
      where: { id: comboProduct.id },
    });

    await this.cache.invalidateCombo(comboId);
    return this.findOne(comboId);
  }
}
