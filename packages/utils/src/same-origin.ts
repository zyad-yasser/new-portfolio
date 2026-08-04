export class SameOriginError extends Error {}

export function assertSameOrigin(headers: Headers) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const origin = headers.get("origin");
  const host = headers.get("x-forwarded-host") ?? headers.get("host");

  if (!origin || !host) {
    throw new SameOriginError("Missing Origin or Host header");
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new SameOriginError("Invalid Origin header");
  }

  if (originHost !== host) {
    throw new SameOriginError("Cross-origin request rejected");
  }
}
