import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CommissionStatus, UserRole, AffiliateStatus } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("admin-dashboard")
@ApiBearerAuth()
@Controller("admin/dashboard")
@Roles(UserRole.ADMIN)
export class AdminDashboardController {
  constructor(private prisma: PrismaService) {}

  @Get("kpis")
  async kpis() {
    const [totalAffiliates, activeAffiliates, pendingCommissions] = await Promise.all([
      this.prisma.affiliate.count(),
      this.prisma.affiliate.count({ where: { status: AffiliateStatus.ACTIVE } }),
      this.prisma.commission.findMany({ where: { status: CommissionStatus.PENDING } }),
    ]);
    return {
      total_affiliates: totalAffiliates,
      active_affiliates: activeAffiliates,
      pending_commissions_kz: pendingCommissions.reduce((sum, item) => sum + Number(item.valorComissao || 0), 0),
    };
  }
}
