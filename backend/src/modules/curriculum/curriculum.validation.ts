import { z } from "zod";

export const createGradeSchema =
  z.object({
    name: z.string().min(1).max(100),
    number: z.number().int().min(1).max(12),
    description: z.string().max(500).optional()
  });

export const updateGradeSchema =
  createGradeSchema.partial();

export const createSubjectSchema =
  z.object({
    name: z.string().min(1).max(100),
    code: z.string().min(1).max(30),
    gradeId: z.string().min(1),
    description: z.string().max(500).optional()
  });

export const updateSubjectSchema =
  createSubjectSchema.partial();

export const createUnitSchema =
  z.object({
    subjectId: z.string().min(1),
    title: z.string().min(1).max(200),
    unitNumber: z.number().int().min(1),
    description: z.string().max(1000).optional()
  });

export const updateUnitSchema =
  createUnitSchema.partial();