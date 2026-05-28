import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { RejectWithdrawalDto } from "./dto/withdrawal-body.dto";
import { WithdrawalFilterDto } from "./dto/withdrawal-filter.dto";
import { WithdrawalsService } from "./withdrawals.service";

@ApiTags("withdrawals")
@ApiBearerAuth()
@Controller()
export class WithdrawalsController {
  constructor(private withdrawals: WithdrawalsService) {}

  @Roles(UserRole.ADMIN)
  @Get("admin/withdrawals")
  @ApiOperation({ summary: "List all withdrawal requests (Admin)", description: "Retrieve paginated and filtered list of all affiliate withdrawal requests. Access restricted to Administrator role." })
  @ApiResponse({ status: 200, description: "Successfully retrieved list of withdrawals." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  adminList(@Query() filter: WithdrawalFilterDto) {
    return this.withdrawals.list(filter);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/withdrawals")
  @ApiOperation({ summary: "List current affiliate's withdrawals", description: "Retrieve paginated list of withdrawal requests submitted by the logged-in affiliate." })
  @ApiResponse({ status: 200, description: "Successfully retrieved affiliate's withdrawals." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async mine(@CurrentUser() user: any, @Query() filter: WithdrawalFilterDto) {
    return this.withdrawals.list({ ...filter, affiliateId: user.affiliate.id });
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/withdrawals/:id/approve")
  @ApiOperation({ summary: "Approve a withdrawal request (Admin)", description: "Approve an affiliate's pending withdrawal request, confirming the financial transaction. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the withdrawal request." })
  @ApiResponse({ status: 200, description: "Withdrawal request approved successfully." })
  @ApiResponse({ status: 404, description: "Withdrawal request not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  approve(@Param("id") id: string) {
    return this.withdrawals.approve(id);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/withdrawals/:id/reject")
  @ApiOperation({ summary: "Reject a withdrawal request (Admin)", description: "Reject an affiliate's pending withdrawal request, providing reasons/notes. Reserved funds will be returned to the affiliate's available balance. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the withdrawal request." })
  @ApiResponse({ status: 200, description: "Withdrawal request rejected successfully." })
  @ApiResponse({ status: 404, description: "Withdrawal request not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  reject(@Param("id") id: string, @Body() body: RejectWithdrawalDto) {
    return this.withdrawals.reject(id, body.notas_admin);
  }
}
