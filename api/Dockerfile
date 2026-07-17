# Etapa 1: Build
FROM node:22-alpine AS builder

# Instala pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copia arquivos de definição de dependências
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY .pnpmrc ./

# Instala todas as dependências e gera o Prisma Client
RUN PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm prisma generate

# Copia o código fonte e gera o build do NestJS
COPY tsconfig*.json ./
COPY src ./src/
RUN pnpm build

# Limpa dependências de desenvolvimento preservando o Prisma Client
RUN pnpm prune --prod

# Etapa 2: Produção
FROM node:22-alpine AS production

ENV NODE_ENV=production
ENV PRISMA_CLIENT_ENGINE_TYPE=client

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia apenas o necessário do estágio de build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Copia documentações e arquivos de configurações estáticas
COPY scalar.config.json ./
COPY docs ./docs

# Limpa o store do pnpm para reduzir o tamanho da imagem final
RUN pnpm store prune

# Comando para iniciar a aplicação (roda migrations, seeds e inicia a API)
CMD ["pnpm", "run", "start:prod"]
