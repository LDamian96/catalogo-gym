-- AlterTable
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "facebook" TEXT;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "tiktok" TEXT;
