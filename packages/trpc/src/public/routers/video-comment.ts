import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { HIGHLIGHT_COLORS, post, postVideoComment } from "@repo/db/schema";
import type { TiptapDoc } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  authedProcedure,
  createPublicTRPCRouter,
  strictRateLimit,
  verifiedProcedure,
} from "../init";

const tiptapNodeSchema: z.ZodType<TiptapDoc> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    text: z.string().optional(),
    marks: z.array(z.record(z.string(), z.unknown())).optional(),
    content: z.array(tiptapNodeSchema).optional(),
  })
);

const colorSchema = z.enum(HIGHLIGHT_COLORS);

export const videoCommentRouter = createPublicTRPCRouter({
  listMineForPost: authedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.query.postVideoComment.findMany({
        where: and(
          eq(postVideoComment.postId, input.postId),
          eq(postVideoComment.userId, ctx.session.user.id)
        ),
        orderBy: asc(postVideoComment.timestampSeconds),
      });
    }),

  create: verifiedProcedure
    .use(strictRateLimit({ path: "videoComment.create", limit: 600, window: "1 h" }))
    .input(
      z.object({
        postId: z.string(),
        videoSrc: z.string().min(1).max(2000),
        timestampSeconds: z.number().nonnegative(),
        color: colorSchema.default("yellow"),
        noteJson: tiptapNodeSchema.nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const targetPost = await db.query.post.findFirst({ where: eq(post.id, input.postId) });

      if (!targetPost) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const rows = await db
        .insert(postVideoComment)
        .values({
          id: randomUUID(),
          postId: input.postId,
          userId: ctx.session.user.id,
          videoSrc: input.videoSrc,
          timestampSeconds: input.timestampSeconds,
          color: input.color,
          noteJson: input.noteJson ?? null,
        })
        .returning();

      return rows[0];
    }),

  updateNote: verifiedProcedure
    .input(z.object({ id: z.string(), noteJson: tiptapNodeSchema.nullable() }))
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .update(postVideoComment)
        .set({ noteJson: input.noteJson, updatedAt: new Date() })
        .where(
          and(eq(postVideoComment.id, input.id), eq(postVideoComment.userId, ctx.session.user.id))
        )
        .returning();

      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return rows[0];
    }),

  updateColor: verifiedProcedure
    .input(z.object({ id: z.string(), color: colorSchema }))
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .update(postVideoComment)
        .set({ color: input.color, updatedAt: new Date() })
        .where(
          and(eq(postVideoComment.id, input.id), eq(postVideoComment.userId, ctx.session.user.id))
        )
        .returning();

      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return rows[0];
    }),

  delete: verifiedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .delete(postVideoComment)
        .where(
          and(eq(postVideoComment.id, input.id), eq(postVideoComment.userId, ctx.session.user.id))
        )
        .returning({ id: postVideoComment.id });

      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return rows[0];
    }),
});
