"use client";

import React from "react";
import { PageWrapper as BasePageWrapper } from "@workspace/ui";
import { NotificationBell } from "./affiliate/notification-bell";
import { OnboardingTourButton } from "./shared/onboarding-tour-button";
import type { OnboardingTourId } from "@/constants/onboarding-tours";

type Props = React.ComponentProps<typeof BasePageWrapper> & {
  tourId?: OnboardingTourId;
  autoStartTour?: boolean;
};

export function PageWrapper({
  tourId,
  autoStartTour = true,
  rightHeaderActions,
  ...props
}: Props) {
  return (
    <BasePageWrapper
      rightHeaderActions={
        <div className="flex items-center gap-2">
          <NotificationBell />
          {tourId && (
            <OnboardingTourButton tourId={tourId} autoStart={autoStartTour} />
          )}
          {rightHeaderActions}
        </div>
      }
      {...props}
    />
  );
}
export default PageWrapper;
