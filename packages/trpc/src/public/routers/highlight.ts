import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { HIGHLIGHT_COLORS, post, postHighlight } from "@repo/db/schema";
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

export const highlightRouter = createPublicTRPCRouter({
  listMineForPost: authedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.query.postHighlight.findMany({
        where: and(
          eq(postHighlight.postId, input.postId),
          eq(postHighlight.userId, ctx.session.user.id)
        ),
        orderBy: asc(postHighlight.startOffset),
      });
    }),

  create: verifiedProcedure
    .use(strictRateLimit({ path: "highlight.create", limit: 60, window: "1 h" }))
    .input(
      z.object({
        postId: z.string(),
        quoteText: z.string().trim().min(1).max(2000),
        prefixText: z.string().max(60),
        suffixText: z.string().max(60),
        startOffset: z.number().int().nonnegative(),
        endOffset: z.number().int().nonnegative(),
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
        .insert(postHighlight)
        .values({
          id: randomUUID(),
          postId: input.postId,
          userId: ctx.session.user.id,
          quoteText: input.quoteText,
          prefixText: input.prefixText,
          suffixText: input.suffixText,
          startOffset: input.startOffset,
          endOffset: input.endOffset,
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
        .update(postHighlight)
        .set({ noteJson: input.noteJson, updatedAt: new Date() })
        .where(and(eq(postHighlight.id, input.id), eq(postHighlight.userId, ctx.session.user.id)))
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
        .update(postHighlight)
        .set({ color: input.color, updatedAt: new Date() })
        .where(and(eq(postHighlight.id, input.id), eq(postHighlight.userId, ctx.session.user.id)))
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
        .delete(postHighlight)
        .where(and(eq(postHighlight.id, input.id), eq(postHighlight.userId, ctx.session.user.id)))
        .returning({ id: postHighlight.id });

      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return rows[0];
    }),
});
