import type {
  Request,
  Response
} from "express";

import {
  createGradeSchema,
  updateGradeSchema,
  createSubjectSchema,
  updateSubjectSchema,
  createUnitSchema,
  updateUnitSchema
} from "./curriculum.validation.js";

import {
  createGrade,
  getGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  deleteUnit
} from "./curriculum.service.js";


  // GRADES


export async function createGradeController(
  req: Request,
  res: Response
): Promise<void> {
  const input =
    createGradeSchema.parse(req.body);

  const grade =
    await createGrade(input);

  res.status(201).json({
    success: true,
    data: { grade }
  });
}

export async function getGradesController(
  _req: Request,
  res: Response
): Promise<void> {
  const grades =
    await getGrades();

  res.status(200).json({
    success: true,
    data: { grades }
  });
}

export async function getGradeController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const grade =
    await getGradeById(
      req.params.id
    );

  res.status(200).json({
    success: true,
    data: { grade }
  });
}

export async function updateGradeController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const input =
    updateGradeSchema.parse(
      req.body
    );

  const grade =
    await updateGrade(
      req.params.id,
      input
    );

  res.status(200).json({
    success: true,
    data: { grade }
  });
}

export async function deleteGradeController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  await deleteGrade(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: {
      message:
        "Grade deleted successfully"
    }
  });
}

  // SUBJECTS

export async function createSubjectController(
  req: Request,
  res: Response
): Promise<void> {
  const input =
    createSubjectSchema.parse(
      req.body
    );

  const subject =
    await createSubject(input);

  res.status(201).json({
    success: true,
    data: { subject }
  });
}

export async function getSubjectsController(
  req: Request,
  res: Response
): Promise<void> {
  const subjects =
    await getSubjects(
      req.query.gradeId as
        | string
        | undefined
    );

  res.status(200).json({
    success: true,
    data: { subjects }
  });
}

export async function getSubjectController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const subject =
    await getSubjectById(
      req.params.id
    );

  res.status(200).json({
    success: true,
    data: { subject }
  });
}

export async function updateSubjectController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const input =
    updateSubjectSchema.parse(
      req.body
    );

  const subject =
    await updateSubject(
      req.params.id,
      input
    );

  res.status(200).json({
    success: true,
    data: { subject }
  });
}

export async function deleteSubjectController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  await deleteSubject(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: {
      message:
        "Subject deleted successfully"
    }
  });
}

/* =========================
   UNITS
========================= */

export async function createUnitController(
  req: Request,
  res: Response
): Promise<void> {
  const input =
    createUnitSchema.parse(
      req.body
    );

  const unit =
    await createUnit(input);

  res.status(201).json({
    success: true,
    data: { unit }
  });
}

export async function getUnitsController(
  req: Request,
  res: Response
): Promise<void> {
  const units =
    await getUnits(
      req.query.subjectId as
        | string
        | undefined
    );

  res.status(200).json({
    success: true,
    data: { units }
  });
}

export async function getUnitController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const unit =
    await getUnitById(
      req.params.id
    );

  res.status(200).json({
    success: true,
    data: { unit }
  });
}

export async function updateUnitController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const input =
    updateUnitSchema.parse(
      req.body
    );

  const unit =
    await updateUnit(
      req.params.id,
      input
    );

  res.status(200).json({
    success: true,
    data: { unit }
  });
}

export async function deleteUnitController(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  await deleteUnit(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: {
      message:
        "Unit deleted successfully"
    }
  });
}