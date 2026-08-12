import { Router } from "express";

import {
  registerController,
  loginController,
  getCurrentUserController
} from "./auth.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";

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