import { Schema } from "mongoose";
import { ExamAttempt } from "../../models/exam-attempt.model.js";
import { Exam } from "../../models/exam.model.js";
import { Attendance } from "../../models/attendance.model.js";
import { AttendanceStatus } from "../../models/attendance.model.js";
import { User } from "../../models/user.model.js";

export interface StudentPerformanceReport {
  studentId: string;
  studentName: string;
  studentEmail: string;
  classLevelId: string;
  overallScore: number;
  totalExamsTaken: number;
  averageExamScore: number;
  highestExamScore: number;
  lowestExamScore: number;
  examsAttempted: Array<{
    examId: string;
    examTitle: string;
    subject: string;
    score: number;
    totalMarks: number;
    percentage: number;
    attemptedAt: Date;
    status: string;
  }>;
  attendanceStats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
  };
  lastExamDate: Date | null;
  lastAttendanceDate: Date | null;
}

export interface ClassPerformanceStats {
  classLevelId: string;
  totalStudents: number;
  averageScore: number;
  topStudents: Array<{
    studentId: string;
    studentName: string;
    averageScore: number;
  }>;
  bottomStudents: Array<{
    studentId: string;
    studentName: string;
    averageScore: number;
  }>;
  subjectAverages: Array<{
    subjectId: string;
    subjectName: string;
    averageScore: number;
  }>;
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  totalExams: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  studentScores: Array<{
    studentId: string;
    studentName: string;
    scores: number[];
    average: number;
  }>;
}

export class PerformanceAnalyticsService {
  /**
   * Get comprehensive performance report for a student
   */
  async getStudentPerformanceReport(
    studentId: string
  ): Promise<StudentPerformanceReport> {
    // Get student info
    const student = await User.findById(studentId).select("name email classLevelId");
    if (!student) {
      throw new Error("Student not found");
    }

    // Get exam attempts
    const attempts = await ExamAttempt.find({
      studentId,
      status: "SUBMITTED"
    })
      .populate("examId", "title totalMarks startAt")
      .populate("examId.subjectId", "name")
      .sort({ submittedAt: -1 });

    // Get attendance stats
    const attendanceRecords = await Attendance.find({
      studentId: studentId as any
    });

    const attendanceStats = {
      total: attendanceRecords.length,
      present: attendanceRecords.filter(a => a.status === AttendanceStatus.PRESENT).length,
      absent: attendanceRecords.filter(a => a.status === AttendanceStatus.ABSENT).length,
      late: attendanceRecords.filter(a => a.status === AttendanceStatus.LATE).length,
      excused: attendanceRecords.filter(a => a.status === AttendanceStatus.EXCUSED).length,
      attendancePercentage: attendanceRecords.length > 0 
        ? Math.round(
            (attendanceRecords.filter(a => a.status === AttendanceStatus.PRESENT).length /
              attendanceRecords.length) *
              100
          )
        : 0
    };

    // Calculate exam performance
    const examsAttempted = attempts
      .map((attempt: any) => ({
        examId: attempt.examId._id.toString(),
        examTitle: attempt.examId.title,
        subject: attempt.examId.subjectId?.name || "Unknown",
        score: attempt.score || 0,
        totalMarks: attempt.examId.totalMarks,
        percentage: attempt.examId.totalMarks
          ? Math.round(((attempt.score || 0) / attempt.examId.totalMarks) * 100)
          : 0,
        attemptedAt: attempt.submittedAt,
        status: attempt.status
      }));

    const totalScore = examsAttempted.reduce((sum: number, exam: any) => sum + exam.score, 0);
    const averageScore =
      examsAttempted.length > 0
        ? Math.round(totalScore / examsAttempted.length)
        : 0;

    const scores = examsAttempted.map((e: any) => e.score);

    return {
      studentId: student._id.toString(),
      studentName: student.name,
      studentEmail: student.email,
      classLevelId: student.classLevelId?.toString() || "",
      overallScore: totalScore,
      totalExamsTaken: examsAttempted.length,
      averageExamScore: averageScore,
      highestExamScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestExamScore: scores.length > 0 ? Math.min(...scores) : 0,
      examsAttempted,
      attendanceStats,
      lastExamDate: examsAttempted.length > 0 ? examsAttempted[0].attemptedAt : null,
      lastAttendanceDate:
        attendanceRecords.length > 0
          ? attendanceRecords.sort((a: any, b: any) => b.date.getTime() - a.date.getTime())[0].date
          : null
    };
  }

  /**
   * Get performance comparison between students in a class
   */
  async getClassPerformanceStats(classLevelId: string): Promise<ClassPerformanceStats> {
    // Get all students in class
    const students: any = await User.find({
      classLevelId: classLevelId as any,
      role: "STUDENT"
    }).select("_id name");

    // Get all exam attempts for the class
    const attempts = await ExamAttempt.find({
      studentId: { $in: students.map((s: any) => s._id) },
      status: "SUBMITTED"
    })
      .populate("studentId", "name")
      .populate("examId", "subjectId totalMarks")
      .populate("examId.subjectId", "name");

    // Calculate student averages
    const studentAverages: { [key: string]: number[] } = {};
    const subjectAverages: { [key: string]: { scores: number[]; name: string } } = {};

    attempts.forEach((attempt: any) => {
      const studentId = attempt.studentId._id.toString();
      const subjectId = attempt.examId.subjectId._id.toString();
      const score = attempt.score || 0;

      if (!studentAverages[studentId]) {
        studentAverages[studentId] = [];
      }
      studentAverages[studentId].push(score);

      if (!subjectAverages[subjectId]) {
        subjectAverages[subjectId] = {
          scores: [],
          name: attempt.examId.subjectId?.name || "Unknown"
        };
      }
      subjectAverages[subjectId].scores.push(score);
    });

    // Calculate averages
    const studentScoresWithNames = students.map((student: any) => ({
      studentId: student._id.toString(),
      studentName: student.name,
      averageScore:
        studentAverages[student._id.toString()]?.length > 0
          ? Math.round(
              studentAverages[student._id.toString()].reduce((a, b) => a + b, 0) /
                studentAverages[student._id.toString()].length
            )
          : 0
    }));

    const classAverage =
      studentScoresWithNames.length > 0
        ? Math.round(
            studentScoresWithNames.reduce((sum: number, s: any) => sum + s.averageScore, 0) /
              studentScoresWithNames.length
          )
        : 0;

    return {
      classLevelId,
      totalStudents: students.length,
      averageScore: classAverage,
      topStudents: studentScoresWithNames
        .sort((a: any, b: any) => b.averageScore - a.averageScore)
        .slice(0, 5),
      bottomStudents: studentScoresWithNames
        .sort((a: any, b: any) => a.averageScore - b.averageScore)
        .slice(0, 5),
      subjectAverages: Object.entries(subjectAverages).map(([subjectId, data]: any) => ({
        subjectId,
        subjectName: data.name,
        averageScore:
          data.scores.length > 0
            ? Math.round(data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length)
            : 0
      }))
    };
  }

  /**
   * Get subject-wise performance analysis
   */
  async getSubjectPerformance(subjectId: string): Promise<SubjectPerformance> {
    const exams: any = await Exam.find({ subjectId }).select("_id title");

    const attempts = await ExamAttempt.find({
      examId: { $in: exams.map((e: any) => e._id) },
      status: "SUBMITTED"
    })
      .populate("studentId", "name")
      .populate("examId", "title");

    // Group by student
    const byStudent: {
      [key: string]: { name: string; scores: number[] };
    } = {};
    const allScores: number[] = [];

    attempts.forEach((attempt: any) => {
      const studentId = attempt.studentId._id.toString();
      const score = attempt.score || 0;

      if (!byStudent[studentId]) {
        byStudent[studentId] = {
          name: attempt.studentId.name,
          scores: []
        };
      }

      byStudent[studentId].scores.push(score);
      allScores.push(score);
    });

    return {
      subjectId,
      subjectName: "Subject Name", // Would need to populate subject name
      totalExams: exams.length,
      averageScore:
        allScores.length > 0
          ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
          : 0,
      highestScore: allScores.length > 0 ? Math.max(...allScores) : 0,
      lowestScore: allScores.length > 0 ? Math.min(...allScores) : 0,
      studentScores: Object.entries(byStudent).map(([studentId, data]) => ({
        studentId,
        studentName: data.name,
        scores: data.scores,
        average:
          data.scores.length > 0
            ? Math.round(
                data.scores.reduce((a, b) => a + b, 0) / data.scores.length
              )
            : 0
      }))
    };
  }

  /**
   * Get students at risk (low performance + low attendance)
   */
  async getAtRiskStudents(classLevelId: string, scoreThreshold = 40, attendanceThreshold = 75) {
    const students = await User.find({
      classLevelId: classLevelId as any,
      role: "STUDENT"
    }).select("_id name email");

    const atRiskStudents = [];

    for (const student of students) {
      const report = await this.getStudentPerformanceReport(student._id.toString());

      if (
        report.averageExamScore < scoreThreshold ||
        report.attendanceStats.attendancePercentage < attendanceThreshold
      ) {
        atRiskStudents.push({
          studentId: student._id.toString(),
          studentName: student.name,
          studentEmail: student.email,
          averageScore: report.averageExamScore,
          attendancePercentage: report.attendanceStats.attendancePercentage,
          reasons: [
            report.averageExamScore < scoreThreshold
              ? `Low exam performance (${report.averageExamScore}%)`
              : null,
            report.attendanceStats.attendancePercentage < attendanceThreshold
              ? `Low attendance (${report.attendanceStats.attendancePercentage}%)`
              : null
          ].filter(Boolean)
        });
      }
    }

    return atRiskStudents;
  }
}

export const performanceAnalyticsService = new PerformanceAnalyticsService();
