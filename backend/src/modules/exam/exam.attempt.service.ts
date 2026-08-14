import { Types } from "mongoose";

import { Exam } from "../../models/exam.model.js";
import { ExamAttempt } from "../../models/exam-attempt.model.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";
import { canStudentTakeExam } from "./exam.access.authorization.js";

export interface AttemptAnswerInput {
  questionId: string;
  answer?: string;
}

export async function startExamAttempt(
  examId: string,
  studentId: string
) {
  if (
    !Types.ObjectId.isValid(examId) ||
    !Types.ObjectId.isValid(studentId)
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid exam or student ID"
    );
  }

  const exam = await Exam.findById(examId);

  if (!exam) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam not found"
    );
  }

  const canTake = await canStudentTakeExam(examId, studentId);
  if (!canTake) {
    throw new AppError(
      403,
      ERROR_CODES.FORBIDDEN,
      "You cannot take this exam at this time"
    );
  }

  const existingAttempt = await ExamAttempt.findOne({
    examId: new Types.ObjectId(examId),
    studentId: new Types.ObjectId(studentId)
  });

  if (existingAttempt) {
    if (
      existingAttempt.status === "IN_PROGRESS"
    ) {
      return existingAttempt;
    }

    throw new AppError(
      409,
      ERROR_CODES.INVALID_OPERATION,
      "You have already submitted this exam"
    );
  }

  const attempt = await ExamAttempt.create({
    examId: new Types.ObjectId(examId),
    studentId: new Types.ObjectId(studentId),
    status: "IN_PROGRESS",
    totalMarks: exam.totalMarks ?? 0,
    startedAt: new Date()
  });

  return attempt;
}

export async function getExamAttempt(
  examId: string,
  studentId: string
) {
  if (
    !Types.ObjectId.isValid(examId) ||
    !Types.ObjectId.isValid(studentId)
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid exam or student ID"
    );
  }

  const attempt = await ExamAttempt.findOne({
    examId: new Types.ObjectId(examId),
    studentId: new Types.ObjectId(studentId)
  });

  if (!attempt) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam attempt not found"
    );
  }

  return attempt;
}

export async function saveExamAttempt(
  examId: string,
  studentId: string,
  answers: AttemptAnswerInput[]
) {
  if (
    !Types.ObjectId.isValid(examId) ||
    !Types.ObjectId.isValid(studentId)
  ) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid exam or student ID"
    );
  }

  const attempt = await ExamAttempt.findOne({
    examId: new Types.ObjectId(examId),
    studentId: new Types.ObjectId(studentId)
  });

  if (!attempt) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Exam attempt not found"
    );
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "This exam attempt is no longer active"
    );
  }

  const savedAnswers = [...(attempt.answers ?? [])];
  const answerMap = new Map<string, any>(
    savedAnswers.map((item) => [item.questionId.toString(), item])
  );

  for (const answer of answers) {
    if (!Types.ObjectId.isValid(answer.questionId)) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Invalid question ID in answer payload"
      );
    }

    answerMap.set(answer.questionId, {
      questionId: new Types.ObjectId(answer.questionId),
      answer: answer.answer ?? ""
    } as any);
  }

  attempt.answers = Array.from(answerMap.values()) as any;
  await attempt.save();

  return attempt;
}

export async function submitExamAttempt(
  examId: string,
  studentId: string,
  answers: AttemptAnswerInput[] = []
) {
  const attempt = await saveExamAttempt(
    examId,
    studentId,
    answers
  );

    // Mark submitted
    attempt.status = "SUBMITTED";
    attempt.submittedAt = new Date();

    // Auto-grade objective question types (MCQ, TRUE_FALSE)
    const questions = await Question.find({ examId });
    const qmap = new Map<string, any>();
    for (const q of questions) {
      qmap.set(q._id.toString(), q);
    }

    let score = 0;
    const totalMarks = attempt.totalMarks ?? 0;

    for (const a of attempt.answers ?? []) {
      const q = qmap.get(a.questionId.toString());
      if (!q) continue;

      if (q.type === "MCQ" || q.type === "TRUE_FALSE") {
        const studentAnswer = (a.answer ?? "").toString().trim().toLowerCase();
        const correct = (q.correctAnswer ?? "").toString().trim().toLowerCase();
        if (studentAnswer === correct) {
          score += q.marks ?? 0;
        }
      }
      // SHORT_ANSWER requires manual grading; skip auto-scoring
    }

    attempt.score = score;
    attempt.totalMarks = totalMarks;

    await attempt.save();

    return attempt;
}
