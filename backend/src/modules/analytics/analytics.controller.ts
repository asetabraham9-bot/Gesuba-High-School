import { Request, Response, NextFunction } from "express";
import { performanceAnalyticsService } from "./performance.analytics.service.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

export class AnalyticsController {
  /**
   * Get student performance report
   * GET /analytics/student/:studentId
   */
  async getStudentPerformanceController(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const requestingUser = req.user;

      // Verify access: student can view own, instructor/admin can view any
      if (requestingUser?.role === "STUDENT" && requestingUser.id !== studentId) {
        throw new AppError(403, ERROR_CODES.FORBIDDEN, "Forbidden");
      }

      const report = await performanceAnalyticsService.getStudentPerformanceReport(studentId as string);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get class performance statistics
   * GET /analytics/class/:classLevelId
   */
  async getClassPerformanceController(req: Request, res: Response, next: NextFunction) {
    try {
      const { classLevelId } = req.params;

      const stats = await performanceAnalyticsService.getClassPerformanceStats(classLevelId as string);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subject performance analysis
   * GET /analytics/subject/:subjectId
   */
  async getSubjectPerformanceController(req: Request, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.params;

      const performance = await performanceAnalyticsService.getSubjectPerformance(subjectId as string);

      res.status(200).json({
        success: true,
        data: performance
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get at-risk students for a class
   * GET /analytics/at-risk/:classLevelId
   */
  async getAtRiskStudentsController(req: Request, res: Response, next: NextFunction) {
    try {
      const { classLevelId } = req.params;
      const { scoreThreshold = 40, attendanceThreshold = 75 } = req.query;

      const atRiskStudents = await performanceAnalyticsService.getAtRiskStudents(
        classLevelId as string,
        parseInt(scoreThreshold as string) || 40,
        parseInt(attendanceThreshold as string) || 75
      );

      res.status(200).json({
        success: true,
        count: atRiskStudents.length,
        data: atRiskStudents
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
