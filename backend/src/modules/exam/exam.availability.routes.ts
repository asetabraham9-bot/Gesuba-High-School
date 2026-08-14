import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import {
  releaseExamController,
  revokeExamController,
  checkExamAvailabilityController,
  getAvailableExamsController,
  getUpcomingExamsController,
  getPastExamsController
} from "./exam.availability.controller.js";

const router = Router();

router.use(authenticate);

// Admin release/revoke
router.post("/:id/release", authorize("ADMIN"), releaseExamController);
router.post("/:id/revoke", authorize("ADMIN"), revokeExamController);

// Student checks
router.get("/:id/available", authorize("STUDENT"), checkExamAvailabilityController);

// Student lists
router.get("/student/available", authorize("STUDENT"), getAvailableExamsController);
router.get("/student/upcoming", authorize("STUDENT"), getUpcomingExamsController);
router.get("/student/past", authorize("STUDENT"), getPastExamsController);

export default router;
