import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RejectWithdrawalDto {
  @ApiPropertyOptional({ example: "Dados bancarios inconsistentes" })
  @IsOptional()
  @IsString()
  notas_admin?: string;
}
