import { Router } from "express";
import { analyticsController } from "./analytics.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * GET /analytics/student/:studentId
 * Get student performance report
 * Authorization: Student (own), Instructor, Admin
 */
router.get(
  "/student/:studentId",
  authorize("STUDENT", "INSTRUCTOR", "ADMIN"),
  (req, res, next) => analyticsController.getStudentPerformanceController(req, res, next)
);

/**
 * GET /analytics/class/:classLevelId
 * Get class performance statistics
 * Authorization: Instructor, Admin
 */
router.get(
  "/class/:classLevelId",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => analyticsController.getClassPerformanceController(req, res, next)
);

/**
 * GET /analytics/subject/:subjectId
 * Get subject performance analysis
 * Authorization: Instructor, Admin
 */
router.get(
  "/subject/:subjectId",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => analyticsController.getSubjectPerformanceController(req, res, next)
);

/**
 * GET /analytics/at-risk/:classLevelId
 * Get at-risk students for a class
 * Authorization: Instructor, Admin
 */
router.get(
  "/at-risk/:classLevelId",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => analyticsController.getAtRiskStudentsController(req, res, next)
);

export const analyticsRoutes = router;
