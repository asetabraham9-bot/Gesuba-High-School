import {
  Schema,
  model,
  type InferSchemaType
} from "mongoose";

const questionSchema =
  new Schema(
    {
      examId: {
        type: Schema.Types.ObjectId,
        ref: "Exam",
        required: true
      },

      questionText: {
        type: String,
        required: true,
        trim: true
      },

      type: {
        type: String,
        enum: [
          "MCQ",
          "TRUE_FALSE",
          "SHORT_ANSWER"
        ],
        required: true
      },

      options: [
        {
          text: {
            type: String,
            required: true,
            trim: true
          }
        }
      ],

      correctAnswer: {
        type: String,
        required: true,
        trim: true
      },

      marks: {
        type: Number,
        required: true,
        min: 1
      },

      order: {
        type: Number,
        required: true,
        min: 1
      }
    },
    {
      timestamps: true
    }
  );

questionSchema.index({
  examId: 1,
  order: 1
});

export type Question =
  InferSchemaType<
    typeof questionSchema
  >;

export const Question =
  model<Question>(
    "Question",
    questionSchema
  );