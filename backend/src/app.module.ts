import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// Config
import {
  appConfig,
  jwtConfig,
  redisConfig,
  cloudinaryConfig,
  throttleConfig,
} from './config';

// Database
import { DatabaseModule } from './database/database.module';

// Common
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Common Module (Cloudinary, Cache services)
import { CommonModule } from './common/common.module';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { TrackingPixelsModule } from './modules/tracking-pixels/tracking-pixels.module';
import { ProductsModule } from './modules/products/products.module';
import { VariantTypesModule } from './modules/variant-types/variant-types.module';
import { VariantsModule } from './modules/variants/variants.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { StatsModule } from './modules/stats/stats.module';
import { ImportExportModule } from './modules/import-export/import-export.module';
import { CombosModule } from './modules/combos/combos.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, redisConfig, cloudinaryConfig, throttleConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('throttle.ttl') || 60,
          limit: configService.get<number>('throttle.limit') || 100,
        },
      ],
      inject: [ConfigService],
    }),

    // Database
    DatabaseModule,

    // Common Services (Global)
    CommonModule,

    // Application Modules
    AuthModule,
    HealthModule,
    SettingsModule,
    CategoriesModule,
    BrandsModule,
    TrackingPixelsModule,
    ProductsModule,
    VariantTypesModule,
    VariantsModule,
    CatalogModule,
    StatsModule,
    ImportExportModule,
    CombosModule,
  ],
  providers: [
    // Global Rate Limit Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global JWT Auth Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Response Transformer
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
