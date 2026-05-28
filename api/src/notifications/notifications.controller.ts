import { Controller, Get, Param, Patch, Query, NotFoundException } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { NotificationsService } from "./notifications.service";

@ApiTags("notifications")
@ApiBearerAuth()
@Controller("notifications")
@Roles(UserRole.AFFILIATE, UserRole.ADMIN)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List current user notifications", description: "Retrieve paginated list of system alerts and notifications for the logged-in session." })
  @ApiQuery({ name: "limit", required: false, description: "Maximum number of records to return (default: 10)." })
  @ApiQuery({ name: "unreadOnly", required: false, description: "If true, only unread notifications are returned." })
  @ApiResponse({ status: 200, description: "Successfully retrieved notifications." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  findAll(
    @CurrentUser() user: any,
    @Query("limit") limit = "10",
    @Query("unreadOnly") unreadOnly?: string,
  ) {
    return this.notificationsService.findAll(user.id, {
      take: Number(limit) || 10,
      unreadOnly: unreadOnly === "true",
    });
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get current user unread count", description: "Count of all unread notifications pending for the active session." })
  @ApiResponse({ status: 200, description: "Successfully retrieved unread count." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  unreadCount(@CurrentUser() user: any) {
    return this.notificationsService.unreadCount(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get notification by ID", description: "Retrieve individual notification detailed view." })
  @ApiParam({ name: "id", description: "Unique identifier of the notification record." })
  @ApiResponse({ status: 200, description: "Successfully retrieved notification." })
  @ApiResponse({ status: 404, description: "Notification not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async findOne(@CurrentUser() user: any, @Param("id") id: string) {
    const notification = await this.notificationsService.findOne(user.id, id);
    if (!notification) throw new NotFoundException("Notificação não encontrada");
    return notification;
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark notification as read", description: "Flag a specific notification alert as read." })
  @ApiParam({ name: "id", description: "Unique identifier of the notification record." })
  @ApiResponse({ status: 200, description: "Successfully marked as read." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  markAsRead(@CurrentUser() user: any, @Param("id") id: string) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Patch("read-all")
  @ApiOperation({ summary: "Mark all notifications as read", description: "Flags all pending user alerts as read at once." })
  @ApiResponse({ status: 200, description: "Successfully marked all as read." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
