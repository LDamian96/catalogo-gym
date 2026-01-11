-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "VariantDisplayType" AS ENUM ('BUTTONS', 'DROPDOWN', 'IMAGES');

-- CreateEnum
CREATE TYPE "StatType" AS ENUM ('PAGE_VIEW', 'PRODUCT_VIEW', 'WHATSAPP_CLICK', 'CATEGORY_VIEW', 'SEARCH', 'ADD_TO_CART', 'CHECKOUT_START', 'PURCHASE');

-- CreateEnum
CREATE TYPE "PixelType" AS ENUM ('GOOGLE_ADS', 'FACEBOOK', 'TIKTOK', 'SNAPCHAT', 'PINTEREST', 'TWITTER', 'LINKEDIN', 'CUSTOM');

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "business_name" TEXT NOT NULL,
    "logo" TEXT,
    "logo_public_id" TEXT,
    "whatsapp" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'S/',
    "description" TEXT,
    "address" TEXT,
    "schedule" TEXT,
    "cart_enabled" BOOLEAN NOT NULL DEFAULT true,
    "welcome_message" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "seo_keywords" TEXT,
    "og_image" TEXT,
    "og_image_public_id" TEXT,
    "google_analytics_id" TEXT,
    "google_tag_manager_id" TEXT,
    "facebook_pixel_id" TEXT,
    "tiktok_pixel_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "image_public_id" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "seo_keywords" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "sale_price" DECIMAL(10,2),
    "show_price" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER,
    "show_stock" BOOLEAN NOT NULL DEFAULT false,
    "stock_message" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "seo_keywords" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_groups" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "display_type" "VariantDisplayType" NOT NULL DEFAULT 'BUTTONS',
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_options" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "image_public_id" TEXT,
    "additional_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_stats" (
    "id" TEXT NOT NULL,
    "product_id" TEXT,
    "type" "StatType" NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,

    CONSTRAINT "product_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_pixels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PixelType" NOT NULL,
    "pixel_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracking_pixels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_is_active_order_idx" ON "categories"("is_active", "order");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_id_is_active_order_idx" ON "products"("category_id", "is_active", "order");

-- CreateIndex
CREATE INDEX "products_is_active_is_featured_idx" ON "products"("is_active", "is_featured");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE INDEX "product_images_product_id_order_idx" ON "product_images"("product_id", "order");

-- CreateIndex
CREATE INDEX "variant_groups_product_id_order_idx" ON "variant_groups"("product_id", "order");

-- CreateIndex
CREATE INDEX "variant_options_group_id_is_active_order_idx" ON "variant_options"("group_id", "is_active", "order");

-- CreateIndex
CREATE INDEX "product_stats_type_date_idx" ON "product_stats"("type", "date");

-- CreateIndex
CREATE INDEX "product_stats_product_id_type_idx" ON "product_stats"("product_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "product_stats_product_id_type_date_key" ON "product_stats"("product_id", "type", "date");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_groups" ADD CONSTRAINT "variant_groups_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_options" ADD CONSTRAINT "variant_options_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "variant_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_stats" ADD CONSTRAINT "product_stats_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
