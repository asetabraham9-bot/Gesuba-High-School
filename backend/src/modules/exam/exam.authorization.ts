import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

import {
  isInstructorAssigned
} from "../instructor-assignment/instructor-assignment.service.js";

type ExamType =
  | "REGULAR"
  | "MODEL"
  | "NATIONAL";

export async function validateExamCreationPermission(
  instructorId: string,
  examType: ExamType,
  classLevelId: string,
  subjectId: string,
  academicYear: string
): Promise<void> {
  /*
   * MODEL and NATIONAL exams
   * are not restricted to the
   * instructor's assigned class.
   */
  if (
    examType === "MODEL" ||
    examType === "NATIONAL"
  ) {
    return;
  }

  /*
   * REGULAR exams require
   * an active instructor
   * assignment.
   */
  const assigned =
    await isInstructorAssigned(
      instructorId,
      classLevelId,
      subjectId,
      academicYear
    );

  if (!assigned) {
    throw new AppError(
      403,
      ERROR_CODES.FORBIDDEN,
      "You are not assigned to this class and subject"
    );
  }
}