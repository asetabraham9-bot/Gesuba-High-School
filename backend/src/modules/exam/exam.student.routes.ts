import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import {
  getExamForStudentController,
  getExamMetadataController,
  getStudentExamsController,
  getExamQuestionsForStudentController,
  getQuestionForStudentController,
  validateExamAttemptController
} from "./exam.student.controller.js";

const router = Router();

router.use(authenticate);

// Student-facing endpoints
router.get("/student/exams", authorize("STUDENT"), getStudentExamsController);
router.get("/student/exams/:id", authorize("STUDENT"), getExamForStudentController);
router.get("/student/exams/:id/meta", authorize("STUDENT"), getExamMetadataController);
router.get("/student/exams/:id/questions", authorize("STUDENT"), getExamQuestionsForStudentController);
router.get("/student/exams/:id/questions/:questionId", authorize("STUDENT"), getQuestionForStudentController);
router.get("/student/exams/:id/can-attempt", authorize("STUDENT"), validateExamAttemptController);

export default router;
