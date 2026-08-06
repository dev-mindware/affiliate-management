import { Injectable } from "@nestjs/common";
import { LeadStatus } from "@prisma/client";
import { CommissionsService } from "../commissions/commissions.service";
import { toLeadStatus } from "../common/enum-mappers";
import { dateRange, normalizePagination, orderBy, paginated } from "../common/filters/pagination";
import { leadDto } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { LeadFilterDto } from "./dto/lead-filter.dto";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private commissions: CommissionsService,
    private notifications: NotificationsService,
  ) {}

  async list(filter: LeadFilterDto) {
    const p = normalizePagination(filter);
    const where: any = { ...dateRange(filter) };
    if (filter.status) where.status = toLeadStatus(filter.status);
    if (filter.affiliateId) where.affiliateId = filter.affiliateId;
    if (filter.serviceId) where.serviceId = Number(filter.serviceId);
    if (filter.search) {
      where.OR = [
        { clientNome: { contains: filter.search, mode: "insensitive" } },
        { clientTelefone: { contains: filter.search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.leadNotification.findMany({
        where,
        include: { affiliate: true },
        skip: p.skip,
        take: p.limit,
        orderBy: orderBy(filter, { created_at: "createdAt", createdAt: "createdAt", client_nome: "clientNome" }, "created_at"),
      }),
      this.prisma.leadNotification.count({ where }),
    ]);
    return paginated(items.map(leadDto), total, p.page, p.limit);
  }

  async createByAffiliate(affiliateId: string, body: any) {
    const lead = await this.prisma.leadNotification.create({
      data: {
        affiliateId,
        serviceId: Number(body.service_id),
        clientNome: body.client_nome,
        clientTelefone: body.client_telefone,
        notas: body.notas,
      },
      include: { affiliate: true },
    });

    if (lead.affiliate?.userId) {
      await this.notifications.create({
        userId: lead.affiliate.userId,
        title: "Novo Lead Cadastrado",
        message: `Seu lead para o cliente ${lead.clientNome} foi registrado com sucesso.`,
        type: "lead",
        entity: "LeadNotification",
        entityId: lead.id,
      });
    }

    return leadDto(lead);
  }

  async updateStatus(id: string, statusValue: string) {
    const status = toLeadStatus(statusValue) || LeadStatus.NEW;
    const lead = await this.prisma.leadNotification.update({ where: { id }, data: { status }, include: { affiliate: true } });
    
    if (lead.affiliate?.userId) {
      await this.notifications.create({
        userId: lead.affiliate.userId,
        title: `Lead Atualizado: ${lead.clientNome}`,
        message: `O status do seu lead foi atualizado para ${statusValue.toUpperCase()}.`,
        type: "lead",
        entity: "LeadNotification",
        entityId: lead.id,
      });
    }

    if (status === LeadStatus.CONTACTED || status === LeadStatus.CONVERTED) {
      const exists = await this.prisma.commission.findFirst({ where: { leadNotificationId: lead.id } });
      if (!exists) {
        await this.commissions.create({
          affiliate_id: lead.affiliateId,
          service_id: lead.serviceId,
          lead_notification_id: lead.id,
          client_nome: lead.clientNome,
          client_telefone: lead.clientTelefone,
          notas: lead.notas,
        });
      }
      if (status === LeadStatus.CONVERTED) {
        const commission = await this.prisma.commission.findFirst({ where: { leadNotificationId: lead.id } });
        if (commission) await this.commissions.approve(commission.id);
      }
    }
    return leadDto(lead);
  }
}
