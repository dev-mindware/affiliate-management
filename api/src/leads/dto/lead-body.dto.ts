import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LeadBodyDto {
  @ApiProperty({ example: 1 })
  service_id!: number;

  @ApiProperty({ example: "Cliente Exemplo" })
  client_nome!: string;

  @ApiProperty({ example: "+244 923 000 000" })
  client_telefone!: string;

  @ApiPropertyOptional({ example: "Interessado no plano SMART" })
  notas?: string;
}

export class AdminLeadBodyDto extends LeadBodyDto {
  @ApiProperty({ example: "MWD-AO-1234" })
  affiliate_code!: string;
}

export class LeadStatusBodyDto {
  @ApiProperty({ example: "converted", enum: ["new", "contacted", "converted", "lost"] })
  status!: string;
}
