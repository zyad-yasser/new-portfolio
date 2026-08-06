import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { REACTION_TYPES, postReaction } from "@repo/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, publicProcedure } from "../init";

const MAX_REACTORS_SHOWN = 6;

export const reactionRouter = createPublicTRPCRouter({
  summary: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input }) => {
      const rows = await db.query.postReaction.findMany({
        where: eq(postReaction.postId, input.postId),
        with: { user: { columns: { id: true, name: true, image: true } } },
        orderBy: desc(postReaction.createdAt),
      });

      return REACTION_TYPES.map((type) => {
        const reactors = rows.filter((row) => row.type === type).map((row) => row.user);
        return { type, count: reactors.length, reactors: reactors.slice(0, MAX_REACTORS_SHOWN) };
      });
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

  react: authedProcedure
    .input(z.object({ postId: z.string(), type: z.enum(REACTION_TYPES) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.postReaction.findFirst({
        where: and(
          eq(postReaction.postId, input.postId),
          eq(postReaction.userId, ctx.session.user.id)
        ),
      });

      if (existing?.type === input.type) {
        await db.delete(postReaction).where(eq(postReaction.id, existing.id));
        return { type: null };
      }

      if (existing) {
        await db
          .update(postReaction)
          .set({ type: input.type })
          .where(eq(postReaction.id, existing.id));
        return { type: input.type };
      }

      await db.insert(postReaction).values({
        id: randomUUID(),
        postId: input.postId,
        userId: ctx.session.user.id,
        type: input.type,
      });

      return { type: input.type };
    }),
});
