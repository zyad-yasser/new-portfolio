import { createPublicTRPCRouter, publicProcedure } from "../init";
import { blockRouter } from "./block";
import { bookmarkRouter } from "./bookmark";
import { categoryRouter } from "./category";
import { commentRouter } from "./comment";
import { followRouter } from "./follow";
import { postRouter } from "./post";
import { profileRouter } from "./profile";
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
  profile: profileRouter,
  follow: followRouter,
  bookmark: bookmarkRouter,
});

export type PublicAppRouter = typeof publicAppRouter;
