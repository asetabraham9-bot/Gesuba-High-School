import { Schema } from "mongoose";
import { Attendance, AttendanceStatus } from "../../models/attendance.model.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

export interface MarkAttendanceInput {
  studentId: string;
  classLevelId: string;
  subjectId: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceQuery {
  studentId?: string;
  classLevelId?: string;
  subjectId?: string;
  instructorId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus;
}

export class AttendanceService {
  /**
   * Mark attendance for a student
   * Instructor can mark attendance for their assigned classes
   */
  async markAttendance(
    instructorId: string,
    input: MarkAttendanceInput
  ) {
    // Validate instructor teaches this class/subject
    // This would be verified in controller via middleware

    const attendance = await Attendance.findOneAndUpdate(
      {
        studentId: input.studentId,
        classLevelId: input.classLevelId,
        subjectId: input.subjectId,
        date: {
          $gte: new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate()),
          $lt: new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate() + 1)
        }
      },
      {
        $set: {
          status: input.status,
          notes: input.notes,
          instructorId,
          markedAt: new Date()
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    ).populate([
      { path: "studentId", select: "email name" },
      { path: "classLevelId", select: "section gradeId" },
      { path: "subjectId", select: "name" }
    ]);

    return attendance;
  }

  /**
   * Get attendance record for a specific student on a specific date/subject
   */
  async getStudentAttendance(
    studentId: string,
    query: Partial<AttendanceQuery>
  ) {
    const filter: any = { studentId };

    if (query.classLevelId) filter.classLevelId = query.classLevelId;
    if (query.subjectId) filter.subjectId = query.subjectId;
    if (query.status) filter.status = query.status;

    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = query.startDate;
      if (query.endDate) filter.date.$lte = query.endDate;
    }

    const records = await Attendance.find(filter)
      .populate([
        { path: "classLevelId", select: "section gradeId" },
        { path: "subjectId", select: "name" },
        { path: "instructorId", select: "name email" }
      ])
      .sort({ date: -1 });

    return records;
  }

  /**
   * Get attendance statistics for a student
   */
  async getStudentAttendanceStats(
    studentId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const filter: any = { studentId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const records = await Attendance.find(filter);

    const stats = {
      total: records.length,
      present: records.filter(r => r.status === AttendanceStatus.PRESENT).length,
      absent: records.filter(r => r.status === AttendanceStatus.ABSENT).length,
      late: records.filter(r => r.status === AttendanceStatus.LATE).length,
      excused: records.filter(r => r.status === AttendanceStatus.EXCUSED).length,
      attendancePercentage: records.length > 0 
        ? Math.round((records.filter(r => r.status === AttendanceStatus.PRESENT).length / records.length) * 100)
        : 0
    };

    return stats;
  }

  /**
   * Get attendance records for a class on a specific date
   */
  async getClassAttendance(
    classLevelId: string,
    date: Date,
    subjectId?: string
  ) {
    const filter: any = {
      classLevelId,
      date: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    };

    if (subjectId) filter.subjectId = subjectId;

    const records = await Attendance.find(filter)
      .populate([
        { path: "studentId", select: "name email" },
        { path: "subjectId", select: "name" },
        { path: "instructorId", select: "name email" }
      ])
      .sort({ "studentId.name": 1 });

    return records;
  }

  /**
   * Get instructor's attendance marking summary for a day
   */
  async getInstructorDayAttendance(
    instructorId: string,
    date: Date,
    classLevelId?: string
  ) {
    const filter: any = {
      instructorId,
      date: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    };

    if (classLevelId) filter.classLevelId = classLevelId;

    const records = await Attendance.find(filter)
      .populate([
        { path: "studentId", select: "name email" },
        { path: "classLevelId", select: "section" },
        { path: "subjectId", select: "name" }
      ])
      .sort({ classLevelId: 1, subjectId: 1 });

    return records;
  }

  /**
   * Get attendance sheet template for a class
   * Returns list of students in class without attendance marked yet
   */
  async getAttendanceSheet(
    classLevelId: string,
    date: Date,
    subjectId: string
  ) {
    // This would join with students in the class
    // For now, return empty to be implemented with User model query
    const existing = await Attendance.find({
      classLevelId,
      subjectId,
      date: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    }).select("studentId");

    return {
      classLevelId,
      date,
      subjectId,
      markedCount: existing.length,
      marked: existing.map(a => a.studentId)
    };
  }

  /**
   * Bulk mark attendance for a class
   */
  async bulkMarkAttendance(
    instructorId: string,
    classLevelId: string,
    subjectId: string,
    date: Date,
    records: MarkAttendanceInput[]
  ) {
    const results = await Promise.all(
      records.map(record =>
        this.markAttendance(instructorId, {
          ...record,
          classLevelId,
          subjectId,
          date
        })
      )
    );

    return results;
  }

  /**
   * Get attendance report for a class over time period
   */
  async getClassAttendanceReport(
    classLevelId: string,
    startDate: Date,
    endDate: Date
  ) {
    const records = await Attendance.find({
      classLevelId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate("studentId subjectId");

    // Group by student
    const byStudent: { [key: string]: any } = {};
    records.forEach(record => {
      const studentId = record.studentId._id.toString();
      if (!byStudent[studentId]) {
        byStudent[studentId] = {
          student: record.studentId,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          records: []
        };
      }
      byStudent[studentId].total++;
      byStudent[studentId][record.status.toLowerCase()]++;
      byStudent[studentId].records.push(record);
    });

    // Calculate percentages
    const report = Object.values(byStudent).map((student: any) => ({
      ...student,
      attendancePercentage: Math.round(
        (student.present / student.total) * 100
      )
    }));

    return report;
  }
}

export const attendanceService = new AttendanceService();
