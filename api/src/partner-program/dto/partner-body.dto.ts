import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PartnerPlanBodyDto {
  @ApiProperty({ example: "BASE", enum: ["BASE", "SMART", "CUSTOM"] })
  code!: string;

  @ApiProperty({ example: "BASE" })
  name!: string;

  @ApiPropertyOptional({ example: "Plano BASE do Mindgest Partners Program" })
  description?: string;

  @ApiProperty({ example: 5445.22 })
  price!: number;

  @ApiProperty({ example: 20 })
  first_monthly_percent!: number;

  @ApiProperty({ example: 15 })
  recurring_monthly_percent!: number;

  @ApiProperty({ example: 20 })
  annual_first_percent!: number;

  @ApiPropertyOptional({ example: 14899.22 })
  minimum_custom_price?: number;

  @ApiPropertyOptional({ example: 14899.22 })
  mindware_minimum_net?: number;

  @ApiPropertyOptional({ example: false })
  certified_only?: boolean;

  @ApiPropertyOptional({ example: true })
  active?: boolean;
}

export class SubscriptionPaymentDto {
  @ApiProperty({ example: "pay_202605280001" })
  external_payment_id!: string;

  @ApiProperty({ example: "MWD-AO-1234" })
  affiliate_code!: string;

  @ApiProperty({ example: "Cliente Exemplo" })
  client_name!: string;

  @ApiProperty({ example: "NIF-5000000000" })
  client_identifier!: string;

  @ApiProperty({ example: "SMART", enum: ["BASE", "SMART", "CUSTOM"] })
  plan_code!: string;

  @ApiProperty({ example: 11998.22 })
  amount_paid!: number;

  @ApiProperty({ example: "2026-05-28T10:00:00.000Z" })
  paid_at!: string;

  @ApiProperty({ example: "monthly_first", enum: ["monthly_first", "monthly_recurring", "annual_first"] })
  billing_period!: string;

  @ApiPropertyOptional({ example: "Pagamento recebido via integracao" })
  notes?: string;
}

export class SubscriptionStatusDto {
  @ApiProperty({ example: "cancelled", enum: ["active", "cancelled", "payment_failed", "suspended", "refunded", "chargeback"] })
  status!: string;

  @ApiPropertyOptional({ example: "Cliente cancelou a subscricao" })
  notes?: string;
}

export class CertificationDecisionDto {
  @ApiPropertyOptional({ example: "Aprovado apos validacao comercial" })
  notes?: string;
}
