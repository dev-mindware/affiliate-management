import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  AffiliateStatus,
  BillingPeriod,
  CertificationStatus,
  CommissionStatus,
  PartnerLevel,
  PartnerPaymentSource,
  PartnerPlanCode,
  PartnerSubscriptionStatus,
  PartnerType,
} from "@prisma/client";
import { toBillingPeriod, toPaymentSource, toSubscriptionStatus } from "../common/enum-mappers";
import { dateRange, normalizePagination, orderBy, paginated } from "../common/filters/pagination";
import { affiliateDto, commissionDto, planDto, subscriptionDto } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService, WITHDRAWAL_MINIMUM } from "../wallet/wallet.service";
import { SubscriptionFilterDto } from "./dto/subscription-filter.dto";
import { RankingFilterDto } from "./dto/ranking-filter.dto";
import { NotificationsService } from "../notifications/notifications.service";

const VALIDATION_DAYS = 15;
const CUSTOM_MINIMUM = 14899.22;

@Injectable()
export class PartnerProgramService {
  constructor(
    private prisma: PrismaService,
    private wallet: WalletService,
    private notifications: NotificationsService,
  ) {}

  async ensureDefaultPlans() {
    const defaults = [
      { code: PartnerPlanCode.BASE, name: "BASE", description: "Plano BASE do Mindgest Partners Program", price: 5445.22, firstMonthlyPercent: 20, recurringMonthlyPercent: 15, annualFirstPercent: 20, certifiedOnly: false },
      { code: PartnerPlanCode.SMART, name: "SMART", description: "Plano SMART do Mindgest Partners Program", price: 11998.22, firstMonthlyPercent: 25, recurringMonthlyPercent: 20, annualFirstPercent: 25, certifiedOnly: false },
      { code: PartnerPlanCode.CUSTOM, name: "Plano Personalizavel", description: "Exclusivo para Parceiros Comerciais Certificados Mindgest", price: 0, firstMonthlyPercent: 0, recurringMonthlyPercent: 0, annualFirstPercent: 0, minimumCustomPrice: CUSTOM_MINIMUM, mindwareMinimumNet: CUSTOM_MINIMUM, certifiedOnly: true },
    ];
    for (const item of defaults) {
      await this.prisma.partnerProgramPlan.upsert({
        where: { code: item.code },
        update: item,
        create: item,
      });
    }
  }

  async plans(activeOnly = false) {
    await this.ensureDefaultPlans();
    return (await this.prisma.partnerProgramPlan.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { id: "asc" },
    })).map(planDto);
  }

  async createPlan(body: any) {
    return planDto(await this.prisma.partnerProgramPlan.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        price: Number(body.price || 0),
        firstMonthlyPercent: Number(body.first_monthly_percent || 0),
        recurringMonthlyPercent: Number(body.recurring_monthly_percent || 0),
        annualFirstPercent: Number(body.annual_first_percent || 0),
        minimumCustomPrice: body.minimum_custom_price,
        mindwareMinimumNet: body.mindware_minimum_net,
        certifiedOnly: body.certified_only ?? false,
        active: body.active ?? true,
      },
    }));
  }

  async activeClients(affiliateId: string) {
    const rows = await this.prisma.partnerSubscription.groupBy({
      by: ["clientIdentifier"],
      where: { affiliateId, status: PartnerSubscriptionStatus.ACTIVE },
    });
    return rows.length;
  }

  resolveLevel(activeClients: number) {
    if (activeClients >= 100) return { level: PartnerLevel.ELITE, next: null, missing: 0, bonus: 10 };
    if (activeClients >= 40) return { level: PartnerLevel.GOLD, next: PartnerLevel.ELITE, missing: 100 - activeClients, bonus: 7.5 };
    if (activeClients >= 15) return { level: PartnerLevel.SILVER, next: PartnerLevel.GOLD, missing: 40 - activeClients, bonus: 5 };
    return { level: PartnerLevel.NONE, next: PartnerLevel.SILVER, missing: 15 - activeClients, bonus: 0 };
  }

  async refreshAffiliate(affiliate: any) {
    const activeClients = await this.activeClients(affiliate.id);
    const { level } = this.resolveLevel(activeClients);
    const certificationStatus = activeClients >= 15 && affiliate.certificationStatus === CertificationStatus.NOT_ELIGIBLE
      ? CertificationStatus.ELIGIBLE
      : affiliate.certificationStatus;
    return this.prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { partnerLevel: level, certificationStatus },
    });
  }

  isCertified(affiliate: any) {
    return affiliate.partnerType === PartnerType.CERTIFIED_COMMERCIAL && affiliate.certificationStatus === CertificationStatus.APPROVED;
  }

  calculate(plan: any, affiliate: any, amount: number, period: BillingPeriod) {
    if (plan.code === PartnerPlanCode.CUSTOM) {
      const minimum = Number(plan.mindwareMinimumNet || CUSTOM_MINIMUM);
      if (!this.isCertified(affiliate)) throw new BadRequestException("Plano personalizavel permitido apenas para parceiros certificados");
      if (amount < minimum) throw new BadRequestException("Valor pago abaixo do minimo obrigatorio");
      return Number((amount - minimum).toFixed(2));
    }
    let percent = 0;
    if (period === BillingPeriod.MONTHLY_FIRST) percent = Number(plan.firstMonthlyPercent);
    if (period === BillingPeriod.MONTHLY_RECURRING) percent = Number(plan.recurringMonthlyPercent) + this.resolveLevel(Number(affiliate.activeClients || 0)).bonus;
    if (period === BillingPeriod.ANNUAL_FIRST) percent = Number(plan.annualFirstPercent);
    return Number(((amount * percent) / 100).toFixed(2));
  }

  async registerPayment(data: any, source: PartnerPaymentSource) {
    await this.ensureDefaultPlans();
    const duplicate = await this.prisma.partnerSubscription.findUnique({ where: { externalPaymentId: data.external_payment_id } });
    if (duplicate) {
      const commission = await this.prisma.commission.findFirst({ where: { partnerSubscriptionId: duplicate.id } });
      return { subscription: duplicate, commission, duplicated: true };
    }
    const affiliateRecord = await this.prisma.affiliate.findUnique({ where: { codigoAfiliado: data.affiliate_code } });
    if (!affiliateRecord) throw new NotFoundException("Afiliado nao encontrado");
    const activeClients = await this.activeClients(affiliateRecord.id);
    const affiliate: any = { ...affiliateRecord, activeClients };
    const plan = await this.prisma.partnerProgramPlan.findFirst({ where: { code: data.plan_code, active: true } });
    if (!plan) throw new NotFoundException("Plano Mindgest nao encontrado");
    const period = toBillingPeriod(data.billing_period);
    if (!period) throw new BadRequestException("Periodicidade invalida");
    const amount = Number(data.amount_paid);
    const paidAt = new Date(data.paid_at);
    const commissionAmount = this.calculate(plan, affiliate, amount, period);
    const availableAt = new Date(paidAt);
    availableAt.setDate(availableAt.getDate() + VALIDATION_DAYS);
    const subscription = await this.prisma.partnerSubscription.create({
      data: {
        affiliateId: affiliate.id,
        planId: plan.id,
        externalPaymentId: data.external_payment_id,
        clientName: data.client_name,
        clientIdentifier: data.client_identifier,
        amountPaid: amount,
        paidAt,
        billingPeriod: period,
        source,
        status: PartnerSubscriptionStatus.ACTIVE,
        notes: data.notes,
      },
    });
    const commission = await this.prisma.commission.create({
      data: {
        affiliateId: affiliate.id,
        partnerSubscriptionId: subscription.id,
        clientNome: data.client_name,
        clientTelefone: data.client_identifier,
        valorServico: amount,
        valorComissao: commissionAmount,
        status: CommissionStatus.PENDING,
        notas: data.notes,
        source: "partner_program",
        availableAt,
        validationDays: VALIDATION_DAYS,
      },
    });
    await this.wallet.addPending(affiliate.id, commissionAmount);
    await this.refreshAffiliate(affiliate);

    if (affiliateRecord?.userId) {
      await this.notifications.create({
        userId: affiliateRecord.userId,
        title: "Nova Assinatura de Referido!",
        message: `Seu cliente referido ${data.client_name} assinou o plano ${data.plan_code} (${data.billing_period.toUpperCase()})! Comissão pendente de Kz ${commissionAmount} gerada.`,
        type: "system",
        entity: "PartnerSubscription",
        entityId: subscription.id,
      });
    }

    return { subscription, commission, duplicated: false };
  }

  async listSubscriptions(filter: SubscriptionFilterDto) {
    const p = normalizePagination(filter);
    const where: any = { ...dateRange(filter) };
    if (filter.status) where.status = toSubscriptionStatus(filter.status);
    if (filter.affiliateId) where.affiliateId = filter.affiliateId;
    if (filter.planCode) where.plan = { code: filter.planCode };
    if (filter.billingPeriod) where.billingPeriod = toBillingPeriod(filter.billingPeriod);
    if (filter.source) where.source = toPaymentSource(filter.source);
    if (filter.search) {
      where.OR = [
        { clientName: { contains: filter.search, mode: "insensitive" } },
        { clientIdentifier: { contains: filter.search, mode: "insensitive" } },
        { externalPaymentId: { contains: filter.search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.partnerSubscription.findMany({
        where,
        include: { plan: true, affiliate: true },
        skip: p.skip,
        take: p.limit,
        orderBy: orderBy(filter, { created_at: "createdAt", createdAt: "createdAt", paid_at: "paidAt", amount_paid: "amountPaid" }, "created_at"),
      }),
      this.prisma.partnerSubscription.count({ where }),
    ]);
    return paginated(items.map(subscriptionDto), total, p.page, p.limit);
  }

  async updateSubscriptionStatus(id: string, statusValue: string, notes?: string) {
    const status = toSubscriptionStatus(statusValue);
    if (!status) throw new BadRequestException("Estado invalido");
    const subscription = await this.prisma.partnerSubscription.update({ where: { id }, data: { status, notes } });
    const blockingStatuses: PartnerSubscriptionStatus[] = [PartnerSubscriptionStatus.CANCELLED, PartnerSubscriptionStatus.PAYMENT_FAILED, PartnerSubscriptionStatus.SUSPENDED, PartnerSubscriptionStatus.REFUNDED, PartnerSubscriptionStatus.CHARGEBACK];
    if (blockingStatuses.includes(status)) {
      const commissions = await this.prisma.commission.findMany({ where: { partnerSubscriptionId: id, status: CommissionStatus.PENDING } });
      for (const commission of commissions) {
        await this.prisma.commission.update({ where: { id: commission.id }, data: { status: CommissionStatus.REJECTED, notas: notes || "Comissao invalidada pela subscricao" } });
        await this.wallet.rejectPending(commission.affiliateId, Number(commission.valorComissao || 0));
      }
    }
    const affiliate = await this.prisma.affiliate.findUnique({ where: { id: subscription.affiliateId } });
    if (affiliate) await this.refreshAffiliate(affiliate);
    return subscriptionDto(subscription);
  }

  async releaseValidated() {
    const commissions = await this.prisma.commission.findMany({
      where: { source: "partner_program", status: CommissionStatus.PENDING, availableAt: { lte: new Date() } },
    });
    for (const commission of commissions) {
      await this.prisma.commission.update({ where: { id: commission.id }, data: { status: CommissionStatus.APPROVED, approvedAt: new Date() } });
      await this.wallet.movePendingToAvailable(commission.affiliateId, Number(commission.valorComissao || 0));
    }
    return commissions.length;
  }

  async summary(affiliate: any) {
    const refreshed = await this.refreshAffiliate(affiliate);
    const activeClients = await this.activeClients(refreshed.id);
    const level = this.resolveLevel(activeClients);
    return {
      active_clients: activeClients,
      partner_type: String(refreshed.partnerType).toLowerCase(),
      certification_status: String(refreshed.certificationStatus).toLowerCase(),
      partner_level: String(level.level).toLowerCase(),
      next_level: level.next ? String(level.next).toLowerCase() : null,
      clients_to_next_level: level.missing,
      recurring_bonus_percent: level.bonus,
      benefits: level.level === PartnerLevel.NONE ? [] : [`Badge ${String(level.level).toLowerCase()}`, "Materiais promocionais", "Prioridade de suporte"],
      certified_benefits: this.isCertified(refreshed) ? ["Plano personalizavel", "Certificacao oficial Mindgest", "Materiais comerciais premium"] : [],
      withdrawal_minimum: WITHDRAWAL_MINIMUM,
    };
  }

  async approveCertification(affiliateId: string, adminId: string, notes?: string) {
    const affiliate = await this.prisma.affiliate.findUnique({ where: { id: affiliateId } });
    if (!affiliate) throw new NotFoundException("Afiliado nao encontrado");
    const refreshed = await this.refreshAffiliate(affiliate);
    if (refreshed.certificationStatus !== CertificationStatus.ELIGIBLE && refreshed.certificationStatus !== CertificationStatus.APPROVED) {
      throw new BadRequestException("Afiliado ainda nao elegivel para certificacao");
    }
    const approved = await this.prisma.affiliate.update({
      where: { id: affiliateId },
      data: { certificationStatus: CertificationStatus.APPROVED, partnerType: PartnerType.CERTIFIED_COMMERCIAL },
    });
    await this.prisma.partnerCertification.upsert({
      where: { affiliateId },
      update: { approvedAt: new Date(), approvedBy: adminId, notes },
      create: { affiliateId, approvedAt: new Date(), approvedBy: adminId, notes },
    });

    if (refreshed.userId) {
      await this.notifications.create({
        userId: refreshed.userId,
        title: "Certificação Aprovada!",
        message: "Parabéns! Sua certificação comercial foi aprovada. Você agora é um Parceiro Comercial Certificado Mindgest e pode receber benefícios premium!",
        type: "system",
        entity: "PartnerCertification",
        entityId: approved.id,
      });
    }

    return affiliateDto(approved);
  }

  async rejectCertification(affiliateId: string, notes?: string) {
    const rejected = await this.prisma.affiliate.update({
      where: { id: affiliateId },
      data: { certificationStatus: CertificationStatus.REJECTED, partnerType: PartnerType.AFFILIATE },
    });
    await this.prisma.partnerCertification.upsert({
      where: { affiliateId },
      update: { rejectedAt: new Date(), notes },
      create: { affiliateId, rejectedAt: new Date(), notes },
    });

    const affiliate = await this.prisma.affiliate.findUnique({ where: { id: affiliateId } });
    if (affiliate?.userId) {
      await this.notifications.create({
        userId: affiliate.userId,
        title: "Certificação Recusada",
        message: `Seu pedido de certificação comercial foi recusado pelo administrador. Observações: ${notes || "Nenhuma observação."}`,
        type: "system",
        entity: "PartnerCertification",
        entityId: rejected.id,
      });
    }

    return affiliateDto(rejected);
  }

  async ranking(filter: RankingFilterDto) {
    const limit = Math.min(100, Math.max(1, Number(filter.limit || 10)));
    const affiliates = await this.prisma.affiliate.findMany({
      where: { status: AffiliateStatus.ACTIVE },
      include: { subscriptions: { where: { status: PartnerSubscriptionStatus.ACTIVE } } },
    });
    return affiliates
      .map((affiliate) => {
        const activeClients = new Set(affiliate.subscriptions.map((sub) => sub.clientIdentifier)).size;
        return {
          name: affiliate.nomeCompleto,
          total_earned: Number(affiliate.totalEarned || 0),
          conversions: activeClients,
          active_clients: activeClients,
          partner_level: String(affiliate.partnerLevel).toLowerCase(),
        };
      })
      .sort((a, b) => b.active_clients - a.active_clients || b.total_earned - a.total_earned)
      .slice(0, limit);
  }

  async rankInfo(affiliateId: string) {
    const ranking = await this.ranking({ limit: 100 });
    const affiliate = await this.prisma.affiliate.findUnique({ where: { id: affiliateId } });
    const index = ranking.findIndex((item) => item.name === affiliate?.nomeCompleto);
    return { rank: index >= 0 ? index + 1 : null, total_earned: Number(affiliate?.totalEarned || 0), active_clients: index >= 0 ? ranking[index].active_clients : 0, distance_to_next: index > 0 ? Math.max(0, ranking[index - 1].active_clients - ranking[index].active_clients) : 0 };
  }
}
