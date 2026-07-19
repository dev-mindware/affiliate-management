"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from "@workspace/ui";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useNotificationsStream,
  useUnreadNotificationsCount,
} from "@/hooks/affiliate/use-notifications";
import { useModalStore } from "@workspace/hooks";
import { NotificationResponse } from "@/services/notifications-service";
import { formatDate } from "@workspace/utils";

export function NotificationBell() {
  useNotificationsStream(true);
  const { data: notifications = [] } = useNotifications(10);
  const { data: unread } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const { openModal } = useModalStore();

  const unreadCount = unread?.count || 0;

  const openNotification = async (notification: NotificationResponse) => {
    if (!notification.readAt) {
      await markAsRead.mutateAsync(notification.id);
    }
    openModal("view-notification-details", notification);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="relative rounded-full hover:bg-muted size-9">
          <Icon name="Bell" className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0 z-50">
        <div className="flex items-center justify-between px-4 py-2.5">
          <DropdownMenuLabel className="p-0 font-semibold text-sm">Notificações</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2 hover:bg-muted font-medium text-primary"
              onClick={() => markAllAsRead.mutate()}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[360px] overflow-y-auto p-1 divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Nenhuma notificação recente.
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex cursor-pointer items-start gap-3 rounded-md p-3 focus:bg-muted"
                onClick={() => openNotification(notification)}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    notification.readAt ? "bg-muted" : "bg-primary"
                  }`}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className={`truncate text-sm ${notification.readAt ? "text-muted-foreground font-normal" : "text-foreground font-semibold"}`}>
                    {notification.title}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground leading-normal">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium pt-0.5">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export default NotificationBell;
