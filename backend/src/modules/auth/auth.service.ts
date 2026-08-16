import argon2 from "argon2";

import { User } from "../../models/user.model.js";
import { Grade } from "../../models/grade.model.js";
import { ClassLevel } from "../../models/class-level.model.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";
import type { RegisterInput } from "./auth.validation.js";

export async function hashPassword(
  password: string
): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id
  });
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return argon2.verify(
    passwordHash,
    password
  );
}

export async function registerStudent(
  input: RegisterInput
) {
  const email = `${input.studentId.toLowerCase()}@student.gesuba.edu.et`;

  const existingUser = await User.findOne({
    email
  });

  if (existingUser) {
    throw new AppError(
      409,
      ERROR_CODES.EMAIL_ALREADY_REGISTERED,
      "An account with this student ID already exists"
    );
  }

  const grade = await Grade.findOne({
    number: input.gradeLevel
  });

  if (!grade) {
    throw new AppError(
      400,
      ERROR_CODES.VALIDATION_ERROR,
      `Grade ${input.gradeLevel} is not configured yet`
    );
  }

  const classLevel = await ClassLevel.findOne({
    gradeId: grade._id,
    section: "A"
  });

  if (!classLevel) {
    throw new AppError(
      400,
      ERROR_CODES.VALIDATION_ERROR,
      `No class level found for grade ${input.gradeLevel}`
    );
  }

  const passwordHash =
    await hashPassword(input.password);

  const user = await User.create({
    email,
    passwordHash,
    name: input.fullName,
    classLevelId: classLevel._id,
    role: "STUDENT",
    status: "ACTIVE"
  });

  return user;
}

export async function authenticateUser(
  email: string,
  password: string
) {
  const user = await User.findOne({
    email
  }).select("+passwordHash");

  if (!user) {
    throw new AppError(
      401,
      ERROR_CODES.INVALID_CREDENTIALS,
      "Invalid email or password"
    );
  }

  const validPassword =
    await verifyPassword(
      password,
      user.passwordHash
    );

  if (!validPassword) {
    throw new AppError(
      401,
      ERROR_CODES.INVALID_CREDENTIALS,
      "Invalid email or password"
    );
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(
      403,
      ERROR_CODES.ACCOUNT_NOT_ACTIVE,
      "This account is not active"
    );
  }

  user.lastLoginAt = new Date();

  await user.save();

  return user;
}