import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/services/cache.service';
import { generateSlug } from '../../common/utils/slug.util';
import { ImportResult, ImportRowResult } from './dto/import.dto';
import * as ExcelJS from 'exceljs';

interface ParsedRow {
  nombre: string;
  precio: number;
  categoria?: string;
  descripcion?: string;
  precio_oferta?: number;
  stock?: number;
  marca?: string;
  activo?: boolean;
  destacado?: boolean;
  mostrar_precio?: boolean;
  mostrar_stock?: boolean;
  mensaje_sin_stock?: string;
  sku?: string;
  variante_imagen?: string;
  variantes: { tipo: string; valores: string[] }[];
}

@Injectable()
export class ImportService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  /**
   * Importar productos desde archivo Excel o CSV
   */
  async importFromExcel(file: Express.Multer.File): Promise<ImportResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No se proporcionó archivo');
    }

    // Verificar extensión
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
    ];

    const isCSV = file.mimetype === 'text/csv' ||
                  file.mimetype === 'application/csv' ||
                  file.originalname?.endsWith('.csv');

    if (!allowedMimes.includes(file.mimetype) && !isCSV) {
      throw new BadRequestException('Formato de archivo no soportado. Use .xlsx, .xls o .csv');
    }

    let rows: ParsedRow[];

    if (isCSV) {
      // Parsear CSV
      rows = this.parseCSV(file.buffer.toString('utf-8'));
    } else {
      // Leer Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer as unknown as ExcelJS.Buffer);

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new BadRequestException('El archivo no tiene hojas de cálculo');
      }

      // Parsear filas
      rows = this.parseWorksheet(worksheet);
    }

    if (rows.length === 0) {
      throw new BadRequestException('El archivo no contiene datos');
    }

    // Procesar importación
    const results: ImportRowResult[] = [];
    const variantTypesCreated: string[] = [];
    let created = 0;
    let errors = 0;

    // Pre-crear tipos de variante necesarios
    const allVariantTypes = new Set<string>();
    for (const row of rows) {
      for (const v of row.variantes) {
        allVariantTypes.add(v.tipo.toLowerCase());
      }
    }

    // Crear o obtener tipos de variante
    const variantTypeMap = new Map<string, string>(); // nombre -> id
    for (const typeName of allVariantTypes) {
      const existing = await this.prisma.variantType.findFirst({
        where: { name: { equals: typeName, mode: 'insensitive' } },
      });

      if (existing) {
        variantTypeMap.set(typeName, existing.id);
      } else {
        // Crear nuevo tipo de variante
        const maxOrder = await this.prisma.variantType.aggregate({
          _max: { order: true },
        });
        const newType = await this.prisma.variantType.create({
          data: {
            name: this.capitalizeFirst(typeName),
            order: (maxOrder._max.order ?? -1) + 1,
            isActive: true,
          },
        });
        variantTypeMap.set(typeName, newType.id);
        variantTypesCreated.push(newType.name);
      }
    }

    // Procesar cada fila
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 porque Excel empieza en 1 y tiene header

      try {
        const result = await this.processRow(row, rowNumber, variantTypeMap);
        results.push(result);
        if (result.success) {
          created++;
        } else {
          errors++;
        }
      } catch (error) {
        results.push({
          row: rowNumber,
          productName: row.nombre || 'Desconocido',
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
        errors++;
      }
    }

    // Invalidar TODO el caché (productos, marcas, categorías, catálogo, etc.)
    await this.cache.invalidateAll();

    return {
      success: errors === 0,
      totalRows: rows.length,
      processed: rows.length,
      created,
      errors,
      results,
      variantTypesCreated,
    };
  }

  /**
   * Parsear worksheet y extraer filas
   */
  private parseWorksheet(worksheet: ExcelJS.Worksheet): ParsedRow[] {
    const rows: ParsedRow[] = [];
    const headers: string[] = [];

    // Obtener headers de la primera fila
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.text?.toString().toLowerCase().trim() || '';
    });

    // Procesar filas de datos
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const rowData: Record<string, unknown> = {};
      const variantes: { tipo: string; valores: string[] }[] = [];

      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (!header) return;

        const value = cell.value;

        // Detectar columnas de variante (variante_*)
        if (header.startsWith('variante_') && header !== 'variante_imagen') {
          const tipoVariante = header.replace('variante_', '');
          const valores = this.parseVariantValues(value);
          if (valores.length > 0) {
            variantes.push({ tipo: tipoVariante, valores });
          }
        } else {
          rowData[header] = this.parseCell(value, header);
        }
      });

      // Validar campos requeridos
      if (rowData.nombre && rowData.precio) {
        rows.push({
          nombre: rowData.nombre as string,
          precio: rowData.precio as number,
          categoria: rowData.categoria as string | undefined,
          descripcion: rowData.descripcion as string | undefined,
          precio_oferta: rowData.precio_oferta as number | undefined,
          stock: rowData.stock as number | undefined,
          marca: rowData.marca as string | undefined,
          activo: rowData.activo as boolean | undefined,
          destacado: rowData.destacado as boolean | undefined,
          mostrar_precio: rowData.mostrar_precio as boolean | undefined,
          mostrar_stock: rowData.mostrar_stock as boolean | undefined,
          mensaje_sin_stock: rowData.mensaje_sin_stock as string | undefined,
          sku: rowData.sku as string | undefined,
          variante_imagen: rowData.variante_imagen as string | undefined,
          variantes,
        });
      }
    });

    return rows;
  }

  /**
   * Parsear CSV y extraer filas
   */
  private parseCSV(content: string): ParsedRow[] {
    const rows: ParsedRow[] = [];
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length < 2) return rows; // Necesita header + al menos 1 fila

    // Parsear headers
    const headers = this.parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

    // Parsear filas de datos
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const rowData: Record<string, unknown> = {};
      const variantes: { tipo: string; valores: string[] }[] = [];

      headers.forEach((header, index) => {
        const value = values[index] || '';

        // Detectar columnas de variante (variante_*)
        if (header.startsWith('variante_') && header !== 'variante_imagen') {
          const tipoVariante = header.replace('variante_', '');
          const valores = this.parseVariantValues(value);
          if (valores.length > 0) {
            variantes.push({ tipo: tipoVariante, valores });
          }
        } else {
          rowData[header] = this.parseCell(value, header);
        }
      });

      // Validar campos requeridos
      if (rowData.nombre && rowData.precio) {
        rows.push({
          nombre: rowData.nombre as string,
          precio: rowData.precio as number,
          categoria: rowData.categoria as string | undefined,
          descripcion: rowData.descripcion as string | undefined,
          precio_oferta: rowData.precio_oferta as number | undefined,
          stock: rowData.stock as number | undefined,
          marca: rowData.marca as string | undefined,
          activo: rowData.activo as boolean | undefined,
          destacado: rowData.destacado as boolean | undefined,
          mostrar_precio: rowData.mostrar_precio as boolean | undefined,
          mostrar_stock: rowData.mostrar_stock as boolean | undefined,
          mensaje_sin_stock: rowData.mensaje_sin_stock as string | undefined,
          sku: rowData.sku as string | undefined,
          variante_imagen: rowData.variante_imagen as string | undefined,
          variantes,
        });
      }
    }

    return rows;
  }

  /**
   * Parsear línea CSV respetando comillas
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Parsear valores de variante (separados por coma)
   */
  private parseVariantValues(value: unknown): string[] {
    if (!value) return [];
    const str = String(value).trim();
    if (!str) return [];
    return str.split(',').map((v) => v.trim()).filter((v) => v.length > 0);
  }

  /**
   * Parsear valor de celda según el header
   */
  private parseCell(value: unknown, header: string): unknown {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    // Campos numéricos
    if (['precio', 'precio_oferta', 'stock'].includes(header)) {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      return isNaN(num) ? undefined : num;
    }

    // Campos booleanos
    if (['activo', 'destacado', 'mostrar_precio', 'mostrar_stock'].includes(header)) {
      if (typeof value === 'boolean') return value;
      const str = String(value).toLowerCase().trim();
      return str === 'si' || str === 'sí' || str === 'true' || str === '1' || str === 'yes';
    }

    // Campos de texto
    return String(value).trim();
  }

  /**
   * Procesar una fila y crear producto con variantes
   */
  private async processRow(
    row: ParsedRow,
    rowNumber: number,
    variantTypeMap: Map<string, string>,
  ): Promise<ImportRowResult> {
    // Buscar o crear categoría
    let categoryId: string | null = null;
    if (row.categoria) {
      const category = await this.prisma.category.findFirst({
        where: { name: { equals: row.categoria, mode: 'insensitive' } },
      });

      if (category) {
        categoryId = category.id;
      } else {
        // Crear categoría
        const maxOrder = await this.prisma.category.aggregate({
          _max: { order: true },
        });
        const newCategory = await this.prisma.category.create({
          data: {
            name: row.categoria,
            slug: generateSlug(row.categoria),
            order: (maxOrder._max.order ?? -1) + 1,
            isActive: true,
          },
        });
        categoryId = newCategory.id;
      }
    } else {
      // Usar categoría por defecto o crear una
      let defaultCategory = await this.prisma.category.findFirst({
        where: { slug: 'sin-categoria' },
      });

      if (!defaultCategory) {
        const maxOrder = await this.prisma.category.aggregate({
          _max: { order: true },
        });
        defaultCategory = await this.prisma.category.create({
          data: {
            name: 'Sin Categoría',
            slug: 'sin-categoria',
            order: (maxOrder._max.order ?? -1) + 1,
            isActive: true,
          },
        });
      }
      categoryId = defaultCategory.id;
    }

    // Buscar o crear marca si se especificó
    let brandId: string | null = null;
    if (row.marca) {
      const brand = await this.prisma.brand.findFirst({
        where: { name: { equals: row.marca, mode: 'insensitive' } },
      });

      if (brand) {
        brandId = brand.id;
      } else {
        // Crear marca si no existe
        const maxBrandOrder = await this.prisma.brand.aggregate({
          _max: { order: true },
        });
        const newBrand = await this.prisma.brand.create({
          data: {
            name: row.marca,
            slug: generateSlug(row.marca),
            order: (maxBrandOrder._max.order ?? -1) + 1,
            isActive: true,
          },
        });
        brandId = newBrand.id;
      }
    }

    // Generar slug único
    let slug = generateSlug(row.nombre);
    let counter = 0;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      counter++;
      slug = `${generateSlug(row.nombre)}-${counter}`;
    }

    // Obtener max order para la categoría
    const maxOrder = await this.prisma.product.aggregate({
      where: { categoryId },
      _max: { order: true },
    });

    // Crear producto en transacción
    const product = await this.prisma.$transaction(async (tx) => {
      // Crear producto base
      const newProduct = await tx.product.create({
        data: {
          categoryId,
          brandId,
          name: row.nombre,
          slug,
          description: row.descripcion || null,
          price: row.precio,
          salePrice: row.precio_oferta || null,
          showPrice: row.mostrar_precio ?? true,
          stock: row.stock ?? null,
          showStock: row.mostrar_stock ?? false,
          stockMessage: row.mensaje_sin_stock || null,
          isActive: row.activo ?? true,
          isFeatured: row.destacado ?? false,
          order: (maxOrder._max.order ?? -1) + 1,
        },
      });

      // Si hay variantes, crear valores de variante en el producto
      if (row.variantes.length > 0) {
        const variantValuesToCreate: { variantTypeId: string; value: string }[] = [];

        for (const v of row.variantes) {
          const variantTypeId = variantTypeMap.get(v.tipo.toLowerCase());
          if (!variantTypeId) continue;

          for (const valor of v.valores) {
            variantValuesToCreate.push({
              variantTypeId,
              value: valor,
            });

            // También crear el valor en VariantTypeValue si no existe
            const existingValue = await tx.variantTypeValue.findUnique({
              where: {
                variantTypeId_value: {
                  variantTypeId,
                  value: valor,
                },
              },
            });

            if (!existingValue) {
              const maxValueOrder = await tx.variantTypeValue.aggregate({
                where: { variantTypeId },
                _max: { order: true },
              });
              await tx.variantTypeValue.create({
                data: {
                  variantTypeId,
                  value: valor,
                  order: (maxValueOrder._max.order ?? -1) + 1,
                  isActive: true,
                },
              });
            }
          }
        }

        // Crear ProductVariantValue para cada valor
        if (variantValuesToCreate.length > 0) {
          await tx.productVariantValue.createMany({
            data: variantValuesToCreate.map((v) => ({
              productId: newProduct.id,
              variantTypeId: v.variantTypeId,
              value: v.value,
            })),
          });
        }

        // Establecer imageVariantType si se especificó
        if (row.variante_imagen) {
          const imageTypeId = variantTypeMap.get(row.variante_imagen.toLowerCase());
          if (imageTypeId) {
            await tx.product.update({
              where: { id: newProduct.id },
              data: { imageVariantTypeId: imageTypeId },
            });
          }
        }
      }

      return newProduct;
    });

    // Generar combinaciones de variantes si hay variantes
    let variantsCreated = 0;
    if (row.variantes.length > 0) {
      variantsCreated = await this.generateVariantCombinations(product.id, row.variantes, variantTypeMap);
    }

    return {
      row: rowNumber,
      productName: row.nombre,
      success: true,
      productId: product.id,
      variantsCreated,
    };
  }

  /**
   * Generar combinaciones de variantes (sub-productos)
   */
  private async generateVariantCombinations(
    productId: string,
    variantes: { tipo: string; valores: string[] }[],
    variantTypeMap: Map<string, string>,
  ): Promise<number> {
    if (variantes.length === 0) return 0;

    // Generar producto cartesiano de valores
    const generateCartesian = (arrays: { typeId: string; values: string[] }[]): { typeId: string; value: string }[][] => {
      if (arrays.length === 0) return [[]];
      if (arrays.length === 1) {
        return arrays[0].values.map((v) => [{ typeId: arrays[0].typeId, value: v }]);
      }

      const [first, ...rest] = arrays;
      const restCombinations = generateCartesian(rest);

      const result: { typeId: string; value: string }[][] = [];
      for (const value of first.values) {
        for (const combo of restCombinations) {
          result.push([{ typeId: first.typeId, value }, ...combo]);
        }
      }
      return result;
    };

    const variantArrays = variantes.map((v) => ({
      typeId: variantTypeMap.get(v.tipo.toLowerCase()) || '',
      values: v.valores,
    })).filter((v) => v.typeId);

    const combinations = generateCartesian(variantArrays);

    // Crear variantes en batch
    let order = 0;
    for (const combo of combinations) {
      await this.prisma.productVariant.create({
        data: {
          productId,
          isActive: true,
          order: order++,
          variantValues: {
            create: combo.map((v) => ({
              variantTypeId: v.typeId,
              value: v.value,
            })),
          },
        },
      });
    }

    return combinations.length;
  }

  /**
   * Obtener plantilla de importación
   */
  async getTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Productos');

    // Headers
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
      { header: 'mostrar_precio', key: 'mostrar_precio', width: 15 },
      { header: 'mostrar_stock', key: 'mostrar_stock', width: 15 },
      { header: 'mensaje_sin_stock', key: 'mensaje_sin_stock', width: 20 },
      { header: 'sku', key: 'sku', width: 15 },
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

    // Fila de ejemplo
    worksheet.addRow({
      nombre: 'Camiseta Básica',
      precio: 29.99,
      categoria: 'Ropa',
      descripcion: 'Camiseta de algodón 100%',
      precio_oferta: 24.99,
      stock: 100,
      marca: 'MiMarca',
      activo: 'si',
      destacado: 'no',
      mostrar_precio: 'si',
      mostrar_stock: 'no',
      mensaje_sin_stock: 'Agotado',
      sku: 'CAM-001',
      variante_talla: 'S,M,L,XL',
      variante_color: 'Negro,Blanco,Azul',
      variante_imagen: 'color',
    });

    // Agregar instrucciones
    const instructionsSheet = workbook.addWorksheet('Instrucciones');
    instructionsSheet.addRow(['INSTRUCCIONES DE USO']);
    instructionsSheet.addRow([]);
    instructionsSheet.addRow(['Campos Requeridos:']);
    instructionsSheet.addRow(['- nombre: Nombre del producto']);
    instructionsSheet.addRow(['- precio: Precio del producto (número)']);
    instructionsSheet.addRow([]);
    instructionsSheet.addRow(['Campos Opcionales:']);
    instructionsSheet.addRow(['- categoria: Nombre de la categoría (se crea si no existe)']);
    instructionsSheet.addRow(['- descripcion: Descripción del producto']);
    instructionsSheet.addRow(['- precio_oferta: Precio de oferta (número)']);
    instructionsSheet.addRow(['- stock: Cantidad en stock (número entero)']);
    instructionsSheet.addRow(['- marca: Nombre de la marca']);
    instructionsSheet.addRow(['- activo: si/no - Si el producto está activo']);
    instructionsSheet.addRow(['- destacado: si/no - Si el producto está destacado']);
    instructionsSheet.addRow(['- mostrar_precio: si/no - Si mostrar el precio']);
    instructionsSheet.addRow(['- mostrar_stock: si/no - Si mostrar el stock']);
    instructionsSheet.addRow(['- mensaje_sin_stock: Mensaje cuando no hay stock']);
    instructionsSheet.addRow(['- sku: Código único del producto']);
    instructionsSheet.addRow([]);
    instructionsSheet.addRow(['Variantes:']);
    instructionsSheet.addRow(['- variante_[nombre]: Valores separados por coma. Ej: variante_talla = S,M,L']);
    instructionsSheet.addRow(['- Puedes agregar tantas columnas variante_* como necesites']);
    instructionsSheet.addRow(['- variante_imagen: Nombre del tipo de variante que controla las imágenes']);
    instructionsSheet.addRow([]);
    instructionsSheet.addRow(['Ejemplo:']);
    instructionsSheet.addRow(['variante_talla = S,M,L']);
    instructionsSheet.addRow(['variante_color = Negro,Blanco']);
    instructionsSheet.addRow(['Esto creará 6 sub-productos: S-Negro, S-Blanco, M-Negro, M-Blanco, L-Negro, L-Blanco']);

    instructionsSheet.getColumn(1).width = 80;

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
