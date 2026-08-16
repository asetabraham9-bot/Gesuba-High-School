import { z } from "zod";
import { NotificationType } from "@/models/notification.model";

export const createNotificationSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
  type: z.enum(Object.values(NotificationType) as [string, ...string[]]),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  message: z.string().min(1, "Message is required").max(1000, "Message is too long"),
  data: z.record(z.any()).optional()
});

export const broadcastNotificationSchema = z.object({
  recipientIds: z.array(z.string().min(1)).min(1, "At least one recipient is required"),
  type: z.enum(Object.values(NotificationType) as [string, ...string[]]),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  message: z.string().min(1, "Message is required").max(1000, "Message is too long"),
  data: z.record(z.any()).optional()
});

export const getUserNotificationsSchema = z.object({
  isRead: z.boolean().optional(),
  type: z.enum(Object.values(NotificationType) as [string, ...string[]]).optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional()
});

export type CreateNotificationRequest = z.infer<typeof createNotificationSchema>;
export type BroadcastNotificationRequest = z.infer<typeof broadcastNotificationSchema>;
export type GetUserNotificationsRequest = z.infer<typeof getUserNotificationsSchema>;
