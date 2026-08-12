import { StudyMaterial } from "../../models/study-material.model.js";
import { Unit } from "../../models/unit.model.js";

import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

function isValidObjectId(
  id: string
): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

  // CREATE

export async function createStudyMaterial(
  data: {
    title: string;
    description?: string;
    type:
      | "NOTE"
      | "PDF"
      | "VIDEO"
      | "EXERCISE"
      | "REFERENCE";
    unitId: string;
    content?: string;
    fileUrl?: string;
  },
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

  const material =
    await StudyMaterial.create({
      ...data,
      createdBy,
      status: "DRAFT"
    });

  return StudyMaterial.findById(
    material._id
  ).populate({
    path: "unitId",
    select: "title unitNumber subjectId"
  });
}

  // LIST

export async function getStudyMaterials(
  options: {
    unitId?: string;
    type?: string;
    status?: string;
  } = {}
) {
  const filter: Record<
    string,
    unknown
  > = {};

  if (options.unitId) {
    if (
      !isValidObjectId(
        options.unitId
      )
    ) {
      throw new AppError(
        400,
        ERROR_CODES.INVALID_OPERATION,
        "Invalid unit ID"
      );
    }

    filter.unitId =
      options.unitId;
  }

  if (options.type) {
    filter.type =
      options.type;
  }

  if (options.status) {
    filter.status =
      options.status;
  } else {
    
    filter.status = "PUBLISHED";
  }

  return StudyMaterial.find(
    filter
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
    })
    .sort({
      createdAt: -1
    });
}

  // GET ONE

export async function getStudyMaterialById(
  id: string
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

  return material;
}

  // UPDATE

export async function updateStudyMaterial(
  id: string,
  data: {
    title?: string;
    description?: string;
    type?:
      | "NOTE"
      | "PDF"
      | "VIDEO"
      | "EXERCISE"
      | "REFERENCE";
    unitId?: string;
    content?: string;
    fileUrl?: string;
  }
) {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      ERROR_CODES.INVALID_OPERATION,
      "Invalid material ID"
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

  // DELETE

export async function deleteStudyMaterial(
  id: string
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

  await material.deleteOne();
}


  // PUBLISH


export async function publishStudyMaterial(
  id: string
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


  // ARCHIVE


export async function archiveStudyMaterial(
  id: string
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

  material.status =
    "ARCHIVED";

  await material.save();

  return material;
}