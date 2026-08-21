import { twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const publicAuthClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_PUBLIC_BETTER_AUTH_URL,
  plugins: [twoFactorClient()],
});
