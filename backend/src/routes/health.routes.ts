import { Router } from "express";
import mongoose from "mongoose";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  const databaseState =
    mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected";

  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      database: databaseState,
      timestamp: new Date().toISOString()
    }
  });
});