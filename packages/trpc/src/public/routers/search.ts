import { db } from "@repo/db";
import { post, userBlock } from "@repo/db/schema";
import { and, eq, notInArray, sql } from "drizzle-orm";
import { z } from "zod";
import { createPublicTRPCRouter, publicProcedure } from "../init";
import { formatPost, postWith } from "./post";

const cursorSchema = z.object({ rank: z.number(), id: z.string() });

export const searchRouter = createPublicTRPCRouter({
  posts: publicProcedure
    .input(
      z.object({
        query: z.string().trim().min(1).max(200),
        cursor: cursorSchema.optional(),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const cursor = input.cursor;
      const limit = input.limit;
      const tsquery = sql`websearch_to_tsquery('english', ${input.query})`;
      const rank = sql<number>`ts_rank(${post.searchVector}, ${tsquery})`;

      const blockedIds = ctx.session
        ? (
            await db.query.userBlock.findMany({
              where: eq(userBlock.blockerId, ctx.session.user.id),
              columns: { blockedId: true },
            })
          ).map((row) => row.blockedId)
        : [];

      const conditions = [
        eq(post.published, true),
        sql`${post.searchVector} @@ ${tsquery}`,
      ];
      if (blockedIds.length) {
        conditions.push(notInArray(post.authorId, blockedIds));
      }
      if (cursor) {
        conditions.push(sql`(${rank}, ${post.id}) < (${cursor.rank}, ${cursor.id})`);
      }

      const rows = await db.query.post.findMany({
        where: and(...conditions),
        orderBy: [sql`${rank} desc`, sql`${post.id} desc`],
        limit: limit + 1,
        with: postWith,
        extras: { rank: rank.as("rank") },
      });

      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      const last = items.at(-1);

      return {
        items: items.map(formatPost),
        nextCursor: hasMore && last ? { rank: last.rank, id: last.id } : null,
      };
    }),
});
