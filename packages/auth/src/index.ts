import { db } from "@repo/db";
import * as schema from "@repo/db/schema";
import { createSecondaryStorage } from "@repo/utils/secondary-storage";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { roleField } from "./shared";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  secondaryStorage: createSecondaryStorage("admin"),
  rateLimit: {
    enabled: true,
    storage: "secondary-storage",
    window: 60,
    max: 30,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 300, max: 3 },
    },
  },
  user: {
    additionalFields: roleField,
  },
});
