-- AlterTable
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "stock_alerts_enabled" BOOLEAN NOT NULL DEFAULT false;
