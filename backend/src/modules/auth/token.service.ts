import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { Types } from "mongoose";

import { env } from "../../config/env.js";
import { RefreshToken } from "../../models/refresh-token.model.js";
import type { UserRole } from "../../models/user.model.js";
import type { AccessTokenPayload } from "./auth.types.js";

export function createAccessToken(
  userId: string,
  role: UserRole
): string {
  const payload: AccessTokenPayload = {
    sub: userId,
    role,
    type: "access"
  };

  return jwt.sign(
    payload,
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN
    } as jwt.SignOptions
  );
}

export function createRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshToken(
  token: string
): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function storeRefreshToken(
  userId: Types.ObjectId,
  refreshToken: string
): Promise<void> {
  const tokenHash =
    hashRefreshToken(refreshToken);

  await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    )
  });
}
