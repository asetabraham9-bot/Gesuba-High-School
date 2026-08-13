import {
  Schema,
  model,
  type InferSchemaType
} from "mongoose";

const examAttemptSchema =
  new Schema(
    {
      examId: {
        type: Schema.Types.ObjectId,
        ref: "Exam",
        required: true
      },

      studentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      answers: [
        {
          questionId: {
            type: Schema.Types.ObjectId,
            ref: "Question",
            required: true
          },

          answer: {
            type: String,
            trim: true
          }
        }
      ],

      score: {
        type: Number,
        default: 0,
        min: 0
      },

      totalMarks: {
        type: Number,
        default: 0,
        min: 0
      },

      status: {
        type: String,
        enum: [
          "IN_PROGRESS",
          "SUBMITTED",
          "AUTO_SUBMITTED"
        ],
        default: "IN_PROGRESS"
      },

      startedAt: {
        type: Date,
        default: Date.now
      },

      submittedAt: {
        type: Date
      }
    },
    {
      timestamps: true
    }
  );

examAttemptSchema.index(
  {
    examId: 1,
    studentId: 1
  },
  {
    unique: true
  }
);

export type ExamAttempt =
  InferSchemaType<
    typeof examAttemptSchema
  >;

export const ExamAttempt =
  model<ExamAttempt>(
    "ExamAttempt",
    examAttemptSchema
  );