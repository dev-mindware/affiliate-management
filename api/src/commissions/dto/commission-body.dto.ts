import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CommissionBodyDto {
  @ApiProperty({ example: "2f6c8614-71a4-47ec-934d-a1e4f3efb931" })
  @IsString()
  affiliate_id!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  service_id!: number;

  @ApiPropertyOptional({ example: "0dfd3ec1-5042-4275-8ff3-2de8ee1a8338" })
  @IsOptional()
  @IsString()
  lead_notification_id?: string;

  @ApiProperty({ example: "Cliente Exemplo" })
  @IsString()
  client_nome!: string;

  @ApiPropertyOptional({ example: "+244 923 000 000" })
  @IsOptional()
  @IsString()
  client_telefone?: string;

  @ApiPropertyOptional({ example: "Comissao manual criada pelo admin" })
  @IsOptional()
  @IsString()
  notas?: string;
}

export class RejectCommissionDto {
  @ApiPropertyOptional({ example: "Pagamento nao confirmado" })
  @IsOptional()
  @IsString()
  notas?: string;
}

export class WebhookConversionDto {
  @ApiProperty({ example: "MWD-AO-1234" })
  @IsString()
  affiliate_code!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  service_id!: number;

  @ApiProperty({ example: "Cliente Exemplo" })
  @IsString()
  client_nome!: string;

  @ApiPropertyOptional({ example: "+244 923 000 000" })
  @IsOptional()
  @IsString()
  client_telefone?: string;

  @ApiPropertyOptional({ example: "Conversao confirmada por webhook" })
  @IsOptional()
  @IsString()
  notas?: string;

  @ApiPropertyOptional({ example: "evt_123456" })
  @IsOptional()
  @IsString()
  external_event_id?: string;
}
