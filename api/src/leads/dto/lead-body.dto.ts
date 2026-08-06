import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class LeadBodyDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  service_id!: number;

  @ApiProperty({ example: "Cliente Exemplo" })
  @IsString()
  client_nome!: string;

  @ApiProperty({ example: "+244 923 000 000" })
  @IsString()
  client_telefone!: string;

  @ApiPropertyOptional({ example: "Interessado no plano SMART" })
  @IsOptional()
  @IsString()
  notas?: string;
}

export class LeadStatusBodyDto {
  @ApiProperty({ example: "converted", enum: ["new", "contacted", "converted", "lost"] })
  @IsString()
  status!: string;
}
