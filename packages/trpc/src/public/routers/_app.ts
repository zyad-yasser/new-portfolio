import { createPublicTRPCRouter, publicProcedure } from "../init";
import { blockRouter } from "./block";
import { categoryRouter } from "./category";
import { commentRouter } from "./comment";
import { postRouter } from "./post";
import { reactionRouter } from "./reaction";
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
  block: blockRouter,
  comment: commentRouter,
  reaction: reactionRouter,
});

export type PublicAppRouter = typeof publicAppRouter;
