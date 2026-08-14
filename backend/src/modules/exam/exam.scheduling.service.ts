import { Types } from "mongoose";

import { Exam } from "../../models/exam.model.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

interface ScheduleExamInput {
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
}

/**
 * Validates exam dates and scheduling constraints
 * - startAt must be in the future
 * - endAt must be after startAt
 * - exam window must accommodate duration
 */
export function validateExamDates(
  input: ScheduleExamInput
): void {
  const now = new Date();

  if (input.startAt <= now) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Exam start time must be in the future"
    );
  }

  if (input.endAt <= input.startAt) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Exam end time must be after start time"
    );
  }

  const examWindow =
    input.endAt.getTime() -
    input.startAt.getTime();

  const requiredDuration =
    input.durationMinutes *
    60 *
    1000;

  if (examWindow < requiredDuration) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Exam time window must be at least as long as the exam duration"
    );
  }
}

/**
 * Locks exam schedule after approval
 * Prevents any further date changes
 * Sets isScheduleLocked flag
 */
export async function lockExamSchedule(
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

  if (exam.status !== "APPROVED") {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Only APPROVED exams can have their schedule locked"
    );
  }

  const updated =
    await Exam.findByIdAndUpdate(
      examId,
      {
        isScheduleLocked: true,
        scheduleLocked: true,
        scheduleLockTime: new Date()
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
 * Updates exam schedule only if not locked
 * Can modify startAt, endAt, durationMinutes
 * Only instructors can update their own exam schedule
 */
export async function updateExamSchedule(
  examId: string,
  instructorId: string,
  input: Partial<ScheduleExamInput>
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
      "You can only update your own exams"
    );
  }

  if (exam.isScheduleLocked || exam.scheduleLocked) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Cannot update schedule for locked exams"
    );
  }

  if (
    exam.status !== "DRAFT" &&
    exam.status !== "APPROVED"
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Can only update schedule for DRAFT or APPROVED exams"
    );
  }

  // Prepare update with fallback to existing values
  const updatedData: Partial<ScheduleExamInput> =
    {
      startAt: input.startAt ?? exam.startAt,
      endAt: input.endAt ?? exam.endAt,
      durationMinutes:
        input.durationMinutes ??
        exam.durationMinutes
    };

  // Validate the updated dates
  validateExamDates(
    updatedData as ScheduleExamInput
  );

  const updated =
    await Exam.findByIdAndUpdate(
      examId,
      updatedData,
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
 * Retrieves exam schedule with lock status
 */
export async function getExamSchedule(
  examId: string
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
  )
    .select(
      "title startAt endAt durationMinutes status isScheduleLocked scheduleLocked scheduleLockTime"
    )
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
    ]);

  if (!exam) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam not found"
    );
  }

  return exam;
}

/**
 * Calculates time until exam starts
 * Returns milliseconds remaining
 */
export function getTimeUntilExamStart(
  startAt: Date
): number {
  const now = new Date();
  return startAt.getTime() - now.getTime();
}

/**
 * Checks if exam is currently ongoing
 */
export function isExamOngoing(
  exam: {
    startAt: Date;
    endAt: Date;
  }
): boolean {
  const now = new Date();
  return (
    exam.startAt <= now && now < exam.endAt
  );
}

/**
 * Checks if exam is upcoming
 */
export function isExamUpcoming(
  exam: { startAt: Date }
): boolean {
  const now = new Date();
  return exam.startAt > now;
}

/**
 * Checks if exam has ended
 */
export function hasExamEnded(
  exam: { endAt: Date }
): boolean {
  const now = new Date();
  return exam.endAt <= now;
}
