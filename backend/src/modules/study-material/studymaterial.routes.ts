import { Router } from "express";

import {
  authenticate
} from "../../middleware/auth.middleware.js";

import {
  authorize
} from "../../middleware/rbac.middleware.js";

import {
  createStudyMaterialController,
  getStudyMaterialsController,
  getStudyMaterialController,
  updateStudyMaterialController,
  deleteStudyMaterialController,
  publishStudyMaterialController,
  archiveStudyMaterialController
} from "./studymaterial.controller.js";

export const studyMaterialRouter =
  Router();

studyMaterialRouter.use(
  authenticate
);

/*
 * READ
 */

studyMaterialRouter.get(
  "/",
  getStudyMaterialsController
);

studyMaterialRouter.get(
  "/:id",
  getStudyMaterialController
);

/*
 * ADMIN WRITE
 */

studyMaterialRouter.post(
  "/",
  authorize("ADMIN"),
  createStudyMaterialController
);

studyMaterialRouter.patch(
  "/:id",
  authorize("ADMIN"),
  updateStudyMaterialController
);

studyMaterialRouter.delete(
  "/:id",
  authorize("ADMIN"),
  deleteStudyMaterialController
);

studyMaterialRouter.post(
  "/:id/publish",
  authorize("ADMIN"),
  publishStudyMaterialController
);

studyMaterialRouter.post(
  "/:id/archive",
  authorize("ADMIN"),
  archiveStudyMaterialController
);