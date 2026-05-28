import { Module } from "@nestjs/common";
import { CommissionsModule } from "../commissions/commissions.module";
import { LeadsController } from "./leads.controller";
import { LeadsService } from "./leads.service";

@Module({
  imports: [CommissionsModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
