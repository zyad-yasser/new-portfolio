import { createPublicTRPCRouter, publicProcedure } from "../init";
import { postRouter } from "./post";
import { reviewRouter } from "./review";

export const publicAppRouter = createPublicTRPCRouter({
  health: publicProcedure.query(() => ({
    ok: true,
    time: new Date().toISOString(),
  })),
  review: reviewRouter,
  post: postRouter,
});

export type PublicAppRouter = typeof publicAppRouter;
