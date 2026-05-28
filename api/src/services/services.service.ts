import { Injectable } from "@nestjs/common";
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
    return serviceDto(await this.prisma.service.create({ data: {
      nome: body.nome,
      descricao: body.descricao,
      preco: Number(body.preco),
      comissao: Number(body.comissao),
      ativo: body.ativo ?? true,
    } }));
  }

  async update(id: number, body: any) {
    return serviceDto(await this.prisma.service.update({ where: { id }, data: body }));
  }

  async remove(id: number) {
    await this.prisma.service.delete({ where: { id } });
    return { msg: "Servico eliminado com sucesso" };
  }
}
