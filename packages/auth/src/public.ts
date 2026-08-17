import { db } from "@repo/db";
import * as schema from "@repo/db/schema";
import { sendVerificationEmail } from "@repo/email";
import { requireEnv } from "@repo/utils";
import { createSecondaryStorage } from "@repo/utils/secondary-storage";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { captcha } from "better-auth/plugins";
import { roleField } from "./shared";

const appName = requireEnv("APP_NAME");

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
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ appName, to: user.email, name: user.name, url });
    },
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
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  account: {
    accountLinking: {
      enabled: true,
      requireLocalEmailVerified: true,
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
      "/send-verification-email": { window: 900, max: 1 },
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
