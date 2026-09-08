import { BadRequestException, Injectable } from "@nestjs/common";
import { dateRange, normalizePagination, orderBy, paginated } from "../common/filters/pagination";
import { serviceDto } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { ServiceFilterDto } from "./dto/service-filter.dto";

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async list(filter: ServiceFilterDto, publicOnly = false) {
    const p = normalizePagination(filter);
    const where: any = { ...dateRange(filter) };
    if (publicOnly) where.ativo = true;
    if (filter.active !== undefined) where.ativo = filter.active;
    if (filter.search) {
      where.OR = [
        { nome: { contains: filter.search, mode: "insensitive" } },
        { descricao: { contains: filter.search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip: p.skip,
        take: p.limit,
        orderBy: orderBy(filter, { nome: "nome", created_at: "createdAt", createdAt: "createdAt", preco: "preco" }, "nome"),
      }),
      this.prisma.service.count({ where }),
    ]);
    return paginated(items.map(serviceDto), total, p.page, p.limit);
  }

  async create(body: any) {
    const nome = String(body.nome || "").trim();
    if (!nome) throw new BadRequestException("O nome do serviço é obrigatório.");

    const existing = await this.prisma.service.findFirst({
      where: { nome: { equals: nome, mode: "insensitive" } },
    });
    if (existing) {
      throw new BadRequestException("Já existe um serviço registado com este nome.");
    }

    return serviceDto(await this.prisma.service.create({ data: {
      nome,
      descricao: body.descricao,
      preco: Number(body.preco),
      comissao: Number(body.comissao),
      ativo: body.ativo ?? true,
    } }));
  }

  async update(id: number, body: any) {
    if (body.nome) {
      const nome = String(body.nome).trim();
      const existing = await this.prisma.service.findFirst({
        where: {
          nome: { equals: nome, mode: "insensitive" },
          id: { not: id },
        },
      });
      if (existing) {
        throw new BadRequestException("Já existe outro serviço registado com este nome.");
      }
      body.nome = nome;
    }
    return serviceDto(await this.prisma.service.update({ where: { id }, data: body }));
  }

  async remove(id: number) {
    await this.prisma.service.delete({ where: { id } });
    return { msg: "Servico eliminado com sucesso" };
  }
}
