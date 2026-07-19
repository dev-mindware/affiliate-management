import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../prisma/prisma.service";
import {
  NOTIFICATION_CREATED_EVENT,
  publicNotificationSelect,
} from "./notification.types";
import { NotificationsStreamService } from "./notifications-stream.service";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: string;
  entity?: string;
  entityId?: string;
};

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private events: EventEmitter2,
    private stream: NotificationsStreamService,
  ) {}

  findAll(userId: string, params: { skip?: number; take?: number; unreadOnly?: boolean }) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(params.unreadOnly ? { readAt: null } : {}),
      },
      skip: params.skip,
      take: params.take,
      select: publicNotificationSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.notification.findFirst({
      where: { id, userId },
      select: publicNotificationSelect,
    });
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { count };
  }

  async markAsRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async create(data: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        entity: data.entity,
        entityId: data.entityId,
      },
      select: publicNotificationSelect,
    });

    this.events.emit(NOTIFICATION_CREATED_EVENT, notification);
    return notification;
  }

  createStreamTicket(userId: string) {
    return this.stream.createTicket(userId);
  }

  async openStream(ticket: string) {
    const userId = await this.stream.consumeTicket(ticket);
    if (!userId) return null;
    return this.stream.openStream(userId);
  }
}
