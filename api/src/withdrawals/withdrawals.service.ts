import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CommissionStatus, WithdrawalStatus } from "@prisma/client";
import { toWithdrawalStatus } from "../common/enum-mappers";
import { dateRange, normalizePagination, orderBy, paginated } from "../common/filters/pagination";
import { withdrawalDto } from "../common/serializers";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { WithdrawalFilterDto } from "./dto/withdrawal-filter.dto";
import { NotificationsService } from "../notifications/notifications.service";

// Tipo minimo do ficheiro enviado (evita dependencia de @types/multer).
export interface UploadedProof {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@Injectable()
export class WithdrawalsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private storage: StorageService,
    private mail: MailService,
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

  async approve(id: string, file?: UploadedProof) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!withdrawal) throw new NotFoundException("Levantamento nao encontrado");
    if (withdrawal.status !== WithdrawalStatus.PENDING) throw new BadRequestException("Levantamento ja foi processado");

    // Se o admin anexou um comprovativo, carrega-o antes da transacao.
    // Falha de upload e um erro rigido (o admin submeteu explicitamente um ficheiro).
    let comprovativoUrl: string | undefined;
    if (file) {
      const uploaded = await this.storage.upload(file.buffer, file.mimetype);
      comprovativoUrl = uploaded.url;
    }

    const valor = Number(withdrawal.valor || 0);
    const updated = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.withdrawalRequest.update({
        where: { id },
        data: {
          status: WithdrawalStatus.APPROVED,
          processedAt: new Date(),
          ...(comprovativoUrl ? { comprovativoUrl } : {}),
        },
      });
      await tx.wallet.update({
        where: { affiliateId: withdrawal.affiliateId },
        data: { totalLevantado: { increment: valor } },
      });
      // Regista o pagamento no afiliado.
      await tx.affiliate.update({
        where: { id: withdrawal.affiliateId },
        data: { totalPaid: { increment: valor } },
      });
      // Marca comissoes disponiveis como PAID por ordem de antiguidade (FIFO),
      // ate cobrir o valor levantado. So marca as que cabem integralmente.
      const approvedCommissions = await tx.commission.findMany({
        where: { affiliateId: withdrawal.affiliateId, status: CommissionStatus.APPROVED },
        orderBy: { createdAt: "asc" },
      });
      let remaining = valor;
      const toPay: string[] = [];
      for (const c of approvedCommissions) {
        const v = Number(c.valorComissao || 0);
        if (v <= remaining) {
          toPay.push(c.id);
          remaining -= v;
        } else {
          break;
        }
      }
      if (toPay.length) {
        await tx.commission.updateMany({
          where: { id: { in: toPay } },
          data: { status: CommissionStatus.PAID, paidAt: new Date() },
        });
      }
      return updated;
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

    await this.mail.sendWithdrawalApproved(
      affiliate,
      updated,
      file ? { filename: file.originalname, content: file.buffer, contentType: file.mimetype } : undefined,
    );

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

    await this.mail.sendWithdrawalRejected(affiliate, updated, notes);

    return withdrawalDto(updated);
  }
}
