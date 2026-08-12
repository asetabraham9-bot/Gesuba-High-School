import type { UserRole } from "../../models/user.model.js";

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  type: "access";
}