import { User } from "../../models/user.model.js";
import { InstructorAssignment } from "../../models/instructor.assignment.model.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

export interface ClassRoster {
  classLevelId: string;
  section: string;
  gradeId: string;
  totalStudents: number;
  students: Array<{
    studentId: string;
    name: string;
    email: string;
    status: string;
  }>;
}

export interface InstructorAssignmentInfo {
  assignmentId: string;
  instructorId: string;
  instructorName: string;
  classLevelId: string;
  section: string;
  subjectId: string;
  subjectName: string;
  academicYear: string;
  status: string;
}

export class ClassManagementService {
  /**
   * Get class roster (list of students in a class)
   */
  async getClassRoster(classLevelId: string) {
    const students = await User.find({
      classLevelId,
      role: "STUDENT"
    })
      .populate("classLevelId", "section gradeId")
      .select("name email status classLevelId")
      .sort({ name: 1 });

    const classLevel: any = students[0]?.classLevelId;

    return {
      classLevelId,
      section: classLevel?.section || "Unknown",
      gradeId: classLevel?.gradeId || "",
      totalStudents: students.length,
      students: students.map(s => ({
        studentId: s._id.toString(),
        name: s.name,
        email: s.email,
        status: s.status
      }))
    };
  }

  /**
   * Get instructors assigned to a class
   */
  async getClassInstructors(classLevelId: string) {
    const assignments = await InstructorAssignment.find({
      classLevelId,
      status: "ACTIVE"
    })
      .populate("instructorId", "name email")
      .populate("subjectId", "name")
      .sort({ createdAt: 1 });

    return assignments.map(assignment => ({
      assignmentId: assignment._id.toString(),
      instructorId: (assignment.instructorId as any)._id.toString(),
      instructorName: (assignment.instructorId as any).name,
      instructorEmail: (assignment.instructorId as any).email,
      classLevelId: assignment.classLevelId.toString(),
      subjectId: (assignment.subjectId as any)._id.toString(),
      subjectName: (assignment.subjectId as any).name,
      academicYear: assignment.academicYear,
      status: assignment.status
    }));
  }

  /**
   * Get classes for an instructor
   */
  async getInstructorClasses(instructorId: string) {
    const assignments = await InstructorAssignment.find({
      instructorId,
      status: "ACTIVE"
    })
      .populate("classLevelId", "section gradeId")
      .populate("subjectId", "name")
      .sort({ createdAt: 1 });

    return assignments.map(assignment => ({
      assignmentId: assignment._id.toString(),
      classLevelId: (assignment.classLevelId as any)._id.toString(),
      section: (assignment.classLevelId as any).section,
      subjectId: (assignment.subjectId as any)._id.toString(),
      subjectName: (assignment.subjectId as any).name,
      academicYear: assignment.academicYear
    }));
  }

  /**
   * Get instructor's class roster
   */
  async getInstructorClassRoster(instructorId: string, classLevelId: string) {
    // Verify instructor teaches this class
    const assignment = await InstructorAssignment.findOne({
      instructorId,
      classLevelId,
      status: "ACTIVE"
    });

    if (!assignment) {
      throw new AppError(
        403,
        ERROR_CODES.FORBIDDEN,
        "You do not teach this class"
      );
    }

    return this.getClassRoster(classLevelId);
  }

  /**
   * Assign instructor to class/subject
   */
  async assignInstructorToClass(
    instructorId: string,
    classLevelId: string,
    subjectId: string,
    academicYear: string
  ) {
    // Check if already assigned
    const existing = await InstructorAssignment.findOne({
      instructorId,
      classLevelId,
      subjectId,
      academicYear
    });

    if (existing) {
      throw new AppError(
        400,
        ERROR_CODES.CONFLICT,
        "This assignment already exists"
      );
    }

    const assignment = await InstructorAssignment.create({
      instructorId,
      classLevelId,
      subjectId,
      academicYear,
      status: "ACTIVE"
    });

    return assignment.populate([
      { path: "instructorId", select: "name email" },
      { path: "classLevelId", select: "section gradeId" },
      { path: "subjectId", select: "name" }
    ]);
  }

  /**
   * Revoke instructor from class/subject
   */
  async revokeInstructorAssignment(assignmentId: string) {
    const assignment = await InstructorAssignment.findByIdAndUpdate(
      assignmentId,
      { $set: { status: "INACTIVE" } },
      { new: true }
    ).populate([
      { path: "instructorId", select: "name email" },
      { path: "classLevelId", select: "section gradeId" },
      { path: "subjectId", select: "name" }
    ]);

    if (!assignment) {
      throw new AppError(
        404,
        ERROR_CODES.NOT_FOUND,
        "Assignment not found"
      );
    }

    return assignment;
  }

  /**
   * Enroll student in class
   */
  async enrollStudentInClass(studentId: string, classLevelId: string) {
    const student = await User.findByIdAndUpdate(
      studentId,
      { $set: { classLevelId } },
      { new: true }
    );

    if (!student) {
      throw new AppError(
        "Student not found",
        404,
        ErrorCode.NOT_FOUND
      );
    }

    return student;
  }

  /**
   * Remove student from class
   */
  async removeStudentFromClass(studentId: string) {
    const student = await User.findByIdAndUpdate(
      studentId,
      { $unset: { classLevelId: "" } },
      { new: true }
    );

    if (!student) {
      throw new AppError(
        "Student not found",
        404,
        ErrorCode.NOT_FOUND
      );
    }

    return student;
  }

  /**
   * Get class summary (student count, instructors, etc.)
   */
  async getClassSummary(classLevelId: string) {
    const [studentCount, instructors] = await Promise.all([
      User.countDocuments({ classLevelId, role: "STUDENT" }),
      this.getClassInstructors(classLevelId)
    ]);

    return {
      classLevelId,
      studentCount,
      instructorCount: instructors.length,
      instructors,
      lastUpdated: new Date()
    };
  }
}

export const classManagementService = new ClassManagementService();
