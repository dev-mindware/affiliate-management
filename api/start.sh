#!/bin/sh
set -e

# 1. Aplicar migrations pendentes
echo "🚀 Aplicando Migrations..."
npx prisma migrate deploy

# 2. Executar Seeds
echo "🌱 Executando Seeds..."
./node_modules/.bin/ts-node prisma/seed.ts

# 3. Iniciar a Aplicação
echo "🏁 Iniciando a API..."
node dist/main.js
