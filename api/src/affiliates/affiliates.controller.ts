import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { affiliateDto } from "../common/serializers";
import { AffiliateFilterDto } from "./dto/affiliate-filter.dto";
import { AffiliatesService } from "./affiliates.service";

@ApiTags("affiliates")
@ApiBearerAuth()
@Controller()
export class AffiliatesController {
  constructor(private affiliates: AffiliatesService) {}

  @Roles(UserRole.ADMIN)
  @Get("admin/affiliates")
  list(@Query() filter: AffiliateFilterDto) {
    return this.affiliates.list(filter);
  }

  @Roles(UserRole.ADMIN)
  @Get("admin/approvals/pending")
  pending(@Query() filter: AffiliateFilterDto) {
    return this.affiliates.list({ ...filter, status: "pending_approval" });
  }

  @Roles(UserRole.ADMIN)
  @Get("admin/affiliates/:id")
  async get(@Param("id") id: string) {
    return affiliateDto(await this.affiliates.find(id));
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/approvals/:id/approve")
  approve(@Param("id") id: string, @CurrentUser() user: any) {
    return this.affiliates.approve(id, user.id);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/approvals/:id/reject")
  reject(@Param("id") id: string) {
    return this.affiliates.reject(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch("admin/affiliates/:id/status")
  updateStatus(@Param("id") id: string, @Body() body: any) {
    return this.affiliates.updateStatus(id, body.status);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/profile")
  profile(@CurrentUser() user: any) {
    return affiliateDto(user.affiliate);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Patch("affiliate/profile")
  updateProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.affiliates.updateProfile(user.affiliate.id, body);
  }
}
