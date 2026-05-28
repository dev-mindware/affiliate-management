import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { AdminDashboardModule } from "./admin-dashboard/admin-dashboard.module";
import { AffiliatesModule } from "./affiliates/affiliates.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { CommissionsModule } from "./commissions/commissions.module";
import { LeadsModule } from "./leads/leads.module";
import { PartnerProgramModule } from "./partner-program/partner-program.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PublicModule } from "./public/public.module";
import { ServicesModule } from "./services/services.module";
import { WalletModule } from "./wallet/wallet.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { WithdrawalsModule } from "./withdrawals/withdrawals.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PublicModule,
    AdminDashboardModule,
    AffiliatesModule,
    ServicesModule,
    LeadsModule,
    CommissionsModule,
    WalletModule,
    WithdrawalsModule,
    PartnerProgramModule,
    WebhooksModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
