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

//   READ

studyMaterialRouter.get(
  "/",
  getStudyMaterialsController
);

studyMaterialRouter.get(
  "/:id",
  getStudyMaterialController
);


//   CREATE


studyMaterialRouter.post(
  "/",
  authorize(
    "ADMIN",
    "INSTRUCTOR"
  ),
  createStudyMaterialController
);

//   UPDATE


studyMaterialRouter.patch(
  "/:id",
  authorize(
    "ADMIN",
    "INSTRUCTOR"
  ),
  updateStudyMaterialController
);

//   DELETE


studyMaterialRouter.delete(
  "/:id",
  authorize(
    "ADMIN",
    "INSTRUCTOR"
  ),
  deleteStudyMaterialController
);

  // PUBLISH

studyMaterialRouter.post(
  "/:id/publish",
  authorize(
    "ADMIN",
    "INSTRUCTOR"
  ),
  publishStudyMaterialController
);

//ARCHIEVE
studyMaterialRouter.post(
  "/:id/archive",
  authorize(
    "ADMIN",
    "INSTRUCTOR"
  ),
  archiveStudyMaterialController
);