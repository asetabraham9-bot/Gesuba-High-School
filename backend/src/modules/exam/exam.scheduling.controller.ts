import type { Request, Response } from "express";
import {
  updateExamSchedule,
  lockExamSchedule,
  getExamSchedule
} from "./exam.scheduling.service.js";
import {
  scheduleExamSchema
} from "./exam.validation.js";

export async function updateExamScheduleController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const input = scheduleExamSchema.parse(req.body);

  const exam = await updateExamSchedule(examId, req.user!.id, input as any);

  res.status(200).json({ success: true, data: { exam } });
}

export async function lockExamScheduleController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const exam = await lockExamSchedule(examId, req.user!.id);

  res.status(200).json({ success: true, data: { exam } });
}

export async function getExamScheduleController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const schedule = await getExamSchedule(examId);

  res.status(200).json({ success: true, data: { schedule } });
}
