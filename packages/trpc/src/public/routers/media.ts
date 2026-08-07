import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { media } from "@repo/db/schema";
import { createPresignedUploadUrl, deleteObject } from "@repo/utils/s3";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, strictRateLimit } from "../init";

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const LIST_LIMIT = 60;

export const mediaRouter = createPublicTRPCRouter({
  list: authedProcedure.query(async ({ ctx }) => {
    return db.query.media.findMany({
      where: eq(media.ownerId, ctx.session.user.id),
      orderBy: desc(media.createdAt),
      limit: LIST_LIMIT,
    });
  }),

  createPresignedUrl: authedProcedure
    .use(strictRateLimit({ path: "media.createPresignedUrl", limit: 30, window: "1 h" }))
    .input(
      z.object({
        contentType: z.string(),
        size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ext = ALLOWED_IMAGE_TYPES[input.contentType];
      if (!ext) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported image type" });
      }

      const key = `media/${ctx.session.user.id}/${randomUUID()}.${ext}`;
      const { uploadUrl, publicUrl } = await createPresignedUploadUrl({
        key,
        contentType: input.contentType,
      });

      return { uploadUrl, publicUrl, key };
    }),

  confirm: authedProcedure
    .input(
      z.object({
        key: z.string(),
        url: z.string().url(),
        originalName: z.string().trim().min(1).max(255),
        mimeType: z.string(),
        size: z.number().int().positive(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.key.startsWith(`media/${ctx.session.user.id}/`)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const rows = await db
        .insert(media)
        .values({
          id: randomUUID(),
          ownerId: ctx.session.user.id,
          storageKey: input.key,
          url: input.url,
          originalName: input.originalName,
          mimeType: input.mimeType,
          size: input.size,
          width: input.width ?? null,
          height: input.height ?? null,
        })
        .returning();

      return rows[0];
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .delete(media)
        .where(and(eq(media.id, input.id), eq(media.ownerId, ctx.session.user.id)))
        .returning();

      const deleted = rows[0];
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await deleteObject(deleted.storageKey);

      return { id: deleted.id };
    }),
});
