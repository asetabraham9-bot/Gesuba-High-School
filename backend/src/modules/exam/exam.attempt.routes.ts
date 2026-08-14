import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

import {
  startExamAttemptController,
  getExamAttemptController,
  saveExamAttemptController,
  submitExamAttemptController
} from "./exam.attempt.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/:id/attempts/start",
  authorize("STUDENT"),
  startExamAttemptController
);

router.get(
  "/:id/attempts",
  authorize("STUDENT"),
  getExamAttemptController
);

router.patch(
  "/:id/attempts",
  authorize("STUDENT"),
  saveExamAttemptController
);

router.post(
  "/:id/attempts/submit",
  authorize("STUDENT"),
  submitExamAttemptController
);

export default router;
