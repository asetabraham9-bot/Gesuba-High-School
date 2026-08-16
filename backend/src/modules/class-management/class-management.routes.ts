import { Router } from "express";
import { classManagementController } from "./class-management.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

const router = Router();

// All class management routes require authentication
router.use(authenticate);

/**
 * GET /classes/:classLevelId/roster
 * Get class roster
 * Authorization: Instructor, Admin
 */
router.get(
  "/:classLevelId/roster",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => classManagementController.getClassRosterController(req, res, next)
);

/**
 * GET /classes/:classLevelId/instructors
 * Get instructors for a class
 * Authorization: Instructor, Admin
 */
router.get(
  "/:classLevelId/instructors",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => classManagementController.getClassInstructorsController(req, res, next)
);

/**
 * GET /classes/:classLevelId/summary
 * Get class summary
 * Authorization: Instructor, Admin
 */
router.get(
  "/:classLevelId/summary",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => classManagementController.getClassSummaryController(req, res, next)
);

/**
 * GET /instructors/:instructorId/classes
 * Get instructor's classes
 * Authorization: Instructor (own), Admin
 */
router.get(
  "/instructor/:instructorId/classes",
  authorize("INSTRUCTOR", "ADMIN"),
  (req, res, next) => classManagementController.getInstructorClassesController(req, res, next)
);

/**
 * POST /instructors/:instructorId/classes
 * Assign instructor to class
 * Authorization: Admin
 */
router.post(
  "/instructor/:instructorId/classes",
  authorize("ADMIN"),
  (req, res, next) => classManagementController.assignInstructorController(req, res, next)
);

/**
 * DELETE /instructor-assignments/:assignmentId
 * Revoke instructor assignment
 * Authorization: Admin
 */
router.delete(
  "/assignment/:assignmentId",
  authorize("ADMIN"),
  (req, res, next) => classManagementController.revokeAssignmentController(req, res, next)
);

/**
 * POST /students/:studentId/enroll
 * Enroll student in class
 * Authorization: Admin
 */
router.post(
  "/student/:studentId/enroll",
  authorize("ADMIN"),
  (req, res, next) => classManagementController.enrollStudentController(req, res, next)
);

/**
 * DELETE /students/:studentId/class
 * Remove student from class
 * Authorization: Admin
 */
router.delete(
  "/student/:studentId/class",
  authorize("ADMIN"),
  (req, res, next) => classManagementController.removeStudentController(req, res, next)
);

export const classManagementRoutes = router;
