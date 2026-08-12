import { Schema, model, type HydratedDocument } from "mongoose";

export const USER_ROLES = [
  "STUDENT",
  "INSTRUCTOR",
  "ADMIN"
] as const;

export const USER_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "DISABLED"
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];

export interface IUser {
  email: string;
  passwordHash: string;

  role: UserRole;
  status: UserStatus;

  emailVerified: boolean;

  lastLoginAt?: Date;
  passwordChangedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    passwordHash: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
      default: "STUDENT"
    },

    status: {
      type: String,
      enum: USER_STATUSES,
      required: true,
      default: "ACTIVE"
    },

    emailVerified: {
      type: Boolean,
      required: true,
      default: false
    },

    lastLoginAt: {
      type: Date
    },

    passwordChangedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const User = model<IUser>("User", userSchema);