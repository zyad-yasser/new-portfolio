import { requireSessionCookie } from "@repo/auth/session-proxy";
import { ADMIN_COOKIE_PREFIX } from "@repo/auth/shared";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return requireSessionCookie(request, ADMIN_COOKIE_PREFIX);
}

export const config = {
  // API routes (Better Auth's own handler, tRPC) are excluded here since they enforce
  // auth themselves via context and return a proper 401 instead of an HTML redirect.
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
