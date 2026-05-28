import { Module } from "@nestjs/common";
import { PartnerProgramModule } from "../partner-program/partner-program.module";
import { ServicesModule } from "../services/services.module";
import { PublicController } from "./public.controller";

@Module({
  imports: [ServicesModule, PartnerProgramModule],
  controllers: [PublicController],
})
export class PublicModule {}
