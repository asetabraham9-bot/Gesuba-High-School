import { Router } from "express";

import {
  createGradeController,
  getGradesController,
  getGradeController,
  updateGradeController,
  deleteGradeController,

  createClassLevelController,
  getClassLevelsController,
  getClassLevelController,
  updateClassLevelController,
  deleteClassLevelController,

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

  // CLASS LEVELS

curriculumRouter.get(
  "/class-levels",
  getClassLevelsController
);

curriculumRouter.post(
  "/class-levels",
  authorize("ADMIN"),
  createClassLevelController
);

curriculumRouter.get(
  "/class-levels/:id",
  getClassLevelController
);

curriculumRouter.patch(
  "/class-levels/:id",
  authorize("ADMIN"),
  updateClassLevelController
);

curriculumRouter.delete(
  "/class-levels/:id",
  authorize("ADMIN"),
  deleteClassLevelController
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