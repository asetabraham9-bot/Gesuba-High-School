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


/* =====================================================
   CREATE STUDY MATERIAL
===================================================== */

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


/* =====================================================
   LIST STUDY MATERIALS
===================================================== */

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
          | undefined
    });


  res.status(200).json({
    success: true,

    data: {
      materials
    }
  });
}


/* =====================================================
   GET ONE STUDY MATERIAL
===================================================== */

export async function getStudyMaterialController(
  req: Request,
  res: Response
): Promise<void> {

  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id as string;

  const material = await getStudyMaterialById(id);

  res.status(200).json({
    success: true,

    data: {
      material
    }
  });
}


/* =====================================================
   UPDATE STUDY MATERIAL
===================================================== */

export async function updateStudyMaterialController(
  req: Request,
  res: Response
): Promise<void> {

  const input =
    updateStudyMaterialSchema.parse(
      req.body
    );


  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id as string;

  const material = await updateStudyMaterial(id, input);


  res.status(200).json({
    success: true,

    data: {
      material
    }
  });
}


/* =====================================================
   DELETE STUDY MATERIAL
===================================================== */

export async function deleteStudyMaterialController(
  req: Request,
  res: Response
): Promise<void> {

  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id as string;

  await deleteStudyMaterial(id);


  res.status(200).json({
    success: true,

    data: {
      message:
        "Study material deleted successfully"
    }
  });
}


/* =====================================================
   PUBLISH STUDY MATERIAL
===================================================== */

export async function publishStudyMaterialController(
  req: Request,
  res: Response
): Promise<void> {

  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id as string;

  const material = await publishStudyMaterial(id);


  res.status(200).json({
    success: true,

    data: {
      material
    }
  });
}


/* =====================================================
   ARCHIVE STUDY MATERIAL
===================================================== */

export async function archiveStudyMaterialController(
  req: Request,
  res: Response
): Promise<void> {

  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id as string;

  const material = await archiveStudyMaterial(id);


  res.status(200).json({
    success: true,

    data: {
      material
    }
  });
}