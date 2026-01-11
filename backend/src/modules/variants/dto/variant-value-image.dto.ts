import { z } from 'zod';

// Schema para crear/subir imagen de valor de variante
export const createVariantValueImageSchema = z.object({
  variantTypeId: z.string().min(1, 'El tipo de variante es requerido'),
  value: z.string().min(1, 'El valor es requerido'),
});

export type CreateVariantValueImageDto = z.infer<typeof createVariantValueImageSchema>;

// Schema para reordenar imágenes
export const reorderVariantValueImagesSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
    }),
  ),
});

export type ReorderVariantValueImagesDto = z.infer<typeof reorderVariantValueImagesSchema>;

// Schema para configurar el tipo de variante que tiene imágenes
export const setImageVariantTypeSchema = z.object({
  variantTypeId: z.string().nullable(),
});

export type SetImageVariantTypeDto = z.infer<typeof setImageVariantTypeSchema>;
