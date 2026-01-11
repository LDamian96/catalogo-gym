import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, MeResponseDto, TokensResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesion' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciales invalidas' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens' })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados',
    type: TokensResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Refresh token invalido' })
  async refreshTokens(
    @CurrentUser() user: CurrentUserPayload & { refreshToken: string },
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokensResponseDto> {
    return this.authService.refreshTokens(user.sub, refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cerrar sesion' })
  @ApiResponse({ status: 200, description: 'Sesion cerrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async logout(@CurrentUser('sub') userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return { message: 'Sesion cerrada exitosamente' };
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Datos del usuario',
    type: MeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getMe(@CurrentUser('sub') userId: string): Promise<MeResponseDto> {
    const user = await this.authService.getMe(userId);
    return { user };
  }
}
