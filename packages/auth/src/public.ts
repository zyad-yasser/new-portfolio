import { db } from "@repo/db";
import * as schema from "@repo/db/schema";
import { requireEnv } from "@repo/utils";
import { createSecondaryStorage } from "@repo/utils/secondary-storage";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { captcha } from "better-auth/plugins";
import { roleField } from "./shared";

if (!process.env.PUBLIC_BETTER_AUTH_SECRET) {
  throw new Error("PUBLIC_BETTER_AUTH_SECRET is not set");
}

export const publicAuth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.PUBLIC_BETTER_AUTH_SECRET,
  baseURL: process.env.PUBLIC_BETTER_AUTH_URL,
  ...(process.env.PUBLIC_TRUSTED_ORIGINS
    ? { trustedOrigins: process.env.PUBLIC_TRUSTED_ORIGINS.split(",") }
    : {}),
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      ...(process.env.PUBLIC_COOKIE_DOMAIN ? { domain: process.env.PUBLIC_COOKIE_DOMAIN } : {}),
    },
  },
  secondaryStorage: createSecondaryStorage("public"),
  rateLimit: {
    enabled: true,
    storage: "secondary-storage",
    window: 60,
    max: 30,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 3600, max: 3 },
      "/request-password-reset": { window: 300, max: 3 },
    },
  },
  plugins: [
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: requireEnv("TURNSTILE_SECRET_KEY"),
      endpoints: ["/sign-up/email"],
    }),
  ],
  user: {
    additionalFields: roleField,
  },
});
