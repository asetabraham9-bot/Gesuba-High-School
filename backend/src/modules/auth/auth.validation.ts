import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128);

export function normalizeLoginIdentifier(
  identifier: string
): string {
  const trimmed = identifier.toLowerCase().trim();

  if (trimmed.includes("@")) {
    return trimmed;
  }

  return `${trimmed}@student.gesuba.edu.et`;
}

export const loginSchema = z
  .object({
    email: z.string().min(1).max(256).optional(),
    username: z.string().min(1).max(256).optional(),
    password: z.string().min(1).max(128)
  })
  .transform((data) => {
    const identifier = (data.email ?? data.username ?? "").trim();

    if (!identifier) {
      throw new z.ZodError([
        {
          code: "custom",
          path: ["username"],
          message: "Email or username is required"
        }
      ]);
    }

    return {
      email: normalizeLoginIdentifier(identifier),
      password: data.password
    };
  });

export const registerSchema = z.object({
  fullName: z.string().min(2).max(100).trim(),
  studentId: z
    .string()
    .min(3)
    .max(50)
    .trim()
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Student ID may only contain letters, numbers, underscores, and hyphens"
    ),
  password: passwordSchema,
  gradeLevel: z.coerce.number().int().min(9).max(12)
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
