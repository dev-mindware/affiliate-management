import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "parceiro@mindware.ao" })
  email!: string;

  @ApiProperty({ example: "senha-segura-123" })
  password!: string;

  @ApiProperty({ example: "Jonatao Cardoso" })
  nome_completo!: string;

  @ApiPropertyOptional({ example: "+244 923 000 000" })
  telefone?: string;

  @ApiPropertyOptional({ example: "AO06000600000000000000000" })
  conta_bancaria?: string;

  @ApiPropertyOptional({ example: "BAI" })
  banco?: string;
}

export class LoginDto {
  @ApiProperty({ example: "admin@mindware.ao" })
  email!: string;

  @ApiProperty({ example: "admin-password" })
  password!: string;
}

export class FormLoginDto {
  @ApiPropertyOptional({ example: "admin@mindware.ao" })
  username?: string;

  @ApiPropertyOptional({ example: "admin@mindware.ao" })
  email?: string;

  @ApiProperty({ example: "admin-password" })
  password!: string;
}
