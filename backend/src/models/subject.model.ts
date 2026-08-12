import { Schema, model, Types } from "mongoose";

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    gradeId: {
      type: Types.ObjectId,
      ref: "Grade",
      required: true
    },

    description: {
      type: String,
      trim: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

subjectSchema.index({
  gradeId: 1,
  code: 1
}, {
  unique: true
});

export const Subject = model(
  "Subject",
  subjectSchema
);