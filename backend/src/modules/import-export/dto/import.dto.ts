import { z } from 'zod';

// Schema para una fila de producto importado
export const importProductRowSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  precio: z.number().positive('El precio debe ser positivo'),
  categoria: z.string().optional(),
  descripcion: z.string().optional(),
  precio_oferta: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  marca: z.string().optional(),
  activo: z.boolean().optional().default(true),
  destacado: z.boolean().optional().default(false),
  mostrar_precio: z.boolean().optional().default(true),
  mostrar_stock: z.boolean().optional().default(false),
  mensaje_sin_stock: z.string().optional(),
  sku: z.string().optional(),
  variante_imagen: z.string().optional(), // Tipo de variante que controla imágenes
  // Las columnas variante_* se procesan dinámicamente
});

export type ImportProductRow = z.infer<typeof importProductRowSchema>;

// Resultado de una fila procesada
export interface ImportRowResult {
  row: number;
  productName: string;
  success: boolean;
  productId?: string;
  error?: string;
  variantsCreated?: number;
}

// Resultado completo de importación
export interface ImportResult {
  success: boolean;
  totalRows: number;
  processed: number;
  created: number;
  errors: number;
  results: ImportRowResult[];
  variantTypesCreated: string[];
}

// Query params para obtener estado de importación
export const importStatusQuerySchema = z.object({
  jobId: z.string().uuid(),
});

export type ImportStatusQuery = z.infer<typeof importStatusQuerySchema>;
