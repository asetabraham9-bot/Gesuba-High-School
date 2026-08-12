import { User } from "../../models/user.model.js";

import type {
  UserRole,
  UserStatus
} from "../../models/user.model.js";

import {
  hashPassword
} from "../auth/auth.service.js";

import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

async function createUser(
  email: string,
  password: string,
  role: UserRole
) {
  const existingUser =
    await User.findOne({ email });

  if (existingUser) {
    throw new AppError(
      409,
      ERROR_CODES.EMAIL_ALREADY_REGISTERED,
      "Email is already registered"
    );
  }

  const passwordHash =
    await hashPassword(password);

  return User.create({
    email,
    passwordHash,
    role,
    status: "ACTIVE"
  });
}

export async function createStudent(
  email: string,
  password: string
) {
  return createUser(
    email,
    password,
    "STUDENT"
  );
}

export async function createInstructor(
  email: string,
  password: string
) {
  return createUser(
    email,
    password,
    "INSTRUCTOR"
  );
}

export async function createAdmin(
  email: string,
  password: string
) {
  return createUser(
    email,
    password,
    "ADMIN"
  );
}

export async function getUsers() {
  return User.find()
    .select("-passwordHash")
    .sort({
      createdAt: -1
    });
}

export async function getUserById(
  userId: string
) {
  const user =
    await User.findById(userId)
      .select("-passwordHash");

  if (!user) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "User not found"
    );
  }

  return user;
}

export async function updateUserRole(
  userId: string,
  role: UserRole
) {
  const user =
    await User.findByIdAndUpdate(
      userId,
      { role },
      {
        new: true,
        runValidators: true
      }
    ).select("-passwordHash");

  if (!user) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "User not found"
    );
  }

  return user;
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus
) {
  const user =
    await User.findByIdAndUpdate(
      userId,
      { status },
      {
        new: true,
        runValidators: true
      }
    ).select("-passwordHash");

  if (!user) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "User not found"
    );
  }

  return user;
}

export async function deleteUser(
  userId: string
): Promise<void> {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new AppError(
      404,
      ERROR_CODES.NOT_FOUND,
      "User not found"
    );
  }

  await User.findByIdAndDelete(userId);
}