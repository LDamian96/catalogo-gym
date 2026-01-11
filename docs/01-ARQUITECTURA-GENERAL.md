# Arquitectura General - Catálogo Digital

## Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ARQUITECTURA                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │   CLIENTE   │────▶│   NEXT.JS   │────▶│   NESTJS    │                   │
│  │  (Browser)  │◀────│  Frontend   │◀────│   Backend   │                   │
│  └─────────────┘     └─────────────┘     └──────┬──────┘                   │
│                                                  │                          │
│                      ┌───────────────────────────┼───────────────────────┐  │
│                      │                           │                       │  │
│                      ▼                           ▼                       ▼  │
│               ┌─────────────┐           ┌─────────────┐          ┌────────┐│
│               │    REDIS    │           │  POSTGRES   │          │CLOUDINARY│
│               │  Cache/Queue│           │   Database  │          │ Images ││
│               └─────────────┘           └─────────────┘          └────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Principios SOLID Aplicados

### S - Single Responsibility
```
src/
├── modules/
│   ├── products/
│   │   ├── products.controller.ts    → Solo maneja HTTP requests
│   │   ├── products.service.ts       → Solo lógica de negocio
│   │   ├── products.repository.ts    → Solo acceso a datos
│   │   └── products.cache.ts         → Solo manejo de caché
```

### O - Open/Closed
```typescript
// Extensible sin modificar código existente
interface PaymentProcessor {
  process(order: Order): Promise<PaymentResult>;
}

class WhatsAppProcessor implements PaymentProcessor { }
class YapeProcessor implements PaymentProcessor { }  // Futuro
```

### L - Liskov Substitution
```typescript
// Cualquier variante se comporta igual
abstract class BaseVariant {
  abstract getPrice(): number;
  abstract getDisplayName(): string;
}

class SizeVariant extends BaseVariant { }
class ColorVariant extends BaseVariant { }
```

### I - Interface Segregation
```typescript
// Interfaces específicas, no generales
interface Readable { findById(id: string): Promise<Entity>; }
interface Writable { save(entity: Entity): Promise<Entity>; }
interface Deletable { delete(id: string): Promise<void>; }

class ProductRepository implements Readable, Writable, Deletable { }
```

### D - Dependency Inversion
```typescript
// Depender de abstracciones
constructor(
  @Inject('CACHE_SERVICE') private cache: ICacheService,
  @Inject('STORAGE_SERVICE') private storage: IStorageService,
) { }
```

---

## Patrones de Diseño Utilizados

### 1. Repository Pattern
```
Controller → Service → Repository → Database
                  ↓
               Cache
```

### 2. Factory Pattern
```typescript
// Para crear variantes dinámicamente
class VariantFactory {
  static create(type: string, data: any): BaseVariant {
    switch(type) {
      case 'size': return new SizeVariant(data);
      case 'color': return new ColorVariant(data);
      default: return new GenericVariant(data);
    }
  }
}
```

### 3. Strategy Pattern
```typescript
// Para diferentes tipos de mensajes WhatsApp
interface MessageStrategy {
  build(cart: CartItem[]): string;
}

class SingleProductMessage implements MessageStrategy { }
class CartMessage implements MessageStrategy { }
```

### 4. Observer Pattern (Event-Driven)
```typescript
// Eventos para estadísticas
@OnEvent('product.viewed')
handleProductViewed(payload: ProductViewedEvent) { }

@OnEvent('whatsapp.clicked')
handleWhatsAppClicked(payload: WhatsAppClickedEvent) { }
```

### 5. Decorator Pattern
```typescript
// NestJS decorators personalizados
@CacheResult({ ttl: 300 })
@ValidateOwnership()
@RateLimit({ limit: 100 })
async getProduct(id: string) { }
```

### 6. Builder Pattern
```typescript
// Para construir queries complejas
const products = await new ProductQueryBuilder()
  .withCategory(categoryId)
  .withPriceRange(min, max)
  .onlyActive()
  .paginate(page, limit)
  .build();
```

---

## Arquitectura de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  Controllers, DTOs, Decorators, Guards, Interceptors        │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                        │
│  Services, Use Cases, Event Handlers, Queues                │
├─────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                           │
│  Entities, Value Objects, Domain Events, Interfaces         │
├─────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                      │
│  Repositories, Cache, External APIs, Database               │
└─────────────────────────────────────────────────────────────┘
```

---

## Flujo de Request

```
HTTP Request
     │
     ▼
┌─────────────┐
│   Guard     │ → Autenticación/Autorización
└─────────────┘
     │
     ▼
┌─────────────┐
│ Interceptor │ → Logging, Transform, Cache
└─────────────┘
     │
     ▼
┌─────────────┐
│    Pipe     │ → Validación con Zod
└─────────────┘
     │
     ▼
┌─────────────┐
│ Controller  │ → Recibe request, llama service
└─────────────┘
     │
     ▼
┌─────────────┐
│   Service   │ → Lógica de negocio
└─────────────┘
     │
     ▼
┌─────────────┐
│ Repository  │ → Acceso a datos (Cache → DB)
└─────────────┘
     │
     ▼
┌─────────────┐
│   Redis     │ → Revisa caché primero
└─────────────┘
     │ (miss)
     ▼
┌─────────────┐
│  Postgres   │ → Base de datos
└─────────────┘
```

---

## Estrategia de Caché con Redis

```typescript
// Niveles de caché
const CACHE_TTL = {
  SETTINGS: 3600,        // 1 hora (casi nunca cambia)
  CATEGORIES: 1800,      // 30 min
  PRODUCTS_LIST: 300,    // 5 min
  PRODUCT_DETAIL: 600,   // 10 min
  STATS: 60,             // 1 min
};

// Keys de Redis
const CACHE_KEYS = {
  SETTINGS: 'settings',
  CATEGORIES: 'categories:all',
  CATEGORY: (id) => `category:${id}`,
  PRODUCTS: (page, cat) => `products:${cat}:${page}`,
  PRODUCT: (id) => `product:${id}`,
  FEATURED: 'products:featured',
  SEARCH: (query) => `search:${query}`,
  STATS: 'stats:dashboard',
};
```

### Invalidación de Caché

```typescript
// Cuando se actualiza un producto
async updateProduct(id: string, data: UpdateProductDto) {
  const product = await this.repository.update(id, data);

  // Invalidar caches relacionados
  await this.cache.del([
    `product:${id}`,
    `products:${product.categoryId}:*`,
    'products:featured',
  ]);

  return product;
}
```

---

## Sistema de Colas (Bull + Redis)

```typescript
// Queues definidas
const QUEUES = {
  STATS: 'stats-queue',        // Procesar estadísticas
  IMAGES: 'images-queue',      // Optimizar imágenes
  EXCEL: 'excel-queue',        // Importar productos
};

// Ejemplo: Estadísticas async
@OnEvent('product.viewed')
async handleView(event: ProductViewedEvent) {
  // No bloquea el request, se procesa en background
  await this.statsQueue.add('increment-view', {
    productId: event.productId,
    date: new Date(),
  });
}
```

---

## Seguridad OWASP Implementada

### 1. Injection (SQL, NoSQL)
```typescript
// Prisma previene SQL injection automáticamente
// Validación con Zod antes de queries
```

### 2. Broken Authentication
```typescript
// JWT con refresh tokens
// Rate limiting en login
// Passwords hasheados con bcrypt (salt 12)
```

### 3. Sensitive Data Exposure
```typescript
// HTTPS obligatorio
// Headers de seguridad (helmet)
// Passwords nunca en responses
```

### 4. XSS (Cross-Site Scripting)
```typescript
// Sanitización de HTML en descripciones
// CSP Headers
// Escape de output en frontend
```

### 5. CSRF
```typescript
// Tokens CSRF en formularios
// SameSite cookies
```

### 6. Rate Limiting
```typescript
@Throttle(100, 60) // 100 requests por minuto
@Throttle(5, 60)   // 5 intentos de login por minuto
```

---

## Variables de Entorno

```env
# .env.example

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/catalogo

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```
