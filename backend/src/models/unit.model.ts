import {
  Schema,
  model,
  Types
} from "mongoose";

const unitSchema = new Schema(
  {
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    unitNumber: {
      type: Number,
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

unitSchema.index({
  subjectId: 1,
  unitNumber: 1
}, {
  unique: true
});

export const Unit = model(
  "Unit",
  unitSchema
);