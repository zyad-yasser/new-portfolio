import { requireSessionCookie } from "@repo/auth/session-proxy";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return requireSessionCookie(request);
}

export const config = {
  matcher: ["/submit"],
};
