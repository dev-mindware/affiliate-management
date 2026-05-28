import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications-service";

export function useNotifications(limit = 10) {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => notificationsService.list(limit),
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: notificationsService.unreadCount,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}
export default useNotifications;
