import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({
    ok: true,
    time: new Date().toISOString(),
  })),
  me: protectedProcedure.query(({ ctx }) => ctx.session.user),
});

export type AppRouter = typeof appRouter;
