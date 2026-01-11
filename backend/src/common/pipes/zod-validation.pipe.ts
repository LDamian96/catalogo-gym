import { PipeTransform, BadRequestException, Injectable } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      const result = this.schema.parse(value);
      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new BadRequestException({
          message: 'Error de validacion',
          errors,
        });
      }

      throw new BadRequestException('Error de validacion');
    }
  }
}
