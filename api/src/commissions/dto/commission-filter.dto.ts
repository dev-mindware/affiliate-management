import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { BaseFilterDto } from "../../common/dto/filter.dto";

export class CommissionFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  affiliateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;
}
