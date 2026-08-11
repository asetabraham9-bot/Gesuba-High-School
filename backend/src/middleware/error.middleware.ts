import { ErrorRequestHandler } from "express";
import { logger } from "../config/logger.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  _next
) => {
  logger.error(
    {
      error,
      method: req.method,
      url: req.originalUrl
    },
    "Unhandled application error"
  );

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred"
    }
  });
};