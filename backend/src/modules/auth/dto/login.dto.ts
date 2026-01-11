import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@catalogo.com',
    description: 'Email del usuario',
  })
  @IsEmail({}, { message: 'El email no es valido' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario',
    minLength: 6,
    maxLength: 50,
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede tener mas de 50 caracteres' })
  password: string;
}
