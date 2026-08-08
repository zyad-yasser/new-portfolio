import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { media, mediaFolder } from "@repo/db/schema";
import { deleteObject } from "@repo/utils/storage";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter } from "../init";

async function getDescendantFolderIds(rootId: string) {
  const rows = await db.execute<{ id: string }>(sql`
    WITH RECURSIVE tree AS (
      SELECT id FROM media_folder WHERE id = ${rootId}
      UNION ALL
      SELECT f.id FROM media_folder f INNER JOIN tree t ON f.parent_id = t.id
    )
    SELECT id FROM tree
  `);
  return rows.map((row) => row.id);
}

const folderColumns = { id: true, name: true, parentId: true } as const;

export const mediaFolderRouter = createPublicTRPCRouter({
  list: authedProcedure
    .input(z.object({ parentId: z.string().nullable().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const parentId = input?.parentId ?? null;
      return db.query.mediaFolder.findMany({
        where: and(
          eq(mediaFolder.ownerId, ctx.session.user.id),
          parentId ? eq(mediaFolder.parentId, parentId) : isNull(mediaFolder.parentId)
        ),
        orderBy: asc(mediaFolder.name),
      });
    }),

  listAll: authedProcedure.query(async ({ ctx }) => {
    return db.query.mediaFolder.findMany({
      where: eq(mediaFolder.ownerId, ctx.session.user.id),
      columns: folderColumns,
      orderBy: asc(mediaFolder.name),
    });
  }),

  path: authedProcedure
    .input(z.object({ folderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const path: { id: string; name: string }[] = [];
      let currentId: string | null = input.folderId;

      while (currentId) {
        const found: { id: string; name: string; parentId: string | null } | undefined =
          await db.query.mediaFolder.findFirst({
            where: and(
              eq(mediaFolder.id, currentId),
              eq(mediaFolder.ownerId, ctx.session.user.id)
            ),
            columns: { id: true, name: true, parentId: true },
          });

        if (!found) {
          break;
        }
        path.unshift({ id: found.id, name: found.name });
        currentId = found.parentId;
      }

      return path;
    }),

  create: authedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(100),
        parentId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.parentId) {
        const parent = await db.query.mediaFolder.findFirst({
          where: and(
            eq(mediaFolder.id, input.parentId),
            eq(mediaFolder.ownerId, ctx.session.user.id)
          ),
        });
        if (!parent) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
      }

      const rows = await db
        .insert(mediaFolder)
        .values({
          id: randomUUID(),
          ownerId: ctx.session.user.id,
          parentId: input.parentId ?? null,
          name: input.name,
        })
        .returning();

      const created = rows[0];
      if (!created) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return created;
    }),

  rename: authedProcedure
    .input(z.object({ id: z.string(), name: z.string().trim().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .update(mediaFolder)
        .set({ name: input.name, updatedAt: new Date() })
        .where(and(eq(mediaFolder.id, input.id), eq(mediaFolder.ownerId, ctx.session.user.id)))
        .returning();

      const updated = rows[0];
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  move: authedProcedure
    .input(z.object({ id: z.string(), parentId: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const owned = await db.query.mediaFolder.findFirst({
        where: and(eq(mediaFolder.id, input.id), eq(mediaFolder.ownerId, ctx.session.user.id)),
      });
      if (!owned) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (input.parentId) {
        if (input.parentId === input.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can't move a folder into itself",
          });
        }

        const target = await db.query.mediaFolder.findFirst({
          where: and(
            eq(mediaFolder.id, input.parentId),
            eq(mediaFolder.ownerId, ctx.session.user.id)
          ),
        });
        if (!target) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const descendantIds = await getDescendantFolderIds(input.id);
        if (descendantIds.includes(input.parentId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can't move a folder into one of its own subfolders",
          });
        }
      }

      const rows = await db
        .update(mediaFolder)
        .set({ parentId: input.parentId, updatedAt: new Date() })
        .where(eq(mediaFolder.id, input.id))
        .returning();

      return rows[0];
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const owned = await db.query.mediaFolder.findFirst({
        where: and(eq(mediaFolder.id, input.id), eq(mediaFolder.ownerId, ctx.session.user.id)),
      });
      if (!owned) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const descendantIds = await getDescendantFolderIds(input.id);

      const containedMedia = await db.query.media.findMany({
        where: inArray(media.folderId, descendantIds),
        columns: { id: true, storageKey: true },
      });

      for (const item of containedMedia) {
        await deleteObject(item.storageKey);
      }

      if (containedMedia.length) {
        await db.delete(media).where(
          inArray(
            media.id,
            containedMedia.map((item) => item.id)
          )
        );
      }

      await db.delete(mediaFolder).where(eq(mediaFolder.id, input.id));

      return { id: input.id, deletedFileCount: containedMedia.length };
    }),
});
