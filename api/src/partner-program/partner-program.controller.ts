import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PartnerPaymentSource, UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { SubscriptionFilterDto } from "./dto/subscription-filter.dto";
import { PartnerProgramService } from "./partner-program.service";

@ApiTags("partner-program")
@ApiBearerAuth()
@Controller()
export class PartnerProgramController {
  constructor(private partner: PartnerProgramService) {}

  @Roles(UserRole.ADMIN)
  @Get("admin/partner-program/plans")
  plans() {
    return this.partner.plans();
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/partner-program/plans")
  createPlan(@Body() body: any) {
    return this.partner.createPlan(body);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/partner-program/subscription-payments")
  async manualPayment(@Body() body: any) {
    const result = await this.partner.registerPayment(body, PartnerPaymentSource.MANUAL);
    return {
      subscription: result.subscription,
      commission_id: result.commission?.id,
      commission_amount: Number(result.commission?.valorComissao || 0),
      duplicated: result.duplicated,
    };
  }

  @Roles(UserRole.ADMIN)
  @Get("admin/partner-program/subscriptions")
  subscriptions(@Query() filter: SubscriptionFilterDto) {
    return this.partner.listSubscriptions(filter);
  }

  @Roles(UserRole.ADMIN)
  @Patch("admin/partner-program/subscriptions/:id/status")
  updateSubscription(@Param("id") id: string, @Body() body: any) {
    return this.partner.updateSubscriptionStatus(id, body.status, body.notes);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/partner-program/commissions/release-validated")
  async releaseValidated() {
    return { released: await this.partner.releaseValidated() };
  }

  @Roles(UserRole.ADMIN)
  @Get("admin/partner-program/affiliates/:id/program-summary")
  async adminSummary(@Param("id") id: string) {
    return this.partner.summary({ id });
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/partner-program/affiliates/:id/certification/approve")
  approveCertification(@Param("id") id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.partner.approveCertification(id, user.id, body.notes);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/partner-program/affiliates/:id/certification/reject")
  rejectCertification(@Param("id") id: string, @Body() body: any) {
    return this.partner.rejectCertification(id, body.notes);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/partner-program/summary")
  summary(@CurrentUser() user: any) {
    return this.partner.summary(user.affiliate);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/partner-program/plans")
  plansForPartner() {
    return this.partner.plans(true);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/dashboard/ranking")
  ranking() {
    return this.partner.ranking({ limit: 10 });
  }
}
