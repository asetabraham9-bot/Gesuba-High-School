import {
  Schema,
  model,
  type HydratedDocument,
  type Types
} from "mongoose";

export interface IRefreshToken {
  userId: Types.ObjectId;

  tokenHash: string;

  expiresAt: Date;
  revokedAt?: Date;

  replacedByTokenId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type RefreshTokenDocument =
  HydratedDocument<IRefreshToken>;

const refreshTokenSchema =
  new Schema<IRefreshToken>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
      },

      tokenHash: {
        type: String,
        required: true,
        unique: true
      },

      expiresAt: {
        type: Date,
        required: true,
        
      },

      revokedAt: {
        type: Date
      },

      replacedByTokenId: {
        type: String
      }
    },
    {
      timestamps: true
    }
  );

refreshTokenSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0
  }
);

export const RefreshToken =
  model<IRefreshToken>(
    "RefreshToken",
    refreshTokenSchema
  );
