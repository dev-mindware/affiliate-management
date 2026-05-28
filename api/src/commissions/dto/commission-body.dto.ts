import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CommissionBodyDto {
  @ApiProperty({ example: "2f6c8614-71a4-47ec-934d-a1e4f3efb931" })
  affiliate_id!: string;

  @ApiProperty({ example: 1 })
  service_id!: number;

  @ApiPropertyOptional({ example: "0dfd3ec1-5042-4275-8ff3-2de8ee1a8338" })
  lead_notification_id?: string;

  @ApiProperty({ example: "Cliente Exemplo" })
  client_nome!: string;

  @ApiPropertyOptional({ example: "+244 923 000 000" })
  client_telefone?: string;

  @ApiPropertyOptional({ example: "Comissao manual criada pelo admin" })
  notas?: string;
}

export class RejectCommissionDto {
  @ApiPropertyOptional({ example: "Pagamento nao confirmado" })
  notas?: string;
}
