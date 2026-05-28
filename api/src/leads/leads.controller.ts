import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
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
  @ApiOperation({ summary: "List all leads (Admin)", description: "Retrieve a paginated and filtered list of all submitted leads across all affiliates. Access restricted to Administrator role." })
  @ApiResponse({ status: 200, description: "Successfully retrieved list of leads." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  list(@Query() filter: LeadFilterDto) {
    return this.leads.list(filter);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/leads")
  @ApiOperation({ summary: "Create a lead manually (Admin)", description: "Manually register a new lead for a specific affiliate. Access restricted to Administrator role." })
  @ApiResponse({ status: 201, description: "Lead successfully created." })
  @ApiResponse({ status: 400, description: "Validation or affiliate lookup error." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  createAdmin(@Body() body: AdminLeadBodyDto) {
    return this.leads.createAdmin(body);
  }

  @Roles(UserRole.ADMIN)
  @Patch("admin/leads/:id/status")
  @ApiOperation({ summary: "Update lead status (Admin)", description: "Transition a lead through different sales statuses (new, contacted, converted, lost). Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the lead." })
  @ApiResponse({ status: 200, description: "Lead status updated successfully." })
  @ApiResponse({ status: 404, description: "Lead not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  update(@Param("id") id: string, @Body() body: LeadStatusBodyDto) {
    return this.leads.updateStatus(id, body.status);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/leads")
  @ApiOperation({ summary: "List current affiliate's leads", description: "Retrieve a list of leads referred by the currently authenticated affiliate." })
  @ApiResponse({ status: 200, description: "Successfully retrieved affiliate's leads." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async mine(@CurrentUser() user: any, @Query() filter: LeadFilterDto) {
    const result = await this.leads.list({ ...filter, affiliateId: user.affiliate.id });
    return result.items;
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Post("affiliate/leads")
  @ApiOperation({ summary: "Submit a new lead", description: "Allows an affiliate to register a new lead/client recommendation in the system." })
  @ApiResponse({ status: 201, description: "Lead submitted successfully." })
  @ApiResponse({ status: 400, description: "Validation or service lookup error." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  createMine(@CurrentUser() user: any, @Body() body: LeadBodyDto) {
    return this.leads.createByAffiliate(user.affiliate.id, body);
  }
}
