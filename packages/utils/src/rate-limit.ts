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

const LOCAL_DEV_IP = "127.0.0.1";

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || LOCAL_DEV_IP;
  }
  return headers.get("x-real-ip") ?? LOCAL_DEV_IP;
}
