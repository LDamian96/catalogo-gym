import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService, CACHE_KEYS, CACHE_TTL } from '../../common/services/cache.service';
import { CreateTrackingPixelDto } from './dto/create-tracking-pixel.dto';
import { UpdateTrackingPixelDto } from './dto/update-tracking-pixel.dto';
import { TrackingPixel } from '@prisma/client';

@Injectable()
export class TrackingPixelsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async findAll(): Promise<TrackingPixel[]> {
    // Check cache
    const cached = await this.cache.get<TrackingPixel[]>(CACHE_KEYS.TRACKING_PIXELS);
    if (cached) return cached;

    const pixels = await this.prisma.trackingPixel.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Cache result
    await this.cache.set(CACHE_KEYS.TRACKING_PIXELS, pixels, CACHE_TTL.TRACKING_PIXELS);

    return pixels;
  }

  async findActive(): Promise<TrackingPixel[]> {
    return this.prisma.trackingPixel.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<TrackingPixel> {
    const pixel = await this.prisma.trackingPixel.findUnique({
      where: { id },
    });

    if (!pixel) {
      throw new NotFoundException('Pixel de tracking no encontrado');
    }

    return pixel;
  }

  async create(dto: CreateTrackingPixelDto): Promise<TrackingPixel> {
    const { config, ...rest } = dto;
    const pixel = await this.prisma.trackingPixel.create({
      data: {
        ...rest,
        config: config ?? undefined,
      },
    });

    // Invalidate cache
    await this.cache.invalidateTrackingPixels();

    return pixel;
  }

  async update(id: string, dto: UpdateTrackingPixelDto): Promise<TrackingPixel> {
    // Check if exists
    await this.findOne(id);

    const { config, ...rest } = dto;
    const pixel = await this.prisma.trackingPixel.update({
      where: { id },
      data: {
        ...rest,
        ...(config !== undefined && { config }),
      },
    });

    // Invalidate cache
    await this.cache.invalidateTrackingPixels();

    return pixel;
  }

  async delete(id: string): Promise<void> {
    // Check if exists
    await this.findOne(id);

    await this.prisma.trackingPixel.delete({
      where: { id },
    });

    // Invalidate cache
    await this.cache.invalidateTrackingPixels();
  }
}
