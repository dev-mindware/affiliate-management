CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "users_role_enum" AS ENUM ('admin', 'affiliate');
CREATE TYPE "affiliates_status_enum" AS ENUM ('pending_approval', 'active', 'inactive', 'suspended', 'rejected');
CREATE TYPE "affiliates_partner_type_enum" AS ENUM ('affiliate', 'certified_commercial');
CREATE TYPE "affiliates_partner_level_enum" AS ENUM ('none', 'silver', 'gold', 'elite');
CREATE TYPE "affiliates_certification_status_enum" AS ENUM ('not_eligible', 'eligible', 'approved', 'rejected');
CREATE TYPE "lead_notifications_status_enum" AS ENUM ('new', 'contacted', 'converted', 'lost');
CREATE TYPE "commissions_status_enum" AS ENUM ('pending', 'approved', 'paid', 'rejected');
CREATE TYPE "withdrawal_requests_status_enum" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "partner_program_plans_code_enum" AS ENUM ('BASE', 'SMART', 'CUSTOM');
CREATE TYPE "partner_subscriptions_billing_period_enum" AS ENUM ('monthly_first', 'monthly_recurring', 'annual_first');
CREATE TYPE "partner_subscriptions_status_enum" AS ENUM ('active', 'cancelled', 'payment_failed', 'suspended', 'refunded', 'chargeback');
CREATE TYPE "partner_subscriptions_source_enum" AS ENUM ('manual', 'webhook');

CREATE TABLE "users" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "users_role_enum" NOT NULL DEFAULT 'affiliate',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "affiliates" (
  "id" UUID NOT NULL,
  "user_id" UUID,
  "nome_completo" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "telefone" TEXT,
  "conta_bancaria" TEXT,
  "banco" TEXT,
  "codigo_afiliado" TEXT NOT NULL,
  "status" "affiliates_status_enum" NOT NULL DEFAULT 'pending_approval',
  "partner_type" "affiliates_partner_type_enum" NOT NULL DEFAULT 'affiliate',
  "partner_level" "affiliates_partner_level_enum" NOT NULL DEFAULT 'none',
  "certification_status" "affiliates_certification_status_enum" NOT NULL DEFAULT 'not_eligible',
  "total_earned" DECIMAL(20,2) NOT NULL DEFAULT 0,
  "total_paid" DECIMAL(20,2) NOT NULL DEFAULT 0,
  "approved_at" TIMESTAMP(3),
  "approved_by" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "affiliates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "services" (
  "id" SERIAL NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT,
  "preco" DECIMAL(20,2) NOT NULL,
  "comissao" DECIMAL(20,2) NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lead_notifications" (
  "id" UUID NOT NULL,
  "affiliate_id" UUID NOT NULL,
  "service_id" INTEGER NOT NULL,
  "client_nome" TEXT NOT NULL,
  "client_telefone" TEXT,
  "notas" TEXT,
  "status" "lead_notifications_status_enum" NOT NULL DEFAULT 'new',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "lead_notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "commissions" (
  "id" UUID NOT NULL,
  "affiliate_id" UUID NOT NULL,
  "service_id" INTEGER,
  "lead_notification_id" UUID,
  "partner_subscription_id" UUID,
  "client_nome" TEXT NOT NULL,
  "client_telefone" TEXT,
  "valor_servico" DECIMAL(20,2) NOT NULL,
  "valor_comissao" DECIMAL(20,2) NOT NULL,
  "status" "commissions_status_enum" NOT NULL DEFAULT 'pending',
  "notas" TEXT,
  "comprovativo_url" TEXT,
  "comprovativo_filename" TEXT,
  "source" TEXT NOT NULL DEFAULT 'services',
  "available_at" TIMESTAMP(3),
  "validation_days" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approved_at" TIMESTAMP(3),
  "paid_at" TIMESTAMP(3),
  CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "wallets" (
  "id" UUID NOT NULL,
  "affiliate_id" UUID NOT NULL,
  "saldo_disponivel" DECIMAL(20,2) NOT NULL DEFAULT 0,
  "saldo_pendente" DECIMAL(20,2) NOT NULL DEFAULT 0,
  "total_ganho" DECIMAL(20,2) NOT NULL DEFAULT 0,
  "total_levantado" DECIMAL(20,2) NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "withdrawal_requests" (
  "id" UUID NOT NULL,
  "affiliate_id" UUID NOT NULL,
  "valor" DECIMAL(20,2) NOT NULL,
  "conta_bancaria" TEXT,
  "banco" TEXT,
  "status" "withdrawal_requests_status_enum" NOT NULL DEFAULT 'pending',
  "notas_admin" TEXT,
  "comprovativo_url" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMP(3),
  CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "partner_program_plans" (
  "id" SERIAL NOT NULL,
  "code" "partner_program_plans_code_enum" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL(20,2) NOT NULL DEFAULT 0,
  "first_monthly_percent" DECIMAL(8,2) NOT NULL DEFAULT 0,
  "recurring_monthly_percent" DECIMAL(8,2) NOT NULL DEFAULT 0,
  "annual_first_percent" DECIMAL(8,2) NOT NULL DEFAULT 0,
  "minimum_custom_price" DECIMAL(20,2),
  "mindware_minimum_net" DECIMAL(20,2),
  "certified_only" BOOLEAN NOT NULL DEFAULT false,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "partner_program_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "partner_subscriptions" (
  "id" UUID NOT NULL,
  "affiliate_id" UUID NOT NULL,
  "plan_id" INTEGER NOT NULL,
  "external_payment_id" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "client_identifier" TEXT NOT NULL,
  "amount_paid" DECIMAL(20,2) NOT NULL,
  "paid_at" TIMESTAMP(3) NOT NULL,
  "billing_period" "partner_subscriptions_billing_period_enum" NOT NULL,
  "status" "partner_subscriptions_status_enum" NOT NULL DEFAULT 'active',
  "source" "partner_subscriptions_source_enum" NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "partner_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "partner_certifications" (
  "id" UUID NOT NULL,
  "affiliate_id" UUID NOT NULL,
  "approved_at" TIMESTAMP(3),
  "approved_by" UUID,
  "rejected_at" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "partner_certifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "affiliates_user_id_key" ON "affiliates"("user_id");
CREATE UNIQUE INDEX "affiliates_codigo_afiliado_key" ON "affiliates"("codigo_afiliado");
CREATE UNIQUE INDEX "wallets_affiliate_id_key" ON "wallets"("affiliate_id");
CREATE UNIQUE INDEX "partner_program_plans_code_key" ON "partner_program_plans"("code");
CREATE UNIQUE INDEX "partner_subscriptions_external_payment_id_key" ON "partner_subscriptions"("external_payment_id");
CREATE UNIQUE INDEX "partner_certifications_affiliate_id_key" ON "partner_certifications"("affiliate_id");

ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lead_notifications" ADD CONSTRAINT "lead_notifications_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_notifications" ADD CONSTRAINT "lead_notifications_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_lead_notification_id_fkey" FOREIGN KEY ("lead_notification_id") REFERENCES "lead_notifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_partner_subscription_id_fkey" FOREIGN KEY ("partner_subscription_id") REFERENCES "partner_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "partner_subscriptions" ADD CONSTRAINT "partner_subscriptions_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "partner_subscriptions" ADD CONSTRAINT "partner_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "partner_program_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "partner_certifications" ADD CONSTRAINT "partner_certifications_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
