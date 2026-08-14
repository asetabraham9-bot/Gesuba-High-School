import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import {
  updateExamScheduleController,
  lockExamScheduleController,
  getExamScheduleController
} from "./exam.scheduling.controller.js";

const router = Router();

router.use(authenticate);

router.patch(
  "/:id/schedule",
  authorize("INSTRUCTOR"),
  updateExamScheduleController
);

router.post(
  "/:id/lock",
  authorize("ADMIN"),
  lockExamScheduleController
);

router.get(
  "/:id/schedule",
  authorize("INSTRUCTOR"),
  getExamScheduleController
);

export default router;
