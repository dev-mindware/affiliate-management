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
    let mindgestUrl = (process.env.MINDGEST_API_URL || "http://localhost:3001").trim();
    mindgestUrl = mindgestUrl.replace(/^['"]|['"]$/g, "").replace(/\/+$/, "");
    if (!mindgestUrl.endsWith("/api") && !mindgestUrl.includes("/api/")) {
      mindgestUrl = `${mindgestUrl}/api`;
    }
    const apiKey = (process.env.MINDGEST_API_KEY || "").trim().replace(/^['"]|['"]$/g, "");
    if (!apiKey) {
      throw new BadRequestException("MINDGEST_API_KEY não configurada");
    }

    const url = new URL(`${mindgestUrl}/users/affiliate/${encodeURIComponent(affiliateCode)}`);
    if (query) {
      Object.keys(query).forEach((key) => {
        if (query[key] !== undefined && query[key] !== null && query[key] !== "") {
          url.searchParams.append(key, String(query[key]));
        }
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15_000),
      });

      const raw = await response.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        throw new BadRequestException(
          `MindGest respondeu com conteúdo não-JSON (HTTP ${response.status}) em ${url.origin}${url.pathname}. Verifique se MINDGEST_API_URL aponta para a API backend, não para o frontend.`,
        );
      }

      if (!response.ok) {
        const message = data?.message || data?.error || `HTTP ${response.status}`;
        throw new BadRequestException(`Erro na API do MindGest: ${message}`);
      }

      return data;
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;

      const cause = error?.cause;
      const details = [
        error?.message,
        cause?.code,
        cause?.message,
        cause?.hostname ? `host=${cause.hostname}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      throw new BadRequestException(
        `Erro ao conectar à API do MindGest (${url.origin}${url.pathname}): ${details || "falha de rede"}`,
      );
    }
  }
}
