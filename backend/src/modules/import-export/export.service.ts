import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ExportProductsQuery, ExportCategoriesQuery, ExportStatsQuery } from './dto/export.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Exportar productos a Excel
   */
  async exportProducts(query: ExportProductsQuery): Promise<Buffer> {
    // Obtener productos con relaciones
    const where: Record<string, unknown> = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        images: { orderBy: { order: 'asc' } },
        variantValues: {
          include: { variantType: true },
        },
        variants: {
          include: {
            variantValues: {
              include: { variantType: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Obtener todos los tipos de variante únicos
    const variantTypes = new Set<string>();
    for (const product of products) {
      for (const vv of product.variantValues) {
        variantTypes.add(vv.variantType.name.toLowerCase());
      }
    }

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Productos');

    // Definir columnas base
    const baseColumns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'nombre', key: 'nombre', width: 30 },
      { header: 'precio', key: 'precio', width: 12 },
      { header: 'categoria', key: 'categoria', width: 20 },
      { header: 'descripcion', key: 'descripcion', width: 40 },
      { header: 'precio_oferta', key: 'precio_oferta', width: 15 },
      { header: 'stock', key: 'stock', width: 10 },
      { header: 'marca', key: 'marca', width: 15 },
      { header: 'activo', key: 'activo', width: 10 },
      { header: 'destacado', key: 'destacado', width: 10 },
      { header: 'mostrar_precio', key: 'mostrar_precio', width: 15 },
      { header: 'mostrar_stock', key: 'mostrar_stock', width: 15 },
      { header: 'mensaje_sin_stock', key: 'mensaje_sin_stock', width: 20 },
      { header: 'sku', key: 'sku', width: 15 },
      { header: 'slug', key: 'slug', width: 30 },
      { header: 'imagenes', key: 'imagenes', width: 50 },
      { header: 'sub_productos', key: 'sub_productos', width: 15 },
      { header: 'creado', key: 'creado', width: 20 },
    ];

    // Agregar columnas de variante dinámicas
    const variantColumns = Array.from(variantTypes).map((type) => ({
      header: `variante_${type}`,
      key: `variante_${type}`,
      width: 20,
    }));

    worksheet.columns = [...baseColumns, ...variantColumns];

    // Estilo de header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF7C3AED' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    // Agregar filas de datos
    for (const product of products) {
      const rowData: Record<string, unknown> = {
        id: product.id,
        nombre: product.name,
        precio: product.price,
        categoria: product.category?.name || '',
        descripcion: product.description || '',
        precio_oferta: product.salePrice || '',
        stock: product.stock ?? '',
        marca: product.brand?.name || '',
        activo: product.isActive ? 'si' : 'no',
        destacado: product.isFeatured ? 'si' : 'no',
        mostrar_precio: product.showPrice ? 'si' : 'no',
        mostrar_stock: product.showStock ? 'si' : 'no',
        mensaje_sin_stock: product.stockMessage || '',
        sku: '', // Se podría agregar si existiera en el modelo base
        slug: product.slug,
        imagenes: product.images.map((img) => img.url).join(', '),
        sub_productos: product.variants.length,
        creado: product.createdAt.toISOString().split('T')[0],
      };

      // Agregar valores de variante
      const valuesByType: Record<string, string[]> = {};
      for (const vv of product.variantValues) {
        const typeName = vv.variantType.name.toLowerCase();
        if (!valuesByType[typeName]) valuesByType[typeName] = [];
        valuesByType[typeName].push(vv.value);
      }

      for (const type of variantTypes) {
        rowData[`variante_${type}`] = valuesByType[type]?.join(', ') || '';
      }

      worksheet.addRow(rowData);
    }

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Exportar categorías a Excel
   */
  async exportCategories(query: ExportCategoriesQuery): Promise<Buffer> {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { order: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Categorias');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Slug', key: 'slug', width: 30 },
      { header: 'Descripción', key: 'descripcion', width: 40 },
      { header: 'Imagen', key: 'imagen', width: 50 },
      { header: 'Activa', key: 'activa', width: 10 },
      { header: 'Orden', key: 'orden', width: 10 },
      { header: 'Productos', key: 'productos', width: 12 },
      { header: 'SEO Título', key: 'seo_titulo', width: 30 },
      { header: 'SEO Descripción', key: 'seo_descripcion', width: 40 },
      { header: 'SEO Keywords', key: 'seo_keywords', width: 30 },
    ];

    // Estilo de header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF16A34A' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    for (const category of categories) {
      worksheet.addRow({
        id: category.id,
        nombre: category.name,
        slug: category.slug,
        descripcion: category.description || '',
        imagen: category.image || '',
        activa: category.isActive ? 'si' : 'no',
        orden: category.order,
        productos: category._count.products,
        seo_titulo: category.seoTitle || '',
        seo_descripcion: category.seoDescription || '',
        seo_keywords: category.seoKeywords || '',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Exportar estadísticas a Excel
   */
  async exportStats(query: ExportStatsQuery): Promise<Buffer> {
    const where: { date?: { gte?: Date; lte?: Date } } = {};

    if (query.startDate) {
      where.date = { gte: new Date(query.startDate) };
    }
    if (query.endDate) {
      where.date = { ...(where.date || {}), lte: new Date(query.endDate) };
    }

    // Usar ProductStat en lugar de CatalogEvent (que no existe en este schema)
    const stats = await this.prisma.productStat.findMany({
      where,
      include: {
        product: { select: { name: true, slug: true } },
      },
      orderBy: { date: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estadisticas');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Tipo de Evento', key: 'tipo', width: 20 },
      { header: 'Producto', key: 'producto', width: 30 },
      { header: 'Cantidad', key: 'cantidad', width: 15 },
    ];

    // Estilo de header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    for (const stat of stats) {
      worksheet.addRow({
        fecha: stat.date.toISOString().split('T')[0],
        tipo: this.translateEventType(stat.type),
        producto: stat.product?.name || 'General',
        cantidad: stat.count,
      });
    }

    // Agregar hoja de resumen
    const summarySheet = workbook.addWorksheet('Resumen');
    const eventCounts: Record<string, number> = {};

    for (const stat of stats) {
      eventCounts[stat.type] = (eventCounts[stat.type] || 0) + stat.count;
    }

    summarySheet.columns = [
      { header: 'Tipo de Evento', key: 'tipo', width: 25 },
      { header: 'Cantidad', key: 'cantidad', width: 15 },
    ];

    summarySheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    for (const [type, count] of Object.entries(eventCounts)) {
      summarySheet.addRow({
        tipo: this.translateEventType(type),
        cantidad: count,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Obtener plantilla de importación vacía
   */
  async getImportTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Productos');

    worksheet.columns = [
      { header: 'nombre', key: 'nombre', width: 30 },
      { header: 'precio', key: 'precio', width: 12 },
      { header: 'categoria', key: 'categoria', width: 20 },
      { header: 'descripcion', key: 'descripcion', width: 40 },
      { header: 'precio_oferta', key: 'precio_oferta', width: 15 },
      { header: 'stock', key: 'stock', width: 10 },
      { header: 'marca', key: 'marca', width: 15 },
      { header: 'activo', key: 'activo', width: 10 },
      { header: 'destacado', key: 'destacado', width: 10 },
      { header: 'variante_talla', key: 'variante_talla', width: 20 },
      { header: 'variante_color', key: 'variante_color', width: 20 },
      { header: 'variante_imagen', key: 'variante_imagen', width: 15 },
    ];

    // Estilo de header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF7C3AED' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private translateEventType(type: string): string {
    const translations: Record<string, string> = {
      PAGE_VIEW: 'Vista de Página',
      PRODUCT_VIEW: 'Vista de Producto',
      CATEGORY_VIEW: 'Vista de Categoría',
      SEARCH: 'Búsqueda',
      WHATSAPP_CLICK: 'Clic en WhatsApp',
      ADD_TO_CART: 'Agregar al Carrito',
      CHECKOUT_START: 'Inicio de Checkout',
      PURCHASE: 'Compra',
    };
    return translations[type] || type;
  }
}
