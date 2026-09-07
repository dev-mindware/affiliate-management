import { Test, TestingModule } from "@nestjs/testing";
import { OnboardingTourStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { OnboardingService } from "./onboarding.service";

describe("OnboardingService", () => {
  let service: OnboardingService;
  let prisma: any;

  const mockPrismaService = {
    onboardingPreferences: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    onboardingTourProgress: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getOnboarding", () => {
    it("should return preferences and progress map for a user", async () => {
      const userId = "user-uuid-1";
      const mockPref = {
        id: "pref-1",
        userId,
        autoStartEnabled: true,
        tourButtonEnabled: true,
        updatedAt: new Date("2026-09-07T12:00:00Z"),
      };
      const mockProgress = [
        {
          tourId: "dashboard",
          status: OnboardingTourStatus.COMPLETED,
          lastStepIndex: 11,
          tourVersion: 1,
          completedAt: new Date("2026-09-07T12:05:00Z"),
          skippedAt: null,
          updatedAt: new Date("2026-09-07T12:05:00Z"),
        },
      ];

      prisma.onboardingPreferences.findUnique.mockResolvedValue(mockPref);
      prisma.onboardingTourProgress.findMany.mockResolvedValue(mockProgress);

      const result = await service.getOnboarding(userId);

      expect(result.preferences.autoStartEnabled).toBe(true);
      expect(result.preferences.tourButtonEnabled).toBe(true);
      expect(result.tours.dashboard).toBeDefined();
      expect(result.tours.dashboard.status).toBe(OnboardingTourStatus.COMPLETED);
      expect(result.tours.dashboard.lastStepIndex).toBe(11);
    });

    it("should create default preferences if none exist yet", async () => {
      const userId = "user-uuid-2";
      prisma.onboardingPreferences.findUnique.mockResolvedValue(null);
      prisma.onboardingPreferences.create.mockResolvedValue({
        id: "pref-2",
        userId,
        autoStartEnabled: true,
        tourButtonEnabled: true,
        updatedAt: new Date(),
      });
      prisma.onboardingTourProgress.findMany.mockResolvedValue([]);

      const result = await service.getOnboarding(userId);

      expect(prisma.onboardingPreferences.create).toHaveBeenCalledWith({
        data: {
          userId,
          autoStartEnabled: true,
          tourButtonEnabled: true,
        },
      });
      expect(result.preferences.autoStartEnabled).toBe(true);
      expect(result.tours).toEqual({});
    });
  });

  describe("updatePreferences", () => {
    it("should upsert user preferences", async () => {
      const userId = "user-uuid-1";
      const now = new Date();
      prisma.onboardingPreferences.upsert.mockResolvedValue({
        userId,
        autoStartEnabled: false,
        tourButtonEnabled: true,
        updatedAt: now,
      });

      const result = await service.updatePreferences(userId, { autoStartEnabled: false });

      expect(prisma.onboardingPreferences.upsert).toHaveBeenCalledWith({
        where: { userId },
        create: {
          userId,
          autoStartEnabled: false,
          tourButtonEnabled: true,
        },
        update: {
          autoStartEnabled: false,
        },
      });
      expect(result.autoStartEnabled).toBe(false);
    });
  });

  describe("updateTourProgress", () => {
    it("should upsert tour progress with COMPLETED status", async () => {
      const userId = "user-uuid-1";
      const tourId = "wallet";
      const now = new Date();

      prisma.onboardingTourProgress.upsert.mockResolvedValue({
        userId,
        tourId,
        status: OnboardingTourStatus.COMPLETED,
        lastStepIndex: 7,
        tourVersion: 1,
        completedAt: now,
        skippedAt: null,
        updatedAt: now,
      });

      const result = await service.updateTourProgress(userId, tourId, {
        status: OnboardingTourStatus.COMPLETED,
        lastStepIndex: 7,
        tourVersion: 1,
      });

      expect(result.status).toBe(OnboardingTourStatus.COMPLETED);
      expect(result.lastStepIndex).toBe(7);
      expect(prisma.onboardingTourProgress.upsert).toHaveBeenCalled();
    });
  });

  describe("resetTour and resetAllTours", () => {
    it("should delete progress for a single tour", async () => {
      prisma.onboardingTourProgress.deleteMany.mockResolvedValue({ count: 1 });
      const result = await service.resetTour("user-1", "dashboard");
      expect(result.success).toBe(true);
      expect(result.tourId).toBe("dashboard");
    });

    it("should delete progress for all tours of a user", async () => {
      prisma.onboardingTourProgress.deleteMany.mockResolvedValue({ count: 4 });
      const result = await service.resetAllTours("user-1");
      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(4);
    });
  });
});
