import mongoose from "mongoose";

import { env } from "../config/env.js";
import { User } from "../models/user.model.js";
import {
  hashPassword
} from "../modules/auth/auth.service.js";

async function seedAdmin() {
  await mongoose.connect(
    env.MONGODB_URI
  );

  const existingAdmin =
    await User.findOne({
      role: "ADMIN"
    });

  if (existingAdmin) {
    console.log(
      "Admin already exists."
    );

    await mongoose.disconnect();
    return;
  }

  const passwordHash =
    await hashPassword(
      "ChangeMe123!"
    );

  await User.create({
    email: "admin@gesuba.edu.et",
    passwordHash,
    role: "ADMIN",
    status: "ACTIVE"
  });

  console.log(
    "Initial admin created."
  );

  await mongoose.disconnect();
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});