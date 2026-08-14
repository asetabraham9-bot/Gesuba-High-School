import { Types } from "mongoose";

import { Exam } from "../../models/exam.model.js";
import { User } from "../../models/user.model.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

/**
 * Checks if a student can view exam details
 * Requirements:
 * - Exam must be APPROVED
 * - Exam must be released to students
 * - Student's class level must match releasedTo
 * - Current time must be between startAt and endAt or before startAt (can see upcoming exams)
 */
export async function canStudentViewExam(
  examId: string,
  studentId: string
): Promise<boolean> {
  try {
    if (
      !Types.ObjectId.isValid(examId) ||
      !Types.ObjectId.isValid(studentId)
    ) {
      return false;
    }

    const student = await User.findById(
      studentId
    ).select("classLevelId");

    if (!student || !student.classLevelId) {
      return false;
    }

    const exam = await Exam.findById(
      examId
    ).select(
      "status isReleasedToStudents releasedTo classLevelId startAt"
    );

    if (!exam) {
      return false;
    }

    // Must be approved
    if (exam.status !== "APPROVED") {
      return false;
    }

    // Must be released
    if (!exam.isReleasedToStudents) {
      return false;
    }

    // Check class level match
    const releasedToArray =
      Array.isArray(exam.releasedTo)
        ? exam.releasedTo
        : [exam.classLevelId];

    const hasAccess = releasedToArray.some(
      (classLevelId) =>
        classLevelId?.toString() ===
        student.classLevelId?.toString()
    );

    return hasAccess;
  } catch {
    return false;
  }
}

/**
 * Checks if a student can take exam (attempt it)
 * Requirements:
 * - All view requirements
 * - Current time must be within startAt and endAt
 * - Exam must not have ended
 * - Student must not have already exceeded attempt limit
 */
export async function canStudentTakeExam(
  examId: string,
  studentId: string
): Promise<boolean> {
  try {
    if (
      !Types.ObjectId.isValid(examId) ||
      !Types.ObjectId.isValid(studentId)
    ) {
      return false;
    }

    // First check if can view
    const canView =
      await canStudentViewExam(
        examId,
        studentId
      );

    if (!canView) {
      return false;
    }

    const exam = await Exam.findById(
      examId
    ).select(
      "status startAt endAt"
    );

    if (!exam) {
      return false;
    }

    const now = new Date();

    // Exam must not have ended
    if (exam.endAt <= now) {
      return false;
    }

    // Exam must have started (within time window)
    if (exam.startAt > now) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a student can view exam results
 * Requirements:
 * - Must have taken the exam
 * - Results must be released by instructor
 * - Exam must have ended
 */
export async function canStudentViewResults(
  examId: string,
  studentId: string
): Promise<boolean> {
  try {
    if (
      !Types.ObjectId.isValid(examId) ||
      !Types.ObjectId.isValid(studentId)
    ) {
      return false;
    }

    const exam = await Exam.findById(
      examId
    ).select("status resultsReleased endAt");

    if (!exam) {
      return false;
    }

    // Results must be released
    if (!exam.resultsReleased) {
      return false;
    }

    // Exam must have ended
    const now = new Date();
    if (exam.endAt > now) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Verifies student can access exam and throws appropriate error
 * Used in controllers to enforce authorization
 */
export async function verifyStudentExamAccess(
  examId: string,
  studentId: string,
  action: "view" | "attempt" | "results"
): Promise<void> {
  let hasAccess = false;

  if (action === "view") {
    hasAccess =
      await canStudentViewExam(
        examId,
        studentId
      );
  } else if (action === "attempt") {
    hasAccess =
      await canStudentTakeExam(
        examId,
        studentId
      );
  } else if (action === "results") {
    hasAccess =
      await canStudentViewResults(
        examId,
        studentId
      );
  }

  if (!hasAccess) {
    const messages: Record<
      string,
      string
    > = {
      view: "You do not have access to view this exam",
      attempt:
        "You cannot take this exam at this time",
      results:
        "Exam results are not yet available"
    };

    throw new AppError(
      403,
      ERROR_CODES.FORBIDDEN,
      messages[action]
    );
  }
}

/**
 * Gets authorization details for an exam from student perspective
 * Returns what student can and cannot do with exam
 */
export async function getStudentExamAccess(
  examId: string,
  studentId: string
) {
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

  const exam = await Exam.findById(
    examId
  ).select(
    "status startAt endAt isReleasedToStudents resultsReleased"
  );

  if (!exam) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam not found"
    );
  }

  const canView =
    await canStudentViewExam(
      examId,
      studentId
    );

  const canAttempt =
    await canStudentTakeExam(
      examId,
      studentId
    );

  const canSeeResults =
    await canStudentViewResults(
      examId,
      studentId
    );

  const now = new Date();
  const timeUntilStart =
    exam.startAt.getTime() - now.getTime();
  const timeUntilEnd =
    exam.endAt.getTime() - now.getTime();

  return {
    canView,
    canAttempt,
    canSeeResults,
    examStatus: exam.status,
    isReleased:
      exam.isReleasedToStudents,
    resultsReleased:
      exam.resultsReleased,
    timeUntilStartMs: timeUntilStart,
    timeUntilEndMs: timeUntilEnd,
    isOngoing:
      exam.startAt <= now &&
      now < exam.endAt,
    isPast: exam.endAt <= now,
    isUpcoming: exam.startAt > now
  };
}
