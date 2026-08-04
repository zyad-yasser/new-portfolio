import { requireEnv } from "@repo/utils";
import { createRateLimiter, getClientIp } from "@repo/utils/rate-limit";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TRPCContext } from "./context";

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

const appName = requireEnv("APP_NAME");
const baseRateLimiter = createRateLimiter({ prefix: `${appName}:trpc`, limit: 60, window: "1 m" });

const rateLimited = t.middleware(async ({ ctx, next }) => {
  const ip = getClientIp(ctx.headers);
  const { success } = await baseRateLimiter.limit(ip);

  if (!success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }

  return next();
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure.use(rateLimited);

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session || ctx.session.user.role !== "admin") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
