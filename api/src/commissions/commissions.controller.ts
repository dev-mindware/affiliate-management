import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { CommissionBodyDto, RejectCommissionDto } from "./dto/commission-body.dto";
import { CommissionFilterDto } from "./dto/commission-filter.dto";
import { CommissionsService } from "./commissions.service";

@ApiTags("commissions")
@ApiBearerAuth()
@Controller()
export class CommissionsController {
  constructor(private commissions: CommissionsService, private prisma: PrismaService) {}

  @Roles(UserRole.ADMIN)
  @Get("admin/commissions")
  adminList(@Query() filter: CommissionFilterDto) {
    return this.commissions.list(filter);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/commissions")
  create(@Body() body: CommissionBodyDto) {
    return this.commissions.create(body);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/commissions/:id/approve")
  approve(@Param("id") id: string) {
    return this.commissions.approve(id);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/commissions/:id/reject")
  reject(@Param("id") id: string, @Body() body: RejectCommissionDto) {
    return this.commissions.reject(id, body.notas);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/commissions")
  async mine(@CurrentUser() user: any, @Query() filter: CommissionFilterDto) {
    const result = await this.commissions.list({ ...filter, affiliateId: user.affiliate.id });
    return result.items;
  }
}
