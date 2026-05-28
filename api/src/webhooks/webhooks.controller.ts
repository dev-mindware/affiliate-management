import { Body, Controller, Headers, HttpException, HttpStatus, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import { AffiliateStatus, PartnerPaymentSource } from "@prisma/client";
import { Public } from "../auth/decorators/public.decorator";
import { CommissionsService } from "../commissions/commissions.service";
import { commissionDto, subscriptionDto } from "../common/serializers";
import { PartnerProgramService } from "../partner-program/partner-program.service";
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
  async conversion(@Body() body: any, @Headers("x-webhook-secret") secret?: string) {
    this.assertSecret(secret);
    const affiliate = await this.prisma.affiliate.findFirst({ where: { codigoAfiliado: body.affiliate_code, status: AffiliateStatus.ACTIVE } });
    if (!affiliate) throw new HttpException("Afiliado nao encontrado ou inactivo", HttpStatus.BAD_REQUEST);
    return this.commissions.create({ ...body, affiliate_id: affiliate.id });
  }

  @Post("subscription-payment")
  async subscriptionPayment(@Body() body: any, @Headers("x-webhook-secret") secret?: string) {
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
