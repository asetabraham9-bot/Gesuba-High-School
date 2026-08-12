import { Router } from "express";

import {
  loginController,
  refreshController,
  logoutController,
  getCurrentUserController
} from "./auth.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";

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