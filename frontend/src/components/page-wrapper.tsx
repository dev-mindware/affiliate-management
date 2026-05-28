"use client";

import React from "react";
import { PageWrapper as BasePageWrapper } from "@workspace/ui";
import { NotificationBell } from "./affiliate/notification-bell";

type Props = React.ComponentProps<typeof BasePageWrapper>;

export function PageWrapper({ rightHeaderActions, ...props }: Props) {
  return (
    <BasePageWrapper
      rightHeaderActions={
        <div className="flex items-center gap-2">
          <NotificationBell />
          {rightHeaderActions}
        </div>
      }
      {...props}
    />
  );
}
export default PageWrapper;
