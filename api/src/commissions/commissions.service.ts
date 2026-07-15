import { Injectable, NotFoundException } from "@nestjs/common";
import { CommissionStatus } from "@prisma/client";
import { dateRange, normalizePagination, orderBy, paginated } from "../common/filters/pagination";
import { commissionDto } from "../common/serializers";
import { toCommissionStatus } from "../common/enum-mappers";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { CommissionFilterDto } from "./dto/commission-filter.dto";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class CommissionsService {
  constructor(
    private prisma: PrismaService,
    private wallet: WalletService,
    private notifications: NotificationsService,
  ) {}

  async list(filter: CommissionFilterDto) {
    const p = normalizePagination(filter);
    const where: any = { ...dateRange(filter) };
    if (filter.status) where.status = toCommissionStatus(filter.status);
    if (filter.affiliateId) where.affiliateId = filter.affiliateId;
    if (filter.source) where.source = filter.source;
    if (filter.search) {
      where.OR = [
        { clientNome: { contains: filter.search, mode: "insensitive" } },
        { clientTelefone: { contains: filter.search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.commission.findMany({
        where,
        include: { affiliate: true },
        skip: p.skip,
        take: p.limit,
        orderBy: orderBy(filter, { created_at: "createdAt", createdAt: "createdAt", valor_comissao: "valorComissao" }, "created_at"),
      }),
      this.prisma.commission.count({ where }),
    ]);
    return paginated(items.map(commissionDto), total, p.page, p.limit);
  }

  async create(data: any) {
    if (data.external_event_id) {
      const duplicate = await this.prisma.commission.findUnique({
        where: { externalEventId: data.external_event_id },
      });
      if (duplicate) {
        return { ...commissionDto(duplicate), duplicated: true };
      }
    }
    const service = await this.prisma.service.findUnique({ where: { id: Number(data.service_id) } });
    if (!service) throw new NotFoundException("Servico nao encontrado");
    const commission = await this.prisma.commission.create({
      data: {
        affiliateId: data.affiliate_id,
        serviceId: service.id,
        leadNotificationId: data.lead_notification_id,
        clientNome: data.client_nome,
        clientTelefone: data.client_telefone,
        valorServico: service.preco,
        valorComissao: service.comissao,
        status: CommissionStatus.PENDING,
        notas: data.notas,
        externalEventId: data.external_event_id,
      },
    });
    await this.wallet.addPending(data.affiliate_id, Number(service.comissao || 0));

    const affiliate = await this.prisma.affiliate.findUnique({ where: { id: data.affiliate_id } });
    if (affiliate?.userId) {
      await this.notifications.create({
        userId: affiliate.userId,
        title: "Nova Comissão Gerada",
        message: `Uma comissão pendente no valor de Kz ${service.comissao} foi gerada para o cliente ${data.client_nome}.`,
        type: "commission",
        entity: "Commission",
        entityId: commission.id,
      });
    }

    return commissionDto(commission);
  }

  async approve(id: string) {
    const commission = await this.prisma.commission.findUnique({ where: { id } });
    if (!commission || commission.status !== CommissionStatus.PENDING) throw new NotFoundException("Comissao nao encontrada ou estado invalido");
    const updated = await this.prisma.commission.update({ where: { id }, data: { status: CommissionStatus.APPROVED, approvedAt: new Date() } });
    await this.wallet.movePendingToAvailable(commission.affiliateId, Number(commission.valorComissao || 0));

    const affiliate = await this.prisma.affiliate.findUnique({ where: { id: commission.affiliateId } });
    if (affiliate?.userId) {
      await this.notifications.create({
        userId: affiliate.userId,
        title: "Comissão Aprovada!",
        message: `Sua comissão no valor de Kz ${commission.valorComissao} para o cliente ${commission.clientNome} foi aprovada e está disponível para saque!`,
        type: "commission",
        entity: "Commission",
        entityId: updated.id,
      });
    }

    return commissionDto(updated);
  }

  async reject(id: string, notas?: string) {
    const commission = await this.prisma.commission.findUnique({ where: { id } });
    if (!commission || commission.status !== CommissionStatus.PENDING) throw new NotFoundException("Comissao nao encontrada ou estado invalido");
    const updated = await this.prisma.commission.update({ where: { id }, data: { status: CommissionStatus.REJECTED, notas } });
    await this.wallet.rejectPending(commission.affiliateId, Number(commission.valorComissao || 0));

    const affiliate = await this.prisma.affiliate.findUnique({ where: { id: commission.affiliateId } });
    if (affiliate?.userId) {
      await this.notifications.create({
        userId: affiliate.userId,
        title: "Comissão Rejeitada",
        message: `Sua comissão no valor de Kz ${commission.valorComissao} para o cliente ${commission.clientNome} foi rejeitada pelo administrador. Motivo: ${notas || "Nenhuma justificativa fornecida."}`,
        type: "commission",
        entity: "Commission",
        entityId: updated.id,
      });
    }

    return commissionDto(updated);
  }
}
