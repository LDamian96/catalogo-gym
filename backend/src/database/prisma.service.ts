import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }

    // Delete in order to respect foreign key constraints
    await this.$transaction([
      this.productStat.deleteMany(),
      this.productVariantVariantValue.deleteMany(),
      this.productVariant.deleteMany(),
      this.productVariantValue.deleteMany(),
      this.productImage.deleteMany(),
      this.product.deleteMany(),
      this.variantTypeValue.deleteMany(),
      this.variantType.deleteMany(),
      this.category.deleteMany(),
      this.brand.deleteMany(),
      this.trackingPixel.deleteMany(),
      this.user.deleteMany(),
      this.settings.deleteMany(),
    ]);
  }
}
