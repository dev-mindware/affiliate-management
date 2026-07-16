-- Add ANNUAL_RECURRING value to the billing period enum
ALTER TYPE "partner_subscriptions_billing_period_enum" ADD VALUE IF NOT EXISTS 'annual_recurring';
