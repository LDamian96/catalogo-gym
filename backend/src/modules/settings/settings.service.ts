import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CloudinaryService, UploadResult } from '../../common/services/cloudinary.service';
import { CacheService, CACHE_KEYS, CACHE_TTL } from '../../common/services/cache.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private cache: CacheService,
  ) {}

  async getSettings(): Promise<Settings> {
    // Check cache first
    const cached = await this.cache.get<Settings>(CACHE_KEYS.SETTINGS);
    if (cached) return cached;

    // Get from DB or create default
    let settings = await this.prisma.settings.findUnique({
      where: { id: 'main' },
    });

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          id: 'main',
          businessName: 'Mi Catálogo Digital',
          whatsapp: '+51999999999',
          currency: 'S/',
          cartEnabled: true,
        },
      });
    }

    // Cache result
    await this.cache.set(CACHE_KEYS.SETTINGS, settings, CACHE_TTL.SETTINGS);

    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<Settings> {
    const settings = await this.prisma.settings.upsert({
      where: { id: 'main' },
      update: dto,
      create: {
        id: 'main',
        businessName: dto.businessName || 'Mi Catálogo Digital',
        whatsapp: dto.whatsapp || '+51999999999',
        currency: dto.currency || 'S/',
        cartEnabled: dto.cartEnabled ?? true,
        ...dto,
      },
    });

    // Invalidate cache
    await this.cache.invalidateSettings();

    return settings;
  }

  async uploadLogo(file: Express.Multer.File): Promise<Settings> {
    const currentSettings = await this.getSettings();

    // Delete old logo if exists
    if (currentSettings.logoPublicId) {
      await this.cloudinary.deleteImage(currentSettings.logoPublicId);
    }

    // Upload new logo
    const result: UploadResult = await this.cloudinary.uploadImage(file, 'logos');

    // Update settings
    const settings = await this.prisma.settings.update({
      where: { id: 'main' },
      data: {
        logo: result.url,
        logoPublicId: result.publicId,
      },
    });

    // Invalidate cache
    await this.cache.invalidateSettings();

    return settings;
  }

  async uploadOgImage(file: Express.Multer.File): Promise<Settings> {
    const currentSettings = await this.getSettings();

    // Delete old og image if exists
    if (currentSettings.ogImagePublicId) {
      await this.cloudinary.deleteImage(currentSettings.ogImagePublicId);
    }

    // Upload new og image
    const result: UploadResult = await this.cloudinary.uploadImage(file, 'og-images');

    // Update settings
    const settings = await this.prisma.settings.update({
      where: { id: 'main' },
      data: {
        ogImage: result.url,
        ogImagePublicId: result.publicId,
      },
    });

    // Invalidate cache
    await this.cache.invalidateSettings();

    return settings;
  }

  async deleteLogo(): Promise<Settings> {
    const currentSettings = await this.getSettings();

    // Delete from Cloudinary
    if (currentSettings.logoPublicId) {
      await this.cloudinary.deleteImage(currentSettings.logoPublicId);
    }

    // Update settings
    const settings = await this.prisma.settings.update({
      where: { id: 'main' },
      data: {
        logo: null,
        logoPublicId: null,
      },
    });

    // Invalidate cache
    await this.cache.invalidateSettings();

    return settings;
  }

  async deleteOgImage(): Promise<Settings> {
    const currentSettings = await this.getSettings();

    // Delete from Cloudinary
    if (currentSettings.ogImagePublicId) {
      await this.cloudinary.deleteImage(currentSettings.ogImagePublicId);
    }

    // Update settings
    const settings = await this.prisma.settings.update({
      where: { id: 'main' },
      data: {
        ogImage: null,
        ogImagePublicId: null,
      },
    });

    // Invalidate cache
    await this.cache.invalidateSettings();

    return settings;
  }
}
