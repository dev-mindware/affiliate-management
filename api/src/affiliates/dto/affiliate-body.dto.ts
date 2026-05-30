import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class AffiliateCreateDto {
  @ApiProperty({ example: "Joao Cardoso" })
  @IsString()
  nome_completo!: string;

  @ApiProperty({ example: "joao@empresa.ao" })
  @IsEmail()
  email!: string;

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

  @ApiPropertyOptional({ example: "active", enum: ["pending_approval", "active", "inactive", "suspended", "rejected"] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: "SenhaForte123" })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

export class AffiliateAdminUpdateDto {
  @ApiPropertyOptional({ example: "Joao Cardoso" })
  @IsOptional()
  @IsString()
  nome_completo?: string;

  @ApiPropertyOptional({ example: "joao@empresa.ao" })
  @IsOptional()
  @IsEmail()
  email?: string;

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

  @ApiPropertyOptional({ example: "active", enum: ["pending_approval", "active", "inactive", "suspended", "rejected"] })
  @IsOptional()
  @IsString()
  status?: string;
}

export class AffiliateStatusBodyDto {
  @ApiProperty({ example: "active", enum: ["pending_approval", "active", "inactive", "suspended", "rejected"] })
  @IsString()
  status!: string;
}

export class AffiliateProfileBodyDto {
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
