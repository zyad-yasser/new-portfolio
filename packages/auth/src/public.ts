import { db } from "@repo/db";
import * as schema from "@repo/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
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
  user: {
    additionalFields: roleField,
  },
});
