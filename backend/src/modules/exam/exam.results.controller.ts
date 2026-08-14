import type { Request, Response } from "express";
import { publishExamResults } from "./exam.results.service.js";

export async function publishExamResultsController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const examId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const instructorId = req.user!.id;

  const exam = await publishExamResults(examId, instructorId);

  res.status(200).json({ success: true, data: { exam } });
}
