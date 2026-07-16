import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { PartnerProgramService } from "../partner-program/partner-program.service";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("affiliate-dashboard")
@ApiBearerAuth()
@Controller("affiliate/dashboard")
@Roles(UserRole.AFFILIATE, UserRole.ADMIN)
export class AffiliateDashboardController {
  constructor(private prisma: PrismaService, private partner: PartnerProgramService) {}

  @Get("kpis")
  @ApiOperation({ summary: "Get affiliate dashboard analytical KPIs", description: "Retrieve operational metrics including balances, total earnings, active leads, ranking, and program subscription details. Gracefully handles roles lacking affiliate profiles." })
  @ApiResponse({ status: 200, description: "Successfully retrieved dashboard KPIs." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async kpis(@CurrentUser() user: any) {
    const affiliate = user?.affiliate;
    if (!affiliate) {
      return {
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0,
        active_leads: 0,
        rank_info: { rank: 0, nome_nivel: "Nenhum", total_pontos: 0, proximo_nivel: null, pontos_proximo_nivel: 0 },
        partner_program: null,
      };
    }
    const wallet = await this.prisma.wallet.findUnique({ where: { affiliateId: affiliate.id } });
    return {
      available_balance: Number(wallet?.saldoDisponivel || 0),
      pending_balance: Number(wallet?.saldoPendente || 0),
      total_earned: Number(affiliate.totalEarned || 0),
      active_leads: await this.prisma.leadNotification.count({ where: { affiliateId: affiliate.id } }),
      rank_info: await this.partner.rankInfo(affiliate.id),
      partner_program: await this.partner.summary(affiliate),
    };
  }

  @Get("chart")
  @ApiOperation({ summary: "Get affiliate commissions evolution chart data", description: "Retrieve commission totals aggregated by day of the current month or by month of the current year via the ?period=monthly|annual query param." })
  @ApiResponse({ status: 200, description: "Successfully retrieved chart details." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async chart(@CurrentUser() user: any, @Query("period") period?: string) {
    const affiliate = user?.affiliate;
    const mode = period === "annual" ? "annual" : "monthly";
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    if (mode === "annual") {
      const since = new Date(year, 0, 1);
      const until = new Date(year + 1, 0, 1);
      const commissions = affiliate
        ? await this.prisma.commission.findMany({
            where: { affiliateId: affiliate.id, createdAt: { gte: since, lt: until } },
            select: { createdAt: true, valorComissao: true },
          })
        : [];
      const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return Array.from({ length: 12 }).map((_, m) => {
        const doMes = commissions.filter((c) => c.createdAt.getFullYear() === year && c.createdAt.getMonth() === m);
        return {
          date: `${year}-${String(m + 1).padStart(2, "0")}`,
          label: monthLabels[m],
          comissao: doMes.reduce((sum, c) => sum + Number(c.valorComissao || 0), 0),
        };
      });
    }

    const since = new Date(year, month, 1);
    const until = new Date(year, month + 1, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const commissions = affiliate
      ? await this.prisma.commission.findMany({
          where: { affiliateId: affiliate.id, createdAt: { gte: since, lt: until } },
          select: { createdAt: true, valorComissao: true },
        })
      : [];
    return Array.from({ length: daysInMonth }).map((_, index) => {
      const day = index + 1;
      const doDia = commissions.filter(
        (c) => c.createdAt.getFullYear() === year && c.createdAt.getMonth() === month && c.createdAt.getDate() === day,
      );
      return {
        date: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        label: String(day),
        comissao: doDia.reduce((sum, c) => sum + Number(c.valorComissao || 0), 0),
      };
    });
  }
}
