import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { publishExamResultsController } from "./exam.results.controller.js";

const router = Router();

router.use(authenticate);

router.post("/:id/publish-results", authorize("INSTRUCTOR"), publishExamResultsController);

export default router;
