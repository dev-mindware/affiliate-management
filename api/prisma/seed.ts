import "dotenv/config";
import { PrismaClient, UserRole, PartnerPlanCode } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcryptjs";

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const host = process.env.POSTGRES_SERVER || process.env.POSTGRES_HOST || "localhost";
  const port = process.env.POSTGRES_PORT || "5435";
  const user = process.env.POSTGRES_USER || "postgres";
  const password = process.env.POSTGRES_PASSWORD || "postgres";
  const db = process.env.POSTGRES_DB || "mindware_affiliates";
  return `postgresql://${user}:${password}@${host}:${port}/${db}?schema=public`;
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl() });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const email = process.env.FIRST_ADMIN_EMAIL || "admin@mindware.ao";
  const password = process.env.FIRST_ADMIN_PASSWORD || "admin-password";
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  await prisma.service.createMany({
    data: [
      { nome: "Website Institucional", descricao: "Criacao de website profissional", preco: 180000, comissao: 25000, ativo: true },
      { nome: "Loja Online", descricao: "E-commerce completo", preco: 350000, comissao: 45000, ativo: true },
      { nome: "Gestao de Redes Sociais", descricao: "Pacote mensal de social media", preco: 120000, comissao: 15000, ativo: true },
    ],
    skipDuplicates: true,
  });

  const plans = [
    { code: PartnerPlanCode.BASE, name: "BASE", description: "Plano BASE do Mindgest Partners Program", price: 5445.22, firstMonthlyPercent: 20, recurringMonthlyPercent: 15, annualFirstPercent: 20, certifiedOnly: false },
    { code: PartnerPlanCode.SMART, name: "SMART", description: "Plano SMART do Mindgest Partners Program", price: 11998.22, firstMonthlyPercent: 25, recurringMonthlyPercent: 20, annualFirstPercent: 25, certifiedOnly: false },
    { code: PartnerPlanCode.CUSTOM, name: "Plano Personalizavel", description: "Exclusivo para Parceiros Comerciais Certificados Mindgest", price: 0, firstMonthlyPercent: 0, recurringMonthlyPercent: 0, annualFirstPercent: 0, minimumCustomPrice: 14899.22, mindwareMinimumNet: 14899.22, certifiedOnly: true },
  ];
  for (const plan of plans) {
    await prisma.partnerProgramPlan.upsert({ where: { code: plan.code }, update: plan, create: plan });
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
