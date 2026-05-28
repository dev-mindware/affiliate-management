import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CommissionStatus, UserRole, AffiliateStatus, WithdrawalStatus } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("admin-dashboard")
@ApiBearerAuth()
@Controller("admin/dashboard")
@Roles(UserRole.ADMIN)
export class AdminDashboardController {
  constructor(private prisma: PrismaService) {}

  @Get("kpis")
  @ApiOperation({ summary: "Get administration analytics KPIs", description: "Retrieve high-level key performance indicators including total and active affiliates, pending approvals, total pending commission value, and monthly paid-out totals. Access restricted to Administrator role." })
  @ApiResponse({ status: 200, description: "Successfully retrieved dashboard KPI analytical metrics." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  async kpis() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const [totalAffiliates, activeAffiliates, pendingApprovals, pendingCommissions, paidWithdrawals] = await Promise.all([
      this.prisma.affiliate.count(),
      this.prisma.affiliate.count({ where: { status: AffiliateStatus.ACTIVE } }),
      this.prisma.affiliate.count({ where: { status: AffiliateStatus.PENDING_APPROVAL } }),
      this.prisma.commission.findMany({ where: { status: CommissionStatus.PENDING } }),
      this.prisma.withdrawalRequest.findMany({
        where: { status: WithdrawalStatus.APPROVED, processedAt: { gte: startOfMonth } },
      }),
    ]);
    return {
      total_affiliates: totalAffiliates,
      active_affiliates: activeAffiliates,
      pending_approvals: pendingApprovals,
      pending_commissions_kz: pendingCommissions.reduce((sum, item) => sum + Number(item.valorComissao || 0), 0),
      total_paid_month_kz: paidWithdrawals.reduce((sum, item) => sum + Number(item.valor || 0), 0),
    };
  }
}
