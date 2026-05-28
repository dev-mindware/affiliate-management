import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { ServiceBodyDto } from "./dto/service-body.dto";
import { ServiceFilterDto } from "./dto/service-filter.dto";
import { ServicesService } from "./services.service";

@ApiTags("services")
@ApiBearerAuth()
@Controller("admin/services")
@Roles(UserRole.ADMIN)
export class ServicesController {
  constructor(private services: ServicesService) {}

  @Get()
  list(@Query() filter: ServiceFilterDto) {
    return this.services.list(filter);
  }

  @Post()
  create(@Body() body: ServiceBodyDto) {
    return this.services.create(body);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() body: Partial<ServiceBodyDto>) {
    return this.services.update(Number(id), body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.services.remove(Number(id));
  }
}
