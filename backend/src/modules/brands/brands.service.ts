import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CloudinaryService, UploadResult } from '../../common/services/cloudinary.service';
import { CacheService, CACHE_KEYS, CACHE_TTL } from '../../common/services/cache.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { ReorderBrandsDto } from './dto/reorder-brands.dto';
import { Brand } from '@prisma/client';
import { generateSlug } from '../../common/utils/slug.util';
import { generateBrandSeo } from '../../common/utils/auto-seo.util';

@Injectable()
export class BrandsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private cache: CacheService,
  ) {}

  async findAll(): Promise<Brand[]> {
    // Check cache
    const cached = await this.cache.get<Brand[]>(CACHE_KEYS.BRANDS);
    if (cached) return cached;

    const brands = await this.prisma.brand.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // Cache result
    await this.cache.set(CACHE_KEYS.BRANDS, brands, CACHE_TTL.BRANDS);

    return brands;
  }

  async findOne(id: string): Promise<Brand> {
    // Check cache
    const cached = await this.cache.get<Brand>(CACHE_KEYS.BRAND(id));
    if (cached) return cached;

    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }

    // Cache result
    await this.cache.set(CACHE_KEYS.BRAND(id), brand, CACHE_TTL.BRAND);

    return brand;
  }

  async findBySlug(slug: string): Promise<Brand> {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }

    return brand;
  }

  async create(dto: CreateBrandDto): Promise<Brand> {
    // Generate slug if not provided
    const slug = dto.slug || generateSlug(dto.name);

    // Check if slug exists
    const existing = await this.prisma.brand.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Ya existe una marca con ese slug');
    }

    // Get max order
    const maxOrder = await this.prisma.brand.aggregate({
      _max: { order: true },
    });
    const order = dto.order ?? (maxOrder._max.order ?? -1) + 1;

    // Auto-generate SEO fields if not provided
    if (!dto.seoTitle || !dto.seoDescription || !dto.seoKeywords) {
      const settings = await this.prisma.settings.findUnique({ where: { id: 'main' }, select: { businessName: true } });
      const autoSeo = generateBrandSeo({ name: dto.name, businessName: settings?.businessName });
      if (!dto.seoTitle) dto.seoTitle = autoSeo.seoTitle;
      if (!dto.seoDescription) dto.seoDescription = autoSeo.seoDescription;
      if (!dto.seoKeywords) dto.seoKeywords = autoSeo.seoKeywords;
    }

    const brand = await this.prisma.brand.create({
      data: {
        ...dto,
        slug,
        order,
      },
    });

    // Invalidate cache
    await this.cache.invalidateBrands();

    return brand;
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    // Check if exists
    await this.findOne(id);

    // Check slug uniqueness if provided
    if (dto.slug) {
      const existing = await this.prisma.brand.findFirst({
        where: {
          slug: dto.slug,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Ya existe una marca con ese slug');
      }
    }

    const brand = await this.prisma.brand.update({
      where: { id },
      data: dto,
    });

    // Invalidate cache
    await this.cache.invalidateBrand(id);

    return brand;
  }

  async delete(id: string): Promise<void> {
    const brand = await this.findOne(id);

    // Delete logo from Cloudinary if exists
    if (brand.logoPublicId) {
      await this.cloudinary.deleteImage(brand.logoPublicId);
    }

    await this.prisma.brand.delete({
      where: { id },
    });

    // Invalidate cache
    await this.cache.invalidateBrands();
  }

  async uploadLogo(id: string, file: Express.Multer.File): Promise<Brand> {
    const brand = await this.findOne(id);

    // Delete old logo if exists
    if (brand.logoPublicId) {
      await this.cloudinary.deleteImage(brand.logoPublicId);
    }

    // Upload new logo
    const result: UploadResult = await this.cloudinary.uploadImage(file, 'brands');

    // Update brand
    const updated = await this.prisma.brand.update({
      where: { id },
      data: {
        logo: result.url,
        logoPublicId: result.publicId,
      },
    });

    // Invalidate cache
    await this.cache.invalidateBrand(id);

    return updated;
  }

  async deleteLogo(id: string): Promise<Brand> {
    const brand = await this.findOne(id);

    // Delete from Cloudinary
    if (brand.logoPublicId) {
      await this.cloudinary.deleteImage(brand.logoPublicId);
    }

    // Update brand
    const updated = await this.prisma.brand.update({
      where: { id },
      data: {
        logo: null,
        logoPublicId: null,
      },
    });

    // Invalidate cache
    await this.cache.invalidateBrand(id);

    return updated;
  }

  async reorder(dto: ReorderBrandsDto): Promise<Brand[]> {
    // Update all orders in a transaction
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.brand.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    // Invalidate cache
    await this.cache.invalidateBrands();

    // Return updated list
    return this.findAll();
  }
}
