import { Schema, model, type HydratedDocument } from "mongoose";

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED"
}

export interface IAttendance {
  studentId: Schema.Types.ObjectId;
  classLevelId: Schema.Types.ObjectId;
  subjectId: Schema.Types.ObjectId;
  instructorId: Schema.Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  markedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AttendanceDocument = HydratedDocument<IAttendance>;

const attendanceSchema = new Schema<IAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    classLevelId: {
      type: Schema.Types.ObjectId,
      ref: "ClassLevel",
      required: true,
      index: true
    },

    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true
    },

    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    date: {
      type: Date,
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PRESENT,
      required: true
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500
    },

    markedAt: {
      type: Date,
      default: () => new Date(),
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure one record per student per day per subject
attendanceSchema.index(
  {
    studentId: 1,
    classLevelId: 1,
    subjectId: 1,
    date: 1
  },
  {
    unique: true,
    sparse: true
  }
);

// Index for querying student attendance history
attendanceSchema.index({
  studentId: 1,
  date: -1
});

// Index for instructor marking attendance
attendanceSchema.index({
  instructorId: 1,
  classLevelId: 1,
  subjectId: 1,
  date: 1
});

export const Attendance = model<IAttendance>(
  "Attendance",
  attendanceSchema
);
