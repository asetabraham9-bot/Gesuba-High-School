import { Schema } from "mongoose";
import { Notification, NotificationType } from "../../models/notification.model.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

export interface CreateNotificationInput {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface NotificationQuery {
  recipientId: string;
  isRead?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

export class NotificationService {
  /**
   * Create a single notification
   */
  async createNotification(input: CreateNotificationInput) {
    const notification = await Notification.create({
      recipientId: input.recipientId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data || {}
    });

    return notification.populate("recipientId", "name email");
  }

  /**
   * Send notifications to multiple recipients
   */
  async broadcastNotification(
    recipientIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ) {
    const notifications = await Notification.insertMany(
      recipientIds.map(id => ({
        recipientId: id,
        type,
        title,
        message,
        data: data || {}
      }))
    );

    return notifications;
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(query: NotificationQuery) {
    const filter: any = { recipientId: query.recipientId };

    if (query.isRead !== undefined) {
      filter.isRead = query.isRead;
    }

    if (query.type) {
      filter.type = query.type;
    }

    const limit = Math.min(query.limit || 20, 100);
    const offset = query.offset || 0;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate("recipientId", "name email"),
      Notification.countDocuments(filter)
    ]);

    return {
      notifications,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  }

  /**
   * Get unread notification count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({
      recipientId: userId,
      isRead: false
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipientId: userId
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      },
      { new: true }
    ).populate("recipientId", "name email");

    if (!notification) {
      throw new AppError(
        404,
        ERROR_CODES.NOT_FOUND,
        "Notification not found"
      );
    }

    return notification;
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string) {
    const result = await Notification.updateMany(
      {
        recipientId: userId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    return result;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId
    });

    if (!result) {
      throw new AppError(
        404,
        ERROR_CODES.NOT_FOUND,
        "Notification not found"
      );
    }

    return result;
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string) {
    const result = await Notification.deleteMany({
      recipientId: userId
    });

    return result;
  }

  /**
   * Clean up old notifications (older than X days)
   */
  async cleanupOldNotifications(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    return result;
  }

  /**
   * Get notification statistics for a user
   */
  async getNotificationStats(userId: string) {
    const [total, unread, byType] = await Promise.all([
      Notification.countDocuments({ recipientId: userId }),
      Notification.countDocuments({ recipientId: userId, isRead: false }),
      Notification.aggregate([
        { $match: { recipientId: new (Schema.Types as any).ObjectId(userId) } },
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ])
    ]);

    return {
      total,
      unread,
      byType: Object.fromEntries(
        byType.map((item: any) => [item._id, item.count])
      )
    };
  }
}

export const notificationService = new NotificationService();
