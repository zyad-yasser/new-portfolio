import { requireEnv } from "@repo/utils";
import { createRateLimiter, getClientIp, safeLimit } from "@repo/utils/rate-limit";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { PublicTRPCContext } from "./context";

const t = initTRPC.context<PublicTRPCContext>().create({
  transformer: superjson,
});

const appName = requireEnv("APP_NAME");
const baseRateLimiter = createRateLimiter({ prefix: `${appName}:trpc`, limit: 60, window: "1 m" });

const rateLimited = t.middleware(async ({ ctx, next }) => {
  const ip = getClientIp(ctx.headers);
  const { success } = await safeLimit(baseRateLimiter, ip);

  if (!success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }

  return next();
});

export const createPublicTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(rateLimited);

export const authedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export function strictRateLimit({
  path,
  limit,
  window,
}: {
  path: string;
  limit: number;
  window: Parameters<typeof createRateLimiter>[0]["window"];
}) {
  const limiter = createRateLimiter({ prefix: `${appName}:trpc:${path}`, limit, window });

  return t.middleware(async ({ ctx, next }) => {
    const ip = getClientIp(ctx.headers);
    const { success } = await safeLimit(limiter, ip);

    if (!success) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
    }

    return next();
  });
}
