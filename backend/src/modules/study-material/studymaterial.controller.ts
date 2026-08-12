import type {
  Request,
  Response
} from "express";

import {
  createStudyMaterialSchema,
  updateStudyMaterialSchema
} from "./studymaterial.validation.js";

import {
  createStudyMaterial,
  getStudyMaterials,
  getStudyMaterialById,
  updateStudyMaterial,
  deleteStudyMaterial,
  publishStudyMaterial,
  archiveStudyMaterial
} from "./studymaterial.service.js";

/* =========================
   CREATE
========================= */

export async function createStudyMaterialController(
  req: Request,
  res: Response
): Promise<void> {
  const input =
    createStudyMaterialSchema.parse(
      req.body
    );

  const material =
    await createStudyMaterial(
      input,
      req.user!.id
    );

  res.status(201).json({
    success: true,
    data: {
      material
    }
  });
}

/* =========================
   LIST
========================= */

export async function getStudyMaterialsController(
  req: Request,
  res: Response
): Promise<void> {
  const materials =
    await getStudyMaterials({
      unitId:
        req.query.unitId as
          | string
          | undefined,

      type:
        req.query.type as
          | string
          | undefined,

      status:
        req.query.status as
          | string
          | undefined,

      userId:
        req.user!.id,

      role:
        req.user!.role
    });

  res.status(200).json({
    success: true,
    data: {
      materials
    }
  });
}

/* =========================
   GET ONE
========================= */

export async function getStudyMaterialController(
  req: Request,
  res: Response
): Promise<void> {
  const material =
      await getStudyMaterialById(
        (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string,
      req.user!.role as "INSTRUCTOR" | "ADMIN"
    );

  res.status(200).json({
    success: true,
    data: {
      material
    }
  });
}

/* =========================
   UPDATE
========================= */

export async function updateStudyMaterialController(
  req: Request,
  res: Response
): Promise<void> {
  const input =
    updateStudyMaterialSchema.parse(
      req.body
    );

  const material =
      await updateStudyMaterial(
        (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string,
      input,
      req.user!.id,
      req.user!.role as "INSTRUCTOR" | "ADMIN"
    );

  res.status(200).json({
    success: true,
    data: {
      material
    }
  });
}

/* =========================
   DELETE
========================= */

export async function deleteStudyMaterialController(
  req: Request,
  res: Response
): Promise<void> {
  await deleteStudyMaterial(
     (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string,
    req.user!.id,
    req.user!.role as "INSTRUCTOR" | "ADMIN"
  );

  res.status(200).json({
    success: true,
    data: {
      message:
        "Study material deleted successfully"
    }
  });
}

/* =========================
   PUBLISH
========================= */

export async function publishStudyMaterialController(
  req: Request,
  res: Response
): Promise<void> {
  const material =
      await publishStudyMaterial(
        (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string,
      req.user!.id,
      req.user!.role as "INSTRUCTOR" | "ADMIN"
    );

  res.status(200).json({
    success: true,
    data: {
      material
    }
  });
}

/* =========================
   ARCHIVE
========================= */

export async function archiveStudyMaterialController(
  req: Request,
  res: Response
): Promise<void> {
  const material =
      await archiveStudyMaterial(
        (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string,
      req.user!.id,
      req.user!.role as "INSTRUCTOR" | "ADMIN"
    );

  res.status(200).json({
    success: true,
    data: {
      material
    }
  });
}