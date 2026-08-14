import type { Request, Response } from "express";
import {
  releaseExamToStudents,
  revokeExamFromStudents,
  isExamAvailableForStudent,
  getAvailableExamsForStudent,
  getUpcomingExamsForStudent,
  getPastExamsForStudent
} from "./exam.availability.service.js";
import {
  releaseExamSchema,
  revokeExamSchema
} from "./exam.validation.js";

export async function releaseExamController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const input = req.body;

  const parsed = releaseExamSchema.parse(input);

  const exam = await releaseExamToStudents(examId, req.user!.id, parsed as any);

  res.status(200).json({ success: true, data: { exam } });
}

export async function revokeExamController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const exam = await revokeExamFromStudents(examId, req.user!.id);

  res.status(200).json({ success: true, data: { exam } });
}

export async function checkExamAvailabilityController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const studentId = req.user!.id;

  const available = await isExamAvailableForStudent(examId, studentId);

  res.status(200).json({ success: true, data: { available } });
}

export async function getAvailableExamsController(
  req: Request,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;

  const exams = await getAvailableExamsForStudent(studentId);

  res.status(200).json({ success: true, data: { exams } });
}

export async function getUpcomingExamsController(
  req: Request,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;

  const exams = await getUpcomingExamsForStudent(studentId);

  res.status(200).json({ success: true, data: { exams } });
}

export async function getPastExamsController(
  req: Request,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;

  const exams = await getPastExamsForStudent(studentId);

  res.status(200).json({ success: true, data: { exams } });
}
