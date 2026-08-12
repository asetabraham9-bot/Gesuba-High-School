import { z } from "zod";

export const createStudyMaterialSchema =
  z.object({
    title: z
      .string()
      .min(1)
      .max(200),

    description: z
      .string()
      .max(1000)
      .optional(),

    type: z.enum([
      "NOTE",
      "PDF",
      "VIDEO",
      "EXERCISE",
      "REFERENCE"
    ]),

    unitId: z
      .string()
      .min(1),

    content: z
      .string()
      .optional(),

    fileUrl: z
      .string()
      .url()
      .optional()
  });

export const updateStudyMaterialSchema =
  createStudyMaterialSchema
    .partial();