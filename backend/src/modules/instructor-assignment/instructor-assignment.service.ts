import {
  InstructorAssignment
} from "../../models/instructor.assignment.model.js";

export async function isInstructorAssigned(
  instructorId: string,
  classLevelId: string,
  subjectId: string,
  academicYear: string
): Promise<boolean> {
  const assignment =
    await InstructorAssignment.exists({
      instructorId,
      classLevelId,
      subjectId,
      academicYear,
      status: "ACTIVE"
    });

  return Boolean(assignment);
}