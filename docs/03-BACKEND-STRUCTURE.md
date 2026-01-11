# Backend Structure - NestJS

## Estructura de Carpetas

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── src/
│   ├── main.ts                          # Entry point
│   ├── app.module.ts                    # Root module
│   │
│   ├── config/                          # Configuración
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── jwt.config.ts
│   │   ├── cloudinary.config.ts
│   │   └── throttle.config.ts
│   │
│   ├── common/                          # Código compartido
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── cache-key.decorator.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── throttle.guard.ts
│   │   │
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── cache.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   │
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   ├── prisma-exception.filter.ts
│   │   │   └── validation-exception.filter.ts
│   │   │
│   │   ├── pipes/
│   │   │   └── zod-validation.pipe.ts
│   │   │
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── api-response.dto.ts
│   │   │
│   │   └── utils/
│   │       ├── slug.util.ts
│   │       ├── hash.util.ts
│   │       └── date.util.ts
│   │
│   ├── modules/
│   │   ├── auth/                        # Autenticación
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── jwt-refresh.strategy.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── refresh-token.dto.ts
│   │   │   └── schemas/
│   │   │       └── auth.schema.ts       # Zod schemas
│   │   │
│   │   ├── settings/                    # Configuración del negocio
│   │   │   ├── settings.module.ts
│   │   │   ├── settings.controller.ts
│   │   │   ├── settings.service.ts
│   │   │   ├── settings.repository.ts
│   │   │   ├── dto/
│   │   │   │   └── update-settings.dto.ts
│   │   │   └── schemas/
│   │   │       └── settings.schema.ts
│   │   │
│   │   ├── categories/                  # Categorías
│   │   │   ├── categories.module.ts
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── categories.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-category.dto.ts
│   │   │   │   ├── update-category.dto.ts
│   │   │   │   └── reorder-categories.dto.ts
│   │   │   └── schemas/
│   │   │       └── category.schema.ts
│   │   │
│   │   ├── products/                    # Productos
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-product.dto.ts
│   │   │   │   ├── update-product.dto.ts
│   │   │   │   ├── duplicate-product.dto.ts
│   │   │   │   └── product-query.dto.ts
│   │   │   └── schemas/
│   │   │       └── product.schema.ts
│   │   │
│   │   ├── variants/                    # Variantes
│   │   │   ├── variants.module.ts
│   │   │   ├── variants.controller.ts
│   │   │   ├── variants.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-variant-group.dto.ts
│   │   │   │   ├── update-variant-group.dto.ts
│   │   │   │   ├── create-variant-option.dto.ts
│   │   │   │   └── update-variant-option.dto.ts
│   │   │   └── schemas/
│   │   │       └── variant.schema.ts
│   │   │
│   │   ├── images/                      # Gestión de imágenes
│   │   │   ├── images.module.ts
│   │   │   ├── images.controller.ts
│   │   │   ├── images.service.ts
│   │   │   ├── cloudinary.provider.ts
│   │   │   └── dto/
│   │   │       └── upload-image.dto.ts
│   │   │
│   │   ├── stats/                       # Estadísticas
│   │   │   ├── stats.module.ts
│   │   │   ├── stats.controller.ts
│   │   │   ├── stats.service.ts
│   │   │   ├── stats.repository.ts
│   │   │   ├── stats.processor.ts       # Bull queue processor
│   │   │   └── dto/
│   │   │       └── stats-query.dto.ts
│   │   │
│   │   ├── catalog/                     # API Pública del catálogo
│   │   │   ├── catalog.module.ts
│   │   │   ├── catalog.controller.ts
│   │   │   ├── catalog.service.ts
│   │   │   └── dto/
│   │   │       ├── catalog-query.dto.ts
│   │   │       └── search.dto.ts
│   │   │
│   │   ├── import/                      # Importación Excel
│   │   │   ├── import.module.ts
│   │   │   ├── import.controller.ts
│   │   │   ├── import.service.ts
│   │   │   ├── import.processor.ts      # Bull queue processor
│   │   │   └── dto/
│   │   │       └── import-products.dto.ts
│   │   │
│   │   └── health/                      # Health checks
│   │       ├── health.module.ts
│   │       └── health.controller.ts
│   │
│   ├── cache/                           # Servicio de caché
│   │   ├── cache.module.ts
│   │   ├── cache.service.ts
│   │   └── cache.constants.ts
│   │
│   ├── queue/                           # Colas Bull
│   │   ├── queue.module.ts
│   │   └── queue.constants.ts
│   │
│   └── database/                        # Prisma
│       ├── database.module.ts
│       └── prisma.service.ts
│
├── test/
│   ├── e2e/
│   └── unit/
│
├── .env
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

## Módulos y Responsabilidades

### 1. Auth Module
```typescript
// auth/auth.module.ts
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

**Responsabilidades:**
- Login con email/password
- Generar access token + refresh token
- Renovar tokens
- Logout (invalidar refresh token)

---

### 2. Settings Module
```typescript
// settings/settings.module.ts
@Module({
  imports: [CacheModule],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsRepository],
  exports: [SettingsService],
})
export class SettingsModule {}
```

**Responsabilidades:**
- Obtener configuración del negocio
- Actualizar configuración
- Subir/cambiar logo
- Caché de settings (TTL: 1 hora)

---

### 3. Categories Module
```typescript
// categories/categories.module.ts
@Module({
  imports: [CacheModule, ImagesModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
  exports: [CategoriesService],
})
export class CategoriesModule {}
```

**Responsabilidades:**
- CRUD de categorías
- Reordenar categorías
- Activar/desactivar
- Invalidar caché al modificar

---

### 4. Products Module
```typescript
// products/products.module.ts
@Module({
  imports: [CacheModule, ImagesModule, VariantsModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
```

**Responsabilidades:**
- CRUD de productos
- Duplicar productos
- Gestión de imágenes del producto
- Productos destacados
- Búsqueda y filtros

---

### 5. Variants Module
```typescript
// variants/variants.module.ts
@Module({
  imports: [CacheModule, ImagesModule],
  controllers: [VariantsController],
  providers: [VariantsService],
})
export class VariantsModule {}
```

**Responsabilidades:**
- CRUD grupos de variantes
- CRUD opciones de variantes
- Imágenes de variantes
- Reordenar variantes

---

### 6. Catalog Module (PÚBLICO)
```typescript
// catalog/catalog.module.ts
@Module({
  imports: [CacheModule, ProductsModule, CategoriesModule, StatsModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
```

**Responsabilidades:**
- Obtener catálogo público (con caché)
- Detalle de producto público
- Búsqueda de productos
- Registrar visitas (async via queue)

---

### 7. Stats Module
```typescript
// stats/stats.module.ts
@Module({
  imports: [
    BullModule.registerQueue({ name: STATS_QUEUE }),
    CacheModule,
  ],
  controllers: [StatsController],
  providers: [StatsService, StatsRepository, StatsProcessor],
  exports: [StatsService],
})
export class StatsModule {}
```

**Responsabilidades:**
- Registrar eventos (via cola)
- Dashboard de estadísticas
- Productos más vistos
- Exportar reportes

---

## Configuración Principal

```typescript
// app.module.ts
@Module({
  imports: [
    // Configuración
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT'),
      }),
      inject: [ConfigService],
    }),

    // Caché Redis
    CacheModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        password: config.get('REDIS_PASSWORD'),
      }),
      inject: [ConfigService],
    }),

    // Colas Bull
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    // Eventos
    EventEmitterModule.forRoot(),

    // Módulos de la aplicación
    DatabaseModule,
    AuthModule,
    SettingsModule,
    CategoriesModule,
    ProductsModule,
    VariantsModule,
    ImagesModule,
    CatalogModule,
    StatsModule,
    ImportModule,
    HealthModule,
  ],
  providers: [
    // Guards globales
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },

    // Interceptores globales
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },

    // Filtros globales
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}
```

---

## Entry Point

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Seguridad
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: config.get('FRONTEND_URL'),
    credentials: true,
  });

  // Prefijo global
  app.setGlobalPrefix('api/v1');

  // Swagger (solo en desarrollo)
  if (config.get('NODE_ENV') === 'development') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Catálogo Digital API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const port = config.get('PORT') || 3001;
  await app.listen(port);

  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📚 Docs available at http://localhost:${port}/docs`);
}

bootstrap();
```

---

## Validación con Zod

```typescript
// common/pipes/zod-validation.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new BadRequestException({
        message: 'Error de validación',
        errors,
      });
    }

    return result.data;
  }
}

// Uso en controller
@Post()
async create(
  @Body(new ZodValidationPipe(createProductSchema))
  data: CreateProductDto
) {
  return this.service.create(data);
}
```

---

## Response Transformer

```typescript
// common/interceptors/transform.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

---

## Manejo de Errores

```typescript
// common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      success: false,
      error: {
        code: status,
        message: typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message,
        details: typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).errors
          : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
```
