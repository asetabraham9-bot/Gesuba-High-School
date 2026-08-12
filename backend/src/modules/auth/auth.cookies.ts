import type { Response } from "express";
import { env } from "../../config/env.js";

const REFRESH_TOKEN_COOKIE = "refresh_token";

export function setRefreshTokenCookie(
  response: Response,
  token: string
): void {
  response.cookie(
    REFRESH_TOKEN_COOKIE,
    token,
    {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "strict",
      path: "/api/v1/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  );
}

export function clearRefreshTokenCookie(
  response: Response
): void {
  response.clearCookie(
    REFRESH_TOKEN_COOKIE,
    {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "strict",
      path: "/api/v1/auth"
    }
  );
}

export { REFRESH_TOKEN_COOKIE };