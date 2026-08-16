import { Router } from "express";
import { notificationController } from "./notification.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * POST /notifications
 * Create a single notification
 * Authorization: ADMIN
 */
router.post(
  "/",
  authorize("ADMIN"),
  (req, res, next) => notificationController.createNotificationController(req, res, next)
);

/**
 * POST /notifications/broadcast
 * Send notification to multiple users
 * Authorization: ADMIN
 */
router.post(
  "/broadcast",
  authorize("ADMIN"),
  (req, res, next) => notificationController.broadcastNotificationController(req, res, next)
);

/**
 * GET /notifications
 * Get user's notifications
 * Authorization: Any authenticated user
 */
router.get(
  "/",
  (req, res, next) => notificationController.getUserNotificationsController(req, res, next)
);

/**
 * GET /notifications/unread/count
 * Get unread notification count
 * Authorization: Any authenticated user
 */
router.get(
  "/unread/count",
  (req, res, next) => notificationController.getUnreadCountController(req, res, next)
);

/**
 * GET /notifications/stats
 * Get notification statistics
 * Authorization: Any authenticated user
 */
router.get(
  "/stats",
  (req, res, next) => notificationController.getNotificationStatsController(req, res, next)
);

/**
 * PATCH /notifications/:notificationId/read
 * Mark notification as read
 * Authorization: Any authenticated user (own notifications only)
 */
router.patch(
  "/:notificationId/read",
  (req, res, next) => notificationController.markAsReadController(req, res, next)
);

/**
 * PATCH /notifications/mark-all-read
 * Mark all notifications as read
 * Authorization: Any authenticated user
 */
router.patch(
  "/mark-all-read",
  (req, res, next) => notificationController.markAllAsReadController(req, res, next)
);

/**
 * DELETE /notifications/:notificationId
 * Delete a notification
 * Authorization: Any authenticated user (own notifications only)
 */
router.delete(
  "/:notificationId",
  (req, res, next) => notificationController.deleteNotificationController(req, res, next)
);

/**
 * DELETE /notifications
 * Delete all notifications for user
 * Authorization: Any authenticated user
 */
router.delete(
  "/",
  (req, res, next) => notificationController.deleteAllNotificationsController(req, res, next)
);

export const notificationRoutes = router;
