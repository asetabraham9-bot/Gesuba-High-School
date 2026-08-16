import { ClassLevel } from "../../models/class-level.model.js";
import type { UserDocument } from "../../models/user.model.js";
import type { UserRole } from "../../models/user.model.js";

const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  ADMIN: "Admin"
};

function extractStudentId(email: string): string {
  if (email.endsWith("@student.gesuba.edu.et")) {
    return email.replace("@student.gesuba.edu.et", "");
  }

  return email.split("@")[0] ?? email;
}

export async function formatUserResponse(
  user: UserDocument
) {
  let gradeLevel: number | null = null;

  if (user.classLevelId) {
    const classLevel = await ClassLevel.findById(
      user.classLevelId
    ).populate("gradeId");

    const grade = classLevel?.gradeId as
      | { number?: number }
      | undefined;

    if (grade?.number) {
      gradeLevel = grade.number;
    }
  }

  const studentId = extractStudentId(user.email);

  return {
    id: user.id,
    user_id: user.id,
    email: user.email,
    role: ROLE_LABELS[user.role],
    full_name: user.name ?? studentId,
    name: user.name,
    username: studentId,
    student_id: studentId,
    grade_level: gradeLevel,
    status: user.status,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
}
