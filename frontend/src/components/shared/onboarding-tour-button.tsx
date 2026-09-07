"use client";

import { useEffect, useRef } from "react";
import { Button, Icon } from "@workspace/ui";
import {
  OnboardingTourId,
  ONBOARDING_TOURS,
} from "@/constants/onboarding-tours";
import { useOnboardingTour } from "@/hooks/affiliate";

interface OnboardingTourButtonProps {
  tourId: OnboardingTourId;
  autoStart?: boolean;
  className?: string;
}

export function OnboardingTourButton({
  tourId,
  autoStart = true,
  className = "",
}: OnboardingTourButtonProps) {
  const {
    startTour,
    tourButtonEnabled,
    hasCompleted,
    hasSkipped,
    autoStartEnabled,
    isLoading,
  } = useOnboardingTour(tourId);

  const attemptedRef = useRef(false);

  useEffect(() => {
    if (
      !autoStart ||
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
  }, [autoStart, autoStartEnabled, hasCompleted, hasSkipped, isLoading, startTour]);

  if (!tourButtonEnabled) return null;

  const tourDef = ONBOARDING_TOURS[tourId];

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => startTour()}
      title={tourDef?.title ?? "Ver guia interativo desta tela"}
      className={`h-8 gap-1.5 rounded-lg border-primary/25 bg-background/90 text-xs font-semibold text-foreground shadow-2xs hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer ${className}`}
    >
      <Icon name="CircleHelp" className="size-3.5 text-primary" />
      <span className="hidden sm:inline">Ver guia</span>
    </Button>
  );
}

export default OnboardingTourButton;
