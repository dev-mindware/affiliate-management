import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
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
  @ApiOperation({ summary: "List all services (Admin)", description: "Retrieve a paginated and filtered list of all services in the catalog. Access restricted to Administrator role." })
  @ApiResponse({ status: 200, description: "Successfully retrieved services." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  list(@Query() filter: ServiceFilterDto) {
    return this.services.list(filter);
  }

  @Post()
  @ApiOperation({ summary: "Create a new service (Admin)", description: "Add a new service offering with pricing and commission details. Access restricted to Administrator role." })
  @ApiResponse({ status: 201, description: "Service created successfully." })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  create(@Body() body: ServiceBodyDto) {
    return this.services.create(body);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an existing service (Admin)", description: "Modify service description, pricing, status, or commission amounts. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique ID of the service record." })
  @ApiResponse({ status: 200, description: "Service updated successfully." })
  @ApiResponse({ status: 404, description: "Service not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  update(@Param("id") id: string, @Body() body: Partial<ServiceBodyDto>) {
    return this.services.update(Number(id), body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a service (Admin)", description: "Remove a service offering from the catalog. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique ID of the service record." })
  @ApiResponse({ status: 200, description: "Service successfully deleted." })
  @ApiResponse({ status: 404, description: "Service not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  remove(@Param("id") id: string) {
    return this.services.remove(Number(id));
  }
}
