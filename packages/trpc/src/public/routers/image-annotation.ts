import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { HIGHLIGHT_COLORS, post, postImageAnnotation } from "@repo/db/schema";
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

export const imageAnnotationRouter = createPublicTRPCRouter({
  listMineForPost: authedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.query.postImageAnnotation.findMany({
        where: and(
          eq(postImageAnnotation.postId, input.postId),
          eq(postImageAnnotation.userId, ctx.session.user.id)
        ),
        orderBy: asc(postImageAnnotation.createdAt),
      });
    }),

  create: verifiedProcedure
    .use(strictRateLimit({ path: "imageAnnotation.create", limit: 600, window: "1 h" }))
    .input(
      z.object({
        postId: z.string(),
        imageSrc: z.string().min(1).max(2000),
        xPercent: z.number().min(0).max(100),
        yPercent: z.number().min(0).max(100),
        radiusPercent: z.number().positive().max(100),
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
        .insert(postImageAnnotation)
        .values({
          id: randomUUID(),
          postId: input.postId,
          userId: ctx.session.user.id,
          imageSrc: input.imageSrc,
          xPercent: input.xPercent,
          yPercent: input.yPercent,
          radiusPercent: input.radiusPercent,
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
        .update(postImageAnnotation)
        .set({ noteJson: input.noteJson, updatedAt: new Date() })
        .where(
          and(
            eq(postImageAnnotation.id, input.id),
            eq(postImageAnnotation.userId, ctx.session.user.id)
          )
        )
        .returning();

      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return rows[0];
    }),

  updatePosition: verifiedProcedure
    .input(
      z.object({
        id: z.string(),
        xPercent: z.number().min(0).max(100),
        yPercent: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .update(postImageAnnotation)
        .set({ xPercent: input.xPercent, yPercent: input.yPercent, updatedAt: new Date() })
        .where(
          and(
            eq(postImageAnnotation.id, input.id),
            eq(postImageAnnotation.userId, ctx.session.user.id)
          )
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
        .update(postImageAnnotation)
        .set({ color: input.color, updatedAt: new Date() })
        .where(
          and(
            eq(postImageAnnotation.id, input.id),
            eq(postImageAnnotation.userId, ctx.session.user.id)
          )
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
        .delete(postImageAnnotation)
        .where(
          and(
            eq(postImageAnnotation.id, input.id),
            eq(postImageAnnotation.userId, ctx.session.user.id)
          )
        )
        .returning({ id: postImageAnnotation.id });

      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return rows[0];
    }),
});
