import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: string;
  entity?: string;
  entityId?: string;
};

const publicNotificationSelect = {
  id: true,
  userId: true,
  title: true,
  message: true,
  type: true,
  entity: true,
  entityId: true,
  readAt: true,
  createdAt: true,
};

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

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

  create(data: CreateNotificationInput) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        entity: data.entity,
        entityId: data.entityId,
      },
    });
  }
}
