-- Alinha o enum de codigos de plano com o schema/seed atuais: 'CUSTOM' passou a chamar-se 'PRO'.

-- 1. Renomeia o valor 'CUSTOM' para 'PRO' apenas se ainda existir 'CUSTOM' e 'PRO' ainda nao existir.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'partner_program_plans_code_enum' AND e.enumlabel = 'CUSTOM'
  )
  AND NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'partner_program_plans_code_enum' AND e.enumlabel = 'PRO'
  ) THEN
    ALTER TYPE "partner_program_plans_code_enum" RENAME VALUE 'CUSTOM' TO 'PRO';
  END IF;
END
$$;

-- 2. Salvaguarda: se por algum motivo 'PRO' continuar ausente, adiciona-o.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'partner_program_plans_code_enum' AND e.enumlabel = 'PRO'
  ) THEN
    ALTER TYPE "partner_program_plans_code_enum" ADD VALUE 'PRO';
  END IF;
END
$$;
