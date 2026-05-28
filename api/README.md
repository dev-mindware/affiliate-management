# Mindgest Partners API

API NestJS + TypeScript para gestão do Mindgest Partners Program.

## Stack

- NestJS 11
- TypeScript
- PostgreSQL com TypeORM
- JWT auth
- OpenAPI com `@nestjs/swagger`
- Scalar Docs em `/api/v1/docs`

## Setup

```bash
npm install
docker compose up -d
npm run seed
npm run start:dev
```

Por padrão a API usa:

- `POSTGRES_HOST=localhost`
- `POSTGRES_PORT=5435`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`
- `POSTGRES_DB=mindware_affiliates`
- `PORT=8000`
- `API_V1_STR=/api/v1`

Em desenvolvimento, `TYPEORM_SYNC` fica activo por padrão para criar/actualizar tabelas localmente. Em produção, defina explicitamente a estratégia de migração desejada e mantenha `TYPEORM_SYNC=false`.

## Documentação

- Scalar Docs: `http://localhost:8000/api/v1/docs`
- OpenAPI JSON: `http://localhost:8000/api/v1/openapi.json`
- Swagger UI: `http://localhost:8000/api/v1/swagger`
- Config Scalar: `scalar.config.json`

## Scripts

```bash
npm run start:dev
npm run build
npm run type-check
npm run seed
```

## Observação de Migração

A implementação activa da API agora vive em `src/`. A base Python/FastAPI anterior foi removida do código versionado; os comandos de execução usam NestJS.
