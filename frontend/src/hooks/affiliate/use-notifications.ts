import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsService, NotificationResponse } from "@/services/notifications-service";

export function useNotifications(limit = 10) {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => notificationsService.list(limit),
    // Soft fallback while SSE is disconnected; primary updates come from the stream.
    refetchInterval: 120_000,
    staleTime: 30_000,
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: notificationsService.unreadCount,
    refetchInterval: 120_000,
    staleTime: 30_000,
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

/**
 * Opens a direct EventSource to the API (not via Vercel BFF) using a short-lived ticket.
 * Invalidates notification queries on each push event.
 */
export function useNotificationsStream(enabled = true) {
  const queryClient = useQueryClient();
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(1000);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    stoppedRef.current = false;

    const clearReconnect = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const closeSource = () => {
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    };

    const connect = async () => {
      if (stoppedRef.current) return;
      clearReconnect();
      closeSource();

      try {
        const { streamUrl } = await notificationsService.createStreamTicket();
        if (stoppedRef.current) return;

        const source = new EventSource(streamUrl);
        sourceRef.current = source;

        source.onopen = () => {
          backoffRef.current = 1000;
        };

        source.addEventListener("notification", (event) => {
          try {
            const data = JSON.parse((event as MessageEvent).data) as NotificationResponse & {
              type?: string;
            };
            if (data?.id && data?.title) {
              toast(data.title, { description: data.message, duration: 4000 });
            }
          } catch {
            /* ignore malformed payloads */
          }
          invalidate();
        });

        source.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.type === "ping" || data?.type === "connected") return;
            if (data?.id) {
              if (data.title) {
                toast(data.title, { description: data.message, duration: 4000 });
              }
              invalidate();
            }
          } catch {
            /* ignore */
          }
        };

        source.onerror = () => {
          closeSource();
          if (stoppedRef.current) return;
          const delay = Math.min(backoffRef.current, 30_000);
          backoffRef.current = Math.min(delay * 2, 30_000);
          reconnectTimerRef.current = setTimeout(() => {
            void connect();
          }, delay);
        };
      } catch {
        if (stoppedRef.current) return;
        const delay = Math.min(backoffRef.current, 30_000);
        backoffRef.current = Math.min(delay * 2, 30_000);
        reconnectTimerRef.current = setTimeout(() => {
          void connect();
        }, delay);
      }
    };

    void connect();

    return () => {
      stoppedRef.current = true;
      clearReconnect();
      closeSource();
    };
  }, [enabled, queryClient]);
}

export default useNotifications;
