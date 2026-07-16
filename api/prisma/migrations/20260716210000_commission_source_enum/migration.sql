-- Converte commissions.source de texto livre para enum tipado (commissions_source_enum).

-- 1. Cria o tipo enum (idempotente).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commissions_source_enum') THEN
    CREATE TYPE "commissions_source_enum" AS ENUM ('services', 'partner_program');
  END IF;
END
$$;

-- 2. Normaliza eventuais valores fora do dominio para 'services'.
UPDATE "commissions"
SET "source" = 'services'
WHERE "source" IS NULL OR "source" NOT IN ('services', 'partner_program');

-- 3. Remove o default textual antes de trocar o tipo da coluna.
ALTER TABLE "commissions" ALTER COLUMN "source" DROP DEFAULT;

-- 4. Converte a coluna para o enum.
ALTER TABLE "commissions"
  ALTER COLUMN "source" TYPE "commissions_source_enum"
  USING ("source"::"commissions_source_enum");

-- 5. Restaura o default, agora tipado.
ALTER TABLE "commissions" ALTER COLUMN "source" SET DEFAULT 'services';
