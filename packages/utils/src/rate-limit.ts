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

export async function safeLimit(limiter: Ratelimit, key: string) {
  try {
    return await limiter.limit(key);
  } catch (error) {
    console.error("Rate limiter unavailable, failing open:", error);
    return { success: true };
  }
}

const LOCAL_DEV_IP = "127.0.0.1";

function firstAddress(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export function getClientIp(headers: Headers) {
  return (
    firstAddress(headers.get("x-vercel-forwarded-for")) ??
    firstAddress(headers.get("x-real-ip")) ??
    firstAddress(headers.get("x-forwarded-for")) ??
    LOCAL_DEV_IP
  );
}
