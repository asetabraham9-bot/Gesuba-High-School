import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.validation.js";
import { authenticateUser, registerStudent } from "./auth.service.js";
import { formatUserResponse } from "./user-response.js";
import { findRefreshToken, revokeRefreshToken, createAccessToken, createRefreshToken, storeRefreshToken } from "./token.service.js";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE
} from "./auth.cookies.js";
import { User } from "../../models/user.model.js";
import { AppError } from "../../errors/app-error.js";
import { ERROR_CODES } from "../../errors/error.codes.js";

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

  const userResponse = await formatUserResponse(user);

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: userResponse
    }
  });
}

export async function getCurrentUserController(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(
      401,
      ERROR_CODES.UNAUTHORIZED,
      "Authentication is required"
    );
  }

  const user = await User.findById(
    req.user.id
  );

  if (!user) {
    throw new AppError(
      401,
      ERROR_CODES.UNAUTHORIZED,
      "User account no longer exists"
    );
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(
      403,
      ERROR_CODES.ACCOUNT_NOT_ACTIVE,
      "This account is not active"
    );
  }

  res.status(200).json({
    success: true,
    data: {
      user: await formatUserResponse(user)
    }
  });
}
export async function registerController(
  req: Request,
  res: Response
): Promise<void> {
  const input = registerSchema.parse(req.body);

  const user = await registerStudent(input);

  res.status(201).json({
    success: true,
    data: {
      user: await formatUserResponse(user)
    },
    message: "Account created successfully"
  });
}

export async function adminTestController(
  req: Request,
  res: Response
): Promise<void> {
  res.status(200).json({
    success: true,
    data: {
      message: "Admin access granted",
      user: req.user
    }
  });
}

export async function instructorTestController(
  req: Request,
  res: Response
): Promise<void> {
  res.status(200).json({
    success: true,
    data: {
      message: "Instructor or admin access granted",
      user: req.user
    }
  });
}

export async function refreshController(
  req: Request,
  res: Response
): Promise<void> {
  const refreshToken =
    req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (!refreshToken) {
    throw new AppError(
      401,
      ERROR_CODES.UNAUTHORIZED,
      "Refresh token is required"
    );
  }

  const storedToken =
    await findRefreshToken(
      refreshToken
    );

  if (!storedToken) {
    throw new AppError(
      401,
      ERROR_CODES.UNAUTHORIZED,
      "Invalid or expired refresh token"
    );
  }

  const user = await User.findById(
    storedToken.userId
  );

  if (!user) {
    await revokeRefreshToken(
      refreshToken
    );

    throw new AppError(
      401,
      ERROR_CODES.UNAUTHORIZED,
      "User account no longer exists"
    );
  }

  if (user.status !== "ACTIVE") {
    await revokeRefreshToken(
      refreshToken
    );

    throw new AppError(
      403,
      ERROR_CODES.ACCOUNT_NOT_ACTIVE,
      "This account is not active"
    );
  }

  const newAccessToken =
    createAccessToken(
      user.id,
      user.role
    );

  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken
    }
  });
}

export async function logoutController(
  req: Request,
  res: Response
): Promise<void> {
  const refreshToken =
    req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (refreshToken) {
    await revokeRefreshToken(
      refreshToken
    );
  }

  clearRefreshTokenCookie(res);

  res.status(200).json({
    success: true,
    data: {
      message: "Logged out successfully"
    }
  });
}