import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { UpdateOnboardingPreferencesDto, UpdateOnboardingTourProgressDto } from "./dto/onboarding.dto";
import { OnboardingService } from "./onboarding.service";

@ApiTags("onboarding")
@ApiBearerAuth()
@Controller("onboarding")
@Roles(UserRole.AFFILIATE, UserRole.ADMIN)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  @ApiOperation({ summary: "Obter preferências e progresso de tours guiados do utilizador" })
  @ApiResponse({ status: 200, description: "Dados de onboarding recuperados com sucesso." })
  getOnboarding(@CurrentUser() user: any) {
    return this.onboardingService.getOnboarding(user.id);
  }

  @Patch("preferences")
  @ApiOperation({ summary: "Alterar preferências de exibição de tours (auto-start, botão ver guia)" })
  @ApiResponse({ status: 200, description: "Preferências atualizadas com sucesso." })
  updatePreferences(
    @CurrentUser() user: any,
    @Body() dto: UpdateOnboardingPreferencesDto,
  ) {
    return this.onboardingService.updatePreferences(user.id, dto);
  }

  @Put("tours/:tourId")
  @ApiOperation({ summary: "Atualizar progresso de um tour específico (passo atual, completado, pulado)" })
  @ApiResponse({ status: 200, description: "Progresso atualizado com sucesso." })
  updateTourProgress(
    @CurrentUser() user: any,
    @Param("tourId") tourId: string,
    @Body() dto: UpdateOnboardingTourProgressDto,
  ) {
    return this.onboardingService.updateTourProgress(user.id, tourId, dto);
  }

  @Delete("tours/:tourId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reiniciar o progresso de um tour específico" })
  @ApiResponse({ status: 200, description: "Tour reiniciado com sucesso." })
  resetTour(
    @CurrentUser() user: any,
    @Param("tourId") tourId: string,
  ) {
    return this.onboardingService.resetTour(user.id, tourId);
  }

  @Delete("tours")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reiniciar todos os tours guiados do utilizador" })
  @ApiResponse({ status: 200, description: "Todos os tours foram reiniciados." })
  resetAllTours(@CurrentUser() user: any) {
    return this.onboardingService.resetAllTours(user.id);
  }
}
