import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class PartnerPlanBodyDto {
  @ApiProperty({ example: "BASE", enum: ["BASE", "SMART", "PRO"] })
  @IsString()
  code!: string;

  @ApiProperty({ example: "BASE" })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: "Plano BASE do Mindgest Partners Program" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 5445.22 })
  @IsNumber()
  price!: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  first_monthly_percent!: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  recurring_monthly_percent!: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  annual_first_percent!: number;

  @ApiPropertyOptional({ example: 14899.22 })
  @IsOptional()
  @IsNumber()
  minimum_custom_price?: number;

  @ApiPropertyOptional({ example: 14899.22 })
  @IsOptional()
  @IsNumber()
  mindware_minimum_net?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  certified_only?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class SubscriptionPaymentDto {
  @ApiProperty({ example: "pay_202605280001" })
  @IsString()
  external_payment_id!: string;

  @ApiProperty({ example: "MWD-AO-1234" })
  @IsString()
  affiliate_code!: string;

  @ApiProperty({ example: "Cliente Exemplo" })
  @IsString()
  client_name!: string;

  @ApiProperty({ example: "NIF-5000000000" })
  @IsString()
  client_identifier!: string;

  @ApiProperty({ example: "SMART", enum: ["BASE", "SMART", "PRO"] })
  @IsString()
  plan_code!: string;

  @ApiProperty({ example: 11998.22 })
  @IsNumber()
  amount_paid!: number;

  @ApiProperty({ example: "2026-05-28T10:00:00.000Z" })
  @IsString()
  paid_at!: string;

  @ApiProperty({ example: "monthly_first", enum: ["monthly_first", "monthly_recurring", "annual_first"] })
  @IsString()
  billing_period!: string;

  @ApiPropertyOptional({ example: "Pagamento recebido via integracao" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SubscriptionStatusDto {
  @ApiProperty({ example: "cancelled", enum: ["active", "cancelled", "payment_failed", "suspended", "refunded", "chargeback"] })
  @IsString()
  status!: string;

  @ApiPropertyOptional({ example: "Cliente cancelou a subscricao" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CertificationDecisionDto {
  @ApiPropertyOptional({ example: "Aprovado apos validacao comercial" })
  @IsOptional()
  @IsString()
  notes?: string;
}
