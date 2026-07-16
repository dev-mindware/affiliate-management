import { Body, Controller, Headers, HttpException, HttpStatus, Post, Ip, Get, Param } from "@nestjs/common";
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
import * as crypto from "crypto";

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

  private async logAudit(endpoint: string, ip: string, eventId: string | null, result: string) {
    try {
      await this.prisma.webhookAuditLog.create({
        data: {
          endpoint,
          ipAddress: ip,
          eventId,
          result,
        },
      });
    } catch (err) {
      console.error("Failed to write webhook audit log:", err);
    }
  }

  private async assertSecret(secret: string | undefined, endpoint: string, ip: string, eventId: string | null) {
    const expected = this.config.get<string>("WEBHOOK_SECRET");
    if (!secret || !expected || secret.length !== expected.length) {
      await this.logAudit(endpoint, ip, eventId, "rejected_secret");
      throw new HttpException("Secret de webhook invalido", HttpStatus.UNAUTHORIZED);
    }
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(secret, "utf-8"),
      Buffer.from(expected, "utf-8"),
    );
    if (!isMatch) {
      await this.logAudit(endpoint, ip, eventId, "rejected_secret");
      throw new HttpException("Secret de webhook invalido", HttpStatus.UNAUTHORIZED);
    }
  }

  private async assertFreshness(timestamp: string | undefined, endpoint: string, ip: string, eventId: string | null) {
    const ts = Number(timestamp);
    if (!timestamp || !Number.isFinite(ts)) {
      await this.logAudit(endpoint, ip, eventId, "rejected_replay_missing_timestamp");
      throw new HttpException("Timestamp de webhook invalido ou ausente", HttpStatus.BAD_REQUEST);
    }
    const ageSeconds = Math.abs(Date.now() / 1000 - ts);
    if (ageSeconds > 300) {
      await this.logAudit(endpoint, ip, eventId, "rejected_replay_expired");
      throw new HttpException("Timestamp de webhook expirado", HttpStatus.BAD_REQUEST);
    }
  }

  @Post("conversion")
  @ApiOperation({ summary: "Post a conversion webhook", description: "Registers a manual or automated conversion event that allocates a commission to an active affiliate." })
  @ApiHeader({ name: "x-webhook-secret", description: "The webhook auth secret token.", required: true })
  @ApiHeader({ name: "x-webhook-timestamp", description: "The webhook timestamp header for replay protection.", required: true })
  @ApiResponse({ status: 201, description: "Conversion registered successfully and commission created." })
  @ApiResponse({ status: 400, description: "Affiliate code not found, inactive or replay/validation error." })
  @ApiResponse({ status: 401, description: "Invalid webhook secret." })
  async conversion(
    @Body() body: WebhookConversionDto,
    @Ip() ip: string,
    @Headers("x-webhook-secret") secret?: string,
    @Headers("x-webhook-timestamp") timestamp?: string,
  ) {
    const eventId = body.external_event_id || null;
    await this.assertSecret(secret, "conversion", ip, eventId);
    await this.assertFreshness(timestamp, "conversion", ip, eventId);

    const affiliate = await this.prisma.affiliate.findFirst({ where: { codigoAfiliado: body.affiliate_code, status: AffiliateStatus.ACTIVE } });
    if (!affiliate) {
      await this.logAudit("conversion", ip, eventId, "rejected_affiliate_not_found");
      throw new HttpException("Afiliado nao encontrado ou inactivo", HttpStatus.BAD_REQUEST);
    }

    const result = await this.commissions.create({ ...body, affiliate_id: affiliate.id });
    const isDup = (result as any).duplicated === true;
    await this.logAudit("conversion", ip, eventId, isDup ? "rejected_duplicate" : "ok");
    return result;
  }

  @Post("subscription-payment")
  @ApiOperation({ summary: "Post a subscription payment webhook", description: "Records a subscription payment event from an external billing platform, updating/extending the affiliate partner subscription status and generating respective commissions." })
  @ApiHeader({ name: "x-webhook-secret", description: "The webhook auth secret token.", required: true })
  @ApiHeader({ name: "x-webhook-timestamp", description: "The webhook timestamp header for replay protection.", required: true })
  @ApiResponse({ status: 201, description: "Subscription payment registered successfully, commission generated/updated." })
  @ApiResponse({ status: 401, description: "Invalid webhook secret." })
  async subscriptionPayment(
    @Body() body: SubscriptionPaymentDto,
    @Ip() ip: string,
    @Headers("x-webhook-secret") secret?: string,
    @Headers("x-webhook-timestamp") timestamp?: string,
  ) {
    const eventId = body.external_payment_id || null;
    await this.assertSecret(secret, "subscription-payment", ip, eventId);
    await this.assertFreshness(timestamp, "subscription-payment", ip, eventId);

    const result = await this.partner.registerPayment(body, PartnerPaymentSource.WEBHOOK);
    await this.logAudit("subscription-payment", ip, eventId, result.duplicated ? "rejected_duplicate" : "ok");
    return {
      subscription: subscriptionDto(result.subscription),
      commission_id: result.commission?.id,
      commission_amount: Number(result.commission?.valorComissao || 0),
      duplicated: result.duplicated,
    };
  }

  @Get("affiliate/:code/validate")
  @ApiOperation({ summary: "Validate an affiliate code" })
  @ApiHeader({ name: "x-webhook-secret", description: "The webhook auth secret token.", required: true })
  async validateAffiliateCode(
    @Param("code") code: string,
    @Ip() ip: string,
    @Headers("x-webhook-secret") secret?: string,
  ) {
    await this.assertSecret(secret, "validate-affiliate", ip, code);
    const affiliate = await this.prisma.affiliate.findFirst({
      where: {
        codigoAfiliado: code,
        status: AffiliateStatus.ACTIVE,
      },
    });
    return {
      valid: !!affiliate,
      affiliateName: affiliate?.codigoAfiliado || null,
    };
  }
}
