import { Module } from "@nestjs/common";
import { CommissionsModule } from "../commissions/commissions.module";
import { PartnerProgramModule } from "../partner-program/partner-program.module";
import { WebhooksController } from "./webhooks.controller";

@Module({
  imports: [CommissionsModule, PartnerProgramModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
