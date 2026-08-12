import { Router } from "express";

import {
  createStudentController,
  createInstructorController,
  createAdminController,
  getUsersController,
  getUserController,
  updateRoleController,
  updateStatusController,
  deleteUserController
} from "./user.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

export const userRouter =
  Router();

userRouter.use(
  authenticate,
  authorize("ADMIN")
);

userRouter.post(
  "/students",
  createStudentController
);

userRouter.post(
  "/instructors",
  createInstructorController
);

userRouter.post(
  "/admins",
  createAdminController
);

userRouter.get(
  "/",
  getUsersController
);

userRouter.get(
  "/:id",
  getUserController
);

userRouter.patch(
  "/:id/role",
  updateRoleController
);

userRouter.patch(
  "/:id/status",
  updateStatusController
);

userRouter.delete(
  "/:id",
  deleteUserController
);