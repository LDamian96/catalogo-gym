import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../database/prisma.service';

interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  services: {
    api: 'up' | 'down';
    database: 'up' | 'down';
  };
  version: string;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Verificar estado del servicio' })
  @ApiResponse({ status: 200, description: 'Servicio funcionando' })
  @ApiResponse({ status: 503, description: 'Servicio no disponible' })
  async check(): Promise<HealthCheckResponse> {
    let databaseStatus: 'up' | 'down' = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'up';
    } catch (error) {
      databaseStatus = 'down';
    }

    const allUp = databaseStatus === 'up';

    return {
      status: allUp ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: {
        api: 'up',
        database: databaseStatus,
      },
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Public()
  @Get('ping')
  @ApiOperation({ summary: 'Ping simple' })
  @ApiResponse({ status: 200, description: 'pong' })
  ping(): { message: string } {
    return { message: 'pong' };
  }
}
