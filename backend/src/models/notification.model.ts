import { Schema, model, type HydratedDocument } from "mongoose";

export enum NotificationType {
  EXAM_RELEASED = "EXAM_RELEASED",
  EXAM_SCHEDULED = "EXAM_SCHEDULED",
  EXAM_REMINDER = "EXAM_REMINDER",
  EXAM_STARTED = "EXAM_STARTED",
  EXAM_ENDED = "EXAM_ENDED",
  RESULTS_PUBLISHED = "RESULTS_PUBLISHED",
  ASSIGNMENT_CREATED = "ASSIGNMENT_CREATED",
  MATERIAL_UPLOADED = "MATERIAL_UPLOADED",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  SYSTEM_ALERT = "SYSTEM_ALERT"
}

export interface INotification {
  recipientId: Schema.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    examId?: Schema.Types.ObjectId;
    assignmentId?: Schema.Types.ObjectId;
    materialId?: Schema.Types.ObjectId;
    [key: string]: any;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<INotification>;

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },

    data: {
      type: Schema.Types.Mixed,
      default: {}
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for querying user's notifications
notificationSchema.index({
  recipientId: 1,
  createdAt: -1
});

// Index for unread notifications
notificationSchema.index({
  recipientId: 1,
  isRead: 1,
  createdAt: -1
});

// Index for notification type filtering
notificationSchema.index({
  recipientId: 1,
  type: 1,
  createdAt: -1
});

export const Notification = model<INotification>(
  "Notification",
  notificationSchema
);
