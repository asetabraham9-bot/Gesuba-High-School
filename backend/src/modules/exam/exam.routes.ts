import { Router } from "express";

import {
  authenticate
} from "../../middleware/auth.middleware.js";

import {
  authorize
} from "../../middleware/rbac.middleware.js";

import {
  createExamController,
  getInstructorExamsController,
  getExamController,
  updateExamController,
  deleteExamController,
  addQuestionController,
  getExamQuestionsController,
  getQuestionController,
  updateQuestionController,
  deleteQuestionController,
  publishExamController,
  approveExamController,
  rejectExamController,
  getExamsForApprovalController
} from "./exam.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("INSTRUCTOR"),
  createExamController
);

router.get(
  "/",
  authorize("INSTRUCTOR"),
  getInstructorExamsController
);

router.get(
  "/:id",
  authorize("INSTRUCTOR"),
  getExamController
);

router.patch(
  "/:id",
  authorize("INSTRUCTOR"),
  updateExamController
);

router.delete(
  "/:id",
  authorize("INSTRUCTOR"),
  deleteExamController
);

// QUESTION ROUTES

router.post(
  "/:examId/questions",
  authorize("INSTRUCTOR"),
  addQuestionController
);

router.get(
  "/:examId/questions",
  getExamQuestionsController
);

router.get(
  "/:examId/questions/:questionId",
  getQuestionController
);

router.patch(
  "/:examId/questions/:questionId",
  authorize("INSTRUCTOR"),
  updateQuestionController
);

router.delete(
  "/:examId/questions/:questionId",
  authorize("INSTRUCTOR"),
  deleteQuestionController
);

// EXAM WORKFLOW ROUTES

router.post(
  "/:id/publish",
  authorize("INSTRUCTOR"),
  publishExamController
);

router.get(
  "/approval-queue",
  authorize("ADMIN"),
  getExamsForApprovalController
);

router.post(
  "/:id/approve",
  authorize("ADMIN"),
  approveExamController
);

router.post(
  "/:id/reject",
  authorize("ADMIN"),
  rejectExamController
);

export default router;