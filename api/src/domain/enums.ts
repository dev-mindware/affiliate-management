export enum UserRole {
  ADMIN = "admin",
  AFFILIATE = "affiliate",
}

export enum AffiliateStatus {
  PENDING_APPROVAL = "pending_approval",
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  REJECTED = "rejected",
}

export enum PartnerType {
  AFFILIATE = "affiliate",
  CERTIFIED_COMMERCIAL = "certified_commercial",
}

export enum PartnerLevel {
  NONE = "none",
  SILVER = "silver",
  GOLD = "gold",
  ELITE = "elite",
}

export enum CertificationStatus {
  NOT_ELIGIBLE = "not_eligible",
  ELIGIBLE = "eligible",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum LeadStatus {
  NEW = "new",
  CONTACTED = "contacted",
  CONVERTED = "converted",
  LOST = "lost",
}

export enum CommissionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  PAID = "paid",
  REJECTED = "rejected",
}

export enum WithdrawalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum PartnerPlanCode {
  BASE = "BASE",
  SMART = "SMART",
  PRO = "PRO",
}

export enum BillingPeriod {
  MONTHLY_FIRST = "monthly_first",
  MONTHLY_RECURRING = "monthly_recurring",
  ANNUAL_FIRST = "annual_first",
}

export enum PartnerSubscriptionStatus {
  ACTIVE = "active",
  CANCELLED = "cancelled",
  PAYMENT_FAILED = "payment_failed",
  SUSPENDED = "suspended",
  REFUNDED = "refunded",
  CHARGEBACK = "chargeback",
}

export enum PartnerPaymentSource {
  MANUAL = "manual",
  WEBHOOK = "webhook",
}
