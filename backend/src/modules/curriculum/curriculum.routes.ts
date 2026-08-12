import { Router } from "express";

import {
  createGradeController,
  getGradesController,
  getGradeController,
  updateGradeController,
  deleteGradeController,

  createSubjectController,
  getSubjectsController,
  getSubjectController,
  updateSubjectController,
  deleteSubjectController,

  createUnitController,
  getUnitsController,
  getUnitController,
  updateUnitController,
  deleteUnitController
} from "./curriculum.controller.js";

import {
  authenticate
} from "../../middleware/auth.middleware.js";

import {
  authorize
} from "../../middleware/rbac.middleware.js";

export const curriculumRouter =
  Router();

 // All curriculum endpoints
 // require authentication.
 
curriculumRouter.use(
  authenticate
);

  // GRADES

curriculumRouter.get(
  "/grades",
  getGradesController
);

curriculumRouter.post(
  "/grades",
  authorize("ADMIN"),
  createGradeController
);

curriculumRouter.get(
  "/grades/:id",
  getGradeController
);

curriculumRouter.patch(
  "/grades/:id",
  authorize("ADMIN"),
  updateGradeController
);

curriculumRouter.delete(
  "/grades/:id",
  authorize("ADMIN"),
  deleteGradeController
);

  // SUBJECTS

curriculumRouter.get(
  "/subjects",
  getSubjectsController
);

curriculumRouter.post(
  "/subjects",
  authorize("ADMIN"),
  createSubjectController
);

curriculumRouter.get(
  "/subjects/:id",
  getSubjectController
);

curriculumRouter.patch(
  "/subjects/:id",
  authorize("ADMIN"),
  updateSubjectController
);

curriculumRouter.delete(
  "/subjects/:id",
  authorize("ADMIN"),
  deleteSubjectController
);

  // UNITS

curriculumRouter.get(
  "/units",
  getUnitsController
);

curriculumRouter.post(
  "/units",
  authorize("ADMIN"),
  createUnitController
);

curriculumRouter.get(
  "/units/:id",
  getUnitController
);

curriculumRouter.patch(
  "/units/:id",
  authorize("ADMIN"),
  updateUnitController
);

curriculumRouter.delete(
  "/units/:id",
  authorize("ADMIN"),
  deleteUnitController
);