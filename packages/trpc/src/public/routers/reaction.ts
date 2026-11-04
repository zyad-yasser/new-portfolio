import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import type { ReactionType } from "@repo/db/schema";
import { REACTION_TYPES, post, postReaction, user } from "@repo/db/schema";
import { and, eq, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, publicProcedure, verifiedProcedure } from "../init";
import { createNotification } from "./notification";

const MAX_REACTORS_SHOWN = 6;

type Reactor = { id: string; name: string; image: string | null };

export const reactionRouter = createPublicTRPCRouter({
  summary: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input }) => {
      const ranked = db
        .select({
          type: postReaction.type,
          userId: postReaction.userId,
          rank: sql<number>`(row_number() over (partition by ${postReaction.type} order by ${postReaction.createdAt} desc))::int`.as(
            "rank"
          ),
          total: sql<number>`(count(*) over (partition by ${postReaction.type}))::int`.as("total"),
        })
        .from(postReaction)
        .where(eq(postReaction.postId, input.postId))
        .as("ranked");

      const rows = await db
        .select({
          type: ranked.type,
          total: ranked.total,
          rank: ranked.rank,
          id: user.id,
          name: user.name,
          image: user.image,
        })
        .from(ranked)
        .innerJoin(user, eq(user.id, ranked.userId))
        .where(lte(ranked.rank, MAX_REACTORS_SHOWN))
        .orderBy(ranked.rank);

      const byType = new Map<ReactionType, { count: number; reactors: Reactor[] }>();

      for (const row of rows) {
        const type = row.type as ReactionType;
        const entry = byType.get(type) ?? { count: row.total, reactors: [] };
        entry.reactors.push({ id: row.id, name: row.name, image: row.image });
        byType.set(type, entry);
      }

      return REACTION_TYPES.map((type) => ({
        type,
        count: byType.get(type)?.count ?? 0,
        reactors: byType.get(type)?.reactors ?? [],
      }));
    }),

  mine: authedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const row = await db.query.postReaction.findFirst({
        where: and(
          eq(postReaction.postId, input.postId),
          eq(postReaction.userId, ctx.session.user.id)
        ),
      });

      return row?.type ?? null;
    }),

  react: verifiedProcedure
    .input(z.object({ postId: z.string(), type: z.enum(REACTION_TYPES) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.postReaction.findFirst({
        where: and(
          eq(postReaction.postId, input.postId),
          eq(postReaction.userId, ctx.session.user.id)
        ),
      });

      if (existing?.type === input.type) {
        await db.transaction(async (tx) => {
          await tx.delete(postReaction).where(eq(postReaction.id, existing.id));
          await tx
            .update(post)
            .set({ reactionCount: sql`greatest(${post.reactionCount} - 1, 0)` })
            .where(eq(post.id, input.postId));
        });
        return { type: null };
      }

      if (existing) {
        await db
          .update(postReaction)
          .set({ type: input.type })
          .where(eq(postReaction.id, existing.id));
      } else {
        await db.transaction(async (tx) => {
          await tx.insert(postReaction).values({
            id: randomUUID(),
            postId: input.postId,
            userId: ctx.session.user.id,
            type: input.type,
          });
          await tx
            .update(post)
            .set({ reactionCount: sql`${post.reactionCount} + 1` })
            .where(eq(post.id, input.postId));
        });
      }

      const targetPost = await db.query.post.findFirst({
        where: eq(post.id, input.postId),
        columns: { authorId: true },
      });

      if (targetPost) {
        await createNotification({
          recipientId: targetPost.authorId,
          actorId: ctx.session.user.id,
          type: "reaction",
          postId: input.postId,
        });
      }

      return { type: input.type };
    }),
});
