import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { AdminLeadBodyDto, LeadBodyDto, LeadStatusBodyDto } from "./dto/lead-body.dto";
import { LeadFilterDto } from "./dto/lead-filter.dto";
import { LeadsService } from "./leads.service";

@ApiTags("leads")
@ApiBearerAuth()
@Controller()
export class LeadsController {
  constructor(private leads: LeadsService) {}

  @Roles(UserRole.ADMIN)
  @Get("admin/leads")
  list(@Query() filter: LeadFilterDto) {
    return this.leads.list(filter);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/leads")
  createAdmin(@Body() body: AdminLeadBodyDto) {
    return this.leads.createAdmin(body);
  }

  @Roles(UserRole.ADMIN)
  @Patch("admin/leads/:id/status")
  update(@Param("id") id: string, @Body() body: LeadStatusBodyDto) {
    return this.leads.updateStatus(id, body.status);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/leads")
  async mine(@CurrentUser() user: any, @Query() filter: LeadFilterDto) {
    const result = await this.leads.list({ ...filter, affiliateId: user.affiliate.id });
    return result.items;
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Post("affiliate/leads")
  createMine(@CurrentUser() user: any, @Body() body: LeadBodyDto) {
    return this.leads.createByAffiliate(user.affiliate.id, body);
  }
}
