import { Types } from "mongoose";
import { Exam } from "../../models/exam.model.js";
import { ExamAttempt } from "../../models/exam-attempt.model.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

export async function publishExamResults(
  examId: string,
  instructorId: string
) {
  if (!Types.ObjectId.isValid(examId)) {
    throw new AppError(400, ERROR_CODES.INVALID_OPERATION, "Invalid exam ID");
  }

  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, "Exam not found");
  }

  // Only the exam creator can publish results
  if (exam.createdBy.toString() !== instructorId) {
    throw new AppError(403, ERROR_CODES.FORBIDDEN, "You can only publish results for your own exams");
  }

  // Only after exam ended
  const now = new Date();
  if (exam.endAt > now) {
    throw new AppError(400, ERROR_CODES.INVALID_OPERATION, "Cannot publish results before exam end time");
  }

  // Aggregate attempts and set resultsReleased
  await ExamAttempt.updateMany({ examId: new Types.ObjectId(examId) }, { $set: { status: "SUBMITTED" } });

  exam.resultsReleased = true;
  await exam.save();

  return exam;
}
