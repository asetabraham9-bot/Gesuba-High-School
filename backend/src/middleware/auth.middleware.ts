import type {
  NextFunction,
  Request,
  Response
} from "express";

import { AppError } from "../errors/app-error.js";
import { ERROR_CODES } from "../errors/error.codes.js";
import { verifyAccessToken } from "../modules/auth/token.service.js";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authorization =
    req.headers.authorization;

  if (!authorization) {
    next(
      new AppError(
        401,
        ERROR_CODES.UNAUTHORIZED,
        "Authentication is required"
      )
    );

    return;
  }

  const [scheme, token] =
    authorization.split(" ");

  if (
    scheme !== "Bearer" ||
    !token
  ) {
    next(
      new AppError(
        401,
        ERROR_CODES.INVALID_ACCESS_TOKEN,
        "Invalid access token"
      )
    );

    return;
  }

  try {
    const payload =
      verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role
    };

    next();
  } catch {
    next(
      new AppError(
        401,
        ERROR_CODES.INVALID_ACCESS_TOKEN,
        "Invalid or expired access token"
      )
    );
  }
}