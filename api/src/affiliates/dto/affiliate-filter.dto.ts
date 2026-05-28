import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { BaseFilterDto } from "../../common/dto/filter.dto";

export class AffiliateFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certification?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  partnerType?: string;
}
