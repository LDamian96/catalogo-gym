import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  const frontendUrl = configService.get<string>('app.frontendUrl');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation (only in development)
  const nodeEnv = configService.get<string>('app.nodeEnv');
  if (nodeEnv === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Catalogo Digital API')
      .setDescription('API para el catalogo digital con QR para emprendedores')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  // Start server
  const port = configService.get<number>('app.port') || 3001;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                    CATALOGO DIGITAL API                   ║
  ╠═══════════════════════════════════════════════════════════╣
  ║  Server running on: http://localhost:${port}                  ║
  ║  API prefix: /api/v1                                      ║
  ║  Environment: ${nodeEnv?.padEnd(43)}║
  ${nodeEnv === 'development' ? `║  Swagger docs: http://localhost:${port}/docs                  ║` : ''}
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
