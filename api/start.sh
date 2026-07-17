#!/bin/sh
set -e

# 1. Aplicar migrations pendentes
echo "🚀 Aplicando Migrations..."
npx prisma migrate deploy

# 2. Executar Seeds
echo "🌱 Executando Seeds..."
node dist/prisma/seed.js

# 3. Iniciar a Aplicação
echo "🏁 Iniciando a API..."
node dist/main.js
