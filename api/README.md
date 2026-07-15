# Mindgest Partners API

API NestJS + TypeScript para gestao do Mindgest Partners Program.

## Stack

- NestJS 11
- TypeScript
- PostgreSQL com Prisma
- JWT auth
- OpenAPI com `@nestjs/swagger`
- Scalar Docs em `/api/reference`

## Setup

```bash
npm install
docker compose up -d
npm run prisma:generate
npm run seed
npm run start:dev
```

Por padrao a API usa:

- `POSTGRES_HOST=localhost`
- `POSTGRES_PORT=5435`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`
- `POSTGRES_DB=mindware_affiliates`
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5435/mindware_affiliates?schema=public`
- `PORT=3333`
- `API_PREFIX=/api`

## Documentacao

- Scalar Docs: `http://localhost:3333/api/reference`
- Alias antigo: `http://localhost:3333/api/docs`
- OpenAPI JSON: `http://localhost:3333/api/openapi.json`
- Swagger UI: `http://localhost:3333/api/swagger`
- Config Scalar: `scalar.config.json`

## Scripts

```bash
npm run start:dev
npm run build
npm run type-check
npm run prisma:validate
npm run prisma:generate
npm run migrate:dev
npm run seed
```

## Observacao de migracao

A implementacao activa da API vive em `src/`. A base Python/FastAPI anterior foi removida do codigo versionado; os comandos de execucao usam NestJS e Prisma.

## Regras de Negócio e Segurança

### 1. Níveis e Comissões Recorrentes
* **Base (None)**: 15% de comissão recorrente (0% bónus, < 15 clientes ativos)
* **Prata (Silver)**: 20% de comissão recorrente (+5% bónus, 15-39 clientes ativos)
* **Ouro (Gold)**: 27% de comissão recorrente (+12% bónus, 40-99 clientes ativos)
* **Platina (Platinum)**: 33% de comissão recorrente (+18% bónus, 100-249 clientes ativos)
* **Elite**: 38% de comissão recorrente (+23% bónus, >= 250 clientes ativos)

### 2. Levantamentos (Carteira)
* O valor mínimo de levantamento permitido para afiliados é de **8.000 Kz**.

### 3. Integração de Webhooks (`/webhook/*`)
Os webhooks de entrada exigem segurança reforçada:
* **Autenticação:** Envio do token secreto no header `x-webhook-secret`. Comparado de forma segura no servidor contra ataques de tempo (`crypto.timingSafeEqual`).
* **Proteção contra Replay:** Requer o cabeçalho `x-webhook-timestamp` contendo o timestamp Unix em segundos. Rejeita automaticamente pedidos com desvio superior a 5 minutos (300 segundos).
* **Idempotência:**
  - Conversão (`/webhook/conversion`): Opcionalmente aceita `external_event_id` para rejeitar processamentos duplicados.
  - Pagamentos (`/webhook/subscription-payment`): Exige `external_payment_id` e rejeita duplicados.
* **Logs de Auditoria:** Todas as transações são registadas com IP de origem e código de resultado na tabela `webhook_audit_logs`.

