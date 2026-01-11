import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string; email: string }) {
    const refreshToken = req.body.refreshToken;

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, name: true, refreshToken: true },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Token de refresco invalido');
    }

    // Verify the refresh token matches
    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Token de refresco no coincide');
    }

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      refreshToken,
    };
  }
}
