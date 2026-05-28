import { ApiPropertyOptional } from "@nestjs/swagger";

export class RejectWithdrawalDto {
  @ApiPropertyOptional({ example: "Dados bancarios inconsistentes" })
  notas_admin?: string;
}
