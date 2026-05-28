import { Injectable, NotFoundException } from "@nestjs/common";
import { WithdrawalStatus } from "@prisma/client";
import { toWithdrawalStatus } from "../common/enum-mappers";
import { dateRange, normalizePagination, orderBy, paginated } from "../common/filters/pagination";
import { withdrawalDto } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { WithdrawalFilterDto } from "./dto/withdrawal-filter.dto";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class WithdrawalsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async list(filter: WithdrawalFilterDto) {
    const p = normalizePagination(filter);
    const where: any = { ...dateRange(filter) };
    if (filter.status) where.status = toWithdrawalStatus(filter.status);
    if (filter.affiliateId) where.affiliateId = filter.affiliateId;
    const [items, total] = await Promise.all([
      this.prisma.withdrawalRequest.findMany({
        where,
        include: { affiliate: true },
        skip: p.skip,
        take: p.limit,
        orderBy: orderBy(filter, { created_at: "createdAt", createdAt: "createdAt", valor: "valor" }, "created_at"),
      }),
      this.prisma.withdrawalRequest.count({ where }),
    ]);
    return paginated(items.map(withdrawalDto), total, p.page, p.limit);
  }

  async approve(id: string) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!withdrawal) throw new NotFoundException("Levantamento nao encontrado");
    const updated = await this.prisma.withdrawalRequest.update({
      where: { id },
      data: { status: WithdrawalStatus.APPROVED, processedAt: new Date() },
    });
    await this.prisma.wallet.update({
      where: { affiliateId: withdrawal.affiliateId },
      data: { totalLevantado: { increment: withdrawal.valor } },
    });

    const affiliate = await this.prisma.affiliate.findUnique({ where: { id: withdrawal.affiliateId } });
    if (affiliate?.userId) {
      await this.notifications.create({
        userId: affiliate.userId,
        title: "Saque Aprovado!",
        message: `Seu pedido de saque no valor de Kz ${withdrawal.valor} foi processado e aprovado com sucesso!`,
        type: "withdrawal",
        entity: "WithdrawalRequest",
        entityId: updated.id,
      });
    }

    return withdrawalDto(updated);
  }

  async reject(id: string, notes?: string) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!withdrawal) throw new NotFoundException("Levantamento nao encontrado");
    const updated = await this.prisma.withdrawalRequest.update({
      where: { id },
      data: { status: WithdrawalStatus.REJECTED, notasAdmin: notes, processedAt: new Date() },
    });
    await this.prisma.wallet.update({
      where: { affiliateId: withdrawal.affiliateId },
      data: { saldoDisponivel: { increment: withdrawal.valor } },
    });

    const affiliate = await this.prisma.affiliate.findUnique({ where: { id: withdrawal.affiliateId } });
    if (affiliate?.userId) {
      await this.notifications.create({
        userId: affiliate.userId,
        title: "Saque Rejeitado",
        message: `Seu pedido de saque no valor de Kz ${withdrawal.valor} foi rejeitado pelo administrador. Motivo: ${notes || "Nenhuma justificativa fornecida."}. O valor foi retornado ao seu saldo disponível.`,
        type: "withdrawal",
        entity: "WithdrawalRequest",
        entityId: updated.id,
      });
    }

    return withdrawalDto(updated);
  }
}
