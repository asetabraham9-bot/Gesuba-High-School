import type { Request, Response } from "express";

import {
  loginSchema,
  registerSchema
} from "./auth.validation.js";

import {
  authenticateUser,
  registerStudent
} from "./auth.service.js";

import {
  createAccessToken,
  createRefreshToken,
  storeRefreshToken
} from "./token.service.js";

import {
  setRefreshTokenCookie
} from "./auth.cookies.js";

export async function registerController(
  req: Request,
  res: Response
): Promise<void> {
  const input =
    registerSchema.parse(req.body);

  const user = await registerStudent(
    input.email,
    input.password
  );

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  });
}

export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  const input =
    loginSchema.parse(req.body);

  const user =
    await authenticateUser(
      input.email,
      input.password
    );

  const accessToken =
    createAccessToken(
      user.id,
      user.role
    );

  const refreshToken =
    createRefreshToken();

  await storeRefreshToken(
    user._id,
    refreshToken
  );

  setRefreshTokenCookie(
    res,
    refreshToken
  );

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  });
}
