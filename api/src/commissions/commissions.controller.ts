import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
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
  @ApiOperation({ summary: "List all commissions (Admin)", description: "Retrieve a paginated and filtered list of all commissions in the system. Access restricted to Administrator role." })
  @ApiResponse({ status: 200, description: "Successfully retrieved list of commissions." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  adminList(@Query() filter: CommissionFilterDto) {
    return this.commissions.list(filter);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/commissions")
  @ApiOperation({ summary: "Create a commission manually (Admin)", description: "Manually allocate a commission record to an affiliate. Access restricted to Administrator role." })
  @ApiResponse({ status: 201, description: "Commission successfully created." })
  @ApiResponse({ status: 400, description: "Validation or database integrity error." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  create(@Body() body: CommissionBodyDto) {
    return this.commissions.create(body);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/commissions/:id/approve")
  @ApiOperation({ summary: "Approve a commission (Admin)", description: "Approve a pending commission, adding the amount to the affiliate's balance. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the commission." })
  @ApiResponse({ status: 200, description: "Commission successfully approved." })
  @ApiResponse({ status: 404, description: "Commission not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  approve(@Param("id") id: string) {
    return this.commissions.approve(id);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/commissions/:id/reject")
  @ApiOperation({ summary: "Reject a commission (Admin)", description: "Reject a pending commission with explanation notes, removing it from validation flows. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the commission." })
  @ApiResponse({ status: 200, description: "Commission successfully rejected." })
  @ApiResponse({ status: 404, description: "Commission not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  reject(@Param("id") id: string, @Body() body: RejectCommissionDto) {
    return this.commissions.reject(id, body.notas);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/commissions")
  @ApiOperation({ summary: "List current affiliate's commissions", description: "Retrieve commissions earned by the currently authenticated affiliate, filtered by criteria." })
  @ApiResponse({ status: 200, description: "Successfully retrieved affiliate's commissions." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async mine(@CurrentUser() user: any, @Query() filter: CommissionFilterDto) {
    const result = await this.commissions.list({ ...filter, affiliateId: user.affiliate.id });
    return result.items;
  }
}
