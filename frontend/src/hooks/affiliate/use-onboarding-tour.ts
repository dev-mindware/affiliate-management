"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { driver, DriveStep } from "driver.js";
import {
  ONBOARDING_TOURS,
  OnboardingTourId,
} from "@/constants/onboarding-tours";
import { onboardingService } from "@/services/onboarding-service";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEY });
    },
  });
}

function getLocalTourStatus(tourId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`affiliate_tour_${tourId}`);
  } catch {
    return null;
  }
}

function setLocalTourStatus(tourId: string, status: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (status) {
      localStorage.setItem(`affiliate_tour_${tourId}`, status);
    } else {
      localStorage.removeItem(`affiliate_tour_${tourId}`);
    }
  } catch {}
}

export function useResetAllOnboardingTours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (typeof window !== "undefined") {
        try {
          for (const key of Object.keys(localStorage)) {
            if (key.startsWith("affiliate_tour_")) {
              localStorage.removeItem(key);
            }
          }
        } catch {}
      }
      return onboardingService.resetAllTours();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEY });
    },
  });
}

export function useResetOnboardingTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tourId: OnboardingTourId) => {
      setLocalTourStatus(tourId, null);
      return onboardingService.resetTour(tourId);
    },
    onSuccess: () => {
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
  const localStatus = getLocalTourStatus(tourId);
  const serverStatus = currentTourProgress?.status?.toLowerCase();

  const hasCompleted = serverStatus === "completed" || localStatus === "completed";
  const hasSkipped = serverStatus === "skipped" || localStatus === "skipped";

  const { mutateAsync: saveProgress } = useMutation({
    mutationFn: (variables: {
      status: "in_progress" | "completed" | "skipped";
      lastStepIndex?: number;
      tourVersion?: number;
    }) => onboardingService.updateTourProgress(tourId, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEY });
    },
  });

  const startTour = useCallback(async () => {
    if (typeof window === "undefined") return false;

    const tourDef = ONBOARDING_TOURS[tourId];
    if (!tourDef || !tourDef.steps || tourDef.steps.length === 0) return false;

    // Resolve active steps present and visible in the DOM
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
      console.warn(`[OnboardingTour] Nenhum elemento visível encontrado no DOM para o tour "${tourId}".`);
      return false;
    }

    activeDriverRef.current?.destroy();

    let lastActiveIndex = 0;
    let tourFinished = false;

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
      onPopoverRender: (popover) => {
        const idx = d.getActiveIndex();
        const isLast = idx !== undefined && idx >= availableSteps.length - 1;
        if (isLast) {
          const doneBtn = popover.wrapper.querySelector(".driver-popover-next-btn");
          if (doneBtn) {
            doneBtn.addEventListener(
              "click",
              () => {
                tourFinished = true;
                setLocalTourStatus(tourId, "completed");
              },
              { once: true }
            );
          }
        }
      },
      onCloseClick: () => {
        d.destroy();
      },
      onDestroyed: () => {
        const isLastStep = lastActiveIndex >= availableSteps.length - 1;
        const finalStatus = isLastStep || tourFinished ? "completed" : "skipped";

        setLocalTourStatus(tourId, finalStatus);

        saveProgress({
          status: finalStatus,
          lastStepIndex: lastActiveIndex,
          tourVersion: tourDef.version,
        }).catch((err) => {
          console.warn("[OnboardingTour] Não foi possível sincronizar com o servidor:", err);
        });

        activeDriverRef.current = null;
      },
    });

    activeDriverRef.current = d;
    d.drive(0);
    return true;
  }, [saveProgress, tourId]);

  return {
    startTour,
    hasCompleted,
    hasSkipped,
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
      attemptedRef.current = true;
      await startTour();
    }, 900);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [autoStartEnabled, enabled, hasCompleted, hasSkipped, isLoading, startTour]);
}
