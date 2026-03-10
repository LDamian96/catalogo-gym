import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

// Cache Keys
export const CACHE_KEYS = {
  SETTINGS: 'settings',
  CATEGORIES: 'categories:all',
  CATEGORY: (id: string) => `category:${id}`,
  CATEGORY_SLUG: (slug: string) => `category:slug:${slug}`,
  BRANDS: 'brands:all',
  BRAND: (id: string) => `brand:${id}`,
  BRAND_SLUG: (slug: string) => `brand:slug:${slug}`,
  TRACKING_PIXELS: 'tracking-pixels:all',
  PRODUCTS: (page: number, categoryId?: string) =>
    `products:${categoryId || 'all'}:${page}`,
  PRODUCT: (id: string) => `product:${id}`,
  PRODUCT_SLUG: (slug: string) => `product:slug:${slug}`,
  FEATURED_PRODUCTS: 'products:featured',
  COMBOS: 'combos:all',
  COMBO: (id: string) => `combo:${id}`,
  COMBO_SLUG: (slug: string) => `combo:slug:${slug}`,
};

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  SETTINGS: 3600, // 1 hour
  CATEGORIES: 1800, // 30 minutes
  CATEGORY: 1800, // 30 minutes
  BRANDS: 1800, // 30 minutes
  BRAND: 1800, // 30 minutes
  TRACKING_PIXELS: 3600, // 1 hour
  PRODUCTS_LIST: 300, // 5 minutes
  PRODUCT_DETAIL: 600, // 10 minutes
  FEATURED: 600, // 10 minutes
  COMBOS: 1800, // 30 minutes
  COMBO: 1800, // 30 minutes
};

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 10) {
          console.error('Redis connection failed after 10 retries');
          return null;
        }
        return Math.min(times * 200, 5000);
      },
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.removeAllListeners();
      this.client.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  async invalidateSettings(): Promise<void> {
    await this.del(CACHE_KEYS.SETTINGS);
  }

  async invalidateCategories(): Promise<void> {
    await this.del(CACHE_KEYS.CATEGORIES);
    await this.delPattern('category:*');
  }

  async invalidateCategory(id: string): Promise<void> {
    await this.del(CACHE_KEYS.CATEGORY(id));
    await this.del(CACHE_KEYS.CATEGORIES);
  }

  async invalidateTrackingPixels(): Promise<void> {
    await this.del(CACHE_KEYS.TRACKING_PIXELS);
  }

  async invalidateProducts(): Promise<void> {
    await this.delPattern('products:*');
    await this.delPattern('product:*');
  }

  async invalidateProduct(id: string): Promise<void> {
    await this.del(CACHE_KEYS.PRODUCT(id));
    await this.delPattern('products:*');
    await this.del(CACHE_KEYS.FEATURED_PRODUCTS);
  }

  async invalidateBrands(): Promise<void> {
    await this.del(CACHE_KEYS.BRANDS);
    await this.delPattern('brand:*');
  }

  async invalidateBrand(id: string): Promise<void> {
    await this.del(CACHE_KEYS.BRAND(id));
    await this.del(CACHE_KEYS.BRANDS);
  }

  async invalidateCombos(): Promise<void> {
    await this.del(CACHE_KEYS.COMBOS);
    await this.delPattern('combo:*');
  }

  async invalidateCombo(id: string): Promise<void> {
    await this.del(CACHE_KEYS.COMBO(id));
    await this.del(CACHE_KEYS.COMBOS);
  }

  /**
   * Invalida TODO el caché del catálogo público y admin
   * Usar después de importaciones masivas o cambios globales
   */
  async invalidateAll(): Promise<void> {
    await Promise.all([
      this.invalidateProducts(),
      this.invalidateBrands(),
      this.invalidateCategories(),
      this.invalidateSettings(),
      this.invalidateTrackingPixels(),
      this.invalidateCombos(),
      this.del('catalog:home'),
      this.delPattern('catalog:*'),
    ]);
  }
}
