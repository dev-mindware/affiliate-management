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
- `PORT=8000`
- `API_PREFIX=/api`

## Documentacao

- Scalar Docs: `http://localhost:8000/api/reference`
- Alias antigo: `http://localhost:8000/api/docs`
- OpenAPI JSON: `http://localhost:8000/api/openapi.json`
- Swagger UI: `http://localhost:8000/api/swagger`
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
