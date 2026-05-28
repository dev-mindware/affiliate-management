import { Controller, Get } from "@nestjs/common";
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
  @ApiOperation({ summary: "Get affiliate leads analytics chart data", description: "Retrieve weekly leads referral progression data for visualization charting." })
  @ApiResponse({ status: 200, description: "Successfully retrieved chart details." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async chart(@CurrentUser() user: any) {
    const affiliate = user?.affiliate;
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const leads = affiliate
      ? await this.prisma.leadNotification.findMany({
          where: { affiliateId: affiliate.id, createdAt: { gte: since } },
          select: { createdAt: true },
        })
      : [];

    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(since);
      date.setDate(since.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      return {
        date: key,
        count: leads.filter((lead) => lead.createdAt.toISOString().slice(0, 10) === key).length,
      };
    });
  }
}
