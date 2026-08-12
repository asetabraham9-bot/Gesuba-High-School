import { Router } from "express";

import {
  registerController,
  loginController,
  getCurrentUserController,
  adminTestController,
  instructorTestController
} from "./auth.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  registerController
);

authRouter.post(
  "/login",
  loginController
);

authRouter.get(
  "/me",
  authenticate,
  getCurrentUserController
);

authRouter.get(
  "/rbac/admin-test",
  authenticate,
  authorize("ADMIN"),
  adminTestController
);

authRouter.get(
  "/rbac/instructor-test",
  authenticate,
  authorize(
    "INSTRUCTOR",
    "ADMIN"
  ),
  instructorTestController
);