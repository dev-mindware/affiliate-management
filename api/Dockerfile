# Stage 1: Build
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Build application
RUN pnpm build

# Stage 2: Production Dependencies
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install ONLY production dependencies.
# Some packages have build scripts blocked by pnpm's ignored-builds security.
# Try install, if it fails due to ignored builds approve them and retry.
RUN pnpm install --prod --frozen-lockfile || (pnpm approve-builds --all && pnpm install --prod --frozen-lockfile)

# Copy prisma CLI from builder to ensure we can generate the client
COPY --from=builder /app/node_modules/.bin/prisma /app/node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma /app/node_modules/prisma
RUN npx prisma generate

# Stage 3: Runner
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built application and production node_modules
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.js ./prisma.config.js
COPY --from=builder /app/start.sh ./start.sh
COPY --from=builder /app/scalar.config.json ./scalar.config.json
COPY --from=builder /app/docs ./docs

# Ensure Prisma CLI is available
COPY --from=builder /app/node_modules/.bin/prisma /usr/local/bin/prisma
COPY --from=builder /app/node_modules/prisma /app/node_modules/prisma

# Security: Set permissions
USER root
RUN chmod +x /app/start.sh
USER node

# Expose port
EXPOSE 3333

# Start command
CMD ["./start.sh"]
