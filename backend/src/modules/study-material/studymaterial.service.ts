import { StudyMaterial } from "../../models/study-material.model.js";
import { Unit } from "../../models/unit.model.js";

import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

type MaterialRole =
  | "ADMIN"
  | "INSTRUCTOR"
  | "STUDENT";

type MaterialType =
  | "NOTE"
  | "PDF"
  | "VIDEO"
  | "EXERCISE"
  | "REFERENCE";

interface CreateStudyMaterialInput {
  title: string;
  description?: string;
  type: MaterialType;
  unitId: string;
  content?: string;
  fileUrl?: string;
}

interface UpdateStudyMaterialInput {
  title?: string;
  description?: string;
  type?: MaterialType;
  unitId?: string;
  content?: string;
  fileUrl?: string;
}

function isValidObjectId(
  id: string
): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

function ensureOwner(
  material: {
    createdBy: {
      toString(): string;
    };
  },
  userId: string
): void {
  if (
    material.createdBy.toString() !==
    userId
  ) {
    throw new AppError(
      403,
      ERROR_CODES.FORBIDDEN,
      "You can only manage your own study materials"
    );
  }
}

/* =========================
   CREATE
========================= */

export async function createStudyMaterial(
  data: CreateStudyMaterialInput,
  createdBy: string
) {
  if (!isValidObjectId(data.unitId)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid unit ID"
    );
  }

  const unit =
    await Unit.findById(data.unitId);

  if (!unit) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Unit not found"
    );
  }

  const material =
    await StudyMaterial.create({
      ...data,
      createdBy,
      status: "DRAFT"
    });

  return StudyMaterial.findById(
    material._id
  )
    .populate({
      path: "unitId",
      select:
        "title unitNumber subjectId"
    })
    .populate({
      path: "createdBy",
      select: "email role"
    });
}

/* =========================
   LIST
========================= */

export async function getStudyMaterials(
  options: {
  unitId?: string;
  type?: string;
  status?: string;
  search?: string;
  userId?: string;
  role?: MaterialRole;
} = {}
) {
  const conditions: Record<
  string,
  unknown
>[] = [];

if (options.unitId) {
  if (!isValidObjectId(options.unitId)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid unit ID"
    );
  }

  conditions.push({
    unitId: options.unitId
  });
}

if (options.type) {
  conditions.push({
    type: options.type
  });
}

if (options.search) {
  conditions.push({
    $or: [
      {
        title: {
          $regex: options.search,
          $options: "i"
        }
      },
      {
        description: {
          $regex: options.search,
          $options: "i"
        }
      }
    ]
  });
}

/*
 * Student:
 * only published.
 */
if (options.role === "STUDENT") {
  conditions.push({
    status: "PUBLISHED"
  });
}

/*
 * Instructor:
 * published materials OR own materials.
 */
if (options.role === "INSTRUCTOR") {
  conditions.push({
    $or: [
      {
        status: "PUBLISHED"
      },
      {
        createdBy: options.userId
      }
    ]
  });
}

/*
 * Admin:
 * optional status filter.
 */
if (
  options.role === "ADMIN" &&
  options.status
) {
  conditions.push({
    status: options.status
  });
}

const filter =
  conditions.length > 0
    ? { $and: conditions }
    : {};

  return StudyMaterial.find(filter)
  .populate({
    path: "unitId",
    select:
      "title unitNumber subjectId"
  })
  .populate({
    path: "createdBy",
    select:
      "email role"
  })
  .sort({
    createdAt: -1
  });
}

/* =========================
   GET ONE
========================= */

export async function getStudyMaterialById(
  id: string,
  role: MaterialRole
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid material ID"
    );
  }

  const material =
    await StudyMaterial.findById(
      id
    )
      .populate({
        path: "unitId",
        select:
          "title unitNumber subjectId"
      })
      .populate({
        path: "createdBy",
        select:
          "email role"
      });

  if (!material) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Study material not found"
    );
  }

  /*
   * Students and instructors
   * can only retrieve published
   * materials through direct ID
   * access unless they are the
   * owner.
   *
   * Since instructor ownership
   * is handled at the list level,
   * direct access to unpublished
   * materials is restricted here
   * for non-admin users.
   */
  if (
    role === "STUDENT" &&
    material.status !== "PUBLISHED"
  ) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Study material not found"
    );
  }

  return material;
}

/* =========================
   UPDATE
========================= */

export async function updateStudyMaterial(
  id: string,
  data: UpdateStudyMaterialInput,
  userId: string,
  role: "ADMIN" | "INSTRUCTOR"
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid material ID"
    );
  }

  const existing =
    await StudyMaterial.findById(
      id
    );

  if (!existing) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Study material not found"
    );
  }

  if (role === "INSTRUCTOR") {
    ensureOwner(
      existing,
      userId
    );
  }

  if (data.unitId) {
    if (
      !isValidObjectId(
        data.unitId
      )
    ) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Invalid unit ID"
      );
    }

    const unit =
      await Unit.findById(
        data.unitId
      );

    if (!unit) {
      throw new AppError(
        404,
        ERROR_CODES.NOT_FOUND,
        "Unit not found"
      );
    }
  }

  const material =
    await StudyMaterial.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true
      }
    )
      .populate({
        path: "unitId",
        select:
          "title unitNumber subjectId"
      })
      .populate({
        path: "createdBy",
        select:
          "email role"
      });

  if (!material) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Study material not found"
    );
  }

  return material;
}

/* =========================
   DELETE
========================= */

export async function deleteStudyMaterial(
  id: string,
  userId: string,
  role: "ADMIN" | "INSTRUCTOR"
): Promise<void> {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid material ID"
    );
  }

  const material =
    await StudyMaterial.findById(
      id
    );

  if (!material) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Study material not found"
    );
  }

  if (role === "INSTRUCTOR") {
    ensureOwner(
      material,
      userId
    );
  }

  await material.deleteOne();
}

/* =========================
   PUBLISH
========================= */

export async function publishStudyMaterial(
  id: string,
  userId: string,
  role: "ADMIN" | "INSTRUCTOR"
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid material ID"
    );
  }

  const material =
    await StudyMaterial.findById(
      id
    );

  if (!material) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Study material not found"
    );
  }

  if (role === "INSTRUCTOR") {
    ensureOwner(
      material,
      userId
    );
  }

  material.status =
    "PUBLISHED";

  material.publishedAt =
    new Date();

  await material.save();

  return StudyMaterial.findById(
    material._id
  )
    .populate({
      path: "unitId",
      select:
        "title unitNumber subjectId"
    })
    .populate({
      path: "createdBy",
      select:
        "email role"
    });
}

/* =========================
   ARCHIVE
========================= */

export async function archiveStudyMaterial(
  id: string,
  userId: string,
  role: "ADMIN" | "INSTRUCTOR"
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid material ID"
    );
  }

  const material =
    await StudyMaterial.findById(
      id
    );

  if (!material) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "Study material not found"
    );
  }

  if (role === "INSTRUCTOR") {
    ensureOwner(
      material,
      userId
    );
  }

  material.status =
    "ARCHIVED";

  await material.save();

  return material;
}