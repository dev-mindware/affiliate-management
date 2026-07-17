const { defineConfig } = require('@prisma/config');
require('dotenv').config();

// Reconstruímos a URL caso a interpolação do Docker Compose falhe
const dbUser = process.env.DB_USER || 'postgres';
const dbPass = process.env.DB_PASSWORD || 'postgres_password_prod';
const dbName = process.env.DB_NAME || 'mindware_affiliates';
const dbHost = process.env.NODE_ENV === 'production' ? 'postgres' : 'localhost';

const DATABASE_URL = process.env.DATABASE_URL || `postgresql://${dbUser}:${dbPass}@${dbHost}:5432/${dbName}?schema=public`;

module.exports = defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: process.env.NODE_ENV === 'production' 
      ? 'node dist/prisma/seed.js' 
      : 'npx ts-node prisma/seed.ts',
  },
  datasource: {
    url: DATABASE_URL,
  },
});
