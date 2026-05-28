import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "parceiro@mindware.ao" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "senha-segura-123" })
  @IsString()
  password!: string;

  @ApiProperty({ example: "Jonatao Cardoso" })
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
