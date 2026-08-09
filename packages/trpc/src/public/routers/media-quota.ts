import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { media, userStorageQuota } from "@repo/db/schema";
import { eq, sql } from "drizzle-orm";
import { authedProcedure, createPublicTRPCRouter } from "../init";

export const DEFAULT_QUOTA_BYTES = 5 * 1024 * 1024 * 1024;

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = typeof db | Tx;

async function ensureQuotaRow(ownerId: string, executor: Executor = db) {
  const existing = await executor.query.userStorageQuota.findFirst({
    where: eq(userStorageQuota.ownerId, ownerId),
  });
  if (existing) {
    return existing;
  }

  const usedRows = await executor
    .select({ used: sql<string>`coalesce(sum(${media.size}), 0)` })
    .from(media)
    .where(eq(media.ownerId, ownerId));

  await executor
    .insert(userStorageQuota)
    .values({
      id: randomUUID(),
      ownerId,
      totalBytes: DEFAULT_QUOTA_BYTES,
      usedBytes: Number(usedRows[0]?.used ?? 0),
    })
    .onConflictDoNothing({ target: userStorageQuota.ownerId });

  const row = await executor.query.userStorageQuota.findFirst({
    where: eq(userStorageQuota.ownerId, ownerId),
  });

  if (!row) {
    throw new Error("Failed to create storage quota row");
  }

  return row;
}

export async function getQuota(ownerId: string) {
  const row = await ensureQuotaRow(ownerId);
  return { usedBytes: row.usedBytes, totalBytes: row.totalBytes };
}

export async function tryReserveQuota(ownerId: string, bytes: number, executor: Executor = db) {
  await ensureQuotaRow(ownerId, executor);

  const rows = await executor
    .update(userStorageQuota)
    .set({ usedBytes: sql`${userStorageQuota.usedBytes} + ${bytes}`, updatedAt: new Date() })
    .where(
      sql`${userStorageQuota.ownerId} = ${ownerId} AND ${userStorageQuota.usedBytes} + ${bytes} <= ${userStorageQuota.totalBytes}`
    )
    .returning({ id: userStorageQuota.id });

  return rows.length > 0;
}

export async function releaseQuota(ownerId: string, bytes: number, executor: Executor = db) {
  if (bytes <= 0) {
    return;
  }

  await executor
    .update(userStorageQuota)
    .set({
      usedBytes: sql`GREATEST(${userStorageQuota.usedBytes} - ${bytes}, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(userStorageQuota.ownerId, ownerId));
}

export const mediaQuotaRouter = createPublicTRPCRouter({
  get: authedProcedure.query(({ ctx }) => getQuota(ctx.session.user.id)),
});
