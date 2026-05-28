import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AffiliateStatus, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { affiliateDto } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";

function affiliateCode() {
  return `MWD-AO-${Math.floor(1000 + Math.random() * 9000)}`;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(body: any) {
    const exists = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (exists) throw new BadRequestException("Email ja registado");
    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        passwordHash: await bcrypt.hash(body.password, 10),
        role: UserRole.AFFILIATE,
        affiliate: {
          create: {
            nomeCompleto: body.nome_completo,
            email: body.email,
            telefone: body.telefone,
            contaBancaria: body.conta_bancaria,
            banco: body.banco,
            codigoAfiliado: affiliateCode(),
            status: AffiliateStatus.PENDING_APPROVAL,
          },
        },
      },
      include: { affiliate: true },
    });
    return affiliateDto(user.affiliate);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email }, include: { affiliate: true } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Credenciais invalidas");
    }
    if (user.role === UserRole.AFFILIATE && user.affiliate?.status === AffiliateStatus.PENDING_APPROVAL) {
      throw new ForbiddenExceptionLike("Conta pendente de aprovacao");
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync({ ...payload, type: "access" });
    const refreshToken = await this.jwt.signAsync({ ...payload, type: "refresh" }, { expiresIn: "7d" });
    return { access_token: accessToken, refresh_token: refreshToken, token_type: "bearer" };
  }

  async me(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: String(user.role).toLowerCase(),
      affiliate: user.affiliate ? affiliateDto(user.affiliate) : null,
    };
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) throw new UnauthorizedException("Refresh token ausente");
    const payload = await this.jwt.verifyAsync(refreshToken).catch(() => null);
    if (!payload || payload.type !== "refresh") throw new UnauthorizedException("Refresh token invalido");
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, include: { affiliate: true } });
    if (!user || !user.isActive) throw new UnauthorizedException("Utilizador invalido");
    const nextPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync({ ...nextPayload, type: "access" });
    const nextRefreshToken = await this.jwt.signAsync({ ...nextPayload, type: "refresh" }, { expiresIn: "7d" });
    return { access_token: accessToken, refresh_token: nextRefreshToken, token_type: "bearer" };
  }

  async ensureAdmin(email: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) return exists;
    return this.prisma.user.create({
      data: { email, passwordHash: await bcrypt.hash(password, 10), role: UserRole.ADMIN, isActive: true },
    });
  }
}

class ForbiddenExceptionLike extends UnauthorizedException {}
