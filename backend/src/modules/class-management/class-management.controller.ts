import { Request, Response, NextFunction } from "express";
import { classManagementService } from "./class-management.service.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

export class ClassManagementController {
  /**
   * Get class roster
   * GET /classes/:classLevelId/roster
   */
  async getClassRosterController(req: Request, res: Response, next: NextFunction) {
    try {
      const { classLevelId } = req.params;

      const roster = await classManagementService.getClassRoster(classLevelId);

      res.status(200).json({
        success: true,
        data: roster
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get instructors for a class
   * GET /classes/:classLevelId/instructors
   */
  async getClassInstructorsController(req: Request, res: Response, next: NextFunction) {
    try {
      const { classLevelId } = req.params;

      const instructors = await classManagementService.getClassInstructors(classLevelId);

      res.status(200).json({
        success: true,
        count: instructors.length,
        data: instructors
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get instructor's classes
   * GET /instructors/:instructorId/classes
   */
  async getInstructorClassesController(req: Request, res: Response, next: NextFunction) {
    try {
      const { instructorId } = req.params;

      const classes = await classManagementService.getInstructorClasses(instructorId);

      res.status(200).json({
        success: true,
        count: classes.length,
        data: classes
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get class summary
   * GET /classes/:classLevelId/summary
   */
  async getClassSummaryController(req: Request, res: Response, next: NextFunction) {
    try {
      const { classLevelId } = req.params;

      const summary = await classManagementService.getClassSummary(classLevelId);

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign instructor to class
   * POST /instructors/:instructorId/classes
   */
  async assignInstructorController(req: Request, res: Response, next: NextFunction) {
    try {
      const { instructorId } = req.params;
      const { classLevelId, subjectId, academicYear } = req.body;

      if (!classLevelId || !subjectId || !academicYear) {
        throw new AppError(
          400,
          ERROR_CODES.VALIDATION_ERROR,
          "classLevelId, subjectId, and academicYear are required"
        );
      }

      const assignment = await classManagementService.assignInstructorToClass(
        instructorId,
        classLevelId,
        subjectId,
        academicYear
      );

      res.status(201).json({
        success: true,
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke instructor assignment
   * DELETE /instructor-assignments/:assignmentId
   */
  async revokeAssignmentController(req: Request, res: Response, next: NextFunction) {
    try {
      const { assignmentId } = req.params;

      const assignment = await classManagementService.revokeInstructorAssignment(assignmentId);

      res.status(200).json({
        success: true,
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enroll student in class
   * POST /students/:studentId/enroll
   */
  async enrollStudentController(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const { classLevelId } = req.body;

      if (!classLevelId) {
        throw new AppError(
          400,
          ERROR_CODES.VALIDATION_ERROR,
          "classLevelId is required"
        );
      }

      const student = await classManagementService.enrollStudentInClass(
        studentId,
        classLevelId
      );

      res.status(200).json({
        success: true,
        data: student
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove student from class
   * DELETE /students/:studentId/class
   */
  async removeStudentController(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;

      const student = await classManagementService.removeStudentFromClass(studentId);

      res.status(200).json({
        success: true,
        data: student
      });
    } catch (error) {
      next(error);
    }
  }
}

export const classManagementController = new ClassManagementController();
