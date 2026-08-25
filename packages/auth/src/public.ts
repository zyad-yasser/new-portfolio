import { db } from "@repo/db";
import * as schema from "@repo/db/schema";
import { sendVerificationEmail } from "@repo/email";
import { requireEnv } from "@repo/utils";
import { createSecondaryStorage } from "@repo/utils/secondary-storage";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { captcha, twoFactor } from "better-auth/plugins";
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
  session: {
    freshAge: 0,
  },
  rateLimit: {
    enabled: true,
    storage: "secondary-storage",
    // Catch-all for every endpoint not named below (get-session, update-user, list/revoke
    // session, etc.) — these aren't sensitive auth actions, so this is a generous backstop
    // against automated abuse rather than a throttle on normal use.
    window: 60,
    max: 300,
    customRules: {
      // Sensitive auth actions keep deliberate, tuned rate limits.
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 3600, max: 3 },
      "/request-password-reset": { window: 300, max: 3 },
      "/send-verification-email": { window: 900, max: 1 },
      // Overrides the twoFactor plugin's own default (3 requests / 10s), which is far
      // tighter than every other rule here and trips almost immediately on a mistyped
      // TOTP code. accountLockout (plugin default: 10 failed attempts -> 15min lock)
      // still guards against real brute-forcing independently of this transport limit.
      "/two-factor/*": { window: 60, max: 10 },
      // Overrides Better Auth's built-in default for these two paths (3 requests / 10s,
      // from the same core special-case rule that covers /sign-in and /sign-up), which is
      // disproportionately tight for a credential change a signed-in user might retry.
      "/change-password": { window: 60, max: 5 },
      "/change-email": { window: 60, max: 5 },
    },
  },
  plugins: [
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: requireEnv("TURNSTILE_SECRET_KEY"),
      endpoints: ["/sign-up/email"],
    }),
    twoFactor({
      issuer: appName,
    }),
  ],
  user: {
    additionalFields: roleField,
  },
});
