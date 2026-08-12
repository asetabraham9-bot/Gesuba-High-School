import { Schema, model } from "mongoose";

const gradeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    number: {
      type: Number,
      required: true,
      unique: true
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

export const Grade = model(
  "Grade",
  gradeSchema
);