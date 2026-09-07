import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "parceiro@mindware.ao" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "senha-segura-123" })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: "Jonatão Cardoso" })
  @IsString()
  nome_completo!: string;

  @ApiPropertyOptional({ example: "+244 923 000 000" })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({ example: "AO06000600000000000000000" })
  @IsOptional()
  @IsString()
  conta_bancaria?: string;

  @ApiPropertyOptional({ example: "BAI" })
  @IsOptional()
  @IsString()
  banco?: string;
}

export class LoginDto {
  @ApiProperty({ example: "admin@mindware.ao" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "admin-password" })
  @IsString()
  password!: string;
}

export class FormLoginDto {
  @ApiPropertyOptional({ example: "admin@mindware.ao" })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: "admin@mindware.ao" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: "admin-password" })
  @IsString()
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: "parceiro@mindware.ao" })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: "jwt-reset-token" })
  @IsString()
  token!: string;

  @ApiProperty({ example: "nova-senha-segura-123" })
  @IsString()
  @MinLength(6)
  new_password!: string;
}
