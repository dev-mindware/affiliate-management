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

  const email = (process.env.FIRST_ADMIN_EMAIL || "admin@mindware.ao").trim().toLowerCase();
  const password = process.env.FIRST_ADMIN_PASSWORD || "admin-password";
  const passwordHash = await bcrypt.hash(password, 10);
  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // O administrador gere a plataforma e não deve constar como afiliado parceiro.
  // Caso exista um registo indevido de afiliado para o admin, removemo-lo.
  const adminAffiliate = await prisma.affiliate.findFirst({
    where: { OR: [{ userId: adminUser.id }, { email: adminUser.email }] },
  });
  if (adminAffiliate) {
    await prisma.affiliate.delete({ where: { id: adminAffiliate.id } });
  }

  // Helper para normalização de nomes (insensível a maiúsculas, acentos e espaços)
  const normalize = (text: string) =>
    text
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");

  // 1. Limpeza rigorosa de quaisquer serviços duplicados preexistentes
  const allServices = await prisma.service.findMany({ orderBy: { id: "asc" } });
  const seenServiceNames = new Map<string, number>();
  const duplicateServices: { id: number; canonicalId: number; nome: string }[] = [];

  for (const s of allServices) {
    const key = normalize(s.nome);
    if (seenServiceNames.has(key)) {
      duplicateServices.push({ id: s.id, canonicalId: seenServiceNames.get(key)!, nome: s.nome });
    } else {
      seenServiceNames.set(key, s.id);
    }
  }

  for (const dup of duplicateServices) {
    await prisma.commission.updateMany({
      where: { serviceId: dup.id },
      data: { serviceId: dup.canonicalId },
    });
    await prisma.leadNotification.updateMany({
      where: { serviceId: dup.id },
      data: { serviceId: dup.canonicalId },
    });
    await prisma.service.delete({ where: { id: dup.id } });
  }

  // 2. Criação estritamente idempotente dos serviços padrão
  const defaultServices = [
    {
      nome: "Website Institucional",
      descricao: "Criacao de website profissional",
      preco: 180000,
      comissao: 25000,
      ativo: true,
    },
    {
      nome: "Loja Online",
      descricao: "E-commerce completo",
      preco: 350000,
      comissao: 45000,
      ativo: true,
    },
    {
      nome: "Gestao de Redes Sociais",
      descricao: "Pacote mensal de social media",
      preco: 120000,
      comissao: 15000,
      ativo: true,
    },
  ];

  // Recarregar os serviços vigentes após remoção de duplicados
  const currentServices = await prisma.service.findMany();
  const currentServiceMap = new Map(currentServices.map((s) => [normalize(s.nome), s]));

  for (const item of defaultServices) {
    const key = normalize(item.nome);
    const existing = currentServiceMap.get(key);
    if (!existing) {
      const created = await prisma.service.create({ data: item });
      currentServiceMap.set(key, created);
    }
  }

  // 3. Planos do Programa de Parceiros (idempotência total garantida pelo enum/código único)
  const defaultPlans = [
    {
      code: PartnerPlanCode.BASE,
      name: "BASE",
      description: "Plano BASE do Mindgest Partners Program",
      price: 5445.22,
      firstMonthlyPercent: 20,
      recurringMonthlyPercent: 15,
      annualFirstPercent: 20,
      annualRecurringPercent: 15,
      certifiedOnly: false,
      active: true,
    },
    {
      code: PartnerPlanCode.SMART,
      name: "SMART",
      description: "Plano SMART do Mindgest Partners Program",
      price: 11998.22,
      firstMonthlyPercent: 20,
      recurringMonthlyPercent: 15,
      annualFirstPercent: 20,
      annualRecurringPercent: 15,
      certifiedOnly: false,
      active: true,
    },
    {
      code: PartnerPlanCode.PRO,
      name: "PRO",
      description: "Plano PRO do Mindgest Partners Program",
      price: 14899.22,
      firstMonthlyPercent: 20,
      recurringMonthlyPercent: 15,
      annualFirstPercent: 20,
      annualRecurringPercent: 15,
      minimumCustomPrice: 14899.22,
      mindwareMinimumNet: 14899.22,
      certifiedOnly: true,
      active: true,
    },
  ];

  for (const plan of defaultPlans) {
    await prisma.partnerProgramPlan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        description: plan.description,
        firstMonthlyPercent: plan.firstMonthlyPercent,
        recurringMonthlyPercent: plan.recurringMonthlyPercent,
        annualFirstPercent: plan.annualFirstPercent,
        annualRecurringPercent: plan.annualRecurringPercent,
        minimumCustomPrice: plan.minimumCustomPrice,
        mindwareMinimumNet: plan.mindwareMinimumNet,
        certifiedOnly: plan.certifiedOnly,
        active: plan.active,
      },
      create: plan,
    });
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
