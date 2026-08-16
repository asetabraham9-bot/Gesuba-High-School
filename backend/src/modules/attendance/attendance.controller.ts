import { Request, Response, NextFunction } from "express";
import { attendanceService } from "./attendance.service.js";
import {
  markAttendanceSchema,
  getStudentAttendanceSchema,
  getClassAttendanceSchema,
  bulkMarkAttendanceSchema,
  attendanceReportSchema
} from "./attendance.validation.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

export class AttendanceController {
  /**
   * Mark attendance for a single student
   * POST /attendance/mark
   */
  async markAttendanceController(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = req.user?.id;
      if (!instructorId) {
        throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
      }

      const input = markAttendanceSchema.parse(req.body);

      const attendance = await attendanceService.markAttendance(instructorId, {
        ...input,
        date: new Date(input.date)
      });

      res.status(201).json({
        success: true,
        data: attendance
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get attendance records for a student
   * GET /attendance/student/:studentId
   */
  async getStudentAttendanceController(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const { classLevelId, subjectId, startDate, endDate, status } = req.query;

      const records = await attendanceService.getStudentAttendance(studentId, {
        classLevelId: classLevelId as string | undefined,
        subjectId: subjectId as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        status: status as any | undefined
      });

      res.status(200).json({
        success: true,
        data: records
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get attendance statistics for a student
   * GET /attendance/student/:studentId/stats
   */
  async getStudentAttendanceStatsController(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const { startDate, endDate } = req.query;

      const stats = await attendanceService.getStudentAttendanceStats(
        studentId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get attendance for a class on a specific date
   * GET /attendance/class/:classLevelId
   */
  async getClassAttendanceController(req: Request, res: Response, next: NextFunction) {
    try {
      const { classLevelId } = req.params;
      const { date, subjectId } = req.query;

      if (!date) {
        throw new AppError("Date query parameter is required", 400, ErrorCode.VALIDATION_ERROR);
      }

      const records = await attendanceService.getClassAttendance(
        classLevelId,
        new Date(date as string),
        subjectId as string | undefined
      );

      res.status(200).json({
        success: true,
        data: records
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get instructor's day attendance summary
   * GET /attendance/instructor/day
   */
  async getInstructorDayAttendanceController(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = req.user?.id;
      if (!instructorId) {
        throw new AppError(401, ERROR_CODES.UNAUTHORIZED, "Unauthorized");
      }

      const { date, classLevelId } = req.query;

      if (!date) {
        throw new AppError(
          400,
          ERROR_CODES.VALIDATION_ERROR,
          "Date query parameter is required"
        );
      }

      const records = await attendanceService.getInstructorDayAttendance(
        instructorId,
        new Date(date as string),
        classLevelId as string | undefined
      );

      res.status(200).json({
        success: true,
        data: records
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get attendance sheet (template) for marking
   * GET /attendance/sheet
   */
  async getAttendanceSheetController(req: Request, res: Response, next: NextFunction) {
    try {
      const { classLevelId, date, subjectId } = req.query;

      if (!classLevelId || !date || !subjectId) {
        throw new AppError(
          400,
          ERROR_CODES.VALIDATION_ERROR,
          "classLevelId, date, and subjectId are required"
        );
      }

      const sheet = await attendanceService.getAttendanceSheet(
        classLevelId as string,
        new Date(date as string),
        subjectId as string
      );

      res.status(200).json({
        success: true,
        data: sheet
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk mark attendance for a class
   * POST /attendance/bulk
   */
  async bulkMarkAttendanceController(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = req.user?.id;
      if (!instructorId) {
        throw new AppError(401, ERROR_CODES.UNAUTHORIZED, "Unauthorized");
      }

      const input = bulkMarkAttendanceSchema.parse(req.body);

      const results = await attendanceService.bulkMarkAttendance(
        instructorId,
        input.classLevelId,
        input.subjectId,
        new Date(input.date),
        input.records.map(r => ({
          ...r,
          classLevelId: input.classLevelId,
          subjectId: input.subjectId,
          date: new Date(input.date)
        }))
      );

      res.status(201).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get attendance report for a class
   * GET /attendance/report
   */
  async getClassAttendanceReportController(req: Request, res: Response, next: NextFunction) {
    try {
      const { classLevelId, startDate, endDate } = req.query;

      if (!classLevelId || !startDate || !endDate) {
        throw new AppError(
          "classLevelId, startDate, and endDate are required",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      const report = await attendanceService.getClassAttendanceReport(
        classLevelId as string,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

export const attendanceController = new AttendanceController();
