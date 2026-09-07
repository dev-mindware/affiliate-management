"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { driver, DriveStep } from "driver.js";
import {
  ONBOARDING_TOURS,
  OnboardingTourId,
} from "@/constants/onboarding-tours";
import {
  onboardingService,
  type OnboardingPreferencesResponse,
  type UpdateTourProgressPayload,
} from "@/services/onboarding-service";

export const ONBOARDING_QUERY_KEY = ["onboarding"];

export function useOnboarding() {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEY,
    queryFn: () => onboardingService.getOnboarding(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useUpdateOnboardingPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { autoStartEnabled?: boolean; tourButtonEnabled?: boolean }) =>
      onboardingService.updatePreferences(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<OnboardingPreferencesResponse>(
        ONBOARDING_QUERY_KEY,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            preferences: {
              ...old.preferences,
              autoStartEnabled: updated.autoStartEnabled,
              tourButtonEnabled: updated.tourButtonEnabled,
            },
            updatedAt: updated.updatedAt,
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEY });
    },
  });
}

export function useResetAllOnboardingTours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => onboardingService.resetAllTours(),
    onSuccess: () => {
      queryClient.setQueryData<OnboardingPreferencesResponse>(
        ONBOARDING_QUERY_KEY,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tours: {},
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEY });
    },
  });
}

export function useResetOnboardingTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tourId: OnboardingTourId) => onboardingService.resetTour(tourId),
    onSuccess: (_, tourId) => {
      queryClient.setQueryData<OnboardingPreferencesResponse>(
        ONBOARDING_QUERY_KEY,
        (old) => {
          if (!old) return old;
          const nextTours = { ...old.tours };
          delete nextTours[tourId];
          return {
            ...old,
            tours: nextTours,
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEY });
    },
  });
}

export function useOnboardingTour(tourId: OnboardingTourId) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useOnboarding();
  const activeDriverRef = useRef<any>(null);

  const preferences = data?.preferences ?? {
    autoStartEnabled: true,
    tourButtonEnabled: true,
  };

  const currentTourProgress = data?.tours?.[tourId];
  const serverStatus = currentTourProgress?.status?.toLowerCase();

  const hasCompleted = serverStatus === "completed";
  const hasSkipped = serverStatus === "skipped";
  const isInProgress = serverStatus === "in_progress";

  const { mutateAsync: saveProgress } = useMutation({
    mutationFn: (variables: UpdateTourProgressPayload) =>
      onboardingService.updateTourProgress(tourId, variables),
    onSuccess: (saved) => {
      queryClient.setQueryData<OnboardingPreferencesResponse>(
        ONBOARDING_QUERY_KEY,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tours: {
              ...old.tours,
              [tourId]: {
                status: saved.status.toLowerCase() as any,
                lastStepIndex: saved.lastStepIndex ?? null,
                tourVersion: saved.tourVersion ?? 1,
                completedAt: saved.completedAt,
                skippedAt: saved.skippedAt,
                updatedAt: saved.updatedAt,
              },
            },
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEY });
    },
  });

  useEffect(() => {
    return () => {
      if (activeDriverRef.current) {
        activeDriverRef.current.destroy();
        activeDriverRef.current = null;
      }
    };
  }, []);

  const startTour = useCallback(async () => {
    if (typeof window === "undefined") return false;

    const tourDef = ONBOARDING_TOURS[tourId];
    if (!tourDef || !tourDef.steps || tourDef.steps.length === 0) return false;

    // Resolver elementos presentes e visíveis no DOM
    const availableSteps: DriveStep[] = [];
    for (const step of tourDef.steps) {
      const allMatching = Array.from(document.querySelectorAll(step.selector));
      const visibleEl = allMatching.find((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        const style = window.getComputedStyle(el);
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        );
      });

      if (visibleEl) {
        availableSteps.push({
          element: visibleEl,
          popover: {
            title: step.title,
            description: step.description,
            side: step.side ?? "bottom",
            align: step.align ?? "center",
          },
        });
      }
    }

    if (availableSteps.length === 0) {
      return false;
    }

    // Registra início do tour na API caso ainda esteja pendente
    if (!hasCompleted && !isInProgress) {
      saveProgress({
        status: "in_progress",
        lastStepIndex: 0,
        tourVersion: tourDef.version,
      }).catch((err) => {
        console.warn("[OnboardingTour] Aviso ao marcar início do tour na API:", err);
      });
    }

    activeDriverRef.current?.destroy();

    let lastActiveIndex = 0;
    let tourFinished = false;
    const wasAlreadyCompleted = hasCompleted;

    const d = driver({
      steps: availableSteps,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      allowKeyboardControl: true,
      disableActiveInteraction: true,
      overlayOpacity: 0.65,
      stagePadding: 6,
      stageRadius: 12,
      popoverOffset: 12,
      popoverClass: "affiliate-tour-popover",
      showButtons: ["next", "previous", "close"],
      showProgress: true,
      progressText: "{{current}} de {{total}}",
      nextBtnText: "Seguinte",
      prevBtnText: "Anterior",
      doneBtnText: "Concluir",
      onHighlighted: () => {
        try {
          const idx = d.getActiveIndex();
          if (idx !== undefined && idx !== null) {
            lastActiveIndex = idx;
          }
        } catch {}
      },
      onDoneClick: () => {
        tourFinished = true;
        saveProgress({
          status: "completed",
          lastStepIndex: availableSteps.length - 1,
          tourVersion: tourDef.version,
        }).catch((err) => {
          console.error("[OnboardingTour] Falha ao persistir conclusão na API:", err);
        });
        d.destroy();
      },
      onNextClick: () => {
        if (d.isLastStep()) {
          tourFinished = true;
          saveProgress({
            status: "completed",
            lastStepIndex: availableSteps.length - 1,
            tourVersion: tourDef.version,
          }).catch((err) => {
            console.error("[OnboardingTour] Falha ao persistir conclusão na API:", err);
          });
          d.destroy();
        } else {
          d.moveNext();
        }
      },
      onCloseClick: () => {
        tourFinished = false;
        d.destroy();
      },
      onDestroyed: () => {
        if (!tourFinished) {
          // Se já estava concluído previamente, fechar a revisão não deve marcar como ignorado
          if (!wasAlreadyCompleted) {
            const isLastStep = lastActiveIndex >= availableSteps.length - 1;
            const finalStatus = isLastStep ? "completed" : "skipped";

            saveProgress({
              status: finalStatus,
              lastStepIndex: lastActiveIndex,
              tourVersion: tourDef.version,
            }).catch((err) => {
              console.error("[OnboardingTour] Falha ao persistir status do tour na API:", err);
            });
          }
        }
        activeDriverRef.current = null;
      },
    });

    activeDriverRef.current = d;
    d.drive(0);
    return true;
  }, [hasCompleted, isInProgress, saveProgress, tourId]);

  return {
    startTour,
    hasCompleted,
    hasSkipped,
    isInProgress,
    autoStartEnabled: preferences.autoStartEnabled,
    tourButtonEnabled: preferences.tourButtonEnabled,
    isLoading,
  };
}

export function useAutoOnboardingTour(tourId: OnboardingTourId, enabled = true) {
  const { startTour, hasCompleted, hasSkipped, autoStartEnabled, isLoading } =
    useOnboardingTour(tourId);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (
      !enabled ||
      isLoading ||
      !autoStartEnabled ||
      hasCompleted ||
      hasSkipped ||
      attemptedRef.current
    ) {
      return;
    }

    let isMounted = true;
    const timer = window.setTimeout(async () => {
      if (!isMounted || attemptedRef.current) return;
      const started = await startTour();
      if (started) {
        attemptedRef.current = true;
      }
    }, 900);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [autoStartEnabled, enabled, hasCompleted, hasSkipped, isLoading, startTour]);
}
