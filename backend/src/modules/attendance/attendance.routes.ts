import { Router } from "express";
import { attendanceController } from "./attendance.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

const router = Router();

// All attendance routes require authentication
router.use(authenticate);

/**
 * POST /attendance/mark
 * Mark attendance for a single student
 * Authorization: INSTRUCTOR, ADMIN
 */
router.post(
  "/mark",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => attendanceController.markAttendanceController(req, res, next)
);

/**
 * GET /attendance/student/:studentId
 * Get attendance records for a student
 * Authorization: STUDENT (own), INSTRUCTOR, ADMIN
 */
router.get(
  "/student/:studentId",
  authorize("STUDENT", "INSTRUCTOR", "ADMIN"),
  (req, res, next) => attendanceController.getStudentAttendanceController(req, res, next)
);

/**
 * GET /attendance/student/:studentId/stats
 * Get attendance statistics for a student
 * Authorization: STUDENT (own), INSTRUCTOR, ADMIN
 */
router.get(
  "/student/:studentId/stats",
  authorize("STUDENT", "INSTRUCTOR", "ADMIN"),
  (req, res, next) => attendanceController.getStudentAttendanceStatsController(req, res, next)
);

/**
 * GET /attendance/class/:classLevelId
 * Get attendance for a class on a specific date
 * Authorization: INSTRUCTOR, ADMIN
 */
router.get(
  "/class/:classLevelId",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => attendanceController.getClassAttendanceController(req, res, next)
);

/**
 * GET /attendance/instructor/day
 * Get instructor's day attendance summary
 * Authorization: INSTRUCTOR, ADMIN
 */
router.get(
  "/instructor/day",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => attendanceController.getInstructorDayAttendanceController(req, res, next)
);

/**
 * GET /attendance/sheet
 * Get attendance sheet template for marking
 * Authorization: INSTRUCTOR, ADMIN
 */
router.get(
  "/sheet",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => attendanceController.getAttendanceSheetController(req, res, next)
);

/**
 * POST /attendance/bulk
 * Bulk mark attendance for a class
 * Authorization: INSTRUCTOR, ADMIN
 */
router.post(
  "/bulk",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => attendanceController.bulkMarkAttendanceController(req, res, next)
);

/**
 * GET /attendance/report
 * Get attendance report for a class
 * Authorization: INSTRUCTOR, ADMIN
 */
router.get(
  "/report",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => attendanceController.getClassAttendanceReportController(req, res, next)
);

export const attendanceRoutes = router;
