-- A coluna external_event_id existe no schema.prisma (Commission.externalEventId,
-- @unique) mas nunca foi criada por nenhuma migracao. Em bases criadas via
-- `prisma migrate deploy` a coluna esta ausente, o que provoca o erro Prisma
-- P2022 ("coluna nao existe") em qualquer leitura da tabela commissions.
-- IF NOT EXISTS torna a migracao segura em ambientes onde a coluna ja foi
-- adicionada por `prisma db push`.
ALTER TABLE "commissions"
  ADD COLUMN IF NOT EXISTS "external_event_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "commissions_external_event_id_key"
  ON "commissions"("external_event_id");
