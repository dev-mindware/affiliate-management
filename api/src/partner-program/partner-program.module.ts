import { Module } from "@nestjs/common";
import { WalletModule } from "../wallet/wallet.module";
import { PartnerProgramController } from "./partner-program.controller";
import { PartnerProgramService } from "./partner-program.service";

@Module({
  imports: [WalletModule],
  controllers: [PartnerProgramController],
  providers: [PartnerProgramService],
  exports: [PartnerProgramService],
})
export class PartnerProgramModule {}
