import {
  Schema,
  model,
  type InferSchemaType
} from "mongoose";

const examSchema =
  new Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true
      },

      description: {
        type: String,
        trim: true
      },

      type: {
        type: String,
        enum: [
          "REGULAR",
          "MODEL",
          "NATIONAL"
        ],
        required: true
      },

      classLevelId: {
        type: Schema.Types.ObjectId,
        ref: "ClassLevel",
        required: true
      },

      subjectId: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: true
      },

      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      durationMinutes: {
        type: Number,
        required: true,
        min: 1
      },

      startAt: {
        type: Date,
        required: true
      },

      endAt: {
        type: Date,
        required: true
      },

      totalMarks: {
        type: Number,
        default: 0,
        min: 0
      },

      status: {
        type: String,
        enum: [
          "DRAFT",
          "PENDING_APPROVAL",
          "APPROVED",
          "REJECTED",
          "COMPLETED"
        ],
        default: "DRAFT"
      },

      rejectionReason: {
        type: String,
        trim: true
      },

      approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },

      approvedAt: {
        type: Date
      },

      resultsReleased: {
        type: Boolean,
        default: false
      }
    ,
      // Scheduling & release fields
      isScheduleLocked: {
        type: Boolean,
        default: false
      },

      scheduleLocked: {
        type: Boolean,
        default: false
      },

      scheduleLockTime: {
        type: Date
      },

      isReleasedToStudents: {
        type: Boolean,
        default: false
      },

      releasedAt: {
        type: Date
      },

      releasedTo: [
        {
          type: Schema.Types.ObjectId,
          ref: "ClassLevel"
        }
      ],

      scheduleRevokeAt: {
        type: Date
      },

      releaseStatus: {
        type: String,
        enum: ["ACTIVE", "REVOKED", "SCHEDULED"],
        default: "ACTIVE"
      },

      revokedAt: {
        type: Date
      }
    },
    {
      timestamps: true
    }
  );

examSchema.index({
  createdBy: 1
});

examSchema.index({
  classLevelId: 1,
  subjectId: 1
});

examSchema.index({
  status: 1
});

examSchema.index({
  startAt: 1,
  endAt: 1
});

examSchema.index({
  releaseStatus: 1
});

examSchema.index({
  releasedTo: 1
});

export type Exam =
  InferSchemaType<
    typeof examSchema
  >;

export const Exam =
  model<Exam>(
    "Exam",
    examSchema
  );