import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

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
