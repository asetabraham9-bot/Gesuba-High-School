import { Router } from "express";

import {
  loginController,
  refreshController,
  logoutController,
  getCurrentUserController,
  adminTestController,
  instructorTestController
} from "./auth.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  loginController
);

authRouter.post(
  "/refresh",
  refreshController
);

authRouter.post(
  "/logout",
  logoutController
);

authRouter.get(
  "/me",
  authenticate,
  getCurrentUserController
);

authRouter.get(
  "/admin/test",
  authenticate,
  authorize("ADMIN"),
  adminTestController
);

authRouter.get(
  "/instructor/test",
  authenticate,
  authorize("INSTRUCTOR", "ADMIN"),
  instructorTestController
);