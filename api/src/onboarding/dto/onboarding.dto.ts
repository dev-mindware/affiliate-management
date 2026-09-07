import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from "class-validator";
import { OnboardingTourStatus } from "@prisma/client";

export class UpdateOnboardingPreferencesDto {
  @ApiPropertyOptional({ description: "Whether tours should start automatically on first page visit", example: true })
  @IsOptional()
  @IsBoolean()
  autoStartEnabled?: boolean;

  @ApiPropertyOptional({ description: "Whether the 'Ver guia' button should be visible in page headers", example: true })
  @IsOptional()
  @IsBoolean()
  tourButtonEnabled?: boolean;
}

export class UpdateOnboardingTourProgressDto {
  @ApiProperty({ description: "Current status of the tour", enum: OnboardingTourStatus, example: OnboardingTourStatus.COMPLETED })
  @Transform(({ value }) => (typeof value === "string" ? value.toUpperCase() : value))
  @IsEnum(OnboardingTourStatus)
  status: OnboardingTourStatus;

  @ApiPropertyOptional({ description: "Zero-based index of the last visited step", example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lastStepIndex?: number;

  @ApiPropertyOptional({ description: "Version of the tour definition completed", example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  tourVersion?: number;
}
