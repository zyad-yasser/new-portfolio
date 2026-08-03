import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { PublicTRPCContext } from "./context";

const t = initTRPC.context<PublicTRPCContext>().create({
  transformer: superjson,
});

export const createPublicTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const authedProcedure = t.procedure.use(({ ctx, next }) => {
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
