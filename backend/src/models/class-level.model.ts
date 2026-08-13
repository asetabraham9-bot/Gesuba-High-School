import { Schema, model, type HydratedDocument } from "mongoose";

export interface IClassLevel {
  gradeId: Schema.Types.ObjectId;
  section: string; // A, B, C, etc.
  capacity?: number; // max students in this class
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ClassLevelDocument = HydratedDocument<IClassLevel>;

const classLevelSchema = new Schema<IClassLevel>(
  {
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
      index: true
    },

    section: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ["A", "B", "C", "D", "E", "F"] // Limit to realistic sections
    },

    capacity: {
      type: Number,
      default: 50,
      min: 1,
      max: 100
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure unique combination of grade and section
classLevelSchema.index(
  {
    gradeId: 1,
    section: 1
  },
  {
    unique: true
  }
);

export const ClassLevel = model<IClassLevel>(
  "ClassLevel",
  classLevelSchema
);
