import {
  AffiliateStatus,
  BillingPeriod,
  CertificationStatus,
  CommissionStatus,
  LeadStatus,
  PartnerLevel,
  PartnerPaymentSource,
  PartnerSubscriptionStatus,
  PartnerType,
  UserRole,
  WithdrawalStatus,
} from "@prisma/client";

export function enumOut(value?: string | null) {
  return value ? value.toLowerCase() : value;
}

const byApiValue = <T extends Record<string, string>>(target: T, value?: string): T[keyof T] | undefined => {
  if (value == null || value === "") return undefined;
  const normalized = value.toUpperCase();
  const found = Object.values(target).find((item) => item === normalized) as T[keyof T] | undefined;
  if (found) return found;
  return (target as any)[normalized];
};

export const toUserRole = (value?: string) => byApiValue(UserRole, value);
export const toAffiliateStatus = (value?: string) => byApiValue(AffiliateStatus, value);
export const toPartnerType = (value?: string) => byApiValue(PartnerType, value);
export const toPartnerLevel = (value?: string) => byApiValue(PartnerLevel, value);
export const toCertificationStatus = (value?: string) => byApiValue(CertificationStatus, value);
export const toLeadStatus = (value?: string) => byApiValue(LeadStatus, value);
export const toCommissionStatus = (value?: string) => byApiValue(CommissionStatus, value);
export const toWithdrawalStatus = (value?: string) => byApiValue(WithdrawalStatus, value);
export const toBillingPeriod = (value?: string) => byApiValue(BillingPeriod, value);
export const toPaymentSource = (value?: string) => byApiValue(PartnerPaymentSource, value);
export const toSubscriptionStatus = (value?: string) => byApiValue(PartnerSubscriptionStatus, value);
