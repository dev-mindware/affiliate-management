-- Add annual recurring commission percentage to partner program plans
ALTER TABLE "partner_program_plans"
  ADD COLUMN IF NOT EXISTS "annual_recurring_percent" DECIMAL(8, 2) NOT NULL DEFAULT 0;
