# Database Schema - PostgreSQL + Prisma

## Diagrama de Entidades

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    SETTINGS     │       │      USER       │       │    CATEGORY     │
│─────────────────│       │─────────────────│       │─────────────────│
│ id              │       │ id              │       │ id              │
│ businessName    │       │ email           │       │ name            │
│ logo            │       │ password        │       │ slug            │
│ whatsapp        │       │ name            │       │ image           │
│ currency        │       │ role            │       │ order           │
│ description     │       │ createdAt       │       │ isActive        │
│ address         │       │ updatedAt       │       │ seoTitle        │
│ schedule        │       └─────────────────┘       │ seoDescription  │
│ cartEnabled     │                                 │ seoKeywords     │
│ welcomeMessage  │       ┌─────────────────┐       │ createdAt       │
│ --- SEO ---     │       │ TRACKING_PIXEL  │       │ updatedAt       │
│ seoTitle        │       │─────────────────│       └────────┬────────┘
│ seoDescription  │       │ id              │                │
│ seoKeywords     │       │ name            │                │ 1:N
│ ogImage         │       │ type            │                │
│ --- ADS ---     │       │ pixelId         │                │
│ googleAnalytics │       │ isActive        │                │
│ facebookPixel   │       │ config          │                │
│ tiktokPixel     │       │ createdAt       │                │
│ updatedAt       │       └─────────────────┘                │
└─────────────────┘                                          │
                                                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              PRODUCT                                    │
│─────────────────────────────────────────────────────────────────────────│
│ id, categoryId, name, slug, description, price, salePrice, showPrice,   │
│ stock, showStock, stockMessage, isActive, isFeatured, order,            │
│ seoTitle, seoDescription, seoKeywords, createdAt, updatedAt             │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │ 1:N                 │ 1:N                 │ 1:N
              ▼                     ▼                     ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   PRODUCT_IMAGE     │  │   VARIANT_GROUP     │  │   PRODUCT_STAT      │
│─────────────────────│  │─────────────────────│  │─────────────────────│
│ id                  │  │ id                  │  │ id                  │
│ productId           │  │ productId           │  │ productId           │
│ url                 │  │ name                │  │ type                │
│ publicId            │  │ isRequired          │  │ date                │
│ order               │  │ displayType         │  │ count               │
│ createdAt           │  │ order               │  └─────────────────────┘
└─────────────────────┘  │ createdAt           │
                         └──────────┬──────────┘
                                    │ 1:N
                                    ▼
                         ┌─────────────────────┐
                         │   VARIANT_OPTION    │
                         │─────────────────────│
                         │ id                  │
                         │ groupId             │
                         │ name                │
                         │ image               │
                         │ imagePublicId       │
                         │ additionalPrice     │
                         │ isActive            │
                         │ order               │
                         │ createdAt           │
                         └─────────────────────┘
```

---

## Prisma Schema Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  ADMIN
  EDITOR
}

enum VariantDisplayType {
  BUTTONS
  DROPDOWN
  IMAGES
}

enum StatType {
  PAGE_VIEW
  PRODUCT_VIEW
  WHATSAPP_CLICK
  CATEGORY_VIEW
  SEARCH
  ADD_TO_CART      // Para tracking de ads
  CHECKOUT_START   // Para tracking de ads
  PURCHASE         // Para tracking de ads (conversión)
}

enum PixelType {
  GOOGLE_ADS
  FACEBOOK
  TIKTOK
  SNAPCHAT
  PINTEREST
  TWITTER
  LINKEDIN
  CUSTOM
}

// ============================================
// SETTINGS (Configuración del negocio)
// ============================================

model Settings {
  id             String   @id @default("main")
  businessName   String   @map("business_name")
  logo           String?
  logoPublicId   String?  @map("logo_public_id")
  whatsapp       String
  currency       String   @default("S/")
  description    String?
  address        String?
  schedule       String?
  cartEnabled    Boolean  @default(true) @map("cart_enabled")
  welcomeMessage String?  @map("welcome_message")

  // SEO Global
  seoTitle       String?  @map("seo_title")        // Meta título del sitio
  seoDescription String?  @map("seo_description")  // Meta descripción del sitio
  seoKeywords    String?  @map("seo_keywords")     // Keywords separados por coma
  ogImage        String?  @map("og_image")         // Open Graph image URL
  ogImagePublicId String? @map("og_image_public_id")

  // Tracking & Ads (IDs de píxeles)
  googleAnalyticsId String? @map("google_analytics_id") // GA4: G-XXXXXXXXXX
  googleTagManagerId String? @map("google_tag_manager_id") // GTM-XXXXXXX
  facebookPixelId   String? @map("facebook_pixel_id")   // Facebook/Meta Pixel
  tiktokPixelId     String? @map("tiktok_pixel_id")     // TikTok Pixel

  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("settings")
}

// ============================================
// USER (Usuarios admin)
// ============================================

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  password     String
  name         String
  role         UserRole @default(EDITOR)
  refreshToken String?  @map("refresh_token")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("users")
}

// ============================================
// CATEGORY (Categorías)
// ============================================

model Category {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  image         String?
  imagePublicId String?   @map("image_public_id")
  order         Int       @default(0)
  isActive      Boolean   @default(true) @map("is_active")

  // SEO por categoría (opcional, hereda de Settings si null)
  seoTitle       String?  @map("seo_title")
  seoDescription String?  @map("seo_description")
  seoKeywords    String?  @map("seo_keywords")

  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  products Product[]

  @@index([isActive, order])
  @@map("categories")
}

// ============================================
// PRODUCT (Productos)
// ============================================

model Product {
  id           String   @id @default(cuid())
  categoryId   String   @map("category_id")
  name         String
  slug         String   @unique
  description  String?
  price        Decimal  @db.Decimal(10, 2)
  salePrice    Decimal? @map("sale_price") @db.Decimal(10, 2)
  showPrice    Boolean  @default(true) @map("show_price")
  stock        Int?
  showStock    Boolean  @default(false) @map("show_stock")
  stockMessage String?  @map("stock_message")
  isActive     Boolean  @default(true) @map("is_active")
  isFeatured   Boolean  @default(false) @map("is_featured")
  order        Int      @default(0)

  // SEO por producto (opcional, hereda de Category/Settings si null)
  seoTitle       String?  @map("seo_title")
  seoDescription String?  @map("seo_description")
  seoKeywords    String?  @map("seo_keywords")

  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  category      Category       @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  images        ProductImage[]
  variantGroups VariantGroup[]
  stats         ProductStat[]

  @@index([categoryId, isActive, order])
  @@index([isActive, isFeatured])
  @@index([slug])
  @@map("products")
}

// ============================================
// PRODUCT_IMAGE (Imágenes del producto)
// ============================================

model ProductImage {
  id        String   @id @default(cuid())
  productId String   @map("product_id")
  url       String
  publicId  String   @map("public_id")
  order     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, order])
  @@map("product_images")
}

// ============================================
// VARIANT_GROUP (Grupos de variantes)
// ============================================

model VariantGroup {
  id          String             @id @default(cuid())
  productId   String             @map("product_id")
  name        String
  isRequired  Boolean            @default(true) @map("is_required")
  displayType VariantDisplayType @default(BUTTONS) @map("display_type")
  order       Int                @default(0)
  createdAt   DateTime           @default(now()) @map("created_at")
  updatedAt   DateTime           @updatedAt @map("updated_at")

  // Relations
  product Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  options VariantOption[]

  @@index([productId, order])
  @@map("variant_groups")
}

// ============================================
// VARIANT_OPTION (Opciones de variante)
// ============================================

model VariantOption {
  id              String   @id @default(cuid())
  groupId         String   @map("group_id")
  name            String
  image           String?
  imagePublicId   String?  @map("image_public_id")
  additionalPrice Decimal  @default(0) @map("additional_price") @db.Decimal(10, 2)
  isActive        Boolean  @default(true) @map("is_active")
  order           Int      @default(0)
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  // Relations
  group VariantGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@index([groupId, isActive, order])
  @@map("variant_options")
}

// ============================================
// PRODUCT_STAT (Estadísticas)
// ============================================

model ProductStat {
  id        String   @id @default(cuid())
  productId String?  @map("product_id")
  type      StatType
  date      DateTime @db.Date
  count     Int      @default(1)
  metadata  Json?    // Para búsquedas: { query: "polo" }, ads: { value: 50.00, currency: "USD" }

  // Relations
  product Product? @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, type, date])
  @@index([type, date])
  @@index([productId, type])
  @@map("product_stats")
}

// ============================================
// TRACKING_PIXEL (Píxeles de Ads adicionales)
// ============================================
// Permite agregar múltiples píxeles de cualquier plataforma
// Los principales (GA, FB, TikTok) están en Settings para facilidad
// Este modelo es para píxeles adicionales o personalizados

model TrackingPixel {
  id        String    @id @default(cuid())
  name      String                        // Nombre descriptivo: "Google Ads Remarketing"
  type      PixelType                     // Tipo de píxel
  pixelId   String    @map("pixel_id")    // ID del píxel (ej: AW-123456789)
  isActive  Boolean   @default(true) @map("is_active")
  config    Json?                         // Configuración adicional específica del píxel
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@map("tracking_pixels")
}
```

---

## Índices para Optimización

```sql
-- Índices adicionales para queries frecuentes

-- Búsqueda de productos por nombre
CREATE INDEX idx_products_name_search ON products USING GIN (to_tsvector('spanish', name));

-- Filtro de productos activos y destacados
CREATE INDEX idx_products_active_featured ON products (is_active, is_featured) WHERE is_active = true;

-- Estadísticas por fecha
CREATE INDEX idx_stats_date_range ON product_stats (date DESC, type);

-- Categorías activas ordenadas
CREATE INDEX idx_categories_active_order ON categories (is_active, "order") WHERE is_active = true;
```

---

## Queries Comunes Optimizadas

### 1. Obtener catálogo público (productos activos con categoría)

```typescript
// Usar con caché de Redis (TTL: 5 min)
const products = await prisma.product.findMany({
  where: {
    isActive: true,
    category: { isActive: true }
  },
  include: {
    category: { select: { id: true, name: true, slug: true } },
    images: { orderBy: { order: 'asc' }, take: 1 },
  },
  orderBy: [
    { isFeatured: 'desc' },
    { order: 'asc' },
  ],
});
```

### 2. Obtener producto con todas sus relaciones

```typescript
// Usar con caché de Redis (TTL: 10 min)
const product = await prisma.product.findUnique({
  where: { slug },
  include: {
    category: true,
    images: { orderBy: { order: 'asc' } },
    variantGroups: {
      orderBy: { order: 'asc' },
      include: {
        options: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    },
  },
});
```

### 3. Estadísticas del dashboard

```typescript
// Usar con caché de Redis (TTL: 1 min)
const today = new Date();
today.setHours(0, 0, 0, 0);

const stats = await prisma.$transaction([
  // Visitas totales
  prisma.productStat.aggregate({
    where: { type: 'PAGE_VIEW' },
    _sum: { count: true },
  }),
  // Visitas hoy
  prisma.productStat.aggregate({
    where: { type: 'PAGE_VIEW', date: { gte: today } },
    _sum: { count: true },
  }),
  // Top productos
  prisma.productStat.groupBy({
    by: ['productId'],
    where: { type: 'PRODUCT_VIEW', productId: { not: null } },
    _sum: { count: true },
    orderBy: { _sum: { count: 'desc' } },
    take: 10,
  }),
]);
```

---

## Migraciones

```bash
# Crear migración inicial
npx prisma migrate dev --name init

# Aplicar migraciones en producción
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate

# Ver base de datos
npx prisma studio
```

---

## Seeds (Datos iniciales)

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear configuración inicial
  await prisma.settings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      businessName: 'Mi Catálogo',
      whatsapp: '+51999999999',
      currency: 'S/',
      cartEnabled: true,
      welcomeMessage: '¡Hola! Gracias por tu interés',
    },
  });

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@catalogo.com' },
    update: {},
    create: {
      email: 'admin@catalogo.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```
