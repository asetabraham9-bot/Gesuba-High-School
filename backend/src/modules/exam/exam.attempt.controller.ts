import type { Request, Response } from "express";

import {
  startExamAttempt,
  getExamAttempt,
  saveExamAttempt,
  submitExamAttempt
} from "./exam.attempt.service.js";

import { saveAttemptAnswersSchema, submitAttemptSchema } from "./exam.validation.js";

export async function startExamAttemptController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const studentId = req.user!.id;

  const attempt = await startExamAttempt(examId, studentId);

  res.status(201).json({
    success: true,
    data: { attempt }
  });
}

export async function getExamAttemptController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const studentId = req.user!.id;

  const attempt = await getExamAttempt(examId, studentId);

  res.status(200).json({
    success: true,
    data: { attempt }
  });
}

export async function saveExamAttemptController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const studentId = req.user!.id;
  const input = saveAttemptAnswersSchema.parse(req.body);

  const attempt = await saveExamAttempt(examId, studentId, input.answers);

  res.status(200).json({
    success: true,
    data: { attempt }
  });
}

export async function submitExamAttemptController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const studentId = req.user!.id;
  const input = submitAttemptSchema.parse(req.body ?? {});

  const attempt = await submitExamAttempt(examId, studentId, input.answers ?? []);

  res.status(200).json({
    success: true,
    data: { attempt }
  });
}
