import { api } from "./api";
import type { OnboardingTourId } from "@/constants/onboarding-tours";

export interface OnboardingTourProgressItem {
  status: "in_progress" | "completed" | "skipped";
  lastStepIndex: number | null;
  tourVersion: number;
  completedAt?: string | null;
  skippedAt?: string | null;
  updatedAt: string;
}

export interface OnboardingPreferencesResponse {
  preferences: {
    autoStartEnabled: boolean;
    tourButtonEnabled: boolean;
  };
  tours: Partial<Record<OnboardingTourId, OnboardingTourProgressItem>>;
  updatedAt: string;
}

export interface UpdatePreferencesPayload {
  autoStartEnabled?: boolean;
  tourButtonEnabled?: boolean;
}

export interface UpdateTourProgressPayload {
  status: "in_progress" | "completed" | "skipped" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
  lastStepIndex?: number | null;
  tourVersion?: number;
}

export const onboardingService = {
  async getOnboarding(): Promise<OnboardingPreferencesResponse> {
    const response = await api.get<OnboardingPreferencesResponse>("/onboarding");
    return response.data;
  },

  async updatePreferences(payload: UpdatePreferencesPayload): Promise<{
    autoStartEnabled: boolean;
    tourButtonEnabled: boolean;
    updatedAt: string;
  }> {
    const response = await api.patch("/onboarding/preferences", payload);
    return response.data;
  },

  async updateTourProgress(
    tourId: OnboardingTourId,
    payload: UpdateTourProgressPayload,
  ): Promise<OnboardingTourProgressItem & { tourId: string }> {
    const response = await api.put(`/onboarding/tours/${tourId}`, payload);
    return response.data;
  },

  async resetTour(tourId: OnboardingTourId): Promise<{ success: boolean; tourId: string }> {
    const response = await api.delete(`/onboarding/tours/${tourId}`);
    return response.data;
  },

  async resetAllTours(): Promise<{ success: boolean; deletedCount: number }> {
    const response = await api.delete("/onboarding/tours");
    return response.data;
  },
};

export default onboardingService;
