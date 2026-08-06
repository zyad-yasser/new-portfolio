import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";

export function createRateLimiter({
  prefix,
  limit,
  window,
}: {
  prefix: string;
  limit: number;
  window: Parameters<typeof Ratelimit.slidingWindow>[1];
}) {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `ratelimit:${prefix}`,
    analytics: false,
  });
}

// Fails open: if the rate limiter's own Redis/Upstash backend is unreachable or errors, that's an
// infra problem, not the caller's fault — every request should not start failing just because the
// rate limiter can't be reached. Errors are logged so the outage is still visible.
export async function safeLimit(limiter: Ratelimit, key: string) {
  try {
    return await limiter.limit(key);
  } catch (error) {
    console.error("Rate limiter unavailable, failing open:", error);
    return { success: true };
  }
}

const LOCAL_DEV_IP = "127.0.0.1";

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || LOCAL_DEV_IP;
  }
  return headers.get("x-real-ip") ?? LOCAL_DEV_IP;
}
