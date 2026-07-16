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

  // Clean up duplicates of services and re-route references
  const allServices = await prisma.service.findMany({ orderBy: { id: "asc" } });
  const uniqueNames = new Set<string>();
  const duplicates: { id: number; nome: string }[] = [];
  const nameToId = new Map<string, number>();

  for (const s of allServices) {
    if (uniqueNames.has(s.nome)) {
      duplicates.push({ id: s.id, nome: s.nome });
    } else {
      uniqueNames.add(s.nome);
      nameToId.set(s.nome, s.id);
    }
  }

  for (const dup of duplicates) {
    const mainId = nameToId.get(dup.nome)!;
    await prisma.commission.updateMany({
      where: { serviceId: dup.id },
      data: { serviceId: mainId },
    });
    await prisma.leadNotification.updateMany({
      where: { serviceId: dup.id },
      data: { serviceId: mainId },
    });
    await prisma.service.delete({ where: { id: dup.id } });
  }

  // Create default services if they do not exist
  const servicesData = [
    { nome: "Website Institucional", descricao: "Criacao de website profissional", preco: 180000, comissao: 25000, ativo: true },
    { nome: "Loja Online", descricao: "E-commerce completo", preco: 350000, comissao: 45000, ativo: true },
    { nome: "Gestao de Redes Sociais", descricao: "Pacote mensal de social media", preco: 120000, comissao: 15000, ativo: true },
  ];

  for (const item of servicesData) {
    const existing = await prisma.service.findFirst({ where: { nome: item.nome } });
    if (!existing) {
      await prisma.service.create({ data: item });
    }
  }

  const plans = [
    { code: PartnerPlanCode.BASE, name: "BASE", description: "Plano BASE do Mindgest Partners Program", price: 5445.22, firstMonthlyPercent: 20, recurringMonthlyPercent: 15, annualFirstPercent: 20, certifiedOnly: false },
    { code: PartnerPlanCode.SMART, name: "SMART", description: "Plano SMART do Mindgest Partners Program", price: 11998.22, firstMonthlyPercent: 20, recurringMonthlyPercent: 15, annualFirstPercent: 20, certifiedOnly: false },
    { code: PartnerPlanCode.PRO, name: "PRO", description: "Plano PRO do Mindgest Partners Program", price: 14899.22, firstMonthlyPercent: 20, recurringMonthlyPercent: 15, annualFirstPercent: 20, minimumCustomPrice: 14899.22, mindwareMinimumNet: 14899.22, certifiedOnly: true },
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
