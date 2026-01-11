import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('PrismaExceptionFilter');

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error de base de datos';

    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[])?.join(', ') || 'campo';
        message = `Ya existe un registro con este ${target}`;
        break;

      case 'P2003':
        // Foreign key constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Error de referencia: el registro relacionado no existe';
        break;

      case 'P2025':
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'El registro no fue encontrado';
        break;

      case 'P2014':
        // Required relation violation
        status = HttpStatus.BAD_REQUEST;
        message = 'La relacion requerida no existe';
        break;

      default:
        this.logger.error(`Prisma error: ${exception.code}`, exception.message);
    }

    response.status(status).json({
      success: false,
      error: {
        code: status,
        message,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
