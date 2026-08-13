import { z } from "zod";

const examFields = {
  title: z.string().min(3).max(200),

  description: z
    .string()
    .max(2000)
    .optional(),

  type: z.enum([
    "REGULAR",
    "MODEL",
    "NATIONAL"
  ]),

  classLevelId: z.string().min(1),

  subjectId: z.string().min(1),

  academicYear: z.string().min(1),

  durationMinutes: z
    .number()
    .int()
    .positive(),

  startAt: z.coerce.date(),

  endAt: z.coerce.date()
};

export const createExamSchema =
  z
    .object(examFields)
    .refine(
      (data) =>
        data.endAt > data.startAt,
      {
        message:
          "End time must be after start time",
        path: ["endAt"]
      }
    )
    .refine(
      (data) => {
        const examWindow =
          data.endAt.getTime() -
          data.startAt.getTime();

        const duration =
          data.durationMinutes *
          60 *
          1000;

        return examWindow >= duration;
      },
      {
        message:
          "Exam window must be at least as long as the exam duration",
        path: ["durationMinutes"]
      }
    );

export const updateExamSchema =
  z.object({
    title: z
      .string()
      .min(3)
      .max(200)
      .optional(),

    description: z
      .string()
      .max(2000)
      .optional(),

    type: z
      .enum([
        "REGULAR",
        "MODEL",
        "NATIONAL"
      ])
      .optional(),

    classLevelId:
      z.string().min(1).optional(),

    subjectId:
      z.string().min(1).optional(),

    academicYear:
      z.string().min(1).optional(),

    durationMinutes:
      z.number().int().positive().optional(),

    startAt:
      z.coerce.date().optional(),

    endAt:
      z.coerce.date().optional()
  })
  .superRefine((data, ctx) => {
    if (
      data.startAt &&
      data.endAt &&
      data.endAt <= data.startAt
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "End time must be after start time",
        path: ["endAt"]
      });
    }

    if (
      data.startAt &&
      data.endAt &&
      data.durationMinutes
    ) {
      const examWindow =
        data.endAt.getTime() -
        data.startAt.getTime();

      const duration =
        data.durationMinutes *
        60 *
        1000;

      if (examWindow < duration) {
        ctx.addIssue({
          code: "custom",
          message:
            "Exam window must be at least as long as the exam duration",
          path: ["durationMinutes"]
        });
      }
    }
  });

// QUESTION SCHEMAS

export const createQuestionSchema =
  z.object({
    questionText: z
      .string()
      .min(5)
      .max(2000),

    type: z.enum([
      "MCQ",
      "TRUE_FALSE",
      "SHORT_ANSWER"
    ]),

    options: z
      .array(
        z.object({
          text: z
            .string()
            .min(1)
            .max(500)
        })
      )
      .optional(),

    correctAnswer: z
      .string()
      .min(1)
      .max(1000),

    marks: z
      .number()
      .int()
      .min(1)
      .max(1000)
  })
  .refine(
    (data) => {
      // MCQ must have options
      if (
        data.type === "MCQ" &&
        (!data.options ||
          data.options.length < 2)
      ) {
        return false;
      }

      // TRUE_FALSE must have exactly 2 options
      if (
        data.type === "TRUE_FALSE" &&
        (!data.options ||
          data.options.length !== 2)
      ) {
        return false;
      }

      return true;
    },
    {
      message:
        "MCQ must have at least 2 options, TRUE_FALSE must have exactly 2 options",
      path: ["options"]
    }
  );

export const updateQuestionSchema =
  z.object({
    questionText: z
      .string()
      .min(5)
      .max(2000)
      .optional(),

    type: z
      .enum([
        "MCQ",
        "TRUE_FALSE",
        "SHORT_ANSWER"
      ])
      .optional(),

    options: z
      .array(
        z.object({
          text: z
            .string()
            .min(1)
            .max(500)
        })
      )
      .optional(),

    correctAnswer: z
      .string()
      .min(1)
      .max(1000)
      .optional(),

    marks: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .optional()
  });

// EXAM WORKFLOW SCHEMAS

export const publishExamSchema =
  z.object({
    message: z
      .string()
      .min(1)
      .optional()
  });

export const approveExamSchema =
  z.object({
    message: z
      .string()
      .min(1)
      .optional()
  });

export const rejectExamSchema =
  z.object({
    rejectionReason: z
      .string()
      .min(10)
      .max(1000)
      .describe(
        "Reason for rejecting the exam"
      )
  });