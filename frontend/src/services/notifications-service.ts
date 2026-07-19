import { api } from "./api";

export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  entity?: string;
  entityId?: string;
  readAt: string | null;
  createdAt: string;
}

export interface StreamTicketResponse {
  ticket: string;
  expiresIn: number;
  streamUrl: string;
}

export const notificationsService = {
  async list(limit = 10, unreadOnly = false): Promise<NotificationResponse[]> {
    const response = await api.get<NotificationResponse[]>("/notifications", {
      params: { limit, unreadOnly },
    });
    return response.data;
  },

  async unreadCount(): Promise<{ count: number }> {
    const response = await api.get<{ count: number }>("/notifications/unread-count");
    return response.data;
  },

  async markAsRead(id: string): Promise<{ success: boolean }> {
    const response = await api.patch<{ success: boolean }>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    const response = await api.patch<{ success: boolean }>("/notifications/read-all");
    return response.data;
  },

  async createStreamTicket(): Promise<StreamTicketResponse> {
    const response = await api.get<StreamTicketResponse>("/notifications/stream-ticket");
    return response.data;
  },
};
export default notificationsService;
