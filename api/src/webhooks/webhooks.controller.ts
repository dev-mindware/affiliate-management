import { Body, Controller, Headers, HttpException, HttpStatus, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import { AffiliateStatus, PartnerPaymentSource } from "@prisma/client";
import { Public } from "../auth/decorators/public.decorator";
import { CommissionsService } from "../commissions/commissions.service";
import { WebhookConversionDto } from "../commissions/dto/commission-body.dto";
import { subscriptionDto } from "../common/serializers";
import { PartnerProgramService } from "../partner-program/partner-program.service";
import { SubscriptionPaymentDto } from "../partner-program/dto/partner-body.dto";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("webhooks")
@Public()
@Controller("webhook")
export class WebhooksController {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private commissions: CommissionsService,
    private partner: PartnerProgramService,
  ) {}

  private assertSecret(secret?: string) {
    if (secret !== this.config.get("WEBHOOK_SECRET")) {
      throw new HttpException("Secret de webhook invalido", HttpStatus.UNAUTHORIZED);
    }
  }

  @Post("conversion")
  @ApiOperation({ summary: "Post a conversion webhook", description: "Registers a manual or automated conversion event that allocates a commission to an active affiliate." })
  @ApiHeader({ name: "x-webhook-secret", description: "The webhook auth secret token.", required: true })
  @ApiResponse({ status: 201, description: "Conversion registered successfully and commission created." })
  @ApiResponse({ status: 400, description: "Affiliate code not found or affiliate is inactive." })
  @ApiResponse({ status: 401, description: "Invalid webhook secret." })
  async conversion(@Body() body: WebhookConversionDto, @Headers("x-webhook-secret") secret?: string) {
    this.assertSecret(secret);
    const affiliate = await this.prisma.affiliate.findFirst({ where: { codigoAfiliado: body.affiliate_code, status: AffiliateStatus.ACTIVE } });
    if (!affiliate) throw new HttpException("Afiliado nao encontrado ou inactivo", HttpStatus.BAD_REQUEST);
    return this.commissions.create({ ...body, affiliate_id: affiliate.id });
  }

  @Post("subscription-payment")
  @ApiOperation({ summary: "Post a subscription payment webhook", description: "Records a subscription payment event from an external billing platform, updating/extending the affiliate partner subscription status and generating respective commissions." })
  @ApiHeader({ name: "x-webhook-secret", description: "The webhook auth secret token.", required: true })
  @ApiResponse({ status: 201, description: "Subscription payment registered successfully, commission generated/updated." })
  @ApiResponse({ status: 401, description: "Invalid webhook secret." })
  async subscriptionPayment(@Body() body: SubscriptionPaymentDto, @Headers("x-webhook-secret") secret?: string) {
    this.assertSecret(secret);
    const result = await this.partner.registerPayment(body, PartnerPaymentSource.WEBHOOK);
    return {
      subscription: subscriptionDto(result.subscription),
      commission_id: result.commission?.id,
      commission_amount: Number(result.commission?.valorComissao || 0),
      duplicated: result.duplicated,
    };
  }
}
