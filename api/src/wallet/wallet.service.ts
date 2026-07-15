import { BadRequestException, Injectable } from "@nestjs/common";
import { WithdrawalStatus } from "@prisma/client";
import { walletDto, withdrawalDto } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";

export const WITHDRAWAL_MINIMUM = 8000;

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async ensureWallet(affiliateId: string) {
    return this.prisma.wallet.upsert({
      where: { affiliateId },
      update: {},
      create: { affiliateId },
    });
  }

  async addPending(affiliateId: string, amount: number) {
    return this.prisma.wallet.upsert({
      where: { affiliateId },
      update: { saldoPendente: { increment: amount } },
      create: { affiliateId, saldoPendente: amount },
    });
  }

  async movePendingToAvailable(affiliateId: string, amount: number) {
    await this.prisma.wallet.upsert({
      where: { affiliateId },
      update: {
        saldoPendente: { decrement: amount },
        saldoDisponivel: { increment: amount },
        totalGanho: { increment: amount },
      },
      create: { affiliateId, saldoDisponivel: amount, totalGanho: amount },
    });
    await this.prisma.affiliate.update({ where: { id: affiliateId }, data: { totalEarned: { increment: amount } } });
  }

  async rejectPending(affiliateId: string, amount: number) {
    return this.prisma.wallet.upsert({
      where: { affiliateId },
      update: { saldoPendente: { decrement: amount } },
      create: { affiliateId },
    });
  }

  async getWallet(affiliateId: string) {
    return walletDto(await this.ensureWallet(affiliateId));
  }

  async requestWithdrawal(affiliate: any, data: any) {
    const amount = Number(data.valor);
    if (amount < WITHDRAWAL_MINIMUM) throw new BadRequestException("O valor minimo para levantamento e de 8.000 Kz");
    const wallet = await this.ensureWallet(affiliate.id);
    if (Number(wallet.saldoDisponivel || 0) < amount) throw new BadRequestException("Saldo insuficiente");
    await this.prisma.wallet.update({
      where: { affiliateId: affiliate.id },
      data: { saldoDisponivel: { decrement: amount } },
    });
    const withdrawal = await this.prisma.withdrawalRequest.create({
      data: {
        affiliateId: affiliate.id,
        valor: amount,
        contaBancaria: data.conta_bancaria,
        banco: data.banco,
        status: WithdrawalStatus.PENDING,
      },
    });
    return withdrawalDto(withdrawal);
  }
}
