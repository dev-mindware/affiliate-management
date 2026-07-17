-- O valor 'platinum' existe no enum PartnerLevel do schema.prisma mas nao foi
-- incluido no enum criado pela migracao init (que tem apenas none/silver/gold/
-- elite). Sem este valor, escrever partner_level = 'platinum' falha em
-- producao. ADD VALUE IF NOT EXISTS torna a operacao idempotente.
ALTER TYPE "affiliates_partner_level_enum" ADD VALUE IF NOT EXISTS 'platinum' BEFORE 'elite';
