import { BadRequestException, Injectable } from "@nestjs/common";
import { WithdrawalStatus } from "@prisma/client";
import { walletDto, withdrawalDto } from "../common/serializers";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

export const WITHDRAWAL_MINIMUM = 5000;

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async ensureWallet(affiliateId: string) {
    return this.prisma.wallet.upsert({
      where: { affiliateId },
      update: {},
      create: { affiliateId },
    });
  }

  async addPending(affiliateId: string, amount: number, tx: any = this.prisma) {
    return tx.wallet.upsert({
      where: { affiliateId },
      update: { saldoPendente: { increment: amount } },
      create: { affiliateId, saldoPendente: amount },
    });
  }

  // Adiciona diretamente ao saldo disponivel (comissao ja validada/aprovada).
  async addAvailable(affiliateId: string, amount: number, tx: any = this.prisma) {
    await tx.wallet.upsert({
      where: { affiliateId },
      update: {
        saldoDisponivel: { increment: amount },
        totalGanho: { increment: amount },
      },
      create: { affiliateId, saldoDisponivel: amount, totalGanho: amount },
    });
    await tx.affiliate.update({ where: { id: affiliateId }, data: { totalEarned: { increment: amount } } });
  }

  async movePendingToAvailable(affiliateId: string, amount: number, tx: any = this.prisma) {
    const wallet = await tx.wallet.upsert({ where: { affiliateId }, update: {}, create: { affiliateId } });
    const novoPendente = Math.max(0, Number(wallet.saldoPendente || 0) - amount);
    await tx.wallet.update({
      where: { affiliateId },
      data: {
        saldoPendente: novoPendente,
        saldoDisponivel: { increment: amount },
        totalGanho: { increment: amount },
      },
    });
    await tx.affiliate.update({ where: { id: affiliateId }, data: { totalEarned: { increment: amount } } });
  }

  async rejectPending(affiliateId: string, amount: number, tx: any = this.prisma) {
    const wallet = await tx.wallet.findUnique({ where: { affiliateId } });
    if (!wallet) return;
    const novoPendente = Math.max(0, Number(wallet.saldoPendente || 0) - amount);
    await tx.wallet.update({ where: { affiliateId }, data: { saldoPendente: novoPendente } });
  }

  // Estorna uma comissao ja aprovada/disponivel (ex.: reembolso/chargeback da subscricao).
  async reverseAvailable(affiliateId: string, amount: number, tx: any = this.prisma) {
    const wallet = await tx.wallet.findUnique({ where: { affiliateId } });
    if (!wallet) return;
    const novoDisponivel = Math.max(0, Number(wallet.saldoDisponivel || 0) - amount);
    const novoGanho = Math.max(0, Number(wallet.totalGanho || 0) - amount);
    await tx.wallet.update({ where: { affiliateId }, data: { saldoDisponivel: novoDisponivel, totalGanho: novoGanho } });
    const affiliate = await tx.affiliate.findUnique({ where: { id: affiliateId } });
    if (affiliate) {
      const novoEarned = Math.max(0, Number(affiliate.totalEarned || 0) - amount);
      await tx.affiliate.update({ where: { id: affiliateId }, data: { totalEarned: novoEarned } });
    }
  }

  async getWallet(affiliateId: string) {
    return walletDto(await this.ensureWallet(affiliateId));
  }

  async getWalletChart(affiliateId: string) {
    // Build last 6 months range
    const now = new Date();
    const months: { year: number; month: number; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleDateString("pt-AO", { month: "short", year: "2-digit" }),
      });
    }

    const start = new Date(months[0].year, months[0].month - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Fetch approved commissions and approved withdrawals in parallel
    const [commissions, withdrawals] = await Promise.all([
      this.prisma.commission.findMany({
        where: {
          affiliateId,
          status: { in: ["APPROVED", "PAID"] as any },
          approvedAt: { gte: start, lt: end },
        },
        select: { valorComissao: true, approvedAt: true },
      }),
      this.prisma.withdrawalRequest.findMany({
        where: {
          affiliateId,
          status: "APPROVED" as any,
          processedAt: { gte: start, lt: end },
        },
        select: { valor: true, processedAt: true },
      }),
    ]);

    // Aggregate by month
    const data = months.map(({ year, month, label }) => {
      const earned = commissions
        .filter((c) => {
          const d = new Date(c.approvedAt!);
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        })
        .reduce((sum, c) => sum + Number(c.valorComissao || 0), 0);

      const withdrawn = withdrawals
        .filter((w) => {
          const d = new Date(w.processedAt!);
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        })
        .reduce((sum, w) => sum + Number(w.valor || 0), 0);

      return { month: label, earned, withdrawn };
    });

    return { data };
  }

  async requestWithdrawal(affiliate: any, data: any) {
    const amount = Number(data.valor);
    if (amount < WITHDRAWAL_MINIMUM) throw new BadRequestException("O valor minimo para levantamento e de 5.000 Kz");
    await this.ensureWallet(affiliate.id);
    // Decremento atomico condicional: so passa se houver saldo suficiente,
    // evitando overdraw/race em pedidos concorrentes.
    const debited = await this.prisma.wallet.updateMany({
      where: { affiliateId: affiliate.id, saldoDisponivel: { gte: amount } },
      data: { saldoDisponivel: { decrement: amount } },
    });
    if (debited.count === 0) throw new BadRequestException("Saldo insuficiente");
    const withdrawal = await this.prisma.withdrawalRequest.create({
      data: {
        affiliateId: affiliate.id,
        valor: amount,
        contaBancaria: data.conta_bancaria,
        banco: data.banco,
        status: WithdrawalStatus.PENDING,
      },
    });

    // Garante dados completos do afiliado (nome/email) para o email aos admins.
    const fullAffiliate = await this.prisma.affiliate.findUnique({ where: { id: affiliate.id } });
    // Falha de email e engolida dentro do MailService (nunca quebra o fluxo).
    await this.mail.sendWithdrawalRequestedToAdmins(fullAffiliate || affiliate, withdrawal);

    return withdrawalDto(withdrawal);
  }
}
