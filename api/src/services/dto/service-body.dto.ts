import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class ServiceBodyDto {
  @ApiProperty({ example: "Website Institucional" })
  @IsString()
  nome!: string;

  @ApiPropertyOptional({ example: "Criacao de website profissional" })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 180000 })
  @IsNumber()
  preco!: number;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  comissao!: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
