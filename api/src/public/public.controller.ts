import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
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
  @ApiOperation({ summary: "List active services publicly", description: "Retrieve all active services and their respective pricing and standard affiliate commission rates. Publicly accessible." })
  @ApiResponse({ status: 200, description: "Successfully retrieved list of active services." })
  servicesList(@Query() filter: ServiceFilterDto) {
    return this.services.list(filter, true);
  }

  @Get("ranking")
  @ApiOperation({ summary: "List public affiliate leaderboard ranking", description: "Retrieve list of top-performing affiliates based on volume. Publicly accessible." })
  @ApiResponse({ status: 200, description: "Successfully retrieved leaderboard ranking." })
  ranking(@Query() filter: RankingFilterDto) {
    return this.partner.ranking(filter);
  }
}
