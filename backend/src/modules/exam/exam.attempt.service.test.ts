import { beforeEach, describe, expect, it, vi } from "vitest";

import { Exam } from "../../models/exam.model.js";
import { ExamAttempt } from "../../models/exam-attempt.model.js";
import { startExamAttempt } from "./exam.attempt.service.js";
import { canStudentTakeExam } from "./exam.access.authorization.js";

vi.mock("../../models/exam.model.js", () => ({
  Exam: {
    findById: vi.fn()
  }
}));

vi.mock("./exam.access.authorization.js", () => ({
  canStudentTakeExam: vi.fn()
}));

vi.mock("../../models/exam-attempt.model.js", () => ({
  ExamAttempt: {
    findOne: vi.fn(),
    create: vi.fn()
  }
}));

describe("exam attempt service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new in-progress attempt when a student is eligible", async () => {
    vi.mocked(canStudentTakeExam).mockResolvedValue(true);

    vi.mocked(Exam.findById).mockResolvedValue({
      _id: "67f0f8e8d2f6d7af25f1f123",
      status: "APPROVED",
      startAt: new Date(Date.now() - 60000),
      endAt: new Date(Date.now() + 60000),
      totalMarks: 30
    } as any);

    vi.mocked(ExamAttempt.findOne).mockResolvedValue(null);
    vi.mocked(ExamAttempt.create).mockResolvedValue({
      _id: "attempt-1",
      examId: "67f0f8e8d2f6d7af25f1f123",
      studentId: "67f0f8e8d2f6d7af25f1f124",
      status: "IN_PROGRESS",
      totalMarks: 30,
      startedAt: new Date()
    } as any);

    const attempt = await startExamAttempt(
      "67f0f8e8d2f6d7af25f1f123",
      "67f0f8e8d2f6d7af25f1f124"
    );

    expect(ExamAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        examId: expect.any(Object),
        studentId: expect.any(Object),
        status: "IN_PROGRESS",
        totalMarks: 30
      })
    );
    expect(attempt.status).toBe("IN_PROGRESS");
  });

  it("returns an existing in-progress attempt without creating a duplicate", async () => {
    vi.mocked(canStudentTakeExam).mockResolvedValue(true);

    vi.mocked(Exam.findById).mockResolvedValue({
      _id: "67f0f8e8d2f6d7af25f1f123",
      status: "APPROVED",
      startAt: new Date(Date.now() - 60000),
      endAt: new Date(Date.now() + 60000),
      totalMarks: 30
    } as any);

    vi.mocked(ExamAttempt.findOne).mockResolvedValue({
      _id: "attempt-1",
      status: "IN_PROGRESS"
    } as any);

    const attempt = await startExamAttempt(
      "67f0f8e8d2f6d7af25f1f123",
      "67f0f8e8d2f6d7af25f1f124"
    );

    expect(ExamAttempt.create).not.toHaveBeenCalled();
    expect(attempt._id).toBe("attempt-1");
  });
});
