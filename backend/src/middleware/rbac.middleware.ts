import type {
  NextFunction,
  Request,
  Response
} from "express";

import { AppError } from "../errors/app-error.js";
import { ERROR_CODES } from "../errors/error.codes.js";
import type { UserRole } from "../models/user.model.js";

export function authorize(
  ...allowedRoles: UserRole[]
) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      next(
        new AppError(
          401,
          ERROR_CODES.UNAUTHORIZED,
          "Authentication is required"
        )
      );

      return;
    }

    if (
      !allowedRoles.includes(req.user.role)
    ) {
      next(
        new AppError(
          403,
          ERROR_CODES.FORBIDDEN,
          "You do not have permission to access this resource"
        )
      );

      return;
    }

    next();
  };
}