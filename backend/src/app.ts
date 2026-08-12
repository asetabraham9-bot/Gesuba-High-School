import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import * as pinoHttp from "pino-http";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { curriculumRouter } from "./modules/curriculum/curriculum.routes.js";
import { studyMaterialRouter } from "./modules/study-material/studymaterial.routes.js";

import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

export const app = express();

app.disable("x-powered-by");

app.use( helmet());

app.use( cors({ origin: env.CORS_ORIGIN, credentials: true}));

app.use( express.json({ limit: "1mb" }));

app.use( express.urlencoded({ extended: true, limit: "1mb"} ));

app.use(cookieParser());

const pinoHttpMiddleware = (pinoHttp as any).default ?? pinoHttp;

app.use( pinoHttpMiddleware({ logger }) );

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "School Management System API"
  });
});

// Applications routes
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/curriculum", curriculumRouter);
app.use("/api/v1/study-material", studyMaterialRouter);
// 404 handler
app.use(notFoundMiddleware);

// Global error handler
app.use(errorMiddleware);
