import {
  Schema,
  model,
  type InferSchemaType
} from "mongoose";

const instructorAssignmentSchema =
  new Schema(
    {
      instructorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
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

      academicYear: {
        type: String,
        required: true,
        trim: true
      },

      status: {
        type: String,
        enum: [
          "ACTIVE",
          "INACTIVE"
        ],
        default: "ACTIVE"
      }
    },
    {
      timestamps: true
    }
  );

instructorAssignmentSchema.index(
  {
    instructorId: 1,
    classLevelId: 1,
    subjectId: 1,
    academicYear: 1
  },
  {
    unique: true
  }
);

instructorAssignmentSchema.index({
  instructorId: 1,
  status: 1
});

export type InstructorAssignment =
  InferSchemaType<
    typeof instructorAssignmentSchema
  >;

export const InstructorAssignment =
  model<InstructorAssignment>(
    "InstructorAssignment",
    instructorAssignmentSchema
  );