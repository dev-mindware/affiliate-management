import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { RankingFilterDto } from "../partner-program/dto/ranking-filter.dto";
import { PartnerProgramService } from "../partner-program/partner-program.service";
import { ServiceFilterDto } from "../services/dto/service-filter.dto";
import { ServicesService } from "../services/services.service";

@ApiTags("public")
@Public()
@Controller("public")
export class PublicController {
  constructor(private services: ServicesService, private partner: PartnerProgramService) {}

  @Get("services")
  servicesList(@Query() filter: ServiceFilterDto) {
    return this.services.list(filter, true);
  }

  @Get("ranking")
  ranking(@Query() filter: RankingFilterDto) {
    return this.partner.ranking(filter);
  }
}
