import type { Request, Response } from "express";

import { AppError } from "../errors/app-error.js";
import { ERROR_CODES } from "../errors/error.codes.js";

export function notFoundMiddleware(
  req: Request,
  _res: Response
): never {
  throw new AppError(
    404,
    ERROR_CODES.ROUTE_NOT_FOUND,
    `Route ${req.method} ${req.originalUrl} not found`
  );
}