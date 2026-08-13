import type {
  Request,
  Response
} from "express";

import {
  createExamSchema,
  updateExamSchema,
  createQuestionSchema,
  updateQuestionSchema
} from "./exam.validation.js";

import {
  createExam,
  getExamById,
  getInstructorExams,
  updateExam,
  deleteExam,
  addQuestionToExam,
  getExamQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} from "./exam.service.js";

export async function createExamController(
  req: Request,
  res: Response
): Promise<void> {
  const input =
    createExamSchema.parse(req.body);

  const exam = await createExam(
    req.user!.id,
    input
  );

  res.status(201).json({
    success: true,
    data: {
      exam
    }
  });
}

export async function getInstructorExamsController(
  req: Request,
  res: Response
): Promise<void> {
  const exams =
    await getInstructorExams(
      req.user!.id
    );

  res.status(200).json({
    success: true,
    data: {
      exams
    }
  });
}

export async function getExamController(
  req: Request,
  res: Response
): Promise<void> {
  const examId =
    Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

  const exam =
    await getExamById(examId);

  res.status(200).json({
    success: true,
    data: {
      exam
    }
  });
}

export async function updateExamController(
  req: Request,
  res: Response
): Promise<void> {
  const examId =
    Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

  const input =
    updateExamSchema.parse(req.body);

  const exam =
    await updateExam(
      examId,
      req.user!.id,
      input
    );

  res.status(200).json({
    success: true,
    data: {
      exam
    }
  });
}

export async function deleteExamController(
  req: Request,
  res: Response
): Promise<void> {
  const examId =
    Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

  await deleteExam(
    examId,
    req.user!.id
  );

  res.status(200).json({
    success: true,
    data: {
      message:
        "Exam deleted successfully"
    }
  });
}

// QUESTION MANAGEMENT

export async function addQuestionController(
  req: Request<{ examId: string }>,
  res: Response
): Promise<void> {
  const examId =
    Array.isArray(
      req.params.examId
    )
      ? req.params.examId[0]
      : req.params.examId;

  const input =
    createQuestionSchema.parse(
      req.body
    );

  const question =
    await addQuestionToExam(
      examId,
      req.user!.id,
      input
    );

  res.status(201).json({
    success: true,
    data: { question }
  });
}

export async function getExamQuestionsController(
  req: Request<{ examId: string }>,
  res: Response
): Promise<void> {
  const examId =
    Array.isArray(
      req.params.examId
    )
      ? req.params.examId[0]
      : req.params.examId;

  const questions =
    await getExamQuestions(examId);

  res.status(200).json({
    success: true,
    data: { questions }
  });
}

export async function getQuestionController(
  req: Request<{ examId: string; questionId: string }>,
  res: Response
): Promise<void> {
  const questionId =
    Array.isArray(
      req.params.questionId
    )
      ? req.params.questionId[0]
      : req.params.questionId;

  const question =
    await getQuestionById(
      questionId
    );

  res.status(200).json({
    success: true,
    data: { question }
  });
}

export async function updateQuestionController(
  req: Request<{
    examId: string;
    questionId: string;
  }>,
  res: Response
): Promise<void> {
  const examId =
    Array.isArray(
      req.params.examId
    )
      ? req.params.examId[0]
      : req.params.examId;

  const questionId =
    Array.isArray(
      req.params.questionId
    )
      ? req.params.questionId[0]
      : req.params.questionId;

  const input =
    updateQuestionSchema.parse(
      req.body
    );

  const question =
    await updateQuestion(
      questionId,
      examId,
      req.user!.id,
      input
    );

  res.status(200).json({
    success: true,
    data: { question }
  });
}

export async function deleteQuestionController(
  req: Request<{
    examId: string;
    questionId: string;
  }>,
  res: Response
): Promise<void> {
  const examId =
    Array.isArray(
      req.params.examId
    )
      ? req.params.examId[0]
      : req.params.examId;

  const questionId =
    Array.isArray(
      req.params.questionId
    )
      ? req.params.questionId[0]
      : req.params.questionId;

  await deleteQuestion(
    questionId,
    examId,
    req.user!.id
  );

  res.status(200).json({
    success: true,
    data: {
      message:
        "Question deleted successfully"
    }
  });
}