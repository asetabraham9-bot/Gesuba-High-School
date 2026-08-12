import type {
  Request,
  Response
} from "express";

import {
  createStudentSchema,
  createInstructorSchema,
  createAdminSchema,
  updateRoleSchema,
  updateStatusSchema
} from "./user.validation.js";

import {
  createStudent,
  createInstructor,
  createAdmin,
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser
} from "./user.service.js";

import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

interface UserIdParams {
  id: string;
}

export async function createStudentController(
  req: Request,
  res: Response
): Promise<void> {
  const input =
    createStudentSchema.parse(req.body);

  const user =
    await createStudent(
      input.email,
      input.password
    );

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      }
    }
  });
}

export async function createInstructorController(
  req: Request,
  res: Response
): Promise<void> {
  const input =
    createInstructorSchema.parse(req.body);

  const user =
    await createInstructor(
      input.email,
      input.password
    );

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      }
    }
  });
}

export async function createAdminController(
  req: Request,
  res: Response
): Promise<void> {
  const input =
    createAdminSchema.parse(req.body);

  const user =
    await createAdmin(
      input.email,
      input.password
    );

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      }
    }
  });
}

export async function getUsersController(
  _req: Request,
  res: Response
): Promise<void> {
  const users = await getUsers();

  res.status(200).json({
    success: true,
    data: {
      users
    }
  });
}

export async function getUserController(
  req: Request<UserIdParams>,
  res: Response
): Promise<void> {
  const { id } = req.params;

  const user =
    await getUserById(id);

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
}

export async function updateRoleController(
  req: Request<UserIdParams>,
  res: Response
): Promise<void> {
  const input =
    updateRoleSchema.parse(
      req.body
    );

  const { id } = req.params;

  const user =
    await updateUserRole(
      id,
      input.role
    );

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
}

export async function updateStatusController(
  req: Request<UserIdParams>,
  res: Response
): Promise<void> {
  const input =
    updateStatusSchema.parse(
      req.body
    );

  const { id } = req.params;

  // map incoming status to service allowed status union
  const mappedStatus: "ACTIVE" | "SUSPENDED" | "DISABLED" =
    input.status === "INACTIVE" ? "DISABLED" : (input.status as "ACTIVE");

  const user = await updateUserStatus(id, mappedStatus);

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
}

export async function deleteUserController(
  req: Request<UserIdParams>,
  res: Response
): Promise<void> {
  const { id } = req.params;

  if (req.user?.id === id) {
    throw new AppError(
      400,
      ERROR_CODES.FORBIDDEN,
      "You cannot delete your own account"
    );
  }

  await deleteUser(id);

  res.status(200).json({
    success: true,
    data: {
      message:
        "User deleted successfully"
    }
  });
}