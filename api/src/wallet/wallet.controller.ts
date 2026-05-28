import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
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
  get(@CurrentUser() user: any) {
    return this.wallet.getWallet(user.affiliate.id);
  }

  @Post("withdraw")
  withdraw(@CurrentUser() user: any, @Body() body: WithdrawalBodyDto) {
    return this.wallet.requestWithdrawal(user.affiliate, body);
  }
}
