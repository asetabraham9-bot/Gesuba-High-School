import {
  Schema,
  model,
  Types
} from "mongoose";

export type MaterialType =
  | "NOTE"
  | "PDF"
  | "VIDEO"
  | "EXERCISE"
  | "REFERENCE";

export type MaterialStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

const studyMaterialSchema =
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
          "NOTE",
          "PDF",
          "VIDEO",
          "EXERCISE",
          "REFERENCE"
        ],
        required: true
      },

      unitId: {
        type: Types.ObjectId,
        ref: "Unit",
        required: true
      },

      content: {
        type: String,
        trim: true
      },

      fileUrl: {
        type: String,
        trim: true
      },

      status: {
        type: String,
        enum: [
          "DRAFT",
          "PUBLISHED",
          "ARCHIVED"
        ],
        default: "DRAFT"
      },

      createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true
      },

      publishedAt: {
        type: Date
      }
    },
    {
      timestamps: true
    }
  );

studyMaterialSchema.index({
  unitId: 1,
  status: 1
});

studyMaterialSchema.index({
  title: "text",
  description: "text"
});

export const StudyMaterial =
  model(
    "StudyMaterial",
    studyMaterialSchema
  );