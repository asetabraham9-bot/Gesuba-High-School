import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),

  MONGODB_URI: z
    .string()
    .min(1, "mongodb://schoolAdmin:@1s19E50@ac-pgcddmz-shard-00-00.dvnvf8s.mongodb.net:27017,ac-pgcddmz-shard-00-01.dvnvf8s.mongodb.net:27017,ac-pgcddmz-shard-00-02.dvnvf8s.mongodb.net:27017/?ssl=true&replicaSet=atlas-v8xiku-shard-0&authSource=admin&appName=SchoolMSCluster"),

  CORS_ORIGIN: z
    .string()
    .min(1, "http://localhost:5173"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:");

  console.error(
    parsedEnv.error.flatten().fieldErrors
  );

  process.exit(1);
}

export const env = parsedEnv.data;