import { Types } from "mongoose";

import { Exam } from "../../models/exam.model.js";
import { User } from "../../models/user.model.js";
import { ClassLevel } from "../../models/class-level.model.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

interface ReleaseExamInput {
  classLevelIds?: string[];
  releaseAt?: Date;
  revokeAt?: Date;
}

/**
 * Releases an approved exam to specific class levels
 * Makes exam visible to students in those classes
 * Optionally schedules release/revocation times
 */
export async function releaseExamToStudents(
  examId: string,
  _adminId: string,
  input: ReleaseExamInput
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

  if (exam.status !== "APPROVED") {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Only APPROVED exams can be released to students"
    );
  }

  // Validate classLevelIds if provided
  if (
    input.classLevelIds &&
    input.classLevelIds.length > 0
  ) {
    const classLevelIds =
      input.classLevelIds.map(
        (id) =>
          new Types.ObjectId(id)
      );

    const validClassLevels =
      await ClassLevel.countDocuments({
        _id: { $in: classLevelIds },
        isActive: true
      });

    if (
      validClassLevels !==
      input.classLevelIds.length
    ) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Some class levels are invalid or inactive"
      );
    }
  }

  // Validate release/revoke times
  if (input.releaseAt) {
    const now = new Date();
    if (input.releaseAt <= now) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Release time must be in the future"
      );
    }
  }

  if (input.revokeAt) {
    const releaseTime =
      input.releaseAt || new Date();
    if (input.revokeAt <= releaseTime) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Revoke time must be after release time"
      );
    }
  }

  const updated =
    await Exam.findByIdAndUpdate(
      examId,
      {
        isReleasedToStudents: true,
        releasedAt: input.releaseAt ||
          new Date(),
        releasedTo: input.classLevelIds || [
          exam.classLevelId
        ],
        scheduleRevokeAt:
          input.revokeAt,
        releaseStatus: "ACTIVE"
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
      },
      {
        path: "releasedTo",
        select: "section gradeId"
      }
    ]);

  return updated;
}

/**
 * Revokes exam access from students
 * Prevents new attempts from being created
 */
export async function revokeExamFromStudents(
  examId: string,
  _adminId: string
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

  if (!exam.isReleasedToStudents) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Exam is not released to students"
    );
  }

  const updated =
    await Exam.findByIdAndUpdate(
      examId,
      {
        isReleasedToStudents: false,
        releaseStatus: "REVOKED",
        revokedAt: new Date()
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

/**
 * Checks if an exam is available for a specific student
 * Considers:
 * - Exam status (APPROVED)
 * - Release status (must be released)
 * - Student's class level (must match releasedTo)
 * - Time window (current time must be within startAt-endAt)
 */
export async function isExamAvailableForStudent(
  examId: string,
  studentId: string
): Promise<boolean> {
  if (
    !Types.ObjectId.isValid(examId) ||
    !Types.ObjectId.isValid(studentId)
  ) {
    return false;
  }

  // Get student's class level
  const student = await User.findById(
    studentId
  ).select("classLevelId");

  if (!student || !student.classLevelId) {
    return false;
  }

  const exam = await Exam.findById(
    examId
  ).select(
    "status isReleasedToStudents releasedTo startAt endAt releaseStatus"
  );

  if (!exam) {
    return false;
  }

  // Check status
  if (exam.status !== "APPROVED") {
    return false;
  }

  // Check release status
  if (!exam.isReleasedToStudents) {
    return false;
  }

  if (exam.releaseStatus !== "ACTIVE") {
    return false;
  }

  // Check class level match
  const releasedToArray =
    Array.isArray(exam.releasedTo)
      ? exam.releasedTo
      : [exam.classLevelId];

  const isClassLevelMatch =
    releasedToArray.some(
      (classLevelId) =>
        classLevelId?.toString() ===
        student.classLevelId?.toString()
    );

  if (!isClassLevelMatch) {
    return false;
  }

  // Check time window
  const now = new Date();
  if (
    exam.startAt > now ||
    exam.endAt <= now
  ) {
    return false;
  }

  return true;
}

/**
 * Gets exams available for a student
 * Filters by:
 * - APPROVED status
 * - Released to student's class level
 * - Currently within exam time window
 */
export async function getAvailableExamsForStudent(
  studentId: string
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

  const student = await User.findById(
    studentId
  ).select("classLevelId");

  if (!student || !student.classLevelId) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Student does not have a class level assigned"
    );
  }

  const now = new Date();

  const filter: any = {
    status: "APPROVED",
    isReleasedToStudents: true,
    releaseStatus: "ACTIVE",
    releasedTo: { $in: [student.classLevelId] },
    startAt: { $lte: now },
    endAt: { $gt: now }
  };

  const exams = await Exam.find(filter)
    .populate([
      {
        path: "createdBy",
        select: "email name"
      },
      {
        path: "subjectId",
        select: "name code"
      }
    ])
    .select(
      "title subjectId startAt endAt durationMinutes totalMarks"
    )
    .sort({ startAt: 1 });

  return exams;
}

/**
 * Gets upcoming exams for a student
 * Exams that are approved and released but haven't started yet
 */
export async function getUpcomingExamsForStudent(
  studentId: string
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

  const student = await User.findById(
    studentId
  ).select("classLevelId");

  if (!student || !student.classLevelId) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Student does not have a class level assigned"
    );
  }

  const now = new Date();

  const filter: any = {
    status: "APPROVED",
    isReleasedToStudents: true,
    releaseStatus: "ACTIVE",
    releasedTo: { $in: [student.classLevelId] },
    startAt: { $gt: now }
  };

  const exams = await Exam.find(filter)
    .populate([
      {
        path: "createdBy",
        select: "email name"
      },
      {
        path: "subjectId",
        select: "name code"
      }
    ])
    .select(
      "title subjectId startAt endAt durationMinutes totalMarks"
    )
    .sort({ startAt: 1 });

  return exams;
}

/**
 * Gets past exams for a student
 * Exams that have already ended
 */
export async function getPastExamsForStudent(
  studentId: string
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

  const student = await User.findById(
    studentId
  ).select("classLevelId");

  if (!student || !student.classLevelId) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Student does not have a class level assigned"
    );
  }

  const now = new Date();

  const filter: any = {
    status: { $in: ["APPROVED", "COMPLETED"] },
    isReleasedToStudents: true,
    releasedTo: { $in: [student.classLevelId] },
    endAt: { $lte: now }
  };

  const exams = await Exam.find(filter)
    .populate([
      {
        path: "createdBy",
        select: "email name"
      },
      {
        path: "subjectId",
        select: "name code"
      }
    ])
    .select(
      "title subjectId startAt endAt durationMinutes totalMarks resultsReleased"
    )
    .sort({ endAt: -1 });

  return exams;
}
