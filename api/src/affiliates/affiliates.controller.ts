import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { affiliateDto } from "../common/serializers";
import { AffiliateAdminUpdateDto, AffiliateCreateDto, AffiliateProfileBodyDto, AffiliateStatusBodyDto } from "./dto/affiliate-body.dto";
import { AffiliateFilterDto } from "./dto/affiliate-filter.dto";
import { AffiliatesService } from "./affiliates.service";

@ApiTags("affiliates")
@ApiBearerAuth()
@Controller()
export class AffiliatesController {
  constructor(private affiliates: AffiliatesService) {}

  @Roles(UserRole.ADMIN)
  @Get("admin/affiliates")
  @ApiOperation({ summary: "List all affiliates", description: "Retrieve a paginated and filtered list of all registered affiliates. Access restricted to Administrator role." })
  @ApiResponse({ status: 200, description: "Successfully retrieved list of affiliates." })
  @ApiResponse({ status: 401, description: "Unauthorized - Access token is missing or invalid." })
  @ApiResponse({ status: 403, description: "Forbidden - Administrator role required." })
  list(@Query() filter: AffiliateFilterDto) {
    return this.affiliates.list(filter);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/affiliates")
  @ApiOperation({ summary: "Criar afiliado", description: "Cria um afiliado e a respetiva conta de acesso." })
  create(@Body() body: AffiliateCreateDto) {
    return this.affiliates.create(body);
  }

  @Roles(UserRole.ADMIN)
  @Get("admin/approvals/pending")
  @ApiOperation({ summary: "List pending approvals", description: "Retrieve all affiliates whose registration is currently pending administrator approval. Access restricted to Administrator role." })
  @ApiResponse({ status: 200, description: "Successfully retrieved list of pending affiliates." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  pending(@Query() filter: AffiliateFilterDto) {
    return this.affiliates.list({ ...filter, status: "pending_approval" });
  }

  @Roles(UserRole.ADMIN)
  @Get("admin/affiliates/:id")
  @ApiOperation({ summary: "Get affiliate by ID", description: "Retrieve detailed profile information for a specific affiliate. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the affiliate record." })
  @ApiResponse({ status: 200, description: "Successfully retrieved affiliate details." })
  @ApiResponse({ status: 404, description: "Affiliate not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  async get(@Param("id") id: string) {
    return affiliateDto(await this.affiliates.find(id));
  }

  @Roles(UserRole.ADMIN)
  @Patch("admin/affiliates/:id")
  @ApiOperation({ summary: "Atualizar afiliado", description: "Atualiza dados pessoais, bancários e estado operacional do afiliado." })
  @ApiParam({ name: "id", description: "Identificador único do afiliado." })
  update(@Param("id") id: string, @Body() body: AffiliateAdminUpdateDto) {
    return this.affiliates.update(id, body);
  }

  @Roles(UserRole.ADMIN)
  @Delete("admin/affiliates/:id")
  @ApiOperation({ summary: "Eliminar afiliado", description: "Elimina afiliados sem histórico associado. Para afiliados com histórico, use suspensão/inativação." })
  @ApiParam({ name: "id", description: "Identificador único do afiliado." })
  remove(@Param("id") id: string) {
    return this.affiliates.remove(id);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/approvals/:id/approve")
  @ApiOperation({ summary: "Approve affiliate registration", description: "Approve a pending affiliate registration, transitioning their status to ACTIVE. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the affiliate record." })
  @ApiResponse({ status: 200, description: "Affiliate successfully approved." })
  @ApiResponse({ status: 404, description: "Affiliate not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  approve(@Param("id") id: string, @CurrentUser() user: any) {
    return this.affiliates.approve(id, user.id);
  }

  @Roles(UserRole.ADMIN)
  @Post("admin/approvals/:id/reject")
  @ApiOperation({ summary: "Reject affiliate registration", description: "Reject a pending affiliate registration, transitioning their status to REJECTED. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the affiliate record." })
  @ApiResponse({ status: 200, description: "Affiliate successfully rejected." })
  @ApiResponse({ status: 404, description: "Affiliate not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  reject(@Param("id") id: string) {
    return this.affiliates.reject(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch("admin/affiliates/:id/status")
  @ApiOperation({ summary: "Update affiliate status", description: "Update the operational status (active, inactive, suspended, etc.) for a specific affiliate. Access restricted to Administrator role." })
  @ApiParam({ name: "id", description: "The unique identifier of the affiliate record." })
  @ApiResponse({ status: 200, description: "Affiliate status updated successfully." })
  @ApiResponse({ status: 404, description: "Affiliate not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  updateStatus(@Param("id") id: string, @Body() body: AffiliateStatusBodyDto) {
    return this.affiliates.updateStatus(id, body.status);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Get("affiliate/profile")
  @ApiOperation({ summary: "Get current affiliate profile", description: "Retrieve profile and banking details of the currently authenticated affiliate." })
  @ApiResponse({ status: 200, description: "Successfully retrieved current profile." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  profile(@CurrentUser() user: any) {
    return affiliateDto(user.affiliate);
  }

  @Roles(UserRole.AFFILIATE, UserRole.ADMIN)
  @Patch("affiliate/profile")
  @ApiOperation({ summary: "Update current affiliate profile", description: "Update profile metadata or banking coordinates (bank name, IBAN, telephone) for the current affiliate." })
  @ApiResponse({ status: 200, description: "Profile updated successfully." })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  updateProfile(@CurrentUser() user: any, @Body() body: AffiliateProfileBodyDto) {
    return this.affiliates.updateProfile(user.affiliate.id, body);
  }
}
