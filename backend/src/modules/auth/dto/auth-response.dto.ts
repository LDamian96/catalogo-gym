import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'clx123456' })
  id: string;

  @ApiProperty({ example: 'admin@catalogo.com' })
  email: string;

  @ApiProperty({ example: 'Administrador' })
  name: string;

  @ApiProperty({ example: 'ADMIN', enum: ['ADMIN', 'EDITOR'] })
  role: string;
}

export class TokensResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ example: '15m', description: 'Tiempo de expiracion del access token' })
  expiresIn: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: TokensResponseDto })
  tokens: TokensResponseDto;
}

export class MeResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
