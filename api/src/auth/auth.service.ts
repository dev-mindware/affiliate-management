import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AffiliateStatus, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { affiliateDto } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";

function affiliateCode() {
  return `MWD-AO-${Math.floor(1000 + Math.random() * 9000)}`;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
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

    // Enviar email com as orientações e passos a seguir pós-cadastro
    if (user.affiliate) {
      await this.mail.sendRegistrationWelcome({
        nomeCompleto: user.affiliate.nomeCompleto,
        email: user.affiliate.email,
      });
    }

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

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { affiliate: true },
    });

    if (user && user.isActive) {
      const resetToken = await this.jwt.signAsync(
        { sub: user.id, email: user.email, type: "pwd_reset" },
        { expiresIn: "1h" },
      );
      const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";
      const resetUrl = `${portalUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

      await this.mail.sendPasswordReset(
        {
          email: user.email,
          nome: user.affiliate?.nomeCompleto,
        },
        resetUrl,
      );
    }

    return {
      message: "Se o email estiver registado na nossa plataforma, foi enviada uma mensagem com instruções para redefinir a palavra-passe.",
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = await this.jwt.verifyAsync(token).catch(() => null);
    if (!payload || payload.type !== "pwd_reset" || !payload.sub) {
      throw new BadRequestException("Token de recuperação inválido ou expirado.");
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new BadRequestException("Utilizador inválido ou inativo.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return {
      message: "Palavra-passe atualizada com sucesso. Já pode iniciar sessão no portal.",
    };
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
