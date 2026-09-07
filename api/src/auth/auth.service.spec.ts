import { BadRequestException } from "@nestjs/common";
import { AffiliateStatus, UserRole } from "@prisma/client";
import { AuthService } from "./auth.service";

describe("AuthService - Duplicate Registration Prevention", () => {
  let authService: AuthService;
  let prismaMock: any;
  let jwtMock: any;
  let mailMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      affiliate: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    jwtMock = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    mailMock = {
      sendRegistrationWelcome: jest.fn().mockResolvedValue(undefined),
    };

    authService = new AuthService(prismaMock, jwtMock, mailMock);
  });

  it("rejects registration when email is already registered (case-insensitive)", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: "u1",
      email: "parceiro@mindware.ao",
      role: UserRole.AFFILIATE,
      affiliate: { status: AffiliateStatus.ACTIVE },
    });

    await expect(
      authService.register({
        email: "PARCEIRO@MINDWARE.AO",
        password: "password123",
        nome_completo: "Jonatão Cardoso",
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { email: { equals: "parceiro@mindware.ao", mode: "insensitive" } },
      include: { affiliate: true },
    });
  });

  it("gives clear message when existing registration is still pending approval", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: "u1",
      email: "parceiro@mindware.ao",
      role: UserRole.AFFILIATE,
      affiliate: { status: AffiliateStatus.PENDING_APPROVAL },
    });

    await expect(
      authService.register({
        email: "parceiro@mindware.ao",
        password: "password123",
        nome_completo: "Jonatão Cardoso",
      }),
    ).rejects.toThrow(/análise pela administração/);
  });

  it("rejects duplicate registration with the same phone number", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.affiliate.findFirst
      .mockResolvedValueOnce(null) // for email check
      .mockResolvedValueOnce({ id: "a1", telefone: "+244 923 100 922" }); // for phone check

    await expect(
      authService.register({
        email: "novo@mindware.ao",
        password: "password123",
        nome_completo: "Outro Nome",
        telefone: "923100922",
      }),
    ).rejects.toThrow(/número de telefone/);
  });

  it("rejects duplicate registration with the same bank account / IBAN", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.affiliate.findFirst.mockResolvedValue(null);
    prismaMock.affiliate.findMany.mockResolvedValue([
      { id: "a1", contaBancaria: "AO06.0040.0000.1234.5678.9012.3" },
    ]);

    await expect(
      authService.register({
        email: "novo2@mindware.ao",
        password: "password123",
        nome_completo: "Outro Nome",
        conta_bancaria: "AO06004000001234567890123",
      }),
    ).rejects.toThrow(/IBAN \/ conta bancária/);
  });

  it("successfully registers when all fields are unique and dispatches welcome email", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.affiliate.findFirst.mockResolvedValue(null);
    prismaMock.affiliate.findMany.mockResolvedValue([]);

    const createdUser = {
      id: "u-new",
      email: "novo@mindware.ao",
      affiliate: {
        id: "a-new",
        nomeCompleto: "Novo Parceiro",
        email: "novo@mindware.ao",
        codigoAfiliado: "MWD-AO-9999",
        status: AffiliateStatus.PENDING_APPROVAL,
        totalEarned: 0,
        totalPaid: 0,
      },
    };
    prismaMock.user.create.mockResolvedValue(createdUser);

    const result = await authService.register({
      email: "Novo@Mindware.ao ",
      password: "password123",
      nome_completo: "Novo Parceiro",
      telefone: "+244 933 111 222",
    });

    expect(result).toHaveProperty("codigo_afiliado", "MWD-AO-9999");
    expect(mailMock.sendRegistrationWelcome).toHaveBeenCalledWith({
      nomeCompleto: "Novo Parceiro",
      email: "novo@mindware.ao",
    });
  });
});
