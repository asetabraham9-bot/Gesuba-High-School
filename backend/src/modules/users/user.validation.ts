import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters");

export const createStudentSchema =
  z.object({
    email: z.string().email(),
    password: passwordSchema
  });

export const createInstructorSchema =
  z.object({
    email: z.string().email(),
    password: passwordSchema
  });

export const createAdminSchema =
  z.object({
    email: z.string().email(),
    password: passwordSchema
  });

export const updateRoleSchema =
  z.object({
    role: z.enum([
      "STUDENT",
      "INSTRUCTOR",
      "ADMIN"
    ])
  });

export const updateStatusSchema =
  z.object({
    status: z.enum([
      "ACTIVE",
      "INACTIVE"
    ])
  });