import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { media, mediaFolder } from "@repo/db/schema";
import { createPresignedUploadUrl, deleteObject } from "@repo/utils/storage";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, isNull, lt, or } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, strictRateLimit } from "../init";

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const cursorSchema = z.object({ createdAt: z.coerce.date(), id: z.string() });

export const mediaRouter = createPublicTRPCRouter({
  list: authedProcedure
    .input(
      z
        .object({
          folderId: z.string().nullable().optional(),
          search: z.string().trim().max(100).optional(),
          cursor: cursorSchema.optional(),
          limit: z.number().int().min(1).max(100).default(60),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 60;
      const cursor = input?.cursor;
      const search = input?.search;

      const conditions = [eq(media.ownerId, ctx.session.user.id)];

      if (search) {
        conditions.push(ilike(media.originalName, `%${search}%`));
      } else {
        const folderId = input?.folderId ?? null;
        conditions.push(folderId ? eq(media.folderId, folderId) : isNull(media.folderId));
      }

      if (cursor) {
        const cursorCondition = or(
          lt(media.createdAt, cursor.createdAt),
          and(eq(media.createdAt, cursor.createdAt), lt(media.id, cursor.id))
        );
        if (cursorCondition) {
          conditions.push(cursorCondition);
        }
      }

      const rows = await db.query.media.findMany({
        where: and(...conditions),
        orderBy: [desc(media.createdAt), desc(media.id)],
        limit: limit + 1,
      });

      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      const last = items.at(-1);

      return {
        items,
        nextCursor: hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
      };
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
        folderId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.key.startsWith(`media/${ctx.session.user.id}/`)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (input.folderId) {
        const folder = await db.query.mediaFolder.findFirst({
          where: and(
            eq(mediaFolder.id, input.folderId),
            eq(mediaFolder.ownerId, ctx.session.user.id)
          ),
        });
        if (!folder) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
      }

      const rows = await db
        .insert(media)
        .values({
          id: randomUUID(),
          ownerId: ctx.session.user.id,
          folderId: input.folderId ?? null,
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

  rename: authedProcedure
    .input(z.object({ id: z.string(), name: z.string().trim().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .update(media)
        .set({ originalName: input.name })
        .where(and(eq(media.id, input.id), eq(media.ownerId, ctx.session.user.id)))
        .returning();

      const updated = rows[0];
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  move: authedProcedure
    .input(z.object({ id: z.string(), folderId: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      if (input.folderId) {
        const folder = await db.query.mediaFolder.findFirst({
          where: and(
            eq(mediaFolder.id, input.folderId),
            eq(mediaFolder.ownerId, ctx.session.user.id)
          ),
        });
        if (!folder) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
      }

      const rows = await db
        .update(media)
        .set({ folderId: input.folderId })
        .where(and(eq(media.id, input.id), eq(media.ownerId, ctx.session.user.id)))
        .returning();

      const updated = rows[0];
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
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

  bulkDelete: authedProcedure
    .input(z.object({ ids: z.array(z.string()).min(1).max(200) }))
    .mutation(async ({ ctx, input }) => {
      const deletedIds: string[] = [];

      for (const id of input.ids) {
        const rows = await db
          .delete(media)
          .where(and(eq(media.id, id), eq(media.ownerId, ctx.session.user.id)))
          .returning();

        const deleted = rows[0];
        if (deleted) {
          await deleteObject(deleted.storageKey);
          deletedIds.push(deleted.id);
        }
      }

      return { ids: deletedIds };
    }),
});
