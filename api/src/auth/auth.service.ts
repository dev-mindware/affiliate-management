import { BadRequestException, Injectable, Logger, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AffiliateStatus, Prisma, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { affiliateDto } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";

function affiliateCode() {
  return `MWD-AO-${Math.floor(1000 + Math.random() * 9000)}`;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  async onModuleInit() {
    await this.initAdminFromEnv();
  }

  async initAdminFromEnv() {
    const email = (process.env.FIRST_ADMIN_EMAIL || "admin@mindware.ao").trim().toLowerCase();
    const password = process.env.FIRST_ADMIN_PASSWORD || "admin-password";
    if (!email || !password) return;

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const admin = await this.prisma.user.upsert({
        where: { email },
        update: {
          role: UserRole.ADMIN,
          isActive: true,
          passwordHash,
        },
        create: {
          email,
          passwordHash,
          role: UserRole.ADMIN,
          isActive: true,
        },
      });

      // O administrador gere o sistema e não deve figurar como afiliado
      const adminAffiliate = await this.prisma.affiliate.findFirst({
        where: { OR: [{ userId: admin.id }, { email }] },
      });
      if (adminAffiliate) {
        await this.prisma.affiliate.delete({ where: { id: adminAffiliate.id } });
        this.logger.log(`Registo indevido de afiliado para o admin ${email} foi removido.`);
      }

      this.logger.log(`Conta de administrador sincronizada com sucesso a partir do .env: ${email}`);
    } catch (error: any) {
      this.logger.warn(`Falha ao sincronizar administrador inicial: ${error?.message || error}`);
    }
  }

  async register(body: any) {
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) throw new BadRequestException("O email é obrigatório");

    // 1. Não permitir registo duplicado por email (User ou Affiliate, case-insensitive)
    const existingUser = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      include: { affiliate: true },
    });
    const existingAffiliate = await this.prisma.affiliate.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (existingUser || existingAffiliate) {
      const status = existingUser?.affiliate?.status || existingAffiliate?.status;
      if (status === AffiliateStatus.PENDING_APPROVAL) {
        throw new BadRequestException(
          "Já existe um registo com este endereço de email em análise pela administração. Aguarde a aprovação da sua conta.",
        );
      }
      if (status === AffiliateStatus.ACTIVE) {
        throw new BadRequestException(
          "Já existe uma conta ativa com este endereço de email. Não é permitido criar mais de um registo de afiliado.",
        );
      }
      throw new BadRequestException(
        "Este email já se encontra registado no sistema. Não é permitido que um afiliado se registe mais de uma vez.",
      );
    }

    // 2. Não permitir registo duplicado por número de telefone (se fornecido)
    if (body.telefone) {
      const cleanPhone = String(body.telefone).replace(/\D/g, "");
      if (cleanPhone.length >= 9) {
        const last9 = cleanPhone.slice(-9);
        const existingPhone = await this.prisma.affiliate.findFirst({
          where: {
            telefone: {
              contains: last9,
            },
          },
        });
        if (existingPhone) {
          throw new BadRequestException(
            "Já existe um afiliado registado com este número de telefone. Não é permitido registar-se mais de uma vez.",
          );
        }
      }
    }

    // 3. Não permitir registo duplicado por conta bancária / IBAN (se fornecido)
    if (body.conta_bancaria) {
      const cleanIban = String(body.conta_bancaria).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      if (cleanIban.length >= 10) {
        const affiliatesWithIban = await this.prisma.affiliate.findMany({
          where: { contaBancaria: { not: null } },
          select: { contaBancaria: true },
        });
        const duplicateIban = affiliatesWithIban.find(
          (a) => a.contaBancaria && a.contaBancaria.replace(/[^A-Za-z0-9]/g, "").toUpperCase() === cleanIban,
        );
        if (duplicateIban) {
          throw new BadRequestException(
            "Já existe um afiliado registado com este IBAN / conta bancária. Não é permitido registar-se mais de uma vez.",
          );
        }
      }
    }

    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(body.password, 10),
          role: UserRole.AFFILIATE,
          affiliate: {
            create: {
              nomeCompleto: body.nome_completo,
              email,
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException(
          "Já existe um registo no sistema com estes dados. Não é permitido mais de um cadastro por afiliado.",
        );
      }
      throw error;
    }

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
