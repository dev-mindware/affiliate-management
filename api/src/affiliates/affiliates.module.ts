import { Module } from "@nestjs/common";
import { WalletModule } from "../wallet/wallet.module";
import { PartnerProgramModule } from "../partner-program/partner-program.module";
import { AffiliateDashboardController } from "./affiliate-dashboard.controller";
import { AffiliatesController } from "./affiliates.controller";
import { AffiliatesService } from "./affiliates.service";

@Module({
  imports: [WalletModule, PartnerProgramModule],
  controllers: [AffiliatesController, AffiliateDashboardController],
  providers: [AffiliatesService],
  exports: [AffiliatesService],
})
export class AffiliatesModule {}
