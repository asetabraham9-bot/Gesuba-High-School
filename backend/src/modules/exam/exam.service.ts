import { Types } from "mongoose";

import { Exam } from "../../models/exam.model.js";
import { Question } from "../../models/question.model.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

import {
  validateExamCreationPermission
} from "./exam.authorization.js";

interface CreateExamInput {
  title: string;
  description?: string;
  type:
    | "REGULAR"
    | "MODEL"
    | "NATIONAL";
  classLevelId: string;
  subjectId: string;
  academicYear: string;
  durationMinutes: number;
  startAt: Date;
  endAt: Date;
}

export async function createExam(
  instructorId: string,
  input: CreateExamInput
) {
  await validateExamCreationPermission(
    instructorId,
    input.type,
    input.classLevelId,
    input.subjectId,
    input.academicYear
  );

  const exam = await Exam.create({
    ...input,
    createdBy: instructorId,
    status: "DRAFT"
  });

  return exam;
}

export async function getExamById(
  examId: string
) {
  if (!Types.ObjectId.isValid(examId)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid exam ID"
    );
  }

  const exam = await Exam.findById(examId)
    .populate(
      "createdBy",
      "email role"
    )
    .populate(
      "classLevelId",
      "title"
    )
    .populate(
      "subjectId",
      "title"
    );

  if (!exam) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam not found"
    );
  }

  return exam;
}

export async function getInstructorExams(
  instructorId: string
) {
  return Exam.find({
    createdBy: instructorId
  })
    .populate(
      "classLevelId",
      "title"
    )
    .populate(
      "subjectId",
      "title"
    )
    .sort({
      createdAt: -1
    });
}

export async function updateExam(
  examId: string,
  instructorId: string,
  input: Partial<CreateExamInput>
) {
  const exam =
    await Exam.findById(examId);

  if (!exam) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam not found"
    );
  }

  if (
    exam.createdBy.toString() !==
    instructorId
  ) {
    throw new AppError(
      403,
      ERROR_CODES.FORBIDDEN,
      "You can only modify your own exams"
    );
  }

  if (
    exam.status !== "DRAFT" &&
    exam.status !== "REJECTED"
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Only draft or rejected exams can be modified"
    );
  }

  const nextType =
    input.type ?? exam.type;

  const nextClassLevelId =
    input.classLevelId ??
    exam.classLevelId.toString();

  const nextSubjectId =
    input.subjectId ??
    exam.subjectId.toString();

  const currentAcademicYear =
    (exam as typeof exam & {
      academicYear?: string;
    }).academicYear ?? "";

  const nextAcademicYear =
    input.academicYear ??
    currentAcademicYear;

  await validateExamCreationPermission(
    instructorId,
    nextType,
    nextClassLevelId,
    nextSubjectId,
    nextAcademicYear
  );

  Object.assign(exam, input);

  /*
   * If a rejected exam is modified,
   * it becomes a draft again.
   */
  if (exam.status === "REJECTED") {
    exam.status = "DRAFT";
    exam.rejectionReason = undefined;
    exam.approvedBy = undefined;
    exam.approvedAt = undefined;
  }

  await exam.save();

  return exam;
}

export async function deleteExam(
  examId: string,
  instructorId: string
): Promise<void> {
  const exam =
    await Exam.findById(examId);

  if (!exam) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam not found"
    );
  }

  if (
    exam.createdBy.toString() !==
    instructorId
  ) {
    throw new AppError(
      403,
      ERROR_CODES.FORBIDDEN,
      "You can only delete your own exams"
    );
  }

  if (
    exam.status !== "DRAFT" &&
    exam.status !== "REJECTED"
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Only draft or rejected exams can be deleted"
    );
  }

  await exam.deleteOne();
}

// QUESTION MANAGEMENT

interface CreateQuestionInput {
  questionText: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
  options?: { text: string }[];
  correctAnswer: string;
  marks: number;
}

async function verifyExamOwnership(
  examId: string,
  instructorId: string
) {
  if (!Types.ObjectId.isValid(examId)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid exam ID"
    );
  }

  const exam = await Exam.findById(examId);

  if (!exam) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam not found"
    );
  }

  if (
    exam.createdBy.toString() !==
    instructorId
  ) {
    throw new AppError(
      403,
      ERROR_CODES.FORBIDDEN,
      "You can only modify questions for your own exams"
    );
  }

  if (exam.status !== "DRAFT") {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Questions can only be added to draft exams"
    );
  }

  return exam;
}

export async function addQuestionToExam(
  examId: string,
  instructorId: string,
  input: CreateQuestionInput
) {
  // Verify ownership and exam status
  const exam =
    await verifyExamOwnership(
      examId,
      instructorId
    );

  // Get the highest order number
  const lastQuestion =
    await Question.findOne({ examId })
      .sort({ order: -1 });

  const nextOrder =
    (lastQuestion?.order ?? 0) + 1;

  const question =
    await Question.create({
      examId,
      ...input,
      order: nextOrder
    });

  // Update exam's total marks
  const totalMarks =
    (exam.totalMarks ?? 0) +
    input.marks;

  await Exam.findByIdAndUpdate(
    examId,
    { totalMarks },
    { new: true }
  );

  return question;
}

export async function getExamQuestions(
  examId: string
) {
  if (!Types.ObjectId.isValid(examId)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid exam ID"
    );
  }

  return Question.find({ examId })
    .sort({ order: 1 });
}

export async function getQuestionById(
  questionId: string
) {
  if (
    !Types.ObjectId.isValid(questionId)
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid question ID"
    );
  }

  const question =
    await Question.findById(questionId);

  if (!question) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Question not found"
    );
  }

  return question;
}

export async function updateQuestion(
  questionId: string,
  examId: string,
  instructorId: string,
  input: Partial<CreateQuestionInput>
) {
  // Verify ownership
  await verifyExamOwnership(
    examId,
    instructorId
  );

  if (
    !Types.ObjectId.isValid(questionId)
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid question ID"
    );
  }

  const question =
    await Question.findById(questionId);

  if (!question) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Question not found"
    );
  }

  if (
    question.examId.toString() !==
    examId
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Question does not belong to this exam"
    );
  }

  // If marks changed, update exam total
  if (
    input.marks &&
    input.marks !== question.marks
  ) {
    const marksDifference =
      input.marks - question.marks;

    await Exam.findByIdAndUpdate(
      examId,
      {
        $inc: {
          totalMarks:
            marksDifference
        }
      }
    );
  }

  const updated =
    await Question.findByIdAndUpdate(
      questionId,
      input,
      {
        new: true,
        runValidators: true
      }
    );

  return updated;
}

export async function deleteQuestion(
  questionId: string,
  examId: string,
  instructorId: string
): Promise<void> {
  // Verify ownership
  await verifyExamOwnership(
    examId,
    instructorId
  );

  if (
    !Types.ObjectId.isValid(questionId)
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid question ID"
    );
  }

  const question =
    await Question.findById(questionId);

  if (!question) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Question not found"
    );
  }

  if (
    question.examId.toString() !==
    examId
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Question does not belong to this exam"
    );
  }

  // Update exam total marks
  await Exam.findByIdAndUpdate(
    examId,
    {
      $inc: {
        totalMarks: -question.marks
      }
    }
  );

  // Delete and reorder remaining questions
  await question.deleteOne();

  await Question.updateMany(
    {
      examId,
      order: { $gt: question.order }
    },
    { $inc: { order: -1 } }
  );
}

// EXAM WORKFLOW FUNCTIONS

export async function publishExam(
  examId: string,
  instructorId: string
) {
  if (
    !Types.ObjectId.isValid(examId)
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid exam ID"
    );
  }

  const exam = await Exam.findById(
    examId
  );

  if (!exam) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam not found"
    );
  }

  if (
    exam.createdBy.toString() !==
    instructorId
  ) {
    throw new AppError(
      403,
      ERROR_CODES.FORBIDDEN,
      "You can only publish your own exams"
    );
  }

  if (exam.status !== "DRAFT") {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Only DRAFT exams can be published"
    );
  }

  // Verify exam has questions
  const questionCount =
    await Question.countDocuments({
      examId
    });

  if (questionCount === 0) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Exam must have at least one question"
    );
  }

  const updated =
    await Exam.findByIdAndUpdate(
      examId,
      {
        status: "PENDING_APPROVAL"
      },
      { new: true }
    ).populate([
      {
        path: "createdBy",
        select: "email name"
      },
      {
        path: "classLevelId",
        select: "section gradeId"
      },
      {
        path: "subjectId",
        select: "name"
      }
    ]);

  return updated;
}

export async function approveExam(
  examId: string,
  adminId: string
) {
  if (
    !Types.ObjectId.isValid(examId)
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid exam ID"
    );
  }

  const exam = await Exam.findById(
    examId
  );

  if (!exam) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam not found"
    );
  }

  if (
    exam.status !==
    "PENDING_APPROVAL"
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Only PENDING_APPROVAL exams can be approved"
    );
  }

  const updated =
    await Exam.findByIdAndUpdate(
      examId,
      {
        status: "APPROVED",
        approvedBy: adminId,
        approvedAt: new Date()
      },
      { new: true }
    ).populate([
      {
        path: "createdBy",
        select: "email name"
      },
      {
        path: "approvedBy",
        select: "email name"
      },
      {
        path: "classLevelId",
        select: "section gradeId"
      },
      {
        path: "subjectId",
        select: "name"
      }
    ]);

  return updated;
}

export async function rejectExam(
  examId: string,
  adminId: string,
  rejectionReason: string
) {
  if (
    !Types.ObjectId.isValid(examId)
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid exam ID"
    );
  }

  const exam = await Exam.findById(
    examId
  );

  if (!exam) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam not found"
    );
  }

  if (
    exam.status !==
    "PENDING_APPROVAL"
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Only PENDING_APPROVAL exams can be rejected"
    );
  }

  const updated =
    await Exam.findByIdAndUpdate(
      examId,
      {
        status: "REJECTED",
        rejectionReason,
        approvedBy: adminId,
        approvedAt: new Date()
      },
      { new: true }
    ).populate([
      {
        path: "createdBy",
        select: "email name"
      },
      {
        path: "classLevelId",
        select: "section gradeId"
      },
      {
        path: "subjectId",
        select: "name"
      }
    ]);

  return updated;
}

export async function getExamsForApproval() {
  const exams = await Exam.find({
    status: "PENDING_APPROVAL"
  })
    .populate([
      {
        path: "createdBy",
        select: "email name"
      },
      {
        path: "classLevelId",
        select: "section gradeId"
      },
      {
        path: "subjectId",
        select: "name"
      }
    ])
    .sort({
      createdAt: -1
    });

  return exams;
}