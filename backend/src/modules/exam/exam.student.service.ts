import { Types } from "mongoose";

import { Exam } from "../../models/exam.model.js";
import { Question } from "../../models/question.model.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

import {
  canStudentViewExam,
  canStudentTakeExam,
  verifyStudentExamAccess
} from "./exam.access.authorization.js";

/**
 * Gets exam details for a student view
 * Includes questions only if exam has started
 * Excludes correct answers before exam completion
 */
export async function getExamForStudent(
  examId: string,
  studentId: string
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

  // Verify student has access to view
  await verifyStudentExamAccess(
    examId,
    studentId,
    "view"
  );

  const exam = await Exam.findById(
    examId
  )
    .populate([
      {
        path: "subjectId",
        select: "name code"
      },
      {
        path: "createdBy",
        select: "name email"
      }
    ])
    .select(
      "title description type classLevelId subjectId createdBy startAt endAt durationMinutes totalMarks status"
    );

  if (!exam) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam not found"
    );
  }

  const now = new Date();
  const hasExamStarted =
    now >= exam.startAt;

  // Include questions only if exam has started
  let questions: any[] = [];
  if (hasExamStarted) {
    questions = await Question.find({
      examId
    })
      .select(
        "questionText type options order marks"
      )
      .sort({ order: 1 });

    // Remove correct answers and order
    questions = questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      marks: q.marks
    }));
  }

  return {
    exam,
    questions,
    examStartsAt: exam.startAt,
    examEndsAt: exam.endAt,
    canAttemptNow:
      await canStudentTakeExam(
        examId,
        studentId
      ),
    hasStarted: hasExamStarted
  };
}

/**
 * Gets exam metadata and timing info without questions
 * Used for exam lists and previews
 */
export async function getExamMetadata(
  examId: string,
  studentId: string
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

  const hasAccess =
    await canStudentViewExam(
      examId,
      studentId
    );

  if (!hasAccess) {
    throw new AppError(
      403,
      ERROR_CODES.FORBIDDEN,
      "You do not have access to this exam"
    );
  }

  const exam = await Exam.findById(
    examId
  )
    .populate([
      {
        path: "subjectId",
        select: "name code"
      },
      {
        path: "createdBy",
        select: "name email"
      }
    ])
    .select(
      "title type subjectId startAt endAt durationMinutes totalMarks"
    );

  if (!exam) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam not found"
    );
  }

  const now = new Date();
  const timeUntilStart =
    exam.startAt.getTime() - now.getTime();
  const timeUntilEnd =
    exam.endAt.getTime() - now.getTime();

  return {
    _id: exam._id,
    title: exam.title,
    type: exam.type,
    subject: exam.subjectId,
    startAt: exam.startAt,
    endAt: exam.endAt,
    durationMinutes:
      exam.durationMinutes,
    totalMarks: exam.totalMarks,
    timeUntilStartMs: timeUntilStart,
    timeUntilEndMs: timeUntilEnd,
    isOngoing:
      exam.startAt <= now &&
      now < exam.endAt,
    isUpcoming: exam.startAt > now,
    hasEnded: exam.endAt <= now
  };
}

/**
 * Gets all exams available for a student
 * Includes current, upcoming, and past exams
 * Organized by status
 */
export async function getStudentExams(
  studentId: string,
  filter?: "current" | "upcoming" | "past"
) {
  if (
    !Types.ObjectId.isValid(studentId)
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid student ID"
    );
  }

  // Get student's class level
  const student = await Exam.collection.db
    ?.collection("users")
    .findOne({
      _id: new Types.ObjectId(studentId)
    });

  if (!student || !student.classLevelId) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Student does not have a class level"
    );
  }

  const now = new Date();
  const baseQuery = {
    status: "APPROVED",
    isReleasedToStudents: true,
    releasedTo: student.classLevelId
  };

  let query: any = baseQuery;

  if (filter === "current") {
    query = {
      ...baseQuery,
      startAt: { $lte: now },
      endAt: { $gt: now }
    };
  } else if (filter === "upcoming") {
    query = {
      ...baseQuery,
      startAt: { $gt: now }
    };
  } else if (filter === "past") {
    query = {
      ...baseQuery,
      endAt: { $lte: now }
    };
  }

  const exams = await Exam.find(query)
    .populate([
      {
        path: "subjectId",
        select: "name code"
      },
      {
        path: "createdBy",
        select: "name email"
      }
    ])
    .select(
      "title type subjectId startAt endAt durationMinutes totalMarks"
    )
    .sort({ startAt: 1 });

  return exams.map((exam) => ({
    _id: exam._id,
    title: exam.title,
    type: exam.type,
    subject: exam.subjectId,
    startAt: exam.startAt,
    endAt: exam.endAt,
    durationMinutes:
      exam.durationMinutes,
    totalMarks: exam.totalMarks,
    isOngoing:
      exam.startAt <= now &&
      now < exam.endAt,
    isUpcoming: exam.startAt > now,
    hasEnded: exam.endAt <= now
  }));
}

/**
 * Gets exam questions for a student
 * Only available after exam has started
 * Excludes correct answers
 */
export async function getExamQuestionsForStudent(
  examId: string,
  studentId: string
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

  // Verify student can attempt
  await verifyStudentExamAccess(
    examId,
    studentId,
    "attempt"
  );

  const questions = await Question.find({
    examId
  })
    .select(
      "questionText type options marks order"
    )
    .sort({ order: 1 });

  return questions.map((q) => ({
    _id: q._id,
    order: q.order,
    questionText: q.questionText,
    type: q.type,
    options: q.options,
    marks: q.marks
  }));
}

/**
 * Gets a single question for a student
 * Validates exam access first
 */
export async function getQuestionForStudent(
  examId: string,
  questionId: string,
  studentId: string
) {
  if (
    !Types.ObjectId.isValid(examId) ||
    !Types.ObjectId.isValid(questionId)
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid exam or question ID"
    );
  }

  // Verify student can attempt
  await verifyStudentExamAccess(
    examId,
    studentId,
    "attempt"
  );

  const question =
    await Question.findById(
      questionId
    ).select(
      "questionText type options marks order examId"
    );

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

  return {
    _id: question._id,
    order: question.order,
    questionText: question.questionText,
    type: question.type,
    options: question.options,
    marks: question.marks
  };
}

/**
 * Validates that an exam is available for attempting
 * Throws error if not available
 */
export async function validateExamAttemptability(
  examId: string,
  studentId: string
): Promise<void> {
  if (
    !Types.ObjectId.isValid(examId) ||
    !Types.ObjectId.isValid(studentId)
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid exam or student ID"
    );
  }

  const canTake =
    await canStudentTakeExam(
      examId,
      studentId
    );

  if (!canTake) {
    const exam = await Exam.findById(
      examId
    ).select("startAt endAt status");

    if (!exam) {
      throw new AppError(
        404,
        ERROR_CODES.NOT_FOUND,
        "Exam not found"
      );
    }

    const now = new Date();

    if (exam.status !== "APPROVED") {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Exam is not available"
      );
    }

    if (now < exam.startAt) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Exam has not started yet"
      );
    }

    if (now >= exam.endAt) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Exam has ended"
      );
    }

    throw new AppError(
      403,
      ERROR_CODES.FORBIDDEN,
      "You do not have access to this exam"
    );
  }
}
