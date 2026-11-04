import { createPublicTRPCRouter, publicProcedure } from "../init";
import { blockRouter } from "./block";
import { bookmarkRouter } from "./bookmark";
import { categoryRouter } from "./category";
import { commentRouter } from "./comment";
import { feedRouter } from "./feed";
import { followRouter } from "./follow";
import { highlightRouter } from "./highlight";
import { imageAnnotationRouter } from "./image-annotation";
import { mediaRouter } from "./media";
import { mediaFolderRouter } from "./media-folder";
import { mediaQuotaRouter } from "./media-quota";
import { notificationRouter } from "./notification";
import { postRouter } from "./post";
import { profileRouter } from "./profile";
import { reactionRouter } from "./reaction";
import { reshareRouter } from "./reshare";
import { reviewRouter } from "./review";
import { searchRouter } from "./search";
import { seriesRouter } from "./series";
import { sessionRouter } from "./session";
import { tagRouter } from "./tag";
import { videoCommentRouter } from "./video-comment";

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
  highlight: highlightRouter,
  videoComment: videoCommentRouter,
  imageAnnotation: imageAnnotationRouter,
  reshare: reshareRouter,
  feed: feedRouter,
  media: mediaRouter,
  mediaFolder: mediaFolderRouter,
  mediaQuota: mediaQuotaRouter,
  search: searchRouter,
  series: seriesRouter,
  notification: notificationRouter,
  session: sessionRouter,
});

export type PublicAppRouter = typeof publicAppRouter;
