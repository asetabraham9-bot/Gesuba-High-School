import type {
  ErrorRequestHandler
} from "express";

import mongoose from "mongoose";
import { ZodError } from "zod";

import { logger } from "../config/logger.js";
import { AppError } from "../errors/app-error.js";
import { ERROR_CODES } from "../errors/error.codes.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  _next
) => {
  /*
   * 1. Application errors
   */
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error(
        {
          error,
          method: req.method,
          url: req.originalUrl
        },
        error.message
      );
    }

    const response: {
      success: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
    } = {
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    };

    if (error.details !== undefined) {
      response.error.details = error.details;
    }

    res.status(error.statusCode).json(response);
    return;
  }

  /*
   * 2. Zod validation errors
   */
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Request validation failed",
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      }
    });

    return;
  }

  /*
   * 3. MongoDB duplicate-key errors
   */
  if (
    error instanceof mongoose.Error &&
    error.name === "MongoServerError" &&
    "code" in error &&
    error.code === 11000
  ) {
    res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_RESOURCE",
        message: "A resource with the same unique value already exists"
      }
    });

    return;
  }

  /*
   * 4. Mongoose validation errors
   */
  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Database validation failed",
        details: Object.values(error.errors).map(
          (validationError) => ({
            field: validationError.path,
            message: validationError.message
          })
        )
      }
    });

    return;
  }

  /*
   * 5. Unexpected errors
   *
   * Never expose internal error details to clients.
   */
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
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred"
    }
  });
};