import { ServicesService } from "./services.service";

describe("ServicesService", () => {
  it("lists services with mandatory filters and pagination", async () => {
    const prisma: any = {
      service: {
        findMany: jest.fn().mockResolvedValue([{ id: 1, nome: "BASE", preco: 1000, comissao: 200, ativo: true }]),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    const service = new ServicesService(prisma);
    const result = await service.list({ page: 1, limit: 10, search: "base", active: true, orderBy: "nome", orderDirection: "asc" });

    expect(prisma.service.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ ativo: true }),
      skip: 0,
      take: 10,
      orderBy: { nome: "asc" },
    }));
    expect(result).toMatchObject({ total: 1, page: 1, limit: 10, pages: 1 });
    expect(result.items[0]).toMatchObject({ nome: "BASE", percentagem_comissao: 20 });
  });
});
