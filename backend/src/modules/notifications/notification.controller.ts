import { Request, Response, NextFunction } from "express";
import { notificationService } from "./notification.service.js";
import {
  createNotificationSchema,
  broadcastNotificationSchema,
  getUserNotificationsSchema
} from "./notification.validation.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

export class NotificationController {
  /**
   * Create a single notification
   * POST /notifications
   * Authorization: ADMIN
   */
  async createNotificationController(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createNotificationSchema.parse(req.body);

      const notification = await notificationService.createNotification(input);

      res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send notification to multiple users (broadcast)
   * POST /notifications/broadcast
   * Authorization: ADMIN
   */
  async broadcastNotificationController(req: Request, res: Response, next: NextFunction) {
    try {
      const input = broadcastNotificationSchema.parse(req.body);

      const notifications = await notificationService.broadcastNotification(
        input.recipientIds,
        input.type,
        input.title,
        input.message,
        input.data
      );

      res.status(201).json({
        success: true,
        count: notifications.length,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's notifications
   * GET /notifications
   */
  async getUserNotificationsController(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, ERROR_CODES.UNAUTHORIZED, "Unauthorized");
      }

      const query = getUserNotificationsSchema.parse({
        isRead: req.query.isRead ? req.query.isRead === "true" : undefined,
        type: req.query.type,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      });

      const result = await notificationService.getUserNotifications({
        recipientId: userId,
        ...query
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   * GET /notifications/unread/count
   */
  async getUnreadCountController(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, ERROR_CODES.UNAUTHORIZED, "Unauthorized");
      }

      const count = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   * PATCH /notifications/:notificationId/read
   */
  async markAsReadController(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, ERROR_CODES.UNAUTHORIZED, "Unauthorized");
      }

      const { notificationId } = req.params;

      const notification = await notificationService.markAsRead(notificationId, userId);

      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   * PATCH /notifications/mark-all-read
   */
  async markAllAsReadController(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, ERROR_CODES.UNAUTHORIZED, "Unauthorized");
      }

      const result = await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        data: {
          modifiedCount: result.modifiedCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a notification
   * DELETE /notifications/:notificationId
   */
  async deleteNotificationController(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, ERROR_CODES.UNAUTHORIZED, "Unauthorized");
      }

      const { notificationId } = req.params;

      await notificationService.deleteNotification(notificationId, userId);

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete all notifications for user
   * DELETE /notifications
   */
  async deleteAllNotificationsController(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, ERROR_CODES.UNAUTHORIZED, "Unauthorized");
      }

      const result = await notificationService.deleteAllNotifications(userId);

      res.status(200).json({
        success: true,
        data: {
          deletedCount: result.deletedCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification statistics
   * GET /notifications/stats
   */
  async getNotificationStatsController(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, ERROR_CODES.UNAUTHORIZED, "Unauthorized");
      }

      const stats = await notificationService.getNotificationStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
