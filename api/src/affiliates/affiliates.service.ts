import { Injectable, NotFoundException } from "@nestjs/common";
import { AffiliateStatus } from "@prisma/client";
import { toAffiliateStatus, toCertificationStatus, toPartnerLevel, toPartnerType } from "../common/enum-mappers";
import { dateRange, normalizePagination, orderBy, paginated } from "../common/filters/pagination";
import { affiliateDto } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { AffiliateFilterDto } from "./dto/affiliate-filter.dto";

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
    if (!affiliate) throw new NotFoundException("Afiliado nao encontrado");
    return affiliate;
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
}
