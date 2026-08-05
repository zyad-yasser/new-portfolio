import { createPublicTRPCRouter, publicProcedure } from "../init";
import { categoryRouter } from "./category";
import { postRouter } from "./post";
import { reviewRouter } from "./review";
import { tagRouter } from "./tag";

export const publicAppRouter = createPublicTRPCRouter({
  health: publicProcedure.query(() => ({
    ok: true,
    time: new Date().toISOString(),
  })),
  review: reviewRouter,
  post: postRouter,
  category: categoryRouter,
  tag: tagRouter,
});

export type PublicAppRouter = typeof publicAppRouter;
