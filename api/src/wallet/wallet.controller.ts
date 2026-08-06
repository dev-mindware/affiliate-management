import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { WithdrawalBodyDto } from "./dto/wallet-body.dto";
import { WalletService } from "./wallet.service";

@ApiTags("wallet")
@ApiBearerAuth()
@Controller("affiliate/wallet")
@Roles(UserRole.AFFILIATE, UserRole.ADMIN)
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get()
  @ApiOperation({ summary: "Get current affiliate wallet status" })
  @ApiResponse({ status: 200, description: "Successfully retrieved wallet details." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  get(@CurrentUser() user: any) {
    return this.wallet.getWallet(user.affiliate.id);
  }

  @Get("chart")
  @ApiOperation({ summary: "Get wallet earnings chart data (last 6 months)", description: "Returns monthly earned commissions and withdrawn amounts for the last 6 months for chart rendering." })
  @ApiResponse({ status: 200, description: "Successfully retrieved chart data." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  chart(@CurrentUser() user: any) {
    return this.wallet.getWalletChart(user.affiliate.id);
  }

  @Post("withdraw")
  @ApiOperation({ summary: "Request a wallet withdrawal", description: "Submit a request to withdraw available funds from the affiliate's wallet. Balance will be reserved pending administrative approval." })
  @ApiResponse({ status: 201, description: "Withdrawal request submitted successfully." })
  @ApiResponse({ status: 400, description: "Insufficient balance or invalid payment coordinates." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  withdraw(@CurrentUser() user: any, @Body() body: WithdrawalBodyDto) {
    return this.wallet.requestWithdrawal(user.affiliate, body);
  }
}
