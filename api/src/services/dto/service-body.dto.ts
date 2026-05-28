import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ServiceBodyDto {
  @ApiProperty({ example: "Website Institucional" })
  nome!: string;

  @ApiPropertyOptional({ example: "Criacao de website profissional" })
  descricao?: string;

  @ApiProperty({ example: 180000 })
  preco!: number;

  @ApiProperty({ example: 25000 })
  comissao!: number;

  @ApiPropertyOptional({ example: true })
  ativo?: boolean;
}
