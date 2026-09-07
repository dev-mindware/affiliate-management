import { Injectable, Logger } from "@nestjs/common";
import { OnboardingTourStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { enumOut } from "../common/enum-mappers";
import { UpdateOnboardingPreferencesDto, UpdateOnboardingTourProgressDto } from "./dto/onboarding.dto";

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOnboarding(userId: string) {
    let preferences = await this.prisma.onboardingPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await this.prisma.onboardingPreferences.create({
        data: {
          userId,
          autoStartEnabled: true,
          tourButtonEnabled: true,
        },
      });
    }

    const progressList = await this.prisma.onboardingTourProgress.findMany({
      where: { userId },
    });

    const tours: Record<
      string,
      {
        status: OnboardingTourStatus;
        lastStepIndex: number | null;
        tourVersion: number;
        completedAt?: Date | null;
        skippedAt?: Date | null;
        updatedAt: Date;
      }
    > = {};

    for (const item of progressList) {
      tours[item.tourId] = {
        status: item.status,
        lastStepIndex: item.lastStepIndex,
        tourVersion: item.tourVersion,
        completedAt: item.completedAt,
        skippedAt: item.skippedAt,
        updatedAt: item.updatedAt,
      };
    }

    return {
      preferences: {
        autoStartEnabled: preferences.autoStartEnabled,
        tourButtonEnabled: preferences.tourButtonEnabled,
      },
      tours,
      updatedAt: preferences.updatedAt,
    };
  }

  async updatePreferences(userId: string, dto: UpdateOnboardingPreferencesDto) {
    const preferences = await this.prisma.onboardingPreferences.upsert({
      where: { userId },
      create: {
        userId,
        autoStartEnabled: dto.autoStartEnabled ?? true,
        tourButtonEnabled: dto.tourButtonEnabled ?? true,
      },
      update: {
        ...(dto.autoStartEnabled !== undefined && { autoStartEnabled: dto.autoStartEnabled }),
        ...(dto.tourButtonEnabled !== undefined && { tourButtonEnabled: dto.tourButtonEnabled }),
      },
    });

    return {
      autoStartEnabled: preferences.autoStartEnabled,
      tourButtonEnabled: preferences.tourButtonEnabled,
      updatedAt: preferences.updatedAt,
    };
  }

  async updateTourProgress(userId: string, tourId: string, dto: UpdateOnboardingTourProgressDto) {
    const now = new Date();
    const isCompleted = dto.status === OnboardingTourStatus.COMPLETED;
    const isSkipped = dto.status === OnboardingTourStatus.SKIPPED;

    const progress = await this.prisma.onboardingTourProgress.upsert({
      where: {
        userId_tourId: {
          userId,
          tourId,
        },
      },
      create: {
        userId,
        tourId,
        status: dto.status,
        lastStepIndex: dto.lastStepIndex ?? null,
        tourVersion: dto.tourVersion ?? 1,
        startedAt: now,
        completedAt: isCompleted ? now : null,
        skippedAt: isSkipped ? now : null,
      },
      update: {
        status: dto.status,
        ...(dto.lastStepIndex !== undefined && { lastStepIndex: dto.lastStepIndex }),
        ...(dto.tourVersion !== undefined && { tourVersion: dto.tourVersion }),
        ...(isCompleted && { completedAt: now }),
        ...(isSkipped && { skippedAt: now }),
      },
    });

    return {
      tourId: progress.tourId,
      status: progress.status,
      lastStepIndex: progress.lastStepIndex,
      tourVersion: progress.tourVersion,
      completedAt: progress.completedAt,
      skippedAt: progress.skippedAt,
      updatedAt: progress.updatedAt,
    };
  }

  async resetTour(userId: string, tourId: string) {
    await this.prisma.onboardingTourProgress.deleteMany({
      where: {
        userId,
        tourId,
      },
    });
    return { success: true, tourId };
  }

  async resetAllTours(userId: string) {
    const { count } = await this.prisma.onboardingTourProgress.deleteMany({
      where: { userId },
    });
    return { success: true, deletedCount: count };
  }
}
