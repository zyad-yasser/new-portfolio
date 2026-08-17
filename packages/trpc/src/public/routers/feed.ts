import { db } from "@repo/db";
import { post, postReshare, user, userBlock, userFollow } from "@repo/db/schema";
import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { unionAll } from "drizzle-orm/pg-core";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter } from "../init";
import { formatPost, postRouter, postWith } from "./post";

const cursorSchema = z.object({ activityAt: z.coerce.date(), sortKey: z.string() });
const resharerColumns = { id: true, name: true, image: true } as const;

type FormattedPost = ReturnType<typeof formatPost>;
type Resharer = {
  id: string;
  name: string;
  image: string | null;
  profile: { username: string } | null;
};
type FeedItem =
  | { kind: "post"; post: FormattedPost }
  | { kind: "reshare"; resharer: Resharer; post: FormattedPost };

export const feedRouter = createPublicTRPCRouter({
  all: postRouter.list,

  following: authedProcedure
    .input(
      z
        .object({
          cursor: cursorSchema.optional(),
          limit: z.number().int().min(1).max(50).default(20),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const cursor = input?.cursor;
      const limit = input?.limit ?? 20;
      const viewerId = ctx.session.user.id;

      const followingRows = await db.query.userFollow.findMany({
        where: eq(userFollow.followerId, viewerId),
        columns: { followingId: true },
      });
      const followingIds = followingRows.map((row) => row.followingId);

      if (followingIds.length === 0) {
        return { items: [], nextCursor: null };
      }

      const blockedIds = (
        await db.query.userBlock.findMany({
          where: eq(userBlock.blockerId, viewerId),
          columns: { blockedId: true },
        })
      ).map((row) => row.blockedId);

      const branchAConditions = [inArray(post.authorId, followingIds), eq(post.published, true)];
      if (blockedIds.length) {
        branchAConditions.push(notInArray(post.authorId, blockedIds));
      }
      if (cursor) {
        branchAConditions.push(
          sql`(${post.createdAt}, ${post.id}) < (${cursor.activityAt}, ${cursor.sortKey})`
        );
      }

      const branchA = db
        .select({
          postId: post.id,
          resharerId: sql<string | null>`null::text`.as("resharerId"),
          activityAt: post.createdAt,
          sortKey: sql<string>`${post.id}`.as("sortKey"),
        })
        .from(post)
        .where(and(...branchAConditions));

      const branchBConditions = [
        inArray(postReshare.userId, followingIds),
        eq(post.published, true),
      ];
      if (blockedIds.length) {
        branchBConditions.push(notInArray(postReshare.userId, blockedIds));
        branchBConditions.push(notInArray(post.authorId, blockedIds));
      }
      if (cursor) {
        branchBConditions.push(
          sql`(${postReshare.createdAt}, ${postReshare.userId} || ':' || ${postReshare.postId}) < (${cursor.activityAt}, ${cursor.sortKey})`
        );
      }

      const branchB = db
        .select({
          postId: postReshare.postId,
          resharerId: sql<string | null>`${postReshare.userId}`.as("resharerId"),
          activityAt: postReshare.createdAt,
          sortKey: sql<string>`${postReshare.userId} || ':' || ${postReshare.postId}`.as("sortKey"),
        })
        .from(postReshare)
        .innerJoin(post, eq(post.id, postReshare.postId))
        .where(and(...branchBConditions));

      type SpineRow = {
        postId: string;
        resharerId: string | null;
        activityAt: Date;
        sortKey: string;
      };

      const spine = unionAll(branchA, branchB).as("spine");

      const spineRows = (await db
        .select()
        .from(spine)
        .orderBy(desc(spine.activityAt), desc(spine.sortKey))
        .limit(limit + 1)) as SpineRow[];

      const hasMore = spineRows.length > limit;
      const rows = hasMore ? spineRows.slice(0, limit) : spineRows;
      const last = rows.at(-1);

      const postIds = [...new Set(rows.map((row) => row.postId))];
      const resharerIds = [
        ...new Set(rows.flatMap((row) => (row.resharerId ? [row.resharerId] : []))),
      ];

      const posts = postIds.length
        ? await db.query.post.findMany({ where: inArray(post.id, postIds), with: postWith })
        : [];
      const resharers = resharerIds.length
        ? await db.query.user.findMany({
            where: inArray(user.id, resharerIds),
            columns: resharerColumns,
            with: { profile: { columns: { username: true } } },
          })
        : [];

      const postById = new Map(posts.map((row) => [row.id, formatPost(row)]));
      const resharerById = new Map(resharers.map((row) => [row.id, row]));

      const items: FeedItem[] = [];
      for (const row of rows) {
        const foundPost = postById.get(row.postId);
        if (!foundPost) {
          continue;
        }
        if (row.resharerId) {
          const resharer = resharerById.get(row.resharerId);
          if (!resharer) {
            continue;
          }
          items.push({ kind: "reshare", resharer, post: foundPost });
          continue;
        }
        items.push({ kind: "post", post: foundPost });
      }

      return {
        items,
        nextCursor: hasMore && last ? { activityAt: last.activityAt, sortKey: last.sortKey } : null,
      };
    }),
});
