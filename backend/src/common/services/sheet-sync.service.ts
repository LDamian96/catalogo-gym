import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

export interface ProductSyncEvent {
  action: 'created' | 'updated' | 'deleted';
  product: {
    id: string;
    name?: string;
    price?: number;
    salePrice?: number | null;
    categoryName?: string;
    brandName?: string;
    description?: string | null;
    stock?: number | null;
    isActive?: boolean;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    imageUrl?: string | null;
  };
}

@Injectable()
export class SheetSyncService {
  private readonly logger = new Logger(SheetSyncService.name);
  private readonly webhookUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.webhookUrl =
      this.configService.get<string>('N8N_WEBHOOK_URL') ||
      'http://localhost:5678/webhook/sheet-sync';
  }

  /**
   * Escucha evento product.created y notifica a n8n
   */
  @OnEvent('product.created', { async: true })
  async handleProductCreated(event: ProductSyncEvent): Promise<void> {
    await this.sendToWebhook(event);
  }

  /**
   * Escucha evento product.updated y notifica a n8n
   */
  @OnEvent('product.updated', { async: true })
  async handleProductUpdated(event: ProductSyncEvent): Promise<void> {
    await this.sendToWebhook(event);
  }

  /**
   * Escucha evento product.deleted y notifica a n8n
   */
  @OnEvent('product.deleted', { async: true })
  async handleProductDeleted(event: ProductSyncEvent): Promise<void> {
    await this.sendToWebhook(event);
  }

  /**
   * Envía el evento al webhook de n8n (fire-and-forget)
   * Nunca lanza excepciones para no afectar la operación principal
   */
  private async sendToWebhook(event: ProductSyncEvent): Promise<void> {
    try {
      this.logger.log(
        `Sincronizando producto ${event.product.id} (${event.action}) con Google Sheets...`,
      );

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: event.action,
          product: event.product,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(10000), // Timeout de 10 segundos
      });

      if (!response.ok) {
        this.logger.warn(
          `Webhook respondió con status ${response.status} para producto ${event.product.id}`,
        );
      } else {
        this.logger.log(
          `Producto ${event.product.id} sincronizado exitosamente (${event.action})`,
        );
      }
    } catch (error) {
      // Fire-and-forget: solo loggear, nunca fallar
      this.logger.error(
        `Error al sincronizar producto ${event.product.id} con Sheet: ${error.message}`,
      );
    }
  }

  /**
   * Full sync: exporta TODOS los productos al Sheet (respaldo)
   * Se llama desde el cron de n8n cada 30 min o manualmente
   */
  async fullSync(): Promise<{ total: number; success: boolean }> {
    try {
      this.logger.log('Iniciando sincronización completa de productos...');

      const products = await this.prisma.product.findMany({
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
        orderBy: { createdAt: 'asc' },
      });

      const payload = products.map((product) => ({
        id: product.id,
        nombre: product.name,
        precio: Number(product.price),
        precioOferta: product.salePrice ? Number(product.salePrice) : null,
        categoria: product.category?.name || '',
        marca: product.brand?.name || '',
        descripcion: product.description || '',
        stock: product.stock,
        estado: product.isActive ? 'Activo' : 'Inactivo',
        seoTitulo: product.seoTitle || '',
        seoDescripcion: product.seoDescription || '',
        seoKeywords: product.seoKeywords || '',
        urlImagen: product.images?.[0]?.url || '',
      }));

      const response = await fetch(`${this.webhookUrl}/full-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'full-sync',
          products: payload,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(30000), // Timeout de 30 segundos para full sync
      });

      if (!response.ok) {
        this.logger.warn(
          `Full sync respondió con status ${response.status}`,
        );
        return { total: products.length, success: false };
      }

      this.logger.log(
        `Sincronización completa exitosa: ${products.length} productos exportados`,
      );
      return { total: products.length, success: true };
    } catch (error) {
      this.logger.error(
        `Error en sincronización completa: ${error.message}`,
      );
      return { total: 0, success: false };
    }
  }
}
