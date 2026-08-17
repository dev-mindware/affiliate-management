import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { CertificationDecisionDto, PartnerPlanBodyDto, SubscriptionStatusDto } from "./dto/partner-body.dto";
import { SubscriptionFilterDto } from "./dto/subscription-filter.dto";
import { PartnerProgramService } from "./partner-program.service";

@ApiTags("partner-program")
@ApiBearerAuth()
@Controller()
export class PartnerProgramController {
  constructor(private partner: PartnerProgramService) {}

  @Roles(UserRole.ADMIN)
  @Get("admin/partner-program/plans")
  @ApiOperation({ summary: "List partner program plans (Admin)", description: "Retrieve all subscription plans defined in the system. Access restricted to Administrator role." })
  @ApiResponse({ status: 200, description: "Successfully retrieved program plans." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  plans() {
    return this.partner.plans();
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/partner-program/plans")
  @ApiOperation({ summary: "Create a partner plan (Admin)", description: "Configure and register a new partner program subscription tier with specified price and commission percentages. Access restricted to Administrator role." })
  @ApiResponse({ status: 201, description: "Plan created successfully." })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  createPlan(@Body() body: PartnerPlanBodyDto) {
    return this.partner.createPlan(body);
  }

  @Roles(UserRole.ADMIN)
  @Get("admin/partner-program/subscriptions")
  @ApiOperation({ summary: "List all subscriptions (Admin)", description: "Retrieve a paginated, filtered list of all affiliate subscription records. Access restricted to Administrator role." })
  @ApiResponse({ status: 200, description: "Successfully retrieved list of subscriptions." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  subscriptions(@Query() filter: SubscriptionFilterDto) {
    return this.partner.listSubscriptions(filter);
  }

  @Roles(UserRole.ADMIN)
  @Patch("admin/partner-program/subscriptions/:id/status")
  @ApiOperation({ summary: "Update subscription status (Admin)", description: "Change status of a subscription (e.g. cancel, suspend). Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the subscription." })
  @ApiResponse({ status: 200, description: "Subscription status updated successfully." })
  @ApiResponse({ status: 404, description: "Subscription not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  updateSubscription(@Param("id") id: string, @Body() body: SubscriptionStatusDto) {
    return this.partner.updateSubscriptionStatus(id, body.status, body.notes);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/partner-program/commissions/release-validated")
  @ApiOperation({ summary: "Release validated commissions (Admin)", description: "Trigger the automatic validation and release process for all mature and validated affiliate commissions. Access restricted to Administrator role." })
  @ApiResponse({ status: 200, description: "Commissions successfully released." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  async releaseValidated() {
    return { released: await this.partner.releaseValidated() };
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/partner-program/commissions/reconcile")
  @ApiOperation({ summary: "Reconcile affiliate commissions (Admin)", description: "Recalculates initial subscription commissions that were registered at 15% instead of 20% and updates affiliate wallets." })
  @ApiResponse({ status: 200, description: "Commissions successfully reconciled." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  reconcileCommissions() {
    return this.partner.reconcileCommissions();
  }

  @Roles(UserRole.ADMIN)
  @Get("admin/partner-program/affiliates/:id/program-summary")
  @ApiOperation({ summary: "Get affiliate's program summary (Admin)", description: "Retrieve subscription summary, metrics, and certification status of a specific affiliate. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the affiliate." })
  @ApiResponse({ status: 200, description: "Successfully retrieved program summary." })
  @ApiResponse({ status: 404, description: "Affiliate not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  async adminSummary(@Param("id") id: string) {
    return this.partner.summary({ id });
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/partner-program/affiliates/:id/certification/approve")
  @ApiOperation({ summary: "Approve affiliate certification (Admin)", description: "Grant certified status to an affiliate, enabling them to refer premium tier plans. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the affiliate." })
  @ApiResponse({ status: 200, description: "Affiliate certification successfully approved." })
  @ApiResponse({ status: 404, description: "Affiliate not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  approveCertification(@Param("id") id: string, @Body() body: CertificationDecisionDto, @CurrentUser() user: any) {
    return this.partner.approveCertification(id, user.id, body.notes, body.force);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/partner-program/affiliates/:id/certification/reject")
  @ApiOperation({ summary: "Reject affiliate certification (Admin)", description: "Deny or revoke certified status for an affiliate. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the affiliate." })
  @ApiResponse({ status: 200, description: "Affiliate certification successfully rejected/denied." })
  @ApiResponse({ status: 404, description: "Affiliate not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  rejectCertification(@Param("id") id: string, @Body() body: CertificationDecisionDto) {
    return this.partner.rejectCertification(id, body.notes);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/partner-program/summary")
  @ApiOperation({ summary: "Get current affiliate summary", description: "Retrieve current subscription details, commissions metrics, and certification status of the logged-in affiliate." })
  @ApiResponse({ status: 200, description: "Successfully retrieved program summary." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  summary(@CurrentUser() user: any) {
    return this.partner.summary(user.affiliate);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/partner-program/plans")
  @ApiOperation({ summary: "Get active plans for affiliate", description: "Retrieve all available active subscription plans visible to the affiliate." })
  @ApiResponse({ status: 200, description: "Successfully retrieved available plans." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  plansForPartner() {
    return this.partner.plans(true);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/dashboard/ranking")
  @ApiOperation({ summary: "Get affiliate leader ranking", description: "Retrieve the top-performing affiliates based on conversion and sales volumes." })
  @ApiResponse({ status: 200, description: "Successfully retrieved top affiliate ranking list." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  ranking() {
    return this.partner.ranking({ limit: 10 });
  }
}
