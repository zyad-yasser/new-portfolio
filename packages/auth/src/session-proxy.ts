import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export function requireSessionCookie(request: NextRequest, cookiePrefix?: string) {
  const sessionCookie = getSessionCookie(request, cookiePrefix ? { cookiePrefix } : undefined);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
