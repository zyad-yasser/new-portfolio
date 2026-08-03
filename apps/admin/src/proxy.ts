import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // API routes (Better Auth's own handler, tRPC) are excluded here since they enforce
  // auth themselves via context and return a proper 401 instead of an HTML redirect.
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
