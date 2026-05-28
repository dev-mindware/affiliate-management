import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
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
  async kpis(@CurrentUser() user: any) {
    const affiliate = user.affiliate;
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
}
