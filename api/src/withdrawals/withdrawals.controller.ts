import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
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
  @Get()
  @Controller("admin/withdrawals")
  list(@Query() filter: WithdrawalFilterDto) {
    return this.withdrawals.list(filter);
  }

  @Roles(UserRole.ADMIN)
  @Get("admin/withdrawals")
  adminList(@Query() filter: WithdrawalFilterDto) {
    return this.withdrawals.list(filter);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/withdrawals")
  async mine(@CurrentUser() user: any, @Query() filter: WithdrawalFilterDto) {
    return this.withdrawals.list({ ...filter, affiliateId: user.affiliate.id });
  }

  @Roles(UserRole.ADMIN)
  @Post(":id/approve")
  approve(@Param("id") id: string) {
    return this.withdrawals.approve(id);
  }

  @Roles(UserRole.ADMIN)
  @Post(":id/reject")
  reject(@Param("id") id: string, @Body() body: RejectWithdrawalDto) {
    return this.withdrawals.reject(id, body.notas_admin);
  }
}
