import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AffiliateStatus, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { toAffiliateStatus, toCertificationStatus, toPartnerLevel, toPartnerType } from "../common/enum-mappers";
import { dateRange, normalizePagination, orderBy, paginated } from "../common/filters/pagination";
import { affiliateDto } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { AffiliateFilterDto } from "./dto/affiliate-filter.dto";

function affiliateCode() {
  return `MWD-AO-${Math.floor(1000 + Math.random() * 9000)}`;
}

@Injectable()
export class AffiliatesService {
  constructor(private prisma: PrismaService, private wallet: WalletService) {}

  async list(filter: AffiliateFilterDto) {
    const p = normalizePagination(filter);
    const where: any = { ...dateRange(filter) };
    if (filter.status) where.status = toAffiliateStatus(filter.status);
    if (filter.level) where.partnerLevel = toPartnerLevel(filter.level);
    if (filter.certification) where.certificationStatus = toCertificationStatus(filter.certification);
    if (filter.partnerType) where.partnerType = toPartnerType(filter.partnerType);
    if (filter.search) {
      where.OR = [
        { nomeCompleto: { contains: filter.search, mode: "insensitive" } },
        { email: { contains: filter.search, mode: "insensitive" } },
        { codigoAfiliado: { contains: filter.search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.affiliate.findMany({
        where,
        skip: p.skip,
        take: p.limit,
        orderBy: orderBy(filter, { created_at: "createdAt", createdAt: "createdAt", nome: "nomeCompleto", total_earned: "totalEarned" }, "created_at"),
      }),
      this.prisma.affiliate.count({ where }),
    ]);
    return paginated(items.map(affiliateDto), total, p.page, p.limit);
  }

  async find(id: string) {
    const affiliate = await this.prisma.affiliate.findUnique({ where: { id } });
    if (!affiliate) throw new NotFoundException("Afiliado não encontrado");
    return affiliate;
  }

  async create(body: any) {
    const userExists = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (userExists) throw new BadRequestException("Já existe um utilizador com este email");

    const affiliate = await this.prisma.$transaction(async (tx) => {
      let code = affiliateCode();
      while (await tx.affiliate.findUnique({ where: { codigoAfiliado: code } })) {
        code = affiliateCode();
      }

      const user = await tx.user.create({
        data: {
          email: body.email,
          passwordHash: await bcrypt.hash(body.password || "Mindware123", 10),
          role: UserRole.AFFILIATE,
          isActive: true,
        },
      });

      return tx.affiliate.create({
        data: {
          userId: user.id,
          nomeCompleto: body.nome_completo,
          email: body.email,
          telefone: body.telefone,
          contaBancaria: body.conta_bancaria,
          banco: body.banco,
          codigoAfiliado: code,
          status: body.status ? toAffiliateStatus(body.status) : AffiliateStatus.ACTIVE,
          approvedAt: body.status === "active" || !body.status ? new Date() : undefined,
        },
      });
    });

    if (affiliate.status === AffiliateStatus.ACTIVE) {
      await this.wallet.ensureWallet(affiliate.id);
    }

    return affiliateDto(affiliate);
  }

  async update(id: string, body: any) {
    const current = await this.find(id);
    if (body.email && body.email !== current.email) {
      const userExists = await this.prisma.user.findUnique({ where: { email: body.email } });
      if (userExists && userExists.id !== current.userId) {
        throw new BadRequestException("Já existe um utilizador com este email");
      }
    }

    const affiliate = await this.prisma.$transaction(async (tx) => {
      if (body.email && current.userId) {
        await tx.user.update({ where: { id: current.userId }, data: { email: body.email } });
      }

      return tx.affiliate.update({
        where: { id },
        data: {
          nomeCompleto: body.nome_completo,
          email: body.email,
          telefone: body.telefone,
          contaBancaria: body.conta_bancaria,
          banco: body.banco,
          status: body.status ? toAffiliateStatus(body.status) : undefined,
        },
      });
    });

    if (affiliate.status === AffiliateStatus.ACTIVE) {
      await this.wallet.ensureWallet(affiliate.id);
    }

    return affiliateDto(affiliate);
  }

  async remove(id: string) {
    const affiliate = await this.find(id);
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.affiliate.delete({ where: { id } });
        if (affiliate.userId) {
          await tx.user.delete({ where: { id: affiliate.userId } });
        }
      });
    } catch {
      throw new BadRequestException("Não é possível eliminar afiliados com histórico associado. Suspenda ou inative o registo.");
    }
    return { deleted: true, id };
  }

  async approve(id: string, adminId: string) {
    const affiliate = await this.prisma.affiliate.update({
      where: { id },
      data: { status: AffiliateStatus.ACTIVE, approvedAt: new Date(), approvedBy: adminId },
    });
    await this.wallet.ensureWallet(affiliate.id);
    return affiliateDto(affiliate);
  }

  async reject(id: string) {
    return affiliateDto(await this.prisma.affiliate.update({ where: { id }, data: { status: AffiliateStatus.REJECTED } }));
  }

  async updateStatus(id: string, status: string) {
    return affiliateDto(await this.prisma.affiliate.update({ where: { id }, data: { status: toAffiliateStatus(status) } }));
  }

  async updateProfile(id: string, body: any) {
    return affiliateDto(await this.prisma.affiliate.update({
      where: { id },
      data: {
        telefone: body.telefone,
        contaBancaria: body.conta_bancaria,
        banco: body.banco,
      },
    }));
  }

  async getMindgestClients(affiliateCode: string, query: any) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const axios = require("axios");
    const mindgestUrl = process.env.MINDGEST_API_URL || "http://localhost:3001";
    const apiKey = process.env.MINDGEST_API_KEY || "MG_REg4eFg5eDJQU0lmNWcKUQU0YN3BDZDNvU2dnSnQ5OXRiL3NtbEhqSzhpdXNDZ2V6T2NwbzlCYnJDRWBTkJna3Foa2lHOXcwQkFRRUZBQVNZkbQo2lmN4eFg_MG";

    try {
      const response = await axios.get(`${mindgestUrl}/users/affiliate/${affiliateCode}`, {
        params: query,
        headers: {
          "x-api-key": apiKey,
        },
      });
      return response.data;
    } catch (error: any) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      throw new BadRequestException(`Erro ao conectar à API do MindGest: ${message}`);
    }
  }
}
