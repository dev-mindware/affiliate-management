export const NOTIFICATION_CREATED_EVENT = "notification.created";

export type PublicNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  entity?: string | null;
  entityId?: string | null;
  readAt: Date | string | null;
  createdAt: Date | string;
};

export const publicNotificationSelect = {
  id: true,
  userId: true,
  title: true,
  message: true,
  type: true,
  entity: true,
  entityId: true,
  readAt: true,
  createdAt: true,
} as const;
