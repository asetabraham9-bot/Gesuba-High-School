import http from "node:http";

import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        environment: env.NODE_ENV
      },
      "School Management System API started"
    );
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, "Shutdown signal received");

    server.close(async () => {
      await disconnectDatabase();

      logger.info("Server shutdown completed");

      process.exit(0);
    });
  };

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
}

bootstrap().catch((error) => {
  logger.fatal({ error }, "Failed to start application");
  process.exit(1);
});