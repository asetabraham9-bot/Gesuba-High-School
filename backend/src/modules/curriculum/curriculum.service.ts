import { Grade } from "../../models/grade.model.js";
import { ClassLevel } from "../../models/class-level.model.js";
import { Subject } from "../../models/subject.model.js";
import { Unit } from "../../models/unit.model.js";
import { Types } from "mongoose";

import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

  //   GRADES


export async function createGrade(
  data: {
    name: string;
    number: number;
    description?: string;
  }
) {
  const existing =
    await Grade.findOne({
      number: data.number
    });

  if (existing) {
    throw new AppError(
      409,
      ERROR_CODES.CONFLICT,
      "Grade number already exists"
    );
  }

  return Grade.create(data);
}

export async function getGrades() {
  return Grade.find({
    isActive: true
  }).sort({
    number: 1
  });
}

export async function getGradeById(
  id: string
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid grade ID"
    );
  }

  const grade =
    await Grade.findById(id);

  if (!grade) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Grade not found"
    );
  }

  return grade;
}

export async function updateGrade(
  id: string,
  data: {
    name?: string;
    number?: number;
    description?: string;
  }
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid grade ID"
    );
  }

  const grade =
    await Grade.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true
      }
    );

  if (!grade) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Grade not found"
    );
  }

  return grade;
}

export async function deleteGrade(
  id: string
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid grade ID"
    );
  }

  const grade =
    await Grade.findById(id);

  if (!grade) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Grade not found"
    );
  }

  const subjectCount =
    await Subject.countDocuments({
      gradeId: grade._id
    });

  if (subjectCount > 0) {
    throw new AppError(
      409,
      ERROR_CODES.CONFLICT,
      "Cannot delete grade with subjects"
    );
  }

  await grade.deleteOne();
}

// CLASS LEVELS

export async function createClassLevel(
  data: {
    gradeId: string;
    section: string;
    capacity?: number;
  }
) {
  if (!isValidObjectId(data.gradeId)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid grade ID"
    );
  }

  const grade =
    await Grade.findById(
      data.gradeId
    );

  if (!grade) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Grade not found"
    );
  }

  return ClassLevel.create({
    gradeId: data.gradeId as any,
    section: data.section.toUpperCase(),
    capacity: data.capacity
  } as any);
}

export async function getClassLevels(
  gradeId?: string
) {
  const filter: Record<string, unknown> = {
    isActive: true
  };

  if (gradeId) {
    if (!isValidObjectId(gradeId)) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Invalid grade ID"
      );
    }

    filter.gradeId = gradeId;
  }

  return ClassLevel.find(filter)
    .populate(
      "gradeId",
      "name number"
    )
    .sort({
      "gradeId": 1,
      "section": 1
    });
}

export async function getClassLevelById(
  id: string
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid class level ID"
    );
  }

  const classLevel =
    await ClassLevel.findById(id)
      .populate(
        "gradeId",
        "name number"
      );

  if (!classLevel) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Class level not found"
    );
  }

  return classLevel;
}

export async function updateClassLevel(
  id: string,
  data: {
    section?: string;
    capacity?: number;
    isActive?: boolean;
  }
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid class level ID"
    );
  }

  if (data.section) {
    data.section =
      data.section.toUpperCase();
  }

  const classLevel =
    await ClassLevel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true
      }
    ).populate(
      "gradeId",
      "name number"
    );

  if (!classLevel) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Class level not found"
    );
  }

  return classLevel;
}

export async function deleteClassLevel(
  id: string
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid class level ID"
    );
  }

  const classLevel =
    await ClassLevel.findById(id);

  if (!classLevel) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Class level not found"
    );
  }

  // Check if there are any dependent exams or assignments
  // This will be implemented when needed
  // For now, allow deletion

  await classLevel.deleteOne();
}

// SUBJECTS


export async function createSubject(
  data: {
    name: string;
    code: string;
    gradeId: string;
    description?: string;
  }
) {
  if (!isValidObjectId(data.gradeId)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid grade ID"
    );
  }

  const grade =
    await Grade.findById(
      data.gradeId
    );

  if (!grade) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Grade not found"
    );
  }

  return Subject.create({
    ...data,
    code: data.code.toUpperCase()
  });
}

export async function getSubjects(
  gradeId?: string
) {
  const filter: Record<string, unknown> = {
    isActive: true
  };

  if (gradeId) {
    if (!isValidObjectId(gradeId)) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Invalid grade ID"
      );
    }

    filter.gradeId = gradeId;
  }

  return Subject.find(filter)
    .populate(
      "gradeId",
      "name number"
    )
    .sort({
      name: 1
    });
}

export async function getSubjectById(
  id: string
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid subject ID"
    );
  }

  const subject =
    await Subject.findById(id)
      .populate(
        "gradeId",
        "name number"
      );

  if (!subject) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Subject not found"
    );
  }

  return subject;
}

export async function updateSubject(
  id: string,
  data: {
    name?: string;
    code?: string;
    gradeId?: string;
    description?: string;
  }
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid subject ID"
    );
  }

  if (data.gradeId) {
    if (!isValidObjectId(data.gradeId)) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Invalid grade ID"
      );
    }

    const grade =
      await Grade.findById(
        data.gradeId
      );

    if (!grade) {
      throw new AppError(
        404,
        ERROR_CODES.NOT_FOUND,
        "Grade not found"
      );
    }
  }

  if (data.code) {
    data.code =
      data.code.toUpperCase();
  }

  const subject =
    await Subject.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true
      }
    ).populate(
      "gradeId",
      "name number"
    );

  if (!subject) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Subject not found"
    );
  }

  return subject;
}

export async function deleteSubject(
  id: string
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid subject ID"
    );
  }

  const subject =
    await Subject.findById(id);

  if (!subject) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Subject not found"
    );
  }

  const unitCount =
    await Unit.countDocuments({
      subjectId: subject._id
    });

  if (unitCount > 0) {
    throw new AppError(
      409,
      ERROR_CODES.CONFLICT,
      "Cannot delete subject with units"
    );
  }

  await subject.deleteOne();
}


//   UNITS


export async function createUnit(
  data: {
    subjectId: string;
    title: string;
    unitNumber: number;
    description?: string;
  }
) {
  if (!isValidObjectId(data.subjectId)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid subject ID"
    );
  }

  const subject =
    await Subject.findById(
      data.subjectId
    );

  if (!subject) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Subject not found"
    );
  }

  return Unit.create(data);
}

export async function getUnits(
  subjectId?: string
) {
  const filter: Record<string, unknown> = {
    isActive: true
  };

  if (subjectId) {
    if (!isValidObjectId(subjectId)) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Invalid subject ID"
      );
    }

    filter.subjectId = subjectId;
  }

  return Unit.find(filter)
    .populate(
      "subjectId",
      "name code gradeId"
    )
    .sort({
      unitNumber: 1
    });
}

export async function getUnitById(
  id: string
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid unit ID"
    );
  }

  const unit =
    await Unit.findById(id)
      .populate(
        "subjectId",
        "name code gradeId"
      );

  if (!unit) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Unit not found"
    );
  }

  return unit;
}

export async function updateUnit(
  id: string,
  data: {
    subjectId?: string;
    title?: string;
    unitNumber?: number;
    description?: string;
  }
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid unit ID"
    );
  }

  if (data.subjectId) {
    if (!isValidObjectId(data.subjectId)) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Invalid subject ID"
      );
    }

    const subject =
      await Subject.findById(
        data.subjectId
      );

    if (!subject) {
      throw new AppError(
        404,
        ERROR_CODES.NOT_FOUND,
        "Subject not found"
      );
    }
  }

  const unit =
    await Unit.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true
      }
    ).populate(
      "subjectId",
      "name code gradeId"
    );

  if (!unit) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Unit not found"
    );
  }

  return unit;
}

export async function deleteUnit(
  id: string
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid unit ID"
    );
  }

  const unit =
    await Unit.findById(id);

  if (!unit) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Unit not found"
    );
  }

  await unit.deleteOne();
}