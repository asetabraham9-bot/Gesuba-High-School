import type { Request, Response } from "express";
import {
  getExamForStudent,
  getExamMetadata,
  getStudentExams,
  getExamQuestionsForStudent,
  getQuestionForStudent,
  validateExamAttemptability
} from "./exam.student.service.js";

export async function getExamForStudentController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const studentId = req.user!.id;

  const data = await getExamForStudent(examId, studentId);

  res.status(200).json({ success: true, data });
}

export async function getExamMetadataController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const studentId = req.user!.id;

  const metadata = await getExamMetadata(examId, studentId);

  res.status(200).json({ success: true, data: { metadata } });
}

export async function getStudentExamsController(
  req: Request,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;
  const filter = req.query.filter as any;

  const exams = await getStudentExams(studentId, filter);

  res.status(200).json({ success: true, data: { exams } });
}

export async function getExamQuestionsForStudentController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const studentId = req.user!.id;

  const questions = await getExamQuestionsForStudent(examId, studentId);

  res.status(200).json({ success: true, data: { questions } });
}

export async function getQuestionForStudentController(
  req: Request<{ id: string; questionId: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const questionId = Array.isArray(req.params.questionId) ? req.params.questionId[0] : req.params.questionId;
  const studentId = req.user!.id;

  const question = await getQuestionForStudent(examId, questionId, studentId);

  res.status(200).json({ success: true, data: { question } });
}

export async function validateExamAttemptController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const studentId = req.user!.id;

  await validateExamAttemptability(examId, studentId);

  res.status(200).json({ success: true, data: { canAttempt: true } });
}
