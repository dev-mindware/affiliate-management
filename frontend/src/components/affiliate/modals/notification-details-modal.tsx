"use client";

import { GlobalModal, Separator } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { NotificationResponse } from "@/services/notifications-service";
import { formatDate } from "@workspace/utils";

export function NotificationDetailsModal() {
  const { modalData } = useModalStore();
  const notification = modalData["view-notification-details"] as NotificationResponse;

  if (!notification) return null;

  return (
    <GlobalModal
      id="view-notification-details"
      title="Detalhes da Notificação"
      className="sm:max-w-[500px]"
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase">Título</p>
          <p className="font-semibold text-base mt-0.5">{notification.title}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Tipo</p>
            <p className="font-medium mt-0.5 capitalize">{notification.type}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Recebida em</p>
            <p className="font-medium mt-0.5">{formatDate(notification.createdAt)}</p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-xs text-muted-foreground uppercase mb-1">Mensagem</p>
          <p className="text-sm bg-muted p-4 rounded-md leading-relaxed whitespace-pre-line">
            {notification.message}
          </p>
        </div>
      </div>
    </GlobalModal>
  );
}
